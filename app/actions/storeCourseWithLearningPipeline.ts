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

type LearningContextProjection = {
  goal?: string;
  currentLevel?: string;
  timePerDayHours?: number;
  preferredLearningStyle?: string;
  topicsToFocus: string[];
  topicsToAvoid: string[];
  featuresRequired: string[];
  pacingStyle?: string;
  goalCustomNote?: string;
};

function toStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}

function projectLearningContext(raw: unknown): LearningContextProjection {
  const ctx = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    goal: typeof ctx.goal === "string" ? ctx.goal : undefined,
    currentLevel:
      typeof ctx.currentLevel === "string" ? ctx.currentLevel : undefined,
    timePerDayHours:
      typeof ctx.timePerDayHours === "number" ? ctx.timePerDayHours : undefined,
    preferredLearningStyle:
      typeof ctx.preferredLearningStyle === "string"
        ? ctx.preferredLearningStyle
        : undefined,
    topicsToFocus: toStringArray(ctx.topicsToFocus),
    topicsToAvoid: toStringArray(ctx.topicsToAvoid),
    featuresRequired: toStringArray(ctx.featuresRequired),
    pacingStyle: typeof ctx.pacingStyle === "string" ? ctx.pacingStyle : undefined,
    goalCustomNote:
      typeof ctx.goalCustomNote === "string" ? ctx.goalCustomNote : undefined,
  };
}

/**
 * Persists learning strategy row + course row + user profile snapshot (transaction).
 */
export async function storeCourseWithLearningPipelineAction(
  payload: StoreLearningPipelinePayload
) {
  try {
    const lc = projectLearningContext(payload.learningContext);

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
        learningGoal: lc.goal,
        learningCurrentLevel: lc.currentLevel,
        learningTimePerDayHours: lc.timePerDayHours,
        learningPreferredLearningStyle: lc.preferredLearningStyle,
        learningTopicsToFocus: lc.topicsToFocus,
        learningTopicsToAvoid: lc.topicsToAvoid,
        learningFeaturesRequired: lc.featuresRequired,
        learningPacingStyle: lc.pacingStyle,
        learningGoalCustomNote: lc.goalCustomNote,
      });

      if (payload.createdBy) {
        await tx
          .insert(userProfiles)
          .values({
            email: payload.createdBy,
            profile: payload.learningContext as object,
            profileGoal: lc.goal,
            profileCurrentLevel: lc.currentLevel,
            profileTimePerDayHours: lc.timePerDayHours,
            profilePreferredLearningStyle: lc.preferredLearningStyle,
            profileTopicsToFocus: lc.topicsToFocus,
            profileTopicsToAvoid: lc.topicsToAvoid,
            profileFeaturesRequired: lc.featuresRequired,
            profilePacingStyle: lc.pacingStyle,
            profileGoalCustomNote: lc.goalCustomNote,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: userProfiles.email,
            set: {
              profile: payload.learningContext as object,
              profileGoal: lc.goal,
              profileCurrentLevel: lc.currentLevel,
              profileTimePerDayHours: lc.timePerDayHours,
              profilePreferredLearningStyle: lc.preferredLearningStyle,
              profileTopicsToFocus: lc.topicsToFocus,
              profileTopicsToAvoid: lc.topicsToAvoid,
              profileFeaturesRequired: lc.featuresRequired,
              profilePacingStyle: lc.pacingStyle,
              profileGoalCustomNote: lc.goalCustomNote,
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
