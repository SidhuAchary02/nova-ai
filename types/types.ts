export type LearningGoal =
  | "job"
  | "internship"
  | "exam"
  | "hobby"
  | "project";

export type UserLearningProfileInput = {
  goal: LearningGoal;
  currentLevel: "beginner" | "intermediate" | "advanced";
  timePerDayHours: number;
  preferredLearningStyle: "video" | "text" | "hands-on" | "mixed";
  topicsToFocus: string[];
  featuresRequired: Array<
    "quiz" | "videos" | "code_sandbox" | "sources" | "reading" | "projects"
  >;
};

export type PacingStyle = "easy" | "balanced" | "fast";

export type UserInputType = {
  category?: string;
  difficulty?: string;
  duration?: string;
  video?: string;
  totalChapters?: number;
  topic?: string;
  description?: string;
  /** Personalized learning pipeline (Step 1) */
  learningProfile?: UserLearningProfileInput;
  /** UI-only: topics learner wants to de-emphasize (shown in summary; optional for future prompts) */
  topicsToAvoid?: string[];
  /** Maps to difficulty when syncing course options */
  pacingStyle?: PacingStyle;
  /** Free text when user picks a custom learning goal */
  goalCustomNote?: string;
};

export type ChapterType = {
  chapterName: string;
  description: string;
  duration: string | { value: number; unit: string };
};

export type courseOutputType = {
  topic: string;
  description?: string;
  duration?: string;
  chapters: ChapterType[];
  category?: string;
  level?: string;
};

export type CourseType = {
  id: number;
  courseId: string;
  courseName: string;
  category: string;
  level: string;
  courseOutput: courseOutputType;
  isVideo: string | { value: string } | { value: boolean };
  username: string | null;
  userprofileimage: string | null;
  createdBy: string | null;
  courseBanner: string | null;
  isPublished: boolean;
  isCompleted?: boolean;
  completedChapters?: number[]; // Array of completed chapter indices
  quizPassedChapters?: number[]; // Array of chapter indices where quiz was passed
  certificateData?: {
    certificateId: string;
    issuedDate: string;
    completedAt: string;
  };
  completedAt?: string; // When course was completed
  /** Snapshot of learner context when using the new pipeline */
  learningContext?: unknown;
  learningStrategyId?: number | null;
};

export type CodeExampleType = {
  code: string[];
};

export type SourceType = {
  title: string;
  url: string;
  description: string;
};

export type ChapterSectionType = {
  title: string;
  explanation: string;
  code_examples?: CodeExampleType[];
};

export type ChapterContentType = {
  id: number;
  chapterId: number;
  courseId: string;
  content: ChapterSectionType[];
  videoId: string;
  sources?: SourceType[];
};

export type QuizQuestionType = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export type ChapterQuizType = {
  id: number;
  chapterId: number;
  courseId: string;
  questions: QuizQuestionType[];
};
