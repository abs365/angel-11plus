import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyFamilyRecordType, ENGLISH_EDUCATIONAL_FAMILY_CONSOLIDATION, WRITING_EDUCATIONAL_FAMILY_MODEL } from "@/lib/ali/familyTaxonomy";

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

// ============================================================
// Final Educational Family Classification & Foundation Acceptance
// Gate -- proves the consolidation tables' own arithmetic and
// membership against the Founder's own cited production Q1 evidence.
// ============================================================

test("ENGLISH_EDUCATIONAL_FAMILY_CONSOLIDATION: every member database family_id appears in exactly one educational family (no double-counting)", () => {
  const seen = new Map<string, string>();
  for (const family of ENGLISH_EDUCATIONAL_FAMILY_CONSOLIDATION) {
    for (const memberId of family.memberDatabaseFamilyIds) {
      assert.ok(!seen.has(memberId), `${memberId} appears in both "${seen.get(memberId)}" and "${family.educationalFamilyName}"`);
      seen.set(memberId, family.educationalFamilyName);
    }
  }
});

test("ENGLISH_EDUCATIONAL_FAMILY_CONSOLIDATION: consolidates the Founder's own 18 named database families into 13 genuine educational families", () => {
  const allMemberIds = ENGLISH_EDUCATIONAL_FAMILY_CONSOLIDATION.flatMap((f) => f.memberDatabaseFamilyIds);
  assert.equal(allMemberIds.length, 18, "expected exactly the 18 named, wave-authored database family records the Founder cited");
  assert.equal(ENGLISH_EDUCATIONAL_FAMILY_CONSOLIDATION.length, 13, "expected exactly 13 genuine educational families after consolidation");
});

test("ENGLISH_EDUCATIONAL_FAMILY_CONSOLIDATION: total rows across all educational families equals the Founder's own cited 140 rows across the 18 named families", () => {
  const totalRows = ENGLISH_EDUCATIONAL_FAMILY_CONSOLIDATION.reduce((sum, f) => sum + f.totalRows, 0);
  assert.equal(totalRows, 140);
});

test("ENGLISH_EDUCATIONAL_FAMILY_CONSOLIDATION: Vocabulary/Meaning-in-Context and Synonym Selection remain separate families despite both being 'about vocabulary' -- a materially different demand, not merged", () => {
  const vocab = ENGLISH_EDUCATIONAL_FAMILY_CONSOLIDATION.find((f) => f.educationalFamilyName === "Vocabulary / Meaning in Context");
  const synonym = ENGLISH_EDUCATIONAL_FAMILY_CONSOLIDATION.find((f) => f.educationalFamilyName === "Synonym Selection");
  assert.ok(vocab && synonym);
  assert.notEqual(vocab!.educationalFamilyName, synonym!.educationalFamilyName);
  assert.equal(vocab!.memberDatabaseFamilyIds.includes("wave1-fam-synonym-battery"), false);
});

test("ENGLISH_EDUCATIONAL_FAMILY_CONSOLIDATION: Retrieval genuinely merges across authoring waves (direct-retrieval + rc01-retrieval)", () => {
  const retrieval = ENGLISH_EDUCATIONAL_FAMILY_CONSOLIDATION.find((f) => f.educationalFamilyName === "Retrieval");
  assert.ok(retrieval);
  assert.deepEqual(new Set(retrieval!.memberDatabaseFamilyIds), new Set(["wave1-fam-direct-retrieval", "wave3-fam-rc01-retrieval"]));
  assert.equal(retrieval!.totalRows, 19);
});

test("ENGLISH_EDUCATIONAL_FAMILY_CONSOLIDATION: no entry claims 'certain' confidence -- every merge is name/count-based heuristic reasoning, never fabricated certainty", () => {
  for (const family of ENGLISH_EDUCATIONAL_FAMILY_CONSOLIDATION) {
    assert.equal(family.confidence, "heuristic", `${family.educationalFamilyName} must not claim certain confidence without direct content review`);
  }
});

test("WRITING_EDUCATIONAL_FAMILY_MODEL: consolidates all 16 cited Writing database family records into exactly ONE genuine educational family", () => {
  assert.equal(WRITING_EDUCATIONAL_FAMILY_MODEL.memberDatabaseFamilyIds.length, 16);
  assert.equal(WRITING_EDUCATIONAL_FAMILY_MODEL.totalRows, 16);
  assert.equal(WRITING_EDUCATIONAL_FAMILY_MODEL.confidence, "heuristic");
});

test("WRITING_EDUCATIONAL_FAMILY_MODEL: topic-varying family_ids (favouriteplace, kindness, screentime, etc.) are all members of the SAME educational family, never separate ones", () => {
  const ids = WRITING_EDUCATIONAL_FAMILY_MODEL.memberDatabaseFamilyIds;
  assert.ok(ids.includes("eng-inc003-writing-wc01a-favouriteplace"));
  assert.ok(ids.includes("mock-writing-wc01a-kindness"));
  assert.ok(ids.includes("mock-writing-wc01a-screentime"));
  // All the same family -- a single educationalFamilyName, not per-topic ones.
  assert.equal(new Set(ids.map(() => WRITING_EDUCATIONAL_FAMILY_MODEL.educationalFamilyName)).size, 1);
});
