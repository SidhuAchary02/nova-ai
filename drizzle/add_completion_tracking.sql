-- Add isCompleted column to courseList table
ALTER TABLE "courseList" ADD COLUMN "isCompleted" boolean DEFAULT false;

-- Update courseBanner default value
ALTER TABLE "courseList" ALTER COLUMN "courseBanner" SET DEFAULT '/thumbnail.png';
