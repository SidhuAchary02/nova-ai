import { LuTimer, LuCode, LuBookOpen } from "react-icons/lu";
import { FaCheckCircle, FaLock, FaPlayCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";
import EditChapters from "./_edit/EditChapters";
import { CourseType } from "@/types/types";
import { parseCourseOutput } from "@/utils/parseCourseOutput";
import { formatDuration } from "@/utils/formatDuration";
import Link from "next/link";
import PremiumDialog from "@/app/course/[courseId]/start/_components/PremiumDialog";
import { useState, useEffect } from "react";

type ChapterListProps = {
  course: CourseType | null;
  onRefresh: (refresh: boolean) => void;
  edit?: boolean;
};

const ChapterList = ({ course, onRefresh, edit = true }: ChapterListProps) => {
  const [showPremiumCTA, setShowPremiumCTA] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<number[]>([0]);

  useEffect(() => {
    // If not in edit mode, auto-expand the first chapter with uncompleted subtopics
    if (!edit && course) {
      const courseOutput = parseCourseOutput(course.courseOutput);
      if (courseOutput?.chapters) {
        const completedChapters = (course.completedChapters as number[]) || [];
        let globalIdx = 0;
        for (let cIdx = 0; cIdx < courseOutput.chapters.length; cIdx++) {
          const subs = courseOutput.chapters[cIdx].subtopics || [];
          let hasUncompleted = false;
          for (let sIdx = 0; sIdx < subs.length; sIdx++) {
            if (!completedChapters.includes(globalIdx)) {
              hasUncompleted = true;
              break;
            }
            globalIdx++;
          }
          if (hasUncompleted) {
            setExpandedChapters([cIdx]);
            break;
          }
        }
      }
    }
  }, [course, edit]);

  const toggleChapter = (index: number) => {
    setExpandedChapters((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  if (!course) return <p className="text-nova-body">No course available.</p>;

  const courseOutput = parseCourseOutput(course.courseOutput);

  if (!courseOutput?.chapters?.length) {
    return <p className="text-nova-body">No chapters available.</p>;
  }

  const getGlobalSubtopicIndex = (cIdx: number, sIdx: number) => {
    let globalIdx = 0;
    for (let i = 0; i < cIdx; i++) {
      globalIdx += courseOutput.chapters[i].subtopics?.length || 0;
    }
    return globalIdx + sIdx;
  };

  return (
    <div className="mt-8">
      <PremiumDialog open={showPremiumCTA} onOpenChange={setShowPremiumCTA} />
      <h2 className="text-2xl font-semibold text-nova-heading mb-6">Course Lessons</h2>

      <div className="space-y-4">
        {courseOutput.chapters.map((chapter: any, index: number) => {
          const isExpanded = expandedChapters.includes(index);
          
          return (
            <div
              key={index}
              className={`rounded-xl border transition-all duration-300 ${
                isExpanded ? "border-primary/30 bg-white/60" : "border-black/5 bg-white/40 hover:bg-white/60 hover:border-black/10"
              }`}
            >
              {/* Header */}
              <div 
                className="flex items-center justify-between p-5 sm:p-6 cursor-pointer"
                onClick={() => toggleChapter(index)}
              >
                <div className="flex gap-4 items-center min-w-0">
                  <div className={`flex h-10 w-10 flex-none items-center justify-center rounded-full font-bold text-lg border transition-colors ${
                    isExpanded ? "bg-primary/20 text-primary border-primary/30" : "bg-gray-50 text-nova-body border-black/5"
                  }`}>
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <h3 className={`text-lg font-bold leading-tight truncate ${isExpanded ? "text-nova-heading" : "text-nova-body"}`}>
                      {chapter.chapterName}
                    </h3>
                    {chapter.duration && (
                      <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-gray-400">
                        <LuTimer /> {formatDuration(chapter.duration)} • {chapter.subtopics?.length || 0} Lessons
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 flex-none ml-4">
                  {edit && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <EditChapters
                        course={course}
                        index={index}
                        onRefresh={() => onRefresh(true)}
                      />
                    </div>
                  )}
                  <div className={`p-2 rounded-full transition-colors ${isExpanded ? "bg-primary/10 text-primary" : "bg-gray-50 text-nova-body"}`}>
                    {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                  </div>
                </div>
              </div>

              {/* Expandable Content */}
              {isExpanded && (
                <div className="px-5 pb-6 sm:px-6 sm:pb-6 pt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                  <p className="text-sm text-nova-body leading-relaxed max-w-3xl mb-6 pl-14">
                    {chapter.description}
                  </p>

                  {chapter.subtopics && chapter.subtopics.length > 0 && (
                    <div className="space-y-2 pl-14">
                      {chapter.subtopics.map((subtopic: string, sIdx: number) => {
                        const globalIdx = getGlobalSubtopicIndex(index, sIdx);
                        const isLocked = globalIdx > 4;
                        const isCompleted = (course.completedChapters as number[] || []).includes(globalIdx);

                        const SubtopicWrapper = edit ? "div" : (isLocked ? "div" : Link);

                        // Pseudo-randomly assign a lesson icon type based on name
                        const isCoding = subtopic.toLowerCase().includes('code') || subtopic.toLowerCase().includes('build') || subtopic.toLowerCase().includes('react');
                        const LessonIcon = isCoding ? LuCode : LuBookOpen;

                        return (
                          <SubtopicWrapper
                            key={sIdx}
                            href={!edit && !isLocked ? `/course/${course.courseId}/start/${index}/${sIdx}` : ""}
                            onClick={() => {
                              if (!edit && isLocked) setShowPremiumCTA(true);
                            }}
                            className={`flex items-center justify-between p-3.5 rounded-xl border ${
                              isLocked 
                                ? "bg-nova-bg/50 border-black/5 opacity-75 cursor-pointer hover:bg-white/50" 
                                : "bg-gray-50/40 border-black/5 hover:bg-gray-50/80 hover:border-primary/30 transition-all cursor-pointer group"
                            }`}
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="flex-none flex items-center justify-center w-6">
                                {isCompleted ? (
                                  <FaCheckCircle className="text-emerald-500 text-lg" />
                                ) : isLocked ? (
                                  <FaLock className="text-amber-500/60" size={14} />
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                )}
                              </div>
                              <div className="flex items-center gap-3 min-w-0">
                                <LessonIcon className={`flex-none ${isLocked ? 'text-gray-400' : 'text-nova-body group-hover:text-primary/70'} transition-colors`} size={16} />
                                <span className={`text-sm font-medium truncate ${isLocked ? "text-gray-400" : "text-nova-heading group-hover:text-primary"}`}>
                                  {subtopic}
                                </span>
                              </div>
                            </div>

                            {!edit && !isLocked && (
                              <div className="flex items-center gap-4 flex-none ml-4">
                                <span className="hidden sm:flex text-xs font-medium text-gray-400">
                                  ~ {Math.floor(Math.random() * 10) + 5} min
                                </span>
                                <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                  <FaPlayCircle /> Start
                                </span>
                              </div>
                            )}
                            {!edit && isLocked && (
                              <div className="flex items-center flex-none ml-4">
                                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-[10px] font-bold text-amber-500/70 uppercase tracking-wider">
                                  Premium
                                </span>
                              </div>
                            )}
                          </SubtopicWrapper>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChapterList;
