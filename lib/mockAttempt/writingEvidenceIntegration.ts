import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { recordPresentation, recordOutcome } from "@/lib/ali/history";
import { computeOverallScoreFromDimensions } from "@/lib/learningEngine/writingRubric";
import { WRITING_CORRECTNESS_THRESHOLD } from "@/lib/learningEngine/practiceContent";
import { QUESTION_TYPE_PRIMARY_COMPETENCY } from "@/lib/learningEngine/assessmentBrainMap";
import type { QuestionTypeId } from "@/lib/learningEngine/types";
import type { MockWritingAssessment } from "./types";

/**
 * CSSE Two-Paper Mock, pre-activation completion pass (governing brief
 * §10) — the smallest legitimate Writing → Educational Intelligence
 * evidence adapter. Deliberately NOT a reuse of lib/mockAttempt/
 * evidenceIntegration.ts's own binary correct/incorrect bridge (migration
 * 244): that bridge's classifier (classifyMockEvidence()) only ever
 * accepts a MockQuestionOutcome with status 'correct'/'incorrect', and
 * every Writing outcome permanently stays 'requires_manual_marking' in
 * question_outcomes (migration 245's own explicit, disclosed policy — no
 * official CSSE mark split exists to compute a binary outcome from). This
 * is a genuinely different evidence shape (a qualitative 5-dimension
 * judgement, not a mark), so it gets its own small adapter rather than
 * being forced through logic built for a different kind of evidence.
 *
 * Reuses everywhere it legitimately can:
 *   - lib/ali/history.ts's recordPresentation()/recordOutcome() — the
 *     SAME shared evidence-persistence path every other evidence source
 *     in this codebase already uses, called with source="mock".
 *   - The SAME supportTier="supported" mastery-quarantine mechanism
 *     Decision 60 already established for Practice's own Writing
 *     evidence (lib/ali/mastery.ts's countsTowardMastery gate:
 *     isCorrect && supportTier === "independent" — "supported" evidence
 *     can therefore never, by construction, advance
 *     distinctCorrectSessions or reach "mastered" from a single
 *     response). Not a new mechanism — the existing one, reused.
 *   - The SAME WRITING_CORRECTNESS_THRESHOLD (70) Practice's own Writing
 *     feedback path already uses (app/learning-intelligence/practice/
 *     [area]/page.tsx: `feedback.overallScore >= WRITING_CORRECTNESS_
 *     THRESHOLD`) — Mock and Practice Writing evidence now mean the same
 *     thing when they reach Educational Intelligence, not two competing
 *     definitions of "correct."
 *   - The SAME QUESTION_TYPE_PRIMARY_COMPETENCY mapping every other
 *     evidence source reads (already includes QT-WC-01a and QT-WC-01b,
 *     both mapped to WC-01 — confirmed present before this pass, not
 *     added by it).
 *
 * A REVIEWED interpretation supersedes the automated one for THIS
 * adapter's own "was it correct" question WITHOUT mutating the original
 * ali_writing_assessment record — mirrors the report page's own
 * `(humanReviewDimensions ?? dimensions)` display pattern exactly. The
 * underlying automated dimensions/response_text/assessment_status stay
 * untouched in the database either way (mock_review_writing_assessment()
 * never writes them — migration 245's own guarantee).
 *
 * Idempotent via mock_claim_writing_evidence_ingestion() (migration 247)
 * — a genuinely separate, question-granularity claim from migration
 * 244's own attempt-granularity claim, so Reading (binary) and Writing
 * (qualitative) evidence for the SAME English attempt are each ingested
 * exactly once, independently, never colliding on one shared claim.
 */

export interface WritingEvidenceIngestionResult {
  ingested: boolean;
  reason: "ingested" | "already-ingested" | "claim-denied" | "no-competency-mapping";
  questionId: string;
  competencyId: string | null;
}

/**
 * The one orchestration entry point this adapter adds. Safe to call
 * whenever a learner's own Writing assessment is fetched (the same
 * natural trigger point the report page already uses for
 * requestMockWritingAssessment()/getMockWritingAssessments()) — a
 * repeated call for an already-ingested (attempt, question) is a safe
 * no-op, gated by the claim function's own atomic guard.
 */
export async function ingestWritingEvidenceIntoEducationalIntelligence(
  supabase: SupabaseClient<Database>,
  profileId: string,
  attemptId: string,
  assessment: MockWritingAssessment
): Promise<WritingEvidenceIngestionResult> {
  // Migration 247's claim function is NOT YET APPLIED (prepared for
  // Founder review, per this repository's standing convention) —
  // types/supabase.ts genuinely cannot type it yet. Mirrors migration
  // 244's own ingestMockEvidenceIntoEducationalIntelligence() cast
  // precedent exactly; remove once 247 is applied and types regenerated.
  const { data: claimed, error: claimError } = await (
    supabase.rpc as unknown as (
      fn: "mock_claim_writing_evidence_ingestion",
      args: { p_attempt_id: string; p_question_id: string }
    ) => Promise<{ data: boolean | null; error: { message: string } | null }>
  )("mock_claim_writing_evidence_ingestion", {
    p_attempt_id: attemptId,
    p_question_id: assessment.questionId,
  });
  if (claimError || !claimed) {
    return { ingested: false, reason: claimError ? "claim-denied" : "already-ingested", questionId: assessment.questionId, competencyId: null };
  }

  const questionTypeId = assessment.taskType === "Q2" ? "QT-WC-01b" : "QT-WC-01a";
  const competencyId = QUESTION_TYPE_PRIMARY_COMPETENCY[questionTypeId as QuestionTypeId] ?? null;
  if (!competencyId) {
    return { ingested: false, reason: "no-competency-mapping", questionId: assessment.questionId, competencyId: null };
  }

  // A human review supersedes the automated read for THIS adapter's own
  // "was it correct" question, without ever touching the original
  // dimensions/response_text/assessment_status columns — see this
  // file's own header.
  const effectiveDimensions = assessment.humanReviewDimensions ?? assessment.dimensions;
  const effectiveScore = assessment.humanReviewDimensions
    ? computeOverallScoreFromDimensions(effectiveDimensions)
    : assessment.overallIndicator;
  const correct = effectiveScore >= WRITING_CORRECTNESS_THRESHOLD;

  // assessment_status = 'review_required' means Angel is not yet
  // confident in the automated read for this response — `verified:
  // false` mirrors recordOutcome()'s own documented meaning ("Angel
  // could not [yet] automatically grade this with confidence") without
  // inventing a new parameter. A subsequent human review
  // (mock_review_writing_assessment()) does not automatically flip this
  // — the evidence was already ingested once under review_required and
  // stays that way; a future re-ingestion after review is a deliberately
  // separate, not-yet-built capability (this claim is one-shot by
  // design, matching migration 244's own attempt-level claim).
  const verified = assessment.assessmentStatus === "complete";

  await recordPresentation(supabase, profileId, [assessment.questionId], "mock");

  const { data: bankRow } = await supabase
    .from("ali_question_bank")
    .select("mastery_threshold")
    .eq("id", assessment.questionId)
    .maybeSingle();
  const masteryThreshold = bankRow?.mastery_threshold ?? 3;

  // supportTier is ALWAYS "supported" — Decision 60's own established
  // Writing mastery-quarantine mechanism (lib/ali/mastery.ts's
  // countsTowardMastery gate), reused exactly, not reinvented: no single
  // Writing response, Mock or Practice, can ever advance
  // distinctCorrectSessions or reach "mastered" by itself.
  await recordOutcome(supabase, profileId, assessment.questionId, correct, attemptId, masteryThreshold, undefined, "supported", verified);

  return { ingested: true, reason: "ingested", questionId: assessment.questionId, competencyId };
}
