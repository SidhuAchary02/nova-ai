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

  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-3xl">
          Hello <span className="font-bold">{user.email}</span>
        </h2>
      </div>

      <Link
        href={
          userCourseList.length >= 5
            ? "/dashboard/upgrade"
            : "/create-course"
        }
      >
        <Button className="gap-2">
          <FaWandMagicSparkles />
          Create AI course
        </Button>
      </Link>
    </div>
  );
};

export default AddCourse;