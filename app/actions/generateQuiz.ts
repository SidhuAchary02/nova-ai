"use server";

import { generateQuizStructured } from "@/configs/ai-models";
import { quizOutputSchema } from "@/lib/validation/learningSchemas";

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export const generateQuizAction = async (
  chapterName: string,
  courseName: string,
  chapterContent: string
): Promise<QuizQuestion[]> => {
  try {
    if (!chapterContent.trim()) {
      throw new Error("Chapter content is empty; cannot generate a quiz");
    }

    const compactChapterContent = chapterContent
      .replace(/```mermaid[\s\S]*?```/gi, "")
      .replace(/```[\s\S]*?```/g, "")
      .slice(0, 14000);

    const userPrompt = `Create a concise quiz from the chapter content below.

Course: "${courseName}"
Chapter: "${chapterName}"

Chapter Content:
${compactChapterContent}

Create exactly 5 multiple-choice questions to assess the student's understanding of this chapter content.

Rules:
- Questions must be directly based on the chapter content.
- Create 4 options and only one correct answer.
- Keep each explanation to one concise sentence.
- Use moderate difficulty.

Return JSON with a "questions" array of 5 objects with keys: question, options (4 strings), correctAnswer (0-3), explanation.`;

    const raw = await generateQuizStructured(userPrompt);
    const parsed = quizOutputSchema.parse(JSON.parse(raw));

    return parsed.questions.map((q) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    }));
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error(
      `Failed to generate quiz: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
