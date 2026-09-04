"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowRight, Lightbulb, AlertTriangle, Target } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
import { CompoundShapeDiagram } from "@/components/practice/CompoundShapeDiagram";
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
 * Programme Increment 020, Wave 1 — "Area of Compound Shapes" (MR-03,
 * QT-MR-07). Full selection evidence and family coverage map in this
 * increment's own commit message.
 *
 * Deliberately the same structure as Lesson 001/002
 * (arithmetic/percentages): concept -> method -> worked examples ->
 * guided attempt (bounded 3-attempt ladder) -> common mistakes ->
 * independent check (bounded remediation ladder + fresh transfer) -> exam
 * application -> next step. This lesson teaches AREA end-to-end; the
 * family's OTHER real skill (perimeter, requiring two "hidden" sides to
 * be inferred) is deliberately left for Practice's own reactive guided
 * support (lib/learningEngine/mathsTeachingContent.ts's own
 * "mr03-compound-area-perimeter" entry) rather than crammed into one
 * lesson — "how the concept may appear differently" is genuinely met
 * across the two surfaces, not duplicated.
 *
 * No architecture terms (MR-03, QT-MR-07, EMC-4) are shown to the learner
 * anywhere below — only in code comments, for internal traceability.
 */

const COMPETENCY_ID = "MR-03" as const;

type Mode = "intro" | "loading" | "error" | "lesson";
type CheckStage = "not-started" | "guided" | "independent" | "done";
type GuidedLadderStage = "attempt-1" | "attempt-2" | "attempt-3" | "resolved";
type IndependentLadderStage = "attempt-1" | "attempt-2" | "remediation" | "resolved";

/**
 * Deterministic, hand-verified wrong-answer lookup for these two specific
 * fixed problems only — same discipline as Lesson 001/002's own
 * classifyWrongAnswer().
 */
interface KnownMisconception {
  wrongAnswer: number;
  explanation: string;
}
const GUIDED_KNOWN_MISCONCEPTIONS: KnownMisconception[] = [
  {
    // 9x4 + 4x3 = 48: adding all four given lengths (9+4+4+3=20) instead of finding the two rectangle areas first.
    wrongAnswer: 20,
    explanation:
      "It looks like the four given lengths may have been added together. Each rectangle's own two sides need to be multiplied first, and then the two areas added.",
  },
];
const INDEPENDENT_KNOWN_MISCONCEPTIONS: KnownMisconception[] = [
  {
    // 8x5 + 3x2 = 46: adding all four given lengths (8+5+3+2=18) instead of finding the two rectangle areas first.
    wrongAnswer: 18,
    explanation:
      "It looks like the four given lengths may have been added together. Each rectangle's own two sides need to be multiplied first, and then the two areas added.",
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

export default function MathematicsCompoundShapesLessonPage() {
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
      sessionIdRef.current = `learn-mth-compound-shapes-${Date.now()}`;

      if (getSelectedPathwayId() !== "csse") setSelectedPathway("csse");

      const maths = await withTimeout(fetchQuestionBank(supabase, "maths", "csse"), 10000, "this lesson's questions");
      const guided = maths.find((q) => q.id === "mr03-compound-01") ?? null;
      const independent = maths.find((q) => q.id === "mr03-compound-02") ?? null;
      const independentRetry = maths.find((q) => q.id === "mr03-compound-08") ?? null;

      if (!guided || !independent) {
        throw new Error(
          "This lesson's practice questions aren't available yet. Migrations 222/223 " +
          "(supabase/migrations/222_mathematics_mr03_compound_shape_wave1.sql and 223) have not been applied " +
          "and reviewed yet. Apply and review them via Supabase Dashboard > SQL Editor, then try again."
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
    <PageLayout breadcrumbs={[{ label: "Learn", href: "/learning-intelligence/learn" }, { label: "Area of Compound Shapes" }]}>
      <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {mode === "intro" && (
          <InfoCard>
            <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Area of Compound Shapes</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              A real lesson: understand the method, try it with support, then try it alone.
            </p>
            <button
              onClick={() => void loadLesson()}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
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
              <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Area of Compound Shapes</h1>
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
                A compound shape is made of two or more simple rectangles joined together, often shown as an
                L-shape. It looks unfamiliar at first, but every compound shape can be split back into the plain
                rectangles you already know how to work with.
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
                Once it&apos;s split into rectangles, the method is exactly the one you already know: find each
                rectangle&apos;s own area (length × width), then add the areas together.
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
                The real skill in this lesson isn&apos;t a new formula: it&apos;s learning to see an unfamiliar
                shape as two familiar ones.
              </p>
            </section>

            {/* METHOD */}
            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">The method</h2>
              <InfoCard>
                <ol className="text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside space-y-1">
                  <li>Look for a straight line that splits the shape into two plain rectangles.</li>
                  <li>Find the first rectangle&apos;s area: its own length × its own width.</li>
                  <li>Find the second rectangle&apos;s area the same way.</li>
                  <li>Add the two areas together for the total.</li>
                </ol>
              </InfoCard>
            </section>

            {/* WORKED EXAMPLES */}
            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">Worked examples</h2>
              <InfoCard>
                <div className="mb-2">
                  <CompoundShapeDiagram
                    diagram={{
                      type: "compound_rectilinear",
                      vertices: [{ x: 0, y: 0 }, { x: 7, y: 0 }, { x: 7, y: 3 }, { x: 3, y: 3 }, { x: 3, y: 5 }, { x: 0, y: 5 }],
                      edgeLabels: [
                        { edgeIndex: 0, label: "7 m" },
                        { edgeIndex: 1, label: "3 m" },
                        { edgeIndex: 3, label: "2 m" },
                        { edgeIndex: 4, label: "3 m" },
                      ],
                    }}
                  />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">L-shaped lawn: 7m × 3m, plus 3m × 2m</p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 space-y-0.5">
                  <li>Lower rectangle: 7m × 3m = 21m²</li>
                  <li>Upper rectangle: 3m × 2m = 6m²</li>
                  <li>Total = 21m² + 6m²</li>
                </ul>
                <p className="text-sm font-bold text-emerald-600 mt-1.5">Answer: 27m²</p>
              </InfoCard>
              <InfoCard className="mt-2">
                <div className="mb-2">
                  <CompoundShapeDiagram
                    diagram={{
                      type: "compound_rectilinear",
                      vertices: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 6 }, { x: 4, y: 6 }, { x: 4, y: 9 }, { x: 0, y: 9 }],
                      edgeLabels: [
                        { edgeIndex: 0, label: "10 m" },
                        { edgeIndex: 1, label: "6 m" },
                        { edgeIndex: 3, label: "3 m" },
                        { edgeIndex: 4, label: "4 m" },
                      ],
                    }}
                  />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  L-shaped floor: 10m × 6m, plus 4m × 3m <span className="font-normal text-gray-400">(a bigger example)</span>
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 space-y-0.5">
                  <li>Lower rectangle: 10m × 6m = 60m²</li>
                  <li>Upper rectangle: 4m × 3m = 12m²</li>
                  <li>Total = 60m² + 12m²</li>
                </ul>
                <p className="text-sm font-bold text-emerald-600 mt-1.5">Answer: 72m²</p>
              </InfoCard>
            </section>

            {/* GUIDED ATTEMPT */}
            <section>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">Try one with help</h2>
              <InfoCard>
                {guidedItem && (guidedItem.prompt as MathsQuestion).diagram && (
                  <div className="mb-2">
                    <CompoundShapeDiagram diagram={(guidedItem.prompt as MathsQuestion).diagram!} />
                  </div>
                )}
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {guidedItem ? (guidedItem.prompt as MathsQuestion).question : "…"}
                </p>

                {hintsShown > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {hintsShown >= 1 && (
                      <p className="text-xs text-sky-700 dark:text-sky-400 flex items-start gap-1.5">
                        <Lightbulb size={13} className="mt-0.5 shrink-0" /> Find the lower rectangle&apos;s area first. What&apos;s 9m × 4m?
                      </p>
                    )}
                    {hintsShown >= 2 && (
                      <p className="text-xs text-sky-700 dark:text-sky-400 flex items-start gap-1.5">
                        <Lightbulb size={13} className="mt-0.5 shrink-0" /> That&apos;s 36m². Now find the upper rectangle&apos;s area: 4m × 3m.
                      </p>
                    )}
                    {hintsShown >= 3 && (
                      <p className="text-xs text-sky-700 dark:text-sky-400 flex items-start gap-1.5">
                        <Lightbulb size={13} className="mt-0.5 shrink-0" /> That&apos;s 12m². Now add the two areas together.
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
                      className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
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
                        "Go back and find each rectangle's own area separately before adding them together."}
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
                      aria-label="Try again"
                    />
                    <button
                      onClick={() => void submitGuidedAttempt2()}
                      disabled={!guidedAnswer.trim()}
                      className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
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
                      <li>Lower rectangle: 9m × 4m = 36m²</li>
                      <li>Upper rectangle: 4m × 3m = 12m²</li>
                    </ul>
                    <p className="text-sm font-bold text-emerald-600 mt-1.5">Answer: 48m²</p>
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
                      className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      Submit
                    </button>
                  </>
                )}

                {guidedLadderStage === "resolved" && (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">
                    {(guidedAttempt3 ?? guidedAttempt2 ?? guidedAttempt1)?.correct ? (
                      <><CheckCircle2 size={16} className="text-emerald-500" /> Correct: 48m²</>
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
                    <li><strong>Adding the lengths instead of finding areas first.</strong> Every rectangle&apos;s own two sides must be multiplied together before anything is added; never add raw side lengths and call that the area.</li>
                    <li><strong>Mixing up area and perimeter.</strong> Area covers the whole surface (measured in m²); perimeter is just the distance around the edge. This lesson is about area, and perimeter of a compound shape is its own, separate skill you&apos;ll meet in Practice.</li>
                  </ul>
                </InfoCard>
              </section>
            )}

            {/* INDEPENDENT CHECK */}
            {guidedSubmitted && (
              <section>
                <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">Now try one alone</h2>
                <InfoCard>
                  {independentItem && (independentItem.prompt as MathsQuestion).diagram && (
                    <div className="mb-2">
                      <CompoundShapeDiagram diagram={(independentItem.prompt as MathsQuestion).diagram!} />
                    </div>
                  )}
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
                        className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
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
                          "Split the shape into its two rectangles again, find each area separately, then add them. Try again."}
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
                        aria-label="Try again"
                      />
                      <button
                        onClick={() => void submitIndependentAttempt2()}
                        disabled={!independentAnswer.trim()}
                        className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
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
                        <li>Main rectangle: 8m × 5m = 40m²</li>
                        <li>Smaller rectangle: 3m × 2m = 6m²</li>
                      </ul>
                      <p className="text-sm font-bold text-emerald-600 mt-1.5">Answer: 46m²</p>
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
                        className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
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
                      {independentRetryItem && (independentRetryItem.prompt as MathsQuestion).diagram && (
                        <div className="mb-2">
                          <CompoundShapeDiagram diagram={(independentRetryItem.prompt as MathsQuestion).diagram!} />
                        </div>
                      )}
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
                            className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                          >
                            Submit
                          </button>
                        </>
                      )}
                      {independentFreshAttempt && (
                        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">
                          {independentFreshAttempt.correct ? (
                            <><CheckCircle2 size={16} className="text-emerald-500" /> Correct: 24m². That&apos;s genuine evidence you&apos;ve got it.</>
                          ) : (
                            <><XCircle size={16} className="text-amber-500" /> Not quite. The answer is 24m². That&apos;s alright, this is real evidence either way.</>
                          )}
                        </p>
                      )}
                    </div>
                  ) : null}

                  {independentLadderStage === "resolved" && (independentAttempt1?.correct || independentAttempt2?.correct) && (
                    <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">
                      <CheckCircle2 size={16} className="text-emerald-500" /> Correct: 46m²
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
                      Compound-shape questions appear regularly on 11+ maths papers, often as a floor plan, garden or
                      field. This lesson covers finding the area. The same shapes also come up asking for the
                      perimeter instead: a related but genuinely different skill, since a compound shape&apos;s
                      perimeter needs its &ldquo;hidden&rdquo; sides worked out first. You&apos;ll meet that version in Practice.
                    </p>
                  </InfoCard>
                </section>

                <section>
                  <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg mb-2">What&apos;s next?</h2>
                  {independentUltimatelyCorrect ? (
                    <Link
                      href="/learning-intelligence/practice/mathematics"
                      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      You&apos;re ready to practise this properly <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <Link
                      href="/learning-intelligence/practice/mathematics"
                      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      Practise compound shapes again <ArrowRight size={14} />
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
