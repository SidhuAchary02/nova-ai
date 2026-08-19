"use server";

import { generateGroqJsonObject, SYSTEM_PROMPTS } from "@/configs/ai-models";
import {
  AllGroqKeysExhaustedError,
  type LeasedGroqKey,
} from "@/lib/ai/groqKeyManager";
import {
  learningStrategyOutputSchema,
  userLearningContextSchema,
  type LearningStrategyOutput,
} from "@/lib/validation/learningSchemas";
import type { UserInputType } from "@/types/types";
import { buildLearningContextFromInput } from "@/lib/learning/buildLearningContext";

export type GenerateLearningStrategyResult =
  | { success: true; strategy: LearningStrategyOutput }
  | { success: false; error: string };

function roundToHalfDay(days: number): number {
  return Math.max(0.5, Math.round(days * 2) / 2);
}

function estimateTimelineFloorDays(
  strategy: LearningStrategyOutput,
  timePerDayHours: number
): number {
  const chapterCount = strategy.phases.reduce(
    (sum, phase) => sum + (phase.chapters?.length ?? 0),
    0
  );
  const subtopicCount = strategy.phases.reduce(
    (sum, phase) =>
      sum +
      (phase.chapters ?? []).reduce((chapterSum, chapter) => {
        const subchapterTopicCount = (chapter.subchapters ?? []).reduce(
          (subSum, subchapter) => subSum + (subchapter.subtopics?.length ?? 0),
          0
        );
        return chapterSum + Math.max(chapter.subtopics?.length ?? 0, subchapterTopicCount);
      }, 0),
    0
  );

  const topicHours = subtopicCount * 1.5;
  const chapterProjectHours = chapterCount * 1.25;
  const reviewHours = Math.max(4, chapterCount * 0.5);
  const estimatedHours = Math.max(8, topicHours + chapterProjectHours + reviewHours);

  return Math.max(1, Math.ceil(estimatedHours / Math.max(0.25, timePerDayHours)));
}

function distributeDays(totalDays: number, weights: number[]): number[] {
  if (weights.length === 0) return [];

  const safeWeights = weights.map((weight) => Math.max(1, weight));
  const weightTotal = safeWeights.reduce((sum, weight) => sum + weight, 0);
  const rawDays = safeWeights.map((weight) =>
    Math.max(1, Math.round((totalDays * weight) / weightTotal))
  );
  let diff = totalDays - rawDays.reduce((sum, days) => sum + days, 0);
  let cursor = 0;

  while (diff !== 0 && rawDays.length > 0) {
    const index = cursor % rawDays.length;
    if (diff > 0) {
      rawDays[index] += 1;
      diff -= 1;
    } else if (rawDays[index] > 1) {
      rawDays[index] -= 1;
      diff += 1;
    }
    cursor += 1;
    if (cursor > rawDays.length * 20) break;
  }

  return rawDays;
}

function limitSubtopics(subtopics?: string[]): string[] {
  return (subtopics ?? [])
    .map((subtopic) => subtopic.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean)
    : [];
}

function repairLearningStrategyShape(parsed: unknown): Record<string, unknown> {
  const source = parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? (parsed as Record<string, any>)
    : {};

  const phases = Array.isArray(source.phases) ? source.phases : [];

  const repairedPhases = phases.map((phase: Record<string, any>, index: number) => ({
    order: typeof phase.order === "number" ? phase.order : index + 1,
    name: typeof phase.name === "string" && phase.name.trim() ? phase.name : `Phase ${index + 1}`,
    durationDays: typeof phase.durationDays === "number" ? phase.durationDays : undefined,
    objectives: stringList(phase.objectives),
    chapters: Array.isArray(phase.chapters)
      ? phase.chapters.map((chapter: Record<string, any>, chapterIndex: number) => ({
          chapterName:
            typeof chapter.chapterName === "string" && chapter.chapterName.trim()
              ? chapter.chapterName
              : `Chapter ${chapterIndex + 1}`,
          durationDays:
            typeof chapter.durationDays === "number" ? chapter.durationDays : undefined,
          subtopics: limitSubtopics(stringList(chapter.subtopics)),
          subchapters: Array.isArray(chapter.subchapters)
            ? chapter.subchapters.map((subchapter: Record<string, any>, subchapterIndex: number) => ({
                title:
                  typeof subchapter.title === "string" && subchapter.title.trim()
                    ? subchapter.title
                    : `Subchapter ${subchapterIndex + 1}`,
                durationDays:
                  typeof subchapter.durationDays === "number"
                    ? subchapter.durationDays
                    : undefined,
                subtopics: limitSubtopics(stringList(subchapter.subtopics)),
              }))
            : [],
        }))
      : [],
  }));

  const skillGraph = Array.isArray(source.skillGraph)
    ? source.skillGraph
    : repairedPhases.flatMap((phase: Record<string, any>) =>
        (phase.chapters ?? []).flatMap((chapter: Record<string, any>) => {
          const chapterSkills = stringList(chapter.subtopics);
          const subchapterSkills = (chapter.subchapters ?? []).flatMap((subchapter: Record<string, any>) =>
            stringList(subchapter.subtopics)
          );
          return [...chapterSkills, ...subchapterSkills];
        })
      ).filter((skill: string, index: number, skills: string[]) => skills.indexOf(skill) === index)
        .map((skill: string, index: number) => ({ skill, order: index + 1 }));

  const estimatedDaysPerPhase = Array.isArray(source.estimatedDaysPerPhase)
    ? source.estimatedDaysPerPhase
    : repairedPhases.map((phase: Record<string, any>) => ({
        phaseOrder: typeof phase.order === "number" ? phase.order : 1,
        days: typeof phase.durationDays === "number" ? phase.durationDays : 1,
      }));

  const estimatedTimelineDays =
    typeof source.estimatedTimelineDays === "number"
      ? source.estimatedTimelineDays
      : estimatedDaysPerPhase.reduce(
          (sum: number, phase: Record<string, any>) => sum + (typeof phase.days === "number" ? phase.days : 0),
          0
        ) || Math.max(1, repairedPhases.length);

  return {
    phases: repairedPhases,
    skillGraph,
    estimatedTimelineDays,
    estimatedDaysPerPhase,
    reasoning:
      typeof source.reasoning === "string" && source.reasoning.trim()
        ? source.reasoning
        : "Generated roadmap based on the learner profile and topic scope.",
  };
}

function normalizeStrategyTimeline(
  strategy: LearningStrategyOutput,
  timePerDayHours: number
): LearningStrategyOutput {
  const normalizedPhases = strategy.phases
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((phase, phaseIndex) => ({
      ...phase,
      order: phaseIndex + 1,
      chapters: (phase.chapters ?? []).map((chapter) => {
        const limitedSubchapters = (chapter.subchapters ?? []).map((subchapter) => ({
          ...subchapter,
          subtopics: limitSubtopics(subchapter.subtopics),
        }));
        const subchapterDays = (chapter.subchapters ?? []).reduce(
          (sum, subchapter) => sum + (subchapter.durationDays ?? 0),
          0
        );
        const fallbackChapterDays =
          chapter.durationDays ??
          (subchapterDays > 0
            ? subchapterDays
            : Math.max(1, Math.ceil((chapter.subtopics?.length ?? 1) / Math.max(1, timePerDayHours))));

        return {
          ...chapter,
          subtopics: limitSubtopics(chapter.subtopics),
          durationDays: roundToHalfDay(fallbackChapterDays),
          subchapters: limitedSubchapters.map((subchapter) => ({
            ...subchapter,
            durationDays: roundToHalfDay(
              subchapter.durationDays ??
                Math.max(
                  0.5,
                  (chapter.durationDays ?? fallbackChapterDays) /
                    Math.max(1, chapter.subchapters?.length ?? 1)
                )
            ),
          })),
        };
      }),
    }));

  const chapterWeights = normalizedPhases.map((phase) =>
    Math.max(
      1,
      (phase.chapters ?? []).reduce(
        (sum, chapter) => sum + (chapter.durationDays ?? 1),
        0
      )
    )
  );
  const aiTimelineDays = Math.max(1, Math.round(strategy.estimatedTimelineDays));
  const adaptiveTimelineDays = estimateTimelineFloorDays(
    { ...strategy, phases: normalizedPhases },
    timePerDayHours
  );
  const totalDays = Math.max(
    normalizedPhases.length,
    Math.round((aiTimelineDays + adaptiveTimelineDays) / 2)
  );
  const phaseDays = distributeDays(totalDays, chapterWeights);

  return {
    ...strategy,
    phases: normalizedPhases.map((phase, index) => {
      const phaseDurationDays = phaseDays[index] ?? 1;
      const chapters = phase.chapters ?? [];
      const chapterDays = distributeDays(
        phaseDurationDays,
        chapters.map((chapter) => chapter.durationDays ?? 1)
      );

      return {
        ...phase,
        durationDays: phaseDurationDays,
        chapters: chapters.map((chapter, chapterIndex) => {
          const chapterDurationDays = chapterDays[chapterIndex] ?? 1;
          const subchapters = chapter.subchapters ?? [];
          const subchapterDays = distributeDays(
            chapterDurationDays,
            subchapters.map((subchapter) => subchapter.durationDays ?? 1)
          );

          return {
            ...chapter,
            durationDays: chapterDurationDays,
            subchapters: subchapters.map((subchapter, subchapterIndex) => ({
              ...subchapter,
              durationDays: subchapterDays[subchapterIndex] ?? subchapter.durationDays,
            })),
          };
        }),
      };
    }),
    estimatedTimelineDays: totalDays,
    estimatedDaysPerPhase: normalizedPhases.map((phase, index) => ({
      phaseOrder: phase.order,
      days: phaseDays[index] ?? 1,
    })),
  };
}

/**
 * Step 2 of the pipeline: personalized roadmap + skill graph + timeline (no DB write).
 */
export async function generateLearningStrategyAction(
  userInput: UserInputType,
  leasedKey?: LeasedGroqKey
): Promise<GenerateLearningStrategyResult> {
  try {
    const ctx = userLearningContextSchema.parse(
      buildLearningContextFromInput(userInput)
    );

    const courseBrief = userInput.detailedPrompt || userInput.description || userInput.intent || userInput.topic || "";
    const userPrompt = `Display course title: ${userInput.topic ?? ""}
Original topic selected by user: ${userInput.intent ?? ""}
Detailed course prompt / real generation brief: ${courseBrief}
Category: ${userInput.category ?? ""}
Description: ${userInput.description ?? ""}
Legacy difficulty (hint): ${userInput.difficulty ?? "not specified"}
Planned course duration label: ${userInput.duration ?? "not specified"}
Target chapter count: auto. Decide the chapter count from topic complexity, learner level, goals, daily hours, and realistic learning depth. Do not default to 10 chapters.

Learner profile (structured):
- goal: ${ctx.goal}
- currentLevel: ${ctx.currentLevel}
- timePerDayHours: ${ctx.timePerDayHours}
- preferredLearningStyle: ${ctx.preferredLearningStyle}
- topicsToFocus: ${JSON.stringify(ctx.topicsToFocus)}
- featuresRequired: ${JSON.stringify(ctx.featuresRequired)}

Produce one detailed roadmap JSON as specified in your system instructions.
Use the detailed course prompt as the source of truth for topic scope and terminology. Use the display course title only as a short UI label.
Timeline rules:
- Estimate total calendar days from total learning hours divided by timePerDayHours.
- More study hours/day must reduce total days realistically.
- Include durationDays for every phase, chapter, and subchapter.
- estimatedTimelineDays must equal the sum of estimatedDaysPerPhase.
- Use a variable number of chapters. Prefer more smaller chapters instead of fewer giant chapters.
- Each chapter/subchapter must have 3-4 subtopics maximum.
- If a topic needs more than 4 subtopics, split it into additional focused chapters instead of overloading one chapter.`;

    const raw = await generateGroqJsonObject(
      SYSTEM_PROMPTS.roadmap,
      userPrompt,
      0.55,
      "heavy",
      { leasedKey, estimatedTokens: 5000 }
    );
    const parsed = JSON.parse(raw);
    const strategy = normalizeStrategyTimeline(
      learningStrategyOutputSchema.parse(repairLearningStrategyShape(parsed)),
      ctx.timePerDayHours
    );

    return { success: true, strategy };
  } catch (e) {
    if (e instanceof AllGroqKeysExhaustedError) throw e;

    const msg = e instanceof Error ? e.message : String(e);
    console.error("generateLearningStrategyAction:", msg);
    return { success: false, error: msg };
  }
}
