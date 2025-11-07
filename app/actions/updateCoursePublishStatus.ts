"use server";

import { db } from "@/configs/db";
import { CourseList } from "@/schema/schema";
import { eq } from "drizzle-orm";

export async function updateCoursePublishStatusAction(
  courseId: string
): Promise<void> {
  try {
    await db
      .update(CourseList)
      .set({ isPublished: true })
      .where(eq(CourseList.courseId, courseId));
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
}
