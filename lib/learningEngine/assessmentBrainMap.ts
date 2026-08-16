import type {
  AssessmentComponent,
  CompetencyId,
  ExamEvidenceMaturity,
  QuestionTypeId,
} from "./types";

/**
 * Direct transcription of ASSESSMENT_BRAIN_V1.md — this file is the single
 * place Learning Engine code touches Assessment Brain's own vocabulary, so
 * that every other module (rollup, diagnostics, readiness) can stay pure
 * and evidence-agnostic. Nothing below is computed or inferred; every value
 * is copied from a specific Assessment Brain table cell, cited per block.
 * If Assessment Brain V1 is ever superseded by a new frozen version, this
 * is the only file that needs updating.
 */

/** ASSESSMENT_BRAIN_V1.md §3 — the 13 competencies with their EMC rating and owning domain. */
export const COMPETENCIES: Record<
  CompetencyId,
  { name: string; component: AssessmentComponent; emc: ExamEvidenceMaturity }
> = {
  "RC-01": { name: "Literal Retrieval from Narrative Text", component: "English Comprehension", emc: "EMC-3" },
  "RC-02": { name: "Inference and Justified Interpretation", component: "English Comprehension", emc: "EMC-3" },
  "RC-03": { name: "Word/Phrase Meaning-in-Context Explanation", component: "English Comprehension", emc: "EMC-2" },
  "RC-04": { name: "Sequential Ordering of Textual Information", component: "English Comprehension", emc: "EMC-2" },
  "AR-01": { name: "Letter-Code Pattern Inference and Application", component: "Applied Reasoning", emc: "EMC-3" },
  "MR-01": { name: "Arithmetic Calculation", component: "Mathematics", emc: "EMC-3" },
  "MR-02": { name: "Algebraic / Symbolic Problem-Solving", component: "Mathematics", emc: "EMC-4" },
  "MR-03": { name: "Geometric and Spatial Reasoning", component: "Mathematics", emc: "EMC-4" },
  "MR-04": { name: "Multi-Step Word-Problem Interpretation", component: "Mathematics", emc: "EMC-4" },
  "MR-05": { name: "Number Properties and Number Theory", component: "Mathematics", emc: "EMC-2" },
  "MR-06": { name: "Precision Under Exact-Match Conditions", component: "Mathematics", emc: "EMC-4" },
  "WC-01": { name: "Sustained Original Composition", component: "Continuous Writing", emc: "EMC-3" },
  "WC-02": { name: "Multi-Dimensional Writing Quality", component: "Continuous Writing", emc: "EMC-1" },
};

/** ASSESSMENT_BRAIN_V1.md §9 (Cross Reference Matrix) — every Question Type mapped to its Primary Competency. Supporting Competencies are intentionally not modelled here: Learning Engine V1 §3 rolls a Question Type's evidence up to its Primary Competency only, to keep the roll-up unambiguous (a Question Type contributing evidence to two competencies at once was not specified by Learning Engine V1 and is not invented here). */
export const QUESTION_TYPE_PRIMARY_COMPETENCY: Record<QuestionTypeId, CompetencyId> = {
  "QT-RC-01": "RC-01",
  "QT-RC-02": "RC-02",
  "QT-RC-03": "RC-03",
  "QT-RC-04": "RC-03",
  "QT-RC-05": "RC-02",
  "QT-RC-06": "RC-04",
  "QT-RC-07": "RC-01",
  "QT-RC-08": "RC-01",
  "QT-RC-09": "RC-01",
  "QT-RC-10": "RC-02",
  "QT-AR-01": "AR-01",
  "QT-WC-01a": "WC-01",
  "QT-WC-01b": "WC-01",
  "QT-MR-01": "MR-01",
  "QT-MR-02": "MR-01",
  "QT-MR-03": "MR-01",
  "QT-MR-04": "MR-04",
  "QT-MR-05": "MR-02",
  "QT-MR-06": "MR-02",
  "QT-MR-07": "MR-03",
  "QT-MR-08": "MR-03",
  "QT-MR-09": "MR-01",
  "QT-MR-10": "MR-04",
  "QT-MR-11": "MR-05",
  "QT-MR-12": "MR-01",
  "QT-MR-13": "MR-04",
  "QT-MR-14": "MR-06",
};

/** Derived, not transcribed: groups QUESTION_TYPE_PRIMARY_COMPETENCY by competency for the roll-up layer. */
export function getQuestionTypesForCompetency(competencyId: CompetencyId): QuestionTypeId[] {
  return (Object.keys(QUESTION_TYPE_PRIMARY_COMPETENCY) as QuestionTypeId[]).filter(
    (qt) => QUESTION_TYPE_PRIMARY_COMPETENCY[qt] === competencyId
  );
}

/**
 * Angel's own Subject taxonomy (types/supabase.ts's `Subject`) predates
 * Assessment Brain and has no separate "Applied Reasoning" bucket — CSSE's
 * own eligible-subjects list (lib/ali/pathwayEligibility.ts's
 * PATHWAY_SUBJECT_KEYS.csse) is ["english", "writing", "maths",
 * "vocabulary"]. Applied Reasoning is administered within the English paper
 * (ASSESSMENT_BRAIN_V1.md §2) so it is mapped to "english" here — an
 * imperfect fit, flagged rather than hidden, of the same kind Assessment
 * Brain §8 already documents for QT-MR-03/QT-MR-09's missing dedicated
 * competency.
 */
export const COMPONENT_SUBJECT: Record<AssessmentComponent, "english" | "writing" | "maths" | "vocabulary"> = {
  "English Comprehension": "english",
  "Applied Reasoning": "english",
  "Continuous Writing": "writing",
  Mathematics: "maths",
};

/**
 * CSSE Completion Programme Phase A, Decision 58 — Applied Reasoning (AR-01)
 * was removed from the live CSSE English paper from September 2024 (2025
 * Entry) onward, Founder-confirmed from current official CSSE information.
 * `COMPETENCIES["AR-01"]` above is left unedited, a faithful transcription
 * of Assessment Brain V1's 2021-2023 historical evidence (must not be
 * deleted or rewritten) — but every LIVE consumer of "all current
 * competencies"/"all current assessment components" (profile.ts →
 * diagnostics.ts/readiness.ts/recommendations.ts, revisionPlanner.ts,
 * mockReadiness.ts) iterates ALL_COMPETENCY_IDS/ALL_ASSESSMENT_COMPONENTS,
 * not COMPETENCIES directly, so excluding AR-01 only here is sufficient to
 * stop it appearing as a live, current, permanently-"Not Yet Evidenced"
 * readiness component and diagnostic "coverage gap" chip to real parents
 * and children — confirmed by direct trace of both live rendering paths
 * (components/learningEngine/ReadinessSummary.tsx,
 * components/learningEngine/DiagnosticOverview.tsx) before this fix.
 */
export const ALL_COMPETENCY_IDS = (Object.keys(COMPETENCIES) as CompetencyId[]).filter((id) => id !== "AR-01");
export const ALL_QUESTION_TYPE_IDS = Object.keys(QUESTION_TYPE_PRIMARY_COMPETENCY) as QuestionTypeId[];
export const ALL_ASSESSMENT_COMPONENTS: AssessmentComponent[] = [
  "English Comprehension",
  "Continuous Writing",
  "Mathematics",
];
