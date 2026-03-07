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
      return (
        !!userInput?.difficulty &&
        !!userInput?.duration &&
        !!userInput?.video &&
        !!userInput?.totalChapters
      );
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
    <div>
      <div className="flex flex-col justify-center items-center mt-10">
        <h2 className="text-4xl text-primary font-medium">Create Course</h2>

        <div className="flex mt-10">
          {stepperOptions.map((option, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center w-[50px] md:w-[100px]">
                <div
                  className={`bg-gray-200 p-3 rounded-full text-white ${
                    step >= index && "bg-purple-500"
                  }`}
                >
                  <option.icon />
                </div>

                <p className="hidden md:block md:text-sm">{option.name}</p>
              </div>

              {index != stepperOptions.length - 1 && (
                <div
                  className={`h-1 w-[50px] md:w-[100px] rounded-full lg:w-[170px] bg-gray-300 ${
                    step > index && "bg-purple-500"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="px-10 md:px-20 lg:px-44 mt-10">
        {step === 0 ? (
          <SelectCategory />
        ) : step === 1 ? (
          <TopicDesc />
        ) : (
          <SelectOption />
        )}

        <div className="flex justify-between mt-10">
          <Button
            variant={"outline"}
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
          >
            Previous
          </Button>

          {stepperOptions.length - 1 === step ? (
            <Button
              disabled={!allowNextStep() || loading}
              onClick={generateCourse}
              className="gap-2"
            >
              <FaWandMagicSparkles />
              Generate Course
            </Button>
          ) : (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!allowNextStep()}
            >
              Next
            </Button>
          )}
        </div>
      </div>

      <LoadingDialog loading={loading} />
    </div>
  );
};

export default CreateCoursePage;