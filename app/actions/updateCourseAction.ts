"use server";

import { db } from "@/configs/db";
import { CourseList } from "@/schema/schema";
import { eq } from "drizzle-orm";

export async function updateCourseBasicInfo(
  courseId: number,
  courseOutput: any
) {
  await db
    .update(CourseList)
    .set({
      courseOutput: courseOutput,
    })
    .where(eq(CourseList.id, courseId));

  return { success: true };
}