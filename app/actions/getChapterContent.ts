"use server";

import { db } from "@/configs/db";
import { CourseChapters } from "@/schema/schema";
import { and, eq } from "drizzle-orm";

export async function getChapterContentAction(chapterId: number, courseId: string) {
  try {
    const res = await db
      .select()
      .from(CourseChapters)
      .where(
        and(
          eq(CourseChapters.chapterId, chapterId),
          eq(CourseChapters.courseId, courseId)
        )
      );
    
    console.log("📖 Raw database result for chapter:", { chapterId, courseId, hasData: !!res[0] });
    
    // Convert to plain object and normalize content field
    if (res[0]) {
      const plainObj = JSON.parse(JSON.stringify(res[0]));
      
      console.log("📖 Chapter data from DB:", { 
        id: plainObj.id, 
        hasSources: !!plainObj.sources,
        sourcesLength: plainObj.sources?.length || 0,
        sources: plainObj.sources 
      });
      
      // Normalize the content field - it might be a nested {content: [...]} or just [...]
      let contentField = plainObj.content;
      
      // If content is a string, parse it
      if (typeof contentField === "string") {
        try {
          contentField = JSON.parse(contentField);
        } catch (e) {
          console.error("Failed to parse content field:", e);
        }
      }
      
      // If content is an object with a 'content' property, unwrap it
      if (
        typeof contentField === "object" &&
        contentField !== null &&
        !Array.isArray(contentField) &&
        contentField.content &&
        Array.isArray(contentField.content)
      ) {
        console.log("Unwrapping nested content structure");
        plainObj.content = contentField.content;
      } else if (Array.isArray(contentField)) {
        // Already an array, use as-is
        plainObj.content = contentField;
      }
      
      // Ensure sources is always an array
      if (!plainObj.sources || !Array.isArray(plainObj.sources)) {
        plainObj.sources = [];
      }
      
      console.log("📖 Final object being returned:", { 
        hasSources: !!plainObj.sources, 
        sourcesCount: plainObj.sources?.length || 0,
        sources: plainObj.sources 
      });
      
      return plainObj;
    }
    console.warn("⚠️ No chapter data found in database");
    return null;
  } catch (error) {
    console.error("Error fetching chapter content:", error);
    return null;
  }
}
