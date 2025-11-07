"use server";

import { db } from "@/configs/db";
import { CourseList } from "@/schema/schema";
import { and, eq } from "drizzle-orm";
import { CourseType } from "@/types/types";

export async function getCourseByIdAction(
  courseId: string,
  userEmail: string
): Promise<CourseType | null> {
  try {
    const res = await db
      .select()
      .from(CourseList)
      .where(
        and(
          eq(CourseList.courseId, courseId),
          eq(CourseList.createdBy, userEmail)
        )
      );
    
    // Convert to plain object to avoid serialization issues
    if (res[0]) {
      return JSON.parse(JSON.stringify(res[0])) as CourseType;
    }
    return null;
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
}
