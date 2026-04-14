"use client";

import { supabase } from "@/configs/supabase";
import { useEffect, useState } from "react";
import NameChip from "@/components/common/NameChip";

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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="section-shell flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-white/20 bg-slate-900/80 px-2.5 py-1 text-xs font-semibold tracking-[0.2em] text-amber-200">
            NOVA
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Nova AI Studio</h2>
            <p className="text-xs text-slate-400">
              Welcome back, <NameChip name={userName} maxLength={14} className="bg-transparent border-transparent px-0 py-0 text-slate-300" />
            </p>
          </div>
        </div>

        {user && (
          <button
            onClick={logout}
            className="rounded-xl border border-white/15 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;