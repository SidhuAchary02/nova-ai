
import { UserInputType } from "@/types/types";
import { storeCourseDataAction } from "@/app/actions/storeCourseData";
import { generateCourseThumbnailAction } from "@/app/actions/courseEnhancements";

type UserInput = Pick<UserInputType, "topic" | "difficulty" | "category">;

export async function storeDataInDatabase(
  id: string,
  userInput: UserInput,
  data: any,
  user: any
) {
  try {
    const result = await storeCourseDataAction({
      courseId: id,
      courseName: userInput.topic || "",
      category: userInput.category || "",
      level: userInput.difficulty || "",
      courseOutput: data,
      createdBy: user?.primaryEmailAddress?.emailAddress,
      username: user?.fullName,
      userprofileimage: user?.imageUrl,
    });
    
    // Generate thumbnail for the course
    if (result.success && userInput.topic && userInput.category) {
      await generateCourseThumbnailAction(id, userInput.topic, userInput.category);
      console.log("📸 Thumbnail generated for course");
    }
    
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
