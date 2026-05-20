import {
  pgTable,
  serial,
  varchar,
  json,
  jsonb,
  boolean,
  integer,
  real,
  text,
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
  generationStatus: varchar("generation_status").notNull().default("partial"),
  queueJobId: varchar("queue_job_id"),
  chaptersGenerated: integer("chapters_generated").notNull().default(0),
  chaptersTotal: integer("chapters_total").notNull().default(0),
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

export const courseGenerationUsage = pgTable("course_generation_usage", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull().unique(),
  generatedCount: integer("generatedCount").notNull().default(0),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
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
    generationStatus: varchar("generation_status").notNull().default("generated"),
  },
  (table) => ({
    courseChapterUniq: uniqueIndex("course_chapters_course_chapter_uidx").on(
      table.courseId,
      table.chapterId
    ),
  })
);

export const groqApiKeys = pgTable("groq_api_keys", {
  id: serial("id").primaryKey(),
  keyId: varchar("key_id").notNull().unique(),
  pool: varchar("pool").notNull(),
  status: varchar("status").notNull().default("active"),
  cooldownUntil: timestamp("cooldown_until"),
  dailyTokensUsed: integer("daily_tokens_used").notNull().default(0),
  minuteRequestsUsed: integer("minute_requests_used").notNull().default(0),
  minuteTokensUsed: integer("minute_tokens_used").notNull().default(0),
  minuteResetAt: timestamp("minute_reset_at").defaultNow().notNull(),
  leasedByJobId: varchar("leased_by_job_id"),
  leasedUntil: timestamp("leased_until"),
  lastReset: timestamp("last_reset").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** Tracks non-owner users who have added a marketplace course to their dashboard */
export const courseMarketplaceAdds = pgTable(
  "course_marketplace_adds",
  {
    id: serial("id").primaryKey(),
    courseId: varchar("courseId").notNull(),
    addedByEmail: varchar("addedByEmail").notNull(),
    completedChapters: json("completedChapters").default([]), // Per-user progress
    addedAt: timestamp("addedAt").defaultNow().notNull(),
  },
  (table) => ({
    courseUserUniq: uniqueIndex("course_marketplace_adds_course_user_uidx").on(
      table.courseId,
      table.addedByEmail
    ),
  })
);

/** Reviews and feedback for published courses */
export const courseReviews = pgTable("course_reviews", {
  id: serial("id").primaryKey(),
  courseId: varchar("courseId").notNull(),
  reviewerEmail: varchar("reviewerEmail").notNull(),
  reviewerName: varchar("reviewerName"),
  rating: integer("rating"), // Optional 1-5 star rating
  reviewText: text("reviewText").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
