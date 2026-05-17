"use client";

import { ChapterContentType, ChapterType } from "@/types/types";
import React, { useEffect, useMemo, useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { formatDuration } from "@/utils/formatDuration";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MermaidBlock from "@/components/MermaidBlock";
import { saveChapterAnnotationAction } from "@/app/actions/saveChapterAnnotation";
import { deleteChapterAnnotationAction } from "@/app/actions/deleteChapterAnnotation";

type AnnotationType = "bookmark" | "sticky-note";

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

/* ─── Floating Action FAB ─── */
function FloatingActions({
  lessonIndex,
  onBookmark,
  onStickyNote,
  bookmarkCount,
}: {
  lessonIndex: number;
  onBookmark: () => void;
  onStickyNote: () => void;
  bookmarkCount: number;
}) {
  return (
    <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2.5">
      {/* Bookmark */}
      <button
        onClick={onBookmark}
        title="Bookmark this lesson"
        className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-black/10 dark:border-white/10 dark:border-white/10 bg-nova-card shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        {bookmarkCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
            {bookmarkCount}
          </span>
        )}
        <span className="pointer-events-none absolute right-14 whitespace-nowrap rounded-lg bg-nova-heading px-2.5 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 shadow-md">
          Bookmark
        </span>
      </button>

      {/* Sticky Note */}
      <button
        onClick={onStickyNote}
        title="Add a sticky note"
        className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-black/10 dark:border-white/10 dark:border-white/10 bg-nova-card shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-nova-primary hover:shadow-lg"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-nova-primary">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span className="pointer-events-none absolute right-14 whitespace-nowrap rounded-lg bg-nova-heading px-2.5 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 shadow-md">
          Add note
        </span>
      </button>
    </div>
  );
}

/* ─── Sticky Note Modal ─── */
function StickyNoteModal({
  open,
  draftTitle,
  draftBody,
  saving,
  onTitleChange,
  onBodyChange,
  onSave,
  onClose,
}: {
  open: boolean;
  draftTitle: string;
  draftBody: string;
  saving: boolean;
  onTitleChange: (v: string) => void;
  onBodyChange: (v: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-2xl border border-amber-200 bg-[#fffbeb] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Folded corner */}
        <div className="absolute right-0 top-0 h-8 w-8 rounded-bl-xl bg-amber-200/60" />

        <div className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <p className="text-sm font-bold uppercase tracking-widest text-amber-700">Sticky note</p>
          </div>

          <input
            autoFocus
            value={draftTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Note title..."
            className="w-full border-0 bg-transparent text-base font-semibold text-amber-900 outline-none placeholder:text-amber-400"
          />
          <div className="my-3 h-px w-full bg-amber-200" />
          <textarea
            rows={4}
            value={draftBody}
            onChange={(e) => onBodyChange(e.target.value)}
            placeholder="Write your reminder, insight, or question here..."
            className="w-full resize-none border-0 bg-transparent text-sm leading-6 text-amber-800 outline-none placeholder:text-amber-400"
          />

          <div className="mt-5 flex items-center justify-between">
            <p className="text-xs text-amber-600">Pinned to this lesson only</p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-200"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-400"
              >
                {saving ? "Saving..." : "Pin it"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Bookmark Quick-save toast ─── */
function BookmarkToast({ show }: { show: boolean }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-amber-200 bg-nova-card px-4 py-2.5 shadow-lg transition-all duration-300 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-amber-500">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      <span className="text-xs font-semibold text-nova-heading">Lesson bookmarked</span>
    </div>
  );
}

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
  const [activeModal, setActiveModal] = useState<"bookmark" | "sticky-note" | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [savingAnnotation, setSavingAnnotation] = useState(false);
  const [bookmarkToast, setBookmarkToast] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    setActiveModal(null);
    setDraftTitle("");
    setDraftBody("");
  }, [content?.annotations, subtopicIndex]);

  const saveAnnotation = async (lessonIndex: number, type: AnnotationType) => {
    const title = draftTitle.trim();
    const body = draftBody.trim();

    if (!title && !body) return;

    if (!courseId || chapterId === undefined) {
      console.error("Missing course or chapter identifier for annotation save");
      return;
    }

    const nextAnnotation: LessonAnnotation = {
      id: `${lessonIndex}-${Date.now()}`,
      type,
      title: title || (type === "bookmark" ? "Saved bookmark" : "Sticky note"),
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
      setActiveModal(null);
      setDraftTitle("");
      setDraftBody("");
    } catch (error) {
      console.error("Failed to save annotation:", error);
      alert("Unable to save this note right now. Please try again.");
    } finally {
      setSavingAnnotation(false);
    }
  };

  const handleQuickBookmark = async (lessonIndex: number) => {
    if (!courseId || chapterId === undefined) return;
    const nextAnnotation: LessonAnnotation = {
      id: `${lessonIndex}-${Date.now()}`,
      type: "bookmark",
      title: "Saved bookmark",
      body: "",
      createdAt: new Date().toISOString(),
      lessonIndex,
    };
    try {
      const result = await saveChapterAnnotationAction({
        courseId,
        chapterId,
        annotation: nextAnnotation,
      });
      if (result.success) {
        setAnnotations((result.annotations as LessonAnnotation[]) || []);
        setBookmarkToast(true);
        setTimeout(() => setBookmarkToast(false), 2500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAnnotation = async (annotationId: string) => {
    if (!courseId || chapterId === undefined) return;
    setDeletingId(annotationId);
    try {
      const result = await deleteChapterAnnotationAction({ courseId, chapterId, annotationId });
      if (result.success) {
        setAnnotations((result.annotations as LessonAnnotation[]) || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const mdxComponents = {
    h1: ({ node, ...props }: any) => (
      <h1 className="text-3xl font-bold tracking-tight text-nova-heading mt-0 mb-6 leading-tight" {...props} />
    ),
    h2: ({ node, ...props }: any) => (
      <h2 className="text-xl font-bold tracking-tight text-nova-heading mt-10 mb-4 pb-3 border-b border-black/5 dark:border-white/10 dark:border-white/5 flex items-center gap-3 before:content-[''] before:block before:w-1 before:h-5 before:bg-nova-primary before:rounded-full" {...props} />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className="text-lg font-semibold tracking-tight text-nova-primary mt-8 mb-3" {...props} />
    ),
    h4: ({ node, ...props }: any) => (
      <h4 className="text-base font-semibold text-nova-heading mt-6 mb-2" {...props} />
    ),
    h5: ({ node, ...props }: any) => (
      <h5 className="text-sm font-semibold text-nova-heading mt-5 mb-2 uppercase tracking-wider" {...props} />
    ),
    h6: ({ node, ...props }: any) => (
      <h6 className="text-xs font-semibold text-nova-body mt-4 mb-2 uppercase tracking-wider" {...props} />
    ),
    p: ({ node, ...props }: any) => (
      <p className="text-nova-body leading-[1.85] mb-5 text-base font-normal" {...props} />
    ),
    strong: ({ node, ...props }: any) => (
      <strong className="font-semibold text-nova-heading bg-nova-primary/8 px-1 py-0.5 rounded" {...props} />
    ),
    em: ({ node, ...props }: any) => (
      <em className="italic text-nova-heading font-medium" {...props} />
    ),
    ul: ({ node, ...props }: any) => (
      <ul className="list-none space-y-2.5 mb-6 ml-2" {...props} />
    ),
    ol: ({ node, ...props }: any) => (
      <ol className="list-decimal list-outside space-y-2.5 text-nova-body mb-6 ml-6" {...props} />
    ),
    li: ({ node, ...props }: any) => (
      <li className="relative pl-5 before:content-[''] before:absolute before:left-0 before:top-2.5 before:w-1.5 before:h-1.5 before:bg-nova-primary/40 before:rounded-full text-nova-body leading-[1.8] text-base" {...props} />
    ),
    code: ({ inline, className, children, ...props }: any) => {
      const code = String(children ?? "").replace(/\n$/, "");
      const isMermaid = className?.includes("language-mermaid") || className?.includes("mermaid");

      if (!inline && isMermaid) {
        return <MermaidBlock code={code} />;
      }

      if (!inline) {
        return (
          <pre className="overflow-x-auto rounded-xl bg-[#f8f7f4] border border-black/8 p-5 text-sm text-slate-800 mb-5 font-mono leading-6 shadow-sm dark:shadow-none">
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        );
      }

      return (
        <code
          className="rounded-md bg-nova-primary/8 px-1.5 py-0.5 font-mono text-sm text-nova-primary border border-nova-primary/15 whitespace-nowrap"
          {...props}
        >
          {children}
        </code>
      );
    },
    pre: ({ node, children, ...props }: any) => {
      const child = children as any;
      if (child?.type === MermaidBlock) return child;
      const isMermaid =
        child?.props?.className?.includes("language-mermaid") ||
        child?.props?.className?.includes("mermaid");
      if (isMermaid) {
        const code = String(child?.props?.children ?? "").trim();
        return <MermaidBlock code={code} />;
      }
      return (
        <pre
          className="overflow-x-auto rounded-xl bg-[#f8f7f4] border border-black/8 p-5 text-sm text-slate-800 mb-5 font-mono leading-6 shadow-sm dark:shadow-none"
          {...props}
        >
          {children}
        </pre>
      );
    },
    table: ({ node, ...props }: any) => (
      <div className="overflow-x-auto my-6 rounded-xl border border-black/8 shadow-sm dark:shadow-none">
        <table className="w-full border-collapse" {...props} />
      </div>
    ),
    thead: ({ node, ...props }: any) => (
      <thead className="bg-gray-50 dark:bg-nova-card/5" {...props} />
    ),
    th: ({ node, ...props }: any) => (
      <th className="border-b border-black/8 px-5 py-3 text-left font-semibold text-nova-heading text-sm" {...props} />
    ),
    td: ({ node, ...props }: any) => (
      <td className="border-b border-black/5 dark:border-white/10 dark:border-white/5 px-5 py-3 text-nova-body text-sm last:border-0" {...props} />
    ),
    blockquote: ({ node, ...props }: any) => (
      <blockquote
        className="relative border-l-4 border-nova-primary bg-nova-primary/5 px-5 py-4 my-6 rounded-r-xl text-nova-heading font-medium leading-relaxed"
        {...props}
      />
    ),
    a: ({ node, ...props }: any) => (
      <a className="text-nova-primary hover:text-nova-primary/80 underline font-medium transition-colors" {...props} />
    ),
    hr: ({ node, ...props }: any) => (
      <hr className="my-8 border-black/8" {...props} />
    ),
  };

  return (
    <div className="mx-auto max-w-6xl px-3 py-8 sm:px-4">
      <div className="space-y-8 rounded-[28px] border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-card p-5 shadow-soft sm:p-8">
        <header className="flex flex-col gap-4">
          <div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-nova-heading sm:text-4xl">
              {chapter?.chapterName}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-nova-body sm:text-lg">
              {chapter?.description}
            </p>
            {chapter?.duration && (
              <div className="mt-4 inline-flex rounded-full border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-bg px-4 py-2 text-sm text-nova-body shadow-sm dark:shadow-none">
                ⏱️ {formatDuration(chapter.duration)}
              </div>
            )}
          </div>
        </header>

        {content?.videoId && (
          <section className="relative overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-card shadow-soft group">
            <div className="aspect-video w-full relative">
              <YouTube
                videoId={content.videoId}
                opts={{ width: "100%", height: "100%", playerVars: { autoplay: 0 } }}
                className="absolute inset-0 w-full h-full"
                onReady={onPlayerReady}
                onError={onPlayerError}
              />
            </div>
            {/* Why this video matters — tooltip only */}
            <div className="absolute top-3 right-3 z-10">
              <div className="group/tip relative">
                <button className="flex h-7 w-7 items-center justify-center rounded-full bg-nova-card/80 border border-black/10 dark:border-white/10 dark:border-white/10 shadow-sm dark:shadow-none text-nova-body hover:bg-nova-card transition-all">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </button>
                <div className="pointer-events-none absolute right-0 top-9 w-64 rounded-xl bg-nova-card/95 backdrop-blur-md p-3.5 shadow-xl border border-black/5 dark:border-white/10 dark:border-white/5 opacity-0 group-hover/tip:opacity-100 transition-all duration-200 translate-y-1 group-hover/tip:translate-y-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-nova-primary mb-1">Why this video matters</p>
                  <p className="text-xs leading-relaxed text-nova-heading">
                    Use this as a mental reset before the content below. It reinforces core concepts from a different angle.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="space-y-6">
          {visibleLessons.length === 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm dark:shadow-none">
              <p className="text-nova-body font-medium">
                No content available for this subtopic yet. Please generate the course content first.
              </p>
            </div>
          ) : (
            visibleLessons.map(({ lesson, lessonIndex }) => {
              const rawContent = getLessonRawContent(lesson);
              const markdownContent = rawContent ? normalizeMarkdownContent(rawContent) : "";
              if (!markdownContent) return null;

              const lessonBookmarks = annotations.filter(
                (a) => a.lessonIndex === lessonIndex && a.type === "bookmark"
              ).length;

              return (
                <div
                  key={`${lesson.title}-${lessonIndex}`}
                  id={`subtopic-${chapterId ?? 0}-${lessonIndex}`}
                  className="scroll-mt-24"
                >
                  {/* Floating FAB — visible when this lesson is in view */}
                  <FloatingActions
                    lessonIndex={lessonIndex}
                    bookmarkCount={lessonBookmarks}
                    onBookmark={() => handleQuickBookmark(lessonIndex)}
                    onStickyNote={() => {
                      setActiveLessonIndex(lessonIndex);
                      setActiveModal("sticky-note");
                      setDraftTitle("");
                      setDraftBody("");
                    }}
                  />

                  {/* Sticky Note Modal */}
                  <StickyNoteModal
                    open={activeLessonIndex === lessonIndex && activeModal === "sticky-note"}
                    draftTitle={draftTitle}
                    draftBody={draftBody}
                    saving={savingAnnotation}
                    onTitleChange={setDraftTitle}
                    onBodyChange={setDraftBody}
                    onSave={() => saveAnnotation(lessonIndex, "sticky-note")}
                    onClose={() => { setActiveModal(null); setActiveLessonIndex(null); }}
                  />

                  {/* Bookmark Toast */}
                  <BookmarkToast show={bookmarkToast} />

                  {/* Content */}
                  <div className="prose max-w-none space-y-4">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdxComponents as any}>
                      {markdownContent}
                    </ReactMarkdown>
                  </div>

                  {/* Saved annotations display */}
                  {annotations.filter((a) => a.lessonIndex === lessonIndex).length > 0 && (
                    <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {annotations
                        .filter((a) => a.lessonIndex === lessonIndex)
                        .map((annotation) => (
                          <div
                            key={annotation.id}
                            className={`group relative overflow-hidden rounded-2xl border p-4 shadow-sm dark:shadow-none ${
                              annotation.type === "sticky-note"
                                ? "border-amber-200 bg-[#fffbeb]"
                                : "border-black/8 bg-nova-card"
                            }`}
                          >
                            {annotation.type === "sticky-note" && (
                              <div className="absolute right-8 top-0 h-6 w-6 rounded-bl-xl bg-amber-200/60" />
                            )}
                            {/* Delete button */}
                            <button
                              onClick={() => handleDeleteAnnotation(annotation.id)}
                              disabled={deletingId === annotation.id}
                              title="Delete"
                              className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-nova-card border border-black/8 text-gray-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:border-red-200 hover:text-red-500 shadow-sm dark:shadow-none"
                            >
                              {deletingId === annotation.id ? (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                              ) : (
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                  <path d="M10 11v6" /><path d="M14 11v6" />
                                  <path d="M9 6V4h6v2" />
                                </svg>
                              )}
                            </button>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                                annotation.type === "sticky-note"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-gray-100 dark:bg-nova-card/10 text-gray-600"
                              }`}>
                                {annotation.type === "sticky-note" ? "Note" : "Bookmark"}
                              </span>
                              <span className="text-[11px] text-nova-body">
                                {new Date(annotation.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-nova-heading leading-snug">{annotation.title}</p>
                            {annotation.body && (
                              <p className="mt-1.5 text-sm text-nova-body leading-relaxed">{annotation.body}</p>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
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
