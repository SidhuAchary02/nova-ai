"use client";

import { supabase } from "@/configs/supabase";
import { useEffect, useState, useContext } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaWandMagicSparkles } from "react-icons/fa6";
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

  return (
    <div className="glass-panel flex flex-col items-start justify-between gap-5 rounded-2xl p-5 sm:flex-row sm:items-center sm:p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Dashboard</p>
        <h2 className="text-2xl font-semibold sm:text-3xl">
          Hello <span className="font-bold text-cyan-300">{userName}</span>
        </h2>
        <p className="mt-1 text-sm text-slate-400">Continue building your course library.</p>
      </div>

      <Link
        href={
          userCourseList.length >= 5
            ? "/dashboard/upgrade"
            : "/create-course"
        }
      >
        <Button className="gap-2 bg-primary text-slate-950 hover:bg-primary/90">
          <FaWandMagicSparkles />
          Create AI course
        </Button>
      </Link>
    </div>
  );
};

export default AddCourse;