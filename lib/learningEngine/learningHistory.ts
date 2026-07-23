import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { EducationalAuditRecord } from "@/types/ali/audit";
import type { EvidenceConfidenceTier } from "@/types/ali/confidence";
import {
  fetchCurrentAuditRecord,
  insertAuditRecord,
  supersedeStoredAuditRecord,
  fetchEducationalMilestones,
} from "@/lib/ali/persistence/auditStore";
import { createAuditRecord } from "@/lib/ali/audit";
import type { AssessmentComponent, ComponentReadiness, ReadinessBand } from "./types";
import {
  CSSE_ADMISSIONS_CONTEXT_FACT,
  CSSE_ADMISSIONS_CONTEXT_RELEVANCE,
  CSSE_ADMISSIONS_CONTEXT_DISCLAIMER,
  CSSE_ADMISSIONS_CONTEXT_SOURCE,
} from "./admissionsContext";

/**
 * Learning History / Readiness Audit — Phase 2A of the Educational
 * Intelligence Foundation mission (Founder-approved scope, 2026-07-23).
 *
 * Closes the gap `lib/learningEngine/activity.ts` explicitly flagged as
 * out of its own scope: LEARNING_ENGINE_V1.md §3.6's Historical Progress
 * ("a time-ordered record of how evidence has changed between observed
 * points in time") "requires periodic snapshots of computed state, which
 * no persistence mechanism exists for yet." That mechanism already existed
 * unused: `ali_educational_audit`'s `conclusion_type` enum has included
 * `'readiness-dimension'` since migration 010 — nothing had ever written
 * one. This module is the first writer and reader for that conclusion
 * type, reusing the exact append-only insert/supersede pattern
 * `educationalIntelligenceService.ts`'s `recordAuditIfNewlyHigherEvidence`
 * already established for mastery/durable-mastery, not a new persistence
 * design.
 */

/**
 * Readiness bands don't map one-to-one onto Evidence Confidence Tier (a
 * per-competency, finer-grained scale — §5), but `confidence_tier_at_time`
 * is a NOT NULL column shared across every conclusion_type. Disclosed,
 * honest translation, not a new construct: reuses exactly the coarse
 * Insufficient/Moderate/High banding the frozen spec's own §5 table
 * already defines for exactly this kind of coarse-grained context.
 */
function readinessBandToConfidenceTier(band: ReadinessBand): EvidenceConfidenceTier {
  switch (band) {
    case "Well Evidenced":
      return "high";
    case "Partially Evidenced":
      return "moderate";
    case "Not Yet Evidenced":
      return "insufficient";
  }
}

/**
 * Call once per learner whenever `computeComponentReadiness()` has been
 * freshly computed (e.g. alongside `getRecommendations()`), never as an
 * independent source of truth — this only records a conclusion already
 * derived elsewhere (readiness.ts), per the frozen spec's "derived, never
 * a new source of truth" invariant (Section 12 of the same doc). Writes a
 * new record only when the band has genuinely changed (or none exists
 * yet) — an unchanged band is not re-recorded, keeping the history a real
 * timeline of *changes*, not a duplicate entry per call.
 */
export async function recordReadinessSnapshot(
  supabase: SupabaseClient<Database>,
  profileId: string,
  readiness: ComponentReadiness[],
  now: Date = new Date()
): Promise<void> {
  for (const componentReadiness of readiness) {
    const dimensionKey = componentReadiness.component;
    const previous = await fetchCurrentAuditRecord(supabase, profileId, dimensionKey);
    if (previous?.conclusionValue === componentReadiness.band) continue;

    const newRecord = createAuditRecord({
      id: crypto.randomUUID(),
      conclusionType: "readiness-dimension",
      learnerId: profileId,
      competencyOrDimension: dimensionKey,
      confidenceTierAtTime: readinessBandToConfidenceTier(componentReadiness.band),
      concludedAt: now.toISOString(),
      conclusionValue: componentReadiness.band,
    });

    const insertedId = await insertAuditRecord(supabase, newRecord);
    if (insertedId && previous) {
      await supersedeStoredAuditRecord(supabase, previous.id, insertedId, "new-evidence");
    }
  }
}

/**
 * The real Learning History read path for a component (or every
 * component, if omitted) — a time-ordered record of readiness-dimension
 * conclusions, oldest change to newest, including superseded ones (a
 * superseded band is still a real historical event, same discipline
 * `fetchEducationalMilestones` already applies to mastery records).
 */
export async function fetchReadinessHistory(
  supabase: SupabaseClient<Database>,
  profileId: string,
  component?: AssessmentComponent,
  sinceIso?: string
): Promise<EducationalAuditRecord[]> {
  const all = await fetchEducationalMilestones(supabase, profileId, sinceIso);
  return all
    .filter((r) => r.conclusionType === "readiness-dimension" && (!component || r.competencyOrDimension === component))
    .sort((a, b) => new Date(a.concludedAt).getTime() - new Date(b.concludedAt).getTime());
}

export interface WhatChangedResult {
  changed: boolean;
  message: string;
}

/**
 * Parent Guidance's "What changed" field (Phase 2A/WP7) — the one
 * component of the frozen spec's 3-audience Explainability model
 * (Section 9) that depended on this same Learning History gap. Plain
 * English, no mechanism exposed, and phrased neutrally regardless of
 * direction — the Educational Safety Principle (Section 3, Principle 8)
 * binds here exactly as it does everywhere else: a band moving to a lower
 * one is reported as a factual change, never as a loss, failure, or
 * regression.
 */
export function computeWhatChanged(previousBand: ReadinessBand | null, currentBand: ReadinessBand): WhatChangedResult {
  if (previousBand === null) {
    return { changed: false, message: "This is the first time evidence has been recorded for this area." };
  }
  if (previousBand === currentBand) {
    return { changed: false, message: `No change since the last check — still ${currentBand}.` };
  }
  return { changed: true, message: `This has moved from ${previousBand} to ${currentBand} since the last check.` };
}

export interface AdmissionsIntelligenceContext {
  componentReadiness: ComponentReadiness[];
  /** Real, time-ordered readiness history — empty until recordReadinessSnapshot() has run at least once for this learner. */
  readinessHistory: EducationalAuditRecord[];
  /** Exactly one real, sourced admissions fact this platform holds (admissionsContext.ts) — kept as its own field, never blended into componentReadiness/readinessHistory, per EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md §10. */
  admissionsFact: {
    fact: string;
    relevance: string;
    disclaimer: string;
    source: string;
  };
}

/**
 * Admissions Intelligence, improved using only existing, already-approved
 * evidence (Phase 2A) — assembles the real readiness bands, the real
 * readiness history (now buildable, see above), and the one real
 * admissions fact into a single structure a caller can render together.
 * Deliberately does no new interpretation: no blending, no comparison, no
 * forecast — each field is independently sourced and stays that way,
 * exactly as Section 10 requires. Target Score Guidance and School
 * Comparison remain out of scope, unchanged.
 */
export async function fetchAdmissionsIntelligenceContext(
  supabase: SupabaseClient<Database>,
  profileId: string,
  componentReadiness: ComponentReadiness[]
): Promise<AdmissionsIntelligenceContext> {
  const readinessHistory = await fetchReadinessHistory(supabase, profileId);
  return {
    componentReadiness,
    readinessHistory,
    admissionsFact: {
      fact: CSSE_ADMISSIONS_CONTEXT_FACT,
      relevance: CSSE_ADMISSIONS_CONTEXT_RELEVANCE,
      disclaimer: CSSE_ADMISSIONS_CONTEXT_DISCLAIMER,
      source: CSSE_ADMISSIONS_CONTEXT_SOURCE,
    },
  };
}
