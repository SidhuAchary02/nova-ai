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
      <div className="fixed left-0 right-0 top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
        <div className="section-shell flex h-16 items-center justify-between">
          {/* Left Section - Back Button & Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100"
            >
              <FaChevronLeft size={16} />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
            <div className="hidden border-l border-white/10 pl-4 md:block">
              <h1 className="text-lg font-semibold text-slate-100">
                {course?.courseName || "Create Course"}
              </h1>
            </div>
          </div>

          {/* Right Section - Status */}
          <div className="flex items-center gap-3">
            {course?.isPublished ? (
              <span className="rounded-full border border-emerald-300/20 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200 md:text-sm">
                Published ✓
              </span>
            ) : (
              <span className="rounded-full border border-amber-300/20 bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-200 md:text-sm">
                Draft
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content with top padding */}
      <div className="section-shell mt-20 pb-8">
        <h2 className="text-center text-2xl font-bold text-slate-100">Course Layout</h2>

        <LoadingDialog loading={loading} />

        <CourseBasicInfo courseInfo={course} onRefresh={getCourse} />

        <CourseDetail courseDetail={course} />

        <ChapterList course={course} onRefresh={getCourse} />

        <Button className="my-10 bg-primary text-slate-950 hover:bg-primary/90" onClick={handleGenerateCourseContent}>
          Generate Course Content
        </Button>
      </div>
    </div>
  );
};

export default CoursePageLayout;