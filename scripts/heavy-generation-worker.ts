import dotenv from "dotenv";
import { existsSync } from "node:fs";
import path from "node:path";
import { Worker } from "bullmq";
import { getRedisConnection } from "@/lib/redis";
import { HEAVY_GENERATION_QUEUE_NAME } from "@/lib/queue/heavyGenerationQueue";
import { processHeavyGenerationJob, type HeavyGenerationJobData } from "@/lib/jobs/heavy-generation";
import { getConfiguredHeavyKeyCount } from "@/lib/ai/groqKeyManager";

const localEnvPath = path.resolve(process.cwd(), ".env.local");

if (existsSync(localEnvPath)) {
  dotenv.config({
    path: localEnvPath,
    override: true,
  });
} else {
  dotenv.config();
}

function validateWorkerEnvironment() {
  const missing: string[] = [];

  if (!process.env.DATABASE_URL) missing.push("DATABASE_URL");
  if (!process.env.REDIS_URL) missing.push("REDIS_URL");
  if (getConfiguredHeavyKeyCount() === 0) {
    missing.push("GROQ_API_KEY or GROQ_HEAVY_API_KEYS/GROQ_PAID_API_KEY");
  }

  if (missing.length > 0) {
    throw new Error(`Missing required worker environment variables: ${missing.join(", ")}`);
  }
}

async function main() {
  validateWorkerEnvironment();

  const concurrency = Math.max(1, Number(process.env.HEAVY_GENERATION_CONCURRENCY || 1));

  console.log(
    `[heavy-generation-worker] starting queue=${HEAVY_GENERATION_QUEUE_NAME} concurrency=${concurrency}`
  );

  const worker = new Worker<HeavyGenerationJobData>(
    HEAVY_GENERATION_QUEUE_NAME,
    processHeavyGenerationJob,
    {
      connection: getRedisConnection(),
      concurrency,
    }
  );

  console.log("[heavy-generation-worker] worker started");

  worker.on("completed", (job) => {
    console.log(`[heavy-generation-worker] job completed id=${job.id}`);
  });

  worker.on("failed", (job, error) => {
    console.error(`[heavy-generation-worker] job failed id=${job?.id}`, error);
  });

  worker.on("error", (error) => {
    console.error("[heavy-generation-worker] worker error", error);
  });

  async function shutdown() {
    console.log("[heavy-generation-worker] closing worker...");
    await worker.close();
    process.exit(0);
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error("Heavy generation worker failed to start:", error);
  process.exit(1);
});
