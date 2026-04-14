-- Add sources column to courseChapters table
ALTER TABLE "courseChapters" ADD COLUMN "sources" json DEFAULT '[]'::json;
