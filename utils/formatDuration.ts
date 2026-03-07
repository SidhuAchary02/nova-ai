/**
 * Safely converts a duration value (string or object) to a string format
 */
export const formatDuration = (duration: string | { value: number; unit: string } | undefined): string => {
  if (!duration) return "";
  
  if (typeof duration === "string") {
    return duration;
  }
  
  if (typeof duration === "object" && "value" in duration) {
    const { value, unit } = duration;
    return unit ? `${value} ${unit}` : String(value);
  }
  
  return "";
};
