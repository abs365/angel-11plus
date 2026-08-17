import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { CompetencyId, AssessmentComponent } from "./types";
import type { EvidenceConfidenceTier } from "@/types/ali/confidence";
import type { EducationalState } from "@/types/ali/educationalState";
import type { AnalyticsReport } from "@/types/analytics";
import { COMPETENCIES } from "./assessmentBrainMap";
import { getEducationalIntelligence, type EducationalIntelligenceSnapshot } from "./educationalIntelligenceService";

/**
 * Educational Increment 007V — Learner Preparation Intelligence Evidence
 * Integration. The canonical, whole-subject preparation-state derivation
 * every future learner/parent surface should read from, per this
 * increment's own explicit purpose: "connect the Learner Preparation
 * Intelligence Architecture defined in 007U to the existing authoritative
 * ALI evidence... The objective is NOT to build another intelligence
 * engine."
 *
 * This module computes NOTHING new about mastery, confidence, or
 * educational state — every conclusion is read, unmodified, from
 * `getEducationalIntelligence()` (Permanent Engineering Rule 1's own
 * single entry point, lib/learningEngine/educationalIntelligenceService.ts),
 * which itself wraps the real, already-implemented lib/ali/* engine
 * (confidence.ts, educationalState.ts, durableMastery.ts, masteryValidation.ts).
 * The only genuinely new work here is AGGREGATION: rolling up several
 * competencies' real evidence into one whole-subject summary, using the
 * existing ASSESSMENT_BRAIN_V1.md competency-to-component mapping
 * (assessmentBrainMap.ts's own COMPETENCIES table) — no new competency
 * taxonomy, no new evidence source.
 *
 * `SubjectEvidenceState` deliberately reuses the exact four-state
 * vocabulary Educational Increment 007U introduced (Decision 72) for
 * learner-facing copy — but this module DERIVES it from the real
 * `EvidenceConfidenceTier` (lib/ali/confidence.ts), not from a raw
 * attempt count as 007U's own `lib/learningEngine/evidenceState.ts` did
 * for the legacy engine (which has no real per-competency evidence tier
 * available to it — see this increment's own governance document, Part
 * 2, for why that module remains legacy-only, not superseded). The
 * mapping is disclosed, not arbitrary: `EvidenceConfidenceTier` has no
 * real four-way equivalent to 007U's "insufficient_evidence" middle
 * category (a competency either has zero evidence at all — the real
 * engine's own "insufficient" tier — or has genuine attempts, sorted
 * into low/moderate/high by actual evidence quality, not raw count) — so
 * "insufficient_evidence" and "developing_evidence" are honestly folded
 * together here as `developing_evidence`, rather than inventing a
 * distinction the real evidence model does not support.
 */
export type SubjectEvidenceState = "no_evidence" | "developing_evidence" | "established_evidence";

export interface CompetencyPreparationSummary {
  competencyId: CompetencyId;
  /** Real, from lib/ali/confidence.ts via getEducationalIntelligence() — never recomputed here. */
  confidenceTier: EvidenceConfidenceTier;
  /** Real, from lib/ali/educationalState.ts via getEducationalIntelligence() — the 8-state coordination label. Internal only; never shown to a learner or parent by name (unchanged rule, restated). */
  educationalState: EducationalState;
}

export interface SubjectPreparationSummary {
  component: AssessmentComponent;
  /** Empty only if the Assessment Brain defines no competency for this component — never happens for the 4 real components, kept defensive. */
  competencies: CompetencyPreparationSummary[];
  /** Whole-subject roll-up of every competency's real confidenceTier — see this module's own docstring for the exact derivation rule. */
  evidenceState: SubjectEvidenceState;
}

/** Derives the whole-subject evidence state from each competency's real confidenceTier — the one piece of genuinely new logic in this module, a pure aggregation, not a new evidence source. */
export function deriveSubjectEvidenceState(tiers: EvidenceConfidenceTier[]): SubjectEvidenceState {
  if (tiers.length === 0) return "no_evidence";
  if (tiers.some((t) => t === "moderate" || t === "high")) return "established_evidence";
  if (tiers.some((t) => t === "low")) return "developing_evidence";
  // every competency is "insufficient" (the real engine's own zero-evidence tier)
  return "no_evidence";
}

/**
 * Every competency the Assessment Brain assigns to a given component
 * (ASSESSMENT_BRAIN_V1.md §3, transcribed unchanged in assessmentBrainMap.ts).
 * Not re-derived per call — COMPETENCIES is a small, static table.
 */
export function getCompetencyIdsForComponent(component: AssessmentComponent): CompetencyId[] {
  return (Object.keys(COMPETENCIES) as CompetencyId[]).filter((id) => COMPETENCIES[id].component === component);
}

/**
 * The canonical, whole-subject preparation summary — real ALI evidence
 * only, composed via Promise.all over each of the component's real
 * competencies, exactly the pattern practice/[area]/page.tsx already uses
 * for its own pre-session Educational Intelligence snapshots. No new
 * Supabase table, no new persistence, no caching beyond the request's
 * own lifetime (matching every function this composes, which are all
 * "derived, never a new source of truth" by explicit design).
 */
export async function computeSubjectPreparationSummary(
  supabase: SupabaseClient<Database>,
  profileId: string,
  component: AssessmentComponent,
  now: Date = new Date()
): Promise<SubjectPreparationSummary> {
  const competencyIds = getCompetencyIdsForComponent(component);
  const snapshots: EducationalIntelligenceSnapshot[] = await Promise.all(
    competencyIds.map((id) => getEducationalIntelligence(supabase, profileId, id, now))
  );
  const competencies: CompetencyPreparationSummary[] = snapshots.map((s) => ({
    competencyId: s.competencyId,
    confidenceTier: s.confidenceTier,
    educationalState: s.educationalState,
  }));
  return {
    component,
    competencies,
    evidenceState: deriveSubjectEvidenceState(competencies.map((c) => c.confidenceTier)),
  };
}

/**
 * Educational Increment 007V, Part 8/9/10 — the one bounded, proven
 * integration this increment implements: overriding the legacy
 * `AnalyticsReport`'s Writing entry with real ALI evidence, closing the
 * exact gap Decision 74 disclosed (a genuine, live legacy-vs-real-evidence
 * conflict — "Writing needs attention" rendered from an unrelated legacy
 * pathway's own score while real CSSE Writing evidence is `no_evidence`).
 *
 * Deliberately narrow and explicit, not a general "trust ALI over legacy"
 * rule applied everywhere: this only fires when (a) the canonical
 * Continuous Writing evidence genuinely shows `no_evidence` — real ALI
 * evidence, not a guess — AND (b) the legacy report's own Writing entry
 * disagrees (claims some attempt/score exists). When both sources already
 * agree, this is a pure no-op (byte-identical output), which the tests for
 * this function prove directly.
 *
 * `report.subjects` is corrected first, since every downstream consumer
 * that receives THIS SAME report object afterwards
 * (`computeAdaptiveState()`'s own `buildDailyMission()`, `buildFocusAreas()`
 * via `computeParentReport()`) re-reads `report.subjects` fresh rather than
 * a cached derivation — confirmed by direct inspection of both call sites,
 * not assumed. `report.insights`/`weakSubjects`/`notStartedSubjects` are
 * pre-computed by `computeAnalytics()` itself and do NOT auto-recompute
 * from a mutated `subjects` array, so those three are corrected explicitly
 * here too, using the exact same title-matching `generateInsights()`
 * itself produces (`"Writing needs attention"` / `"Writing is a strength"`)
 * — not a heuristic, a literal match against the real, unchanged
 * generator's own copy.
 */
export function applyCanonicalWritingEvidence(
  report: AnalyticsReport,
  writingEvidenceState: SubjectEvidenceState
): AnalyticsReport {
  const writingSubject = report.subjects.find((s) => s.subject === "writing");
  const legacyClaimsEvidence = writingSubject && writingSubject.status !== "not-started";
  if (writingEvidenceState !== "no_evidence" || !legacyClaimsEvidence) {
    return report; // real evidence agrees with (or does not contradict) the legacy signal -- no-op
  }

  const correctedSubjects = report.subjects.map((s) =>
    s.subject === "writing" ? { ...s, status: "not-started" as const, attempts: 0, avgScore: 0, bestScore: 0 } : s
  );
  const correctedInsights = report.insights.filter(
    (i) => i.title !== "Writing needs attention" && i.title !== "Writing is a strength"
  );
  const correctedWeak = report.weakSubjects.filter((label) => label !== "Writing");
  const correctedNotStarted = report.notStartedSubjects.includes("Writing")
    ? report.notStartedSubjects
    : [...report.notStartedSubjects, "Writing"];

  return {
    ...report,
    subjects: correctedSubjects,
    insights: correctedInsights,
    weakSubjects: correctedWeak,
    notStartedSubjects: correctedNotStarted,
  };
}
