"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowRight, Lightbulb, AlertTriangle, Target } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
import { getSupabaseClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/supabaseProgress";
import { withTimeout } from "@/lib/withTimeout";
import { getSelectedPathwayId, setSelectedPathway } from "@/lib/progress";
import { fetchQuestionBank } from "@/lib/ali/questionBank";
import { recordPresentation, recordOutcome } from "@/lib/ali/history";
import {
  getEducationalIntelligence,
  processEvidenceForCompetency,
  type EducationalIntelligenceSnapshot,
} from "@/lib/learningEngine/educationalIntelligenceService";
import { checkMathsAnswer } from "@/lib/learningEngine/practiceContent";
import { realEvidenceLabel } from "@/lib/learningEngine/progressionLabel";
import type { BankQuestion } from "@/types/ali/questionBank";
import type { MathsQuestion } from "@/types/index";

/**
 * Mathematics Learning Sequence Expansion (Educational Increment 002) —
 * "Finding a Percentage of a Number" (MR-04, QT-MR-04). Full teaching
 * content, evidence basis and selection rationale in
 * knowledge/.../mathematics-reference-vertical/MATHEMATICS_LESSON_002_*.md.
 *
 * Deliberately the same structure as Lesson 001
 * (app/learning-intelligence/learn/mathematics/arithmetic/page.tsx):
 * concept -> method -> worked examples -> guided attempt (bounded 3-attempt
 * ladder) -> common mistakes -> independent check (bounded remediation
 * ladder + fresh transfer) -> exam application -> next step. Reusing the
 * proven pattern per the governing instruction's own "reuse the successful
 * Mathematics Reference Vertical architecture" — not re-derived, and not
 * forced where it wouldn't fit (this lesson has no compound-answer or
 * cross-zero-borrowing equivalent, so there is no visual regrouping section
 * here, unlike Lesson 001's place-value regroup steps).
 *
 * No architecture terms (MR-04, QT-MR-04, EMC-4) are shown to the learner
 * anywhere below — only in code comments, for internal traceability.
 */

const COMPETENCY_ID = "MR-04" as const;

type Mode = "intro" | "loading" | "error" | "lesson";
type CheckStage = "not-started" | "guided" | "independent" | "done";
type GuidedLadderStage = "attempt-1" | "attempt-2" | "attempt-3" | "resolved";
type IndependentLadderStage = "attempt-1" | "attempt-2" | "remediation" | "resolved";

/**
 * Deterministic, hand-verified wrong-answer lookup for these two specific
 * fixed problems only — same discipline as Lesson 001's own
 * classifyWrongAnswer(), see MATHEMATICS_LESSON_002_MISCONCEPTION_MAP.md
 * for the full KNOWN MISCONCEPTION PATTERN vs NON-DIAGNOSTIC distinction.
 * Any wrong answer that doesn't exactly match returns null and the
 * feedback stays honestly generic.
 */
interface KnownMisconception {
  wrongAnswer: number;
  explanation: string;
}
const GUIDED_KNOWN_MISCONCEPTIONS: KnownMisconception[] = [
  {
    // 15% of 80: found 10% (8) and stopped, never adding the extra 5%.
    wrongAnswer: 8,
    explanation:
      "It looks like 10% may have been found, but the lesson doesn't stop there. 15% needs the extra 5% added on too.",
  },
];
const INDEPENDENT_KNOWN_MISCONCEPTIONS: KnownMisconception[] = [
  {
    // 20% of 90: found 10% (9) and left it there instead of doubling.
    wrongAnswer: 9,
    explanation:
      "It looks like 10% may have been found, but the answer needs doubling to reach 20%, not left as 10%.",
  },
];

function classifyWrongAnswer(userAnswer: string, patterns: KnownMisconception[]): string | null {
  const parsed = Number(userAnswer.trim());
  if (Number.isNaN(parsed)) return null;
  return patterns.find((p) => p.wrongAnswer === parsed)?.explanation ?? null;
}

function progressionLabel(
  checkStage: CheckStage,
  educationalState: EducationalIntelligenceSnapshot["educationalState"] | undefined
): { label: string; description: string } {
  if (checkStage === "not-started" && (educationalState === undefined || educationalState === "exploring")) {
    return { label: "Learning", description: "Working through the lesson." };
  }
  if (checkStage === "guided") {
    return { label: "Ready to practise", description: "The guided step is done. Next is trying one alone." };
  }
  return realEvidenceLabel(educationalState);
}

export default function MathematicsPercentagesLessonPage() {
  const [mode, setMode] = useState<Mode>("intro");
  const [errorMessage, setErrorMessage] = useState("");
  const [guidedItem, setGuidedItem] = useState<BankQuestion | null>(null);
  const [independentItem, setIndependentItem] = useState<BankQuestion | null>(null);
  const [independentRetryItem, setIndependentRetryItem] = useState<BankQuestion | null>(null);
  const [educationalState, setEducationalState] = useState<EducationalIntelligenceSnapshot["educationalState"] | undefined>(undefined);

  const [checkStage, setCheckStage] = useState<CheckStage>("not-started");
  const [hintsShown, setHintsShown] = useState(0);
  const [guidedAnswer, setGuidedAnswer] = useState("");
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [guidedLadderStage, setGuidedLadderStage] = useState<GuidedLadderStage>("attempt-1");
  const [guidedAttempt1, setGuidedAttempt1] = useState<{ answer: string; correct: boolean } | null>(null);
  const [guidedAttempt2, setGuidedAttempt2] = useState<{ answer: string; correct: boolean } | null>(null);
  const [guidedAttempt3, setGuidedAttempt3] = useState<{ answer: string; correct: boolean } | null>(null);
  const [independentAnswer, setIndependentAnswer] = useState("");
  const [independentLadderStage, setIndependentLadderStage] = useState<IndependentLadderStage>("attempt-1");
  const [independentAttempt1, setIndependentAttempt1] = useState<{ answer: string; correct: boolean } | null>(null);
  const [independentAttempt2, setIndependentAttempt2] = useState<{ answer: string; correct: boolean } | null>(null);
  const [independentFreshAnswer, setIndependentFreshAnswer] = useState("");
  const [independentFreshAttempt, setIndependentFreshAttempt] = useState<{ answer: string; correct: boolean } | null>(null);

  const profileIdRef = useRef<string>("");
  const supabaseRef = useRef<ReturnType<typeof getSupabaseClient>>(null);
  const sessionIdRef = useRef<string>("");
  const preAttemptSnapshotRef = useRef<EducationalIntelligenceSnapshot | null>(null);

  async function loadLesson() {
    setMode("loading");
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("no client");
      supabaseRef.current = supabase;

      const profileId = await withTimeout(ensureProfile(), 10000, "your profile");
      if (!profileId) throw new Error("no profile");
      profileIdRef.current = profileId;
      sessionIdRef.current = `learn-mth-percentages-${Date.now()}`;

      if (getSelectedPathwayId() !== "csse") setSelectedPathway("csse");

      const maths = await withTimeout(fetchQuestionBank(supabase, "maths", "csse"), 10000, "this lesson's questions");
      const guided = maths.find((q) => q.id === "learn-mth-pct-guided") ?? null;
      const independent = maths.find((q) => q.id === "learn-mth-pct-independent") ?? null;
      const independentRetry = maths.find((q) => q.id === "learn-mth-pct-independent-retry") ?? null;

      if (!guided || !independent) {
        throw new Error(
          "This lesson's practice questions aren't available yet. Migration 029 " +
          "(supabase/migrations/029_mathematics_percentages_lesson_content.sql) has not been applied " +
          "to this database yet. Apply it via Supabase Dashboard > SQL Editor, then try again."
        );
      }
      setGuidedItem(guided);
      setIndependentItem(independent);
      setIndependentRetryItem(independentRetry);

      const snapshot = await getEducationalIntelligence(supabase, profileId, COMPETENCY_ID);
      setEducationalState(snapshot.educationalState);
      preAttemptSnapshotRef.current = snapshot;

      setMode("lesson");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setMode("error");
    }
  }

  async function recordGuidedAttempt(attemptNumber: 1 | 2 | 3, isCorrect: boolean) {
    if (!guidedItem) return;
    const supabase = supabaseRef.current;
    if (!supabase || !profileIdRef.current) return;

    if (attemptNumber === 1) {
      await withTimeout(
        recordPresentation(supabase, profileIdRef.current, [guidedItem.id], "learning_guided"),
        10000,
        "saving your progress"
      ).catch(() => {});
    }
    const supportTier: "independent" | "supported" = attemptNumber === 1 ? "independent" : "supported";
    await recordOutcome(
      supabase,
      profileIdRef.current,
      guidedItem.id,
      isCorrect,
      sessionIdRef.current,
      guidedItem.masteryThreshold,
      undefined,
      supportTier
    ).catch(() => {});
    if (preAttemptSnapshotRef.current) {
      await processEvidenceForCompetency(
        supabase,
        profileIdRef.current,
        COMPETENCY_ID,
        preAttemptSnapshotRef.current,
        isCorrect
      ).catch(() => {});
    }
  }

  async function submitGuidedAttempt1() {
    if (!guidedItem) return;
    const q = guidedItem.prompt as MathsQuestion;
    const isCorrect = checkMathsAnswer(guidedAnswer, String(q.answer));
    setGuidedAttempt1({ answer: guidedAnswer, correct: isCorrect });
    await recordGuidedAttempt(1, isCorrect);
    if (isCorrect) {
      setGuidedLadderStage("resolved");
      setGuidedSubmitted(true);
      setCheckStage("guided");
    } else {
      setGuidedLadderStage("attempt-2");
    }
    setGuidedAnswer("");
  }

  async function submitGuidedAttempt2() {
    if (!guidedItem) return;
    const q = guidedItem.prompt as MathsQuestion;
    const isCorrect = checkMathsAnswer(guidedAnswer, String(q.answer));
    setGuidedAttempt2({ answer: guidedAnswer, correct: isCorrect });
    await recordGuidedAttempt(2, isCorrect);
    if (isCorrect) {
      setGuidedLadderStage("resolved");
      setGuidedSubmitted(true);
      setCheckStage("guided");
    } else {
      setGuidedLadderStage("attempt-3");
    }
    setGuidedAnswer("");
  }

  async function submitGuidedAttempt3() {
    if (!guidedItem) return;
    const q = guidedItem.prompt as MathsQuestion;
    const isCorrect = checkMathsAnswer(guidedAnswer, String(q.answer));
    setGuidedAttempt3({ answer: guidedAnswer, correct: isCorrect });
    await recordGuidedAttempt(3, isCorrect);
    setGuidedLadderStage("resolved");
    setGuidedSubmitted(true);
    setCheckStage("guided");
    setGuidedAnswer("");
  }

  async function recordIndependentAttempt(item: BankQuestion, isCorrect: boolean, presentedNow: boolean) {
    const supabase = supabaseRef.current;
    if (!supabase || !profileIdRef.current) return;

    if (presentedNow) {
      await withTimeout(
        recordPresentation(supabase, profileIdRef.current, [item.id], "learning_independent"),
        10000,
        "saving your progress"
      ).catch(() => {});
    }
    const preAttempt = await getEducationalIntelligence(supabase, profileIdRef.current, COMPETENCY_ID).catch(() => null);
    await recordOutcome(
      supabase,
      profileIdRef.current,
      item.id,
      isCorrect,
      sessionIdRef.current,
      item.masteryThreshold
    ).catch(() => {});
    if (preAttempt) {
      const updated = await processEvidenceForCompetency(
        supabase,
        profileIdRef.current,
        COMPETENCY_ID,
        preAttempt,
        isCorrect
      ).catch(() => null);
      if (updated) setEducationalState(updated.educationalState);
    }
  }

  async function submitIndependentAttempt1() {
    if (!independentItem) return;
    const q = independentItem.prompt as MathsQuestion;
    const isCorrect = checkMathsAnswer(independentAnswer, String(q.answer));
    setIndependentAttempt1({ answer: independentAnswer, correct: isCorrect });
    await recordIndependentAttempt(independentItem, isCorrect, true);
    if (isCorrect) {
      setIndependentLadderStage("resolved");
      setCheckStage("independent");
    } else {
      setIndependentLadderStage("attempt-2");
    }
    setIndependentAnswer("");
  }

  async function submitIndependentAttempt2() {
    if (!independentItem) return;
    const q = independentItem.prompt as MathsQuestion;
    const isCorrect = checkMathsAnswer(independentAnswer, String(q.answer));
    setIndependentAttempt2({ answer: independentAnswer, correct: isCorrect });
    await recordIndependentAttempt(independentItem, isCorrect, false);
    if (isCorrect) {
      setIndependentLadderStage("resolved");
      setCheckStage("independent");
    } else {
      setIndependentLadderStage("remediation");
    }
    setIndependentAnswer("");
  }

  async function submitIndependentFresh() {
    if (!independentRetryItem) return;
    const q = independentRetryItem.prompt as MathsQuestion;
    const isCorrect = checkMathsAnswer(independentFreshAnswer, String(q.answer));
    setIndependentFreshAttempt({ answer: independentFreshAnswer, correct: isCorrect });
    await recordIndependentAttempt(independentRetryItem, isCorrect, true);
    setIndependentLadderStage("resolved");
    setCheckStage("independent");
    setIndependentFreshAnswer("");
  }

  const progression = progressionLabel(checkStage, educationalState);
  const independentResolved = independentLadderStage === "resolved";
  const independentUltimatelyCorrect =
    independentAttempt1?.correct || independentAttempt2?.correct || independentFreshAttempt?.correct || false;

  return (
    <PageLayout breadcrumbs={[{ label: "Learn", href: "/learning-intelligence/learn" }, { label: "Finding a Percentage of a Number" }]}>
      <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {mode === "intro" && (
          <InfoCard>
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Finding a Percentage of a Number</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              A real lesson: understand the method, try it with support, then try it alone.
            </p>
            <button
              onClick={() => void loadLesson()}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Start the lesson
            </button>
          </InfoCard>
        )}

        {mode === "loading" && <p className="text-sm text-gray-400 dark:text-gray-500" aria-live="polite">Loading…</p>}

        {mode === "error" && (
          <InfoCard className="text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">We couldn&apos;t load this lesson</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{errorMessage}</p>
            <button onClick={() => void loadLesson()} className="mt-4 text-xs font-semibold text-sky-700 dark:text-sky-400">
              Try again
            </button>
          </InfoCard>
        )}

        {mode === "lesson" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Finding a Percentage of a Number</h1>
            </div>
            <InfoCard className="flex items-center gap-3">
              <Target size={16} className="text-sky-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{progression.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{progression.description}</p>
              </div>
            </InfoCard>

            {/* CONCEPT */}
            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">What&apos;s going on?</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                A percentage is a way of describing a part of something out of 100. 15% means 15 out of every 100.
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
                The easiest way to find a percentage of a number is to start with 10%. Finding 10% of a number is
                simple: just divide by 10. Once you know 10%, you can build up almost any percentage you need. 20%
                is double 10%. 5% is half of 10%. 15% is 10% plus 5%.
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
                You almost never need to work out a percentage in one big step. Building it from 10% pieces is
                faster and much less likely to go wrong.
              </p>
            </section>

            {/* METHOD */}
            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">The method</h2>
              <InfoCard>
                <ol className="text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside space-y-1">
                  <li>Find 10% of the quantity by dividing by 10.</li>
                  <li>Work out what multiple of 10% you actually need (20% is double 10%, 30% is triple 10%, and so on).</li>
                  <li>If the target percentage includes a 5, find 5% by halving your 10% value, then add it on.</li>
                  <li>Add the pieces together to get the final answer.</li>
                </ol>
              </InfoCard>
            </section>

            {/* WORKED EXAMPLES */}
            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">Worked examples</h2>
              <InfoCard>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">15% of 60</p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 space-y-0.5">
                  <li>10% of 60 = 6</li>
                  <li>5% of 60 = half of 6 = 3</li>
                  <li>15% = 10% + 5% = 6 + 3</li>
                </ul>
                <p className="text-sm font-bold text-emerald-600 mt-1.5">Answer: 9</p>
              </InfoCard>
              <InfoCard className="mt-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">35% of 140 <span className="font-normal text-gray-400">(a bigger quantity, three pieces to build)</span></p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 space-y-0.5">
                  <li>10% of 140 = 14</li>
                  <li>30% = 3 × 14 = 42</li>
                  <li>5% of 140 = half of 14 = 7</li>
                  <li>35% = 30% + 5% = 42 + 7</li>
                </ul>
                <p className="text-sm font-bold text-emerald-600 mt-1.5">Answer: 49</p>
              </InfoCard>
            </section>

            {/* GUIDED ATTEMPT */}
            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">Try one with help</h2>
              <InfoCard>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {guidedItem ? (guidedItem.prompt as MathsQuestion).question : "…"}
                </p>

                {hintsShown > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {hintsShown >= 1 && (
                      <p className="text-xs text-sky-700 dark:text-sky-400 flex items-start gap-1.5">
                        <Lightbulb size={13} className="mt-0.5 shrink-0" /> Start by finding 10% of 80. What&apos;s 80 ÷ 10?
                      </p>
                    )}
                    {hintsShown >= 2 && (
                      <p className="text-xs text-sky-700 dark:text-sky-400 flex items-start gap-1.5">
                        <Lightbulb size={13} className="mt-0.5 shrink-0" /> That&apos;s 8. Now find 5%, which is half of that 10% value. What&apos;s half of 8?
                      </p>
                    )}
                    {hintsShown >= 3 && (
                      <p className="text-xs text-sky-700 dark:text-sky-400 flex items-start gap-1.5">
                        <Lightbulb size={13} className="mt-0.5 shrink-0" /> That&apos;s 4. Now add the 10% piece and the 5% piece together to make 15%.
                      </p>
                    )}
                  </div>
                )}
                {guidedLadderStage === "attempt-1" && hintsShown < 3 && (
                  <button
                    onClick={() => setHintsShown((h) => h + 1)}
                    className="mt-2 text-xs font-semibold text-sky-700 dark:text-sky-400"
                  >
                    Need a hint?
                  </button>
                )}

                {guidedLadderStage === "attempt-1" && (
                  <>
                    <input
                      value={guidedAnswer}
                      onChange={(e) => setGuidedAnswer(e.target.value)}
                      className="w-full mt-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
                      placeholder="Your answer…"
                      aria-label="Your answer"
                    />
                    <button
                      onClick={() => void submitGuidedAttempt1()}
                      disabled={!guidedAnswer.trim()}
                      className="mt-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      Submit
                    </button>
                  </>
                )}

                {guidedAttempt1 && !guidedAttempt1.correct && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-500 inline-flex items-center gap-1.5">
                      <XCircle size={16} /> Not quite yet. Let&apos;s look again.
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 flex items-start gap-1.5">
                      <Lightbulb size={13} className="mt-0.5 shrink-0 text-sky-600" />
                      {classifyWrongAnswer(guidedAttempt1.answer, GUIDED_KNOWN_MISCONCEPTIONS) ??
                        "Go back to the 10% step and check each piece before adding them together."}
                    </p>
                  </div>
                )}

                {guidedLadderStage === "attempt-2" && (
                  <>
                    <input
                      value={guidedAnswer}
                      onChange={(e) => setGuidedAnswer(e.target.value)}
                      className="w-full mt-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
                      placeholder="Try again…"
                    />
                    <button
                      onClick={() => void submitGuidedAttempt2()}
                      disabled={!guidedAnswer.trim()}
                      className="mt-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      Submit
                    </button>
                  </>
                )}

                {guidedAttempt2 && !guidedAttempt2.correct && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-500 inline-flex items-center gap-1.5">
                      <XCircle size={16} /> Let&apos;s work through this one together.
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">
                      {classifyWrongAnswer(guidedAttempt2.answer, GUIDED_KNOWN_MISCONCEPTIONS) ??
                        "Here's the full method, one piece at a time:"}
                    </p>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-0.5">
                      <li>10% of 80 = 8</li>
                      <li>5% of 80 = half of 8 = 4</li>
                      <li>15% = 10% + 5% = 8 + 4</li>
                    </ul>
                    <p className="text-sm font-bold text-emerald-600 mt-1.5">Answer: 12</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Now that you&apos;ve seen how it works, try typing the answer yourself.</p>
                  </div>
                )}

                {guidedLadderStage === "attempt-3" && (
                  <>
                    <input
                      value={guidedAnswer}
                      onChange={(e) => setGuidedAnswer(e.target.value)}
                      className="w-full mt-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
                      placeholder="Type the answer above…"
                    />
                    <button
                      onClick={() => void submitGuidedAttempt3()}
                      disabled={!guidedAnswer.trim()}
                      className="mt-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      Submit
                    </button>
                  </>
                )}

                {guidedLadderStage === "resolved" && (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">
                    {(guidedAttempt3 ?? guidedAttempt2 ?? guidedAttempt1)?.correct ? (
                      <><CheckCircle2 size={16} className="text-emerald-500" /> Correct: 12</>
                    ) : (
                      <><XCircle size={16} className="text-amber-500" /> That&apos;s alright. You&apos;ve seen the full method now.</>
                    )}
                  </p>
                )}
              </InfoCard>
            </section>

            {/* COMMON MISTAKES */}
            {guidedSubmitted && (
              <section>
                <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">Watch out for</h2>
                <InfoCard className="flex items-start gap-3">
                  <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    <li><strong>Stopping after finding 10%.</strong> 10% is a stepping stone, not usually the final answer. Always check whether the percentage you need actually equals 10%, or whether there&apos;s more building to do.</li>
                    <li><strong>Building the wrong multiple.</strong> If you need 20%, that&apos;s 10% doubled, not 10% plus 10 more. Double-check which multiple you actually need before adding anything on.</li>
                  </ul>
                </InfoCard>
              </section>
            )}

            {/* INDEPENDENT CHECK */}
            {guidedSubmitted && (
              <section>
                <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">Now try one alone</h2>
                <InfoCard>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {independentItem ? (independentItem.prompt as MathsQuestion).question : "…"}
                  </p>

                  {independentLadderStage === "attempt-1" && (
                    <>
                      <input
                        value={independentAnswer}
                        onChange={(e) => setIndependentAnswer(e.target.value)}
                        className="w-full mt-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
                        placeholder="Your answer…"
                        aria-label="Your answer"
                      />
                      <button
                        onClick={() => void submitIndependentAttempt1()}
                        disabled={!independentAnswer.trim()}
                        className="mt-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                      >
                        Submit
                      </button>
                    </>
                  )}

                  {independentAttempt1 && !independentAttempt1.correct && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-semibold text-amber-600 dark:text-amber-500 inline-flex items-center gap-1.5">
                        <XCircle size={16} /> Not quite yet. Have another look.
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 flex items-start gap-1.5">
                        <Lightbulb size={13} className="mt-0.5 shrink-0 text-sky-600" />
                        {classifyWrongAnswer(independentAttempt1.answer, INDEPENDENT_KNOWN_MISCONCEPTIONS) ??
                          "Think about what multiple of 10% you actually need, and make sure every piece gets added in. Try again."}
                      </p>
                    </div>
                  )}

                  {independentLadderStage === "attempt-2" && (
                    <>
                      <input
                        value={independentAnswer}
                        onChange={(e) => setIndependentAnswer(e.target.value)}
                        className="w-full mt-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
                        placeholder="Try again…"
                      />
                      <button
                        onClick={() => void submitIndependentAttempt2()}
                        disabled={!independentAnswer.trim()}
                        className="mt-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                      >
                        Submit
                      </button>
                    </>
                  )}

                  {independentAttempt2 && !independentAttempt2.correct && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-semibold text-amber-600 dark:text-amber-500 inline-flex items-center gap-1.5">
                        <XCircle size={16} /> Let&apos;s work through this one together.
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">
                        {classifyWrongAnswer(independentAttempt2.answer, INDEPENDENT_KNOWN_MISCONCEPTIONS) ??
                          "Here's the full method, one piece at a time:"}
                      </p>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-0.5">
                        <li>10% of 90 = 9</li>
                        <li>20% = 10% doubled = 9 × 2</li>
                      </ul>
                      <p className="text-sm font-bold text-emerald-600 mt-1.5">Answer: 18</p>
                    </div>
                  )}

                  {independentLadderStage === "remediation" && !independentRetryItem && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        The next practice question for this isn&apos;t available yet. Head to Practice when you&apos;re ready to try more like this.
                      </p>
                      <button
                        onClick={() => {
                          setIndependentLadderStage("resolved");
                          setCheckStage("independent");
                        }}
                        className="mt-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  )}
                  {(independentRetryItem && independentLadderStage === "remediation") || independentFreshAttempt ? (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                        Now try a different one on your own
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {independentRetryItem ? (independentRetryItem.prompt as MathsQuestion).question : "…"}
                      </p>
                      {independentLadderStage === "remediation" && (
                        <>
                          <input
                            value={independentFreshAnswer}
                            onChange={(e) => setIndependentFreshAnswer(e.target.value)}
                            className="w-full mt-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
                            placeholder="Your answer…"
                            aria-label="Your answer"
                          />
                          <button
                            onClick={() => void submitIndependentFresh()}
                            disabled={!independentFreshAnswer.trim()}
                            className="mt-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                          >
                            Submit
                          </button>
                        </>
                      )}
                      {independentFreshAttempt && (
                        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">
                          {independentFreshAttempt.correct ? (
                            <><CheckCircle2 size={16} className="text-emerald-500" /> Correct: 21. That&apos;s genuine evidence you&apos;ve got it.</>
                          ) : (
                            <><XCircle size={16} className="text-amber-500" /> Not quite. The answer is 21. That&apos;s alright, this is real evidence either way.</>
                          )}
                        </p>
                      )}
                    </div>
                  ) : null}

                  {independentLadderStage === "resolved" && (independentAttempt1?.correct || independentAttempt2?.correct) && (
                    <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">
                      <CheckCircle2 size={16} className="text-emerald-500" /> Correct: 18
                    </p>
                  )}
                </InfoCard>
              </section>
            )}

            {/* EXAM APPLICATION + NEXT STEP */}
            {independentResolved && (
              <>
                <section>
                  <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">Where this shows up in the exam</h2>
                  <InfoCard>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      Percentage questions like this appear regularly on 11+ maths papers, sometimes asking for a
                      percentage of a quantity directly, and sometimes the other way round: telling you two numbers
                      and asking what percentage one is of the other. This lesson covers finding a percentage of a
                      quantity. Once that&apos;s solid, the reverse version becomes much easier to tackle too.
                    </p>
                  </InfoCard>
                </section>

                <section>
                  <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">What&apos;s next?</h2>
                  {independentUltimatelyCorrect ? (
                    <Link
                      href="/learning-intelligence/practice/mathematics"
                      className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      You&apos;re ready to practise this properly <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <Link
                      href="/learning-intelligence/practice/mathematics"
                      className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      Practise percentages again <ArrowRight size={14} />
                    </Link>
                  )}
                  <div className="mt-3">
                    <Link href="/learning-intelligence" className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Full learning report →
                    </Link>
                  </div>
                </section>
              </>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
