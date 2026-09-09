import { test } from "node:test";
import assert from "node:assert/strict";
import { ENGLISH_FAMILY_WORKED_EXAMPLE, ENGLISH_FAMILY_EXAM_STRATEGY, getWorkedExample, getExamStrategyHint } from "../../../lib/learningEngine/englishExamStrategies";

/**
 * Educational Increment 003, Wave 3 -- these 4 families had ZERO
 * ENGLISH_FAMILY_WORKED_EXAMPLE and ZERO ENGLISH_FAMILY_EXAM_STRATEGY
 * coverage before this wave. Proves the new entries follow the
 * Founder-specified five-step models (retrieval/comparative share one
 * model; motive-inference and effect-of-language each have their own),
 * and never leak any of the 32 real Wave 3 manufactured candidates'
 * own question or accepted-answer text.
 */

const WAVE3_FAMILIES = ["wave3-fam-rc01-retrieval", "wave1-fam-comparative-extraction", "wave1-fam-motive-inference", "wave1-fam-effect-of-language"];

test("all 4 Wave 3 families now have both an exam-strategy hint and a worked example, closing the ZERO-coverage gap", () => {
  for (const familyId of WAVE3_FAMILIES) {
    assert.ok(getExamStrategyHint(familyId), `${familyId} must now resolve an exam strategy hint`);
    assert.ok(getWorkedExample(familyId), `${familyId} must now resolve a worked example`);
  }
});

test("retrieval and comparative-extraction share the same five-step model shape (WHAT INFORMATION -> WHERE -> WHAT DOES IT SAY -> WHICH DETAIL -> CHECK)", () => {
  for (const familyId of ["wave3-fam-rc01-retrieval", "wave1-fam-comparative-extraction"]) {
    const example = ENGLISH_FAMILY_WORKED_EXAMPLE[familyId]!;
    assert.equal(example.fiveStepModel!.length, 5);
    const [need, where, say, detail, check] = example.fiveStepModel!;
    assert.match(need, /^What information do I need\?/);
    assert.match(where, /^Where is the evidence\?/);
    assert.match(say, /^What does it actually say\?/);
    assert.match(detail, /^Which detail answers the question\?/);
    assert.match(check, /^Check\./);
  }
});

test("motive-inference follows the Founder-specified inference model (WHAT HAPPENED -> EVIDENCE -> SUGGEST -> MOTIVE FITS BEST -> JUSTIFY)", () => {
  const example = ENGLISH_FAMILY_WORKED_EXAMPLE["wave1-fam-motive-inference"]!;
  assert.equal(example.fiveStepModel!.length, 5);
  const [happened, evidence, suggest, best, justify] = example.fiveStepModel!;
  assert.match(happened, /^What happened\?/);
  assert.match(evidence, /^What evidence matters\?/);
  assert.match(suggest, /^What does it suggest\?/);
  assert.match(best, /^Which motive fits best\?/);
  assert.match(justify, /^Justify\./);
});

test("effect-of-language follows the Founder-specified language model (WHICH WORD/PHRASE -> MEANING -> SUGGEST -> WHY CHOSEN -> EFFECT)", () => {
  const example = ENGLISH_FAMILY_WORKED_EXAMPLE["wave1-fam-effect-of-language"]!;
  assert.equal(example.fiveStepModel!.length, 5);
  const [which, meaning, suggest, why, effect] = example.fiveStepModel!;
  assert.match(which, /^Which word\/phrase\?/);
  assert.match(meaning, /^What does it mean here\?/);
  assert.match(suggest, /^What does it suggest\?/);
  assert.match(why, /^Why did the writer choose it\?/);
  assert.match(effect, /^What effect does it create\?/);
});

test("no Wave 3 worked example or strategy hint reproduces any of the 32 real manufactured candidates' own question text", async () => {
  const { WAVE3_RETRIEVAL_CANDIDATES } = await import("../../../lib/ali/questionFactory/ei003Wave3RetrievalFamily");
  const { WAVE3_COMPARATIVE_CANDIDATES } = await import("../../../lib/ali/questionFactory/ei003Wave3ComparativeFamily");
  const { WAVE3_MOTIVE_CANDIDATES } = await import("../../../lib/ali/questionFactory/ei003Wave3MotiveFamily");
  const { WAVE3_LANGUAGE_EFFECT_CANDIDATES } = await import("../../../lib/ali/questionFactory/ei003Wave3LanguageEffectFamily");
  const allCandidates = [...WAVE3_RETRIEVAL_CANDIDATES, ...WAVE3_COMPARATIVE_CANDIDATES, ...WAVE3_MOTIVE_CANDIDATES, ...WAVE3_LANGUAGE_EFFECT_CANDIDATES];

  for (const familyId of WAVE3_FAMILIES) {
    const example = ENGLISH_FAMILY_WORKED_EXAMPLE[familyId]!;
    const teachingText = `${example.scenario} ${example.modelReasoning} ${example.fiveStepModel!.join(" ")}`.toLowerCase();
    for (const candidate of allCandidates.filter((c) => c.familyId === familyId)) {
      assert.ok(!teachingText.includes(candidate.question.toLowerCase()), `worked example for ${familyId} must not reproduce real candidate question "${candidate.question}"`);
    }
  }
});

test("every other existing worked example is unchanged by this addition -- fiveStepModel/strategy entries are additive, never overwritten", () => {
  const preExisting = ["wave2-fam-multiselect", "wave1-fam-two-character", "wave1-fam-direct-retrieval", "wave3-fam-rc10-word-choice"];
  for (const familyId of preExisting) {
    assert.ok(ENGLISH_FAMILY_WORKED_EXAMPLE[familyId], `${familyId} must still resolve`);
  }
  assert.equal(ENGLISH_FAMILY_EXAM_STRATEGY["wave1-fam-emotion-cause"], "Find the exact moment in the question first, then look right around it for what caused the feeling.");
});
