"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
import { getSupabaseClient } from "@/lib/supabase";
import { getMockAttemptReport } from "@/lib/mockAttempt/client";
import { scoreSummarySentence, strengthSentence, OFFICIAL_SCORE_DISCLAIMER, ANALYSIS_PENDING_NOTE } from "@/lib/mockAttempt/reportCopy";
import type { MockAttemptReport } from "@/lib/mockAttempt/types";

/**
 * Programme Increment 008F, Part 8 — the child-facing Mock report.
 * Deliberately minimal (008V's full visual redesign is explicitly out of
 * scope for this bounded reporting surface, per the 008F directive
 * itself): plain facts, encouraging framing, no competency IDs, no
 * database terminology, no admission predictions. Report content is
 * gated entirely by the server (ali_mock_attempt_report's own RLS,
 * migration 072/074) — "not released yet" and "doesn't exist" are
 * indistinguishable here on purpose (lib/mockAttempt/client.ts's own
 * getMockAttemptReport() doc comment explains why).
 */
type Phase = "loading" | "not-available" | "ready" | "error";

export default function MockReportPage() {
  const params = useParams<{ attemptId: string }>();
  const [phase, setPhase] = useState<Phase>("loading");
  const [report, setReport] = useState<MockAttemptReport | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

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
    <PageLayout breadcrumbs={[{ label: "Learning Report", href: "/learning-intelligence" }, { label: "Mock result" }]}>
      <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {phase === "loading" && (
          <p className="text-sm text-gray-400 dark:text-gray-500" aria-live="polite">Checking your Mock result…</p>
        )}

        {phase === "error" && (
          <InfoCard className="text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">We couldn&apos;t load this result</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{errorMessage}</p>
          </InfoCard>
        )}

        {phase === "not-available" && (
          <InfoCard className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">Your report isn&apos;t ready yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Your Mock is being prepared. Check back soon.
            </p>
            <Link href="/learning-intelligence" className="inline-block mt-4 text-xs font-semibold text-purple-600 dark:text-purple-400">
              Back to dashboard
            </Link>
          </InfoCard>
        )}

        {phase === "ready" && report && (
          <div className="space-y-5">
            <div>
              <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Your Mock result</h1>
              {report.overall && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">{scoreSummarySentence(report.overall)}</p>
              )}
            </div>

            <InfoCard>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{OFFICIAL_SCORE_DISCLAIMER}</p>
            </InfoCard>

            {report.strengths && report.strengths.length > 0 ? (
              <InfoCard className="border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40">
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">What went well</p>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1 leading-relaxed">{strengthSentence(report.strengths)}</p>
              </InfoCard>
            ) : (
              <InfoCard>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{ANALYSIS_PENDING_NOTE}</p>
              </InfoCard>
            )}

            <Link href="/learning-intelligence" className="inline-block text-xs font-semibold text-purple-600 dark:text-purple-400">
              Back to dashboard
            </Link>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
