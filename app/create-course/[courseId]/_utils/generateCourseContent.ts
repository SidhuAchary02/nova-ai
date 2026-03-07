import { CourseType } from "@/types/types";
import { generateChapterContentAction } from "@/app/actions/generateChapterContent";
import { parseCourseOutput } from "@/utils/parseCourseOutput";

// limit how many AI calls run at once
const CONCURRENT_REQUESTS = 3;

export const generateCourseContent = async (
  course: CourseType,
  setLoading: (loading: boolean) => void
) => {
  setLoading(true);

  try {
    const courseOutput = parseCourseOutput(course.courseOutput);
    const chapters = courseOutput?.chapters || [];

    if (chapters.length === 0) {
      return { success: false, error: "No chapters found" };
    }

    console.log(`🚀 Generating ${chapters.length} chapters...`);

    const results: any[] = [];

    // process chapters in batches
    for (let i = 0; i < chapters.length; i += CONCURRENT_REQUESTS) {
      const batch = chapters.slice(i, i + CONCURRENT_REQUESTS);

      const promises = batch.map((chapter: any, idx: number) => {
        const index = i + idx;

        console.log(
          `📝 Generating chapter ${index + 1}/${chapters.length}: ${chapter.chapterName}`
        );

        return generateChapterContentAction(
          course.courseId,
          course.courseName,
          chapter.chapterName,
          index
        )
          .then((res) => {
            if (res.success) {
              console.log(
                `✅ Chapter ${index + 1} generated successfully`
              );
            } else {
              console.error(
                `❌ Chapter ${index + 1} failed:`,
                res.error
              );
            }

            return res;
          })
          .catch((err) => {
            console.error(`❌ Chapter ${index + 1} crashed:`, err);
            return { success: false };
          });
      });

      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    }

    const successCount = results.filter((r) => r.success).length;

    console.log(
      `🎉 Completed! Successfully generated ${successCount}/${chapters.length} chapters`
    );

    if (successCount === 0) {
      return {
        success: false,
        error: "No chapters were generated successfully",
      };
    }

    return {
      success: true,
      successCount,
      totalChapters: chapters.length,
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: String(error) };
  } finally {
    setLoading(false);
  }
};