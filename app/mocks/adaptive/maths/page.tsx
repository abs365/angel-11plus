"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Clock, CheckCircle, XCircle, ChevronRight,
  AlertCircle, Sparkles, Calculator,
} from "lucide-react";
import PremiumLoader from "@/components/PremiumLoader";
import { withTimeout } from "@/lib/withTimeout";
import { mathsSyntheticFixture } from "@/data/ali/mathsSyntheticFixture";
import { getSupabaseClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/supabaseProgress";
import { fetchMockEligibleQuestionBank } from "@/lib/ali/questionBank";
import { fetchStudentHistory, ensureAdaptiveState, recordPresentation, recordOutcome } from "@/lib/ali/history";
import { buildAdaptiveSection } from "@/lib/adaptiveMockBuilder";
import { logSelectionTrace } from "@/lib/ali/observability";
import { applyAttemptOutcome } from "@/lib/ali/mastery";
import { deriveCompetencySignal } from "@/lib/ali/weakness";
import { computeLearningGainDelta, updateLearningGain } from "@/lib/ali/learningGain";
import { computeLearningProfile } from "@/lib/ali/learningProfile";
import { getProgress, recordSkillResult, completeLesson, recordAliCompetencySignal, recordAliLearningGain, recordAliLearningProfile } from "@/lib/progress";
import { computeAnalytics } from "@/lib/analytics";
import { computeSubjectConfidence } from "@/lib/adaptiveDifficulty";
import { formatTime } from "@/lib/formatTime";
import { trackEvent } from "@/lib/betaTracking";
import type { BankQuestion } from "@/types/ali/questionBank";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";
import type { MathsQuestion } from "@/types/index";
import type { AdaptiveTier } from "@/types/adaptive";

// Phase ALI 2.0 — the second ALI-covered subject, reusing every lib/ali/*
// module and lib/adaptiveMockBuilder.ts exactly as built for Verbal
// Reasoning (Slice 1). No new ALI logic anywhere in this file — only
// Mathematics-specific UI (numeric answer checking) and metadata (the
// question bank fetch is parameterised by subject="maths" instead of
// "verbal-reasoning"). See ALI_DECISION_LOG.md Decision 32.
//
// Standalone, not tied to a pathway — unlike the GL VR mock (Decision 19),
// there's no existing multi-section "Maths mock" concept to fit alongside;
// this is a single-section adaptive practice session, isolated from the
// existing app/maths/page.tsx experience (untouched by this phase).

// Angel UX V3 — "Maths Practice" is the only name a student sees; ALI's
// internal name (SECTION.id, "maths-adaptive") is unchanged and still used
// for tracking/bridge writes below — this is a presentation-only rename.
const SECTION = { id: "maths-adaptive", name: "Maths Practice", minutes: 12, count: 10 };
const XP_REWARD = 80;

// ─── Answer checking (numeric-aware, mirrors app/maths/page.tsx's pattern — duplicated by design, isolation) ─

function normalizeNumeric(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, "").replace(/^[£$€]/, "");
  if (!cleaned) return null;
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

function checkAnswer(question: MathsQuestion, input: string): boolean {
  const userRaw = input.trim().toLowerCase();
  const correctRaw = String(question.answer).trim().toLowerCase();

  const userNum = normalizeNumeric(userRaw);
  const correctNum = normalizeNumeric(correctRaw);
  if (userNum !== null && correctNum !== null) {
    return Math.abs(userNum - correctNum) < 0.0001;
  }
  return userRaw.replace(/\s/g, "") === correctRaw.replace(/\s/g, "");
}

type Mode = "intro" | "loading" | "error" | "section" | "results";

export default function AdaptiveMathsMockPage() {
  const [mode, setMode] = useState<Mode>("intro");
  const [errorMessage, setErrorMessage] = useState("");
  const [usingSyntheticFixture, setUsingSyntheticFixture] = useState(false);

  const [questions, setQuestions] = useState<MathsQuestion[]>([]);
  const [bankQuestions, setBankQuestions] = useState<BankQuestion[]>([]);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [input, setInput] = useState("");
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [saved, setSaved] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const profileIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string>(`adaptive-maths-${Date.now()}`);
  const bankRef = useRef<BankQuestion[]>([]);
  const historyRef = useRef<Map<string, StudentQuestionHistoryRow>>(new Map());

  const currentQuestion = questions[questionIdx];

  async function loadAndStart() {
    setMode("loading");
    setErrorMessage("");

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setErrorMessage("Practice needs a connection that isn't available right now. Please try again shortly.");
        setMode("error");
        return;
      }

      const profileId = await withTimeout(ensureProfile(), 10000, "your practice profile");
      if (!profileId) {
        setErrorMessage("We couldn't set up your practice profile. Please try again.");
        setMode("error");
        return;
      }
      profileIdRef.current = profileId;

      // Mock Content Firewall (CSSE Completion Programme Phase A, Decision 59)
      // — this route persists a real MockResult; must only draw from
      // fetchMockEligibleQuestionBank(), never the general fetchQuestionBank().
      let bank = await withTimeout(fetchMockEligibleQuestionBank(supabase, "maths", "gl"), 10000, "today's questions");
      let synthetic = false;
      if (bank.length === 0) {
        bank = mathsSyntheticFixture;
        synthetic = true;
      }
      setUsingSyntheticFixture(synthetic);

      const history: Map<string, StudentQuestionHistoryRow> = synthetic
        ? new Map()
        : await withTimeout(fetchStudentHistory(supabase, profileId), 10000, "your progress");
      const currentSequence = synthetic ? 0 : await withTimeout(ensureAdaptiveState(supabase, profileId), 10000, "your progress");

      const progress = getProgress();
      const report = computeAnalytics(progress);
      const mathsSubject = report.subjects.find((s) => s.subject === "maths");
      const tier: AdaptiveTier = mathsSubject ? computeSubjectConfidence(mathsSubject, progress).tier : "foundation";

      const { questions: selected, trace } = buildAdaptiveSection(
        bank,
        history,
        currentSequence,
        tier,
        SECTION.count,
        SECTION.id
      );
      logSelectionTrace(trace);

      bankRef.current = bank;
      historyRef.current = new Map(history);

      if (!synthetic && selected.length > 0) {
        await withTimeout(recordPresentation(supabase, profileId, selected.map((q) => q.id)), 10000, "today's questions");
      }

      setBankQuestions(selected);
      setQuestions(selected.map((q) => q.prompt as MathsQuestion));
      setQuestionIdx(0);
      setAnswers([]);
      setInput("");
      setAnswered(false);
      setWasCorrect(false);
      setSaved(false);
      setTimeLeft(SECTION.minutes * 60);
      setMode("section");
      trackEvent("mock_started", { pathway: "maths", variant: "adaptive" });
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch {
      setErrorMessage("We couldn't prepare today's practice. Please try again.");
      setMode("error");
    }
  }

  const finishSection = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setMode("results");
  }, []);

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
  }, [mode, finishSection]);

  // ── Save results + ALI bridge write-back (mirrors app/mocks/adaptive/gl/page.tsx exactly) ──

  useEffect(() => {
    if (mode === "results" && !saved && answers.length > 0) {
      const correct = answers.filter(Boolean).length;
      const score = Math.round((correct / answers.length) * 100);

      completeLesson("maths-reasoning", score, Math.round(XP_REWARD * (answers.length / SECTION.count)));

      if (bankRef.current.length > 0) {
        const previousProgress = getProgress();
        const previousSignal = previousProgress.aliCompetencySignal?.["maths"];
        const previousGain = previousProgress.aliLearningGain?.["maths"];

        const signal = deriveCompetencySignal(bankRef.current, historyRef.current, "maths", previousSignal);
        recordAliCompetencySignal("maths", signal);

        const gainDelta = computeLearningGainDelta(signal, previousSignal);
        recordAliLearningGain("maths", updateLearningGain("maths", previousGain, gainDelta));

        const latestProgress = getProgress();
        recordAliLearningProfile(computeLearningProfile(latestProgress.aliCompetencySignal ?? {}, latestProgress.aliLearningGain ?? {}));
      }

      trackEvent("mock_completed", { pathway: "maths", variant: "adaptive", score });
      setSaved(true);
    }
  }, [mode, saved, answers]);

  function submitAnswer() {
    if (!currentQuestion || answered) return;
    const correct = checkAnswer(currentQuestion, input);
    setWasCorrect(correct);
    setAnswered(true);
    setAnswers((prev) => [...prev, correct]);

    const bankQuestion = bankQuestions[questionIdx];
    const supabase = getSupabaseClient();
    const profileId = profileIdRef.current;
    if (bankQuestion && supabase && profileId && !usingSyntheticFixture) {
      recordOutcome(
        supabase,
        profileId,
        bankQuestion.id,
        correct,
        sessionIdRef.current,
        bankQuestion.masteryThreshold
      ).catch(() => {});
    }

    if (bankQuestion) {
      const current = historyRef.current.get(bankQuestion.id) ?? {
        profileId: profileId ?? "unknown",
        questionId: bankQuestion.id,
        source: "adaptive_mock",
        timesSeen: 0,
        timesCorrect: 0,
        distinctCorrectSessions: 0,
        lastCorrectSessionId: null,
        lastPresentedAt: new Date().toISOString(),
        lastPresentedAtSequence: 0,
        lastAttemptCorrect: null,
        secondLastAttemptCorrect: null,
        masteryState: "new" as const,
        lastAttemptTimeSeconds: null,
        lastAttemptSkipped: null,
        lastAttemptAnswerChanged: null,
        lastAttemptFirstAnswer: null,
        lastAttemptFinalAnswer: null,
        lastAttemptConfidenceRating: null,
        lastAttemptWorkingShown: null,
        firstSource: null,
        lastAttemptSupportTier: null,
      };
      const updated = applyAttemptOutcome(current, correct, sessionIdRef.current, bankQuestion.masteryThreshold);
      historyRef.current.set(bankQuestion.id, { ...current, ...updated });

      recordSkillResult(currentQuestion.skill, correct);
    }
  }

  function nextQuestion() {
    setInput("");
    setAnswered(false);
    setWasCorrect(false);
    if (questionIdx + 1 < questions.length) {
      setQuestionIdx((prev) => prev + 1);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      finishSection();
    }
  }

  // ── Rendering ────────────────────────────────────────────────────────────

  if (mode === "intro") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="bg-blue-700 text-white">
          <div className="max-w-2xl mx-auto px-4 pt-4 pb-6">
            <Link href="/mocks" className="flex items-center gap-1.5 text-white/80 text-sm mb-4 hover:text-white transition">
              <ArrowLeft size={16} />
              Back to Mocks
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Sparkles size={12} />
                Personalised
              </span>
              <h1 className="text-xl font-bold">Maths Practice</h1>
            </div>
            <p className="text-sm text-white/80">
              Questions matched to your practice level.
            </p>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-gray-400 dark:text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Time: <strong>{SECTION.minutes} minutes</strong></span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{SECTION.count} questions across arithmetic, fractions, percentages, geometry and more, matched to your level.</p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 rounded-xl p-4">
            <div className="flex gap-2.5">
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1 leading-relaxed">
                <p className="font-semibold">Before you start</p>
                <p>This is original practice content. The question bank is currently a small sample set while we build out the full one, so you may see the same questions again across sessions.</p>
              </div>
            </div>
          </div>

          <button
            onClick={loadAndStart}
            className="w-full bg-blue-700 text-white font-semibold py-4 rounded-2xl text-base transition-opacity hover:opacity-90"
          >
            Start Practice
          </button>
        </main>
      </div>
    );
  }

  if (mode === "loading") {
    return (
      <PremiumLoader
        message="Getting your questions ready…"
        progressMessages={["Choosing questions…", "Almost ready…"]}
        icon={Calculator}
      />
    );
  }

  if (mode === "error") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-gray-900 dark:text-gray-100 font-semibold mb-2">We couldn&apos;t prepare today&apos;s practice.</p>
          <p className="text-gray-700 dark:text-gray-300 mb-5 text-sm">{errorMessage}</p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={loadAndStart}
              className="bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
            <Link href="/mocks" className="text-blue-600 dark:text-blue-400 font-medium text-sm">Back to practice</Link>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "section" && currentQuestion) {
    const progress = (questionIdx / questions.length) * 100;
    const isLow = timeLeft < 60;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex-1 flex items-center gap-1.5">
              {SECTION.name}
              <Sparkles size={12} className="text-blue-500" />
            </span>
            <div className={`flex items-center gap-1 text-sm font-bold ${isLow ? "text-red-500" : "text-gray-700 dark:text-gray-300"}`}>
              <Clock size={15} />
              {formatTime(timeLeft)}
            </div>
          </div>
          <div className="h-1 bg-gray-100 dark:bg-gray-800">
            <div className="h-1 transition-all duration-300 bg-blue-700" style={{ width: `${progress}%` }} />
          </div>
        </header>

        {usingSyntheticFixture && (
          <div className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs text-center py-1.5">
            Sample practice questions: not yet your full personalised set
          </div>
        )}

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-5">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Question {questionIdx + 1} of {questions.length}
          </span>

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
                <p className={`text-sm font-semibold ${wasCorrect ? "text-green-700 dark:text-green-300" : "text-red-600 dark:text-red-400"}`}>
                  {wasCorrect ? "Correct!" : `Incorrect. Answer: ${currentQuestion.answer}`}
                </p>
              </div>
              <button
                onClick={nextQuestion}
                className={`w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 ${
                  wasCorrect ? "bg-green-600 text-white" : "bg-gray-700 text-white"
                }`}
              >
                {questionIdx + 1 < questions.length ? "Next Question" : "See Results"}
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
                    ? "bg-blue-700 text-white hover:opacity-90"
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

  // RESULTS
  if (mode === "results") {
    const correct = answers.filter(Boolean).length;
    const pct = answers.length > 0 ? Math.round((correct / answers.length) * 100) : 0;
    const grade = pct >= 80 ? "Excellent" : pct >= 65 ? "Good" : pct >= 50 ? "Developing" : "Needs Practice";

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="bg-blue-700 text-white">
          <div className="max-w-2xl mx-auto px-4 pt-4 pb-6">
            <h1 className="text-lg font-bold mb-0.5">Practice Complete</h1>
            <p className="text-sm text-white/80">{SECTION.name}</p>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 -mt-3 pb-12 space-y-5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center shadow-sm">
            <div className={`text-5xl font-black mb-1 ${pct >= 75 ? "text-green-600" : pct >= 55 ? "text-amber-600" : "text-red-500"}`}>
              {pct}%
            </div>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-0.5">{grade}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">{correct} of {answers.length} questions correct</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/mocks"
              className="text-center bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold py-3.5 rounded-2xl text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Back to Mocks
            </Link>
            <button
              onClick={loadAndStart}
              className="bg-blue-700 text-white font-semibold py-3.5 rounded-2xl text-sm hover:opacity-90 transition-opacity"
            >
              New Session
            </button>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
