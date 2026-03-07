"use server";

import { generateCourseLayout } from "@/configs/ai-models";

export async function generateCourseLayoutAction(prompt: string) {
  const result = await generateCourseLayout(prompt);
  return result;
}