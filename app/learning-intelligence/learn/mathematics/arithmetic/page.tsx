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

function progressionLabel(
  checkStage: CheckStage,
  educationalState: EducationalIntelligenceSnapshot["educationalState"] | undefined
): { label: string; description: string } {
  if (checkStage === "not-started") {
    return { label: "Learning", description: "Working through the lesson." };
  }
  if (checkStage === "guided") {
    return { label: "Ready to practise", description: "The guided step is done — next is trying one alone." };
  }
  // An independent attempt has been made — defer to the real Educational Intelligence Engine.
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
  const [guidedCorrect, setGuidedCorrect] = useState<boolean | null>(null);
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

  async function submitGuided() {
    if (!guidedItem) return;
    const q = guidedItem.prompt as MathsQuestion;
    const isCorrect = checkMathsAnswer(guidedAnswer, String(q.answer));
    setGuidedCorrect(isCorrect);
    setGuidedSubmitted(true);

    const supabase = supabaseRef.current;
    if (supabase && profileIdRef.current) {
      await withTimeout(
        recordPresentation(supabase, profileIdRef.current, [guidedItem.id], "learning_guided"),
        10000,
        "saving your progress"
      ).catch(() => {});
      await recordOutcome(
        supabase,
        profileIdRef.current,
        guidedItem.id,
        isCorrect,
        sessionIdRef.current,
        guidedItem.masteryThreshold
      ).catch(() => {});
      // Guided evidence still feeds the real Educational Intelligence Engine —
      // per MATHEMATICS_PROGRESSION_AND_MASTERY_MODEL.md §3, it is tagged
      // distinctly (source: "learning_guided") but not suppressed.
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
    setCheckStage("guided");
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
                that happens, you <strong>borrow</strong> a ten from the next column. Carrying and borrowing
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
                <ul className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 space-y-0.5">
                  <li>Ones: 0 − 3 needs borrowing, but tens and hundreds are also 0 — the borrow travels all the way to the thousands column.</li>
                  <li>After borrowing: hundreds becomes 9, tens becomes 9, ones becomes 10.</li>
                  <li>Ones: 10 − 3 = 7. Tens: 9 − 7 = 2. Hundreds: 9 − 4 = 5.</li>
                </ul>
                <p className="text-sm font-bold text-emerald-600 mt-1.5">Answer: 527</p>
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
                {!guidedSubmitted && hintsShown < 3 && (
                  <button
                    onClick={() => setHintsShown((h) => h + 1)}
                    className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                  >
                    Need a hint?
                  </button>
                )}
                <input
                  value={guidedAnswer}
                  onChange={(e) => setGuidedAnswer(e.target.value)}
                  disabled={guidedSubmitted}
                  className="w-full mt-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
                  placeholder="Your answer…"
                />
                {!guidedSubmitted ? (
                  <button
                    onClick={() => void submitGuided()}
                    disabled={!guidedAnswer.trim()}
                    className="mt-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                  >
                    Submit
                  </button>
                ) : (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">
                    {guidedCorrect ? (
                      <><CheckCircle2 size={16} className="text-emerald-500" /> Correct — 931</>
                    ) : (
                      <><XCircle size={16} className="text-amber-500" /> Not quite — the answer is 931</>
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
                    <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">
                      {independentCorrect ? (
                        <><CheckCircle2 size={16} className="text-emerald-500" /> Correct — 435</>
                      ) : (
                        <><XCircle size={16} className="text-amber-500" /> Not quite — the answer is 435</>
                      )}
                    </p>
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
                        setGuidedCorrect(null);
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
