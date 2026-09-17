import { CourseType } from "@/types/types";
import { enqueueCourseGenerationAction } from "@/app/actions/generationQueue";
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

    const result = await enqueueCourseGenerationAction({
      courseId: course.courseId,
      userEmail,
      initialCount: options.initialCount,
      chapterIndex: options.chapterIndex,
    });

    if (!result.success) {
      return { success: false as const, error: result.error || "Failed to enqueue course generation" };
    }

    return {
      success: true as const,
      successCount: 0,
      totalChapters: options.chapterIndex === undefined ? options.initialCount || 0 : 1,
      generatedChapters: 0,
      jobId: result.jobId,
    };
  } catch (e: unknown) {
    console.error("generateCourseContent queue wrapper crashed:", e);
    return { success: false, error: String(e) };
  } finally {
    setLoading(false);
  }
};
