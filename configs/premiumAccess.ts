/**
 * Per-user premium course limits.
 * Add more premium users here as: normalized email -> allowed total course count.
 */
export const PREMIUM_USER_COURSE_LIMITS: Record<string, number> = {
  "vivek.17332@sakec.ac.in": 15,
  "anshulc4444@gmail.com": 20,
  "siddhuachary2005@gmail.com": 10,
  "vivpakate@gmail.com": 5,
  "akatevivek@gmail.com": 5,
  "daroro9215@okcpress.com": 5,
  "recafo5430@gzeos.com": 5,

};

export function normalizeEmail(email?: string | null) {
  return (email || "").trim().toLowerCase();
}

export function isPremiumEmail(email?: string | null) {
  return getPremiumCourseLimit(email) !== undefined;
}

export function getPremiumCourseLimit(email?: string | null): number | undefined {
  const normalized = normalizeEmail(email);
  return PREMIUM_USER_COURSE_LIMITS[normalized];
}
