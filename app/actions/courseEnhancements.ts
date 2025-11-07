"use server";

import { db } from "@/configs/db";
import { CourseList } from "@/schema/schema";
import { eq } from "drizzle-orm";

/**
 * Generate a course thumbnail URL
 * Currently uses default banner (Unsplash API is unreliable)
 */
export async function generateCourseThumbnailAction(
  courseId: string,
  courseName: string,
  category: string
) {
  try {
    // Use default banner for now (Unsplash Source API is unreliable with 503 errors)
    const thumbnailUrl = "/thumbnail.png";
    
    console.log(`📸 Setting default thumbnail for "${courseName}"`);
    
    // Update the course with the default thumbnail
    await db
      .update(CourseList)
      .set({ courseBanner: thumbnailUrl })
      .where(eq(CourseList.courseId, courseId));
    
    return { success: true, thumbnailUrl };
  } catch (error) {
    console.error("Error setting thumbnail:", error);
    return { success: false, error: String(error), thumbnailUrl: "/thumbnail.png" };
  }
}

/**
 * Mark course as completed
 */
export async function markCourseAsCompletedAction(courseId: string) {
  try {
    const result = await db
      .update(CourseList)
      .set({ isCompleted: true })
      .where(eq(CourseList.courseId, courseId))
      .returning({ courseName: CourseList.courseName });
    
    if (result && result.length > 0) {
      console.log(`✅ Course marked as completed: ${result[0].courseName}`);
      return { success: true, courseName: result[0].courseName };
    }
    
    return { success: false, error: "Course not found" };
  } catch (error) {
    console.error("Error marking course as completed:", error);
    return { success: false, error: String(error) };
  }
}
