import { BorderBeam } from "@/components/ui/border-beam";
import { VelocityScroll } from "@/components/ui/scroll-based-velocity";
import React from "react";

export const AICourseText = () => {
  return (
    <section className="section-shell py-6 sm:py-10">
      <div className="bg-nova-card border border-black/5 dark:border-white/10 dark:border-white/5 shadow-soft overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 py-8">
      <VelocityScroll
        text="UpSkillAi Studio - Smart Course Design - AI Assisted Chapters - Better Learning Outcomes"
        default_velocity={1}
        className="font-display text-center text-3xl font-bold tracking-[-0.02em] text-nova-heading drop-shadow-sm dark:shadow-none sm:text-4xl lg:text-5xl"
      />
      </div>
    </section>
  );
};
