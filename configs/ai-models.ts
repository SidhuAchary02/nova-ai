import Groq from "groq-sdk";
import { BaseEnvironment } from "./BaseEnvironment";

const env = new BaseEnvironment();

const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
});

const MODEL = "llama-3.3-70b-versatile";

export async function generateCourseLayout(prompt: string) {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are an AI course generator. Always respond ONLY in valid JSON format.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return completion.choices[0].message.content;
}

export async function generateCourseChapters(prompt: string) {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content:
          "You are an AI tutor that explains programming concepts in JSON format with examples.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return completion.choices[0].message.content;
}