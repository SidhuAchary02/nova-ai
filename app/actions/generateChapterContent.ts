"use server";

import { generateChapterContentMDX } from "@/configs/ai-models";
import {
  AllGroqKeysExhaustedError,
  type LeasedGroqKey,
} from "@/lib/ai/groqKeyManager";
import { getYoutubeVideos } from "@/configs/service";
import { db } from "@/configs/db";
import { CourseChapters, CourseList } from "@/schema/schema";
import { and, eq } from "drizzle-orm";

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

function hasPlaceholderOnlyCodeBlock(content: string): boolean {
  return /(^|\n)[ \t]*```(?:code|example)?[ \t]*\n[ \t]*(code|example)[ \t]*\n[ \t]*```(?=\n|$)/i.test(content);
}

function hasMermaidBlock(content: string): boolean {
  return /```mermaid\s+[\s\S]*?\b(flowchart|graph)\b[\s\S]*?```/i.test(content);
}

export async function generateSingleSubtopicLesson(
  courseName: string,
  chapterName: string,
  subtopicName: string,
  leasedKey?: LeasedGroqKey
) {
  try {
    const PROMPT = `You are teaching a course. Generate lesson content as pure markdown.

Topic: "${subtopicName}"

OUTPUT ONLY RAW MARKDOWN. ABSOLUTELY NO JSON AND NO MARKDOWN FENCES AROUND THE WHOLE RESPONSE.

Start with a heading:
# ${subtopicName}

Then write the complete lesson using:
- ## for major sections
- ### for subsections  
- Regular paragraphs for explanation
- Markdown tables for comparisons
- Inline code with single backticks, like \`props\` or \`useState\`
- Real fenced code examples when helpful, using a language tag like \`\`\`jsx or \`\`\`tsx
- Bullet lists with - 
- Numbered lists with 1. 2. 3.
- > for blockquotes and callouts

If you include a code block, it MUST contain complete, useful example code related to "${subtopicName}".
Never output placeholder-only code blocks such as \`\`\`code\`\`\`, \`\`\`example\`\`\`, or a block containing only the word "code".

Write a complete, detailed, professional course lesson. Include overview, concepts, examples, and summary.

Also include one Mermaid diagram inside this same markdown response:
- Put it immediately after the main # heading under ## Visual Overview
- Use a fenced code block with language mermaid
- The Mermaid code must start with flowchart TD
- Keep the diagram focused with 6-12 nodes

CRITICAL: Output ONLY markdown text. Do NOT output JSON. Do not wrap the full answer in a code block.`;

    let lessonResult = await retryWithBackoff(async () => {
      return await generateChapterContentMDX(PROMPT, { leasedKey });
    });

    if (hasPlaceholderOnlyCodeBlock(lessonResult)) {
      lessonResult = await retryWithBackoff(async () => {
        return await generateChapterContentMDX(
          `${PROMPT}

Your previous response used placeholder code. Regenerate the lesson.
Every code block must contain complete, real ${courseName} example code for "${subtopicName}".
Do not include a code block unless it has useful code inside it.`,
          { leasedKey }
        );
      });
    }

    try {
      // MDX content from AI is raw markdown/MDX text
      let mdxContent = lessonResult?.trim() ?? "";
      
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

      const needsFallbackMermaid = !hasMermaidBlock(mdxContent);
      const firstHeadingMatch = mdxContent.match(/^#[^\n]*\n/);
      if (firstHeadingMatch && needsFallbackMermaid) {
        const insertAt = firstHeadingMatch[0].length;
        mdxContent = `${mdxContent.slice(0, insertAt)}
## Visual Overview

\`\`\`mermaid
flowchart TD
  A[${subtopicName.replace(/[\[\]"]+/g, "").trim() || "Lesson topic"}] --> B[Key idea]
  B --> C[Practical application]
  C --> D[Review and next step]
\`\`\`
${mdxContent.slice(insertAt)}`;
      } else if (needsFallbackMermaid) {
        mdxContent = `${mdxContent}

## Visual Overview

\`\`\`mermaid
flowchart TD
  A[${subtopicName.replace(/[\[\]"]+/g, "").trim() || "Lesson topic"}] --> B[Key idea]
  B --> C[Practical application]
  C --> D[Review and next step]
\`\`\`
`;
      }

      return {
        success: true,
        lesson: {
          title: subtopicName,
          content: mdxContent,
        },
      };
    } catch (error) {
      console.error("❌ MDX processing failed:", error, lessonResult);
      return { success: false, error: "Processing failed" };
    }
  } catch (error: unknown) {
    if (error instanceof AllGroqKeysExhaustedError) throw error;

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
    const shouldAddPractice = /build|project/i.test(goalNorm);

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
        generationStatus: "generated",
      })
      .onConflictDoUpdate({
        target: [CourseChapters.courseId, CourseChapters.chapterId],
        set: {
          content: { content: lessons },
          videoId: videoId,
          generationStatus: "generated",
        },
      });

    const generatedRows = await db
      .select({ chapterId: CourseChapters.chapterId })
      .from(CourseChapters)
      .where(
        and(
          eq(CourseChapters.courseId, courseId),
          eq(CourseChapters.generationStatus, "generated")
        )
      );

    const [courseRow] = await db
      .select({ courseOutput: CourseList.courseOutput })
      .from(CourseList)
      .where(eq(CourseList.courseId, courseId));

    const output = courseRow?.courseOutput as any;
    const chaptersTotal = output?.course?.chapters?.length || output?.chapters?.length || 0;
    const chaptersGenerated = generatedRows.length;
    const generationStatus =
      chaptersTotal > 0 && chaptersGenerated >= chaptersTotal ? "published" : "partial";

    await db
      .update(CourseList)
      .set({
        generationStatus,
        chaptersGenerated,
        chaptersTotal,
      })
      .where(eq(CourseList.courseId, courseId));

    return { success: true, videoId };
  } catch (error) {
    console.error(`❌ Failed to save grouped lessons for chapter ${chapterIndex}`, error);
    return { success: false };
  }
}
