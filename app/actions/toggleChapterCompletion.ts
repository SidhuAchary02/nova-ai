import { db } from "@/configs/db";
import { CourseList } from "@/schema/schema";
import { eq } from "drizzle-orm";

/**
 * Toggle chapter completion status
 */
export async function toggleChapterCompletionAction(
  courseId: string,
  chapterIndex: number
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
    if (completedChapters.includes(chapterIndex)) {
      // Remove from completed
      updatedChapters = completedChapters.filter((idx) => idx !== chapterIndex);
    } else {
      // Add to completed
      updatedChapters = [...completedChapters, chapterIndex];
    }

    // Update database
    await db
      .update(CourseList)
      .set({ completedChapters: updatedChapters })
      .where(eq(CourseList.courseId, courseId));

    return {
      success: true,
      completedChapters: updatedChapters,
      isCompleted: completedChapters.includes(chapterIndex),
    };
  } catch (error) {
    console.error("Error toggling chapter completion:", error);
    return { success: false, error: String(error) };
  }
}
