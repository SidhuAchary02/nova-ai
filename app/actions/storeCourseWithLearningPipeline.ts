"use server";

import { db } from "@/configs/db";
import { CourseList, learningStrategies, userProfiles } from "@/schema/schema";
import { generateCourseThumbnailAction } from "@/app/actions/courseEnhancements";
export type StoreLearningPipelinePayload = {
  courseId: string;
  courseName: string;
  category: string;
  level: string;
  courseOutput: Record<string, unknown>;
  isVideo?: string;
  learningContext: unknown;
  strategyJson: unknown;
  createdBy: string;
  username: string;
  userprofileimage: string;
};

/**
 * Persists learning strategy row + course row + user profile snapshot (transaction).
 */
export async function storeCourseWithLearningPipelineAction(
  payload: StoreLearningPipelinePayload
) {
  try {
    await db.transaction(async (tx) => {
      const [ls] = await tx
        .insert(learningStrategies)
        .values({
          courseId: payload.courseId,
          createdBy: payload.createdBy,
          strategyJson: payload.strategyJson as object,
        })
        .returning({ id: learningStrategies.id });

      await tx.insert(CourseList).values({
        courseId: payload.courseId,
        courseName: payload.courseName,
        category: payload.category,
        level: payload.level,
        courseOutput: payload.courseOutput,
        isVideo: payload.isVideo ?? "Yes",
        createdBy: payload.createdBy,
        username: payload.username,
        userprofileimage: payload.userprofileimage,
        learningContext: payload.learningContext as object,
        learningStrategyId: ls.id,
      });

      if (payload.createdBy) {
        await tx
          .insert(userProfiles)
          .values({
            email: payload.createdBy,
            profile: payload.learningContext as object,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: userProfiles.email,
            set: {
              profile: payload.learningContext as object,
              updatedAt: new Date(),
            },
          });
      }
    });

    if (payload.courseName && payload.category) {
      await generateCourseThumbnailAction(
        payload.courseId,
        payload.courseName,
        payload.category
      );
    }

    return { success: true as const };
  } catch (error) {
    console.error("storeCourseWithLearningPipelineAction:", error);
    throw error;
  }
}
