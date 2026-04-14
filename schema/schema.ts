import {
  pgTable,
  serial,
  varchar,
  json,
  boolean,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

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
});

export const CourseChapters = pgTable("courseChapters", {
  id: serial("id").primaryKey(),
  courseId: varchar("courseId").notNull(),
  chapterId: integer("chapterId").notNull(),
  content: json("content").notNull(),
  videoId: varchar("videoId").notNull(),
  sources: json("sources").default([]), // Array of {title, url, description}
});
