import { LuTimer } from "react-icons/lu";
import { FaCheckCircle } from "react-icons/fa";
import EditChapters from "./_edit/EditChapters";
import { CourseType } from "@/types/types";
import { parseCourseOutput } from "@/utils/parseCourseOutput";
import { formatDuration } from "@/utils/formatDuration";

type ChapterListProps = {
  course: CourseType | null;
  onRefresh: (refresh: boolean) => void;
  edit?: boolean;
};

const ChapterList = ({ course, onRefresh, edit = true }: ChapterListProps) => {
  if (!course) return <p className="text-slate-300">No course available.</p>;

  const courseOutput = parseCourseOutput(course.courseOutput);

  if (!courseOutput?.chapters?.length) {
    return <p className="text-slate-300">No chapters available.</p>;
  }

  return (
    <div className="mt-3">
      <h2 className="text-2xl font-medium text-slate-100">Chapters</h2>

      <div className="mt-2">
        {courseOutput.chapters.map((chapter, index) => (
          <div
            key={index}
            className="mb-2 flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/60 p-5"
          >
            <div className="flex gap-5 items-center">
              <h2 className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary text-center text-slate-950">
                {index + 1}
              </h2>

              <div>
                <h2 className="text-lg font-medium text-slate-100">
                  {chapter.chapterName}

                  {edit && (
                    <EditChapters
                      course={course}
                      index={index}
                      onRefresh={() => onRefresh(true)}
                    />
                  )}
                </h2>

                <p className="text-sm text-slate-400">
                  {chapter.description}
                </p>

                {chapter.duration && (
                  <p className="flex items-center gap-2 text-cyan-300">
                    <LuTimer /> {formatDuration(chapter.duration)}
                  </p>
                )}
              </div>
            </div>

            <FaCheckCircle className="text-4xl text-slate-600 flex-none" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChapterList;