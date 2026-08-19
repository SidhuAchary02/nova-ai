"use server";

import { generateCourseLayout } from "@/configs/ai-models";

export async function generateCourseLayoutAction(prompt: string) {
  if (process.env.VERCEL === "1") {
    throw new Error("Legacy course layout generation is disabled in Vercel. Use the queue-backed workflow.");
  }

  const result = await generateCourseLayout(prompt);
  return result;
}