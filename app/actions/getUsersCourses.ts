"use server";

import { db } from "@/configs/db";
import { CourseList } from "@/schema/schema";
import { eq } from "drizzle-orm";

export async function getUsersCoursesAction(email: string) {
  if (!email) return [];
  try {
    const res = await db
      .select()
      .from(CourseList)
      .where(eq(CourseList.createdBy, email));
    // Convert to plain objects to avoid serialization issues
    return JSON.parse(JSON.stringify(res));
  } catch (err) {
    console.error("Error fetching user courses:", err);
    return [];
  }
}
