"use client";

import { ChapterContentType, ChapterType, CourseType } from "@/types/types";
import React, { useEffect, useState } from "react";
import ChapterListCard from "./_components/ChapterListCard";
import ChapterContent from "./_components/ChapterContent";
import Image from "next/image";
import UserToolTip from "./_components/UserToolTip";
import ScrollProgress from "@/components/ui/scroll-progress";
import { getCourseByIdPublicAction } from "@/app/actions/getCourseByIdPublic";
import { getChapterContentAction } from "@/app/actions/getChapterContent";
import { markCourseAsCompletedAction } from "@/app/actions/courseEnhancements";
import { toggleChapterCompletionAction } from "@/app/actions/toggleChapterCompletion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { FaCheckCircle, FaRegCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";

type CourseStartProps = {
  params: { courseId: string };
};

const CourseStart = ({ params }: CourseStartProps) => {
  const [course, setCourse] = useState<CourseType | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<ChapterType | null>(
    null
  );
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(0);
  const [chapterContent, setChapterContent] =
    useState<ChapterContentType | null>(null);
  const [completingCourse, setCompletingCourse] = useState(false);
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);
  
  const router = useRouter();

  const getCourse = async () => {
    try {
      const result = await getCourseByIdPublicAction(params.courseId);
      setCourse(result as CourseType);
      setCompletedChapters((result as CourseType).completedChapters || []);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    params && getCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  if (!course) return <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-gray-600">Loading course...</p>
    </div>
  </div>;

  // Check if course content has been generated
  if (!course.isPublished) {
    return (
      <div className="flex items-center justify-center h-screen p-10">
        <div className="text-center max-w-2xl bg-yellow-50 border border-yellow-200 rounded-lg p-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">⚠️ Course Content Not Generated Yet</h2>
          <p className="text-gray-600 mb-6">
            This course needs to have its content generated before you can start learning.
          </p>
          <div className="text-left bg-white rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-3">To generate content:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Go back to the course layout page</li>
              <li>Click the "Generate Course Content" button</li>
              <li>Wait for the AI to generate content for all chapters</li>
              <li>Return here to start learning</li>
            </ol>
          </div>
          <a 
            href={`/create-course/${course.courseId}`}
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition"
          >
            Go to Course Layout
          </a>
        </div>
      </div>
    );
  }

  const getChapterContent = async (chapterId: number) => {
    console.log("Fetching content for chapter:", chapterId, "course:", course.courseId);
    const res = await getChapterContentAction(chapterId, course.courseId);
    console.log("Chapter content received:", res);
    setChapterContent(res as ChapterContentType);
  };

  const handleMarkAsComplete = async () => {
    if (!course) return;
    
    setCompletingCourse(true);
    const result = await markCourseAsCompletedAction(course.courseId);
    
    if (result.success) {
      alert(`🎉 Congratulations! You've completed "${result.courseName}"!\n\nThe course is now marked as completed in your dashboard.`);
      router.push("/dashboard");
    } else {
      alert("Failed to mark course as completed. Please try again.");
    }
    setCompletingCourse(false);
  };

  const handleToggleChapterCompletion = async () => {
    if (!course) return;
    
    const result = await toggleChapterCompletionAction(course.courseId, selectedChapterIndex);
    
    if (result.success) {
      setCompletedChapters(result.completedChapters || []);
    }
  };

  const handlePrevChapter = () => {
    if (selectedChapterIndex > 0 && course) {
      const prevIndex = selectedChapterIndex - 1;
      setSelectedChapterIndex(prevIndex);
      setSelectedChapter(course.courseOutput.chapters[prevIndex]);
      getChapterContent(prevIndex);
    }
  };

  const handleNextChapter = () => {
    if (course && selectedChapterIndex < course.courseOutput.chapters.length - 1) {
      const nextIndex = selectedChapterIndex + 1;
      setSelectedChapterIndex(nextIndex);
      setSelectedChapter(course.courseOutput.chapters[nextIndex]);
      getChapterContent(nextIndex);
    }
  };

  const calculateProgress = () => {
    if (!course) return 0;
    const total = course.courseOutput.chapters.length;
    const completed = completedChapters.length;
    return Math.round((completed / total) * 100);
  };

  const isChapterCompleted = (index: number) => {
    return completedChapters.includes(index);
  };

  const isLastChapter = selectedChapter && course?.courseOutput.chapters && 
    course.courseOutput.chapters[course.courseOutput.chapters.length - 1].chapter_name === selectedChapter.chapter_name;

  //   console.log("chapterContent", chapterContent);

  return (
    <div>
      <div className="fixed md:w-64 hidden md:block h-screen border-r shadow-sm overflow-y-auto">
        <h2 className="font-medium text-lg bg-primary p-4 text-white">
          {course?.courseOutput.topic}
        </h2>
        
        {/* Progress Bar */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-primary">{calculateProgress()}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">
            {completedChapters.length} of {course?.courseOutput.chapters.length} chapters
          </p>
        </div>
        
        <div>
          {course?.courseOutput.chapters.map((chapter, index) => (
            <div
              key={index}
              className={`cursor-pointer hover:bg-purple-100 relative ${
                selectedChapter?.chapter_name === chapter.chapter_name &&
                "bg-purple-50"
              }`}
              onClick={() => {
                setSelectedChapter(chapter);
                setSelectedChapterIndex(index);
                getChapterContent(index);
              }}
            >
              <div className="flex items-center gap-2">
                <div className="pl-3">
                  {isChapterCompleted(index) ? (
                    <FaCheckCircle className="text-green-500" size={16} />
                  ) : (
                    <FaRegCircle className="text-gray-300" size={16} />
                  )}
                </div>
                <div className="flex-1">
                  <ChapterListCard chapter={chapter} index={index} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="md:ml-64">
        {selectedChapter ? (
          <div>
            <ChapterContent
              chapter={selectedChapter}
              content={chapterContent}
            />
            
            {/* Chapter Completion and Navigation */}
            <div className="p-10 mx-10 mb-10 border-t">
              {/* Mark Chapter as Complete Button */}
              <div className="flex justify-center mb-6">
                <Button
                  onClick={handleToggleChapterCompletion}
                  variant={isChapterCompleted(selectedChapterIndex) ? "outline" : "default"}
                  className={`px-6 py-3 ${
                    isChapterCompleted(selectedChapterIndex)
                      ? "border-green-500 text-green-600 hover:bg-green-50"
                      : "bg-primary hover:bg-primary/90"
                  }`}
                >
                  {isChapterCompleted(selectedChapterIndex) ? (
                    <>
                      <FaCheckCircle className="mr-2" /> Chapter Completed
                    </>
                  ) : (
                    <>
                      <FaRegCircle className="mr-2" /> Mark Chapter as Complete
                    </>
                  )}
                </Button>
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex justify-between items-center">
                <Button
                  onClick={handlePrevChapter}
                  disabled={selectedChapterIndex === 0}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FaChevronLeft /> Previous
                </Button>
                
                <span className="text-sm text-gray-500">
                  Chapter {selectedChapterIndex + 1} of {course?.courseOutput.chapters.length}
                </span>
                
                <Button
                  onClick={handleNextChapter}
                  disabled={selectedChapterIndex === (course?.courseOutput.chapters.length || 0) - 1}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  Next <FaChevronRight />
                </Button>
              </div>
            </div>
            
            {/* Show "Mark Course as Complete" button on last chapter */}
            {isLastChapter && (
              <div className="p-10 flex flex-col items-center justify-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg mx-10 mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  🎉 Congratulations!
                </h2>
                <p className="text-gray-600 mb-6 text-center max-w-md">
                  You've reached the end of this course. Mark it as completed to track your progress!
                </p>
                <Button
                  onClick={handleMarkAsComplete}
                  disabled={completingCourse}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 text-lg"
                >
                  {completingCourse ? "Completing..." : "✓ Mark Course as Complete"}
                </Button>
              </div>
            )}
            
            <ScrollProgress />
          </div>
        ) : (
          <div className="p-10 flex justify-center flex-col items-center">
            <Image
              src={course.courseBanner || "/thumbnail.png"}
              alt={course.courseName || "AI Course Generator"}
              width={350}
              height={10}
              priority
              className="rounded-lg hover:shadow-lg hover:scale-105 transition-transform duration-500 cursor-pointer mt-20"
              onError={(e) => {
                // Fallback to default banner if image fails to load
                const target = e.target as HTMLImageElement;
                target.src = "/thumbnail.png";
              }}
            />
            <p className="felx justify-center gap-3 mt-10">
              lets get started with the course {course.courseOutput.topic}.
              Click on the chapters to get started. Enjoy learning!
            </p>
            <p className="mt-10">
              <UserToolTip
                username={course.username || "AI Course Generator"}
                userProfileImage={course.userprofileimage || "/userProfile.png"}
              />
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseStart;
