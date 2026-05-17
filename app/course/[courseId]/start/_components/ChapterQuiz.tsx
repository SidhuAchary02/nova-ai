"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuizQuestion } from "@/app/actions/generateQuiz";
import { FaCheckCircle, FaTimesCircle, FaArrowRight } from "react-icons/fa";

type ChapterQuizProps = {
  questions: QuizQuestion[];
  chapterName: string;
  onQuizComplete: (passed: boolean, score: number) => void;
};

const ChapterQuiz = ({ questions, chapterName, onQuizComplete }: ChapterQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerSelect = (optionIndex: number) => {
    if (quizSubmitted) return; // Don't allow changes after submission
    
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const calculateScore = () => {
    let correctCount = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        correctCount++;
      }
    });
    const percentage = Math.round((correctCount / questions.length) * 100);
    return { correctCount, percentage };
  };

  const handleSubmitQuiz = () => {
    const { correctCount, percentage } = calculateScore();
    setScore(percentage);
    setQuizSubmitted(true);
    
    // Pass quiz if 70% or higher
    const passed = percentage >= 70;
    onQuizComplete(passed, percentage);
  };

  const { correctCount, percentage } = calculateScore();
  const passed = percentage >= 70;
  const answeredAll = selectedAnswers.every((ans) => ans !== null);

  return (
    <div className="rounded-[28px] border border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-card shadow-soft p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-nova-primary to-nova-accent"></div>
      <h2 className="mb-2 text-3xl font-bold tracking-tight text-nova-heading flex items-center gap-2">
        <span className="text-nova-primary">🧠</span> Knowledge Check
      </h2>
      <p className="mb-8 text-nova-body text-base">
        Test your understanding of &quot;<span className="font-semibold text-nova-heading">{chapterName}</span>&quot; (5 questions • 70% to pass)
      </p>

      {!quizSubmitted ? (
        <div>
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-nova-body">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm text-nova-body">
                {selectedAnswers.filter((a) => a !== null).length} answered
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-nova-card/10">
              <div
                className="h-2 rounded-full bg-primary transition-all duration-300"
                style={{
                  width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h3 className="mb-6 text-xl font-semibold text-nova-heading">
              {questions[currentQuestion].question}
            </h3>

            {/* Options */}
            <div className="space-y-4">
              {questions[currentQuestion].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  className={`group w-full p-5 text-left rounded-xl border-2 transition-all duration-300 ${
                    selectedAnswers[currentQuestion] === idx
                      ? "border-nova-primary bg-nova-primary/5 shadow-sm dark:shadow-none translate-x-1"
                      : "border-black/5 dark:border-white/10 dark:border-white/5 bg-nova-card hover:border-nova-primary/30 hover:bg-nova-primary/5 hover:shadow-sm dark:shadow-none hover:translate-x-1"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${
                        selectedAnswers[currentQuestion] === idx
                          ? "border-nova-primary bg-nova-primary"
                          : "border-black/20 dark:border-white/20 group-hover:border-nova-primary/50"
                      }`}
                    >
                      {selectedAnswers[currentQuestion] === idx && (
                        <div className="h-2 w-2 rounded-full bg-nova-card shadow-sm dark:shadow-none"></div>
                      )}
                    </div>
                    <span className={`text-base transition-colors ${selectedAnswers[currentQuestion] === idx ? "font-semibold text-nova-primary" : "text-nova-heading"}`}>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              variant="outline"
            >
              Previous
            </Button>

            {currentQuestion < questions.length - 1 ? (
              <Button
                onClick={() =>
                  setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))
                }
                variant="outline"
                className="flex items-center gap-2 border-black/10 dark:border-white/10 dark:border-white/10 bg-nova-card/50 text-nova-heading"
              >
                Next <FaArrowRight size={14} />
              </Button>
            ) : (
              <Button
                onClick={handleSubmitQuiz}
                disabled={!answeredAll}
                className="bg-primary text-white hover:bg-primary/90"
              >
                {answeredAll ? "Submit Quiz" : "Answer All Questions"}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* Results */}
          <div className={`rounded-lg p-8 mb-8 text-center ${
            passed ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          }`}>
            <div className="flex justify-center mb-4">
              {passed ? (
                <FaCheckCircle className="text-green-600" size={64} />
              ) : (
                <FaTimesCircle className="text-red-600" size={64} />
              )}
            </div>

            <h3 className={`text-2xl font-bold mb-2 ${
              passed ? "text-green-700" : "text-red-700"
            }`}>
              {passed ? "Quiz Passed! 🎉" : "Quiz Failed ❌"}
            </h3>

            <p className="mb-2 text-lg text-nova-heading">
              You scored <span className="font-bold text-2xl">{score}%</span>
            </p>

            <p className={`text-sm mb-4 ${passed ? "text-green-600" : "text-red-600"}`}>
              {passed ? (
                <>You&apos;ve passed with {score}% correct! You can now complete this chapter.</>
              ) : (
                <>You need 70% to pass. You got {correctCount} out of {questions.length} correct.</>
              )}
            </p>
          </div>

          {/* Answer Review */}
          <div className="mb-8">
            <h4 className="mb-4 text-lg font-semibold text-nova-heading">Answer Review:</h4>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {questions.map((q, idx) => {
                const isCorrect = selectedAnswers[idx] === q.correctAnswer;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      isCorrect
                        ? "bg-green-50 border-green-200"
                        : "bg-red-500/10 border-red-300/20"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      {isCorrect ? (
                        <FaCheckCircle className="text-green-600 mt-1" />
                      ) : (
                        <FaTimesCircle className="text-red-600 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-nova-heading">{q.question}</p>
                        <p className="mt-2 text-sm text-nova-body">
                          Your answer: <span className="font-semibold">{q.options[selectedAnswers[idx]!]}</span>
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-nova-body">
                            Correct answer: <span className="font-semibold text-green-700">{q.options[q.correctAnswer]}</span>
                          </p>
                        )}
                        <p className="mt-2 text-xs italic text-nova-body">{q.explanation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Retry or Continue */}
          <div className="flex gap-4">
            {!passed && (
              <Button
                onClick={() => {
                  setQuizSubmitted(false);
                  setCurrentQuestion(0);
                  setSelectedAnswers(new Array(questions.length).fill(null));
                }}
                variant="outline"
                className="flex-1 border-black/10 dark:border-white/10 dark:border-white/10 bg-nova-card/50 text-nova-heading"
              >
                Retry Quiz
              </Button>
            )}
            {passed && (
              <Button
                onClick={() => onQuizComplete(true, score)}
                className="flex-1 bg-primary text-white hover:bg-primary/90"
              >
                Continue to Chapter Completion
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterQuiz;
