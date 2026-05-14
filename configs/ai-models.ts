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
phases: array of { order (number), name (string), durationDays (number), objectives (string[]), chapters (array of { chapterName (string), durationDays (number), subtopics (string[]) }) }.
Provide a deeply structured hierarchy for phases. Every phase MUST contain 'chapters', and every chapter MUST contain actual 'subtopics' representing the specific technical topics to be learned.
skillGraph: array of { skill (string), order (number), dependsOn (optional string[]) } — total order of skills to master.
estimatedTimelineDays: positive number of calendar days to finish if the learner follows the plan.
estimatedDaysPerPhase: array of { phaseOrder (number), days (number) }.
reasoning: string explaining why this roadmap fits the learner profile and topic.`,

  courseStructure: `You are an AI course architect. Output ONLY valid JSON (no markdown).
The root object MUST be: { "course": { "details": { "topic", "description", "duration" }, "chapters": [ ... ] } }.
Each chapter: { "chapterName", "description", "duration" } where duration is a string (e.g. "45 min" or "1 hour").
Chapters must be non-empty, ordered, and aligned with the provided learning strategy phases and skills.`,

  chapterBundle: `You are an elite course author from a premium platform like Educative.io or Frontend Masters. Output ONLY valid JSON (no markdown fences).
Shape: { "sections": [ { "title", "lesson_plan_scratchpad", "learning_overview", "deep_explanation", "code_sandbox": { "language", "initial_code", "solution" }, "mini_challenge": { "challenge", "hint" }, "interview_relevance", "summary_cheat_sheet" } ], "sources": [ { "title", "url", "description" } ] }.

**PEDAGOGY GUIDELINES (GOLD STANDARD):**
1. **learning_overview**: A 2-sentence hook explaining why this subtopic matters.
2. **deep_explanation**: This is the core lesson. MUST be rich markdown. You MUST include at least one Markdown Table (e.g., comparing approaches) or ASCII Diagram. Use blockquotes for Callouts: "> 💡 **Tip:**" or "> ⚠️ **Warning:**" or "> 🎯 **Core Concept:**". Break down complex topics with real-world analogies.
3. **code_sandbox**: Provide starting code that the user can run and tweak. If non-technical, omit this field entirely.
4. **mini_challenge**: A quick mental check or small coding task to verify understanding.
5. **interview_relevance**: Explain how this topic appears in job interviews.
6. **summary_cheat_sheet**: A bulleted list of 3-5 core takeaways.

Generate EXACTLY ONE section per requested subtopic. The "title" of each section must match the subtopic precisely. Provide 5-8 highly credible sources for further reading.`,

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

/**
 * Groq chat for plain text/MDX — no JSON format requirement
 */
export async function generateGroqPlainText(
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.65
): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    temperature,
    // No response_format requirement - allows plain text/MDX output
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw || typeof raw !== "string") {
    throw new Error("Empty or invalid response from Groq");
  }
  return raw.trim();
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

/** MDX chapter content — plain text markdown, no JSON */
export async function generateChapterContentMDX(prompt: string) {
  const systemPrompt = `You are a world-class course instructor. Your ONLY job is to output raw markdown text for course lessons.

ABSOLUTELY NO JSON. NO CURLY BRACES. NO STRUCTURE MARKERS.

Just pure markdown:
- Headings with #
- Paragraphs
- Lists
- Tables
- Blockquotes
- Code with backticks

Nothing else. Not even code fences with triple backticks unless it's for a code example inside the lesson.`;
  return generateGroqPlainText(systemPrompt, prompt, 0.65);
}

export async function generateQuizStructured(userPrompt: string) {
  return generateGroqJsonObject(SYSTEM_PROMPTS.quiz, userPrompt, 0.4);
}

/** Standalone sources list — JSON object root { sources } */
export async function generateSourcesJsonObject(userPrompt: string) {
  return generateGroqJsonObject(SYSTEM_PROMPTS.sourcesOnly, userPrompt, 0.55);
}
