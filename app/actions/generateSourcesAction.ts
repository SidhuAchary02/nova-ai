"use server";

import { db } from "@/configs/db";
import { CourseChapters } from "@/schema/schema";
import { eq } from "drizzle-orm";
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
        console.log(`⏳ Rate limited. Retrying in ${delay / 1000} seconds...`);
        await sleep(delay);
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

export async function generateSourcesForChapterAction(
  courseId: string,
  dbRowId: number,
  chapterName: string,
  courseName: string
) {
  try {
    console.log(`🔄 Generating sources for chapter: ${chapterName}`);

    const SOURCES_PROMPT = `Based on the following course chapter, provide 5-8 credible and relevant sources.

Chapter: "${chapterName}"
Course: "${courseName}"

Guidelines:
- Only include REAL, VERIFIABLE sources
- Mix documentation, education sites, industry references as appropriate
- Each url must be https

Return JSON matching your system schema (root key "sources").`;

    const sourcesResult = await retryWithBackoff(async () => {
      return await generateSourcesJsonObject(SOURCES_PROMPT);
    });

    const parsed = sourceListOutputSchema.parse(JSON.parse(sourcesResult));
    const sources = parsed.sources;

    console.log(`📚 Generated ${sources.length} sources`);

    await db
      .update(CourseChapters)
      .set({ sources })
      .where(eq(CourseChapters.id, dbRowId));

    console.log(`✅ Sources saved for chapter row ${dbRowId}`);

    return {
      success: true,
      sourcesCount: sources.length,
      sources: sources,
    };
  } catch (error) {
    console.error("❌ Error generating sources:", error);
    return {
      success: false,
      error: String(error),
    };
  }
}

export async function generateAllSourcesForCourseAction(
  courseId: string,
  courseName: string
) {
  try {
    const chapters = await db
      .select()
      .from(CourseChapters)
      .where(eq(CourseChapters.courseId, courseId));

    console.log(`🚀 Generating sources for ${chapters.length} chapters`);

    const results = [];

    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      console.log(`\n📝 Chapter ${i + 1}/${chapters.length}: ID ${chapter.id}`);

      const result = await generateSourcesForChapterAction(
        courseId,
        chapter.id,
        `Chapter ${chapter.chapterId + 1}`,
        courseName
      );

      results.push(result);

      if (i < chapters.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    const successCount = results.filter((r) => r.success).length;

    console.log(
      `\n🎉 Completed! Successfully generated sources for ${successCount}/${chapters.length} chapters`
    );

    return {
      success: true,
      successCount,
      totalChapters: chapters.length,
      results,
    };
  } catch (error) {
    console.error("❌ Error generating all sources:", error);
    return {
      success: false,
      error: String(error),
    };
  }
}
