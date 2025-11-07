import { CourseType } from "@/types/types";
import { generateChapterContentAction } from "@/app/actions/generateChapterContent";

// Helper function to sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateCourseContent = async (
  course: CourseType,
  setLoading: (loading: boolean) => void
) => {
  setLoading(true);

  try {
    const chapters = course?.courseOutput.chapters;
    const results = [];

    // Process chapters sequentially with delay to avoid rate limits
    for (let index = 0; index < chapters!.length; index++) {
      const chapter = chapters![index];
      
      console.log(`📝 Generating chapter ${index + 1}/${chapters!.length}: ${chapter.chapter_name}`);
      
      try {
        const result = await generateChapterContentAction(
          course.courseId,
          course.courseName,
          chapter.chapter_name,
          index
        );
        
        results.push(result);
        
        if (result.success) {
          console.log(`✅ Chapter ${index + 1} (${chapter.chapter_name}) generated successfully`);
        } else {
          console.error(`❌ Failed to generate chapter ${index + 1}:`, result.error);
        }
        
        // Add delay between chapters to avoid rate limiting (except for the last chapter)
        if (index < chapters!.length - 1) {
          console.log("⏳ Waiting 3 seconds before next chapter...");
          await sleep(3000); // 3 second delay between chapters
        }
      } catch (error) {
        console.error(`Error in processing chapter ${index}:`, error);
        results.push({ success: false, error: String(error) });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`\n🎉 Completed! Successfully generated ${successCount}/${chapters?.length} chapters`);
    
    if (successCount === 0) {
      return { success: false, error: "No chapters were generated successfully", successCount: 0, totalChapters: chapters?.length };
    }
    
    return { success: true, successCount, totalChapters: chapters?.length };
  } catch (error) {
    console.log(error);
    return { success: false, error: String(error) };
  } finally {
    setLoading(false);
  }
};
