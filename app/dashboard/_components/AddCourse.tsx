"use client";

import { supabase } from "@/configs/supabase";
import { useEffect, useState, useContext } from "react";
import Link from "next/link";
import { UserCourseListContext } from "@/app/_context/UserCourseList.context";

const AddCourse = () => {
  const [user, setUser] = useState<any>(null);
  const { userCourseList } = useContext(UserCourseListContext);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  if (!user) return null;

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Creator";

  const coursesCreated = userCourseList.length;
  const maxCourses = 5;

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome & Stats Row */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-white p-8 rounded-3xl border border-black/5 shadow-soft">
          <h2 className="text-3xl font-bold text-nova-heading tracking-tight mb-2">
            Welcome back, {userName} 👋
          </h2>
          <p className="text-nova-body mb-6">
            Continue building your AI-powered learning journey.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-nova-bg px-4 py-3 rounded-xl border border-black/5 flex flex-col">
              <span className="text-xs text-nova-body font-semibold uppercase tracking-wider">Current Plan</span>
              <span className="text-nova-heading font-bold flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[16px] text-nova-primary">star</span>
                Free Tier
              </span>
            </div>
            <div className="bg-nova-bg px-4 py-3 rounded-xl border border-black/5 flex flex-col">
              <span className="text-xs text-nova-body font-semibold uppercase tracking-wider">Credits Used</span>
              <span className="text-nova-heading font-bold flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[16px] text-nova-accent">donut_large</span>
                {coursesCreated} / {maxCourses}
              </span>
            </div>
          </div>
        </div>

        {/* Create Course Primary CTA */}
        <div className="md:w-[400px] bg-gradient-to-br from-nova-primary to-nova-accent p-[2px] rounded-3xl shadow-soft">
          <div className="bg-white h-full rounded-[22px] p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-nova-primary/10 rounded-full blur-2xl -z-10"></div>
            <div>
              <div className="w-12 h-12 bg-nova-bg rounded-xl flex items-center justify-center mb-4 border border-black/5 shadow-sm text-nova-primary">
                <span className="material-symbols-outlined text-[24px]">magic_button</span>
              </div>
              <h3 className="text-xl font-bold text-nova-heading mb-2">Create New Course</h3>
              <p className="text-sm text-nova-body mb-6">Generate a structured learning roadmap powered by AI.</p>
            </div>
            <Link
              href={
                coursesCreated >= maxCourses
                  ? "/dashboard/upgrade"
                  : "/create-course"
              }
            >
              <button className="w-full bg-nova-primary text-white font-medium py-3 rounded-xl hover:shadow-[0_10px_20px_rgba(255,140,66,0.2)] transition-all active:scale-95 duration-200 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[20px]">add</span>
                Start Generating
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;