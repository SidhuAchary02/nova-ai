export const PREMIUM_USER_EMAILS = [
  "vivek.17332@sakec.ac.in", "anshulc4444@gmail.com", "siddhuachary2005@gmail.com", "vivpakate@gmail.com", "akatevivek@gmail.com",
];

export function normalizeEmail(email?: string | null) {
  return (email || "").trim().toLowerCase();
}

export function isPremiumEmail(email?: string | null) {
  return PREMIUM_USER_EMAILS.includes(normalizeEmail(email));
}
