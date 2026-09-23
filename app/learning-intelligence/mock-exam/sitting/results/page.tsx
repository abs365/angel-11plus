"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Circle, PlayCircle } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { StatusIndicator } from "@/components/ui/Progress";
import { getSupabaseClient } from "@/lib/supabase";
import { getMockCycleAttempts, getMockAttemptReport, getMockWritingAssessments } from "@/lib/mockAttempt/client";
import { deriveMockCycleSittingState, type MockCycleSittingState } from "@/lib/mockAttempt/cycleState";
import type { MockAttemptReport, MockWritingAssessment } from "@/lib/mockAttempt/types";
import { WRITING_DIMENSION_LABEL } from "@/lib/learningEngine/writingRubric";
import { childFriendlySkillLabel } from "@/lib/mockAttempt/reportCopy";

/**
 * CSSE Two-Paper Mock, pre-activation completion pass (governing brief
 * §9-§11) — the sitting-level result/readiness view, composed entirely
 * from EXISTING evidence: each paper's own ali_mock_attempt_report (RLS-
 * gated, read via getMockAttemptReport(), unchanged) and English's own
 * Writing assessments (ali_writing_assessment, migration 245, read via
 * getMockWritingAssessments(), unchanged). No new scoring/analysis logic
 * — this page composes and labels, it does not compute.
 *
 * NEVER presents a combined/official CSSE score (§9's own explicit
 * instruction) — English and Mathematics are always shown as separate
 * components. Distinguishes SITTING COMPLETE (both papers submitted)
 * from ALL ASSESSMENT REVIEW COMPLETE (additionally, no Writing
 * assessment is still review_required) — §11's own required distinction
 * — so a review_required Writing item never blocks the rest of the
 * result from being visible.
 */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-bold text-[var(--angel-muted)] uppercase tracking-widest">{children}</h2>;
}

function MathematicsSection({ report }: { report: MockAttemptReport | null }) {
  if (!report) {
    return (
      <div className="bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-5">
        <p className="text-xs text-[var(--angel-muted)]">Mathematics result is not yet available — it may still be being prepared, or has not yet been released.</p>
      </div>
    );
  }
  return (
    <div className="bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-5">
      <p className="text-sm font-bold text-[var(--angel-navy)] mb-2">Mathematics</p>
      {report.overall && (
        <p className="text-xs text-[var(--angel-ink)] mb-2">
          {report.overall.rawMarksAchieved} / {report.overall.rawMarksAvailable} marks
          {report.overall.percentage !== null ? ` (${report.overall.percentage}%)` : " (some items awaiting marking)"}
        </p>
      )}
      {report.strengths && report.strengths.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--angel-muted)] mb-1">Strengths</p>
          <ul className="text-xs text-[var(--angel-ink)] space-y-0.5">
            {report.strengths.map((s) => (
              <li key={s.competencyId}>{childFriendlySkillLabel(s.competencyId, s.competencyId)} — {s.correctCount}/{s.questionCount}</li>
            ))}
          </ul>
        </div>
      )}
      {report.weaknesses && report.weaknesses.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--angel-muted)] mb-1">Areas to strengthen</p>
          <ul className="text-xs text-[var(--angel-ink)] space-y-0.5">
            {report.weaknesses.map((s) => (
              <li key={s.competencyId}>{childFriendlySkillLabel(s.competencyId, s.competencyId)} — {s.correctCount}/{s.questionCount}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function WritingAssessmentRow({ assessment }: { assessment: MockWritingAssessment }) {
  const dims = assessment.humanReviewDimensions ?? assessment.dimensions;
  return (
    <div className="border-t border-[var(--angel-border)] pt-2 mt-2 first:border-t-0 first:pt-0 first:mt-0">
      <div className="flex items-center gap-2 mb-1">
        <p className="text-xs font-bold text-[var(--angel-navy)]">{assessment.taskType} — Continuous Writing</p>
        {assessment.assessmentStatus === "review_required" ? (
          <StatusIndicator tone="warning" label="Under review" />
        ) : (
          <StatusIndicator tone="success" label="Assessed" />
        )}
        {assessment.humanReviewedAt && <StatusIndicator tone="info" label="Reviewed" />}
      </div>
      {assessment.assessmentStatus === "review_required" && (
        <p className="text-xs text-amber-700 dark:text-amber-400 mb-1">
          This response needs a closer look before Angel shows a confident assessment{assessment.reviewRequiredReasons && assessment.reviewRequiredReasons.length > 0 ? `: ${assessment.reviewRequiredReasons.join("; ")}` : "."}
        </p>
      )}
      <ul className="text-xs text-[var(--angel-ink)] space-y-0.5">
        {dims.map((d) => (
          <li key={d.dimension}>
            {WRITING_DIMENSION_LABEL[d.dimension as keyof typeof WRITING_DIMENSION_LABEL] ?? d.dimension}: {d.level}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * CSSE Two-Paper Mock, final learner acceptance correction — real
 * evidence proved this section's own "(some items awaiting marking)"
 * caveat was permanently, structurally stuck on for english-full-mock-v1,
 * regardless of whether Reading itself had any outstanding marking.
 * Root cause: report.overall.percentage (migration 251's own
 * mock_persist_reading_scoring()) is set to null whenever ANY entry in
 * question_outcomes is still 'requires_manual_marking' -- and English's
 * own two Writing questions remain at that status PERMANENTLY by design
 * (migration 245/251: a Writing item's persisted qualitative assessment
 * lives entirely in ali_writing_assessment, never in question_outcomes),
 * even once genuinely, correctly assessed. This section reused that same
 * percentage-is-null signal to decide Reading's own caveat, so it could
 * never turn off for this form -- the exact defect, not a display of
 * genuinely outstanding Reading marking.
 *
 * Fix: derive Reading's own outstanding-marking state directly from
 * question_outcomes, explicitly excluding the attempt's own known Writing
 * question ids (from the already-fetched `writing` array) -- the same
 * evidence-based exclusion migration 251's own mock_check_and_complete_
 * scoring() already applies for the identical reason. rawMarksAchieved/
 * rawMarksAvailable/percentage themselves are completely unchanged --
 * only the caveat's own trigger condition is corrected.
 */
function EnglishSection({ report, writing }: { report: MockAttemptReport | null; writing: MockWritingAssessment[] }) {
  if (!report) {
    return (
      <div className="bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-5">
        <p className="text-xs text-[var(--angel-muted)]">English result is not yet available — it may still be being prepared, or has not yet been released.</p>
      </div>
    );
  }
  const writingQuestionIds = new Set(writing.map((w) => w.questionId));
  const readingHasOutstandingMarking = (report.questionOutcomes ?? []).some(
    (o) => o.status === "requires_manual_marking" && !writingQuestionIds.has(o.questionId)
  );
  return (
    <div className="bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-5">
      <p className="text-sm font-bold text-[var(--angel-navy)] mb-2">English</p>
      {report.overall && (
        <p className="text-xs text-[var(--angel-ink)] mb-2">
          Reading Comprehension: {report.overall.rawMarksAchieved} / {report.overall.rawMarksAvailable} marks
          {readingHasOutstandingMarking ? " (some items awaiting marking)" : report.overall.percentage !== null ? ` (${report.overall.percentage}%)` : ""}
        </p>
      )}
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--angel-muted)] mb-1">
        Continuous Writing (assessed separately — not pooled with Comprehension marks; no confirmed official split exists)
      </p>
      {writing.length === 0 ? (
        <p className="text-xs text-[var(--angel-muted)]">Writing assessment is still being prepared.</p>
      ) : (
        writing.map((w) => <WritingAssessmentRow key={w.questionId} assessment={w} />)
      )}
    </div>
  );
}

export default function CsseMockSittingResultsPage({ searchParams }: { searchParams: Promise<{ cycleId?: string }> }) {
  const { cycleId } = use(searchParams);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [sitting, setSitting] = useState<MockCycleSittingState | null>(null);
  const [mathsReport, setMathsReport] = useState<MockAttemptReport | null>(null);
  const [englishReport, setEnglishReport] = useState<MockAttemptReport | null>(null);
  const [writingAssessments, setWritingAssessments] = useState<MockWritingAssessment[]>([]);

  useEffect(() => {
    if (!cycleId) { setErrorMessage("No sitting specified."); setLoading(false); return; }
    (async () => {
      const supabase = getSupabaseClient();
      if (!supabase) { setErrorMessage("Not connected."); setLoading(false); return; }

      const attempts = await getMockCycleAttempts(supabase, cycleId);
      if (attempts.error) { setErrorMessage(attempts.error); setLoading(false); return; }
      const state = deriveMockCycleSittingState(cycleId, attempts.data ?? []);
      setSitting(state);

      const [mathsReportResult, englishReportResult, writingResult] = await Promise.all([
        state.mathematics.attemptId ? getMockAttemptReport(supabase, state.mathematics.attemptId) : Promise.resolve({ data: null, error: null }),
        state.english.attemptId ? getMockAttemptReport(supabase, state.english.attemptId) : Promise.resolve({ data: null, error: null }),
        state.english.attemptId ? getMockWritingAssessments(supabase, state.english.attemptId) : Promise.resolve({ data: [], error: null }),
      ]);
      setMathsReport(mathsReportResult.data);
      setEnglishReport(englishReportResult.data);
      setWritingAssessments(writingResult.data ?? []);
      setLoading(false);
    })();
  }, [cycleId]);

  // §11's own required distinction: SITTING COMPLETE (both papers
  // submitted -- an attempt-lifecycle fact) is never the same claim as
  // ALL ASSESSMENT REVIEW COMPLETE (additionally, no Writing item is
  // still review_required -- an assessment-quality fact). A learner's
  // result stays visible either way; only the label differs, honestly.
  //
  // Final production acceptance — a real, live defect found and fixed:
  // both reports are release-gated (an admin action, separate from
  // submission itself), so immediately after submitting, englishReport/
  // mathsReport are both still null and writingAssessments is still
  // empty. The original logic read an empty writingAssessments array as
  // "nothing needs review" and claimed "all assessment complete" —
  // false: assessment had not even started, only genuinely finished
  // assessments were absent from a list that was empty for the wrong
  // reason. Fixed by requiring both reports to actually be available
  // before either "complete" or "under review" is claimed — a third,
  // honest "still being prepared" state covers the gap in between.
  const sittingComplete = sitting?.sittingComplete ?? false;
  const bothReportsAvailable = englishReport !== null && mathsReport !== null;
  const anyReviewRequired = writingAssessments.some((w) => w.assessmentStatus === "review_required");
  const allAssessmentReviewComplete = sittingComplete && bothReportsAvailable && !anyReviewRequired;
  const resultsStillPreparing = sittingComplete && !bothReportsAvailable;

  return (
    <PageLayout breadcrumbs={[{ label: "Today", href: "/dashboard" }, { label: "Mock Centre", href: "/mocks" }, { label: "Sitting result" }]}>
      <div className="max-w-3xl mx-auto px-4 pb-16 pt-6 md:pt-8 space-y-8">
        <div>
          <h1 className="text-[var(--angel-navy)] font-bold text-3xl md:text-4xl leading-tight mb-2">Complete CSSE Mock — Result</h1>
          <p className="text-[var(--angel-muted)] text-sm md:text-base max-w-xl">
            Angel reports each part of your CSSE Mock separately, and never invents a single combined score. Use this as a guide to strengths and areas to focus on, not as an official mark.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-[var(--angel-muted)]">Loading your result…</p>
        ) : errorMessage ? (
          <div className="text-sm text-red-600 dark:text-red-400 bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-5">{errorMessage}</div>
        ) : !sittingComplete ? (
          <div className="flex items-start gap-3 bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-5">
            <Circle size={18} className="text-[var(--angel-muted)] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-[var(--angel-navy)] mb-1">This sitting is not complete yet</p>
              <p className="text-xs text-[var(--angel-muted)] leading-relaxed mb-2">Both papers need to be submitted before a sitting result is shown.</p>
              <Link href="/learning-intelligence/mock-exam/sitting" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--angel-blue)] hover:underline">
                <PlayCircle size={13} /> Go to your sitting →
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3 bg-[var(--angel-paper)] border border-[var(--angel-border)] rounded-lg p-5">
              {resultsStillPreparing ? (
                <Circle size={18} className="text-[var(--angel-muted)] mt-0.5 shrink-0" />
              ) : allAssessmentReviewComplete ? (
                <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
              )}
              <div>
                <p className="text-sm font-bold text-[var(--angel-navy)]">
                  {resultsStillPreparing
                    ? "Sitting complete — results still being prepared"
                    : allAssessmentReviewComplete
                      ? "Sitting complete — all assessment complete"
                      : "Sitting complete — some assessment still under review"}
                </p>
                {resultsStillPreparing && (
                  <p className="text-xs text-[var(--angel-muted)] mt-1 leading-relaxed">
                    Both papers were submitted. Marking and analysis is a separate step, and each paper's own result appears below once it's ready.
                  </p>
                )}
                {!resultsStillPreparing && !allAssessmentReviewComplete && (
                  <p className="text-xs text-[var(--angel-muted)] mt-1 leading-relaxed">
                    Both papers were submitted. One or more Continuous Writing responses need a closer look before Angel shows a confident assessment for them — the rest of the result below is unaffected.
                  </p>
                )}
              </div>
            </div>

            <section className="space-y-3">
              <SectionHeading>English</SectionHeading>
              <EnglishSection report={englishReport} writing={writingAssessments} />
            </section>

            <section className="space-y-3">
              <SectionHeading>Mathematics</SectionHeading>
              <MathematicsSection report={mathsReport} />
            </section>
          </>
        )}
      </div>
    </PageLayout>
  );
}
