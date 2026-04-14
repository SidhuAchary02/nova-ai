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
      <div className="mt-12 pt-8 border-t-2 border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <p className="text-sm text-yellow-800">
              <strong>ℹ️ No Sources Yet:</strong> This chapter doesn't have sources yet, but you can generate them now!
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
    <div className="mt-12 pt-8 border-t-2 border-gray-200">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <FaBook className="text-2xl text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sources & References</h2>
            <p className="text-sm text-gray-600 mt-1">
              Reliable sources that support the content in this chapter
            </p>
          </div>
        </div>

        {/* Sources List */}
        <div className="space-y-4">
          {sources.map((source, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-lg p-4 hover:shadow-md hover:border-blue-400 transition-all bg-gradient-to-r from-gray-50 to-transparent"
            >
              {/* Source Number and Title */}
              <div className="flex items-start gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm font-semibold flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 flex-1 break-words">
                  {source.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-gray-700 text-sm mb-3 ml-9 leading-relaxed">
                {source.description}
              </p>

              {/* URL - As a clickable link */}
              <div className="ml-9">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium break-all"
                >
                  <FaExternalLinkAlt size={12} />
                  <span className="hover:text-blue-800">{source.url}</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>✓ Content Reliability:</strong> This course content has been created based on these verified sources. All sources are publicly accessible and relevant to the topics covered in this chapter. Teachers and learners can verify the content accuracy by reviewing these sources.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChapterSources;
