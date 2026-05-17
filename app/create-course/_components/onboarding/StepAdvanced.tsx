"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaWandMagicSparkles } from "react-icons/fa6";
import { Input } from "@/components/ui/input";
import { useState, useCallback, type KeyboardEvent } from "react";
import type { PacingStyle } from "@/types/types";

type Props = {
  topicsToFocus: string[];
  topicsToAvoid: string[];
  pacingStyle: PacingStyle;
  onFocusTagsChange: (tags: string[]) => void;
  onAvoidTagsChange: (tags: string[]) => void;
  onPacingChange: (p: PacingStyle) => void;
};

function TagInput({
  label,
  helper,
  tags,
  onChange,
  placeholder,
}: {
  label?: string;
  helper?: string;
  tags: string[];
  onChange: (t: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  const commit = useCallback(() => {
    const t = draft.trim();
    if (!t) return;
    if (!tags.includes(t)) onChange([...tags, t]);
    setDraft("");
  }, [draft, tags, onChange]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-nova-heading">{label}</label>}
      {helper && <p className="text-xs text-gray-400">{helper}</p>}
      <div className="flex flex-wrap gap-2 rounded-xl border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-bg/60 p-2">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onChange(tags.filter((x) => x !== tag))}
            className="rounded-full bg-gray-50 dark:bg-nova-card/5 px-3 py-1 text-xs font-medium text-nova-heading hover:bg-gray-100 dark:bg-nova-card/10"
          >
            {tag} ×
          </button>
        ))}
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
          placeholder={placeholder}
          className="min-w-[160px] flex-1 border-0 bg-transparent text-sm text-nova-heading placeholder:text-gray-400 focus-visible:ring-0"
        />
      </div>
    </div>
  );
}

const PACING: { id: PacingStyle; title: string; hint: string }[] = [
  { id: "easy", title: "Easy & slow", hint: "More scaffolding, gentler ramp" },
  { id: "balanced", title: "Balanced", hint: "Default — steady challenge" },
  { id: "fast", title: "Fast-paced", hint: "Dense, fewer repeats" },
];

export function StepAdvanced({
  topicsToFocus,
  topicsToAvoid,
  pacingStyle,
  onFocusTagsChange,
  onAvoidTagsChange,
  onPacingChange,
}: Props) {
  const [open, setOpen] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="mx-auto w-full max-w-xl space-y-6"
    >
      <div className="flex items-center gap-2 text-primary">
        <FaWandMagicSparkles className="h-5 w-5" />
        <span className="text-sm font-medium tracking-wide">Step 6 of 7</span>
      </div>

      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-nova-heading sm:text-4xl">
          Fine-tune
        </h2>
        <p className="mt-3 text-base text-nova-body">
          Optional tweaks — skip if you want us to decide everything.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-base font-semibold text-nova-heading">
            Preferred difficulty style
          </label>
          <p className="text-sm text-nova-body">
            Influences course difficulty labels and density — not your intelligence.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {PACING.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPacingChange(p.id)}
              className={`rounded-xl border px-4 py-4 text-left transition ${
                pacingStyle === p.id
                  ? "border-primary bg-primary/10 text-nova-heading shadow-sm dark:shadow-none"
                  : "border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-card/50 text-nova-body hover:border-black/10 dark:border-white/10 dark:border-white/10 hover:bg-nova-card/80"
              }`}
            >
              <div className="font-bold text-sm">{p.title}</div>
              <div className="mt-1 text-xs opacity-80">{p.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-card/60 px-5 py-4 text-left transition hover:bg-nova-card/80"
      >
        <span className="font-medium text-nova-heading text-lg">Advanced customization <span className="font-normal opacity-70 text-base">(optional)</span></span>
        <FaChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-5"
          >
            <div>
              <label className="text-base font-semibold text-nova-heading">
                Topics to Focus on
              </label>
              <p className="mt-1 text-sm text-nova-body">
                Force the AI to include these topics.
              </p>
              <TagInput
                tags={topicsToFocus}
                onChange={onFocusTagsChange}
                placeholder="Add topics to focus..."
              />
            </div>
            
            <div>
              <label className="text-base font-semibold text-nova-heading">
                Topics to Avoid
              </label>
              <p className="mt-1 text-sm text-nova-body">
                Keep the AI away from these subjects.
              </p>
              <TagInput
                tags={topicsToAvoid}
                onChange={onAvoidTagsChange}
                placeholder="Add to avoid…"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
