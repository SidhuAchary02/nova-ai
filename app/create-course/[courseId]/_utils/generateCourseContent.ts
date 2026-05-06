import { CourseType } from "@/types/types";
import { generateSingleSubtopicLesson, saveGroupedChapterLessons } from "@/app/actions/generateChapterContent";
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

    // Flatten all subtopics into a 1D array
    const flattenedSubtopics: { chapterIndex: number; chapterName: string; subtopicName: string; }[] = [];
    allChapters.forEach((chapter: any, chapterIndex: number) => {
      const subtopics = chapter.subtopics || [];
      subtopics.forEach((subtopicName: string) => {
        flattenedSubtopics.push({ chapterIndex, chapterName: chapter.chapterName, subtopicName });
      });
    });

    if (flattenedSubtopics.length === 0) {
      return { success: false, error: "No subtopics found to generate" };
    }

    // Generate content for ALL subtopics
    const subtopicsToGenerate = flattenedSubtopics;

    console.log(`🚀 Generating ${subtopicsToGenerate.length} deep subtopic lessons...`);

    const generatedLessons: any[] = [];
    const generatedSources: any[] = [];

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
          if (res.sources) generatedSources.push(...res.sources);
        }
      });
    }

    // Group results by chapterIndex
    const groupedByChapter = new Map<number, { chapterName: string, lessons: any[], sources: any[] }>();
    
    generatedLessons.forEach(res => {
      if (!groupedByChapter.has(res.chapterIndex)) {
        groupedByChapter.set(res.chapterIndex, { chapterName: res.chapterName, lessons: [], sources: [] });
      }
      const group = groupedByChapter.get(res.chapterIndex)!;
      group.lessons.push(res.lesson);
    });

    // Save each chapter group to the database
    for (const [chapterIndex, group] of groupedByChapter.entries()) {
      await saveGroupedChapterLessons(
        course.courseId,
        course.courseName,
        group.chapterName,
        chapterIndex,
        group.lessons,
        generatedSources // Attach sources to the chapter
      );
    }

    return { success: true };
  } catch (e: unknown) {
    console.error("❌ generateCourseContent crashed:", e);
    return { success: false, error: String(e) };
  } finally {
    setLoading(false);
  }
};