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

export async function generateChapterContentAction(
  courseId: string,
  courseName: string,
  chapterName: string,
  chapterIndex: number
) {
  try {
    const PROMPT = `You are an expert course content creator. Create comprehensive educational content for this chapter.

Chapter: "${chapterName}"
Course: "${courseName}"

Produce BOTH lesson sections AND reference sources in ONE response using the JSON schema from your system prompt.

Sections: 5–7 items. Each section:
- "title": short title
- "explanation": markdown string with ## headings, **bold**, lists, short paragraphs, optional blockquotes
- "code_examples": array of code objects OR empty [] for non-programming topics. For code topics include console.log / print for output.

Sources: 5–8 credible items with real https URLs (documentation, Wikipedia, official sites, reputable blogs).

Return JSON with keys "sections" and "sources" only.`;

    const query = `${courseName}:${chapterName}`;

    const resp = await getYoutubeVideos(query);
    let videoId = "";
    if (resp?.length > 0 && resp[0]?.id?.videoId) {
      videoId = resp[0].id.videoId;
    }

    console.log("📺 Video for chapter:", chapterName, videoId);

    const result = await retryWithBackoff(async () => {
      return await generateChapterContentBundle(PROMPT);
    });

    let normalizedContent: {
      title: string;
      explanation: string;
      code_examples: unknown[];
    }[] = [];
    let sources: { title: string; url: string; description: string }[] = [];

    try {
      const cleaned =
        result?.replace(/```json/g, "").replace(/```/g, "").trim() ?? "";
      const parsedUnknown = JSON.parse(cleaned);
      const bundleResult = chapterContentBundleSchema.safeParse(parsedUnknown);

      if (!bundleResult.success) {
        console.error(
          "❌ Chapter bundle validation failed:",
          bundleResult.error.flatten(),
          result
        );
        normalizedContent = [];
        sources = [];
      } else {
        const bundle = bundleResult.data;
        normalizedContent = bundle.sections.map((item) => ({
          title: item.title,
          explanation: item.explanation,
          code_examples: item.code_examples ?? [],
        }));
        sources = bundle.sources;
      }
    } catch (error) {
      console.error("❌ Chapter bundle parse failed:", error, result);
      normalizedContent = [];
      sources = [];
    }

    console.log(
      `✅ Chapter ${chapterIndex + 1} generated with ${normalizedContent.length} sections`
    );

    await db
      .insert(CourseChapters)
      .values({
        chapterId: chapterIndex,
        courseId: courseId,
        content: {
          content: normalizedContent,
        },
        videoId: videoId,
        sources: sources,
      })
      .onConflictDoUpdate({
        target: [CourseChapters.courseId, CourseChapters.chapterId],
        set: {
          content: { content: normalizedContent },
          videoId: videoId,
          sources: sources,
        },
      });

    return {
      success: true,
      videoId,
      hasContent: normalizedContent.length > 0,
      sourcesCount: sources.length,
    };
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error(
      `❌ Error generating chapter ${chapterIndex}:`,
      err.message || error
    );

    return {
      success: false,
      error: String(err.message || error),
    };
  }
}
