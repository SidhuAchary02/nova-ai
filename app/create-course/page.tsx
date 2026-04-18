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
import { FaChevronLeft } from "react-icons/fa";
import { generateLearningStrategyAction } from "@/app/actions/generateLearningStrategy";
import { generateCourseStructureAction } from "@/app/actions/generateCourseStructureAction";
import { generateCourseLayoutAction } from "@/app/actions/generateCourseLayoutAction";
import type { LearningStrategyOutput } from "@/lib/validation/learningSchemas";
import { hasCompleteLearningProfile } from "@/lib/learning/buildLearningContext";

const CreateCoursePage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<unknown>(null);
  const [phase, setPhase] = useState<"wizard" | "roadmap">("wizard");
  const [learningStrategy, setLearningStrategy] =
    useState<LearningStrategyOutput | null>(null);

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

  useEffect(() => {
    if (userCourseList.length > 5) {
      router.replace("/dashboard/upgrade");
    }
  }, [userCourseList, router]);

  const generateCourseLegacy = async (input: UserInputType) => {
    const BASIC_PROMPT = `Generate a course tutorial on following details with field name, description, along with the chapter name about and duration:
Category '${input?.category}'
Topic '${input?.topic}'
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

      router.replace(`/create-course/${id}`);
    } catch (error) {
      console.log("AI Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async (input: UserInputType) => {
    setUserInput((prev) => ({ ...prev, ...input }));

    if (!hasCompleteLearningProfile(input)) {
      alert("Please complete your learning profile.");
      return;
    }

    setLoading(true);
    try {
      const res = await generateLearningStrategyAction(input);
      if (!res.success) {
        alert(res.error || "Failed to generate roadmap");
        return;
      }
      setLearningStrategy(res.strategy);
      setPhase("roadmap");
    } catch (e) {
      console.error(e);
      alert("Failed to generate roadmap");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRoadmap = async () => {
    if (!learningStrategy) return;
    setLoading(true);
    try {
      const id = uuid4();
      const struct = await generateCourseStructureAction(
        userInput,
        learningStrategy
      );
      if (!struct.success) {
        alert(struct.error || "Could not build course structure");
        return;
      }
      await saveLearningPipelineDataInDb(
        id,
        userInput,
        struct.courseOutput,
        learningStrategy
      );
      router.replace(`/create-course/${id}`);
    } catch (e) {
      console.error(e);
      alert("Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  const showLegacy =
    process.env.NEXT_PUBLIC_USE_LEGACY_COURSE_LAYOUT === "true";

  if (phase === "roadmap" && learningStrategy) {
    return (
      <div className="pb-12">
        <div className="fixed left-0 right-0 top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
          <div className="section-shell flex h-16 items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100"
            >
              <FaChevronLeft size={16} />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
            <h1 className="text-lg font-semibold text-slate-100">Learning roadmap</h1>
            <div className="w-20" />
          </div>
        </div>

        <div className="pt-20">
          <div className="section-shell mt-8 max-w-4xl">
            <PersonalizedRoadmapReview
              strategy={learningStrategy}
              dailyHours={userInput.learningProfile?.timePerDayHours}
              onBack={() => setPhase("wizard")}
              onConfirm={handleConfirmRoadmap}
              loading={loading}
            />
          </div>
        </div>

        <LoadingDialog loading={loading} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="fixed left-0 right-0 top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
        <div className="section-shell flex h-16 items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100"
          >
            <FaChevronLeft size={16} />
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <div className="w-20" />
        </div>
      </div>

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
          />
        </div>
      </div>

      <LoadingDialog loading={loading} />
    </div>
  );
};

export default CreateCoursePage;
