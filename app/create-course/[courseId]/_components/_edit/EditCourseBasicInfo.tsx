"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogClose } from "@radix-ui/react-dialog";
import { FaEdit } from "react-icons/fa";
import { useEffect, useState } from "react";
import { updateCourseBasicInfo } from "@/app/actions/updateCourseAction";
import { CourseType } from "@/types/types";
import { parseCourseOutput } from "@/utils/parseCourseOutput";

type EditCourseBasicInfoProps = {
  courseInfo: CourseType | null;
  onRefresh: (refresh: boolean) => void;
};

const EditCourseBasicInfo = ({ courseInfo, onRefresh }: EditCourseBasicInfoProps) => {
  const [courseTitle, setCourseTitle] = useState<string>("");
  const [courseDescription, setCourseDescription] = useState<string>("");

  useEffect(() => {
    const courseOutput = parseCourseOutput(courseInfo?.courseOutput);
    if (courseOutput) {
      setCourseTitle(courseOutput.topic || "");
      setCourseDescription(courseOutput.description || "");
    }
  }, [courseInfo]);

  if (!courseInfo) return null;

  const updateCourseInfo = async () => {
    if (!courseInfo) return;

    const courseOutput = parseCourseOutput(courseInfo.courseOutput);
    if (!courseOutput) {
      console.error("Failed to parse courseOutput");
      return;
    }

    const updatedOutput = {
      ...courseOutput,
      topic: courseTitle,
      description: courseDescription,
    };

    await updateCourseBasicInfo(courseInfo.id, updatedOutput);
    onRefresh(true);
  };

  return (
    <Dialog>
      <DialogTrigger>
        <FaEdit className="text-primary mx-1"/>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Course Title and Description</DialogTitle>
          <DialogDescription>
            <div className="mt-3">
              <label htmlFor="">Course Title</label>
              <Input
                placeholder="Enter course title"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="">Description</label>
              <Textarea
                className="h-40"
                placeholder="Enter course description"
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
              />
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={updateCourseInfo}>Update</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCourseBasicInfo;
