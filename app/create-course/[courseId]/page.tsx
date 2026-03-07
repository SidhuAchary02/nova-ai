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
    <div className="mt-10 px-7 md:px-20 lg:px-44">
      <h2 className="font-bold text-center text-2xl">Course Layout</h2>

      <LoadingDialog loading={loading} />

      <CourseBasicInfo courseInfo={course} onRefresh={getCourse} />

      <CourseDetail courseDetail={course} />

      <ChapterList course={course} onRefresh={getCourse} />

      <Button className="my-10" onClick={handleGenerateCourseContent}>
        Generate Course Content
      </Button>
    </div>
  );
};

export default CoursePageLayout;