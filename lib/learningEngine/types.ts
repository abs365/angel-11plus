/**
 * Learning Engine V1 — core types.
 *
 * Direct code counterpart to docs/intelligence/LEARNING_ENGINE_V1.md and
 * docs/intelligence/ASSESSMENT_BRAIN_V1.md. Every union type below is a
 * literal transcription of an already-Accepted document, not a new
 * educational taxonomy — see assessmentBrainMap.ts for the transcription
 * itself and its citations.
 *
 * Naming note (worth reading before touching this file): this repository
 * separately has an OLDER, unrelated "AEP-002/003/004" root-level document
 * series (e.g. `AEP-003_QUESTION_INTELLIGENCE_FRAMEWORK.md`) and an older
 * ALI Evidence Confidence Model (`lib/ali/confidence.ts`, tiers
 * insufficient/low/moderate/high, keyed on dotted skill codes like
 * `vr.analogies`). That system is real, live, and deliberately NOT reused
 * here — it answers a different question (per-question mastery within
 * ALI's own adaptive engine) using a different, independently-calibrated
 * model. This module implements the NEWER, CSSE-specific, committed
 * `docs/intelligence/` chain only. Do not conflate the two "AEP-*" series.
 */

// ─── Assessment Brain V1 §3/§4/§9 — Competencies and Question Types ────────

/** The 13 competency IDs, exactly as defined in ASSESSMENT_BRAIN_V1.md §3. */
export type CompetencyId =
  | "RC-01"
  | "RC-02"
  | "RC-03"
  | "RC-04"
  | "AR-01"
  | "MR-01"
  | "MR-02"
  | "MR-03"
  | "MR-04"
  | "MR-05"
  | "MR-06"
  | "WC-01"
  | "WC-02";

/** The 27 Question Type IDs, exactly as defined in ASSESSMENT_BRAIN_V1.md §9 / CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md §5. */
export type QuestionTypeId =
  | "QT-RC-01"
  | "QT-RC-02"
  | "QT-RC-03"
  | "QT-RC-04"
  | "QT-RC-05"
  | "QT-RC-06"
  | "QT-RC-07"
  | "QT-RC-08"
  | "QT-RC-09"
  | "QT-RC-10"
  | "QT-AR-01"
  | "QT-WC-01a"
  | "QT-WC-01b"
  | "QT-MR-01"
  | "QT-MR-02"
  | "QT-MR-03"
  | "QT-MR-04"
  | "QT-MR-05"
  | "QT-MR-06"
  | "QT-MR-07"
  | "QT-MR-08"
  | "QT-MR-09"
  | "QT-MR-10"
  | "QT-MR-11"
  | "QT-MR-12"
  | "QT-MR-13"
  | "QT-MR-14";

/** The 4 CSSE Assessment Components, per ASSESSMENT_BRAIN_V1.md §2. */
export type AssessmentComponent =
  | "English Comprehension"
  | "Applied Reasoning"
  | "Continuous Writing"
  | "Mathematics";

/** Assessment Brain's own EMC-1..4 scale (AEP-003 §3(4)), reused unchanged for reference on each competency — this is exam-evidence maturity, NOT learner-evidence maturity (that is EvidenceTier, below). */
export type ExamEvidenceMaturity = "EMC-1" | "EMC-2" | "EMC-3" | "EMC-4";

// ─── Learning Engine V1 §3.2/§3.3 — the two-axis learner-evidence model ────

/** LEARNING_ENGINE_V1.md §3.2. */
export type EvidenceSignal =
  | "Not Yet Observed"
  | "Developing"
  | "Not Yet Demonstrated"
  | "Demonstrated";

/** LEARNING_ENGINE_V1.md §3.3. */
export type EvidenceTier = "ET-0" | "ET-1" | "ET-2" | "ET-3" | "ET-4";

export const EVIDENCE_TIER_LABEL: Record<EvidenceTier, string> = {
  "ET-0": "No Evidence",
  "ET-1": "Indicative",
  "ET-2": "Emerging",
  "ET-3": "Substantiated",
  "ET-4": "Established",
};

export const EVIDENCE_TIER_ORDER: EvidenceTier[] = ["ET-0", "ET-1", "ET-2", "ET-3", "ET-4"];

// ─── Raw layer — LEARNING_ENGINE_V1.md §3.1, Question Type Exposure ────────

/** The outcome of the learner's recorded attempts at one Question Type, derived directly (no invented weighting) from ali_student_question_history's real times_seen/times_correct/distinct_correct_sessions columns. */
export type QuestionTypeOutcome = "none" | "success" | "struggle" | "mixed";

export interface QuestionTypeExposure {
  questionTypeId: QuestionTypeId;
  /** Whether any real question in Angel's own content bank has ever been authored/tagged for this Question Type at all — distinct from whether the learner has attempted it. See LearningEngineDataStatus. */
  contentExists: boolean;
  timesSeen: number;
  timesCorrect: number;
  /** Real column, reused from ali_student_question_history — the closest existing proxy for "evidence spread across more than one sitting," same field the pre-existing ALI Evidence Confidence Model (lib/ali/confidence.ts) already relies on for an analogous purpose. */
  distinctCorrectSessions: number;
  outcome: QuestionTypeOutcome;
}

// ─── Rolled-up layer — LEARNING_ENGINE_V1.md §3.2/§3.3 ─────────────────────

export interface CompetencyStatus {
  competencyId: CompetencyId;
  signal: EvidenceSignal;
  tier: EvidenceTier;
  /** Assessment Brain's own EMC rating for this competency (ASSESSMENT_BRAIN_V1.md §3) — the learner-facing tier ceiling this competency is structurally bounded by, per LEARNING_ENGINE_V1.md §3.3/§9(4). */
  examEvidenceMaturity: ExamEvidenceMaturity;
  /** Question Types mapped to this competency that have real content authored today. Empty for every competency until a future content-authoring/tagging work package runs (see Section on data status). */
  mappedQuestionTypes: QuestionTypeExposure[];
}

// ─── Diagnostic Intelligence — LEARNING_ENGINE_V1.md §4 ────────────────────

export interface DiagnosticFindings {
  strengths: CompetencyId[];
  masteredSkills: CompetencyId[];
  emergingSkills: CompetencyId[];
  developmentAreas: CompetencyId[];
  lowConfidenceAreas: CompetencyId[];
  /** Competencies at ET-0 — an Assessment Coverage gap, never a Development Area (LEARNING_ENGINE_V1.md §4, Principle 6). */
  notYetEvidenced: CompetencyId[];
}

// ─── Readiness Model — LEARNING_ENGINE_V1.md §6 ────────────────────────────

export type ReadinessBand = "Well Evidenced" | "Partially Evidenced" | "Not Yet Evidenced";

export interface ComponentReadiness {
  component: AssessmentComponent;
  band: ReadinessBand;
  competencyIds: CompetencyId[];
  strengths: CompetencyId[];
  developmentAreas: CompetencyId[];
  notYetEvidenced: CompetencyId[];
}

// ─── Recommendation Model — LEARNING_ENGINE_V1.md §7 ───────────────────────

export type RecommendationCategory = "Practice" | "Consolidation" | "Revision" | "Extension" | "Review";

export interface Recommendation {
  category: RecommendationCategory;
  competencyId: CompetencyId;
  /** Plain-language reason, derived mechanically from the Diagnostic finding that produced it — never freeform/generated text (LEARNING_ENGINE_V1.md §9, Explainability). */
  reason: string;
}

// ─── Top-level snapshot ─────────────────────────────────────────────────────

export interface LearnerIntelligenceProfile {
  profileId: string;
  /** True only when the learner's selected pathway is "csse" — this model is CSSE-scoped only, per every source document. */
  pathwayEligible: boolean;
  competencies: CompetencyStatus[];
  diagnostics: DiagnosticFindings;
  readiness: ComponentReadiness[];
  recommendations: Recommendation[];
  /** True once at least one Question Type anywhere has contentExists === true. See LearnerIntelligenceProfile data-status note in profile.ts — today this is always false in production (no content has been authored/tagged against the new CSSE taxonomy yet). */
  hasAnyContent: boolean;
  /** True once at least one competency has any recorded learner evidence (tier !== "ET-0"). */
  hasAnyEvidence: boolean;
}
