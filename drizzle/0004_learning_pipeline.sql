-- User profiles (learning context snapshots)
CREATE TABLE IF NOT EXISTS "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL UNIQUE,
	"profile" json NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Learning strategies linked to a course
CREATE TABLE IF NOT EXISTS "learning_strategies" (
	"id" serial PRIMARY KEY NOT NULL,
	"courseId" varchar NOT NULL,
	"createdBy" varchar,
	"strategyJson" json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

ALTER TABLE "courseList" ADD COLUMN IF NOT EXISTS "learningContext" json;
--> statement-breakpoint
ALTER TABLE "courseList" ADD COLUMN IF NOT EXISTS "learningStrategyId" integer;
--> statement-breakpoint

-- Remove duplicate chapter rows before unique index (keep lowest id)
DELETE FROM "courseChapters" a USING "courseChapters" b
WHERE a."courseId" = b."courseId"
  AND a."chapterId" = b."chapterId"
  AND a."id" > b."id";
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "course_chapters_course_chapter_uidx"
ON "courseChapters" ("courseId", "chapterId");
