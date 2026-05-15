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
        <h2 className="text-3xl font-semibold tracking-tight text-nova-heading sm:text-4xl">
          Why are you learning this?
        </h2>
        <p className="mt-3 text-base text-nova-body">
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
                  ? "border-nova-primary bg-nova-primary/10 shadow-sm"
                  : "border-black/5 bg-white hover:border-black/10 hover:bg-gray-50"
              }`}
            >
              <Icon
                className={`mb-3 h-8 w-8 ${active ? "text-nova-primary" : "text-gray-400"}`}
              />
              <span className="text-lg font-bold text-nova-heading">{c.title}</span>
              <span className="mt-1 text-sm text-nova-body">{c.subtitle}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-dashed border-black/10 bg-nova-bg/40 p-5">
        <label className="text-sm font-medium text-nova-body">
          Something more specific? (optional)
        </label>
        <Input
          value={customNote}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder='e.g. "FAANG interviews" or "AWS Solutions Architect"'
          className="mt-2 h-11 border-black/10 bg-white/80 text-nova-heading"
        />
        <p className="mt-2 text-xs text-gray-400">
          We&apos;ll weave this into your course description for the AI.
        </p>
      </div>
    </motion.div>
  );
}
