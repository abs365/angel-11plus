import { WAVE3_RETRIEVAL_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave3RetrievalFamily.ts";
import { WAVE3_COMPARATIVE_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave3ComparativeFamily.ts";
import { WAVE3_MOTIVE_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave3MotiveFamily.ts";
import { WAVE3_LANGUAGE_EFFECT_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave3LanguageEffectFamily.ts";
import { WAVE3_FAMILY_MARKS } from "../lib/ali/questionFactory/ei003Wave3EnglishTypes.ts";
import { validateEnglishMarkingContract, buildDisjointWrongAnswer } from "../lib/ali/questionFactory/englishMarkingContractGate.ts";

/**
 * Educational Increment 003, Wave 3 -- runs the new pre-publication
 * marking-contract safety gate (built in direct response to the two
 * real Wave 2 incidents) against all 32 real manufactured Wave 3
 * candidates, using the REAL, imported production scoring functions
 * (via validateEnglishMarkingContract, never a reimplementation).
 *
 * Every candidate is assigned validationTier = TIER2_ACCEPTED_SET,
 * matching each of these four families' own existing, live production
 * convention (confirmed live before this wave began: every existing
 * row in all four families already carries this exact tier) -- not a
 * new choice invented for this wave.
 */

const allCandidates = [
  ...WAVE3_RETRIEVAL_CANDIDATES,
  ...WAVE3_COMPARATIVE_CANDIDATES,
  ...WAVE3_MOTIVE_CANDIDATES,
  ...WAVE3_LANGUAGE_EFFECT_CANDIDATES,
];

// A small set of hand-picked, genuinely plausible-but-wrong answers for
// a representative sample of candidates -- distinct from the
// disjoint/nonsense wrong-answer check every candidate already gets.
const PLAUSIBLE_WRONG_BY_ID = {
  "ei003-w3-ret-distractor-01": ["the girl with the long plait"],
  "ei003-w3-ret-distractor-02": ["cass"],
  "ei003-w3-comp-simdiff-01": ["they are similar because both dislike school, and different because one is louder than the other"],
  "ei003-w3-motive-weigh-01": ["it is because connor made an unkind comment about the trainers"],
  "ei003-w3-motive-weigh-02": ["he is deliberately testing her to see if she gives up"],
  "ei003-w3-lang-subst-01": ["'went' would have worked just as well and means the same thing"],
};

let problems = 0;
const results = [];

for (const c of allCandidates) {
  const marks = WAVE3_FAMILY_MARKS[c.familyId];
  const contract = {
    candidateId: c.candidateId,
    marks,
    acceptedAnswers: c.acceptedAnswers,
    validationTier: "TIER2_ACCEPTED_SET",
    canonicalAnswer: c.acceptedAnswers[0],
    approvedVariants: c.acceptedAnswers.slice(1),
    disjointWrongAnswer: buildDisjointWrongAnswer(c.acceptedAnswers),
    plausibleWrongAnswers: PLAUSIBLE_WRONG_BY_ID[c.candidateId] ?? [],
  };
  const result = validateEnglishMarkingContract(contract);
  results.push({ candidateId: c.candidateId, familyId: c.familyId, valid: result.valid, failures: result.failures });
  if (!result.valid) {
    problems++;
    console.log(`FAIL: ${c.candidateId}`);
    for (const f of result.failures) console.log(`  - ${f.reason}`);
  }
}

console.log(`\nTotal candidates checked: ${results.length}`);
console.log(`Passed: ${results.filter((r) => r.valid).length}`);
console.log(`Failed: ${results.filter((r) => !r.valid).length}`);
console.log(`Candidates with an additional plausible-wrong check: ${Object.keys(PLAUSIBLE_WRONG_BY_ID).length}`);

console.log(`\n${problems === 0 ? "WAVE 3 MARKING-CONTRACT GATE: PASS -- 32/32 candidates verified against the real production scorer (canonical answer, every approved variant, a verified-disjoint wrong answer, and plausible-wrong answers where supplied)." : `WAVE 3 MARKING-CONTRACT GATE: FAIL (${problems} candidates)`}`);
process.exit(problems === 0 ? 0 : 1);
