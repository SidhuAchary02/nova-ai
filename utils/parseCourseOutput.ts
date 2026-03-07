export const parseCourseOutput = (courseOutput: any) => {
  try {
    const parsed =
      typeof courseOutput === "string"
        ? JSON.parse(courseOutput)
        : courseOutput;

    if (!parsed?.course) {
      return {
        topic: "Untitled Course",
        duration: "",
        chapters: []
      };
    }

    const details = parsed.course.details;

    return {
      topic: details?.topic || parsed.course.field_name || "Untitled Course",
      description: parsed.course.description || "",
      duration: details?.duration || "",
      chapters: details?.chapter || []
    };

  } catch (error) {
    console.error("Failed to parse courseOutput:", error);

    return {
      topic: "Untitled Course",
      duration: "",
      chapters: []
    };
  }
};