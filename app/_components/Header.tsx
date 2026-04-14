"use client";

import { Button } from "@/components/ui/button";
import ShinyButton from "@/components/ui/shiny-button";
import Image from "next/image";
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
      <div className="glass-panel flex items-center justify-between rounded-2xl px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-lg border border-white/20 bg-white p-1.5">
            <Image
              src={"/logo.png"}
              alt="Nova AI logo"
              width={92}
              height={40}
              priority
              className="h-auto w-auto object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-slate-100">
              Nova AI Studio
            </p>
            <p className="text-xs text-slate-400">Build smart courses faster</p>
          </div>
        </Link>

        {!user ? (
          <div className="flex items-center gap-2">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-slate-200 hover:bg-white/10 hover:text-white">
                Sign in
              </Button>
            </Link>
            <Link href="/sign-up">
              <ShinyButton text="Get Started" />
            </Link>
          </div>
        ) : (
          <Link href="/dashboard">
            <Button className="bg-primary text-slate-950 hover:bg-primary/90">Dashboard</Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;