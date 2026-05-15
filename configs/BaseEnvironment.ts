import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export type Environment = "development" | "production" | "test";

export class BaseEnvironment {
  defaultEnvironmentValues = {
    HOST_URL: "https://nova-ai-pied.vercel.app",
    GOOGLE_GEMINI_API_KEY: "my-api-key",
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    DRIZZLE_DATABASE_URL:
      "postgresql://myuser:mypassword@mydbhost.com/mydatabase",
    YOUTUBE_API_KEY: "my-youtube-api-key",
  };

  get environment(): Environment {
    return (process.env.NODE_ENV as Environment) || "development";
  }

  get HOST_URL(): string {
    return (
      process.env.NEXT_PUBLIC_HOST_URL ||
      this.defaultEnvironmentValues.HOST_URL
    );
  }

  get GOOGLE_GEMINI_API_KEY(): string {
    return (
      process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY ||
      this.defaultEnvironmentValues.GOOGLE_GEMINI_API_KEY
    );
  }

  GROQ_API_KEY =
    process.env.GROQ_API_KEY ??
    this.defaultEnvironmentValues.GROQ_API_KEY;

  get DRIZZLE_DATABASE_URL(): string {
    const url =
      process.env.DATABASE_URL ||
      process.env.DRIZZLE_DATABASE_URL ||
      this.defaultEnvironmentValues.DRIZZLE_DATABASE_URL;

    if (!url) {
      console.error(
        "❌ Missing DATABASE_URL or DRIZZLE_DATABASE_URL in environment"
      );
    }

    return url;
  }

  get YOUTUBE_API_KEY(): string {
    return (
      process.env.NEXT_PUBLIC_YOUTUBE_API_KEY ||
      this.defaultEnvironmentValues.YOUTUBE_API_KEY
    );
  }
}
