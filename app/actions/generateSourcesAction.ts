"use server";

import { db } from "@/configs/db";
import { CourseChapters } from "@/schema/schema";
import { eq } from "drizzle-orm";
import { generateCourseChapters } from "@/configs/ai-models";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 2000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      if (error.status === 429 || error.message?.includes("429")) {
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
  chapterId: number,
  chapterName: string,
  courseName: string
) {
  try {
    console.log(`🔄 Generating sources for chapter: ${chapterName}`);

    const SOURCES_PROMPT = `
You are a reliable source research assistant. Based on the following course chapter, provide 5-8 credible and relevant sources that would be helpful for learning about this topic.

Chapter: "${chapterName}"
Course: "${courseName}"

For each source, provide:
1. A title
2. A valid URL (must be a real, accessible website - no made-up URLs)
3. A brief description (1-2 sentences)

IMPORTANT GUIDELINES:
- Only include REAL, VERIFIABLE sources
- Include mix of: academic sources, official documentation, reputable educational platforms, industry websites
- URLs must be specific and valid (not just domain.com)
- For academic topics: Include Wikipedia, academic journals, or educational institutions
- For technical topics: Include official documentation, GitHub, Stack Overflow, Medium articles
- For business topics: Include industry publications, case studies, best practice guides
- Ensure all URLs start with http:// or https://
- Each source should be directly relevant to the chapter topic

Return ONLY valid JSON array with NO additional text:
[
  {
    "title": "Source Title",
    "url": "https://example.com/specific-path",
    "description": "Brief description of what this source offers"
  }
]

Generate the sources now:
`;

    const sourcesResult = await retryWithBackoff(async () => {
      return await generateCourseChapters(SOURCES_PROMPT);
    });

    const sourcesCleaned =
      sourcesResult
        ?.replace(/```json/g, "")
        ?.replace(/```/g, "")
        ?.trim() ?? "";

    const sourcesParsed = JSON.parse(sourcesCleaned);

    let sources: any[] = [];
    if (Array.isArray(sourcesParsed)) {
      sources = sourcesParsed.map((item: any) => ({
        title: item.title || "",
        url: item.url || "",
        description: item.description || "",
      }));
    }

    console.log(`📚 Generated ${sources.length} sources`);

    // Update the chapter with new sources
    await db
      .update(CourseChapters)
      .set({ sources })
      .where(eq(CourseChapters.id, chapterId));

    console.log(`✅ Sources saved for chapter ${chapterId}`);

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

export async function generateAllSourcesForCourseAction(courseId: string, courseName: string) {
  try {
    // Get all chapters for this course
    const chapters = await db
      .select()
      .from(CourseChapters)
      .where(eq(CourseChapters.courseId, courseId));

    console.log(`🚀 Generating sources for ${chapters.length} chapters`);

    const results = [];

    // Generate sources for each chapter with delay to avoid rate limits
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

      // Add delay between requests to avoid rate limiting
      if (i < chapters.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const successCount = results.filter(r => r.success).length;

    console.log(`\n🎉 Completed! Successfully generated sources for ${successCount}/${chapters.length} chapters`);

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
