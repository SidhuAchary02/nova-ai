"use client";

import type { LearningStrategyOutput } from "@/lib/validation/learningSchemas";
import { Button } from "@/components/ui/button";
import { FaCheck, FaChevronDown } from "react-icons/fa6";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  strategy: LearningStrategyOutput;
  /** From onboarding — daily study budget */
  dailyHours?: number;
  onBack: () => void;
  onConfirm: () => void;
  loading: boolean;
};

function estimateChapterCount(strategy: LearningStrategyOutput): number {
  const d = strategy.estimatedTimelineDays;
  return Math.min(20, Math.max(6, Math.round(d / 2.5)));
}

function splitReasoning(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Day ranges for each objective inside a phase (inclusive). */
function objectiveDayRanges(
  phaseStartDay: number,
  phaseDays: number,
  count: number
): { start: number; end: number }[] {
  if (count === 0) return [];
  const out: { start: number; end: number }[] = [];
  const seg = phaseDays / count;
  for (let i = 0; i < count; i++) {
    const rawStart = phaseStartDay + i * seg;
    const rawEnd = phaseStartDay + (i + 1) * seg - 0.01;
    const start = Math.max(phaseStartDay, Math.round(rawStart));
    const end = Math.min(
      phaseStartDay + phaseDays - 1,
      Math.max(start, Math.round(rawEnd))
    );
    out.push({ start, end });
  }
  return out;
}

function ChapterCard({ title, subtopics, timeLabel, index }: { title: string; subtopics?: string[] | null; timeLabel: string; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasSubtopics = Array.isArray(subtopics) && subtopics.length > 0;

  return (
    <div className="group rounded-xl border border-black/5 bg-nova-bg/60 transition hover:border-primary/25 hover:bg-nova-bg/90 overflow-hidden">
      <button
        type="button"
        onClick={() => hasSubtopics && setExpanded(!expanded)}
        className={`flex w-full flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between text-left ${hasSubtopics ? "cursor-pointer focus:outline-none" : "cursor-default"}`}
      >
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {hasSubtopics && (
            <div className={`mt-0.5 shrink-0 transition-transform duration-300 ${expanded ? "rotate-180 text-primary" : "text-gray-400"}`}>
              <FaChevronDown className="h-4 w-4" />
            </div>
          )}
          <p className="text-sm leading-relaxed text-nova-heading">
            {title}
          </p>
        </div>
        <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ml-7 sm:ml-0">
          {timeLabel}
        </span>
      </button>

      {hasSubtopics && (
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pl-11 pr-4 pb-4 sm:pl-[3.25rem]">
                <ul className="space-y-2 text-sm text-nova-body list-disc list-outside ml-4">
                  {subtopics.map((topic, i) => (
                    <li key={i} className="pl-1 marker:text-gray-400">
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

const PersonalizedRoadmapReview = ({
  strategy,
  dailyHours,
  onBack,
  onConfirm,
  loading,
}: Props) => {
  const phases = strategy.phases.slice().sort((a, b) => a.order - b.order);
  const totalDays = strategy.estimatedTimelineDays;
  const estChapters = estimateChapterCount(strategy);
  const hasDaily =
    typeof dailyHours === "number" && dailyHours > 0 && !Number.isNaN(dailyHours);
  const dailyNumber =
    hasDaily && dailyHours! % 1 !== 0
      ? dailyHours!.toFixed(1)
      : hasDaily
        ? String(dailyHours)
        : null;

  let dayCursor = 1;
  const phaseBlocks = phases.map((p) => {
    const daysEntry = strategy.estimatedDaysPerPhase.find(
      (d) => d.phaseOrder === p.order
    );
    const phaseDaysRaw =
      daysEntry?.days ??
      Math.max(1, totalDays / Math.max(1, phases.length));
    const phaseDaysInt = Math.max(1, Math.round(phaseDaysRaw));
    const startDay = dayCursor;
    const endDay = dayCursor + phaseDaysInt - 1;
    dayCursor = endDay + 1;

    const objectiveCount = p.objectives?.length ?? 0;
    const ranges = objectiveDayRanges(startDay, phaseDaysInt, objectiveCount);

    return {
      phase: p,
      phaseDaysInt,
      startDay,
      endDay,
      ranges,
    };
  });

  const reasoningParts = splitReasoning(strategy.reasoning);

  return (
    <div className="space-y-10 rounded-2xl border border-black/5 bg-nova-bg/50 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-10">
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
      <div className="grid gap-4 rounded-2xl border border-black/5 bg-nova-bg shadow-sm p-6 sm:grid-cols-3 sm:p-8">
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
          <p className="mt-1 text-[11px] text-gray-400">
            AI may adjust slightly when generating your course outline.
          </p>
        </div>
      </div>

      <p className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-center text-sm text-nova-body">
        <span className="font-medium text-primary">Note:</span> This plan is optimized based on your goals and time availability.
      </p>

      {/* Timeline + phases */}
      <div className="relative">
        <div className="absolute bottom-0 left-[11px] top-8 w-px bg-gradient-to-b from-primary/50 via-white/15 to-transparent sm:left-[15px]" />

        <div className="space-y-12">
          {phaseBlocks.map(({ phase, phaseDaysInt, startDay, endDay, ranges }, pi) => (
            <section key={phase.order} className="relative pl-10 sm:pl-12">
              <div className="absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary bg-nova-bg sm:h-8 sm:w-8">
                <span className="text-xs font-bold text-primary">{pi + 1}</span>
              </div>

              <div className="rounded-2xl border border-black/5 bg-white/50 p-5 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-nova-heading">
                      {phase.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                      Days {startDay}–{endDay} · ~{phaseDaysInt} calendar day
                      {phaseDaysInt === 1 ? "" : "s"} in this phase
                    </p>
                  </div>
                  <span className="inline-flex w-fit rounded-full border border-black/5 bg-nova-bg/80 px-3 py-1 text-xs font-medium text-nova-body">
                    Phase {pi + 1} of {phases.length}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {(phase.chapters || phase.objectives)?.map((item: any, oi: number) => {
                    const r = ranges[oi];
                    const timeLabel = item.durationDays
                      ? `${item.durationDays} day${item.durationDays === 1 ? "" : "s"}`
                      : r && r.start === r.end
                        ? `Day ${r.start}`
                        : r
                          ? `Days ${r.start}–${r.end}`
                          : "—";

                    const isChapter = typeof item === 'object' && item !== null;
                    const title = isChapter ? item.chapterName : item;
                    const subtopics = isChapter ? item.subtopics : null;

                    return (
                      <ChapterCard
                        key={oi}
                        title={title}
                        subtopics={subtopics}
                        timeLabel={timeLabel}
                        index={oi}
                      />
                    );
                  })}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Skill graph — compact */}
      <div className="rounded-2xl border border-black/5 bg-white/40 p-5 sm:p-6">
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
                className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-nova-bg/80 px-3 py-1.5 text-xs text-nova-heading"
              >
                <FaCheck className="h-3 w-3 text-primary" />
                {s.skill}
              </span>
            ))}
        </div>
      </div>

      {/* Reasoning */}
      <div className="rounded-2xl border border-black/5 bg-nova-bg/60 p-6 sm:p-8">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-primary">
          Why this roadmap?
        </h4>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-nova-body">
          {reasoningParts.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-black/5 pt-8 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="border-black/10 bg-transparent text-nova-heading hover:bg-white/5"
        >
          Modify plan
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="bg-primary px-8 text-base font-semibold text-white hover:bg-primary/90"
        >
          {loading ? "Saving roadmap..." : "Save Roadmap"}
        </Button>
      </div>
    </div>
  );
};

export default PersonalizedRoadmapReview;
