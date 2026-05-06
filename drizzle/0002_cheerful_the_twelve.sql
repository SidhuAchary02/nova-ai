CREATE TABLE IF NOT EXISTS "learning_strategies" (
	"id" serial PRIMARY KEY NOT NULL,
	"courseId" varchar NOT NULL,
	"createdBy" varchar,
	"strategyJson" json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"profile" json NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "courseChapters" ADD COLUMN "sources" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "courseList" ADD COLUMN "quizPassedChapters" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "courseList" ADD COLUMN "certificateData" json;--> statement-breakpoint
ALTER TABLE "courseList" ADD COLUMN "completedAt" timestamp;--> statement-breakpoint
ALTER TABLE "courseList" ADD COLUMN "learningContext" json;--> statement-breakpoint
ALTER TABLE "courseList" ADD COLUMN "learningStrategyId" integer;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "course_chapters_course_chapter_uidx" ON "courseChapters" USING btree ("courseId","chapterId");