"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import { InfoCard } from "@/components/ui/Card";
import { getSupabaseClient } from "@/lib/supabase";
import { ensureProfile } from "@/lib/supabaseProgress";
import { getMockAttemptReport, getMockAttemptSummary } from "@/lib/mockAttempt/client";
import { isReadingScoringRecoveryEligible, isWritingAssessmentRecoveryEligible } from "@/lib/mockAttempt/workspace";
import { requestReadingScoring, logReadingScoringRequestOutcome } from "@/lib/mockAttempt/readingScoringRequest";
import { ingestMockEvidenceIntoEducationalIntelligence } from "@/lib/mockAttempt/evidenceIntegration";
import { ingestWritingEvidenceIntoEducationalIntelligence } from "@/lib/mockAttempt/writingEvidenceIntegration";
import { requestMockWritingAssessment, logWritingAssessmentRequestOutcome } from "@/lib/mockAttempt/writingAssessmentRequest";
import { getMockWritingAssessments } from "@/lib/mockAttempt/client";
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
  practiceRouteFor,
  practiceActionLabelFor,
} from "@/lib/mockAttempt/reportCopy";
import { WRITING_DIMENSION_LABEL } from "@/lib/learningEngine/writingRubric";
import type { MockAttemptReport, MockSkillEvidenceEntry, MockWritingAssessment } from "@/lib/mockAttempt/types";

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
  const [writingAssessments, setWritingAssessments] = useState<MockWritingAssessment[]>([]);
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
        // Migration 244 — Mock -> Educational Intelligence Evidence
        // Bridge. Fire-and-forget: never blocks or delays rendering the
        // report itself (already fetched above), and the bridge's own
        // idempotency claim (mock_claim_evidence_ingestion) makes a
        // repeat call on every future view of this same report a safe
        // no-op. Failure here must never surface as a report-loading
        // error — this is a background evidence-forwarding step, not
        // part of the report the learner is looking at.
        void ensureProfile().then((profileId) => {
          if (!cancelled && profileId) {
            void ingestMockEvidenceIntoEducationalIntelligence(supabase, profileId, params.attemptId).catch(() => {});
          }
        });
        // Migration 245 — Mock-grade Continuous Writing assessment.
        // Fire-and-forget, same discipline as the EI bridge call above:
        // never blocks or delays the report already rendering, and the
        // underlying RPC's own idempotency (mock_persist_writing_
        // assessment, gated on question_outcomes status) makes a repeat
        // call on every future view of this same report a safe no-op.
        // Only relevant for an attempt whose form actually contains a
        // Writing question — every existing form (Mathematics, Reading
        // Comprehension) has none, so the API route itself resolves
        // instantly with an empty result for them, never an error.
        void requestMockWritingAssessment(supabase, params.attemptId).then((outcome) => {
          logWritingAssessmentRequestOutcome(outcome);
          if (!cancelled) {
            void getMockWritingAssessments(supabase, params.attemptId).then((result) => {
              if (!cancelled && result.data) setWritingAssessments(result.data);
              // CSSE Two-Paper Mock, pre-activation completion pass (§10)
              // — the smallest legitimate Writing -> Educational
              // Intelligence adapter, fire-and-forget, same discipline as
              // every evidence-forwarding call on this page: never blocks
              // or delays anything already rendered, and the underlying
              // claim (mock_claim_writing_evidence_ingestion, migration
              // 247) makes a repeat call on every future view of this
              // same report a safe no-op, independent of the binary EI
              // bridge's own claim above.
              if (!cancelled && result.data) {
                void ensureProfile().then((profileId) => {
                  if (cancelled || !profileId) return;
                  for (const assessment of result.data!) {
                    void ingestWritingEvidenceIntoEducationalIntelligence(supabase, profileId, params.attemptId, assessment).catch(() => {});
                  }
                });
              }
            });
          }
        });
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
        // CSSE Two-Paper Mock P1 Repair (P1-B) — english-full-mock-v1's
        // scoring_state can only ever reach 'scored' once its Writing
        // assessments have run (migration 251's own mock_check_and_
        // complete_scoring()), but report release requires scoring_state
        // ='scored'. Requesting Writing assessment only AFTER release
        // (this page's own prior behaviour, below) was therefore a real
        // deadlock for this form: release could never happen because
        // assessment never ran, and assessment never ran because release
        // never happened. mock_persist_writing_assessment() (migration
        // 245) has never required release — only a submitted attempt —
        // so firing it from here, in the same "not yet released, recovery
        // may help" branch the Reading-scoring request already uses, is
        // safe and closes the loop. Idempotent per (attempt, question),
        // same discipline as the reading-scoring call above.
        if (!cancelled && !summary.error && isWritingAssessmentRecoveryEligible(summary.data)) {
          void requestMockWritingAssessment(supabase, params.attemptId).then(logWritingAssessmentRequestOutcome);
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

            {writingAssessments.length > 0 && <WritingAssessmentSection assessments={writingAssessments} />}

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
  const otherSkillsRaw = bySkill.filter(
    (entry) => !priorityQuestionTypeIds.has(entry.questionTypeId) && !(entry.competencyId && strengthCompetencyIds.has(entry.competencyId))
  );
  // bySkill is question-type level (several QT codes can share one
  // competency -- e.g. QT-RC-01/QT-RC-07 both -> RC-01, mirroring the
  // SAME rollup mock_analyse_attempt() already applies for strengths/
  // weaknesses). Without this, the identical competency label could
  // render as two separate chips here. One chip per competency (falling
  // back to the raw question type only when no competency is resolved),
  // first occurrence kept.
  const seenOtherSkillKeys = new Set<string>();
  const otherSkills = otherSkillsRaw.filter((entry) => {
    const key = entry.competencyId ?? entry.questionTypeId;
    if (seenOtherSkillKeys.has(key)) return false;
    seenOtherSkillKeys.add(key);
    return true;
  });

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

      {/* Section 7 — WHAT ANGEL RECOMMENDS NEXT. One closing action, reusing
          the existing, tested nextPracticeSentence() rather than a new
          engine. Routes via the SAME practiceRouteFor()/practiceActionLabelFor()
          the per-priority cards already use, targeted at the TOP-ranked
          priority's own competency -- previously hardcoded to Mathematics
          regardless of subject, which misrouted an English-only priority
          set (e.g. Reading Comprehension) to the Mathematics practice area. */}
      {nextPracticeSentence(nextPracticePriorities) && (
        <InfoCard className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40">
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">What to do now</p>
          <p className="text-sm text-blue-700 dark:text-blue-400 mt-1 leading-relaxed">{nextPracticeSentence(nextPracticePriorities)}</p>
          <ButtonLink href={practiceRouteFor(priorityEntries[0]?.competencyId ?? null)} className="mt-3">
            {practiceActionLabelFor(priorityEntries[0]?.competencyId ?? null)}
          </ButtonLink>
        </InfoCard>
      )}
    </>
  );
}

/**
 * Migration 245 — Continuous Writing, reported separately from every
 * Comprehension/Mathematics figure above, deliberately never combined
 * into one score (see migration 245's own header: no current official
 * CSSE source confirms a Comprehension/Writing mark split, so Angel must
 * not invent one). `review_required` is shown honestly as still-pending
 * human review, never silently upgraded to look like a normal result.
 */
function WritingAssessmentSection({ assessments }: { assessments: MockWritingAssessment[] }) {
  return (
    <InfoCard className="border-purple-200 dark:border-purple-900">
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Continuous Writing</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
        Assessed separately from your Comprehension/Mathematics marks above — Angel does not currently have a confirmed official CSSE mark split
        between components, so these are reported on their own rather than combined into one figure.
      </p>
      <div className="mt-3 space-y-3">
        {assessments.map((assessment) => (
          <div key={assessment.questionId} className="border border-gray-100 dark:border-gray-800 rounded-lg p-3">
            {assessment.assessmentStatus === "review_required" ? (
              <>
                <StatusIndicator tone="warning" label="Review required" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                  Angel could not confidently assess this response automatically
                  {assessment.reviewRequiredReasons && assessment.reviewRequiredReasons.length > 0
                    ? `: ${assessment.reviewRequiredReasons.join("; ")}.`
                    : "."}{" "}
                  This will be shown once reviewed.
                </p>
              </>
            ) : (
              <div className="space-y-1.5">
                {(assessment.humanReviewDimensions ?? assessment.dimensions).map((d) => (
                  <div key={d.dimension} className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{WRITING_DIMENSION_LABEL[d.dimension]}</span>
                    <StatusIndicator tone={d.level === "strong" ? "success" : d.level === "secure" ? "info" : "warning"} label={d.level} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </InfoCard>
  );
}
