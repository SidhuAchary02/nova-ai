"use client";

import { ChapterContentType, ChapterType, CourseType } from "@/types/types";
import React, { useEffect, useState } from "react";
import ChapterListCard from "./_components/ChapterListCard";
import ChapterContent from "./_components/ChapterContent";
import ChapterQuiz from "./_components/ChapterQuiz";
import CertificateModal from "./_components/CertificateModal";
import ScrollProgress from "@/components/ui/scroll-progress";
import { getCourseByIdPublicAction } from "@/app/actions/getCourseByIdPublic";
import { getChapterContentAction } from "@/app/actions/getChapterContent";
import { markCourseAsCompletedAction } from "@/app/actions/courseEnhancements";
import { toggleChapterCompletionAction } from "@/app/actions/toggleChapterCompletion";
import { generateQuizAction, QuizQuestion } from "@/app/actions/generateQuiz";
import { storeQuizResultAction, getQuizPassedChaptersAction } from "@/app/actions/storeQuizResult";
import { generateCertificateAction, getCertificateAction } from "@/app/actions/generateCertificate";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { FaCheckCircle, FaRegCircle, FaChevronLeft, FaChevronRight, FaBars, FaTimes } from "react-icons/fa";
import { parseCourseOutput } from "@/utils/parseCourseOutput";
import CourseCover from "@/components/common/CourseCover";
import Link from "next/link";

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
  const [quizPassedChapters, setQuizPassedChapters] = useState<number[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizPassed, setQuizPassed] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateData, setCertificateData] = useState<any>(null);

  const router = useRouter();

  const getChapterContent = async (
    chapterId: number,
    activeCourse?: CourseType | null
  ) => {
    const resolvedCourse = activeCourse ?? course;
    if (!resolvedCourse) return;

    setShowQuiz(false);
    setQuizQuestions([]);

    const quizAlreadyPassed = quizPassedChapters.includes(chapterId);
    setQuizPassed(quizAlreadyPassed);

    const res = await getChapterContentAction(chapterId, resolvedCourse.courseId);
    setChapterContent(res as ChapterContentType);
  };

  const getCourse = async () => {
    try {
      const result = await getCourseByIdPublicAction(params.courseId);
      const currentCourse = result as CourseType;

      if (!currentCourse) return;

      setCourse(currentCourse);
      setCompletedChapters(currentCourse.completedChapters || []);
      
      // Load quiz passed chapters from database
      const passedChapters = await getQuizPassedChaptersAction(params.courseId);
      setQuizPassedChapters(passedChapters);
      
      if (currentCourse.isPublished) {
        const parsed = parseCourseOutput(currentCourse.courseOutput);
        const firstChapter = parsed?.chapters?.[0];

        if (firstChapter) {
          setSelectedChapter(firstChapter);
          setSelectedChapterIndex(0);
          setQuizPassed(passedChapters.includes(0));
          await getChapterContent(0, currentCourse);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    params && getCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  if (!course) return (
    <div className="min-h-screen">
      {/* Loading Header */}
      <div className="fixed left-0 right-0 top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
        <div className="section-shell flex h-16 items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800"
          >
            <FaChevronLeft size={16} />
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <h1 className="text-lg font-semibold text-slate-100">Loading Course...</h1>
        </div>
      </div>

      {/* Loading Content */}
      <div className="flex items-center justify-center h-screen pt-16">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-slate-300">Loading course...</p>
        </div>
      </div>
    </div>
  );

  // Check if course content has been generated
  if (!course.isPublished) {
    return (
      <div className="min-h-screen">
        {/* Top Navigation Header */}
        <div className="fixed left-0 right-0 top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
          <div className="section-shell flex h-16 items-center justify-between">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-300 transition-colors hover:bg-slate-800"
            >
              <FaChevronLeft size={16} />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
            <h1 className="text-lg font-semibold text-slate-100">Setup Course Content</h1>
          </div>
        </div>

        {/* Content Area with top padding */}
        <div className="flex items-center justify-center min-h-screen pt-20 p-10">
          <div className="max-w-2xl rounded-2xl border border-amber-300/20 bg-amber-500/10 p-10 text-center">
            <h2 className="mb-4 text-2xl font-bold text-amber-200">Course Content Not Generated Yet</h2>
            <p className="mb-6 text-slate-300">
              This course needs to have its content generated before you can start learning.
            </p>
            <div className="mb-6 rounded-xl border border-white/10 bg-slate-900/60 p-6 text-left">
              <h3 className="mb-3 font-semibold text-slate-100">To generate content:</h3>
              <ol className="list-inside list-decimal space-y-2 text-slate-300">
                <li>Go back to the course layout page</li>
                <li>Click the &quot;Generate Course Content&quot; button</li>
                <li>Wait for the AI to generate content for all chapters</li>
                <li>Return here to start learning</li>
              </ol>
            </div>
            <Link
              href={`/create-course/${course.courseId}`}
              className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-slate-950 transition hover:bg-primary/90"
            >
              Go to Course Layout
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleGenerateQuiz = async () => {
    if (!chapterContent || !selectedChapter || !course) return;

    setLoadingQuiz(true);
    try {
      // Extract content text for quiz generation
      const contentText = chapterContent.content
        .map((section: any) => `${section.title}: ${section.explanation}`)
        .join("\n\n");

      const questions = await generateQuizAction(
        selectedChapter.chapterName,
        course.courseName,
        contentText
      );

      setQuizQuestions(questions);
      setShowQuiz(true);
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleQuizComplete = async (passed: boolean, score: number) => {
    setQuizPassed(passed);
    
    // Store quiz result in database
    const result = await storeQuizResultAction(
      course!.courseId,
      selectedChapterIndex,
      passed,
      score
    );
    
    if (result.success) {
      setQuizPassedChapters(result.quizPassedChapters || []);
    }
  };

  const handleMarkAsComplete = async () => {
    if (!course) return;
    
    setCompletingCourse(true);
    
    try {
      // Generate certificate
      const certResult = await generateCertificateAction(course.courseId);
      
      // Mark course as completed
      const result = await markCourseAsCompletedAction(course.courseId);
      
      if (result.success && certResult.success) {
        // Fetch and display certificate
        const certData = await getCertificateAction(course.courseId);
        if (certData.success) {
          setCertificateData(certData);
          setShowCertificate(true);
        }
      } else {
        alert("Failed to mark course as completed. Please try again.");
      }
    } catch (error) {
      console.error("Error completing course:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setCompletingCourse(false);
    }
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
      const courseOutput = parseCourseOutput(course.courseOutput);
      if (courseOutput?.chapters) {
        const prevIndex = selectedChapterIndex - 1;
        setSelectedChapterIndex(prevIndex);
        setSelectedChapter(courseOutput.chapters[prevIndex]);
        getChapterContent(prevIndex);
      }
    }
  };

  const handleNextChapter = () => {
    if (course) {
      const courseOutput = parseCourseOutput(course.courseOutput);
      if (courseOutput?.chapters && selectedChapterIndex < courseOutput.chapters.length - 1) {
        const nextIndex = selectedChapterIndex + 1;
        setSelectedChapterIndex(nextIndex);
        setSelectedChapter(courseOutput.chapters[nextIndex]);
        getChapterContent(nextIndex);
      }
    }
  };

  const calculateProgress = () => {
    if (!course) return 0;
    const courseOutput = parseCourseOutput(course.courseOutput);
    const total = courseOutput?.chapters?.length || 0;
    const completed = completedChapters.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const isChapterCompleted = (index: number) => {
    return completedChapters.includes(index);
  };

  const isLastChapter = (() => {
    if (!selectedChapter || !course) return false;
    const courseOutput = parseCourseOutput(course.courseOutput);
    if (!courseOutput?.chapters || courseOutput.chapters.length === 0) return false;
    const lastChapter = courseOutput.chapters[courseOutput.chapters.length - 1];
    return lastChapter.chapterName === selectedChapter.chapterName;
  })();

  //   console.log("chapterContent", chapterContent);
  const courseOutput = parseCourseOutput(course?.courseOutput);

  return (
    <div className="min-h-screen">
      {/* Top Navigation Header - Professional & UX Friendly */}
      <div className="fixed left-0 right-0 top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
        <div className="section-shell flex h-16 items-center justify-between">
          {/* Left Section - Back Button & Course Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-300 transition-colors hover:bg-slate-800"
            >
              <FaChevronLeft size={16} />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
            <div className="hidden border-l border-white/10 pl-4 md:block">
              <h1 className="truncate text-lg font-semibold text-slate-100">
                {course?.courseName}
              </h1>
            </div>
          </div>

          {/* Right Section - Progress & Sidebar Toggle */}
          <div className="flex items-center gap-4">
            {selectedChapter && (
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="font-medium text-slate-300">
                  Chapter {selectedChapterIndex + 1}/{courseOutput?.chapters?.length || 0}
                </span>
                <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${((selectedChapterIndex + 1) / (courseOutput?.chapters?.length || 1)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`rounded-lg p-2.5 transition-all duration-300 ${
                sidebarOpen
                  ? "bg-primary text-slate-950 hover:bg-primary/90"
                  : "border border-white/15 bg-slate-900 text-slate-200 hover:bg-slate-800"
              }`}
              title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Toggle Button - Keep for mobile consistency */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed left-4 top-4 z-50 rounded-lg p-2.5 transition-all duration-300 md:hidden ${
          sidebarOpen
            ? "bg-primary text-slate-950 hover:bg-primary/90"
            : "border border-white/15 bg-slate-900 text-slate-200 hover:bg-slate-800"
        }`}
      >
        {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar - Professional Styling */}
      <div
        className={`fixed top-16 z-40 h-[calc(100vh-64px)] w-72 overflow-y-auto border-r border-white/10 bg-slate-950/95 transition-all duration-300 lg:left-0 lg:translate-x-0 ${
          sidebarOpen ? "left-0" : "-left-72"
        }`}
      >
        {/* Sidebar Header */}
        <div className="border-b border-white/10 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800">
          <h2 className="truncate p-4 text-lg font-bold text-slate-100">
            {courseOutput?.topic || "Course"}
          </h2>
        </div>
        
        {/* Progress Bar */}
        <div className="border-b border-white/10 bg-slate-900/50 p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-slate-200">Progress</span>
            <span className="text-sm font-bold text-primary">{calculateProgress()}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
          <p className="mt-2 text-xs text-slate-400">
            {completedChapters.length} of {courseOutput?.chapters?.length || 0} chapters
          </p>
        </div>
        
        {/* Chapters List */}
        <div className="divide-y divide-white/5">
          {courseOutput?.chapters?.map((chapter, index) => (
            <div
              key={index}
              className={`cursor-pointer transition-all duration-200 ${
                selectedChapter?.chapterName === chapter.chapterName
                  ? "border-l-4 border-primary bg-primary/10"
                  : "border-l-4 border-transparent hover:bg-slate-900"
              }`}
              onClick={() => {
                setSelectedChapter(chapter);
                setSelectedChapterIndex(index);
                getChapterContent(index);
                setSidebarOpen(false);
              }}
            >
              <div className="flex items-center gap-3 p-3">
                <div className="transition-all duration-200">
                  {isChapterCompleted(index) ? (
                    <FaCheckCircle className="text-green-500" size={16} />
                  ) : (
                    <FaRegCircle className={`transition-colors ${
                      selectedChapter?.chapterName === chapter.chapterName
                        ? "text-primary/50"
                        : "text-slate-500"
                    }`} size={16} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <ChapterListCard chapter={chapter} index={index} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Sidebar Overlay - Professional */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/55 backdrop-blur-sm transition-all duration-300 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className="pt-20 lg:pl-72">
        {selectedChapter ? (
          <div className="section-shell max-w-6xl">
            <ChapterContent
              chapter={selectedChapter}
              content={chapterContent}
              courseCategory={course?.category}
              courseId={course?.courseId}
              courseName={course?.courseName}
              chapterId={selectedChapterIndex}
            />
            
            {/* Quiz Section */}
            {!showQuiz && chapterContent && (
              <div className="mx-auto max-w-4xl px-4 py-8">
                <Button
                  onClick={handleGenerateQuiz}
                  disabled={loadingQuiz}
                  className="w-full bg-primary py-3 text-lg text-slate-950 hover:bg-primary/90"
                >
                  {loadingQuiz ? "Generating Quiz..." : "Take Chapter Quiz"}
                </Button>
                <p className="mt-2 text-center text-sm text-slate-400">
                  You must pass the quiz (70%+) to complete this chapter
                </p>
              </div>
            )}

            {showQuiz && quizQuestions.length > 0 && (
              <div className="max-w-4xl mx-auto px-4 py-8">
                <ChapterQuiz
                  questions={quizQuestions}
                  chapterName={selectedChapter.chapterName}
                  onQuizComplete={handleQuizComplete}
                />
              </div>
            )}
            
            {/* Chapter Completion and Navigation */}
            {!showQuiz && (
              <div className="px-4 py-8 mx-auto max-w-4xl border-t">
                {/* Mark Chapter as Complete Button */}
                <div className="flex justify-center mb-6">
                  <Button
                    onClick={handleToggleChapterCompletion}
                    disabled={!quizPassed}
                    variant={isChapterCompleted(selectedChapterIndex) ? "outline" : "default"}
                    className={`px-6 py-3 ${
                      !quizPassed
                        ? "opacity-50 cursor-not-allowed"
                        : isChapterCompleted(selectedChapterIndex)
                        ? "border-green-400 text-green-300 hover:bg-green-500/10"
                        : "bg-primary text-slate-950 hover:bg-primary/90"
                    }`}
                  >
                    {!quizPassed ? (
                      <>
                        <FaRegCircle className="mr-2" /> Complete Quiz First
                      </>
                    ) : isChapterCompleted(selectedChapterIndex) ? (
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
                    className="flex items-center gap-2 border-white/20 bg-slate-900/50 text-slate-200"
                  >
                    <FaChevronLeft /> Previous
                  </Button>
                  
                  <span className="text-sm text-slate-400">
                    Chapter {selectedChapterIndex + 1} of {courseOutput?.chapters?.length || 0}
                  </span>
                  
                  <Button
                    onClick={handleNextChapter}
                    disabled={selectedChapterIndex === (courseOutput?.chapters?.length || 0) - 1}
                    variant="outline"
                    className="flex items-center gap-2 border-white/20 bg-slate-900/50 text-slate-200"
                  >
                    Next <FaChevronRight />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Show "Mark Course as Complete" button on last chapter */}
            {isLastChapter && quizPassed && (
              <div className="mx-auto mb-10 flex max-w-4xl flex-col items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/80 to-slate-800/70 px-4 py-8">
                <h2 className="mb-4 text-2xl font-bold text-slate-100">
                  🎉 Congratulations!
                </h2>
                <p className="mb-6 max-w-md text-center text-slate-300">
                  You&apos;ve reached the end of this course. Mark it as completed to track your progress!
                </p>
                <Button
                  onClick={handleMarkAsComplete}
                  disabled={completingCourse}
                  className="bg-primary px-8 py-3 text-lg text-slate-950 hover:bg-primary/90"
                >
                  {completingCourse ? "Completing..." : "✓ Mark Course as Complete"}
                </Button>
              </div>
            )}
            
            <ScrollProgress />
          </div>
        ) : (
          <div className="section-shell flex min-h-[65vh] max-w-5xl items-center justify-center">
            <div className="w-full rounded-2xl border border-white/10 bg-slate-900/70 p-8 text-center">
              <div className="mx-auto h-[190px] max-w-lg overflow-hidden rounded-xl">
                <CourseCover
                  title={courseOutput?.topic || course.courseName}
                  category={course.category}
                  imageUrl={course.courseBanner}
                  className="h-full w-full"
                />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-slate-100">
                Preparing your first chapter...
              </h2>
              <p className="mt-2 text-slate-400">
                If this takes long, click any chapter from the left panel.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {course && (
        <CertificateModal
          isOpen={showCertificate}
          onClose={() => setShowCertificate(false)}
          courseName={course.courseName}
          userName={course.username || "Student"}
          courseLevel={course.level}
          issuedDate={certificateData?.certificateData?.issuedDate}
          certificateId={certificateData?.certificateData?.certificateId}
        />
      )}
    </div>
  );
};

export default CourseStart;
