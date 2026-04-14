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
You are an expert course content creator. Create comprehensive, detailed, and HIGHLY READABLE educational content for this chapter.

Chapter: "${chapterName}"
Course: "${courseName}"

Generate 5-7 detailed sections covering this topic thoroughly. STRUCTURE each explanation for MAXIMUM READABILITY with short paragraphs and clear visual breaks.

CRITICAL FORMATTING RULES:
1. Use SHORT, digestible paragraphs (3-4 sentences max per paragraph)
2. Use LOTS of whitespace between paragraphs for readability
3. Use MARKDOWN strategically:
   - **bold** for key terms and concepts
   - *italics* for emphasis
   - ## Subheadings to break up content into logical chunks
   - Numbered lists for sequential/step-by-step items
   - Bullet points for features, characteristics, or non-sequential items
   - > blockquotes for important insights or takeaways

4. Structure EVERY explanation like this example:

**What is [Concept Name]?**
Define it clearly in 1-2 sentences.

[Short follow-up paragraph with more detail, 2-3 sentences]

**Why is it important?**
- Important reason 1
- Important reason 2
- Important reason 3

**Key characteristics:**
1. Characteristic 1 - Brief description
2. Characteristic 2 - Brief description
3. Characteristic 3 - Brief description

**Practical applications:**
- Use case 1 in real-world scenario
- Use case 2 in real-world scenario
- Use case 3 in real-world scenario

> **Key Takeaway:** The most important point about this concept in one clear sentence.

5. Make explanations comprehensive (200+ words) but MAXIMIZE readability through structure
6. Use headers (##) to create visual sections, not one long block of text
7. ONLY include code_examples if the topic is about programming, software development, coding, or technical implementation
   - For business, management, or non-technical topics: Set "code_examples" to empty array []

8. **CRITICAL: ALL code_examples MUST include output statements:**
   - For JavaScript: ALWAYS include console.log() statements to show results
   - For Python: ALWAYS include print() statements to show results
   - Every code example should demonstrate its output clearly
   - Example: "console.log('Result:', value)" or "print('Result:', value)"

Return ONLY valid JSON (no markdown, no text outside JSON):

[
 {
   "title": "Section title",
   "explanation": "## Section Heading\\n\\nShort intro paragraph.\\n\\n**Concept Name**\\nDefinition here with details.\\n\\n**Why It Matters**\\n- Point 1\\n- Point 2\\n\\n> Key insight here",
   "code_examples": []
 }
]

REMEMBER:
- Break paragraphs frequently (every 2-3 sentences)
- Use headers and subheadings to organize
- Use lists to break up text
- Markdown formatting makes it scannable and readable
- Content should be easy to scan and digest

Generate comprehensive, beautifully formatted, HIGHLY READABLE content now:
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

    // Generate sources for this chapter
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

    let sources: any[] = [];

    try {
      // Generate sources
      const sourcesResult = await retryWithBackoff(async () => {
        return await generateCourseChapters(SOURCES_PROMPT);
      });

      console.log("📚 Raw sources result:", sourcesResult);

      const sourcesCleaned =
        sourcesResult
          ?.replace(/```json/g, "")
          ?.replace(/```/g, "")
          ?.trim() ?? "";

      console.log("📚 Cleaned sources:", sourcesCleaned);

      const sourcesParsed = JSON.parse(sourcesCleaned);

      console.log("📚 Parsed sources:", sourcesParsed);

      if (Array.isArray(sourcesParsed)) {
        sources = sourcesParsed.map((item: any) => ({
          title: item.title || "",
          url: item.url || "",
          description: item.description || "",
        }));
      }

      console.log(`📚 Generated ${sources.length} sources for chapter ${chapterIndex + 1}:`, sources);
    } catch (error) {
      console.error("⚠️ Failed to generate sources:", error);
      console.error("⚠️ Error details:", error instanceof Error ? error.message : String(error));
      // Continue without sources if generation fails
      sources = [];
    }

    // Save to DB in ONE consistent structure
    await db.insert(CourseChapters).values({
      chapterId: chapterIndex,
      courseId: courseId,
      content: {
        content: normalizedContent
      },
      videoId: videoId,
      sources: sources,
    });

    return {
      success: true,
      videoId,
      hasContent: normalizedContent.length > 0,
      sourcesCount: sources.length,
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
