import { db } from "@/configs/db";
import { CourseList } from "@/schema/schema";
import { eq } from "drizzle-orm";
import { getHeavyGenerationQueue } from "@/lib/queue/heavyGenerationQueue";

export type HeavyGenerationJobStatus = {
  jobId?: string;
  state?: string;
  position: number;
  estimatedWaitSeconds: number;
  progress?: unknown;
  failedReason?: string;
  returnvalue?: unknown;
  workerCount: number;
  workerMissing: boolean;
};

export type CourseGenerationStatePatch = {
  generationStatus: "queued" | "generating" | "partial" | "published" | "failed";
  queueJobId?: string | null;
  chaptersGenerated?: number;
  chaptersTotal?: number;
};

// The polling UI reads from this service; it never touches the worker directly.
export async function getHeavyGenerationJobStatus(
  jobId?: string | null
): Promise<HeavyGenerationJobStatus | null> {
  if (!jobId) return null;

  const queue = getHeavyGenerationQueue();
  const job = await queue.getJob(jobId);
  if (!job) return null;

  const state = await job.getState();
  const progress = job.progress;
  const workerCount = await queue.getWorkersCount();

  let position = -1;
  if (state === "waiting" || state === "delayed") {
    const [waiting, delayed] = await Promise.all([queue.getWaiting(), queue.getDelayed()]);
    const queuedJobs = [...waiting, ...delayed];
    position = queuedJobs.findIndex((queuedJob) => queuedJob.id === job.id);
  }

  return {
    jobId: job.id,
    state,
    position: position >= 0 ? position + 1 : 0,
    estimatedWaitSeconds: Math.max(0, position + 1) * 120,
    progress,
    failedReason: job.failedReason,
    returnvalue: job.returnvalue,
    workerCount,
    workerMissing: workerCount === 0 && ["waiting", "delayed", "active"].includes(state),
  };
}

export async function updateCourseGenerationState(
  courseId: string,
  patch: CourseGenerationStatePatch
) {
  const nextPatch: Partial<typeof CourseList.$inferInsert> = {
    generationStatus: patch.generationStatus,
  };

  if (patch.queueJobId !== undefined) nextPatch.queueJobId = patch.queueJobId;
  if (patch.chaptersGenerated !== undefined) nextPatch.chaptersGenerated = patch.chaptersGenerated;
  if (patch.chaptersTotal !== undefined) nextPatch.chaptersTotal = patch.chaptersTotal;

  await db
    .update(CourseList)
    .set(nextPatch)
    .where(eq(CourseList.courseId, courseId));
}

export async function getCourseGenerationState(courseId: string) {
  const [course] = await db
    .select({
      queueJobId: CourseList.queueJobId,
      generationStatus: CourseList.generationStatus,
      chaptersGenerated: CourseList.chaptersGenerated,
      chaptersTotal: CourseList.chaptersTotal,
    })
    .from(CourseList)
    .where(eq(CourseList.courseId, courseId));

  return course || null;
}