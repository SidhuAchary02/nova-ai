"use client";

import { supabase } from "@/configs/supabase";
import { useEffect, useState, useContext } from "react";
import { UserCourseListContext } from "@/app/_context/UserCourseList.context";
import Link from "next/link";
import NameChip from "@/components/common/NameChip";
import { getCourseGenerationAccessAction } from "@/app/actions/courseGenerationAccess";
import type { CourseGenerationAccess } from "@/configs/courseGenerationAccess";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [access, setAccess] = useState<CourseGenerationAccess | null>(null);
  const { userCourseList } = useContext(UserCourseListContext);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      getCourseGenerationAccessAction(data.user?.email ?? null).then(setAccess);
    });
  }, []);

  if (!user) return null;

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Creator";

  const coursesCreated = access?.used ?? userCourseList.length;
  const maxCourses = access?.limit ?? 1;
  const creditsRemaining = Math.max(0, maxCourses - coursesCreated);
  const progressValue = Math.min(100, (coursesCreated / maxCourses) * 100);
  const planLabel = access?.isPremium ? "Premium" : "Free Tier";

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="bg-nova-card rounded-3xl p-8 border border-black/5 dark:border-white/10 dark:border-white/5 shadow-soft">
        <h2 className="text-3xl font-bold text-nova-heading tracking-tight mb-6">Your Profile</h2>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Account Details */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-nova-bg rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 flex items-center justify-center text-nova-primary font-bold text-2xl shadow-sm dark:shadow-none">
                {(userName || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-nova-heading"><NameChip name={userName} maxLength={20} className="px-0 border-none bg-transparent text-xl font-bold text-nova-heading" /></h3>
                <p className="text-sm text-nova-body">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-black/5 dark:border-white/10 dark:border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-nova-body font-medium text-sm">Account Status</span>
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-nova-body font-medium text-sm">Subscription Plan</span>
                <span className="text-nova-heading font-bold text-sm">{planLabel}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-nova-body font-medium text-sm">Member Since</span>
                <span className="text-nova-heading font-bold text-sm">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="flex-1 bg-nova-bg rounded-2xl p-6 border border-black/5 dark:border-white/10 dark:border-white/5 shadow-sm dark:shadow-none flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-nova-heading mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-nova-primary text-[20px]">analytics</span>
                Usage Statistics
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-nova-body font-medium">Credits Used</span>
                    <span className="text-nova-heading font-bold">{coursesCreated} / {maxCourses}</span>
                  </div>
                  <div className="w-full h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-nova-primary rounded-full" style={{ width: `${progressValue}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-nova-body font-medium">Credits Remaining</span>
                    <span className="text-nova-heading font-bold text-nova-accent">{creditsRemaining}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/10 dark:border-white/5">
              <Link href="/dashboard/upgrade">
                <button className="w-full bg-nova-card text-nova-heading text-sm font-bold py-3 rounded-xl border border-black/10 dark:border-white/10 dark:border-white/10 hover:bg-gray-50 dark:bg-nova-card/5 transition-colors shadow-sm dark:shadow-none flex justify-center items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-nova-primary">upgrade</span>
                  Upgrade Plan
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
