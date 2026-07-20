"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle, XCircle, ChevronRight,
  AlertCircle, Sparkles, BookMarked,
} from "lucide-react";
import PremiumLoader from "@/components/PremiumLoader";
import { withTimeout } from "@/lib/withTimeout";
import { vocabularySyntheticFixture } from "@/data/ali/vocabularySyntheticFixture";
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
import type { BankQuestion, VocabularyPrompt } from "@/types/ali/questionBank";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";

// Phase ALI 2.2 — Vocabulary, the fourth ALI-covered subject and the second
// (after Reading Comprehension) to use a Learning Unit spanning more than
// one question. Reuses lib/ali/learningUnit.ts exactly as built for English
// — zero changes to that module, or to lib/ali/selection.ts,
// lib/adaptiveMockBuilder.ts, lib/adaptiveEngine.ts, or lib/parentInsights.ts.
// Learning Unit = one word + every item generated from it
// (VOCABULARY_COMPETENCY_FRAMEWORK.md §6). Correctness is exact-match MCQ,
// the simplest of the three grading paradigms ALI now covers (VR/Maths
// exact-match on a single value, English keyword-heuristic, Vocabulary
// exact-match on a selected option) — no full-marks-only special case
// needed (Decision 37 doesn't apply to a single-answer MCQ item).
// The existing flashcard/self-report activity (app/vocabulary/page.tsx) is
// completely untouched.

const XP_REWARD = 40;

type Mode = "intro" | "loading" | "error" | "section" | "results";

interface AnsweredItem {
  bankQuestion: BankQuestion;
  prompt: VocabularyPrompt;
  selected: string;
  isCorrect: boolean;
}

export default function AdaptiveVocabularyMockPage() {
  const [mode, setMode] = useState<Mode>("intro");
  const [errorMessage, setErrorMessage] = useState("");
  const [usingSyntheticFixture, setUsingSyntheticFixture] = useState(false);

  const [word, setWord] = useState("");
  const [items, setItems] = useState<{ bankQuestion: BankQuestion; prompt: VocabularyPrompt }[]>([]);
  const [itemIdx, setItemIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState<AnsweredItem[]>([]);
  const [saved, setSaved] = useState(false);

  const profileIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string>(`adaptive-vocabulary-${Date.now()}`);
  const bankRef = useRef<BankQuestion[]>([]);
  const historyRef = useRef<Map<string, StudentQuestionHistoryRow>>(new Map());
  const resultsRef = useRef<AnsweredItem[]>([]);

  const currentItem = items[itemIdx];

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

      let bank = await withTimeout(fetchQuestionBank(supabase, "vocabulary", "gl"), 10000, "today's word");
      let synthetic = false;
      if (bank.length === 0) {
        bank = vocabularySyntheticFixture;
        synthetic = true;
      }
      setUsingSyntheticFixture(synthetic);

      const history: Map<string, StudentQuestionHistoryRow> = synthetic
        ? new Map()
        : await withTimeout(fetchStudentHistory(supabase, profileId), 10000, "your progress");
      const currentSequence = synthetic ? 0 : await withTimeout(ensureAdaptiveState(supabase, profileId), 10000, "your progress");

      const units = groupQuestionsByLearningUnit(bank);
      const weakSkills = deriveWeakCompetencies(bank, history);
      const { unit, questions: selectedQuestions } = selectLearningUnit(units, history, currentSequence, weakSkills);

      if (!unit || selectedQuestions.length === 0) {
        setErrorMessage("No Vocabulary practice is available right now. Please try again shortly.");
        setMode("error");
        return;
      }

      bankRef.current = bank;
      historyRef.current = new Map(history);

      if (!synthetic) {
        await withTimeout(recordPresentation(supabase, profileId, selectedQuestions.map((q) => q.id)), 10000, "today's word");
      }

      const withPrompts = selectedQuestions.map((q) => ({ bankQuestion: q, prompt: q.prompt as VocabularyPrompt }));
      setWord(withPrompts[0].prompt.word);
      setItems(withPrompts);
      setItemIdx(0);
      setSelected(null);
      setAnswered(false);
      setResults([]);
      resultsRef.current = [];
      setSaved(false);
      setMode("section");
      trackEvent("mock_started", { pathway: "vocabulary", variant: "adaptive" });
    } catch {
      setErrorMessage("We couldn't prepare today's practice. Please try again.");
      setMode("error");
    }
  }

  function submitAnswer(option: string) {
    if (!currentItem || answered) return;
    const isCorrect = option === currentItem.prompt.correctAnswer;
    setSelected(option);
    setAnswered(true);

    const answeredItem: AnsweredItem = {
      bankQuestion: currentItem.bankQuestion,
      prompt: currentItem.prompt,
      selected: option,
      isCorrect,
    };
    resultsRef.current = [...resultsRef.current, answeredItem];

    const supabase = getSupabaseClient();
    const profileId = profileIdRef.current;
    if (supabase && profileId && !usingSyntheticFixture) {
      recordOutcome(
        supabase, profileId, currentItem.bankQuestion.id, isCorrect,
        sessionIdRef.current, currentItem.bankQuestion.masteryThreshold
      ).catch(() => {});
    }

    const current = historyRef.current.get(currentItem.bankQuestion.id) ?? {
      profileId: profileId ?? "unknown",
      questionId: currentItem.bankQuestion.id,
      source: "adaptive_mock",
      timesSeen: 0, timesCorrect: 0, distinctCorrectSessions: 0, lastCorrectSessionId: null,
      lastPresentedAt: new Date().toISOString(), lastPresentedAtSequence: 0,
      lastAttemptCorrect: null, secondLastAttemptCorrect: null, masteryState: "new" as const,
    };
    const updated = applyAttemptOutcome(current, isCorrect, sessionIdRef.current, currentItem.bankQuestion.masteryThreshold);
    historyRef.current.set(currentItem.bankQuestion.id, { ...current, ...updated });

    recordSkillResult(currentItem.prompt.skill, isCorrect);
  }

  function nextItem() {
    setSelected(null);
    setAnswered(false);
    if (itemIdx + 1 < items.length) {
      setItemIdx((i) => i + 1);
    } else {
      finishSection();
    }
  }

  function finishSection() {
    const finalResults = resultsRef.current;
    const correct = finalResults.filter((r) => r.isCorrect).length;
    const score = finalResults.length > 0 ? Math.round((correct / finalResults.length) * 100) : 0;
    const xp = Math.max(10, Math.round((correct / Math.max(finalResults.length, 1)) * XP_REWARD) + 10);

    completeLesson("vocab-adaptive", score, xp);

    if (bankRef.current.length > 0) {
      const previousProgress = getProgress();
      const previousSignal = previousProgress.aliCompetencySignal?.["vocabulary"];
      const previousGain = previousProgress.aliLearningGain?.["vocabulary"];

      const signal = deriveCompetencySignal(bankRef.current, historyRef.current, "vocabulary", previousSignal);
      recordAliCompetencySignal("vocabulary", signal);

      const gainDelta = computeLearningGainDelta(signal, previousSignal);
      recordAliLearningGain("vocabulary", updateLearningGain("vocabulary", previousGain, gainDelta));

      const latestProgress = getProgress();
      recordAliLearningProfile(computeLearningProfile(latestProgress.aliCompetencySignal ?? {}, latestProgress.aliLearningGain ?? {}));
    }

    trackEvent("mock_completed", { pathway: "vocabulary", variant: "adaptive", score });
    setResults(finalResults);
    setSaved(true);
    setMode("results");
  }

  // ── Rendering ────────────────────────────────────────────────────────────

  if (mode === "intro") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="bg-emerald-700 text-white">
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
              <h1 className="text-xl font-bold">Vocabulary Practice</h1>
            </div>
            <p className="text-sm text-white/80">
              A word matched to your practice level, with every question that belongs to it.
            </p>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">One word, with every question that belongs to it — synonyms, antonyms and usage in context, never split apart.</p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 rounded-xl p-4">
            <div className="flex gap-2.5">
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1 leading-relaxed">
                <p className="font-semibold">Before you start</p>
                <p>This is separate from the Vocabulary flashcards — a quick multiple-choice practice session instead.</p>
                <p>Our word bank is currently a small sample set while we build out the full one — you may see the same word again across sessions.</p>
              </div>
            </div>
          </div>

          <button
            onClick={loadAndStart}
            className="w-full bg-emerald-700 text-white font-semibold py-4 rounded-2xl text-base transition-opacity hover:opacity-90"
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
        message="Picking today's word…"
        progressMessages={["Choosing questions…", "Almost ready…"]}
        icon={BookMarked}
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
              className="bg-emerald-700 text-white font-semibold text-sm px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
            <Link href="/mocks" className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">Back to practice</Link>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "section" && currentItem) {
    const progress = (itemIdx / items.length) * 100;
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex-1 flex items-center gap-1.5">
              {word}
              <Sparkles size={12} className="text-emerald-500" />
            </span>
          </div>
          <div className="h-1 bg-gray-100 dark:bg-gray-800">
            <div className="h-1 transition-all duration-300 bg-emerald-700" style={{ width: `${progress}%` }} />
          </div>
        </header>

        {usingSyntheticFixture && (
          <div className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs text-center py-1.5">
            Sample word — not yet your full personalised set
          </div>
        )}

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-5">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Question {itemIdx + 1} of {items.length}
          </span>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <p className="text-base font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
              {currentItem.prompt.question}
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            {currentItem.prompt.options.map((option) => {
              const isSelected = selected === option;
              const isCorrectOption = option === currentItem.prompt.correctAnswer;
              let styling = "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100";
              if (answered && isCorrectOption) styling = "bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-800 text-green-700 dark:text-green-300";
              else if (answered && isSelected) styling = "bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400";

              return (
                <button
                  key={option}
                  onClick={() => submitAnswer(option)}
                  disabled={answered}
                  className={`text-left rounded-xl border px-4 py-3.5 text-sm font-medium transition-colors ${styling} ${!answered ? "hover:border-emerald-300" : ""}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {answered && (
            <div className={`rounded-2xl border p-5 ${currentItem.prompt.correctAnswer === selected ? "bg-green-50 dark:bg-green-950 border-green-100 dark:border-green-900" : "bg-red-50 dark:bg-red-950 border-red-100 dark:border-red-900"}`}>
              <div className="flex items-start gap-2.5 mb-2">
                {selected === currentItem.prompt.correctAnswer ? (
                  <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                )}
                <p className={`text-sm font-semibold ${selected === currentItem.prompt.correctAnswer ? "text-green-700 dark:text-green-300" : "text-red-600 dark:text-red-400"}`}>
                  {selected === currentItem.prompt.correctAnswer ? "Correct!" : `Incorrect — the answer is "${currentItem.prompt.correctAnswer}"`}
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{currentItem.bankQuestion.explanation}</p>
              <button
                onClick={nextItem}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 bg-emerald-700 text-white"
              >
                {itemIdx + 1 < items.length ? "Next Question" : "See Results"}
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  // RESULTS
  if (mode === "results" && saved) {
    const correct = results.filter((r) => r.isCorrect).length;
    const pct = results.length > 0 ? Math.round((correct / results.length) * 100) : 0;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="bg-emerald-700 text-white">
          <div className="max-w-2xl mx-auto px-4 pt-4 pb-6">
            <h1 className="text-lg font-bold mb-0.5">Practice Complete</h1>
            <p className="text-sm text-white/80">Vocabulary Practice — {word}</p>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 -mt-3 pb-12 space-y-5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center shadow-sm">
            <div className={`text-5xl font-black mb-1 ${pct >= 75 ? "text-green-600" : pct >= 55 ? "text-amber-600" : "text-red-500"}`}>
              {pct}%
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">{correct} of {results.length} correct</p>
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
              className="bg-emerald-700 text-white font-semibold py-3.5 rounded-2xl text-sm hover:opacity-90 transition-opacity"
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
