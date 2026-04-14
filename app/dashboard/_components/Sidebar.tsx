"use client";

import React, { useContext } from "react";
import { navList } from "../_constants/navList";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { UserCourseListContext } from "@/app/_context/UserCourseList.context";
import Image from "next/image";

const Sidebar = () => {
  const path = usePathname();
  const { userCourseList } = useContext(UserCourseListContext);

  return (
    <aside className="fixed h-screen w-72 border-r border-white/10 bg-slate-950/75 p-5 backdrop-blur-xl">
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-white/20 bg-white p-1.5">
            <Image src="/logo.png" alt="Nova AI" width={96} height={30} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">Nova</h1>
            <p className="text-xs text-slate-400">Course workspace</p>
          </div>
        </div>
      </div>

      <ul className="mt-6">
        {navList.map((item) => (
          <Link href={item.route} key={item.id}>
            <div
              className={`mb-2 flex items-center gap-3 rounded-xl p-3 text-slate-300 transition hover:bg-slate-800/80 hover:text-slate-100 ${
                item.route === path && "bg-sky-500/15 text-sky-200"
              }`}
            >
              <div className="text-2xl">
                <item.icon />
              </div>
              <h2 className="font-medium">{item.name}</h2>
            </div>
          </Link>
        ))}
      </ul>

      <div className="absolute bottom-8 w-[calc(100%-2.5rem)] rounded-xl border border-white/10 bg-slate-900/80 p-4">
        <Progress value={(userCourseList.length / 5) * 100} className="h-2.5" />
        <h2 className="my-2 text-sm text-slate-200">
          {userCourseList.length} out of 5 Courses created
        </h2>
        <Link href="/dashboard/upgrade">
          <h2 className="text-xs text-slate-400 hover:text-slate-200">
            Upgrade your Plan for Unlimited
          </h2>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
