"use server";

import { generateGroqJsonObject, SYSTEM_PROMPTS } from "@/configs/ai-models";
import {
  courseStructureOutputSchema,
  normalizeCourseStructureForStorage,
  type CourseStructureOutput,
  type LearningStrategyOutput,
  userLearningContextSchema,
} from "@/lib/validation/learningSchemas";
import type { UserInputType } from "@/types/types";
import { buildLearningContextFromInput } from "@/lib/learning/buildLearningContext";

export type GenerateCourseStructureResult =
  | { success: true; courseOutput: Record<string, unknown> }
  | { success: false; error: string };

/**
 * After roadmap confirmation: produce chapter outline JSON compatible with parseCourseOutput.
 */
export async function generateCourseStructureAction(
  userInput: UserInputType,
  strategy: LearningStrategyOutput
): Promise<GenerateCourseStructureResult> {
  try {
    const ctx = userLearningContextSchema.parse(
      buildLearningContextFromInput(userInput)
    );

    const targetChapters = userInput.totalChapters;
    const chapterHint =
      typeof targetChapters === "number" && targetChapters > 0
        ? `You MUST output exactly ${targetChapters} chapters (no more, no less).`
        : "Choose an appropriate number of chapters (6–14) based on the roadmap depth.";

    const userPrompt = `Build the course STRUCTURE only (titles + short descriptions + duration labels). Do not write lesson prose.

Topic: ${userInput.topic ?? ""}
Category: ${userInput.category ?? ""}
Description: ${userInput.description ?? ""}
Video preference: ${userInput.video ?? "Yes"}
Learner context: ${JSON.stringify(ctx)}

Learning strategy (follow this order and emphasis):
${JSON.stringify(strategy, null, 2)}

${chapterHint}

Respond with JSON matching your system schema.`;

    const raw = await generateGroqJsonObject(
      SYSTEM_PROMPTS.courseStructure,
      userPrompt,
      0.55
    );

    const parsed = courseStructureOutputSchema.parse(JSON.parse(raw));

    let chapters = [...parsed.course.chapters];

    if (typeof targetChapters === "number" && targetChapters > 0) {
      if (chapters.length > targetChapters) {
        chapters = chapters.slice(0, targetChapters);
      } else if (chapters.length < targetChapters) {
        return {
          success: false,
          error: `AI returned ${chapters.length} chapters; expected ${targetChapters}. Retry or adjust settings.`,
        };
      }
    }

    const final: CourseStructureOutput = {
      course: {
        ...parsed.course,
        chapters,
      },
    };

    const courseOutput = normalizeCourseStructureForStorage(final);

    return { success: true, courseOutput };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("generateCourseStructureAction:", msg);
    return { success: false, error: msg };
  }
}
