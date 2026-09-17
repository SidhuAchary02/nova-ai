import { generateGroqJsonObject } from "@/configs/ai-models";
import {
  AllGroqKeysExhaustedError,
  type LeasedGroqKey,
} from "@/lib/ai/groqKeyManager";

function hasMermaidBlock(content: string) {
  return /```mermaid\s+[\s\S]*?\b(flowchart|graph)\b[\s\S]*?```/i.test(content);
}

export async function generateChapterLessonsBatch(
  courseName: string,
  chapterName: string,
  subtopics: string[],
  leasedKey: LeasedGroqKey
) {
  try {
    const prompt = `Generate all lessons for one course chapter as a single JSON response.

Course: "${courseName}"
Chapter: "${chapterName}"
Subtopics, in required order:
${subtopics.map((subtopic, index) => `${index + 1}. ${subtopic}`).join("\n")}

Return exactly this shape:
{"lessons":[{"title":"exact subtopic name","content":"raw markdown lesson"}]}

Rules:
- Return exactly one lesson for every listed subtopic, in the same order.
- Each title must exactly match its subtopic.
- Each content value must be complete markdown, beginning with a # heading.
- Include explanations, examples, tables, and a concise summary.
- Include a Mermaid block using flowchart TD in every lesson.
- Do not use markdown fences around the JSON response.
- Do not include keys other than lessons, title, and content.`;

    const raw = await generateGroqJsonObject(
      "You are a course author producing structured lesson content.",
      prompt,
      0.65,
      "lesson",
      {
        leasedKey,
        estimatedTokens: Math.min(12000, Math.max(3500, subtopics.length * 1600)),
      }
    );
    const parsed = JSON.parse(raw) as {
      lessons?: Array<{ title?: unknown; content?: unknown }>;
    };

    const byTitle = new Map<string, { title: string; content: string }>();
    for (const lesson of parsed.lessons || []) {
      const title = typeof lesson.title === "string" ? lesson.title.trim() : "";
      let content = typeof lesson.content === "string" ? lesson.content.trim() : "";
      if (!title || content.length < 20) continue;

      if (!hasMermaidBlock(content)) {
        const safeTitle = title.replace(/[\[\]"]+/g, "").trim() || "Lesson topic";
        content += [
          "",
          "## Visual Overview",
          "",
          "```mermaid",
          "flowchart TD",
          `  A[${safeTitle}] --> B[Key idea]`,
          "  B --> C[Practical application]",
          "  C --> D[Review and next step]",
          "```",
          "",
        ].join("\n");
      }

      byTitle.set(title.toLowerCase(), { title, content });
    }

    const lessons = subtopics.map((subtopic) => byTitle.get(subtopic.trim().toLowerCase()));
    if (lessons.some((lesson) => !lesson)) {
      return {
        success: false as const,
        lessons: [],
        error: `Batch response contained ${lessons.filter(Boolean).length} of ${subtopics.length} requested lessons`,
      };
    }

    return { success: true as const, lessons: lessons as { title: string; content: string }[] };
  } catch (error: unknown) {
    if (error instanceof AllGroqKeysExhaustedError) throw error;
    return {
      success: false as const,
      lessons: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}