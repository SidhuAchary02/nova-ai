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
    <div className="section-shell my-7">
      <h2 className="my-3 text-center text-2xl font-bold text-primary">
        Congrats! Your course is Ready
      </h2>

      <CourseBasicInfo
        courseInfo={course}
        onRefresh={() => console.log("Refreshing")}
      />

      <h2 className="mt-5 text-slate-200">Course URL</h2>

      <h2 className="mt-2 flex items-center gap-5 rounded-lg border border-white/10 bg-slate-900/70 p-2 text-center font-bold text-slate-300">
        <Link
          href={COURSE_LINK}
          className="cursor-pointer transition-all hover:text-primary"
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