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
    normalized.courseDetails?.chapters,
    normalized.courseDetails?.chapterDetails,
    
    // Nested under course
    normalized.course?.chapterDetails, // course.chapterDetails
    normalized.course?.details?.chapters,
    normalized.course?.details?.chapter,
    normalized.course?.chapters,      // course.chapters (if array)
    normalized.course?.courseDetails?.chapters,
    normalized.course?.courseDetails?.chapterDetails,
    
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

  const possibleTopics = [
    // Existing/common formats
    normalized.course?.details?.topic,
    normalized.course?.fieldName,
    normalized.course?.topic,
    normalized.topic,

    // Newer/alternate formats
    normalized.courseDetails?.topic,
    normalized.courseDetails?.fieldName,
    normalized.course?.courseDetails?.topic,
    normalized.course?.courseDetails?.fieldName,
    normalized.fieldName,
    normalized.courseTitle,
    normalized.title,
    normalized.course?.title,
    normalized.course?.name,
    normalized.name,
  ];

  for (const value of possibleTopics) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "Untitled Course";
}

/**
 * Extracts description from various schema structures
 */
function extractDescription(data: any): string {
  if (!data) return "";

  const normalized = convertKeysToCamelCase(data);

  const possibleDescriptions = [
    normalized.course?.description,
    normalized.course?.details?.description,
    normalized.description,

    // Newer/alternate formats
    normalized.courseDetails?.description,
    normalized.course?.courseDetails?.description,
    normalized.summary,
    normalized.about,
    normalized.course?.summary,
  ];

  for (const value of possibleDescriptions) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
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
  // Try root courseDetails.duration
  else if (normalized.courseDetails?.duration) {
    rawDuration = normalized.courseDetails.duration;
  }
  // Try nested course.courseDetails.duration
  else if (normalized.course?.courseDetails?.duration) {
    rawDuration = normalized.course.courseDetails.duration;
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
      subtopics: [],
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
    subtopics: Array.isArray(chapter.subtopics) ? chapter.subtopics : [],
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