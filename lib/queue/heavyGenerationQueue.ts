import { Queue } from "bullmq";
import { createHash } from "node:crypto";
import { getRedisConnection } from "@/lib/redis";
import type { HeavyGenerationJobData } from "@/lib/jobs/heavy-generation";

export const HEAVY_GENERATION_QUEUE_NAME = "heavy-generation";

let heavyGenerationQueue: Queue<HeavyGenerationJobData> | null = null;

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) =>
      left.localeCompare(right)
    );

    return `{${entries
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

export function getHeavyGenerationQueue() {
  if (heavyGenerationQueue) return heavyGenerationQueue;

  heavyGenerationQueue = new Queue<HeavyGenerationJobData>(HEAVY_GENERATION_QUEUE_NAME, {
    connection: getRedisConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 200 },
    },
  });

  return heavyGenerationQueue;
}

export function buildHeavyGenerationJobId(data: HeavyGenerationJobData) {
  if (data.taskType === "roadmap") {
    const signature = stableStringify({
      userEmail: data.userEmail,
      userInput: data.userInput,
    });

    return `roadmap:${createHash("sha1").update(signature).digest("hex")}`;
  }

  return [
    "course",
    data.courseId,
    data.taskType,
    data.chapterIndex ?? "all",
    data.initialCount ?? "all",
  ].join(":");
}

// Queue producer: this is the only place the web app should touch BullMQ enqueue logic.
export async function enqueueHeavyGenerationJob(data: HeavyGenerationJobData) {
  const queue = getHeavyGenerationQueue();
  const baseJobId = buildHeavyGenerationJobId(data);
  const existingJob = await queue.getJob(baseJobId);

  if (existingJob) {
    const state = await existingJob.getState();
    if (["waiting", "delayed", "active"].includes(state)) {
      return existingJob;
    }
  }

  const jobId = existingJob ? `${baseJobId}:${Date.now().toString(36)}` : baseJobId;
  return queue.add(data.taskType, data, { jobId });
}
