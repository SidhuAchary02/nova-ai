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
  const inProgress = status.state === "active" || status.courseStatus === "generating";
  const position = status.position && status.position > 0 ? status.position : undefined;

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-nova-body">
      <p className="font-semibold text-nova-heading">
        {inProgress
          ? "Generation in progress..."
          : "High traffic detected. Your course is queued for generation."}
      </p>
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
