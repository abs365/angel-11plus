"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Clock, CheckCircle, XCircle, ChevronRight,
  Trophy, RotateCcw, AlertCircle,
} from "lucide-react";
import { verbalReasoningQuestions } from "@/data/verbal-reasoning";
import { nonVerbalReasoningQuestions } from "@/data/non-verbal-reasoning";
import { spatialReasoningQuestions } from "@/data/spatial-reasoning";
import { numericalReasoningQuestions } from "@/data/numerical-reasoning";
import { saveMockResult, getBestMockScoreForPathway, getMockCountForPathway } from "@/lib/mockProgress";
import { completeLesson } from "@/lib/progress";
import { trackEvent } from "@/lib/betaTracking";
import { MOCK_SUGGESTED_PREPARATION, MOCK_ADMISSION_RELEVANCE } from "@/lib/mockMeta";
import type { MockPathwayId, MockSectionResult } from "@/types/mock";
import type { ReasoningQuestion } from "@/types/reasoning";

// ─── Config ───────────────────────────────────────────────────────────────────

type BankKey = "vr" | "nvr" | "sr" | "nr";

interface SectionConfig {
  id: string;
  name: string;
  bank: BankKey;
  count: number;
  offset: number;
  minutes: number;
}

interface MockConfig {
  name: string;
  pathwayName: string;
  badge: string;
  color: string;
  headerBg: string;
  description: string;
  totalMinutes: number;
  xpReward: number;
  sections: SectionConfig[];
}

const MOCK_CONFIGS: Record<MockPathwayId, MockConfig> = {
  gl: {
    name: "GL Assessment",
    pathwayName: "GL Assessment Practice Mock",
    badge: "GL",
    color: "blue",
    headerBg: "bg-blue-600",
    description: "Four timed sections matching the GL Assessment format.",
    totalMinutes: 35,
    xpReward: 100,
    sections: [
      { id: "gl-vr", name: "Verbal Reasoning", bank: "vr", count: 10, offset: 0, minutes: 10 },
      { id: "gl-nvr", name: "Non-Verbal Reasoning", bank: "nvr", count: 10, offset: 0, minutes: 10 },
      { id: "gl-nr", name: "Numerical Reasoning", bank: "nr", count: 10, offset: 0, minutes: 10 },
      { id: "gl-voc", name: "Vocabulary Challenge", bank: "vr", count: 5, offset: 30, minutes: 5 },
    ],
  },
  cem: {
    name: "CEM",
    pathwayName: "CEM Practice Mock",
    badge: "CEM",
    color: "indigo",
    headerBg: "bg-indigo-600",
    description: "Two core sections covering the CEM Verbal and Numerical format.",
    totalMinutes: 30,
    xpReward: 80,
    sections: [
      { id: "cem-vr", name: "Verbal Reasoning", bank: "vr", count: 12, offset: 0, minutes: 15 },
      { id: "cem-nr", name: "Numerical Reasoning", bank: "nr", count: 12, offset: 0, minutes: 15 },
    ],
  },
  csse: {
    name: "CSSE",
    pathwayName: "CSSE Practice Mock",
    badge: "CSSE",
    color: "purple",
    headerBg: "bg-purple-600",
    description: "CSSE-style practice with an English & Language section and a Mathematics section.",
    totalMinutes: 40,
    xpReward: 90,
    sections: [
      { id: "csse-eng", name: "English & Language", bank: "vr", count: 15, offset: 0, minutes: 20 },
      { id: "csse-maths", name: "Mathematics", bank: "nr", count: 15, offset: 0, minutes: 20 },
    ],
  },
  iseb: {
    name: "ISEB Pre-Test",
    pathwayName: "ISEB Pre-Test Practice Mock",
    badge: "ISEB",
    color: "emerald",
    headerBg: "bg-emerald-600",
    description: "Four reasoning sections matching the ISEB Pre-Test structure.",
    totalMinutes: 40,
    xpReward: 110,
    sections: [
      { id: "iseb-vr", name: "Verbal Reasoning", bank: "vr", count: 8, offset: 0, minutes: 10 },
      { id: "iseb-nvr", name: "Non-Verbal Reasoning", bank: "nvr", count: 8, offset: 0, minutes: 10 },
      { id: "iseb-sr", name: "Spatial Reasoning", bank: "sr", count: 8, offset: 0, minutes: 10 },
      { id: "iseb-nr", name: "Numerical Reasoning", bank: "nr", count: 8, offset: 0, minutes: 10 },
    ],
  },
};

const BANKS: Record<BankKey, ReasoningQuestion[]> = {
  vr: verbalReasoningQuestions,
  nvr: nonVerbalReasoningQuestions,
  sr: spatialReasoningQuestions,
  nr: numericalReasoningQuestions,
};

// ─── Answer checking ──────────────────────────────────────────────────────────

function normalise(s: string): string {
  return s.trim().toLowerCase().replace(/^£/, "").replace(/°$/, "").trim();
}

function checkAnswer(question: ReasoningQuestion, input: string): boolean {
  const norm = normalise(input);
  const correct = normalise(question.answer);
  if (norm === correct) return true;
  const numA = parseFloat(norm), numB = parseFloat(correct);
  if (!isNaN(numA) && !isNaN(numB) && Math.abs(numA - numB) < 0.01) return true;
  if (question.alternatives) {
    return question.alternatives.some((alt) => normalise(alt) === norm);
  }
  return false;
}

// ─── Timer ────────────────────────────────────────────────────────────────────

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = "intro" | "section" | "between" | "results";

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MockPage({
  params,
}: {
  params: Promise<{ pathway: string }>;
}) {
  const { pathway } = use(params);
  const router = useRouter();

  const pathwayId = pathway as MockPathwayId;
  const config = MOCK_CONFIGS[pathwayId];

  const [mode, setMode] = useState<Mode>("intro");
  const [sectionIdx, setSectionIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [input, setInput] = useState("");
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [sectionAnswers, setSectionAnswers] = useState<boolean[]>([]);
  const [sectionResults, setSectionResults] = useState<MockSectionResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [saved, setSaved] = useState(false);
  const [priorAttempts, setPriorAttempts] = useState<{ count: number; best: number | null } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Examination Status / prior-attempt context (Sprint 6) — reuses
  // lib/mockProgress.ts's existing, unmodified functions; presentational
  // only, computed once on mount for the Pre-Exam Experience banner.
  useEffect(() => {
    setPriorAttempts({
      count: getMockCountForPathway(pathwayId),
      best: getBestMockScoreForPathway(pathwayId),
    });
  }, [pathwayId]);

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Mock not found.</p>
          <Link href="/mocks" className="text-blue-600 dark:text-blue-400 font-medium">Back to Mocks</Link>
        </div>
      </div>
    );
  }

  const currentSection = config.sections[sectionIdx];
  const sectionQuestions = currentSection
    ? BANKS[currentSection.bank].slice(currentSection.offset, currentSection.offset + currentSection.count)
    : [];
  const currentQuestion = sectionQuestions[questionIdx];

  // ── Timer management ────────────────────────────────────────────────────────

  const finishSection = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    const correct = sectionAnswers.filter(Boolean).length;
    const total = sectionAnswers.length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    const result: MockSectionResult = {
      sectionId: currentSection.id,
      sectionName: currentSection.name,
      bank: currentSection.bank,
      correct,
      total,
      score,
    };
    setSectionResults((prev) => [...prev, result]);
    setMode("between");
  }, [sectionAnswers, currentSection]);

  useEffect(() => {
    if (mode === "section") {
      setTimeLeft(currentSection.minutes * 60);
    }
  }, [mode, sectionIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (mode !== "section") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          finishSection();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, sectionIdx, finishSection]);

  // ── Save results ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (mode === "results" && !saved && sectionResults.length > 0) {
      const totalCorrect = sectionResults.reduce((s, r) => s + r.correct, 0);
      const totalQuestions = sectionResults.reduce((s, r) => s + r.total, 0);
      const totalScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

      const result = {
        id: `${pathwayId}-${Date.now()}`,
        pathway: pathwayId,
        pathwayName: config.pathwayName,
        date: new Date().toISOString(),
        totalScore,
        sectionResults,
        durationMinutes: config.totalMinutes,
      };
      saveMockResult(result);
      completeLesson("mock-test", totalScore, config.xpReward);
      trackEvent("mock_completed", { pathway: pathwayId, score: totalScore });
      setSaved(true);
    }
  }, [mode, saved, sectionResults, pathwayId, config]);

  // ── Answer submission ────────────────────────────────────────────────────────

  function submitAnswer() {
    if (!currentQuestion || answered) return;
    const correct = checkAnswer(currentQuestion, input);
    setWasCorrect(correct);
    setAnswered(true);
    setSectionAnswers((prev) => [...prev, correct]);
  }

  function nextQuestion() {
    setInput("");
    setAnswered(false);
    setWasCorrect(false);

    if (questionIdx + 1 < sectionQuestions.length) {
      setQuestionIdx((prev) => prev + 1);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      finishSection();
    }
  }

  function startSection() {
    setSectionAnswers([]);
    setQuestionIdx(0);
    setInput("");
    setAnswered(false);
    setWasCorrect(false);
    setMode("section");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function nextSection() {
    if (sectionIdx + 1 < config.sections.length) {
      setSectionIdx((prev) => prev + 1);
      startSection();
    } else {
      setMode("results");
    }
  }

  const totalScore =
    sectionResults.length > 0
      ? Math.round(
          (sectionResults.reduce((s, r) => s + r.correct, 0) /
            sectionResults.reduce((s, r) => s + r.total, 0)) *
            100
        )
      : 0;

  // ── Rendering ────────────────────────────────────────────────────────────────

  // INTRO
  if (mode === "intro") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className={`${config.headerBg} text-white`}>
          <div className="max-w-2xl mx-auto px-4 pt-4 pb-6">
            <Link href="/mocks" className="flex items-center gap-1.5 text-white text-opacity-80 text-sm mb-4 hover:text-opacity-100 transition">
              <ArrowLeft size={16} />
              Back to Mocks
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold bg-white bg-opacity-20 px-2.5 py-1 rounded-lg">
                {config.badge}
              </span>
              <h1 className="text-xl font-bold">{config.pathwayName}</h1>
            </div>
            <p className="text-sm text-white text-opacity-80">{config.description}</p>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          {/* Examination Status / prior attempts (Sprint 6) — real, reused
              data from lib/mockProgress.ts; shown only once loaded to avoid
              a flash of "not attempted" before the real state resolves. */}
          {priorAttempts && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center gap-2.5">
              <Trophy size={15} className="text-amber-500 shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {priorAttempts.count > 0
                  ? <>You&apos;ve taken this mock {priorAttempts.count} time{priorAttempts.count === 1 ? "" : "s"} · best score <strong className="text-gray-800 dark:text-gray-100">{priorAttempts.best}%</strong></>
                  : "You haven't attempted this mock yet — a good first rehearsal for exam day."}
              </p>
            </div>
          )}

          {/* Info */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-gray-400 dark:text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Total time: <strong>{config.totalMinutes} minutes</strong></span>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Skills Assessed</p>
              {config.sections.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
                    {i + 1}
                  </span>
                  <span className="flex-1">{s.name}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{s.count} questions · {s.minutes} min</span>
                </div>
              ))}
            </div>
          </div>

          {/* Why this mock / preparation guidance (Sprint 6) — static copy,
              lib/mockMeta.ts; presentation only, no scoring logic involved. */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Why this matters</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{MOCK_ADMISSION_RELEVANCE[pathwayId]}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Suggested preparation</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{MOCK_SUGGESTED_PREPARATION[pathwayId]}</p>
            </div>
          </div>

          {/* Rules */}
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 rounded-xl p-4">
            <div className="flex gap-2.5">
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1 leading-relaxed">
                <p className="font-semibold">Before you start</p>
                <p>Each section is timed separately. Type your answer and press Enter or tap Submit. Answers are not case-sensitive. Work through sections in order — you cannot go back.</p>
                <p className="mt-1 font-medium">This is original practice content and is not affiliated with {config.badge}.</p>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-400 dark:text-gray-500">
            Take your time reading each question — you&apos;re prepared for this.
          </p>

          <button
            onClick={() => {
              trackEvent("mock_started", { pathway: pathwayId });
              startSection();
            }}
            className={`w-full ${config.headerBg} text-white font-semibold py-4 rounded-2xl text-base transition-opacity hover:opacity-90`}
          >
            Start Mock Exam
          </button>
        </main>
      </div>
    );
  }

  // SECTION
  if (mode === "section" && currentQuestion) {
    const progress = ((questionIdx) / sectionQuestions.length) * 100;
    const isLow = timeLeft < 60;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex-1">
              {currentSection.name}
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 font-normal">
                Section {sectionIdx + 1}/{config.sections.length}
              </span>
            </span>
            <div className={`flex items-center gap-1 text-sm font-bold ${isLow ? "text-red-500" : "text-gray-700 dark:text-gray-300"}`}>
              <Clock size={15} />
              {formatTime(timeLeft)}
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-gray-100 dark:bg-gray-800">
            <div
              className={`h-1 transition-all duration-300 ${config.headerBg}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        {/* Question */}
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Question {questionIdx + 1} of {sectionQuestions.length}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{currentQuestion.category}</span>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <p className="text-base font-medium text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-line">
              {currentQuestion.question}
            </p>
          </div>

          {answered ? (
            <div className={`rounded-2xl border p-5 ${wasCorrect ? "bg-green-50 dark:bg-green-950 border-green-100 dark:border-green-900" : "bg-red-50 dark:bg-red-950 border-red-100 dark:border-red-900"}`}>
              <div className="flex items-start gap-2.5">
                {wasCorrect ? (
                  <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-semibold mb-1 ${wasCorrect ? "text-green-700 dark:text-green-300" : "text-red-600 dark:text-red-400"}`}>
                    {wasCorrect ? "Correct!" : `Incorrect — answer: ${currentQuestion.answer}`}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{currentQuestion.explanation}</p>
                </div>
              </div>
              <button
                onClick={nextQuestion}
                className={`w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 ${
                  wasCorrect ? "bg-green-600 text-white" : "bg-gray-700 text-white"
                }`}
              >
                {questionIdx + 1 < sectionQuestions.length ? "Next Question" : "End Section"}
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && input.trim() && submitAnswer()}
                placeholder="Type your answer…"
                className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3.5 text-base text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
              />
              <button
                onClick={submitAnswer}
                disabled={!input.trim()}
                className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all ${
                  input.trim()
                    ? `${config.headerBg} text-white hover:opacity-90`
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                }`}
              >
                Submit Answer
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  // BETWEEN SECTIONS
  if (mode === "between") {
    const lastResult = sectionResults[sectionResults.length - 1];
    const isLastSection = sectionIdx + 1 >= config.sections.length;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Section {sectionIdx + 1} Complete
            </span>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">
          <div className="text-center">
            <div className={`w-20 h-20 rounded-full ${config.headerBg} flex items-center justify-center mx-auto mb-4`}>
              <span className="text-2xl font-bold text-white">{lastResult?.score ?? 0}%</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{currentSection.name} done</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {lastResult?.correct ?? 0} correct out of {lastResult?.total ?? 0} questions
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
              {isLastSection ? "One more step — let's see your full result." : "Nice work — take a breath before the next section."}
            </p>
          </div>

          {/* Section summary */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-2">
            {sectionResults.map((r, i) => (
              <div key={r.sectionId} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 dark:text-gray-500 w-5">{i + 1}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{r.sectionName}</span>
                <span className={`text-sm font-bold ${r.score >= 75 ? "text-green-600" : r.score >= 55 ? "text-amber-600" : "text-red-500"}`}>
                  {r.score}%
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={nextSection}
            className={`w-full ${config.headerBg} text-white font-semibold py-4 rounded-2xl text-base flex items-center justify-center gap-2 hover:opacity-90 transition-opacity`}
          >
            {isLastSection ? (
              <>
                <Trophy size={18} />
                See Final Results
              </>
            ) : (
              <>
                Continue to {config.sections[sectionIdx + 1]?.name}
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </main>
      </div>
    );
  }

  // RESULTS
  if (mode === "results") {
    const totalCorrect = sectionResults.reduce((s, r) => s + r.correct, 0);
    const totalQs = sectionResults.reduce((s, r) => s + r.total, 0);
    const pct = totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : 0;
    const grade = pct >= 80 ? "Excellent" : pct >= 65 ? "Good" : pct >= 50 ? "Developing" : "Needs Practice";

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className={`${config.headerBg} text-white`}>
          <div className="max-w-2xl mx-auto px-4 pt-4 pb-6">
            <h1 className="text-lg font-bold mb-0.5">Mock Complete</h1>
            <p className="text-sm text-white text-opacity-80">{config.pathwayName}</p>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 -mt-3 pb-12 space-y-5">
          {/* Post-Exam Entry (Sprint 6) — one honest, reused-data line
              framing the transition into the existing results below;
              pct/grade are already computed above, nothing new here. */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 -mb-2">
            Every mock builds real exam-day readiness — here&apos;s how this one went.
          </p>

          {/* Score card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center shadow-sm">
            <div className={`text-5xl font-black mb-1 ${pct >= 75 ? "text-green-600" : pct >= 55 ? "text-amber-600" : "text-red-500"}`}>
              {pct}%
            </div>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-0.5">{grade}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">{totalCorrect} of {totalQs} questions correct</p>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-sm text-amber-600 font-semibold">
              <Trophy size={15} />
              +{config.xpReward} XP earned
            </div>
          </div>

          {/* Per-section breakdown */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Section Breakdown</p>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {sectionResults.map((r) => (
                <div key={r.sectionId} className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{r.sectionName}</p>
                    <div className="mt-1.5 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${r.score >= 75 ? "bg-green-500" : r.score >= 55 ? "bg-amber-400" : "bg-red-400"}`}
                        style={{ width: `${r.score}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${r.score >= 75 ? "text-green-600" : r.score >= 55 ? "text-amber-600" : "text-red-500"}`}>
                      {r.score}%
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{r.correct}/{r.total}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What to do next */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">What to do next</p>
            {pct < 60 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2">
                Focus on the sections where you scored lowest. Return to the practice modules to review those topics before attempting this mock again.
              </p>
            )}
            {pct >= 60 && pct < 80 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2">
                Good effort. Target the sections below 75% for extra practice, then retake this mock to track your improvement.
              </p>
            )}
            {pct >= 80 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2">
                Strong result. Try one of the other mock types to broaden your preparation, or increase your practice frequency to maintain this standard.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setSectionIdx(0);
                setSectionResults([]);
                setSaved(false);
                startSection();
              }}
              className="flex items-center justify-center gap-1.5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <RotateCcw size={15} />
              Retry Mock
            </button>
            <Link
              href="/mocks"
              className={`flex items-center justify-center gap-1.5 py-3.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 ${config.headerBg}`}
            >
              All Mocks
              <ChevronRight size={15} />
            </Link>
          </div>

          <Link
            href="/parent"
            className="block text-center text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors py-2"
          >
            View full report in Parent Dashboard
          </Link>
        </main>
      </div>
    );
  }

  return null;
}
