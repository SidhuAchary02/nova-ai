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
      <div className="min-h-screen">
        <div className="hidden md:block md:w-72">
          <Sidebar />
        </div>
        <div className="md:ml-72">
          <Header />
          <main className="section-shell py-6 md:py-10">{children}</main>
        </div>
      </div>
    </UserCourseListContext.Provider>
  );
};

export default DashboardLayout;
