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
    <div className="space-y-8">
      <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-soft">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-nova-primary/10 rounded-xl flex items-center justify-center text-nova-primary">
            <span className="material-symbols-outlined">explore</span>
          </div>
          <h2 className="text-3xl font-bold text-nova-heading tracking-tight">Explore Courses</h2>
        </div>
        <p className="text-nova-body ml-13">Discover what other creators are publishing with Nova AI Studio.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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

      <div className="bg-white flex items-center justify-between rounded-2xl p-4 shadow-sm border border-black/5">
        <Button
          onClick={() => setPageIndex(pageIndex - 1)}
          disabled={pageIndex == 0}
          variant="outline"
          className="border-black/10 text-nova-heading hover:bg-gray-50"
        >
          Prev
        </Button>
        <Badge className="bg-nova-bg border border-black/5 text-nova-heading font-medium">Page : {pageIndex + 1}</Badge>
        <Button
          onClick={() => setPageIndex(pageIndex + 1)}
          disabled={courseList?.length !== 8}
          variant="outline"
          className="border-black/10 text-nova-heading hover:bg-gray-50"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ExplorePage;
