"use server";

import { generateGroqJsonObject, SYSTEM_PROMPTS } from "@/configs/ai-models";
import {
  learningStrategyOutputSchema,
  userLearningContextSchema,
  type LearningStrategyOutput,
} from "@/lib/validation/learningSchemas";
import type { UserInputType } from "@/types/types";
import { buildLearningContextFromInput } from "@/lib/learning/buildLearningContext";

export type GenerateLearningStrategyResult =
  | { success: true; strategy: LearningStrategyOutput }
  | { success: false; error: string };

/**
 * Step 2 of the pipeline: personalized roadmap + skill graph + timeline (no DB write).
 */
export async function generateLearningStrategyAction(
  userInput: UserInputType
): Promise<GenerateLearningStrategyResult> {
  try {
    const ctx = userLearningContextSchema.parse(
      buildLearningContextFromInput(userInput)
    );

    const userPrompt = `Topic / course title: ${userInput.topic ?? ""}
Category: ${userInput.category ?? ""}
Description: ${userInput.description ?? ""}
Legacy difficulty (hint): ${userInput.difficulty ?? "not specified"}
Planned course duration label: ${userInput.duration ?? "not specified"}
Target chapter count: ${userInput.totalChapters ?? "auto"}

Learner profile (structured):
- goal: ${ctx.goal}
- currentLevel: ${ctx.currentLevel}
- timePerDayHours: ${ctx.timePerDayHours}
- preferredLearningStyle: ${ctx.preferredLearningStyle}
- topicsToFocus: ${JSON.stringify(ctx.topicsToFocus)}
- featuresRequired: ${JSON.stringify(ctx.featuresRequired)}

Produce the roadmap JSON as specified in your system instructions.`;

    const raw = await generateGroqJsonObject(SYSTEM_PROMPTS.roadmap, userPrompt, 0.55);
    const parsed = JSON.parse(raw);
    const strategy = learningStrategyOutputSchema.parse(parsed);

    return { success: true, strategy };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("generateLearningStrategyAction:", msg);
    return { success: false, error: msg };
  }
}
