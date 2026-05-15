"use client";

import type { UserLearningProfileInput } from "@/types/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCircleQuestion,
  FaGraduationCap,
  FaWandMagicSparkles,
} from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const LEVELS: {
  id: UserLearningProfileInput["currentLevel"];
  label: string;
  hint: string;
}[] = [
  { id: "beginner", label: "Beginner", hint: "New to this area" },
  { id: "intermediate", label: "Intermediate", hint: "Some prior exposure" },
  { id: "advanced", label: "Advanced", hint: "Deepen expertise" },
];

const MOCK_QUESTIONS = [
  { q: "How familiar are you with core concepts in this field?", options: ["Just starting", "Comfortable basics", "Very confident"] },
  { q: "Have you built a project in this area before?", options: ["Not yet", "Small exercises", "Multiple projects"] },
  { q: "How often do you learn new tools in this space?", options: ["Rarely", "Sometimes", "Constantly"] },
  { q: "Do you read docs / official guides on your own?", options: ["Prefer guided", "Mix of both", "Mostly self-serve"] },
  { q: "How do you feel about debugging unfamiliar errors?", options: ["Need lots of help", "Usually figure it out", "Enjoy the chase"] },
];

type Props = {
  level: UserLearningProfileInput["currentLevel"] | "not_sure";
  onLevelChange: (v: UserLearningProfileInput["currentLevel"] | "not_sure") => void;
  onResolvedLevel: (v: UserLearningProfileInput["currentLevel"]) => void;
};

export function StepLevel({ level, onLevelChange, onResolvedLevel }: Props) {
  const [showAssessment, setShowAssessment] = useState(false);
  const [aq, setAq] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const startAssessment = () => {
    setShowAssessment(true);
    setAq(0);
    setAnswers([]);
  };

  const pickOption = (idx: number) => {
    const next = [...answers, idx];
    setAnswers(next);
    if (aq < MOCK_QUESTIONS.length - 1) {
      setAq(aq + 1);
    } else {
      const sum = next.reduce((a, b) => a + b, 0);
      const resolved: UserLearningProfileInput["currentLevel"] =
        sum <= 4 ? "beginner" : sum <= 7 ? "intermediate" : "advanced";
      onResolvedLevel(resolved);
      onLevelChange(resolved);
      setShowAssessment(false);
    }
  };

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
        <span className="text-sm font-medium tracking-wide">Step 3 of 7</span>
      </div>

      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-nova-heading sm:text-4xl">
          Where are you starting from?
        </h2>
        <p className="mt-3 text-base text-nova-body">
          Honest answers help us avoid content that&apos;s too easy or overwhelming.
        </p>
      </div>

      <div className="space-y-3">
        {LEVELS.map((L) => (
          <button
            key={L.id}
            type="button"
            onClick={() => onLevelChange(L.id)}
            className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all ${
              level === L.id
                ? "border-primary bg-primary/10"
                : "border-black/5 bg-white/50 hover:border-black/10"
            }`}
          >
            <div>
              <div className="font-semibold text-nova-heading">{L.label}</div>
              <div className="text-sm text-gray-400">{L.hint}</div>
            </div>
            <FaGraduationCap
              className={`h-6 w-6 shrink-0 ${level === L.id ? "text-primary" : "text-gray-400"}`}
            />
          </button>
        ))}

        <button
          type="button"
          onClick={() => onLevelChange("not_sure")}
          className={`flex w-full items-center gap-3 rounded-2xl border px-5 py-4 text-left transition-all ${
            level === "not_sure"
              ? "border-amber-400/50 bg-amber-500/10"
              : "border-black/5 bg-white/50 hover:border-black/10"
          }`}
        >
          <FaCircleQuestion className="h-6 w-6 text-amber-400" />
          <div>
            <div className="font-semibold text-nova-heading">
              Not sure{" "}
              <span className="ml-2 rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-normal text-amber-200">
                recommended
              </span>
            </div>
            <div className="text-sm text-gray-400">
              We&apos;ll suggest a quick check-in below — no grades, just a guide.
            </div>
          </div>
        </button>
      </div>

      <AnimatePresence>
        {level === "not_sure" && !showAssessment && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl border border-black/5 bg-nova-bg/60 p-5"
          >
            <p className="text-sm text-nova-body">
              Optional: take a quick 5-question check-in (UI preview — results stay on your device).
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-3 border-primary/40 text-nova-heading hover:bg-primary/10"
              onClick={startAssessment}
            >
              Take a quick 5-question assessment
            </Button>
            <p className="mt-2 text-xs text-gray-400">
              Or continue — we&apos;ll treat you as intermediate until you refine later.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAssessment && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-primary/30 bg-nova-bg/90 p-6"
          >
            <p className="text-xs font-medium text-primary">
              Question {aq + 1} / {MOCK_QUESTIONS.length}
            </p>
            <p className="mt-2 text-lg font-medium text-nova-heading">
              {MOCK_QUESTIONS[aq].q}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {MOCK_QUESTIONS[aq].options.map((opt, idx) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => pickOption(idx)}
                  className="rounded-xl border border-black/5 bg-white/80 px-4 py-3 text-left text-sm text-nova-heading hover:border-primary/40 hover:bg-gray-50"
                >
                  {opt}
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              className="mt-4 text-gray-400"
              onClick={() => setShowAssessment(false)}
            >
              Cancel check-in
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
