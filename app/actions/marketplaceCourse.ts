"use server";

import { db } from "@/configs/db";
import { courseMarketplaceAdds, CourseList } from "@/schema/schema";
import { eq, and } from "drizzle-orm";

/**
 * Add a published course to the current user's dashboard (non-owner only).
 */
export async function addCourseToMyDashboardAction(
  courseId: string,
  userEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify the course is published
    const [course] = await db
      .select({ createdBy: CourseList.createdBy, isPublished: CourseList.isPublished })
      .from(CourseList)
      .where(eq(CourseList.courseId, courseId));

    if (!course) return { success: false, error: "Course not found" };
    if (!course.isPublished) return { success: false, error: "Course is not published" };
    if (course.createdBy === userEmail) return { success: false, error: "You are the course owner" };

    // Insert (unique index prevents duplicates)
    await db.insert(courseMarketplaceAdds).values({ courseId, addedByEmail: userEmail });

    return { success: true };
  } catch (error: any) {
    // Unique constraint violation = already added
    if (error?.code === "23505") {
      return { success: false, error: "Already added" };
    }
    console.error("Error adding course to dashboard:", error);
    return { success: false, error: "Failed to add course" };
  }
}

/**
 * Get all marketplace-added courses for a user, joined with full course data.
 */
export async function getMarketplaceAddsAction(userEmail: string) {
  if (!userEmail) return [];
  try {
    const adds = await db
      .select({
        addId: courseMarketplaceAdds.id,
        courseId: courseMarketplaceAdds.courseId,
        addedAt: courseMarketplaceAdds.addedAt,
        completedChapters: courseMarketplaceAdds.completedChapters,
        // Course fields
        id: CourseList.id,
        courseName: CourseList.courseName,
        category: CourseList.category,
        level: CourseList.level,
        courseOutput: CourseList.courseOutput,
        isVideo: CourseList.isVideo,
        username: CourseList.username,
        userprofileimage: CourseList.userprofileimage,
        createdBy: CourseList.createdBy,
        courseBanner: CourseList.courseBanner,
        isPublished: CourseList.isPublished,
        isCompleted: CourseList.isCompleted,
      })
      .from(courseMarketplaceAdds)
      .innerJoin(CourseList, eq(courseMarketplaceAdds.courseId, CourseList.courseId))
      .where(eq(courseMarketplaceAdds.addedByEmail, userEmail));

    return JSON.parse(JSON.stringify(adds));
  } catch (error) {
    console.error("Error fetching marketplace adds:", error);
    return [];
  }
}

/**
 * Check if a user has already added a specific marketplace course.
 */
export async function getMarketplaceAddStatusAction(
  courseId: string,
  userEmail: string
): Promise<{ added: boolean; completedChapters?: number[] }> {
  try {
    const [row] = await db
      .select({
        id: courseMarketplaceAdds.id,
        completedChapters: courseMarketplaceAdds.completedChapters,
      })
      .from(courseMarketplaceAdds)
      .where(
        and(
          eq(courseMarketplaceAdds.courseId, courseId),
          eq(courseMarketplaceAdds.addedByEmail, userEmail)
        )
      );
    return {
      added: !!row,
      completedChapters: ((row?.completedChapters as number[] | null) ?? []),
    };
  } catch {
    return { added: false };
  }
}

/**
 * Toggle per-user lesson completion for a marketplace-added course.
 */
export async function toggleMarketplaceLessonCompletionAction(
  courseId: string,
  userEmail: string,
  globalLessonIndex: number
): Promise<{ success: boolean; completedChapters?: number[]; error?: string }> {
  try {
    const [row] = await db
      .select({ completedChapters: courseMarketplaceAdds.completedChapters })
      .from(courseMarketplaceAdds)
      .where(
        and(
          eq(courseMarketplaceAdds.courseId, courseId),
          eq(courseMarketplaceAdds.addedByEmail, userEmail)
        )
      );

    if (!row) {
      return { success: false, error: "Marketplace course not added" };
    }

    const completedChapters = (row.completedChapters as number[]) || [];
    const updatedChapters = completedChapters.includes(globalLessonIndex)
      ? completedChapters.filter((idx) => idx !== globalLessonIndex)
      : [...completedChapters, globalLessonIndex];

    await db
      .update(courseMarketplaceAdds)
      .set({ completedChapters: updatedChapters })
      .where(
        and(
          eq(courseMarketplaceAdds.courseId, courseId),
          eq(courseMarketplaceAdds.addedByEmail, userEmail)
        )
      );

    return { success: true, completedChapters: updatedChapters };
  } catch (error) {
    console.error("Error toggling marketplace lesson completion:", error);
    return { success: false, error: "Failed to update lesson completion" };
  }
}

/**
 * Remove a marketplace course from a user's dashboard.
 */
export async function removeCourseFromDashboardAction(
  courseId: string,
  userEmail: string
): Promise<{ success: boolean }> {
  try {
    await db
      .delete(courseMarketplaceAdds)
      .where(
        and(
          eq(courseMarketplaceAdds.courseId, courseId),
          eq(courseMarketplaceAdds.addedByEmail, userEmail)
        )
      );
    return { success: true };
  } catch {
    return { success: false };
  }
}
