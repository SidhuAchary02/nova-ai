"use client";

import React, { useContext, useEffect, useState } from "react";
import { CourseOnboardingAssistant } from "./_components/onboarding/CourseOnboardingAssistant";
import PersonalizedRoadmapReview from "./_components/PersonalizedRoadmapReview";
import { UserInputContext } from "../_context/UserInputContext";
import LoadingDialog from "./_components/LoadingDialog";
import { storeDataInDatabase } from "./_utils/saveDataInDb";
import { saveLearningPipelineDataInDb } from "./_utils/saveLearningPipelineData";
import uuid4 from "uuid4";
import { useRouter } from "next/navigation";
import { CourseType, UserInputType } from "@/types/types";
import { UserCourseListContext } from "../_context/UserCourseList.context";
import { getUsersCoursesAction } from "../actions/getUsersCourses";
import { supabase } from "@/configs/supabase";
import { generateCourseLayoutAction } from "@/app/actions/generateCourseLayoutAction";
import {
  enqueueRoadmapGenerationAction,
  getRoadmapGenerationQueueStatusAction,
} from "@/app/actions/generationQueue";
import type { LearningStrategyOutput } from "@/lib/validation/learningSchemas";
import { hasCompleteLearningProfile } from "@/lib/learning/buildLearningContext";
import { buildCourseOutputFromRoadmap } from "@/lib/learning/roadmapToCourseOutput";
import {
  getCourseGenerationAccessAction,
} from "@/app/actions/courseGenerationAccess";
import OutOfCreditsDialog from "@/components/common/OutOfCreditsDialog";
import type { QueueStatusResult } from "@/app/actions/generationQueue";
import {
  OUT_OF_CREDITS_ERROR,
} from "@/configs/courseGenerationAccess";

const CreateCoursePage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<unknown>(null);
  const [phase, setPhase] = useState<"wizard" | "roadmap">("wizard");
  const [hasUnsavedProgress, setHasUnsavedProgress] = useState(false);
  const [learningStrategy, setLearningStrategy] =
    useState<LearningStrategyOutput | null>(null);
  const [outOfCreditsOpen, setOutOfCreditsOpen] = useState(false);
  const [roadmapQueueStatus, setRoadmapQueueStatus] = useState<QueueStatusResult | null>(null);

  const { userInput, setUserInput } = useContext(UserInputContext);
  const { userCourseList, setUserCourseList } =
    useContext(UserCourseListContext);

  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, []);

  const getUserCourses = async () => {
    const u = user as { email?: string } | null;
    if (!u?.email) return;

    const res = await getUsersCoursesAction(u.email);
    setUserCourseList(res as CourseType[]);
  };

  useEffect(() => {
    if (user) {
      getUserCourses();
    }
  }, [user]);

  const generateCourseLegacy = async (input: UserInputType) => {
    const { data } = await supabase.auth.getUser();
    const access = await getCourseGenerationAccessAction(data.user?.email ?? null);
    if (!access.canGenerate) {
      setOutOfCreditsOpen(true);
      return;
    }

    const legacyBrief = input?.detailedPrompt || input?.description || input?.intent || input?.topic || "";
    const BASIC_PROMPT = `Generate a course tutorial on following details with field name, description, along with the chapter name about and duration:
Category '${input?.category}'
Display title '${input?.topic}'
Original selected topic '${input?.intent ?? input?.topic}'
Detailed prompt '${legacyBrief}'
Description '${input?.description}'
Level '${input?.difficulty}'
Duration '${input?.duration ?? "AI-optimized"}'
chapters '${input?.totalChapters ?? "auto"}'
in JSON format.`;

    setLoading(true);

    try {
      const id = uuid4();

      const result = await generateCourseLayoutAction(BASIC_PROMPT);

      const data = JSON.parse(result!);

      await storeDataInDatabase(id, input, data);

      router.replace(`/course/${id}`);
    } catch (error) {
      console.log("AI Error:", error);
      if (error instanceof Error && error.message === OUT_OF_CREDITS_ERROR) {
        setOutOfCreditsOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const [returningFromRoadmap, setReturningFromRoadmap] = useState(false);

  const handleGenerateRoadmap = async (input: UserInputType) => {
    setUserInput((prev) => ({ ...prev, ...input }));

    if (!hasCompleteLearningProfile(input)) {
      alert("Please complete your learning profile.");
      return;
    }

    const { data } = await supabase.auth.getUser();
    const access = await getCourseGenerationAccessAction(data.user?.email ?? null);
    if (!access.canGenerate) {
      setOutOfCreditsOpen(true);
      return;
    }

    setLoading(true);
    setRoadmapQueueStatus(null);
    try {
      const { data } = await supabase.auth.getUser();
      const userEmail = data.user?.email ?? null;
      if (!userEmail) {
        alert("Please sign in again.");
        return;
      }

      const queueResult = await enqueueRoadmapGenerationAction({
        userEmail,
        userInput: input,
      });

      if (!queueResult.success || !queueResult.jobId) {
        alert(queueResult.error || "Failed to queue roadmap generation");
        return;
      }

      for (;;) {
        const status = await getRoadmapGenerationQueueStatusAction(queueResult.jobId);
        setRoadmapQueueStatus(status);

        if (!status.success) {
          alert(status.error || "Failed to read roadmap status");
          return;
        }

        if (status.state === "completed") {
          const result = status.result as
            | { success: true; strategy: LearningStrategyOutput }
            | { success: false; error: string }
            | undefined;

          if (!result?.success) {
            alert(result?.error || "Failed to generate roadmap");
            return;
          }

          setLearningStrategy(result.strategy);
          setPhase("roadmap");
          setReturningFromRoadmap(false);
          break;
        }

        if (status.state === "failed") {
          alert(status.failedReason || "Failed to generate roadmap");
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate roadmap");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRoadmap = async () => {
    if (!learningStrategy) return;

    const { data } = await supabase.auth.getUser();
    const access = await getCourseGenerationAccessAction(data.user?.email ?? null);
    if (!access.canGenerate) {
      setOutOfCreditsOpen(true);
      return;
    }

    setLoading(true);
    try {
      const id = uuid4();

      // Fallback topic and category dynamically
      const activeTopic = userInput.topic || userInput.intent || "General Course";
      const activeCategory = userInput.category || "General";
      const activeDetailedPrompt =
        userInput.detailedPrompt ||
        userInput.description ||
        userInput.intent ||
        activeTopic;

      // Ensure defaults before calling backend
      const courseInput = {
        ...userInput,
        topic: activeTopic,
        category: activeCategory,
        detailedPrompt: activeDetailedPrompt,
        description: userInput.description || activeDetailedPrompt,
      };

      console.log("==> Creating course with:", {
        topic: courseInput.topic,
        category: courseInput.category,
      });

      console.log("==> Building course structure from approved roadmap");
      const courseOutput = buildCourseOutputFromRoadmap(courseInput, learningStrategy);

      console.log("==> Validating course details before DB save");
      const cOut = courseOutput as any;
      if (!cOut.course?.chapters || !Array.isArray(cOut.course.chapters) || cOut.course.chapters.length === 0) {
        throw new Error("Validation Failed: approved roadmap has 0 chapters.");
      }
      if (!courseInput.topic || !courseInput.category) {
        throw new Error("Validation Failed: Missing topic or category.");
      }

      console.log("==> Proceeding to DB Save...");
      await saveLearningPipelineDataInDb(
        id,
        courseInput,
        courseOutput,
        learningStrategy
      );
      
      console.log("==> DB Save Complete");

      // Clear localStorage on success
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("nova_onboarding_progress");
      }

      router.replace(`/course/${id}`);
    } catch (e: any) {
      console.error("==> Caught exception during Course Generation:", e);
      if (e?.message === OUT_OF_CREDITS_ERROR) {
        setOutOfCreditsOpen(true);
        return;
      }
      alert(e?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  if (phase === "roadmap" && learningStrategy) {
    return (
      <div className="pb-12">

        <div className="pt-20">
          <div className="section-shell mt-8 max-w-4xl">
            <PersonalizedRoadmapReview
              strategy={learningStrategy}
              userInput={userInput}
              dailyHours={userInput.learningProfile?.timePerDayHours}
              onBack={() => {
                setPhase("wizard");
                setReturningFromRoadmap(true);
              }}
              onConfirm={handleConfirmRoadmap}
              loading={loading}
            />
          </div>
        </div>

        <LoadingDialog
          loading={loading}
          variant="roadmap"
          queueStatus={roadmapQueueStatus}
        />
        <OutOfCreditsDialog
          open={outOfCreditsOpen}
          onOpenChange={setOutOfCreditsOpen}
        />
      </div>
    );
  }

  const showLegacy = process.env.NEXT_PUBLIC_USE_LEGACY_COURSE_LAYOUT === "true";

  return (
    <div className="min-h-screen pb-16">

      <div className="relative pt-20">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(250, 204, 21, 0.12), transparent 55%)",
          }}
        />

        <div className="section-shell px-4 py-8">
          <CourseOnboardingAssistant
            onGenerateRoadmap={handleGenerateRoadmap}
            loading={loading}
            showLegacyButton={showLegacy}
            onLegacyGenerate={showLegacy ? generateCourseLegacy : undefined}
            initialStep={returningFromRoadmap ? 6 : 0}
            onProgressChange={setHasUnsavedProgress}
          />
        </div>
      </div>

      <LoadingDialog loading={loading} variant="roadmap" queueStatus={roadmapQueueStatus} />
      <OutOfCreditsDialog
        open={outOfCreditsOpen}
        onOpenChange={setOutOfCreditsOpen}
      />
    </div>
  );
};

export default CreateCoursePage;
