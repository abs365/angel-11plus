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

// ============================================================
// Final Educational Family Classification & Foundation Acceptance
// Gate (2026-09-06) -- CONSOLIDATION beyond what a per-record naming
// classifier alone can do.
//
// `classifyFamilyRecordType` above answers "is THIS ONE database
// family record plausibly educational" from its own name/row-count in
// isolation. It cannot answer the Founder's own explicit ask: "look
// for consolidation around evidenced educational demands" -- several
// DIFFERENT database family_id values (different wave, different
// naming convention, even a lone row_count=1 record) can represent
// the SAME genuine reasoning demand, and must be merged into ONE
// educational family, never counted twice.
//
// This is evidence-based reasoning over the Founder's own cited
// family names/row-counts (production Q1 evidence) -- NOT a live
// content review of individual questions (this session has no
// per-question text access for English/Writing beyond what the
// Founder has directly cited). Every entry's confidence is therefore
// "heuristic," never "certain," and every merge decision states its
// own reasoning so a future increment with real content access can
// confirm or correct it. A merge is made ONLY where the family names
// themselves describe the same reasoning demand (e.g. "direct-retrieval"
// and "rc01-retrieval" both name retrieval); two names that are merely
// both "about vocabulary" but test a different demand (explaining a
// word's contextual meaning vs. matching a synonym) are deliberately
// kept separate, per the Founder's own "keep separate only when the
// learner demand is materially different" instruction.
// ============================================================

export interface EducationalFamilyConsolidation {
  educationalFamilyName: string;
  memberDatabaseFamilyIds: string[];
  totalRows: number;
  confidence: ClassificationConfidence;
  reasoning: string;
}

/**
 * The 18 named, wave-authored English database family records the
 * Founder's own Q1 evidence cited (140 total rows), consolidated into
 * 13 genuine educational families by reasoning-demand. The remaining
 * 62 of English's 80 database family records (eng-inc-, eng-pc-, and
 * mock-eng-prefixed records, row_count typically 1-4) are NOT included here -- per the Founder's
 * own explicit instruction, they are assessment/passage/question-type
 * scoped storage groupings, not independent educational families,
 * unless and until direct content review proves otherwise (not
 * performed this pass, disclosed as unresolved rather than assumed
 * zero).
 */
export const ENGLISH_EDUCATIONAL_FAMILY_CONSOLIDATION: EducationalFamilyConsolidation[] = [
  {
    educationalFamilyName: "Retrieval",
    memberDatabaseFamilyIds: ["wave1-fam-direct-retrieval", "wave3-fam-rc01-retrieval"],
    totalRows: 19,
    confidence: "heuristic",
    reasoning: "Both names describe the same reasoning demand (locate and state a stated fact) across two different authoring waves.",
  },
  {
    educationalFamilyName: "Sequencing",
    memberDatabaseFamilyIds: ["wave1-fam-sequencing", "wave3-fam-rc06-sequencing"],
    totalRows: 16,
    confidence: "heuristic",
    reasoning: "Both names describe ordering/sequence-establishing reasoning across two authoring waves; wave3's single row is a genuine sibling variant, not a separate demand.",
  },
  {
    educationalFamilyName: "Vocabulary / Meaning in Context",
    memberDatabaseFamilyIds: ["wave1-fam-vocab-explain"],
    totalRows: 17,
    confidence: "heuristic",
    reasoning: "Explaining a word's contextual meaning is a materially different demand from closed-set synonym matching (kept separate from Synonym Selection below) -- interpretation and justification, not selection.",
  },
  {
    educationalFamilyName: "Synonym Selection",
    memberDatabaseFamilyIds: ["wave1-fam-synonym-battery"],
    totalRows: 11,
    confidence: "heuristic",
    reasoning: "A closed-set word-relationship matching demand, distinct from open explanation (Vocabulary / Meaning in Context above) -- not merged despite both being \"about vocabulary,\" per the material-difference standard.",
  },
  {
    educationalFamilyName: "Quotation + Explanation",
    memberDatabaseFamilyIds: ["wave1-fam-quote-explain"],
    totalRows: 13,
    confidence: "heuristic",
    reasoning: "Selecting textual evidence and explaining its relevance is a distinct, named demand with no other cited family describing the same combination.",
  },
  {
    educationalFamilyName: "Multi-Select Reasoning",
    memberDatabaseFamilyIds: ["wave2-fam-multiselect"],
    totalRows: 6,
    confidence: "heuristic",
    reasoning: "A multiple-correct-answer selection format. Kept separate from Multi-Select + Justification below -- the presence or absence of a justification requirement is a material difference in demand, not a cosmetic one.",
  },
  {
    educationalFamilyName: "Multi-Select + Justification",
    memberDatabaseFamilyIds: ["wave1-fam-tick-justify"],
    totalRows: 11,
    confidence: "heuristic",
    reasoning: "Select-then-justify combines a selection format with an explanation demand -- materially deeper than plain Multi-Select Reasoning. Currently provisional/non-production per the Founder's own cited status, not yet contributing to Practice/Mock supply regardless of its educational classification.",
  },
  {
    educationalFamilyName: "Emotion & Cause",
    memberDatabaseFamilyIds: ["wave1-fam-emotion-cause", "wave3-fam-rc08-emotion"],
    totalRows: 13,
    confidence: "heuristic",
    reasoning: "Both plausibly test identifying an emotion and its textual cause; merged on name-similarity alone (rc08-emotion's own name does not explicitly confirm the causal-link component) -- the weakest-confidence merge in this table, flagged for confirmation once real content is reviewed.",
  },
  {
    educationalFamilyName: "Language Effect / Word Choice",
    memberDatabaseFamilyIds: ["wave3-fam-rc10-word-choice", "wave1-fam-effect-of-language"],
    totalRows: 12,
    confidence: "heuristic",
    reasoning: "Both describe identifying a specific language choice and interpreting its effect -- the same reasoning demand under two names from different waves.",
  },
  {
    educationalFamilyName: "Atmosphere / Mood",
    memberDatabaseFamilyIds: ["wave3-fam-rc10-atmosphere-mood"],
    totalRows: 6,
    confidence: "heuristic",
    reasoning: "A specific application of language-effect reasoning to mood/atmosphere -- kept separate from Language Effect / Word Choice per the Founder's own list treating them as distinct named items, not assumed identical without content confirmation.",
  },
  {
    educationalFamilyName: "Two-Character Reasoning",
    memberDatabaseFamilyIds: ["wave1-fam-two-character"],
    totalRows: 6,
    confidence: "heuristic",
    reasoning: "Comparing or relating two named characters is a distinct demand with no other cited family describing the same shape.",
  },
  {
    educationalFamilyName: "Motive Inference",
    memberDatabaseFamilyIds: ["wave1-fam-motive-inference"],
    totalRows: 4,
    confidence: "heuristic",
    reasoning: "A specific, named inference sub-type (why a character acted) -- no generic \"inference\" family exists in the cited estate to merge into, kept as its own family rather than force-merged into a category not actually present.",
  },
  {
    educationalFamilyName: "Comparison",
    memberDatabaseFamilyIds: ["wave1-fam-comparative-extraction", "wave3-fam-rc07-comparative"],
    totalRows: 6,
    confidence: "heuristic",
    reasoning: "Both describe comparative reasoning across textual elements -- the same demand under two names from different waves.",
  },
];

/**
 * Writing's entire cited estate (16 database family records, all
 * `QT-WC-01a`) consolidates to ONE broad genuine educational family --
 * every real Writing task built to date (`writingTeachingContent.ts`'s
 * own `WritingTaskFamily = "writing-reflective-discursive"` is the
 * ONLY task family implemented; the picture-narrative task type is
 * explicitly deferred) is the reflective/discursive response type.
 * Topic (favourite place, kindness, screen time, ...) is a PROMPT/TASK
 * VARIANT dimension, never a separate educational family, per the
 * Founder's own explicit instruction.
 */
export const WRITING_EDUCATIONAL_FAMILY_MODEL: EducationalFamilyConsolidation = {
  educationalFamilyName: "Reflective/Discursive Writing Response",
  memberDatabaseFamilyIds: [
    "eng-inc003-writing-wc01a-favouriteplace", "eng-inc003-writing-wc01a-imaginedplace", "eng-inc003-writing-wc01a-pocketmoney",
    "eng-inc004-writing-wc01a-advice", "eng-inc004-writing-wc01a-notgotoplan", "eng-inc004-writing-wc01a-skillproud",
    "mock-writing-wc01a-cookopinion", "mock-writing-wc01a-difficulttask", "mock-writing-wc01a-kindness",
    "mock-writing-wc01a-meaningfulplace", "mock-writing-wc01a-mindchange", "mock-writing-wc01a-mistakelearned",
    "mock-writing-wc01a-newplace", "mock-writing-wc01a-personinfluence", "mock-writing-wc01a-screentime",
    "mock-writing-wc01a-somethingnew",
  ],
  totalRows: 16,
  confidence: "heuristic",
  reasoning: "Every real Writing family record shares the same competency (QT-WC-01a) and the same, single, currently-implemented task type (reflective/discursive response) -- topic alone varies. No evidence (genre, purpose, audience, rubric dimension) distinguishes any of these 16 as a materially different educational demand from the others.",
};
