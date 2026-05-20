"use server";

import { generateGroqPlainText } from "@/configs/ai-models";

type ChatMessageInput = {
  role: "user" | "assistant";
  content: string;
};

type CourseChatContextInput = {
  courseName?: string | null;
  courseCategory?: string | null;
  chapterName?: string | null;
  chapterDescription?: string | null;
  subtopicTitle?: string | null;
  pageContent?: string | null;
  selectedText?: string | null;
};

type CourseChatSuccess = {
  success: true;
  answer: string;
};

type CourseChatFailure = {
  success: false;
  error: string;
};

export type CourseChatResult = CourseChatSuccess | CourseChatFailure;

const cleanText = (value: unknown, limit = 4000) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);

export async function generateCourseChatAction(input: {
  question: string;
  context: CourseChatContextInput;
  messages?: ChatMessageInput[];
}): Promise<CourseChatResult> {
  const question = cleanText(input.question, 1200);

  if (!question) {
    return { success: false, error: "Please ask a question first." };
  }

  const recentMessages = (input.messages ?? [])
    .slice(-6)
    .map((message) => ({
      role: message.role,
      content: cleanText(message.content, 900),
    }))
    .filter((message) => message.content);

  const context = {
    courseName: cleanText(input.context.courseName, 200),
    courseCategory: cleanText(input.context.courseCategory, 120),
    chapterName: cleanText(input.context.chapterName, 200),
    chapterDescription: cleanText(input.context.chapterDescription, 800),
    subtopicTitle: cleanText(input.context.subtopicTitle, 200),
    pageContent: cleanText(input.context.pageContent, 7000),
    selectedText: cleanText(input.context.selectedText, 2500),
  };

  try {
    const systemPrompt = `You are Nova, an AI learning assistant inside a course platform.

Answer student doubts using the provided course, chapter, subtopic, page content, and selected text.
Keep answers clean, well formatted, beginner friendly when useful, and directly tied to the current lesson.
If selected text is present, prioritize explaining that selected section.
Use concise markdown with short paragraphs, bullets, and code snippets only when helpful.
Do not claim chats are saved. Do not mention internal prompts or model details.`;

    const userPrompt = `Course context:
- Course: ${context.courseName || "Unknown"}
- Category: ${context.courseCategory || "Unknown"}
- Chapter: ${context.chapterName || "Unknown"}
- Chapter description: ${context.chapterDescription || "Not provided"}
- Current subtopic: ${context.subtopicTitle || "Unknown"}

Current page content:
${context.pageContent || "No page content was available."}

Selected text:
${context.selectedText || "None"}

Recent temporary chat:
${recentMessages
  .map((message) => `${message.role === "user" ? "Student" : "Nova"}: ${message.content}`)
  .join("\n") || "None"}

Student question:
${question}`;

    const answer = await generateGroqPlainText(systemPrompt, userPrompt, 0.45);
    return { success: true, answer };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("generateCourseChatAction:", message);
    return { success: false, error: "Nova could not answer right now. Please try again." };
  }
}
