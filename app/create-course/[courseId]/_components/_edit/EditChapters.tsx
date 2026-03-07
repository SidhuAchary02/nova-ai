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
import { CourseType } from "@/types/types";
import { updateChapterAction } from "@/app/actions/updateChapterAction";
import { parseCourseOutput } from "@/utils/parseCourseOutput";

type EditChapterProps = {
  course: CourseType;
  index: number;
  onRefresh: (refresh: boolean) => void;
};

const EditChapters = ({ course, index, onRefresh }: EditChapterProps) => {
  const courseOutput = parseCourseOutput(course.courseOutput);
  const chapters = courseOutput?.chapters || [];
  const [chapterName, setChapterName] = useState<string>("");
  const [chapterDescription, setChapterDescription] = useState<string>("");

  useEffect(() => {
    setChapterName(chapters[index]?.chapterName || "");
    setChapterDescription(chapters[index]?.description || "");
  }, [chapters, index]);

  if (!chapters || chapters.length === 0) {
    return <p>No chapters available to edit.</p>
  }

  const updateChapter = async () => {
    const result = await updateChapterAction(
      course.id,
      index,
      chapterName,
      chapterDescription,
      course
    );

    if (result.success) {
      onRefresh(true);
    } else {
      console.error("Failed to update chapter:", result.error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
      <FaEdit className="text-primary mx-3"/>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Chapter</DialogTitle>
          <DialogDescription>
            <div className="mt-3">
              <label htmlFor="">Chapter Name</label>
              <Input
                placeholder="Enter course title"
                value={chapterName}
                onChange={(e) => setChapterName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="">Chapter Description</label>
              <Textarea
                className="h-40"
                placeholder="Enter course description"
                value={chapterDescription}
                onChange={(e) => setChapterDescription(e.target.value)}
              />
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={updateChapter}>Update</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditChapters;
