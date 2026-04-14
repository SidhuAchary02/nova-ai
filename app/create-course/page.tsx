"use client";

import React, { useContext, useEffect, useState } from "react";
import { stepperOptions } from "./_constants/stepperOptions";
import { Button } from "@/components/ui/button";
import SelectCategory from "./_components/SelectCategory";
import TopicDesc from "./_components/TopicDesc";
import SelectOption from "./_components/SelectOption";
import { UserInputContext } from "../_context/UserInputContext";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { generateCourseLayoutAction } from "@/app/actions/generateCourseLayoutAction";
import LoadingDialog from "./_components/LoadingDialog";
import { storeDataInDatabase } from "./_utils/saveDataInDb";
import uuid4 from "uuid4";
import { useRouter } from "next/navigation";
import { CourseType } from "@/types/types";
import { UserCourseListContext } from "../_context/UserCourseList.context";
import { getUsersCoursesAction } from "../actions/getUsersCourses";
import { supabase } from "@/configs/supabase";
import { FaChevronLeft } from "react-icons/fa";

const CreateCoursePage = () => {
  const [step, setStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  const { userInput } = useContext(UserInputContext);
  const { userCourseList, setUserCourseList } =
    useContext(UserCourseListContext);

  const router = useRouter();

  /*
  ------------------------------
  Get Logged In User (Supabase)
  ------------------------------
  */

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, []);

  /*
  ------------------------------
  Fetch User Courses
  ------------------------------
  */

  const getUserCourses = async () => {
    if (!user?.email) return;

    const res = await getUsersCoursesAction(user.email);
    setUserCourseList(res as CourseType[]);
  };

  useEffect(() => {
    if (user) {
      getUserCourses();
    }
  }, [user]);

  /*
  ------------------------------
  Limit Free Courses
  ------------------------------
  */

  useEffect(() => {
    if (userCourseList.length > 5) {
      router.replace("/dashboard/upgrade");
    }
  }, [userCourseList, router]);

  /*
  ------------------------------
  Step Validation
  ------------------------------
  */

  const allowNextStep = () => {
    if (step === 0) {
      return userInput?.category?.length ?? 0 > 0;
    } else if (step === 1) {
      return !!userInput?.topic && !!userInput?.description;
    } else if (step === 2) {
      // Validate difficulty
      if (!userInput?.difficulty) return false;

      // Validate duration is selected
      if (!userInput?.duration) return false;

      // Validate video selection
      if (!userInput?.video) return false;

      // Validate chapters: must be a number between 1-20
      const chapters = Number(userInput?.totalChapters);
      if (!chapters || isNaN(chapters) || chapters < 1 || chapters > 20) {
        return false;
      }

      return true;
    }
    return false;
  };

  /*
  ------------------------------
  Generate Course Layout
  ------------------------------
  */

  const generateCourse = async () => {
    const BASIC_PROMPT = `Generate a course tutorial on following details with field name, description, along with the chapter name about and duration:
Category '${userInput?.category}'
Topic '${userInput?.topic}'
Description '${userInput?.description}'
Level '${userInput?.difficulty}'
Duration '${userInput?.duration}'
chapters '${userInput?.totalChapters}'
in JSON format.`;

    setLoading(true);

    try {
      const id = uuid4();

      const result = await generateCourseLayoutAction(BASIC_PROMPT);

      const data = JSON.parse(result!);

      await storeDataInDatabase(id, userInput, data);

      router.replace(`/create-course/${id}`);
    } catch (error) {
      console.log("AI Error:", error);
    } finally {
      setLoading(false);
    }
  };

  /*
  ------------------------------
  UI
  ------------------------------
  */

  return (
    <div className="pb-12">
      {/* Top Navigation Header - Professional & UX Friendly */}
      <div className="fixed left-0 right-0 top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
        <div className="section-shell flex h-16 items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100"
          >
            <FaChevronLeft size={16} />
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <h1 className="text-lg font-semibold text-slate-100">Create New Course</h1>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Main Content with top padding */}
      <div className="pt-20">
        <div className="section-shell mt-8">
          <div className="glass-panel mx-auto max-w-4xl rounded-3xl p-6 sm:p-8">
            <h2 className="text-center text-4xl font-semibold text-slate-100">Create Course</h2>

            <div className="mt-10 flex justify-center">
            {stepperOptions.map((option, index) => (
              <div key={index} className="flex items-center">
                <div className="flex w-[58px] flex-col items-center md:w-[120px]">
                  <div
                  className={`rounded-full p-3 text-white transition ${
                    step >= index
                      ? "bg-primary text-slate-950"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  <option.icon />
                </div>

                <p className="mt-2 hidden text-xs text-slate-300 md:block">{option.name}</p>
              </div>

              {index != stepperOptions.length - 1 && (
                <div
                  className={`h-1 w-[50px] rounded-full md:w-[100px] lg:w-[170px] ${
                    step > index ? "bg-primary" : "bg-slate-700"
                  }`}
                ></div>
              )}
            </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:p-6">
            {step === 0 ? (
              <SelectCategory />
            ) : step === 1 ? (
              <TopicDesc />
            ) : (
              <SelectOption />
            )}
          </div>

          <div className="mt-8 flex justify-between">
            <Button
              variant={"outline"}
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
              className="border-white/20 bg-slate-900/50 text-slate-200"
            >
              Previous
            </Button>

            {stepperOptions.length - 1 === step ? (
              <Button
                disabled={!allowNextStep() || loading}
                onClick={generateCourse}
                className="gap-2 bg-primary text-slate-950 hover:bg-primary/90"
              >
                <FaWandMagicSparkles />
                Generate Course
              </Button>
            ) : (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!allowNextStep()}
                className="bg-primary text-slate-950 hover:bg-primary/90"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
      </div>

      <LoadingDialog loading={loading} />
    </div>
  );
};

export default CreateCoursePage;