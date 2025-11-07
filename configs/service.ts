import { BaseEnvironment } from "./BaseEnvironment";
import axios from "axios";

const env = new BaseEnvironment();

const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3/search";

export const getYoutubeVideos = async (query: string) => {
  try {
    const param = {
      part: "snippet",
      q: query,
      maxResults: 1,
      type: "video",
      key: env.YOUTUBE_API_KEY,
      videoEmbeddable: "true", // Only return embeddable videos
    };

    const response = await axios.get(YOUTUBE_BASE_URL, { params: param });
    
    if (!response.data.items || response.data.items.length === 0) {
      console.warn(`No YouTube videos found for query: ${query}`);
      return [];
    }
    
    console.log("YouTube API Response:", response.data.items[0]);
    return response.data.items;
  } catch (error) {
    console.error("YouTube API Error:", error);
    return [];
  }
};
