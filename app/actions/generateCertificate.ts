"use server";

import { db } from "@/configs/db";
import { CourseList } from "@/schema/schema";
import { eq } from "drizzle-orm";

export type CertificateData = {
  certificateId: string;
  issuedDate: string;
  completedAt: string;
};

/**
 * Generate and store certificate for completed course
 */
export async function generateCertificateAction(courseId: string) {
  try {
    const courses = await db
      .select()
      .from(CourseList)
      .where(eq(CourseList.courseId, courseId));

    if (courses.length === 0) {
      return { success: false, error: "Course not found" };
    }

    const course = courses[0];

    // Generate unique certificate ID
    const certificateId = `CERT-${courseId.toUpperCase()}-${Date.now()}`;
    const issuedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const completedAt = new Date().toISOString();

    const certificateData: CertificateData = {
      certificateId,
      issuedDate,
      completedAt,
    };

    // Update database
    await db
      .update(CourseList)
      .set({
        certificateData,
        completedAt: new Date(),
      })
      .where(eq(CourseList.courseId, courseId));

    return {
      success: true,
      certificateData,
      courseName: course.courseName,
      courseId,
    };
  } catch (error) {
    console.error("Error generating certificate:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get certificate data for a course
 */
export async function getCertificateAction(courseId: string) {
  try {
    const courses = await db
      .select()
      .from(CourseList)
      .where(eq(CourseList.courseId, courseId));

    if (courses.length === 0) {
      return { success: false, error: "Course not found" };
    }

    const course = courses[0];
    const certificateData = course.certificateData as CertificateData | null;

    if (!certificateData) {
      return { 
        success: false, 
        error: "No certificate found. Complete the course to earn one!" 
      };
    }

    return {
      success: true,
      certificateData,
      courseName: course.courseName,
      username: course.username,
      category: course.category,
      level: course.level,
    };
  } catch (error) {
    console.error("Error getting certificate:", error);
    return { success: false, error: String(error) };
  }
}
