"use client";

import { motion } from "framer-motion";
import { FaWandMagicSparkles } from "react-icons/fa6";

type Props = {
  hoursPerDay: number;
  onHoursChange: (v: number) => void;
};

export function StepTimeCommitment({ hoursPerDay, onHoursChange }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="mx-auto w-full max-w-xl space-y-8"
    >
      <div className="flex items-center gap-2 text-primary">
        <FaWandMagicSparkles className="h-5 w-5" />
        <span className="text-sm font-medium tracking-wide">Step 4 of 7</span>
      </div>

      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-nova-heading sm:text-4xl">
          How many hours per day can you spend?
        </h2>
        <p className="mt-3 text-base text-nova-body">
          We&apos;ll design the optimal timeline for you.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-black/5 bg-nova-bg/50 p-6">
        <label className="text-sm font-medium text-nova-heading block text-center mb-6">
          Daily study time
        </label>
        
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => onHoursChange(Math.max(0.5, hoursPerDay - 0.5))}
            disabled={hoursPerDay <= 0.5}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-black/5 bg-gray-50 text-xl font-bold text-nova-heading transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            -
          </button>
          
          <div className="w-32 text-center flex flex-col items-center">
            <span className="text-4xl font-bold text-primary">
              {hoursPerDay}
            </span>
            <span className="text-sm font-medium text-nova-body mt-1">
              hrs / day
            </span>
          </div>

          <button
            type="button"
            onClick={() => onHoursChange(Math.min(8, hoursPerDay + 0.5))}
            disabled={hoursPerDay >= 8}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-black/5 bg-gray-50 text-xl font-bold text-nova-heading transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-nova-body">
        <span className="font-medium text-primary">Heads up:</span>{" "}
        We&apos;ll design the optimal timeline for you — course length and chapter count are set by the AI from your goals and roadmap.
      </div>
    </motion.div>
  );
}
