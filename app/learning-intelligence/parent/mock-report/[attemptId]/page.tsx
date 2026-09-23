"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import { StatusIndicator } from "@/components/ui/Progress";
import { getSupabaseClient } from "@/lib/supabase";
import { getMockAttemptReport, getMockWritingAssessments } from "@/lib/mockAttempt/client";
import {
  scoreSummarySentence,
  strengthSentence,
  priorSentence,
  OFFICIAL_SCORE_DISCLAIMER,
  ANALYSIS_PENDING_NOTE,
  NO_SECURE_STRENGTHS_NOTE,
} from "@/lib/mockAttempt/reportCopy";
import { resolvePreparationClock } from "@/lib/learningEngine/preparationClock";
import { WRITING_DIMENSION_LABEL } from "@/lib/learningEngine/writingRubric";
import type { MockAttemptReport, MockWritingAssessment } from "@/lib/mockAttempt/types";

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
  const [writingAssessments, setWritingAssessments] = useState<MockWritingAssessment[]>([]);
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
      // Increment 3 (Progress + Results + Parent Dashboard) — the parent
      // report never fetched Writing assessment at all, so a parent whose
      // child sat the English Full Mock's Continuous Writing task saw
      // nothing about it here, even though the exact same real data was
      // already being shown on the child's own report. Reuses the same
      // getMockWritingAssessments() call the child report already makes —
      // no new engine, no new computation, just closing a real display gap.
      void getMockWritingAssessments(supabase, params.attemptId).then((r) => {
        if (!cancelled && r.data) setWritingAssessments(r.data);
      });
    }
    void load();
    return () => { cancelled = true; };
  }, [params.attemptId]);

  return (
    <PageLayout breadcrumbs={[{ label: "Parent Dashboard", href: "/learning-intelligence/parent" }, { label: "Mock result" }]}>
      <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
        {phase === "loading" && <p className="text-sm text-[var(--angel-muted)]" aria-live="polite">Loading…</p>}

        {phase === "error" && (
          <div className="text-center bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-6">
            <p className="text-sm font-semibold text-[var(--angel-navy)]">We couldn&apos;t load this result</p>
            <p className="text-xs text-[var(--angel-muted)] mt-1">{errorMessage}</p>
          </div>
        )}

        {phase === "not-available" && (
          <div className="text-center bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-6">
            <p className="text-sm font-semibold text-[var(--angel-navy)]">This report isn&apos;t released yet</p>
            <p className="text-xs text-[var(--angel-muted)] mt-2 leading-relaxed">
              Marking and analysis happen as a separate step from submission. This report will appear here once it&apos;s ready.
            </p>
          </div>
        )}

        {phase === "ready" && report && (
          <>
            <div>
              <h1 className="text-[var(--angel-navy)] font-bold text-2xl md:text-3xl leading-tight mb-1">Mock result</h1>
              {report.overall && <p className="text-sm md:text-base text-[var(--angel-ink)] mt-2 leading-relaxed">{scoreSummarySentence(report.overall)}</p>}
            </div>

            <div className="bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-5">
              <p className="text-xs font-semibold text-[var(--angel-muted)] uppercase tracking-widest mb-1">What this shows</p>
              {report.analysisState !== "complete" ? (
                // Analysis genuinely hasn't run yet -- the only case this
                // note may ever describe. Matches the learner report's own
                // established gate (analysisState === "complete") exactly.
                <p className="text-sm text-[var(--angel-muted)] leading-relaxed">{ANALYSIS_PENDING_NOTE}</p>
              ) : report.strengths && report.strengths.length > 0 ? (
                <p className="text-sm text-[var(--angel-ink)] leading-relaxed">{strengthSentence(report.strengths)}</p>
              ) : (
                // Analysis is complete; the deterministic engine simply
                // found no secure strength (never invented) -- the same
                // honest fallback the learner report already uses, never
                // "still being prepared" for a finished analysis.
                <p className="text-sm text-[var(--angel-muted)] leading-relaxed">{NO_SECURE_STRENGTHS_NOTE}</p>
              )}
            </div>

            <div className="bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-5">
              <p className="text-xs font-semibold text-[var(--angel-muted)] uppercase tracking-widest mb-1">How to read this result</p>
              <p className="text-xs text-[var(--angel-muted)] leading-relaxed">{OFFICIAL_SCORE_DISCLAIMER}</p>
              <p className="text-xs text-[var(--angel-muted)] leading-relaxed mt-2">
                This one Mock is a single data point. It is combined with your child&apos;s wider Practice evidence over time, never
                treated on its own as a change to how they&apos;re doing overall.
              </p>
            </div>

            {/* Increment 3 — this used to repeat the exact same weakness
                sentence twice (once here, once above under "What this
                shows"). Now shown once, in the one section a parent would
                actually look for it under. */}
            {report.weaknesses && report.weaknesses.length > 0 && (
              <div className="bg-[var(--angel-sky)] rounded-lg p-5">
                <p className="text-xs font-semibold text-[var(--angel-blue)] uppercase tracking-widest mb-1">What to work on next</p>
                <p className="text-sm text-[var(--angel-ink)] leading-relaxed">{priorSentence(report.weaknesses)}</p>
              </div>
            )}

            {writingAssessments.length > 0 && <WritingAssessmentSummary assessments={writingAssessments} />}

            <div className="bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-5">
              <p className="text-xs font-semibold text-[var(--angel-muted)] uppercase tracking-widest mb-1">Exam date</p>
              <p className="text-xs text-[var(--angel-muted)] leading-relaxed">
                Official CSSE 11+ test date: {OFFICIAL_CSSE_TEST_DATE}.
              </p>
              {clock.daysRemaining !== null && clock.daysRemaining >= 0 && (
                <p className="text-xs text-[var(--angel-muted)] leading-relaxed mt-1">
                  {clock.daysRemaining} day{clock.daysRemaining === 1 ? "" : "s"} until your target exam date.
                </p>
              )}
            </div>

            <Link href="/learning-intelligence/parent" className="inline-block text-xs font-semibold text-[var(--angel-blue)] hover:underline">
              Back to Parent Dashboard
            </Link>
          </>
        )}
      </div>
    </PageLayout>
  );
}

/**
 * Increment 3 (Progress + Results + Parent Dashboard) — new: the parent
 * report previously fetched and showed nothing about Continuous Writing,
 * even when the child's own report showed real, released Writing
 * assessment data for the same attempt. A shorter, parent-appropriate
 * summary of the same real data the child's report already shows in full
 * — one status per task, plus the five real dimension labels where the
 * assessment is complete. `review_required` is shown honestly, never
 * silently upgraded, matching the child report's own established rule.
 */
function WritingAssessmentSummary({ assessments }: { assessments: MockWritingAssessment[] }) {
  const ordered = [...assessments].sort((a, b) => a.taskType.localeCompare(b.taskType));
  return (
    <div className="bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-5">
      <p className="text-xs font-semibold text-[var(--angel-muted)] uppercase tracking-widest mb-1">Continuous Writing</p>
      <p className="text-xs text-[var(--angel-muted)] leading-relaxed mb-3">
        Assessed separately from the Comprehension/Mathematics result above — Angel does not currently have a
        confirmed official CSSE mark split between components, so this is reported on its own.
      </p>
      <div className="space-y-3">
        {ordered.map((assessment, i) => (
          <div key={assessment.questionId} className="border-t border-[var(--angel-border)] pt-3 first:border-t-0 first:pt-0">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-semibold text-[var(--angel-ink)]">Writing Task {i + 1}</span>
              {assessment.assessmentStatus === "review_required" ? (
                <StatusIndicator tone="warning" label="Review required" />
              ) : (
                <StatusIndicator tone="success" label="Assessment complete" />
              )}
            </div>
            {assessment.assessmentStatus === "review_required" ? (
              <p className="text-xs text-[var(--angel-muted)] leading-relaxed">
                Angel could not confidently assess this response automatically. This will be shown once reviewed.
              </p>
            ) : (
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {(assessment.humanReviewDimensions ?? assessment.dimensions).map((d) => (
                  <span key={d.dimension} className="text-xs text-[var(--angel-muted)]">
                    {WRITING_DIMENSION_LABEL[d.dimension]}: <span className="text-[var(--angel-ink)] font-medium">{d.level}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
