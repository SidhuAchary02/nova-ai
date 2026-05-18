"use server";

import { db } from "@/configs/db";
import { CourseList, courseGenerationUsage } from "@/schema/schema";
import {
  assertCanGenerateCourse,
} from "@/app/actions/courseGenerationAccess";
import { normalizeEmail } from "@/configs/premiumAccess";
import { sql } from "drizzle-orm";

type CourseData = {
  courseId: string;
  courseName: string;
  level: string;
  category: string;
  courseOutput: any;
  createdBy?: string;
  username?: string;
  userprofileimage?: string;
};

export async function storeCourseDataAction(courseData: CourseData) {
  try {
    await assertCanGenerateCourse(courseData.createdBy);
    const normalizedEmail = normalizeEmail(courseData.createdBy);

    await db.transaction(async (tx) => {
      await tx.insert(CourseList).values(courseData);

      if (normalizedEmail) {
        await tx
          .insert(courseGenerationUsage)
          .values({
            email: normalizedEmail,
            generatedCount: 1,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: courseGenerationUsage.email,
            set: {
              generatedCount: sql`${courseGenerationUsage.generatedCount} + 1`,
              updatedAt: new Date(),
            },
          });
      }
    });

    // Return plain object instead of Drizzle result
    return { success: true };
  } catch (error) {
    console.error("Error storing course data:", error);
    throw error;
  }
}
