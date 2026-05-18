"use server";

import { db } from "@/configs/db";
import { courseMarketplaceAdds, CourseList } from "@/schema/schema";
import { and, eq } from "drizzle-orm";

export async function getCourseByIdPublicAction(
  courseId: string,
  userEmail?: string | null
) {
  try {
    const result = await db
      .select()
      .from(CourseList)
      .where(eq(CourseList.courseId, courseId));

    // Convert to plain object to avoid serialization issues
    if (result[0]) {
      const course = result[0];
      const isOwner = Boolean(userEmail && course.createdBy === userEmail);

      if (!course.isPublished && !isOwner) {
        return null;
      }

      if (!isOwner && course.isPublished && userEmail) {
        const [marketplaceAdd] = await db
          .select({
            completedChapters: courseMarketplaceAdds.completedChapters,
          })
          .from(courseMarketplaceAdds)
          .where(
            and(
              eq(courseMarketplaceAdds.courseId, courseId),
              eq(courseMarketplaceAdds.addedByEmail, userEmail)
            )
          );

        return JSON.parse(
          JSON.stringify({
            ...course,
            completedChapters: marketplaceAdd?.completedChapters ?? [],
            isCompleted: false,
            quizPassedChapters: [],
            certificateData: null,
            completedAt: null,
          })
        );
      }

      if (!isOwner && course.isPublished) {
        return JSON.parse(
          JSON.stringify({
            ...course,
            completedChapters: [],
            isCompleted: false,
            quizPassedChapters: [],
            certificateData: null,
            completedAt: null,
          })
        );
      }

      return JSON.parse(JSON.stringify(course));
    }
    return null;
  } catch (error) {
    console.error("Error fetching course:", error);
    return null;
  }
}
