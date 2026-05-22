"use client";

import { ChapterContentType, ChapterType, CourseType } from "@/types/types";
import React, { useEffect, useState } from "react";
import ChapterListCard from "./_components/ChapterListCard";
import ChapterContent from "./_components/ChapterContent";
import CourseLearningChatbot from "./_components/CourseLearningChatbot";
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
import { supabase } from "@/configs/supabase";
import {
  getMarketplaceAddStatusAction,
  toggleMarketplaceLessonCompletionAction,
} from "@/app/actions/marketplaceCourse";
import ProfileMenu from "@/components/common/ProfileMenu";
import QueueStatusPanel from "@/components/common/QueueStatusPanel";
import type { QueueStatusResult } from "@/app/actions/generationQueue";

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
  const [queueStatus, setQueueStatus] = useState<QueueStatusResult | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Generating chapter...");
  const [activeSpecialTab, setActiveSpecialTab] = useState<'assessment' | 'certificate' | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [marketplaceAdded, setMarketplaceAdded] = useState(false);
  
  // Accordion state for sidebar
  const [expandedSidebarChapters, setExpandedSidebarChapters] = useState<number[]>([0]);

  const router = useRouter();

  const getChapterContent = async (
    chapterId: number,
    activeCourse?: CourseType | null
  ) => {
    const resolvedCourse = activeCourse ?? course;
    if (!resolvedCourse) return null;

    setShowPremiumCTA(false);
    setShowQuiz(false);
    setQuizQuestions([]);

    const quizAlreadyPassed = quizPassedChapters.includes(chapterId);
    setQuizPassed(quizAlreadyPassed);

    const res = await getChapterContentAction(chapterId, resolvedCourse.courseId);
    const nextContent = res as ChapterContentType | null;
    setChapterContent(nextContent);
    return nextContent;
  };

  const hasUsableChapterContent = (content: ChapterContentType | null) => {
    const lessons = content?.content;
    return Array.isArray(lessons) && lessons.length > 0;
  };

  const getCourse = async (email?: string | null) => {
    try {
      const result = await getCourseByIdPublicAction(params.courseId, email);
      const currentCourse = result as CourseType;

      if (!currentCourse) return;

      setCourse(currentCourse);
      setCompletedChapters(currentCourse.completedChapters || []);
      setMarketplaceAdded(false);
      
      // Load quiz passed chapters from database
      const passedChapters = await getQuizPassedChaptersAction(params.courseId);
      setQuizPassedChapters(passedChapters);

      if (email && currentCourse.createdBy !== email && currentCourse.isPublished) {
        const addStatus = await getMarketplaceAddStatusAction(currentCourse.courseId, email);
        setMarketplaceAdded(addStatus.added);
        setCompletedChapters(addStatus.completedChapters || []);
      }

      if (currentCourse.isPublished || currentCourse.createdBy === email) {
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
            const content = await getChapterContent(initialChapterIdx, currentCourse);
            setShowPremiumCTA(!hasUsableChapterContent(content));
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
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email ?? null;
      const name =
        data.user?.user_metadata?.full_name ||
        data.user?.user_metadata?.name ||
        data.user?.email?.split("@")[0] ||
        null;
      setUserEmail(email);
      setUserName(name);
      await getCourse(email);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.courseId, params.chapterIndex, params.subtopicIndex]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (generatingChapter) {
      setLoadingProgress(0);
      setLoadingText("Generating chapter...");
      
      const texts = [
        "Generating chapter...",
        "Creating subtopics...",
        "Structuring content...",
        "Almost ready..."
      ];
      
      let currentProgress = 0;
      interval = setInterval(() => {
        currentProgress += Math.random() * 5 + 2;
        if (currentProgress > 95) currentProgress = 95;
        setLoadingProgress(currentProgress);
        
        if (currentProgress < 25) setLoadingText(texts[0]);
        else if (currentProgress < 50) setLoadingText(texts[1]);
        else if (currentProgress < 75) setLoadingText(texts[2]);
        else setLoadingText(texts[3]);
      }, 500);
    } else {
      setLoadingProgress(100);
    }
    return () => clearInterval(interval);
  }, [generatingChapter]);

  useEffect(() => {
    if (course && !course.isPublished && course.createdBy !== userEmail) {
      router.replace(`/course/${course.courseId}`);
    }
  }, [course, router, userEmail]);

  if (!course) return (
    <div className="min-h-screen">
      {/* Loading Header */}
      <div className="fixed left-0 right-0 top-0 z-30 border-b border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-bg/85 backdrop-blur-xl">
        <div className="section-shell flex h-16 items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-nova-body hover:bg-gray-50 dark:bg-nova-card/5"
          >
            <FaChevronLeft size={16} />
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <h1 className="text-lg font-semibold text-nova-heading">Loading Course...</h1>
        </div>
      </div>

      {/* Loading Content */}
      <div className="flex items-center justify-center h-screen pt-16">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-nova-body">Loading course...</p>
        </div>
      </div>
    </div>
  );

  // Check if course content has been generated
  if (!course.isPublished && course.createdBy !== userEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-nova-body">Redirecting to course layout...</p>
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
    if (!isOwner) {
      alert("Marketplace course completion is tracked per lesson in your dashboard.");
      return;
    }
    
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
    const result = userEmail && marketplaceAdded && course.createdBy !== userEmail
      ? await toggleMarketplaceLessonCompletionAction(course.courseId, userEmail, globalIdx)
      : await toggleChapterCompletionAction(course.courseId, globalIdx);
    
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
    if (!course || !selectedChapter || course.createdBy !== userEmail) return;

    setGeneratingChapter(true);
    setQueueStatus(null);
    try {
      const result = await generateCourseContent(course, setGeneratingChapter, {
        chapterIndex: selectedChapterIndex,
        onQueueStatus: setQueueStatus,
      });

      if (!result.success) {
        alert(result.error || "Failed to generate this chapter");
        return;
      }

      await refreshGeneratedChapterIds();
      const content = await getChapterContent(selectedChapterIndex, course);
      setShowPremiumCTA(!hasUsableChapterContent(content));
    } catch (error) {
      console.error("Failed to generate selected chapter:", error);
      alert("Failed to generate this chapter");
    } finally {
      setGeneratingChapter(false);
    }
  };

  const navigateToLesson = (cIdx: number, sIdx: number) => {
    setActiveSpecialTab(null);
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
      getChapterContent(cIdx).then((content) => {
        setShowPremiumCTA(!hasUsableChapterContent(content));
      });
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
  const isOwner = Boolean(course && userEmail && course.createdBy === userEmail);
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

  const isChapterFullyCompleted = (chapterIndex: number) => {
    if (!courseOutput?.chapters) return false;
    const targetChapter = courseOutput.chapters[chapterIndex];
    if (!targetChapter) return false;
    
    const subtopicCount = targetChapter.subtopics?.length || 1;
    for (let i = 0; i < subtopicCount; i++) {
      if (!isLessonCompleted(getGlobalSubtopicIndex(chapterIndex, i))) {
        return false;
      }
    }
    return true;
  };

  const isCourseFullyCompleted = () => {
    if (!totalSubtopics) return false;
    return completedSubtopics >= totalSubtopics;
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
      <div className="fixed left-0 right-0 top-0 z-30 border-b border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-bg/85 backdrop-blur-xl">
        <div className="section-shell flex h-16 items-center justify-between">
          {/* Left Section - Logo, Back Button & Course Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 pr-4 border-r border-black/5 dark:border-white/10 hidden sm:flex">
              <div className="w-8 h-8 bg-nova-primary rounded-lg flex items-center justify-center text-white shadow-sm">
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              </div>
              <span className="font-bold text-nova-heading tracking-tight">UpSkillAi</span>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-nova-body transition-colors hover:bg-gray-50 dark:bg-nova-card/5"
            >
              <FaChevronLeft size={16} />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
            <div className="hidden border-l border-black/5 dark:border-white/10 dark:border-white/5 pl-4 md:block">
              <h1 className="truncate text-lg font-semibold text-nova-heading">
                {course?.courseName}
              </h1>
            </div>
          </div>

          {/* Right Section - Progress & Sidebar Toggle */}
          <div className="flex items-center gap-4">
            {selectedChapter && (
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="font-medium text-nova-body">
                  Chapter {selectedChapterIndex + 1}/{totalChapters || 1}
                </span>
              </div>
            )}

            <ProfileMenu userName={userName} />
          </div>
        </div>
      </div>

      {/* Sidebar Toggle Button - Keep for mobile consistency */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed left-4 top-4 z-50 rounded-lg p-2.5 transition-all duration-300 md:hidden ${
          sidebarOpen
            ? "bg-primary text-white hover:bg-primary/90"
            : "border border-black/10 dark:border-white/10 dark:border-white/10 bg-nova-card text-nova-heading hover:bg-gray-50 dark:bg-nova-card/5"
        }`}
      >
        {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar - Professional Styling */}
      <div
        className={`fixed top-16 z-40 h-[calc(100vh-64px)] w-72 overflow-y-auto border-r border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-bg/95 transition-all duration-300 lg:left-0 lg:translate-x-0 ${
          sidebarOpen ? "left-0" : "-left-72"
        }`}
      >
        {/* Sidebar Header */}
        <div className="border-b border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-card">
          <h2 className="truncate p-4 text-lg font-bold text-nova-heading">
            {courseOutput?.topic || "Course"}
          </h2>
        </div>
        
        {/* Progress Bar */}
        <div className="border-b border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-card/50 p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-nova-heading">Course Progress</span>
            <span className="text-sm font-bold text-primary">{calculateProgress()}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
          <p className="mt-2 text-xs text-nova-body">
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
              <div key={index} className="border-b border-black/5 dark:border-white/10 dark:border-white/5 last:border-0 bg-nova-bg">
                {/* Chapter Header */}
                <div
                  className={`cursor-pointer transition-all duration-200 flex items-center justify-between p-3 group ${
                    isSelectedChapter
                      ? "border-l-4 border-primary bg-primary/5"
                      : !isChapterGenerated
                      ? "border-l-4 border-transparent hover:bg-nova-card/50 opacity-60"
                      : "border-l-4 border-transparent hover:bg-nova-card/50"
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
                      ) : isChapterFullyCompleted(index) ? (
                        <FaCheckCircle className="text-green-500" size={16} />
                      ) : (
                        <div className={`w-2 h-2 rounded-full transition-colors ${
                          isSelectedChapter && !activeSpecialTab ? "bg-primary" : "bg-black/20 group-hover:bg-primary/50"
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <ChapterListCard chapter={chapter} index={index} />
                    </div>
                  </div>
                  
                  {/* Accordion Arrow */}
                  <div className={`transition-transform duration-200 flex-none ml-2 ${isExpanded ? "rotate-180 text-primary" : "text-gray-400"}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>

                {/* Subtopics List (Rendered as accordion) */}
                {isExpanded && chapter.subtopics && chapter.subtopics.length > 0 && (
                  <div className="bg-nova-bg py-1 animate-in slide-in-from-top-2 fade-in duration-200 shadow-inner">
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
                              ? "border-transparent text-gray-400 hover:text-nova-body hover:bg-nova-card/30 opacity-70"
                              : "border-transparent text-nova-body hover:text-nova-heading hover:bg-nova-card"
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

          {/* Mega Assessment & Certificate Tabs */}
          <div className="border-t-4 border-black/5 dark:border-white/10 bg-nova-bg">
            {/* Mega Assessment */}
            <div
              className={`cursor-pointer transition-all duration-200 flex items-center p-4 gap-3 group border-l-4 ${
                activeSpecialTab === 'assessment'
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-transparent hover:bg-nova-card/50 text-nova-heading"
              }`}
              onClick={() => {
                setActiveSpecialTab('assessment');
                setSelectedChapter(null); // Deselect normal chapter
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            >
              <div className="flex-none">
                {!isCourseFullyCompleted() ? (
                  <FaLock className="text-amber-500/70" size={14} />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                )}
              </div>
              <div className="font-bold flex-1 truncate">Mega Assessment</div>
            </div>

            {/* Certificate */}
            <div
              className={`cursor-pointer transition-all duration-200 flex items-center p-4 gap-3 group border-l-4 border-t border-black/5 dark:border-white/5 ${
                activeSpecialTab === 'certificate'
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-transparent hover:bg-nova-card/50 text-nova-heading"
              }`}
              onClick={() => {
                setActiveSpecialTab('certificate');
                setSelectedChapter(null); // Deselect normal chapter
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            >
              <div className="flex-none">
                {!isCourseFullyCompleted() ? (
                  <FaLock className="text-amber-500/70" size={14} />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                )}
              </div>
              <div className="font-bold flex-1 truncate">Certificate</div>
            </div>
          </div>
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
        {activeSpecialTab === 'assessment' ? (
          <div className="section-shell max-w-4xl px-4 py-12">
            <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-nova-card p-8 shadow-sm">
              <div className="mb-8 border-b border-black/5 dark:border-white/10 pb-6">
                <h2 className="text-3xl font-bold text-nova-heading mb-2 flex items-center gap-3">
                  <span className="material-symbols-outlined text-[32px] text-primary">workspace_premium</span>
                  Course Mega Assessment
                </h2>
                <p className="text-nova-body">Validate your skills and earn your official certification.</p>
              </div>

              <div className="space-y-6 mb-8">
                <div className="p-6 bg-primary/5 border border-primary/10 rounded-xl">
                  <h3 className="font-bold text-primary mb-3 text-lg">Assessment Information</h3>
                  <p className="text-sm text-nova-body leading-relaxed mb-4">
                    This assessment will be conducted over the full generated course. You need to pass this by at least <strong>80%</strong> to unlock your certificate.
                  </p>
                  <ul className="space-y-4 text-sm text-nova-heading">
                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-gray-400">timer</span> <strong>Duration:</strong> 1 Hour</li>
                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-gray-400">format_list_numbered</span> <strong>Questions:</strong> Dynamic (Not fixed)</li>
                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-gray-400">category</span> <strong>Type:</strong> Mix of MCQ, theory, and coding questions</li>
                    <li className="flex items-center gap-3"><span className="material-symbols-outlined text-gray-400">visibility</span> <strong>Environment:</strong> Monitored test</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-center pt-4 border-t border-black/5 dark:border-white/10">
                {!isCourseFullyCompleted() ? (
                  <div className="flex flex-col items-center text-center py-4">
                    <FaLock className="text-amber-500 mb-3 text-3xl opacity-50" />
                    <p className="text-amber-600 font-medium">Complete all course lessons to unlock the Mega Assessment.</p>
                  </div>
                ) : (
                  <Button className="bg-primary px-10 py-6 text-lg font-bold text-white hover:bg-primary/90 shadow-md">
                    Start Assessment
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : activeSpecialTab === 'certificate' ? (
          <div className="section-shell max-w-4xl px-4 py-12">
            <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-nova-card p-8 shadow-sm">
              <div className="mb-8 border-b border-black/5 dark:border-white/10 pb-6 text-center">
                <h2 className="text-3xl font-bold text-nova-heading mb-2 flex items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-[32px] text-green-500">verified</span>
                  Course Certificate
                </h2>
              </div>
              
              {!isCourseFullyCompleted() ? (
                <div className="flex flex-col items-center text-center py-12">
                  <FaLock className="text-amber-500 mb-4 text-4xl opacity-50" />
                  <h3 className="text-xl font-bold text-nova-heading mb-2">Certificate Locked</h3>
                  <p className="text-nova-body max-w-md">Complete the full course and pass the Mega Assessment to unlock your official certificate.</p>
                </div>
              ) : (
                <div className="relative p-8 md:p-12 border-8 border-double border-gray-200 dark:border-white/10 bg-white dark:bg-[#111] rounded-lg text-center shadow-lg overflow-hidden">
                  <div className="absolute -top-10 -left-10 opacity-5 pointer-events-none">
                    <span className="material-symbols-outlined text-[200px]">workspace_premium</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-2 relative z-10">CERTIFICATE OF COMPLETION</h1>
                  <p className="text-sm font-semibold tracking-widest text-primary uppercase mb-10 relative z-10">UpSkills AI</p>
                  
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 italic relative z-10">This is to certify that</p>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-gray-700 pb-2 mb-6 inline-block min-w-[300px] relative z-10">
                    {course?.username || "Student"}
                  </h2>
                  
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto mb-12 relative z-10">
                    has successfully completed the course <strong className="text-gray-900 dark:text-white">"{course?.courseName}"</strong> by securing <strong>92%</strong> in the final assessment, which took <strong>3 weeks</strong> and covered comprehensive topics around <span className="capitalize">{course?.category || courseOutput?.topic}</span>.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 relative z-10 gap-6">
                    <div className="text-center sm:text-left">
                      <p className="font-bold text-gray-800 dark:text-gray-200 mb-1">UpSkills AI Team</p>
                      <p className="text-sm text-gray-500">Verified Issuer</p>
                    </div>
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[32px]">verified</span>
                    </div>
                    <div className="text-center sm:text-right">
                      <p className="font-bold text-gray-800 dark:text-gray-200 mb-1">{new Date().toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">Date of Issue</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : showPremiumCTA ? (
          <div className="section-shell max-w-4xl px-4 py-12">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-50 p-8 text-center shadow-sm dark:shadow-none">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
                <FaLock className="h-8 w-8 text-amber-500" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-nova-heading">
                Generate this chapter
              </h2>
              <p className="mb-8 mx-auto max-w-lg text-lg text-nova-body">
                The roadmap for this chapter is ready, but its lesson content has not been generated yet. Generate only this chapter when you are ready.
              </p>
              {generatingChapter ? (
                <div className="mx-auto max-w-md mt-8">
                  <QueueStatusPanel status={queueStatus} />
                  <div className="flex justify-between text-sm font-medium text-amber-700 mb-2">
                    <span className="animate-pulse">{loadingText}</span>
                    <span>{Math.round(loadingProgress)}%</span>
                  </div>
                  <div className="h-2 w-full bg-amber-200/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 transition-all duration-300 ease-out" 
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : isOwner ? (
                <Button
                  type="button"
                  onClick={handleGenerateSelectedChapter}
                  className="bg-amber-500 px-8 py-4 text-lg font-bold text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]"
                >
                  Generate This Chapter
                </Button>
              ) : (
                <p className="text-sm font-medium text-amber-700">
                  This chapter is not available in the published course yet.
                </p>
              )}
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
                  className="w-full bg-primary py-3 text-lg text-white hover:bg-primary/90"
                >
                  {loadingQuiz ? "Generating Quiz..." : "Take Chapter Quiz"}
                </Button>
                <p className="mt-2 text-center text-sm text-nova-body">
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
                        : "bg-primary text-white hover:bg-primary/90"
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
                    className="flex items-center gap-2 border-black/10 dark:border-white/10 dark:border-white/10 bg-nova-card/50 text-nova-heading"
                  >
                    <FaChevronLeft /> Previous Lesson
                  </Button>
                  
                  <span className="text-sm text-nova-body">
                    Lesson {getGlobalSubtopicIndex(selectedChapterIndex, selectedSubtopicIndex) + 1}
                  </span>
                  
                  <Button
                    onClick={handleNextLesson}
                    disabled={isLastSubtopic}
                    variant="outline"
                    className="flex items-center gap-2 border-black/10 dark:border-white/10 dark:border-white/10 bg-nova-card/50 text-nova-heading"
                  >
                    Next Lesson <FaChevronRight />
                  </Button>
                </div>
              </div>
            
            {/* End of generated batch / full completion */}
            {isLastChapter && quizPassed && (
              <div className="mx-auto mb-10 flex max-w-4xl flex-col items-center justify-center rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-bg shadow-sm dark:shadow-none px-4 py-8">
                {generatedUnlockedChapters < totalChapters ? (
                  <>
                    <h2 className="mb-4 text-2xl font-bold text-nova-heading">
                      Ready for the Next Batch
                    </h2>
                    <p className="mb-6 max-w-md text-center text-nova-body">
                      You finished everything that is currently generated. Go back to the course builder and generate the next set of chapters.
                    </p>
                    <Link
                      href={`/create-course/${course?.courseId}`}
                      className="rounded-lg bg-primary px-8 py-3 text-lg font-semibold text-white hover:bg-primary/90"
                    >
                      Generate Next Chapters
                    </Link>
                  </>
                ) : (
                  <>
                    <h2 className="mb-4 text-2xl font-bold text-nova-heading">
                      🎉 Congratulations!
                    </h2>
                    <p className="mb-6 max-w-md text-center text-nova-body">
                      You&apos;ve reached the end of this course. Mark it as completed to track your progress!
                    </p>
                    <Button
                      onClick={handleMarkAsComplete}
                      disabled={completingCourse}
                      className="bg-primary px-8 py-3 text-lg text-white hover:bg-primary/90"
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
            <div className="w-full rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-card/70 p-8 text-center">
              <div className="mx-auto h-[190px] max-w-lg overflow-hidden rounded-xl">
                <CourseCover
                  title={courseOutput?.topic || course.courseName}
                  category={course.category}
                  imageUrl={course.courseBanner}
                  className="h-full w-full"
                />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-nova-heading">
                Preparing your first chapter...
              </h2>
              <p className="mt-2 text-nova-body">
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

      {selectedChapter && chapterContent && !showPremiumCTA && !activeSpecialTab && (
        <CourseLearningChatbot
          course={course}
          chapter={selectedChapter}
          chapterContent={chapterContent}
          selectedChapterIndex={selectedChapterIndex}
          selectedSubtopicIndex={selectedSubtopicIndex}
        />
      )}
    </div>
  );
};

export default CourseStart;
