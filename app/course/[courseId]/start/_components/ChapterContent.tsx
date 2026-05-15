"use client";

import { ChapterContentType, ChapterType } from "@/types/types";
import React, { useEffect, useMemo, useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { formatDuration } from "@/utils/formatDuration";
import ReactMarkdown from "react-markdown";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import MermaidBlock from "@/components/MermaidBlock";
import { saveChapterAnnotationAction } from "@/app/actions/saveChapterAnnotation";

type AnnotationType = "bookmark" | "tag" | "sticky-note";

type LessonAnnotation = {
  id: string;
  type: AnnotationType;
  title: string;
  body: string;
  createdAt: string;
  lessonIndex: number;
};

type ChapterContentProps = {
  chapter: ChapterType | null;
  content: ChapterContentType | null;
  courseCategory?: string;
  courseId?: string;
  courseName?: string;
  chapterId?: number;
  subtopicIndex?: number;
};

const videoOpts = {
  height: "390",
  width: "640",
  playerVars: {
    autoplay: 0,
  },
};

const ChapterContent = ({
  chapter,
  content,
  courseCategory,
  courseId,
  courseName,
  chapterId,
  subtopicIndex = 0,
}: ChapterContentProps) => {
  const [annotations, setAnnotations] = useState<LessonAnnotation[]>([]);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number | null>(null);
  const [draftType, setDraftType] = useState<AnnotationType>("bookmark");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [savingAnnotation, setSavingAnnotation] = useState(false);
  const [serializedLessons, setSerializedLessons] = useState<Record<number, any>>({});

  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    event.target.pauseVideo();
  };

  const onPlayerError = (event: any) => {
    console.error("YouTube Player Error:", event.data);
  };

  const lessons = useMemo(() => {
    let contentData = content?.content ?? [];

    if (typeof contentData === "string") {
      try {
        contentData = JSON.parse(contentData);
      } catch (error) {
        console.error("Failed to parse content string:", error);
      }
    }

    return Array.isArray(contentData) ? contentData : [];
  }, [content?.content]);

  // 👇 DEBUG LOGS
  console.log("🔍 DEBUG content prop:", content);
  console.log("🔍 DEBUG lessons array:", lessons);
  console.log("🔍 DEBUG lessons.length:", lessons.length);

  useEffect(() => {
    setAnnotations((content?.annotations ?? []) as LessonAnnotation[]);
    setActiveLessonIndex(null);
    setDraftType("bookmark");
    setDraftTitle("");
    setDraftBody("");
  }, [content?.annotations]);

  useEffect(() => {
    let isMounted = true;

    const serializeLessons = async () => {
      const results: Record<number, any> = {};

      for (let index = 0; index < lessons.length; index += 1) {
        const lesson = lessons[index];
        const lessonRecord = lesson as Record<string, unknown>;
        const rawContent =
          typeof lesson === "string"
            ? lesson
            : (typeof lessonRecord.content === "string" && lessonRecord.content) ||
              (typeof lessonRecord.body === "string" && lessonRecord.body) ||
              "";

        if (!rawContent) continue;

        try {
          results[index] = await serialize(rawContent, {
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [],
            },
          });
        } catch (error) {
          console.warn(`Failed to serialize lesson ${index}:`, error);
          results[index] = null;
        }
      }

      if (isMounted) {
        setSerializedLessons(results);
      }
    };

    if (lessons.length === 0) {
      setSerializedLessons({});
      return;
    }

    void serializeLessons();

    return () => {
      isMounted = false;
    };
  }, [lessons]);

  const beginAnnotation = (lessonIndex: number, type: AnnotationType) => {
    setActiveLessonIndex(lessonIndex);
    setDraftType(type);
    setDraftTitle(type === "bookmark" ? "" : "");
    setDraftBody("");
  };

  const saveAnnotation = async (lessonIndex: number) => {
    const title = draftTitle.trim();
    const body = draftBody.trim();

    if (!title && !body) return;

    if (!courseId || chapterId === undefined) {
      console.error("Missing course or chapter identifier for annotation save");
      return;
    }

    const nextAnnotation: LessonAnnotation = {
      id: `${lessonIndex}-${Date.now()}`,
      type: draftType,
      title: title || (draftType === "bookmark" ? "Saved bookmark" : draftType === "tag" ? "Saved tag" : "Sticky note"),
      body,
      createdAt: new Date().toISOString(),
      lessonIndex,
    };

    setSavingAnnotation(true);

    try {
      const result = await saveChapterAnnotationAction({
        courseId,
        chapterId,
        annotation: nextAnnotation,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to save annotation");
      }

      setAnnotations((result.annotations as LessonAnnotation[]) || []);
      setActiveLessonIndex(null);
      setDraftTitle("");
      setDraftBody("");
      setDraftType("bookmark");
    } catch (error) {
      console.error("Failed to save annotation:", error);
      alert("Unable to save this note right now. Please try again.");
    } finally {
      setSavingAnnotation(false);
    }
  };

  const annotationStyles: Record<
    AnnotationType,
    {
      label: string;
      helper: string;
      container: string;
      chip: string;
      surface: string;
      accent: string;
      preview: string;
    }
  > = {
    bookmark: {
      label: "Bookmark",
      helper: "Save a place you want to return to later.",
      container: "border-cyan-400/20 bg-cyan-500/10",
      chip: "bg-cyan-500/15 text-cyan-200 border-cyan-300/20",
      surface: "bg-slate-950 text-slate-50",
      accent: "bg-cyan-400",
      preview: "from-cyan-500/20 via-slate-950 to-slate-950",
    },
    tag: {
      label: "Tag",
      helper: "Mark a concept or idea worth tracking.",
      container: "border-emerald-400/20 bg-emerald-500/10",
      chip: "bg-emerald-500/15 text-emerald-200 border-emerald-300/20",
      surface: "bg-slate-950 text-slate-50",
      accent: "bg-emerald-400",
      preview: "from-emerald-500/20 via-slate-950 to-slate-950",
    },
    "sticky-note": {
      label: "Sticky note",
      helper: "Leave a quick reminder, question, or insight.",
      container: "border-amber-400/20 bg-amber-500/10",
      chip: "bg-amber-500/15 text-amber-100 border-amber-200/20",
      surface: "bg-[#f4df8a] text-slate-950",
      accent: "bg-amber-400",
      preview: "from-amber-100 via-[#f7e7b4] to-[#f3d96f]",
    },
  };

  const mdxComponents = {
    h1: ({ node, ...props }: any) => (
      <h1 className="text-5xl font-bold text-slate-50 mt-0 mb-8 leading-tight" {...props} />
    ),
    h2: ({ node, ...props }: any) => (
      <h2 className="text-3xl font-bold text-slate-100 mt-12 mb-6 pb-3 border-b border-primary/20" {...props} />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className="text-2xl font-semibold text-slate-100 mt-9 mb-5" {...props} />
    ),
    h4: ({ node, ...props }: any) => (
      <h4 className="text-xl font-semibold text-slate-200 mt-7 mb-4" {...props} />
    ),
    h5: ({ node, ...props }: any) => (
      <h5 className="text-lg font-semibold text-slate-200 mt-6 mb-3" {...props} />
    ),
    h6: ({ node, ...props }: any) => (
      <h6 className="text-base font-semibold text-slate-300 mt-5 mb-3" {...props} />
    ),
    p: ({ node, ...props }: any) => (
      <p className="text-slate-300 leading-7 mb-5 text-base font-normal" {...props} />
    ),
    strong: ({ node, ...props }: any) => (
      <strong className="font-semibold text-slate-100" {...props} />
    ),
    em: ({ node, ...props }: any) => (
      <em className="italic text-slate-200" {...props} />
    ),
    ul: ({ node, ...props }: any) => (
      <ul className="list-disc list-outside space-y-3 text-slate-300 mb-6 ml-6" {...props} />
    ),
    ol: ({ node, ...props }: any) => (
      <ol className="list-decimal list-outside space-y-3 text-slate-300 mb-6 ml-6" {...props} />
    ),
    li: ({ node, ...props }: any) => (
      <li className="text-slate-300 leading-relaxed text-base" {...props} />
    ),
    code: ({ inline, className, children, ...props }: any) => {
      const code = String(children ?? "").replace(/\n$/, "");
      const isMermaid = className?.includes("language-mermaid") || className?.includes("mermaid");

      if (!inline && isMermaid) {
        return <MermaidBlock code={code} />;
      }

      if (!inline) {
        return (
          <pre className="overflow-x-auto rounded-lg bg-slate-900 p-5 text-sm text-slate-200 mb-6 border border-white/10 font-mono leading-6">
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        );
      }

      return (
        <code
          className="rounded bg-slate-900 px-2 py-1 font-mono text-sm text-cyan-300 border border-cyan-900/30 whitespace-nowrap"
          {...props}
        >
          {children}
        </code>
      );
    },
    pre: ({ node, children, ...props }: any) => {
      const child = children as any;
      if (child?.type === MermaidBlock) {
        return child;
      }
      const isMermaid =
        child?.props?.className?.includes("language-mermaid") ||
        child?.props?.className?.includes("mermaid");

      if (isMermaid) {
        const code = String(child?.props?.children ?? "").trim();
        return <MermaidBlock code={code} />;
      }

      return (
        <pre
          className="overflow-x-auto rounded-lg bg-slate-900 p-5 text-sm text-slate-200 mb-6 border border-white/10 font-mono leading-6"
          {...props}
        >
          {children}
        </pre>
      );
    },
    table: ({ node, ...props }: any) => (
      <table className="w-full border-collapse my-7" {...props} />
    ),
    thead: ({ node, ...props }: any) => (
      <thead className="bg-slate-800/60" {...props} />
    ),
    th: ({ node, ...props }: any) => (
      <th className="border border-white/15 bg-slate-800 px-5 py-3 text-left font-semibold text-slate-100 text-base" {...props} />
    ),
    td: ({ node, ...props }: any) => (
      <td className="border border-white/15 px-5 py-3 text-slate-300 text-base" {...props} />
    ),
    blockquote: ({ node, ...props }: any) => (
      <blockquote
        className="border-l-4 border-blue-500 bg-blue-500/10 px-6 py-4 my-7 rounded-r-lg text-slate-200 italic font-normal"
        {...props}
      />
    ),
    a: ({ node, ...props }: any) => (
      <a className="text-blue-400 hover:text-blue-300 underline font-medium transition-colors" {...props} />
    ),
    hr: ({ node, ...props }: any) => (
      <hr className="my-8 border-white/10" {...props} />
    ),
  };

  return (
    <div className="mx-auto max-w-6xl px-3 py-8 sm:px-4">
      <div className="space-y-8 rounded-[28px] border border-white/10 bg-[#060816] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-8">
        <header className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              AI learning flow
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
              {chapter?.chapterName}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {chapter?.description}
            </p>
            {chapter?.duration && (
              <div className="mt-4 inline-flex rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-slate-300">
                ⏱️ Duration: {formatDuration(chapter.duration)}
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Lesson mode
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-100">
                Dynamic block sequence
              </p>
              <p className="mt-1 text-sm text-slate-400">
                The AI decides which visual blocks to use and in what order.
              </p>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-primary">
                Subchapter position
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-100">
                {subtopicIndex + 1}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Within the current chapter flow
              </p>
            </div>
          </div>
        </header>

        {content?.videoId && (
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-[0_16px_50px_rgba(0,0,0,0.25)]">
            <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
              <div className="border-b border-white/10 lg:border-b-0 lg:border-r lg:border-white/10">
                <YouTube
                  videoId={content.videoId}
                  opts={videoOpts}
                  onReady={onPlayerReady}
                  onError={onPlayerError}
                />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Visual anchor
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-50">
                  Why this video matters
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Use the video as a fast mental reset before you move into the
                  interactive blocks below. It should reinforce the same concept
                  from a different angle.
                </p>
                <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-400">
                  If the lesson already contains a video block, the AI will place
                  it in the best position inside the flow.
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="space-y-6">
          {lessons.length === 0 ? (
            <div className="rounded-2xl border border-amber-300/20 bg-amber-500/10 p-8 text-center">
              <p className="text-slate-300">
                No content available for this subtopic yet. Please generate the
                course content first.
              </p>
            </div>
          ) : (
            lessons.map((lesson: any, lessonIndex: number) => {
              // Extract markdown content, handling both string and object formats
              let markdownContent = "";
              if (typeof lesson.content === "string") {
                // If it starts with {, it might be JSON - extract the actual markdown
                if (lesson.content.trim().startsWith("{")) {
                  try {
                    const parsed = JSON.parse(lesson.content);
                    markdownContent = parsed.sections?.[0]?.deep_explanation || parsed.content || "";
                  } catch {
                    markdownContent = lesson.content;
                  }
                } else {
                  markdownContent = lesson.content;
                }
              }

              if (!markdownContent) return null;

              return (
                <div
                  key={`${lesson.title}-${lessonIndex}`}
                  id={`subtopic-${chapterId ?? 0}-${lessonIndex}`}
                  className="prose prose-invert max-w-none space-y-6 scroll-mt-24"
                >
                  {serializedLessons[lessonIndex] ? (
                    <MDXRemote {...serializedLessons[lessonIndex]} components={mdxComponents} />
                  ) : markdownContent ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdxComponents as any}>
                      {markdownContent}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-slate-400 text-sm">Loading lesson content...</p>
                  )}

                  <div className="not-prose mt-8 overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/80 shadow-[0_18px_55px_rgba(0,0,0,0.28)]">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
                      <div>
                        <p className="text-sm font-semibold text-slate-100">
                          Pin a thought to this lesson
                        </p>
                        <p className="text-xs text-slate-400">
                          Bookmark a place, tag an idea, or drop a sticky note.
                        </p>
                      </div>
                      <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 sm:flex">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        {annotations.filter((annotation) => annotation.lessonIndex === lessonIndex).length} saved
                      </div>
                    </div>

                    <div className="grid gap-3 border-b border-white/10 p-4 md:grid-cols-3 sm:p-5">
                      {(["bookmark", "tag", "sticky-note"] as AnnotationType[]).map((type) => {
                        const isActive = draftType === type;

                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => beginAnnotation(lessonIndex, type)}
                            className={`group relative overflow-hidden rounded-[22px] border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                              isActive
                                ? "border-primary/50 bg-white/10 shadow-[0_14px_34px_rgba(59,130,246,0.15)]"
                                : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                            }`}
                          >
                            <div className={`absolute inset-x-0 top-0 h-1 ${annotationStyles[type].accent}`} />
                            <div className="flex items-start gap-3">
                              <div className={`relative mt-0.5 flex h-12 w-12 flex-none items-center justify-center rounded-[18px] border ${annotationStyles[type].chip}`}>
                                {type === "bookmark" && (
                                  <div className="flex h-7 w-4 items-center justify-center rounded-[2px] rounded-b-[8px] bg-current/85">
                                    <div className="mt-auto h-2 w-2 rounded-full bg-slate-950/70" />
                                  </div>
                                )}
                                {type === "tag" && (
                                  <div className="relative h-6 w-8 rounded-full border-2 border-current/90 bg-transparent">
                                    <div className="absolute left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-current" />
                                  </div>
                                )}
                                {type === "sticky-note" && (
                                  <div className={`relative h-7 w-7 rounded-[7px] border border-slate-900/10 bg-gradient-to-br ${annotationStyles[type].preview} shadow-sm`}>
                                    <div className="absolute right-0 top-0 h-3 w-3 rounded-bl-[7px] bg-white/45" />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${annotationStyles[type].chip}`}>
                                    {annotationStyles[type].label}
                                  </span>
                                  {isActive && (
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                                      selected
                                    </span>
                                  )}
                                </div>
                                <p className="mt-2 text-sm font-semibold text-slate-100">
                                  {annotationStyles[type].label} this spot
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                  {annotationStyles[type].helper}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {activeLessonIndex === lessonIndex && (
                      <div className="p-4 sm:p-5">
                        <div
                          className={`relative overflow-hidden rounded-[26px] border shadow-[0_16px_40px_rgba(0,0,0,0.18)] ${annotationStyles[draftType].surface} ${
                            draftType === "sticky-note"
                              ? "border-amber-200/60"
                              : draftType === "tag"
                              ? "border-emerald-400/20"
                              : "border-cyan-400/20"
                          }`}
                        >
                          <div className="absolute right-4 top-4 h-4 w-4 rounded-full bg-black/15 shadow-[0_0_0_6px_rgba(255,255,255,0.2)]" />
                          <div className="absolute left-0 top-0 h-full w-1.5 bg-black/10" />

                          <div className="px-5 pb-5 pt-4">
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${annotationStyles[draftType].accent}`} />
                                <p className="text-sm font-bold uppercase tracking-[0.18em] text-current/80">
                                  {annotationStyles[draftType].label}
                                </p>
                              </div>
                              <p className={`text-xs ${draftType === "sticky-note" ? "text-slate-700" : "text-slate-300"}`}>
                                {draftType === "bookmark"
                                  ? "Quick mark for later"
                                  : draftType === "tag"
                                  ? "Label a theme or idea"
                                  : "Leave yourself a note"}
                              </p>
                            </div>

                            <div className={`mt-4 rounded-[20px] border px-4 py-4 ${draftType === "sticky-note" ? "border-slate-900/10 bg-white/30" : "border-white/10 bg-white/5"}`}>
                              <input
                                value={draftTitle}
                                onChange={(event) => setDraftTitle(event.target.value)}
                                placeholder={
                                  draftType === "bookmark"
                                    ? "Bookmark title"
                                    : draftType === "tag"
                                    ? "Tag name"
                                    : "Sticky note title"
                                }
                                className={`w-full border-0 bg-transparent text-base font-semibold outline-none placeholder:font-medium ${draftType === "sticky-note" ? "text-slate-950 placeholder:text-slate-600" : "text-white placeholder:text-slate-400"}`}
                              />

                              <div className={`my-3 h-px w-full ${draftType === "sticky-note" ? "bg-slate-900/10" : "bg-white/10"}`} />

                              <textarea
                                rows={4}
                                value={draftBody}
                                onChange={(event) => setDraftBody(event.target.value)}
                                placeholder={
                                  draftType === "sticky-note"
                                    ? "Write the reminder, insight, or question here..."
                                    : "Add a short detail if you want"
                                }
                                className={`w-full resize-none border-0 bg-transparent text-sm leading-6 outline-none ${draftType === "sticky-note" ? "text-slate-950 placeholder:text-slate-600" : "text-slate-200 placeholder:text-slate-400"}`}
                              />
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                              <p className={`text-xs ${draftType === "sticky-note" ? "text-slate-700" : "text-slate-400"}`}>
                                This note will stay attached to this lesson only.
                              </p>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setActiveLessonIndex(null)}
                                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${draftType === "sticky-note" ? "bg-black/10 text-slate-900 hover:bg-black/15" : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => saveAnnotation(lessonIndex)}
                                  disabled={savingAnnotation}
                                  className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${draftType === "sticky-note" ? "bg-slate-950 text-[#f4df8a] hover:bg-black" : "bg-primary text-slate-950 hover:bg-primary/90"}`}
                                >
                                  {savingAnnotation ? "Saving..." : "Pin it"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {annotations.filter((annotation) => annotation.lessonIndex === lessonIndex).length > 0 && (
                      <div className="grid gap-3 border-t border-white/10 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
                        {annotations
                          .filter((annotation) => annotation.lessonIndex === lessonIndex)
                          .map((annotation) => (
                            <div
                              key={annotation.id}
                              className={`relative overflow-hidden rounded-[22px] border p-4 shadow-[0_12px_30px_rgba(0,0,0,0.16)] ${annotationStyles[annotation.type].container} ${
                                annotation.type === "sticky-note"
                                  ? "bg-[#f4df8a] text-slate-950"
                                  : "bg-slate-950/70 text-slate-50"
                              }`}
                            >
                              <div className={`absolute right-3 top-3 h-8 w-8 rounded-bl-[18px] ${annotation.type === "sticky-note" ? "bg-white/45" : "bg-white/10"}`} />
                              <div className="flex items-center gap-2">
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${annotationStyles[annotation.type].chip}`}>
                                  {annotationStyles[annotation.type].label}
                                </span>
                                <span className={`text-[11px] ${annotation.type === "sticky-note" ? "text-slate-700" : "text-slate-400"}`}>
                                  {new Date(annotation.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="mt-3 text-sm font-bold leading-6">
                                {annotation.title}
                              </p>
                              {annotation.body && (
                                <p className={`mt-2 text-sm leading-6 ${annotation.type === "sticky-note" ? "text-slate-800" : "text-slate-300"}`}>
                                  {annotation.body}
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterContent;
