"use server";

import { generateGroqJsonObject } from "@/configs/ai-models";

type IntentAssistSuccess = {
  success: true;
  suggestions: string[];
  detailedPrompt: string;
};

type IntentAssistFailure = {
  success: false;
  error: string;
};

export type GenerateIntentAssistResult =
  | IntentAssistSuccess
  | IntentAssistFailure;

function cleanText(value: unknown): string {
  return String(value ?? "")
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueLimited(values: unknown[], limit: number): string[] {
  const seen = new Set<string>();
  const results: string[] = [];

  for (const value of values) {
    const clean = cleanText(value);
    if (!clean) continue;

    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(clean);

    if (results.length >= limit) break;
  }

  return results;
}

function trimPrompt(value: unknown): string {
  const clean = cleanText(value);
  if (!clean) return "";

  const words = clean.split(" ");
  if (words.length <= 70) return clean;
  return words.slice(0, 70).join(" ");
}

export async function generateIntentAssistAction(input: {
  query: string;
  selectedTopic?: string;
  category?: string;
}): Promise<GenerateIntentAssistResult> {
  const query = cleanText(input.query);
  const selectedTopic = cleanText(input.selectedTopic);
  const shouldGenerateDetailedPrompt = Boolean(selectedTopic);

  if (!query && !selectedTopic) {
    return { success: true, suggestions: [], detailedPrompt: "" };
  }

  try {
    const prompt = `You help users define an AI-generated course topic before roadmap generation.

Return ONLY valid JSON with this shape:
{
  "suggestions": ["...", "..."],
  "detailedPrompt": "..."
}

Rules:
- Use the user's words to infer the intended learning domain.
- Correct spelling and expand abbreviations when useful.
- If the input is ambiguous, prefer modern software/AI learning interpretations when terms like RAG, LLM, vector, model, AI, ML, NLP, agent, React, DSA, or system design appear.
- Suggestions must be clean course topic names, not sentences.
- Return 3 to 4 suggestions maximum.
- Only generate detailedPrompt when a selected topic is provided.
- If no selected topic is provided, detailedPrompt must be an empty string.
- When a selected topic is provided, the detailedPrompt must be one polished sentence starting with "Create a complete".
- When a selected topic is provided, the detailedPrompt must be specific enough to drive roadmap/course generation.
- When a selected topic is provided, mention important subtopics, tools, and practical project/deployment outcomes when relevant.
- Do not include markdown, numbering, quotes, or explanations outside JSON.

User typed: ${query}
Selected topic, if any: ${selectedTopic}
Category hint: ${input.category ?? ""}`;

    const raw = await generateGroqJsonObject(
      "You are an expert learning-product assistant for topic disambiguation and course prompt refinement. Output only valid JSON.",
      prompt,
      0.35,
      "light"
    );

    const parsed = JSON.parse(raw) as {
      suggestions?: unknown;
      detailedPrompt?: unknown;
    };

    return {
      success: true,
      suggestions: uniqueLimited(
        Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        4
      ),
      detailedPrompt: shouldGenerateDetailedPrompt
        ? trimPrompt(parsed.detailedPrompt)
        : "",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("generateIntentAssistAction:", message);
    return { success: false, error: message };
  }
}
