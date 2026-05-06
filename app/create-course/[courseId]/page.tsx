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
      router.replace(`/course/${params.courseId}`);
    }

    setLoading(false);
  };

  return (
    <div>
      {/* Top Navigation Header - Professional & UX Friendly */}
      <div className="fixed left-0 right-0 top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
        <div className="section-shell flex h-16 items-center justify-between">
          {/* Left Section - Navigation & Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-lg px-3 py-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100 text-sm font-medium"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="rounded-lg px-3 py-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100 text-sm font-medium"
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => router.push("/create-course")}
                className="rounded-lg px-3 py-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100 text-sm font-medium"
              >
                Create Course
              </button>
            </div>
            <div className="hidden border-l border-white/10 pl-4 md:block">
              <h1 className="text-lg font-semibold text-slate-100">
                {course?.courseName || "Course Preview"}
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

        <div className="my-10 flex flex-col sm:flex-row items-center gap-4">
          {course?.isPublished ? (
            <>
              <Button 
                className="bg-primary text-slate-950 hover:bg-primary/90 w-full sm:w-auto" 
                onClick={() => router.push(`/course/${params.courseId}`)}
              >
                Start Course
              </Button>
              <Button 
                variant="outline"
                className="border-white/20 bg-slate-900/50 text-slate-100 hover:bg-slate-800 w-full sm:w-auto" 
                onClick={() => router.push("/dashboard")}
              >
                Go to Dashboard
              </Button>
            </>
          ) : (
            <>
              <Button 
                className="bg-primary text-slate-950 hover:bg-primary/90 w-full sm:w-auto" 
                onClick={handleGenerateCourseContent}
                disabled={loading}
              >
                {loading ? "Adding to Dashboard..." : "Add to Dashboard"}
              </Button>

              <div className="relative group w-full sm:w-auto">
                <Button 
                  variant="outline"
                  disabled
                  className="w-full sm:w-auto border-white/20 bg-slate-900/50 text-slate-400 gap-2 cursor-not-allowed"
                >
                  Improve Course
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </Button>
                
                {/* Tooltip for disabled button */}
                <div className="absolute left-1/2 -top-10 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded shadow-lg z-10 border border-white/10">
                  Available with subscription
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePageLayout;