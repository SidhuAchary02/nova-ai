"use server";

import { db } from "@/configs/db";
import { CourseList } from "@/schema/schema";
import { eq } from "drizzle-orm";
import {
  enqueueHeavyGenerationJob,
  getHeavyGenerationJobStatus,
} from "@/lib/queue/heavyGenerationQueue";
import { parseCourseOutput } from "@/utils/parseCourseOutput";
import type { UserInputType } from "@/types/types";

export type QueueStatusResult = {
  success: boolean;
  error?: string;
  jobId?: string;
  state?: string;
  position?: number;
  estimatedWaitSeconds?: number;
  progress?: unknown;
  failedReason?: string;
  courseStatus?: string;
  chaptersGenerated?: number;
  chaptersTotal?: number;
  result?: unknown;
  workerCount?: number;
  workerMissing?: boolean;
  queueMessage?: string;
  retryAfterMinutes?: number;
  queueReason?: "busy" | "daily_exhausted" | "worker_missing" | "failed";
};

function readQueueMessage(progress: unknown) {
  if (!progress || typeof progress !== "object") return {};
  const value = progress as {
    status?: unknown;
    message?: unknown;
    lessonName?: unknown;
  };
  const message =
    typeof value.message === "string"
      ? value.message
      : typeof value.lessonName === "string" &&
          value.lessonName.toLowerCase().includes("waiting for an available api key")
        ? value.lessonName
      : typeof value.lessonName === "string" &&
          value.status === "failed" &&
          value.lessonName.includes("retry after")
        ? value.lessonName
        : undefined;
  const lowerMessage = message?.toLowerCase();

  return {
    queueMessage: message,
    retryAfterMinutes: message?.includes("30 minutes") ? 30 : undefined,
    queueReason: lowerMessage?.includes("retry after")
      ? ("daily_exhausted" as const)
      : lowerMessage?.includes("waiting for an available api key")
        ? ("busy" as const)
      : undefined,
  };
}

function deriveQueueReason(input: {
  queueMessage?: string;
  failedReason?: string;
  workerMissing?: boolean;
}): QueueStatusResult["queueReason"] {
  const text = `${input.queueMessage || ""} ${input.failedReason || ""}`
    .trim()
    .toLowerCase();
  if (text.includes("retry after 30 minutes") || text.includes("heavy load")) {
    return "daily_exhausted";
  }
  if (input.workerMissing) return "worker_missing";
  if (text.includes("waiting for an available api key")) return "busy";
  if (text) return "failed";
  return undefined;
}

export async function enqueueRoadmapGenerationAction(input: {
  userEmail: string;
  userInput: UserInputType;
}) {
  try {
    const job = await enqueueHeavyGenerationJob({
      taskType: "roadmap",
      userEmail: input.userEmail,
      userInput: input.userInput,
    });

    return { success: true, jobId: job.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("enqueueRoadmapGenerationAction:", message);
    return { success: false, error: message };
  }
}

export async function enqueueCourseGenerationAction(input: {
  courseId: string;
  userEmail: string;
  initialCount?: number;
  chapterIndex?: number;
}) {
  try {
    const [course] = await db
      .select()
      .from(CourseList)
      .where(eq(CourseList.courseId, input.courseId));

    if (!course) return { success: false, error: "Course not found" };
    if (course.createdBy !== input.userEmail) {
      return { success: false, error: "Not authorized" };
    }

    if (course.queueJobId) {
      const existing = await getHeavyGenerationJobStatus(course.queueJobId);
      if (existing && ["waiting", "delayed", "active"].includes(existing.state)) {
        return { success: true, jobId: course.queueJobId };
      }
    }

    const output = parseCourseOutput(course.courseOutput as any);
    const chaptersTotal = output?.chapters?.length || 0;

    await db
      .update(CourseList)
      .set({
        chaptersTotal,
        generationStatus: "queued",
      })
      .where(eq(CourseList.courseId, input.courseId));

    const job = await enqueueHeavyGenerationJob({
      courseId: input.courseId,
      userEmail: input.userEmail,
      taskType:
        typeof input.chapterIndex === "number" ? "single-chapter" : "initial-course",
      initialCount: input.initialCount,
      chapterIndex: input.chapterIndex,
    });

    return { success: true, jobId: job.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("enqueueCourseGenerationAction:", message);
    return { success: false, error: message };
  }
}

export async function getCourseGenerationQueueStatusAction(
  courseId: string
): Promise<QueueStatusResult> {
  try {
    const [course] = await db
      .select({
        queueJobId: CourseList.queueJobId,
        generationStatus: CourseList.generationStatus,
        chaptersGenerated: CourseList.chaptersGenerated,
        chaptersTotal: CourseList.chaptersTotal,
      })
      .from(CourseList)
      .where(eq(CourseList.courseId, courseId));

    if (!course) return { success: false, error: "Course not found" };

    const status = await getHeavyGenerationJobStatus(course.queueJobId);
    const queueMessage = readQueueMessage(status?.progress);

    return {
      success: true,
      jobId: course.queueJobId || undefined,
      state: status?.state,
      position: status?.position,
      estimatedWaitSeconds: status?.estimatedWaitSeconds,
      progress: status?.progress,
      failedReason: status?.failedReason,
      courseStatus: course.generationStatus,
      chaptersGenerated: course.chaptersGenerated,
      chaptersTotal: course.chaptersTotal,
      result: status?.returnvalue,
      workerCount: status?.workerCount,
      workerMissing: status?.workerMissing,
      queueMessage: queueMessage.queueMessage,
      retryAfterMinutes: queueMessage.retryAfterMinutes,
      queueReason: deriveQueueReason({
        queueMessage: queueMessage.queueMessage,
        failedReason: status?.failedReason,
        workerMissing: status?.workerMissing,
      }),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("getCourseGenerationQueueStatusAction:", message);
    return { success: false, error: message };
  }
}

export async function getRoadmapGenerationQueueStatusAction(
  jobId: string
): Promise<QueueStatusResult> {
  try {
    const status = await getHeavyGenerationJobStatus(jobId);

    if (!status) {
      return { success: false, error: "Job not found" };
    }

    const queueMessage = readQueueMessage(status.progress);

    return {
      success: true,
      jobId: status.jobId,
      state: status.state,
      position: status.position,
      estimatedWaitSeconds: status.estimatedWaitSeconds,
      progress: status.progress,
      failedReason: status.failedReason,
      result: status.returnvalue,
      workerCount: status.workerCount,
      workerMissing: status.workerMissing,
      queueMessage: queueMessage.queueMessage,
      retryAfterMinutes: queueMessage.retryAfterMinutes,
      queueReason: deriveQueueReason({
        queueMessage: queueMessage.queueMessage,
        failedReason: status.failedReason,
        workerMissing: status.workerMissing,
      }),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("getRoadmapGenerationQueueStatusAction:", message);
    return { success: false, error: message };
  }
}
