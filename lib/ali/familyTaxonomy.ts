/**
 * Educational Foundation Completion Standard — Family Taxonomy (Section 3).
 *
 * Establishes the permanent distinction the Founder's brief named
 * explicitly, so these concepts stop being conflated across reports:
 *
 *   DATABASE FAMILY     -- a row in `ali_question_family` (or a distinct
 *                          `family_id` value on `ali_question_bank`). An
 *                          implementation/storage grouping only.
 *   EDUCATIONAL FAMILY   -- a genuinely distinct skill/reasoning/problem
 *                          family. NOT the same thing as a database
 *                          family record -- classification requires
 *                          evidence (Section 4/5), never assumed 1:1.
 *   STRUCTURAL BLUEPRINT -- a genuinely distinct question/problem
 *                          structure within an educational family
 *                          (`lib/ali/questionFactory/types.ts`'s
 *                          `StructuralBlueprint`, unchanged, referenced
 *                          not duplicated here).
 *   VARIANT              -- a controlled instance of a structural
 *                          blueprint (a generated candidate/bank row).
 *   PASSAGE GROUP         -- English questions dependent on the same
 *                          passage (`lib/ali/englishFamilyModel.ts`'s
 *                          passage-bound family concept, unchanged).
 *   TASK/PROMPT GROUP     -- Writing questions grouped by task/prompt
 *                          topic, where appropriate.
 *   ASSESSMENT FORM GROUP -- questions grouped because they belong to a
 *                          Mock/assessment form (`ali_mock_form`'s own
 *                          manifest, unchanged).
 *
 * This module does NOT reclassify any real content on its own authority.
 * `classifyFamilyRecordType` is a DETERMINISTIC, disclosed heuristic over
 * real `ali_question_family`/`ali_question_bank` fields -- it names its
 * own confidence honestly (`certain` only when the evidence leaves no
 * real ambiguity; `heuristic` when it is a naming-pattern-based best
 * guess that a human should confirm; never silently upgraded to
 * `certain` to make a report look more complete than the evidence
 * supports).
 */

export type FamilyRecordType =
  | "educational_family"
  | "passage_bound_group"
  | "task_prompt_group"
  | "assessment_form_group"
  | "mechanical_or_storage_family"
  | "unclassified";

export type ClassificationConfidence = "certain" | "heuristic";

export interface FamilyRecordClassificationInput {
  familyId: string;
  subject: "maths" | "english" | "writing";
  rowCount: number;
  productionEligible: boolean;
  /** Real, distinct eligibility_status values feeding this family (from a Q1-style diagnostic query) -- optional, since not every caller has run one. */
  statusesPresent?: string[];
}

export interface FamilyRecordClassification {
  familyId: string;
  type: FamilyRecordType;
  confidence: ClassificationConfidence;
  reasoning: string;
}

/**
 * Naming-pattern heuristics, disclosed as such -- NEVER treated as proof.
 * Per the Founder's own instruction ("do not classify by name alone
 * where evidence is insufficient"), a naming-pattern match alone always
 * produces `confidence: "heuristic"`, never `"certain"`.
 */
const WAVE_AUTHORED_PATTERN = /^wave\d+-fam-/;
const MOCK_ORIGIN_PATTERN = /^mock-/;
const INCREMENT_PATTERN = /^eng-(inc|pc)\d+-/;

export function classifyFamilyRecordType(input: FamilyRecordClassificationInput): FamilyRecordClassification {
  const { familyId, subject, rowCount, statusesPresent } = input;

  if (subject === "writing") {
    // Every real Writing family observed to date carries a single
    // wc01a-tagged task/prompt, and genre/topic is the only declared
    // variation dimension (Section 5's own investigation) -- this is a
    // task/prompt group, not yet provable as a distinct EDUCATIONAL
    // family without a genuine rubric-dimension classification (Section
    // 5's WRITING_TEACHING_CONTRACT explicitly discloses this gap).
    return {
      familyId,
      type: "task_prompt_group",
      confidence: "heuristic",
      reasoning: "Every observed Writing family record is a single wc01a task/prompt instance, distinguished by topic/genre only -- genuine educational-dimension classification (task type, purpose, audience, genre, organisation) has not been performed.",
    };
  }

  if (subject === "english" && rowCount === 1) {
    // A single-row family with no evidence of shared reasoning-pattern
    // reuse is most plausibly a passage/question-type-scoped storage
    // grouping (an assessment-form artefact or a one-off item), not a
    // reusable educational family -- but this IS a naming/row-count
    // heuristic, not certain classification.
    return {
      familyId,
      type: MOCK_ORIGIN_PATTERN.test(familyId) ? "assessment_form_group" : "mechanical_or_storage_family",
      confidence: "heuristic",
      reasoning: `Single-row family (row_count=1) with no sibling variants -- ${MOCK_ORIGIN_PATTERN.test(familyId) ? "mock-prefixed naming suggests an assessment-form-scoped grouping" : "most plausibly a storage/passage-scoped grouping rather than a reused educational family"}, not yet confirmed against real content.`,
    };
  }

  if (subject === "english" && WAVE_AUTHORED_PATTERN.test(familyId) && rowCount >= 5) {
    // The Founder's own worked examples (wave1-fam-vocab-explain=17,
    // wave1-fam-sequencing=15, etc.) are exactly this pattern: a
    // deliberately wave-authored, multi-row, competency-named family --
    // still a heuristic (name + row count), not literal content review,
    // but a materially stronger signal than a bare single-row family.
    return {
      familyId,
      type: "educational_family",
      confidence: "heuristic",
      reasoning: `Wave-authored naming convention with ${rowCount} member rows -- consistent with a deliberately authored, reused educational family, not yet confirmed by direct content review.`,
    };
  }

  if (subject === "english" && INCREMENT_PATTERN.test(familyId)) {
    return {
      familyId,
      type: "assessment_form_group",
      confidence: "heuristic",
      reasoning: "Increment/passage-content naming convention (eng-inc*/eng-pc*) -- consistent with a passage-bound or assessment-batch grouping rather than a cross-passage reusable educational family.",
    };
  }

  if (subject === "maths") {
    // Mathematics is the one subject with independently-validated
    // genuine educational family status (74/74 confirmed via the
    // Capacity Audit's own direct content review, cited in the Scale
    // Architecture and Educational Supply reports) -- this branch
    // reflects that CONFIRMED state, not a naming heuristic.
    return {
      familyId,
      type: "educational_family",
      confidence: statusesPresent !== undefined ? "certain" : "heuristic",
      reasoning: "Mathematics family_id records are independently confirmed genuine educational families (Capacity Audit direct content review) -- confidence is 'certain' only when a real per-family status/content check accompanied this classification, 'heuristic' otherwise.",
    };
  }

  return {
    familyId,
    type: "unclassified",
    confidence: "heuristic",
    reasoning: "No naming pattern, subject rule, or row-count signal in this classifier matched -- deliberately left unclassified rather than guessed.",
  };
}
