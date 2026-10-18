import { Queue, Worker, type Job } from "bullmq";
import IORedis from "ioredis";
import type { HeavyGenerationJobData } from "@/lib/jobs/heavy-generation";

export const HEAVY_GENERATION_QUEUE_NAME = "heavy-generation";

function createConnection() {
  const redisUrl = process.env.REDIS_URL?.trim();
  if (!redisUrl) {
    throw new Error("REDIS_URL is required for heavy generation queue");
  }

  return new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
  });
}

export const heavyGenerationQueue = new Queue<HeavyGenerationJobData>(
  HEAVY_GENERATION_QUEUE_NAME,
  {
    connection: createConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 200 },
    },
  }
);

export async function enqueueHeavyGenerationJob(data: HeavyGenerationJobData) {
  return heavyGenerationQueue.add(data.taskType, data);
}

let worker: Worker<HeavyGenerationJobData> | null = null;

export function getHeavyGenerationWorker() {
  if (worker) return worker;

  worker = new Worker<HeavyGenerationJobData>(
    HEAVY_GENERATION_QUEUE_NAME,
    async (job) => {
      const { processHeavyGenerationJob } = await import("@/lib/jobs/heavy-generation");
      return processHeavyGenerationJob(job);
    },
    {
      connection: createConnection(),
      concurrency: 1,
    }
  );

  return worker;
}

export async function getHeavyGenerationJob(jobId: string) {
  return heavyGenerationQueue.getJob(jobId);
}

export type HeavyGenerationQueueJob = Job<HeavyGenerationJobData>;
