import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import SupabaseProvider from "@/components/providers/SupabaseProvider";
const inter = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nova AI Course Studio",
  description:
    "Nova AI Course Studio helps you create and publish high-quality courses with AI generated outlines, chapter content, quizzes, and curated videos.",
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
