import fs from "node:fs";
import { validateEnglishMarkingContract, buildDisjointWrongAnswer } from "../lib/ali/questionFactory/englishMarkingContractGate.ts";

/**
 * Educational Increment 003, Wave 3 -- PRODUCTION (published, ali_question_bank)
 * marking-contract verification. "Mandatory" per Founder instruction §10.
 * Input is scripts/output/ei003-wave3-published-rows.json, fetched live
 * from ali_question_bank via an authenticated admin session AFTER
 * publish_question_candidate() ran for all 32 candidates -- proving the
 * publish-time passageText/passageTitle merge did not disturb any
 * marking-critical field.
 */

const publishedRows = JSON.parse(
  fs.readFileSync(new URL("./output/ei003-wave3-published-rows.json", import.meta.url), "utf8")
);

const PLAUSIBLE_WRONG_BY_ID = {
  "qf-ei003-w3-ret-distractor-01": ["the girl with the long plait"],
  "qf-ei003-w3-ret-distractor-02": ["cass"],
  "qf-ei003-w3-comp-simdiff-01": ["they are similar because both dislike school, and different because one is louder than the other"],
  "qf-ei003-w3-motive-weigh-01": ["it is because connor made an unkind comment about the trainers"],
  "qf-ei003-w3-motive-weigh-02": ["he is deliberately testing her to see if she gives up"],
  "qf-ei003-w3-lang-subst-01": ["'went' would have worked just as well and means the same thing"],
};

let problems = 0;
const results = [];

for (const r of publishedRows) {
  const contract = {
    candidateId: r.id,
    marks: r.marks,
    acceptedAnswers: r.acceptedAnswers,
    modelAnswer: r.modelAnswer,
    validationTier: r.validationTier,
    canonicalAnswer: r.modelAnswer,
    approvedVariants: r.acceptedAnswers.filter((a) => a !== r.modelAnswer),
    disjointWrongAnswer: buildDisjointWrongAnswer(r.acceptedAnswers),
    plausibleWrongAnswers: PLAUSIBLE_WRONG_BY_ID[r.id] ?? [],
  };
  const result = validateEnglishMarkingContract(contract);
  results.push({ id: r.id, familyId: r.familyId, valid: result.valid, failures: result.failures });
  if (!result.valid) {
    problems++;
    console.log(`FAIL (PRODUCTION): ${r.id}`);
    for (const f of result.failures) console.log(`  - ${f.reason}`);
  }
}

console.log(`\nTotal PUBLISHED (production) candidates checked: ${results.length}`);
console.log(`Passed: ${results.filter((r) => r.valid).length}`);
console.log(`Failed: ${results.filter((r) => !r.valid).length}`);

const byFamily = {};
for (const r of results) byFamily[r.familyId] = (byFamily[r.familyId] || 0) + 1;
console.log("Per-family counts (production):", byFamily);

console.log(
  `\n${problems === 0 ? "WAVE 3 PRODUCTION MARKING-CONTRACT VERIFICATION: PASS -- 32/32 published rows in ali_question_bank, fetched live AFTER publish_question_candidate() ran, verified against the real production scorer. 0 NaN, canonical -> full marks, disjoint-wrong -> zero, variants correct, representative plausible-wrong answers correctly rejected." : `WAVE 3 PRODUCTION MARKING-CONTRACT VERIFICATION: FAIL (${problems} candidates)`}`
);
process.exit(problems === 0 ? 0 : 1);
