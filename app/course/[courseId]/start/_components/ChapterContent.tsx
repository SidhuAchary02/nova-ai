"use client";

import { ChapterContentType, ChapterType } from "@/types/types";
import React, { useEffect, useMemo, useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { formatDuration } from "@/utils/formatDuration";
import ReactMarkdown from "react-markdown";
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

const getLessonRawContent = (lesson: unknown) => {
  if (typeof lesson === "string") return lesson;
  if (!lesson || typeof lesson !== "object") return "";

  const record = lesson as Record<string, unknown>;

  if (typeof record.content === "string") return record.content;
  if (typeof record.body === "string") return record.body;
  if (typeof record.deep_explanation === "string") return record.deep_explanation;
  if (typeof record.explanation === "string") return record.explanation;

  return "";
};

const cleanupPlaceholderCodeBlocks = (content: string) =>
  content.replace(
    /(^|\n)([ \t]*)```(?:code)?[ \t]*\n[ \t]*code[ \t]*\n[ \t]*```(?=\n|$)/gi,
    "$1$2`code`"
  );

const normalizeMarkdownContent = (rawContent: string) => {
  const trimmed = rawContent.trim();

  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      return cleanupPlaceholderCodeBlocks(
        parsed.sections?.[0]?.deep_explanation || parsed.content || rawContent
      );
    } catch {
      return cleanupPlaceholderCodeBlocks(rawContent);
    }
  }

  return cleanupPlaceholderCodeBlocks(rawContent);
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

  const selectedLessonIndex =
    lessons.length > 0 && lessons[subtopicIndex] ? subtopicIndex : 0;
  const visibleLessons =
    lessons.length > 0
      ? [{ lesson: lessons[selectedLessonIndex], lessonIndex: selectedLessonIndex }]
      : [];

  useEffect(() => {
    setAnnotations((content?.annotations ?? []) as LessonAnnotation[]);
    setActiveLessonIndex(null);
    setDraftType("bookmark");
    setDraftTitle("");
    setDraftBody("");
  }, [content?.annotations, subtopicIndex]);

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
      container: "border-cyan-200 bg-cyan-50",
      chip: "bg-cyan-100 text-cyan-800 border-cyan-300 font-semibold",
      surface: "bg-white border border-black/10 text-nova-heading shadow-sm",
      accent: "bg-cyan-500",
      preview: "from-cyan-100 via-cyan-50 to-white",
    },
    tag: {
      label: "Tag",
      helper: "Mark a concept or idea worth tracking.",
      container: "border-emerald-200 bg-emerald-50",
      chip: "bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold",
      surface: "bg-white border border-black/10 text-nova-heading shadow-sm",
      accent: "bg-emerald-500",
      preview: "from-emerald-100 via-emerald-50 to-white",
    },
    "sticky-note": {
      label: "Sticky note",
      helper: "Leave a quick reminder, question, or insight.",
      container: "border-amber-200 bg-amber-50",
      chip: "bg-amber-100 text-amber-800 border-amber-300 font-semibold",
      surface: "bg-[#fef9c3] text-amber-900 border border-amber-200 shadow-sm",
      accent: "bg-amber-500",
      preview: "from-amber-100 via-[#fef9c3] to-white",
    },
  };

  const mdxComponents = {
    h1: ({ node, ...props }: any) => (
      <h1 className="text-4xl font-bold tracking-tight text-nova-heading mt-0 mb-6 leading-tight" {...props} />
    ),
    h2: ({ node, ...props }: any) => (
      <h2 className="text-2xl font-bold tracking-tight text-nova-heading mt-12 mb-5 pb-3 border-b border-black/5 flex items-center gap-3 before:content-[''] before:block before:w-1.5 before:h-6 before:bg-nova-primary before:rounded-full" {...props} />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className="text-xl font-semibold tracking-tight text-nova-primary mt-9 mb-4" {...props} />
    ),
    h4: ({ node, ...props }: any) => (
      <h4 className="text-lg font-semibold text-nova-heading mt-7 mb-3" {...props} />
    ),
    h5: ({ node, ...props }: any) => (
      <h5 className="text-base font-semibold text-nova-heading mt-6 mb-3 uppercase tracking-wider text-xs" {...props} />
    ),
    h6: ({ node, ...props }: any) => (
      <h6 className="text-sm font-semibold text-nova-body mt-5 mb-3 uppercase tracking-wider" {...props} />
    ),
    p: ({ node, ...props }: any) => (
      <p className="text-nova-body leading-[1.8] mb-6 text-base font-normal tracking-wide" {...props} />
    ),
    strong: ({ node, ...props }: any) => (
      <strong className="font-semibold text-nova-heading bg-nova-primary/10 px-1.5 py-0.5 rounded-md" {...props} />
    ),
    em: ({ node, ...props }: any) => (
      <em className="italic text-nova-heading font-medium" {...props} />
    ),
    ul: ({ node, ...props }: any) => (
      <ul className="list-none space-y-3 mb-8 ml-2" {...props} />
    ),
    ol: ({ node, ...props }: any) => (
      <ol className="list-decimal list-outside space-y-3 text-nova-body mb-8 ml-6 font-medium" {...props} />
    ),
    li: ({ node, ...props }: any) => (
      <li className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2.5 before:w-2 before:h-2 before:bg-nova-primary/50 before:rounded-full text-nova-body leading-[1.8] text-base" {...props} />
    ),
    code: ({ inline, className, children, ...props }: any) => {
      const code = String(children ?? "").replace(/\n$/, "");
      const isMermaid = className?.includes("language-mermaid") || className?.includes("mermaid");

      if (!inline && isMermaid) {
        return <MermaidBlock code={code} />;
      }

      if (!inline) {
        return (
          <pre className="overflow-x-auto rounded-lg bg-white p-5 text-sm text-nova-heading mb-6 border border-black/5 font-mono leading-6">
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        );
      }

      return (
        <code
          className="rounded bg-white px-2 py-1 font-mono text-sm text-cyan-300 border border-cyan-900/30 whitespace-nowrap"
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
          className="overflow-x-auto rounded-lg bg-white p-5 text-sm text-nova-heading mb-6 border border-black/5 font-mono leading-6"
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
      <thead className="bg-gray-50/60" {...props} />
    ),
    th: ({ node, ...props }: any) => (
      <th className="border border-black/10 bg-gray-50 px-5 py-3 text-left font-semibold text-nova-heading text-base" {...props} />
    ),
    td: ({ node, ...props }: any) => (
      <td className="border border-black/10 px-5 py-3 text-nova-body text-base" {...props} />
    ),
    blockquote: ({ node, ...props }: any) => (
      <blockquote
        className="relative border-l-4 border-nova-primary bg-nova-primary/5 px-6 py-5 my-8 rounded-r-xl text-nova-heading font-medium leading-relaxed shadow-sm before:content-['💡'] before:absolute before:-left-4 before:-top-4 before:bg-white before:rounded-full before:p-1.5 before:shadow-sm before:text-lg"
        {...props}
      />
    ),
    a: ({ node, ...props }: any) => (
      <a className="text-blue-400 hover:text-blue-300 underline font-medium transition-colors" {...props} />
    ),
    hr: ({ node, ...props }: any) => (
      <hr className="my-8 border-black/5" {...props} />
    ),
  };

  return (
    <div className="mx-auto max-w-6xl px-3 py-8 sm:px-4">
      <div className="space-y-8 rounded-[28px] border border-black/5 bg-white p-5 shadow-soft sm:p-8">
        <header className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-nova-primary">
              AI learning flow
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-nova-heading sm:text-4xl">
              {chapter?.chapterName}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-nova-body sm:text-lg">
              {chapter?.description}
            </p>
            {chapter?.duration && (
              <div className="mt-4 inline-flex rounded-full border border-black/5 bg-nova-bg px-4 py-2 text-sm text-nova-body shadow-sm">
                ⏱️ Duration: {formatDuration(chapter.duration)}
              </div>
            )}
          </div>
        </header>

        {content?.videoId && (
          <section className="relative overflow-hidden rounded-3xl border border-black/5 bg-white shadow-soft group">
            <div className="aspect-video w-full relative">
              <YouTube
                videoId={content.videoId}
                opts={{
                  width: "100%",
                  height: "100%",
                  playerVars: { autoplay: 0 }
                }}
                className="absolute inset-0 w-full h-full"
                onReady={onPlayerReady}
                onError={onPlayerError}
              />
            </div>

            {/* Elegant Tooltip overlay */}
            <div className="absolute top-4 right-4 max-w-xs opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-10">
              <div className="rounded-xl bg-white/90 backdrop-blur-md p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-black/5">
                <p className="text-xs font-bold uppercase tracking-wider text-nova-primary mb-1">
                  Why this video matters
                </p>
                <p className="text-xs leading-relaxed text-nova-heading">
                  Use this as a fast mental reset before you move into the
                  interactive blocks below. It reinforces the core concepts from a different angle.
                </p>
              </div>
            </div>
          </section>
        )}

        <div className="space-y-6">
          {visibleLessons.length === 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
              <p className="text-nova-body font-medium">
                No content available for this subtopic yet. Please generate the
                course content first.
              </p>
            </div>
          ) : (
            visibleLessons.map(({ lesson, lessonIndex }) => {
              const rawContent = getLessonRawContent(lesson);
              const markdownContent = rawContent ? normalizeMarkdownContent(rawContent) : "";

              if (!markdownContent) return null;

              return (
                <div
                  key={`${lesson.title}-${lessonIndex}`}
                  id={`subtopic-${chapterId ?? 0}-${lessonIndex}`}
                  className="prose prose-invert max-w-none space-y-6 scroll-mt-24"
                >
                  {markdownContent ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdxComponents as any}>
                      {markdownContent}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-nova-body text-sm">Loading lesson content...</p>
                  )}

                  <div className="not-prose mt-8 overflow-hidden rounded-[28px] border border-black/5 bg-nova-bg/80 shadow-[0_18px_55px_rgba(0,0,0,0.28)]">
                    <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 sm:px-5">
                      <div>
                        <p className="text-sm font-semibold text-nova-heading">
                          Pin a thought to this lesson
                        </p>
                        <p className="text-xs text-nova-body">
                          Bookmark a place, tag an idea, or drop a sticky note.
                        </p>
                      </div>
                      <div className="hidden items-center gap-2 rounded-full border border-black/5 bg-white/5 px-3 py-1.5 text-xs font-medium text-nova-body sm:flex">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        {annotations.filter((annotation) => annotation.lessonIndex === lessonIndex).length} saved
                      </div>
                    </div>

                    <div className="grid gap-3 border-b border-black/5 p-4 md:grid-cols-3 sm:p-5">
                      {(["bookmark", "tag", "sticky-note"] as AnnotationType[]).map((type) => {
                        const isActive = draftType === type;

                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => beginAnnotation(lessonIndex, type)}
                            className={`group relative overflow-hidden rounded-[22px] border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${isActive
                                ? "border-primary/50 bg-white/10 shadow-[0_14px_34px_rgba(59,130,246,0.15)]"
                                : "border-black/5 bg-white/[0.03] hover:border-black/10 hover:bg-white/[0.06]"
                              }`}
                          >
                            <div className={`absolute inset-x-0 top-0 h-1 ${annotationStyles[type].accent}`} />
                            <div className="flex items-start gap-3">
                              <div className={`relative mt-0.5 flex h-12 w-12 flex-none items-center justify-center rounded-[18px] border ${annotationStyles[type].chip}`}>
                                {type === "bookmark" && (
                                  <div className="flex h-7 w-4 items-center justify-center rounded-[2px] rounded-b-[8px] bg-current/85">
                                    <div className="mt-auto h-2 w-2 rounded-full bg-nova-bg/70" />
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
                                <p className="mt-2 text-sm font-semibold text-nova-heading">
                                  {annotationStyles[type].label} this spot
                                </p>
                                <p className="mt-1 text-xs leading-5 text-nova-body">
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
                          className={`relative overflow-hidden rounded-[26px] border shadow-[0_16px_40px_rgba(0,0,0,0.18)] ${annotationStyles[draftType].surface} ${draftType === "sticky-note"
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
                              <p className={`text-xs ${draftType === "sticky-note" ? "text-gray-500" : "text-nova-body"}`}>
                                {draftType === "bookmark"
                                  ? "Quick mark for later"
                                  : draftType === "tag"
                                    ? "Label a theme or idea"
                                    : "Leave yourself a note"}
                              </p>
                            </div>

                            <div className={`mt-4 rounded-[20px] border px-4 py-4 ${draftType === "sticky-note" ? "border-slate-900/10 bg-white/30" : "border-black/5 bg-white/5"}`}>
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
                                className={`w-full border-0 bg-transparent text-base font-semibold outline-none placeholder:font-medium text-nova-heading ${draftType === "sticky-note" ? "placeholder:text-gray-500" : "placeholder:text-gray-500"}`}
                              />

                              <div className={`my-3 h-px w-full ${draftType === "sticky-note" ? "bg-white/10" : "bg-white/10"}`} />

                              <textarea
                                rows={4}
                                value={draftBody}
                                onChange={(event) => setDraftBody(event.target.value)}
                                placeholder={
                                  draftType === "sticky-note"
                                    ? "Write the reminder, insight, or question here..."
                                    : "Add a short detail if you want"
                                }
                                className={`w-full resize-none border-0 bg-transparent text-sm leading-6 outline-none text-nova-heading ${draftType === "sticky-note" ? "placeholder:text-gray-500" : "placeholder:text-gray-500"}`}
                              />
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                              <p className={`text-xs ${draftType === "sticky-note" ? "text-gray-500" : "text-nova-body"}`}>
                                This note will stay attached to this lesson only.
                              </p>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setActiveLessonIndex(null)}
                                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${draftType === "sticky-note" ? "bg-black/10 text-slate-900 hover:bg-black/15" : "border border-black/5 bg-white/5 text-nova-body hover:bg-white/10"}`}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => saveAnnotation(lessonIndex)}
                                  disabled={savingAnnotation}
                                  className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${draftType === "sticky-note" ? "bg-nova-bg text-[#f4df8a] hover:bg-black" : "bg-primary text-white hover:bg-primary/90"}`}
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
                      <div className="grid gap-3 border-t border-black/5 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
                        {annotations
                          .filter((annotation) => annotation.lessonIndex === lessonIndex)
                          .map((annotation) => (
                            <div
                              key={annotation.id}
                              className={`relative overflow-hidden rounded-[22px] border p-4 shadow-[0_12px_30px_rgba(0,0,0,0.16)] ${annotationStyles[annotation.type].container} ${annotation.type === "sticky-note"
                                  ? "bg-[#f4df8a] text-white"
                                  : "bg-nova-bg/70 text-nova-heading"
                                }`}
                            >
                              <div className={`absolute right-3 top-3 h-8 w-8 rounded-bl-[18px] ${annotation.type === "sticky-note" ? "bg-white/45" : "bg-white/10"}`} />
                              <div className="flex items-center gap-2">
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${annotationStyles[annotation.type].chip}`}>
                                  {annotationStyles[annotation.type].label}
                                </span>
                                <span className={`text-[11px] ${annotation.type === "sticky-note" ? "text-gray-500" : "text-nova-body"}`}>
                                  {new Date(annotation.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="mt-3 text-sm font-bold leading-6">
                                {annotation.title}
                              </p>
                              {annotation.body && (
                                <p className={`mt-2 text-sm leading-6 ${annotation.type === "sticky-note" ? "text-nova-heading" : "text-nova-body"}`}>
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
