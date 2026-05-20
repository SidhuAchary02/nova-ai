"use server";

import { generateGroqJsonObject } from "@/configs/ai-models";

type GenerateCourseTitleResult =
  | { success: true; title: string }
  | { success: false; error: string };

function sanitizeCourseTitle(value: string): string {
  const clean = value
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) return "";
  return clean.split(" ").slice(0, 7).join(" ");
}

export async function generateCourseTitleAction(input: {
  selectedTopic?: string;
  detailedPrompt?: string;
  fallbackTitle?: string;
}): Promise<GenerateCourseTitleResult> {
  try {
    const prompt = `Generate a short professional course title.

Rules:
- Output JSON only: { "title": "..." }
- 5 to 7 words maximum.
- No subtitle, punctuation, quotes, or marketing fluff.
- Preserve important technical meaning and acronyms.
- Do not use the detailed prompt as the title.

Selected topic: ${input.selectedTopic ?? ""}
Detailed prompt: ${input.detailedPrompt ?? ""}
Fallback title: ${input.fallbackTitle ?? ""}`;

    const raw = await generateGroqJsonObject(
      "You generate concise professional course titles and output only valid JSON.",
      prompt,
      0.25
    );
    const parsed = JSON.parse(raw) as { title?: unknown };
    const title = sanitizeCourseTitle(String(parsed.title ?? ""));

    if (!title) {
      return { success: false, error: "AI returned an empty title" };
    }

    return { success: true, title };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("generateCourseTitleAction:", message);
    return { success: false, error: message };
  }
}
