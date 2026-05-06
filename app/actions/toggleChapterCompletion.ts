"use server";

import { db } from "@/configs/db";
import { CourseList } from "@/schema/schema";
import { eq } from "drizzle-orm";

/**
 * Toggle lesson completion status based on global subtopic index
 */
export async function toggleChapterCompletionAction(
  courseId: string,
  globalLessonIndex: number
) {
  try {
    // Get current course
    const courses = await db
      .select()
      .from(CourseList)
      .where(eq(CourseList.courseId, courseId));

    if (courses.length === 0) {
      return { success: false, error: "Course not found" };
    }

    const course = courses[0];
    const completedChapters = (course.completedChapters as number[]) || [];

    // Toggle chapter completion
    let updatedChapters: number[];
    if (completedChapters.includes(globalLessonIndex)) {
      // Remove from completed
      updatedChapters = completedChapters.filter((idx) => idx !== globalLessonIndex);
    } else {
      // Add to completed
      updatedChapters = [...completedChapters, globalLessonIndex];
    }

    // Update database
    await db
      .update(CourseList)
      .set({ completedChapters: updatedChapters })
      .where(eq(CourseList.courseId, courseId));

    return {
      success: true,
      completedChapters: updatedChapters,
      isCompleted: completedChapters.includes(globalLessonIndex),
    };
  } catch (error) {
    console.error("Error toggling chapter completion:", error);
    return { success: false, error: String(error) };
  }
}
