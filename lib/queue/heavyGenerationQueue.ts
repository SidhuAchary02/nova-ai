import { Queue, Worker, type Job } from "bullmq";
import IORedis from "ioredis";
import { db } from "@/configs/db";
import { CourseList } from "@/schema/schema";
import { eq } from "drizzle-orm";
import { getCourseByIdPublicAction } from "@/app/actions/getCourseByIdPublic";
import { parseCourseOutput } from "@/utils/parseCourseOutput";
import { generateSingleSubtopicLesson, saveGroupedChapterLessons } from "@/app/actions/generateChapterContent";
import { getGeneratedChapterIdsAction } from "@/app/actions/getCourseChapterProgress";
import {
  acquireHeavyGroqKeyLease,
  AllGroqKeysExhaustedError,
  getConfiguredHeavyKeyCount,
  getGroqKeyFailureStats,
  releaseGroqKeyLease,
  type LeasedGroqKey,
} from "@/lib/ai/groqKeyManager";
import { sendApiKeysExhaustedAlert } from "@/lib/notifications/adminAlerts";
import { generateLearningStrategyAction } from "@/app/actions/generateLearningStrategy";
import type { CourseType, UserInputType } from "@/types/types";
import {
  DAILY_EXHAUSTED_RETRY_MESSAGE,
  areAllHeavyGroqKeysDailyExhausted,
} from "@/lib/ai/groqKeyManager";

type CourseGenerationJobData = {
  courseId: string;
  userEmail: string;
  taskType: "initial-course" | "single-chapter";
  initialCount?: number;
  chapterIndex?: number;
};

type RoadmapGenerationJobData = {
  userEmail: string;
  taskType: "roadmap";
  userInput: UserInputType;
};

export type HeavyGenerationJobData = CourseGenerationJobData | RoadmapGenerationJobData;

const queueName = "heavy-generation";
const SUBTOPIC_CONCURRENCY = 1;
const KEY_WAIT_MS = 5000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const keyWaitDelay = () => KEY_WAIT_MS + Math.floor(Math.random() * 1500);

function createConnection() {
  const redisUrl = process.env.REDIS_URL
    ?.trim()
    .replace(/^redis-cli\s+-u\s+/i, "")
    .replace(/^["']|["']$/g, "");
  if (!redisUrl) {
    throw new Error("REDIS_URL is required for heavy generation queue");
  }

  return new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
  });
}

export const heavyGenerationQueue = new Queue<HeavyGenerationJobData>(queueName, {
  connection: createConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: { count: 20 },
    removeOnFail: { count: 50 },
  },
});

export async function enqueueHeavyGenerationJob(data: HeavyGenerationJobData) {
  const job = await heavyGenerationQueue.add(data.taskType, data);

  if (data.taskType !== "roadmap") {
    await db
      .update(CourseList)
      .set({
        generationStatus: "queued",
        queueJobId: job.id,
      })
      .where(eq(CourseList.courseId, data.courseId));
  }

  return job;
}

async function updateCourseStatus(
  courseId: string,
  generationStatus: "queued" | "generating" | "partial" | "published" | "failed",
  queueJobId?: string | null
) {
  const patch: Partial<typeof CourseList.$inferInsert> = { generationStatus };
  if (queueJobId !== undefined) patch.queueJobId = queueJobId;

  await db
    .update(CourseList)
    .set(patch)
    .where(eq(CourseList.courseId, courseId));
}

async function selectedChapterJobs(course: CourseType, data: CourseGenerationJobData) {
  const courseOutput = parseCourseOutput(course.courseOutput);
  const allChapters = courseOutput?.chapters || [];
  const generatedProgress = await getGeneratedChapterIdsAction(course.courseId);
  const generatedSet = new Set(generatedProgress.success ? generatedProgress.chapterIds : []);

  if (typeof data.chapterIndex === "number") {
    const chapter = allChapters[data.chapterIndex];
    return chapter && !generatedSet.has(data.chapterIndex)
      ? [{ chapter, chapterIndex: data.chapterIndex }]
      : [];
  }

  const initialCount = data.initialCount && data.initialCount > 0
    ? data.initialCount
    : allChapters.length;

  return allChapters
    .slice(0, initialCount)
    .map((chapter: any, chapterIndex: number) => ({ chapter, chapterIndex }))
    .filter(({ chapterIndex }: { chapterIndex: number }) => !generatedSet.has(chapterIndex));
}

async function waitForHeavyGroqLease(
  job: Job<HeavyGenerationJobData>,
  lessonName: string
) {
  if (getConfiguredHeavyKeyCount() === 0) {
    throw new Error("No Groq API keys are configured for heavy generation");
  }

  let leasedKey = await acquireHeavyGroqKeyLease(job.id || `job-${Date.now()}`);
  while (!leasedKey) {
    if (await areAllHeavyGroqKeysDailyExhausted()) {
      await job.updateProgress({
        status: "failed",
        completed: 0,
        total: 1,
        lessonName: DAILY_EXHAUSTED_RETRY_MESSAGE,
        message: DAILY_EXHAUSTED_RETRY_MESSAGE,
      } as any);
      throw new AllGroqKeysExhaustedError(
        DAILY_EXHAUSTED_RETRY_MESSAGE,
        await getGroqKeyFailureStats()
      );
    }

    await job.updateProgress({
      status: "queued",
      completed: 0,
      total: 1,
      lessonName: `Waiting for an available API key: ${lessonName}`,
    });
    await sleep(keyWaitDelay());
    leasedKey = await acquireHeavyGroqKeyLease(job.id || `job-${Date.now()}`);
  }

  return leasedKey;
}

async function runWithHeavyGroqLease<T>(
  job: Job<HeavyGenerationJobData>,
  lessonName: string,
  operation: (leasedKey: LeasedGroqKey) => Promise<T>
) {
  for (;;) {
    const leasedKey = await waitForHeavyGroqLease(job, lessonName);

    try {
      return await operation(leasedKey);
    } catch (error) {
      if (error instanceof AllGroqKeysExhaustedError) {
        if (await areAllHeavyGroqKeysDailyExhausted()) {
          throw error;
        }

        await job.updateProgress({
          status: "queued",
          completed: 0,
          total: 1,
          lessonName: `Switching API key: ${lessonName}`,
        });
        await sleep(1000);
        continue;
      }

      throw error;
    } finally {
      await releaseGroqKeyLease(leasedKey);
    }
  }
}

async function runHeavyGenerationJob(job: Job<HeavyGenerationJobData>) {
  if (job.data.taskType === "roadmap") {
    const { userInput } = job.data;

    await job.updateProgress({
      status: "generating",
      completed: 0,
      total: 1,
      lessonName: "Personalized roadmap",
    });

    const result = await runWithHeavyGroqLease(
      job,
      "Personalized roadmap",
      (leasedKey) => generateLearningStrategyAction(userInput, leasedKey)
    );

    await job.updateProgress({
      status: "complete",
      completed: 1,
      total: 1,
      lessonName: "Personalized roadmap",
    });

    return result;
  }

  const { courseId, userEmail, taskType } = job.data;
  await updateCourseStatus(courseId, "generating", job.id);

  try {
    const course = await getCourseByIdPublicAction(courseId, userEmail) as CourseType | null;
    if (!course) throw new Error("Course not found");

    const jobs = await selectedChapterJobs(course, job.data);
    let completed = 0;
    const total = jobs.reduce(
      (sum, { chapter }) => sum + (chapter.subtopics?.length || 0),
      0
    );

    for (const { chapter, chapterIndex } of jobs) {
      const lessons: any[] = [];

      const subtopics = chapter.subtopics || [];
      for (let i = 0; i < subtopics.length; i += SUBTOPIC_CONCURRENCY) {
        const batch = subtopics.slice(i, i + SUBTOPIC_CONCURRENCY);

        const results = await Promise.all(
          batch.map(async (subtopicName: string) => {
            await job.updateProgress({
              status: "generating",
              completed,
              total,
              lessonName: subtopicName,
            });

            return runWithHeavyGroqLease(
              job,
              subtopicName,
              (leasedKey) =>
                generateSingleSubtopicLesson(
                  course.courseName,
                  chapter.chapterName,
                  subtopicName,
                  leasedKey
                )
            );
          })
        );

        results.forEach((result, index) => {
          completed += 1;
          if (result.success) {
            lessons.push(result.lesson);
          } else {
            console.warn(
              "Subtopic generation failed:",
              batch[index],
              result.error
            );
          }
        });
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

    const progress = await getGeneratedChapterIdsAction(courseId);
    const courseOutput = parseCourseOutput(course.courseOutput);
    const totalChapters = courseOutput?.chapters?.length || 0;
    const generatedCount = progress.success ? progress.chapterIds.length : 0;

    await db
      .update(CourseList)
      .set({
        generationStatus:
          totalChapters > 0 && generatedCount >= totalChapters ? "published" : "partial",
        chaptersGenerated: generatedCount,
        chaptersTotal: totalChapters,
        queueJobId: null,
      })
      .where(eq(CourseList.courseId, courseId));
  } catch (error) {
    const status = error instanceof AllGroqKeysExhaustedError ? "partial" : "failed";

    await updateCourseStatus(courseId, status, null);

    if (error instanceof AllGroqKeysExhaustedError) {
      await sendApiKeysExhaustedAlert({
        userEmail,
        taskType,
        courseId,
        stats: error.stats,
      });
    }

    throw error;
  }
}

let worker: Worker<HeavyGenerationJobData> | null = null;

export function getHeavyGenerationWorker() {
  if (worker) return worker;

  worker = new Worker<HeavyGenerationJobData>(queueName, runHeavyGenerationJob, {
    connection: createConnection(),
    concurrency: Number(
      process.env.HEAVY_GENERATION_CONCURRENCY ||
        Math.max(1, getConfiguredHeavyKeyCount())
    ),
  });

  worker.on("failed", (job, error) => {
    console.error("Heavy generation job failed:", job?.id, error);
  });

  return worker;
}

export async function getHeavyGenerationJobStatus(jobId?: string | null) {
  if (!jobId) return null;

  const job = await heavyGenerationQueue.getJob(jobId);
  if (!job) return null;

  const state = await job.getState();
  const progress = job.progress;
  const workerCount = await heavyGenerationQueue.getWorkersCount();
  let position = -1;

  if (state === "waiting" || state === "delayed") {
    const [waiting, delayed] = await Promise.all([
      heavyGenerationQueue.getWaiting(),
      heavyGenerationQueue.getDelayed(),
    ]);
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
    workerMissing:
      workerCount === 0 && ["waiting", "delayed", "active"].includes(state),
  };
}
