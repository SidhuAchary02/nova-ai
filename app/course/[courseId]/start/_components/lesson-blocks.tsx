"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaCheck, FaRegCircle } from "react-icons/fa6";
import { LessonBlockType } from "@/types/types";
import SandpackRenderer from "./SandpackRenderer";

function BlockShell({
  title,
  children,
  accent = "slate",
  compact = false,
}: {
  title?: string;
  children: React.ReactNode;
  accent?: "slate" | "gold" | "emerald" | "violet" | "cyan";
  compact?: boolean;
}) {
  const accentClasses: Record<string, string> = {
    slate: "border-white/10 bg-slate-950/70",
    gold: "border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-slate-950/70 to-slate-950",
    emerald: "border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-950/70 to-slate-950",
    violet: "border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-slate-950/70 to-slate-950",
    cyan: "border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-slate-950/70 to-slate-950",
  };

  return (
    <section
      className={`overflow-hidden rounded-2xl border shadow-[0_16px_40px_rgba(2,6,23,0.3)] ${accentClasses[accent]}`}
    >
      <div className={compact ? "px-5 py-5" : "px-6 py-6 sm:px-8 sm:py-8"}>
        {title && (
          <h3 className="mb-4 text-base font-semibold uppercase tracking-[0.2em] text-slate-400">
            {title}
          </h3>
        )}
        {children}
      </div>
    </section>
  );
}

function HeroBlock({ block }: { block: Extract<LessonBlockType, { type: "hero" }> }) {
  return (
    <BlockShell accent="violet">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Subchapter opener
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
            {block.title}
          </h2>
          {block.subtitle && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              {block.subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-200">
          {block.estimatedMinutes && (
            <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1">
              {block.estimatedMinutes}
            </span>
          )}
          {block.difficulty && (
            <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1">
              {block.difficulty}
            </span>
          )}
        </div>
      </div>
      {block.note && (
        <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-slate-300">
          <span className="font-semibold text-primary">AI note:</span> {block.note}
        </div>
      )}
    </BlockShell>
  );
}

function InsightBlock({ block }: { block: Extract<LessonBlockType, { type: "insight" }> }) {
  const accentMap: Record<string, string> = {
    gold: "from-amber-500/20 via-slate-950/80 to-slate-950",
    emerald: "from-emerald-500/20 via-slate-950/80 to-slate-950",
    violet: "from-violet-500/20 via-slate-950/80 to-slate-950",
    cyan: "from-cyan-500/20 via-slate-950/80 to-slate-950",
  };

  const gradient = block.accent ? accentMap[block.accent] : accentMap.violet;

  return (
    <section className={`rounded-3xl border border-white/10 bg-gradient-to-br ${gradient} p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)]`}>
      {block.title && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{block.title}</p>}
      <p className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
        {block.content}
      </p>
    </section>
  );
}

function TextBlock({ block }: { block: Extract<LessonBlockType, { type: "text" }> }) {
  return (
    <BlockShell title={block.title} accent="slate">
      {block.emphasis && block.emphasis.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {block.emphasis.map((item) => (
            <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              {item}
            </span>
          ))}
        </div>
      )}
      <div className="prose prose-slate max-w-none prose-headings:text-slate-50 prose-p:text-slate-300 prose-strong:text-primary prose-code:text-amber-200">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.body}</ReactMarkdown>
      </div>
    </BlockShell>
  );
}

function VideoBlock({ block }: { block: Extract<LessonBlockType, { type: "video" }> }) {
  const videoId = block.videoId || extractYoutubeId(block.url);
  return (
    <BlockShell title={block.title || "Video walkthrough"} accent="cyan">
      {block.summary && <p className="mb-4 text-sm text-slate-300">{block.summary}</p>}
      {videoId ? (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
          <iframe
            className="aspect-video w-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={block.title || "Video walkthrough"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/60 p-6 text-sm text-slate-400">
          Add a video URL or videoId to enable the video block.
        </div>
      )}
      {block.whyItMatters && (
        <p className="mt-4 text-sm text-slate-400">
          <span className="font-semibold text-slate-200">Why this matters:</span> {block.whyItMatters}
        </p>
      )}
    </BlockShell>
  );
}

function DiagramBlock({ block }: { block: Extract<LessonBlockType, { type: "diagram" }> }) {
  return (
    <BlockShell title={block.title || "Flow / diagram"} accent="emerald">
      {block.description && <p className="mb-4 text-sm text-slate-300">{block.description}</p>}
      <div className="grid gap-3 sm:grid-cols-3">
        {(block.nodes || ["Start", "Process", "Outcome"]).map((node, index) => (
          <div key={`${node}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-center text-sm text-slate-200">
            {node}
          </div>
        ))}
      </div>
      {(block.edges?.length || 0) > 0 && (
        <p className="mt-4 text-xs text-slate-500">
          Connections: {block.edges?.map((edge) => `${edge.from} → ${edge.to}`).join(" · ")}
        </p>
      )}
    </BlockShell>
  );
}

function TableBlock({ block }: { block: Extract<LessonBlockType, { type: "table" }> }) {
  return (
    <BlockShell title={block.title || "Comparison"} accent="gold">
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/70">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-slate-900/80 text-slate-200">
            <tr>
              {block.headers.map((header) => (
                <th key={header} className="px-4 py-3 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, index) => (
              <tr key={index} className="border-b border-white/5 last:border-0">
                {row.map((cell, cellIndex) => (
                  <td key={`${index}-${cellIndex}`} className="px-4 py-3 text-slate-300">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BlockShell>
  );
}

function ChartBlock({ block }: { block: Extract<LessonBlockType, { type: "chart" }> }) {
  const max = Math.max(...block.values, 1);
  return (
    <BlockShell title={block.title || "Visualization"} accent="cyan">
      {block.description && <p className="mb-4 text-sm text-slate-300">{block.description}</p>}
      <div className="space-y-3">
        {block.labels.map((label, index) => {
          const value = block.values[index] || 0;
          const width = `${(value / max) * 100}%`;
          return (
            <div key={label} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{label}</span>
                <span>{value}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-900">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400" style={{ width }} />
              </div>
            </div>
          );
        })}
      </div>
    </BlockShell>
  );
}

function CodeBlock({ block }: { block: Extract<LessonBlockType, { type: "code" }> }) {
  return (
    <BlockShell title={block.title || "Interactive code"} accent="slate">
      {block.explanation && <p className="mb-4 text-sm text-slate-300">{block.explanation}</p>}
      <SandpackRenderer language={block.language} initialCode={block.initialCode} />
      {block.solution && (
        <details className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
          <summary className="cursor-pointer select-none font-medium text-slate-200">Show solution</summary>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-relaxed text-slate-300">
            {block.solution}
          </pre>
        </details>
      )}
    </BlockShell>
  );
}

function ExampleBlock({ block }: { block: Extract<LessonBlockType, { type: "example" }> }) {
  return (
    <BlockShell title={block.title || "Real-world example"} accent="violet">
      <p className="text-sm leading-relaxed text-slate-300">{block.scenario}</p>
      {block.takeaway && (
        <p className="mt-4 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
          <span className="font-semibold text-primary">Takeaway:</span> {block.takeaway}
        </p>
      )}
    </BlockShell>
  );
}

function AnalogyBlock({ block }: { block: Extract<LessonBlockType, { type: "analogy" }> }) {
  return (
    <BlockShell title={block.title || "Simple analogy"} accent="gold">
      <p className="text-lg font-semibold text-slate-50">{block.analogy}</p>
      {block.explanation && <p className="mt-3 text-sm text-slate-300">{block.explanation}</p>}
    </BlockShell>
  );
}

function QuizBlock({ block }: { block: Extract<LessonBlockType, { type: "quiz" }> }) {
  return (
    <BlockShell title={block.title || "Quick check-in"} accent="emerald">
      {block.note && <p className="mb-4 text-sm text-slate-300">{block.note}</p>}
      <div className="space-y-4">
        {block.questions.map((question, index) => (
          <div key={`${index}-${question.question}`} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <p className="font-medium text-slate-100">{question.question}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {question.options.map((option, optionIndex) => (
                <div
                  key={`${option}-${optionIndex}`}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    optionIndex === question.correctAnswer
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                      : "border-white/10 bg-white/5 text-slate-300"
                  }`}
                >
                  <span className="mr-2 inline-flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px]">
                    {optionIndex === question.correctAnswer ? <FaCheck className="h-2.5 w-2.5" /> : <FaRegCircle className="h-2.5 w-2.5" />}
                  </span>
                  {option}
                </div>
              ))}
            </div>
            {question.explanation && <p className="mt-3 text-xs text-slate-400">{question.explanation}</p>}
          </div>
        ))}
      </div>
    </BlockShell>
  );
}

function AccordionBlock({ block }: { block: Extract<LessonBlockType, { type: "accordion" }> }) {
  return (
    <BlockShell title={block.title || "Deep dive"} accent="slate">
      <div className="space-y-3">
        {block.items.map((item, index) => (
          <details key={`${item.label}-${index}`} className="group rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <summary className="cursor-pointer list-none font-medium text-slate-200">
              {item.label}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.content}</p>
          </details>
        ))}
      </div>
    </BlockShell>
  );
}

function ImageBlock({ block }: { block: Extract<LessonBlockType, { type: "image" }> }) {
  return (
    <BlockShell title={block.title || "Visual"} accent="cyan">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
        {block.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={block.src} alt={block.title || block.prompt || "Visual"} className="h-auto w-full object-cover" />
        ) : (
          <div className="flex min-h-64 items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 text-center">
            <div>
              <p className="text-lg font-semibold text-slate-100">AI illustration placeholder</p>
              <p className="mt-2 text-sm text-slate-400">{block.prompt || "Add a generated or curated image here."}</p>
            </div>
          </div>
        )}
      </div>
      {block.caption && <p className="mt-3 text-sm text-slate-400">{block.caption}</p>}
    </BlockShell>
  );
}

function PracticeBlock({ block }: { block: Extract<LessonBlockType, { type: "practice" }> }) {
  return (
    <BlockShell title={block.title || "Practice"} accent="emerald">
      <div className="space-y-2">
        {block.tasks.map((task, index) => (
          <div key={`${task}-${index}`} className="flex gap-3 rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
            <span className="mt-0.5 text-primary">{index + 1}.</span>
            <span>{task}</span>
          </div>
        ))}
      </div>
      {block.note && <p className="mt-4 text-sm text-slate-400">{block.note}</p>}
    </BlockShell>
  );
}

function SummaryBlock({ block }: { block: Extract<LessonBlockType, { type: "summary" }> }) {
  return (
    <BlockShell title={block.title || "Revision notes"} accent="gold">
      <div className="grid gap-2">
        {block.takeaways.map((takeaway, index) => (
          <div key={`${takeaway}-${index}`} className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-200">
            <FaCheck className="mt-1 h-3.5 w-3.5 text-primary" />
            <span>{takeaway}</span>
          </div>
        ))}
      </div>
      {block.revisionNotes && <p className="mt-4 text-sm text-slate-400">{block.revisionNotes}</p>}
    </BlockShell>
  );
}

function extractYoutubeId(url?: string) {
  if (!url) return undefined;
  const match = url.match(/(?:v=|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return match?.[1];
}

export function renderLessonBlock(block: LessonBlockType, key?: string | number) {
  switch (block.type) {
    case "hero":
      return <HeroBlock key={key} block={block} />;
    case "insight":
      return <InsightBlock key={key} block={block} />;
    case "text":
      return <TextBlock key={key} block={block} />;
    case "video":
      return <VideoBlock key={key} block={block} />;
    case "diagram":
      return <DiagramBlock key={key} block={block} />;
    case "table":
      return <TableBlock key={key} block={block} />;
    case "chart":
      return <ChartBlock key={key} block={block} />;
    case "code":
      return <CodeBlock key={key} block={block} />;
    case "example":
      return <ExampleBlock key={key} block={block} />;
    case "analogy":
      return <AnalogyBlock key={key} block={block} />;
    case "quiz":
      return <QuizBlock key={key} block={block} />;
    case "accordion":
      return <AccordionBlock key={key} block={block} />;
    case "image":
      return <ImageBlock key={key} block={block} />;
    case "practice":
      return <PracticeBlock key={key} block={block} />;
    case "summary":
      return <SummaryBlock key={key} block={block} />;
    default:
      return null;
  }
}

export function legacySectionToBlocks(
  section: {
    title: string;
    learning_overview?: string;
    deep_explanation?: string;
    code_sandbox?: { language: string; initial_code: string; solution?: string };
    mini_challenge?: { challenge: string; hint?: string };
    interview_relevance?: string;
    summary_cheat_sheet?: string | string[];
  },
  context: {
    chapterName?: string;
    courseCategory?: string;
  }
): LessonBlockType[] {
  const blocks: LessonBlockType[] = [
    {
      type: "hero",
      title: section.title,
      subtitle: context.chapterName ? `Inside ${context.chapterName}` : undefined,
      estimatedMinutes: "5-8 min",
      difficulty: context.courseCategory ? `Optimized for ${context.courseCategory}` : undefined,
      note: "This section is automatically curated to keep you moving.",
    },
  ];

  if (section.learning_overview) {
    blocks.push({
      type: "insight",
      content: section.learning_overview,
      accent: "cyan",
    });
  }

  if (section.deep_explanation) {
    blocks.push({
      type: "text",
      title: "Core explanation",
      body: section.deep_explanation,
    });
  }

  if (section.code_sandbox?.initial_code) {
    blocks.push({
      type: "code",
      title: "Interactive example",
      language: section.code_sandbox.language,
      initialCode: section.code_sandbox.initial_code,
      solution: section.code_sandbox.solution,
      explanation: "Run the snippet and inspect how the concept behaves in real time.",
    });
  }

  if (section.mini_challenge) {
    blocks.push({
      type: "practice",
      title: "Mini challenge",
      tasks: [section.mini_challenge.challenge],
      note: section.mini_challenge.hint,
    });
  }

  if (section.interview_relevance) {
    blocks.push({
      type: "example",
      title: "Why it matters in the real world",
      scenario: section.interview_relevance,
      takeaway: "Learn to connect the concept to practical decisions and interview discussions.",
    });
  }

  const summaryItems = Array.isArray(section.summary_cheat_sheet)
    ? section.summary_cheat_sheet
    : section.summary_cheat_sheet
      ? section.summary_cheat_sheet
          .split(/\n+/)
          .map((line) => line.replace(/^[-*\u2022]\s*/, "").trim())
          .filter(Boolean)
      : [];

  if (summaryItems.length > 0) {
    blocks.push({
      type: "summary",
      title: "Key takeaways",
      takeaways: summaryItems,
      revisionNotes: "Use these points to recap before moving to the next lesson.",
    });
  }

  return blocks;
}
