import { test } from "node:test";
import assert from "node:assert/strict";
import { mapMathsCandidateToStoreRow, verifyNoFabricatedOrMissingRequiredFields } from "@/lib/ali/questionFactory/mathsCandidateStoreMapping";
import { BP_REVERSE_DIRECT_UNSCAFFOLDED } from "@/lib/ali/questionFactory/mr04ReversePercentageBlueprints";
import { generateBlueprintCandidate, validateBlueprintCandidate } from "@/lib/ali/questionFactory/candidateGeneration";

/**
 * Educational Increment 003, Wave 1 pre-publication gate closure, §1 --
 * this is the clean, English-free replacement for the Maths-relevant
 * subset of tests/lib/ali/questionFactory/candidateStoreMapping.test.ts
 * (a pre-existing, untracked, entangled file this wave deliberately left
 * untouched -- see mathsCandidateStoreMapping.ts's own module docstring).
 * Uses this wave's own BP_REVERSE_DIRECT_UNSCAFFOLDED (mr04-reverse-
 * percentage) as its fixture instead of the old file's BP_REFLECT_X_AXIS,
 * which lives in mr03CoordinateBlueprints.ts -- a file with its own,
 * separate, pre-existing type-drift defect (missing ./independentValidation
 * module) that would make this file fail to load if imported.
 */

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state / 0x7fffffff; };
}

test("mapMathsCandidateToStoreRow: every NOT NULL column gets a real, non-empty value", () => {
  const candidate = generateBlueprintCandidate(BP_REVERSE_DIRECT_UNSCAFFOLDED, seededRandom(42));
  const validation = validateBlueprintCandidate(candidate, BP_REVERSE_DIRECT_UNSCAFFOLDED, []);
  const args = mapMathsCandidateToStoreRow("stable-test-id-1", candidate, BP_REVERSE_DIRECT_UNSCAFFOLDED, validation);
  const check = verifyNoFabricatedOrMissingRequiredFields(args);
  assert.ok(check.valid, `missing required fields: ${check.missing.join(", ")}`);
});

test("mapMathsCandidateToStoreRow: uses the supplied stable id, never the candidate's own (timestamp-suffixed) candidateId", () => {
  const candidate = generateBlueprintCandidate(BP_REVERSE_DIRECT_UNSCAFFOLDED, seededRandom(7));
  const validation = validateBlueprintCandidate(candidate, BP_REVERSE_DIRECT_UNSCAFFOLDED, []);
  const args = mapMathsCandidateToStoreRow("stable-test-id-2", candidate, BP_REVERSE_DIRECT_UNSCAFFOLDED, validation);
  assert.equal(args.p_candidate_id, "stable-test-id-2");
  assert.notEqual(args.p_candidate_id, candidate.candidateId);
});

test("mapMathsCandidateToStoreRow: mathematical_validation and similarity_validation carry REAL, computed values, never a hardcoded placeholder", () => {
  const candidate = generateBlueprintCandidate(BP_REVERSE_DIRECT_UNSCAFFOLDED, seededRandom(99));
  const validation = validateBlueprintCandidate(candidate, BP_REVERSE_DIRECT_UNSCAFFOLDED, []);
  const args = mapMathsCandidateToStoreRow("stable-test-id-3", candidate, BP_REVERSE_DIRECT_UNSCAFFOLDED, validation);
  assert.deepEqual(args.p_mathematical_validation, { mathematicallyValid: validation.mathematicallyValid, reasons: validation.reasons });
  assert.deepEqual(args.p_similarity_validation, { approved: validation.approved, reasons: [] });
});

test("mapMathsCandidateToStoreRow: a candidate rejected as an exact duplicate carries that reason in similarity_validation, not silently dropped", () => {
  const candidate = generateBlueprintCandidate(BP_REVERSE_DIRECT_UNSCAFFOLDED, seededRandom(21));
  const existingBankRow = { id: "existing-1", familyId: "mr04-reverse-percentage", prompt: { question: candidate.question } };
  const validation = validateBlueprintCandidate(candidate, BP_REVERSE_DIRECT_UNSCAFFOLDED, [existingBankRow]);
  assert.equal(validation.approved, false);
  const args = mapMathsCandidateToStoreRow("stable-test-id-4", candidate, BP_REVERSE_DIRECT_UNSCAFFOLDED, validation);
  assert.ok((args.p_similarity_validation as { reasons: string[] }).reasons.includes("exact_duplicate_of_existing_bank_row"));
});

test("mapMathsCandidateToStoreRow: question_content never claims diagram support -- MathsQuestionCandidate has no diagram/diagrams field, and no generation path in this codebase populates one (confirmed: zero references in candidateGeneration.ts/types.ts), so this file correctly omits it rather than reproducing dead, always-undefined code", () => {
  const candidate = generateBlueprintCandidate(BP_REVERSE_DIRECT_UNSCAFFOLDED, seededRandom(5));
  const validation = validateBlueprintCandidate(candidate, BP_REVERSE_DIRECT_UNSCAFFOLDED, []);
  const args = mapMathsCandidateToStoreRow("stable-test-id-5", candidate, BP_REVERSE_DIRECT_UNSCAFFOLDED, validation);
  assert.ok(!("diagram" in (args.p_question_content as object)), "diagram key must not appear -- this candidate type never carries one");
});

test("Educational Increment 003 §A regression: mapMathsCandidateToStoreRow carries blueprintId into question_content, so it survives into the published row -- previously silently dropped even though it was already computed and already used for p_generation_spec_id", () => {
  const candidate = generateBlueprintCandidate(BP_REVERSE_DIRECT_UNSCAFFOLDED, seededRandom(11));
  const validation = validateBlueprintCandidate(candidate, BP_REVERSE_DIRECT_UNSCAFFOLDED, []);
  const args = mapMathsCandidateToStoreRow("stable-test-id-blueprint-identity", candidate, BP_REVERSE_DIRECT_UNSCAFFOLDED, validation);
  const content = args.p_question_content as { blueprintId?: string };
  assert.equal(content.blueprintId, BP_REVERSE_DIRECT_UNSCAFFOLDED.blueprintId);
  assert.equal(content.blueprintId, candidate.blueprintId);
});

test("verifyNoFabricatedOrMissingRequiredFields: flags a genuinely missing required field", () => {
  const candidate = generateBlueprintCandidate(BP_REVERSE_DIRECT_UNSCAFFOLDED, seededRandom(3));
  const validation = validateBlueprintCandidate(candidate, BP_REVERSE_DIRECT_UNSCAFFOLDED, []);
  const args = mapMathsCandidateToStoreRow("", candidate, BP_REVERSE_DIRECT_UNSCAFFOLDED, validation);
  const check = verifyNoFabricatedOrMissingRequiredFields(args);
  assert.equal(check.valid, false);
  assert.ok(check.missing.includes("p_candidate_id"));
});
