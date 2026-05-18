import { CourseType } from "@/types/types";
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
  showPublishedBadge?: boolean;
};

function formatCourseLevel(level?: string | null) {
  if (!level) return "Beginner";

  const normalized = level.trim().toLowerCase();
  if (normalized === "advance" || normalized === "advanced") return "Advanced";
  if (normalized === "intermediate") return "Intermediate";
  if (normalized === "beginner") return "Beginner";

  return level.charAt(0).toUpperCase() + level.slice(1);
}

const CourseCard = ({
  course,
  onRefresh,
  displayUser = false,
  showPublishedBadge = false,
}: CourseCardProps) => {
  const courseOutput = parseCourseOutput(course.courseOutput);
  const courseLevel = formatCourseLevel(course.learningCurrentLevel || course.level);
  const shouldShowCategory =
    Boolean(course.category?.trim()) && course.category.trim().toLowerCase() !== "general";

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
    <div className="group relative flex h-full flex-col rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-card shadow-sm dark:shadow-none transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <Link href={`/course/${course.courseId}`} className="flex h-full flex-col p-3">
        {/* Completed Badge */}
        {course.isCompleted && (
          <div className="absolute right-8 top-8 z-20 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700 shadow-sm dark:shadow-none">
            ✓ Completed
          </div>
        )}

        {/* Published Badge */}
        {showPublishedBadge && course.isPublished && (
          <div className="absolute left-4 top-4 z-20 flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 shadow-sm">
            <span className="material-symbols-outlined text-[12px]">public</span>
            Published
          </div>
        )}

        {/* Course Image */}
        <div className="h-[180px] overflow-hidden rounded-xl border border-black/5 dark:border-white/10 dark:border-white/5">
          <CourseCover
            title={courseOutput?.topic || course.courseName}
            category={course.category}
            imageUrl={course?.courseBanner}
            className="h-full w-full transition duration-300 group-hover:scale-[1.02]"
            compact
            showTitle={true}
          />
        </div>

        {/* Course Info */}
        <div className="flex flex-1 flex-col p-2 pt-4">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-lg font-bold text-nova-heading leading-tight line-clamp-2">
              {courseOutput?.topic ?? "Untitled Course"}
            </h2>

            {!displayUser && (
              <div 
                className="z-30" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <DropDownOptions handleDeleteCourse={() => handleOnDelete()}>
                  <HiOutlineDotsVertical
                    size={20}
                    className="cursor-pointer rounded-md bg-gray-50 dark:bg-nova-card/5 hover:bg-gray-100 dark:bg-nova-card/10 p-1 text-nova-body transition-colors"
                  />
                </DropDownOptions>
              </div>
            )}
          </div>

          {shouldShowCategory && (
            <p className="my-2 line-clamp-1 text-sm text-nova-body font-medium">
              {course.category}
            </p>
          )}

          {/* Chapter Count + Level */}
          <div className={`${shouldShowCategory ? "mt-auto" : "mt-4"} flex items-center justify-between gap-2 pt-3 border-t border-black/5 dark:border-white/10 dark:border-white/5`}>
            <h2 className="flex items-center gap-1.5 rounded-lg bg-nova-bg border border-black/5 dark:border-white/10 dark:border-white/5 px-2.5 py-1.5 text-xs font-semibold text-nova-heading shadow-sm dark:shadow-none">
              <span className="material-symbols-outlined text-[14px] text-nova-primary">menu_book</span>
              {courseOutput?.chapters?.length ?? 0} Chapters
            </h2>

            <h2 className="rounded-lg bg-nova-accent/10 border border-nova-primary/10 px-2.5 py-1.5 text-xs font-bold text-nova-primary shadow-sm dark:shadow-none">
              {courseLevel}
            </h2>
          </div>

          {/* User Info */}
          {displayUser && (
            <div className="mt-4 flex items-center gap-2 pt-3 border-t border-black/5 dark:border-white/10 dark:border-white/5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-bg text-sm font-bold text-nova-primary">
                {(course?.username || "U").charAt(0).toUpperCase()}
              </span>
              <NameChip name={course.username || "Creator"} maxLength={14} className="text-nova-heading font-medium" />
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default CourseCard;
