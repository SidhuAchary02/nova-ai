"use server";

import { db } from "@/configs/db";
import { CourseChapters } from "@/schema/schema";
import { and, eq } from "drizzle-orm";

export async function debugGetChapterDataAction(courseId: string, chapterId: number) {
  try {
    const res = await db
      .select()
      .from(CourseChapters)
      .where(
        and(
          eq(CourseChapters.courseId, courseId),
          eq(CourseChapters.chapterId, chapterId)
        )
      );

    if (res[0]) {
      const data = JSON.parse(JSON.stringify(res[0]));
      
      return {
        success: true,
        data: {
          id: data.id,
          courseId: data.courseId,
          chapterId: data.chapterId,
          videoId: data.videoId,
          hasContent: !!data.content,
          contentLength: data.content?.content?.length || 0,
          hasSources: !!data.sources,
          sourcesLength: Array.isArray(data.sources) ? data.sources.length : 0,
          sources: data.sources,
          rawData: data,
        }
      };
    }

    return {
      success: false,
      message: "No chapter data found",
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}
