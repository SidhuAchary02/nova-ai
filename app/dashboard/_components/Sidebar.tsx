"use client";

import React, { useContext } from "react";
import { navList } from "../_constants/navList";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { UserCourseListContext } from "@/app/_context/UserCourseList.context";
import { useEffect, useState } from "react";
import { supabase } from "@/configs/supabase";
import { getCourseGenerationAccessAction } from "@/app/actions/courseGenerationAccess";
import OutOfCreditsDialog from "@/components/common/OutOfCreditsDialog";
import type { CourseGenerationAccess } from "@/configs/courseGenerationAccess";

const Sidebar = () => {
  const path = usePathname();
  const { userCourseList } = useContext(UserCourseListContext);
  const [access, setAccess] = useState<CourseGenerationAccess | null>(null);
  const [outOfCreditsOpen, setOutOfCreditsOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      getCourseGenerationAccessAction(data.user?.email ?? null).then(setAccess);
    });
  }, []);

  const handleCreateCourseClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (access && !access.canGenerate) {
      event.preventDefault();
      setOutOfCreditsOpen(true);
    }
  };

  const usedCourses = access?.used ?? userCourseList.length;
  const maxCourses = access?.limit ?? 1;
  const progressValue = Math.min(100, (usedCourses / maxCourses) * 100);

  return (
    <aside className="fixed h-screen w-72 border-r border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-card p-5 shadow-sm dark:shadow-none flex flex-col">
      <Link href="/" className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 bg-nova-primary rounded-lg flex items-center justify-center text-white shadow-sm dark:shadow-none">
          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-nova-heading tracking-tight leading-none">UpSkillAi Studio</h1>
          <p className="text-[10px] text-nova-body uppercase tracking-wider font-semibold mt-1">Course Workspace</p>
        </div>
      </Link>

      <ul className="flex flex-col gap-2 flex-grow">
        {navList.map((item) => {
          const isActive = item.route === path;
          return (
            <Link
              href={item.route}
              key={item.id}
              onClick={item.route === "/create-course" ? handleCreateCourseClick : undefined}
            >
              <div
                className={`flex items-center gap-3 rounded-xl p-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-nova-primary/10 text-nova-primary"
                    : "text-nova-body hover:bg-black/5 dark:bg-white/5 hover:text-nova-heading"
                }`}
              >
                <div className="text-[20px]">
                  <item.icon />
                </div>
                <h2>{item.name}</h2>
              </div>
            </Link>
          );
        })}
      </ul>

      <div className="mt-auto mb-4 rounded-xl border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-bg p-4 shadow-sm dark:shadow-none">
        <Progress value={progressValue} className="h-2 bg-black/5 dark:bg-white/5 [&>div]:bg-nova-primary" />
        <h2 className="my-3 text-sm text-nova-body font-medium">
          <span className="text-nova-heading font-bold">{usedCourses}</span> out of {maxCourses} courses created
        </h2>
        <Link href="/dashboard/upgrade">
          <button className="w-full bg-nova-card border border-black/10 dark:border-white/10 dark:border-white/10 text-nova-heading text-xs font-semibold py-2 rounded-lg hover:bg-gray-50 dark:bg-nova-card/5 transition-colors shadow-sm dark:shadow-none">
            Upgrade for Unlimited
          </button>
        </Link>
      </div>
      <OutOfCreditsDialog
        open={outOfCreditsOpen}
        onOpenChange={setOutOfCreditsOpen}
      />
    </aside>
  );
};

export default Sidebar;
