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
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Chapter Quiz</h2>
      <p className="text-gray-600 mb-8">
        Test your understanding of "{chapterName}" (5 questions • 70% to pass)
      </p>

      {!quizSubmitted ? (
        <div>
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm text-gray-500">
                {selectedAnswers.filter((a) => a !== null).length} answered
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {questions[currentQuestion].question}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    selectedAnswers[currentQuestion] === idx
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        selectedAnswers[currentQuestion] === idx
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedAnswers[currentQuestion] === idx && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="text-gray-800">{option}</span>
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
                className="flex items-center gap-2"
              >
                Next <FaArrowRight size={14} />
              </Button>
            ) : (
              <Button
                onClick={handleSubmitQuiz}
                disabled={!answeredAll}
                className="bg-green-600 hover:bg-green-700 text-white"
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

            <p className="text-lg text-gray-700 mb-2">
              You scored <span className="font-bold text-2xl">{score}%</span>
            </p>

            <p className={`text-sm mb-4 ${passed ? "text-green-600" : "text-red-600"}`}>
              {passed ? (
                <>You've passed with {score}% correct! You can now complete this chapter.</>
              ) : (
                <>You need 70% to pass. You got {correctCount} out of {questions.length} correct.</>
              )}
            </p>
          </div>

          {/* Answer Review */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Answer Review:</h4>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {questions.map((q, idx) => {
                const isCorrect = selectedAnswers[idx] === q.correctAnswer;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      isCorrect
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      {isCorrect ? (
                        <FaCheckCircle className="text-green-600 mt-1" />
                      ) : (
                        <FaTimesCircle className="text-red-600 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{q.question}</p>
                        <p className="text-sm text-gray-600 mt-2">
                          Your answer: <span className="font-semibold">{q.options[selectedAnswers[idx]!]}</span>
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-gray-600">
                            Correct answer: <span className="font-semibold text-green-700">{q.options[q.correctAnswer]}</span>
                          </p>
                        )}
                        <p className="text-xs text-gray-600 mt-2 italic">{q.explanation}</p>
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
                className="flex-1"
              >
                Retry Quiz
              </Button>
            )}
            {passed && (
              <Button
                onClick={() => onQuizComplete(true, score)}
                className="flex-1 bg-green-600 hover:bg-green-700"
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
