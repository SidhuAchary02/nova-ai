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
  label: string;
  helper: string;
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
      <label className="text-sm font-medium text-slate-200">{label}</label>
      <p className="text-xs text-slate-500">{helper}</p>
      <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-slate-950/60 p-2">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onChange(tags.filter((x) => x !== tag))}
            className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700"
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
          className="min-w-[160px] flex-1 border-0 bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus-visible:ring-0"
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
        <h2 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          Fine-tune (optional)
        </h2>
        <p className="mt-3 text-base text-slate-400">
          Optional tweaks — skip if you want us to decide everything.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-5 py-4 text-left transition hover:bg-slate-900/80"
      >
        <span className="font-medium text-slate-200">Advanced customization</span>
        <FaChevronDown
          className={`h-4 w-4 text-slate-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-8 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 p-5 sm:p-6"
          >
            <TagInput
              label="Topics to focus"
              helper="Press Enter after each tag — we prioritize these in your plan."
              tags={topicsToFocus}
              onChange={onFocusTagsChange}
              placeholder="Add a topic…"
            />

            <TagInput
              label="Topics to avoid (optional)"
              helper="We&apos;ll steer away from these where possible."
              tags={topicsToAvoid}
              onChange={onAvoidTagsChange}
              placeholder="Add to avoid…"
            />

            <div>
              <label className="text-sm font-medium text-slate-200">
                Preferred difficulty style
              </label>
              <p className="mt-1 text-xs text-slate-500">
                Influences course difficulty labels and density — not your intelligence.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {PACING.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onPacingChange(p.id)}
                    className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                      pacingStyle === p.id
                        ? "border-primary bg-primary/10 text-slate-50"
                        : "border-white/10 bg-slate-900/50 text-slate-300 hover:border-white/20"
                    }`}
                  >
                    <div className="font-semibold">{p.title}</div>
                    <div className="mt-1 text-xs text-slate-500">{p.hint}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
