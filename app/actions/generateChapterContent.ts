"use server";

import { generateChapterContentBundle } from "@/configs/ai-models";
import { getYoutubeVideos } from "@/configs/service";
import { db } from "@/configs/db";
import { CourseChapters } from "@/schema/schema";
import { chapterContentBundleSchema } from "@/lib/validation/learningSchemas";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 2000
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;
      const err = error as { status?: number; message?: string };
      if (err.status === 429 || err.message?.includes("429")) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(
          `⏳ Rate limited. Retrying in ${delay / 1000} seconds... (Attempt ${i + 1}/${maxRetries})`
        );
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}

export async function generateSingleSubtopicLesson(
  courseName: string,
  chapterName: string,
  subtopicName: string
) {
  try {
    const PROMPT = `You are an elite instructional designer and senior technical educator. Create highly engaging, comprehensive educational content.

Chapter: "${chapterName}"
Course: "${courseName}"
Specific Subtopic to cover: "${subtopicName}"

**GOAL:**
Produce a deep, beginner-friendly but technically accurate lesson specifically for the subtopic: "${subtopicName}".

**REQUIREMENTS:**
1. Generate EXACTLY ONE section. The "title" MUST exactly match "${subtopicName}".
2. Follow the GOLD STANDARD pedagogy guidelines provided in your system instructions (overview, deep explanation, markdown tables, callouts, etc.).
3. If applicable, provide a "code_sandbox" object with language, initial_code, and solution.
4. Include a "mini_challenge" and a "summary_cheat_sheet".
5. Provide 2-3 highly credible sources for further reading.

**JSON OUTPUT FORMAT:**
Produce valid JSON strictly matching the shape:
{
  "sections": [
    { 
      "title": "${subtopicName}", 
      "lesson_plan_scratchpad": "string",
      "learning_overview": "string",
      "deep_explanation": "string (with rich markdown)",
      "code_sandbox": { "language": "string", "initial_code": "string", "solution": "string" },
      "mini_challenge": { "challenge": "string", "hint": "string" },
      "interview_relevance": "string",
      "summary_cheat_sheet": "string"
    }
  ],
  "sources": [
    { "title": "string", "url": "https://...", "description": "string" }
  ]
}`;

    const result = await retryWithBackoff(async () => {
      return await generateChapterContentBundle(PROMPT);
    });

    try {
      const cleaned = result?.replace(/```json/g, "").replace(/```/g, "").trim() ?? "";
      const parsedUnknown = JSON.parse(cleaned);
      const bundleResult = chapterContentBundleSchema.safeParse(parsedUnknown);

      if (!bundleResult.success) {
        console.error("❌ Lesson validation failed:", bundleResult.error.flatten(), result);
        return { success: false, error: "Validation failed" };
      }

      return {
        success: true,
        lesson: bundleResult.data.sections[0],
        sources: bundleResult.data.sources,
      };
    } catch (error) {
      console.error("❌ Lesson parse failed:", error, result);
      return { success: false, error: "Parse failed" };
    }
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error(`❌ Error generating lesson for ${subtopicName}:`, err.message || error);
    return { success: false, error: String(err.message || error) };
  }
}

export async function saveGroupedChapterLessons(
  courseId: string,
  courseName: string,
  chapterName: string,
  chapterIndex: number,
  lessons: any[],
  sources: any[]
) {
  try {
    const query = `${chapterName} tutorial ${courseName} practical example`;
    const resp = await getYoutubeVideos(query);
    let videoId = "";
    if (resp?.length > 0 && resp[0]?.id?.videoId) {
      videoId = resp[0].id.videoId;
    }

    console.log(`📺 Video for chapter ${chapterIndex}:`, chapterName, videoId);

    // Deduplicate sources by URL
    const uniqueSourcesMap = new Map();
    sources.forEach(s => uniqueSourcesMap.set(s.url, s));
    const uniqueSources = Array.from(uniqueSourcesMap.values());

    await db
      .insert(CourseChapters)
      .values({
        chapterId: chapterIndex,
        courseId: courseId,
        content: { content: lessons },
        videoId: videoId,
        sources: uniqueSources,
      })
      .onConflictDoUpdate({
        target: [CourseChapters.courseId, CourseChapters.chapterId],
        set: {
          content: { content: lessons },
          videoId: videoId,
          sources: uniqueSources,
        },
      });

    return { success: true, videoId };
  } catch (error) {
    console.error(`❌ Failed to save grouped lessons for chapter ${chapterIndex}`, error);
    return { success: false };
  }
}
