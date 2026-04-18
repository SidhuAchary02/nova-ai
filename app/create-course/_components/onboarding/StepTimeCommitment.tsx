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
        <label className="text-sm font-medium text-slate-200">
          Daily study time
        </label>
        <p className="text-xs text-slate-500">
          Drag to match a realistic window (0.5 – 8 hours).
        </p>
        <input
          type="range"
          min={0.5}
          max={8}
          step={0.5}
          value={hoursPerDay}
          onChange={(e) => onHoursChange(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-primary"
        />
        <div className="flex justify-between text-sm text-slate-400">
          <span>0.5h</span>
          <span className="text-lg font-semibold text-primary">
            {hoursPerDay} hrs / day
          </span>
          <span>8h</span>
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-slate-300">
        <span className="font-medium text-primary">Heads up:</span>{" "}
        We&apos;ll design the optimal timeline for you — course length and chapter count are set by the AI from your goals and roadmap.
      </div>
    </motion.div>
  );
}
