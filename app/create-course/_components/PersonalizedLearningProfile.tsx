"use client";

/**
 * Learning profile collection is now part of the unified onboarding assistant:
 * @see `./onboarding/CourseOnboardingAssistant.tsx` (steps 5–6: preferences + advanced).
 *
 * Re-export the advanced panel for reuse or Storybook-style isolation.
 */
export { StepAdvanced as AdvancedCustomizationPanel } from "./onboarding/StepAdvanced";

/** @deprecated Use `CourseOnboardingAssistant` instead. */
export default function PersonalizedLearningProfile() {
  return null;
}
