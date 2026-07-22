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
  RefreshCw,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { mathsQuestions, quickArithmetic } from "@/data/maths";
import { completeLesson, recordSkillResult, getProgress } from "@/lib/progress";
import { computeAnalytics } from "@/lib/analytics";
import { computeAdaptiveState } from "@/lib/adaptiveEngine";
import SessionInfoBar from "@/components/SessionInfoBar";
import { SUBJECT_ESTIMATED_MINUTES, SUBJECT_LEARNING_OBJECTIVE, SUBJECT_EXPECTED_BENEFIT } from "@/lib/subjectMeta";
import type { AnalyticsReport } from "@/types/analytics";

type Mode = "menu" | "reasoning" | "arithmetic" | "done";

function normalizeNumeric(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, "").replace(/^[£$€]/, "");
  if (!cleaned) return null;
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

const skillColors: Record<string, string> = {
  arithmetic: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
  reasoning: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300",
  "word-problem": "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300",
  fractions: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
  pattern: "bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300",
};

export default function MathsPage() {
  const [mode, setMode] = useState<Mode>("menu");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean | null>>({});
  const [showWorking, setShowWorking] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [recommendedMode, setRecommendedMode] = useState<"reasoning" | "arithmetic" | null>(null);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const p = getProgress();
    const r = computeAnalytics(p);
    const adaptive = computeAdaptiveState(p, r);
    setRecommendedMode(adaptive.recommendedMathsMode);
    setReport(r);
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <CheckCircle size={32} aria-hidden="true" className="text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl mb-2">Session Complete!</h1>
            <p className="text-gray-500 dark:text-gray-400">
              {correctCount} of {questions.length} correct — {score}%
            </p>
          </div>

          {/* Review */}
          <div className="flex flex-col gap-3 mb-6">
            {questions.map((q) => {
              const wasCorrect = checked[q.id];
              return (
                <div
                  key={q.id}
                  className={`rounded-xl p-4 border ${
                    wasCorrect === true
                      ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950"
                      : wasCorrect === false
                      ? "border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950"
                      : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
                  }`}
                >
                  <p className="text-gray-800 dark:text-gray-100 text-sm font-medium mb-2">{q.question}</p>
                  <div className="flex items-center gap-2">
                    {wasCorrect === true ? (
                      <CheckCircle size={14} aria-hidden="true" className="text-green-500" />
                    ) : wasCorrect === false ? (
                      <XCircle size={14} aria-hidden="true" className="text-red-400" />
                    ) : null}
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      Answer: <strong className="text-gray-800 dark:text-gray-100">{q.answer}</strong>
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
              className="flex-1 bg-blue-600 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-blue-700 transition-colors motion-reduce:transition-none"
            >
              Back to Maths
            </button>
            <button
              onClick={() => startMode(mode === "done" ? "reasoning" : (mode as "reasoning" | "arithmetic"))}
              className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl py-3.5 px-4 font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors motion-reduce:transition-none"
            >
              <RefreshCw size={14} aria-hidden="true" />
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
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-2xl">
              <Calculator size={22} aria-hidden="true" className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Maths Reasoning</h1>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Problem solving · Reasoning · Accuracy</p>
            </div>
          </div>

          {/* Study Sessions info strip (Sprint 4) — only shown at the menu
              (pre-session) state, never during an active question or the
              results screen. */}
          <SessionInfoBar
            objective={SUBJECT_LEARNING_OBJECTIVE.maths!}
            estimatedMinutes={SUBJECT_ESTIMATED_MINUTES.maths!}
            skills={report?.skills.filter((s) => s.group === "maths")}
            subjectAnalytics={report?.subjects.find((s) => s.subject === "maths")}
            expectedBenefit={SUBJECT_EXPECTED_BENEFIT.maths}
          />

          <div className="grid gap-4 mt-4">
            <button
              onClick={() => startMode("reasoning")}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-sm active:scale-[0.98] transition-all motion-reduce:transition-none text-left group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="bg-blue-100 dark:bg-blue-900 p-2.5 rounded-xl">
                  <Calculator size={20} aria-hidden="true" className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex items-center gap-2">
                  {recommendedMode === "reasoning" && (
                    <span className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Sparkles size={10} aria-hidden="true" />
                      Recommended
                    </span>
                  )}
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                    9 questions
                  </span>
                </div>
              </div>
              <h3 className="text-gray-900 dark:text-gray-100 font-semibold text-lg mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors motion-reduce:transition-none">
                Reasoning Problems
              </h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Word problems, fractions, algebra, sequences and geometry. Work through each at your own pace with model solutions.
              </p>
            </button>

            <button
              onClick={() => startMode("arithmetic")}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-700 hover:shadow-sm active:scale-[0.98] transition-all motion-reduce:transition-none text-left group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="bg-orange-100 dark:bg-orange-900 p-2.5 rounded-xl">
                  <Timer size={20} aria-hidden="true" className="text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex items-center gap-2">
                  {recommendedMode === "arithmetic" && (
                    <span className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Sparkles size={10} aria-hidden="true" />
                      Recommended
                    </span>
                  )}
                  <span className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                    60 seconds
                  </span>
                </div>
              </div>
              <h3 className="text-gray-900 dark:text-gray-100 font-semibold text-lg mb-1 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors motion-reduce:transition-none">
                Speed Arithmetic
              </h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                10 arithmetic questions. Race against the clock — 60 seconds. No calculator.
              </p>
            </button>
          </div>

          {/* Skills */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-950 rounded-xl p-4">
            <p className="text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-wide mb-2">
              Skills Covered
            </p>
            <div className="flex flex-wrap gap-2">
              {["Word problems", "Fractions", "Percentages", "Algebra", "Sequences", "Geometry", "Speed & distance", "Ratio"].map((s) => (
                <span key={s} className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium px-2.5 py-1 rounded-full">
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
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-sm transition-colors motion-reduce:transition-none"
          >
            ← Maths
          </button>
          {/* AN-105: kept as its own markup rather than adopting the shared
              ProgressBar component — that component's colour prop only
              supports purple/emerald/amber, not the blue this subject uses
              throughout (menu cards, focus ring, buttons); forcing an
              unsupported shade in would change Maths's established visual
              identity, which Step 3 explicitly says to preserve. Same real
              percentage, unchanged — only real ARIA progress semantics
              added, which this markup never had. */}
          <div
            role="progressbar"
            aria-valuenow={Math.round(((currentIndex + 1) / questions.length) * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Question progress"
            className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2"
          >
            <div
              className="bg-blue-500 h-full rounded-full transition-all motion-reduce:transition-none"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
          <span className="text-gray-400 dark:text-gray-500 text-sm shrink-0">
            {currentIndex + 1}/{questions.length}
          </span>

          {/* Timer for arithmetic */}
          {mode === "arithmetic" && (
            <div className={`flex items-center gap-1.5 font-bold text-sm px-3 py-1 rounded-full ${
              timeLeft <= 10
                ? "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400"
                : "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400"
            }`}>
              <Timer size={14} aria-hidden="true" />
              {timeLeft}s
            </div>
          )}
        </div>

        {/* Question card */}
        {current && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${skillColors[current.skill] ?? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
                {current.skill.replace("-", " ")}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{current.marks} mark{current.marks !== 1 ? "s" : ""}</span>
            </div>

            <p className="text-gray-800 dark:text-gray-100 font-medium text-[16px] leading-relaxed mb-5">
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
              className={`w-full rounded-xl px-4 py-3.5 text-base font-medium focus:outline-none focus:ring-2 transition-all motion-reduce:transition-none ${
                isChecked
                  ? isCorrect
                    ? "bg-green-50 dark:bg-green-950 border-2 border-green-400 dark:border-green-600 text-green-700 dark:text-green-300"
                    : "bg-red-50 dark:bg-red-950 border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300"
                  : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:ring-blue-400 focus:border-transparent"
              }`}
            />

            {isChecked && (
              <div className={`mt-3 rounded-xl p-3 flex items-start gap-2 ${
                isCorrect ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"
              }`}>
                {isCorrect ? (
                  <CheckCircle size={16} aria-hidden="true" className="text-green-500 mt-0.5 shrink-0" />
                ) : (
                  <XCircle size={16} aria-hidden="true" className="text-red-400 mt-0.5 shrink-0" />
                )}
                <p className={`text-sm font-medium ${isCorrect ? "text-green-700 dark:text-green-300" : "text-red-600 dark:text-red-400"}`}>
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
                aria-expanded={!!showWorking[current.id]}
                className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium transition-colors motion-reduce:transition-none"
              >
                {showWorking[current.id] ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
                {showWorking[current.id] ? "Hide" : "Show"} working
              </button>
            )}

            {showWorking[current.id] && current.workingSteps && (
              <div className="mt-2 bg-blue-50 dark:bg-blue-950 rounded-xl p-3">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-2">Step-by-step:</p>
                <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  {current.workingSteps.map((step, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-blue-400 dark:text-blue-500 font-mono text-xs mt-0.5 shrink-0">{i + 1}.</span>
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
              className="flex-1 bg-blue-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-blue-700 disabled:opacity-40 transition-colors motion-reduce:transition-none"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={next}
              className="flex-1 bg-blue-600 text-white rounded-xl py-4 font-semibold text-base hover:bg-blue-700 transition-colors motion-reduce:transition-none"
            >
              {currentIndex + 1 >= questions.length ? "Finish" : "Next Question →"}
            </button>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
