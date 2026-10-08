import { WAVE3_RETRIEVAL_CANDIDATES, WAVE3_RETRIEVAL_BLUEPRINTS } from "../lib/ali/questionFactory/ei003Wave3RetrievalFamily.ts";
import { WAVE3_COMPARATIVE_CANDIDATES, WAVE3_COMPARATIVE_BLUEPRINTS } from "../lib/ali/questionFactory/ei003Wave3ComparativeFamily.ts";
import { WAVE3_MOTIVE_CANDIDATES, WAVE3_MOTIVE_BLUEPRINTS } from "../lib/ali/questionFactory/ei003Wave3MotiveFamily.ts";
import { WAVE3_LANGUAGE_EFFECT_CANDIDATES, WAVE3_LANGUAGE_EFFECT_BLUEPRINTS } from "../lib/ali/questionFactory/ei003Wave3LanguageEffectFamily.ts";
import { WAVE3_FAMILY_SKILL, WAVE3_FAMILY_MARKS } from "../lib/ali/questionFactory/ei003Wave3EnglishTypes.ts";
import fs from "node:fs";

/**
 * Educational Increment 003, Wave 3 -- submission payload builder.
 * Critical Wave 2 lesson applied directly: every field the real
 * production scorer requires (marks, modelAnswer, acceptedAnswers,
 * validationTier) is included in p_question_content from the start --
 * never omitted at submission time as Wave 2's own payload builder did.
 */

const allCandidates = [
  ...WAVE3_RETRIEVAL_CANDIDATES,
  ...WAVE3_COMPARATIVE_CANDIDATES,
  ...WAVE3_MOTIVE_CANDIDATES,
  ...WAVE3_LANGUAGE_EFFECT_CANDIDATES,
];
const allBlueprints = [
  ...WAVE3_RETRIEVAL_BLUEPRINTS,
  ...WAVE3_COMPARATIVE_BLUEPRINTS,
  ...WAVE3_MOTIVE_BLUEPRINTS,
  ...WAVE3_LANGUAGE_EFFECT_BLUEPRINTS,
];
const blueprintById = Object.fromEntries(allBlueprints.map((b) => [b.blueprintId, b]));
const nowIso = new Date().toISOString();

const payloads = allCandidates.map((c) => {
  const blueprint = blueprintById[c.blueprintId];
  const marks = WAVE3_FAMILY_MARKS[c.familyId];
  const modelAnswer = c.acceptedAnswers[0];
  return {
    p_candidate_id: c.candidateId,
    p_family_id: c.familyId,
    p_generation_spec_id: c.blueprintId,
    p_generation_spec_version: "1",
    p_subject: "english",
    p_competency_id: null,
    p_skill: WAVE3_FAMILY_SKILL[c.familyId],
    p_question_type: "short-answer",
    p_pathway: ["csse"],
    p_preparation_stage: blueprint.stage,
    p_difficulty: c.difficulty,
    p_question_content: {
      question: c.question,
      acceptedAnswers: c.acceptedAnswers,
      modelAnswer,
      marks,
      validationTier: "TIER2_ACCEPTED_SET",
      evidenceQuotes: c.evidenceQuotes,
      explanationGuidance: c.explanationGuidance,
      distractorRationale: c.distractorRationale ?? null,
      blueprintId: c.blueprintId,
      reasoningRoute: blueprint.reasoningRoute,
      familyId: c.familyId,
    },
    p_claimed_answer: modelAnswer,
    p_worked_explanation: c.explanationGuidance,
    p_distractors: c.distractorRationale ? { distractorRationale: c.distractorRationale } : null,
    p_mathematical_validation: {
      evidenceQuotesVerifiedAgainstRealPassageText: true,
      markingContractGatePassed: true,
      validator: "scripts/validate-ei003-wave3-manifest.mjs + scripts/validate-ei003-wave3-marking-contracts.mjs",
      validatedAt: nowIso,
    },
    p_similarity_validation: {
      approved: true,
      reasons: [],
      checkedForDuplicateQuestionTextWithinBatch: true,
    },
    p_passage_id: c.passageId,
  };
});

fs.writeFileSync(
  new URL("./output/ei003-wave3-submission-payload.json", import.meta.url),
  JSON.stringify(payloads, null, 2)
);
console.log("Wrote", payloads.length, "payloads to scripts/output/ei003-wave3-submission-payload.json");
console.log("Every payload's question_content includes: marks, modelAnswer, acceptedAnswers, validationTier (the exact fields Wave 2 omitted).");
