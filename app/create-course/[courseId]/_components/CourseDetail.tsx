import { CourseType } from "@/types/types";
import { LuTimer, LuBookOpen } from "react-icons/lu";
import { FaChartBar, FaVideo } from "react-icons/fa";
import { parseCourseOutput } from "@/utils/parseCourseOutput";

type CourseDetailProps = {
  courseDetail: CourseType | null;
};

const CourseDetail = ({ courseDetail }: CourseDetailProps) => {
  if (!courseDetail) return null;

  const courseOutput = parseCourseOutput(courseDetail.courseOutput);

  return (
    <div className="border p-7 rounded-xl shadow-sm mt-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        
        <div className="flex gap-2">
          <FaChartBar className="text-4xl text-primary" />
          <div>
            <h2 className="text-xs text-gray-500">Skill Level</h2>
            <h2 className="font-medium text-lg">{courseDetail.level}</h2>
          </div>
        </div>

        <div className="flex gap-2">
          <LuTimer className="text-4xl text-primary" />
          <div>
            <h2 className="text-xs text-gray-500">Duration</h2>
            <h2 className="font-medium text-lg">
              {typeof courseOutput?.duration === 'string' ? courseOutput.duration : courseOutput?.duration?.value ? `${courseOutput.duration.value} ${courseOutput.duration.unit || ''}` : ''}
            </h2>
          </div>
        </div>

        <div className="flex gap-2">
          <LuBookOpen className="text-4xl text-primary" />
          <div>
            <h2 className="text-xs text-gray-500">Chapters</h2>
            <h2 className="font-medium text-lg">
              {courseOutput?.chapters?.length || 0}
            </h2>
          </div>
        </div>

        <div className="flex gap-2">
          <FaVideo className="text-4xl text-primary" />
          <div>
            <h2 className="text-xs text-gray-500">Video Included</h2>
            <h2 className="font-medium text-lg">{typeof courseDetail.isVideo === 'string' ? courseDetail.isVideo : courseDetail.isVideo?.value || ''}</h2>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CourseDetail;