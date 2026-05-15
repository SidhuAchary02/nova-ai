"use client";

import { LuPuzzle } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import EditCourseBasicInfo from "./_edit/EditCourseBasicInfo";
import { CourseType } from "@/types/types";
import Link from "next/link";
import { parseCourseOutput } from "@/utils/parseCourseOutput";
import CourseCover from "@/components/common/CourseCover";

type CourseBasicInfoProps = {
  courseInfo: CourseType | null;
  onRefresh: (refresh: boolean) => void;
  edit?: boolean;
};

const CourseBasicInfo = ({
  courseInfo,
  onRefresh,
  edit = true,
}: CourseBasicInfoProps) => {
  const courseOutput = parseCourseOutput(courseInfo?.courseOutput);

  // console.log("Course Info", courseInfo);

  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_16px_30px_rgba(2,6,23,0.4)] sm:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="">
          <h2 className="text-3xl font-bold text-slate-100">
            {courseOutput?.topic || "Untitled Course"}
            {edit && (
              <EditCourseBasicInfo
                courseInfo={courseInfo}
                onRefresh={() => onRefresh(true)}
              />
            )}
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            {courseOutput?.description || "No description available"}
          </p>
          <h2 className="mt-2 flex items-center gap-2 font-medium text-primary">
            <LuPuzzle /> {courseInfo?.category}
          </h2>

          {!edit && (
            <Link href={`/course/${courseInfo?.courseId}/start`}>
              <Button className="mt-5 w-full bg-primary text-slate-950 hover:bg-primary/90">Start</Button>
            </Link>
          )}
        </div>
        <div className="relative h-[250px] overflow-hidden rounded-xl">
          <CourseCover
            title={courseOutput?.topic || courseInfo?.courseName}
            category={courseInfo?.category}
            imageUrl={courseInfo?.courseBanner}
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default CourseBasicInfo;
