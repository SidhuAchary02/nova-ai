"use client";

import { ChapterContentType, ChapterType } from "@/types/types";
import React, { useMemo } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { formatDuration } from "@/utils/formatDuration";
import ReactMarkdown from "react-markdown";

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
                  className="prose prose-invert max-w-none space-y-6"
                >
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => (
                        <h1 className="text-5xl font-bold text-slate-50 mt-0 mb-8 leading-tight" {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 className="text-3xl font-bold text-slate-100 mt-12 mb-6 pb-3 border-b border-primary/20" {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 className="text-2xl font-semibold text-slate-100 mt-9 mb-5" {...props} />
                      ),
                      h4: ({ node, ...props }) => (
                        <h4 className="text-xl font-semibold text-slate-200 mt-7 mb-4" {...props} />
                      ),
                      h5: ({ node, ...props }) => (
                        <h5 className="text-lg font-semibold text-slate-200 mt-6 mb-3" {...props} />
                      ),
                      h6: ({ node, ...props }) => (
                        <h6 className="text-base font-semibold text-slate-300 mt-5 mb-3" {...props} />
                      ),
                      p: ({ node, ...props }) => (
                        <p className="text-slate-300 leading-7 mb-5 text-base font-normal" {...props} />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong className="font-semibold text-slate-100" {...props} />
                      ),
                      em: ({ node, ...props }) => (
                        <em className="italic text-slate-200" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc list-outside space-y-3 text-slate-300 mb-6 ml-6" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal list-outside space-y-3 text-slate-300 mb-6 ml-6" {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="text-slate-300 leading-relaxed text-base" {...props} />
                      ),
                      code: (props) => (
                        <code
                          className="rounded bg-slate-900 px-2 py-1 font-mono text-sm text-cyan-300 border border-cyan-900/30 whitespace-nowrap"
                          {...props}
                        />
                      ),
                      pre: ({ node, ...props }) => (
                        <pre className="overflow-x-auto rounded-lg bg-slate-900 p-5 text-sm text-slate-200 mb-6 border border-white/10 font-mono leading-6" {...props} />
                      ),
                      table: ({ node, ...props }) => (
                        <table className="w-full border-collapse my-7" {...props} />
                      ),
                      thead: ({ node, ...props }) => (
                        <thead className="bg-slate-800/60" {...props} />
                      ),
                      th: ({ node, ...props }) => (
                        <th className="border border-white/15 bg-slate-800 px-5 py-3 text-left font-semibold text-slate-100 text-base" {...props} />
                      ),
                      td: ({ node, ...props }) => (
                        <td className="border border-white/15 px-5 py-3 text-slate-300 text-base" {...props} />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote
                          className="border-l-4 border-blue-500 bg-blue-500/10 px-6 py-4 my-7 rounded-r-lg text-slate-200 italic font-normal"
                          {...props}
                        />
                      ),
                      a: ({ node, ...props }) => (
                        <a className="text-blue-400 hover:text-blue-300 underline font-medium transition-colors" {...props} />
                      ),
                      hr: ({ node, ...props }) => (
                        <hr className="my-8 border-white/10" {...props} />
                      ),
                    }}
                  >
                    {markdownContent}
                  </ReactMarkdown>
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
