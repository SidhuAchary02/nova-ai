"use server";

import { db } from "@/configs/db";
import { CourseChapters } from "@/schema/schema";
import { and, eq } from "drizzle-orm";

export async function deleteChapterAnnotationAction({
  courseId,
  chapterId,
  annotationId,
}: {
  courseId: string;
  chapterId: number;
  annotationId: string;
}) {
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
      return { success: false, error: "Chapter record not found" };
    }

    const current = Array.isArray(chapterRow.annotations) ? chapterRow.annotations : [];
    const next = (current as any[]).filter((a: any) => a.id !== annotationId);

    await db
      .update(CourseChapters)
      .set({ annotations: next })
      .where(eq(CourseChapters.id, chapterRow.id));

    return { success: true, annotations: next };
  } catch (error) {
    console.error("❌ Failed to delete annotation:", error);
    return { success: false, error: String(error) };
  }
}
