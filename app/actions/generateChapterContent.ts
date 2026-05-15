"use server";

import { generateChapterContentMDX } from "@/configs/ai-models";
import { getYoutubeVideos } from "@/configs/service";
import { db } from "@/configs/db";
import { CourseChapters, CourseList } from "@/schema/schema";
import { chapterContentBundleSchema } from "@/lib/validation/learningSchemas";
import { eq } from "drizzle-orm";
import { generateQuizAction } from "@/app/actions/generateQuiz";

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
    const PROMPT = `You are teaching a course. Generate lesson content as pure markdown.

Topic: "${subtopicName}"

OUTPUT ONLY RAW MARKDOWN. ABSOLUTELY NO JSON. NO CODE BLOCKS. NO BACKTICKS. JUST PLAIN MARKDOWN TEXT.

Start with a heading:
# ${subtopicName}

Then write the complete lesson using:
- ## for major sections
- ### for subsections  
- Regular paragraphs for explanation
- Markdown tables for comparisons
- \`code\` for inline code (no language specified)
- Bullet lists with - 
- Numbered lists with 1. 2. 3.
- > for blockquotes and callouts

Write a complete, detailed, professional course lesson. Include overview, concepts, examples, and summary.

CRITICAL: Output ONLY markdown text. Do NOT output JSON. Do NOT output any { or } or any structured format. Just markdown.`;

    const result = await retryWithBackoff(async () => {
      return await generateChapterContentMDX(PROMPT);
    });

    try {
      // MDX content from AI is raw markdown/MDX text
      let mdxContent = result?.trim() ?? "";
      
      // Safety check: if JSON was returned instead of markdown, try to extract content
      if (mdxContent.startsWith("{")) {
        try {
          const parsed = JSON.parse(mdxContent);
          // If it's the old structure with sections
          if (parsed.sections && Array.isArray(parsed.sections) && parsed.sections[0]) {
            mdxContent = parsed.sections[0].deep_explanation || mdxContent;
          }
          // If it has a content field
          else if (parsed.content && typeof parsed.content === "string") {
            mdxContent = parsed.content;
          }
        } catch {
          // If JSON parse fails, use the original response
        }
      }
      
      // Basic validation: should have some content
      if (!mdxContent || mdxContent.length < 20) {
        console.error("❌ MDX content too short or empty:", mdxContent);
        return { success: false, error: "Content generation failed" };
      }

      return {
        success: true,
        lesson: {
          title: subtopicName,
          content: mdxContent,
        },
      };
    } catch (error) {
      console.error("❌ MDX processing failed:", error, result);
      return { success: false, error: "Processing failed" };
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
  lessons: any[]
) {
  try {
    const query = `${chapterName} tutorial ${courseName} practical example`;
    const resp = await getYoutubeVideos(query);
    const videoId = resp?.id?.videoId ?? "";

    // Determine user learning goal for this course (if available)
    let learningGoal: string | null = null;
    try {
      const rows = await db
        .select({ learningGoal: CourseList.learningGoal })
        .from(CourseList)
        .where(eq(CourseList.courseId, courseId));
      learningGoal = rows[0]?.learningGoal ?? null;
    } catch (e) {
      console.warn("Could not load course learningGoal:", e);
    }

    // Normalize goal for checks
    const goalNorm = (learningGoal || "").toLowerCase();

    // Optionally inject a quiz block for goals like 'get a job' or 'crack an exam'
    const shouldAddQuiz = /job|interview|exam|cert/i.test(goalNorm);
    const shouldAddPractice = /build|project/i.test(goalNorm);

    // Helper: combine lesson markdown into plain text for quiz generation
    const lessonText = lessons
      .map((l: any) => {
        if (typeof l === "string") return l;
        if (typeof l === "object") return (l.title || "") + "\n" + (l.content || "");
        return String(l);
      })
      .join("\n\n");

    if (shouldAddQuiz) {
      try {
        const questions = await generateQuizAction(chapterName, courseName, lessonText.slice(0, 3000));
        if (questions && questions.length > 0) {
          const quizBlock = {
            type: "quiz",
            title: `Chapter Quiz: ${chapterName}`,
            questions,
          };
          // insert quiz after a random topic index
          const insertAt = Math.min(lessons.length, Math.max(1, Math.floor(Math.random() * (lessons.length + 1))));
          lessons.splice(insertAt, 0, { title: `Quiz — ${chapterName}`, blocks: [quizBlock] });
        }
      } catch (e) {
        console.warn("Quiz generation failed, continuing without quiz:", e);
      }
    }

    if (shouldAddPractice) {
      try {
        // Create a simple practice task using chapter name
        const taskText = `Build a small project that applies the core ideas from \"${chapterName}\". Deliver a minimal working example (code or short app) demonstrating the main concept. Suggested scope: 1–3 files, ~1–3 hours.`;
        const practiceBlock = {
          type: "practice",
          title: `Mini task: apply ${chapterName}`,
          tasks: [taskText],
          note: "Small, hands-on exercise to reinforce the chapter concept.",
        };
        const insertAt = Math.min(lessons.length, Math.max(1, Math.floor(Math.random() * (lessons.length + 1))));
        lessons.splice(insertAt, 0, { title: `Practice — ${chapterName}`, blocks: [practiceBlock] });
      } catch (e) {
        console.warn("Practice task generation failed:", e);
      }
    }

    console.log(`📺 Video for chapter ${chapterIndex}:`, chapterName, videoId);

    await db
      .insert(CourseChapters)
      .values({
        chapterId: chapterIndex,
        courseId: courseId,
        content: { content: lessons },
        videoId: videoId,
      })
      .onConflictDoUpdate({
        target: [CourseChapters.courseId, CourseChapters.chapterId],
        set: {
          content: { content: lessons },
          videoId: videoId,
        },
      });

    return { success: true, videoId };
  } catch (error) {
    console.error(`❌ Failed to save grouped lessons for chapter ${chapterIndex}`, error);
    return { success: false };
  }
}
