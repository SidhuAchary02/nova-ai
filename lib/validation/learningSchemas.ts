import { z } from "zod";

/** HTTP(S) URL — rejects empty paths-only strings */
const httpUrlString = z
  .string()
  .min(1)
  .refine(
    (s) => {
      try {
        const u = new URL(s);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Must be a valid http(s) URL" }
  );

export const learningGoalSchema = z.enum([
  "job",
  "internship",
  "exam",
  "hobby",
  "project",
]);

export const currentLevelSchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);

export const learningStyleSchema = z.enum([
  "video",
  "text",
  "hands-on",
  "mixed",
]);

export const userLearningContextSchema = z.object({
  goal: learningGoalSchema,
  currentLevel: currentLevelSchema,
  timePerDayHours: z.number().min(0.25).max(12),
  preferredLearningStyle: learningStyleSchema,
  topicsToFocus: z.array(z.string().min(1)).min(1),
  featuresRequired: z
    .array(
      z.enum([
        "quiz",
        "videos",
        "code_sandbox",
        "sources",
        "reading",
        "projects",
      ])
    )
    .min(1),
});

export type UserLearningContextValidated = z.infer<
  typeof userLearningContextSchema
>;

export const learningPhaseSchema = z.object({
  order: z.number().int().min(1),
  name: z.string().min(1),
  objectives: z.array(z.string().min(1)).min(1),
});

export const skillNodeSchema = z.object({
  skill: z.string().min(1),
  order: z.number().int().min(1),
  dependsOn: z.array(z.string()).optional(),
});

export const learningStrategyOutputSchema = z.object({
  phases: z.array(learningPhaseSchema).min(1),
  skillGraph: z.array(skillNodeSchema).min(1),
  estimatedTimelineDays: z.number().min(1),
  estimatedDaysPerPhase: z.array(
    z.object({
      phaseOrder: z.number().int().min(1),
      days: z.number().min(0.5),
    })
  ),
  reasoning: z.string().min(1),
});

export type LearningStrategyOutput = z.infer<
  typeof learningStrategyOutputSchema
>;

export const courseChapterOutlineSchema = z.object({
  chapterName: z.string().min(1),
  description: z.string(),
  duration: z.union([z.string(), z.object({ value: z.number(), unit: z.string() })]),
});

/** AI must return this exact shape for chapter outlines */
export const courseStructureOutputSchema = z.object({
  course: z.object({
    details: z.object({
      topic: z.string().min(1),
      description: z.string(),
      duration: z.string().optional(),
    }),
    chapters: z.array(courseChapterOutlineSchema).min(1),
  }),
});

export type CourseStructureOutput = z.infer<typeof courseStructureOutputSchema>;

export const chapterSectionSchema = z.object({
  title: z.string().min(1),
  explanation: z.string().min(1),
  code_examples: z.array(z.unknown()).optional(),
});

export const sourceItemSchema = z.object({
  title: z.string().min(1),
  url: httpUrlString,
  description: z.string().min(1),
});

export const chapterContentBundleSchema = z.object({
  sections: z.array(chapterSectionSchema).min(1),
  sources: z.array(sourceItemSchema).min(1),
});

export type ChapterContentBundle = z.infer<typeof chapterContentBundleSchema>;

export const quizQuestionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  correctAnswer: z.number().int().min(0).max(3),
  explanation: z.string().min(1),
});

export const quizOutputSchema = z.object({
  questions: z.array(quizQuestionSchema).length(5),
});

/** Sources-only regeneration (JSON object root) */
export const sourceListOutputSchema = z.object({
  sources: z.array(sourceItemSchema).min(1),
});

/**
 * Normalize course structure so `parseCourseOutput` can read chapters[].
 */
export function normalizeCourseStructureForStorage(
  parsed: CourseStructureOutput
): Record<string, unknown> {
  const { course } = parsed;
  if (!course.chapters?.length) {
    throw new Error("Validated course structure has no chapters");
  }

  return {
    course: {
      details: {
        topic: course.details.topic,
        description: course.details.description,
        duration: course.details.duration ?? "",
      },
      chapters: course.chapters,
    },
  };
}

