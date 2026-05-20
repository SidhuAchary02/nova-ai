import type {
  LearningGoal,
  UserInputType,
  UserLearningProfileInput,
} from "@/types/types";
import { buildDetailedPrompt, generateCourseTitle } from "./course-prompt-utils";

export const ONBOARDING_STEP_LABELS = [
  "Intent",
  "Goal",
  "Level",
  "Time",
  "Style",
  "Extras",
  "Review",
] as const;

export type FeatureKey = "videos" | "reading" | "code_sandbox" | "quiz";

export const FEATURE_CARD_DEFS: {
  key: FeatureKey;
  label: string;
  helper: string;
  mapsTo: UserLearningProfileInput["featuresRequired"][number][];
}[] = [
  {
    key: "videos",
    label: "Video-based learning",
    helper: "Curated clips and visual walkthroughs",
    mapsTo: ["videos"],
  },
  {
    key: "reading",
    label: "Text explanations",
    helper: "Deep-dive write-ups and notes",
    mapsTo: ["reading", "sources"],
  },
  {
    key: "code_sandbox",
    label: "Hands-on coding",
    helper: "Practice in runnable examples",
    mapsTo: ["code_sandbox", "projects"],
  },
  {
    key: "quiz",
    label: "Quizzes & tests",
    helper: "Check understanding as you go",
    mapsTo: ["quiz"],
  },
];

export function deriveFeaturesFromCards(selected: Set<FeatureKey>): UserLearningProfileInput["featuresRequired"] {
  const out = new Set<UserLearningProfileInput["featuresRequired"][number]>();
  for (const def of FEATURE_CARD_DEFS) {
    if (selected.has(def.key)) {
      def.mapsTo.forEach((m) => out.add(m));
    }
  }
  if (out.size === 0) {
    FEATURE_CARD_DEFS.forEach((d) => d.mapsTo.forEach((m) => out.add(m)));
  }
  return Array.from(out);
}

export function derivePreferredLearningStyle(
  selected: Set<FeatureKey>
): UserLearningProfileInput["preferredLearningStyle"] {
  const v = selected.has("videos");
  const r = selected.has("reading");
  const c = selected.has("code_sandbox");
  const n = selected.size;
  if (n >= 3 || (v && r && c)) return "mixed";
  if (v && !r && !c) return "video";
  if (r && !v && !c) return "text";
  if (c && !v) return "hands-on";
  return "mixed";
}

export function pacingToDifficulty(pacing: "easy" | "balanced" | "fast"): string {
  if (pacing === "easy") return "Beginner";
  if (pacing === "fast") return "Advance";
  return "Intermediate";
}

/**
 * Merge onboarding draft into UserInputType.
 * Does not set `duration` or `totalChapters` — those are left to AI / downstream actions.
 */
export function buildFullUserInputFromOnboarding(
  base: UserInputType,
  draft: {
    category: string;
    intent: string;
    detailedPrompt: string;
    goal: LearningGoal;
    goalCustomNote: string;
    level: UserLearningProfileInput["currentLevel"];
    timePerDayHours: number;
    featureCards: Set<FeatureKey>;
    topicsToFocus: string[];
    topicsToAvoid: string[];
    pacingStyle: "easy" | "balanced" | "fast";
  }
): UserInputType {
  const intent = draft.intent.trim();
  const custom = draft.goalCustomNote.trim();
  const detailedPrompt = draft.detailedPrompt.trim() || buildDetailedPrompt(intent) || intent;
  const description = custom ? `${detailedPrompt}\n\nGoal note: ${custom}` : detailedPrompt;
  const courseTitle = generateCourseTitle(intent);

  const features = deriveFeaturesFromCards(draft.featureCards);
  const style = derivePreferredLearningStyle(draft.featureCards);

  const learningProfile: UserLearningProfileInput = {
    goal: draft.goal,
    currentLevel: draft.level,
    timePerDayHours: draft.timePerDayHours,
    preferredLearningStyle: style,
    topicsToFocus:
      draft.topicsToFocus.length > 0
        ? draft.topicsToFocus
        : intent
          ? [intent.slice(0, 80)]
          : ["General focus"],
    topicsToAvoid: draft.topicsToAvoid,
    pacingStyle: draft.pacingStyle,
    featuresRequired: features,
  };

  const restBase = { ...base };
  delete restBase.duration;
  delete restBase.totalChapters;

  return {
    ...restBase,
    intent,
    category: draft.category || "General",
    topic: courseTitle.slice(0, 200) || "My course",
    description: description.slice(0, 2000),
    detailedPrompt: detailedPrompt.slice(0, 2000),
    difficulty: pacingToDifficulty(draft.pacingStyle),
    video: draft.featureCards.has("videos") ? "Yes" : "No",
    learningProfile,
    topicsToAvoid: draft.topicsToAvoid.length ? draft.topicsToAvoid : undefined,
    pacingStyle: draft.pacingStyle,
    goalCustomNote: custom || undefined,
  };
}
