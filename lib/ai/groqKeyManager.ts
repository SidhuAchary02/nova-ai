import { db } from "@/configs/db";
import { groqApiKeys } from "@/schema/schema";
import { eq, sql } from "drizzle-orm";

export type GroqKeyPool = "heavy" | "light";
export type GroqKeyStatus = "active" | "cooldown" | "exhausted" | "failed";

type KeyCandidate = {
  keyId: string;
  apiKey: string;
  pool: GroqKeyPool | "paid";
};

export type LeasedGroqKey = KeyCandidate & {
  leaseJobId: string;
};

export type KeyFailureStats = {
  cooldown: number;
  exhausted: number;
  failed: number;
  nextRecoveryAt?: Date;
};

export class AllGroqKeysExhaustedError extends Error {
  stats: KeyFailureStats;

  constructor(message: string, stats: KeyFailureStats) {
    super(message);
    this.name = "AllGroqKeysExhaustedError";
    this.stats = stats;
  }
}

function splitKeys(value?: string) {
  return (value || "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
}

function configuredKeysForPool(pool: GroqKeyPool): KeyCandidate[] {
  const fallbackKey = process.env.GROQ_API_KEY?.trim();
  const heavyKeys = splitKeys(process.env.GROQ_HEAVY_API_KEYS);
  const lightKeys = splitKeys(process.env.GROQ_LIGHT_API_KEYS);

  const rawKeys =
    pool === "heavy"
      ? heavyKeys.length > 0
        ? heavyKeys
        : fallbackKey
          ? [fallbackKey]
          : []
      : lightKeys;

  return rawKeys.map((apiKey, index) => ({
    keyId: `${pool}_${index + 1}`,
    apiKey,
    pool,
  }));
}

function paidKey(): KeyCandidate[] {
  const apiKey = process.env.GROQ_PAID_API_KEY?.trim();
  return apiKey ? [{ keyId: "paid_1", apiKey, pool: "paid" }] : [];
}

export function getConfiguredHeavyKeyCount() {
  const paid = paidKey().length;
  return configuredKeysForPool("heavy").length + paid;
}

export function getGroqModelLimits(model: string) {
  if (model === "meta-llama/llama-4-scout-17b-16e-instruct") {
    return { requestsPerMinute: 30, tokensPerMinute: 30_000, tokensPerDay: 500_000 };
  }

  if (model === "llama-3.1-8b-instant") {
    return { requestsPerMinute: 30, tokensPerMinute: 6_000, tokensPerDay: 500_000 };
  }

  return { requestsPerMinute: 30, tokensPerMinute: 12_000, tokensPerDay: 100_000 };
}

async function ensureKeyRow(candidate: KeyCandidate) {
  await db
    .insert(groqApiKeys)
    .values({
      keyId: candidate.keyId,
      pool: candidate.pool,
        status: "active",
        minuteResetAt: new Date(),
        lastReset: new Date(),
        updatedAt: new Date(),
    })
    .onConflictDoNothing();
}

async function resetIfExpired(candidate: KeyCandidate) {
  const [row] = await db
    .select()
    .from(groqApiKeys)
    .where(eq(groqApiKeys.keyId, candidate.keyId));

  if (!row) return;

  const now = Date.now();
  const resetDaily = now - new Date(row.lastReset).getTime() >= 24 * 60 * 60 * 1000;
  const cooldownExpired =
    row.cooldownUntil && new Date(row.cooldownUntil).getTime() <= now;
  const minuteExpired = now - new Date(row.minuteResetAt).getTime() >= 60 * 1000;
  const leaseExpired =
    row.leasedUntil && new Date(row.leasedUntil).getTime() <= now;

  if (resetDaily || cooldownExpired || minuteExpired || leaseExpired) {
    await db
      .update(groqApiKeys)
      .set({
        status: "active",
        cooldownUntil: null,
        dailyTokensUsed: resetDaily ? 0 : row.dailyTokensUsed,
        minuteRequestsUsed: minuteExpired ? 0 : row.minuteRequestsUsed,
        minuteTokensUsed: minuteExpired ? 0 : row.minuteTokensUsed,
        minuteResetAt: minuteExpired ? new Date() : row.minuteResetAt,
        leasedByJobId: leaseExpired ? null : row.leasedByJobId,
        leasedUntil: leaseExpired ? null : row.leasedUntil,
        lastReset: resetDaily ? new Date() : row.lastReset,
        updatedAt: new Date(),
      })
      .where(eq(groqApiKeys.keyId, candidate.keyId));
  }
}

async function isAvailable(candidate: KeyCandidate) {
  await ensureKeyRow(candidate);
  await resetIfExpired(candidate);

  const [row] = await db
    .select({
      status: groqApiKeys.status,
      cooldownUntil: groqApiKeys.cooldownUntil,
      leasedByJobId: groqApiKeys.leasedByJobId,
    })
    .from(groqApiKeys)
    .where(eq(groqApiKeys.keyId, candidate.keyId));

  return !row || (row.status === "active" && !row.leasedByJobId);
}

function classifyGroqError(error: unknown): GroqKeyStatus | null {
  const err = error as { status?: number; code?: string; message?: string };
  const message = `${err.message || ""} ${err.code || ""}`.toLowerCase();

  if (err.status === 401 || err.status === 403) return "failed";
  if (err.status !== 429 && !message.includes("rate limit")) return null;

  if (
    message.includes("daily") ||
    message.includes("tokens per day") ||
    message.includes("requests per day") ||
    message.includes("tpd") ||
    message.includes("rpd")
  ) {
    return "exhausted";
  }

  return "cooldown";
}

async function markKey(candidate: KeyCandidate, status: GroqKeyStatus) {
  const now = new Date();
  const cooldownUntil =
    status === "cooldown"
      ? new Date(Date.now() + 60 * 60 * 1000)
      : status === "exhausted"
        ? new Date(Date.now() + 24 * 60 * 60 * 1000)
        : null;

  await db
    .update(groqApiKeys)
    .set({
      status,
      cooldownUntil,
      leasedByJobId: null,
      leasedUntil: null,
      updatedAt: now,
    })
    .where(eq(groqApiKeys.keyId, candidate.keyId));
}

export async function markLeasedKeyLimited(key: LeasedGroqKey, status: GroqKeyStatus) {
  await markKey(key, status);
}

async function clearExpiredLeases(candidates: KeyCandidate[]) {
  for (const candidate of candidates) {
    await ensureKeyRow(candidate);
    await resetIfExpired(candidate);
  }
}

export async function acquireHeavyGroqKeyLease(
  jobId: string
): Promise<LeasedGroqKey | null> {
  const freeKeys = configuredKeysForPool("heavy");
  const paid = paidKey();
  const usePaidFirst = paid.length > 0 && process.env.GROQ_USE_PAID_FIRST !== "false";
  const candidates = usePaidFirst ? [...paid, ...freeKeys] : [...freeKeys, ...paid];

  await clearExpiredLeases(candidates);

  for (const candidate of candidates) {
    if (!(await isAvailable(candidate))) continue;

    const leaseUntil = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const result = await db
      .update(groqApiKeys)
      .set({
        leasedByJobId: jobId,
        leasedUntil: leaseUntil,
        updatedAt: new Date(),
      })
      .where(
        sql`${groqApiKeys.keyId} = ${candidate.keyId}
          and ${groqApiKeys.status} = 'active'
          and (${groqApiKeys.leasedByJobId} is null or ${groqApiKeys.leasedUntil} <= now())`
      )
      .returning({ keyId: groqApiKeys.keyId });

    if (result.length > 0) {
      return { ...candidate, leaseJobId: jobId };
    }
  }

  return null;
}

export async function releaseGroqKeyLease(key?: LeasedGroqKey | null) {
  if (!key) return;

  await db
    .update(groqApiKeys)
    .set({
      leasedByJobId: null,
      leasedUntil: null,
      updatedAt: new Date(),
    })
    .where(
      sql`${groqApiKeys.keyId} = ${key.keyId}
        and ${groqApiKeys.leasedByJobId} = ${key.leaseJobId}`
    );
}

export async function waitForGroqKeyBudget(
  key: LeasedGroqKey,
  model: string,
  estimatedTokens: number
) {
  for (;;) {
    await resetIfExpired(key);

    const [row] = await db
      .select()
      .from(groqApiKeys)
      .where(eq(groqApiKeys.keyId, key.keyId));

    if (!row || row.status !== "active") {
      throw new AllGroqKeysExhaustedError(
        `Groq key ${key.keyId} is not active`,
        await getGroqKeyFailureStats()
      );
    }

    const limits = getGroqModelLimits(model);
    const hasMinuteBudget =
      row.minuteRequestsUsed + 1 <= limits.requestsPerMinute &&
      row.minuteTokensUsed + estimatedTokens <= limits.tokensPerMinute;
    const hasDailyBudget = row.dailyTokensUsed + estimatedTokens <= limits.tokensPerDay;

    if (hasMinuteBudget && hasDailyBudget) return;

    if (!hasDailyBudget) {
      await markKey(key, "exhausted");
      throw new AllGroqKeysExhaustedError(
        `Groq key ${key.keyId} daily budget exhausted`,
        await getGroqKeyFailureStats()
      );
    }

    const waitMs = Math.max(
      1000,
      60_000 - (Date.now() - new Date(row.minuteResetAt).getTime())
    );
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
}

export async function recordGroqKeyRequest(
  keyId: string,
  tokensUsed?: number,
  estimatedTokens?: number
) {
  const tokens = Math.max(0, tokensUsed || estimatedTokens || 0);

  await db
    .update(groqApiKeys)
    .set({
      minuteRequestsUsed: sql`${groqApiKeys.minuteRequestsUsed} + 1`,
      minuteTokensUsed: sql`${groqApiKeys.minuteTokensUsed} + ${tokens}`,
      dailyTokensUsed: sql`${groqApiKeys.dailyTokensUsed} + ${tokens}`,
      updatedAt: new Date(),
    })
    .where(eq(groqApiKeys.keyId, keyId));
}

export async function recordGroqKeyUsage(keyId: string, tokensUsed?: number) {
  if (!tokensUsed || tokensUsed <= 0) return;

  await recordGroqKeyRequest(keyId, tokensUsed);
}

export async function getGroqKeyFailureStats(): Promise<KeyFailureStats> {
  const rows = await db.select().from(groqApiKeys);
  const recoveries = rows
    .map((row) => row.cooldownUntil)
    .filter((value): value is Date => Boolean(value))
    .sort((a, b) => a.getTime() - b.getTime());

  return {
    cooldown: rows.filter((row) => row.status === "cooldown").length,
    exhausted: rows.filter((row) => row.status === "exhausted").length,
    failed: rows.filter((row) => row.status === "failed").length,
    nextRecoveryAt: recoveries[0],
  };
}

async function tryCandidates<T>(
  candidates: KeyCandidate[],
  operation: (apiKey: string, keyId: string) => Promise<T>
) {
  for (const candidate of candidates) {
    if (!(await isAvailable(candidate))) continue;

    try {
      return await operation(candidate.apiKey, candidate.keyId);
    } catch (error) {
      const status = classifyGroqError(error);

      if (!status) {
        throw error;
      }

      await markKey(candidate, status);
    }
  }

  return null;
}

export async function withGroqApiKey<T>(
  pool: GroqKeyPool,
  operation: (apiKey: string, keyId: string) => Promise<T>
): Promise<T> {
  const primary = configuredKeysForPool(pool);
  const paid = paidKey();
  const usePaidFirst = paid.length > 0 && process.env.GROQ_USE_PAID_FIRST !== "false";
  const fallback =
    pool === "light"
      ? configuredKeysForPool("heavy")
      : paid;

  const paidFallback = pool === "light" ? paid : [];
  const candidateGroups = usePaidFirst
    ? [paid, primary, fallback]
    : [primary, fallback, paidFallback];
  const nonEmptyCandidateGroups = candidateGroups.filter((group) => group.length > 0);

  for (const group of nonEmptyCandidateGroups) {
    const result = await tryCandidates(group, operation);
    if (result !== null) return result;
  }

  throw new AllGroqKeysExhaustedError(
    "All configured Groq API keys are unavailable",
    await getGroqKeyFailureStats()
  );
}
