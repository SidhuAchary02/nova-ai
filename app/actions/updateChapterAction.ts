"use server";

import { db } from "@/configs/db";
import { CourseList } from "@/schema/schema";
import { eq } from "drizzle-orm";
import { CourseType } from "@/types/types";

export async function updateChapterAction(
  courseId: number,
  chapterIndex: number,
  chapterName: string,
  chapterDescription: string,
  course: CourseType
) {
  try {
    // Update the chapter in the course output
    const updatedCourse = { ...course };
    updatedCourse.courseOutput.chapters[chapterIndex] = {
      ...updatedCourse.courseOutput.chapters[chapterIndex],
      chapterName: chapterName,
      description: chapterDescription,
    };

    // Update in database
    await db
      .update(CourseList)
      .set({
        courseOutput: updatedCourse.courseOutput,
      })
      .where(eq(CourseList.id, course.id));

    return {
      success: true,
      message: "Chapter updated successfully",
      updatedCourse,
    };
  } catch (error) {
    console.error("Error updating chapter:", error);
    return {
      success: false,
      message: "Failed to update chapter",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
