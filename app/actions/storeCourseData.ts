"use server";

import { db } from "@/configs/db";
import { CourseList } from "@/schema/schema";

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
    await db.insert(CourseList).values(courseData);
    // Return plain object instead of Drizzle result
    return { success: true };
  } catch (error) {
    console.error("Error storing course data:", error);
    throw error;
  }
}
