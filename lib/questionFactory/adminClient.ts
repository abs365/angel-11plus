import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Question Factory Wave 2 — thin client wrapper around migration 230's
 * three RPCs (submit/review/publish) plus a read of the candidate list.
 * Every write here is a single, narrow RPC call -- no client-side
 * business logic, no direct table write, matching this repo's own
 * established convention for every other privileged Mock/content action
 * (e.g. lib/mockAttempt/client.ts's own thin wrappers around
 * mock_submit_answer etc.). RLS (admin-only SELECT) is the real boundary;
 * this file adds no authorisation logic of its own.
 */

export type CandidateReviewStatus = "pending_review" | "approved" | "rejected" | "needs_correction";
export type CandidatePublicationStatus = "unpublished" | "published";

export interface QuestionFactoryCandidateRow {
  candidateId: string;
  familyId: string;
  generationSpecId: string;
  generationSpecVersion: string;
  subject: string;
  competencyId: string | null;
  skill: string;
  questionType: string | null;
  pathway: string[];
  preparationStage: string | null;
  difficulty: string;
  questionContent: unknown;
  claimedAnswer: string;
  workedExplanation: string | null;
  distractors: unknown;
  mathematicalValidation: unknown;
  similarityValidation: unknown;
  generatedAt: string;
  provenance: string;
  reviewStatus: CandidateReviewStatus;
  reviewerId: string | null;
  reviewTimestamp: string | null;
  rejectionReason: string | null;
  publicationStatus: CandidatePublicationStatus;
  publishedQuestionId: string | null;
}

function rowToCandidate(row: Record<string, unknown>): QuestionFactoryCandidateRow {
  return {
    candidateId: row.candidate_id as string,
    familyId: row.family_id as string,
    generationSpecId: row.generation_spec_id as string,
    generationSpecVersion: row.generation_spec_version as string,
    subject: row.subject as string,
    competencyId: (row.competency_id as string | null) ?? null,
    skill: row.skill as string,
    questionType: (row.question_type as string | null) ?? null,
    pathway: (row.pathway as string[]) ?? [],
    preparationStage: (row.preparation_stage as string | null) ?? null,
    difficulty: row.difficulty as string,
    questionContent: row.question_content,
    claimedAnswer: row.claimed_answer as string,
    workedExplanation: (row.worked_explanation as string | null) ?? null,
    distractors: row.distractors ?? null,
    mathematicalValidation: row.mathematical_validation,
    similarityValidation: row.similarity_validation,
    generatedAt: row.generated_at as string,
    provenance: row.provenance as string,
    reviewStatus: row.review_status as CandidateReviewStatus,
    reviewerId: (row.reviewer_id as string | null) ?? null,
    reviewTimestamp: (row.review_timestamp as string | null) ?? null,
    rejectionReason: (row.rejection_reason as string | null) ?? null,
    publicationStatus: row.publication_status as CandidatePublicationStatus,
    publishedQuestionId: (row.published_question_id as string | null) ?? null,
  };
}

/** Read, RLS-gated to admins only -- returns [] (never throws) on any error, same convention as fetchQuestionBank(). */
export async function fetchQuestionFactoryCandidates(
  supabase: SupabaseClient<Database>,
  filterByReviewStatus?: CandidateReviewStatus
): Promise<QuestionFactoryCandidateRow[]> {
  let query = supabase.from("ali_question_candidate").select("*").order("generated_at", { ascending: false });
  if (filterByReviewStatus) query = query.eq("review_status", filterByReviewStatus);
  const { data, error } = await query;
  if (error || !data) {
    console.warn("[QuestionFactory] fetchQuestionFactoryCandidates failed:", error?.message);
    return [];
  }
  return data.map(rowToCandidate);
}

export interface ReviewDecisionResult {
  success: boolean;
  error?: string;
}

/**
 * One candidate, one decision, per call -- deliberately no batch/array
 * parameter anywhere in this function's own signature, matching the
 * Founder's explicit "do not allow bulk approve everything" instruction
 * at the client layer too (the RPC itself already enforces this
 * server-side; this is defence in depth, not the only guarantee).
 */
export async function reviewQuestionFactoryCandidate(
  supabase: SupabaseClient<Database>,
  candidateId: string,
  decision: "approved" | "rejected" | "needs_correction",
  rejectionReason?: string
): Promise<ReviewDecisionResult> {
  const { error } = await supabase.rpc("review_question_candidate", {
    p_candidate_id: candidateId,
    p_decision: decision,
    p_rejection_reason: rejectionReason ?? null,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export interface PublishResult {
  success: boolean;
  publishedQuestionId?: string;
  error?: string;
}

export async function publishQuestionFactoryCandidate(
  supabase: SupabaseClient<Database>,
  candidateId: string
): Promise<PublishResult> {
  const { data, error } = await supabase.rpc("publish_question_candidate", { p_candidate_id: candidateId });
  if (error) return { success: false, error: error.message };
  return { success: true, publishedQuestionId: data as string };
}
