"use client";

import { useState } from "react";
import { UserCourseListContext } from "../_context/UserCourseList.context";
import Header from "./_components/Header";
import Sidebar from "./_components/Sidebar";
import { CourseType } from "@/types/types";

const DashboardLayout = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const [userCourseList, setUserCourseList] = useState<CourseType[]>([]);
  return (
    <UserCourseListContext.Provider
      value={{ userCourseList, setUserCourseList }}
    >
      <div className="min-h-screen bg-nova-bg text-nova-body font-sans flex flex-col md:flex-row antialiased selection:bg-nova-primary/20 selection:text-nova-primary">
        <div className="hidden md:block md:w-72 flex-shrink-0 z-20">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-nova-bg p-4 md:p-8">{children}</main>
        </div>
      </div>
    </UserCourseListContext.Provider>
  );
};

export default DashboardLayout;
