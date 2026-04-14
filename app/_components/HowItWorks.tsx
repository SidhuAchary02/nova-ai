import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { IconType } from "react-icons/lib";
import { LuBookOpen, LuFileVideo, LuShare2, LuUser } from "react-icons/lu";

interface FeatureProps {
  icon: IconType;
  title: string;
  description: string;
}

const features: FeatureProps[] = [
  {
    icon: LuUser,
    title: "Register for an Account",
    description:
      "Sign up for a free account to access the course creation tools. Once registered, you’ll be able to log in and start building your personalized courses",
  },
  {
    icon: LuBookOpen,
    title: "Create Your First Course",
    description:
      "Use our intuitive interface to generate a course. Simply provide a topic, and Gemini AI will automatically generate the course content for you.",
  },
  {
    icon: LuFileVideo,
    title: "Automatically Attach Related Videos",
    description:
      "After your course is generated, our system will find and attach relevant YouTube videos that complement your course material, saving you the hassle of finding additional resources",
  },
  {
    icon: LuShare2,
    title: "Customize and Share",
    description:
      "Customize your course to fit your needs, and once you’re satisfied, publish and share it with your students. Our platform makes it easy to manage and distribute your course content.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="get-started" className="section-shell py-16 sm:py-20">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
          Launch Your First Course in
          <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-amber-300 bg-clip-text text-transparent">
            {" "}
            Minutes
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-base text-slate-300 sm:text-lg">
          Move from idea to publish-ready content with a guided, production-ready workflow.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {features.map(({ icon, title, description }: FeatureProps) => (
          <Card key={title} className="glass-panel h-full border-white/10 bg-slate-900/60">
            <CardHeader>
              <CardTitle className="grid place-items-center gap-4 text-slate-100">
                <div className="rounded-2xl border border-cyan-400/35 bg-cyan-300/10 p-3 text-cyan-300">
                  {React.createElement(icon, { size: 30 })}
                </div>
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">{description}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
