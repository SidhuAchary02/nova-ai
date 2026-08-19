import { type Job } from "bullmq";
import { getCourseByIdPublicAction } from "@/app/actions/getCourseByIdPublic";
import { parseCourseOutput } from "@/utils/parseCourseOutput";
import { generateSingleSubtopicLesson, saveGroupedChapterLessons } from "@/app/actions/generateChapterContent";
import { getGeneratedChapterIdsAction } from "@/app/actions/getCourseChapterProgress";
import {
  acquireHeavyGroqKeyLease,
  AllGroqKeysExhaustedError,
  getConfiguredHeavyKeyCount,
  releaseGroqKeyLease,
  type LeasedGroqKey,
} from "@/lib/ai/groqKeyManager";
import { sendApiKeysExhaustedAlert } from "@/lib/notifications/adminAlerts";
import { generateLearningStrategyAction } from "@/app/actions/generateLearningStrategy";
import type { CourseType, UserInputType } from "@/types/types";
import { updateCourseGenerationState } from "@/lib/services/generation-status";

export type CourseGenerationJobData = {
  courseId: string;
  userEmail: string;
  taskType: "initial-course" | "single-chapter";
  initialCount?: number;
  chapterIndex?: number;
};

export type RoadmapGenerationJobData = {
  userEmail: string;
  taskType: "roadmap";
  userInput: UserInputType;
};

export type HeavyGenerationJobData = CourseGenerationJobData | RoadmapGenerationJobData;

const SUBTOPIC_CONCURRENCY = 1;
const KEY_WAIT_MS = 5000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

  const initialCount = data.initialCount && data.initialCount > 0 ? data.initialCount : allChapters.length;

  return allChapters
    .slice(0, initialCount)
    .map((chapter: any, chapterIndex: number) => ({ chapter, chapterIndex }))
    .filter(({ chapterIndex }: { chapterIndex: number }) => !generatedSet.has(chapterIndex));
}

async function waitForHeavyGroqLease(job: Job<HeavyGenerationJobData>, lessonName: string) {
  if (getConfiguredHeavyKeyCount() === 0) {
    throw new Error("No Groq API keys are configured for heavy generation");
  }

  let leasedKey = await acquireHeavyGroqKeyLease(job.id || `job-${Date.now()}`);
  while (!leasedKey) {
    await job.updateProgress({
      status: "queued",
      completed: 0,
      total: 1,
      lessonName: `Waiting for an available API key: ${lessonName}`,
    });
    await sleep(KEY_WAIT_MS);
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

async function runRoadmapJob(job: Job<RoadmapGenerationJobData>) {
  const { userInput } = job.data;

  await job.updateProgress({
    status: "generating",
    completed: 0,
    total: 1,
    lessonName: "Personalized roadmap",
  });

  const result = await runWithHeavyGroqLease(job, "Personalized roadmap", (leasedKey) =>
    generateLearningStrategyAction(userInput, leasedKey)
  );

  await job.updateProgress({
    status: "complete",
    completed: 1,
    total: 1,
    lessonName: "Personalized roadmap",
  });

  return result;
}

async function runCourseJob(job: Job<CourseGenerationJobData>) {
  const { courseId, userEmail, taskType } = job.data;

  await updateCourseGenerationState(courseId, {
    generationStatus: "generating",
    queueJobId: job.id,
  });

  try {
    const course = (await getCourseByIdPublicAction(courseId, userEmail)) as CourseType | null;
    if (!course) throw new Error("Course not found");

    const jobs = await selectedChapterJobs(course, job.data);
    let completed = 0;
    const total = jobs.reduce((sum, { chapter }) => sum + (chapter.subtopics?.length || 0), 0);

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

            return runWithHeavyGroqLease(job, subtopicName, (leasedKey) =>
              generateSingleSubtopicLesson(course.courseName, chapter.chapterName, subtopicName, leasedKey)
            );
          })
        );

        results.forEach((result, index) => {
          completed += 1;
          if (result.success) {
            lessons.push(result.lesson);
          } else {
            console.warn("Subtopic generation failed:", batch[index], result.error);
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

    await updateCourseGenerationState(courseId, {
      generationStatus: totalChapters > 0 && generatedCount >= totalChapters ? "published" : "partial",
      chaptersGenerated: generatedCount,
      chaptersTotal: totalChapters,
      queueJobId: null,
    });
  } catch (error) {
    const status = error instanceof AllGroqKeysExhaustedError ? "partial" : "failed";

    await updateCourseGenerationState(courseId, {
      generationStatus: status,
      queueJobId: null,
    });

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

export async function processHeavyGenerationJob(job: Job<HeavyGenerationJobData>) {
  if (job.data.taskType === "roadmap") {
    return runRoadmapJob(job);
  }

  return runCourseJob(job);
}