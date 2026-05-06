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
        <h2 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          How many hours per day can you spend?
        </h2>
        <p className="mt-3 text-base text-slate-400">
          We&apos;ll design the optimal timeline for you.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/50 p-6">
        <label className="text-sm font-medium text-slate-200 block text-center mb-6">
          Daily study time
        </label>
        
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => onHoursChange(Math.max(0.5, hoursPerDay - 0.5))}
            disabled={hoursPerDay <= 0.5}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-slate-800 text-xl font-bold text-slate-200 transition-colors hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            -
          </button>
          
          <div className="w-32 text-center flex flex-col items-center">
            <span className="text-4xl font-bold text-primary">
              {hoursPerDay}
            </span>
            <span className="text-sm font-medium text-slate-400 mt-1">
              hrs / day
            </span>
          </div>

          <button
            type="button"
            onClick={() => onHoursChange(Math.min(8, hoursPerDay + 0.5))}
            disabled={hoursPerDay >= 8}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-slate-800 text-xl font-bold text-slate-200 transition-colors hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-slate-300">
        <span className="font-medium text-primary">Heads up:</span>{" "}
        We&apos;ll design the optimal timeline for you — course length and chapter count are set by the AI from your goals and roadmap.
      </div>
    </motion.div>
  );
}
