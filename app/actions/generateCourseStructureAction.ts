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
    if (process.env.VERCEL === "1") {
      return {
        success: false,
        error: "Legacy course structure generation is disabled in Vercel. Use the queue-backed workflow.",
      };
    }

    console.log("==> generateCourseStructureAction initiated");
    
    // Safely fallback fields
    const safeInput = {
      ...userInput,
      topic: userInput.topic || userInput.intent || "General Topic",
      category: userInput.category || "General",
    };

    console.log("==> Building learning context with safeInput");
    const ctx = userLearningContextSchema.parse(
      buildLearningContextFromInput(safeInput)
    );

    const targetChapters = userInput.totalChapters;
    const chapterHint =
      typeof targetChapters === "number" && targetChapters > 0
        ? `You MUST output exactly ${targetChapters} chapters (no more, no less).`
        : "Choose an appropriate number of chapters (6–14) based on the roadmap depth.";

    const courseBrief = userInput.detailedPrompt || userInput.description || userInput.intent || userInput.topic || "";
    const userPrompt = `Build the course STRUCTURE only (titles + short descriptions + duration labels + subtopics). Do not write lesson prose.
Make sure to include a 'subtopics' array (strings) for each chapter with 3-5 specific subtopics to cover.
Do NOT use generic subtopics like 'Key concepts' or 'Practical examples'. Use actual, specific technical concepts related to the chapter (e.g. 'useState Hook', 'Component Lifecycle').

Display course title: ${userInput.topic ?? ""}
Original topic selected by user: ${userInput.intent ?? ""}
Detailed course prompt / real generation brief: ${courseBrief}
Category: ${userInput.category ?? ""}
Description: ${userInput.description ?? ""}
Video preference: ${userInput.video ?? "Yes"}
Learner context: ${JSON.stringify(ctx)}

Learning strategy (follow this order and emphasis):
${JSON.stringify(strategy, null, 2)}

${chapterHint}

Use the detailed course prompt as the source of truth for topic scope and terminology. Use the display course title only as a short UI label.
Respond with JSON matching your system schema.`;

    console.log("==> Calling Groq API...");
    const raw = await generateGroqJsonObject(
      SYSTEM_PROMPTS.courseStructure,
      userPrompt,
      0.55
    );
    console.log("==> Groq API response received. Parsing JSON...");
    
    let parsedJson;
    try {
      parsedJson = JSON.parse(raw);
    } catch (err) {
      console.error("==> JSON Parse Failed. Raw string:", raw);
      throw new Error("Failed to parse AI JSON response.");
    }

    console.log("==> Validating with courseStructureOutputSchema...");
    let parsed;
    try {
      parsed = courseStructureOutputSchema.parse(parsedJson);
    } catch (err) {
      console.error("==> Schema Validation Failed:", JSON.stringify(err, null, 2));
      throw new Error("AI response did not match the expected course schema.");
    }

    let chapters = [...parsed.course.chapters];

    if (typeof targetChapters === "number" && targetChapters > 0) {
      if (chapters.length > targetChapters) {
        chapters = chapters.slice(0, targetChapters);
      }
      // If AI returns fewer chapters, we just accept them instead of failing
    }

    const final: CourseStructureOutput = {
      course: {
        ...parsed.course,
        chapters,
      },
    };

    const courseOutput = normalizeCourseStructureForStorage(final);
    
    console.log("==> Successfully built courseOutput. Saving...");
    return { success: true, courseOutput };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("generateCourseStructureAction:", msg);
    return { success: false, error: msg };
  }
}
