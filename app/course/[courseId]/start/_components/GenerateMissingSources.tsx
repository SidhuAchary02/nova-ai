"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { quickAddSourcesForChapterAction } from "@/app/actions/quickAddSources";
import { SourceType } from "@/types/types";

type GenerateMissingSourcesProps = {
  courseId: string;
  chapterId: number;
  chapterName: string;
  courseName: string;
  onSourcesGenerated?: (sources: SourceType[]) => void;
};

const GenerateMissingSources = ({
  courseId,
  chapterId,
  chapterName,
  courseName,
  onSourcesGenerated,
}: GenerateMissingSourcesProps) => {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleGenerateSources = async () => {
    setLoading(true);
    try {
      const result = await quickAddSourcesForChapterAction(
        courseId,
        chapterId,
        chapterName,
        courseName
      );

      if (result.success) {
        setDone(true);
        onSourcesGenerated?.(result.sources);
        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        alert("Failed to generate sources: " + result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error generating sources");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800">
          ✅ <strong>Sources Generated!</strong> Refreshing page to show sources...
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between">
        <p className="text-sm text-blue-800">
          <strong>📚 Generate Sources:</strong> Click below to add reliable sources for this chapter.
        </p>
        <Button
          onClick={handleGenerateSources}
          disabled={loading}
          className="ml-4 bg-blue-600 hover:bg-blue-700"
        >
          {loading ? "Generating..." : "Generate Sources"}
        </Button>
      </div>
    </div>
  );
};

export default GenerateMissingSources;
