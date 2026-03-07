import { UserInputType } from "@/types/types";
import { storeCourseDataAction } from "@/app/actions/storeCourseData";
import { generateCourseThumbnailAction } from "@/app/actions/courseEnhancements";
import { supabase } from "@/configs/supabase";

type UserInput = Pick<UserInputType, "topic" | "difficulty" | "category">;

export async function storeDataInDatabase(
  id: string,
  userInput: UserInput,
  data: any
) {
  try {

    // 🔑 get logged-in supabase user
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    const email = user?.email || "";
    const username =
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "User";

    const avatar =
      user?.user_metadata?.avatar_url || "/userProfile.png";

    const result = await storeCourseDataAction({
      courseId: id,
      courseName: userInput.topic || "",
      category: userInput.category || "",
      level: userInput.difficulty || "",
      courseOutput: data,

      // ✅ correct values
      createdBy: email,
      username: username,
      userprofileimage: avatar,
    });

    // 📸 Generate thumbnail
    if (result.success && userInput.topic && userInput.category) {
      await generateCourseThumbnailAction(
        id,
        userInput.topic,
        userInput.category
      );

      console.log("📸 Thumbnail generated for course");
    }

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}