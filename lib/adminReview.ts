// Educational Increment 007E, Part 7/9 — data layer for the admin
// Educational Review interface (app/admin-beta/review/page.tsx). Reads
// and writes go through ali_family_review / ali_passage_bank /
// ali_question_bank exactly as any other Supabase client call in this
// app — the real access control is migration 054's RLS policies
// (is_current_user_admin()), not this file. Mirrors lib/feedback.ts's
// established fetch-function style.
//
// Submitting a review here inserts ONE new ali_family_review row —
// existing pending rows are never deleted or overwritten (same
// append-only history convention every migration in this project uses).
// It never touches ali_question_bank.eligibility_status: an approved
// review is a human educational judgement, not an activation — see
// ANGEL_EDUCATIONAL_REVIEW_OPERATING_MODEL_V1.md §5.

import { getSupabaseClient } from "./supabase";

export type ReviewTargetType = "passage" | "question_family";
export type ReviewDecision = "approved" | "approved_with_amendment" | "rejected" | "requires_revalidation";

export interface PendingReviewTarget {
  id: string; // the family_id column's value — either a real family id or a passage id
  reviewTargetType: ReviewTargetType;
  notes: string | null;
}

export interface RepresentativeQuestion {
  id: string;
  subject: string;
  skill: string;
  question: string;
  modelAnswer: string;
  familyId: string | null;
  learningUnitId: string | null;
  contentDifficulty: string;
  transferClass: string | null;
  addressesMisconception: string | null;
  contentVersion: number;
  active: boolean;
  provenance: string | null;
  eligibilityStatus: string;
}

/** prompt is stored as jsonb (typed `unknown` at the client) — narrows just enough to read the two display fields safely, without claiming to know its full shape. */
function promptText(prompt: unknown, key: "question" | "modelAnswer"): string {
  if (prompt && typeof prompt === "object" && key in prompt) {
    const value = (prompt as Record<string, unknown>)[key];
    if (typeof value === "string") return value;
  }
  return key === "question" ? "(no question text found)" : "(no model answer found)";
}

export interface PassageDetail {
  id: string;
  title: string;
  originalText: string;
  genre: string;
  wordCount: number;
  readingComplexity: string;
  provenance: string;
  copyrightStatus: string;
  contentDifficulty: string;
  contentVersion: number;
  active: boolean;
  eligibilityStatus: string;
}

export interface ReviewSubmission {
  reviewTargetType: ReviewTargetType;
  targetId: string;
  reviewer: string;
  decision: ReviewDecision;
  notes: string;
  evidenceReference: string;
  provenanceReference: string;
  // Original 10 criteria (migration 034)
  educationalValidity: boolean | null;
  competencyValidity: boolean | null;
  wordingQuality: boolean | null;
  ageAppropriate: boolean | null;
  ambiguityFree: boolean | null;
  difficultyAppropriate: boolean | null;
  misconceptionQuality: boolean | null;
  explanationQuality: boolean | null;
  variationBoundariesSound: boolean | null;
  authenticityConfirmed: boolean | null;
  // Extension criteria (migration 047)
  questionTypeAlignment: boolean | null;
  answerCorrectnessVerified: boolean | null;
  transferValidity: boolean | null;
  teachingQuality: boolean | null;
  examStrategyQuality: boolean | null;
  validationBehaviourSound: boolean | null;
  originalityConfirmed: boolean | null;
  copyrightRiskClear: boolean | null;
}

/** Every target currently awaiting review, per review_target_type. Empty array (not an error) if the calling session is not an admin — the RLS policy simply returns no rows. */
export async function fetchPendingReviewTargets(): Promise<PendingReviewTarget[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("ali_family_review")
    .select("family_id, review_target_type, notes")
    .eq("decision", "pending_independent_review")
    .order("review_target_type", { ascending: true });
  if (error || !data) return [];
  return data.map((r) => ({ id: r.family_id, reviewTargetType: r.review_target_type, notes: r.notes }));
}

/** Up to `limit` real questions for a family — the reviewer's representative + boundary sample (Operating Model §3), not the full sibling set. */
export async function fetchRepresentativeQuestions(familyId: string, limit = 8): Promise<RepresentativeQuestion[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("ali_question_bank")
    .select("id, subject, skill, prompt, family_id, learning_unit_id, content_difficulty, transfer_class, addresses_misconception, content_version, active, provenance, eligibility_status")
    .eq("family_id", familyId)
    .order("content_difficulty", { ascending: true })
    .limit(limit);
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id, subject: r.subject, skill: r.skill,
    question: promptText(r.prompt, "question"),
    modelAnswer: promptText(r.prompt, "modelAnswer"),
    familyId: r.family_id, learningUnitId: r.learning_unit_id,
    contentDifficulty: r.content_difficulty, transferClass: r.transfer_class,
    addressesMisconception: r.addresses_misconception, contentVersion: r.content_version,
    active: r.active, provenance: r.provenance, eligibilityStatus: r.eligibility_status,
  }));
}

/** Same shape, but scoped to a specific passage (learning_unit_id), for reviewing a complete passage's own question set. */
export async function fetchQuestionsForPassage(passageId: string): Promise<RepresentativeQuestion[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("ali_question_bank")
    .select("id, subject, skill, prompt, family_id, learning_unit_id, content_difficulty, transfer_class, addresses_misconception, content_version, active, provenance, eligibility_status")
    .eq("learning_unit_id", passageId);
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id, subject: r.subject, skill: r.skill,
    question: promptText(r.prompt, "question"),
    modelAnswer: promptText(r.prompt, "modelAnswer"),
    familyId: r.family_id, learningUnitId: r.learning_unit_id,
    contentDifficulty: r.content_difficulty, transferClass: r.transfer_class,
    addressesMisconception: r.addresses_misconception, contentVersion: r.content_version,
    active: r.active, provenance: r.provenance, eligibilityStatus: r.eligibility_status,
  }));
}

export async function fetchPassageDetail(passageId: string): Promise<PassageDetail | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("ali_passage_bank")
    .select("id, title, original_text, genre, word_count, reading_complexity, provenance, copyright_status, content_difficulty, content_version, active, eligibility_status")
    .eq("id", passageId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id, title: data.title, originalText: data.original_text, genre: data.genre,
    wordCount: data.word_count, readingComplexity: data.reading_complexity, provenance: data.provenance,
    copyrightStatus: data.copyright_status, contentDifficulty: data.content_difficulty,
    contentVersion: data.content_version, active: data.active, eligibilityStatus: data.eligibility_status,
  };
}

export interface SubmitReviewResult {
  error: string | null;
}

/**
 * Pure validation, independent of any Supabase connection, so it can be
 * unit-tested directly (tests/lib/adminReview.test.ts). Returns the
 * error message to show, or null when the submission is valid.
 */
export function validateReviewSubmission(s: ReviewSubmission): string | null {
  if (!s.reviewer.trim()) return "Reviewer name is required, a review cannot be recorded anonymously.";
  if (s.decision === "rejected" && !s.notes.trim()) {
    return "A rejected decision requires notes explaining why (enforced by the database itself, but checked here for a clearer message).";
  }
  return null;
}

/** Inserts one real, traceable review decision. Never updates eligibility_status — see this file's module docstring. */
export async function submitReview(s: ReviewSubmission): Promise<SubmitReviewResult> {
  const validationError = validateReviewSubmission(s);
  if (validationError) return { error: validationError };
  const supabase = getSupabaseClient();
  if (!supabase) return { error: "Not connected" };
  const { error } = await supabase.from("ali_family_review").insert({
    review_target_type: s.reviewTargetType,
    family_id: s.targetId,
    reviewer: s.reviewer.trim(),
    decision: s.decision,
    notes: s.notes.trim() || null,
    evidence_reference: s.evidenceReference.trim() || null,
    provenance_reference: s.provenanceReference.trim() || null,
    educational_validity: s.educationalValidity,
    competency_validity: s.competencyValidity,
    wording_quality: s.wordingQuality,
    age_appropriate: s.ageAppropriate,
    ambiguity_free: s.ambiguityFree,
    difficulty_appropriate: s.difficultyAppropriate,
    misconception_quality: s.misconceptionQuality,
    explanation_quality: s.explanationQuality,
    variation_boundaries_sound: s.variationBoundariesSound,
    authenticity_confirmed: s.authenticityConfirmed,
    question_type_alignment: s.questionTypeAlignment,
    answer_correctness_verified: s.answerCorrectnessVerified,
    transfer_validity: s.transferValidity,
    teaching_quality: s.teachingQuality,
    exam_strategy_quality: s.examStrategyQuality,
    validation_behaviour_sound: s.validationBehaviourSound,
    originality_confirmed: s.originalityConfirmed,
    copyright_risk_clear: s.copyrightRiskClear,
  });
  return { error: error ? error.message : null };
}
