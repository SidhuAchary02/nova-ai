"use server";

import { db } from "@/configs/db";
import { CourseChapters } from "@/schema/schema";
import { and, eq } from "drizzle-orm";
import { generateSourcesJsonObject } from "@/configs/ai-models";
import { sourceListOutputSchema } from "@/lib/validation/learningSchemas";

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
        await sleep(delay);
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

export async function quickAddSourcesForChapterAction(
  courseId: string,
  chapterIndex: number,
  chapterName: string,
  courseName: string
) {
  try {
    console.log(`🚀 QUICK: Adding sources to chapter: ${chapterName}`);

    const SOURCES_PROMPT = `Provide 5-8 credible academic and industry sources for learning about "${chapterName}" in the course "${courseName}".

Return JSON with root key "sources" only. Each item: title, url (https), description.`;

    const sourcesResult = await retryWithBackoff(async () => {
      return await generateSourcesJsonObject(SOURCES_PROMPT);
    });

    const parsed = sourceListOutputSchema.parse(JSON.parse(sourcesResult));

    let sources = parsed.sources
      .filter((item) => item.url && item.title)
      .map((item) => ({
        title: item.title.slice(0, 100),
        url: item.url.startsWith("http") ? item.url : `https://${item.url}`,
        description: item.description.slice(0, 200),
      }))
      .slice(0, 8);

    if (sources.length === 0) {
      throw new Error("No valid sources generated");
    }

    const chapter = await db
      .select()
      .from(CourseChapters)
      .where(
        and(
          eq(CourseChapters.courseId, courseId),
          eq(CourseChapters.chapterId, chapterIndex)
        )
      );

    if (!chapter[0]) {
      throw new Error("Chapter not found");
    }

    await db
      .update(CourseChapters)
      .set({ sources })
      .where(eq(CourseChapters.id, chapter[0].id));

    console.log(`✅ Added ${sources.length} sources to chapter`);

    return {
      success: true,
      sourcesCount: sources.length,
      sources,
    };
  } catch (error) {
    console.error("❌ Quick add sources error:", error);
    return {
      success: false,
      error: String(error),
    };
  }
}
