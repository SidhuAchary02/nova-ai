"use server";

import { db } from "@/configs/db";
import { CourseList } from "@/schema/schema";
import { eq } from "drizzle-orm";

export async function updateCoursePublishStatusAction(
  courseId: string,
  isPublished: boolean = true
): Promise<void> {
  try {
    await db
      .update(CourseList)
      .set({ isPublished })
      .where(eq(CourseList.courseId, courseId));
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
}
