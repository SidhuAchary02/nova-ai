const ACRONYM_EXPANSIONS: Record<string, string> = {
  ai: "Artificial Intelligence",
  dsa: "Data Structures and Algorithms",
  llm: "Large Language Models",
  llms: "Large Language Models",
  ml: "Machine Learning",
  nlp: "Natural Language Processing",
  rag: "Retrieval-Augmented Generation",
  ui: "User Interface",
  ux: "User Experience",
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "basics",
  "beginner",
  "beginners",
  "course",
  "for",
  "from",
  "guide",
  "in",
  "learn",
  "learning",
  "master",
  "mastering",
  "of",
  "on",
  "roadmap",
  "the",
  "to",
  "with",
]);

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function titleCaseWord(word: string): string {
  const lower = word.toLowerCase();
  if (ACRONYM_EXPANSIONS[lower]) {
    return lower === "llms" ? "LLMs" : lower.toUpperCase();
  }
  if (word.length <= 2 && word === word.toUpperCase()) return word;
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function toTitleCase(value: string): string {
  return collapseWhitespace(value)
    .split(" ")
    .map((word) => {
      const parts = word.split(/([/-])/);
      return parts.map((part) => (/^[/-]$/.test(part) ? part : titleCaseWord(part))).join("");
    })
    .join(" ");
}

export function buildTopicSuggestions(input: string, baseSuggestions: string[]): string[] {
  const typed = collapseWhitespace(input);
  const typedLower = typed.toLowerCase();
  const results: string[] = [];

  const add = (value: string) => {
    const clean = collapseWhitespace(value);
    if (!clean) return;
    if (results.some((item) => item.toLowerCase() === clean.toLowerCase())) return;
    results.push(clean);
  };

  if (!typed) {
    baseSuggestions.slice(0, 4).forEach(add);
    return results;
  }

  if (/\brag\b/i.test(typed) && /\bllm?s?\b/i.test(typed)) {
    add("Retrieval-Augmented Generation");
    add("RAG with LLMs");
    add("Building AI RAG Systems");
  } else if (/\brag\b/i.test(typed)) {
    add("Retrieval-Augmented Generation");
    add("Building RAG Applications");
    add("RAG Systems with Vector Databases");
  } else if (/\bllm?s?\b/i.test(typed)) {
    add("Large Language Models");
    add("Building Applications with LLMs");
  } else if (/\bdsa\b/i.test(typed)) {
    add("Data Structures and Algorithms");
    add("DSA for Placements");
  } else if (/\bui\s*\/?\s*ux\b/i.test(typed)) {
    add("UI/UX Design");
    add("Product Design Portfolio");
  }

  add(typed);

  baseSuggestions
    .filter((item) => item.toLowerCase().includes(typedLower))
    .forEach(add);

  return results.slice(0, 5);
}

export function generateCourseTitle(topic: string): string {
  const clean = collapseWhitespace(topic) || "My Course";

  if (/\brag\b/i.test(clean) && /\bllm?s?\b/i.test(clean)) return "Advanced RAG Systems";
  if (/\bretrieval[-\s]?augmented generation\b/i.test(clean)) return "Advanced RAG Systems";
  if (/\bdsa\b/i.test(clean) && /\bplacement/i.test(clean)) return "DSA for Placements";
  if (/\breact\b/i.test(clean) && /\b(beginner|basic|scratch)\b/i.test(clean)) return "React for Beginners";
  if (/\bfull\s*stack\b/i.test(clean) && /\brag\b/i.test(clean)) return "Full Stack RAG Development";
  if (/\bui\s*\/?\s*ux\b/i.test(clean)) return "UI/UX Portfolio Design";

  const expandedWords = clean
    .split(/\s+/)
    .map((word) => ACRONYM_EXPANSIONS[word.toLowerCase()] ?? word)
    .join(" ")
    .split(/\s+/);

  const words = expandedWords.filter((word, index) => {
    const normalized = word.toLowerCase().replace(/[^a-z0-9]/g, "");
    return index === 0 || !STOP_WORDS.has(normalized);
  });

  const title = toTitleCase(words.slice(0, 7).join(" "));
  return title || toTitleCase(clean).split(" ").slice(0, 7).join(" ");
}

export function buildDetailedPrompt(topic: string): string {
  const clean = collapseWhitespace(topic);
  if (!clean) return "";

  if (/\brag\b/i.test(clean) || /\bretrieval[-\s]?augmented generation\b/i.test(clean)) {
    return "Create a complete course on Retrieval-Augmented Generation (RAG) with LLMs including fundamentals, vector databases, embeddings, chunking, retrieval pipelines, LangChain, practical projects, optimization techniques, and deployment.";
  }

  if (/\bllm?s?\b/i.test(clean)) {
    return "Create a complete course on Large Language Models including transformer fundamentals, prompt engineering, fine-tuning concepts, RAG, tool use, evaluation, practical applications, safety considerations, and deployment.";
  }

  if (/\bdsa\b/i.test(clean) || /data structures/i.test(clean)) {
    return `Create a complete course on ${generateCourseTitle(clean)} including core data structures, algorithms, problem-solving patterns, complexity analysis, interview-style practice, timed revision, and practical coding exercises.`;
  }

  if (/\breact\b/i.test(clean)) {
    return `Create a complete course on ${generateCourseTitle(clean)} including components, hooks, state management, routing, API integration, performance, testing, real-world projects, and deployment.`;
  }

  return `Create a complete course on ${clean} including fundamentals, key concepts, practical examples, hands-on projects, common mistakes, best practices, advanced techniques, and real-world applications.`;
}
