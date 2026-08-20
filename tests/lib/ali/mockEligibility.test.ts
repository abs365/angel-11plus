import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { isMockEligibleCandidate, MOCK_ELIGIBLE_STATUS, type MockEligibilityCandidate } from "../../../lib/ali/mockEligibility";

/**
 * Mock Programme Increment 003 — the per-item Mock-eligibility gate.
 * Mirrors fetchMockEligibleQuestionBank()'s own four real conditions
 * exactly (subject, pathway, eligibility_status, active), extracted into
 * a pure function so it is directly testable without a Supabase client.
 */

const base: MockEligibilityCandidate = {
  eligibilityStatus: MOCK_ELIGIBLE_STATUS,
  active: true,
  subject: "maths",
  pathway: ["csse"],
};

test("MOCK_ELIGIBLE_STATUS is exactly 'mock_eligible' -- the one real, live value fetchMockEligibleQuestionBank() also filters on", () => {
  assert.equal(MOCK_ELIGIBLE_STATUS, "mock_eligible");
});

test("mock_eligible + active + subject match + pathway match: eligible", () => {
  assert.equal(isMockEligibleCandidate(base, "maths", "csse"), true);
});

test("practice_eligible does NOT imply Mock eligibility", () => {
  assert.equal(isMockEligibleCandidate({ ...base, eligibilityStatus: "practice_eligible" }, "maths", "csse"), false);
});

test("provisional content cannot qualify", () => {
  assert.equal(isMockEligibleCandidate({ ...base, eligibilityStatus: "provisional" }, "maths", "csse"), false);
});

test("authentic_assessment_candidate (author-disclosed, not yet independently reviewed) cannot qualify", () => {
  assert.equal(isMockEligibleCandidate({ ...base, eligibilityStatus: "authentic_assessment_candidate" }, "maths", "csse"), false);
});

test("independently_validated (item-level review passed, but the separate pool-level Mock-Eligible gate has not yet been cleared) cannot qualify", () => {
  assert.equal(isMockEligibleCandidate({ ...base, eligibilityStatus: "independently_validated" }, "maths", "csse"), false);
});

test("rejected/never-promoted content cannot qualify -- modelled as an item whose eligibility_status never advanced past independently_validated, exactly how this codebase's own non-self-certifying discipline represents a real rejection (no distinct 'rejected' status exists on ali_question_bank itself)", () => {
  assert.equal(isMockEligibleCandidate({ ...base, eligibilityStatus: "independently_validated" }, "maths", "csse"), false);
});

test("unreviewed content (no eligibility_status at all) cannot qualify", () => {
  assert.equal(isMockEligibleCandidate({ ...base, eligibilityStatus: null }, "maths", "csse"), false);
  assert.equal(isMockEligibleCandidate({ ...base, eligibilityStatus: undefined }, "maths", "csse"), false);
});

test("inactive content cannot qualify even at mock_eligible status", () => {
  assert.equal(isMockEligibleCandidate({ ...base, active: false }, "maths", "csse"), false);
  assert.equal(isMockEligibleCandidate({ ...base, active: null }, "maths", "csse"), false);
});

test("wrong subject cannot qualify -- Mathematics content is not English Mock content, and neither is Vocabulary/Reasoning content for either", () => {
  assert.equal(isMockEligibleCandidate(base, "english", "csse"), false);
  assert.equal(isMockEligibleCandidate({ ...base, subject: "vocabulary" }, "vocabulary", "csse"), true, "a known AliSubject value, even if not a real CSSE Mock component, is not this predicate's job to exclude -- see the module's own documented scope");
  assert.equal(isMockEligibleCandidate({ ...base, subject: "vocabulary" }, "maths", "csse"), false);
});

test("pathway mismatch cannot qualify -- csse-eligible content is not automatically eligible for a gl/cem/iseb pathway's Mock", () => {
  assert.equal(isMockEligibleCandidate({ ...base, pathway: ["gl"] }, "maths", "csse"), false);
  assert.equal(isMockEligibleCandidate({ ...base, pathway: ["gl", "csse"] }, "maths", "csse"), true);
});

test("Mathematics and English remain subject-distinct through this gate -- a maths-eligible row is never english-eligible and vice versa", () => {
  const englishRow: MockEligibilityCandidate = { ...base, subject: "english" };
  assert.equal(isMockEligibleCandidate(englishRow, "maths", "csse"), false);
  assert.equal(isMockEligibleCandidate(englishRow, "english", "csse"), true);
  assert.equal(isMockEligibleCandidate(base, "english", "csse"), false);
});

test("agrees with fetchMockEligibleQuestionBank()'s own four documented conditions (lib/ali/questionBank.ts) -- cross-checked directly against that function's own query chain, not merely asserted", () => {
  const src = fs.readFileSync("lib/ali/questionBank.ts", "utf8");
  const fn = src.match(/export async function fetchMockEligibleQuestionBank\([\s\S]*?\n}/)![0];
  assert.match(fn, /\.eq\("subject", subject\)/);
  assert.match(fn, /\.contains\("pathway", \[pathway\]\)/);
  assert.match(fn, /\.eq\("eligibility_status", "mock_eligible"\)/);
  assert.match(fn, /\.eq\("active", true\)/);
});
