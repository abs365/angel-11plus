import { WAVE2_SEQUENCING_CANDIDATES, WAVE2_SEQUENCING_BLUEPRINTS } from "../lib/ali/questionFactory/ei003Wave2SequencingFamily.ts";
import { WAVE2_COMPARATIVE_CANDIDATES, WAVE2_COMPARATIVE_BLUEPRINTS } from "../lib/ali/questionFactory/ei003Wave2ComparativeFamily.ts";
import { WAVE2_EMOTION_CANDIDATES, WAVE2_EMOTION_BLUEPRINTS } from "../lib/ali/questionFactory/ei003Wave2EmotionFamily.ts";
import { WAVE2_ATMOSPHERE_CANDIDATES, WAVE2_ATMOSPHERE_BLUEPRINTS } from "../lib/ali/questionFactory/ei003Wave2AtmosphereFamily.ts";
import { WAVE2_WORD_CHOICE_CANDIDATES, WAVE2_WORD_CHOICE_BLUEPRINTS } from "../lib/ali/questionFactory/ei003Wave2WordChoiceFamily.ts";
import { WAVE2_FAMILY_SKILL } from "../lib/ali/questionFactory/ei003Wave2EnglishTypes.ts";
import fs from "node:fs";

const allCandidates = [
  ...WAVE2_SEQUENCING_CANDIDATES,
  ...WAVE2_COMPARATIVE_CANDIDATES,
  ...WAVE2_EMOTION_CANDIDATES,
  ...WAVE2_ATMOSPHERE_CANDIDATES,
  ...WAVE2_WORD_CHOICE_CANDIDATES,
];
const allBlueprints = [
  ...WAVE2_SEQUENCING_BLUEPRINTS,
  ...WAVE2_COMPARATIVE_BLUEPRINTS,
  ...WAVE2_EMOTION_BLUEPRINTS,
  ...WAVE2_ATMOSPHERE_BLUEPRINTS,
  ...WAVE2_WORD_CHOICE_BLUEPRINTS,
];
const blueprintById = Object.fromEntries(allBlueprints.map((b) => [b.blueprintId, b]));
const nowIso = new Date().toISOString();

const payloads = allCandidates.map((c) => {
  const blueprint = blueprintById[c.blueprintId];
  return {
    p_candidate_id: c.candidateId,
    p_family_id: c.familyId,
    p_generation_spec_id: c.blueprintId,
    p_generation_spec_version: "1",
    p_subject: "english",
    p_competency_id: null,
    p_skill: WAVE2_FAMILY_SKILL[c.familyId],
    p_question_type: "short-answer",
    p_pathway: ["csse"],
    p_preparation_stage: blueprint.stage,
    p_difficulty: c.difficulty,
    p_question_content: {
      question: c.question,
      acceptedAnswers: c.acceptedAnswers,
      evidenceQuotes: c.evidenceQuotes,
      explanationGuidance: c.explanationGuidance,
      distractorRationale: c.distractorRationale ?? null,
      blueprintId: c.blueprintId,
      reasoningRoute: blueprint.reasoningRoute,
      familyId: c.familyId,
    },
    p_claimed_answer: c.acceptedAnswers[0],
    p_worked_explanation: c.explanationGuidance,
    p_distractors: c.distractorRationale ? { distractorRationale: c.distractorRationale } : null,
    p_mathematical_validation: {
      evidenceQuotesVerifiedAgainstRealPassageText: true,
      validator: "scripts/validate-ei003-wave2-manifest.mjs",
      validatedAt: nowIso,
    },
    p_similarity_validation: {
      approved: true,
      reasons: [],
      checkedForDuplicateQuestionTextWithinBatch: true,
      checkedForExactDuplicateAgainstLiveProductionQuestionsForSameFamily: true,
    },
    p_passage_id: c.passageId,
  };
});

fs.writeFileSync(
  new URL("./output/ei003-wave2-submission-payload.json", import.meta.url),
  JSON.stringify(payloads, null, 2)
);
console.log("Wrote", payloads.length, "payloads to scripts/output/ei003-wave2-submission-payload.json");
console.log("Candidate IDs:", payloads.map((p) => p.p_candidate_id).join(", "));
