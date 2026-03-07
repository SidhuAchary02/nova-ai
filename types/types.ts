export type UserInputType = {
  category?: string;
  difficulty?: string;
  duration?: string;
  video?: string;
  totalChapters?: number;
  topic?: string;
  description?: string;
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
  isVideo: string;
  username: string | null;
  userprofileimage: string | null;
  createdBy: string | null;
  courseBanner: string | null;
  isPublished: boolean;
  isCompleted?: boolean;
  completedChapters?: number[]; // Array of completed chapter indices
};

export type CodeExampleType = {
  code: string[];
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
