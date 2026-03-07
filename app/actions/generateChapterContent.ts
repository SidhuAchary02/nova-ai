"use server";

import { generateCourseChapters } from "@/configs/ai-models";
import { getYoutubeVideos } from "@/configs/service";
import { db } from "@/configs/db";
import { CourseChapters } from "@/schema/schema";

// Helper function to sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry logic with exponential backoff
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

      // Check if it's a rate limit error (429)
      if (error.status === 429 || error.message?.includes("429")) {
        const delay = initialDelay * Math.pow(2, i); // Exponential backoff
        console.log(`⏳ Rate limited. Retrying in ${delay / 1000} seconds... (Attempt ${i + 1}/${maxRetries})`);
        await sleep(delay);
        continue;
      }

      // If it's not a rate limit error, throw immediately
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

    const PROMPT = `
Explain the chapter "${chapterName}" for the course "${courseName}".

Return ONLY valid JSON in this format:

[
 {
   "title": "Section title",
   "explanation": "Detailed explanation of the concept",
   "code_examples": [
     {
       "code": "<precode>example code if applicable</precode>"
     }
   ]
 }
]

Do not include markdown or text outside JSON.
`;

    const query = `${courseName}:${chapterName}`;

    // Get YouTube video
    const resp = await getYoutubeVideos(query);

    let videoId = "";

    if (resp?.length > 0 && resp[0]?.id?.videoId) {
      videoId = resp[0].id.videoId;
    }

    console.log("📺 Video for chapter:", chapterName, videoId);

    // Generate AI content
    const result = await retryWithBackoff(async () => {
      return await generateCourseChapters(PROMPT);
    });

    let normalizedContent: any[] = [];

    try {

      const cleaned =
        result
          ?.replace(/```json/g, "")
          ?.replace(/```/g, "")
          ?.trim() ?? "";

      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed)) {

        normalizedContent = parsed.map((item: any) => ({
          title: item.title || item.Title || "",
          explanation: item.explanation || item.Explanation || "",
          code_examples:
            item.code_examples ||
            item["Code Examples"] ||
            [],
        }));

      } else {

        normalizedContent = [
          {
            title: parsed.title || parsed.Title || "",
            explanation:
              parsed.explanation || parsed.Explanation || "",
            code_examples:
              parsed.code_examples ||
              parsed["Code Examples"] ||
              [],
          },
        ];

      }

    } catch (error) {

      console.error("❌ AI JSON parse failed:", result);

      normalizedContent = [];

    }

    console.log(
      `✅ Chapter ${chapterIndex + 1} generated with ${normalizedContent.length} sections`
    );

    // Save to DB in ONE consistent structure
    await db.insert(CourseChapters).values({
      chapterId: chapterIndex,
      courseId: courseId,
      content: {
        content: normalizedContent
      },
      videoId: videoId,
    });

    return {
      success: true,
      videoId,
      hasContent: normalizedContent.length > 0,
    };

  } catch (error: any) {

    console.error(
      `❌ Error generating chapter ${chapterIndex}:`,
      error.message || error
    );

    return {
      success: false,
      error: String(error.message || error),
    };

  }
}
