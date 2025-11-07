"use server";

import { db } from "@/configs/db";
import { CourseList } from "@/schema/schema";
import { sql } from "drizzle-orm";

/**
 * Fix all courses that have Unsplash URLs and replace with default banner
 */
export async function fixAllCourseBannersAction() {
  try {
    console.log("🔧 Fixing course banners...");
    
    // Update all courses with Unsplash URLs to use default banner
    const result = await db
      .update(CourseList)
      .set({ courseBanner: "/thumbnail.png" })
      .where(sql`${CourseList.courseBanner} LIKE '%unsplash%'`)
      .returning({ courseId: CourseList.courseId });
    
    console.log(`✅ Fixed ${result.length} courses with Unsplash URLs`);
    
    return { success: true, count: result.length };
  } catch (error) {
    console.error("Error fixing course banners:", error);
    return { success: false, error: String(error) };
  }
}
