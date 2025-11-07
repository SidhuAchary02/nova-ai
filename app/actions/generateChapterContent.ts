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
        console.log(`⏳ Rate limited. Retrying in ${delay/1000} seconds... (Attempt ${i + 1}/${maxRetries})`);
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
    const PROMPT = `Explain the concepts in detail on Topic: ${courseName}, Chapter: ${chapterName}, in JSON Format with list of array with fields as Title, explanation of given chapter in detail, code examples (code field <precode> format) if applicable.`;

    const query = courseName + ":" + chapterName;

    // Fetch video ID
    const resp = await getYoutubeVideos(query);
    console.log("Videos for", chapterName, ":", resp);
    
    let videoId = "";
    if (resp && resp.length > 0 && resp[0]?.id?.videoId) {
      videoId = resp[0].id.videoId;
    } else {
      console.warn(`No video found for chapter: ${chapterName}`);
    }

    // Generate course content with retry logic
    const result = await retryWithBackoff(async () => {
      return await generateCourseChapters.sendMessage(PROMPT);
    });
    
    const content = JSON.parse(result?.response?.text()!);

    console.log(`Chapter ${chapterIndex} content generated successfully`);

    // Insert into the database
    await db.insert(CourseChapters).values({
      chapterId: chapterIndex,
      courseId: courseId,
      content: content,
      videoId: videoId,
    });
    
    console.log(`✅ Successfully saved chapter ${chapterIndex}: ${chapterName}`);
    return { success: true, videoId, hasContent: content.length > 0 };
  } catch (error: any) {
    console.error(`❌ Error in processing chapter ${chapterIndex}:`, error.message || error);
    return { success: false, error: String(error.message || error) };
  }
}
