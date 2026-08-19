import IORedis from "ioredis";

let redisConnection: IORedis | null = null;

function resolveRedisUrl() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("REDIS_URL is required for the heavy generation worker");
  }

  return redisUrl;
}

// Redis lifecycle is centralized here so the queue producer, polling reads,
// and background worker reuse one client per Node process.
export function getRedisConnection() {
  if (redisConnection) return redisConnection;

  redisConnection = new IORedis(resolveRedisUrl(), {
    maxRetriesPerRequest: null,
  });

  return redisConnection;
}

export async function closeRedisConnection() {
  if (!redisConnection) return;

  const connection = redisConnection;
  redisConnection = null;

  try {
    await connection.quit();
  } catch {
    connection.disconnect();
  }
}