"use client";

import { supabase } from "@/configs/supabase";
import { useEffect, useState, useContext } from "react";
import CourseCard from "./CourseCard";
import SkeletonLoading from "./SkeletonLoading";
import { UserCourseListContext } from "@/app/_context/UserCourseList.context";
import { CourseType, MarketplaceAddType } from "@/types/types";
import { getMarketplaceAddsAction } from "@/app/actions/marketplaceCourse";

const UserCourseList = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseType[] | null>(null);
  const [marketplaceCourses, setMarketplaceCourses] = useState<MarketplaceAddType[] | null>(null);
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
      getMarketplaceCourses(userEmail);
    }
  }, [userEmail]);

  const getUserCourses = async (email: string) => {
    const res = await fetch("/api/getUserCourses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    const sortedData = Array.isArray(data) ? [...data].sort((a: any, b: any) => b.id - a.id) : data;
    setCourses(sortedData);
    setUserCourseList(sortedData);
  };

  const getMarketplaceCourses = async (email: string) => {
    const adds = await getMarketplaceAddsAction(email);
    setMarketplaceCourses(adds as MarketplaceAddType[]);
  };

  return (
    <div className="mt-10 space-y-12">
      {/* My AI Courses */}
      <div data-dashboard-tour="my-courses">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-nova-heading tracking-tight">My AI Courses</h2>
        </div>

        {courses === null ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            <SkeletonLoading items={5} />
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 dark:border-white/10 bg-nova-card p-14 text-center text-nova-body shadow-sm dark:shadow-none">
            No courses found. Create your first course to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {courses.map((course, index) => (
              <CourseCard
                key={index}
                course={course}
                onRefresh={() => getUserCourses(userEmail ?? "")}
                showPublishedBadge={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Courses From Marketplace */}
      {(marketplaceCourses === null || marketplaceCourses.length > 0) && (
        <div data-dashboard-tour="marketplace-courses">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-nova-heading tracking-tight">
                Courses From Marketplace
              </h2>
              <p className="text-sm text-nova-body mt-1">
                Courses you added from the community marketplace.
              </p>
            </div>
          </div>

          {marketplaceCourses === null ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              <SkeletonLoading items={3} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {marketplaceCourses.map((add, index) => {
                // Shape the add into a CourseType-compatible object for the card
                const course: CourseType = {
                  id: add.id,
                  courseId: add.courseId,
                  courseName: add.courseName,
                  category: add.category,
                  level: add.level,
                  courseOutput: add.courseOutput,
                  isVideo: add.isVideo,
                  username: add.username,
                  userprofileimage: add.userprofileimage,
                  createdBy: add.createdBy,
                  courseBanner: add.courseBanner,
                  isPublished: add.isPublished,
                  isCompleted: add.isCompleted ?? undefined,
                };
                return (
                  <CourseCard
                    key={index}
                    course={course}
                    onRefresh={() => getMarketplaceCourses(userEmail ?? "")}
                    displayUser={true}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserCourseList;
