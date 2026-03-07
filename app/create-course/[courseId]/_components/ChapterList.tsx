import { LuTimer } from "react-icons/lu";
import { FaCheckCircle } from "react-icons/fa";
import EditChapters from "./_edit/EditChapters";
import { CourseType } from "@/types/types";
import { parseCourseOutput } from "@/utils/parseCourseOutput";

type ChapterListProps = {
  course: CourseType | null;
  onRefresh: (refresh: boolean) => void;
  edit?: boolean;
};

const ChapterList = ({ course, onRefresh, edit = true }: ChapterListProps) => {
  if (!course) return <p>No course available.</p>;

  const courseOutput = parseCourseOutput(course.courseOutput);

  if (!courseOutput?.chapters?.length) {
    return <p>No chapters available.</p>;
  }

  return (
    <div className="mt-3">
      <h2 className="font-medium text-2xl">Chapters</h2>

      <div className="mt-2">
        {courseOutput.chapters.map((chapter, index) => (
          <div
            key={index}
            className="border p-5 rounded-lg mb-2 flex items-center justify-between"
          >
            <div className="flex gap-5 items-center">
              <h2 className="bg-primary h-10 w-10 flex-none text-white rounded-full text-center p-2">
                {index + 1}
              </h2>

              <div>
                <h2 className="font-medium text-lg">
                  {chapter.chapterName}

                  {edit && (
                    <EditChapters
                      course={course}
                      index={index}
                      onRefresh={() => onRefresh(true)}
                    />
                  )}
                </h2>

                <p className="text-sm text-gray-500">
                  {chapter.description}
                </p>

                {chapter.duration && (
                  <p className="flex gap-2 text-primary items-center">
                    <LuTimer /> {typeof chapter.duration === 'string' ? chapter.duration : chapter.duration?.value ? `${chapter.duration.value} ${chapter.duration.unit || ''}` : ''}
                  </p>
                )}
              </div>
            </div>

            <FaCheckCircle className="text-4xl text-gray-300 flex-none" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChapterList;