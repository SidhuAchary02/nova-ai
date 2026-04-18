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
    const userPrompt = `You are an expert educator creating a quiz to test understanding of course content.

Course: "${courseName}"
Chapter: "${chapterName}"

Chapter Content:
${chapterContent}

Create exactly 5 multiple-choice questions to assess the student's understanding of this chapter content.

IMPORTANT:
1. Questions should be directly based on the chapter content
2. Make questions clear and specific
3. Create 4 options (A, B, C, D) for each question
4. Only one option should be correct
5. Include explanations for why the correct answer is right
6. Difficulty should be moderate (not too easy, not too hard)

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
