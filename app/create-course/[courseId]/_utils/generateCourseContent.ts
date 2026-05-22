import { CourseType } from "@/types/types";
import {
  enqueueCourseGenerationAction,
  getCourseGenerationQueueStatusAction,
  type QueueStatusResult,
} from "@/app/actions/generationQueue";

type GenerateCourseContentOptions = {
  initialCount?: number;
  chapterIndex?: number;
  onProgress?: (completed: number, totalLessons: number, lessonName?: string) => void;
  onQueueStatus?: (status: QueueStatusResult) => void;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

    const enqueueResult = await enqueueCourseGenerationAction({
      courseId: course.courseId,
      userEmail,
      initialCount: options.initialCount,
      chapterIndex: options.chapterIndex,
    });

    if (!enqueueResult.success || !enqueueResult.jobId) {
      return {
        success: false,
        error: enqueueResult.error || "Failed to queue course generation",
      };
    }

    for (;;) {
      const status = await getCourseGenerationQueueStatusAction(course.courseId);
      options.onQueueStatus?.(status);

      const progress = readProgress(status.progress);
      if (progress && progress.total > 0) {
        options.onProgress?.(
          progress.completed,
          progress.total,
          progress.lessonName
        );
      }

      if (!status.success) {
        return { success: false, error: status.error || "Failed to read queue status" };
      }

      if (status.state === "completed" || !status.jobId) {
        return {
          success: true,
          successCount: status.chaptersGenerated || 0,
          totalChapters: status.chaptersTotal || 0,
          generatedChapters: status.chaptersGenerated || 0,
        };
      }

      if (status.state === "failed") {
        return {
          success: false,
          error:
            status.failedReason ||
            "We are experiencing high demand right now. Your progress has been saved. Please try again in 30 minutes.",
        };
      }

      await sleep(5000);
    }
  } catch (e: unknown) {
    console.error("generateCourseContent queue wrapper crashed:", e);
    return { success: false, error: String(e) };
  } finally {
    setLoading(false);
  }
};
