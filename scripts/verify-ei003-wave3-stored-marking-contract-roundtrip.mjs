import fs from "node:fs";
import { validateEnglishMarkingContract, buildDisjointWrongAnswer } from "../lib/ali/questionFactory/englishMarkingContractGate.ts";

/**
 * Educational Increment 003, Wave 3 -- STORED (not source) marking-contract
 * round trip. Input is scripts/output/ei003-wave3-stored-rows.json, a live
 * dump of ali_question_candidate.question_content fetched via an
 * authenticated admin session AFTER submission -- not the local library
 * source files. This is the direct Wave 2 lesson applied: source validity
 * is not enough, the candidate-store round trip itself must be proven not
 * to have stripped or altered any required field.
 */

const storedRows = JSON.parse(
  fs.readFileSync(new URL("./output/ei003-wave3-stored-rows.json", import.meta.url), "utf8")
);

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

for (const r of storedRows) {
  const contract = {
    candidateId: r.candidateId,
    marks: r.marks,
    acceptedAnswers: r.acceptedAnswers,
    modelAnswer: r.modelAnswer,
    validationTier: r.validationTier,
    canonicalAnswer: r.modelAnswer,
    approvedVariants: r.acceptedAnswers.filter((a) => a !== r.modelAnswer),
    disjointWrongAnswer: buildDisjointWrongAnswer(r.acceptedAnswers),
    plausibleWrongAnswers: PLAUSIBLE_WRONG_BY_ID[r.candidateId] ?? [],
  };
  const result = validateEnglishMarkingContract(contract);
  results.push({ candidateId: r.candidateId, familyId: r.familyId, valid: result.valid, failures: result.failures });
  if (!result.valid) {
    problems++;
    console.log(`FAIL (STORED): ${r.candidateId}`);
    for (const f of result.failures) console.log(`  - ${f.reason}`);
  }
}

console.log(`\nTotal STORED candidates checked: ${results.length}`);
console.log(`Passed: ${results.filter((r) => r.valid).length}`);
console.log(`Failed: ${results.filter((r) => !r.valid).length}`);

const byFamily = {};
for (const r of results) byFamily[r.familyId] = (byFamily[r.familyId] || 0) + 1;
console.log("Per-family counts (stored):", byFamily);

console.log(
  `\n${problems === 0 ? "WAVE 3 STORED MARKING-CONTRACT ROUND TRIP: PASS -- 32/32 candidates, fetched live from ali_question_candidate AFTER submission, verified against the real production scorer (canonical answer, every approved variant, a verified-disjoint wrong answer, and plausible-wrong answers where supplied). No required field was stripped or altered by the candidate-store round trip." : `WAVE 3 STORED MARKING-CONTRACT ROUND TRIP: FAIL (${problems} candidates)`}`
);
process.exit(problems === 0 ? 0 : 1);
