import { CourseType } from "@/types/types";
import { generateSingleSubtopicLesson, saveGroupedChapterLessons } from "@/app/actions/generateChapterContent";
import { getGeneratedChapterIdsAction } from "@/app/actions/getCourseChapterProgress";
import { parseCourseOutput } from "@/utils/parseCourseOutput";

// limit how many AI calls run at once
const CONCURRENT_REQUESTS = 3;

type GenerateCourseContentOptions = {
  initialCount?: number;
  chapterIndex?: number;
  /** Called on each lesson start/finish: (completedCount, totalLessons, lessonName) */
  onProgress?: (completed: number, total: number, lessonName?: string) => void;
};

export const generateCourseContent = async (
  course: CourseType,
  setLoading: (loading: boolean) => void,
  options: GenerateCourseContentOptions = {}
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
    const generatedChapterIdSet = new Set(generatedChapterIds);
    const requestedChapterIndex =
      typeof options.chapterIndex === "number" && options.chapterIndex >= 0
        ? options.chapterIndex
        : undefined;
    const { onProgress } = options;

    let chapterJobs: { chapter: any; chapterIndex: number }[] = [];

    if (requestedChapterIndex !== undefined) {
      const chapter = allChapters[requestedChapterIndex];
      if (!chapter) {
        return { success: false, error: "Chapter not found" };
      }

      if (generatedChapterIdSet.has(requestedChapterIndex)) {
        return {
          success: true,
          successCount: 0,
          totalChapters: allChapters.length,
          generatedChapters: 0,
          generatedChapterIds: [] as number[],
          skipped: true,
          chapterIndex: requestedChapterIndex,
        };
      }

      chapterJobs = [{ chapter, chapterIndex: requestedChapterIndex }];
    } else {
      const initialCount =
        typeof options.initialCount === "number" && options.initialCount > 0
          ? options.initialCount
          : allChapters.length;

      chapterJobs = allChapters
        .slice(0, initialCount)
        .map((chapter: any, chapterIndex: number) => ({ chapter, chapterIndex }))
        .filter(({ chapterIndex }: { chapterIndex: number }) => !generatedChapterIdSet.has(chapterIndex));
    }

    if (chapterJobs.length === 0) {
      return { success: true, successCount: 0, totalChapters: allChapters.length };
    }

    // Flatten the selected chapter batch into subtopic jobs
    const flattenedSubtopics: { chapterIndex: number; chapterName: string; subtopicName: string }[] = [];
    chapterJobs.forEach(({ chapter, chapterIndex }) => {
      const subtopics = chapter.subtopics || [];
      subtopics.forEach((subtopicName: string) => {
        flattenedSubtopics.push({ chapterIndex, chapterName: chapter.chapterName, subtopicName });
      });
    });

    if (flattenedSubtopics.length === 0) {
      return { success: false, error: "No subtopics found to generate" };
    }

    const subtopicsToGenerate = flattenedSubtopics;
    const total = subtopicsToGenerate.length;

    console.log(`Generating ${total} deep subtopic lessons across ${chapterJobs.length} chapters...`);

    const generatedLessons: any[] = [];

    // Process subtopics in batches
    for (let i = 0; i < total; i += CONCURRENT_REQUESTS) {
      const batch = subtopicsToGenerate.slice(i, i + CONCURRENT_REQUESTS);

      const promises = batch.map((item, idx) => {
        const index = i + idx;
        console.log(`📝 Generating lesson ${index + 1}/${total}: ${item.subtopicName}`);
        // Signal lesson starting
        onProgress?.(index, total, item.subtopicName);

        return generateSingleSubtopicLesson(
          course.courseName,
          item.chapterName,
          item.subtopicName
        ).then((res) => {
          if (res.success) {
            console.log(`✅ Lesson ${index + 1} generated successfully`);
            onProgress?.(index + 1, total, item.subtopicName);
            return { ...res, chapterIndex: item.chapterIndex, chapterName: item.chapterName };
          } else {
            console.error(`❌ Lesson ${index + 1} failed:`, res.error);
            onProgress?.(index + 1, total, item.subtopicName);
            return null;
          }
        }).catch((err) => {
          console.error(`❌ Lesson ${index + 1} crashed:`, err);
          onProgress?.(index + 1, total, item.subtopicName);
          return null;
        });
      });

      const batchResults = await Promise.all(promises);
      batchResults.forEach((res) => {
        if (res) generatedLessons.push(res);
      });
    }

    // Group results by chapterIndex
    const groupedByChapter = new Map<number, { chapterName: string; lessons: any[] }>();
    generatedLessons.forEach((res) => {
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
      generatedChapters: chapterJobs.length,
      generatedChapterIds: chapterJobs.map(({ chapterIndex }) => chapterIndex),
    };
  } catch (e: unknown) {
    console.error("❌ generateCourseContent crashed:", e);
    return { success: false, error: String(e) };
  } finally {
    setLoading(false);
  }
};
