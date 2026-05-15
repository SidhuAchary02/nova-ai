import { BaseEnvironment } from "./BaseEnvironment";
import axios from "axios";

const env = new BaseEnvironment();

const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3/search";
const YOUTUBE_VIDEOS_BASE_URL = "https://www.googleapis.com/youtube/v3/videos";
const MIN_VIDEO_DURATION_SECONDS = 10 * 60;
const MIN_VIDEO_VIEWS = 10_000;

function parseIsoDurationToSeconds(duration: string) {
  const matches = duration.match(
    /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/
  );

  if (!matches) return 0;

  const hours = Number(matches[1] || 0);
  const minutes = Number(matches[2] || 0);
  const seconds = Number(matches[3] || 0);

  return hours * 3600 + minutes * 60 + seconds;
}

export const getYoutubeVideos = async (query: string) => {
  try {
    const param = {
      part: "snippet",
      q: query,
      maxResults: 10,
      type: "video",
      key: env.YOUTUBE_API_KEY,
      videoEmbeddable: "true", // Only return embeddable videos
      order: "viewCount",
    };

    const response = await axios.get(YOUTUBE_BASE_URL, { params: param });
    
    if (!response.data.items || response.data.items.length === 0) {
      console.warn(`No YouTube videos found for query: ${query}`);
      return null;
    }

    const searchItems = response.data.items;
    const videoIds = searchItems
      .map((item: any) => item?.id?.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) {
      console.warn(`No YouTube video ids found for query: ${query}`);
      return null;
    }

    const detailsResponse = await axios.get(YOUTUBE_VIDEOS_BASE_URL, {
      params: {
        part: "contentDetails,statistics",
        id: videoIds.join(","),
        key: env.YOUTUBE_API_KEY,
      },
    });

    const detailsById = new Map(
      (detailsResponse.data.items || []).map((item: any) => [item.id, item])
    );

    const filteredItems = searchItems
      .map((item: any) => {
        const videoId = item?.id?.videoId;
        const details = videoId ? detailsById.get(videoId) : null;

        if (!details) return null;

        const durationSeconds = parseIsoDurationToSeconds(
          details.contentDetails?.duration || ""
        );
        const viewCount = Number(details.statistics?.viewCount || 0);

        if (
          durationSeconds < MIN_VIDEO_DURATION_SECONDS ||
          viewCount < MIN_VIDEO_VIEWS
        ) {
          return null;
        }

        return {
          ...item,
          _videoMeta: {
            durationSeconds,
            viewCount,
          },
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => {
        const viewDiff = (b._videoMeta?.viewCount || 0) - (a._videoMeta?.viewCount || 0);
        if (viewDiff !== 0) return viewDiff;

        return (b._videoMeta?.durationSeconds || 0) - (a._videoMeta?.durationSeconds || 0);
      });

    if (filteredItems.length === 0) {
      console.warn(
        `No YouTube videos matched the minimum filters for query: ${query}`
      );
      return null;
    }

    const topVideo = filteredItems[0];
    console.log("YouTube API filtered top result:", topVideo);
    return topVideo;
  } catch (error) {
    console.error("YouTube API Error:", error);
    return null;
  }
};
