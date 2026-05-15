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
import { getGeneratedChapterIdsAction } from "@/app/actions/getCourseChapterProgress";
import { markCourseAsCompletedAction } from "@/app/actions/courseEnhancements";
import { toggleChapterCompletionAction } from "@/app/actions/toggleChapterCompletion";
import { generateQuizAction, QuizQuestion } from "@/app/actions/generateQuiz";
import { storeQuizResultAction, getQuizPassedChaptersAction } from "@/app/actions/storeQuizResult";
import { generateCertificateAction, getCertificateAction } from "@/app/actions/generateCertificate";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { FaCheckCircle, FaRegCircle, FaChevronLeft, FaChevronRight, FaBars, FaTimes, FaLock } from "react-icons/fa";
import { parseCourseOutput } from "@/utils/parseCourseOutput";
import CourseCover from "@/components/common/CourseCover";
import Link from "next/link";
import { generateCourseContent } from "@/app/create-course/[courseId]/_utils/generateCourseContent";

type CourseStartProps = {
  params: {
    courseId: string;
    chapterIndex?: string;
    subtopicIndex?: string;
  };
};

const parseRouteIndex = (value: string | undefined, fallback = 0) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const CourseStart = ({ params }: CourseStartProps) => {
  const [course, setCourse] = useState<CourseType | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<ChapterType | null>(
    null
  );
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(0);
  const [selectedSubtopicIndex, setSelectedSubtopicIndex] = useState<number>(0);
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
  const [showPremiumCTA, setShowPremiumCTA] = useState(false);
  const [generatedChapterIds, setGeneratedChapterIds] = useState<number[]>([]);
  const [generatingChapter, setGeneratingChapter] = useState(false);
  
  // Accordion state for sidebar
  const [expandedSidebarChapters, setExpandedSidebarChapters] = useState<number[]>([0]);

  const router = useRouter();

  const getChapterContent = async (
    chapterId: number,
    activeCourse?: CourseType | null
  ) => {
    const resolvedCourse = activeCourse ?? course;
    if (!resolvedCourse) return;

    setShowPremiumCTA(false);
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
        const totalCourseChapters = parsed?.chapters?.length || 0;
        const generatedProgress = await getGeneratedChapterIdsAction(currentCourse.courseId);
        const currentGeneratedChapterIds = generatedProgress.success
          ? generatedProgress.chapterIds
          : [];

        setGeneratedChapterIds(currentGeneratedChapterIds);
        
        const legacySearchParams = new URLSearchParams(window.location.search);
        const legacyChapterParam = legacySearchParams.get("chapter");
        const legacySubtopicParam = legacySearchParams.get("subtopic");
        const initialChapterIdx = Math.min(
          parseRouteIndex(params.chapterIndex ?? legacyChapterParam ?? undefined),
          Math.max(0, totalCourseChapters - 1)
        );
        const initialSubtopicIdx = parseRouteIndex(
          params.subtopicIndex ?? legacySubtopicParam ?? undefined
        );
        
        setExpandedSidebarChapters([initialChapterIdx]);
        
        const initialChapter = parsed?.chapters?.[initialChapterIdx];

        if (initialChapter) {
          const initialSubtopicsCount = initialChapter.subtopics?.length || 1;
          const safeInitialSubtopicIdx = Math.min(
            initialSubtopicIdx,
            Math.max(0, initialSubtopicsCount - 1)
          );
          const canonicalPath = `/course/${currentCourse.courseId}/start/${initialChapterIdx}/${safeInitialSubtopicIdx}`;

          if (window.location.pathname !== canonicalPath || window.location.search) {
            router.replace(canonicalPath);
            return;
          }

          setSelectedChapter(initialChapter);
          setSelectedChapterIndex(initialChapterIdx);
          setSelectedSubtopicIndex(safeInitialSubtopicIdx);
          setQuizPassed(passedChapters.includes(initialChapterIdx));
          if (currentGeneratedChapterIds.includes(initialChapterIdx)) {
            await getChapterContent(initialChapterIdx, currentCourse);
          } else {
            setChapterContent(null);
            setShowPremiumCTA(true);
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.courseId, params.chapterIndex, params.subtopicIndex]);

  useEffect(() => {
    if (course && !course.isPublished) {
      router.replace(`/course/${course.courseId}`);
    }
  }, [course, router]);

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Redirecting to course layout...</p>
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

  const handleToggleLessonCompletion = async () => {
    if (!course) return;
    
    const globalIdx = getGlobalSubtopicIndex(selectedChapterIndex, selectedSubtopicIndex);
    const result = await toggleChapterCompletionAction(course.courseId, globalIdx);
    
    if (result.success) {
      setCompletedChapters(result.completedChapters || []);
    }
  };

  const refreshGeneratedChapterIds = async () => {
    if (!course) return [];
    const generatedProgress = await getGeneratedChapterIdsAction(course.courseId);
    const nextGeneratedChapterIds = generatedProgress.success
      ? generatedProgress.chapterIds
      : [];
    setGeneratedChapterIds(nextGeneratedChapterIds);
    return nextGeneratedChapterIds;
  };

  const handleGenerateSelectedChapter = async () => {
    if (!course || !selectedChapter) return;

    setGeneratingChapter(true);
    try {
      const result = await generateCourseContent(course, setGeneratingChapter, {
        chapterIndex: selectedChapterIndex,
      });

      if (!result.success) {
        alert(result.error || "Failed to generate this chapter");
        return;
      }

      await refreshGeneratedChapterIds();
      await getChapterContent(selectedChapterIndex, course);
      setShowPremiumCTA(false);
    } catch (error) {
      console.error("Failed to generate selected chapter:", error);
      alert("Failed to generate this chapter");
    } finally {
      setGeneratingChapter(false);
    }
  };

  const navigateToLesson = (cIdx: number, sIdx: number) => {
    if (!course || !courseOutput?.chapters) return;
    const targetChapter = courseOutput.chapters[cIdx];
    if (!targetChapter) return;
    const isGenerated = generatedChapterIds.includes(cIdx);

    setSelectedChapterIndex(cIdx);
    setSelectedChapter(targetChapter);
    setSelectedSubtopicIndex(sIdx);
    setShowPremiumCTA(!isGenerated);
    if (!isGenerated) {
      setChapterContent(null);
      setShowQuiz(false);
      setQuizQuestions([]);
    }
    
    router.push(`/course/${course.courseId}/start/${cIdx}/${sIdx}`);
    
    // Only fetch content if changing chapters
    if (isGenerated && cIdx !== selectedChapterIndex) {
      getChapterContent(cIdx);
    }
  };

  const handlePrevLesson = () => {
    if (!courseOutput?.chapters) return;

    if (selectedSubtopicIndex > 0) {
      navigateToLesson(selectedChapterIndex, selectedSubtopicIndex - 1);
    } else if (selectedChapterIndex > 0) {
      const prevChapterIndex = selectedChapterIndex - 1;
      const prevChapter = courseOutput.chapters[prevChapterIndex];
      navigateToLesson(prevChapterIndex, (prevChapter.subtopics?.length || 1) - 1);
    }
  };

  const handleNextLesson = () => {
    if (!courseOutput?.chapters) return;

    const currentChapter = courseOutput.chapters[selectedChapterIndex];
    const subtopicsCount = currentChapter?.subtopics?.length || 1;

    if (selectedSubtopicIndex < subtopicsCount - 1) {
      navigateToLesson(selectedChapterIndex, selectedSubtopicIndex + 1);
    } else if (selectedChapterIndex < courseOutput.chapters.length - 1) {
      navigateToLesson(selectedChapterIndex + 1, 0);
    }
  };

  const courseOutput = parseCourseOutput(course?.courseOutput);
  const totalChapters = courseOutput?.chapters?.length || 0;
  const generatedChapterSet = new Set(generatedChapterIds);
  const generatedUnlockedChapters = Math.min(generatedChapterIds.length, totalChapters);

  const isLastChapter =
    !!course &&
    !!courseOutput?.chapters?.length &&
    generatedChapterIds.length === totalChapters &&
    selectedChapterIndex >= totalChapters - 1;

  // Pre-calculate global subtopic offsets for progress tracking
  const getGlobalSubtopicIndex = (cIdx: number, sIdx: number) => {
    let globalIdx = 0;
    if (!courseOutput?.chapters) return 0;
    for (let i = 0; i < cIdx; i++) {
      globalIdx += courseOutput.chapters[i].subtopics?.length || 0;
    }
    return globalIdx + sIdx;
  };

  const totalSubtopics =
    courseOutput?.chapters?.reduce(
      (sum, chapter) => sum + (chapter.subtopics?.length || 0),
      0
    ) || 0;
  const completedSubtopics = completedChapters.filter(idx => idx < totalSubtopics).length;

  const calculateProgress = () => {
    if (!totalSubtopics) return 0;
    return Math.round((completedSubtopics / totalSubtopics) * 100);
  };

  const isLessonCompleted = (globalIndex: number) => {
    return completedChapters.includes(globalIndex);
  };

  const isLastSubtopic = (() => {
    if (!selectedChapter || !courseOutput) return false;
    if (!courseOutput?.chapters || courseOutput.chapters.length === 0) return false;
    
    // Find the last available subtopic
    let lastChapterIdx = courseOutput.chapters.length - 1;
    let lastSubtopicIdx = (courseOutput.chapters[lastChapterIdx].subtopics?.length || 1) - 1;

    return selectedChapterIndex === lastChapterIdx && selectedSubtopicIndex === lastSubtopicIdx;
  })();

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
                  Chapter {selectedChapterIndex + 1}/{totalChapters || 1}
                </span>
                <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${totalChapters > 0 ? ((selectedChapterIndex + 1) / totalChapters) * 100 : 0}%`,
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
            <span className="text-sm font-semibold text-slate-200">Course Progress</span>
            <span className="text-sm font-bold text-primary">{calculateProgress()}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
          <p className="mt-2 text-xs text-slate-400">
            {completedSubtopics} of {totalSubtopics} lessons completed
          </p>
        </div>
        
        {/* Chapters List */}
        <div className="divide-y divide-white/5">
          {courseOutput?.chapters?.map((chapter: any, index: number) => {
            const isSelectedChapter = selectedChapter?.chapterName === chapter.chapterName;
            const isExpanded = expandedSidebarChapters.includes(index);
            const isChapterGenerated = generatedChapterSet.has(index);

            return (
              <div key={index} className="border-b border-white/5 last:border-0 bg-slate-950">
                {/* Chapter Header */}
                <div
                  className={`cursor-pointer transition-all duration-200 flex items-center justify-between p-3 group ${
                    isSelectedChapter
                      ? "border-l-4 border-primary bg-primary/5"
                      : !isChapterGenerated
                      ? "border-l-4 border-transparent hover:bg-slate-900/50 opacity-60"
                      : "border-l-4 border-transparent hover:bg-slate-900/50"
                  }`}
                  onClick={() => {
                    // Toggle expansion state
                    setExpandedSidebarChapters(prev => 
                      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
                    );
                    
                    // Auto-select chapter if not locked
                    if (!isSelectedChapter) {
                      navigateToLesson(index, 0);
                    }
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="transition-all duration-200">
                      {!isChapterGenerated ? (
                        <FaLock className="text-amber-500/70" size={14} />
                      ) : isLessonCompleted(getGlobalSubtopicIndex(index, 0)) ? (
                        <FaCheckCircle className="text-green-500" size={16} />
                      ) : (
                        <div className={`w-2 h-2 rounded-full transition-colors ${
                          isSelectedChapter ? "bg-primary" : "bg-slate-600 group-hover:bg-primary/50"
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <ChapterListCard chapter={chapter} index={index} />
                    </div>
                  </div>
                  
                  {/* Accordion Arrow */}
                  <div className={`transition-transform duration-200 flex-none ml-2 ${isExpanded ? "rotate-180 text-primary" : "text-slate-500"}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>

                {/* Subtopics List (Rendered as accordion) */}
                {isExpanded && chapter.subtopics && chapter.subtopics.length > 0 && (
                  <div className="bg-slate-950 py-1 animate-in slide-in-from-top-2 fade-in duration-200 shadow-inner">
                    {chapter.subtopics.map((subtopic: string, sIdx: number) => {
                      const isSelectedSubtopic = isSelectedChapter && selectedSubtopicIndex === sIdx;
                      const globalSubtopicIdx = getGlobalSubtopicIndex(index, sIdx);
                      const isSubtopicLocked = !isChapterGenerated;
                      
                      return (
                        <div
                          key={sIdx}
                          className={`pl-12 pr-4 py-2.5 cursor-pointer text-sm transition-all duration-200 border-l-2 ${
                            isSelectedSubtopic 
                              ? "border-primary text-primary bg-primary/10 font-medium" 
                              : isSubtopicLocked
                              ? "border-transparent text-slate-500 hover:text-slate-400 hover:bg-slate-900/30 opacity-70"
                              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToLesson(index, sIdx);
                            if (window.innerWidth < 1024) setSidebarOpen(false);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 truncate">
                              {isLessonCompleted(globalSubtopicIdx) ? (
                                <FaCheckCircle className="text-green-500 flex-shrink-0" size={12} />
                              ) : (
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isSelectedSubtopic ? "bg-primary" : "bg-current opacity-30"}`} />
                              )}
                              <span className="truncate">{subtopic}</span>
                            </div>
                            {isSubtopicLocked && <FaLock className="text-amber-500/50 flex-shrink-0" size={10} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
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
        {showPremiumCTA ? (
          <div className="section-shell max-w-4xl px-4 py-12">
            <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center shadow-xl">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
                <FaLock className="h-8 w-8 text-amber-500" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-slate-100">
                Generate this chapter
              </h2>
              <p className="mb-8 mx-auto max-w-lg text-lg text-slate-300">
                The roadmap for this chapter is ready, but its lesson content has not been generated yet. Generate only this chapter when you are ready.
              </p>
              <Button
                type="button"
                onClick={handleGenerateSelectedChapter}
                disabled={generatingChapter}
                className="bg-amber-500 px-8 py-4 text-lg font-bold text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]"
              >
                {generatingChapter ? "Generating chapter..." : "Generate This Chapter"}
              </Button>
            </div>
          </div>
        ) : selectedChapter ? (
          <div className="section-shell max-w-6xl">
            <ChapterContent
              chapter={selectedChapter}
              content={chapterContent}
              courseCategory={course?.category}
              courseId={course?.courseId}
              courseName={course?.courseName}
              chapterId={selectedChapterIndex}
              subtopicIndex={selectedSubtopicIndex}
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
                    onClick={handleToggleLessonCompletion}
                    disabled={!quizPassed && selectedSubtopicIndex === ((selectedChapter?.subtopics?.length || 1) - 1)}
                    variant={isLessonCompleted(getGlobalSubtopicIndex(selectedChapterIndex, selectedSubtopicIndex)) ? "outline" : "default"}
                    className={`px-6 py-3 ${
                      !quizPassed && selectedSubtopicIndex === ((selectedChapter?.subtopics?.length || 1) - 1)
                        ? "opacity-50 cursor-not-allowed"
                        : isLessonCompleted(getGlobalSubtopicIndex(selectedChapterIndex, selectedSubtopicIndex))
                        ? "border-green-400 text-green-300 hover:bg-green-500/10"
                        : "bg-primary text-slate-950 hover:bg-primary/90"
                    }`}
                  >
                    {!quizPassed && selectedSubtopicIndex === ((selectedChapter?.subtopics?.length || 1) - 1) ? (
                      <>
                        <FaRegCircle className="mr-2" /> Complete Quiz First
                      </>
                    ) : isLessonCompleted(getGlobalSubtopicIndex(selectedChapterIndex, selectedSubtopicIndex)) ? (
                      <>
                        <FaCheckCircle className="mr-2" /> Lesson Completed
                      </>
                    ) : (
                      <>
                        <FaRegCircle className="mr-2" /> Mark Lesson as Complete
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex justify-between items-center">
                  <Button
                    onClick={handlePrevLesson}
                    disabled={selectedChapterIndex === 0 && selectedSubtopicIndex === 0}
                    variant="outline"
                    className="flex items-center gap-2 border-white/20 bg-slate-900/50 text-slate-200"
                  >
                    <FaChevronLeft /> Previous Lesson
                  </Button>
                  
                  <span className="text-sm text-slate-400">
                    Lesson {getGlobalSubtopicIndex(selectedChapterIndex, selectedSubtopicIndex) + 1}
                  </span>
                  
                  <Button
                    onClick={handleNextLesson}
                    disabled={isLastSubtopic}
                    variant="outline"
                    className="flex items-center gap-2 border-white/20 bg-slate-900/50 text-slate-200"
                  >
                    Next Lesson <FaChevronRight />
                  </Button>
                </div>
              </div>
            )}
            
            {/* End of generated batch / full completion */}
            {isLastChapter && quizPassed && (
              <div className="mx-auto mb-10 flex max-w-4xl flex-col items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/80 to-slate-800/70 px-4 py-8">
                {generatedUnlockedChapters < totalChapters ? (
                  <>
                    <h2 className="mb-4 text-2xl font-bold text-slate-100">
                      Ready for the Next Batch
                    </h2>
                    <p className="mb-6 max-w-md text-center text-slate-300">
                      You finished everything that is currently generated. Go back to the course builder and generate the next set of chapters.
                    </p>
                    <Link
                      href={`/create-course/${course?.courseId}`}
                      className="rounded-lg bg-primary px-8 py-3 text-lg font-semibold text-slate-950 hover:bg-primary/90"
                    >
                      Generate Next Chapters
                    </Link>
                  </>
                ) : (
                  <>
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
                  </>
                )}
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
