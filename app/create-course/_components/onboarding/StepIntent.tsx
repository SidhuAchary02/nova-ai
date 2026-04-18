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
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const popularSuggestions = [
    "React for beginners",
    "Full stack web development",
    "DSA for placements in 60 days",
    "Machine learning with projects",
    "UI/UX portfolio design",
    "Python for data analysis",
    "Advanced JavaScript",
    "Frontend development roadmap",
    "Backend with Node.js",
    "DevOps for beginners",
    "Cloud computing basics",
    "Cybersecurity essentials",
    "AI and deep learning",
    "Mobile app development",
    "Game development",
    "Blockchain development",
    "System design for interviews",
    "Data structures mastery",
    "Build SaaS apps",
    "Startup MVP development",
  ];

  const handleChange = (value: string) => {
    onIntentChange(value);

    if (!value.trim()) {
      setSuggestions(popularSuggestions.slice(0, 8));
    } else {
      const filtered = popularSuggestions.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase())
      );

      setSuggestions(
        filtered.length ? filtered : popularSuggestions.slice(0, 8)
      );
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">
        What do you want to learn?
      </h2>

      <textarea
        value={intent || ""}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="e.g. Learn React to build real-world projects"
        className="w-full rounded-lg bg-slate-900 p-3 text-white"
      />

      <div className="rounded-lg bg-slate-800 p-2">
        {suggestions.map((s, i) => (
          <div
            key={i}
            onClick={() => onIntentChange(s)}
            className="cursor-pointer rounded px-2 py-1 hover:bg-slate-700"
          >
            {s}
          </div>
        ))}

        {intent && (
          <div
            className="mt-2 cursor-pointer text-primary"
            onClick={() => onIntentChange(intent)}
          >
            Use: "{intent}"
          </div>
        )}
      </div>
    </div>
  );
}