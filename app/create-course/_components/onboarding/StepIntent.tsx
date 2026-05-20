"use client";

import { generateIntentAssistAction } from "@/app/actions/generateIntentAssistAction";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  buildDetailedPrompt,
  buildTopicSuggestions,
} from "./course-prompt-utils";

type Props = {
  intent: string;
  category: string;
  detailedPrompt: string;
  onIntentChange: (val: string) => void;
  onCategoryChange: (val: string) => void;
  onDetailedPromptChange: (val: string) => void;
};

export function StepIntent({
  intent,
  category,
  detailedPrompt,
  onIntentChange,
  onCategoryChange,
  onDetailedPromptChange,
}: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [committedTopic, setCommittedTopic] = useState("");
  const [isPending, startTransition] = useTransition();
  const requestIdRef = useRef(0);
  const requestTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userEditedPromptRef = useRef(false);

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

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const getFallbackSuggestions = (value: string) =>
    buildTopicSuggestions(value, popularSuggestions);

  const mergeSuggestions = (typed: string, aiItems: string[]) => {
    const results: string[] = [];
    const add = (value: string) => {
      const clean = value.replace(/\s+/g, " ").trim();
      if (!clean) return;
      if (results.some((item) => item.toLowerCase() === clean.toLowerCase())) return;
      results.push(clean);
    };

    aiItems.forEach(add);
    add(typed);
    getFallbackSuggestions(typed).forEach(add);
    return results.slice(0, 5);
  };

  const typeDetailedPrompt = (text: string) => {
    const clean = text.trim();
    if (!clean) return;

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    userEditedPromptRef.current = false;
    onDetailedPromptChange("");

    let index = 0;
    const step = Math.max(2, Math.ceil(clean.length / 80));

    typingIntervalRef.current = setInterval(() => {
      if (userEditedPromptRef.current) {
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
        return;
      }

      index = Math.min(clean.length, index + step);
      onDetailedPromptChange(clean.slice(0, index));

      if (index >= clean.length) {
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    }, 18);
  };

  const requestIntentAssist = (value: string, options?: { selectedTopic?: string }) => {
    const clean = value.trim();
    const selectedTopic = options?.selectedTopic?.trim() || "";
    if (!clean) {
      setAiSuggestions([]);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    startTransition(async () => {
      const res = await generateIntentAssistAction({
        query: clean,
        selectedTopic,
        category,
      });

      if (requestId !== requestIdRef.current) return;

      if (!res.success) {
        setAiSuggestions([]);
        if (selectedTopic && !userEditedPromptRef.current) {
          typeDetailedPrompt(buildDetailedPrompt(selectedTopic));
        }
        return;
      }

      setAiSuggestions(res.suggestions);

      if (selectedTopic && !userEditedPromptRef.current) {
        const prompt = res.detailedPrompt || buildDetailedPrompt(selectedTopic);
        typeDetailedPrompt(prompt);
      }
    });
  };

  useEffect(() => {
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
      requestTimeoutRef.current = null;
    }

    const clean = intent.trim();
    if (!clean) {
      requestIdRef.current += 1;
      setAiSuggestions([]);
      return;
    }
    if (committedTopic === clean) {
      return;
    }

    requestTimeoutRef.current = setTimeout(() => {
      requestIntentAssist(clean);
    }, 450);

    return () => {
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
        requestTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intent, category, committedTopic]);

  const handleTopicChange = (value: string) => {
    onIntentChange(value);
    userEditedPromptRef.current = false;
    if (committedTopic && committedTopic !== value.trim()) {
      setCommittedTopic("");
      requestIdRef.current += 1;
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    }
  };

  const handleSuggestionSelect = (value: string) => {
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
      requestTimeoutRef.current = null;
    }

    setCommittedTopic(value.trim());
    userEditedPromptRef.current = false;
    onIntentChange(value);
    onDetailedPromptChange("");
    setIsFocused(false);
    setAiSuggestions([]);
    requestIntentAssist(value, { selectedTopic: value });
  };

  const handleDetailedPromptChange = (value: string) => {
    userEditedPromptRef.current = true;
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    onDetailedPromptChange(value);
  };

  const suggestions = mergeSuggestions(intent, aiSuggestions);
  const hasCommittedTopic = committedTopic === intent.trim();
  const shouldShowSuggestions =
    isFocused && suggestions.length > 0 && !hasCommittedTopic;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-nova-heading">
        What do you want to learn?
      </h2>

      <textarea
        value={intent || ""}
        onChange={(e) => handleTopicChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        placeholder="e.g. Learn React to build real-world projects"
        className="w-full rounded-lg bg-nova-card border border-black/10 dark:border-white/10 dark:border-white/10 p-3 text-nova-heading shadow-sm dark:shadow-none focus:outline-none focus:ring-2 focus:ring-nova-primary"
        rows={3}
      />

      {shouldShowSuggestions && (
        <div className="rounded-lg bg-nova-card p-2 border border-black/5 dark:border-white/10 dark:border-white/5 shadow-sm dark:shadow-none mt-2 transition-all">
          <div className="text-xs font-semibold text-nova-body mb-2 px-2 uppercase tracking-wider">
            {isPending ? "Thinking..." : "Suggestions"}
          </div>
          <div className="flex flex-col gap-1">
            {suggestions.map((s, i) => (
              <div
                key={i}
                onClick={() => handleSuggestionSelect(s)}
                className="cursor-pointer rounded-md px-3 py-2 text-sm text-nova-body hover:bg-nova-primary/10 hover:text-nova-primary font-medium transition-colors"
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-nova-heading">
          Detailed Prompt
        </label>
        <textarea
          value={detailedPrompt || ""}
          onChange={(e) => handleDetailedPromptChange(e.target.value)}
          placeholder="Describe exactly what the course should cover..."
          className="w-full rounded-lg bg-nova-card border border-black/10 dark:border-white/10 dark:border-white/10 p-3 text-nova-heading shadow-sm dark:shadow-none focus:outline-none focus:ring-2 focus:ring-nova-primary"
          rows={5}
        />
      </div>
    </div>
  );
}
