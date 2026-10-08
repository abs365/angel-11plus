import { test } from "node:test";
import assert from "node:assert/strict";
import { ENGLISH_PASSAGES, getPassageById } from "@/lib/ali/questionFactory/englishPassages";
import { ENGLISH_RETRIEVAL_BLUEPRINTS, ENGLISH_RETRIEVAL_CANDIDATES } from "@/lib/ali/questionFactory/englishRetrievalFamily";
import { ENGLISH_SEQUENCING_BLUEPRINTS, ENGLISH_SEQUENCING_CANDIDATES } from "@/lib/ali/questionFactory/englishSequencingFamily";
import { ENGLISH_VOCABULARY_BLUEPRINTS, ENGLISH_VOCABULARY_CANDIDATES } from "@/lib/ali/questionFactory/englishVocabularyFamily";
import { ENGLISH_SYNONYM_BLUEPRINTS, ENGLISH_SYNONYM_CANDIDATES } from "@/lib/ali/questionFactory/englishSynonymFamily";
import { ENGLISH_QUOTATION_EXPLANATION_BLUEPRINTS, ENGLISH_QUOTATION_EXPLANATION_CANDIDATES } from "@/lib/ali/questionFactory/englishQuotationExplanationFamily";
import { ENGLISH_LANGUAGE_EFFECT_BLUEPRINTS, ENGLISH_LANGUAGE_EFFECT_CANDIDATES } from "@/lib/ali/questionFactory/englishLanguageEffectFamily";
import { runEnglishIndependentCheck, verifySingleSelectStructure, verifyTwoPartQuotationEvidenced } from "@/lib/ali/questionFactory/englishIndependentValidation";
import type { EnglishQuestionCandidate, EnglishStructuralBlueprint } from "@/lib/ali/questionFactory/englishTypes";

// Candidate Store Submission Gate, Section 4 -- ENGLISH_LANGUAGE_EFFECT_*
// (the re-homed eng-voc-bp-effect-of-choice) is included in the
// sweeping ALL_BLUEPRINTS/ALL_CANDIDATES checks below (independent
// validation, uniqueness, difficultyDimensions, TeachingUse), but is
// deliberately EXCLUDED from the per-family arrays used by the
// blueprint-depth-target, dominant-blueprint-share, and
// passage-diversity-as-a-multi-blueprint-family tests further down --
// "Language Effect / Word Choice" was never one of Increment 002's 5
// deliberately-scaled factory families; this is a one-blueprint
// taxonomy correction (a mis-homed blueprint moved to its true family),
// not new scaled family construction, so those depth/dominance checks
// (designed for multi-blueprint families) do not apply to it.
const ALL_BLUEPRINTS: EnglishStructuralBlueprint[] = [
  ...ENGLISH_RETRIEVAL_BLUEPRINTS,
  ...ENGLISH_SEQUENCING_BLUEPRINTS,
  ...ENGLISH_VOCABULARY_BLUEPRINTS,
  ...ENGLISH_SYNONYM_BLUEPRINTS,
  ...ENGLISH_QUOTATION_EXPLANATION_BLUEPRINTS,
  ...ENGLISH_LANGUAGE_EFFECT_BLUEPRINTS,
];
const ALL_CANDIDATES: EnglishQuestionCandidate[] = [
  ...ENGLISH_RETRIEVAL_CANDIDATES,
  ...ENGLISH_SEQUENCING_CANDIDATES,
  ...ENGLISH_VOCABULARY_CANDIDATES,
  ...ENGLISH_SYNONYM_CANDIDATES,
  ...ENGLISH_QUOTATION_EXPLANATION_CANDIDATES,
  ...ENGLISH_LANGUAGE_EFFECT_CANDIDATES,
];

// ============================================================
// Passage integrity (Section 14)
// ============================================================

test("all 4 original passages are genuinely original (angel_original provenance) and reasonably sized", () => {
  assert.equal(ENGLISH_PASSAGES.length, 4);
  for (const p of ENGLISH_PASSAGES) {
    assert.equal(p.provenance, "angel_original");
    assert.ok(p.wordCount >= 200 && p.wordCount <= 500, `${p.passageId} word count ${p.wordCount} is outside a plausible 11+ comprehension range`);
    assert.ok(p.paragraphs.length >= 3, `${p.passageId} has too few paragraphs to support varied evidence-location citation`);
  }
});

test("passage genres are genuinely mixed (not all narrative or all non-fiction)", () => {
  const genres = new Set(ENGLISH_PASSAGES.map((p) => p.genre));
  assert.ok(genres.has("narrative") && genres.has("non_fiction"));
});

// ============================================================
// Blueprint depth (Section 13)
// ============================================================

test("blueprint IDs are unique across the whole English Factory", () => {
  const ids = ALL_BLUEPRINTS.map((bp) => bp.blueprintId);
  assert.equal(new Set(ids).size, ids.length);
});

test("every selected family has 4-8 genuinely distinct blueprints, per Section 13's own target", () => {
  for (const [name, blueprints] of [
    ["Retrieval", ENGLISH_RETRIEVAL_BLUEPRINTS],
    ["Sequencing", ENGLISH_SEQUENCING_BLUEPRINTS],
    ["Vocabulary / Meaning in Context", ENGLISH_VOCABULARY_BLUEPRINTS],
    ["Synonym Selection", ENGLISH_SYNONYM_BLUEPRINTS],
    ["Quotation + Explanation", ENGLISH_QUOTATION_EXPLANATION_BLUEPRINTS],
  ] as const) {
    assert.ok(blueprints.length >= 4 && blueprints.length <= 8, `${name} has ${blueprints.length} blueprints, outside the 4-8 target`);
  }
});

test("every blueprint declares a non-empty difficultyDimensions array (never passage length/word length/vocabulary rarity alone -- Section 10)", () => {
  for (const bp of ALL_BLUEPRINTS) {
    assert.ok(bp.difficultyDimensions.length > 0, bp.blueprintId);
    for (const dim of bp.difficultyDimensions) {
      assert.ok(!/passage.?length|word.?length|vocabulary.?rarity|number.?of.?answer.?options/i.test(dim), `${bp.blueprintId} difficulty dimension "${dim}" looks like a prohibited surface-feature proxy`);
    }
  }
});

test("every blueprint declares at least one TeachingUse, feeding the SAME TeachingState architecture as Maths (Section 11)", () => {
  for (const bp of ALL_BLUEPRINTS) assert.ok(bp.teachingUses.length > 0, bp.blueprintId);
});

test("Answer-Integrity Incident regression: every Synonym Selection blueprint declares TIER6_MULTI_SELECT, never TIER1_EXACT_MATCH", () => {
  // Every candidate in this family carries single_select MCQ evidence
  // (responseType: "single_select", options/correctOptionIndex) -- the
  // real Practice marker (lib/learningEngine/englishAnswerValidation.ts)
  // only reads that evidence via its TIER6_MULTI_SELECT dispatcher
  // branch. Tagging TIER1_EXACT_MATCH (as every blueprint in this file
  // did until this fix) sends every candidate through an
  // acceptedAnswers-based check against a field this family never
  // populates, so it can never be marked correct -- confirmed live in
  // production across all 20 published candidates. See
  // ANGEL_PUBLISHED_ANSWER_INTEGRITY_INCIDENT_REPORT.md.
  for (const bp of ENGLISH_SYNONYM_BLUEPRINTS) {
    assert.equal(bp.responseType, "single_select", bp.blueprintId);
    assert.equal(bp.validationTier, "TIER6_MULTI_SELECT", `${bp.blueprintId} must declare TIER6_MULTI_SELECT for its own single_select evidence`);
  }
});

// ============================================================
// Independent validation coverage (Section 19)
// ============================================================

test("every candidate ID is unique across the whole English Factory batch", () => {
  const ids = ALL_CANDIDATES.map((c) => c.candidateId);
  assert.equal(new Set(ids).size, ids.length);
});

test("every candidate independently passes runEnglishIndependentCheck against its own real source passage", () => {
  for (const c of ALL_CANDIDATES) {
    const passage = getPassageById(c.passageId);
    const result = runEnglishIndependentCheck(c, passage);
    assert.ok(result.matches, `${c.candidateId} failed independent check: ${result.notes}`);
  }
});

test("validationCategory is never silently claimed 'deterministic' for a candidate whose family requires semantic judgement (Vocabulary, Synonym, Quotation+Explanation must all be evidence_anchored, never deterministic)", () => {
  for (const c of [...ENGLISH_VOCABULARY_CANDIDATES, ...ENGLISH_SYNONYM_CANDIDATES, ...ENGLISH_QUOTATION_EXPLANATION_CANDIDATES]) {
    assert.equal(c.validationCategory, "evidence_anchored", c.candidateId);
  }
});

test("Retrieval and Sequencing (full-order/first-last) candidates are genuinely deterministic -- their own independent check requires no human semantic judgement", () => {
  for (const c of ENGLISH_RETRIEVAL_CANDIDATES) assert.equal(c.validationCategory, "deterministic", c.candidateId);
  for (const c of ENGLISH_SEQUENCING_CANDIDATES) {
    if (c.blueprintId === "eng-seq-bp-insert-position") continue; // honestly evidence_anchored, see Section N
    assert.equal(c.validationCategory, "deterministic", c.candidateId);
  }
});

// ============================================================
// Fault injection (Section 19's own "never treat the generator as its
// own evidence" lesson, applied to English).
// ============================================================

test("fault injection: a fabricated retrieval answer (never actually in the passage) is rejected by the independent evidence check", () => {
  const passage = getPassageById(ENGLISH_RETRIEVAL_CANDIDATES[0].passageId);
  const fabricated: EnglishQuestionCandidate = { ...ENGLISH_RETRIEVAL_CANDIDATES[0], acceptedAnswers: ["a completely fabricated answer never stated anywhere in this passage"] };
  const result = runEnglishIndependentCheck(fabricated, passage);
  assert.equal(result.matches, false);
});

test("fault injection: a fabricated quotation (never actually in the passage) is rejected", () => {
  const passage = getPassageById(ENGLISH_QUOTATION_EXPLANATION_CANDIDATES[0].passageId);
  const fabricated: EnglishQuestionCandidate = { ...ENGLISH_QUOTATION_EXPLANATION_CANDIDATES[0], requiredQuotation: "this exact sentence was never written in the passage at all" };
  const result = runEnglishIndependentCheck(fabricated, passage);
  assert.equal(result.matches, false);
});

test("fault injection: a sequencing candidate claiming the WRONG order (reversed) is rejected via textual-position cross-check", () => {
  const fullOrder = ENGLISH_SEQUENCING_CANDIDATES.find((c) => c.blueprintId === "eng-seq-bp-full-order")!;
  const passage = getPassageById(fullOrder.passageId);
  const reversed: EnglishQuestionCandidate = { ...fullOrder, correctOrderAcceptedSets: [...fullOrder.correctOrderAcceptedSets!].reverse() };
  const result = runEnglishIndependentCheck(reversed, passage);
  assert.equal(result.matches, false);
});

test("fault injection: a before/after candidate claiming the WRONG relation is rejected", () => {
  const beforeAfter = ENGLISH_SEQUENCING_CANDIDATES.find((c) => c.blueprintId === "eng-seq-bp-before-after")!;
  const passage = getPassageById(beforeAfter.passageId);
  const wrongClaim: EnglishQuestionCandidate = { ...beforeAfter, acceptedAnswers: [beforeAfter.acceptedAnswers![0] === "before" ? "after" : "before"] };
  const result = runEnglishIndependentCheck(wrongClaim, passage);
  assert.equal(result.matches, false);
});

test("fault injection: a single-select candidate with a duplicate option is rejected by the structural check", () => {
  const synonym = ENGLISH_SYNONYM_CANDIDATES[0];
  const duplicated: EnglishQuestionCandidate = { ...synonym, options: [synonym.options![0], synonym.options![0], synonym.options![2], synonym.options![3]] };
  const result = verifySingleSelectStructure(duplicated);
  assert.equal(result.matches, false);
});

test("fault injection: a single-select candidate missing a distractor rationale is rejected", () => {
  const synonym = ENGLISH_SYNONYM_CANDIDATES[0];
  const missingRationale: EnglishQuestionCandidate = { ...synonym, distractorRationale: {} };
  const result = verifySingleSelectStructure(missingRationale);
  assert.equal(result.matches, false);
});

test("fault injection: a fabricated target word never in the passage is rejected for a Vocabulary candidate", () => {
  const voc = ENGLISH_VOCABULARY_CANDIDATES[0];
  const passage = getPassageById(voc.passageId);
  const fabricated: EnglishQuestionCandidate = { ...voc, question: "What does 'zorbliflex' mean as used in the passage?" };
  const result = runEnglishIndependentCheck(fabricated, passage);
  assert.equal(result.matches, false);
});

// ============================================================
// Two-part quotation independent verification (Increment 002
// Revision, Section 2) -- proves BOTH required quotations are
// independently checked, never just the first.
// ============================================================

const TWO_PART_QUOTATION_CANDIDATES = ENGLISH_QUOTATION_EXPLANATION_CANDIDATES.filter((c) => c.blueprintId === "eng-qe-bp-two-part-quotation");

test("every real two-part-quotation candidate declares a genuinely distinct secondRequiredQuotation and passes both-parts verification", () => {
  assert.ok(TWO_PART_QUOTATION_CANDIDATES.length >= 4, "expected the 4 real two-part-quotation candidates fixed in the Increment 002 Revision");
  for (const c of TWO_PART_QUOTATION_CANDIDATES) {
    assert.ok(c.secondRequiredQuotation, `${c.candidateId} is missing secondRequiredQuotation`);
    const passage = getPassageById(c.passageId);
    const result = runEnglishIndependentCheck(c, passage);
    assert.ok(result.matches, `${c.candidateId} failed both-parts verification: ${result.notes}`);
  }
});

test("fault injection: valid first quotation + invalid second quotation => FAIL (proves the second quotation is genuinely checked, not skipped once the first passes)", () => {
  const real = TWO_PART_QUOTATION_CANDIDATES[0];
  const passage = getPassageById(real.passageId);
  const result = verifyTwoPartQuotationEvidenced(passage, real.requiredQuotation!, "this exact sentence was never written in the passage at all");
  assert.equal(result.matches, false);
});

test("fault injection: invalid first quotation + valid second quotation => FAIL (proves the first quotation is genuinely checked)", () => {
  const real = TWO_PART_QUOTATION_CANDIDATES[0];
  const passage = getPassageById(real.passageId);
  const result = verifyTwoPartQuotationEvidenced(passage, "this exact sentence was never written in the passage at all", real.secondRequiredQuotation!);
  assert.equal(result.matches, false);
});

test("positive control: valid first quotation + valid second quotation => PASS", () => {
  const real = TWO_PART_QUOTATION_CANDIDATES[0];
  const passage = getPassageById(real.passageId);
  const result = verifyTwoPartQuotationEvidenced(passage, real.requiredQuotation!, real.secondRequiredQuotation!);
  assert.equal(result.matches, true);
});

test("fault injection: a wrong quotation substituted for the second (real text elsewhere in the passage, but not the declared evidence) still requires the DECLARED second quotation to be present", () => {
  const real = TWO_PART_QUOTATION_CANDIDATES[0];
  const passage = getPassageById(real.passageId);
  // Use the passage's own first sentence as a plausible-looking but wrong "second quotation".
  const wrongButRealText = passage.paragraphs[0].split(".")[0];
  const result = verifyTwoPartQuotationEvidenced(passage, real.requiredQuotation!, wrongButRealText + " -- this specific clause was never declared as the required second quotation");
  assert.equal(result.matches, false);
});

test("fault injection: a paraphrase of the second quotation (not the verbatim text) is rejected -- verbatim evidence is required, not a restatement", () => {
  const real = TWO_PART_QUOTATION_CANDIDATES[0];
  const passage = getPassageById(real.passageId);
  const paraphrase = `a paraphrased version of the idea in ${real.secondRequiredQuotation!.slice(0, 10)}, reworded rather than quoted verbatim`;
  const result = verifyTwoPartQuotationEvidenced(passage, real.requiredQuotation!, paraphrase);
  assert.equal(result.matches, false);
});

test("fault injection: a quotation genuinely from the passage but from an irrelevant, unrelated location is rejected when declared as the second required quotation for a DIFFERENT candidate's passage", () => {
  const real = TWO_PART_QUOTATION_CANDIDATES[0];
  const otherCandidate = TWO_PART_QUOTATION_CANDIDATES.find((c) => c.passageId !== real.passageId)!;
  const realPassage = getPassageById(real.passageId);
  // otherCandidate's genuine quotation is real text, but not from real's own passage -- an irrelevant-location substitution.
  const result = verifyTwoPartQuotationEvidenced(realPassage, real.requiredQuotation!, otherCandidate.requiredQuotation!);
  assert.equal(result.matches, false);
});

test("the two required quotations must be genuinely distinct evidence -- declaring the same quotation twice fails, even though each half is individually 'present'", () => {
  const real = TWO_PART_QUOTATION_CANDIDATES[0];
  const passage = getPassageById(real.passageId);
  const result = verifyTwoPartQuotationEvidenced(passage, real.requiredQuotation!, real.requiredQuotation!);
  assert.equal(result.matches, false);
});

test("baseline (negative control): every genuine candidate in every family passes, proving the checks do not reject indiscriminately", () => {
  let checked = 0;
  for (const c of ALL_CANDIDATES) {
    const passage = getPassageById(c.passageId);
    const result = runEnglishIndependentCheck(c, passage);
    assert.ok(result.matches, c.candidateId);
    checked++;
  }
  assert.equal(checked, ALL_CANDIDATES.length);
});

// ============================================================
// Anti-memorisation: structural depth vs raw count (Section 16)
// ============================================================

test("no single blueprint dominates its family's candidate count (anti-memorisation balance check)", () => {
  const families: [string, EnglishQuestionCandidate[]][] = [
    ["Retrieval", ENGLISH_RETRIEVAL_CANDIDATES],
    ["Sequencing", ENGLISH_SEQUENCING_CANDIDATES],
    ["Vocabulary / Meaning in Context", ENGLISH_VOCABULARY_CANDIDATES],
    ["Synonym Selection", ENGLISH_SYNONYM_CANDIDATES],
    ["Quotation + Explanation", ENGLISH_QUOTATION_EXPLANATION_CANDIDATES],
  ];
  for (const [name, candidates] of families) {
    const counts = new Map<string, number>();
    for (const c of candidates) counts.set(c.blueprintId, (counts.get(c.blueprintId) ?? 0) + 1);
    const maxShare = Math.max(...counts.values()) / candidates.length;
    assert.ok(maxShare <= 0.3, `${name}'s dominant blueprint share ${maxShare.toFixed(2)} exceeds 0.3`);
  }
});

test("every family draws on all 4 passages, never concentrated on one (passage diversity, distinct from blueprint diversity)", () => {
  const families: [string, EnglishQuestionCandidate[]][] = [
    ["Retrieval", ENGLISH_RETRIEVAL_CANDIDATES],
    ["Sequencing", ENGLISH_SEQUENCING_CANDIDATES],
    ["Vocabulary / Meaning in Context", ENGLISH_VOCABULARY_CANDIDATES],
    ["Synonym Selection", ENGLISH_SYNONYM_CANDIDATES],
    ["Quotation + Explanation", ENGLISH_QUOTATION_EXPLANATION_CANDIDATES],
  ];
  for (const [name, candidates] of families) {
    const passageIds = new Set(candidates.map((c) => c.passageId));
    assert.equal(passageIds.size, 4, `${name} does not draw on all 4 passages`);
  }
});

test("exact-duplicate check: no two candidates share byte-identical question text", () => {
  const seen = new Set<string>();
  for (const c of ALL_CANDIDATES) {
    assert.ok(!seen.has(c.question), `duplicate question text: ${c.question}`);
    seen.add(c.question);
  }
});

// ============================================================
// CSSE-relevant misconception coverage
// ============================================================

// ============================================================
// Candidate Store Submission Gate, Section 4 -- Language Effect / Word
// Choice taxonomy correction (eng-voc-bp-effect-of-choice re-homed out
// of Vocabulary / Meaning in Context).
// ============================================================

test("Language Effect / Word Choice: exactly 1 blueprint, 4 candidates, all correctly labelled, none left behind in Vocabulary", () => {
  assert.equal(ENGLISH_LANGUAGE_EFFECT_BLUEPRINTS.length, 1);
  assert.equal(ENGLISH_LANGUAGE_EFFECT_CANDIDATES.length, 4);
  for (const bp of ENGLISH_LANGUAGE_EFFECT_BLUEPRINTS) assert.equal(bp.familyName, "Language Effect / Word Choice");
  for (const c of ENGLISH_LANGUAGE_EFFECT_CANDIDATES) assert.equal(c.familyName, "Language Effect / Word Choice");
  for (const c of ENGLISH_VOCABULARY_CANDIDATES) assert.notEqual(c.blueprintId, "eng-voc-bp-effect-of-choice", `${c.candidateId} still declares the re-homed blueprint under Vocabulary`);
  assert.equal(ENGLISH_VOCABULARY_BLUEPRINTS.some((bp) => bp.blueprintId === "eng-voc-bp-effect-of-choice"), false);
});

test("Language Effect / Word Choice candidates draw on all 4 passages and independently pass runEnglishIndependentCheck", () => {
  const passageIds = new Set(ENGLISH_LANGUAGE_EFFECT_CANDIDATES.map((c) => c.passageId));
  assert.equal(passageIds.size, 4);
  for (const c of ENGLISH_LANGUAGE_EFFECT_CANDIDATES) {
    const result = runEnglishIndependentCheck(c, getPassageById(c.passageId));
    assert.ok(result.matches, c.candidateId);
  }
});

test("Vocabulary / Meaning in Context retains 4 blueprints after the Language Effect re-homing -- still within the 4-8 target", () => {
  assert.equal(ENGLISH_VOCABULARY_BLUEPRINTS.length, 4);
  assert.ok(ENGLISH_VOCABULARY_BLUEPRINTS.length >= 4 && ENGLISH_VOCABULARY_BLUEPRINTS.length <= 8);
});

test("every family with a declared misconceptionTargeted blueprint has at least one candidate actually using it", () => {
  for (const bp of ALL_BLUEPRINTS) {
    if (!bp.misconceptionTargeted) continue;
    const candidatesForBp = ALL_CANDIDATES.filter((c) => c.blueprintId === bp.blueprintId);
    assert.ok(candidatesForBp.length > 0, `${bp.blueprintId} declares a misconception but has zero candidates`);
    for (const c of candidatesForBp) assert.equal(c.misconceptionTargeted, bp.misconceptionTargeted, c.candidateId);
  }
});
