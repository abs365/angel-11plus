"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ClipboardList,
  Timer,
  CheckCircle,
  XCircle,
  Star,
  AlertCircle,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { englishLessons } from "@/data/lessons";
import { mathsQuestions } from "@/data/maths";
import { completeLesson, recordSkillResult } from "@/lib/progress";

type TestState = "intro" | "english" | "maths" | "results";

const ENGLISH_TIME = 20 * 60; // 20 minutes
const MATHS_TIME = 25 * 60;   // 25 minutes

const mockEnglishLesson = englishLessons[0];
const mockMathsQuestions = mathsQuestions.filter((q) => q.id !== "mth-007").slice(0, 6);

export default function MockTestPage() {
  const [testState, setTestState] = useState<TestState>("intro");
  const [timeLeft, setTimeLeft] = useState(0);
  const [englishAnswers, setEnglishAnswers] = useState<Record<string, string>>({});
  const [mathsAnswers, setMathsAnswers] = useState<Record<string, string>>({});
  const [mathsChecked, setMathsChecked] = useState<Record<string, boolean>>({});
  const [englishScore, setEnglishScore] = useState(0);
  const [mathsScore, setMathsScore] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const finishMaths = useCallback(() => {
    stopTimer();
    const correct = Object.values(mathsChecked).filter(Boolean).length;
    const pct = Math.round((correct / mockMathsQuestions.length) * 100);
    setMathsScore(pct);
    setTestState("results");
  }, [stopTimer, mathsChecked]);

  const finishEnglish = useCallback(() => {
    stopTimer();
    const answered = mockEnglishLesson.questions.filter(
      (q) => (englishAnswers[q.id] ?? "").trim().length > 0
    ).length;
    const pct = Math.round((answered / mockEnglishLesson.questions.length) * 100);
    setEnglishScore(pct);
    setTestState("maths");
    setTimeLeft(MATHS_TIME);
  }, [stopTimer, englishAnswers]);

  useEffect(() => {
    if (testState === "english") setTimeLeft(ENGLISH_TIME);
    if (testState === "maths") setTimeLeft(MATHS_TIME);
  }, [testState]);

  useEffect(() => {
    if (testState !== "english" && testState !== "maths") return;
    stopTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (testState === "english") finishEnglish();
          else finishMaths();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => stopTimer();
  }, [testState, finishEnglish, finishMaths, stopTimer]);

  useEffect(() => {
    if (testState === "results") {
      const xp = Math.round((englishScore + mathsScore) / 2 / 10) * 10 + 30;
      setTotalXP(xp);
      completeLesson("mock-test", Math.round((englishScore + mathsScore) / 2), xp);
    }
  }, [testState, englishScore, mathsScore]);

  function checkMathsAnswer(qId: string, answer: string) {
    const q = mockMathsQuestions.find((q) => q.id === qId);
    if (!q) return;
    const correct =
      answer.trim().toLowerCase() === String(q.answer).toLowerCase() ||
      answer.trim().replace(/\s/g, "") === String(q.answer).toLowerCase().replace(/\s/g, "");
    setMathsChecked((prev) => ({ ...prev, [qId]: correct }));
    recordSkillResult(q.skill, correct);
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const timeWarning = timeLeft < 5 * 60 && timeLeft > 0;

  if (testState === "intro") {
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto px-4 py-8 md:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-pink-100 p-2.5 rounded-xl">
              <ClipboardList size={22} className="text-pink-600" />
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-2xl">Mock Test</h1>
              <p className="text-gray-400 text-sm">Full 11+ practice exam</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-5">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="text-gray-800 font-semibold">Exam Structure</h2>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded-lg shrink-0">
                  <ClipboardList size={16} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-800 font-medium text-sm">Section 1 — English Comprehension</p>
                  <p className="text-gray-400 text-sm">Passage + {mockEnglishLesson.questions.length} inference questions · 20 minutes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg shrink-0">
                  <ClipboardList size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-800 font-medium text-sm">Section 2 — Maths Reasoning</p>
                  <p className="text-gray-400 text-sm">{mockMathsQuestions.length} problem-solving questions · 25 minutes</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 flex gap-2.5">
            <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 font-medium text-sm mb-1">Before you start</p>
              <ul className="text-amber-700 text-sm space-y-1 list-disc list-inside">
                <li>Find a quiet space — no distractions</li>
                <li>No calculator for maths</li>
                <li>The timer will auto-advance between sections</li>
                <li>Total time: 45 minutes</li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => setTestState("english")}
            className="w-full bg-pink-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-pink-700 transition-colors"
          >
            Start Mock Test
          </button>
        </div>
      </PageLayout>
    );
  }

  if (testState === "results") {
    const overall = Math.round((englishScore + mathsScore) / 2);
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto px-4 py-12 md:px-8 text-center">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              overall >= 70 ? "bg-green-100" : overall >= 50 ? "bg-amber-100" : "bg-red-100"
            }`}
          >
            {overall >= 70 ? (
              <CheckCircle size={32} className="text-green-600" />
            ) : (
              <ClipboardList size={32} className="text-amber-600" />
            )}
          </div>
          <h1 className="text-gray-900 font-bold text-2xl mb-2">Mock Test Complete!</h1>
          <p className="text-gray-500 mb-1">Overall score: {overall}%</p>
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-4 py-2 rounded-full font-semibold mb-8">
            <Star size={16} className="text-pink-500" />
            +{totalXP} XP earned
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">
                English
              </p>
              <p
                className={`text-4xl font-bold ${
                  englishScore >= 70 ? "text-green-600" : englishScore >= 50 ? "text-amber-500" : "text-red-500"
                }`}
              >
                {englishScore}%
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">
                Maths
              </p>
              <p
                className={`text-4xl font-bold ${
                  mathsScore >= 70 ? "text-green-600" : mathsScore >= 50 ? "text-amber-500" : "text-red-500"
                }`}
              >
                {mathsScore}%
              </p>
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 text-left mb-6">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">
              Feedback
            </p>
            {overall >= 80 && (
              <p className="text-gray-700 text-sm">Excellent performance — you are working at a high 11+ standard. Keep pushing for consistency.</p>
            )}
            {overall >= 60 && overall < 80 && (
              <p className="text-gray-700 text-sm">Good solid performance. Focus on the weaker section — review model answers and practise more in that area.</p>
            )}
            {overall < 60 && (
              <p className="text-gray-700 text-sm">This is a learning experience. Review the model answers, identify the gaps, and work through the subject modules before your next mock.</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setTestState("intro");
                setEnglishAnswers({});
                setMathsAnswers({});
                setMathsChecked({});
              }}
              className="flex-1 bg-pink-600 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-pink-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = "/progress"}
              className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-3.5 font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              View Progress
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (testState === "english") {
    const answered = mockEnglishLesson.questions.filter(
      (q) => (englishAnswers[q.id] ?? "").trim().length > 0
    ).length;

    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto px-4 py-6 md:px-8">
          {/* Timer bar */}
          <div className="flex items-center justify-between mb-4 bg-white rounded-xl px-4 py-2.5 border border-gray-100">
            <p className="text-gray-600 text-sm font-medium">Section 1 — English</p>
            <div className={`flex items-center gap-1.5 font-bold text-sm px-3 py-1 rounded-full ${
              timeWarning ? "bg-red-100 text-red-600" : "bg-purple-100 text-purple-700"
            }`}>
              <Timer size={14} />
              {formatTime(timeLeft)}
            </div>
            <p className="text-gray-400 text-sm">{answered}/{mockEnglishLesson.questions.length} answered</p>
          </div>

          {/* Passage */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">Passage</p>
            {mockEnglishLesson.passage?.split("\n\n").map((para, i) => (
              <p key={i} className="text-gray-800 text-[15px] leading-[1.8] mb-3 last:mb-0">{para}</p>
            ))}
          </div>

          {/* Questions */}
          <div className="flex flex-col gap-4 mb-5">
            {mockEnglishLesson.questions.map((q, i) => (
              <div key={q.id} className="bg-white rounded-2xl p-5 border border-gray-100">
                <p className="text-xs text-gray-400 mb-2">
                  Q{i + 1} · {q.marks} mark{q.marks !== 1 ? "s" : ""}
                </p>
                <p className="text-gray-800 font-medium text-sm mb-3">{q.question}</p>
                <textarea
                  value={englishAnswers[q.id] ?? ""}
                  onChange={(e) =>
                    setEnglishAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                  placeholder="Write your answer..."
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            ))}
          </div>

          <button
            onClick={finishEnglish}
            className="w-full bg-purple-600 text-white rounded-xl py-4 font-semibold hover:bg-purple-700 transition-colors"
          >
            Submit English → Continue to Maths
          </button>
        </div>
      </PageLayout>
    );
  }

  if (testState === "maths") {
    const answeredCount = Object.keys(mathsAnswers).filter((k) => mathsAnswers[k]?.trim()).length;

    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto px-4 py-6 md:px-8">
          {/* Timer bar */}
          <div className="flex items-center justify-between mb-4 bg-white rounded-xl px-4 py-2.5 border border-gray-100">
            <p className="text-gray-600 text-sm font-medium">Section 2 — Maths</p>
            <div className={`flex items-center gap-1.5 font-bold text-sm px-3 py-1 rounded-full ${
              timeWarning ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-700"
            }`}>
              <Timer size={14} />
              {formatTime(timeLeft)}
            </div>
            <p className="text-gray-400 text-sm">{answeredCount}/{mockMathsQuestions.length} answered</p>
          </div>

          <div className="flex flex-col gap-4 mb-5">
            {mockMathsQuestions.map((q, i) => {
              const isChecked = mathsChecked[q.id] !== undefined;
              const isCorrect = mathsChecked[q.id] === true;
              return (
                <div key={q.id} className={`bg-white rounded-2xl p-5 border transition-colors ${
                  isChecked
                    ? isCorrect ? "border-green-200 bg-green-50" : "border-red-100 bg-red-50"
                    : "border-gray-100"
                }`}>
                  <p className="text-xs text-gray-400 mb-2">Q{i + 1} · {q.marks} mark{q.marks !== 1 ? "s" : ""}</p>
                  <p className="text-gray-800 font-medium text-sm mb-3">{q.question}</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mathsAnswers[q.id] ?? ""}
                      onChange={(e) => {
                        if (!isChecked)
                          setMathsAnswers((prev) => ({ ...prev, [q.id]: e.target.value }));
                      }}
                      disabled={isChecked}
                      placeholder="Answer..."
                      className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                        isChecked
                          ? isCorrect
                            ? "bg-green-100 border border-green-300 text-green-700"
                            : "bg-red-100 border border-red-200 text-red-700"
                          : "bg-gray-50 border border-gray-200 focus:ring-blue-400"
                      }`}
                    />
                    {!isChecked && (
                      <button
                        onClick={() => checkMathsAnswer(q.id, mathsAnswers[q.id] ?? "")}
                        disabled={!mathsAnswers[q.id]?.trim()}
                        className="bg-blue-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors"
                      >
                        Check
                      </button>
                    )}
                    {isChecked && (
                      isCorrect
                        ? <CheckCircle size={20} className="text-green-500 mt-2 shrink-0" />
                        : <XCircle size={20} className="text-red-400 mt-2 shrink-0" />
                    )}
                  </div>
                  {isChecked && !isCorrect && (
                    <p className="text-red-500 text-xs mt-2">Answer: {q.answer}</p>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={finishMaths}
            className="w-full bg-blue-600 text-white rounded-xl py-4 font-semibold hover:bg-blue-700 transition-colors"
          >
            Finish Test → See Results
          </button>
        </div>
      </PageLayout>
    );
  }

  return null;
}
