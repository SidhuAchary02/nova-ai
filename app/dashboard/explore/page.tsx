"use client";

import { CourseType } from "@/types/types";
import React, { useEffect, useState } from "react";
import CourseCard from "../_components/CourseCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SkeletonLoading from "../_components/SkeletonLoading";
import { getAllCoursesAction } from "@/app/actions/getAllCourses";

const ExplorePage = () => {
  const [courseList, setCourseList] = useState<CourseType[] | null>(null);
  const [pageIndex, setPageIndex] = useState(0);

  const getAllCourses = async () => {
    const result = await getAllCoursesAction(8, pageIndex * 8);
    // console.log(result);
    setCourseList(result as CourseType[]);
  };

  // console.log(courseList);

  useEffect(() => {
    getAllCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex]);

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-5 sm:p-6">
        <h2 className="text-3xl font-bold text-slate-100">Explore Courses</h2>
        <p className="mt-1 text-slate-300">Discover what other creators are publishing with Nova AI Studio.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {courseList ? (
          courseList?.map((course) => (
            <div key={course.courseId}>
              <CourseCard
                course={course}
                onRefresh={() => getAllCourses()}
                displayUser={true}
              />
            </div>
          ))
        ) : (
          <SkeletonLoading items={8} />
        )}
      </div>

      <div className="glass-panel flex items-center justify-between rounded-2xl p-3 sm:p-4">
        <Button
          onClick={() => setPageIndex(pageIndex - 1)}
          disabled={pageIndex == 0}
          variant="outline"
        >
          Prev
        </Button>
        <Badge className="bg-slate-800 text-slate-200">Page : {pageIndex + 1}</Badge>
        <Button
          onClick={() => setPageIndex(pageIndex + 1)}
          disabled={courseList?.length !== 8}
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ExplorePage;
