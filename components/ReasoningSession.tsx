"use client";

import { useState, useCallback } from "react";
import { CheckCircle, XCircle, Star, RefreshCw, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { completeLesson, recordSkillResult } from "@/lib/progress";
import type { ReasoningQuestion } from "@/types/reasoning";
import type { SkillType } from "@/types";

// ─── Theme colours ────────────────────────────────────────────────────────────

const THEME = {
  violet: {
    header: "bg-violet-100 dark:bg-violet-900",
    icon: "text-violet-600 dark:text-violet-400",
    pill: "bg-violet-50 dark:bg-violet-950",
    pillText: "text-violet-700 dark:text-violet-300",
    skills: "bg-violet-50 dark:bg-violet-950",
    skillsTitle: "text-violet-700 dark:text-violet-300",
    skillsBadge: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
    bar: "bg-violet-500",
    button: "bg-violet-600 hover:bg-violet-700",
    working: "bg-violet-50 dark:bg-violet-950",
    workingText: "text-violet-600 dark:text-violet-400",
    back: "text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300",
    xpBadge: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  },
  cyan: {
    header: "bg-cyan-100 dark:bg-cyan-900",
    icon: "text-cyan-600 dark:text-cyan-400",
    pill: "bg-cyan-50 dark:bg-cyan-950",
    pillText: "text-cyan-700 dark:text-cyan-300",
    skills: "bg-cyan-50 dark:bg-cyan-950",
    skillsTitle: "text-cyan-700 dark:text-cyan-300",
    skillsBadge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
    bar: "bg-cyan-500",
    button: "bg-cyan-600 hover:bg-cyan-700",
    working: "bg-cyan-50 dark:bg-cyan-950",
    workingText: "text-cyan-600 dark:text-cyan-400",
    back: "text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300",
    xpBadge: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  },
  teal: {
    header: "bg-teal-100 dark:bg-teal-900",
    icon: "text-teal-600 dark:text-teal-400",
    pill: "bg-teal-50 dark:bg-teal-950",
    pillText: "text-teal-700 dark:text-teal-300",
    skills: "bg-teal-50 dark:bg-teal-950",
    skillsTitle: "text-teal-700 dark:text-teal-300",
    skillsBadge: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
    bar: "bg-teal-500",
    button: "bg-teal-600 hover:bg-teal-700",
    working: "bg-teal-50 dark:bg-teal-950",
    workingText: "text-teal-600 dark:text-teal-400",
    back: "text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300",
    xpBadge: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  },
  rose: {
    header: "bg-rose-100 dark:bg-rose-900",
    icon: "text-rose-600 dark:text-rose-400",
    pill: "bg-rose-50 dark:bg-rose-950",
    pillText: "text-rose-700 dark:text-rose-300",
    skills: "bg-rose-50 dark:bg-rose-950",
    skillsTitle: "text-rose-700 dark:text-rose-300",
    skillsBadge: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
    bar: "bg-rose-500",
    button: "bg-rose-600 hover:bg-rose-700",
    working: "bg-rose-50 dark:bg-rose-950",
    workingText: "text-rose-600 dark:text-rose-400",
    back: "text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300",
    xpBadge: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  },
};

type ThemeKey = keyof typeof THEME;

// ─── Answer normalisation ─────────────────────────────────────────────────────

function normalise(raw: string): string {
  return raw.trim().toLowerCase().replace(/[£$€]/g, "").replace(/\s+/g, " ");
}

function isAnswerCorrect(userRaw: string, question: ReasoningQuestion): boolean {
  const user = normalise(userRaw);
  const correct = normalise(question.answer);
  if (user === correct) return true;
  const userNum = parseFloat(user);
  const correctNum = parseFloat(correct);
  if (!isNaN(userNum) && !isNaN(correctNum) && Math.abs(userNum - correctNum) < 0.001) return true;
  if (question.alternatives) {
    return question.alternatives.some((alt) => normalise(alt) === user);
  }
  return false;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  subjectKey: string;
  subjectName: string;
  description: string;
  skillType: SkillType;
  themeColor: ThemeKey;
  icon: LucideIcon;
  questions: ReasoningQuestion[];
  skills: string[];
  examBoards?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

type Mode = "menu" | "session" | "done";

export default function ReasoningSession({
  subjectKey,
  subjectName,
  description,
  skillType,
  themeColor,
  icon: Icon,
  questions,
  skills,
  examBoards,
}: Props) {
  const t = THEME[themeColor];
  const [mode, setMode] = useState<Mode>("menu");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean | null>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [xpGained, setXpGained] = useState(0);
  const [score, setScore] = useState(0);

  const current = questions[currentIndex];
  const isChecked = checked[current?.id] !== undefined;
  const isCorrect = checked[current?.id] === true;

  function startSession() {
    setMode("session");
    setCurrentIndex(0);
    setAnswers({});
    setChecked({});
    setShowExplanation({});
    setShowHint({});
  }

  const finishSession = useCallback(() => {
    const correctCount = Object.values(checked).filter(Boolean).length;
    const pct = Math.round((correctCount / questions.length) * 100);
    const xp = correctCount * 12 + 10;
    setScore(pct);
    setXpGained(xp);
    completeLesson(subjectKey, pct, xp);
    setMode("done");
  }, [checked, questions.length, subjectKey]);

  function checkAnswer() {
    if (!current) return;
    const correct = isAnswerCorrect(answers[current.id] ?? "", current);
    setChecked((prev) => ({ ...prev, [current.id]: correct }));
    recordSkillResult(skillType, correct);
  }

  function next() {
    if (currentIndex + 1 >= questions.length) {
      finishSession();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  // ── Done screen ──────────────────────────────────────────────────────────────
  if (mode === "done") {
    const correctCount = Object.values(checked).filter(Boolean).length;
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto px-4 py-10 md:px-8">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 ${t.header} rounded-full mb-4`}>
              <CheckCircle size={32} className={t.icon} />
            </div>
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl mb-2">Session Complete!</h1>
            <p className="text-gray-500 dark:text-gray-400">
              {correctCount} of {questions.length} correct — {score}%
            </p>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mt-3 font-semibold ${t.xpBadge}`}>
              <Star size={16} className={t.icon} />
              +{xpGained} XP earned
            </div>
          </div>

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
                  <p className="text-gray-800 dark:text-gray-100 text-sm font-medium mb-2 whitespace-pre-line">{q.question}</p>
                  <div className="flex items-start gap-2">
                    {wasCorrect === true ? (
                      <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                    ) : wasCorrect === false ? (
                      <XCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                    ) : null}
                    <div className="flex-1">
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        Answer: <strong className="text-gray-800 dark:text-gray-100">{q.answer}</strong>
                        {answers[q.id] && wasCorrect === false && (
                          <> · You wrote: <span className="text-red-500">{answers[q.id]}</span></>
                        )}
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setMode("menu")}
              className={`flex-1 text-white rounded-xl py-3.5 font-semibold text-sm transition-colors ${t.button}`}
            >
              Back to {subjectName}
            </button>
            <button
              onClick={startSession}
              className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl py-3.5 px-4 font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw size={14} />
              Again
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // ── Menu screen ───────────────────────────────────────────────────────────────
  if (mode === "menu") {
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className={`${t.header} p-3 rounded-2xl`}>
              <Icon size={22} className={t.icon} />
            </div>
            <div>
              <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">{subjectName}</h1>
              <p className="text-gray-400 dark:text-gray-500 text-sm">{description}</p>
            </div>
          </div>

          <button
            onClick={startSession}
            className={`w-full text-white rounded-2xl p-6 text-left transition-all ${t.button}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`bg-white/20 p-2.5 rounded-xl`}>
                <Icon size={20} className="text-white" />
              </div>
              <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                {questions.length} questions
              </span>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Start Practice Session</h3>
            <p className="text-white/80 text-sm">
              Work through {questions.length} original exam-style questions. Automatic marking with full explanations.
            </p>
          </button>

          <div className={`mt-4 rounded-xl p-4 ${t.skills}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${t.skillsTitle}`}>
              Skills Covered
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s} className={`text-xs font-medium px-2.5 py-1 rounded-full ${t.skillsBadge}`}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {examBoards && (
            <div className="mt-3 bg-white dark:bg-gray-900 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide mb-1">Required by</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{examBoards}</p>
            </div>
          )}
        </div>
      </PageLayout>
    );
  }

  // ── Active question ───────────────────────────────────────────────────────────
  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setMode("menu")}
            className={`text-sm transition-colors ${t.back}`}
          >
            ← {subjectName}
          </button>
          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
            <div
              className={`h-full rounded-full transition-all ${t.bar}`}
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
          <span className="text-gray-400 dark:text-gray-500 text-sm shrink-0">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>

        {/* Question card */}
        {current && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.skillsBadge}`}>
                {current.category}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{current.marks} mark{current.marks !== 1 ? "s" : ""}</span>
            </div>

            <p className="text-gray-800 dark:text-gray-100 font-medium text-[16px] leading-relaxed mb-5 whitespace-pre-line">
              {current.question}
            </p>

            {/* Hint toggle */}
            {current.hint && !isChecked && (
              <button
                onClick={() => setShowHint((p) => ({ ...p, [current.id]: !p[current.id] }))}
                className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-800 font-medium mb-3 transition-colors"
              >
                <Lightbulb size={13} />
                {showHint[current.id] ? "Hide hint" : "Show hint"}
              </button>
            )}
            {showHint[current.id] && current.hint && (
              <div className="mb-3 bg-amber-50 dark:bg-amber-950 rounded-xl px-4 py-2.5">
                <p className="text-xs text-amber-700 dark:text-amber-300">{current.hint}</p>
              </div>
            )}

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
                    ? "bg-green-50 dark:bg-green-950 border-2 border-green-400 dark:border-green-600 text-green-700 dark:text-green-300"
                    : "bg-red-50 dark:bg-red-950 border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300"
                  : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:ring-violet-400 focus:border-transparent"
              }`}
            />

            {isChecked && (
              <div className={`mt-3 rounded-xl p-3 flex items-start gap-2 ${isCorrect ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"}`}>
                {isCorrect ? (
                  <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                ) : (
                  <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                )}
                <p className={`text-sm font-medium ${isCorrect ? "text-green-700 dark:text-green-300" : "text-red-600 dark:text-red-400"}`}>
                  {isCorrect ? "Correct!" : `Incorrect — answer: ${current.answer}`}
                </p>
              </div>
            )}

            {isChecked && (
              <button
                onClick={() => setShowExplanation((p) => ({ ...p, [current.id]: !p[current.id] }))}
                className={`mt-3 flex items-center gap-1.5 text-xs font-medium transition-colors ${t.workingText} hover:opacity-80`}
              >
                {showExplanation[current.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {showExplanation[current.id] ? "Hide" : "Show"} explanation
              </button>
            )}

            {showExplanation[current.id] && (
              <div className={`mt-2 rounded-xl p-3 ${t.working}`}>
                <p className={`text-xs font-semibold mb-1 ${t.workingText}`}>Explanation:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{current.explanation}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          {!isChecked ? (
            <button
              onClick={checkAnswer}
              disabled={!(answers[current?.id] ?? "").trim()}
              className={`flex-1 text-white rounded-xl py-4 font-semibold text-base disabled:opacity-40 transition-colors ${t.button}`}
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={next}
              className={`flex-1 text-white rounded-xl py-4 font-semibold text-base transition-colors ${t.button}`}
            >
              {currentIndex + 1 >= questions.length ? "Finish" : "Next Question →"}
            </button>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
