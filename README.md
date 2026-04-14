# AI Course Generator

A modern, AI-powered platform for creating educational courses. Users can generate complete course structures with AI-generated content, chapters, quizzes, and integrated YouTube videos. Built with Next.js, Supabase, and Groq.

## Features

- **User Authentication**: Email/password and Google OAuth login via Supabase
- **AI-Generated Courses**: Uses Groq to generate complete course structures based on user input
- **Dynamic Course Creation**: Input course name, duration, number of chapters, and AI generates the full curriculum
- **Chapter Content Generation**: Automatic AI-generated content for each chapter
- **Quiz Generation**: AI creates quizzes for each chapter with automatic scoring
- **YouTube Integration**: Automatic YouTube video recommendations for each chapter
- **Course Management**: Create, edit, publish, and delete courses
- **Chapter Tracking**: Mark chapters as complete and track progress
- **Course Publishing**: Publish courses to make them public or keep them private
- **Course Dashboard**: View all your courses and manage them from one place
- **Modern UI**: Built with Shadcn UI components and Tailwind CSS for a polished, responsive interface
- **Real-time Updates**: PostgreSQL database with Drizzle ORM for reliable data management

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI Library**: Shadcn UI, Tailwind CSS
- **Authentication**: Supabase (Email + Google OAuth)
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: Groq API
- **Video API**: YouTube API
- **File Storage**: Firebase Storage
- **Animations**: Framer Motion
- **Deployment**: Vercel

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/SidhuAchary02/nova-ai.git
   cd nova-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following:

   ```bash
   # App Configuration
   NEXT_PUBLIC_HOST_URL="http://localhost:3000"

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

   # PostgreSQL Database
   DATABASE_URL="postgresql://user:password@host:port/database"
   DRIZZLE_DATABASE_URL="postgresql://user:password@host:port/database"

   # AI
   NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY="your-google-gemini-api-key"
   GROQ_API_KEY="your-groq-api-key"

   # Firebase Storage (for course banners and assets)
   NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-firebase-auth-domain"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-firebase-project-id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-firebase-storage-bucket"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your-firebase-app-id"
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="your-measurement-id"

   # YouTube API (for video integration)
   NEXT_PUBLIC_YOUTUBE_API_KEY="your-youtube-api-key"

   ```

4. Set up the database:
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Visit `http://localhost:3000` in your browser

## Environment Variables Guide

### Supabase Setup
- Go to [Supabase Console](https://app.supabase.com)
- Create a new project or use existing one
- Go to Settings → API to find your URL and Anon Key
- Enable Google OAuth in Authentication Settings

### Google Gemini API
- Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
- Create an API key for Gemini

### YouTube API
- Go to [Google Cloud Console](https://console.cloud.google.com)
- Create a new project
- Enable YouTube Data API v3
- Create an API key

### Firebase Setup
- Go to [Firebase Console](https://console.firebase.google.com)
- Create a new project
- Go to Project Settings → General
- Scroll down to find SDK configuration and copy the values

## Project Structure

```
nova-ai/
├── app/
│   ├── actions/          # Server-side actions for AI generation
│   ├── api/              # API routes
│   ├── course/           # Course viewing and learning pages
│   ├── create-course/    # Course creation flow
│   ├── dashboard/        # User dashboard
│   └── (auth)/           # Authentication pages
├── components/
│   ├── auth/            # Login and signup forms
│   ├── ui/              # Reusable Shadcn UI components
│   └── providers/       # Context and state providers
├── configs/             # Configuration files (Supabase, Firebase, etc.)
├── drizzle/             # Database schema and migrations
├── lib/                 # Utility functions
└── public/              # Static assets
```

## Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run db:push    # Push database schema
npm run db:studio  # Open Drizzle Studio
npm run db:generate # Generate database types
```

## Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Support

If you have any questions or need help, please open an issue on GitHub or reach out to the maintainers.
