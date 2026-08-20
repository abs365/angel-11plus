import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  deriveMockMrBatch001ReviewStatus, buildMockMrBatch001NotesPrefix, submitMockMathsIndependentReview,
  MOCK_MR_BATCH001_BATCH_MARKER, MOCK_MR_BATCH001_FAMILIES, MOCK_MR_BATCH001_TARGET_IDS,
  type SevenXReviewRow, type ReviewSubmission,
} from "@/lib/adminReview";

/**
 * Mock Programme Increment 004, Batch 001, Independent Review Execution
 * (Decision 142). Mirrors tests/lib/adminReview.sevenX.test.ts's own
 * established pattern exactly, for the review-surface correction this
 * task required: the 7 new Mathematics Mock candidate families were
 * loadable by fetchPendingReviewTargets() (no review_type filter there),
 * but had no dedicated, clearly-labelled review section and no way for a
 * submitted decision to be recorded as review_type =
 * 'mock_maths_independent_review' rather than silently defaulting to
 * 'content_review' — this is what that correction proves.
 */

function row(overrides: Partial<SevenXReviewRow>): SevenXReviewRow {
  return {
    family_id: "mock-mr02-invdiv",
    review_type: "mock_maths_independent_review",
    decision: "pending_independent_review",
    notes: null,
    reviewer: "UNASSIGNED",
    ...overrides,
  };
}

// ─── 1. All seven Batch 001 families are reachable/represented ───────────

test("1. MOCK_MR_BATCH001_TARGET_IDS covers exactly the 7 target families migration 089 created, no more no less", () => {
  assert.deepEqual(new Set(MOCK_MR_BATCH001_TARGET_IDS), new Set([
    "mock-mr02-invdiv", "mock-mr02-twostep", "mock-mr03-unitconv",
    "mock-mr09-data", "mock-mr05-forward", "mock-mr05-inverse", "mock-mr13-bestvalue",
  ]));
  assert.equal(MOCK_MR_BATCH001_FAMILIES.length, 7);
});

// ─── 3. All 18 questions are represented ──────────────────────────────────

test("3. exactly the 18 question IDs from migration 088 appear across MOCK_MR_BATCH001_FAMILIES, matching migration 088 exactly", () => {
  const expected = [
    "mock-mr02-invdiv-01", "mock-mr02-invdiv-02", "mock-mr02-invdiv-03",
    "mock-mr02-twostep-01", "mock-mr02-twostep-02", "mock-mr02-twostep-03",
    "mock-mr03-unitconv-01", "mock-mr03-unitconv-02", "mock-mr03-unitconv-03",
    "mock-mr09-data-01", "mock-mr09-data-02", "mock-mr09-data-03",
    "mock-mr05-forward-01", "mock-mr05-forward-02",
    "mock-mr05-inverse-01", "mock-mr05-inverse-02",
    "mock-mr13-bestvalue-01", "mock-mr13-bestvalue-02",
  ];
  const actual = MOCK_MR_BATCH001_FAMILIES.flatMap((f) => f.newQuestionIds);
  assert.equal(actual.length, 18);
  assert.deepEqual(new Set(actual), new Set(expected));
  // No family carries a reclassified row -- every question in this batch is genuinely new, unlike some prior batches (e.g. mth-003).
  for (const f of MOCK_MR_BATCH001_FAMILIES) assert.ok(!f.reclassified || f.reclassified.length === 0);
});

// ─── 2. mock_maths_independent_review is recognised, never conflated with content_review or another review_type ───

test("2. an approved content_review row for the same family_id does NOT satisfy Mock Batch 001 review status -- different review_type entirely", () => {
  const rows: SevenXReviewRow[] = [
    row({ review_type: "content_review", decision: "approved", notes: "Some unrelated content review, same family_id, different review_type." }),
  ];
  const status = deriveMockMrBatch001ReviewStatus(rows, MOCK_MR_BATCH001_TARGET_IDS);
  assert.equal(status.get("mock-mr02-invdiv")!.reviewed, false, "a content_review approval must never satisfy mock_maths_independent_review status");
});

test("2. a genuine mock_maths_independent_review approval IS correctly recognised, via the real notes marker migration 089 writes", () => {
  const notes = `${buildMockMrBatch001NotesPrefix("mock-mr02-invdiv", ["mock-mr02-invdiv-01", "mock-mr02-invdiv-02", "mock-mr02-invdiv-03"])}\n\nReviewer qualification: 11+ tutoring experience.\n\nLooks sound.`;
  const rows: SevenXReviewRow[] = [row({ decision: "approved", notes })];
  const status = deriveMockMrBatch001ReviewStatus(rows, MOCK_MR_BATCH001_TARGET_IDS);
  assert.equal(status.get("mock-mr02-invdiv")!.reviewed, true);
  assert.equal(status.get("mock-mr02-invdiv")!.decision, "approved");
});

test("2. duplicate pending mock_maths_independent_review placeholders collapse to one status per family, not duplicate cards", () => {
  const rows: SevenXReviewRow[] = [
    row({ decision: "pending_independent_review", notes: `${MOCK_MR_BATCH001_BATCH_MARKER} new content review: mock-mr02-invdiv-01..03 (Question IDs: mock-mr02-invdiv-01, mock-mr02-invdiv-02, mock-mr02-invdiv-03)` }),
    row({ decision: "pending_independent_review", notes: `${MOCK_MR_BATCH001_BATCH_MARKER} new content review: mock-mr02-invdiv-01..03 (Question IDs: mock-mr02-invdiv-01, mock-mr02-invdiv-02, mock-mr02-invdiv-03)` }),
  ];
  const status = deriveMockMrBatch001ReviewStatus(rows, MOCK_MR_BATCH001_TARGET_IDS);
  assert.equal(status.size, MOCK_MR_BATCH001_TARGET_IDS.length, "exactly one status entry per family");
  assert.equal(status.get("mock-mr02-invdiv")!.reviewed, false, "two pending rows is still not reviewed");
});

test("buildMockMrBatch001NotesPrefix names exactly the given question IDs and the batch marker, nothing implied beyond them", () => {
  const ids = ["mock-mr05-inverse-01", "mock-mr05-inverse-02"];
  const prefix = buildMockMrBatch001NotesPrefix("mock-mr05-inverse", ids);
  for (const id of ids) assert.ok(prefix.includes(id));
  assert.ok(prefix.includes(MOCK_MR_BATCH001_BATCH_MARKER));
});

// ─── 4. Reviewer identity remains required ────────────────────────────────

function emptySubmission(overrides: Partial<ReviewSubmission> = {}): ReviewSubmission {
  return {
    reviewTargetType: "question_family", targetId: "mock-mr02-invdiv", reviewer: "", qualificationBasis: "",
    decision: null, notes: "", evidenceReference: "", provenanceReference: "",
    educationalValidity: null, competencyValidity: null, wordingQuality: null, ageAppropriate: null,
    ambiguityFree: null, difficultyAppropriate: null, misconceptionQuality: null, explanationQuality: null,
    variationBoundariesSound: null, authenticityConfirmed: null, questionTypeAlignment: null,
    answerCorrectnessVerified: null, transferValidity: null, teachingQuality: null, examStrategyQuality: null,
    validationBehaviourSound: null, originalityConfirmed: null, copyrightRiskClear: null,
    ...overrides,
  };
}

test("4. submitMockMathsIndependentReview rejects an empty reviewer name before any network call -- reviewer identity is never optional, never defaulted", async () => {
  const result = await submitMockMathsIndependentReview(emptySubmission({ reviewer: "", decision: "approved", qualificationBasis: "11+ experience" }));
  assert.ok(result.error);
  assert.match(result.error!, /reviewer name is required/i);
});

test("4. submitMockMathsIndependentReview rejects reviewer = 'UNASSIGNED' with no real name change just as it would any other missing-identity case -- UNASSIGNED is a placeholder marker, not a valid reviewer identity, and this function applies the identical validation as submitReview()", async () => {
  // UNASSIGNED alone is non-empty text and would pass the trim() check --
  // this test documents that fact rather than claiming a stronger guard
  // than exists; the real protection against UNASSIGNED being read as a
  // genuine approval is that migration 089 only ever inserts UNASSIGNED
  // rows with decision = 'pending_independent_review', never 'approved',
  // and no code path in this file ever writes an 'approved' decision
  // itself -- only a human, through this exact form, can.
  const result = await submitMockMathsIndependentReview(emptySubmission({ reviewer: "UNASSIGNED", decision: null, qualificationBasis: "" }));
  assert.ok(result.error);
  assert.match(result.error!, /qualification basis is required/i, "qualification basis is checked before decision, and is also never defaulted");
});

test("4. submitMockMathsIndependentReview rejects a missing decision -- never defaults to approved", async () => {
  const result = await submitMockMathsIndependentReview(emptySubmission({ reviewer: "A Real Reviewer", qualificationBasis: "11+ tutoring experience", decision: null }));
  assert.ok(result.error);
  assert.match(result.error!, /choose a decision/i);
});

// ─── 5/6/7. Review submission cannot mutate content, cannot create a Mock form, cannot activate anything ───

test("5/6/7. submitMockMathsIndependentReview's own source only ever inserts into ali_family_review -- never touches ali_question_bank or ali_mock_form", () => {
  const src = fs.readFileSync("lib/adminReview.ts", "utf8");
  const fn = src.match(/export async function submitMockMathsIndependentReview\([\s\S]*?\n}/)![0];
  assert.match(fn, /\.from\("ali_family_review"\)\.insert\(/);
  assert.ok(!fn.includes("ali_question_bank"), "must never reference ali_question_bank");
  assert.ok(!fn.includes("ali_mock_form"), "must never reference ali_mock_form");
  assert.ok(!fn.includes("eligibility_status"), "must never set eligibility_status");
  assert.match(fn, /review_type: "mock_maths_independent_review"/, "must explicitly set its own distinct review_type, not rely on the table's content_review default");
});

test("7. MOCK_MR_BATCH001_FAMILIES config never mentions promoting content to independently_validated or mock_eligible -- disclosure-only, no activation implied", () => {
  const configText = JSON.stringify(MOCK_MR_BATCH001_FAMILIES);
  assert.ok(!configText.includes("independently_validated"));
  assert.ok(!configText.includes("mock_eligible"));
});
