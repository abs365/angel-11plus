"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
import { getSupabaseClient } from "@/lib/supabase";
import { getMockAttemptReport, getMockAttemptSummary } from "@/lib/mockAttempt/client";
import { isReadingScoringRecoveryEligible } from "@/lib/mockAttempt/workspace";
import { requestReadingScoring, logReadingScoringRequestOutcome } from "@/lib/mockAttempt/readingScoringRequest";
import { ProgressBar, StatusIndicator } from "@/components/ui/Progress";
import { ButtonLink } from "@/components/ui/Button";
import {
  scoreSummarySentence,
  strengthSentence,
  nextPracticeSentence,
  childFriendlySkillLabel,
  priorityStatusSentence,
  priorityExplanationSentence,
  skillEvidenceChipLabel,
  skillEvidenceChipTone,
  OFFICIAL_SCORE_DISCLAIMER,
  ANALYSIS_PENDING_NOTE,
  NO_SECURE_STRENGTHS_NOTE,
  PERFORMANCE_CONTEXT_NOTE,
  MATHEMATICS_PRACTICE_ROUTE,
  PRACTICE_ACTION_LABEL,
  practiceRouteFor,
  practiceActionLabelFor,
} from "@/lib/mockAttempt/reportCopy";
import type { MockAttemptReport, MockSkillEvidenceEntry } from "@/lib/mockAttempt/types";

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
  // Founder invocation-reliability repair, Part C — a plain ref, not
  // state: it must survive without triggering a re-render, and its only
  // job is "has this page instance already tried recovery once" — see the
  // effect below's own comment for why a ref (not a request-loop guard
  // inside the request itself) is the right bound here.
  const recoveryAttemptedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = getSupabaseClient();
      if (!supabase) { setErrorMessage("Not connected."); setPhase("error"); return; }
      const result = await getMockAttemptReport(supabase, params.attemptId);
      if (cancelled) return;
      if (result.error) { setErrorMessage(result.error); setPhase("error"); return; }
      if (result.data && result.data.reportReleaseState === "released") {
        setReport(result.data);
        setPhase("ready");
        return;
      }
      setPhase("not-available");

      // Founder invocation-reliability repair, Part C — bounded,
      // idempotent recovery. The report is not visible for one of two
      // reasons: no report row exists at all for this attempt (not a
      // Mock attempt, or one Angel has not yet processed), or one exists
      // but is not released. Either way, this client cannot and must not
      // try to distinguish those cases (see client.ts's own
      // getMockAttemptReport() docstring — deliberate, unmodified). What
      // this page CAN safely determine, from data the learner already
      // owns regardless of release state (getMockAttemptSummary(), a
      // plain owner-scoped read — no RLS change), is only whether a
      // scoring-recovery attempt is even plausible: a submitted Reading
      // Comprehension Mock 1 attempt. Firing it is always safe to attempt
      // — the unmodified, privileged mock_claim_reading_scoring_work()
      // (migration 219) remains the sole authority on whether there is
      // genuinely eligible work, and unconditionally refuses an
      // already-scored attempt regardless of who asks. Bounded to once
      // per page load via the ref above, not inside a request loop or a
      // render-triggered effect dependency, so re-renders (state updates
      // from this same effect included) can never re-fire it.
      if (!recoveryAttemptedRef.current) {
        recoveryAttemptedRef.current = true;
        const summary = await getMockAttemptSummary(supabase, params.attemptId);
        if (!cancelled && !summary.error && isReadingScoringRecoveryEligible(summary.data)) {
          void requestReadingScoring(supabase, params.attemptId).then(logReadingScoringRequestOutcome);
        }
      }
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
            <Link href="/learning-intelligence" className="inline-block mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400">
              Back to dashboard
            </Link>
          </InfoCard>
        )}

        {phase === "ready" && report && (
          <div className="space-y-5">
            {/* Section 1 — YOUR MOCK RESULT: concise, unchanged core facts. */}
            <div>
              <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Your Mock result</h1>
              {report.overall && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">{scoreSummarySentence(report.overall)}</p>
              )}
            </div>

            <InfoCard>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{OFFICIAL_SCORE_DISCLAIMER}</p>
            </InfoCard>

            {report.analysisState === "complete" && report.skillEvidence ? (
              <MockAnalysisSections report={report} />
            ) : (
              <InfoCard>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{ANALYSIS_PENDING_NOTE}</p>
              </InfoCard>
            )}

            <Link href="/learning-intelligence" className="inline-block text-xs font-semibold text-blue-600 dark:text-blue-400">
              Back to dashboard
            </Link>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

/**
 * Decision 224 (Mock Report Experience Refinement) — Sections 2-5/7. Only
 * ever rendered once `report.analysisState === "complete" && report.
 * skillEvidence` is confirmed by the caller (see the "ready" branch above)
 * — this component itself does not re-check that gate, but never reads
 * `report.skillEvidence` without the caller's own non-null narrowing.
 *
 * Replaces Decision 223's own "Skill performance"/"What to work on" full-
 * sentence lists (found, by direct Founder review of the live report, to
 * be repetitive and hard to scan) with: a plain-language performance
 * summary (never a comparison/prediction/readiness claim); the existing,
 * unmodified strengths sentence; up to 3 dominant, richly-explained
 * priority cards drawn from the analysis engine's own unmodified
 * `nextPracticePriorities` (never hardcoded to any specific skill); every
 * other skill as a compact status chip, never a paragraph; and one
 * closing action. Every skill/competency label is translated through
 * `childFriendlySkillLabel()` — no `QT-MR-XX` code or raw `competencyId`
 * is ever rendered as visible text anywhere in this component.
 */
function MockAnalysisSections({ report }: { report: MockAttemptReport }) {
  const skillEvidence = report.skillEvidence;
  if (!skillEvidence) return null;
  const { bySkill, nextPracticePriorities } = skillEvidence;

  // Section 4's own up-to-3 cards, matched back to their full bySkill
  // evidence (status/misconception/difficulty) for a richer card than the
  // bare {questionTypeId, competencyId} priority record alone carries.
  const priorityEntries = nextPracticePriorities
    .map((p) => bySkill.find((s) => s.questionTypeId === p.questionTypeId))
    .filter((e): e is MockSkillEvidenceEntry => Boolean(e));
  const priorityQuestionTypeIds = new Set(priorityEntries.map((e) => e.questionTypeId));

  // Section 5 excludes anything already shown as a Section 3 strength
  // (by competency) or a Section 4 priority card (by question type) --
  // never the same skill shown twice on the page.
  const strengthCompetencyIds = new Set((report.strengths ?? []).map((s) => s.competencyId));
  const otherSkills = bySkill.filter(
    (entry) => !priorityQuestionTypeIds.has(entry.questionTypeId) && !(entry.competencyId && strengthCompetencyIds.has(entry.competencyId))
  );

  return (
    <>
      {/* Section 2 — YOUR PERFORMANCE TODAY. */}
      {report.overall && report.overall.percentage !== null && (
        <InfoCard>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Your performance today</p>
          <div className="mt-2">
            <ProgressBar percent={report.overall.percentage} label="Marks achieved this Mock" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{PERFORMANCE_CONTEXT_NOTE}</p>
        </InfoCard>
      )}

      {/* Section 3 — WHAT YOU SHOWED. Only evidence-supported strengths; never a manufactured compliment when empty. */}
      {report.strengths && report.strengths.length > 0 ? (
        <InfoCard className="border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">What you showed</p>
          <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1 leading-relaxed">{strengthSentence(report.strengths)}</p>
        </InfoCard>
      ) : (
        <InfoCard>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">What you showed</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{NO_SECURE_STRENGTHS_NOTE}</p>
        </InfoCard>
      )}

      {/* Section 4 — YOUR PRIORITIES. The dominant section, up to 3 cards. */}
      {priorityEntries.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Your priorities</p>
          <div className="space-y-3">
            {priorityEntries.map((entry) => (
              <InfoCard key={entry.questionTypeId} className="border-blue-200 dark:border-blue-900">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {childFriendlySkillLabel(entry.competencyId, entry.questionTypeId)}
                  </p>
                  <StatusIndicator tone={skillEvidenceChipTone(entry.evidenceLevel)} label={skillEvidenceChipLabel(entry.evidenceLevel)} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed">{priorityStatusSentence(entry)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 leading-relaxed">{priorityExplanationSentence(entry)}</p>
                <ButtonLink href={practiceRouteFor(entry.competencyId)} variant="outline" size="sm" className="mt-3">
                  {practiceActionLabelFor(entry.competencyId)}
                </ButtonLink>
              </InfoCard>
            ))}
          </div>
        </div>
      )}

      {/* Section 5 — OTHER SKILLS TO KEEP DEVELOPING. Compact chips, never a paragraph per skill. */}
      {otherSkills.length > 0 && (
        <InfoCard>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Other skills to keep developing</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {otherSkills.map((entry) => (
              <div
                key={entry.questionTypeId}
                className="flex items-center gap-1.5 text-xs bg-gray-50 dark:bg-gray-900 rounded-full pl-2.5 pr-1.5 py-1 border border-gray-100 dark:border-gray-800"
              >
                <span className="text-gray-700 dark:text-gray-300">{childFriendlySkillLabel(entry.competencyId, entry.questionTypeId)}</span>
                <StatusIndicator tone={skillEvidenceChipTone(entry.evidenceLevel)} label={skillEvidenceChipLabel(entry.evidenceLevel)} />
              </div>
            ))}
          </div>
        </InfoCard>
      )}

      {/* Section 7 — WHAT ANGEL RECOMMENDS NEXT. One closing action, reusing the existing, tested nextPracticeSentence() rather than a new engine. */}
      {nextPracticeSentence(nextPracticePriorities) && (
        <InfoCard className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40">
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">What to do now</p>
          <p className="text-sm text-blue-700 dark:text-blue-400 mt-1 leading-relaxed">{nextPracticeSentence(nextPracticePriorities)}</p>
          <ButtonLink href={MATHEMATICS_PRACTICE_ROUTE} className="mt-3">
            {PRACTICE_ACTION_LABEL}
          </ButtonLink>
        </InfoCard>
      )}
    </>
  );
}
