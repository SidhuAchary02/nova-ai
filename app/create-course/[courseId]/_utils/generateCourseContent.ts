import { CourseType } from "@/types/types";
import { generateSingleSubtopicLesson, saveGroupedChapterLessons } from "@/app/actions/generateChapterContent";
import { parseCourseOutput } from "@/utils/parseCourseOutput";

type GenerateCourseContentOptions = {
  initialCount?: number;
  chapterIndex?: number;
  onProgress?: (completed: number, totalLessons: number, lessonName?: string) => void;
};

function readProgress(progress: unknown) {
  if (!progress || typeof progress !== "object") return null;
  const value = progress as {
    completed?: unknown;
    total?: unknown;
    lessonName?: unknown;
  };

  return {
    completed: typeof value.completed === "number" ? value.completed : 0,
    total: typeof value.total === "number" ? value.total : 0,
    lessonName: typeof value.lessonName === "string" ? value.lessonName : undefined,
  };
}

function selectedChapterJobs(course: CourseType, initialCount?: number, chapterIndex?: number) {
  const courseOutput = parseCourseOutput(course.courseOutput);
  const allChapters = courseOutput?.chapters || [];

  if (typeof chapterIndex === "number") {
    const chapter = allChapters[chapterIndex];
    return chapter ? [{ chapter, chapterIndex }] : [];
  }

  const count = initialCount && initialCount > 0 ? initialCount : allChapters.length;
  return allChapters.slice(0, count).map((chapter, index) => ({ chapter, chapterIndex: index }));
}

export const generateCourseContent = async (
  course: CourseType,
  setLoading: (loading: boolean) => void,
  options: GenerateCourseContentOptions = {}
) => {
  setLoading(true);

  try {
    const { supabase } = await import("@/configs/supabase");
    const { data } = await supabase.auth.getUser();
    const userEmail = data.user?.email || course.createdBy;

    if (!userEmail) {
      return { success: false, error: "Course owner not found" };
    }

    const jobs = selectedChapterJobs(course, options.initialCount, options.chapterIndex);
    const totalLessons = jobs.reduce((sum, { chapter }) => sum + (chapter.subtopics?.length || 0), 0);
    let completed = 0;

    for (const { chapter, chapterIndex } of jobs) {
      const lessons: any[] = [];
      const subtopics = chapter.subtopics || [];

      for (const subtopicName of subtopics) {
        options.onProgress?.(completed, totalLessons, subtopicName);

        const result = await generateSingleSubtopicLesson(
          course.courseName,
          chapter.chapterName,
          subtopicName
        );

        completed += 1;
        if (result.success) {
          lessons.push(result.lesson);
        } else {
          console.warn("Subtopic generation failed:", subtopicName, result.error);
        }
      }

      if (lessons.length > 0) {
        await saveGroupedChapterLessons(
          course.courseId,
          course.courseName,
          chapter.chapterName,
          chapterIndex,
          lessons
        );
      }
    }

    return {
      success: true,
      successCount: completed,
      totalChapters: jobs.length,
      generatedChapters: jobs.length,
    };
  } catch (e: unknown) {
    console.error("generateCourseContent queue wrapper crashed:", e);
    return { success: false, error: String(e) };
  } finally {
    setLoading(false);
  }
};
