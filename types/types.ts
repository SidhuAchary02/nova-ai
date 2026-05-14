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
  topicsToAvoid?: string[];
  pacingStyle?: PacingStyle;
  featuresRequired: Array<
    "quiz" | "videos" | "code_sandbox" | "sources" | "reading" | "projects"
  >;
};

export type PacingStyle = "easy" | "balanced" | "fast";

export type UserInputType = {
  intent?: string;
  goal?: LearningGoal;
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
  subtopics?: string[];
};

export type LessonBlockType =
  | {
      type: "hero";
      title: string;
      subtitle?: string;
      estimatedMinutes?: string;
      difficulty?: string;
      note?: string;
    }
  | {
      type: "insight";
      title?: string;
      content: string;
      accent?: "gold" | "emerald" | "violet" | "cyan";
    }
  | {
      type: "text";
      title?: string;
      body: string;
      emphasis?: string[];
    }
  | {
      type: "video";
      title?: string;
      url?: string;
      videoId?: string;
      summary?: string;
      whyItMatters?: string;
    }
  | {
      type: "diagram";
      title?: string;
      description?: string;
      nodes?: string[];
      edges?: Array<{ from: string; to: string }>;
    }
  | {
      type: "table";
      title?: string;
      headers: string[];
      rows: string[][];
    }
  | {
      type: "chart";
      title?: string;
      chartType: "bar" | "pie" | "line";
      labels: string[];
      values: number[];
      description?: string;
    }
  | {
      type: "code";
      title?: string;
      language: string;
      initialCode: string;
      solution?: string;
      explanation?: string;
    }
  | {
      type: "example";
      title?: string;
      scenario: string;
      takeaway?: string;
    }
  | {
      type: "analogy";
      title?: string;
      analogy: string;
      explanation?: string;
    }
  | {
      type: "quiz";
      title?: string;
      questions: Array<{
        question: string;
        options: string[];
        correctAnswer?: number;
        explanation?: string;
      }>;
      note?: string;
    }
  | {
      type: "accordion";
      title?: string;
      items: Array<{ label: string; content: string }>;
    }
  | {
      type: "image";
      title?: string;
      src?: string;
      prompt?: string;
      caption?: string;
    }
  | {
      type: "practice";
      title?: string;
      tasks: string[];
      note?: string;
    }
  | {
      type: "summary";
      title?: string;
      takeaways: string[];
      revisionNotes?: string;
    };

export type LessonSectionType = {
  title: string;
  blocks?: LessonBlockType[];
  lesson_plan_scratchpad?: string;
  learning_overview?: string;
  deep_explanation?: string;
  code_sandbox?: {
    language: string;
    initial_code: string;
    solution?: string;
  };
  mini_challenge?: {
    challenge: string;
    hint?: string;
  };
  interview_relevance?: string;
  summary_cheat_sheet?: string | string[];
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
  learningGoal?: string | null;
  learningCurrentLevel?: string | null;
  learningTimePerDayHours?: number | null;
  learningPreferredLearningStyle?: string | null;
  learningTopicsToFocus?: string[] | null;
  learningTopicsToAvoid?: string[] | null;
  learningFeaturesRequired?: string[] | null;
  learningPacingStyle?: string | null;
  learningGoalCustomNote?: string | null;
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
  content: LessonSectionType[];
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
