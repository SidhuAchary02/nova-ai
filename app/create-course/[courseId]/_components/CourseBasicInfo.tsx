"use client";

import Image from "next/image";
import { LuPuzzle } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import EditCourseBasicInfo from "./_edit/EditCourseBasicInfo";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { uploadFilesToFirebase } from "../_utils/uploadFilesToFirebase";
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
  const [selectedImage, setSelectedImage] = useState<string | null | undefined>(
    null
  );
  const courseOutput = parseCourseOutput(courseInfo?.courseOutput);

  useEffect(() => {
    setSelectedImage(courseInfo?.courseBanner);
  }, [courseInfo]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0) as Blob;
    setSelectedImage(URL.createObjectURL(file));
    uploadFilesToFirebase(file, courseInfo!);
  };

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
          <h2 className="mt-2 flex items-center gap-2 font-medium text-cyan-300">
            <LuPuzzle /> {courseInfo?.category}
          </h2>

          {!edit && (
            <Link href={`/course/${courseInfo?.courseId}/start`}>
              <Button className="mt-5 w-full bg-primary text-slate-950 hover:bg-primary/90">Start</Button>
            </Link>
          )}
        </div>
        <div className="relative h-[250px] overflow-hidden rounded-xl">
          <label htmlFor="image-upload">
            <CourseCover
              title={courseOutput?.topic || courseInfo?.courseName}
              category={courseInfo?.category}
              imageUrl={selectedImage || courseInfo?.courseBanner}
              className={`h-full w-full ${edit ? "cursor-pointer" : ""}`}
            />
          </label>
          {edit && (
            <Input
              type="file"
              accept="image/*"
              id="image-upload"
              className="opacity-0"
              onChange={handleImageUpload}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseBasicInfo;
