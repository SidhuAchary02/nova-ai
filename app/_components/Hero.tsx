"use client";

import Link from "next/link";
import { GradientTextAnimation } from "./textAnimations/GradientTextAnimation";
import PulsatingButton from "@/components/ui/pulsating-button";
import WordPullUp from "@/components/ui/word-pull-up";
import ShinyButton from "@/components/ui/shiny-button";
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
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:items-center">
        <div className="mx-auto max-w-xl text-center">
          <GradientTextAnimation title="Introducting AI Course Generator" />

          <WordPullUp
            className="text-4xl font-bold md:text-7xl"
            words="AI Course Generator"
          />

          <p className="mt-10 sm:text-xl">
            Revolutionize your course creation with AI.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            {!user ? (
              <Link href="/sign-in">
                <PulsatingButton
                  text="Get Started"
                  pulseColor="150,0,255"
                  backgroundColor="#9945FF"
                  textColor="#fff"
                  animationDuration="1.5s"
                  buttonWidth="200px"
                  buttonHeight="50px"
                />
              </Link>
            ) : (
              <Link href="/dashboard">
                <ShinyButton text="Go to Dashboard" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;