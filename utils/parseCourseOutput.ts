/**
 * Normalizes snake_case to camelCase
 */
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

/**
 * Recursively converts all keys from snake_case to camelCase
 */
function convertKeysToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase);
  }

  if (obj !== null && typeof obj === "object") {
    const camelCaseObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelKey = toCamelCase(key);
        camelCaseObj[camelKey] = convertKeysToCamelCase(obj[key]);
      }
    }
    return camelCaseObj;
  }

  return obj;
}

/**
 * Extracts chapters from various schema structures
 * Handles 5+ different AI response formats
 */
function extractChapters(data: any): any[] {
  if (!data) return [];

  // Normalize to camelCase first
  const normalized = convertKeysToCamelCase(data);

  // Try ALL possible locations for chapter arrays (in priority order)
  const possibleLocations = [
    // Root level variations
    normalized.chapterDetails,        // Root: chapterDetails
    normalized.chapters,              // Root: chapters (if it's an array)
    
    // Nested under course
    normalized.course?.chapterDetails, // course.chapterDetails
    normalized.course?.details?.chapters,
    normalized.course?.details?.chapter,
    normalized.course?.chapters,      // course.chapters (if array)
    
    // Alternative nested structures
    normalized.courseData?.chapters,
    normalized.courseData?.chapterDetails,
    normalized.data?.chapters,
    normalized.data?.chapterDetails,
    
    // Direct array at root
    Array.isArray(normalized) ? normalized : null,
  ];

  // Return the first valid array found
  for (const location of possibleLocations) {
    if (Array.isArray(location)) {
      return location;
    }
  }

  return [];
}

/**
 * Extracts topic from various schema structures
 */
function extractTopic(data: any): string {
  if (!data) return "Untitled Course";

  const normalized = convertKeysToCamelCase(data);

  // Try course.details.topic first (Schema 1)
  if (normalized.course?.details?.topic) {
    return normalized.course.details.topic;
  }

  // Try course.fieldName (Schema 1 - AI fallback)
  if (normalized.course?.fieldName) {
    return normalized.course.fieldName;
  }

  // Try course.topic (Schema 2)
  if (normalized.course?.topic) {
    return normalized.course.topic;
  }

  // Try root level topic (Schema 3)
  if (normalized.topic) {
    return normalized.topic;
  }

  return "Untitled Course";
}

/**
 * Extracts description from various schema structures
 */
function extractDescription(data: any): string {
  if (!data) return "";

  const normalized = convertKeysToCamelCase(data);

  // Try course.description
  if (normalized.course?.description) {
    return normalized.course.description;
  }

  // Try root level description
  if (normalized.description) {
    return normalized.description;
  }

  return "";
}

/**
 * Extracts duration from various schema structures
 */
function extractDuration(data: any): string {
  if (!data) return "";

  const normalized = convertKeysToCamelCase(data);

  let rawDuration;

  // Try course.details.duration
  if (normalized.course?.details?.duration) {
    rawDuration = normalized.course.details.duration;
  }
  // Try course.duration
  else if (normalized.course?.duration) {
    rawDuration = normalized.course.duration;
  }
  // Try root level duration
  else if (normalized.duration) {
    rawDuration = normalized.duration;
  }
  else {
    return "";
  }

  // Normalize the duration (handle objects)
  return normalizeDuration(rawDuration);
}

/**
 * Converts a duration value (string or object) to a string format
 */
function normalizeDuration(duration: any): string {
  if (!duration) return "";
  
  // If it's already a string, return as-is
  if (typeof duration === "string") return duration;
  
  // If it's an object with value and unit, combine them
  if (typeof duration === "object" && duration.value !== undefined) {
    const value = duration.value;
    const unit = duration.unit || "";
    return unit ? `${value} ${unit}` : String(value);
  }
  
  // Fallback to string conversion
  return String(duration);
}

/**
 * Normalizes a single chapter to have correct camelCase field names
 */
function normalizeChapter(chapter: any): any {
  if (!chapter) {
    return {
      chapterName: "Untitled Chapter",
      description: "",
      duration: "",
    };
  }

  const rawDuration = 
    chapter.duration || 
    chapter.chapterDuration || 
    chapter.chapter_duration || 
    "";

  return {
    chapterName: 
      chapter.chapterName || 
      chapter.chapter_name || 
      chapter.name || 
      "Untitled Chapter",
    description: 
      chapter.description || 
      chapter.chapterDescription || 
      chapter.chapter_description || 
      "",
    duration: normalizeDuration(rawDuration),
  };
}

export const parseCourseOutput = (courseOutput: any) => {
  try {
    // Parse if string
    const parsed =
      typeof courseOutput === "string"
        ? JSON.parse(courseOutput)
        : courseOutput;

    if (!parsed) {
      return {
        topic: "Untitled Course",
        description: "",
        duration: "",
        chapters: [],
      };
    }

    // Extract data from various schema formats
    const topic = extractTopic(parsed);
    const description = extractDescription(parsed);
    const duration = extractDuration(parsed);
    const rawChapters = extractChapters(parsed);

    // Normalize all chapters to camelCase
    const chapters = Array.isArray(rawChapters)
      ? rawChapters.map(normalizeChapter)
      : [];

    return {
      topic: topic || "Untitled Course",
      description: description || "",
      duration: duration || "",
      chapters: chapters,
    };
  } catch (error) {
    console.error("Failed to parse courseOutput:", error);

    return {
      topic: "Untitled Course",
      description: "",
      duration: "",
      chapters: [],
    };
  }
};