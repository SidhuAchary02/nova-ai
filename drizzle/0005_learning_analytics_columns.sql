-- Dedicated analytics columns for onboarding/learning context
-- Safe to run in Supabase SQL Editor (uses IF NOT EXISTS guards)

-- 1) courseList: add query-friendly columns
ALTER TABLE "courseList" ADD COLUMN IF NOT EXISTS "learningGoal" varchar;
ALTER TABLE "courseList" ADD COLUMN IF NOT EXISTS "learningCurrentLevel" varchar;
ALTER TABLE "courseList" ADD COLUMN IF NOT EXISTS "learningTimePerDayHours" double precision;
ALTER TABLE "courseList" ADD COLUMN IF NOT EXISTS "learningPreferredLearningStyle" varchar;
ALTER TABLE "courseList" ADD COLUMN IF NOT EXISTS "learningTopicsToFocus" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "courseList" ADD COLUMN IF NOT EXISTS "learningTopicsToAvoid" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "courseList" ADD COLUMN IF NOT EXISTS "learningFeaturesRequired" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "courseList" ADD COLUMN IF NOT EXISTS "learningPacingStyle" varchar;
ALTER TABLE "courseList" ADD COLUMN IF NOT EXISTS "learningGoalCustomNote" varchar;

-- 2) user_profiles: add latest-profile analytics mirrors
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "profileGoal" varchar;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "profileCurrentLevel" varchar;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "profileTimePerDayHours" double precision;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "profilePreferredLearningStyle" varchar;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "profileTopicsToFocus" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "profileTopicsToAvoid" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "profileFeaturesRequired" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "profilePacingStyle" varchar;
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "profileGoalCustomNote" varchar;

-- 3) Backfill courseList columns from learningContext JSON
UPDATE "courseList"
SET
  "learningGoal" = COALESCE("learningGoal", "learningContext"->>'goal'),
  "learningCurrentLevel" = COALESCE("learningCurrentLevel", "learningContext"->>'currentLevel'),
  "learningTimePerDayHours" = COALESCE(
    "learningTimePerDayHours",
    NULLIF("learningContext"->>'timePerDayHours', '')::double precision
  ),
  "learningPreferredLearningStyle" = COALESCE(
    "learningPreferredLearningStyle",
    "learningContext"->>'preferredLearningStyle'
  ),
  "learningTopicsToFocus" = COALESCE(
    "learningTopicsToFocus",
    CASE
      WHEN jsonb_typeof("learningContext"::jsonb->'topicsToFocus') = 'array'
        THEN "learningContext"::jsonb->'topicsToFocus'
      ELSE '[]'::jsonb
    END
  ),
  "learningTopicsToAvoid" = COALESCE(
    "learningTopicsToAvoid",
    CASE
      WHEN jsonb_typeof("learningContext"::jsonb->'topicsToAvoid') = 'array'
        THEN "learningContext"::jsonb->'topicsToAvoid'
      ELSE '[]'::jsonb
    END
  ),
  "learningFeaturesRequired" = COALESCE(
    "learningFeaturesRequired",
    CASE
      WHEN jsonb_typeof("learningContext"::jsonb->'featuresRequired') = 'array'
        THEN "learningContext"::jsonb->'featuresRequired'
      ELSE '[]'::jsonb
    END
  ),
  "learningPacingStyle" = COALESCE("learningPacingStyle", "learningContext"->>'pacingStyle'),
  "learningGoalCustomNote" = COALESCE("learningGoalCustomNote", "learningContext"->>'goalCustomNote')
WHERE "learningContext" IS NOT NULL;

-- 4) Backfill user_profiles columns from profile JSON
UPDATE "user_profiles"
SET
  "profileGoal" = COALESCE("profileGoal", "profile"->>'goal'),
  "profileCurrentLevel" = COALESCE("profileCurrentLevel", "profile"->>'currentLevel'),
  "profileTimePerDayHours" = COALESCE(
    "profileTimePerDayHours",
    NULLIF("profile"->>'timePerDayHours', '')::double precision
  ),
  "profilePreferredLearningStyle" = COALESCE(
    "profilePreferredLearningStyle",
    "profile"->>'preferredLearningStyle'
  ),
  "profileTopicsToFocus" = COALESCE(
    "profileTopicsToFocus",
    CASE
      WHEN jsonb_typeof("profile"::jsonb->'topicsToFocus') = 'array'
        THEN "profile"::jsonb->'topicsToFocus'
      ELSE '[]'::jsonb
    END
  ),
  "profileTopicsToAvoid" = COALESCE(
    "profileTopicsToAvoid",
    CASE
      WHEN jsonb_typeof("profile"::jsonb->'topicsToAvoid') = 'array'
        THEN "profile"::jsonb->'topicsToAvoid'
      ELSE '[]'::jsonb
    END
  ),
  "profileFeaturesRequired" = COALESCE(
    "profileFeaturesRequired",
    CASE
      WHEN jsonb_typeof("profile"::jsonb->'featuresRequired') = 'array'
        THEN "profile"::jsonb->'featuresRequired'
      ELSE '[]'::jsonb
    END
  ),
  "profilePacingStyle" = COALESCE("profilePacingStyle", "profile"->>'pacingStyle'),
  "profileGoalCustomNote" = COALESCE("profileGoalCustomNote", "profile"->>'goalCustomNote')
WHERE "profile" IS NOT NULL;

-- 5) Optional indexes for dashboard filtering
CREATE INDEX IF NOT EXISTS "courseList_learning_goal_idx"
  ON "courseList" ("learningGoal");

CREATE INDEX IF NOT EXISTS "courseList_learning_current_level_idx"
  ON "courseList" ("learningCurrentLevel");

CREATE INDEX IF NOT EXISTS "courseList_learning_pacing_style_idx"
  ON "courseList" ("learningPacingStyle");

CREATE INDEX IF NOT EXISTS "courseList_learning_time_per_day_idx"
  ON "courseList" ("learningTimePerDayHours");

CREATE INDEX IF NOT EXISTS "courseList_learning_features_required_gin_idx"
  ON "courseList" USING GIN ("learningFeaturesRequired");

CREATE INDEX IF NOT EXISTS "courseList_learning_topics_focus_gin_idx"
  ON "courseList" USING GIN ("learningTopicsToFocus");

CREATE INDEX IF NOT EXISTS "courseList_learning_topics_avoid_gin_idx"
  ON "courseList" USING GIN ("learningTopicsToAvoid");
