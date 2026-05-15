"use server";

import { db } from "@/configs/db";
import { CourseChapters } from "@/schema/schema";
import type { ChapterAnnotationType } from "@/types/types";
import { and, eq } from "drizzle-orm";

type SaveChapterAnnotationInput = {
  courseId: string;
  chapterId: number;
  annotation: ChapterAnnotationType;
};

export async function saveChapterAnnotationAction({
  courseId,
  chapterId,
  annotation,
}: SaveChapterAnnotationInput) {
  try {
    const chapterRows = await db
      .select({ id: CourseChapters.id, annotations: CourseChapters.annotations })
      .from(CourseChapters)
      .where(
        and(
          eq(CourseChapters.courseId, courseId),
          eq(CourseChapters.chapterId, chapterId)
        )
      );

    const chapterRow = chapterRows[0];

    if (!chapterRow) {
      return {
        success: false,
        error: "Chapter record not found",
      };
    }

    const currentAnnotations = Array.isArray(chapterRow.annotations)
      ? chapterRow.annotations
      : [];
    const nextAnnotations = [...currentAnnotations, annotation];

    await db
      .update(CourseChapters)
      .set({ annotations: nextAnnotations })
      .where(eq(CourseChapters.id, chapterRow.id));

    return {
      success: true,
      annotations: nextAnnotations,
    };
  } catch (error) {
    console.error("❌ Failed to save chapter annotation:", error);
    return {
      success: false,
      error: String(error),
    };
  }
}