const dotenv = require("dotenv");
const { Client } = require("pg");

dotenv.config({ path: ".env.local" });

const statements = [
  `ALTER TABLE "courseList" ADD COLUMN IF NOT EXISTS "generation_status" varchar DEFAULT 'partial' NOT NULL`,
  `ALTER TABLE "courseList" ADD COLUMN IF NOT EXISTS "queue_job_id" varchar`,
  `ALTER TABLE "courseList" ADD COLUMN IF NOT EXISTS "chapters_generated" integer DEFAULT 0 NOT NULL`,
  `ALTER TABLE "courseList" ADD COLUMN IF NOT EXISTS "chapters_total" integer DEFAULT 0 NOT NULL`,
  `ALTER TABLE "courseChapters" ADD COLUMN IF NOT EXISTS "generation_status" varchar DEFAULT 'generated' NOT NULL`,
  `CREATE TABLE IF NOT EXISTS "groq_api_keys" (
    "id" serial PRIMARY KEY NOT NULL,
    "key_id" varchar NOT NULL UNIQUE,
    "pool" varchar NOT NULL,
    "status" varchar DEFAULT 'active' NOT NULL,
    "cooldown_until" timestamp,
    "daily_tokens_used" integer DEFAULT 0 NOT NULL,
    "minute_requests_used" integer DEFAULT 0 NOT NULL,
    "minute_tokens_used" integer DEFAULT 0 NOT NULL,
    "minute_reset_at" timestamp DEFAULT now() NOT NULL,
    "leased_by_job_id" varchar,
    "leased_until" timestamp,
    "last_reset" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
  )`,
  `ALTER TABLE "groq_api_keys" ADD COLUMN IF NOT EXISTS "minute_requests_used" integer DEFAULT 0 NOT NULL`,
  `ALTER TABLE "groq_api_keys" ADD COLUMN IF NOT EXISTS "minute_tokens_used" integer DEFAULT 0 NOT NULL`,
  `ALTER TABLE "groq_api_keys" ADD COLUMN IF NOT EXISTS "minute_reset_at" timestamp DEFAULT now() NOT NULL`,
  `ALTER TABLE "groq_api_keys" ADD COLUMN IF NOT EXISTS "leased_by_job_id" varchar`,
  `ALTER TABLE "groq_api_keys" ADD COLUMN IF NOT EXISTS "leased_until" timestamp`,
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  for (const statement of statements) {
    await client.query(statement);
  }

  await client.end();
  console.log("Generation queue migration applied.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
