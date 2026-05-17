"use client";

import Link from "next/link";
import { GradientTextAnimation } from "./textAnimations/GradientTextAnimation";
import PulsatingButton from "@/components/ui/pulsating-button";
import WordPullUp from "@/components/ui/word-pull-up";
import ShinyButton from "@/components/ui/shiny-button";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/configs/supabase";

const Hero = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <section className="section-shell">
      <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-6xl items-center justify-center py-10 sm:py-14">
        <div className="bg-nova-card border border-black/5 dark:border-white/10 dark:border-white/5 shadow-soft w-full rounded-3xl px-6 py-14 text-center sm:px-12">
          <div className="mx-auto max-w-3xl">
            <GradientTextAnimation title="Introducing UpSkillAi Course Studio" />

            <WordPullUp
              className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-7xl"
              words="Design Better Courses with AI"
            />

            <p className="mx-auto mt-6 max-w-2xl text-base text-nova-body sm:text-lg">
              Create complete learning experiences with guided structure, chapter content,
              quizzes, and curated videos. Publish polished courses in minutes.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {!user ? (
                <Link href="/sign-in">
                  <PulsatingButton
                    text="Start Building"
                    pulseColor="14,165,233"
                    backgroundColor="#06b6d4"
                    textColor="#04131f"
                    animationDuration="1.6s"
                    buttonWidth="220px"
                    buttonHeight="52px"
                  />
                </Link>
              ) : (
                <Link href="/dashboard">
                  <ShinyButton text="Go to Dashboard" />
                </Link>
              )}

              <Link href={user ? "/dashboard/explore" : "/sign-in"}>
                <Button variant="outline" className="border-black/10 dark:border-white/10 dark:border-white/10 bg-nova-card/70 text-nova-heading hover:bg-gray-50 dark:bg-nova-card/5">
                  Explore Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;