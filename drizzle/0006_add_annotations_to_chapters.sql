-- Add annotations column to courseChapters table
ALTER TABLE "courseChapters" ADD COLUMN IF NOT EXISTS "annotations" jsonb DEFAULT '[]'::jsonb;