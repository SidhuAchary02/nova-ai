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
      <div className="mt-14 rounded-2xl border border-dashed border-white/20 bg-slate-900/55 p-14 text-center text-slate-300">
        No courses found. Create your first course to get started.
      </div>
    );

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-slate-100">My AI Courses</h2>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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