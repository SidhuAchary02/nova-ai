export const FREE_COURSE_GENERATION_LIMIT = 1;
export const OUT_OF_CREDITS_ERROR = "OUT_OF_FREE_CREDITS";

export type CourseGenerationAccess = {
  isPremium: boolean;
  used: number;
  limit: number | null;
  canGenerate: boolean;
};
