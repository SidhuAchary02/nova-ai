import { BorderBeam } from "@/components/ui/border-beam";
import { VelocityScroll } from "@/components/ui/scroll-based-velocity";
import React from "react";

export const AICourseText = () => {
  return (
    <section className="section-shell py-6 sm:py-10">
      <div className="glass-panel overflow-hidden rounded-2xl border border-white/10 py-8">
      <VelocityScroll
        text="Nova AI Studio - Smart Course Design - AI Assisted Chapters - Better Learning Outcomes"
        default_velocity={1}
        className="font-display text-center text-3xl font-bold tracking-[-0.02em] text-slate-100 drop-shadow-sm sm:text-4xl lg:text-5xl"
      />
      </div>
    </section>
  );
};
