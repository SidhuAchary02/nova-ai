"use client";

import { SourceType } from "@/types/types";
import { FaExternalLinkAlt, FaBook } from "react-icons/fa";
import GenerateMissingSources from "./GenerateMissingSources";

type ChapterSourcesProps = {
  sources?: SourceType[];
  chapterName?: string;
  courseId?: string;
  chapterId?: number;
  courseName?: string;
  onSourcesGenerated?: (sources: SourceType[]) => void;
};

const ChapterSources = ({ 
  sources, 
  chapterName, 
  courseId, 
  chapterId,
  courseName,
  onSourcesGenerated 
}: ChapterSourcesProps) => {
  // Debug logging
  console.log("ChapterSources received:", { sources, chapterName, sourcesLength: sources?.length });
  
  // If no sources, show generate button
  if (!sources || sources.length === 0) {
    console.warn("⚠️ No sources to display");
    return (
      <div className="mt-12 border-t border-white/10 pt-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-4 rounded-lg border border-amber-300/20 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-200">
              <strong>ℹ️ No Sources Yet:</strong> This chapter doesn&apos;t have sources yet, but you can generate them now!
            </p>
          </div>
          
          {/* Show button if we have the needed info */}
          {courseId && chapterId !== undefined && chapterName && courseName && (
            <GenerateMissingSources
              courseId={courseId}
              chapterId={chapterId}
              chapterName={chapterName}
              courseName={courseName}
              onSourcesGenerated={onSourcesGenerated}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 border-t border-white/10 pt-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <FaBook className="text-2xl text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Sources & References</h2>
            <p className="mt-1 text-sm text-slate-400">
              Reliable sources that support the content in this chapter
            </p>
          </div>
        </div>

        {/* Sources List */}
        <div className="space-y-4">
          {sources.map((source, index) => (
            <div
              key={index}
              className="rounded-lg border border-white/10 bg-slate-900/60 p-4 transition-all hover:border-primary/40 hover:shadow-md"
            >
              {/* Source Number and Title */}
              <div className="flex items-start gap-3 mb-2">
                <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-slate-950">
                  {index + 1}
                </span>
                <h3 className="flex-1 break-words text-lg font-semibold text-slate-100">
                  {source.title}
                </h3>
              </div>

              {/* Description */}
              <p className="mb-3 ml-9 text-sm leading-relaxed text-slate-300">
                {source.description}
              </p>

              {/* URL - As a clickable link */}
              <div className="ml-9">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 break-all text-sm font-medium text-primary hover:text-primary/80 hover:underline"
                >
                  <FaExternalLinkAlt size={12} />
                  <span className="hover:text-primary/80">{source.url}</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-6 rounded-lg border border-primary/20 bg-primary/10 p-4">
          <p className="text-sm text-slate-200">
            <strong>✓ Content Reliability:</strong> This course content has been created based on these verified sources. All sources are publicly accessible and relevant to the topics covered in this chapter. Teachers and learners can verify the content accuracy by reviewing these sources.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChapterSources;
