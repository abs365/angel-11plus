import { test } from "node:test";
import assert from "node:assert/strict";
import { mapMathsCandidateToStoreRow, mapEnglishCandidateToStoreRow, verifyNoFabricatedOrMissingRequiredFields } from "@/lib/ali/questionFactory/candidateStoreMapping";
import { BP_REFLECT_X_AXIS } from "@/lib/ali/questionFactory/mr03CoordinateBlueprints";
import { generateBlueprintCandidate, validateBlueprintCandidate } from "@/lib/ali/questionFactory/candidateGeneration";
import { ENGLISH_RETRIEVAL_CANDIDATES } from "@/lib/ali/questionFactory/englishRetrievalFamily";
import { ENGLISH_QUOTATION_EXPLANATION_CANDIDATES } from "@/lib/ali/questionFactory/englishQuotationExplanationFamily";
import { ENGLISH_SYNONYM_CANDIDATES } from "@/lib/ali/questionFactory/englishSynonymFamily";
import { getPassageById } from "@/lib/ali/questionFactory/englishPassages";

/**
 * Candidate Store Submission Gate, Section 5/6/11 -- proves the LOCAL ->
 * STORE mapping is a real, non-fabricating, schema-compatible
 * transformation, entirely offline (no Supabase connection). This is
 * the "structural dry-run" this gate could actually execute this
 * session, distinct from a live database dry-run (which needs
 * Founder-supplied credentials -- see the gate report's own Section I).
 */

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state / 0x7fffffff; };
}

test("mapMathsCandidateToStoreRow: every NOT NULL column gets a real, non-empty value", () => {
  const candidate = generateBlueprintCandidate(BP_REFLECT_X_AXIS, seededRandom(42));
  const validation = validateBlueprintCandidate(candidate, BP_REFLECT_X_AXIS, []);
  const args = mapMathsCandidateToStoreRow("stable-test-id-1", candidate, BP_REFLECT_X_AXIS, validation);
  const check = verifyNoFabricatedOrMissingRequiredFields(args);
  assert.ok(check.valid, `missing required fields: ${check.missing.join(", ")}`);
});

test("mapMathsCandidateToStoreRow: uses the supplied stable id, never the candidate's own (timestamp-suffixed) candidateId", () => {
  const candidate = generateBlueprintCandidate(BP_REFLECT_X_AXIS, seededRandom(7));
  const validation = validateBlueprintCandidate(candidate, BP_REFLECT_X_AXIS, []);
  const args = mapMathsCandidateToStoreRow("stable-test-id-2", candidate, BP_REFLECT_X_AXIS, validation);
  assert.equal(args.p_candidate_id, "stable-test-id-2");
  assert.notEqual(args.p_candidate_id, candidate.candidateId);
});

test("mapMathsCandidateToStoreRow: mathematical_validation and similarity_validation carry REAL, computed values, never a hardcoded placeholder", () => {
  const candidate = generateBlueprintCandidate(BP_REFLECT_X_AXIS, seededRandom(99));
  const validation = validateBlueprintCandidate(candidate, BP_REFLECT_X_AXIS, []);
  const args = mapMathsCandidateToStoreRow("stable-test-id-3", candidate, BP_REFLECT_X_AXIS, validation);
  assert.deepEqual(args.p_mathematical_validation, { mathematicallyValid: validation.mathematicallyValid, independentlyVerified: validation.independentlyVerified, reasons: validation.reasons });
  assert.deepEqual(args.p_similarity_validation, { approved: validation.approved, reasons: [] });
});

test("mapMathsCandidateToStoreRow: a candidate rejected as an exact duplicate carries that reason in similarity_validation, not silently dropped", () => {
  const candidate = generateBlueprintCandidate(BP_REFLECT_X_AXIS, seededRandom(21));
  const existingBankRow = { id: "existing-1", familyId: "mr03-coordinate", prompt: { question: candidate.question } };
  const validation = validateBlueprintCandidate(candidate, BP_REFLECT_X_AXIS, [existingBankRow]);
  assert.equal(validation.approved, false);
  const args = mapMathsCandidateToStoreRow("stable-test-id-4", candidate, BP_REFLECT_X_AXIS, validation);
  assert.ok((args.p_similarity_validation as { reasons: string[] }).reasons.includes("exact_duplicate_of_existing_bank_row"));
});

test("mapMathsCandidateToStoreRow: question_content preserves diagram data when present (no text-only flattening)", () => {
  // BP_REFLECT_X_AXIS has no diagram; this proves the field is honestly
  // null (not silently omitted) when absent -- structural presence is
  // what a real diagram-bearing blueprint would populate instead.
  const candidate = generateBlueprintCandidate(BP_REFLECT_X_AXIS, seededRandom(5));
  const validation = validateBlueprintCandidate(candidate, BP_REFLECT_X_AXIS, []);
  const args = mapMathsCandidateToStoreRow("stable-test-id-5", candidate, BP_REFLECT_X_AXIS, validation);
  assert.equal((args.p_question_content as { diagram: unknown }).diagram, null);
  assert.ok("diagram" in (args.p_question_content as object), "diagram key must be structurally present even when null, not omitted");
});

test("verifyNoFabricatedOrMissingRequiredFields: flags a genuinely missing required field", () => {
  const candidate = generateBlueprintCandidate(BP_REFLECT_X_AXIS, seededRandom(3));
  const validation = validateBlueprintCandidate(candidate, BP_REFLECT_X_AXIS, []);
  const args = mapMathsCandidateToStoreRow("", candidate, BP_REFLECT_X_AXIS, validation);
  const check = verifyNoFabricatedOrMissingRequiredFields(args);
  assert.equal(check.valid, false);
  assert.ok(check.missing.includes("p_candidate_id"));
});

// ============================================================
// mapEnglishCandidateToStoreRow -- resolves the Candidate Store
// Submission Gate's Section F STOP (no English mapping existed).
// Founder-authorised, bounded to the Increment 002 canary/activation.
// ============================================================

const retrievalCandidate = ENGLISH_RETRIEVAL_CANDIDATES.find((c) => c.candidateId === "eng-ret-01")!;
const quotationCandidate = ENGLISH_QUOTATION_EXPLANATION_CANDIDATES.find((c) => c.candidateId === "eng-qe-01")!;
const twoPartQuotationCandidate = ENGLISH_QUOTATION_EXPLANATION_CANDIDATES.find((c) => c.candidateId === "eng-qe-13")!;
const singleSelectCandidate = ENGLISH_SYNONYM_CANDIDATES.find((c) => c.candidateId === "eng-syn-01")!;
const lighthousePassage = getPassageById("eng-inc002-lighthouse-keepers-apprentice");

test("mapEnglishCandidateToStoreRow: maps deterministically -- same candidate + passage always produce the same args", () => {
  const args1 = mapEnglishCandidateToStoreRow(retrievalCandidate, lighthousePassage);
  const args2 = mapEnglishCandidateToStoreRow(retrievalCandidate, lighthousePassage);
  assert.deepEqual(args1, args2);
});

test("mapEnglishCandidateToStoreRow: correct subject, competency, skill, difficulty, pathway", () => {
  const args = mapEnglishCandidateToStoreRow(retrievalCandidate, lighthousePassage);
  assert.equal(args.p_subject, "english");
  assert.equal(args.p_competency_id, "RC-01");
  assert.equal(args.p_skill, "QT-RC-01");
  assert.equal(args.p_difficulty, "easy");
  assert.deepEqual(args.p_pathway, ["csse"]);
});

test("mapEnglishCandidateToStoreRow: family_id reuses this educational family's own real, already-live database family_id -- never an invented slug", () => {
  const args = mapEnglishCandidateToStoreRow(retrievalCandidate, lighthousePassage);
  assert.equal(args.p_family_id, "wave1-fam-direct-retrieval");
  const qeArgs = mapEnglishCandidateToStoreRow(quotationCandidate, lighthousePassage);
  assert.equal(qeArgs.p_family_id, "wave1-fam-quote-explain");
});

test("mapEnglishCandidateToStoreRow: real question content, claimed answer, and explanation are preserved, not paraphrased or dropped", () => {
  const args = mapEnglishCandidateToStoreRow(retrievalCandidate, lighthousePassage);
  assert.equal((args.p_question_content as { question: string }).question, retrievalCandidate.question);
  assert.deepEqual((args.p_question_content as { acceptedAnswers: string[] }).acceptedAnswers, retrievalCandidate.acceptedAnswers);
  assert.equal(args.p_claimed_answer, retrievalCandidate.acceptedAnswers![0]);

  const qeArgs = mapEnglishCandidateToStoreRow(quotationCandidate, lighthousePassage);
  assert.equal(qeArgs.p_claimed_answer, quotationCandidate.requiredQuotation);
  assert.equal(qeArgs.p_worked_explanation, quotationCandidate.explanationGuidance);
  assert.equal((qeArgs.p_question_content as { modelAnswer: string }).modelAnswer, quotationCandidate.explanationGuidance);
});

test("mapEnglishCandidateToStoreRow: distractors are preserved for single_select candidates, including per-distractor rationale", () => {
  const args = mapEnglishCandidateToStoreRow(singleSelectCandidate, getPassageById(singleSelectCandidate.passageId));
  assert.equal(args.p_question_type, "multiple-choice");
  const distractors = args.p_distractors as { options: string[]; correctOptionIndex: number; distractorRationale: Record<number, string> };
  assert.deepEqual(distractors.options, singleSelectCandidate.options);
  assert.equal(distractors.correctOptionIndex, singleSelectCandidate.correctOptionIndex);
  assert.deepEqual(distractors.distractorRationale, singleSelectCandidate.distractorRationale);
});

test("Answer-Integrity Incident regression: every synonym-battery candidate maps to TIER6_MULTI_SELECT with genuine, complete multi-select evidence -- never TIER1_EXACT_MATCH", () => {
  // Reproduces the exact root cause: these candidates carry single_select
  // MCQ evidence (options/correctOptionIndex), which only
  // TIER6_MULTI_SELECT's dispatcher branch reads
  // (lib/learningEngine/englishAnswerValidation.ts). Before the fix,
  // englishSynonymFamily.ts's blueprints tagged validationTier
  // TIER1_EXACT_MATCH, so every one of these questions was marked
  // incorrect regardless of the learner's real answer -- confirmed live
  // in production across all 20 candidates. This test locks the fix in
  // place: a future edit that reverts any synonym-battery blueprint back
  // to TIER1_EXACT_MATCH (or drops the evidence it needs) fails here
  // before it can ever reach publication again.
  for (const candidate of ENGLISH_SYNONYM_CANDIDATES) {
    const args = mapEnglishCandidateToStoreRow(candidate, getPassageById(candidate.passageId));
    const content = args.p_question_content as {
      validationTier?: string;
      correctOptions?: string[];
      requiredSelectionCount?: number;
      marks?: number;
    };
    assert.equal(content.validationTier, "TIER6_MULTI_SELECT", `${candidate.candidateId} must be TIER6_MULTI_SELECT`);
    assert.notEqual(content.validationTier, "TIER1_EXACT_MATCH", `${candidate.candidateId} regressed to TIER1_EXACT_MATCH`);
    assert.ok(Array.isArray(content.correctOptions) && content.correctOptions.length > 0, `${candidate.candidateId} missing correctOptions -- TIER6_MULTI_SELECT's own dispatcher reads exactly this field`);
    assert.ok(typeof content.requiredSelectionCount === "number" && content.requiredSelectionCount > 0, `${candidate.candidateId} missing requiredSelectionCount`);
    // Synonym Marking Contract Repair -- the real Practice correctness
    // check (app/learning-intelligence/practice/[area]/page.tsx's
    // `isCorrect = result.earnedMarks === q.marks`) can never resolve to
    // true for a TIER6_MULTI_SELECT question without a genuine `marks`
    // value equal to requiredSelectionCount -- confirmed live in
    // production across all 20 candidates (a learner selecting the exact
    // correct option was still marked "Not quite"). This test locks the
    // fix in place: a future edit that drops `marks` fails here before
    // it can ever reach publication again.
    assert.equal(content.marks, content.requiredSelectionCount, `${candidate.candidateId} marks must equal requiredSelectionCount, matching every real, already-working TIER6_MULTI_SELECT question in this codebase`);
    // The claimed answer must genuinely be one of the offered options --
    // otherwise TIER6_MULTI_SELECT's own correctOptions check could never
    // be satisfied by any answer at all, reproducing the same class of
    // silent-always-wrong defect under a different mechanism.
    assert.ok(content.correctOptions!.includes(args.p_claimed_answer), `${candidate.candidateId} claimed_answer "${args.p_claimed_answer}" is not among its own correctOptions`);
    // A second, independently-discovered defect (found only by actually
    // running the real marking dispatcher against this data, not by
    // inspecting shape alone): correctOptions must contain ONLY the
    // genuinely correct option(s), never the full options list.
    // checkMultiSelect() marks ANY selection found in correctOptions as
    // correct -- passing all 4 options here (right and wrong alike)
    // would mark every possible learner answer correct, silently
    // weakening marking rather than fixing it. This family's real
    // response shape is single-select (exactly one correct option), so
    // correctOptions must be a 1-element array.
    assert.equal(content.correctOptions!.length, 1, `${candidate.candidateId} correctOptions must contain ONLY the correct option, not the full options list (found ${content.correctOptions!.length} entries) -- otherwise every possible answer would mark correct`);
  }
});

test("mapEnglishCandidateToStoreRow: correct passage_id, matching Migration 233's real ali_passage_bank id", () => {
  const args = mapEnglishCandidateToStoreRow(retrievalCandidate, lighthousePassage);
  assert.equal(args.p_passage_id, "eng-inc002-lighthouse-keepers-apprentice");
  assert.equal(args.p_passage_id, retrievalCandidate.passageId);
});

test("mapEnglishCandidateToStoreRow: mathematical_validation explicitly, truthfully records NOT APPLICABLE -- never fabricated mathematical evidence", () => {
  const args = mapEnglishCandidateToStoreRow(retrievalCandidate, lighthousePassage);
  assert.deepEqual(args.p_mathematical_validation, {
    applicable: false,
    subject: "english",
    reason: "Mathematical validation is not applicable to English content",
    validation_type: "not_applicable",
  });
});

test("mapEnglishCandidateToStoreRow: similarity_validation carries a REAL per-candidate evidence-anchor result, and honestly discloses what is batch-scope-only and what was not performed at all -- never overclaiming per-candidate coverage", () => {
  const args = mapEnglishCandidateToStoreRow(retrievalCandidate, lighthousePassage);
  const sv = args.p_similarity_validation as {
    validation_scope: string;
    evidence_anchor: { matches: boolean; category: string; method: string };
    batch_level_anti_memorisation: { validation_scope: string };
    duplicate_against_production_bank: { validation_scope: string };
  };
  // The real evidence anchor: this candidate's accepted answers genuinely
  // appear verbatim in the real Lighthouse passage text.
  assert.equal(sv.evidence_anchor.matches, true);
  assert.equal(sv.evidence_anchor.category, "deterministic");
  assert.equal(sv.evidence_anchor.method, "verbatim_substring_search_against_passage_text");
  assert.equal(sv.batch_level_anti_memorisation.validation_scope, "batch");
  assert.equal(sv.duplicate_against_production_bank.validation_scope, "not_performed_by_this_mapping_function");
});

test("mapEnglishCandidateToStoreRow: a candidate whose claimed evidence does NOT genuinely appear in the passage is flagged (matches: false), never silently passed", () => {
  const brokenCandidate = { ...retrievalCandidate, acceptedAnswers: ["a fabricated answer that does not appear anywhere in the passage"] };
  const args = mapEnglishCandidateToStoreRow(brokenCandidate, lighthousePassage);
  const sv = args.p_similarity_validation as { evidence_anchor: { matches: boolean } };
  assert.equal(sv.evidence_anchor.matches, false);
});

test("mapEnglishCandidateToStoreRow: multi-evidence (two-part quotation) requirements survive mapping -- both quotations present, in order, never collapsed to one", () => {
  const args = mapEnglishCandidateToStoreRow(twoPartQuotationCandidate, lighthousePassage);
  const qr = (args.p_question_content as { quotationRequired: string[] }).quotationRequired;
  assert.deepEqual(qr, [twoPartQuotationCandidate.requiredQuotation, twoPartQuotationCandidate.secondRequiredQuotation]);
  const sv = args.p_similarity_validation as { evidence_anchor: { matches: boolean; method: string } };
  assert.equal(sv.evidence_anchor.method, "checkQuotationPresent_against_passage_text_both_parts");
  assert.equal(sv.evidence_anchor.matches, true);
});

test("mapEnglishCandidateToStoreRow: introduces no Mock eligibility -- eligibility_status/mock_eligible never appears anywhere in the mapped args", () => {
  const args = mapEnglishCandidateToStoreRow(retrievalCandidate, lighthousePassage);
  const serialised = JSON.stringify(args);
  assert.ok(!serialised.includes("eligibility_status"));
  assert.ok(!serialised.includes("mock_eligible"));
});

test("mapEnglishCandidateToStoreRow: deterministic candidate identity is preserved exactly -- never regenerated or altered", () => {
  const args = mapEnglishCandidateToStoreRow(retrievalCandidate, lighthousePassage);
  assert.equal(args.p_candidate_id, "eng-ret-01");
});

test("mapEnglishCandidateToStoreRow: throws rather than guessing when the candidate's passageId does not match the supplied passage", () => {
  const wrongPassage = getPassageById("eng-inc002-kite-festival");
  assert.throws(() => mapEnglishCandidateToStoreRow(retrievalCandidate, wrongPassage), /declares passageId .* but was mapped against passage/);
});

test("mapEnglishCandidateToStoreRow: throws rather than guessing for an unregistered blueprintId", () => {
  const unknownBlueprintCandidate = { ...retrievalCandidate, blueprintId: "eng-ret-bp-does-not-exist" };
  assert.throws(() => mapEnglishCandidateToStoreRow(unknownBlueprintCandidate, lighthousePassage), /no registered blueprint found/);
});

test("mapEnglishCandidateToStoreRow: the existing Maths mapper's own behaviour is unchanged by adding the English mapper", () => {
  const candidate = generateBlueprintCandidate(BP_REFLECT_X_AXIS, seededRandom(42));
  const validation = validateBlueprintCandidate(candidate, BP_REFLECT_X_AXIS, []);
  const args = mapMathsCandidateToStoreRow("stable-test-id-unchanged", candidate, BP_REFLECT_X_AXIS, validation);
  assert.equal(args.p_subject, "maths");
  assert.ok(verifyNoFabricatedOrMissingRequiredFields(args).valid);
});
