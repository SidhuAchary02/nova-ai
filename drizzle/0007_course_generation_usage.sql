CREATE TABLE IF NOT EXISTS "course_generation_usage" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" varchar NOT NULL UNIQUE,
  "generatedCount" integer DEFAULT 0 NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
