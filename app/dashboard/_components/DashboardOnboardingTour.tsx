"use client";

import { supabase } from "@/configs/supabase";
import React, { useEffect, useMemo, useState } from "react";

type TourStep = {
  target: string;
  title: string;
  body: string;
  fallbackTarget?: string;
};

type RectState = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const TOUR_VERSION = "v1";

const steps: TourStep[] = [
  {
    target: "create-course",
    title: "Create New Course",
    body: "From here you can generate personalized roadmaps and complete AI-powered courses.",
  },
  {
    target: "my-courses",
    title: "My AI Courses",
    body: "Here you can access and continue all courses you created.",
  },
  {
    target: "explore",
    fallbackTarget: "marketplace-courses",
    title: "Explore Courses",
    body: "Explore courses published by other users and add them to your dashboard. Marketplace courses appear under 'Courses From Marketplace' on your dashboard.",
  },
  {
    target: "contact",
    title: "Contact Support",
    body: "Reach out to us anytime for support, feedback, or queries.",
  },
];

const getStorageKey = (userKey: string) =>
  `nova_dashboard_onboarding_${TOUR_VERSION}_${userKey}`;

const getTargetElement = (step: TourStep) => {
  const primary = document.querySelector<HTMLElement>(
    `[data-dashboard-tour="${step.target}"]`
  );
  if (primary) return primary;

  if (!step.fallbackTarget) return null;
  return document.querySelector<HTMLElement>(
    `[data-dashboard-tour="${step.fallbackTarget}"]`
  );
};

export default function DashboardOnboardingTour() {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<RectState | null>(null);
  const [storageKey, setStorageKey] = useState<string | null>(null);

  const activeStep = steps[stepIndex];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const userKey =
        data.user?.id ||
        data.user?.email?.trim().toLowerCase() ||
        "anonymous";
      const key = getStorageKey(userKey);
      setStorageKey(key);
      setVisible(window.localStorage.getItem(key) !== "completed");
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready || !visible) return;

    const updateTarget = (shouldScroll = false) => {
      const target = getTargetElement(activeStep);
      if (!target) {
        setTargetRect(null);
        return;
      }

      if (shouldScroll) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }

      window.setTimeout(() => {
        const rect = target.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }, 220);
    };

    updateTarget(true);
    const refreshTarget = () => updateTarget(false);
    window.addEventListener("resize", refreshTarget);
    window.addEventListener("scroll", refreshTarget, true);

    return () => {
      window.removeEventListener("resize", refreshTarget);
      window.removeEventListener("scroll", refreshTarget, true);
    };
  }, [activeStep, ready, visible]);

  const popoverStyle = useMemo<React.CSSProperties>(() => {
    if (!targetRect) {
      return {
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const gap = 18;
    const width = 340;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const preferRight = targetRect.left + targetRect.width + gap + width < viewportWidth;
    const left = preferRight
      ? targetRect.left + targetRect.width + gap
      : Math.max(16, Math.min(targetRect.left, viewportWidth - width - 16));

    const below = targetRect.top + targetRect.height + gap;
    const top =
      below + 220 < viewportHeight
        ? below
        : Math.max(16, targetRect.top - 220 - gap);

    return {
      left,
      top,
      width,
    };
  }, [targetRect]);

  const finishTour = () => {
    if (storageKey) {
      window.localStorage.setItem(storageKey, "completed");
    }
    setVisible(false);
  };

  if (!ready || !visible) return null;

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[80] pointer-events-none">
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />

      {targetRect && (
        <div
          className="absolute rounded-3xl border-2 border-nova-primary bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.35),0_0_0_8px_rgba(249,115,22,0.18),0_18px_50px_rgba(0,0,0,0.22)] transition-all duration-300"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      <div
        className="pointer-events-auto absolute rounded-2xl border border-black/5 bg-nova-card p-5 shadow-2xl dark:border-white/10"
        style={popoverStyle}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-nova-primary">
              Dashboard tour
            </p>
            <h3 className="mt-1 text-lg font-bold text-nova-heading">
              {activeStep.title}
            </h3>
          </div>
          <span className="rounded-full bg-nova-bg px-2.5 py-1 text-xs font-semibold text-nova-body">
            {stepIndex + 1}/{steps.length}
          </span>
        </div>

        <p className="text-sm leading-6 text-nova-body">{activeStep.body}</p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={finishTour}
            className="text-sm font-medium text-nova-body transition-colors hover:text-nova-heading"
          >
            Skip
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
              disabled={isFirst}
              className="rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold text-nova-heading transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/10"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                if (isLast) {
                  finishTour();
                } else {
                  setStepIndex((index) => index + 1);
                }
              }}
              className="rounded-xl bg-nova-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-nova-primary/90"
            >
              {isLast ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
