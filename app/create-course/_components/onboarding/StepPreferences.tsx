"use client";

import { motion } from "framer-motion";
import { FaCheck, FaWandMagicSparkles } from "react-icons/fa6";
import { FEATURE_CARD_DEFS, type FeatureKey } from "./onboarding-utils";

type Props = {
  selected: Set<FeatureKey>;
  onToggle: (key: FeatureKey) => void;
};

export function StepPreferences({ selected, onToggle }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="mx-auto w-full max-w-3xl space-y-8"
    >
      <div className="flex items-center gap-2 text-primary">
        <FaWandMagicSparkles className="h-5 w-5" />
        <span className="text-sm font-medium tracking-wide">Step 5 of 7</span>
      </div>

      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-nova-heading sm:text-4xl">
          How do you like to learn?
        </h2>
        <p className="mt-3 text-base text-nova-body">
          Pick everything that sounds good — we&apos;ll blend formats so it never feels one-note.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {FEATURE_CARD_DEFS.map((card) => {
          const on = selected.has(card.key);
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => onToggle(card.key)}
              className={`relative flex flex-col rounded-2xl border p-5 text-left transition-all ${
                on
                  ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                  : "border-black/5 bg-white/50 hover:border-black/10"
              }`}
            >
              {on && (
                <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
                  <FaCheck className="h-3.5 w-3.5" />
                </span>
              )}
              <span className="text-lg font-semibold text-nova-heading">{card.label}</span>
              <span className="mt-2 text-sm text-nova-body">{card.helper}</span>
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-400">
        Default: all selected — tap to narrow your mix.
      </p>
    </motion.div>
  );
}
