"use server";

import Groq from "groq-sdk";

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const generateQuizAction = async (
  chapterName: string,
  courseName: string,
  chapterContent: string
): Promise<QuizQuestion[]> => {
  try {
    const QUIZ_PROMPT = `
You are an expert educator creating a quiz to test understanding of course content.

Course: "${courseName}"
Chapter: "${chapterName}"

Chapter Content:
${chapterContent}

Create 5 multiple-choice questions to assess the student's understanding of this chapter content.

IMPORTANT:
1. Questions should be directly based on the chapter content
2. Make questions clear and specific
3. Create 4 options (A, B, C, D) for each question
4. Only one option should be correct
5. Include explanations for why the correct answer is right
6. Difficulty should be moderate (not too easy, not too hard)

Return ONLY valid JSON (no markdown, no text outside JSON):

[
 {
   "question": "What is the definition of X?",
   "options": ["Option A", "Option B", "Option C", "Option D"],
   "correctAnswer": 0,
   "explanation": "The correct answer is Option A because..."
 }
]

Create the quiz now:
`;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: QUIZ_PROMPT,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("Unexpected response type from Groq API");
    }

    // Parse the JSON response
    let jsonText = content.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    const quizData = JSON.parse(jsonText);
    
    if (!Array.isArray(quizData)) {
      throw new Error("Quiz data is not an array");
    }

    // Validate quiz questions
    const validatedQuestions: QuizQuestion[] = quizData.map((q: any) => ({
      question: q.question || "Question",
      options: Array.isArray(q.options) ? q.options : ["A", "B", "C", "D"],
      correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
      explanation: q.explanation || "No explanation provided",
    }));

    return validatedQuestions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error(`Failed to generate quiz: ${error}`);
  }
};
