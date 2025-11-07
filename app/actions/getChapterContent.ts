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
    
    // Convert to plain object to avoid serialization issues
    if (res[0]) {
      return JSON.parse(JSON.stringify(res[0]));
    }
    return null;
  } catch (error) {
    console.error("Error fetching chapter content:", error);
    return null;
  }
}
