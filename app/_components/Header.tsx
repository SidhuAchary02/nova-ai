"use client";

import { Button } from "@/components/ui/button";
import ShinyButton from "@/components/ui/shiny-button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/configs/supabase";

const Header = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, []);

  return (
    <header className="section-shell pt-4">
      <div className="bg-nova-card border border-black/5 dark:border-white/10 dark:border-white/5 shadow-soft flex items-center justify-between rounded-2xl px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-lg border border-black/10 dark:border-white/10 dark:border-white/10 bg-nova-card/80 px-2.5 py-1 text-xs font-semibold tracking-[0.2em] text-amber-200">
            UPSKILL
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-nova-heading">
              UpSkillAi Studio
            </p>
            <p className="text-xs text-nova-body">Build smart courses faster</p>
          </div>
        </Link>

        {!user ? (
          <div className="flex items-center gap-2">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-nova-heading hover:bg-black/5 dark:bg-white/5 hover:text-nova-primary">
                Sign in
              </Button>
            </Link>
            <Link href="/sign-up?redirectTo=/dashboard">
              <ShinyButton text="Get Started" />
            </Link>
          </div>
        ) : (
          <Link href="/dashboard">
            <Button className="bg-primary text-white hover:bg-primary/90">Dashboard</Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
