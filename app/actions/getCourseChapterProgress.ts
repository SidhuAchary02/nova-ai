"use server";

import { db } from "@/configs/db";
import { CourseChapters } from "@/schema/schema";
import { eq } from "drizzle-orm";

export async function getGeneratedChapterIdsAction(courseId: string) {
  try {
    const rows = await db
      .select({ chapterId: CourseChapters.chapterId })
      .from(CourseChapters)
      .where(eq(CourseChapters.courseId, courseId));

    const chapterIds = rows
      .map((row) => row.chapterId)
      .filter((value): value is number => typeof value === "number")
      .sort((a, b) => a - b);

    let contiguousGeneratedCount = 0;
    for (const chapterId of chapterIds) {
      if (chapterId === contiguousGeneratedCount) {
        contiguousGeneratedCount += 1;
      } else if (chapterId > contiguousGeneratedCount) {
        break;
      }
    }

    return {
      success: true,
      chapterIds,
      generatedCount: chapterIds.length,
      contiguousGeneratedCount,
    };
  } catch (error) {
    console.error("Failed to get generated chapter ids:", error);
    return {
      success: false,
      chapterIds: [] as number[],
      generatedCount: 0,
      contiguousGeneratedCount: 0,
      error: String(error),
    };
  }
}
