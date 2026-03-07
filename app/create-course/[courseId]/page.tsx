"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/configs/supabase";

import CourseBasicInfo from "./_components/CourseBasicInfo";
import CourseDetail from "./_components/CourseDetail";
import ChapterList from "./_components/ChapterList";
import LoadingDialog from "../_components/LoadingDialog";
import { Button } from "@/components/ui/button";

import { generateCourseContent } from "./_utils/generateCourseContent";
import { getCourseByIdAction } from "@/app/actions/getCourseById";
import { updateCoursePublishStatusAction } from "@/app/actions/updateCoursePublishStatus";

import { CourseType } from "@/types/types";
import { FaChevronLeft } from "react-icons/fa";

export type ParamsType = {
  courseId: string;
};

const CoursePageLayout = ({ params }: { params: ParamsType }) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [course, setCourse] = useState<CourseType | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email ?? null);
    };

    getUser();
  }, []);

  useEffect(() => {
    if (params?.courseId && userEmail) {
      getCourse();
    }
  }, [params, userEmail]);

  const getCourse = async () => {
    if (!userEmail) return;

    const res = await getCourseByIdAction(params.courseId, userEmail);
    setCourse(res);
  };

  if (!course) {
  return (
    <div className="flex justify-center items-center mt-40">
      Loading course...
    </div>
  );
}

  const handleGenerateCourseContent = async () => {
    setLoading(true);

    const result = await generateCourseContent(course, setLoading);

    if (result.success) {
      await updateCoursePublishStatusAction(params.courseId);
      router.replace(`/create-course/${params.courseId}/finish`);
    }

    setLoading(false);
  };

  return (
    <div>
      {/* Top Navigation Header - Professional & UX Friendly */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-30">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          {/* Left Section - Back Button & Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaChevronLeft size={16} />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
            <div className="hidden md:block border-l border-gray-200 pl-4">
              <h1 className="text-lg font-semibold text-gray-900">
                {course?.courseName || "Create Course"}
              </h1>
            </div>
          </div>

          {/* Right Section - Status */}
          <div className="flex items-center gap-3">
            {course?.isPublished ? (
              <span className="text-xs md:text-sm font-medium px-3 py-1 bg-green-100 text-green-700 rounded-full">
                Published ✓
              </span>
            ) : (
              <span className="text-xs md:text-sm font-medium px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                Draft
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content with top padding */}
      <div className="mt-20 px-7 md:px-20 lg:px-44">
        <h2 className="font-bold text-center text-2xl">Course Layout</h2>

        <LoadingDialog loading={loading} />

        <CourseBasicInfo courseInfo={course} onRefresh={getCourse} />

        <CourseDetail courseDetail={course} />

        <ChapterList course={course} onRefresh={getCourse} />

        <Button className="my-10" onClick={handleGenerateCourseContent}>
          Generate Course Content
        </Button>
      </div>
    </div>
  );
};

export default CoursePageLayout;