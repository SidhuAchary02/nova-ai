-- Add quiz tracking and certificate columns to courseList
ALTER TABLE "courseList" 
ADD COLUMN IF NOT EXISTS "quizPassedChapters" json DEFAULT '[]',
ADD COLUMN IF NOT EXISTS "certificateData" json,
ADD COLUMN IF NOT EXISTS "completedAt" timestamp;
