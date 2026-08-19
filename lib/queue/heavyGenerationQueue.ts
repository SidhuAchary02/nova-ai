import { createHash } from "node:crypto";
import type { HeavyGenerationJobData } from "@/lib/jobs/heavy-generation";
import type { HeavyGenerationJobLike } from "@/lib/jobs/heavy-generation";

export const HEAVY_GENERATION_QUEUE_NAME = "heavy-generation";

type LocalJobState = "waiting" | "active" | "completed" | "failed";

type LocalJobRecord = {
  id: string;
  data: HeavyGenerationJobData;
  state: LocalJobState;
  progress?: unknown;
  failedReason?: string;
  returnvalue?: unknown;
  createdAt: number;
};

const localJobs = new Map<string, LocalJobRecord>();

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

function createLocalJobHandle(record: LocalJobRecord): HeavyGenerationJobLike {
  return {
    id: record.id,
    data: record.data,
    get progress() {
      return record.progress;
    },
    get failedReason() {
      return record.failedReason;
    },
    get returnvalue() {
      return record.returnvalue;
    },
    async updateProgress(progress: unknown) {
      record.progress = progress;
    },
  };
}

export function getHeavyGenerationJobRecord(jobId: string) {
  return localJobs.get(jobId) || null;
}

async function runLocalJob(jobId: string) {
  const record = localJobs.get(jobId);
  if (!record || record.state !== "waiting") return;

  record.state = "active";
  const job = createLocalJobHandle(record);

  try {
    const { processHeavyGenerationJob } = await import("@/lib/jobs/heavy-generation");
    record.returnvalue = await processHeavyGenerationJob(job);
    record.state = "completed";
  } catch (error) {
    record.state = "failed";
    record.failedReason = error instanceof Error ? error.message : String(error);
  }
}

export function buildHeavyGenerationJobId(data: HeavyGenerationJobData) {
  if (data.taskType === "roadmap") {
    const signature = stableStringify({
      userEmail: data.userEmail,
      userInput: data.userInput,
    });

    return `roadmap-${createHash("sha1").update(signature).digest("hex")}`;
  }

  return [
    "course",
    data.courseId,
    data.taskType,
    data.chapterIndex ?? "all",
    data.initialCount ?? "all",
  ].join("-");
}

export async function enqueueHeavyGenerationJob(data: HeavyGenerationJobData) {
  const baseJobId = buildHeavyGenerationJobId(data);
  const existingJob = localJobs.get(baseJobId);

  if (existingJob) {
    if (["waiting", "active"].includes(existingJob.state)) {
      return createLocalJobHandle(existingJob);
    }
  }

  const jobId = existingJob ? `${baseJobId}-${Date.now().toString(36)}` : baseJobId;
  localJobs.set(jobId, {
    id: jobId,
    data,
    state: "waiting",
    createdAt: Date.now(),
  });

  void runLocalJob(jobId);

  return createLocalJobHandle(localJobs.get(jobId)!);
}
