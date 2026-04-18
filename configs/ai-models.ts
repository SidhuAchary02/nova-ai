import Groq from "groq-sdk/index.mjs";
import { BaseEnvironment } from "./BaseEnvironment";

const env = new BaseEnvironment();

const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
});

export const GROQ_MODEL = "llama-3.3-70b-versatile";

export const SYSTEM_PROMPTS = {
  roadmap: `You are a senior learning experience designer. You output ONLY valid JSON (no markdown fences, no prose outside JSON).
The JSON must match the user's requested schema with keys: phases, skillGraph, estimatedTimelineDays, estimatedDaysPerPhase, reasoning.
phases: array of { order (number), name (string), objectives (string[]) }.
skillGraph: array of { skill (string), order (number), dependsOn (optional string[]) } — total order of skills to master.
estimatedTimelineDays: positive number of calendar days to finish if the learner follows the plan.
estimatedDaysPerPhase: array of { phaseOrder (number), days (number) }.
reasoning: string explaining why this roadmap fits the learner profile and topic.`,

  courseStructure: `You are an AI course architect. Output ONLY valid JSON (no markdown).
The root object MUST be: { "course": { "details": { "topic", "description", "duration" }, "chapters": [ ... ] } }.
Each chapter: { "chapterName", "description", "duration" } where duration is a string (e.g. "45 min" or "1 hour").
Chapters must be non-empty, ordered, and aligned with the provided learning strategy phases and skills.`,

  chapterBundle: `You are an expert course author. Output ONLY valid JSON (no markdown).
Shape: { "sections": [ { "title", "explanation", "code_examples" } ], "sources": [ { "title", "url", "description" } ] }.
sections: 5–7 items; explanation uses markdown inside the string (headers, lists, bold) as specified in the user message.
code_examples: array (empty for non-programming topics).
sources: 5–8 items; every url MUST be https and plausible (prefer real documentation domains).`,

  quiz: `You are an assessment designer. Output ONLY valid JSON (no markdown).
Shape: { "questions": [ { "question", "options" (4 strings), "correctAnswer" (0-3), "explanation" } ] }.
Provide exactly 5 questions unless the user asks otherwise.`,

  sourcesOnly: `You are a research assistant. Output ONLY valid JSON (no markdown).
Root object MUST be: { "sources": [ { "title", "url" (https), "description" } ] } with 5–8 items.
Every url must start with https:// and be plausible real references.`,
} as const;

function stripJsonFences(text: string): string {
  let t = text.trim();
  if (t.startsWith("```json")) {
    t = t.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  } else if (t.startsWith("```")) {
    t = t.replace(/^```\n?/, "").replace(/\n?```$/, "");
  }
  return t.trim();
}

/**
 * Groq chat with JSON object mode — use for all structured outputs.
 */
export async function generateGroqJsonObject(
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.55
): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    temperature,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw || typeof raw !== "string") {
    throw new Error("Empty or invalid response from Groq");
  }
  return stripJsonFences(raw);
}

/** Course outline JSON — used by legacy create flow and generateCourseLayoutAction */
export async function generateCourseLayout(prompt: string) {
  return generateGroqJsonObject(
    "You are an AI course generator. Always respond ONLY in valid JSON format.",
    prompt,
    0.7
  );
}

/** Chapter body + sources in one structured call */
export async function generateChapterContentBundle(prompt: string) {
  return generateGroqJsonObject(SYSTEM_PROMPTS.chapterBundle, prompt, 0.65);
}

export async function generateQuizStructured(userPrompt: string) {
  return generateGroqJsonObject(SYSTEM_PROMPTS.quiz, userPrompt, 0.4);
}

/** Standalone sources list — JSON object root { sources } */
export async function generateSourcesJsonObject(userPrompt: string) {
  return generateGroqJsonObject(SYSTEM_PROMPTS.sourcesOnly, userPrompt, 0.55);
}
