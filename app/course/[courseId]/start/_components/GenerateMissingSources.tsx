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
        if (result.sources) {
          onSourcesGenerated?.(result.sources);
        }
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
      <div className="mt-4 rounded-lg border border-emerald-300/20 bg-emerald-500/10 p-4">
        <p className="text-sm text-emerald-200">
          ✅ <strong>Sources Generated!</strong> Refreshing page to show sources...
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-primary/20 bg-primary/10 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-200">
          <strong>📚 Generate Sources:</strong> Click below to add reliable sources for this chapter.
        </p>
        <Button
          onClick={handleGenerateSources}
          disabled={loading}
          className="ml-4 bg-primary text-slate-950 hover:bg-primary/90"
        >
          {loading ? "Generating..." : "Generate Sources"}
        </Button>
      </div>
    </div>
  );
};

export default GenerateMissingSources;
