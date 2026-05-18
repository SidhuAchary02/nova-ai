"use server";

import { db } from "@/configs/db";
import { courseReviews, CourseList } from "@/schema/schema";
import { eq, and } from "drizzle-orm";

type SubmitReviewPayload = {
  courseId: string;
  reviewerEmail: string;
  reviewerName?: string;
  rating?: number; // 1-5, optional
  reviewText: string;
};

/**
 * Submit a review/feedback for a published course.
 * A user can only submit one review per course.
 */
export async function submitCourseReviewAction(
  payload: SubmitReviewPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!payload.reviewText?.trim()) {
      return { success: false, error: "Review text is required" };
    }
    if (payload.rating !== undefined && (payload.rating < 1 || payload.rating > 5)) {
      return { success: false, error: "Rating must be between 1 and 5" };
    }

    const [course] = await db
      .select({
        createdBy: CourseList.createdBy,
        isPublished: CourseList.isPublished,
      })
      .from(CourseList)
      .where(eq(CourseList.courseId, payload.courseId));

    if (!course) return { success: false, error: "Course not found" };
    if (!course.isPublished) {
      return { success: false, error: "Course is not published" };
    }
    if (course.createdBy === payload.reviewerEmail) {
      return { success: false, error: "Course owners cannot review their own course" };
    }

    const [existingReview] = await db
      .select({ id: courseReviews.id })
      .from(courseReviews)
      .where(
        and(
          eq(courseReviews.courseId, payload.courseId),
          eq(courseReviews.reviewerEmail, payload.reviewerEmail)
        )
      );

    if (existingReview) {
      return { success: false, error: "You already submitted feedback for this course" };
    }

    await db.insert(courseReviews).values({
      courseId: payload.courseId,
      reviewerEmail: payload.reviewerEmail,
      reviewerName: payload.reviewerName || null,
      rating: payload.rating ?? null,
      reviewText: payload.reviewText.trim(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error submitting review:", error);
    return { success: false, error: "Failed to submit review" };
  }
}

/**
 * Fetch all reviews for a given course.
 */
export async function getCourseReviewsAction(courseId: string) {
  try {
    const reviews = await db
      .select()
      .from(courseReviews)
      .where(eq(courseReviews.courseId, courseId));

    return JSON.parse(JSON.stringify(reviews));
  } catch (error) {
    console.error("Error fetching course reviews:", error);
    return [];
  }
}

/**
 * Check if a user has already submitted a review for a specific course.
 */
export async function getUserReviewForCourseAction(
  courseId: string,
  reviewerEmail: string
): Promise<{ exists: boolean; review?: any }> {
  try {
    const [row] = await db
      .select()
      .from(courseReviews)
      .where(
        and(
          eq(courseReviews.courseId, courseId),
          eq(courseReviews.reviewerEmail, reviewerEmail)
        )
      );
    return { exists: !!row, review: row ?? null };
  } catch {
    return { exists: false };
  }
}
