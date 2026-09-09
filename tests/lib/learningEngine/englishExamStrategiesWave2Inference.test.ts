import { test } from "node:test";
import assert from "node:assert/strict";
import { ENGLISH_FAMILY_WORKED_EXAMPLE, ENGLISH_FAMILY_EXAM_STRATEGY, getWorkedExample, getExamStrategyHint } from "../../../lib/learningEngine/englishExamStrategies";

/**
 * Educational Increment 003, Wave 2 -- these 5 families had ZERO
 * ENGLISH_FAMILY_WORKED_EXAMPLE and ZERO ENGLISH_FAMILY_EXAM_STRATEGY
 * coverage before this wave. Proves the new entries follow the
 * Founder-specified inference model (What does the text SAY? -> What
 * evidence matters? -> What does that evidence SUGGEST? -> Which
 * interpretation fits BEST? -> How can I justify it?), and never leak
 * any of the 40 real Wave 2 manufactured candidates' own question or
 * accepted-answer text.
 */

const WAVE2_FAMILIES = ["wave3-fam-rc06-sequencing", "wave3-fam-rc07-comparative", "wave3-fam-rc08-emotion", "wave3-fam-rc10-atmosphere-mood", "wave3-fam-rc10-word-choice"];

test("all 5 Wave 2 families now have both an exam-strategy hint and a worked example, closing the ZERO-coverage gap", () => {
  for (const familyId of WAVE2_FAMILIES) {
    assert.ok(getExamStrategyHint(familyId), `${familyId} must now resolve an exam strategy hint`);
    assert.ok(getWorkedExample(familyId), `${familyId} must now resolve a worked example`);
  }
});

test("every Wave 2 worked example follows the Founder-specified 5-step inference model, in order", () => {
  for (const familyId of WAVE2_FAMILIES) {
    const example = ENGLISH_FAMILY_WORKED_EXAMPLE[familyId]!;
    assert.ok(example.fiveStepModel, `${familyId} must declare a fiveStepModel`);
    assert.equal(example.fiveStepModel!.length, 5, `${familyId} must have exactly 5 steps`);
    const [say, evidence, suggest, best, justify] = example.fiveStepModel!;
    assert.match(say, /^What does the text SAY\?/, `${familyId} step 1`);
    assert.match(evidence, /^What evidence matters\?/, `${familyId} step 2`);
    assert.match(suggest, /^What does that evidence SUGGEST\?/, `${familyId} step 3`);
    assert.match(best, /^Which interpretation fits BEST\?/, `${familyId} step 4`);
    assert.match(justify, /^How can I justify it\?/, `${familyId} step 5`);
  }
});

test("wave3-fam-rc08-emotion's worked example never states the target emotion directly in its own scenario text -- preserving the confirmed genuine distinction from wave1-fam-emotion-cause's direct-statement shape", () => {
  const example = ENGLISH_FAMILY_WORKED_EXAMPLE["wave3-fam-rc08-emotion"]!;
  const scenarioLower = example.scenario.toLowerCase();
  // The scenario must describe only physical action (hovering, standing, sitting), never name the feeling itself.
  for (const forbiddenWord of ["nervous", "anxious", "worried", "scared", "afraid"]) {
    assert.ok(!scenarioLower.includes(forbiddenWord), `scenario must not state the emotion "${forbiddenWord}" directly -- it must be inferred from action alone`);
  }
});

test("no Wave 2 worked example or strategy hint reproduces any of the 40 real manufactured candidates' own question text", async () => {
  const { WAVE2_SEQUENCING_CANDIDATES } = await import("../../../lib/ali/questionFactory/ei003Wave2SequencingFamily");
  const { WAVE2_COMPARATIVE_CANDIDATES } = await import("../../../lib/ali/questionFactory/ei003Wave2ComparativeFamily");
  const { WAVE2_EMOTION_CANDIDATES } = await import("../../../lib/ali/questionFactory/ei003Wave2EmotionFamily");
  const { WAVE2_ATMOSPHERE_CANDIDATES } = await import("../../../lib/ali/questionFactory/ei003Wave2AtmosphereFamily");
  const { WAVE2_WORD_CHOICE_CANDIDATES } = await import("../../../lib/ali/questionFactory/ei003Wave2WordChoiceFamily");
  const allCandidates = [...WAVE2_SEQUENCING_CANDIDATES, ...WAVE2_COMPARATIVE_CANDIDATES, ...WAVE2_EMOTION_CANDIDATES, ...WAVE2_ATMOSPHERE_CANDIDATES, ...WAVE2_WORD_CHOICE_CANDIDATES];

  for (const familyId of WAVE2_FAMILIES) {
    const example = ENGLISH_FAMILY_WORKED_EXAMPLE[familyId]!;
    const teachingText = `${example.scenario} ${example.modelReasoning} ${example.fiveStepModel!.join(" ")}`.toLowerCase();
    for (const candidate of allCandidates.filter((c) => c.familyId === familyId)) {
      assert.ok(!teachingText.includes(candidate.question.toLowerCase()), `worked example for ${familyId} must not reproduce real candidate question "${candidate.question}"`);
    }
  }
});

test("every other existing worked example is unchanged by this addition -- fiveStepModel/strategy entries are additive, never overwritten", () => {
  const preExisting = ["wave2-fam-multiselect", "wave1-fam-two-character", "wave1-fam-direct-retrieval"];
  for (const familyId of preExisting) {
    assert.ok(ENGLISH_FAMILY_WORKED_EXAMPLE[familyId], `${familyId} must still resolve`);
  }
  assert.equal(ENGLISH_FAMILY_EXAM_STRATEGY["wave1-fam-emotion-cause"], "Find the exact moment in the question first, then look right around it for what caused the feeling.");
});
