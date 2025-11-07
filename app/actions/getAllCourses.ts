"use server";

import { db } from "@/configs/db";
import { CourseList } from "@/schema/schema";

export async function getAllCoursesAction(limit: number, offset: number) {
  try {
    const result = await db
      .select()
      .from(CourseList)
      .limit(limit)
      .offset(offset);
    // Convert to plain objects to avoid serialization issues
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error("Error fetching all courses:", error);
    return [];
  }
}
