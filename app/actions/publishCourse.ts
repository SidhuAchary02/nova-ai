"use server";

import { db } from "@/configs/db";
import { CourseList } from "@/schema/schema";
import { eq, and } from "drizzle-orm";

/**
 * Publish or unpublish a course. Only the course owner can call this.
 * Returns success/error and the new isPublished state.
 */
export async function publishCourseAction(
  courseId: string,
  isPublished: boolean,
  userEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify ownership
    const [course] = await db
      .select({ createdBy: CourseList.createdBy })
      .from(CourseList)
      .where(eq(CourseList.courseId, courseId));

    if (!course) {
      return { success: false, error: "Course not found" };
    }

    if (course.createdBy !== userEmail) {
      return { success: false, error: "Not authorized" };
    }

    await db
      .update(CourseList)
      .set({ isPublished })
      .where(and(eq(CourseList.courseId, courseId), eq(CourseList.createdBy, userEmail)));

    return { success: true };
  } catch (error) {
    console.error("Error updating course publish status:", error);
    return { success: false, error: "Failed to update publish status" };
  }
}
