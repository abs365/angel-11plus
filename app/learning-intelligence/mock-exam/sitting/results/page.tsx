"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Circle, PlayCircle } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
import { StatusIndicator } from "@/components/ui/Progress";
import { getSupabaseClient } from "@/lib/supabase";
import { getMockCycleAttempts, getMockAttemptReport, getMockWritingAssessments } from "@/lib/mockAttempt/client";
import { deriveMockCycleSittingState, type MockCycleSittingState } from "@/lib/mockAttempt/cycleState";
import type { MockAttemptReport, MockWritingAssessment } from "@/lib/mockAttempt/types";
import { WRITING_DIMENSION_LABEL } from "@/lib/learningEngine/writingRubric";

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
  return <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{children}</h2>;
}

function MathematicsSection({ report }: { report: MockAttemptReport | null }) {
  if (!report) {
    return (
      <InfoCard>
        <p className="text-xs text-gray-500 dark:text-gray-400">Mathematics result is not yet available — it may still be being prepared, or has not yet been released.</p>
      </InfoCard>
    );
  }
  return (
    <InfoCard>
      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">Mathematics</p>
      {report.overall && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          {report.overall.rawMarksAchieved} / {report.overall.rawMarksAvailable} marks
          {report.overall.percentage !== null ? ` (${report.overall.percentage}%)` : " (some items awaiting marking)"}
        </p>
      )}
      {report.strengths && report.strengths.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Strengths</p>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
            {report.strengths.map((s) => (
              <li key={s.competencyId}>{s.competencyId} — {s.correctCount}/{s.questionCount}</li>
            ))}
          </ul>
        </div>
      )}
      {report.weaknesses && report.weaknesses.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Areas to strengthen</p>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
            {report.weaknesses.map((s) => (
              <li key={s.competencyId}>{s.competencyId} — {s.correctCount}/{s.questionCount}</li>
            ))}
          </ul>
        </div>
      )}
    </InfoCard>
  );
}

function WritingAssessmentRow({ assessment }: { assessment: MockWritingAssessment }) {
  const dims = assessment.humanReviewDimensions ?? assessment.dimensions;
  return (
    <div className="border-t border-gray-100 dark:border-gray-800 pt-2 mt-2 first:border-t-0 first:pt-0 first:mt-0">
      <div className="flex items-center gap-2 mb-1">
        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{assessment.taskType} — Continuous Writing</p>
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
      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
        {dims.map((d) => (
          <li key={d.dimension}>
            {WRITING_DIMENSION_LABEL[d.dimension as keyof typeof WRITING_DIMENSION_LABEL] ?? d.dimension}: {d.level}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EnglishSection({ report, writing }: { report: MockAttemptReport | null; writing: MockWritingAssessment[] }) {
  if (!report) {
    return (
      <InfoCard>
        <p className="text-xs text-gray-500 dark:text-gray-400">English result is not yet available — it may still be being prepared, or has not yet been released.</p>
      </InfoCard>
    );
  }
  return (
    <InfoCard>
      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">English</p>
      {report.overall && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          Reading Comprehension: {report.overall.rawMarksAchieved} / {report.overall.rawMarksAvailable} marks
          {report.overall.percentage !== null ? ` (${report.overall.percentage}%)` : " (some items awaiting marking)"}
        </p>
      )}
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
        Continuous Writing (assessed separately — not pooled with Comprehension marks; no confirmed official split exists)
      </p>
      {writing.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-500">Writing assessment is still being prepared.</p>
      ) : (
        writing.map((w) => <WritingAssessmentRow key={w.questionId} assessment={w} />)
      )}
    </InfoCard>
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
  const sittingComplete = sitting?.sittingComplete ?? false;
  const anyReviewRequired = writingAssessments.some((w) => w.assessmentStatus === "review_required");
  const allAssessmentReviewComplete = sittingComplete && !anyReviewRequired;

  return (
    <PageLayout breadcrumbs={[{ label: "Today", href: "/dashboard" }, { label: "Mock Centre", href: "/mocks" }, { label: "Sitting result" }]}>
      <div className="max-w-2xl mx-auto px-4 pb-16 pt-6 md:pt-8 space-y-6">
        <div className="mb-1">
          <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl mb-1">Complete CSSE Mock — Result</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Angel reports each part of your CSSE Mock separately, and never invents a single combined score. Use this as a guide to strengths and areas to focus on, not as an official mark.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading your result…</p>
        ) : errorMessage ? (
          <InfoCard className="text-sm text-red-600 dark:text-red-400">{errorMessage}</InfoCard>
        ) : !sittingComplete ? (
          <InfoCard className="flex items-start gap-3">
            <Circle size={18} className="text-gray-300 dark:text-gray-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">This sitting is not complete yet</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2">Both papers need to be submitted before a sitting result is shown.</p>
              <Link href="/learning-intelligence/mock-exam/sitting" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <PlayCircle size={13} /> Go to your sitting →
              </Link>
            </div>
          </InfoCard>
        ) : (
          <>
            <InfoCard className="flex items-start gap-3">
              {allAssessmentReviewComplete ? (
                <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
              )}
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {allAssessmentReviewComplete ? "Sitting complete — all assessment complete" : "Sitting complete — some assessment still under review"}
                </p>
                {!allAssessmentReviewComplete && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    Both papers were submitted. One or more Continuous Writing responses need a closer look before Angel shows a confident assessment for them — the rest of the result below is unaffected.
                  </p>
                )}
              </div>
            </InfoCard>

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
