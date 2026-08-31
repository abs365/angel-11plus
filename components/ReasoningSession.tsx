"use client";

import { useState, useCallback, useEffect } from "react";
import { CheckCircle, XCircle, RefreshCw, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { completeLesson, recordSkillResult, getProgress } from "@/lib/progress";
import { computeAnalytics } from "@/lib/analytics";
import SessionInfoBar from "@/components/SessionInfoBar";
import { ProgressBar } from "@/components/ui/Progress";
import {
  SUBJECT_ESTIMATED_MINUTES,
  SUBJECT_LEARNING_OBJECTIVE,
  SUBJECT_SUGGESTED_PREPARATION,
  SUBJECT_EXPECTED_BENEFIT,
} from "@/lib/subjectMeta";
import type { ReasoningQuestion } from "@/types/reasoning";
import type { SkillType } from "@/types";
import type { AnalyticsReport, SubjectKey } from "@/types/analytics";

// ─── Theme colours ────────────────────────────────────────────────────────────
//
// AN-107 (Practice Experience Implementation) — `button` darkened from
// `-600 hover:-700` to `-700 hover:-800` for all four themes, verified live
// in a real browser (not estimated): white text on every theme's previous
// `-600` fill measured below the 4.5:1 AA threshold for normal text —
// cyan/teal as low as ~2.9:1 with the button's prior `text-white/80`
// treatment, and even solid white only reached 3.62–3.74:1 for cyan/teal,
// still failing. `-700` is the only shade that passes 4.5:1 with solid
// white across all four themes (measured 5.36–7.10:1). This is the same
// class of correction this codebase already made once (Sprint 1's
// --color-success emerald-600→700) and again for Vocabulary's Word of the
// Day card (AN-105) — applied here for the first time to lime/cyan/teal/
// rose. `xpBadge` is unchanged in colour and no longer used in markup (see
// the done screen below) but the token is left defined here in case a
// future package wants the same treatment for something else. `bar` was
// removed (Stage 3, 2026-08-31) once the in-session progress fill moved to
// the shared `ProgressBar` component below — see PROGRESS_BAR_COLOR.
// Zero-Purple pass (2026-08-31): key stays "violet" (matches the caller,
// app/verbal-reasoning/page.tsx's themeColor="violet", and ThemeKey =
// keyof typeof THEME) — only the rendered classes moved to lime, per the
// established convention of not renaming internal identifiers across call
// sites (ANGEL_DESIGN_LANGUAGE.md §2's implementation note).
const THEME = {
  violet: {
    header: "bg-lime-100 dark:bg-lime-900",
    icon: "text-lime-600 dark:text-lime-400",
    pill: "bg-lime-50 dark:bg-lime-950",
    pillText: "text-lime-700 dark:text-lime-300",
    skills: "bg-lime-50 dark:bg-lime-950",
    skillsTitle: "text-lime-700 dark:text-lime-300",
    skillsBadge: "bg-lime-100 text-lime-700 dark:bg-lime-900 dark:text-lime-300",
    button: "bg-lime-700 hover:bg-lime-800",
    working: "bg-lime-50 dark:bg-lime-950",
    workingText: "text-lime-600 dark:text-lime-400",
    back: "text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300",
    xpBadge: "bg-lime-50 text-lime-700 dark:bg-lime-950 dark:text-lime-300",
  },
  cyan: {
    header: "bg-cyan-100 dark:bg-cyan-900",
    icon: "text-cyan-600 dark:text-cyan-400",
    pill: "bg-cyan-50 dark:bg-cyan-950",
    pillText: "text-cyan-700 dark:text-cyan-300",
    skills: "bg-cyan-50 dark:bg-cyan-950",
    skillsTitle: "text-cyan-700 dark:text-cyan-300",
    skillsBadge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
    button: "bg-cyan-700 hover:bg-cyan-800",
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
    button: "bg-teal-700 hover:bg-teal-800",
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
    button: "bg-rose-700 hover:bg-rose-800",
    working: "bg-rose-50 dark:bg-rose-950",
    workingText: "text-rose-600 dark:text-rose-400",
    back: "text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300",
    xpBadge: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  },
};

type ThemeKey = keyof typeof THEME;

// Stage 3 (Shared Question Shell, 2026-08-31) — maps this component's own
// theme keys onto the shared `ProgressBar` component's colour prop, now
// that Progress.tsx supports the full subject-identity palette. Only
// "violet" needs a real mapping (its theme key is unchanged from before
// the Zero-Purple pass, per ANGEL_DESIGN_LANGUAGE.md §2's implementation
// note, but the colour it renders is lime); the other three theme keys
// already share their name with the ProgressBar colour they need.
const PROGRESS_BAR_COLOR: Record<ThemeKey, "lime" | "cyan" | "teal" | "rose"> = {
  violet: "lime",
  cyan: "cyan",
  teal: "teal",
  rose: "rose",
};

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

/**
 * AN-107 (Practice Experience Implementation) — Founder decision 2:
 * "Remove visible XP messaging. Replace with educationally meaningful
 * progress messaging." Keyed on `score`, the same real, already-computed
 * percentage the line above this message already shows — no new
 * calculation, same presentation-only convention as Dashboard's
 * getEncouragingMessage(). `completeLesson()`'s xp argument and the
 * `xpGained` state are unchanged (Founder decision 2's own instruction not
 * to remove internal XP systems still required elsewhere) — only the
 * visible badge is replaced.
 */
function getPracticeCompletionMessage(score: number): string {
  if (score >= 80) return "Excellent work. This is exam-ready practice.";
  if (score >= 60) return "Solid progress. A little more practice will make this really strong.";
  if (score >= 40) return "Good effort. The explanations below will help this stick.";
  return "Every attempt here is real progress. The explanations below show exactly why.";
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
  const [score, setScore] = useState(0);
  const [report, setReport] = useState<AnalyticsReport | null>(null);

  useEffect(() => {
    setReport(computeAnalytics(getProgress()));
  }, []);

  const subjectKeyTyped = subjectKey as SubjectKey;
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
    // AN-107 — the xp calculation and its persistence via completeLesson()
    // are unchanged (Founder decision 2: preserve internal XP systems);
    // only the xpGained *state* was removed, since nothing renders it now
    // that the visible XP badge is gone.
    const xp = correctCount * 12 + 10;
    setScore(pct);
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
              <CheckCircle size={32} aria-hidden="true" className={t.icon} />
            </div>
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl mb-2">Session Complete!</h1>
            <p className="text-gray-500 dark:text-gray-400">
              {correctCount} of {questions.length} correct ({score}%)
            </p>
            <p className="text-gray-700 dark:text-gray-300 font-semibold mt-3">
              {getPracticeCompletionMessage(score)}
            </p>
          </div>

          {/* Stage 3 (Question Experience Audit, 2026-08-31) — wrong-answer
              feedback here previously used red/green, while the Practice
              runner's equivalent (SubmitOrNext, same file family, same
              underlying meaning) deliberately uses amber/emerald and never
              red — red is reserved app-wide for genuine error/danger states
              (ANGEL_DESIGN_LANGUAGE.md §5), not a wrong practice answer.
              This was an accidental inconsistency, not a pedagogical one —
              nothing about scoring, evidence recording, or the underlying
              correct/incorrect logic changes here, only the colour. */}
          <div className="flex flex-col gap-3 mb-6">
            {questions.map((q) => {
              const wasCorrect = checked[q.id];
              return (
                <div
                  key={q.id}
                  className={`rounded-xl p-4 border ${
                    wasCorrect === true
                      ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950"
                      : wasCorrect === false
                      ? "border-amber-100 dark:border-amber-900 bg-amber-50 dark:bg-amber-950"
                      : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
                  }`}
                >
                  <p className="text-gray-800 dark:text-gray-100 text-sm font-medium mb-2 whitespace-pre-line">{q.question}</p>
                  <div className="flex items-start gap-2">
                    {wasCorrect === true ? (
                      <CheckCircle size={14} aria-hidden="true" className="text-emerald-500 mt-0.5 shrink-0" />
                    ) : wasCorrect === false ? (
                      <XCircle size={14} aria-hidden="true" className="text-amber-400 mt-0.5 shrink-0" />
                    ) : null}
                    <div className="flex-1">
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        Answer: <strong className="text-gray-800 dark:text-gray-100">{q.answer}</strong>
                        {answers[q.id] && wasCorrect === false && (
                          <> · You wrote: <span className="text-amber-500">{answers[q.id]}</span></>
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
              className={`flex-1 text-white rounded-xl py-3.5 font-semibold text-sm transition-colors motion-reduce:transition-none ${t.button}`}
            >
              Back to {subjectName}
            </button>
            <button
              onClick={startSession}
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

  // ── Menu screen ───────────────────────────────────────────────────────────────
  if (mode === "menu") {
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className={`${t.header} p-3 rounded-2xl`}>
              <Icon size={22} aria-hidden="true" className={t.icon} />
            </div>
            <div>
              <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">{subjectName}</h1>
              <p className="text-gray-400 dark:text-gray-500 text-sm">{description}</p>
            </div>
          </div>

          {/* Practice Sessions info strip (Sprint 5) — pre-session (menu)
              state only, shared by all four reasoning subjects since they
              all render through this one component. */}
          <div className="mb-4">
            <SessionInfoBar
              objective={SUBJECT_LEARNING_OBJECTIVE[subjectKeyTyped] ?? description}
              estimatedMinutes={SUBJECT_ESTIMATED_MINUTES[subjectKeyTyped] ?? 15}
              skills={report?.skills.filter((s) => s.skill === skillType)}
              subjectAnalytics={report?.subjects.find((s) => s.subject === subjectKeyTyped)}
              preparation={SUBJECT_SUGGESTED_PREPARATION[subjectKeyTyped]}
              expectedBenefit={SUBJECT_EXPECTED_BENEFIT[subjectKeyTyped]}
            />
          </div>

          <button
            onClick={startSession}
            className={`w-full text-white rounded-2xl p-6 text-left transition-all motion-reduce:transition-none ${t.button}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`bg-white/20 p-2.5 rounded-xl`}>
                <Icon size={20} aria-hidden="true" className="text-white" />
              </div>
              <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                {questions.length} questions
              </span>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Start Practice Session</h3>
            {/* AN-107: text-white/80 measured (live, real browser) at
                ~2.9:1 on the cyan/teal themes' prior -600 fill — solid
                text-white on the new -700 fill passes 4.5:1+ on every
                theme (see THEME's own comment above). */}
            <p className="text-white text-sm">
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
        {/* ARC-001A — this state had no heading at all (confirmed via a live
            accessibility-tree read during ARC-001 certification), unlike the
            menu (`subjectName`) and done ("Session Complete!") states above.
            Visually hidden since the existing visible "← {subjectName}" back
            button + progress counter already carry this sighted-user context
            — an extra visible heading here would be redundant, not
            clarifying. Purely additive: no state-machine, scoring, question,
            or completion logic below is touched. */}
        <h1 className="sr-only">{subjectName} Practice</h1>
        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setMode("menu")}
            className={`text-sm transition-colors motion-reduce:transition-none ${t.back}`}
          >
            ← {subjectName}
          </button>
          {/* Stage 3 (Shared Question Shell, 2026-08-31) — this had been its
              own hand-rolled markup since AN-107, specifically because the
              shared ProgressBar component's palette (then purple/emerald/
              amber) couldn't express this component's per-theme colour.
              Progress.tsx now supports the full subject-identity palette
              (lime/cyan/teal/rose included), closing that gap — this is a
              genuine adoption of the shared component, not a new one, and
              renders the identical colour/width/transition as before
              (verified against the removed markup above). */}
          <ProgressBar
            percent={((currentIndex + 1) / questions.length) * 100}
            color={PROGRESS_BAR_COLOR[themeColor]}
            label="Question progress"
            className="flex-1"
          />
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
                className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-800 font-medium mb-3 transition-colors motion-reduce:transition-none"
              >
                <Lightbulb size={13} aria-hidden="true" />
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
              className={`w-full rounded-xl px-4 py-3.5 text-base font-medium focus:outline-none focus:ring-2 transition-all motion-reduce:transition-none ${
                isChecked
                  ? isCorrect
                    ? "bg-emerald-50 dark:bg-emerald-950 border-2 border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300"
                    : "bg-amber-50 dark:bg-amber-950 border-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"
                  : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:ring-lime-400 focus:border-transparent"
              }`}
            />

            {isChecked && (
              <div className={`mt-3 rounded-xl p-3 flex items-start gap-2 ${isCorrect ? "bg-emerald-50 dark:bg-emerald-950" : "bg-amber-50 dark:bg-amber-950"}`}>
                {isCorrect ? (
                  <CheckCircle size={16} aria-hidden="true" className="text-emerald-500 mt-0.5 shrink-0" />
                ) : (
                  <XCircle size={16} aria-hidden="true" className="text-amber-400 mt-0.5 shrink-0" />
                )}
                <p className={`text-sm font-medium ${isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-amber-600 dark:text-amber-400"}`}>
                  {isCorrect ? "Correct!" : `Incorrect. Answer: ${current.answer}`}
                </p>
              </div>
            )}

            {isChecked && (
              <button
                onClick={() => setShowExplanation((p) => ({ ...p, [current.id]: !p[current.id] }))}
                className={`mt-3 flex items-center gap-1.5 text-xs font-medium transition-colors motion-reduce:transition-none ${t.workingText} hover:opacity-80`}
              >
                {showExplanation[current.id] ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
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
              className={`flex-1 text-white rounded-xl py-4 font-semibold text-base disabled:opacity-40 transition-colors motion-reduce:transition-none ${t.button}`}
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={next}
              className={`flex-1 text-white rounded-xl py-4 font-semibold text-base transition-colors motion-reduce:transition-none ${t.button}`}
            >
              {currentIndex + 1 >= questions.length ? "Finish" : "Next Question →"}
            </button>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
