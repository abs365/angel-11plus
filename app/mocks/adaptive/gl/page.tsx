"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Clock, CheckCircle, XCircle, ChevronRight,
  Trophy, AlertCircle, Sparkles, Puzzle,
} from "lucide-react";
import PremiumLoader from "@/components/PremiumLoader";
import { withTimeout } from "@/lib/withTimeout";
import { verbalReasoningQuestions } from "@/data/verbal-reasoning";
import { nonVerbalReasoningQuestions } from "@/data/non-verbal-reasoning";
import { numericalReasoningQuestions } from "@/data/numerical-reasoning";
import { vrSyntheticFixture } from "@/data/ali/vrSyntheticFixture";
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
import { startMockAttempt, completeMockAttempt } from "@/lib/mockProgress";
import { trackEvent } from "@/lib/betaTracking";
import type { BankQuestion } from "@/types/ali/questionBank";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";
import type { ReasoningQuestion } from "@/types/reasoning";
import type { MockSectionResult, MockResult } from "@/types/mock";
import type { AdaptiveTier } from "@/types/adaptive";

// ─── Config — GL sections only. VR is the sole adaptive section this slice; ─
// NVR/NR/Vocabulary keep the existing static-slice approach (ALI_DECISION_
// LOG.md Decision 9). Deliberately duplicated (not imported) from
// app/mocks/[pathway]/page.tsx's MOCK_CONFIGS to keep the two routes
// structurally isolated (Decision 16) — this route never imports from or
// modifies that file.

const VR_SECTION = { id: "gl-vr-adaptive", name: "Verbal Reasoning", minutes: 10, count: 10 };
const STATIC_SECTIONS = [
  { id: "gl-nvr", name: "Non-Verbal Reasoning", questions: nonVerbalReasoningQuestions, count: 10, offset: 0, minutes: 10 },
  { id: "gl-nr", name: "Numerical Reasoning", questions: numericalReasoningQuestions, count: 10, offset: 0, minutes: 10 },
  { id: "gl-voc", name: "Vocabulary Challenge", questions: verbalReasoningQuestions, count: 5, offset: 30, minutes: 5 },
];

const TOTAL_MINUTES = VR_SECTION.minutes + STATIC_SECTIONS.reduce((s, sec) => s + sec.minutes, 0);
const XP_REWARD = 100;

// ─── Answer checking (duplicated from app/mocks/[pathway]/page.tsx by design — §Decision 16 isolation) ─

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

// ─── Types ────────────────────────────────────────────────────────────────

type Mode = "intro" | "loading" | "error" | "section" | "between" | "results";

interface RunnerSection {
  id: string;
  name: string;
  adaptive: boolean;
  questions: ReasoningQuestion[];
  minutes: number;
  bankQuestions?: BankQuestion[]; // only set for the adaptive section — needed to record outcomes
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function AdaptiveGlMockPage() {
  const [mode, setMode] = useState<Mode>("intro");
  const [errorMessage, setErrorMessage] = useState("");
  const [usingSyntheticFixture, setUsingSyntheticFixture] = useState(false);

  const [sections, setSections] = useState<RunnerSection[]>([]);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [input, setInput] = useState("");
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [sectionAnswers, setSectionAnswers] = useState<boolean[]>([]);
  const [sectionResults, setSectionResults] = useState<MockSectionResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [saved, setSaved] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const profileIdRef = useRef<string | null>(null);
  // Phase 4 Sprint 1, Increment 3 — the one canonical Attempt ID for the
  // whole mock lifecycle. Set once loadAndStart() succeeds (startMockAttempt
  // issues it), then reused unchanged as: the sessionId passed to
  // recordOutcome()/applyAttemptOutcome() (Question History + Durable
  // Mastery), and the completed MockResult's id (Mock Attempt Ledger). No
  // second identifier exists anywhere in this file.
  const sessionIdRef = useRef<string | null>(null);
  // Local mirror of the VR bank/history, kept in sync as questions are
  // answered (Phase ALI 1.3) — lets the Daily Mission bridge write
  // (recordAliCompetencySignal, below) compute a fresh competency signal
  // without a Supabase round-trip, exactly mirroring what recordOutcome()
  // writes for real via the same pure applyAttemptOutcome() function.
  const vrBankRef = useRef<BankQuestion[]>([]);
  const vrHistoryRef = useRef<Map<string, StudentQuestionHistoryRow>>(new Map());

  const currentSection = sections[sectionIdx];
  const currentQuestion = currentSection?.questions[questionIdx];

  // ── Load: resolve profile, fetch bank + history, build the adaptive VR section ──

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
      // — this route persists a real MockResult via completeMockAttempt(),
      // so it is a genuine Mock, not Practice; it must only ever draw from
      // fetchMockEligibleQuestionBank(), never the general fetchQuestionBank()
      // every Practice/Learn page correctly uses. Previously called
      // fetchQuestionBank(), which would have served real practice_eligible
      // content as "mock" content the moment any "gl"-tagged row existed —
      // not exploitable historically only because zero such rows exist.
      let bank = await withTimeout(fetchMockEligibleQuestionBank(supabase, "verbal-reasoning", "gl"), 10000, "today's questions");
      let synthetic = false;
      if (bank.length === 0) {
        // ali_question_bank has no mock_eligible rows for this pathway yet
        // — fall back to the synthetic dev fixture rather than failing
        // outright. Never silently mistaken for real content: the banner
        // below stays visible for the whole mock.
        bank = vrSyntheticFixture;
        synthetic = true;
      }
      setUsingSyntheticFixture(synthetic);

      const history: Map<string, StudentQuestionHistoryRow> = synthetic
        ? new Map()
        : await withTimeout(fetchStudentHistory(supabase, profileId), 10000, "your progress");
      const currentSequence = synthetic ? 0 : await withTimeout(ensureAdaptiveState(supabase, profileId), 10000, "your progress");

      const progress = getProgress();
      const report = computeAnalytics(progress);
      const vrSubject = report.subjects.find((s) => s.subject === "verbal-reasoning");
      const tier: AdaptiveTier = vrSubject ? computeSubjectConfidence(vrSubject, progress).tier : "foundation";

      const { questions: selected, trace } = buildAdaptiveSection(
        bank,
        history,
        currentSequence,
        tier,
        VR_SECTION.count,
        VR_SECTION.id
      );
      logSelectionTrace(trace); // internal/debugging only — never rendered (Phase ALI 1.1)

      vrBankRef.current = bank;
      vrHistoryRef.current = new Map(history);

      if (!synthetic && selected.length > 0) {
        await withTimeout(recordPresentation(supabase, profileId, selected.map((q) => q.id)), 10000, "today's questions");
      }

      const runnerSections: RunnerSection[] = [
        {
          id: VR_SECTION.id,
          name: VR_SECTION.name,
          adaptive: true,
          questions: selected.map((q) => q.prompt as ReasoningQuestion),
          minutes: VR_SECTION.minutes,
          bankQuestions: selected,
        },
        ...STATIC_SECTIONS.map((s) => ({
          id: s.id,
          name: s.name,
          adaptive: false,
          questions: s.questions.slice(s.offset, s.offset + s.count),
          minutes: s.minutes,
        })),
      ];

      setSections(runnerSections);
      setSectionIdx(0);
      setSectionResults([]);
      setSaved(false);
      sessionIdRef.current = startMockAttempt("gl", "GL Verbal Reasoning Practice");
      trackEvent("mock_started", { pathway: "gl", variant: "adaptive" });
      startSection(0, runnerSections);
    } catch {
      setErrorMessage("We couldn't prepare today's practice. Please try again.");
      setMode("error");
    }
  }

  function startSection(idx: number, sectionsList: RunnerSection[] = sections) {
    setSectionIdx(idx);
    setSectionAnswers([]);
    setQuestionIdx(0);
    setInput("");
    setAnswered(false);
    setWasCorrect(false);
    setMode("section");
    setTimeLeft(sectionsList[idx].minutes * 60);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  // ── Timer ──────────────────────────────────────────────────────────────

  const finishSection = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const correct = sectionAnswers.filter(Boolean).length;
    const total = sectionAnswers.length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    const result: MockSectionResult = {
      sectionId: currentSection.id,
      sectionName: currentSection.name,
      bank: currentSection.adaptive ? "vr" : currentSection.id,
      correct,
      total,
      score,
      adaptive: currentSection.adaptive,
    };
    setSectionResults((prev) => [...prev, result]);
    setMode("between");
  }, [sectionAnswers, currentSection]);

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

  // ── Save results + bridge write-back (ADAPTIVE_ASSESSMENT_ENGINE_IMPLEMENTATION_PLAN.md §0.5.3) ──

  useEffect(() => {
    if (mode === "results" && !saved && sectionResults.length > 0) {
      const totalCorrect = sectionResults.reduce((s, r) => s + r.correct, 0);
      const totalQuestions = sectionResults.reduce((s, r) => s + r.total, 0);
      const totalScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

      const result: MockResult = {
        id: sessionIdRef.current ?? `adaptive-gl-${Date.now()}`,
        pathway: "gl",
        pathwayName: "GL Verbal Reasoning Practice",
        date: new Date().toISOString(),
        totalScore,
        sectionResults,
        durationMinutes: TOTAL_MINUTES,
      };
      completeMockAttempt(result);

      // Bridge: subject-level score feeds computeSubjectConfidence() for the
      // *next* adaptive mock's tier, and Parent Insights via computeParentReport().
      const vrResult = sectionResults.find((r) => r.adaptive);
      if (vrResult) {
        completeLesson("verbal-reasoning", vrResult.score, Math.round(XP_REWARD * (vrResult.total / totalQuestions || 0)));
      }
      completeLesson("mock-test", totalScore, XP_REWARD);

      // ALI competency signal bridge (Phase ALI 1.3/1.4) — feeds Daily
      // Mission prioritisation and Parent Insights' competency-first
      // summaries without a Supabase round-trip. Purely additive; does not
      // touch `scores`/the Math.max ratchet. The previous cached signal is
      // read first so deriveCompetencySignal() can compute which
      // competencies became mastered as of THIS mock (recentlyMastered),
      // and so Learning Gain (internal only, Phase ALI 1.4 — never rendered
      // in any UI this phase) can compute a real improvement-over-time delta.
      if (vrBankRef.current.length > 0) {
        const previousProgress = getProgress();
        const previousSignal = previousProgress.aliCompetencySignal?.["verbal-reasoning"];
        const previousGain = previousProgress.aliLearningGain?.["verbal-reasoning"];

        const signal = deriveCompetencySignal(vrBankRef.current, vrHistoryRef.current, "verbal-reasoning", previousSignal);
        recordAliCompetencySignal("verbal-reasoning", signal);

        const gainDelta = computeLearningGainDelta(signal, previousSignal);
        recordAliLearningGain("verbal-reasoning", updateLearningGain("verbal-reasoning", previousGain, gainDelta));

        const latestProgress = getProgress();
        recordAliLearningProfile(computeLearningProfile(latestProgress.aliCompetencySignal ?? {}, latestProgress.aliLearningGain ?? {}));
      }

      trackEvent("mock_completed", { pathway: "gl", variant: "adaptive", score: totalScore });
      setSaved(true);
    }
  }, [mode, saved, sectionResults]);

  // ── Answer submission ────────────────────────────────────────────────────

  function submitAnswer() {
    if (!currentQuestion || answered) return;
    const correct = checkAnswer(currentQuestion, input);
    setWasCorrect(correct);
    setAnswered(true);
    setSectionAnswers((prev) => [...prev, correct]);

    if (currentSection.adaptive) {
      const bankQuestion = currentSection.bankQuestions?.[questionIdx];
      const supabase = getSupabaseClient();
      const profileId = profileIdRef.current;
      // Always set by this point — loadAndStart() assigns it before any
      // question can be answered. The fallback only guards TypeScript's
      // nullability, never expected to be exercised at runtime.
      const sessionId = sessionIdRef.current ?? `adaptive-gl-${Date.now()}`;
      if (bankQuestion && supabase && profileId && !usingSyntheticFixture) {
        recordOutcome(
          supabase,
          profileId,
          bankQuestion.id,
          correct,
          sessionId,
          bankQuestion.masteryThreshold
        ).catch(() => {});
      }

      // Local mirror (Phase ALI 1.3) — kept in sync via the same pure
      // applyAttemptOutcome() the real Supabase write uses, regardless of
      // whether the Supabase call above fired, so the end-of-mock
      // competency signal (below) is accurate even on the synthetic
      // fixture path.
      if (bankQuestion) {
        const current = vrHistoryRef.current.get(bankQuestion.id) ?? {
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
        const updated = applyAttemptOutcome(current, correct, sessionId, bankQuestion.masteryThreshold);
        vrHistoryRef.current.set(bankQuestion.id, { ...current, ...updated });
      }

      // Bridge into the existing coarse SkillType, so today's confidence/
      // replay/readiness functions see this result immediately (§0.5.3).
      recordSkillResult("verbal-reasoning", correct);
    }
  }

  function nextQuestion() {
    setInput("");
    setAnswered(false);
    setWasCorrect(false);
    if (questionIdx + 1 < currentSection.questions.length) {
      setQuestionIdx((prev) => prev + 1);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      finishSection();
    }
  }

  function nextSection() {
    if (sectionIdx + 1 < sections.length) {
      startSection(sectionIdx + 1);
    } else {
      setMode("results");
    }
  }

  // ── Rendering ────────────────────────────────────────────────────────────

  if (mode === "intro") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="bg-violet-700 text-white">
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
              <h1 className="text-xl font-bold">GL Verbal Reasoning</h1>
            </div>
            <p className="text-sm text-white/80">
              Verbal Reasoning questions matched to your practice level.
            </p>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-gray-400 dark:text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Total time: <strong>{TOTAL_MINUTES} minutes</strong></span>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sections</p>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-xs font-bold text-violet-600 dark:text-violet-300">1</span>
                <span className="flex-1">{VR_SECTION.name}</span>
                <Sparkles size={12} className="text-violet-500" />
                <span className="text-xs text-gray-400 dark:text-gray-500">{VR_SECTION.count} questions · {VR_SECTION.minutes} min</span>
              </div>
              {STATIC_SECTIONS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">{i + 2}</span>
                  <span className="flex-1">{s.name}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{s.count} questions · {s.minutes} min</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 rounded-xl p-4">
            <div className="flex gap-2.5">
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1 leading-relaxed">
                <p className="font-semibold">Before you start</p>
                <p>Section 1 selects questions matched to your level. Sections 2–4 are standard timed practice. This is original practice content and is not affiliated with GL Assessment.</p>
                <p>Section 1&apos;s question bank is currently a small sample set while we build out the full one, so you may see the same questions again across sessions.</p>
              </div>
            </div>
          </div>

          <button
            onClick={loadAndStart}
            className="w-full bg-violet-700 text-white font-semibold py-4 rounded-2xl text-base transition-opacity hover:opacity-90"
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
        message="Preparing your practice session…"
        progressMessages={["Choosing questions…", "Almost ready…"]}
        icon={Puzzle}
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
              className="bg-violet-700 text-white font-semibold text-sm px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
            <Link href="/mocks" className="text-violet-600 dark:text-violet-400 font-medium text-sm">Back to practice</Link>
          </div>
        </div>
      </div>
    );
  }

  // SECTION
  if (mode === "section" && currentQuestion && currentSection) {
    const progress = (questionIdx / currentSection.questions.length) * 100;
    const isLow = timeLeft < 60;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex-1 flex items-center gap-1.5">
              {currentSection.name}
              {currentSection.adaptive && <Sparkles size={12} className="text-violet-500" />}
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 font-normal">
                Section {sectionIdx + 1}/{sections.length}
              </span>
            </span>
            <div className={`flex items-center gap-1 text-sm font-bold ${isLow ? "text-red-500" : "text-gray-700 dark:text-gray-300"}`}>
              <Clock size={15} />
              {formatTime(timeLeft)}
            </div>
          </div>
          <div className="h-1 bg-gray-100 dark:bg-gray-800">
            <div className="h-1 transition-all duration-300 bg-violet-700" style={{ width: `${progress}%` }} />
          </div>
        </header>

        {usingSyntheticFixture && currentSection.adaptive && (
          <div className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs text-center py-1.5">
            Sample practice questions: not yet your full personalised set
          </div>
        )}

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Question {questionIdx + 1} of {currentSection.questions.length}
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
                    {wasCorrect ? "Correct!" : `Incorrect. Answer: ${currentQuestion.answer}`}
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
                {questionIdx + 1 < currentSection.questions.length ? "Next Question" : "End Section"}
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
                className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3.5 text-base text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
              />
              <button
                onClick={submitAnswer}
                disabled={!input.trim()}
                className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all ${
                  input.trim()
                    ? "bg-violet-700 text-white hover:opacity-90"
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
    const isLastSection = sectionIdx + 1 >= sections.length;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Section {sectionIdx + 1} Complete</span>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-violet-700 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">{lastResult?.score ?? 0}%</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{currentSection.name} done</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {lastResult?.correct ?? 0} correct out of {lastResult?.total ?? 0} questions
            </p>
          </div>

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
            className="w-full bg-violet-700 text-white font-semibold py-4 rounded-2xl text-base flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            {isLastSection ? (
              <>
                <Trophy size={18} />
                See Final Results
              </>
            ) : (
              <>
                Continue to {sections[sectionIdx + 1]?.name}
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
        <header className="bg-violet-700 text-white">
          <div className="max-w-2xl mx-auto px-4 pt-4 pb-6">
            <h1 className="text-lg font-bold mb-0.5">Practice Complete</h1>
            <p className="text-sm text-white/80">GL Verbal Reasoning</p>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 -mt-3 pb-12 space-y-5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center shadow-sm">
            <div className={`text-5xl font-black mb-1 ${pct >= 75 ? "text-green-600" : pct >= 55 ? "text-amber-600" : "text-red-500"}`}>
              {pct}%
            </div>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-0.5">{grade}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">{totalCorrect} of {totalQs} questions correct</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Section Breakdown</p>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {sectionResults.map((r) => (
                <div key={r.sectionId} className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
                      {r.sectionName}
                      {r.adaptive && <Sparkles size={11} className="text-violet-500" />}
                    </p>
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

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/mocks"
              className="text-center bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold py-3.5 rounded-2xl text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Back to Mocks
            </Link>
            <button
              onClick={loadAndStart}
              className="bg-violet-700 text-white font-semibold py-3.5 rounded-2xl text-sm hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
