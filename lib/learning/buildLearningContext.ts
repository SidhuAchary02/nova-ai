import type { UserInputType, UserLearningProfileInput } from "@/types/types";

/**
 * Maps wizard state → validation payload for Zod (userLearningContextSchema).
 */
export function buildLearningContextFromInput(
  userInput: UserInputType
): Record<string, unknown> {
  const p = userInput.learningProfile;
  if (!p) {
    throw new Error("Learning profile is required");
  }

  return {
    goal: p.goal,
    currentLevel: p.currentLevel,
    timePerDayHours: p.timePerDayHours,
    preferredLearningStyle: p.preferredLearningStyle,
    topicsToFocus: p.topicsToFocus,
    topicsToAvoid: p.topicsToAvoid ?? userInput.topicsToAvoid ?? [],
    pacingStyle: p.pacingStyle ?? userInput.pacingStyle,
    goalCustomNote: userInput.goalCustomNote,
    featuresRequired: p.featuresRequired,
  };
}

export function hasCompleteLearningProfile(
  userInput: UserInputType
): userInput is UserInputType & { learningProfile: UserLearningProfileInput } {
  const lp = userInput.learningProfile;
  if (!lp) return false;
  return (
    !!lp.goal &&
    !!lp.currentLevel &&
    typeof lp.timePerDayHours === "number" &&
    !!lp.preferredLearningStyle &&
    Array.isArray(lp.topicsToFocus) &&
    lp.topicsToFocus.length > 0 &&
    Array.isArray(lp.featuresRequired) &&
    lp.featuresRequired.length > 0
  );
}
