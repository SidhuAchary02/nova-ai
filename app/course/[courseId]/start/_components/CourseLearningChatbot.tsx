"use client";

import { generateCourseChatAction } from "@/app/actions/generateCourseChatAction";
import type { ChapterContentType, ChapterType, CourseType } from "@/types/types";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Props = {
  course: CourseType;
  chapter: ChapterType | null;
  chapterContent: ChapterContentType | null;
  selectedChapterIndex: number;
  selectedSubtopicIndex: number;
};

const quickQuestions = [
  "Explain this topic simply",
  "Summarize this section",
  "Give real-world example",
  "Explain selected text",
];

const collapseText = (value: unknown) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

const getContentArray = (content: ChapterContentType | null): unknown[] => {
  const contentData = content?.content ?? [];

  if (typeof contentData === "string") {
    try {
      const parsed = JSON.parse(contentData);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return Array.isArray(contentData) ? contentData : [];
};

const stringifyLesson = (lesson: unknown) => {
  if (typeof lesson === "string") return lesson;
  if (!lesson || typeof lesson !== "object") return "";

  const record = lesson as Record<string, unknown>;
  const pieces = [
    record.title,
    record.learning_overview,
    record.deep_explanation,
    record.explanation,
    record.content,
    record.interview_relevance,
    Array.isArray(record.summary_cheat_sheet)
      ? record.summary_cheat_sheet.join("\n")
      : record.summary_cheat_sheet,
  ];

  const miniChallenge = record.mini_challenge as
    | { challenge?: unknown; hint?: unknown }
    | undefined;
  if (miniChallenge) {
    pieces.push(miniChallenge.challenge, miniChallenge.hint);
  }

  const codeSandbox = record.code_sandbox as
    | { language?: unknown; initial_code?: unknown; solution?: unknown }
    | undefined;
  if (codeSandbox) {
    pieces.push(codeSandbox.language, codeSandbox.initial_code, codeSandbox.solution);
  }

  return pieces.map(collapseText).filter(Boolean).join("\n\n");
};

const getLessonTitle = (lesson: unknown, fallback?: string) => {
  if (lesson && typeof lesson === "object") {
    const title = (lesson as Record<string, unknown>).title;
    if (typeof title === "string" && title.trim()) return title.trim();
  }

  return fallback || "Current lesson";
};

export default function CourseLearningChatbot({
  course,
  chapter,
  chapterContent,
  selectedChapterIndex,
  selectedSubtopicIndex,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const latestAssistantRef = useRef<HTMLDivElement | null>(null);
  const latestUserRef = useRef<HTMLDivElement | null>(null);

  const lessons = useMemo(() => getContentArray(chapterContent), [chapterContent]);
  const lesson = lessons[selectedSubtopicIndex] ?? lessons[0];
  const subtopicTitle = getLessonTitle(
    lesson,
    chapter?.subtopics?.[selectedSubtopicIndex]
  );
  const pageContent = stringifyLesson(lesson);

  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage) return;

    if (latestMessage.role === "assistant") {
      latestAssistantRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    latestUserRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [messages]);

  useEffect(() => {
    setMessages([]);
    setDraft("");
    setSelectedText("");
    setSelectMode(false);
  }, [course.courseId, selectedChapterIndex, selectedSubtopicIndex]);

  useEffect(() => {
    if (!selectMode) return;

    const captureSelection = () => {
      const text = window.getSelection()?.toString().trim() || "";
      if (text) {
        setSelectedText(text.slice(0, 2000));
      }
    };

    document.addEventListener("mouseup", captureSelection);
    document.addEventListener("keyup", captureSelection);

    return () => {
      document.removeEventListener("mouseup", captureSelection);
      document.removeEventListener("keyup", captureSelection);
    };
  }, [selectMode]);

  const askNova = async (question: string) => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion || loading) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: cleanQuestion,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setDraft("");
    setLoading(true);

    const res = await generateCourseChatAction({
      question: cleanQuestion,
      messages,
      context: {
        courseName: course.courseName,
        courseCategory: course.category,
        chapterName: chapter?.chapterName,
        chapterDescription: chapter?.description,
        subtopicTitle,
        pageContent,
        selectedText,
      },
    });

    setLoading(false);
    setMessages([
      ...nextMessages,
      {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: res.success ? res.answer : res.error,
      },
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60]">
      {selectMode && (
        <style>
          {`body, body * { cursor: crosshair !important; }`}
        </style>
      )}
      {open && (
        <div className="mb-3 flex h-[560px] w-[min(390px,calc(100vw-40px))] flex-col overflow-hidden rounded-2xl border border-black/10 bg-nova-card shadow-2xl dark:border-white/10">
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-nova-primary text-white shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                </span>
                <div>
                  <h3 className="text-sm font-bold text-nova-heading">Nova</h3>
                  <p className="text-xs text-nova-body">Course assistant</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectMode((value) => !value)}
                title="Select text on the page"
                className={`flex h-8 w-8 items-center justify-center rounded-lg border text-nova-body transition-colors ${
                  selectMode
                    ? "border-nova-primary bg-nova-primary/10 text-nova-primary"
                    : "border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">edit_square</span>
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-nova-body hover:bg-black/5 dark:hover:bg-white/5"
                aria-label="Close Nova chat"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          <div className="border-b border-black/5 px-4 py-2 dark:border-white/10">
            <p className="truncate text-xs font-medium text-nova-heading">
              {chapter?.chapterName || "Current chapter"}
            </p>
            <p className="truncate text-xs text-nova-body">{subtopicTitle}</p>
            <p className="mt-1 text-[11px] text-nova-body">
              Chats are temporary and won&apos;t be saved.
            </p>
            {selectMode && (
              <div className="mt-2 rounded-lg border border-nova-primary/20 bg-nova-primary/5 px-3 py-2 text-xs text-nova-primary">
                Select text anywhere on the page to attach it as context.
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm leading-6 text-nova-body">
                  Ask about this lesson, the current chapter, or a section you select.
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => askNova(question)}
                      className="rounded-full border border-black/10 bg-nova-bg px-3 py-1.5 text-xs font-medium text-nova-heading transition-colors hover:border-nova-primary/30 hover:text-nova-primary dark:border-white/10"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {messages.map((message, index) => {
                const isLatestMessage = index === messages.length - 1;

                return (
                <div
                  key={message.id}
                  ref={(node) => {
                    if (message.role === "assistant" && isLatestMessage) {
                      latestAssistantRef.current = node;
                    }
                    if (message.role === "user" && isLatestMessage) {
                      latestUserRef.current = node;
                    }
                  }}
                  className={`rounded-2xl px-3.5 py-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "ml-8 bg-nova-primary text-white"
                      : "mr-8 border border-black/5 bg-nova-bg text-nova-body dark:border-white/10"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                        ul: ({ node, ...props }) => <ul className="mb-2 list-disc space-y-1 pl-4" {...props} />,
                        ol: ({ node, ...props }) => <ol className="mb-2 list-decimal space-y-1 pl-4" {...props} />,
                        code: ({ node, ...props }) => (
                          <code className="rounded bg-black/5 px-1 py-0.5 text-xs text-nova-heading" {...props} />
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    message.content
                  )}
                </div>
                );
              })}
              {loading && (
                <div className="mr-8 rounded-2xl border border-black/5 bg-nova-bg px-3.5 py-3 text-sm text-nova-body dark:border-white/10">
                  Nova is thinking...
                </div>
              )}
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              askNova(draft);
            }}
            className="border-t border-black/5 p-3 dark:border-white/10"
          >
            {selectedText && (
              <div className="mb-2 flex items-start gap-2 rounded-lg border border-black/5 bg-nova-bg px-3 py-2 text-xs text-nova-body dark:border-white/10">
                <span className="material-symbols-outlined mt-0.5 text-[14px] text-nova-primary">format_quote</span>
                <p className="line-clamp-2 flex-1">{selectedText}</p>
                <button
                  type="button"
                  onClick={() => setSelectedText("")}
                  className="text-nova-body hover:text-nova-heading"
                  aria-label="Clear selected text"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    askNova(draft);
                  }
                }}
                rows={2}
                placeholder="Ask Nova a doubt..."
                className="min-h-[44px] flex-1 resize-none rounded-xl border border-black/10 bg-nova-bg px-3 py-2 text-sm text-nova-heading outline-none focus:ring-2 focus:ring-nova-primary dark:border-white/10"
              />
              <button
                type="submit"
                disabled={loading || !draft.trim()}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-nova-primary text-white transition-colors hover:bg-nova-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <span className="material-symbols-outlined text-[19px]">send</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-nova-primary text-white shadow-[0_12px_30px_rgba(249,115,22,0.32)] transition-all hover:-translate-y-0.5 hover:bg-nova-primary/90"
        aria-label="Open Nova chat"
      >
        <span className="material-symbols-outlined text-[25px]">
          {open ? "close" : "smart_toy"}
        </span>
      </button>
    </div>
  );
}
