import {
  pgTable,
  serial,
  varchar,
  json,
  jsonb,
  boolean,
  integer,
  real,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull().unique(),
  profile: json("profile").notNull(),
  profileGoal: varchar("profileGoal"),
  profileCurrentLevel: varchar("profileCurrentLevel"),
  profileTimePerDayHours: real("profileTimePerDayHours"),
  profilePreferredLearningStyle: varchar("profilePreferredLearningStyle"),
  profileTopicsToFocus: jsonb("profileTopicsToFocus").default([]),
  profileTopicsToAvoid: jsonb("profileTopicsToAvoid").default([]),
  profileFeaturesRequired: jsonb("profileFeaturesRequired").default([]),
  profilePacingStyle: varchar("profilePacingStyle"),
  profileGoalCustomNote: varchar("profileGoalCustomNote"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const learningStrategies = pgTable("learning_strategies", {
  id: serial("id").primaryKey(),
  courseId: varchar("courseId").notNull(),
  createdBy: varchar("createdBy"),
  strategyJson: json("strategyJson").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const CourseList = pgTable("courseList", {
  id: serial("id").primaryKey(),
  courseId: varchar("courseId").notNull(),
  courseName: varchar("name").notNull(),
  category: varchar("category").notNull(),
  level: varchar("level").notNull(),
  courseOutput: json("courseOutput").notNull(),
  isVideo: varchar("isVideo").notNull().default("Yes"),
  username: varchar("username"),
  userprofileimage: varchar("userprofileimage"),
  createdBy: varchar("createdBy"),
  courseBanner: varchar("courseBanner").default("/thumbnail.png"),
  isPublished: boolean("isPublished").notNull().default(false),
  isCompleted: boolean("isCompleted").default(false),
  completedChapters: json("completedChapters").default([]), // Array of completed chapter indices
  quizPassedChapters: json("quizPassedChapters").default([]), // Array of chapter indices where quiz was passed
  certificateData: json("certificateData"), // Certificate metadata {issuedDate, certificateId}
  completedAt: timestamp("completedAt"), // When course was completed
  /** Snapshot of UserLearningContext at course creation (optional for legacy rows) */
  learningContext: json("learningContext"),
  /** FK to learning_strategies.id when pipeline was used */
  learningStrategyId: integer("learningStrategyId"),
  /** Dedicated analytics columns mirrored from learningContext */
  learningGoal: varchar("learningGoal"),
  learningCurrentLevel: varchar("learningCurrentLevel"),
  learningTimePerDayHours: real("learningTimePerDayHours"),
  learningPreferredLearningStyle: varchar("learningPreferredLearningStyle"),
  learningTopicsToFocus: jsonb("learningTopicsToFocus").default([]),
  learningTopicsToAvoid: jsonb("learningTopicsToAvoid").default([]),
  learningFeaturesRequired: jsonb("learningFeaturesRequired").default([]),
  learningPacingStyle: varchar("learningPacingStyle"),
  learningGoalCustomNote: varchar("learningGoalCustomNote"),
});

export const CourseChapters = pgTable(
  "courseChapters",
  {
    id: serial("id").primaryKey(),
    courseId: varchar("courseId").notNull(),
    chapterId: integer("chapterId").notNull(),
    content: json("content").notNull(),
    videoId: varchar("videoId").notNull(),
    sources: json("sources").default([]), // Array of {title, url, description}
    annotations: jsonb("annotations").default([]), // Array of chapter note objects
  },
  (table) => ({
    courseChapterUniq: uniqueIndex("course_chapters_course_chapter_uidx").on(
      table.courseId,
      table.chapterId
    ),
  })
);
