"use client";

import type { LearningStrategyOutput } from "@/lib/validation/learningSchemas";
import { Button } from "@/components/ui/button";
import { FaCheck } from "react-icons/fa6";
import { buildCourseOutputFromRoadmap } from "@/lib/learning/roadmapToCourseOutput";
import { parseCourseOutput } from "@/utils/parseCourseOutput";
import type { UserInputType, ChapterType } from "@/types/types";

type Props = {
  strategy: LearningStrategyOutput;
  userInput: UserInputType;
  /** From onboarding — daily study budget */
  dailyHours?: number;
  onBack: () => void;
  onConfirm: () => void;
  loading: boolean;
};

function splitReasoning(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function ChapterCard({ chapter, index }: { chapter: ChapterType; index: number }) {
  const subchapters = Array.isArray(chapter.subchapters) ? chapter.subchapters : [];
  const subtopics = Array.isArray(chapter.subtopics) && chapter.subtopics.length > 0
    ? chapter.subtopics
    : subchapters.flatMap((subchapter) => subchapter.subtopics ?? []);
  const lessons = subtopics.slice(0, 4);
  const durationLabel =
    typeof chapter.durationDays === "number"
      ? durationText(chapter.durationDays)
      : typeof chapter.duration === "string" && chapter.duration
        ? chapter.duration
        : "—";

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-nova-heading sm:text-xl">
          {chapter.chapterName}
        </h3>
        <p className="mt-1 text-sm text-gray-400">
          {durationLabel} · {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="space-y-3">
        {lessons.map((lesson, lessonIndex) => (
          <div
            key={`${lesson}-${lessonIndex}`}
            className="flex items-center gap-3 rounded-xl border border-black/5 bg-nova-bg/70 px-4 py-3 shadow-sm dark:border-white/10"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-black/5 bg-white text-xs font-semibold text-nova-body shadow-sm dark:border-white/10 dark:bg-nova-card">
              {lessonIndex + 1}
            </span>
            <span className="min-w-0 text-sm font-medium text-nova-heading">
              {lesson}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function durationText(days?: number): string {
  if (typeof days !== "number" || Number.isNaN(days) || days <= 0) return "—";
  const rounded = Math.round(days * 2) / 2;
  return `${rounded} day${rounded === 1 ? "" : "s"}`;
}

const PersonalizedRoadmapReview = ({
  strategy,
  userInput,
  dailyHours,
  onBack,
  onConfirm,
  loading,
}: Props) => {
  const courseOutput = parseCourseOutput(
    buildCourseOutputFromRoadmap(userInput, strategy)
  );
  const totalDays = courseOutput.durationDays ?? strategy.estimatedTimelineDays;
  const estChapters = courseOutput.chapters.length;
  const hasDaily =
    typeof dailyHours === "number" && dailyHours > 0 && !Number.isNaN(dailyHours);
  const dailyNumber =
    hasDaily && dailyHours! % 1 !== 0
      ? dailyHours!.toFixed(1)
      : hasDaily
        ? String(dailyHours)
        : null;

  const reasoningParts = splitReasoning(strategy.reasoning);

  return (
    <div className="space-y-10 rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-bg/50 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-10">
      <header className="text-center sm:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Your personalized plan
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-nova-heading sm:text-4xl">
          Learning roadmap
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-nova-body">
          A structured path from where you are today to the outcomes you chose — optimized for your time and goals.
        </p>
      </header>

      {/* Summary strip */}
      <div className="grid gap-4 rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-bg shadow-sm dark:shadow-none p-6 sm:grid-cols-3 sm:p-8">
        <div className="text-center sm:text-left">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Total duration
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-nova-heading">
            {totalDays}
            <span className="ml-1 text-lg font-semibold text-primary">days</span>
          </p>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Daily effort
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-nova-heading">
            {!hasDaily ? (
              <span className="text-xl text-gray-400">—</span>
            ) : (
              <>
                <span className="text-nova-heading">{dailyNumber}</span>
                <span className="ml-1 text-lg font-semibold text-primary">hrs/day</span>
              </>
            )}
          </p>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Est. chapters
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-nova-heading">
            {estChapters}
            <span className="ml-1 text-lg font-semibold text-primary">chapters</span>
          </p>
        </div>
      </div>

      <p className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-center text-sm text-nova-body">
        <span className="font-medium text-primary">Note:</span> This plan is optimized based on your goals and time availability.
      </p>

      {/* Timeline + chapters */}
      <div className="relative">
        <div className="absolute bottom-0 left-[11px] top-8 w-px bg-gradient-to-b from-primary/50 via-white/15 to-transparent sm:left-[15px]" />

        <div className="space-y-12">
          {courseOutput.chapters.map((chapter, index) => (
            <section key={`${chapter.chapterName}-${index}`} className="relative pl-10 sm:pl-12">
              <div className="absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary bg-nova-bg sm:h-8 sm:w-8">
                <span className="text-xs font-bold text-primary">{index + 1}</span>
              </div>

              <div className="rounded-2xl border border-black/5 bg-nova-card/50 p-5 dark:border-white/10 sm:p-6">
                <ChapterCard chapter={chapter} index={index} />
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Skill graph — compact */}
      <div className="rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-card/40 p-5 sm:p-6">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-nova-body">
          Skills you&apos;ll build
        </h4>
        <div className="mt-4 flex flex-wrap gap-2">
          {strategy.skillGraph
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((s) => (
              <span
                key={`${s.order}-${s.skill}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-bg/80 px-3 py-1.5 text-xs text-nova-heading"
              >
                <FaCheck className="h-3 w-3 text-primary" />
                {s.skill}
              </span>
            ))}
        </div>
      </div>

      {/* Reasoning */}
      <div className="rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-bg/60 p-6 sm:p-8">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-primary">
          Why this roadmap?
        </h4>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-nova-body">
          {reasoningParts.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-black/5 dark:border-white/10 dark:border-white/5 pt-8 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="border-black/10 dark:border-white/10 dark:border-white/10 bg-transparent text-nova-heading hover:bg-nova-card/5"
        >
          Modify plan
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="bg-primary px-8 text-base font-semibold text-white hover:bg-primary/90"
        >
          {loading ? "Saving roadmap..." : "Save Roadmap & Proceed to Course Generation"}
        </Button>
      </div>
    </div>
  );
};

export default PersonalizedRoadmapReview;
