"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
import { getSupabaseClient } from "@/lib/supabase";
import { getMockAttemptReport } from "@/lib/mockAttempt/client";
import {
  scoreSummarySentence,
  strengthSentence,
  priorSentence,
  OFFICIAL_SCORE_DISCLAIMER,
  ANALYSIS_PENDING_NOTE,
  NO_SECURE_STRENGTHS_NOTE,
} from "@/lib/mockAttempt/reportCopy";
import { resolvePreparationClock } from "@/lib/learningEngine/preparationClock";
import type { MockAttemptReport } from "@/lib/mockAttempt/types";

/**
 * Programme Increment 008F, Part 9 — the parent-facing Mock intelligence
 * surface. Six clearly separated sections per the directive's own
 * structure: Result, Diagnostic interpretation, Evidence, Preparation
 * priority, Trend, Exam context. "Trend" is deliberately omitted here —
 * it requires comparable evidence across multiple Mock attempts, which
 * this increment does not build (no real Mock content exists yet to
 * compare across); shown only once that evidence genuinely exists, never
 * fabricated from one attempt. "Exam context" reuses
 * resolvePreparationClock() unchanged (no new calculation) alongside the
 * official CSSE facts already verified directly from csse.org.uk during
 * 008V — never blended with this attempt's own result.
 */
type Phase = "loading" | "not-available" | "ready" | "error";

const OFFICIAL_CSSE_TEST_DATE = "Saturday 19 September 2026";

export default function ParentMockReportPage() {
  const params = useParams<{ attemptId: string }>();
  const [phase, setPhase] = useState<Phase>("loading");
  const [report, setReport] = useState<MockAttemptReport | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const clock = resolvePreparationClock();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = getSupabaseClient();
      if (!supabase) { setErrorMessage("Not connected."); setPhase("error"); return; }
      const result = await getMockAttemptReport(supabase, params.attemptId);
      if (cancelled) return;
      if (result.error) { setErrorMessage(result.error); setPhase("error"); return; }
      if (!result.data || result.data.reportReleaseState !== "released") { setPhase("not-available"); return; }
      setReport(result.data);
      setPhase("ready");
    }
    void load();
    return () => { cancelled = true; };
  }, [params.attemptId]);

  return (
    <PageLayout breadcrumbs={[{ label: "Parent Dashboard", href: "/learning-intelligence/parent" }, { label: "Mock result" }]}>
      <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
        {phase === "loading" && <p className="text-sm text-gray-400 dark:text-gray-500" aria-live="polite">Loading…</p>}

        {phase === "error" && (
          <InfoCard className="text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">We couldn&apos;t load this result</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{errorMessage}</p>
          </InfoCard>
        )}

        {phase === "not-available" && (
          <InfoCard className="text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">This report isn&apos;t released yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 leading-relaxed">
              Marking and analysis happen as a separate step from submission. This report will appear here once it&apos;s ready.
            </p>
          </InfoCard>
        )}

        {phase === "ready" && report && (
          <>
            <div>
              <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl mb-1">Mock result</h1>
              <p className="text-xs text-gray-400 dark:text-gray-500">1. Result</p>
              {report.overall && <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">{scoreSummarySentence(report.overall)}</p>}
            </div>

            <InfoCard>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">2. Diagnostic interpretation</p>
              {report.analysisState !== "complete" ? (
                // Analysis genuinely hasn't run yet -- the only case this
                // note may ever describe. Matches the learner report's own
                // established gate (analysisState === "complete") exactly.
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{ANALYSIS_PENDING_NOTE}</p>
              ) : report.strengths && report.strengths.length > 0 ? (
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{strengthSentence(report.strengths)}</p>
              ) : (
                // Analysis is complete; the deterministic engine simply
                // found no secure strength (never invented) -- the same
                // honest fallback the learner report already uses, never
                // "still being prepared" for a finished analysis.
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{NO_SECURE_STRENGTHS_NOTE}</p>
              )}
              {report.weaknesses && report.weaknesses.length > 0 && (
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-2">{priorSentence(report.weaknesses)}</p>
              )}
            </InfoCard>

            <InfoCard>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">3. Evidence</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{OFFICIAL_SCORE_DISCLAIMER}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-2">
                This one Mock is a single data point. It is combined with your child&apos;s wider Practice evidence over time, never
                treated on its own as a change to their overall mastery or readiness.
              </p>
            </InfoCard>

            {report.weaknesses && report.weaknesses.length > 0 && (
              <InfoCard>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">4. Preparation priority</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{priorSentence(report.weaknesses)}</p>
              </InfoCard>
            )}

            <InfoCard>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">6. Exam context</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Official CSSE 11+ test date: {OFFICIAL_CSSE_TEST_DATE}.
              </p>
              {clock.daysRemaining !== null && clock.daysRemaining >= 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1">
                  {clock.daysRemaining} day{clock.daysRemaining === 1 ? "" : "s"} until your target exam date.
                </p>
              )}
            </InfoCard>

            <Link href="/learning-intelligence/parent" className="inline-block text-xs font-semibold text-blue-600 dark:text-blue-400">
              Back to Parent Dashboard
            </Link>
          </>
        )}
      </div>
    </PageLayout>
  );
}
