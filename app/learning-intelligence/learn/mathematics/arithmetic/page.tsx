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
      "It looks like each column may have been added on its own, without carrying the extra ten into the next column — 2 + 9 makes 11, and that extra ten has to move into the tens column, not disappear.",
  },
];
const INDEPENDENT_KNOWN_MISCONCEPTIONS: KnownMisconception[] = [
  {
    // 903 - 468: subtracting the smaller digit from the larger one in each
    // column regardless of position (hundreds 9-4=5, tens |0-6|=6, ones
    // |3-8|=5) = 565 — the classic across-zero borrowing misconception.
    wrongAnswer: 565,
    explanation:
      "It looks like the smaller digit may have been taken away from the larger one in each column, rather than borrowing properly — especially tricky here because the tens column is a zero.",
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
    return { label: "Ready to practise", description: "The guided step is done — next is trying one alone." };
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
      return { label: "Not yet understood", description: "This needs another look — let's go through it again." };
    case "practising":
    case "reinforcing":
    case "building-knowledge":
      return { label: "Developing", description: "Real progress — more practice will build this up further." };
    case "mastered":
    case "durably-mastered":
      return { label: "Consistent", description: "This is solid — well done." };
    case "reviewing":
      return { label: "Maintenance needed", description: "This was solid before — a quick check-in will confirm it still is." };
    default:
      return { label: "Ready to practise", description: "One real attempt recorded — more evidence builds the picture." };
  }
}

export default function MathematicsArithmeticLessonPage() {
  const [mode, setMode] = useState<Mode>("intro");
  const [errorMessage, setErrorMessage] = useState("");
  const [guidedItem, setGuidedItem] = useState<BankQuestion | null>(null);
  const [independentItem, setIndependentItem] = useState<BankQuestion | null>(null);
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
  const [independentSubmitted, setIndependentSubmitted] = useState(false);
  const [independentCorrect, setIndependentCorrect] = useState<boolean | null>(null);

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

      if (!guided || !independent) {
        throw new Error(
          "This lesson's practice questions aren't available yet — migration 023 " +
          "(supabase/migrations/023_mathematics_learn_arithmetic_content.sql) has not been applied " +
          "to this database yet. Apply it via Supabase Dashboard > SQL Editor, then try again."
        );
      }
      setGuidedItem(guided);
      setIndependentItem(independent);

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

  async function submitIndependent() {
    if (!independentItem) return;
    const q = independentItem.prompt as MathsQuestion;
    const isCorrect = checkMathsAnswer(independentAnswer, String(q.answer));
    setIndependentCorrect(isCorrect);
    setIndependentSubmitted(true);

    const supabase = supabaseRef.current;
    if (supabase && profileIdRef.current) {
      // Fresh pre-attempt snapshot — the guided attempt above may have
      // already changed the real Educational State, so re-read rather than
      // reuse the lesson-start snapshot (same discipline the Practice runner
      // uses for a second answer in the same competency within one session).
      const preAttempt = await getEducationalIntelligence(supabase, profileIdRef.current, COMPETENCY_ID).catch(() => null);

      await withTimeout(
        recordPresentation(supabase, profileIdRef.current, [independentItem.id], "learning_independent"),
        10000,
        "saving your progress"
      ).catch(() => {});
      await recordOutcome(
        supabase,
        profileIdRef.current,
        independentItem.id,
        isCorrect,
        sessionIdRef.current,
        independentItem.masteryThreshold
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
    setCheckStage("independent");
  }

  const progression = progressionLabel(checkStage, educationalState);

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
                Every digit in a number has a place value — ones, tens, hundreds, and so on. When you add or
                subtract big numbers, you work one column at a time, starting from the ones column on the right.
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
                Sometimes a column adds up to 10 or more — when that happens, you <strong>carry</strong> the extra
                ten into the next column. Sometimes you need to subtract a bigger digit from a smaller one — when
                that happens, you <strong>borrow</strong>{" "}a ten from the next column. Carrying and borrowing
                aren&apos;t tricks — they&apos;re just keeping track of place value properly.
              </p>
            </section>

            {/* METHOD */}
            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">The method</h2>
              <InfoCard>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Addition</p>
                <ol className="text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside space-y-1">
                  <li>Line up the ones, tens and hundreds columns.</li>
                  <li>Add the ones column first — if it&apos;s 10 or more, write the last digit and carry the rest.</li>
                  <li>Add the tens column, including anything carried. Carry again if needed.</li>
                  <li>Keep going, column by column.</li>
                </ol>
              </InfoCard>
              <InfoCard className="mt-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Subtraction</p>
                <ol className="text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside space-y-1">
                  <li>Line up the columns the same way.</li>
                  <li>Subtract the ones column — if the top digit is smaller, borrow a ten from the next column.</li>
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
                  <li>Hundreds: 8 + 3 + 1 = 12 → write 12</li>
                </ul>
                <p className="text-sm font-bold text-emerald-600 mt-1.5">Answer: 1203</p>
              </InfoCard>
              <InfoCard className="mt-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">1000 − 473 <span className="font-normal text-gray-400">(the trickiest kind — borrowing across zeros)</span></p>

                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
                  <strong>Why borrowing is needed here:</strong> look at the ones column — 0 − 3. You can&apos;t take
                  3 away from 0, so the ones column needs to borrow a ten from somewhere.
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
                  <strong>Why you can&apos;t just borrow from the next column:</strong> the tens column is also a
                  zero — there&apos;s nothing there to give. The hundreds column is a zero too. The only column with
                  anything in it is the thousands column, so the borrow has to travel all the way there.
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
                  <strong>Where the value actually comes from:</strong> the thousands column holds a 1, worth 1000.
                  Regroup that 1000 as 900 + 90 + 10 — the same total value, just split so every column that needs
                  to borrow has something to borrow from.
                </p>

                <div className="overflow-x-auto mt-3">
                  <table className="text-sm text-center border-collapse w-full">
                    <thead>
                      <tr className="text-xs text-gray-500 dark:text-gray-400">
                        <th className="p-1.5"></th>
                        <th className="p-1.5">Thousands</th>
                        <th className="p-1.5">Hundreds</th>
                        <th className="p-1.5">Tens</th>
                        <th className="p-1.5">Ones</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-800 dark:text-gray-200">
                      <tr className="border-t border-gray-200 dark:border-gray-700">
                        <td className="p-1.5 text-xs text-gray-500 dark:text-gray-400 text-left">Before borrowing</td>
                        <td className="p-1.5">1</td><td className="p-1.5">0</td><td className="p-1.5">0</td><td className="p-1.5">0</td>
                      </tr>
                      <tr className="border-t border-gray-200 dark:border-gray-700 font-semibold">
                        <td className="p-1.5 text-xs text-gray-500 dark:text-gray-400 text-left">After borrowing</td>
                        <td className="p-1.5">0</td><td className="p-1.5">9</td><td className="p-1.5">9</td><td className="p-1.5">10</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
                  <strong>Why every zero changes:</strong> the single 1 from the thousands column passes down through
                  each zero column in turn. Each one it passes through keeps a 9 and sends the rest further along,
                  until the ones column receives a full extra ten — that&apos;s why it&apos;s the only column that
                  becomes 10, not 9.
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
                  <strong>The place value hasn&apos;t changed:</strong> the 9 in the hundreds column still means 900.
                  The 9 in the tens column still means 90. The 10 in the ones column means the ones place is
                  temporarily holding ten ones — enough to subtract 3 from.
                </p>

                <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-0.5">
                  <li>Ones: 10 − 3 = 7</li>
                  <li>Tens: 9 − 7 = 2</li>
                  <li>Hundreds: 9 − 4 = 5</li>
                </ul>
                <p className="text-sm font-bold text-emerald-600 mt-1.5">Answer: 527</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                  <strong>Check it:</strong> 527 + 473 = 1000 ✓ — adding the answer back to what was subtracted
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
                        <Lightbulb size={13} className="mt-0.5 shrink-0" /> That&apos;s 11 — write the 1, carry the 1 to the tens column.
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
                      <XCircle size={16} /> Not quite yet — let&apos;s look again.
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 flex items-start gap-1.5">
                      <Lightbulb size={13} className="mt-0.5 shrink-0 text-indigo-500" />
                      {classifyWrongAnswer(guidedAttempt1.answer, GUIDED_KNOWN_MISCONCEPTIONS) ??
                        "Go back to the ones column and work through each column one at a time — remember to carry if a column adds to 10 or more."}
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
                      <><CheckCircle2 size={16} className="text-emerald-500" /> Correct — 931</>
                    ) : (
                      <><XCircle size={16} className="text-amber-500" /> That&apos;s alright — you&apos;ve seen the full method now.</>
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
                    <li><strong>Borrowing from a zero without continuing the chain.</strong> If the column you want to borrow from is a zero, keep going left until you find one with something to give — every column along the way changes too.</li>
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
                  <input
                    value={independentAnswer}
                    onChange={(e) => setIndependentAnswer(e.target.value)}
                    disabled={independentSubmitted}
                    className="w-full mt-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
                    placeholder="Your answer…"
                  />
                  {!independentSubmitted ? (
                    <button
                      onClick={() => void submitIndependent()}
                      disabled={!independentAnswer.trim()}
                      className="mt-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      Submit
                    </button>
                  ) : (
                    <div className="mt-3">
                      <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
                        {independentCorrect ? (
                          <><CheckCircle2 size={16} className="text-emerald-500" /> Correct — 435</>
                        ) : (
                          <><XCircle size={16} className="text-amber-500" /> Not quite — the answer is 435</>
                        )}
                      </p>
                      {!independentCorrect && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-start gap-1.5">
                          <Lightbulb size={13} className="mt-0.5 shrink-0 text-indigo-500" />
                          {classifyWrongAnswer(independentAnswer, INDEPENDENT_KNOWN_MISCONCEPTIONS) ??
                            "Have a go working through it column by column, and check where borrowing across the zero happens."}
                        </p>
                      )}
                    </div>
                  )}
                </InfoCard>
              </section>
            )}

            {/* EXAM APPLICATION + NEXT STEP */}
            {independentSubmitted && (
              <>
                <section>
                  <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">Where this shows up in the exam</h2>
                  <InfoCard>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      This exact type of question — a straightforward calculation with no story attached — is
                      usually one of the very first questions on a real 11+ maths paper. Getting comfortable with
                      carrying and borrowing means you can answer it quickly and confidently, leaving more time for
                      the harder questions later in the paper.
                    </p>
                  </InfoCard>
                </section>

                <section>
                  <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">What&apos;s next?</h2>
                  {independentCorrect ? (
                    <Link
                      href="/learning-intelligence/practice/mathematics"
                      className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      You&apos;re ready to practise this properly <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        setCheckStage("not-started");
                        setGuidedSubmitted(false);
                        setGuidedAnswer("");
                        setGuidedLadderStage("attempt-1");
                        setGuidedAttempt1(null);
                        setGuidedAttempt2(null);
                        setGuidedAttempt3(null);
                        setHintsShown(0);
                        setIndependentSubmitted(false);
                        setIndependentAnswer("");
                        setIndependentCorrect(null);
                      }}
                      className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      Let&apos;s go through this again <ArrowRight size={14} />
                    </button>
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
