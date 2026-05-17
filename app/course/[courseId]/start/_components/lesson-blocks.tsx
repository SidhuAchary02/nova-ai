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
    slate: "border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-card shadow-soft",
    gold: "border-amber-200/60 bg-amber-50 shadow-sm dark:shadow-none",
    emerald: "border-emerald-200/60 bg-emerald-50 shadow-sm dark:shadow-none",
    violet: "border-violet-200/60 bg-violet-50 shadow-sm dark:shadow-none",
    cyan: "border-cyan-200/60 bg-cyan-50 shadow-sm dark:shadow-none",
  };

  return (
    <section
      className={`overflow-hidden rounded-[24px] border transition-all duration-300 hover:shadow-md ${accentClasses[accent]}`}
    >
      <div className={compact ? "px-5 py-5" : "px-6 py-6 sm:px-8 sm:py-8"}>
        {title && (
          <h3 className="mb-4 text-base font-semibold uppercase tracking-[0.2em] text-nova-body">
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
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-nova-heading sm:text-3xl">
          {block.title}
        </h2>
        {block.subtitle && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-nova-body sm:text-base">
            {block.subtitle}
          </p>
        )}
      </div>
    </BlockShell>
  );
}

function InsightBlock({ block }: { block: Extract<LessonBlockType, { type: "insight" }> }) {
  const accentMap: Record<string, string> = {
    gold: "bg-amber-50 text-amber-900 border-amber-200/60",
    emerald: "bg-emerald-50 text-emerald-900 border-emerald-200/60",
    violet: "bg-violet-50 text-violet-900 border-violet-200/60",
    cyan: "bg-cyan-50 text-cyan-900 border-cyan-200/60",
  };

  const style = block.accent ? accentMap[block.accent] : accentMap.violet;

  return (
    <section className={`rounded-[24px] border ${style} p-8 shadow-soft relative overflow-hidden group hover:shadow-md transition-shadow`}>
      <div className="absolute top-0 left-0 w-1.5 h-full bg-current opacity-30"></div>
      {block.title && <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-60 mb-3">{block.title}</p>}
      <p className="max-w-3xl text-xl font-medium tracking-wide leading-relaxed">
        {block.content}
      </p>
    </section>
  );
}

function TextBlock({ block }: { block: Extract<LessonBlockType, { type: "text" }> }) {
  return (
    <BlockShell title={block.title} accent="slate">
      {block.emphasis && block.emphasis.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {block.emphasis.map((item) => (
            <span key={item} className="rounded-md bg-nova-primary/10 text-nova-primary font-semibold px-3 py-1.5 text-xs">
              {item}
            </span>
          ))}
        </div>
      )}
      <div className="prose max-w-none prose-headings:text-nova-heading prose-p:text-nova-body prose-strong:text-nova-heading prose-strong:bg-nova-primary/10 prose-strong:px-1 prose-strong:rounded-md prose-code:text-nova-primary prose-code:bg-nova-primary/8 prose-code:rounded prose-code:px-1 prose-a:text-nova-primary text-nova-body leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.body}</ReactMarkdown>
      </div>
    </BlockShell>
  );
}

function VideoBlock({ block }: { block: Extract<LessonBlockType, { type: "video" }> }) {
  const videoId = block.videoId || extractYoutubeId(block.url);
  return (
    <BlockShell title={block.title || "Video walkthrough"} accent="cyan">
      {block.summary && <p className="mb-4 text-sm text-nova-body">{block.summary}</p>}
      {videoId ? (
        <div className="overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-bg">
          <iframe
            className="aspect-video w-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={block.title || "Video walkthrough"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-black/10 dark:border-white/10 dark:border-white/10 bg-nova-bg/60 p-6 text-sm text-nova-body">
          Add a video URL or videoId to enable the video block.
        </div>
      )}
      {block.whyItMatters && (
        <p className="mt-4 text-sm text-nova-body">
          <span className="font-semibold text-nova-heading">Why this matters:</span> {block.whyItMatters}
        </p>
      )}
    </BlockShell>
  );
}

function DiagramBlock({ block }: { block: Extract<LessonBlockType, { type: "diagram" }> }) {
  return (
    <BlockShell title={block.title || "Flow / diagram"} accent="emerald">
      {block.description && <p className="mb-4 text-sm text-nova-body">{block.description}</p>}
      <div className="grid gap-3 sm:grid-cols-3">
        {(block.nodes || ["Start", "Process", "Outcome"]).map((node, index) => (
          <div key={`${node}-${index}`} className="rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-card shadow-sm dark:shadow-none p-4 text-center text-sm font-medium text-nova-heading">
            {node}
          </div>
        ))}
      </div>
      {(block.edges?.length || 0) > 0 && (
        <p className="mt-4 text-xs text-gray-400">
          Connections: {block.edges?.map((edge) => `${edge.from} → ${edge.to}`).join(" · ")}
        </p>
      )}
    </BlockShell>
  );
}

function TableBlock({ block }: { block: Extract<LessonBlockType, { type: "table" }> }) {
  return (
    <BlockShell title={block.title || "Comparison"} accent="gold">
      <div className="overflow-x-auto rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-card shadow-sm dark:shadow-none">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 dark:border-white/10 dark:border-white/5 bg-gray-50 dark:bg-nova-card/5 text-nova-heading">
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
              <tr key={index} className="border-b border-black/5 dark:border-white/10 dark:border-white/5 last:border-0">
                {row.map((cell, cellIndex) => (
                  <td key={`${index}-${cellIndex}`} className="px-4 py-3 text-nova-body">
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
      {block.description && <p className="mb-4 text-sm text-nova-body">{block.description}</p>}
      <div className="space-y-3">
        {block.labels.map((label, index) => {
          const value = block.values[index] || 0;
          const width = `${(value / max) * 100}%`;
          return (
            <div key={label} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-nova-body">
                <span>{label}</span>
                <span>{value}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-nova-card">
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
      {block.explanation && <p className="mb-4 text-sm text-nova-body">{block.explanation}</p>}
      <SandpackRenderer language={block.language} initialCode={block.initialCode} />
      {block.solution && (
        <details className="mt-4 rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-card shadow-sm dark:shadow-none p-4 text-sm text-nova-body">
          <summary className="cursor-pointer select-none font-medium text-nova-heading hover:text-nova-primary transition-colors">Show solution</summary>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-relaxed text-nova-body">
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
      <p className="text-sm leading-relaxed text-nova-body">{block.scenario}</p>
      {block.takeaway && (
        <p className="mt-4 rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-bg/70 px-4 py-3 text-sm text-nova-heading">
          <span className="font-semibold text-primary">Takeaway:</span> {block.takeaway}
        </p>
      )}
    </BlockShell>
  );
}

function AnalogyBlock({ block }: { block: Extract<LessonBlockType, { type: "analogy" }> }) {
  return (
    <BlockShell title={block.title || "Simple analogy"} accent="gold">
      <p className="text-lg font-semibold text-nova-heading">{block.analogy}</p>
      {block.explanation && <p className="mt-3 text-sm text-nova-body">{block.explanation}</p>}
    </BlockShell>
  );
}

function QuizBlock({ block }: { block: Extract<LessonBlockType, { type: "quiz" }> }) {
  return (
    <BlockShell title={block.title || "Quick check-in"} accent="emerald">
      {block.note && <p className="mb-4 text-sm text-nova-body">{block.note}</p>}
      <div className="space-y-4">
        {block.questions.map((question, index) => (
          <div key={`${index}-${question.question}`} className="rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-card shadow-sm dark:shadow-none p-5">
            <p className="font-semibold text-nova-heading text-base">{question.question}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {question.options.map((option, optionIndex) => (
                <div
                  key={`${option}-${optionIndex}`}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    optionIndex === question.correctAnswer
                      ? "border-emerald-400/40 bg-emerald-50 text-emerald-800 font-medium"
                      : "border-black/8 bg-gray-50 dark:bg-nova-card/5 text-nova-body"
                  }`}
                >
                  <span className="mr-2 inline-flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px]">
                    {optionIndex === question.correctAnswer ? <FaCheck className="h-2.5 w-2.5" /> : <FaRegCircle className="h-2.5 w-2.5" />}
                  </span>
                  {option}
                </div>
              ))}
            </div>
            {question.explanation && <p className="mt-3 text-xs text-nova-body">{question.explanation}</p>}
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
          <details key={`${item.label}-${index}`} className="group rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-card shadow-sm dark:shadow-none p-5">
            <summary className="cursor-pointer list-none font-medium text-nova-heading flex items-center justify-between">
              {item.label}
              <span className="text-nova-primary transition-transform group-open:rotate-180">▼</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-nova-body">{item.content}</p>
          </details>
        ))}
      </div>
    </BlockShell>
  );
}

function ImageBlock({ block }: { block: Extract<LessonBlockType, { type: "image" }> }) {
  return (
    <BlockShell title={block.title || "Visual"} accent="cyan">
      <div className="overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-card shadow-sm dark:shadow-none">
        {block.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={block.src} alt={block.title || block.prompt || "Visual"} className="h-auto w-full object-cover" />
        ) : (
          <div className="flex min-h-64 items-center justify-center bg-gray-50 dark:bg-nova-card/5 p-8 text-center border-dashed border-2 border-black/5 dark:border-white/10 dark:border-white/5 m-4 rounded-xl">
            <div>
              <p className="text-lg font-semibold text-nova-heading">AI illustration placeholder</p>
              <p className="mt-2 text-sm text-nova-body">{block.prompt || "Add a generated or curated image here."}</p>
            </div>
          </div>
        )}
      </div>
      {block.caption && <p className="mt-3 text-sm text-nova-body">{block.caption}</p>}
    </BlockShell>
  );
}

function PracticeBlock({ block }: { block: Extract<LessonBlockType, { type: "practice" }> }) {
  return (
    <BlockShell title={block.title || "Practice"} accent="emerald">
      <div className="space-y-2">
        {block.tasks.map((task, index) => (
          <div key={`${task}-${index}`} className="flex gap-3 rounded-xl border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-card shadow-sm dark:shadow-none px-5 py-4 text-sm text-nova-heading">
            <span className="font-bold text-nova-primary">{index + 1}.</span>
            <span>{task}</span>
          </div>
        ))}
      </div>
      {block.note && <p className="mt-4 text-sm text-nova-body">{block.note}</p>}
    </BlockShell>
  );
}

function SummaryBlock({ block }: { block: Extract<LessonBlockType, { type: "summary" }> }) {
  return (
    <BlockShell title={block.title || "Revision notes"} accent="gold">
      <div className="grid gap-2">
        {block.takeaways.map((takeaway, index) => (
          <div key={`${takeaway}-${index}`} className="flex items-start gap-3 rounded-xl border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-card shadow-sm dark:shadow-none px-5 py-4 text-sm text-nova-heading">
            <FaCheck className="mt-0.5 h-4 w-4 text-nova-primary" />
            <span>{takeaway}</span>
          </div>
        ))}
      </div>
      {block.revisionNotes && <p className="mt-4 text-sm text-nova-body">{block.revisionNotes}</p>}
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
