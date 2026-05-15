"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { FaSpinner } from "react-icons/fa6";

const ROADMAP_MESSAGES = [
  "Analyzing your goals...",
  "Understanding your current level...",
  "Designing your learning path...",
  "Optimizing timeline for best results...",
  "Creating structured roadmap...",
  "Almost ready...",
];

const COURSE_MESSAGES = [
  "Designing your personalized curriculum...",
  "Generating chapter content...",
  "Finding high-quality learning resources...",
  "Structuring quizzes and exercises...",
  "Preparing your learning workspace...",
  "Finalizing your AI course...",
];

const LoadingDialog = ({ loading, variant = "roadmap" }: { loading: boolean; variant?: "roadmap" | "course" }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = variant === "course" ? COURSE_MESSAGES : ROADMAP_MESSAGES;

  useEffect(() => {
    if (!loading) {
      setMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, variant === "course" ? 1800 : 1500);

    return () => clearInterval(interval);
  }, [loading, messages.length, variant]);

  return (
    <AlertDialog open={loading}>
      <AlertDialogContent className="border-black/5 bg-white/95 max-w-md overflow-hidden">
        <AlertDialogHeader className="flex flex-col items-center p-8 space-y-6">
          <AlertDialogTitle className="text-center text-nova-heading sr-only">
            {variant === "course" ? "Creating your course" : "Generating roadmap"}
          </AlertDialogTitle>
          <AlertDialogDescription className="flex flex-col items-center space-y-8 w-full">
            <div className="relative flex h-20 w-20 items-center justify-center">
              {variant === "course" ? (
                <>
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-75"></div>
                  <div className="absolute inset-2 rounded-full border-2 border-primary/50 animate-pulse"></div>
                  <div className="absolute inset-4 rounded-full border-t-2 border-primary animate-spin"></div>
                  <div className="h-6 w-6 bg-primary rounded-sm animate-bounce" style={{ animationDuration: '2s' }}></div>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 rounded-full border-t-2 border-primary border-r-2 border-transparent animate-spin"></div>
                  <div className="absolute inset-2 rounded-full border-b-2 border-primary/50 border-l-2 border-transparent animate-spin-reverse"></div>
                  <FaSpinner className="h-6 w-6 text-primary animate-spin" />
                </>
              )}
            </div>
            
            <div className="w-full space-y-4">
              <div className="h-8 flex items-center justify-center">
                <p className="text-base font-medium text-nova-heading animate-fade-in-out transition-all duration-300 text-center">
                  {messages[messageIndex]}
                </p>
              </div>
              
              {variant === "course" && (
                <div className="w-full bg-gray-50 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all ease-linear"
                    style={{ 
                      width: `${Math.min(100, ((messageIndex + 1) / messages.length) * 100)}%`,
                      transitionDuration: '1800ms'
                    }}
                  ></div>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LoadingDialog;
