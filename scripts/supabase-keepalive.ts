import pg from "pg";

const { Pool } = pg;
const intervalMs = 24 * 60 * 60 * 1000;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for Supabase keepalive");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  idleTimeoutMillis: 30_000,
});

async function pingDatabase() {
  const client = await pool.connect();
  try {
    await client.query("select 1");
    console.log(`Supabase keepalive succeeded at ${new Date().toISOString()}`);
  } finally {
    client.release();
  }
}

const shutdown = async () => {
  await pool.end();
  process.exit(0);
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

pingDatabase()
  .then(() => {
    setInterval(() => {
      pingDatabase().catch((error) => {
        console.error("Supabase keepalive failed:", error);
      });
    }, intervalMs);
  })
  .catch(async (error) => {
    console.error("Supabase keepalive failed:", error);
    await shutdown();
  });
