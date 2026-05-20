import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
  override: true,
});

async function main() {
  const { getHeavyGenerationWorker } = await import("@/lib/queue/heavyGenerationQueue");
  const worker = getHeavyGenerationWorker();

  console.log("Heavy generation worker started.");

  worker.on("completed", (job) => {
    console.log(`Heavy generation job completed: ${job.id}`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Heavy generation job failed: ${job?.id}`, error);
  });

  async function shutdown() {
    console.log("Closing heavy generation worker...");
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
