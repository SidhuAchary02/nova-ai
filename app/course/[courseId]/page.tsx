"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCourseByIdPublicAction } from "@/app/actions/getCourseByIdPublic";
import { updateCoursePublishStatusAction } from "@/app/actions/updateCoursePublishStatus";
import { generateCourseContent } from "@/app/create-course/[courseId]/_utils/generateCourseContent";
import LoadingDialog from "@/app/create-course/_components/LoadingDialog";
import { CourseType, ChapterType } from "@/types/types";
import { parseCourseOutput } from "@/utils/parseCourseOutput";
import { formatDuration } from "@/utils/formatDuration";
import { FaCheck, FaChevronDown } from "react-icons/fa6";
import { AnimatePresence, motion } from "framer-motion";

type CourseParams = {
  params: {
    courseId: string;
  };
};

function formatHours(hours?: number | null): string {
  if (typeof hours !== "number" || Number.isNaN(hours)) return "—";
  return hours % 1 === 0 ? `${hours}` : hours.toFixed(1);
}

function normalizeLevel(level?: string | null): string {
  if (!level) return "Beginner";
  return level.charAt(0).toUpperCase() + level.slice(1);
}

function ChapterRoadmapCard({
  chapter,
  index,
}: {
  chapter: ChapterType;
  index: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const subtopics = Array.isArray(chapter.subtopics) ? chapter.subtopics : [];
  const hasSubtopics = subtopics.length > 0;

  return (
    <section className="relative pl-10 sm:pl-12">
      <div className="absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary bg-slate-950 sm:h-8 sm:w-8">
        <span className="text-xs font-bold text-primary">{index + 1}</span>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-100">
              {chapter.chapterName}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {chapter.duration ? formatDuration(chapter.duration) : "—"}
              {hasSubtopics ? ` · ${subtopics.length} lessons` : " · 0 lessons"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => hasSubtopics && setExpanded((prev) => !prev)}
            className={`inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs font-medium text-slate-300 ${
              hasSubtopics ? "hover:border-primary/30 hover:text-slate-100" : "opacity-70"
            }`}
          >
            {hasSubtopics ? (
              <>
                <FaChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
                {expanded ? "Hide lessons" : "Show lessons"}
              </>
            ) : (
              "No lessons yet"
            )}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {expanded && hasSubtopics && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-5 space-y-3">
                {subtopics.map((subtopic, subIndex) => (
                  <div
                    key={`${subtopic}-${subIndex}`}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-950/60 px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 text-[10px] font-semibold text-slate-400">
                        {subIndex + 1}
                      </div>
                      <span className="truncate text-sm text-slate-200">
                        {subtopic}
                      </span>
                    </div>
                    <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      lesson
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default function CoursePage({ params }: CourseParams) {
  const [course, setCourse] = useState<CourseType | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const loadCourse = async () => {
    const result = await getCourseByIdPublicAction(params.courseId);
    setCourse(result as CourseType);
  };

  useEffect(() => {
    if (params?.courseId) {
      loadCourse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.courseId]);

  const courseOutput = useMemo(() => parseCourseOutput(course?.courseOutput), [course?.courseOutput]);

  const learningContext = course?.learningContext as
    | Record<string, unknown>
    | null
    | undefined;

  const dailyHours =
    typeof course?.learningTimePerDayHours === "number"
      ? course.learningTimePerDayHours
      : learningContext && typeof learningContext.timePerDayHours === "number"
        ? learningContext.timePerDayHours
        : undefined;

  const isPublished = Boolean(course?.isPublished);
  const chapterCount = courseOutput?.chapters?.length || 0;
  const durationLabel = courseOutput?.duration ? formatDuration(courseOutput.duration) : "Self-paced";

  const handleGenerateCourseContent = async () => {
    if (!course) return;

    setLoading(true);
    try {
      const result = await generateCourseContent(course, setLoading);
      if (!result.success) {
        alert(result.error || "Failed to generate course content");
        return;
      }

      await updateCoursePublishStatusAction(params.courseId);
      await loadCourse();
    } catch (error) {
      console.error("Failed to generate course content:", error);
      alert("Failed to generate course content");
    } finally {
      setLoading(false);
    }
  };

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Loading course...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      <div className="fixed left-0 right-0 top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
        <div className="section-shell flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => router.push("/create-course")}
              className="rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-slate-800"
            >
              Create Course
            </button>
          </div>
          <div className="flex items-center gap-3">
            {isPublished ? (
              <span className="rounded-full border border-emerald-300/20 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200 md:text-sm">
                Published ✓
              </span>
            ) : (
              <span className="rounded-full border border-amber-300/20 bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-200 md:text-sm">
                Roadmap ready
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="section-shell mt-20">
        <LoadingDialog loading={loading} />

        <div className="space-y-10 rounded-[28px] border border-white/10 bg-[#060816] px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:px-10 sm:py-10">
          <header className="text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Your personalized plan
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
              Learning roadmap
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              A structured path from where you are today to the outcomes you chose — optimized for your time and goals.
            </p>
          </header>

          <div className="grid gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-950 p-6 sm:grid-cols-5 sm:p-8">
            <div className="text-center sm:text-left">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Skill Level
              </p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-slate-50">
                {normalizeLevel(course.learningCurrentLevel || course.level)}
              </p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Duration
              </p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-slate-50">
                {durationLabel}
              </p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Daily effort
              </p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-slate-50">
                {formatHours(dailyHours)}
                <span className="ml-1 text-base font-semibold text-primary">hrs/day</span>
              </p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Chapters
              </p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-slate-50">
                {chapterCount}
              </p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Video Included
              </p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-slate-50">
                {typeof course.isVideo === "string"
                  ? course.isVideo
                  : typeof course.isVideo === "object" && course.isVideo?.value
                    ? String(course.isVideo.value)
                    : "Yes"}
              </p>
            </div>
          </div>

          <p className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-center text-sm text-slate-300">
            <span className="font-medium text-primary">Note:</span> This plan is optimized based on your goals and time availability.
          </p>

          <div className="relative">
            <div className="absolute bottom-0 left-[11px] top-8 w-px bg-gradient-to-b from-primary/50 via-white/15 to-transparent sm:left-[15px]" />

            <div className="space-y-12">
              {(courseOutput?.chapters || []).map((chapter, index) => (
                <ChapterRoadmapCard key={`${chapter.chapterName}-${index}`} chapter={chapter} index={index} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 sm:p-6">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Why this roadmap?
            </h4>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              This roadmap is derived from the course inputs you provided earlier. Daily effort is taken from your onboarding profile, while chapter count and duration come from the generated course structure.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-8 sm:flex-row sm:justify-between">
            {!isPublished && (
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/create-course")}
                disabled={loading}
                className="border-white/20 bg-transparent text-slate-200 hover:bg-white/5"
              >
                Modify plan
              </Button>
            )}
            {isPublished ? (
              <Button
                type="button"
                onClick={() => router.push(`/course/${params.courseId}/start`)}
                className="bg-primary px-8 text-base font-semibold text-slate-950 hover:bg-primary/90"
              >
                Start course
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleGenerateCourseContent}
                disabled={loading}
                className="bg-primary px-8 text-base font-semibold text-slate-950 hover:bg-primary/90"
              >
                {loading ? "Creating your course…" : "Create my course"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
