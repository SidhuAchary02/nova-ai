"use server";

import { db } from "@/configs/db";
import { CourseList } from "@/schema/schema";
import { eq } from "drizzle-orm";

export async function deleteCourseAction(courseId: number) {
  try {
    const res = await db
      .delete(CourseList)
      .where(eq(CourseList.id, courseId))
      .returning({
        id: CourseList.id,
        courseName: CourseList.courseName,
      });

    if (res && res.length > 0) {
      return { success: true, deletedCourse: res[0] };
    }
    
    return { success: false, error: "Course not found" };
  } catch (error) {
    console.error("Error deleting course:", error);
    return { success: false, error: String(error) };
  }
}
