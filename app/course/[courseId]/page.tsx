"use client";

import ChapterList from "@/app/create-course/[courseId]/_components/ChapterList";
import Header from "@/app/dashboard/_components/Header";
import { CourseType } from "@/types/types";
import React, { useEffect, useState } from "react";
import { getCourseByIdPublicAction } from "@/app/actions/getCourseByIdPublic";
import { parseCourseOutput } from "@/utils/parseCourseOutput";
import { FaBook, FaClock, FaGraduationCap } from "react-icons/fa";
import { formatDuration } from "@/utils/formatDuration";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type CourseParams = {
  params: {
    courseId: string;
  };
};

const Course = ({ params }: CourseParams) => {
  const [course, setCourse] = useState<CourseType | null>(null);
  
  const getCourse = async () => {
    const result = await getCourseByIdPublicAction(params.courseId);
    setCourse(result as CourseType);
  };

  useEffect(() => {
    if (params) getCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const courseOutput = parseCourseOutput(course?.courseOutput);

  // Calculate Progress
  const calculateProgress = () => {
    if (!courseOutput?.chapters) return 0;
    
    let totalFreeSubtopics = 0;
    for (let i = 0; i < courseOutput.chapters.length; i++) {
      const subs = courseOutput.chapters[i].subtopics || [];
      for (let j = 0; j < subs.length; j++) {
        // We only calculate progress for free subtopics since it's an overview
        // Or calculate for all if we have access? Let's assume all free for now
        totalFreeSubtopics++;
      }
    }
    
    const completedChapters = (course?.completedChapters as number[]) || [];
    const completed = completedChapters.length;
    return totalFreeSubtopics > 0 ? Math.round((completed / totalFreeSubtopics) * 100) : 0;
  };

  const getFirstUncompletedLesson = () => {
    if (!courseOutput?.chapters) return { chapter: 0, subtopic: 0 };
    
    const completedChapters = (course?.completedChapters as number[]) || [];
    let globalIdx = 0;
    for (let cIdx = 0; cIdx < courseOutput.chapters.length; cIdx++) {
      const subs = courseOutput.chapters[cIdx].subtopics || [];
      for (let sIdx = 0; sIdx < subs.length; sIdx++) {
        if (!completedChapters.includes(globalIdx)) {
          return { chapter: cIdx, subtopic: sIdx };
        }
        globalIdx++;
      }
    }
    return { chapter: 0, subtopic: 0 }; // Default if all completed
  };

  const firstLesson = getFirstUncompletedLesson();
  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      
      {/* Premium Hero Section */}
      <div className="border-b border-white/5 bg-slate-900/50 pt-24 pb-12">
        <div className="section-shell">
          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-100 mb-6 leading-tight">
              {courseOutput?.topic || course?.courseName || "Loading..."}
            </h1>
            <p className="text-lg text-slate-400 mb-8 max-w-3xl leading-relaxed">
              {courseOutput?.description || "Get ready to dive deep into your generated curriculum."}
            </p>

            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-slate-300">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FaBook size={18} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Curriculum</div>
                  <div className="text-sm font-semibold">{courseOutput?.chapters?.length || 0} Chapters</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <FaClock size={18} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Duration</div>
                  <div className="text-sm font-semibold">
                    {courseOutput?.duration ? formatDuration(courseOutput.duration) : "Self-paced"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                  <FaGraduationCap size={18} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Skill Level</div>
                  <div className="text-sm font-semibold capitalize">{course?.level || "Beginner"}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg">
              <div className="flex-1 w-full">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-slate-300">Course Progress</span>
                  <span className="text-sm font-bold text-primary">{progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000 ease-out" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              
              {course && (
                <Link href={`/course/${course.courseId}/start?chapter=${firstLesson.chapter}&subtopic=${firstLesson.subtopic}`} className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-primary text-slate-950 hover:bg-primary/90 px-8 py-6 text-lg font-bold shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                    {progress > 0 ? "Continue Learning" : "Start Course"}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Section */}
      <div className="section-shell py-12">
        <div className="max-w-4xl">
          <ChapterList
            course={course}
            onRefresh={() => getCourse()}
            edit={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Course;
