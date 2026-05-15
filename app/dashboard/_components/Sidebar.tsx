"use client";

import React, { useContext } from "react";
import { navList } from "../_constants/navList";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { UserCourseListContext } from "@/app/_context/UserCourseList.context";

const Sidebar = () => {
  const path = usePathname();
  const { userCourseList } = useContext(UserCourseListContext);

  return (
    <aside className="fixed h-screen w-72 border-r border-black/5 bg-white p-5 shadow-sm flex flex-col">
      <Link href="/" className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 bg-nova-primary rounded-lg flex items-center justify-center text-white shadow-sm">
          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-nova-heading tracking-tight leading-none">Nova Studio</h1>
          <p className="text-[10px] text-nova-body uppercase tracking-wider font-semibold mt-1">Course Workspace</p>
        </div>
      </Link>

      <ul className="flex flex-col gap-2 flex-grow">
        {navList.map((item) => {
          const isActive = item.route === path;
          return (
            <Link href={item.route} key={item.id}>
              <div
                className={`flex items-center gap-3 rounded-xl p-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-nova-primary/10 text-nova-primary"
                    : "text-nova-body hover:bg-black/5 hover:text-nova-heading"
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

      <div className="mt-auto mb-4 rounded-xl border border-black/5 bg-nova-bg p-4 shadow-sm">
        <Progress value={(userCourseList.length / 5) * 100} className="h-2 bg-black/5 [&>div]:bg-nova-primary" />
        <h2 className="my-3 text-sm text-nova-body font-medium">
          <span className="text-nova-heading font-bold">{userCourseList.length}</span> out of 5 courses created
        </h2>
        <Link href="/dashboard/upgrade">
          <button className="w-full bg-white border border-black/10 text-nova-heading text-xs font-semibold py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            Upgrade for Unlimited
          </button>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
