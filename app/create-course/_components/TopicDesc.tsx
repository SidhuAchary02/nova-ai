import {
  UserInputContext,
} from "@/app/_context/UserInputContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserInputType } from "@/types/types";
import React, { useContext } from "react";

const TopicDesc = () => {
  const { userInput, setUserInput } = useContext(UserInputContext);

  const handleInputChange = (fieldName: keyof UserInputType, value: string) => {
    setUserInput((prev) => ({ ...prev, [fieldName]: value }));
  };
  return (
    <div className="space-y-5">
      <div className="mt-5">
        <label className="mb-2 block font-medium text-slate-200">
          Write the Topic for which you want to generate a course
        </label>
        <Input
          placeholder="Enter the topic"
          defaultValue={userInput?.topic}
          onChange={(e) => handleInputChange("topic", e.target.value)}
          className="h-11 border-white/15 bg-slate-950/70 text-slate-100"
        />
      </div>
      <div className="mt-5">
        <label className="mb-2 block font-medium text-slate-200">
          Tell us more about your course, what you want to include in the
          course.
        </label>
        <Textarea
          placeholder="About your course"
          defaultValue={userInput?.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          className="min-h-[130px] border-white/15 bg-slate-950/70 text-slate-100"
        />
      </div>
    </div>
  );
};

export default TopicDesc;
