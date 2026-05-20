"use server";

import { db } from "@/configs/db";
import { CourseList, courseGenerationUsage } from "@/schema/schema";
import { getPremiumCourseLimit, normalizeEmail } from "@/configs/premiumAccess";
import { eq, sql } from "drizzle-orm";
import {
  FREE_COURSE_GENERATION_LIMIT,
  OUT_OF_CREDITS_ERROR,
  type CourseGenerationAccess,
} from "@/configs/courseGenerationAccess";

let usageTableReady: Promise<void> | null = null;

async function ensureUsageTable() {
  if (!usageTableReady) {
    usageTableReady = db.execute(sql`
      CREATE TABLE IF NOT EXISTS "course_generation_usage" (
        "id" serial PRIMARY KEY NOT NULL,
        "email" varchar NOT NULL UNIQUE,
        "generatedCount" integer DEFAULT 0 NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL
      )
    `).then(() => undefined);
  }

  await usageTableReady;
}

async function getExistingCourseCount(email: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(CourseList)
    .where(eq(CourseList.createdBy, email));

  return Number(row?.count || 0);
}

async function getUsageCount(email: string) {
  await ensureUsageTable();
  const [row] = await db
    .select({ generatedCount: courseGenerationUsage.generatedCount })
    .from(courseGenerationUsage)
    .where(eq(courseGenerationUsage.email, email));

  return Number(row?.generatedCount || 0);
}

async function syncUsageCountFromExistingCourses(email: string, existingCount: number) {
  await ensureUsageTable();
  if (existingCount <= 0) return;

  await db
    .insert(courseGenerationUsage)
    .values({
      email,
      generatedCount: existingCount,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: courseGenerationUsage.email,
      set: {
        generatedCount: sql`greatest(${courseGenerationUsage.generatedCount}, ${existingCount})`,
        updatedAt: new Date(),
      },
    });
}

export async function getCourseGenerationAccessAction(
  email?: string | null
): Promise<CourseGenerationAccess> {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return {
      isPremium: false,
      used: 0,
      limit: FREE_COURSE_GENERATION_LIMIT,
      canGenerate: false,
    };
  }

  const existingCount = await getExistingCourseCount(normalizedEmail);
  await syncUsageCountFromExistingCourses(normalizedEmail, existingCount);
  const used = Math.max(
    await getUsageCount(normalizedEmail),
    existingCount
  );
  const premiumLimit = getPremiumCourseLimit(normalizedEmail);
  const limit = premiumLimit ?? FREE_COURSE_GENERATION_LIMIT;

  return {
    isPremium: premiumLimit !== undefined,
    used,
    limit,
    canGenerate: used < limit,
  };
}

export async function assertCanGenerateCourse(email?: string | null) {
  await ensureUsageTable();
  const access = await getCourseGenerationAccessAction(email);

  if (!access.canGenerate) {
    throw new Error(OUT_OF_CREDITS_ERROR);
  }

  return access;
}

export async function recordCourseGenerationUsed(email?: string | null) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return;

  await ensureUsageTable();

  await db
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
