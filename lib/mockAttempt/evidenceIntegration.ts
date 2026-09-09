import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { classifyMockEvidence } from "./evidenceAdapter";
import { getMockAttemptReport, getMockAttemptSummary } from "./client";
import { recordPresentation, recordOutcome } from "@/lib/ali/history";
import type { MockQuestionOutcome } from "./types";

/**
 * Migration 244 — Mock -> Educational Intelligence Evidence Bridge.
 *
 * Bounded wiring only, per the Founder's own brief: this module adds NO
 * new classification logic and NO new mastery/recommendation model. It
 * composes three already-existing, already-tested pieces exactly as they
 * are:
 *
 *   1. lib/mockAttempt/evidenceAdapter.ts's classifyMockEvidence() — the
 *      real, unmodified Mock classifier (correct/incorrect only;
 *      unanswered, requires_manual_marking, and partially_correct
 *      outcomes are already, correctly, excluded by its own existing
 *      filter — see that file's own docstring).
 *   2. lib/ali/history.ts's recordPresentation()/recordOutcome() — the
 *      SAME shared evidence-persistence path every Practice/lesson
 *      caller already uses, now called with source="mock" (an
 *      already-open column value per migration 006 — see migration 244's
 *      own header for why no schema change was needed for provenance).
 *   3. mock_claim_evidence_ingestion() (migration 244, SQL) — the one new
 *      piece, an idempotency gate so a retried analysis/report
 *      generation/page refresh/repeated invocation can never write
 *      duplicate evidence for the same attempt.
 *
 * DELIBERATELY DOES NOT read ali_mock_attempt_report.competency_evidence
 * (the column mock_analyse_attempt() — migrations 151/215/227 — already
 * populates automatically at score-time). That SQL-side classifier has a
 * real, disclosed defect relative to this same brief's own §7: it flags
 * `correct: (status = 'correct')` for EVERY outcome whose status is not
 * `requires_manual_marking`, which means an `unanswered` outcome is
 * written as `correct: false` — indistinguishable from a genuine wrong
 * answer, and a `partially_correct` outcome is flattened the same way.
 * Forwarding that column verbatim would import "unanswered = conceptual
 * weakness" into the shared adaptive-learning evidence pool, exactly
 * what the Founder's brief explicitly forbids. This module re-derives
 * evidence from the raw, authoritative `question_outcomes` array instead,
 * through the TS classifier's own real (correctly stricter) filter. This
 * is a disclosed observation about existing SQL, not a fix to it — fixing
 * mock_analyse_attempt() would mean rewriting a classifier, out of this
 * bounded increment's scope.
 */

export interface MockEvidenceIngestionResult {
  ingested: boolean;
  reason: "ingested" | "already-ingested" | "not-released" | "no-report" | "claim-denied";
  questionsProcessed: number;
  competenciesTouched: string[];
}

/**
 * Recovers the question-level linkage classifyMockEvidence()'s own
 * aggregate output type (MockCompetencyEvidenceEntry — competency/
 * questionType level, no questionId) does not preserve, WITHOUT
 * duplicating a single line of its filter/mapping logic: the real
 * classifier is invoked once per outcome (behaviourally identical to
 * invoking it once on the full array, since it has no cross-item state —
 * a pure per-item map+filter, confirmed by reading its source) and the
 * surviving result (if any) is paired back with that same outcome's own
 * questionId. An outcome the classifier itself excludes (unanswered,
 * requires_manual_marking, partially_correct, or an unmapped
 * questionTypeId) yields nothing here either — exactly the classifier's
 * own real behaviour, never re-implemented.
 */
export function deriveQuestionLevelMockEvidence(
  outcomes: MockQuestionOutcome[],
  attemptId: string,
  formId: string,
  scoredAt: string
): { questionId: string; competencyId: string; correct: boolean }[] {
  const results: { questionId: string; competencyId: string; correct: boolean }[] = [];
  for (const outcome of outcomes) {
    const [entry] = classifyMockEvidence([outcome], attemptId, formId, scoredAt);
    if (entry) {
      results.push({ questionId: outcome.questionId, competencyId: entry.competencyId, correct: entry.correct });
    }
  }
  return results;
}

/**
 * The one orchestration entry point this bridge adds. Safe to call
 * whenever a learner's own released Mock report is viewed (the natural,
 * already-permitted trigger point — the report only becomes readable at
 * all once report_release_state='released', per ali_mock_attempt_
 * report's own RLS). Idempotent: a second call for the same attempt
 * (retried analysis, retried report generation, a page refresh, a
 * repeated background invocation) is a safe no-op, gated by
 * mock_claim_evidence_ingestion()'s atomic claim.
 *
 * Never touches Mock scoring, marks, outcomes, or the released report
 * itself — read-only against Mock data, write-only against the SAME
 * shared ali_student_question_history table Practice/lessons already
 * write to, using the SAME shared recordPresentation()/recordOutcome()
 * functions, unmodified.
 */
export async function ingestMockEvidenceIntoEducationalIntelligence(
  supabase: SupabaseClient<Database>,
  profileId: string,
  attemptId: string
): Promise<MockEvidenceIngestionResult> {
  // Migration 244's own mock_claim_evidence_ingestion() is NOT YET
  // APPLIED (prepared for Founder review, per this repository's standing
  // convention — see that migration's own header). types/supabase.ts is
  // generated from the live, currently-applied schema, so it genuinely
  // cannot type a function that does not exist there yet — this cast is
  // an honest reflection of that fact, not a workaround for a real typing
  // gap. Remove it once migration 244 is applied and types are
  // regenerated; the underlying rpc() call needs no other change.
  const { data: claimed, error: claimError } = (await (
    supabase.rpc as unknown as (
      fn: "mock_claim_evidence_ingestion",
      args: { p_attempt_id: string }
    ) => Promise<{ data: boolean | null; error: { message: string } | null }>
  )("mock_claim_evidence_ingestion", {
    p_attempt_id: attemptId,
  }));
  if (claimError || !claimed) {
    return { ingested: false, reason: claimError ? "claim-denied" : "already-ingested", questionsProcessed: 0, competenciesTouched: [] };
  }

  const [reportResult, summaryResult] = await Promise.all([
    getMockAttemptReport(supabase, attemptId),
    getMockAttemptSummary(supabase, attemptId),
  ]);

  if (reportResult.error || !reportResult.data || reportResult.data.reportReleaseState !== "released") {
    return { ingested: false, reason: "not-released", questionsProcessed: 0, competenciesTouched: [] };
  }
  if (!reportResult.data.questionOutcomes || summaryResult.error || !summaryResult.data) {
    return { ingested: false, reason: "no-report", questionsProcessed: 0, competenciesTouched: [] };
  }

  const scoredAt = reportResult.data.analysedAt ?? reportResult.data.releasedAt ?? new Date().toISOString();
  const evidence = deriveQuestionLevelMockEvidence(
    reportResult.data.questionOutcomes,
    attemptId,
    summaryResult.data.formId,
    scoredAt
  );

  if (evidence.length === 0) {
    return { ingested: true, reason: "ingested", questionsProcessed: 0, competenciesTouched: [] };
  }

  const questionIds = evidence.map((e) => e.questionId);
  await recordPresentation(supabase, profileId, questionIds, "mock");

  const { data: bankRows } = await supabase.from("ali_question_bank").select("id, mastery_threshold").in("id", questionIds);
  const thresholdByQuestionId = new Map((bankRows ?? []).map((r) => [r.id, r.mastery_threshold]));

  for (const entry of evidence) {
    const masteryThreshold = thresholdByQuestionId.get(entry.questionId) ?? 3;
    // supportTier is always "independent": a live Mock sitting is
    // unsupported by design (migration 244's brief §17 — "no hints,
    // teaching or remediation may enter the live Mock experience").
    // verified stays true (the default): Mock outcomes are all
    // deterministically machine-scored or admin-manually-marked, never a
    // learner's own unverified self-assessment.
    await recordOutcome(supabase, profileId, entry.questionId, entry.correct, attemptId, masteryThreshold, undefined, "independent", true);
  }

  return {
    ingested: true,
    reason: "ingested",
    questionsProcessed: evidence.length,
    competenciesTouched: Array.from(new Set(evidence.map((e) => e.competencyId))),
  };
}
