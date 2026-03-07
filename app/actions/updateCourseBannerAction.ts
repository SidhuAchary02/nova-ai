"use server";

import { db } from "@/configs/db";
import { CourseList } from "@/schema/schema";
import { eq } from "drizzle-orm";

export async function updateCourseBanner(courseId: number, bannerUrl: string) {
  await db
    .update(CourseList)
    .set({
      courseBanner: bannerUrl,
    })
    .where(eq(CourseList.id, courseId));

  return { success: true };
}