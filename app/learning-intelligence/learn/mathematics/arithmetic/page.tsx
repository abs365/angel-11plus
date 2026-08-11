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
import type { BankQuestion } from "@/types/ali/questionBank";
import type { MathsQuestion } from "@/types/index";

/**
 * Mathematics Learn -> Practise Reference Vertical — "Adding and Subtracting
 * Big Numbers" (MR-01, QT-MR-01). Full teaching content and design rationale
 * in knowledge/.../mathematics-reference-vertical/MATHEMATICS_LEARNING_DESIGN.md.
 *
 * No architecture terms (MR-01, QT-MR-01, EMC-4, "educational state") are
 * shown to the learner anywhere below — only in code comments, for internal
 * traceability. The progression labels shown to the family
 * (Learning / Ready to practise / Not yet understood / Developing /
 * Consistent / Maintenance needed) are a plain-language translation of the
 * real, unmodified Educational Intelligence Engine's educationalState —
 * see MATHEMATICS_PROGRESSION_AND_MASTERY_MODEL.md for the exact mapping.
 * "Learning" and the pre-Independent-Check half of "Ready to practise" are
 * local lesson-navigation state only, never written as evidence.
 */

const COMPETENCY_ID = "MR-01" as const;

type Mode = "intro" | "loading" | "error" | "lesson";
type CheckStage = "not-started" | "guided" | "independent" | "done";

/**
 * Guided Learning Remediation (Mathematics Reference Vertical Remediation
 * Gate §1, GUIDED_LEARNING_REMEDIATION_REPORT.md) — a bounded, 3-attempt
 * support ladder rather than an immediate advance or an infinite retry loop:
 *   attempt 1 wrong  -> targeted hint (or honest generic nudge), retry
 *   attempt 2 wrong  -> full worked resolution shown, one bounded
 *                       supported retry
 *   attempt 3        -> proceeds regardless of outcome (no infinite loop)
 * `supportTier` recorded for each real attempt: attempt 1 is "independent"
 * (a first, unaided try); attempts 2 and 3 are "supported" (they only
 * happen after remediation was shown) — see lib/ali/mastery.ts.
 */
type GuidedLadderStage = "attempt-1" | "attempt-2" | "attempt-3" | "resolved";

/**
 * Independent Check Remediation (Founder Visual Review Remediation §2-3) —
 * an Independent Check no longer reveals the answer on the first wrong
 * attempt. attempt-1 wrong -> honest diagnostic, no answer shown, a genuine
 * retry (attempt-2, still unaided, still "independent" tier — no help has
 * been given yet). attempt-2 wrong -> misunderstanding persists -> full
 * worked resolution shown, then a FRESH, different problem
 * (learn-mth-arith-independent-retry, migration 025) tests genuine
 * transfer — not a repeat of the same numbers just demonstrated. Every real
 * attempt in this ladder is genuinely unaided and recorded as
 * supportTier "independent"; only the worked-resolution display itself is
 * "help," and no evidence is written for it.
 */
type IndependentLadderStage = "attempt-1" | "attempt-2" | "remediation" | "resolved";

/**
 * Deliberately NOT a general mistake-classification system — a coded
 * misconception taxonomy remains explicitly not-yet-approved
 * (EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md §11) and nothing here is persisted
 * as evidence. This is two fixed, hand-verified, deterministic wrong answers
 * for these two specific fixed problems, used only to decide the ephemeral
 * UI feedback text shown to the learner (Remediation Gate §3: "if the
 * evidence only proves the answer is incorrect, do not pretend Angel knows
 * why"). Any wrong answer that doesn't exactly match returns null, and the
 * feedback stays honestly generic.
 */
interface KnownMisconception {
  wrongAnswer: number;
  explanation: string;
}
const GUIDED_KNOWN_MISCONCEPTIONS: KnownMisconception[] = [
  {
    // 652 + 279: summing each column independently without ever carrying
    // (ones 2+9=11->"1", tens 5+7=12->"2", hundreds 6+2="8") = 821.
    wrongAnswer: 821,
    explanation:
      "It looks like each column may have been added on its own, without carrying the extra ten into the next column. 2 + 9 makes 11, and that extra ten has to move into the tens column, not disappear.",
  },
];
const INDEPENDENT_KNOWN_MISCONCEPTIONS: KnownMisconception[] = [
  {
    // 903 - 468: subtracting the smaller digit from the larger one in each
    // column regardless of position (hundreds 9-4=5, tens |0-6|=6, ones
    // |3-8|=5) = 565 — the classic across-zero borrowing misconception.
    wrongAnswer: 565,
    explanation:
      "It looks like the smaller digit may have been taken away from the larger one in each column, rather than borrowing properly. That's especially tricky here because the tens column is a zero.",
  },
  {
    // 604 - 278 (the "fresh opportunity" item): the same digit-difference
    // misconception applied to this problem (hundreds 6-2=4, tens |0-7|=7,
    // ones |4-8|=4) = 474.
    wrongAnswer: 474,
    explanation:
      "It looks like the smaller digit may have been taken away from the larger one in each column again, rather than borrowing properly through the zero.",
  },
];

function classifyWrongAnswer(userAnswer: string, patterns: KnownMisconception[]): string | null {
  const parsed = Number(userAnswer.trim());
  if (Number.isNaN(parsed)) return null;
  return patterns.find((p) => p.wrongAnswer === parsed)?.explanation ?? null;
}

/**
 * Founder Visual Review Remediation §5-6 — a static, non-animated,
 * progressive place-value regrouping sequence for 1000 - 473's borrowing,
 * replacing a five-paragraph prose explanation. Each step shows the real
 * intermediate place-value state (hand-verified: 1 thousand = 10 hundreds =
 * 9 hundreds + 10 tens = 9 hundreds + 9 tens + 10 ones, every step still
 * totalling 1000), with the column(s) that just changed highlighted —
 * "changed" indices are into [Thousands, Hundreds, Tens, Ones].
 */
const PLACE_LABELS = ["Th", "H", "T", "O"] as const;
const REGROUP_STEPS: { caption: string; values: [string, string, string, string]; changed: number[] }[] = [
  { caption: "Start: 1000 is 1 thousand.", values: ["1", "0", "0", "0"], changed: [] },
  { caption: "The 1 thousand becomes 10 hundreds.", values: ["0", "10", "0", "0"], changed: [0, 1] },
  { caption: "One hundred becomes 10 tens. 9 hundreds are left behind.", values: ["0", "9", "10", "0"], changed: [1, 2] },
  {
    caption: "One ten becomes 10 ones. 9 tens are left behind. Now there are enough ones to subtract 3 from.",
    values: ["0", "9", "9", "10"],
    changed: [2, 3],
  },
];

function progressionLabel(
  checkStage: CheckStage,
  educationalState: EducationalIntelligenceSnapshot["educationalState"] | undefined
): { label: string; description: string } {
  // Struggling-Learner Activation Test finding: a returning learner with
  // real prior evidence (from an earlier session, or from this competency's
  // practice elsewhere) must see that real state immediately, not a
  // hardcoded "Learning" that ignores what Angel already knows. Only a
  // genuinely fresh learner (educationalState undefined/"exploring", i.e.
  // no real evidence exists yet) sees "Learning" before their first attempt
  // in this session.
  if (checkStage === "not-started" && (educationalState === undefined || educationalState === "exploring")) {
    return { label: "Learning", description: "Working through the lesson." };
  }
  if (checkStage === "guided") {
    return { label: "Ready to practise", description: "The guided step is done. Next is trying one alone." };
  }
  if (checkStage === "not-started") {
    // Real prior evidence exists — reflect it honestly using the same
    // mapping the post-Independent-Check branch below uses, rather than
    // inventing a second set of labels.
    return realEvidenceLabel(educationalState);
  }
  // An independent attempt has been made this session — defer to the real Educational Intelligence Engine.
  return realEvidenceLabel(educationalState);
}

function realEvidenceLabel(
  educationalState: EducationalIntelligenceSnapshot["educationalState"] | undefined
): { label: string; description: string } {
  switch (educationalState) {
    case "rebuilding":
      return { label: "Not yet understood", description: "This needs another look. Let's go through it again." };
    case "practising":
    case "reinforcing":
    case "building-knowledge":
      return { label: "Developing", description: "Real progress. More practice will build this up further." };
    case "mastered":
    case "durably-mastered":
      return { label: "Consistent", description: "This is solid. Well done." };
    case "reviewing":
      return { label: "Maintenance needed", description: "This was solid before. A quick check-in will confirm it still is." };
    default:
      return { label: "Ready to practise", description: "One real attempt recorded. More evidence builds the picture." };
  }
}

export default function MathematicsArithmeticLessonPage() {
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
      sessionIdRef.current = `learn-mth-arithmetic-${Date.now()}`;

      if (getSelectedPathwayId() !== "csse") setSelectedPathway("csse");

      const maths = await withTimeout(fetchQuestionBank(supabase, "maths", "csse"), 10000, "this lesson's questions");
      const guided = maths.find((q) => q.id === "learn-mth-arith-guided") ?? null;
      const independent = maths.find((q) => q.id === "learn-mth-arith-independent") ?? null;
      const independentRetry = maths.find((q) => q.id === "learn-mth-arith-independent-retry") ?? null;

      if (!guided || !independent) {
        throw new Error(
          "This lesson's practice questions aren't available yet. Migration 023 " +
          "(supabase/migrations/023_mathematics_learn_arithmetic_content.sql) has not been applied " +
          "to this database yet. Apply it via Supabase Dashboard > SQL Editor, then try again."
        );
      }
      // Deliberately not a hard failure: migration 025 (the Independent
      // Check's "fresh opportunity" item) is only needed if a learner gets
      // the Independent Check wrong twice — most of the lesson, including
      // the Guided Attempt ladder and a correct-first-try Independent
      // Check, works fully without it. Failing the whole lesson load over a
      // remediation-path dependency would be a worse regression than a
      // graceful fallback at the one stage that actually needs it (see the
      // "remediation" stage rendering below).
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

  /**
   * Records one real guided-attempt outcome. `attemptNumber` 1 is the
   * learner's genuine first, unaided try (supportTier "independent");
   * attempts 2 and 3 only happen after remediation was shown (supportTier
   * "supported") — see GUIDED_LEARNING_REMEDIATION_REPORT.md. recordPresentation
   * is only called on attempt 1 — retries within the same guided encounter
   * are additional attempts at an already-presented question, not a new
   * presentation.
   */
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
    // Guided evidence still feeds the real Educational Intelligence Engine —
    // per MATHEMATICS_PROGRESSION_AND_MASTERY_MODEL.md §3, it is tagged
    // distinctly (source: "learning_guided", supportTier) but not suppressed.
    // A supported-correct outcome does not, by itself, advance mastery
    // evidence the way independent evidence does (lib/ali/mastery.ts).
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
    // Bounded ladder: attempt 3 always resolves and advances, whether
    // correct or not — no infinite retry loop (Remediation Gate §1).
    setGuidedLadderStage("resolved");
    setGuidedSubmitted(true);
    setCheckStage("guided");
    setGuidedAnswer("");
  }

  /**
   * Records one real Independent Check outcome. Every attempt in this
   * ladder — the original item's first try, its retry, and the fresh
   * transfer item — is genuinely unaided (no worked solution has been
   * shown at the point any of them is submitted), so all are recorded with
   * the default supportTier "independent". `presentedNow` controls whether
   * recordPresentation() fires — true only the first time a given question
   * id is shown this lesson visit (the original item's first attempt; the
   * fresh item's only attempt), matching the same discipline as the Guided
   * ladder's recordGuidedAttempt().
   */
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
    // Fresh pre-attempt snapshot for every real attempt — Educational State
    // may have changed since the lesson-start snapshot (same discipline the
    // Practice runner uses for a second answer in one session).
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
    // Bounded ladder: resolves regardless of outcome — no infinite loop.
    setIndependentLadderStage("resolved");
    setCheckStage("independent");
    setIndependentFreshAnswer("");
  }

  const progression = progressionLabel(checkStage, educationalState);
  const independentResolved = independentLadderStage === "resolved";
  const independentUltimatelyCorrect =
    independentAttempt1?.correct || independentAttempt2?.correct || independentFreshAttempt?.correct || false;

  return (
    <PageLayout breadcrumbs={[{ label: "Learn", href: "/learning-intelligence/learn" }, { label: "Adding and Subtracting Big Numbers" }]}>
      <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {mode === "intro" && (
          <InfoCard>
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Adding and Subtracting Big Numbers</h1>
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
            <button onClick={() => void loadLesson()} className="mt-4 text-xs font-semibold text-purple-600 dark:text-purple-400">
              Try again
            </button>
          </InfoCard>
        )}

        {mode === "lesson" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Adding and Subtracting Big Numbers</h1>
            </div>
            <InfoCard className="flex items-center gap-3">
              <Target size={16} className="text-indigo-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{progression.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{progression.description}</p>
              </div>
            </InfoCard>

            {/* CONCEPT */}
            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">What&apos;s going on?</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Every digit in a number has a place value: ones, tens, hundreds, and so on. When you add or
                subtract big numbers, you work one column at a time, starting from the ones column on the right.
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
                Sometimes a column adds up to 10 or more. When that happens, you <strong>carry</strong> the extra
                ten into the next column. Sometimes you need to subtract a bigger digit from a smaller one. When
                that happens, you <strong>borrow</strong>{" "}a ten from the next column. Carrying and borrowing
                aren&apos;t tricks. They&apos;re just keeping track of place value properly.
              </p>
            </section>

            {/* METHOD */}
            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">The method</h2>
              <InfoCard>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Addition</p>
                <ol className="text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside space-y-1">
                  <li>Line up the ones, tens and hundreds columns.</li>
                  <li>Add the ones column first. If it&apos;s 10 or more, write the last digit and carry the rest.</li>
                  <li>Add the tens column, including anything carried. Carry again if needed.</li>
                  <li>Keep going, column by column.</li>
                </ol>
              </InfoCard>
              <InfoCard className="mt-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Subtraction</p>
                <ol className="text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside space-y-1">
                  <li>Line up the columns the same way.</li>
                  <li>Subtract the ones column. If the top digit is smaller, borrow a ten from the next column.</li>
                  <li>Subtract the tens column, borrowing again if needed.</li>
                  <li>Keep going until every column is subtracted.</li>
                </ol>
              </InfoCard>
            </section>

            {/* WORKED EXAMPLES */}
            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">Worked examples</h2>
              <InfoCard>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">847 + 356</p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 space-y-0.5">
                  <li>Ones: 7 + 6 = 13 → write 3, carry 1</li>
                  <li>Tens: 4 + 5 + 1 = 10 → write 0, carry 1</li>
                  <li>Hundreds: 8 + 3 + 1 = 12 → write 2, carry 1</li>
                  <li>Thousands: nothing else to add, so write the carried 1</li>
                </ul>
                <p className="text-sm font-bold text-emerald-600 mt-1.5">Answer: 1203</p>
              </InfoCard>
              <InfoCard className="mt-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">1000 − 473 <span className="font-normal text-gray-400">(the trickiest kind: borrowing across zeros)</span></p>

                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
                  The ones column needs to subtract 3, but it&apos;s a 0. The tens and hundreds columns are 0
                  too, so there&apos;s nothing to borrow until we reach the thousands column. Watch what happens when
                  we regroup it:
                </p>

                <div className="mt-3 space-y-2.5">
                  {REGROUP_STEPS.map((step, i) => (
                    <div key={i}>
                      <div className="grid grid-cols-4 gap-1.5 text-center">
                        {step.values.map((v, colIdx) => (
                          <div
                            key={colIdx}
                            className={`rounded-lg py-2 text-sm font-semibold ${
                              step.changed.includes(colIdx)
                                ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-300 dark:ring-indigo-700"
                                : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            <div className="text-[10px] font-normal uppercase tracking-wide opacity-70">{PLACE_LABELS[colIdx]}</div>
                            {v}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">{step.caption}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2.5 text-center italic">
                  Every step still adds up to exactly 1000. Nothing is gained or lost, just moved to a more useful place.
                </p>

                <ul className="text-sm text-gray-600 dark:text-gray-400 mt-3 space-y-0.5">
                  <li>Ones: 10 − 3 = 7</li>
                  <li>Tens: 9 − 7 = 2</li>
                  <li>Hundreds: 9 − 4 = 5</li>
                </ul>
                <p className="text-sm font-bold text-emerald-600 mt-1.5">Answer: 527</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                  <strong>Check it:</strong> 527 + 473 = 1000 ✓. Adding the answer back to what was subtracted
                  should always give you back the number you started with.
                </p>
              </InfoCard>
            </section>

            {/* GUIDED ATTEMPT — bounded support ladder, see GUIDED_LEARNING_REMEDIATION_REPORT.md */}
            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">Try one with help</h2>
              <InfoCard>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {guidedItem ? (guidedItem.prompt as MathsQuestion).question : "…"}
                </p>

                {/* Attempt 1: voluntary generic hints remain available on request. */}
                {hintsShown > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {hintsShown >= 1 && (
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 flex items-start gap-1.5">
                        <Lightbulb size={13} className="mt-0.5 shrink-0" /> Start with the ones column. What&apos;s 2 + 9?
                      </p>
                    )}
                    {hintsShown >= 2 && (
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 flex items-start gap-1.5">
                        <Lightbulb size={13} className="mt-0.5 shrink-0" /> That&apos;s 11, so write the 1 and carry the 1 to the tens column.
                      </p>
                    )}
                    {hintsShown >= 3 && (
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 flex items-start gap-1.5">
                        <Lightbulb size={13} className="mt-0.5 shrink-0" /> Now the tens column: 5 + 7, plus the 1 you carried.
                      </p>
                    )}
                  </div>
                )}
                {guidedLadderStage === "attempt-1" && hintsShown < 3 && (
                  <button
                    onClick={() => setHintsShown((h) => h + 1)}
                    className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
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

                {/* Attempt 1 was wrong: targeted feedback (or an honest generic nudge — never a fabricated diagnosis), then a real retry. */}
                {guidedAttempt1 && !guidedAttempt1.correct && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-500 inline-flex items-center gap-1.5">
                      <XCircle size={16} /> Not quite yet. Let&apos;s look again.
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 flex items-start gap-1.5">
                      <Lightbulb size={13} className="mt-0.5 shrink-0 text-indigo-500" />
                      {classifyWrongAnswer(guidedAttempt1.answer, GUIDED_KNOWN_MISCONCEPTIONS) ??
                        "Go back to the ones column and work through each column one at a time. Remember to carry if a column adds to 10 or more."}
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

                {/* Attempt 2 was also wrong: full worked resolution, then one bounded supported retry. */}
                {guidedAttempt2 && !guidedAttempt2.correct && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-500 inline-flex items-center gap-1.5">
                      <XCircle size={16} /> Let&apos;s work through this one together.
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">
                      {classifyWrongAnswer(guidedAttempt2.answer, GUIDED_KNOWN_MISCONCEPTIONS) ??
                        "Here's the full method, one column at a time:"}
                    </p>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-0.5">
                      <li>Ones: 2 + 9 = 11 → write 1, carry 1</li>
                      <li>Tens: 5 + 7 = 12, plus the 1 carried = 13 → write 3, carry 1</li>
                      <li>Hundreds: 6 + 2 = 8, plus the 1 carried = 9</li>
                    </ul>
                    <p className="text-sm font-bold text-emerald-600 mt-1.5">Answer: 931</p>
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
                      <><CheckCircle2 size={16} className="text-emerald-500" /> Correct: 931</>
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
                    <li><strong>Forgetting to carry.</strong> If a column adds to 10 or more, that extra ten has to go somewhere.</li>
                    <li><strong>Borrowing from a zero without continuing the chain.</strong> If the column you want to borrow from is a zero, keep going left until you find one with something to give. Every column along the way changes too.</li>
                  </ul>
                </InfoCard>
              </section>
            )}

            {/* INDEPENDENT CHECK — bounded remediation ladder, see MATHEMATICS_REFERENCE_VERTICAL_FINAL_REFINEMENT_REPORT.md */}
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

                  {/* First wrong attempt: no answer revealed — an honest diagnostic and a genuine, still-unaided retry. */}
                  {independentAttempt1 && !independentAttempt1.correct && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-semibold text-amber-600 dark:text-amber-500 inline-flex items-center gap-1.5">
                        <XCircle size={16} /> Not quite yet. Have another look.
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 flex items-start gap-1.5">
                        <Lightbulb size={13} className="mt-0.5 shrink-0 text-indigo-500" />
                        {classifyWrongAnswer(independentAttempt1.answer, INDEPENDENT_KNOWN_MISCONCEPTIONS) ??
                          "Think about which column needs to borrow, and where that borrow can actually come from. Try again."}
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

                  {/* Second wrong attempt: misunderstanding persists — full worked resolution, no more guessing on this exact problem. */}
                  {independentAttempt2 && !independentAttempt2.correct && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-semibold text-amber-600 dark:text-amber-500 inline-flex items-center gap-1.5">
                        <XCircle size={16} /> Let&apos;s work through this one together.
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">
                        {classifyWrongAnswer(independentAttempt2.answer, INDEPENDENT_KNOWN_MISCONCEPTIONS) ??
                          "Here's the full method, one column at a time:"}
                      </p>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-0.5">
                        <li>Ones: 3 − 8 needs borrowing; tens is 0, so the borrow travels to the hundreds column</li>
                        <li>After borrowing: hundreds 8, tens 9, ones 13</li>
                        <li>Ones: 13 − 8 = 5. Tens: 9 − 6 = 3. Hundreds: 8 − 4 = 4</li>
                      </ul>
                      <p className="text-sm font-bold text-emerald-600 mt-1.5">Answer: 435</p>
                    </div>
                  )}

                  {/* Fresh opportunity: a genuinely different problem, not a repeat of the numbers just shown. */}
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
                            <><CheckCircle2 size={16} className="text-emerald-500" /> Correct: 326. That&apos;s genuine evidence you&apos;ve got it.</>
                          ) : (
                            <><XCircle size={16} className="text-amber-500" /> Not quite. The answer is 326. That&apos;s alright, this is real evidence either way.</>
                          )}
                        </p>
                      )}
                    </div>
                  ) : null}

                  {independentLadderStage === "resolved" && (independentAttempt1?.correct || independentAttempt2?.correct) && (
                    <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">
                      <CheckCircle2 size={16} className="text-emerald-500" /> Correct: 435
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
                      This exact type of question, a straightforward calculation with no story attached, is
                      usually one of the very first questions on a real 11+ maths paper. Getting comfortable with
                      carrying and borrowing means you can answer it quickly and confidently, leaving more time for
                      the harder questions later in the paper.
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
                    // Evidence-derived, specific next action (Founder Visual Review
                    // Remediation §7) — Angel now has real evidence this learner
                    // struggled specifically with borrowing across zero, so Practice
                    // (which surfaces this same competency from real evidence) is a
                    // more honest destination than a blanket full-lesson reset.
                    <Link
                      href="/learning-intelligence/practice/mathematics"
                      className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      Practise borrowing across zero again <ArrowRight size={14} />
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
