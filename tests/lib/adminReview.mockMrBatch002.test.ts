import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  deriveMockMrBatch002ReviewStatus, buildMockMrBatch002NotesPrefix, submitMockMathsIndependentReview,
  MOCK_MR_BATCH002_BATCH_MARKER, MOCK_MR_BATCH002_FAMILIES, MOCK_MR_BATCH002_TARGET_IDS,
  MOCK_MR_BATCH001_TARGET_IDS,
  type SevenXReviewRow, type ReviewSubmission,
} from "@/lib/adminReview";

/**
 * Mock Programme Increment 004, Batch 002, Review Governance (Decision
 * 145). Mirrors tests/lib/adminReview.mockMrBatch001.test.ts's own
 * established pattern exactly, for the same review-surface architecture,
 * reused (not rebuilt) for a second batch.
 */

function row(overrides: Partial<SevenXReviewRow>): SevenXReviewRow {
  return {
    family_id: "mock-mr04-percentchange",
    review_type: "mock_maths_independent_review",
    decision: "pending_independent_review",
    notes: null,
    reviewer: "UNASSIGNED",
    ...overrides,
  };
}

test("MOCK_MR_BATCH002_TARGET_IDS covers exactly the 10 target families migration 092 creates, no more no less, and is disjoint from Batch 001's own 7", () => {
  assert.deepEqual(new Set(MOCK_MR_BATCH002_TARGET_IDS), new Set([
    "mock-mr04-percentchange", "mock-mr04-reversepercent",
    "mock-mr06-sumdiff", "mock-mr06-multiplerelation",
    "mock-mr07-triangleanglesum", "mock-mr07-isoscelesproperty",
    "mock-mr10-forwardschedule", "mock-mr10-reverseschedule",
    "mock-mr11-truefalsejudgement", "mock-mr11-propertysearch",
  ]));
  assert.equal(MOCK_MR_BATCH002_FAMILIES.length, 10);
  for (const f of MOCK_MR_BATCH002_TARGET_IDS) assert.ok(!MOCK_MR_BATCH001_TARGET_IDS.includes(f), `${f} collides with a Batch 001 family`);
});

test("exactly the 20 question IDs from migration 091 appear across MOCK_MR_BATCH002_FAMILIES, matching migration 091 exactly", () => {
  const expected = [
    "mock-mr04-percentchange-01", "mock-mr04-percentchange-02",
    "mock-mr04-reversepercent-01", "mock-mr04-reversepercent-02",
    "mock-mr06-sumdiff-01", "mock-mr06-sumdiff-02",
    "mock-mr06-multiplerelation-01", "mock-mr06-multiplerelation-02",
    "mock-mr07-triangleanglesum-01", "mock-mr07-triangleanglesum-02",
    "mock-mr07-isoscelesproperty-01", "mock-mr07-isoscelesproperty-02",
    "mock-mr10-forwardschedule-01", "mock-mr10-forwardschedule-02",
    "mock-mr10-reverseschedule-01", "mock-mr10-reverseschedule-02",
    "mock-mr11-truefalsejudgement-01", "mock-mr11-truefalsejudgement-02",
    "mock-mr11-propertysearch-01", "mock-mr11-propertysearch-02",
  ];
  const actual = MOCK_MR_BATCH002_FAMILIES.flatMap((f) => f.newQuestionIds);
  assert.equal(actual.length, 20);
  assert.deepEqual(new Set(actual), new Set(expected));
  for (const f of MOCK_MR_BATCH002_FAMILIES) assert.ok(!f.reclassified || f.reclassified.length === 0, "every Batch 002 question is genuinely new, none reclassified");
});

test("an approved content_review row for the same family_id does NOT satisfy Batch 002 review status -- different review_type entirely", () => {
  const rows: SevenXReviewRow[] = [
    row({ review_type: "content_review", decision: "approved", notes: "Some unrelated content review, same family_id, different review_type." }),
  ];
  const status = deriveMockMrBatch002ReviewStatus(rows, MOCK_MR_BATCH002_TARGET_IDS);
  assert.equal(status.get("mock-mr04-percentchange")!.reviewed, false);
});

test("a Batch 001 approval for a DIFFERENT family (same review_type, no Batch 002 marker) does NOT satisfy Batch 002 review status -- the notes marker, not just the review_type, distinguishes the two batches", () => {
  const rows: SevenXReviewRow[] = [
    row({ family_id: "mock-mr04-percentchange", decision: "approved", notes: "MOCK-INC004-BATCH001 new content review: mock-mr02-invdiv-01..03 (Question IDs: mock-mr02-invdiv-01, mock-mr02-invdiv-02, mock-mr02-invdiv-03)" }),
  ];
  const status = deriveMockMrBatch002ReviewStatus(rows, MOCK_MR_BATCH002_TARGET_IDS);
  assert.equal(status.get("mock-mr04-percentchange")!.reviewed, false, "a Batch 001 marker must never satisfy Batch 002 status, even under the same review_type");
});

test("a genuine mock_maths_independent_review approval for Batch 002, carrying the real notes marker migration 092 writes, IS correctly recognised", () => {
  const notes = `${buildMockMrBatch002NotesPrefix("mock-mr04-percentchange", ["mock-mr04-percentchange-01", "mock-mr04-percentchange-02"])}\n\nReviewer qualification: 11+ tutoring experience.\n\nLooks sound.`;
  const rows: SevenXReviewRow[] = [row({ decision: "approved", notes, reviewer: "A Real Reviewer" })];
  const status = deriveMockMrBatch002ReviewStatus(rows, MOCK_MR_BATCH002_TARGET_IDS);
  assert.equal(status.get("mock-mr04-percentchange")!.reviewed, true);
  assert.equal(status.get("mock-mr04-percentchange")!.decision, "approved");
});

test("duplicate pending mock_maths_independent_review placeholders for Batch 002 collapse to one status per family, not duplicate cards", () => {
  const notes = `${MOCK_MR_BATCH002_BATCH_MARKER} new content review: mock-mr04-percentchange-01..02 (Question IDs: mock-mr04-percentchange-01, mock-mr04-percentchange-02)`;
  const rows: SevenXReviewRow[] = [row({ decision: "pending_independent_review", notes }), row({ decision: "pending_independent_review", notes })];
  const status = deriveMockMrBatch002ReviewStatus(rows, MOCK_MR_BATCH002_TARGET_IDS);
  assert.equal(status.size, MOCK_MR_BATCH002_TARGET_IDS.length);
  assert.equal(status.get("mock-mr04-percentchange")!.reviewed, false);
});

test("buildMockMrBatch002NotesPrefix names exactly the given question IDs and the Batch 002 marker (never the Batch 001 marker), nothing implied beyond them", () => {
  const ids = ["mock-mr11-propertysearch-01", "mock-mr11-propertysearch-02"];
  const prefix = buildMockMrBatch002NotesPrefix("mock-mr11-propertysearch", ids);
  for (const id of ids) assert.ok(prefix.includes(id));
  assert.ok(prefix.includes(MOCK_MR_BATCH002_BATCH_MARKER));
  assert.ok(!prefix.includes("BATCH001"));
});

function emptySubmission(overrides: Partial<ReviewSubmission> = {}): ReviewSubmission {
  return {
    reviewTargetType: "question_family", targetId: "mock-mr04-percentchange", reviewer: "", qualificationBasis: "",
    decision: null, notes: "", evidenceReference: "", provenanceReference: "",
    educationalValidity: null, competencyValidity: null, wordingQuality: null, ageAppropriate: null,
    ambiguityFree: null, difficultyAppropriate: null, misconceptionQuality: null, explanationQuality: null,
    variationBoundariesSound: null, authenticityConfirmed: null, questionTypeAlignment: null,
    answerCorrectnessVerified: null, transferValidity: null, teachingQuality: null, examStrategyQuality: null,
    validationBehaviourSound: null, originalityConfirmed: null, copyrightRiskClear: null,
    ...overrides,
  };
}

test("submitMockMathsIndependentReview (reused unchanged for Batch 002) still rejects an empty reviewer name and a missing decision before any network call", async () => {
  const missingReviewer = await submitMockMathsIndependentReview(emptySubmission({ reviewer: "", decision: "approved", qualificationBasis: "11+ experience" }));
  assert.ok(missingReviewer.error);
  assert.match(missingReviewer.error!, /reviewer name is required/i);

  const missingDecision = await submitMockMathsIndependentReview(emptySubmission({ reviewer: "A Real Reviewer", qualificationBasis: "11+ tutoring experience", decision: null }));
  assert.ok(missingDecision.error);
  assert.match(missingDecision.error!, /choose a decision/i);
});

test("review submission cannot modify eligibility_status: submitMockMathsIndependentReview's own source only ever inserts into ali_family_review", () => {
  const src = fs.readFileSync("lib/adminReview.ts", "utf8");
  const fn = src.match(/export async function submitMockMathsIndependentReview\([\s\S]*?\n}/)![0];
  assert.match(fn, /\.from\("ali_family_review"\)\.insert\(/);
  assert.ok(!fn.includes("ali_question_bank"));
  assert.ok(!fn.includes("ali_mock_form"));
  assert.ok(!fn.includes("eligibility_status"));
});

test("MOCK_MR_BATCH002_FAMILIES config never mentions promoting content to independently_validated or mock_eligible -- disclosure-only, no activation implied", () => {
  const configText = JSON.stringify(MOCK_MR_BATCH002_FAMILIES);
  assert.ok(!configText.includes("independently_validated"));
  assert.ok(!configText.includes("mock_eligible"));
});
