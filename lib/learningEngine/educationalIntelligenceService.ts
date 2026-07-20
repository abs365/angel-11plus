import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { CompetencyId } from "./types";
import { getQuestionTypesForCompetency } from "./assessmentBrainMap";
import { fetchCompetencyEvidence } from "@/lib/ali/persistence/competencyEvidence";
import { computeRealEducationalState } from "@/lib/ali/persistence/educationalStateRuntime";
import { fetchDurableMasteryRecord, saveDurableMasteryRecord } from "@/lib/ali/persistence/durableMasteryStore";
import { fetchCurrentAuditRecord, insertAuditRecord, supersedeStoredAuditRecord } from "@/lib/ali/persistence/auditStore";
import { computeCompetencyConfidence } from "@/lib/ali/confidence";
import { validateCompetencyMastery } from "@/lib/ali/masteryValidation";
import { evaluateDurableMastery } from "@/lib/ali/durableMastery";
import { requiresFullAudit, createAuditRecord } from "@/lib/ali/audit";
import type { EvidenceConfidenceTier } from "@/types/ali/confidence";
import type { EducationalState } from "@/types/ali/educationalState";
import type { DurableMasteryRecord, MaintenanceReviewRecord } from "@/types/ali/durableMastery";
import type { ConclusionType } from "@/types/ali/audit";

/**
 * Educational Intelligence Service Layer — Sprint 1 (Educational Core),
 * ANGEL-CSSE-002A / EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md Sections 5, 7, 8.
 *
 * Per Permanent Engineering Rule 1 ("No feature may bypass the Educational
 * Intelligence Engine"), this module is the single entry point CSSE code
 * uses to read or update a learner's Educational Intelligence for a
 * competency — nothing in app/ or components/ should call the lib/ali/*
 * functions this module wraps directly.
 *
 * This is an integration layer, not a new educational model. Every
 * conclusion (Evidence Confidence, Mastery Validation, Educational State,
 * Durable Mastery) is computed by the real, already-implemented,
 * unmodified lib/ali/* engine (Work Packages WP-05 through WP-08, WP-17,
 * WP-18 of a prior Implementation Programme, discovered during this
 * sprint — see the Sprint 1 acceptance report for how that discovery was
 * made and verified). This module's real contribution is the CSSE-specific
 * wiring those functions needed: resolving a competency to its mapped
 * Question Type IDs (assessmentBrainMap.ts) before fetching evidence,
 * since ali_question_bank.skill stores a Question Type ID for CSSE
 * content rather than a competency code directly (the defect corrected in
 * lib/ali/persistence/competencyEvidence.ts and educationalStateRuntime.ts
 * in this same sprint) — plus the evidence-pipeline sequencing
 * (Deliverable 2) around Maintenance Review detection and Educational
 * Audit writes, which no prior module performs end-to-end.
 */

export interface EducationalIntelligenceSnapshot {
  competencyId: CompetencyId;
  /** WP-05, lib/ali/confidence.ts — how much real evidence exists. */
  confidenceTier: EvidenceConfidenceTier;
  /** WP-06, lib/ali/masteryValidation.ts — threshold met AND confidence >= Moderate. */
  validated: boolean;
  /** WP-08, lib/ali/educationalState.ts — the 8-state coordination label. Internal only; never shown to a learner or parent by name. */
  educationalState: EducationalState;
  /** Real gap, in days, since the most recent evidence on a mastered question in this competency — null when no mastered question exists yet. The only source `reviewWasDue`/Maintenance Review detection is derived from; never approximated. */
  daysSinceLastMasteredEvidence: number | null;
  /** True exactly when educationalState === "reviewing" (a Maintenance Review is due) — exposed by name for caller readability. */
  reviewWasDue: boolean;
  /** WP-07, current persisted Durable Mastery record, or a fresh unpersisted default if none exists yet. */
  durableMastery: DurableMasteryRecord;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

interface MasteredEvidenceRow {
  mastery_state: string;
  last_presented_at: string;
}

/**
 * The one additional real query this service layer needs beyond what
 * lib/ali/persistence already provides: the actual calendar gap since the
 * freshest mastered evidence in this competency, so Maintenance Review
 * detection is a real number (lib/ali/durableMastery.ts's
 * evaluateDurableMastery() condition 2), never an approximation.
 */
async function fetchDaysSinceLastMasteredEvidence(
  supabase: SupabaseClient<Database>,
  profileId: string,
  skillCodes: string[],
  now: Date
): Promise<number | null> {
  if (skillCodes.length === 0) return null;

  const { data: questions, error: questionsError } = await supabase
    .from("ali_question_bank")
    .select("id")
    .in("skill", skillCodes);
  if (questionsError || !questions || questions.length === 0) return null;

  const { data: history, error: historyError } = await supabase
    .from("ali_student_question_history")
    .select("mastery_state, last_presented_at")
    .eq("profile_id", profileId)
    .in(
      "question_id",
      questions.map((q) => q.id)
    );
  if (historyError || !history) return null;

  const masteredTimestamps = (history as MasteredEvidenceRow[])
    .filter((h) => h.mastery_state === "mastered")
    .map((h) => new Date(h.last_presented_at).getTime());
  if (masteredTimestamps.length === 0) return null;

  const mostRecent = Math.max(...masteredTimestamps);
  return (now.getTime() - mostRecent) / MS_PER_DAY;
}

async function resolveSnapshot(
  supabase: SupabaseClient<Database>,
  profileId: string,
  competencyId: CompetencyId,
  now: Date
): Promise<EducationalIntelligenceSnapshot> {
  const skillCodes = getQuestionTypesForCompetency(competencyId);

  const [evidence, educationalState, existingDurable, daysSinceLastMasteredEvidence] = await Promise.all([
    fetchCompetencyEvidence(supabase, profileId, skillCodes),
    computeRealEducationalState(supabase, profileId, competencyId, skillCodes),
    fetchDurableMasteryRecord(supabase, profileId, competencyId),
    fetchDaysSinceLastMasteredEvidence(supabase, profileId, skillCodes, now),
  ]);

  const confidenceInput = { competencyCode: competencyId, questions: evidence };
  const confidenceTier = computeCompetencyConfidence(confidenceInput);
  const { validated } = validateCompetencyMastery(confidenceInput);

  const durableMastery: DurableMasteryRecord = existingDurable ?? {
    competencyCode: competencyId,
    validated: false,
    maintenanceReviews: [],
    transferCorroboration: { linkedCompetencyCode: null, corroborated: null },
    durable: false,
  };

  return {
    competencyId,
    confidenceTier,
    validated,
    educationalState,
    daysSinceLastMasteredEvidence,
    reviewWasDue: educationalState === "reviewing",
    durableMastery,
  };
}

/**
 * Read path — the current Educational Intelligence for one competency,
 * computed fresh from real evidence every time (never cached as an
 * independent fact, per the frozen spec's "derived, never a new source of
 * truth" invariant). Used both by the visible learner-progress component
 * (Deliverable 6) and as the "before" half of the evidence pipeline
 * (Deliverable 2) — callers updating evidence must capture this BEFORE
 * calling lib/ali/history.ts's recordOutcome(), then pass it into
 * processEvidenceForCompetency() below.
 */
export async function getEducationalIntelligence(
  supabase: SupabaseClient<Database>,
  profileId: string,
  competencyId: CompetencyId,
  now: Date = new Date()
): Promise<EducationalIntelligenceSnapshot> {
  return resolveSnapshot(supabase, profileId, competencyId, now);
}

/**
 * The evidence pipeline (Deliverable 2): call once, immediately after
 * lib/ali/history.ts's recordOutcome() has written a new attempt for a
 * question in this competency. Recomputes Confidence (WP-05) -> Mastery
 * Validation (WP-06) -> Educational State (WP-08) -> Durable Mastery
 * evaluation (WP-07) from the now-updated real evidence, persists the
 * updated Durable Mastery record (Deliverable 5), and — per Decision
 * Boundaries (EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md Section 8) — writes an
 * Educational Audit record the moment a Higher Evidence Required
 * conclusion (mastery or durable-mastery) is newly reached.
 */
export async function processEvidenceForCompetency(
  supabase: SupabaseClient<Database>,
  profileId: string,
  competencyId: CompetencyId,
  preAttemptSnapshot: EducationalIntelligenceSnapshot,
  latestAttemptCorrect: boolean,
  now: Date = new Date()
): Promise<EducationalIntelligenceSnapshot> {
  const post = await resolveSnapshot(supabase, profileId, competencyId, now);

  // Maintenance Review detection: a review was due before this attempt
  // (per the pre-attempt snapshot, captured before recordOutcome() ran),
  // and the competency was already validated at that point — this new
  // attempt is therefore real, genuine post-gap retrieval evidence
  // (AEP-001 §2.1), not a fabricated review event. The real gap length
  // captured in the pre-attempt snapshot is what's stored — never
  // approximated or defaulted.
  let maintenanceReviews = post.durableMastery.maintenanceReviews;
  if (
    preAttemptSnapshot.reviewWasDue &&
    preAttemptSnapshot.validated &&
    preAttemptSnapshot.daysSinceLastMasteredEvidence !== null
  ) {
    const newReview: MaintenanceReviewRecord = {
      attemptedAt: now.toISOString(),
      daysSinceLastEvidence: preAttemptSnapshot.daysSinceLastMasteredEvidence,
      correct: latestAttemptCorrect,
    };
    maintenanceReviews = [...maintenanceReviews, newReview];
  }

  const durable = evaluateDurableMastery(post.validated, maintenanceReviews, post.durableMastery.transferCorroboration);

  const updatedRecord: DurableMasteryRecord = {
    competencyCode: competencyId,
    validated: post.validated,
    maintenanceReviews,
    transferCorroboration: post.durableMastery.transferCorroboration,
    durable,
  };
  await saveDurableMasteryRecord(supabase, profileId, updatedRecord);

  const finalSnapshot: EducationalIntelligenceSnapshot = {
    ...post,
    durableMastery: updatedRecord,
    educationalState: durable ? "durably-mastered" : post.educationalState,
  };

  await recordAuditIfNewlyHigherEvidence(supabase, profileId, competencyId, preAttemptSnapshot, finalSnapshot, now);

  return finalSnapshot;
}

/**
 * Decision Boundaries, made real (EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md
 * Section 8; lib/ali/audit.ts's requiresFullAudit()). A mastery or durable-
 * mastery conclusion is Higher Evidence Required — the moment it is newly
 * reached (not on every subsequent recompute that merely confirms it),
 * this writes a real, traceable EducationalAuditRecord, superseding
 * whichever record was previously current for this learner/competency, if
 * any. Automatic-tier states never reach this function's write path at
 * all — no record is written for them, consistent with EAW-002 §9's
 * "audit rigor scales with decision stakes" scoping.
 */
async function recordAuditIfNewlyHigherEvidence(
  supabase: SupabaseClient<Database>,
  profileId: string,
  competencyId: CompetencyId,
  before: EducationalIntelligenceSnapshot,
  after: EducationalIntelligenceSnapshot,
  now: Date
): Promise<void> {
  const conclusionType: ConclusionType | null =
    after.educationalState === "durably-mastered" && before.educationalState !== "durably-mastered"
      ? "durable-mastery"
      : after.educationalState === "mastered" &&
        before.educationalState !== "mastered" &&
        before.educationalState !== "durably-mastered"
      ? "mastery"
      : null;

  if (!conclusionType || !requiresFullAudit("higher-evidence-required")) return;

  const previous = await fetchCurrentAuditRecord(supabase, profileId, competencyId);
  const newRecord = createAuditRecord({
    id: crypto.randomUUID(),
    conclusionType,
    learnerId: profileId,
    competencyOrDimension: competencyId,
    confidenceTierAtTime: after.confidenceTier,
    concludedAt: now.toISOString(),
  });

  const insertedId = await insertAuditRecord(supabase, newRecord);
  if (insertedId && previous) {
    await supersedeStoredAuditRecord(supabase, previous.id, insertedId, "new-evidence");
  }
}
