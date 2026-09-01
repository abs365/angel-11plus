import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { deriveAmendmentVerificationEligibleTargets, type FamilyReviewHistoryRow } from "../../lib/adminReview";

/**
 * Decision 261A — Founder production inspection of the amendment-
 * verification journey for "An Invented Place" found the decision
 * interaction itself (not just the disclosure banner Decision 260/the
 * IMPORTANT FRONTEND BASELINE increment already fixed) still presented
 * the ordinary four formal educational review decisions and their
 * Practice-activation hint text, semantically indistinguishable from a
 * fresh educational review. These tests prove, from source, that
 * `ReviewForm` now renders a dedicated two-option VERIFIED / NOT YET
 * VERIFIED control for `reviewType === "amendment_verification"` only,
 * that the four formal decisions remain completely unchanged and
 * reachable for every other review type, that the mapping onto the
 * existing `family_review_decision` enum matches Decision 235's own
 * documented journey (never a new database value), and that a target
 * already carrying a recorded verification cannot be silently reopened
 * into another submittable form.
 */

const pageSource = fs.readFileSync("app/admin-beta/review/page.tsx", "utf8");

test("AMENDMENT_VERIFICATION_DECISIONS is a dedicated two-option set, mapped onto the existing family_review_decision enum exactly as Decision 235 documented (approved = resolved, requires_revalidation = not resolved)", () => {
  const block = pageSource.match(/const AMENDMENT_VERIFICATION_DECISIONS:[\s\S]*?\];/)![0];
  assert.match(block, /value: "approved", label: "Verified"/);
  assert.match(block, /value: "requires_revalidation", label: "Not yet verified"/);
  // Deliberately absent: neither `approved_with_amendment` nor `rejected`
  // is reachable through this control (an amendment verification never
  // re-amends or rejects the underlying content).
  assert.doesNotMatch(block, /value: "approved_with_amendment"/);
  assert.doesNotMatch(block, /value: "rejected"/);
});

test("the four formal educational decisions (DECISIONS) are completely unchanged -- Decision 261A did not touch the vocabulary real reviews use", () => {
  const block = pageSource.match(/const DECISIONS: \{[\s\S]*?\];/)![0];
  assert.match(block, /value: "approved", label: "Approved"/);
  assert.match(block, /value: "approved_with_amendment", label: "Approved with amendment"/);
  assert.match(block, /value: "requires_revalidation", label: "Requires revalidation"/);
  assert.match(block, /value: "rejected", label: "Rejected"/);
});

test("ReviewForm's decision-button block renders AMENDMENT_VERIFICATION_DECISIONS for amendment_verification and DECISIONS for every other review type -- both sets present in the same, single control, never duplicated", () => {
  const formBlock = pageSource.match(/\{\(reviewType === "amendment_verification" \? AMENDMENT_VERIFICATION_DECISIONS : DECISIONS\)\.map/);
  assert.ok(formBlock, "expected exactly one decision-button control switching between the two vocabularies by reviewType");
  // There must be no second, separate .map(...) over DECISIONS inside
  // ReviewForm's own render (the two teaching-review forms further down
  // the file have their own independent DECISIONS.map blocks -- this
  // assertion only pins down that ReviewForm itself was not left with a
  // second, stale, always-four-option control alongside the new one).
  const reviewFormBody = pageSource.slice(pageSource.indexOf("function ReviewForm("), pageSource.indexOf("function MathsTeachingReviewForm("));
  const decisionsMapCount = (reviewFormBody.match(/DECISIONS\)\.map\(\(d\) =>|DECISIONS\.map\(\(d\) =>/g) ?? []).length;
  assert.equal(decisionsMapCount, 1);
});

test("the ~18-criterion questionnaire is hidden for amendment_verification, so a verifier is not made to re-answer the original review's own criteria", () => {
  assert.match(pageSource, /\{reviewType !== "amendment_verification" && \(\s*<div className="space-y-2">\s*\{criteria\.map/);
});

test("a target already carrying a recorded verification renders an explicit confirmation gate, not the submittable form, until the reviewer deliberately opts in", () => {
  assert.match(pageSource, /existingStatus\?\.reviewed && !amendmentReverifyConfirmed/);
  assert.match(pageSource, /Record another verification anyway/);
  assert.match(pageSource, /onClick=\{\(\) => setAmendmentReverifyConfirmed\(true\)\}/);
});

test("opening a (possibly different) amendment-verification target from the list always resets the confirmation gate -- it is never left true from a previous target", () => {
  assert.match(pageSource, /onOpen=\{\(target\) => \{ setAmendmentReverifyConfirmed\(false\); setSelectedAmendmentVerification\(target\); \}\}/);
});

test("submitAmendmentVerification's own dispatch and additive-only insert are unchanged by Decision 261A -- the UI relabels the vocabulary, it does not touch persistence", () => {
  assert.match(pageSource, /reviewType === "amendment_verification" \? await submitAmendmentVerification\(submissionToSend\)/);
  const libSource = fs.readFileSync("lib/adminReview.ts", "utf8");
  const fnBlock = libSource.match(/export async function submitAmendmentVerification[\s\S]*?\n\}/)![0];
  assert.match(fnBlock, /review_type: "amendment_verification"/);
  // Exactly one .insert( call -- additive only, never an update to any
  // other row.
  assert.equal((fnBlock.match(/\.insert\(/g) ?? []).length, 1);
  assert.doesNotMatch(fnBlock, /\.update\(/);
});

test("multiple historical reviews for one family: the LATEST decision (by created_at, not array order) determines amendment-verification eligibility", () => {
  const familyId = "test-multi-history-family";
  const base: Omit<FamilyReviewHistoryRow, "decision" | "created_at"> = {
    family_id: familyId, review_type: "mock_writing_prompt_independent_review",
    reviewer: "reviewer", notes: "notes", review_target_type: "writing_prompt",
  };
  // Case 1: an early plain `approved`, superseded by a later
  // `approved_with_amendment` -- eligible, and the earlier row (listed
  // AFTER the later one, proving this isn't merely "first/last in the
  // array") must not suppress it.
  const supersededToAmendment: FamilyReviewHistoryRow[] = [
    { ...base, decision: "approved_with_amendment", created_at: "2026-08-20T00:00:00Z" },
    { ...base, decision: "approved", created_at: "2026-08-01T00:00:00Z" },
  ];
  const eligible1 = deriveAmendmentVerificationEligibleTargets(supersededToAmendment);
  assert.deepEqual(eligible1.map((t) => t.id), [familyId]);

  // Case 2: the reverse -- an early `approved_with_amendment` superseded
  // by a later plain `approved` (e.g. a fresh formal re-review that
  // resolved it directly) -- no longer eligible, even though an
  // `approved_with_amendment` row still exists in history.
  const supersededToApproved: FamilyReviewHistoryRow[] = [
    { ...base, decision: "approved", created_at: "2026-08-20T00:00:00Z" },
    { ...base, decision: "approved_with_amendment", created_at: "2026-08-01T00:00:00Z" },
  ];
  const eligible2 = deriveAmendmentVerificationEligibleTargets(supersededToApproved);
  assert.deepEqual(eligible2.map((t) => t.id), []);
});
