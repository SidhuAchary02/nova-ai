"use client";

import { ChapterContentType, ChapterType } from "@/types/types";
import React, { useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeSandbox from "./CodeSandbox";
import { formatDuration } from "@/utils/formatDuration";

type ChapterContentProps = {
  chapter: ChapterType | null;
  content: ChapterContentType | null;
  courseCategory?: string;
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

const ChapterContent = ({ chapter, content, courseCategory }: ChapterContentProps) => {
  const [expandedCode, setExpandedCode] = useState<Set<number>>(new Set());
  
  console.log("ChapterContent rendered with:", { chapter, content, courseCategory });
  console.log("content?.content:", content?.content);
  console.log("typeof content?.content:", typeof content?.content);

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
    console.log("Content exists, processing...");
    
    // Parse if it's a string
    let contentData = content.content;
    console.log("Before parsing - contentData:", contentData, "type:", typeof contentData);
    
    if (typeof contentData === "string") {
      try {
        contentData = JSON.parse(contentData);
        console.log("Parsed from string:", contentData);
      } catch (e) {
        console.error("Failed to parse content string:", e);
      }
    }

    // Convert to array if needed
    if (Array.isArray(contentData)) {
      parsedContent = contentData;
      console.log("✅ Using as array:", parsedContent.length, "items");
    } else if (typeof contentData === "object" && contentData !== null) {
      parsedContent = [contentData];
      console.log("✅ Wrapped in array:", parsedContent.length, "items");
    }
  } else {
    console.log("❌ No content available");
  }

  console.log("Final parsedContent length:", parsedContent.length, "items");
  
  const isProgramming = isProgrammingCategory(courseCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-white">
      {/* Chapter Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">{chapter?.chapterName}</h1>
        <p className="text-lg text-gray-600 leading-relaxed">{chapter?.description}</p>
        {chapter?.duration && (
          <p className="text-sm text-gray-500 mt-2">
            ⏱️ Duration: {formatDuration(chapter.duration)}
          </p>
        )}
      </div>

      {/* YouTube Video */}
      {content?.videoId ? (
        <div className="flex justify-center my-8">
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
        <div className="flex justify-center my-8 p-8 bg-gray-100 rounded-lg">
          <p className="text-gray-500">No video available for this chapter</p>
        </div>
      )}

      {/* Chapter Content */}
      <div>
        {parsedContent.length === 0 ? (
          <div className="p-8 bg-yellow-50 rounded-lg text-center border border-yellow-200">
            <p className="text-gray-600">
              No content available for this chapter yet. Please generate the
              course content first.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {parsedContent.map((item: any, index: number) => (
              <div 
                key={index} 
                className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-transparent p-5 rounded-lg hover:shadow-md transition-shadow"
              >
                <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold mr-3">
                    {index + 1}
                  </span>
                  {item.title}
                </h2>

                {/* Markdown Content with Enhanced Styling */}
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h2: ({node, ...props}) => <h3 className="text-xl font-bold text-gray-800 mt-4 mb-3" {...props} />,
                      h3: ({node, ...props}) => <h4 className="text-lg font-semibold text-gray-800 mt-3 mb-2" {...props} />,
                      p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-2" {...props} />,
                      li: ({node, ...props}) => <li className="ml-4 mb-1" {...props} />,
                      blockquote: ({node, ...props}) => (
                        <blockquote className="border-l-4 border-blue-400 bg-blue-100 p-4 my-4 rounded text-blue-900" {...props} />
                      ),
                      strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                      em: ({node, ...props}) => <em className="italic text-gray-700" {...props} />,
                      code: ({node, inline, ...props}: any) => 
                        inline ? (
                          <code className="bg-gray-200 px-2 py-1 rounded text-sm font-mono text-red-600" {...props} />
                        ) : (
                          <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-sm" {...props} />
                        ),
                    }}
                  >
                    {item.explanation}
                  </ReactMarkdown>
                </div>

                {/* Code Examples with Sandbox for Programming Courses */}
                {item.code_examples && item.code_examples.length > 0 && (
                  <div className="mt-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Code Example:</h3>
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
                            <div className="bg-gray-900 text-gray-100 p-5 rounded-lg overflow-x-auto border border-gray-700 mb-4">
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
                  <div className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Tip:</strong> Code examples in this section can be executed directly in the browser using the embedded code sandbox!
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterContent;