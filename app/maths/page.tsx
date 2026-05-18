"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Calculator,
  Timer,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Star,
  RefreshCw,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { mathsQuestions, quickArithmetic } from "@/data/maths";
import { completeLesson, recordSkillResult, getProgress } from "@/lib/progress";
import { computeAnalytics } from "@/lib/analytics";
import { computeAdaptiveState } from "@/lib/adaptiveEngine";

type Mode = "menu" | "reasoning" | "arithmetic" | "done";

/** Strip currency symbols and spaces, then parse as float. Returns null for non-numeric input. */
function normalizeNumeric(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, "").replace(/^[£$€]/, "");
  if (!cleaned) return null;
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

const skillColors: Record<string, string> = {
  arithmetic: "bg-blue-100 text-blue-700",
  reasoning: "bg-purple-100 text-purple-700",
  "word-problem": "bg-orange-100 text-orange-700",
  fractions: "bg-green-100 text-green-700",
  pattern: "bg-pink-100 text-pink-700",
};

export default function MathsPage() {
  const [mode, setMode] = useState<Mode>("menu");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean | null>>({});
  const [showWorking, setShowWorking] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [score, setScore] = useState(0);
  const [recommendedMode, setRecommendedMode] = useState<"reasoning" | "arithmetic" | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const p = getProgress();
    const r = computeAnalytics(p);
    const adaptive = computeAdaptiveState(p, r);
    setRecommendedMode(adaptive.recommendedMathsMode);
  }, []);

  const questions = mode === "arithmetic" ? quickArithmetic : mathsQuestions.filter((q) => q.id !== "mth-007");
  const current = questions[currentIndex];

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const finishSession = useCallback(() => {
    stopTimer();
    const correct = Object.values(checked).filter(Boolean).length;
    const pct = Math.round((correct / questions.length) * 100);
    const xp = correct * 15 + 10;
    setScore(pct);
    setXpGained(xp);
    completeLesson(`maths-${mode}`, pct, xp);
    setMode("done");
  }, [stopTimer, checked, questions.length, mode]);

  useEffect(() => {
    if (mode === "arithmetic") {
      setTimeLeft(60);
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            finishSession();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => stopTimer();
  }, [mode, finishSession, stopTimer]);

  function startMode(m: "reasoning" | "arithmetic") {
    setMode(m);
    setCurrentIndex(0);
    setAnswers({});
    setChecked({});
    setShowWorking({});
  }

  function checkAnswer() {
    if (!current) return;
    const userRaw = (answers[current.id] ?? "").trim().toLowerCase();
    const correctRaw = String(current.answer).toLowerCase();

    const userNum = normalizeNumeric(userRaw);
    const correctNum = normalizeNumeric(correctRaw);

    let isCorrect: boolean;
    if (userNum !== null && correctNum !== null) {
      isCorrect = Math.abs(userNum - correctNum) < 0.0001;
    } else {
      const userNorm = userRaw.replace(/\s/g, "");
      const correctNorm = correctRaw.replace(/\s/g, "");
      isCorrect =
        userNorm === correctNorm ||
        userRaw === correctRaw.split(";")[0].trim();
    }

    setChecked((prev) => ({ ...prev, [current.id]: isCorrect }));
    recordSkillResult(current.skill, isCorrect);
  }

  function next() {
    if (currentIndex + 1 >= questions.length) {
      finishSession();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function reset() {
    setMode("menu");
    stopTimer();
  }

  if (mode === "done") {
    const correctCount = Object.values(checked).filter(Boolean).length;
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto px-4 py-12 md:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <CheckCircle size={32} className="text-blue-600" />
            </div>
            <h1 className="text-gray-900 font-bold text-2xl mb-2">Session Complete!</h1>
            <p className="text-gray-500">
              {correctCount} of {questions.length} correct — {score}%
            </p>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full mt-3 font-semibold">
              <Star size={16} className="text-blue-500" />
              +{xpGained} XP earned
            </div>
          </div>

          {/* Review */}
          <div className="flex flex-col gap-3 mb-6">
            {questions.map((q) => {
              const wasCorrect = checked[q.id];
              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-xl p-4 border ${
                    wasCorrect === true
                      ? "border-green-200 bg-green-50"
                      : wasCorrect === false
                      ? "border-red-100 bg-red-50"
                      : "border-gray-100"
                  }`}
                >
                  <p className="text-gray-800 text-sm font-medium mb-2">{q.question}</p>
                  <div className="flex items-center gap-2">
                    {wasCorrect === true ? (
                      <CheckCircle size={14} className="text-green-500" />
                    ) : wasCorrect === false ? (
                      <XCircle size={14} className="text-red-400" />
                    ) : null}
                    <p className="text-gray-500 text-xs">
                      Answer: <strong className="text-gray-800">{q.answer}</strong>
                      {answers[q.id] && wasCorrect === false && (
                        <> · You wrote: <span className="text-red-500">{answers[q.id]}</span></>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 bg-blue-600 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              Back to Maths
            </button>
            <button
              onClick={() => startMode(mode === "done" ? "reasoning" : (mode as "reasoning" | "arithmetic"))}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 rounded-xl py-3.5 px-4 font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              <RefreshCw size={14} />
              Again
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (mode === "menu") {
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2.5 rounded-xl">
              <Calculator size={22} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-2xl">Maths Reasoning</h1>
              <p className="text-gray-400 text-sm">Problem solving · Reasoning · Accuracy</p>
            </div>
          </div>

          <div className="grid gap-4">
            <button
              onClick={() => startMode("reasoning")}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="bg-blue-100 p-2.5 rounded-xl">
                  <Calculator size={20} className="text-blue-600" />
                </div>
                <div className="flex items-center gap-2">
                  {recommendedMode === "reasoning" && (
                    <span className="bg-purple-100 text-purple-600 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Sparkles size={10} />
                      Recommended
                    </span>
                  )}
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    9 questions
                  </span>
                </div>
              </div>
              <h3 className="text-gray-900 font-semibold text-lg mb-1 group-hover:text-blue-700 transition-colors">
                Reasoning Problems
              </h3>
              <p className="text-gray-400 text-sm">
                Word problems, fractions, algebra, sequences and geometry. Work through each at your own pace with model solutions.
              </p>
            </button>

            <button
              onClick={() => startMode("arithmetic")}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-orange-200 hover:shadow-sm transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="bg-orange-100 p-2.5 rounded-xl">
                  <Timer size={20} className="text-orange-600" />
                </div>
                <div className="flex items-center gap-2">
                  {recommendedMode === "arithmetic" && (
                    <span className="bg-purple-100 text-purple-600 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Sparkles size={10} />
                      Recommended
                    </span>
                  )}
                  <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    60 seconds
                  </span>
                </div>
              </div>
              <h3 className="text-gray-900 font-semibold text-lg mb-1 group-hover:text-orange-700 transition-colors">
                Speed Arithmetic
              </h3>
              <p className="text-gray-400 text-sm">
                10 arithmetic questions. Race against the clock — 60 seconds. No calculator.
              </p>
            </button>
          </div>

          {/* Skills */}
          <div className="mt-6 bg-blue-50 rounded-xl p-4">
            <p className="text-blue-700 text-xs font-semibold uppercase tracking-wide mb-2">
              Skills Covered
            </p>
            <div className="flex flex-wrap gap-2">
              {["Word problems", "Fractions", "Percentages", "Algebra", "Sequences", "Geometry", "Speed & distance", "Ratio"].map((s) => (
                <span key={s} className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Active question
  const isChecked = checked[current?.id] !== undefined;
  const isCorrect = checked[current?.id] === true;

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={reset}
            className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
          >
            ← Maths
          </button>
          <div className="flex-1 bg-gray-100 rounded-full h-2">
            <div
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
          <span className="text-gray-400 text-sm shrink-0">
            {currentIndex + 1}/{questions.length}
          </span>

          {/* Timer for arithmetic */}
          {mode === "arithmetic" && (
            <div className={`flex items-center gap-1.5 font-bold text-sm px-3 py-1 rounded-full ${
              timeLeft <= 10 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
            }`}>
              <Timer size={14} />
              {timeLeft}s
            </div>
          )}
        </div>

        {/* Question card */}
        {current && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${skillColors[current.skill] ?? "bg-gray-100 text-gray-600"}`}>
                {current.skill.replace("-", " ")}
              </span>
              <span className="text-xs text-gray-400">{current.marks} mark{current.marks !== 1 ? "s" : ""}</span>
            </div>

            <p className="text-gray-800 font-medium text-[16px] leading-relaxed mb-5">
              {current.question}
            </p>

            <input
              type="text"
              value={answers[current.id] ?? ""}
              onChange={(e) =>
                !isChecked && setAnswers((prev) => ({ ...prev, [current.id]: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (!isChecked) checkAnswer();
                  else next();
                }
              }}
              placeholder="Your answer..."
              disabled={isChecked}
              className={`w-full rounded-xl px-4 py-3.5 text-base font-medium focus:outline-none focus:ring-2 transition-all ${
                isChecked
                  ? isCorrect
                    ? "bg-green-50 border-2 border-green-400 text-green-700"
                    : "bg-red-50 border-2 border-red-300 text-red-700"
                  : "bg-gray-50 border border-gray-200 focus:ring-blue-400 focus:border-transparent"
              }`}
            />

            {isChecked && (
              <div className={`mt-3 rounded-xl p-3 flex items-start gap-2 ${
                isCorrect ? "bg-green-50" : "bg-red-50"
              }`}>
                {isCorrect ? (
                  <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                ) : (
                  <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                )}
                <p className={`text-sm font-medium ${isCorrect ? "text-green-700" : "text-red-600"}`}>
                  {isCorrect
                    ? "Correct!"
                    : `Incorrect — answer: ${current.answer}`}
                </p>
              </div>
            )}

            {/* Show working (reasoning mode only) */}
            {mode === "reasoning" && isChecked && current.workingSteps && (
              <button
                onClick={() => setShowWorking((p) => ({ ...p, [current.id]: !p[current.id] }))}
                className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                {showWorking[current.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {showWorking[current.id] ? "Hide" : "Show"} working
              </button>
            )}

            {showWorking[current.id] && current.workingSteps && (
              <div className="mt-2 bg-blue-50 rounded-xl p-3">
                <p className="text-xs text-blue-600 font-semibold mb-2">Step-by-step:</p>
                <ol className="text-sm text-gray-700 space-y-1">
                  {current.workingSteps.map((step, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-blue-400 font-mono text-xs mt-0.5 shrink-0">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {!isChecked ? (
            <button
              onClick={checkAnswer}
              disabled={!(answers[current?.id] ?? "").trim()}
              className="flex-1 bg-blue-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={next}
              className="flex-1 bg-blue-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-blue-700 transition-colors"
            >
              {currentIndex + 1 >= questions.length ? "Finish" : "Next Question →"}
            </button>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
