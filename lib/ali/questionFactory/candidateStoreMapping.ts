import type { MathsQuestionCandidate, ValidationResult, StructuralBlueprint } from "./types";
import type { EnglishQuestionCandidate, EnglishPassage, EnglishStructuralBlueprint, EnglishEducationalFamilyName } from "./englishTypes";
import { runEnglishIndependentCheck } from "./englishIndependentValidation";
import { ENGLISH_RETRIEVAL_BLUEPRINTS } from "./englishRetrievalFamily";
import { ENGLISH_QUOTATION_EXPLANATION_BLUEPRINTS } from "./englishQuotationExplanationFamily";
import { ENGLISH_SEQUENCING_BLUEPRINTS } from "./englishSequencingFamily";
import { ENGLISH_VOCABULARY_BLUEPRINTS } from "./englishVocabularyFamily";
import { ENGLISH_SYNONYM_BLUEPRINTS } from "./englishSynonymFamily";
import { ENGLISH_LANGUAGE_EFFECT_BLUEPRINTS } from "./englishLanguageEffectFamily";
import { ENGLISH_EDUCATIONAL_FAMILY_CONSOLIDATION } from "@/lib/ali/familyTaxonomy";

/**
 * Candidate Store Submission Gate, Section 5/6 — the explicit LOCAL
 * APPROVED CANDIDATE FIELD -> CANDIDATE STORE FIELD mapping, for Maths
 * only (see `ANGEL_CANDIDATE_STORE_SUBMISSION_GATE_REPORT.md` Section F
 * for why English is NOT mapped here -- a real, disclosed schema
 * incompatibility, not an oversight).
 *
 * Field names on the right match `submit_question_candidate()`'s own
 * real parameter names (migration 230), cross-checked against the
 * REAL, ALREADY-USED submission payload for the historical 30 candidates
 * (`scripts/output/question-factory-wave2-first-batch.json`,
 * `p_mathematical_validation: { mathematicallyValid, reasons }`,
 * `p_similarity_validation: { approved, reasons }`) -- this module
 * reproduces that SAME established shape, not a new invented one.
 *
 * Pure, DB-free mapping function -- constructs the RPC argument object
 * only. Never calls Supabase, never imports a client. Submission is a
 * separate, deliberate step (a script that calls this function, then
 * the real RPC, run only by/for the Founder with a credentialed admin
 * session -- not part of this module).
 */
export interface SubmitQuestionCandidateArgs {
  p_candidate_id: string;
  p_family_id: string;
  p_generation_spec_id: string;
  p_generation_spec_version: string;
  p_subject: "maths" | "english" | "writing";
  p_competency_id: string;
  p_skill: string;
  p_question_type: string;
  p_pathway: string[];
  p_preparation_stage: string | null;
  p_difficulty: "easy" | "medium" | "hard" | "challenge";
  p_question_content: Record<string, unknown>;
  p_claimed_answer: string;
  p_worked_explanation: string | null;
  p_distractors: Record<string, unknown> | null;
  p_mathematical_validation: Record<string, unknown>;
  p_similarity_validation: Record<string, unknown>;
}

/**
 * Maps ONE approved Maths candidate + its own blueprint + its own
 * ValidationResult (the real, already-computed output of
 * `validateBlueprintCandidate`, never re-derived or fabricated here)
 * into the exact RPC argument shape.
 *
 * `p_candidate_id` is deliberately NOT the candidate's own (timestamp-
 * suffixed, non-deterministic) `candidateId` -- see this gate's own
 * Section Q/idempotency finding: the existing `factory-candidate-
 * {familyId}-{n}-{timestamp}` convention regenerates a DIFFERENT id on
 * every run, which defeats the table's own primary-key idempotency
 * guard. Callers MUST supply a stable, deterministic id (e.g. derived
 * from familyId + a stable per-batch sequence number, decided ONCE at
 * manifest-materialisation time and persisted, never regenerated at
 * submission time).
 */
export function mapMathsCandidateToStoreRow(
  stableCandidateId: string,
  candidate: MathsQuestionCandidate,
  blueprint: Pick<StructuralBlueprint<Record<string, number>>, "familyId" | "competencyId" | "questionTypeId" | "blueprintId">,
  validation: Pick<ValidationResult, "mathematicallyValid" | "approved" | "reasons" | "independentlyVerified">
): SubmitQuestionCandidateArgs {
  return {
    p_candidate_id: stableCandidateId,
    p_family_id: blueprint.familyId,
    // Increment 002/Wave 1 Scale Architecture candidates are blueprint-
    // generated, not spec-generated (Wave 1/2's original single-spec
    // shape) -- blueprintId is the closest honest analogue of
    // "generation_spec_id" for this candidate, disclosed as such, never
    // silently reusing familyId as if it meant something more specific.
    p_generation_spec_id: candidate.blueprintId ?? blueprint.familyId,
    p_generation_spec_version: "1",
    p_subject: "maths",
    p_competency_id: blueprint.competencyId,
    p_skill: blueprint.questionTypeId,
    p_question_type: "short-answer",
    p_pathway: ["csse"],
    p_preparation_stage: null,
    p_difficulty: candidate.difficulty,
    p_question_content: {
      question: candidate.question,
      workingSteps: candidate.workingSteps,
      params: candidate.params,
      reasoningRoute: candidate.reasoningRoute,
      contextTag: candidate.contextTag,
      unknownPosition: candidate.unknownPosition,
      representationType: candidate.representationType ?? null,
      // Diagram data travels inside question_content -- see Section G's
      // own disclosed round-trip-integrity caveat (structurally
      // possible, never live-tested against a real DB this session).
      diagram: candidate.diagram ?? null,
      diagrams: candidate.diagrams ?? null,
    },
    p_claimed_answer: candidate.claimedAnswer,
    p_worked_explanation: candidate.workingSteps.join(" "),
    p_distractors: candidate.acceptedAnswerForms ? { acceptedAnswerForms: candidate.acceptedAnswerForms } : null,
    p_mathematical_validation: { mathematicallyValid: validation.mathematicallyValid, independentlyVerified: validation.independentlyVerified, reasons: validation.reasons },
    p_similarity_validation: { approved: validation.approved, reasons: validation.reasons.filter((r) => r === "exact_duplicate_of_existing_bank_row" || r === "exact_duplicate_within_batch") },
  };
}

/**
 * Structural, non-DB check: every field `submit_question_candidate()`
 * declares NOT NULL is genuinely populated with a real (never
 * fabricated/placeholder) value. Run against a mapped row before it is
 * ever handed to a real submission script -- catches a mapping defect
 * locally, without needing a live database connection.
 */
export function verifyNoFabricatedOrMissingRequiredFields(args: SubmitQuestionCandidateArgs): { valid: boolean; missing: string[] } {
  const requiredNonNull: (keyof SubmitQuestionCandidateArgs)[] = [
    "p_candidate_id", "p_family_id", "p_generation_spec_id", "p_generation_spec_version", "p_subject",
    "p_skill", "p_pathway", "p_difficulty", "p_question_content", "p_claimed_answer",
    "p_mathematical_validation", "p_similarity_validation",
  ];
  const missing = requiredNonNull.filter((k) => args[k] === null || args[k] === undefined || args[k] === "");
  return { valid: missing.length === 0, missing };
}

// ============================================================
// English mapping (Migration 233 Production Activation, Canary Governance
// Round 3) -- resolves the gap the Candidate Store Submission Gate report
// (ANGEL_CANDIDATE_STORE_SUBMISSION_GATE_REPORT.md, Section F) explicitly
// stopped on: no English equivalent of `mapMathsCandidateToStoreRow`
// existed. Founder-authorised, bounded to what is needed to submit the
// already-approved Increment 002 English candidates -- no new migration,
// no schema change (migration 233 already added `passage_id`/the FK this
// mapping populates).
//
// Every value below is either copied directly from the candidate's own
// already-approved fields, or computed by a REAL, already-existing,
// already-tested check -- nothing here is invented to fill a NOT NULL
// column:
//   - `p_family_id` reuses this educational family's own already-real,
//     already-live database family_id (`ENGLISH_EDUCATIONAL_FAMILY_
//     CONSOLIDATION`'s `memberDatabaseFamilyIds[0]`, familyTaxonomy.ts) --
//     never a newly-invented slug. Increment 002 English adds MORE
//     content to an EXISTING educational family, so it reuses that
//     family's own existing storage identity, exactly like Maths's
//     Increment 002 content already does for its own families.
//   - `p_similarity_validation.evidence_anchor` is the REAL, per-candidate
//     result of `runEnglishIndependentCheck()` (englishIndependentValidation.ts)
//     -- an actual mechanical check of this candidate's claimed evidence
//     against its real source passage's real text, run here, not
//     fabricated. Its `validation_scope` field is explicit about what
//     else was and was not checked (batch-level anti-memorisation vs. a
//     not-yet-performed live duplicate check against the production
//     store) -- never silently implying more coverage than exists.
//   - `p_mathematical_validation` is an explicit, honest N/A envelope:
//     this NOT NULL column is named for, and was designed for, Maths's
//     own ValidationResult shape -- it is truthfully marked
//     `applicable: false` for English, never populated with fabricated
//     mathematical content.
// ============================================================

const ALL_ENGLISH_BLUEPRINTS: EnglishStructuralBlueprint[] = [
  ...ENGLISH_RETRIEVAL_BLUEPRINTS,
  ...ENGLISH_QUOTATION_EXPLANATION_BLUEPRINTS,
  ...ENGLISH_SEQUENCING_BLUEPRINTS,
  ...ENGLISH_VOCABULARY_BLUEPRINTS,
  ...ENGLISH_SYNONYM_BLUEPRINTS,
  ...ENGLISH_LANGUAGE_EFFECT_BLUEPRINTS,
];

const ENGLISH_FAMILY_PRIMARY_DATABASE_ID: Partial<Record<EnglishEducationalFamilyName, string>> = Object.fromEntries(
  ENGLISH_EDUCATIONAL_FAMILY_CONSOLIDATION.map((f) => [f.educationalFamilyName, f.memberDatabaseFamilyIds[0]])
);

/** `question_type` mirrors `BankQuestion.questionType`'s own 3-value vocabulary (types/ali/questionBank.ts) -- never a 4th, invented value. */
function deriveQuestionType(responseType: EnglishQuestionCandidate["responseType"]): "short-answer" | "open-response" | "multiple-choice" {
  if (responseType === "quotation_plus_explanation") return "open-response";
  if (responseType === "single_select") return "multiple-choice";
  return "short-answer"; // short_answer, ordered_list
}

export interface SubmitEnglishCandidateArgs extends SubmitQuestionCandidateArgs {
  p_passage_id: string;
}

/**
 * Maps ONE approved English Increment 002 candidate + its own real source
 * passage into the exact `submit_question_candidate()` RPC argument shape
 * (18 arguments, including the Migration 233 `p_passage_id` parameter).
 *
 * Throws (never silently guesses) when the candidate references a
 * blueprint or educational family this module cannot honestly resolve --
 * matching this module's own "never fabricate a required value" rule.
 */
export function mapEnglishCandidateToStoreRow(
  candidate: EnglishQuestionCandidate,
  passage: EnglishPassage
): SubmitEnglishCandidateArgs {
  if (candidate.passageId !== passage.passageId) {
    throw new Error(`mapEnglishCandidateToStoreRow: candidate "${candidate.candidateId}" declares passageId "${candidate.passageId}" but was mapped against passage "${passage.passageId}".`);
  }

  const blueprint = ALL_ENGLISH_BLUEPRINTS.find((b) => b.blueprintId === candidate.blueprintId);
  if (!blueprint) {
    throw new Error(`mapEnglishCandidateToStoreRow: no registered blueprint found for blueprintId "${candidate.blueprintId}" -- cannot determine its real validationTier honestly.`);
  }

  const familyDatabaseId = ENGLISH_FAMILY_PRIMARY_DATABASE_ID[candidate.familyName];
  if (!familyDatabaseId) {
    throw new Error(`mapEnglishCandidateToStoreRow: no established database family_id found for educational family "${candidate.familyName}" in ENGLISH_EDUCATIONAL_FAMILY_CONSOLIDATION.`);
  }

  // The REAL, per-candidate independent evidence check -- run here, not
  // fabricated. Mirrors the Maths mapper's own use of an already-computed
  // ValidationResult, except this one is computed fresh, in this
  // function, from the candidate's own real claim against its real
  // passage text (englishIndependentValidation.ts).
  const evidenceCheck = runEnglishIndependentCheck(candidate, passage);

  const quotationRequired: string[] | undefined = candidate.requiredQuotation
    ? candidate.secondRequiredQuotation
      ? [candidate.requiredQuotation, candidate.secondRequiredQuotation]
      : [candidate.requiredQuotation]
    : undefined;

  // `orderedAnswer` (types/ali/questionBank.ts) is a flat string[] -- one
  // canonical phrase per position -- exactly matching what
  // `scoreEnglishComprehensionAnswer`'s own TIER4 dispatcher already
  // consumes (`(prompt.orderedAnswer ?? []).map((item) => [item])`); the
  // runtime grading path itself only ever compares against ONE accepted
  // phrase per position, never the full `correctOrderAcceptedSets[i]`
  // array, so reducing to each position's first/canonical phrase here is
  // a lossless match to the real runtime contract, not a narrowing this
  // function introduces on its own.
  const orderedAnswer: string[] | undefined = candidate.correctOrderAcceptedSets?.map((set) => set[0]);

  const questionContent: Record<string, unknown> = {
    question: candidate.question,
    evidenceLocation: candidate.evidenceLocation,
    teachingUses: candidate.teachingUses,
    validationTier: blueprint.validationTier,
    blueprintId: candidate.blueprintId,
    ...(candidate.acceptedAnswers ? { acceptedAnswers: candidate.acceptedAnswers } : {}),
    ...(orderedAnswer ? { orderedAnswer } : {}),
    // Answer-Integrity Incident correction — `correctOptions` is the set
    // of options that ARE genuinely correct (TIER6_MULTI_SELECT's real
    // dispatcher, lib/learningEngine/englishAnswerValidation.ts's
    // `checkMultiSelect`, scores any learner selection found in this set
    // as correct). It must be exactly the correct option(s), never the
    // full options list — passing every option here (right and wrong
    // alike) would mark ANY learner selection correct regardless of what
    // was actually chosen, silently weakening marking rather than fixing
    // it. For this family's genuine single-select shape that is exactly
    // one option: the one at `correctOptionIndex`.
    ...(candidate.options && candidate.correctOptionIndex !== undefined
      ? { correctOptions: [candidate.options[candidate.correctOptionIndex]] }
      : {}),
    ...(candidate.correctOptionIndex !== undefined ? { requiredSelectionCount: 1 } : {}),
    // Synonym Marking Contract Repair — the real Practice correctness
    // check (app/learning-intelligence/practice/[area]/page.tsx's
    // `isCorrect = result.earnedMarks === q.marks`) compares
    // TIER6_MULTI_SELECT's `earnedMarks` (a raw correct-selection count,
    // lib/learningEngine/englishAnswerValidation.ts's `checkMultiSelect`)
    // against this published `marks` field. Every real, already-working
    // TIER6_MULTI_SELECT question in this codebase (the 6 pre-existing
    // multi-choice rows) already follows `marks === requiredSelectionCount`
    // (confirmed 6/6, all four) — this family's own candidates never set
    // it, so a learner who selected the exact genuine correct option could
    // never be marked correct (`earnedMarks` a real number vs `q.marks`
    // `undefined`). Mirrors `requiredSelectionCount` exactly: this
    // family's genuine single-select shape is always worth exactly 1 mark.
    ...(candidate.correctOptionIndex !== undefined ? { marks: 1 } : {}),
    ...(quotationRequired ? { quotationRequired } : {}),
    ...(candidate.explanationGuidance ? { modelAnswer: candidate.explanationGuidance } : {}),
  };

  const claimedAnswer =
    candidate.acceptedAnswers?.[0] ??
    candidate.requiredQuotation ??
    candidate.options?.[candidate.correctOptionIndex ?? -1] ??
    candidate.correctOrderAcceptedSets?.map((set) => set[0]).join(" -> ") ??
    "";
  if (!claimedAnswer) {
    throw new Error(`mapEnglishCandidateToStoreRow: candidate "${candidate.candidateId}" has no derivable claimed answer (no acceptedAnswers, requiredQuotation, options, or correctOrderAcceptedSets) -- NOT NULL claimed_answer cannot be honestly populated.`);
  }

  return {
    p_candidate_id: candidate.candidateId,
    p_family_id: familyDatabaseId,
    p_generation_spec_id: candidate.blueprintId,
    p_generation_spec_version: "1",
    p_subject: "english",
    p_competency_id: candidate.competencyId,
    p_skill: candidate.questionTypeId,
    p_question_type: deriveQuestionType(candidate.responseType),
    p_pathway: ["csse"],
    p_preparation_stage: null,
    p_difficulty: candidate.difficulty,
    p_question_content: questionContent,
    p_claimed_answer: claimedAnswer,
    p_worked_explanation: candidate.explanationGuidance ?? null,
    p_distractors:
      candidate.options
        ? { options: candidate.options, correctOptionIndex: candidate.correctOptionIndex, distractorRationale: candidate.distractorRationale ?? null }
        : null,
    // Honest N/A envelope (Founder-specified exact shape) -- this NOT
    // NULL column is named for and was designed for Maths's own
    // ValidationResult; it is truthfully marked inapplicable for
    // English, never populated with fabricated mathematical content.
    p_mathematical_validation: {
      applicable: false,
      subject: "english",
      reason: "Mathematical validation is not applicable to English content",
      validation_type: "not_applicable",
    },
    // Honest, scope-disclosed validation envelope: a REAL per-candidate
    // evidence-anchor check (run above, this call), plus explicit
    // disclosure of what is batch-level-only and what has not been
    // performed at all -- never claiming per-candidate coverage that
    // did not occur.
    p_similarity_validation: {
      validation_scope: "per_candidate_evidence_anchor_plus_batch_level_diversity",
      evidence_anchor: {
        matches: evidenceCheck.matches,
        category: evidenceCheck.category,
        method: evidenceCheck.method,
        notes: evidenceCheck.notes ?? null,
      },
      batch_level_anti_memorisation: {
        validation_scope: "batch",
        source: "tests/lib/ali/questionFactory/englishFactory.test.ts",
        checks: ["dominant_blueprint_share", "passage_diversity", "exact_duplicate_text_within_batch"],
      },
      duplicate_against_production_bank: {
        validation_scope: "not_performed_by_this_mapping_function",
        reason: "Requires an authenticated admin session query against the real candidate/published-question store -- performed as a separate pre-submission reconciliation step, not fabricated here.",
      },
    },
    p_passage_id: candidate.passageId,
  };
}
