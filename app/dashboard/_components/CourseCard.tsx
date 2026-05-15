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
    <div className="group relative flex h-full flex-col rounded-2xl border border-black/5 bg-white p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      {/* Completed Badge */}
      {course.isCompleted && (
        <div className="absolute right-5 top-5 z-10 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700 shadow-sm">
          ✓ Completed
        </div>
      )}

      {/* Course Image */}
      <Link href={`/course/${course.courseId}`}>
        <div className="h-[180px] overflow-hidden rounded-xl border border-black/5">
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
      <div className="flex flex-1 flex-col p-2 pt-4">
        <h2 className="flex items-start justify-between gap-2 text-lg font-bold text-nova-heading leading-tight">
          <span className="line-clamp-2">{courseOutput?.topic ?? "Untitled Course"}</span>

          {!displayUser && (
            <DropDownOptions handleDeleteCourse={() => handleOnDelete()}>
              <HiOutlineDotsVertical
                size={20}
                className="cursor-pointer rounded-md bg-gray-50 hover:bg-gray-100 p-1 text-nova-body transition-colors"
              />
            </DropDownOptions>
          )}
        </h2>

        <p className="my-2 line-clamp-1 text-sm text-nova-body font-medium">{course.category}</p>

        {/* Chapter Count + Level */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-black/5">
          <h2 className="flex items-center gap-1.5 rounded-lg bg-nova-bg border border-black/5 px-2.5 py-1.5 text-xs font-semibold text-nova-heading shadow-sm">
            <span className="material-symbols-outlined text-[14px] text-nova-primary">menu_book</span>
            {courseOutput?.chapters?.length ?? 0} Chapters
          </h2>

          <h2 className="rounded-lg bg-nova-accent/10 border border-nova-primary/10 px-2.5 py-1.5 text-xs font-bold text-nova-primary shadow-sm">
            {course.level}
          </h2>
        </div>

        {/* User Info */}
        {displayUser && (
          <div className="mt-4 flex items-center gap-2 pt-3 border-t border-black/5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/5 bg-nova-bg text-sm font-bold text-nova-primary">
              {(course?.username || "U").charAt(0).toUpperCase()}
            </span>
            <NameChip name={course.username || "Creator"} maxLength={14} className="text-nova-heading font-medium" />
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;