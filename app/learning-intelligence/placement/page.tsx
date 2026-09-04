"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Compass } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
import { getSupabaseClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/supabaseProgress";
import { withTimeout } from "@/lib/withTimeout";
import { getSelectedPathwayId, setSelectedPathway } from "@/lib/progress";
import { fetchQuestionBank } from "@/lib/ali/questionBank";
import { fetchStudentHistory } from "@/lib/ali/history";
import { recordPresentation, recordOutcome } from "@/lib/ali/history";
import { buildPlacementSession, type PlacementSession } from "@/lib/learningEngine/placementDiagnostic";
import { checkMathsAnswer } from "@/lib/learningEngine/practiceContent";
import type { CompetencyId } from "@/lib/learningEngine/types";
import type { BankQuestion } from "@/types/ali/questionBank";
import type { MathsQuestion } from "@/types/index";

/**
 * Programme Increment 021, Part 3 — Late-Entrant / Unknown-Evidence
 * Placement. Operationalises the existing Increment 019 foundation
 * (lib/learningEngine/placementDiagnostic.ts) with a real learner-facing
 * destination, which did not previously exist anywhere in app/.
 *
 * Deliberately, disclosedly SCOPED TO MATHEMATICS ONLY for this first
 * implementation — every Mathematics question is 100% deterministically
 * scored (`checkMathsAnswer`), so the whole flow can be genuinely SHORT
 * and BOUNDED with no manual-marking/AI-scoring round trip mid-diagnostic.
 * English Reading's TIER3/TIER5 validation tiers require manual marking
 * (lib/learningEngine/englishAnswerValidation.ts), and Writing requires
 * the AI feedback endpoint — both would make a "short, bounded, non-
 * punitive" diagnostic materially slower and less deterministic. Extending
 * placement to those subjects is a real, disclosed next step, not
 * attempted here.
 *
 * Reuses `buildPlacementSession()`/`checkMathsAnswer()`/`recordPresentation()`/
 * `recordOutcome()` completely unmodified — the RESULTS of this session
 * are simply real Practice attempts recorded through the exact same path
 * every other Practice question uses, read back by the exact same
 * `computePreparationDecision()` every other page already calls. No new
 * table, no new persistence, no new content, no new question bank.
 *
 * Never draws from Mock-eligible or Mock-exposed content: `fetchQuestionBank()`
 * is the same real Practice-eligible gate every other page already uses
 * (a positive allow-list of exactly `eligibility_status = 'practice_eligible'`,
 * lib/ali/questionBank.ts) — structurally incapable of returning SEALED
 * Mock material.
 */

const MATHEMATICS_COMPETENCY_IDS: CompetencyId[] = ["MR-01", "MR-02", "MR-03", "MR-04", "MR-05", "MR-06"];

type Mode = "intro" | "loading" | "error" | "question" | "finishing" | "done";

function PlacementPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnArea = searchParams.get("returnArea") || "mathematics";

  const [mode, setMode] = useState<Mode>("intro");
  const [errorMessage, setErrorMessage] = useState("");
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  const supabaseRef = useRef<ReturnType<typeof getSupabaseClient>>(null);
  const profileIdRef = useRef<string>("");
  const sessionIdRef = useRef<string>("");

  async function start() {
    setMode("loading");
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("no client");
      supabaseRef.current = supabase;

      const profileId = await withTimeout(ensureProfile(), 10000, "your profile");
      if (!profileId) throw new Error("no profile");
      profileIdRef.current = profileId;
      sessionIdRef.current = `placement-${Date.now()}`;

      if (getSelectedPathwayId() !== "csse") setSelectedPathway("csse");

      const [bank, history] = await Promise.all([
        withTimeout(fetchQuestionBank(supabase, "maths", "csse"), 10000, "placement questions"),
        withTimeout(fetchStudentHistory(supabase, profileId), 10000, "your history"),
      ]);

      // One question per Mathematics competency — the smallest sample that
      // gives every competency at least one genuine, real attempt (see
      // this file's own module docstring for why one attempt is already
      // enough to move a competency's own confidenceTier off
      // "insufficient" -- lib/ali/confidence.ts's own real threshold).
      const session: PlacementSession = buildPlacementSession(bank, history, MATHEMATICS_COMPETENCY_IDS, 1);
      const sample = [...session.byCompetency.values()].flat();

      if (sample.length === 0) {
        throw new Error("Placement questions aren't available yet. Try Practice directly instead.");
      }

      await withTimeout(
        recordPresentation(supabase, profileId, sample.map((q) => q.id), "placement_diagnostic"),
        10000,
        "starting placement"
      );

      setQuestions(sample);
      setIndex(0);
      setMode("question");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setMode("error");
    }
  }

  async function submitAnswer() {
    const supabase = supabaseRef.current;
    const current = questions[index];
    if (!supabase || !current || !answer.trim()) return;

    const q = current.prompt as MathsQuestion;
    const isCorrect = checkMathsAnswer(answer, String(q.answer));
    setLastCorrect(isCorrect);
    setSubmitted(true);

    await recordOutcome(supabase, profileIdRef.current, current.id, isCorrect, sessionIdRef.current, current.masteryThreshold).catch(() => {});
  }

  function next() {
    setAnswer("");
    setSubmitted(false);
    setLastCorrect(null);
    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      void finish();
    }
  }

  async function finish() {
    setMode("finishing");
    // Establishing a starting point only — never a claim of comprehensive
    // assessment from a handful of questions (Founder's own explicit
    // instruction). The fresh decision is read by the practice page
    // itself once we route there; this page does not re-derive or
    // display a numeric/ability classification of its own.
    router.replace(`/learning-intelligence/practice/${encodeURIComponent(returnArea)}`);
  }

  const current = questions[index];
  const q = current?.prompt as MathsQuestion | undefined;

  return (
    <PageLayout breadcrumbs={[{ label: "Placement" }]}>
      <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {mode === "intro" && (
          <InfoCard className="flex items-start gap-3">
            <Compass size={20} className="text-sky-600 shrink-0 mt-0.5" />
            <div>
              <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Finding your starting point</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Before we begin, Angel would like to see a few quick questions across different areas of maths.
                There&apos;s no pass or fail here, and it only takes a few minutes. It just helps Angel choose a
                sensible starting point for you.
              </p>
              <button
                onClick={() => void start()}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Start
              </button>
            </div>
          </InfoCard>
        )}

        {mode === "loading" && <p className="text-sm text-gray-400 dark:text-gray-500" aria-live="polite">Getting ready…</p>}

        {mode === "error" && (
          <InfoCard className="text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">We couldn&apos;t start this</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{errorMessage}</p>
            <button onClick={() => void start()} className="mt-4 text-xs font-semibold text-sky-700 dark:text-sky-400">
              Try again
            </button>
          </InfoCard>
        )}

        {mode === "question" && current && q && (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              Question {index + 1} of {questions.length}
            </p>
            <InfoCard>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{q.question}</p>
              {!submitted && (
                <>
                  <input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full mt-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3"
                    placeholder="Your answer…"
                    aria-label="Your answer"
                  />
                  <button
                    onClick={() => void submitAnswer()}
                    disabled={!answer.trim()}
                    className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                  >
                    Submit
                  </button>
                </>
              )}
              {submitted && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
                    {lastCorrect ? (
                      <><CheckCircle2 size={16} className="text-emerald-500" /> Got it, thank you.</>
                    ) : (
                      <><XCircle size={16} className="text-amber-500" /> That&apos;s alright, this helps Angel just as much either way.</>
                    )}
                  </p>
                  <button
                    onClick={next}
                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                  >
                    {index + 1 < questions.length ? "Next" : "Finish"}
                  </button>
                </div>
              )}
            </InfoCard>
          </div>
        )}

        {mode === "finishing" && <p className="text-sm text-gray-400 dark:text-gray-500" aria-live="polite">Finding your starting point…</p>}
      </div>
    </PageLayout>
  );
}

export default function PlacementPage() {
  return (
    <Suspense fallback={<PageLayout breadcrumbs={[{ label: "Placement" }]}><div className="max-w-2xl mx-auto px-4 py-6" /></PageLayout>}>
      <PlacementPageInner />
    </Suspense>
  );
}
