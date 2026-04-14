import Header from "./_components/Header";
import Hero from "./_components/Hero";
import DotPattern from "@/components/ui/dot-pattern";
import { ny } from "@/lib/utils";
import { HowItWorks } from "./_components/HowItWorks";
import { AICourseText } from "./_components/AICourseText";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div className="relative z-10">
        <Header />
        <Hero />
        <AICourseText />
        <HowItWorks />
      </div>
      <DotPattern
        className={ny(
          "opacity-45 [mask-image:radial-gradient(700px_circle_at_center,white,transparent)]"
        )}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(14,165,233,0.14),transparent_28%),radial-gradient(circle_at_30%_78%,rgba(251,191,36,0.12),transparent_30%)]" />
    </div>
  );
}
