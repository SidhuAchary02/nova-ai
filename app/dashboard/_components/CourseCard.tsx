import { CourseType } from "@/types/types";
import { MdMenuBook } from "react-icons/md";
import { HiOutlineDotsVertical } from "react-icons/hi";
import DropDownOptions from "./DropDownOptions";
import Link from "next/link";
import { deleteCourseAction } from "@/app/actions/deleteCourse";
import { parseCourseOutput } from "@/utils/parseCourseOutput";
import CourseCover from "@/components/common/CourseCover";
import NameChip from "@/components/common/NameChip";

type CourseCardProps = {
  course: CourseType;
  onRefresh: () => void;
  displayUser?: boolean;
};

const CourseCard = ({
  course,
  onRefresh,
  displayUser = false,
}: CourseCardProps) => {
  const courseOutput = parseCourseOutput(course.courseOutput);

  const handleOnDelete = async () => {
    const res = await deleteCourseAction(course.id);

    if (res.success) {
      console.log("✅ Course deleted:", res.deletedCourse?.courseName);
      onRefresh();
    } else {
      console.error("❌ Failed to delete course:", res.error);
      alert("Failed to delete course. Please try again.");
    }
  };

  return (
    <div className="group relative flex h-full flex-col rounded-2xl border border-white/10 bg-slate-900/70 p-2 shadow-[0_10px_28px_rgba(2,6,23,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(2,6,23,0.5)]">
      {/* Completed Badge */}
      {course.isCompleted && (
        <div className="absolute right-4 top-4 z-10 rounded-full border border-emerald-300/30 bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white shadow-lg">
          ✓ Completed
        </div>
      )}

      {/* Course Image */}
      <Link href={`/course/${course.courseId}`}>
        <div className="h-[190px] overflow-hidden rounded-xl">
          <CourseCover
            title={courseOutput?.topic || course.courseName}
            category={course.category}
            imageUrl={course?.courseBanner}
            className="h-full w-full transition duration-300 group-hover:scale-[1.02]"
            compact
            showTitle={false}
          />
        </div>
      </Link>

      {/* Course Info */}
      <div className="flex flex-1 flex-col p-3">
        <h2 className="flex items-start justify-between gap-2 text-lg font-semibold text-slate-100">
          <span className="line-clamp-2">{courseOutput?.topic ?? "Untitled Course"}</span>

          {!displayUser && (
            <DropDownOptions handleDeleteCourse={() => handleOnDelete()}>
              <HiOutlineDotsVertical
                size={20}
                className="cursor-pointer rounded-md bg-slate-800 p-1 text-slate-300 text-sm"
              />
            </DropDownOptions>
          )}
        </h2>

        <p className="my-1 line-clamp-1 text-sm text-slate-400">{course.category}</p>

        {/* Chapter Count + Level */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <h2 className="flex items-center gap-2 rounded-md bg-primary/15 px-2 py-1 text-sm text-primary">
            <MdMenuBook />
            {courseOutput?.chapters?.length ?? 0} Chapters
          </h2>

          <h2 className="rounded-md bg-amber-500/15 px-2 py-1 text-sm text-amber-200">
            {course.level} Level
          </h2>
        </div>

        {/* User Info */}
        {displayUser && (
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-slate-800 text-sm font-semibold text-amber-200">
              {(course?.username || "U").charAt(0).toUpperCase()}
            </span>
            <NameChip name={course.username || "Creator"} maxLength={14} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;