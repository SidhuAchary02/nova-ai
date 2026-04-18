"use client";

import { UserInputContext } from "@/app/_context/UserInputContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type {
  LearningGoal,
  PacingStyle,
  UserInputType,
  UserLearningProfileInput,
} from "@/types/types";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { OnboardingSummary } from "./OnboardingSummary";
import {
  buildFullUserInputFromOnboarding,
  type FeatureKey,
} from "./onboarding-utils";
import { stepperOptions } from "../../_constants/stepperOptions";
import { StepAdvanced } from "./StepAdvanced";
import { StepGoal } from "./StepGoal";
import { StepIntent } from "./StepIntent";
import { StepLevel } from "./StepLevel";
import { StepPreferences } from "./StepPreferences";
import { StepTimeCommitment } from "./StepTimeCommitment";

const DEFAULT_FEATURES = (): Set<FeatureKey> =>
  new Set<FeatureKey>(["videos", "reading", "code_sandbox", "quiz"]);

type Props = {
  /** Receives freshly merged `UserInputType` so strategy generation never reads stale context. */
  onGenerateRoadmap: (input: UserInputType) => void;
  loading: boolean;
  showLegacyButton?: boolean;
  onLegacyGenerate?: (input: UserInputType) => void;
};

export function CourseOnboardingAssistant({
  onGenerateRoadmap,
  loading,
  showLegacyButton,
  onLegacyGenerate,
}: Props) {
  const { userInput, setUserInput } = useContext(UserInputContext);

  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState("");
  const [category, setCategory] = useState("");
  const [goal, setGoal] = useState<LearningGoal>("hobby");
  const [goalCustomNote, setGoalCustomNote] = useState("");
  const [level, setLevel] = useState<
    UserLearningProfileInput["currentLevel"] | "not_sure"
  >("not_sure");
  const [hoursPerDay, setHoursPerDay] = useState(1);
  const [featureCards, setFeatureCards] = useState<Set<FeatureKey>>(DEFAULT_FEATURES);
  const [topicsToFocus, setTopicsToFocus] = useState<string[]>([]);
  const [topicsToAvoid, setTopicsToAvoid] = useState<string[]>([]);
  const [pacingStyle, setPacingStyle] = useState<PacingStyle>("balanced");

  const progressValue = useMemo(
    () => Math.round(((step + 1) / stepperOptions.length) * 100),
    [step]
  );

  const getMergedInput = useCallback((): UserInputType => {
    const resolvedLevel: UserLearningProfileInput["currentLevel"] =
      level === "not_sure" ? "intermediate" : level;

    return buildFullUserInputFromOnboarding(userInput, {
      category: category || "General",
      intent: intent.trim(),
      goal,
      goalCustomNote,
      level: resolvedLevel,
      timePerDayHours: hoursPerDay,
      featureCards,
      topicsToFocus,
      topicsToAvoid,
      pacingStyle,
    });
  }, [
    userInput,
    category,
    intent,
    goal,
    goalCustomNote,
    level,
    hoursPerDay,
    featureCards,
    topicsToFocus,
    topicsToAvoid,
    pacingStyle,
  ]);

  const commitToContext = useCallback(() => {
    const merged = getMergedInput();
    setUserInput((prev) => ({ ...prev, ...merged }));
  }, [getMergedInput, setUserInput]);

  useEffect(() => {
    if (step === 5 && topicsToFocus.length === 0 && intent.trim()) {
      const line = intent.split("\n")[0]?.trim();
      if (line) setTopicsToFocus([line.slice(0, 80)]);
    }
  }, [step, intent, topicsToFocus.length]);

  const allowNext = () => {
    switch (step) {
      case 0:
        return intent.trim().length >= 8 && !!category;
      case 1:
        return !!goal;
      case 2:
        return level !== undefined;
      case 3:
        return hoursPerDay >= 0.5 && hoursPerDay <= 8;
      case 4:
        return featureCards.size >= 1;
      case 5:
      case 6:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 5) {
      commitToContext();
      setStep((s) => s + 1);
      return;
    }
    if (step === 5) {
      commitToContext();
      setStep(6);
    }
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const handleGenerate = () => {
    const merged = getMergedInput();
    setUserInput((prev) => ({ ...prev, ...merged }));
    onGenerateRoadmap(merged);
  };

  const toggleFeature = (key: FeatureKey) => {
    setFeatureCards((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size <= 1) return next;
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="mx-auto flex min-h-[58vh] w-full max-w-3xl flex-col">
      <header className="mb-8 text-center">
        <h1 className="text-balance text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
          Create Your Personalized AI Course
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-base text-slate-400">
          Answer a few questions — we&apos;ll shape your roadmap and course structure for you.
        </p>
      </header>

      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Your AI learning assistant
          </p>
          <span className="text-xs tabular-nums text-slate-400">
            {step + 1} / {stepperOptions.length}
          </span>
        </div>
        <Progress value={progressValue} className="h-1.5 bg-slate-800" />
        <div className="flex justify-between gap-1 overflow-x-auto pb-1">
          {stepperOptions.map((opt, i) => (
            <div
              key={opt.id}
              className={`flex min-w-0 flex-1 flex-col items-center ${
                i <= step ? "opacity-100" : "opacity-40"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs ${
                  i === step
                    ? "bg-primary text-slate-950"
                    : i < step
                      ? "bg-primary/30 text-primary"
                      : "bg-slate-800 text-slate-500"
                }`}
              >
                <opt.icon className="h-3.5 w-3.5" />
              </div>
              <span className="mt-1 hidden truncate text-[10px] text-slate-500 sm:block">
                {opt.shortLabel}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <StepIntent
              key="intent"
              intent={intent}
              category={category}
              onIntentChange={setIntent}
              onCategoryChange={setCategory}
            />
          )}
          {step === 1 && (
            <StepGoal
              key="goal"
              selected={goal}
              customNote={goalCustomNote}
              onSelect={setGoal}
              onCustomChange={setGoalCustomNote}
            />
          )}
          {step === 2 && (
            <StepLevel
              key="level"
              level={level}
              onLevelChange={setLevel}
              onResolvedLevel={(v) => setLevel(v)}
            />
          )}
          {step === 3 && (
            <StepTimeCommitment
              key="time"
              hoursPerDay={hoursPerDay}
              onHoursChange={setHoursPerDay}
            />
          )}
          {step === 4 && (
            <StepPreferences
              key="prefs"
              selected={featureCards}
              onToggle={toggleFeature}
            />
          )}
          {step === 5 && (
            <StepAdvanced
              key="advanced"
              topicsToFocus={topicsToFocus}
              topicsToAvoid={topicsToAvoid}
              pacingStyle={pacingStyle}
              onFocusTagsChange={setTopicsToFocus}
              onAvoidTagsChange={setTopicsToAvoid}
              onPacingChange={setPacingStyle}
            />
          )}
          {step === 6 && (
            <OnboardingSummary
              key="summary"
              intent={intent}
              category={category}
              goal={goal}
              goalCustomNote={goalCustomNote}
              level={level}
              hoursPerDay={hoursPerDay}
              featureCards={featureCards}
              topicsToFocus={topicsToFocus}
              topicsToAvoid={topicsToAvoid}
              pacingStyle={pacingStyle}
              onEditStep={setStep}
            />
          )}
        </AnimatePresence>
      </div>

      <motion.div
        initial={false}
        className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between"
      >
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={step === 0 || loading}
          className="border-white/20 bg-slate-900/50 text-slate-200"
        >
          Back
        </Button>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {showLegacyButton && step === 6 && onLegacyGenerate && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const merged = getMergedInput();
                setUserInput((prev) => ({ ...prev, ...merged }));
                onLegacyGenerate(merged);
              }}
              disabled={loading}
              className="border-white/20 text-slate-300"
            >
              Legacy: one-shot layout
            </Button>
          )}

          {step < 6 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!allowNext() || loading}
              className="bg-primary text-slate-950 hover:bg-primary/90"
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="gap-2 bg-primary text-slate-950 hover:bg-primary/90"
            >
              <FaWandMagicSparkles />
              Generate roadmap
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
