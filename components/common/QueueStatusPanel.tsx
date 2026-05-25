"use client";

import type { QueueStatusResult } from "@/app/actions/generationQueue";

type QueueStatusPanelProps = {
  status?: QueueStatusResult | null;
};

function formatWait(seconds?: number) {
  if (!seconds || seconds <= 0) return "less than a minute";
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

export default function QueueStatusPanel({ status }: QueueStatusPanelProps) {
  if (!status?.success || !status.jobId) return null;

  const progress =
    status.progress && typeof status.progress === "object"
      ? status.progress as { completed?: number; total?: number; lessonName?: string }
      : null;
  const hasProgress =
    typeof progress?.completed === "number" && typeof progress?.total === "number";
  const inProgress =
    status.state === "active" ||
    status.courseStatus === "generating" ||
    (hasProgress && (progress.completed || 0) > 0);
  const showWorkerMissing = Boolean(status.workerMissing && !inProgress && !hasProgress);
  const position = status.position && status.position > 0 ? status.position : undefined;
  const isDailyExhausted = status.queueReason === "daily_exhausted";
  const isBusy = status.queueReason === "busy";
  const title = isDailyExhausted
    ? "Our system is experiencing heavy load."
    : showWorkerMissing
      ? "Generation worker is not running."
      : isBusy
        ? "Waiting for an available API key."
      : inProgress
        ? "Generation in progress..."
        : "High traffic detected. Your course is queued for generation.";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm text-nova-body ${
      isDailyExhausted
        ? "border-amber-300 bg-amber-50"
        : "border-primary/20 bg-primary/5"
    }`}>
      <p className="font-semibold text-nova-heading">
        {title}
      </p>
      {isDailyExhausted && (
        <p className="mt-1">
          {status.queueMessage ||
            "All generation keys are at their daily limit. Please retry after 30 minutes."}
        </p>
      )}
      {showWorkerMissing && (
        <p className="mt-1">
          Start the heavy generation worker to process this queue item.
        </p>
      )}
      {!isDailyExhausted && isBusy && (
        <p className="mt-1">
          All API keys are currently busy. Your request is waiting for the next available key.
        </p>
      )}
      {position && (
        <p className="mt-1">
          Position {position} in queue. Estimated wait: {formatWait(status.estimatedWaitSeconds)}.
        </p>
      )}
      {progress?.total ? (
        <p className="mt-1">
          {progress.completed || 0} of {progress.total} lessons generated
          {progress.lessonName ? `: ${progress.lessonName}` : ""}.
        </p>
      ) : null}
      <p className="mt-1 text-xs text-nova-body/70">
        You can safely leave this tab and come back later. We will keep generating.
      </p>
    </div>
  );
}
