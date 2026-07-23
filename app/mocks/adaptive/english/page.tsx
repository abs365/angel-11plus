"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft, Clock, CheckCircle, ChevronDown, ChevronUp,
  Lightbulb, AlertCircle, Sparkles, BookOpen,
} from "lucide-react";
import PremiumLoader from "@/components/PremiumLoader";
import { withTimeout } from "@/lib/withTimeout";
import { englishSyntheticFixture } from "@/data/ali/englishSyntheticFixture";
import { getSupabaseClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/supabaseProgress";
import { fetchQuestionBank } from "@/lib/ali/questionBank";
import { fetchStudentHistory, ensureAdaptiveState, recordPresentation, recordOutcome } from "@/lib/ali/history";
import { groupQuestionsByLearningUnit, selectLearningUnit } from "@/lib/ali/learningUnit";
import { deriveWeakCompetencies, deriveCompetencySignal } from "@/lib/ali/weakness";
import { applyAttemptOutcome } from "@/lib/ali/mastery";
import { computeLearningGainDelta, updateLearningGain } from "@/lib/ali/learningGain";
import { computeLearningProfile } from "@/lib/ali/learningProfile";
import { getProgress, recordSkillResult, completeLesson, recordAliCompetencySignal, recordAliLearningGain, recordAliLearningProfile } from "@/lib/progress";
import { trackEvent } from "@/lib/betaTracking";
import type { BankQuestion, EnglishComprehensionPrompt } from "@/types/ali/questionBank";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";

const PassagePlayer = dynamic(() => import("@/components/PassagePlayer"), { ssr: false });

// Phase ALI 2.1 — Reading Comprehension, the third ALI-covered subject and
// the first to introduce the Learning Unit concept (ALI_DECISION_LOG.md
// Decision 36): selection picks one passage (never splitting it apart),
// via lib/ali/learningUnit.ts — new code, not a change to lib/ali/
// selection.ts or lib/adaptiveMockBuilder.ts, both of which VR/Maths still
// use untouched. Answer scoring reuses app/english/[id]/page.tsx's
// keyword-overlap heuristic, duplicated locally by design (isolation
// convention, same as the Maths route's numeric-check duplication).
// "Correct" for ALI purposes = full marks only (ALI_ENGLISH_IMPLEMENTATION_
// PLAN.md §2.2) — an intentional first-pass simplification, documented, not
// a partial-credit-aware model.

const SECTION_ID = "english-adaptive";
const XP_REWARD = 60;

// ─── Answer scoring (keyword-overlap heuristic, mirrors app/english/[id]/page.tsx exactly — duplicated by design, isolation) ───

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "in", "on", "at", "to", "of", "and", "or",
  "but", "that", "this", "with", "as", "it", "its", "he", "she", "they", "his", "her",
  "their", "we", "be", "been", "being", "have", "has", "had", "do", "does", "did", "for",
  "from", "by", "not", "which", "who", "what", "how", "when", "there", "more", "so",
  "than", "if", "up", "into", "over", "after", "before", "about", "would", "could",
  "should", "make", "use", "also", "very", "just", "even", "like", "some", "all",
  "one", "two", "no", "can", "will", "may", "might", "much", "then", "these", "those",
  "my", "your", "our", "him", "them", "us", "me", "you", "said", "says",
]);

function extractKeywords(text: string): string[] {
  return [...new Set(
    text
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
  )];
}

function scoreAnswer(userAnswer: string, modelAnswer: string | undefined, maxMarks: number): number {
  const trimmed = userAnswer.trim();
  if (!trimmed || trimmed.length < 8) return 0;

  if (!modelAnswer) {
    return trimmed.length >= 40 ? maxMarks : Math.max(1, Math.round(maxMarks / 2));
  }

  const keywords = extractKeywords(modelAnswer);
  const userLower = trimmed.toLowerCase();
  const hits = keywords.filter((kw) => userLower.includes(kw)).length;
  const ratio = keywords.length > 0 ? hits / keywords.length : 0;
  const lengthOk = trimmed.length >= 40 + maxMarks * 8;

  if (trimmed.length < 15 && hits === 0) return 0;
  if (hits === 0 && trimmed.length < 60) return 0;
  if (lengthOk && ratio >= 0.18) return maxMarks;
  return Math.max(1, Math.round(maxMarks / 2));
}

type Mode = "intro" | "loading" | "error" | "section" | "results";

interface AnsweredQuestion {
  bankQuestion: BankQuestion;
  prompt: EnglishComprehensionPrompt;
  userAnswer: string;
  earnedMarks: number;
  isCorrect: boolean; // full-marks-only rule
}

export default function AdaptiveEnglishMockPage() {
  const [mode, setMode] = useState<Mode>("intro");
  const [errorMessage, setErrorMessage] = useState("");
  const [usingSyntheticFixture, setUsingSyntheticFixture] = useState(false);

  const [passageTitle, setPassageTitle] = useState("");
  const [passageText, setPassageText] = useState("");
  const [questions, setQuestions] = useState<{ bankQuestion: BankQuestion; prompt: EnglishComprehensionPrompt }[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<AnsweredQuestion[]>([]);
  const [saved, setSaved] = useState(false);

  const profileIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string>(`adaptive-english-${Date.now()}`);
  const bankRef = useRef<BankQuestion[]>([]);
  const historyRef = useRef<Map<string, StudentQuestionHistoryRow>>(new Map());

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

      let bank = await withTimeout(fetchQuestionBank(supabase, "english", "gl"), 10000, "today's passage");
      let synthetic = false;
      if (bank.length === 0) {
        bank = englishSyntheticFixture;
        synthetic = true;
      }
      setUsingSyntheticFixture(synthetic);

      const history: Map<string, StudentQuestionHistoryRow> = synthetic
        ? new Map()
        : await withTimeout(fetchStudentHistory(supabase, profileId), 10000, "your progress");
      const currentSequence = synthetic ? 0 : await withTimeout(ensureAdaptiveState(supabase, profileId), 10000, "your progress");

      const units = groupQuestionsByLearningUnit(bank);
      const weakSkills = deriveWeakCompetencies(bank, history);
      const { unit, questions: selected, trace } = selectLearningUnit(units, history, currentSequence, weakSkills);

      // Learning Unit selection has no difficulty-tier target distribution
      // (MockGenerationTrace's `confidenceInfluence` is a VR/Maths-specific
      // concept — see lib/ali/learningUnit.ts) — logged directly here rather
      // than forced into lib/ali/observability.ts's logSelectionTrace() shape.
      if (typeof console !== "undefined") {
        console.log(`[ALI][trace] unit=${unit?.id ?? "none"} questions=${trace.length}`);
        for (const entry of trace) {
          console.log(
            `  ${entry.questionId} [${entry.competency}] ${entry.selectionReason}` +
              (entry.replayReason ? ` — ${entry.replayReason}` : "")
          );
        }
      }

      if (!unit || selected.length === 0) {
        setErrorMessage("No Reading Comprehension passages are available right now. Please try again shortly.");
        setMode("error");
        return;
      }

      bankRef.current = bank;
      historyRef.current = new Map(history);

      if (!synthetic) {
        await withTimeout(recordPresentation(supabase, profileId, selected.map((q) => q.id)), 10000, "today's passage");
      }

      const withPrompts = selected.map((q) => ({ bankQuestion: q, prompt: q.prompt as EnglishComprehensionPrompt }));
      const first = withPrompts[0].prompt;
      setPassageTitle(first.passageTitle);
      setPassageText(first.passageText);
      setQuestions(withPrompts);
      setAnswers({});
      setShowHints({});
      setResults([]);
      setSaved(false);
      setMode("section");
      trackEvent("mock_started", { pathway: "english", variant: "adaptive" });
    } catch {
      setErrorMessage("We couldn't prepare today's practice. Please try again.");
      setMode("error");
    }
  }

  function handleSubmit() {
    const answered: AnsweredQuestion[] = questions.map(({ bankQuestion, prompt }) => {
      const userAnswer = answers[prompt.id] ?? "";
      const earnedMarks = scoreAnswer(userAnswer, prompt.modelAnswer, prompt.marks);
      const isCorrect = earnedMarks === prompt.marks; // full-marks-only rule, §2.2
      return { bankQuestion, prompt, userAnswer, earnedMarks, isCorrect };
    });

    const supabase = getSupabaseClient();
    const profileId = profileIdRef.current;

    for (const { bankQuestion, isCorrect, prompt } of answered) {
      if (supabase && profileId && !usingSyntheticFixture) {
        recordOutcome(
          supabase,
          profileId,
          bankQuestion.id,
          isCorrect,
          sessionIdRef.current,
          bankQuestion.masteryThreshold
        ).catch(() => {});
      }

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
      };
      const updated = applyAttemptOutcome(current, isCorrect, sessionIdRef.current, bankQuestion.masteryThreshold);
      historyRef.current.set(bankQuestion.id, { ...current, ...updated });

      recordSkillResult(prompt.skill, isCorrect);
    }

    const totalMarks = answered.reduce((sum, a) => sum + a.prompt.marks, 0);
    const earnedMarks = answered.reduce((sum, a) => sum + a.earnedMarks, 0);
    const score = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;
    const xp = Math.max(10, Math.round((earnedMarks / Math.max(totalMarks, 1)) * XP_REWARD) + 10);

    completeLesson("eng-adaptive", score, xp);

    if (bankRef.current.length > 0) {
      const previousProgress = getProgress();
      const previousSignal = previousProgress.aliCompetencySignal?.["english"];
      const previousGain = previousProgress.aliLearningGain?.["english"];

      const signal = deriveCompetencySignal(bankRef.current, historyRef.current, "english", previousSignal);
      recordAliCompetencySignal("english", signal);

      const gainDelta = computeLearningGainDelta(signal, previousSignal);
      recordAliLearningGain("english", updateLearningGain("english", previousGain, gainDelta));

      const latestProgress = getProgress();
      recordAliLearningProfile(computeLearningProfile(latestProgress.aliCompetencySignal ?? {}, latestProgress.aliLearningGain ?? {}));
    }

    trackEvent("mock_completed", { pathway: "english", variant: "adaptive", score });
    setResults(answered);
    setSaved(true);
    setMode("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const answeredCount = questions.filter((q) => (answers[q.prompt.id] ?? "").trim().length > 0).length;

  // ── Rendering ────────────────────────────────────────────────────────────

  if (mode === "intro") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="bg-purple-700 text-white">
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
              <h1 className="text-xl font-bold">Reading Practice</h1>
            </div>
            <p className="text-sm text-white/80">
              A passage matched to your practice level, with every question that belongs to it.
            </p>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-gray-400 dark:text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Around <strong>10-15 minutes</strong></span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">One passage, with every question that belongs to it — never split apart.</p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 rounded-xl p-4">
            <div className="flex gap-2.5">
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1 leading-relaxed">
                <p className="font-semibold">Before you start</p>
                <p>Your answers are compared to a model answer to check for full marks. Read the model answer afterwards to see what to improve.</p>
                <p>Our passage bank is currently a small sample set while we build out the full one — you may see the same passage again across sessions.</p>
              </div>
            </div>
          </div>

          <button
            onClick={loadAndStart}
            className="w-full bg-purple-700 text-white font-semibold py-4 rounded-2xl text-base transition-opacity hover:opacity-90"
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
        message="Finding the perfect passage…"
        progressMessages={["Choosing questions…", "Almost ready…"]}
        icon={BookOpen}
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
              className="bg-purple-700 text-white font-semibold text-sm px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
            <Link href="/mocks" className="text-purple-600 dark:text-purple-400 font-medium text-sm">Back to practice</Link>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "section") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex-1 flex items-center gap-1.5">
              Reading Practice
              <Sparkles size={12} className="text-purple-500" />
            </span>
          </div>
        </header>

        {usingSyntheticFixture && (
          <div className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs text-center py-1.5">
            Sample passage — not yet your full personalised set
          </div>
        )}

        <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          <div className="mb-1">
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-xl mb-1">{passageTitle}</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm">{questions.length} questions</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide mb-3">
              Read carefully
            </p>
            <PassagePlayer passage={passageText} />
            <div className="prose prose-sm max-w-none">
              {passageText.split("\n\n").map((para, i) => (
                <p key={i} className="text-gray-800 dark:text-gray-100 text-[15px] leading-[1.8] mb-4 last:mb-0">
                  {para}
                </p>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {questions.map(({ prompt }, qi) => (
              <div key={prompt.id} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                      {qi + 1}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">[{prompt.marks} mark{prompt.marks !== 1 ? "s" : ""}]</span>
                  </div>
                </div>

                <p className="text-gray-800 dark:text-gray-100 font-medium text-[15px] leading-relaxed mb-4">
                  {prompt.question}
                </p>

                <textarea
                  value={answers[prompt.id] ?? ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [prompt.id]: e.target.value }))}
                  placeholder="Write your answer here..."
                  rows={4}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                />

                {prompt.hint && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setShowHints((prev) => ({ ...prev, [prompt.id]: !prev[prompt.id] }))}
                      className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 dark:hover:bg-amber-900 px-3 py-1.5 rounded-lg transition-colors font-medium"
                    >
                      <Lightbulb size={12} />
                      {showHints[prompt.id] ? "Hide hint" : "Show hint"}
                      {showHints[prompt.id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>
                )}
                {showHints[prompt.id] && prompt.hint && (
                  <div className="mt-2 bg-amber-50 dark:bg-amber-950 rounded-xl p-3">
                    <p className="text-amber-700 dark:text-amber-300 text-sm">{prompt.hint}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {answeredCount} of {questions.length} answered
              </p>
              <div className="flex-1 mx-4 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all"
                  style={{ width: `${(answeredCount / Math.max(questions.length, 1)) * 100}%` }}
                />
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={answeredCount === 0}
              className="w-full bg-purple-700 text-white rounded-xl py-4 font-semibold text-base hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Submit Answers
            </button>
          </div>
        </main>
      </div>
    );
  }

  // RESULTS
  if (mode === "results" && saved) {
    const totalMarks = results.reduce((sum, r) => sum + r.prompt.marks, 0);
    const earnedMarks = results.reduce((sum, r) => sum + r.earnedMarks, 0);
    const pct = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="bg-purple-700 text-white">
          <div className="max-w-2xl mx-auto px-4 pt-4 pb-6">
            <h1 className="text-lg font-bold mb-0.5">Practice Complete</h1>
            <p className="text-sm text-white/80">Reading Practice</p>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 -mt-3 pb-12 space-y-5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center shadow-sm">
            <div className={`text-5xl font-black mb-1 ${pct >= 75 ? "text-green-600" : pct >= 55 ? "text-amber-600" : "text-red-500"}`}>
              {pct}%
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">{earnedMarks} of {totalMarks} marks</p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 rounded-2xl p-5">
            <p className="text-amber-800 dark:text-amber-200 font-semibold text-sm mb-1">Review Model Answers</p>
            <p className="text-amber-700 dark:text-amber-300 text-sm">
              Compare your responses to the model answers below to identify what to improve.
            </p>
          </div>

          {results.map((r) => (
            <div key={r.prompt.id} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                {r.isCorrect ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-500">{r.earnedMarks}/{r.prompt.marks} marks</span>
                )}
              </div>
              <p className="text-gray-800 dark:text-gray-100 font-medium text-sm mb-3">{r.prompt.question}</p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-3">
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-1">Your answer:</p>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {r.userAnswer.trim() || <em className="text-gray-400 dark:text-gray-500">Not answered</em>}
                </p>
              </div>
              {r.prompt.modelAnswer && (
                <div className="bg-green-50 dark:bg-green-950 rounded-xl p-3">
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Model answer:</p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{r.prompt.modelAnswer}</p>
                </div>
              )}
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/mocks"
              className="text-center bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold py-3.5 rounded-2xl text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Back to Mocks
            </Link>
            <button
              onClick={loadAndStart}
              className="bg-purple-700 text-white font-semibold py-3.5 rounded-2xl text-sm hover:opacity-90 transition-opacity"
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
