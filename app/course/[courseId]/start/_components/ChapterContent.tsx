"use client";

import { ChapterContentType, ChapterType } from "@/types/types";
import React from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeSandbox from "./CodeSandbox";
import ChapterSources from "./ChapterSources";
import { formatDuration } from "@/utils/formatDuration";

type ChapterContentProps = {
  chapter: ChapterType | null;
  content: ChapterContentType | null;
  courseCategory?: string;
  courseId?: string;
  courseName?: string;
  chapterId?: number;
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

const ChapterContent = ({ chapter, content, courseCategory, courseId, courseName, chapterId }: ChapterContentProps) => {
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

  const isProgramming = isProgrammingCategory(courseCategory);

  return (
    <div className="mx-auto max-w-4xl px-3 py-8 sm:px-4">
      {/* Chapter Header */}
      <div className="mb-8 rounded-2xl border border-white/10 bg-slate-900/70 p-6">
        <h1 className="mb-3 text-3xl font-bold text-slate-100 sm:text-4xl">{chapter?.chapterName}</h1>
        <p className="text-base leading-relaxed text-slate-300 sm:text-lg">{chapter?.description}</p>
        {chapter?.duration && (
          <p className="mt-2 text-sm text-sky-300">
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
        {parsedContent.length === 0 ? (
          <div className="rounded-lg border border-amber-300/20 bg-amber-500/10 p-8 text-center">
            <p className="text-slate-300">
              No content available for this chapter yet. Please generate the
              course content first.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {parsedContent.map((item: any, index: number) => (
              <div 
                key={index} 
                className="rounded-xl border border-white/10 bg-slate-900/70 p-5 shadow-[0_8px_24px_rgba(2,6,23,0.35)]"
              >
                <h2 className="mb-4 flex items-center text-2xl font-bold text-cyan-200">
                  <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-slate-950">
                    {index + 1}
                  </span>
                  {item.title}
                </h2>

                {/* Markdown Content with Enhanced Styling */}
                <div className="prose prose-sm max-w-none leading-relaxed prose-headings:text-slate-100 prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-cyan-200 prose-code:text-amber-200">
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
                        <blockquote className="my-4 rounded border-l-4 border-primary bg-primary/10 p-4 text-slate-200" {...props} />
                      ),
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
                    {item.explanation}
                  </ReactMarkdown>
                </div>

                {/* Code Examples with Sandbox for Programming Courses */}
                {item.code_examples && item.code_examples.length > 0 && (
                  <div className="mt-5">
                    <h3 className="mb-3 text-lg font-semibold text-slate-100">Code Example:</h3>
                    {item.code_examples.map((example: any, idx: number) => {
                      // Handle both string and object formats
                      let codeString: string = "";
                      
                      if (typeof example === "string") {
                        // Example is directly a string
                        codeString = example.replace(/<\/?precode>/g, "");
                      } else if (example && example.code) {
                        // Example is an object with code property
                        codeString = Array.isArray(example.code)
                          ? example.code
                              .join("\n")
                              .replace(/<\/?precode>/g, "")
                          : (example.code as string)?.replace(/<\/?precode>/g, "");
                      }

                      // Skip if no code string
                      if (!codeString || codeString.trim().length === 0) {
                        return null;
                      }

                      // Detect language
                      let detectedLanguage: "python" | "javascript" | null = null;
                      
                      // Check for Python patterns (code or commands)
                      if (
                        codeString.includes("def ") ||
                        codeString.includes("print(") ||
                        codeString.includes("import ") ||
                        codeString.includes("python ") ||
                        codeString.includes("pip ") ||
                        codeString.includes("python3") ||
                        codeString.includes(".py")
                      ) {
                        detectedLanguage = "python";
                      } 
                      // Check for JavaScript patterns
                      else if (
                        codeString.includes("console.log") ||
                        codeString.includes("function ") ||
                        codeString.includes("const ") ||
                        codeString.includes("let ") ||
                        codeString.includes("var ") ||
                        codeString.includes("npm ") ||
                        codeString.includes(".js")
                      ) {
                        detectedLanguage = "javascript";
                      }

                      // Check if it's executable code (not shell commands like "pip install")
                      const isExecutable =
                        !codeString.trim().startsWith("pip ") &&
                        !codeString.trim().startsWith("npm ") &&
                        !codeString.trim().startsWith("python -m") &&
                        (codeString.includes("def ") ||
                          codeString.includes("print(") ||
                          codeString.includes("import ") ||
                          codeString.includes("console.log") ||
                          codeString.includes("function ") ||
                          codeString.includes("const "));

                      return (
                        <div key={idx}>
                          {isProgramming && detectedLanguage && isExecutable ? (
                            // Show code sandbox for programming courses with executable code
                            <CodeSandbox code={codeString} language={detectedLanguage} />
                          ) : (
                            // Show regular code block for non-programming courses or non-executable code
                            <div className="mb-4 overflow-x-auto rounded-lg border border-white/10 bg-slate-950 p-5 text-slate-100">
                              <pre className="font-mono text-sm leading-relaxed">
                                <code>{codeString}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Try It Yourself Section for Programming Courses */}
                {isProgramming && !item.code_examples && (
                  <div className="mt-5 rounded-lg border border-cyan-300/20 bg-cyan-500/10 p-4">
                    <p className="text-sm text-cyan-200">
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