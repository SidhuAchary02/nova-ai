"use server";

import { db } from "@/configs/db";
import { CourseList } from "@/schema/schema";
import { eq } from "drizzle-orm";

/**
 * Store quiz pass result for a specific chapter
 */
export async function storeQuizResultAction(
  courseId: string,
  chapterIndex: number,
  passed: boolean,
  score: number
) {
  try {
    // Get current course
    const courses = await db
      .select()
      .from(CourseList)
      .where(eq(CourseList.courseId, courseId));

    if (courses.length === 0) {
      return { success: false, error: "Course not found" };
    }

    const course = courses[0];
    const quizPassedChapters = (course.quizPassedChapters as number[]) || [];

    // Update quizPassedChapters array if quiz was passed
    let updatedChapters: number[] = quizPassedChapters;
    if (passed && !quizPassedChapters.includes(chapterIndex)) {
      updatedChapters = [...quizPassedChapters, chapterIndex];
    } else if (!passed) {
      // Remove from passed if they failed
      updatedChapters = quizPassedChapters.filter((idx) => idx !== chapterIndex);
    }

    // Update database
    await db
      .update(CourseList)
      .set({ quizPassedChapters: updatedChapters })
      .where(eq(CourseList.courseId, courseId));

    return {
      success: true,
      quizPassedChapters: updatedChapters,
      passed,
      score,
    };
  } catch (error) {
    console.error("Error storing quiz result:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Check if quiz is passed for a chapter
 */
export async function isChapterQuizPassedAction(
  courseId: string,
  chapterIndex: number
): Promise<boolean> {
  try {
    const courses = await db
      .select()
      .from(CourseList)
      .where(eq(CourseList.courseId, courseId));

    if (courses.length === 0) return false;

    const quizPassedChapters = (courses[0].quizPassedChapters as number[]) || [];
    return quizPassedChapters.includes(chapterIndex);
  } catch (error) {
    console.error("Error checking quiz pass status:", error);
    return false;
  }
}

/**
 * Get all quiz passed chapters
 */
export async function getQuizPassedChaptersAction(
  courseId: string
): Promise<number[]> {
  try {
    const courses = await db
      .select()
      .from(CourseList)
      .where(eq(CourseList.courseId, courseId));

    if (courses.length === 0) return [];

    return (courses[0].quizPassedChapters as number[]) || [];
  } catch (error) {
    console.error("Error getting quiz passed chapters:", error);
    return [];
  }
}
