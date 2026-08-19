// Redis has been disabled in this project.
// The heavy generation workflow now uses an in-memory job store instead.

export function getRedisConnection() {
  throw new Error("Redis is disabled in this build.");
}

export async function closeRedisConnection() {
  return;
}