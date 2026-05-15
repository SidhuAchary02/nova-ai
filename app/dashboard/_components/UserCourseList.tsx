"use client";

import { supabase } from "@/configs/supabase";
import { useEffect, useState, useContext } from "react";
import CourseCard from "./CourseCard";
import SkeletonLoading from "./SkeletonLoading";
import { UserCourseListContext } from "@/app/_context/UserCourseList.context";
import { CourseType } from "@/types/types";
import { fixAllCourseBannersAction } from "@/app/actions/fixCourseBanners";

const UserCourseList = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseType[] | null>(null);
  const { setUserCourseList } = useContext(UserCourseListContext);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email ?? null);
    };

    getUser();
  }, []);

  useEffect(() => {
    if (userEmail) {
      getUserCourses(userEmail);
    }
  }, [userEmail]);

  const getUserCourses = async (email: string) => {
    const res = await fetch("/api/getUserCourses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setCourses(data);
    setUserCourseList(data);
  };

  if (courses?.length === 0)
    return (
      <div className="mt-14 rounded-2xl border border-dashed border-black/10 bg-white p-14 text-center text-nova-body shadow-sm">
        No courses found. Create your first course to get started.
      </div>
    );

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-nova-heading tracking-tight">My AI Courses</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {courses ? (
          courses.map((course, index) => (
            <CourseCard
              key={index}
              course={course}
              onRefresh={() => getUserCourses(userEmail ?? "")}
            />
          ))
        ) : (
          <SkeletonLoading items={5} />
        )}
      </div>
    </div>
  );
};

export default UserCourseList;