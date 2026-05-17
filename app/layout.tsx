import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import SupabaseProvider from "@/components/providers/SupabaseProvider";
const inter = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UpSkill AI Agent",
  description:
    "Learn any skill with UpSkillAI, the AI learning agent that generates personalized roadmaps, AI-powered courses, quizzes, coding practice, and adaptive learning experiences based on your goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
