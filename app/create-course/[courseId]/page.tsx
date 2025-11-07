"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import CourseBasicInfo from "./_components/CourseBasicInfo";
import CourseDetail from "./_components/CourseDetail";
import ChapterList from "./_components/ChapterList";
import { Button } from "@/components/ui/button";
import { generateCourseContent } from "./_utils/generateCourseContent";
import LoadingDialog from "../_components/LoadingDialog";
import { useRouter } from "next/navigation";
import { CourseType } from "@/types/types";
import { getCourseByIdAction } from "@/app/actions/getCourseById";
import { updateCoursePublishStatusAction } from "@/app/actions/updateCoursePublishStatus";

export type ParamsType = {
  courseId: string;
};

const CoursePageLayout = ({ params }: { params: ParamsType }) => {
  const { user } = useUser();
  const [course, setCourse] = useState<CourseType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    params && getCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, user]);

  const getCourse = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;
    
    const res = await getCourseByIdAction(
      params.courseId,
      user.primaryEmailAddress.emailAddress
    );
    setCourse(res);
    // console.log("res", res);
  };

  // console.log(course);

  if (!course) return null;

  const handleGenerateCourseContent = async () => {
    try {
      setLoading(true);
      console.log("Starting course content generation...");
      
      const result = await generateCourseContent(course, setLoading);
      
      if (result.success) {
        console.log("✅ Course content generated successfully!");
        await updateCoursePublishStatusAction(params.courseId);
        router.replace(`/create-course/${params.courseId}/finish`);
      } else {
        console.error("❌ Failed to generate course content:", result.error);
        
        if (result.error?.includes("429") || result.error?.includes("Too Many Requests")) {
          alert(
            "⚠️ Rate Limit Exceeded!\n\n" +
            "You've made too many requests to the Gemini API.\n\n" +
            "Please wait 1-2 minutes and try again.\n\n" +
            `Successfully generated: ${result.successCount || 0}/${result.totalChapters} chapters`
          );
        } else {
          alert(
            `Some chapters failed to generate.\n\n` +
            `Success: ${result.successCount || 0}/${result.totalChapters}\n\n` +
            `Check the console for details.`
          );
        }
      }
    } catch (error: any) {
      console.error("Error:", error);
      
      if (error.message?.includes("429")) {
        alert("⚠️ Rate Limit Error: Please wait 1-2 minutes and try again.");
      } else {
        alert("An error occurred while generating content. Please check the console and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 px-7 md:px-20 lg:px-44">
      <h2 className="font-bold text-center text-2xl">Course Layout</h2>

      <LoadingDialog loading={loading} />

      {/* Basic Info */}
      <CourseBasicInfo courseInfo={course} onRefresh={() => getCourse()} />

      {/* Course Details */}
      <CourseDetail courseDetail={course} />

      {/* List Of Lessons */}
      <ChapterList course={course} onRefresh={() => getCourse()} />

      <Button className="my-10" onClick={handleGenerateCourseContent}>
        Generate Course Content
      </Button>
    </div>
  );
};

export default CoursePageLayout;
