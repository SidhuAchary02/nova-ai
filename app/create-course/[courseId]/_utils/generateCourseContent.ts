import { CourseType } from "@/types/types";
import { generateSingleSubtopicLesson, saveGroupedChapterLessons } from "@/app/actions/generateChapterContent";
import { getGeneratedChapterIdsAction } from "@/app/actions/getCourseChapterProgress";
import { parseCourseOutput } from "@/utils/parseCourseOutput";

// limit how many AI calls run at once
const CONCURRENT_REQUESTS = 3;

export const generateCourseContent = async (
  course: CourseType,
  setLoading: (loading: boolean) => void
) => {
  setLoading(true);

  try {
    const courseOutput = parseCourseOutput(course.courseOutput);
    const allChapters = courseOutput?.chapters || [];

    if (allChapters.length === 0) {
      return { success: false, error: "No chapters found" };
    }

    const generatedProgress = await getGeneratedChapterIdsAction(course.courseId);
    const generatedChapterIds = generatedProgress.success ? generatedProgress.chapterIds : [];
    const startIndex = generatedProgress.success ? generatedProgress.contiguousGeneratedCount : 0;
    const batchSize = Math.max(1, Math.ceil(allChapters.length * 0.25));
    const chaptersToGenerate = allChapters.slice(startIndex, startIndex + batchSize);

    if (chaptersToGenerate.length === 0) {
      return { success: true, successCount: 0, totalChapters: allChapters.length };
    }

    // Flatten the selected chapter batch into subtopic jobs
    const flattenedSubtopics: { chapterIndex: number; chapterName: string; subtopicName: string; }[] = [];
    chaptersToGenerate.forEach((chapter: any, offset: number) => {
      const chapterIndex = startIndex + offset;
      const subtopics = chapter.subtopics || [];
      subtopics.forEach((subtopicName: string) => {
        flattenedSubtopics.push({ chapterIndex, chapterName: chapter.chapterName, subtopicName });
      });
    });

    if (flattenedSubtopics.length === 0) {
      return { success: false, error: "No subtopics found to generate" };
    }

    // Generate content for the next chapter batch only
    const subtopicsToGenerate = flattenedSubtopics;

    console.log(
      `🚀 Generating ${subtopicsToGenerate.length} deep subtopic lessons across ${chaptersToGenerate.length} chapters...`
    );

    const generatedLessons: any[] = [];

    // Process subtopics in batches
    for (let i = 0; i < subtopicsToGenerate.length; i += CONCURRENT_REQUESTS) {
      const batch = subtopicsToGenerate.slice(i, i + CONCURRENT_REQUESTS);

      const promises = batch.map((item, idx) => {
        const index = i + idx;
        console.log(`📝 Generating lesson ${index + 1}/${subtopicsToGenerate.length}: ${item.subtopicName}`);

        return generateSingleSubtopicLesson(
          course.courseName,
          item.chapterName,
          item.subtopicName
        ).then((res) => {
          if (res.success) {
            console.log(`✅ Lesson ${index + 1} generated successfully`);
            return { ...res, chapterIndex: item.chapterIndex, chapterName: item.chapterName };
          } else {
            console.error(`❌ Lesson ${index + 1} failed:`, res.error);
            return null;
          }
        }).catch((err) => {
          console.error(`❌ Lesson ${index + 1} crashed:`, err);
          return null;
        });
      });

      const batchResults = await Promise.all(promises);
      
      batchResults.forEach(res => {
        if (res) {
          generatedLessons.push(res);
        }
      });
    }

    // Group results by chapterIndex
    const groupedByChapter = new Map<number, { chapterName: string, lessons: any[] }>();
    
    generatedLessons.forEach(res => {
      if (!groupedByChapter.has(res.chapterIndex)) {
        groupedByChapter.set(res.chapterIndex, { chapterName: res.chapterName, lessons: [] });
      }
      const group = groupedByChapter.get(res.chapterIndex)!;
      group.lessons.push(res.lesson);
    });

    // Save each chapter group to the database
    for (const [chapterIndex, group] of Array.from(groupedByChapter.entries())) {
      await saveGroupedChapterLessons(
        course.courseId,
        course.courseName,
        group.chapterName,
        chapterIndex,
        group.lessons
      );
    }

    const successCount = generatedLessons.length;

    return {
      success: true,
      successCount,
      totalChapters: allChapters.length,
      generatedChapters: chaptersToGenerate.length,
      startIndex,
      batchSize,
    };
  } catch (e: unknown) {
    console.error("❌ generateCourseContent crashed:", e);
    return { success: false, error: String(e) };
  } finally {
    setLoading(false);
  }
};