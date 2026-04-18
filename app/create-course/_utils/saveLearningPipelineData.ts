import { UserInputType } from "@/types/types";
import { storeCourseWithLearningPipelineAction } from "@/app/actions/storeCourseWithLearningPipeline";
import { supabase } from "@/configs/supabase";
import { userLearningContextSchema } from "@/lib/validation/learningSchemas";
import { buildLearningContextFromInput } from "@/lib/learning/buildLearningContext";

/**
 * Client-side helper (same pattern as saveDataInDb) — persists pipeline course + strategy.
 */
export async function saveLearningPipelineDataInDb(
  id: string,
  userInput: UserInputType,
  courseOutput: Record<string, unknown>,
  strategyJson: unknown
) {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  const email = user?.email || "";
  const username =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  const avatar =
    user?.user_metadata?.avatar_url || "/userProfile.png";

  const ctx = userLearningContextSchema.parse(
    buildLearningContextFromInput(userInput)
  );

  const level =
    userInput.difficulty ||
    (userInput.learningProfile?.currentLevel
      ? userInput.learningProfile.currentLevel.charAt(0).toUpperCase() +
        userInput.learningProfile.currentLevel.slice(1)
      : "Beginner");

  const result = await storeCourseWithLearningPipelineAction({
    courseId: id,
    courseName: userInput.topic || "",
    category: userInput.category || "",
    level,
    courseOutput,
    isVideo: userInput.video,
    learningContext: ctx,
    strategyJson,
    createdBy: email,
    username,
    userprofileimage: avatar,
  });

  return result;
}
