"use server";

import { db } from "@/configs/db";
import { CourseList } from "@/schema/schema";
import { eq } from "drizzle-orm";

export async function getCourseByIdPublicAction(courseId: string) {
  try {
    const result = await db
      .select()
      .from(CourseList)
      .where(eq(CourseList.courseId, courseId));
    
    // Convert to plain object to avoid serialization issues
    if (result[0]) {
      return JSON.parse(JSON.stringify(result[0]));
    }
    return null;
  } catch (error) {
    console.error("Error fetching course:", error);
    return null;
  }
}
