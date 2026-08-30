import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Decision 253 — English Content Foundation, Increment 003 review-
 * discoverability defect. Migration 168 registered 4 genuine pending rows
 * (3 passages + 1 writing prompt) but the Founder reported them "not
 * displayed" on /admin-beta/review despite Decision 251's own prediction
 * that the generic FullBacklogSection + fetchPendingReviewTargets() path
 * would automatically surface them.
 *
 * Proven root cause (two layered defects, both in the generic-backlog
 * path Decision 251 relied on instead of building a dedicated section,
 * unlike every other increment in this file):
 *
 *  1. DISCOVERABILITY — the 4 rows genuinely ARE fetched (no review_type
 *     filter in fetchPendingReviewTargets(), no exclusion-list match) and
 *     genuinely DO render, but only inside FullBacklogSection: collapsed
 *     by default, generically labelled, at the very bottom of the page
 *     below ~20 other prominent, always-expanded, distinctly-labelled
 *     sections, with no jump-link entry pointing at it.
 *
 *  2. LATENT CORRECTNESS DEFECT — `if (selected) { return <ReviewForm
 *     target={selected} onDone={...} />; }` (the branch FullBacklogSection
 *     opens into) never passed a `reviewType` prop, so ReviewForm's own
 *     `reviewType = "content_review"` default applied and
 *     handleSubmit()'s dispatch would have called the generic
 *     submitReview() (which never sets review_type, taking the column's
 *     'content_review' default) instead of
 *     submitMockEnglishPassageIndependentReview() /
 *     submitMockWritingPromptIndependentReview() — silently misclassifying
 *     the review the moment anyone actually submitted one through this
 *     path, exactly the "must never be conflated" failure mode this file
 *     guards against everywhere else.
 *
 * Both are fixed generically (PendingReviewTarget now carries the row's
 * own review_type; the generic ReviewForm branch passes it through), NOT
 * by hardcoding an Increment-003-specific section — this closes the gap
 * for every future increment that relies on the same generic path, not
 * just this one. Source-text assertions, matching this project's
 * established convention for files with no jsdom test harness (see
 * tests/app/progressCompetencyLabels.test.ts's own docstring).
 */

const libSource = fs.readFileSync("lib/adminReview.ts", "utf8");
const pageSource = fs.readFileSync("app/admin-beta/review/page.tsx", "utf8");

test("page.tsx: none of the 4 Increment 003 target ids appear anywhere except FAMILY_DISPLAY_NAME -- proving no hardcoded exclusion list (PILOT/BATCH2-4/SEVEN_T/SEVEN_X/etc.) references them and would silently drop them from the generic backlog", () => {
  const familyDisplayNameBlock = pageSource.match(/FAMILY_DISPLAY_NAME[\s\S]*?= \{[\s\S]*?\r?\n\};/)![0];
  const ids = [
    "eng-inc003-peppersbreakfast",
    "eng-inc003-compassrosechallenge",
    "eng-inc003-salmonnavigation",
    "eng-inc003-writing-wc01a-imaginedplace",
  ];
  for (const id of ids) {
    assert.ok(familyDisplayNameBlock.includes(id), `${id} must have a display name`);
    // Every occurrence of the id in the whole file must be inside the
    // FAMILY_DISPLAY_NAME block -- if the count outside it is nonzero,
    // some other array (a batch's own TARGET_IDS list) now references
    // this id, most likely excluding it from FullBacklogSection.
    const totalCount = pageSource.split(id).length - 1;
    const inBlockCount = familyDisplayNameBlock.split(id).length - 1;
    assert.equal(totalCount, inBlockCount, `${id} must only appear inside FAMILY_DISPLAY_NAME, never in a dedicated batch's exclusion/target-id list`);
  }
});

test("lib/adminReview.ts: PendingReviewTarget carries the row's own reviewType", () => {
  assert.match(libSource, /export interface PendingReviewTarget \{[\s\S]{0,50}id: string;[\s\S]*?reviewType\?: ReviewType;\r?\n\}/);
});

test("lib/adminReview.ts: fetchPendingReviewTargets() selects review_type and distinguishes a real query failure from a genuinely empty result", () => {
  assert.match(libSource, /export async function fetchPendingReviewTargets\(\): Promise<\{ targets: PendingReviewTarget\[\]; fetchFailed: boolean \}>/);
  assert.match(libSource, /\.select\("family_id, review_target_type, review_type, notes"\)/);
  assert.match(libSource, /if \(error\) return \{ targets: \[\], fetchFailed: true \};/);
  assert.match(libSource, /reviewType: r\.review_type, notes: r\.notes/);
});

test("page.tsx: load() unpacks fetchPendingReviewTargets()'s {targets, fetchFailed} shape and stores both", () => {
  assert.match(pageSource, /const \[pendingResult, reviewed,/);
  assert.match(pageSource, /setTargets\(pendingResult\.targets\);/);
  assert.match(pageSource, /setPendingFetchFailed\(pendingResult\.fetchFailed\);/);
});

test("page.tsx: the generic FullBacklogSection -> ReviewForm branch now passes the target's own reviewType explicitly, closing the review_type-conflation defect", () => {
  assert.match(pageSource, /return <ReviewForm target=\{selected\} reviewType=\{selected\.reviewType\} onDone=\{\(\) => \{ setSelected\(null\); load\(\); \}\} \/>;/);
});

test("page.tsx: ReviewForm's reviewType prop is widened to the full ReviewType union so a fetched row's real review_type always type-checks", () => {
  assert.match(pageSource, /reviewType\?: ReviewType;/);
  assert.match(pageSource, /type AmendmentVerificationTarget, type ReviewType,/);
});

test("page.tsx: FullBacklogSection has a stable jump-link anchor and starts open when it genuinely has unresolved targets on first load", () => {
  assert.match(pageSource, /id="full-review-backlog"/);
  assert.match(pageSource, /const \[open, setOpen\] = useState\(\(\) => backlogTargets\.length > 0\);/);
});

test("page.tsx: the 'Jump to current review' card carries a permanent, content-agnostic link to the Full Review Backlog anchor", () => {
  assert.match(pageSource, /href="#full-review-backlog"[^>]*>Full Review Backlog<\/a>/);
});

test("page.tsx: a genuine fetchPendingReviewTargets() failure renders a distinct banner, never silently reading as 'no reviews pending'", () => {
  assert.match(pageSource, /\{pendingFetchFailed && \(/);
  assert.match(pageSource, /Could not load pending review targets/);
});

test("does not remove or weaken any prior dedicated section's own explicit reviewType wiring (Increment 002 passage precedent, unaffected)", () => {
  assert.match(pageSource, /target=\{selectedEnglishInc002Passage\}\s*\n\s*reviewType="mock_english_passage_independent_review"/);
});
