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
        <label className="mb-2 block font-medium text-nova-heading">
          Write the Topic for which you want to generate a course
        </label>
        <Input
          placeholder="Enter the topic"
          defaultValue={userInput?.topic}
          onChange={(e) => handleInputChange("topic", e.target.value)}
          className="h-11 border-black/10 dark:border-white/10 dark:border-white/10 bg-nova-bg/70 text-nova-heading"
        />
      </div>
      <div className="mt-5">
        <label className="mb-2 block font-medium text-nova-heading">
          Tell us more about your course, what you want to include in the
          course.
        </label>
        <Textarea
          placeholder="About your course"
          defaultValue={userInput?.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          className="min-h-[130px] border-black/10 dark:border-white/10 dark:border-white/10 bg-nova-bg/70 text-nova-heading"
        />
      </div>
    </div>
  );
};

export default TopicDesc;
