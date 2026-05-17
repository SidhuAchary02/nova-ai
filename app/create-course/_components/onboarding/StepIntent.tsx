"use client";

import { useState } from "react";

type Props = {
  intent: string;
  category: string;
  onIntentChange: (val: string) => void;
  onCategoryChange: (val: string) => void;
};

export function StepIntent({
  intent,
  category,
  onIntentChange,
  onCategoryChange,
}: Props) {
  const [isFocused, setIsFocused] = useState(false);

  const popularSuggestions = [
    "React for beginners",
    "Full stack web development",
    "DSA for placements in 60 days",
    "Machine learning with projects",
    "UI/UX portfolio design",
    "Python for data analysis",
    "Advanced JavaScript concepts",
    "Frontend development roadmap",
    "Backend development with Node.js",
    "DevOps and CI/CD for beginners",
    "Cloud computing basics",
    "Cybersecurity essentials",
    "AI and deep learning fundamentals",
    "Mobile app development with React Native",
    "Game development with Unity",
    "Blockchain and Web3 development",
    "System design for tech interviews",
    "Data structures and algorithms mastery",
    "Build and launch SaaS applications",
    "Startup MVP development guide",
    "iOS app development with Swift",
    "Android development with Kotlin",
    "Data science and visualization",
    "Natural Language Processing (NLP)",
    "SQL and database management",
    "Docker and Kubernetes mastery",
    "Testing and QA automation",
    "Ethical hacking for beginners",
    "Product management for tech",
    "Rust programming for beginners",
    "Go backend development",
    "Learn C++ for game dev"
  ];

  const getFilteredSuggestions = () => {
    if (!intent.trim()) {
      // Before typing: show only 4 popular suggestions
      return popularSuggestions.slice(0, 4);
    }
    // After typing: show ONLY matching suggestions
    const filtered = popularSuggestions.filter((item) =>
      item.toLowerCase().includes(intent.toLowerCase())
    );
    // Do NOT show irrelevant suggestions if no matches
    return filtered.slice(0, 4);
  };

  const suggestions = getFilteredSuggestions();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-nova-heading">
        What do you want to learn?
      </h2>

      <textarea
        value={intent || ""}
        onChange={(e) => onIntentChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        placeholder="e.g. Learn React to build real-world projects"
        className="w-full rounded-lg bg-nova-card border border-black/10 dark:border-white/10 dark:border-white/10 p-3 text-nova-heading shadow-sm dark:shadow-none focus:outline-none focus:ring-2 focus:ring-nova-primary"
        rows={3}
      />

      {suggestions.length > 0 && (
        <div className="rounded-lg bg-nova-card p-2 border border-black/5 dark:border-white/10 dark:border-white/5 shadow-sm dark:shadow-none mt-2 transition-all">
          <div className="text-xs font-semibold text-nova-body mb-2 px-2 uppercase tracking-wider">
            Suggestions
          </div>
          <div className="flex flex-col gap-1">
            {suggestions.map((s, i) => (
              <div
                key={i}
                onClick={() => {
                  onIntentChange(s);
                  setIsFocused(false);
                }}
                className="cursor-pointer rounded-md px-3 py-2 text-sm text-nova-body hover:bg-nova-primary/10 hover:text-nova-primary font-medium transition-colors"
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}