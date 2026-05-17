"use client";

import type { LearningGoal, PacingStyle, UserLearningProfileInput } from "@/types/types";
import { motion } from "framer-motion";
import { FaPenToSquare, FaWandMagicSparkles } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { FEATURE_CARD_DEFS, type FeatureKey } from "./onboarding-utils";

const GOAL_LABEL: Record<LearningGoal, string> = {
  job: "Get a job",
  internship: "Internship prep",
  exam: "Crack an exam",
  project: "Build a project",
  hobby: "Just exploring",
};

type Props = {
  intent: string;
  category: string;
  goal: LearningGoal;
  goalCustomNote: string;
  level: UserLearningProfileInput["currentLevel"] | "not_sure";
  hoursPerDay: number;
  featureCards: Set<FeatureKey>;
  topicsToFocus: string[];
  topicsToAvoid: string[];
  pacingStyle: PacingStyle;
  onEditStep: (step: number) => void;
};

export function OnboardingSummary({
  intent,
  category,
  goal,
  goalCustomNote,
  level,
  hoursPerDay,
  featureCards,
  topicsToFocus,
  topicsToAvoid,
  pacingStyle,
  onEditStep,
}: Props) {
  const levelLabel =
    level === "not_sure" ? "Not sure (defaults to balanced)" : level;

  const pacingLabel =
    pacingStyle === "easy"
      ? "Easy & slow"
      : pacingStyle === "fast"
        ? "Fast-paced"
        : "Balanced";

  const formatLabels = FEATURE_CARD_DEFS.filter((f) =>
    featureCards.has(f.key)
  ).map((f) => f.label);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="mx-auto w-full max-w-2xl space-y-8"
    >
      <div className="flex items-center gap-2 text-primary">
        <FaWandMagicSparkles className="h-5 w-5" />
        <span className="text-sm font-medium tracking-wide">Step 7 of 7</span>
      </div>

      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-nova-heading sm:text-4xl">
          Here&apos;s your learning profile
        </h2>
        <p className="mt-3 text-base text-nova-body">
          Quick sanity check before we draft your personalized roadmap. Tap edit to jump back.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-bg/60 p-6">
        <SummaryRow
          title="Learning intent"
          value={intent || "—"}
          sub={category ? `Track: ${category}` : undefined}
          onEdit={() => onEditStep(0)}
        />
        <SummaryRow
          title="Why you&apos;re learning"
          value={GOAL_LABEL[goal]}
          sub={goalCustomNote || undefined}
          onEdit={() => onEditStep(1)}
        />
        <SummaryRow
          title="Starting level"
          value={levelLabel}
          onEdit={() => onEditStep(2)}
        />
        <SummaryRow
          title="Time commitment"
          value={`${hoursPerDay} hrs / day`}
          sub="Timeline and chapters will follow from your roadmap and AI planning."
          onEdit={() => onEditStep(3)}
        />
        <SummaryRow
          title="Learning formats"
          value={formatLabels.length ? formatLabels.join(" · ") : "—"}
          onEdit={() => onEditStep(4)}
        />
        <SummaryRow
          title="Extras"
          value={
            [
              topicsToFocus.length
                ? `Focus: ${topicsToFocus.join(", ")}`
                : null,
              topicsToAvoid.length
                ? `Avoid: ${topicsToAvoid.join(", ")}`
                : null,
              `Pace: ${pacingLabel}`,
            ]
              .filter(Boolean)
              .join(" · ") || "Defaults"
          }
          onEdit={() => onEditStep(5)}
        />
      </div>
    </motion.div>
  );
}

function SummaryRow({
  title,
  value,
  sub,
  onEdit,
}: {
  title: string;
  value: string;
  sub?: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex gap-4 border-b border-black/5 dark:border-white/10 dark:border-white/5 pb-4 last:border-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {title}
        </div>
        <p className="mt-1 text-nova-heading">{value}</p>
        {sub && <p className="mt-1 text-sm text-gray-400">{sub}</p>}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="shrink-0 gap-1 text-nova-body hover:text-primary"
        onClick={onEdit}
      >
        <FaPenToSquare className="h-3.5 w-3.5" />
        Edit
      </Button>
    </div>
  );
}
