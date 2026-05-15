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
  initialStep?: number;
  onProgressChange?: (hasProgress: boolean) => void;
};

export function CourseOnboardingAssistant({
  onGenerateRoadmap,
  loading,
  showLegacyButton,
  onLegacyGenerate,
  initialStep = 0,
  onProgressChange,
}: Props) {
  const { userInput, setUserInput } = useContext(UserInputContext);

  const [isClient, setIsClient] = useState(false);
  const [step, setStep] = useState(initialStep);
  const [intent, setIntent] = useState(userInput.intent || "");
  const [category, setCategory] = useState(userInput.category || "");
  const [goal, setGoal] = useState<LearningGoal>(userInput.goal || "hobby");
  const [goalCustomNote, setGoalCustomNote] = useState(userInput.goalCustomNote || "");
  const [level, setLevel] = useState<UserLearningProfileInput["currentLevel"] | "not_sure">(
    userInput.learningProfile?.currentLevel || "not_sure"
  );
  const [hoursPerDay, setHoursPerDay] = useState(userInput.learningProfile?.timePerDayHours || 1);
  const [featureCards, setFeatureCards] = useState<Set<FeatureKey>>(
    userInput.learningProfile?.featuresRequired 
      ? new Set(userInput.learningProfile.featuresRequired as FeatureKey[]) 
      : DEFAULT_FEATURES()
  );
  const [topicsToFocus, setTopicsToFocus] = useState<string[]>(userInput.learningProfile?.topicsToFocus || []);
  const [topicsToAvoid, setTopicsToAvoid] = useState<string[]>(userInput.learningProfile?.topicsToAvoid || []);
  const [pacingStyle, setPacingStyle] = useState<PacingStyle>(userInput.learningProfile?.pacingStyle || "balanced");

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
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          "nova_onboarding_progress",
          JSON.stringify({ step: step + 1, data: merged })
        );
      } catch (e) {
        console.error("Failed to save progress", e);
      }
    }
  }, [getMergedInput, setUserInput, step]);

  useEffect(() => {
    if (step > 0) {
      onProgressChange?.(true);
    } else {
      onProgressChange?.(intent.trim().length > 0);
    }
  }, [step, intent, onProgressChange]);

  useEffect(() => {
    setIsClient(true);
    
    // Always sync with userInput context on mount if we are returning from roadmap
    if (initialStep === 6) {
      if (userInput.intent) setIntent(userInput.intent);
      if (userInput.category) setCategory(userInput.category);
      if (userInput.goal) setGoal(userInput.goal);
      if (userInput.goalCustomNote) setGoalCustomNote(userInput.goalCustomNote);
      if (userInput.learningProfile?.currentLevel) setLevel(userInput.learningProfile.currentLevel);
      if (userInput.learningProfile?.timePerDayHours) setHoursPerDay(userInput.learningProfile.timePerDayHours);
      if (userInput.learningProfile?.featuresRequired) setFeatureCards(new Set(userInput.learningProfile.featuresRequired as FeatureKey[]));
      if (userInput.learningProfile?.topicsToFocus) setTopicsToFocus(userInput.learningProfile.topicsToFocus);
      if (userInput.learningProfile?.topicsToAvoid) setTopicsToAvoid(userInput.learningProfile.topicsToAvoid);
      if (userInput.learningProfile?.pacingStyle) setPacingStyle(userInput.learningProfile.pacingStyle);
    }
    
    // Restore from localStorage only on initial fresh start
    if (initialStep === 0 && typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem("nova_onboarding_progress");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed.step === "number") {
            setStep(parsed.step);
            setUserInput((prev) => ({ ...prev, ...parsed.data }));
            
            // Restore basic local states from parsed.data if needed, 
            // but usually userInput context holds it. For exact restoration:
            if (parsed.data.intent) setIntent(parsed.data.intent);
            if (parsed.data.category) setCategory(parsed.data.category);
            if (parsed.data.goal) setGoal(parsed.data.goal);
            if (parsed.data.level) setLevel(parsed.data.level);
            if (parsed.data.timePerDayHours) setHoursPerDay(parsed.data.timePerDayHours);
            if (parsed.data.featureCards) setFeatureCards(new Set(parsed.data.featureCards));
            if (parsed.data.topicsToFocus) setTopicsToFocus(parsed.data.topicsToFocus);
            if (parsed.data.topicsToAvoid) setTopicsToAvoid(parsed.data.topicsToAvoid);
            if (parsed.data.pacingStyle) setPacingStyle(parsed.data.pacingStyle);
          }
        }
      } catch (e) {
        console.error("Failed to restore progress", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStep, setUserInput]);

  useEffect(() => {
    if (step === 5 && topicsToFocus.length === 0 && intent.trim()) {
      const line = intent.split("\n")[0]?.trim();
      if (line) setTopicsToFocus([line.slice(0, 80)]);
    }
  }, [step, intent, topicsToFocus.length]);

  const allowNext = () => {
    switch (step) {
      case 0:
        return intent.trim().length > 0;
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

  if (!isClient) {
    return <div className="min-h-[58vh]" />; // Prevent hydration mismatch
  }

  return (
    <div className="mx-auto flex min-h-[58vh] w-full max-w-3xl flex-col">
      <header className="mb-8 text-center">
        <h1 className="text-balance text-3xl font-bold tracking-tight text-nova-heading sm:text-4xl">
          Create Your Personalized AI Course
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-base text-nova-body">
          Answer a few questions — we&apos;ll shape your roadmap and course structure for you.
        </p>
      </header>

      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Your AI learning assistant
          </p>
          <span className="text-xs tabular-nums text-nova-body">
            {step + 1} / {stepperOptions.length}
          </span>
        </div>
        <Progress value={progressValue} className="h-1.5 bg-gray-50" />
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
                    ? "bg-primary text-white"
                    : i < step
                      ? "bg-primary/30 text-primary"
                      : "bg-gray-50 text-gray-400"
                }`}
              >
                <opt.icon className="h-3.5 w-3.5" />
              </div>
              <span className="mt-1 hidden truncate text-[10px] text-gray-400 sm:block">
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
        className="mt-10 flex flex-col gap-3 border-t border-black/5 pt-8 sm:flex-row sm:items-center sm:justify-between"
      >
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={step === 0 || loading}
          className="border-black/10 bg-white/50 text-nova-heading"
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
              className="border-black/10 text-nova-body"
            >
              Legacy: one-shot layout
            </Button>
          )}

          {step < 6 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!allowNext() || loading}
              className="bg-primary text-white hover:bg-primary/90"
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="gap-2 bg-primary text-white hover:bg-primary/90"
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
