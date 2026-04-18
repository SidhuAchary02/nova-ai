/** Hardcoded autocomplete + category presets (no backend). */

export const INTENT_AUTOCOMPLETE_SUGGESTIONS = [
  "React for frontend jobs",
  "Data Structures for placements",
  "Machine Learning basics",
  "UI/UX design from scratch",
  "Python for beginners",
] as const;

/** When user picks a category chip, we suggest a matching starter sentence. */
export const CATEGORY_INTENT_PRESETS: Record<string, string> = {
  "Web Development": "React for frontend jobs",
  "Data Science": "Python for data science and analytics projects",
  "AI/ML": "Machine Learning basics",
  "UI/UX": "UI/UX design from scratch",
};

export function filterIntentSuggestions(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return INTENT_AUTOCOMPLETE_SUGGESTIONS.filter((s) =>
    s.toLowerCase().includes(q)
  ).slice(0, 8);
}
