"use client";

import { useUser } from "@clerk/nextjs";
import { useContext, useEffect, useState } from "react";
import CourseCard from "./CourseCard";
import SkeletonLoading from "./SkeletonLoading";
import { UserCourseListContext } from "@/app/_context/UserCourseList.context";
import { CourseType } from "@/types/types";
import { fixAllCourseBannersAction } from "@/app/actions/fixCourseBanners";

const UserCourseList = () => {
  const { user } = useUser();
  const [courses, setCourses] = useState<CourseType[] | null>(null);
  const { setUserCourseList } = useContext(UserCourseListContext);
  const [hasFixedBanners, setHasFixedBanners] = useState(false);

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      // Fix banners once on mount
      if (!hasFixedBanners) {
        fixAllCourseBannersAction().then(() => {
          setHasFixedBanners(true);
          if (user?.primaryEmailAddress?.emailAddress) {
            getUserCourses(user.primaryEmailAddress.emailAddress);
          }
        });
      } else {
        getUserCourses(user.primaryEmailAddress.emailAddress);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
    return <div className="flex justify-center items-center mt-44">No courses found</div>;

  return (
    <div className="mt-10">
      <h2 className="font-medium text-lg">My AI Courses</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {courses ? (
          courses.map((course, index) => (
            <CourseCard key={index} course={course} onRefresh={() => getUserCourses(user?.primaryEmailAddress?.emailAddress ?? "")} />
          ))
        ) : (
          <SkeletonLoading items={5} />
        )}
      </div>
    </div>
  );
};

export default UserCourseList;
