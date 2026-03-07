"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BaseEnvironment } from "@/configs/BaseEnvironment";
import { IoCopyOutline } from "react-icons/io5";
import Link from "next/link";

import { supabase } from "@/configs/supabase";
import { CourseType } from "@/types/types";
import { ParamsType } from "../page";
import CourseBasicInfo from "../_components/CourseBasicInfo";
import { getCourseByIdAction } from "@/app/actions/getCourseById";

const FinsihScreen = ({ params }: { params: ParamsType }) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [course, setCourse] = useState<CourseType | null>(null);

  const router = useRouter();
  const { HOST_URL } = new BaseEnvironment();

  const COURSE_LINK = `${HOST_URL}/course/${course?.courseId}/start`;

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

  return (
    <div className="px-10 md:px-20 lg:px-44 my-7">
      <h2 className="text-center font-bold text-2xl my-3 text-primary">
        Congrats! Your course is Ready
      </h2>

      <CourseBasicInfo
        courseInfo={course}
        onRefresh={() => console.log("Refreshing")}
      />

      <h2 className="mt-3">Course URL</h2>

      <h2 className="text-center font-bold text-gray-400 border p-2 rounded flex gap-5 items-center">
        <Link
          href={COURSE_LINK}
          className="cursor-pointer hover:text-primary transition-all"
        >
          {COURSE_LINK}
        </Link>

        <IoCopyOutline
          className="h-5 w-5 cursor-pointer hover:text-primary hover:scale-110"
          onClick={async () =>
            await navigator.clipboard.writeText(COURSE_LINK)
          }
        />
      </h2>
    </div>
  );
};

export default FinsihScreen;