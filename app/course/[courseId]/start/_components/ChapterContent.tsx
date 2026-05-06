"use client";

import { ChapterContentType, ChapterType } from "@/types/types";
import React from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeSandbox from "./CodeSandbox";
import ChapterSources from "./ChapterSources";
import { formatDuration } from "@/utils/formatDuration";
import SandpackRenderer from "./SandpackRenderer";

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

const isProgrammingCategory = (category?: string): boolean => {
  if (!category) return false;
  const programmingKeywords = [
    "programming",
    "coding",
    "python",
    "javascript",
    "web development",
    "software",
    "app development",
    "game dev",
    "data science",
  ];
  return programmingKeywords.some((keyword) =>
    category.toLowerCase().includes(keyword)
  );
};

const extractCodeFromExplanation = (explanation: string, language: "python" | "javascript"): string | null => {
  const codeBlockRegex = language === "python" 
    ? /```python\n([\s\S]*?)\n```/
    : /```(?:javascript|js)\n([\s\S]*?)\n```/;
  const match = explanation.match(codeBlockRegex);
  return match ? match[1] : null;
};

const ChapterContent = ({ chapter, content, courseCategory, courseId, courseName, chapterId, subtopicIndex = 0 }: ChapterContentProps) => {
  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    event.target.pauseVideo();
  };

  const onPlayerError = (event: any) => {
    console.error("YouTube Player Error:", event.data);
  };

  /**
   * FIX: Normalize AI content
   * AI sometimes returns object instead of array
   * Content field might be a string or object
   */
  let parsedContent: any[] = [];

  // Guard against null/undefined content
  if (content && content.content) {
    let contentData = content.content;

    if (typeof contentData === "string") {
      try {
        contentData = JSON.parse(contentData);
      } catch (e) {
        console.error("Failed to parse content string:", e);
      }
    }

    // Convert to array if needed
    if (Array.isArray(contentData)) {
      parsedContent = contentData;
    } else if (typeof contentData === "object" && contentData !== null) {
      parsedContent = [contentData];
    }
  }

  // Filter content to only show the selected subtopic
  const contentToRender = parsedContent.length > subtopicIndex 
    ? [parsedContent[subtopicIndex]] 
    : parsedContent;

  const isProgramming = isProgrammingCategory(courseCategory);

  return (
    <div className="mx-auto max-w-4xl px-3 py-8 sm:px-4">
      {/* Chapter Header */}
      <div className="mb-8 rounded-2xl border border-white/10 bg-slate-900/70 p-6">
        <h1 className="mb-3 text-3xl font-bold text-slate-100 sm:text-4xl">{chapter?.chapterName}</h1>
        <p className="text-base leading-relaxed text-slate-300 sm:text-lg">{chapter?.description}</p>
        {chapter?.duration && (
          <p className="mt-2 text-sm text-primary">
            ⏱️ Duration: {formatDuration(chapter.duration)}
          </p>
        )}
      </div>

      {/* YouTube Video */}
      {content?.videoId ? (
        <div className="my-8 flex justify-center">
          <div className="w-full max-w-2xl">
            <YouTube
              videoId={content.videoId}
              opts={videoOpts}
              onReady={onPlayerReady}
              onError={onPlayerError}
            />
          </div>
        </div>
      ) : (
        <div className="my-8 flex justify-center rounded-lg border border-white/10 bg-slate-900/70 p-8">
          <p className="text-slate-400">No video available for this chapter</p>
        </div>
      )}

      {/* Chapter Content */}
      <div>
        {contentToRender.length === 0 ? (
          <div className="rounded-lg border border-amber-300/20 bg-amber-500/10 p-8 text-center">
            <p className="text-slate-300">
              No content available for this subtopic yet. Please generate the
              course content first.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {contentToRender.map((item: any, index: number) => (
              <div 
                key={index} 
                className="rounded-xl border border-white/10 bg-slate-900/70 p-5 shadow-[0_8px_24px_rgba(2,6,23,0.35)]"
              >
                <h2 className="mb-4 flex items-center text-2xl font-bold text-primary">
                  <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-slate-950">
                    {subtopicIndex + 1}
                  </span>
                  {item.title}
                </h2>

                {/* Learning Overview */}
                {item.learning_overview && (
                  <div className="mb-6 rounded-lg bg-slate-800/50 p-4 border-l-4 border-emerald-500">
                    <p className="text-slate-300 italic">{item.learning_overview}</p>
                  </div>
                )}

                {/* Markdown Content with Enhanced Styling */}
                <div className="prose prose-sm max-w-none leading-relaxed prose-headings:text-slate-100 prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-primary prose-code:text-amber-200">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h2: ({node, ...props}) => <h3 className="mb-3 mt-4 text-xl font-bold text-slate-100" {...props} />,
                      h3: ({node, ...props}) => <h4 className="mb-2 mt-3 text-lg font-semibold text-slate-100" {...props} />,
                      p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-2" {...props} />,
                      li: ({node, ...props}) => <li className="ml-4 mb-1" {...props} />,
                      blockquote: ({node, ...props}) => (
                        <blockquote className="my-6 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 to-transparent p-5 text-slate-200 shadow-sm" {...props} />
                      ),
                      table: ({node, ...props}) => (
                        <div className="my-6 w-full overflow-x-auto rounded-xl border border-white/10 bg-slate-900/50">
                          <table className="w-full text-left text-sm" {...props} />
                        </div>
                      ),
                      thead: ({node, ...props}) => <thead className="border-b border-white/10 bg-slate-800/50 text-slate-200" {...props} />,
                      th: ({node, ...props}) => <th className="p-4 font-semibold" {...props} />,
                      td: ({node, ...props}) => <td className="border-b border-white/5 p-4 text-slate-300" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-slate-100" {...props} />,
                      em: ({node, ...props}) => <em className="italic text-slate-300" {...props} />,
                      code: ({node, inline, ...props}: any) => 
                        inline ? (
                          <code className="rounded bg-slate-800 px-2 py-1 text-sm font-mono text-amber-200" {...props} />
                        ) : (
                          <code className="block overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-100" {...props} />
                        ),
                    }}
                  >
                    {item.deep_explanation || item.explanation}
                  </ReactMarkdown>
                </div>

                {/* Interactive Code Sandbox */}
                {item.code_sandbox && item.code_sandbox.initial_code && (
                  <SandpackRenderer 
                    language={item.code_sandbox.language || "javascript"} 
                    initialCode={item.code_sandbox.initial_code} 
                  />
                )}

                {/* Old Code Examples Fallback (if any) */}
                {item.code_examples && item.code_examples.length > 0 && !item.code_sandbox && (
                  <div className="mt-5">
                    <h3 className="mb-3 text-lg font-semibold text-slate-100">Code Example:</h3>
                    {item.code_examples.map((example: any, idx: number) => {
                      let codeString = typeof example === "string" 
                        ? example.replace(/<\/?precode>/g, "")
                        : Array.isArray(example?.code)
                        ? example.code.join("\n").replace(/<\/?precode>/g, "")
                        : (example?.code as string)?.replace(/<\/?precode>/g, "");
                      if (!codeString || codeString.trim().length === 0) return null;
                      return (
                        <div key={idx} className="mb-4 overflow-hidden rounded-lg bg-slate-950 shadow-md">
                          <pre className="overflow-x-auto p-4 text-sm text-slate-300">
                            <code>{codeString}</code>
                          </pre>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Mini Challenge */}
                {item.mini_challenge && (
                  <div className="mt-8 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-5">
                    <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-indigo-400">
                      🎯 Mini Challenge
                    </h3>
                    <p className="text-slate-300 mb-3">{item.mini_challenge.challenge}</p>
                    {item.mini_challenge.hint && (
                      <details className="cursor-pointer group">
                        <summary className="text-sm font-medium text-indigo-300 hover:text-indigo-200 outline-none">
                          Show Hint
                        </summary>
                        <p className="mt-2 text-sm text-slate-400 italic bg-slate-900/50 p-3 rounded border border-white/5">
                          {item.mini_challenge.hint}
                        </p>
                      </details>
                    )}
                  </div>
                )}

                {/* Interview Relevance */}
                {item.interview_relevance && (
                  <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-5">
                    <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-rose-400">
                      💼 Interview Relevance
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{item.interview_relevance}</p>
                  </div>
                )}

                {/* Summary / Cheat Sheet */}
                {item.summary_cheat_sheet && (
                  <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-5">
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-primary">
                      📝 Key Takeaways
                    </h3>
                    <div className="prose prose-sm max-w-none text-slate-300 prose-li:marker:text-primary">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {item.summary_cheat_sheet}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Try It Yourself Section for Programming Courses */}
                {isProgramming && !item.code_examples && (
                  <div className="mt-5 rounded-lg border border-primary/20 bg-primary/10 p-4">
                    <p className="text-sm text-primary">
                      💡 <strong>Tip:</strong> Code examples in this section can be executed directly in the browser using the embedded code sandbox!
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Chapter Sources Section */}
        {(() => {
          const chapterNum = chapterId !== undefined ? chapterId : 0;
          return (
            <ChapterSources 
              sources={content?.sources} 
              chapterName={chapter?.chapterName}
              courseId={courseId}
              chapterId={chapterNum}
              courseName={courseName}
            />
          );
        })()}
      </div>
    </div>
  );
};

export default ChapterContent;