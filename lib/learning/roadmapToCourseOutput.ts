import type { LearningStrategyOutput } from "@/lib/validation/learningSchemas";
import type { UserInputType } from "@/types/types";

const MAX_SUBTOPICS_PER_CHAPTER = 4;

type DerivedCourseChapter = {
  chapterName: string;
  description: string;
  duration: string;
  durationDays?: number;
  phaseOrder: number;
  phaseName: string;
  parentChapterName?: string;
  subchapters: Array<{
    title: string;
    durationDays?: number;
    subtopics: string[];
  }>;
  subtopics: string[];
};

function dayLabel(days?: number): string {
  if (typeof days !== "number" || Number.isNaN(days) || days <= 0) {
    return "";
  }

  const rounded = Math.round(days * 2) / 2;
  return `${rounded} day${rounded === 1 ? "" : "s"}`;
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const clean = value.trim();
    if (!clean || seen.has(clean.toLowerCase())) return false;
    seen.add(clean.toLowerCase());
    return true;
  });
}

function chunkSubtopics(subtopics: string[]): string[][] {
  const cleanSubtopics = uniqueStrings(subtopics).slice(0);
  if (cleanSubtopics.length === 0) return [[]];

  const chunks: string[][] = [];
  for (let i = 0; i < cleanSubtopics.length; i += MAX_SUBTOPICS_PER_CHAPTER) {
    chunks.push(cleanSubtopics.slice(i, i + MAX_SUBTOPICS_PER_CHAPTER));
  }
  return chunks;
}

function splitDays(totalDays: number | undefined, parts: number): number | undefined {
  if (typeof totalDays !== "number" || Number.isNaN(totalDays) || parts <= 1) {
    return totalDays;
  }
  return Math.max(0.5, Math.round((totalDays / parts) * 2) / 2);
}

export function buildCourseOutputFromRoadmap(
  userInput: UserInputType,
  strategy: LearningStrategyOutput
): Record<string, unknown> {
  const phases = strategy.phases.slice().sort((a, b) => a.order - b.order);

  const chapters: DerivedCourseChapter[] = [];

  phases.forEach((phase) => {
    (phase.chapters ?? []).forEach((chapter) => {
      const subchapters = chapter.subchapters ?? [];

      if (subchapters.length > 0) {
        subchapters.forEach((subchapter) => {
          const subtopicChunks = chunkSubtopics(subchapter.subtopics ?? []);
          const durationDays = splitDays(subchapter.durationDays, subtopicChunks.length);

          subtopicChunks.forEach((subtopics, chunkIndex) => {
            const needsPart = subtopicChunks.length > 1;
            const chapterName = needsPart
              ? `${subchapter.title} - Part ${chunkIndex + 1}`
              : subchapter.title;

            chapters.push({
              chapterName,
              description: `Part of ${phase.name} > ${chapter.chapterName}.`,
              duration: dayLabel(durationDays),
              durationDays,
              phaseOrder: phase.order,
              phaseName: phase.name,
              parentChapterName: chapter.chapterName,
              subchapters: [
                {
                  title: chapterName,
                  durationDays,
                  subtopics,
                },
              ],
              subtopics,
            });
          });
        });
        return;
      }

      const subtopicChunks = chunkSubtopics(chapter.subtopics ?? []);
      const durationDays = splitDays(chapter.durationDays, subtopicChunks.length);

      subtopicChunks.forEach((subtopics, chunkIndex) => {
        const needsPart = subtopicChunks.length > 1;
        const chapterName = needsPart
          ? `${chapter.chapterName} - Part ${chunkIndex + 1}`
          : chapter.chapterName;

        chapters.push({
          chapterName,
          description: `Part of ${phase.name}.`,
          duration: dayLabel(durationDays),
          durationDays,
          phaseOrder: phase.order,
          phaseName: phase.name,
          subchapters: [],
          subtopics,
        });
      });
    });
  });

  return {
    course: {
      details: {
        topic: userInput.topic || userInput.intent || "General Course",
        description:
          userInput.detailedPrompt ||
          userInput.description ||
          strategy.reasoning ||
          "A personalized learning roadmap built from the learner profile.",
        duration: dayLabel(strategy.estimatedTimelineDays),
        durationDays: strategy.estimatedTimelineDays,
      },
      chapters,
    },
  };
}
