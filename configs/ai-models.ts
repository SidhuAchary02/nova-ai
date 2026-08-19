import Groq from "groq-sdk/index.mjs";
import {
  AllGroqKeysExhaustedError,
  classifyGroqError,
  getGroqKeyFailureStats,
  markLeasedKeyLimited,
  recordGroqKeyRequest,
  recordGroqKeyUsage,
  waitForGroqKeyBudget,
  withGroqApiKey,
  type LeasedGroqKey,
} from "@/lib/ai/groqKeyManager";

export const GROQ_MODELS = {
  heavy: "openai/gpt-oss-120b",
  lesson: "qwen/qwen3.6-27b",
  light: "openai/gpt-oss-20b",
} as const;

export const GROQ_MODEL = GROQ_MODELS.heavy;

export type GroqTaskClass = keyof typeof GROQ_MODELS;

function poolForTask(taskClass: GroqTaskClass) {
  return taskClass === "light" ? "light" : "heavy";
}

type GroqCallOptions = {
  leasedKey?: LeasedGroqKey;
  estimatedTokens?: number;
};

export const SYSTEM_PROMPTS = {
  roadmap: `You are a senior learning experience designer. You output ONLY valid JSON (no markdown fences, no prose outside JSON).
The JSON must match the user's requested schema with keys: phases, skillGraph, estimatedTimelineDays, estimatedDaysPerPhase, reasoning.
phases: array of { order (number), name (string), durationDays (number), objectives (string[]), chapters (array of { chapterName (string), durationDays (number), subtopics (string[]), subchapters (array of { title (string), durationDays (number), subtopics (string[]) }) }) }.
Provide a modular hierarchy for phases. Every phase MUST contain 'chapters'. Prefer more focused chapters over a few giant chapters. Every chapter/subchapter MUST contain only 3-4 specific subtopics maximum.
skillGraph: array of { skill (string), order (number), dependsOn (optional string[]) } — total order of skills to master.
estimatedTimelineDays: positive number of calendar days to finish if the learner follows the plan.
estimatedDaysPerPhase: array of { phaseOrder (number), days (number) }.
reasoning: string explaining why this roadmap fits the learner profile and topic.`,

  courseStructure: `You are an AI course architect. Output ONLY valid JSON (no markdown).
The root object MUST be: { "course": { "details": { "topic", "description", "duration" }, "chapters": [ ... ] } }.
Each chapter: { "chapterName", "description", "duration", "subtopics" } where duration is a string (e.g. "45 min" or "1 hour") and subtopics is an array of concrete lesson items.
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
  temperature = 0.55,
  taskClass: GroqTaskClass = "heavy",
  options: GroqCallOptions = {}
): Promise<string> {
  if (options.leasedKey) {
    const model = GROQ_MODELS[taskClass];
    const estimatedTokens = options.estimatedTokens || 2000;
    await waitForGroqKeyBudget(options.leasedKey, model, estimatedTokens);

    try {
      const client = new Groq({ apiKey: options.leasedKey.apiKey });
      const completion = await client.chat.completions.create({
        model,
        temperature,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      await recordGroqKeyRequest(
        options.leasedKey.keyId,
        completion.usage?.total_tokens,
        estimatedTokens
      );

      const raw = completion.choices[0]?.message?.content;
      if (!raw || typeof raw !== "string") {
        throw new Error("Empty or invalid response from Groq");
      }
      return stripJsonFences(raw);
    } catch (error) {
      if (error instanceof AllGroqKeysExhaustedError) throw error;

      const status = classifyGroqError(error);
      if (status) {
        await markLeasedKeyLimited(options.leasedKey, status);
        throw new AllGroqKeysExhaustedError(
          `Groq key ${options.leasedKey.keyId} hit ${status}`,
          await getGroqKeyFailureStats()
        );
      }
      throw error;
    }
  }

  const completion = await withGroqApiKey(poolForTask(taskClass), async (apiKey, keyId) => {
    const client = new Groq({ apiKey });
    const response = await client.chat.completions.create({
      model: GROQ_MODELS[taskClass],
      temperature,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    await recordGroqKeyUsage(keyId, response.usage?.total_tokens);
    return response;
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
  temperature = 0.65,
  taskClass: GroqTaskClass = "heavy",
  options: GroqCallOptions = {}
): Promise<string> {
  if (options.leasedKey) {
    const model = GROQ_MODELS[taskClass];
    const estimatedTokens = options.estimatedTokens || 2000;
    await waitForGroqKeyBudget(options.leasedKey, model, estimatedTokens);

    try {
      const client = new Groq({ apiKey: options.leasedKey.apiKey });
      const completion = await client.chat.completions.create({
        model,
        temperature,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      await recordGroqKeyRequest(
        options.leasedKey.keyId,
        completion.usage?.total_tokens,
        estimatedTokens
      );

      const raw = completion.choices[0]?.message?.content;
      if (!raw || typeof raw !== "string") {
        throw new Error("Empty or invalid response from Groq");
      }
      return raw.trim();
    } catch (error) {
      if (error instanceof AllGroqKeysExhaustedError) throw error;

      const status = classifyGroqError(error);
      if (status) {
        await markLeasedKeyLimited(options.leasedKey, status);
        throw new AllGroqKeysExhaustedError(
          `Groq key ${options.leasedKey.keyId} hit ${status}`,
          await getGroqKeyFailureStats()
        );
      }
      throw error;
    }
  }

  const completion = await withGroqApiKey(poolForTask(taskClass), async (apiKey, keyId) => {
    const client = new Groq({ apiKey });
    const response = await client.chat.completions.create({
      model: GROQ_MODELS[taskClass],
      temperature,
      // No response_format requirement - allows plain text/MDX output
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    await recordGroqKeyUsage(keyId, response.usage?.total_tokens);
    return response;
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
    0.7,
    "heavy"
  );
}

/** Chapter body + sources in one structured call */
export async function generateChapterContentBundle(prompt: string) {
  return generateGroqJsonObject(SYSTEM_PROMPTS.chapterBundle, prompt, 0.65, "lesson");
}

/** MDX chapter content — plain text markdown, no JSON */
export async function generateChapterContentMDX(prompt: string, options: GroqCallOptions = {}) {
  const systemPrompt = `You are a world-class course instructor. Your ONLY job is to output raw markdown text for course lessons.

ABSOLUTELY NO JSON. Do not wrap the entire answer in a markdown code fence.

Just pure markdown:
- Headings with #
- Paragraphs
- Lists
- Tables
- Blockquotes
- Inline code with single backticks
- Fenced code blocks with a language tag when an actual runnable example helps

Never output placeholder-only code blocks such as \`\`\`code\`\`\`, \`\`\`example\`\`\`, or a block containing only the word "code". If you use a code block, include real code.`;
  return generateGroqPlainText(systemPrompt, prompt, 0.65, "lesson", {
    ...options,
    estimatedTokens: options.estimatedTokens || 2200,
  });
}

export async function generateQuizStructured(userPrompt: string) {
  return generateGroqJsonObject(SYSTEM_PROMPTS.quiz, userPrompt, 0.4, "light");
}

/** Standalone sources list — JSON object root { sources } */
export async function generateSourcesJsonObject(userPrompt: string) {
  return generateGroqJsonObject(SYSTEM_PROMPTS.sourcesOnly, userPrompt, 0.55, "light");
}

/** Generates mermaid flowchart code for a given lesson topic */
export async function generateMermaidDiagram(
  prompt: string,
  options: GroqCallOptions = {}
): Promise<string> {
  const systemPrompt = `You are a technical diagram generator. Your ONLY job is to output valid Mermaid flowchart code.

RULES:
- Output ONLY the mermaid code block, nothing else
- Always start with: flowchart TD
- No explanation, no prose, no markdown outside the code block
- No backticks, no triple backticks, just raw mermaid syntax
- Keep it focused: 6-12 nodes maximum
- Use these node shapes correctly:
  - [Text] for process/rectangle
  - {Text} for decision/diamond  
  - ([Text]) for start/end rounded
  - [(Text)] for database
- Use --> for arrows
- Use -->|label| for labeled arrows`;

  return generateGroqPlainText(systemPrompt, prompt, 0.3, "lesson", {
    ...options,
    estimatedTokens: options.estimatedTokens || 700,
  });
}
