import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveAmendmentVerificationEligibleTargets, ORIGINAL_CONTENT_REVIEW_TYPES, type FamilyReviewHistoryRow } from "../../lib/adminReview";

/**
 * Decision 256, §6 — Decision 255 recorded "An Invented Place"'s formal
 * review (`family_id = "eng-inc003-writing-wc01a-imaginedplace"`, see
 * app/admin-beta/review/page.tsx's FAMILY_TITLE map) as
 * `approved_with_amendment` in `public.ali_family_review`. Decision 251's
 * existing generic eligibility rule (`deriveAmendmentVerificationEligibleTargets`)
 * must recognise this Writing target as eligible from that row alone —
 * with zero code change to the eligibility function itself — while never
 * submitting a verification or rewriting the original decision.
 *
 * A genuinely live read against `public.ali_family_review` was attempted
 * (read-only, anon key) during this decision's implementation and
 * returned 200 with an empty result set for every query tried (no
 * filter, family_id filter, review_target_type filter) — consistent with
 * this table's anon-key SELECT policy being RLS-restricted, not with the
 * table being empty (extensive prior decision history depends on rows
 * existing here). Live confirmation therefore requires a service-role
 * credential this environment does not have; these tests instead prove
 * the eligibility LOGIC is correct against a synthetic row shaped exactly
 * like the one Decision 255 describes, honestly labelled as such.
 */

const INVENTED_PLACE_FAMILY_ID = "eng-inc003-writing-wc01a-imaginedplace";

function row(overrides: Partial<FamilyReviewHistoryRow>): FamilyReviewHistoryRow {
  return {
    family_id: INVENTED_PLACE_FAMILY_ID,
    review_type: "mock_writing_prompt_independent_review",
    decision: "approved_with_amendment",
    reviewer: "founder",
    notes: "Amendment required: checklist too prescriptive for authentic assessment presentation.",
    created_at: "2026-08-30T00:00:00Z",
    review_target_type: "writing_prompt",
    ...overrides,
  };
}

test("SYNTHETIC (no live DB read available): An Invented Place's approved_with_amendment decision makes it eligible for amendment verification, using the existing Decision 251 rule unmodified", () => {
  assert.ok(ORIGINAL_CONTENT_REVIEW_TYPES.includes("mock_writing_prompt_independent_review"));
  const eligible = deriveAmendmentVerificationEligibleTargets([row({})]);
  assert.equal(eligible.length, 1);
  assert.equal(eligible[0].id, INVENTED_PLACE_FAMILY_ID);
  assert.equal(eligible[0].reviewTargetType, "writing_prompt");
});

test("SYNTHETIC: the three plain-'approved' targets (Pepper's Breakfast, Compass Rose, Salmon) are NOT eligible for amendment verification", () => {
  const rows: FamilyReviewHistoryRow[] = [
    row({ family_id: INVENTED_PLACE_FAMILY_ID, decision: "approved_with_amendment" }),
    row({ family_id: "eng-inc003-peppersbreakfast", decision: "approved", review_target_type: "passage" }),
    row({ family_id: "eng-inc003-compassrosechallenge", decision: "approved", review_target_type: "passage" }),
    row({ family_id: "eng-inc003-salmonnavigation", decision: "approved", review_target_type: "passage" }),
  ];
  const eligible = deriveAmendmentVerificationEligibleTargets(rows);
  const eligibleIds = eligible.map((e) => e.id);
  assert.deepEqual(eligibleIds, [INVENTED_PLACE_FAMILY_ID]);
});

test("SYNTHETIC: deriving eligibility is read-only and additive — it does not mutate or remove the input row, and produces no side effect a caller could mistake for a submission", () => {
  const input = [row({})];
  const before = JSON.stringify(input);
  deriveAmendmentVerificationEligibleTargets(input);
  assert.equal(JSON.stringify(input), before);
});
