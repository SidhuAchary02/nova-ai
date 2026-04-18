"use client";

import type { LearningGoal } from "@/types/types";
import { motion } from "framer-motion";
import {
  FaBriefcase,
  FaFlask,
  FaLightbulb,
  FaRocket,
  FaWandMagicSparkles,
} from "react-icons/fa6";
import { IconType } from "react-icons";
import { Input } from "@/components/ui/input";

const CARDS: {
  goal: LearningGoal;
  title: string;
  subtitle: string;
  icon: IconType;
}[] = [
  {
    goal: "job",
    title: "Get a job",
    subtitle: "Interview-ready skills & portfolio",
    icon: FaBriefcase,
  },
  {
    goal: "exam",
    title: "Crack an exam",
    subtitle: "Certifications & entrance prep",
    icon: FaFlask,
  },
  {
    goal: "project",
    title: "Build a project",
    subtitle: "Ship something real",
    icon: FaRocket,
  },
  {
    goal: "hobby",
    title: "Just exploring",
    subtitle: "Curiosity-led learning",
    icon: FaLightbulb,
  },
];

type Props = {
  selected: LearningGoal;
  customNote: string;
  onSelect: (g: LearningGoal) => void;
  onCustomChange: (v: string) => void;
};

export function StepGoal({ selected, customNote, onSelect, onCustomChange }: Props) {
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
        <span className="text-sm font-medium tracking-wide">Step 2 of 7</span>
      </div>

      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          Why are you learning this?
        </h2>
        <p className="mt-3 text-base text-slate-400">
          This helps us prioritize depth, pace, and what to emphasize in your roadmap.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {CARDS.map((c) => {
          const Icon = c.icon;
          const active = selected === c.goal;
          return (
            <button
              key={c.goal}
              type="button"
              onClick={() => onSelect(c.goal)}
              className={`flex flex-col items-start rounded-2xl border p-5 text-left transition-all ${
                active
                  ? "border-primary bg-gradient-to-br from-primary/20 via-slate-900/80 to-slate-950 shadow-[0_0_32px_rgba(250,204,21,0.08)]"
                  : "border-white/10 bg-slate-900/50 hover:border-white/20 hover:bg-slate-900/70"
              }`}
            >
              <Icon
                className={`mb-3 h-8 w-8 ${active ? "text-primary" : "text-slate-500"}`}
              />
              <span className="text-lg font-semibold text-slate-100">{c.title}</span>
              <span className="mt-1 text-sm text-slate-400">{c.subtitle}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/40 p-5">
        <label className="text-sm font-medium text-slate-300">
          Something more specific? (optional)
        </label>
        <Input
          value={customNote}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder='e.g. "FAANG interviews" or "AWS Solutions Architect"'
          className="mt-2 h-11 border-white/15 bg-slate-900/80 text-slate-100"
        />
        <p className="mt-2 text-xs text-slate-500">
          We&apos;ll weave this into your course description for the AI.
        </p>
      </div>
    </motion.div>
  );
}
