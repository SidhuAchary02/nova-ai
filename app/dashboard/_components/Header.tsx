"use client";

import { supabase } from "@/configs/supabase";
import { useEffect, useState } from "react";
import NameChip from "@/components/common/NameChip";
import Link from "next/link";

const Header = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split("@")[0] : "Creator");

  return (
    <header className="sticky top-0 z-40 bg-[#FDFCFB]/80 backdrop-blur-[16px] border-b border-black/5">
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 bg-nova-primary rounded-lg flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          </div>
          <span className="font-bold text-nova-heading tracking-tight">Nova</span>
        </div>
        
        <div className="hidden md:flex items-center gap-2 text-sm text-nova-body">
          <span className="material-symbols-outlined text-[18px] text-nova-primary">space_dashboard</span>
          <span className="font-medium">Dashboard Overview</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/create-course" className="hidden md:flex items-center gap-2 bg-nova-primary/10 text-nova-primary px-4 py-2 rounded-lg font-medium text-sm hover:bg-nova-primary/20 transition-colors">
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            New Course
          </Link>

          {user && (
            <div className="flex items-center gap-4 border-l border-black/5 pl-4">
              <div className="hidden md:block text-right">
                <p className="text-xs text-nova-body">Signed in as</p>
                <p className="text-sm font-semibold text-nova-heading"><NameChip name={userName} maxLength={14} className="bg-transparent border-transparent px-0 py-0 text-nova-heading" /></p>
              </div>
              <button
                onClick={logout}
                className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium text-nova-heading transition hover:bg-gray-50 shadow-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;