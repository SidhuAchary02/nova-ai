"use client";

import { ChapterContentType, ChapterType, CourseType } from "@/types/types";
import React, { useEffect, useState } from "react";
import ChapterListCard from "./_components/ChapterListCard";
import ChapterContent from "./_components/ChapterContent";
import ChapterQuiz from "./_components/ChapterQuiz";
import CertificateModal from "./_components/CertificateModal";
import Image from "next/image";
import UserToolTip from "./_components/UserToolTip";
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

  const getCourse = async () => {
    try {
      const result = await getCourseByIdPublicAction(params.courseId);
      setCourse(result as CourseType);
      setCompletedChapters((result as CourseType).completedChapters || []);
      
      // Load quiz passed chapters from database
      const passedChapters = await getQuizPassedChaptersAction(params.courseId);
      setQuizPassedChapters(passedChapters);
      
      // Check if current chapter quiz was already passed
      if (passedChapters.includes(0)) {
        setQuizPassed(true);
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
    <div>
      {/* Loading Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-30">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaChevronLeft size={16} />
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Loading Course...</h1>
        </div>
      </div>

      {/* Loading Content */}
      <div className="flex items-center justify-center h-screen pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    </div>
  );

  // Check if course content has been generated
  if (!course.isPublished) {
    return (
      <div>
        {/* Top Navigation Header */}
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-30">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaChevronLeft size={16} />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Setup Course Content</h1>
          </div>
        </div>

        {/* Content Area with top padding */}
        <div className="flex items-center justify-center min-h-screen pt-20 p-10">
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
      </div>
    );
  }

  const getChapterContent = async (chapterId: number) => {
    console.log("Fetching content for chapter:", chapterId, "course:", course.courseId);
    setShowQuiz(false);
    setQuizQuestions([]);
    
    // Check if this chapter's quiz was already passed
    const quizAlreadyPassed = quizPassedChapters.includes(chapterId);
    setQuizPassed(quizAlreadyPassed);
    
    const res = await getChapterContentAction(chapterId, course.courseId);
    console.log("Chapter content received:", res);
    setChapterContent(res as ChapterContentType);
  };

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
      console.log(`✅ Quiz result stored: Chapter ${selectedChapterIndex + 1} - ${passed ? "Passed" : "Failed"} (${score}%)`);
    }
    
    if (passed) {
      // Quiz passed - allow chapter completion
      console.log(`Quiz passed with ${score}% - user can complete chapter`);
    } else {
      // Quiz failed - show retry message
      console.log(`Quiz failed with ${score}% - needs to retry`);
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
    <div>
      {/* Top Navigation Header - Professional & UX Friendly */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-30">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          {/* Left Section - Back Button & Course Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaChevronLeft size={16} />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
            <div className="hidden md:block border-l border-gray-200 pl-4">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {course?.courseName}
              </h1>
            </div>
          </div>

          {/* Right Section - Progress & Sidebar Toggle */}
          <div className="flex items-center gap-4">
            {selectedChapter && (
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-700">
                  Chapter {selectedChapterIndex + 1}/{courseOutput?.chapters?.length || 0}
                </span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
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
              className={`p-2.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl ${
                sidebarOpen
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
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
        className={`fixed top-4 left-4 z-50 p-2.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl md:hidden ${
          sidebarOpen
            ? "bg-primary text-white hover:bg-primary/90"
            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
        }`}
      >
        {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar - Professional Styling */}
      <div
        className={`fixed transition-all duration-300 w-64 top-16 h-[calc(100vh-64px)] border-r border-gray-200 overflow-y-auto z-40 ${
          sidebarOpen 
            ? "left-0 bg-white shadow-xl" 
            : "-left-64 bg-white shadow-md"
        }`}
      >
        {/* Sidebar Header */}
        <div className={`transition-all duration-300 ${
          sidebarOpen
            ? "bg-gradient-to-r from-primary to-primary/90 shadow-md"
            : "bg-gradient-to-r from-primary/95 to-primary/85"
        }`}>
          <h2 className="font-bold text-lg p-4 text-white truncate">
            {courseOutput?.topic || "Course"}
          </h2>
        </div>
        
        {/* Progress Bar */}
        <div className={`p-4 transition-all duration-300 ${
          sidebarOpen
            ? "bg-gradient-to-r from-blue-50 to-transparent"
            : "bg-gray-50"
        } border-b border-gray-100`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Progress</span>
            <span className={`text-sm font-bold transition-colors duration-300 ${
              sidebarOpen ? "text-primary" : "text-gray-600"
            }`}>{calculateProgress()}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
          <p className="text-xs text-gray-500 mt-2">
            {completedChapters.length} of {courseOutput?.chapters?.length || 0} chapters
          </p>
        </div>
        
        {/* Chapters List */}
        <div className="divide-y divide-gray-100">
          {courseOutput?.chapters?.map((chapter, index) => (
            <div
              key={index}
              className={`cursor-pointer transition-all duration-200 ${
                selectedChapter?.chapterName === chapter.chapterName
                  ? "bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary"
                  : "hover:bg-gray-50/80 border-l-4 border-transparent"
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
                    <FaRegCircle className={`text-gray-300 transition-colors ${
                      selectedChapter?.chapterName === chapter.chapterName
                        ? "text-primary/50"
                        : ""
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
          className="fixed inset-0 bg-gradient-to-r from-black/50 to-black/30 z-30 backdrop-blur-sm transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className="md:w-64 md:fixed md:left-0">
        {/* Desktop sidebar spacer - takes up space on desktop, hides on mobile */}
        <div className="hidden md:block w-64 h-screen"></div>
      </div>

      <div className="md:ml-64 pt-20">
        {selectedChapter ? (
          <div>
            <ChapterContent
              chapter={selectedChapter}
              content={chapterContent}
              courseCategory={course?.category}
            />
            
            {/* Quiz Section */}
            {!showQuiz && chapterContent && (
              <div className="max-w-4xl mx-auto px-4 py-8">
                <Button
                  onClick={handleGenerateQuiz}
                  disabled={loadingQuiz}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                >
                  {loadingQuiz ? "Generating Quiz..." : "Take Chapter Quiz"}
                </Button>
                <p className="text-center text-gray-500 text-sm mt-2">
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
                        ? "border-green-500 text-green-600 hover:bg-green-50"
                        : "bg-primary hover:bg-primary/90"
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
                    className="flex items-center gap-2"
                  >
                    <FaChevronLeft /> Previous
                  </Button>
                  
                  <span className="text-sm text-gray-500">
                    Chapter {selectedChapterIndex + 1} of {courseOutput?.chapters?.length || 0}
                  </span>
                  
                  <Button
                    onClick={handleNextChapter}
                    disabled={selectedChapterIndex === (courseOutput?.chapters?.length || 0) - 1}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    Next <FaChevronRight />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Show "Mark Course as Complete" button on last chapter */}
            {isLastChapter && quizPassed && (
              <div className="px-4 py-8 mx-auto max-w-4xl flex flex-col items-center justify-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg mb-10">
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
              lets get started with the course {courseOutput?.topic || "this course"}.
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
