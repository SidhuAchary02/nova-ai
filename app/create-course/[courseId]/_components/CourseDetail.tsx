import { CourseType } from "@/types/types";
import { LuTimer, LuBookOpen } from "react-icons/lu";
import { FaChartBar, FaVideo } from "react-icons/fa";
import { parseCourseOutput } from "@/utils/parseCourseOutput";
import { formatDuration } from "@/utils/formatDuration";

type CourseDetailProps = {
  courseDetail: CourseType | null;
};

const CourseDetail = ({ courseDetail }: CourseDetailProps) => {
  if (!courseDetail) return null;

  const courseOutput = parseCourseOutput(courseDetail.courseOutput);

  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-slate-900/60 p-7 shadow-[0_16px_30px_rgba(2,6,23,0.35)]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        
        <div className="flex gap-2">
          <FaChartBar className="text-4xl text-cyan-300" />
          <div>
            <h2 className="text-xs text-slate-400">Skill Level</h2>
            <h2 className="text-lg font-medium text-slate-100">{courseDetail.level}</h2>
          </div>
        </div>

        <div className="flex gap-2">
          <LuTimer className="text-4xl text-cyan-300" />
          <div>
            <h2 className="text-xs text-slate-400">Duration</h2>
            <h2 className="text-lg font-medium text-slate-100">
              {formatDuration(courseOutput?.duration)}
            </h2>
          </div>
        </div>

        <div className="flex gap-2">
          <LuBookOpen className="text-4xl text-cyan-300" />
          <div>
            <h2 className="text-xs text-slate-400">Chapters</h2>
            <h2 className="text-lg font-medium text-slate-100">
              {courseOutput?.chapters?.length || 0}
            </h2>
          </div>
        </div>

        <div className="flex gap-2">
          <FaVideo className="text-4xl text-cyan-300" />
          <div>
            <h2 className="text-xs text-slate-400">Video Included</h2>
            <h2 className="text-lg font-medium text-slate-100">
              {typeof courseDetail.isVideo === 'string' 
                ? courseDetail.isVideo 
                : typeof courseDetail.isVideo === 'object' && courseDetail.isVideo?.value 
                ? String(courseDetail.isVideo.value) 
                : ''}
            </h2>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CourseDetail;