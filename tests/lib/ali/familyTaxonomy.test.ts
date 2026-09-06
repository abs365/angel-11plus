import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyFamilyRecordType } from "@/lib/ali/familyTaxonomy";

/**
 * Educational Foundation Completion Standard, Section 3/4 -- applies the
 * deterministic taxonomy classifier to the Founder's OWN cited real Q1
 * evidence examples (from the live English Q1 diagnostic), never
 * fabricated data. This is a demonstration of the classifier's logic
 * against known real family_ids -- a full application to all 80 English
 * records requires the complete Q1 result set, which this session does
 * not have (see the Educational Foundation Completion Report, Section B).
 */

test("Founder-cited wave-authored English families (broad practice groupings) classify as educational_family, heuristic confidence", () => {
  const examples = [
    { familyId: "wave1-fam-vocab-explain", rowCount: 17 },
    { familyId: "wave1-fam-sequencing", rowCount: 15 },
    { familyId: "wave1-fam-direct-retrieval", rowCount: 14 },
    { familyId: "wave1-fam-quote-explain", rowCount: 13 },
    { familyId: "wave1-fam-synonym-battery", rowCount: 11 },
    { familyId: "wave1-fam-emotion-cause", rowCount: 11 },
  ];
  for (const ex of examples) {
    const result = classifyFamilyRecordType({ familyId: ex.familyId, subject: "english", rowCount: ex.rowCount, productionEligible: true });
    assert.equal(result.type, "educational_family", `${ex.familyId} should classify as educational_family`);
    assert.equal(result.confidence, "heuristic", "naming-pattern classification must never claim certain confidence");
  }
});

test("Founder-cited single/few-row assessment-oriented English IDs (eng-inc*, eng-pc*, mock-*) do NOT classify as educational_family", () => {
  const examples = ["eng-inc003-writing-imaginedplace", "eng-pc005-writing-personinfluence", "mock-writing-wc01a-newplace"];
  for (const familyId of examples) {
    const result = classifyFamilyRecordType({ familyId, subject: "english", rowCount: 1, productionEligible: true });
    assert.notEqual(result.type, "educational_family", `${familyId} must not be counted as educational depth merely because a family_id exists`);
  }
});

test("every real Writing family classifies as task_prompt_group, never educational_family, matching the disclosed WRITING_TEACHING_CONTRACT gap", () => {
  const result = classifyFamilyRecordType({ familyId: "mock-writing-wc01a-mistakelearned", subject: "writing", rowCount: 1, productionEligible: true });
  assert.equal(result.type, "task_prompt_group");
  assert.equal(result.confidence, "heuristic");
});

test("Mathematics families classify as educational_family with 'certain' confidence only when a real status check accompanied the call", () => {
  const withStatusCheck = classifyFamilyRecordType({ familyId: "mr03-angle-sum", subject: "maths", rowCount: 7, productionEligible: true, statusesPresent: ["practice_eligible"] });
  assert.equal(withStatusCheck.type, "educational_family");
  assert.equal(withStatusCheck.confidence, "certain");

  const withoutStatusCheck = classifyFamilyRecordType({ familyId: "mr03-angle-sum", subject: "maths", rowCount: 7, productionEligible: true });
  assert.equal(withoutStatusCheck.confidence, "heuristic", "no confidence upgrade without a real accompanying evidence check");
});

test("classification never fabricates certainty for an unmatched pattern -- falls back to unclassified", () => {
  const result = classifyFamilyRecordType({ familyId: "unrecognisable-pattern-9000", subject: "english", rowCount: 9, productionEligible: false });
  assert.equal(result.type, "unclassified");
});

test("a changed passage or a changed Writing topic alone does not fabricate a new educational family -- two differently-named single-row families both classify identically, non-educational", () => {
  const passageA = classifyFamilyRecordType({ familyId: "eng-inc001-passage-a-retrieval", subject: "english", rowCount: 1, productionEligible: true });
  const passageB = classifyFamilyRecordType({ familyId: "eng-inc002-passage-b-retrieval", subject: "english", rowCount: 1, productionEligible: true });
  assert.equal(passageA.type, passageB.type);
  assert.notEqual(passageA.type, "educational_family");
});
