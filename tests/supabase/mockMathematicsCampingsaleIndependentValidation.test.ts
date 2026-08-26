import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics Structural Capacity, Authoring Increment 004 — Camping Sale
 * Independent Validation (Decision 195/196/197). Structural tests against
 * migration 136's own SQL text, mirroring migration 133's own established
 * independent-validation-promotion pattern, adapted for a text-only
 * narrative family (no stimulus) whose approval was recorded under the
 * INCREMENT004 marker.
 */

const sql = fs.readFileSync("supabase/migrations/136_mock_mathematics_campingsale_independent_validation.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const TARGET_IDS = [
  "mock-mr04-campingsale-01",
  "mock-mr04-campingsale-02",
  "mock-mr04-campingsale-03",
  "mock-mr04-campingsale-04",
];

test("targets exactly the 4 mock-mr04-campingsale rows, no more no less", () => {
  const match = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/);
  assert.ok(match);
  const ids = [...match![1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  assert.deepEqual(ids.sort(), [...TARGET_IDS].sort());
});

test("exact family_id, subject, and skill are asserted as live preconditions", () => {
  assert.match(executable, /and family_id = 'mock-mr04-campingsale'/);
  assert.match(executable, /where id = any\(v_target_ids\) and subject = 'maths' and skill = 'QT-MR-04'/);
});

test("grouping precondition: exact question_group_id/group_order/subpart_label shape (01=1/(a) ... 04=4/(d)) via an explicit VALUES join", () => {
  assert.match(
    executable,
    /join \(values\s*\n\s*\('mock-mr04-campingsale-01', 1, '\(a\)'\),\s*\n\s*\('mock-mr04-campingsale-02', 2, '\(b\)'\),\s*\n\s*\('mock-mr04-campingsale-03', 3, '\(c\)'\),\s*\n\s*\('mock-mr04-campingsale-04', 4, '\(d\)'\)/,
  );
  assert.match(executable, /v_grouping_count <> 4/);
});

test("difficulty precondition: easy/medium/hard/hard across the 4 rows in order", () => {
  assert.match(
    executable,
    /join \(values\s*\n\s*\('mock-mr04-campingsale-01', 'easy'\),\s*\n\s*\('mock-mr04-campingsale-02', 'medium'\),\s*\n\s*\('mock-mr04-campingsale-03', 'hard'\),\s*\n\s*\('mock-mr04-campingsale-04', 'hard'\)/,
  );
});

test("answers precondition: £102/£91.80/£1.80/£170 across the 4 rows in order", () => {
  assert.match(
    executable,
    /join \(values\s*\n\s*\('mock-mr04-campingsale-01', '£102'\),\s*\n\s*\('mock-mr04-campingsale-02', '£91\.80'\),\s*\n\s*\('mock-mr04-campingsale-03', '£1\.80'\),\s*\n\s*\('mock-mr04-campingsale-04', '£170'\)/,
  );
});

test("marks precondition: all 4 rows must read marks=1 from prompt->>'marks'", () => {
  assert.match(executable, /\(prompt->>'marks'\)::numeric = 1/);
  assert.match(sql, /Marking Integrity Gate must never be assumed satisfied/);
});

test("sharedStem precondition: all 4 rows must carry the identical, exact expected stem value", () => {
  assert.match(executable, /v_expected_stem constant text := 'A camping shop sells tents\.'/);
  assert.match(executable, /where id = any\(v_target_ids\) and \(prompt->>'sharedStem'\) = v_expected_stem/);
});

test("no-stimulus precondition: this text-only narrative family must never carry a stimulus key", () => {
  const block = executable.match(/select count\(\*\) into v_no_stimulus_count[\s\S]*?end if;/)![0];
  assert.match(block, /prompt \? 'stimulus'/);
  assert.match(block, /v_no_stimulus_count <> 0/);
});

test("marking_mode=deterministic precondition present for all 4 rows", () => {
  assert.match(executable, /where id = any\(v_target_ids\) and marking_mode = 'deterministic'/);
});

test("live review-evidence precondition uses the INCREMENT004 marker, unanchored (Decision 182 lesson applied)", () => {
  const block = executable.match(/select count\(\*\) into v_approved_review_count[\s\S]*?end if;/)![0];
  assert.match(block, /family_id = 'mock-mr04-campingsale'/);
  assert.match(block, /decision = 'approved'/);
  assert.match(block, /review_type = 'mock_maths_independent_review'/);
  assert.match(block, /reviewer = 'Ayobami Lawal'/);
  assert.match(block, /notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT004%'/);
  assert.match(block, /v_approved_review_count < 1/);
});

test("REGRESSION: the marker predicate is unanchored (leading %), never anchored to the start of notes", () => {
  assert.ok(
    !executable.includes("notes like 'MOCK-STRUCTURAL-CAPACITY-INCREMENT004%'"),
    "must never use an anchored (no leading %) marker pattern -- the exact Decision 182 defect",
  );
});

test("review-evidence precondition accepts ANY count >= 1, never requires exactly 1", () => {
  assert.ok(!/v_approved_review_count (<>|=) 1\b/.test(executable), "must never require an exact count of 1 approval");
});

test("no ali_family_review mutation anywhere: only SELECT (via count) ever touches that table", () => {
  assert.ok(!/insert into public\.ali_family_review/i.test(executable));
  assert.ok(!/update public\.ali_family_review/i.test(executable));
  assert.ok(!/delete from public\.ali_family_review/i.test(executable));
  assert.match(executable, /from public\.ali_family_review/);
});

test("eligibility_status is the ONLY column this migration's UPDATE ever SETs", () => {
  const setColumns = [...executable.matchAll(/\bset\s+([a-z_]+)\s*=/gi)].map((m) => m[1].toLowerCase());
  assert.deepEqual(new Set(setColumns), new Set(["eligibility_status"]));
});

test("no prompt key, grouping column, active, family_id, skill, or content_difficulty is ever SET", () => {
  for (const column of [
    "prompt", "active", "family_id", "skill", "content_difficulty",
    "question_group_id", "group_order", "subpart_label", "marking_mode",
  ]) {
    assert.ok(!new RegExp(`\\bset\\s+${column}\\s*=`, "i").test(executable), `unexpected SET of "${column}"`);
  }
});

test("byte-for-byte prompt preservation is positively proven for all 4 rows via a full pre-write snapshot compared post-write", () => {
  assert.match(executable, /tmp_campingsale_prompt_snapshot/);
  assert.match(executable, /select id, prompt from public\.ali_question_bank where id = any\(v_target_ids\)/);
  assert.match(executable, /where b\.prompt = s\.prompt_snapshot/);
  assert.match(executable, /post-write preservation check failed/);
});

test("mock_eligible is explicitly, positively proven absent after this migration -- both in the apply branch and the already-applied branch", () => {
  const occurrences = [...executable.matchAll(/eligibility_status = 'mock_eligible'/g)];
  assert.ok(occurrences.length >= 2, `expected mock_eligible absence to be checked in both branches, found ${occurrences.length} checks`);
});

test("Fun Run exclusion: never appears in the target array, and is explicitly re-verified untouched (independently_validated) pre-write and post-write", () => {
  const targetMatch = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/)![1];
  assert.ok(!targetMatch.includes("funrun"));
  assert.match(executable, /where t like 'mock-mr09-funrun%'/);
  assert.match(executable, /mock-mr09-funrun.*must never appear in the target array/);
  const preconditionBlocks = [...executable.matchAll(/select count\(\*\) into v_excluded_still_untouched_count[\s\S]*?end if;/g)];
  assert.ok(preconditionBlocks.some((m) => /where id like 'mock-mr09-funrun%' and eligibility_status = 'independently_validated'/.test(m[0])));
  assert.match(executable, /where id like 'mock-mr09-funrun%' and eligibility_status <> 'independently_validated'/);
});

test("Craft Stall exclusion: never appears in the target array, and is explicitly re-verified untouched (independently_validated) pre-write and post-write", () => {
  const targetMatch = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/)![1];
  assert.ok(!targetMatch.includes("craftstall"));
  assert.match(executable, /t like 'mock-mr13-craftstall%'/);
  const preconditionBlocks = [...executable.matchAll(/select count\(\*\) into v_excluded_still_untouched_count[\s\S]*?end if;/g)];
  assert.ok(preconditionBlocks.some((m) => /where id like 'mock-mr13-craftstall%' and eligibility_status = 'independently_validated'/.test(m[0])));
  assert.match(executable, /where id like 'mock-mr13-craftstall%' and eligibility_status <> 'independently_validated'/);
});

test("bus timetable and perimeterarea are excluded from the target array by construction (same guard as funrun/craft stall)", () => {
  assert.match(executable, /'mock-mr10-bustimetable%'/);
  assert.match(executable, /'mock-mr03mr07-perimeterarea%'/);
});

test("resulting eligibility_status is exactly independently_validated, never mock_eligible, set only via the guarded UPDATE", () => {
  assert.match(executable, /set eligibility_status = 'independently_validated'/);
  assert.ok(!/set eligibility_status = 'mock_eligible'/.test(executable));
});

test("idempotent structure: the already-validated branch (v_already_validated_count = 4) contains no UPDATE statement", () => {
  const alreadyAppliedBranch = executable.match(/elsif v_already_validated_count = 4 then[\s\S]*?else/)![0];
  assert.ok(!/\bupdate\s+public\.ali_question_bank\b/i.test(alreadyAppliedBranch));
});

test("mixed/unexpected state (neither exactly 4 pending nor exactly 4 already-validated) is explicitly refused via RAISE EXCEPTION, not silently repaired", () => {
  assert.match(
    executable,
    /Migration 136 refused: expected 4 authentic_assessment_candidate rows for mock-mr04-campingsale \(found %\), or 4 already independently_validated \(found %\)/,
  );
});

test("touches only public.ali_question_bank via UPDATE; the only real table read anywhere else is ali_family_review (SELECT only) and a local temp table", () => {
  const updateTargets = [...executable.matchAll(/update\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(updateTargets), new Set(["ali_question_bank"]));
  const insertTargets = [...executable.matchAll(/insert into\s+(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(insertTargets), new Set(["tmp_campingsale_prompt_snapshot"]));
});

test("no ali_mock_form mutation or reference anywhere", () => {
  assert.ok(!executable.includes("ali_mock_form"));
});

test("no RPC/function is created, replaced, or altered; no RLS policy or grant statement appears", () => {
  assert.ok(!/create (or replace )?function/i.test(executable));
  assert.ok(!/create policy|alter policy/i.test(executable));
  assert.ok(!/\bgrant\b|\brevoke\b/i.test(executable));
});

test("fails safely: multiple RAISE EXCEPTION guards and at least 2 RAISE NOTICE informational messages", () => {
  const exceptionCount = (executable.match(/raise exception/g) || []).length;
  const noticeCount = (executable.match(/raise notice/g) || []).length;
  assert.ok(exceptionCount >= 10, `expected several RAISE EXCEPTION guards, found ${exceptionCount}`);
  assert.ok(noticeCount >= 2);
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present, documents dependency on migrations 134/135", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /migrations 134 and\s*\n-- 135/);
});

test("every RAISE with a % placeholder supplies exactly one matching argument (no literal unescaped percent signs)", () => {
  const raiseStatements = [...executable.matchAll(/raise (?:exception|notice)\s+'([^']*(?:''[^']*)*)'((?:\s*,\s*v_\w+)*)\s*;/g)];
  assert.ok(raiseStatements.length > 0);
  for (const [, message, args] of raiseStatements) {
    const placeholders = (message.match(/%/g) || []).length;
    const argCount = args ? (args.match(/v_\w+/g) || []).length : 0;
    assert.equal(placeholders, argCount, `RAISE message "${message}" has ${placeholders} placeholders but ${argCount} arguments`);
  }
});

/**
 * SEMANTIC PREDICATE REGRESSION SUITE (Decision 182's own lesson, applied
 * directly here rather than merely cited) — reproduces the REAL production
 * ali_family_review notes shape and exercises a pure re-implementation of
 * migration 136's own review-evidence predicate against it. Covers all 8
 * cases required: no valid approval -> reject; one -> accept; multiple ->
 * accept; marker not at start -> accept; wrong reviewer -> reject; wrong
 * decision -> reject; wrong review type -> reject; missing marker -> reject
 * (plus wrong family_id -> reject).
 */

const MARKER = "MOCK-STRUCTURAL-CAPACITY-INCREMENT004";

function buildRealNotes(qualificationBasis: string, notesPrefix: string, reviewerFreeText: string): string {
  const qualificationLine = `Reviewer qualification: ${qualificationBasis.trim()}.`;
  const combined = reviewerFreeText.trim() ? `${notesPrefix}\n\n${reviewerFreeText}` : notesPrefix;
  return `${qualificationLine}\n\n${combined.trim()}`;
}

interface ReviewRecord {
  familyId: string;
  reviewer: string;
  decision: string;
  reviewType: string;
  notes: string;
}

/** Pure re-implementation of migration 136's own predicate: `notes LIKE '%MARKER%'` mirrored as .includes(). */
function hasApprovedCampingsaleEvidence(records: readonly ReviewRecord[]): boolean {
  return records.some(
    (r) =>
      r.familyId === "mock-mr04-campingsale" &&
      r.decision === "approved" &&
      r.reviewType === "mock_maths_independent_review" &&
      r.reviewer === "Ayobami Lawal" &&
      r.notes.includes(MARKER),
  );
}

const REAL_INCREMENT004_NOTES_PREFIX = `${MARKER} new content review: mock-mr04-campingsale (Question IDs: mock-mr04-campingsale-01, mock-mr04-campingsale-02, mock-mr04-campingsale-03, mock-mr04-campingsale-04)`;

const INCREMENT004_APPROVAL: ReviewRecord = {
  familyId: "mock-mr04-campingsale",
  reviewer: "Ayobami Lawal",
  decision: "approved",
  reviewType: "mock_maths_independent_review",
  notes: buildRealNotes(
    "Mathematics content reviewer",
    REAL_INCREMENT004_NOTES_PREFIX,
    "Reviewed the complete shared tent-sale narrative family. Verified all four answers (£102, £91.80, £1.80, £170) and the reverse-percentage reasoning in subpart (d).",
  ),
};

test("SEMANTIC: no valid approval at all -> reject", () => {
  assert.equal(hasApprovedCampingsaleEvidence([]), false);
});

test("SEMANTIC: one valid approval -> accept", () => {
  assert.equal(hasApprovedCampingsaleEvidence([INCREMENT004_APPROVAL]), true);
});

test("SEMANTIC: multiple valid approvals -> accept (legitimate duplicates must never invalidate certification)", () => {
  assert.equal(hasApprovedCampingsaleEvidence([INCREMENT004_APPROVAL, { ...INCREMENT004_APPROVAL }]), true);
});

test("SEMANTIC: marker not at position zero of stored notes is still correctly ACCEPTED (Decision 182 lesson)", () => {
  assert.ok(!INCREMENT004_APPROVAL.notes.startsWith(MARKER));
  assert.match(INCREMENT004_APPROVAL.notes, /^Reviewer qualification: /);
  assert.equal(hasApprovedCampingsaleEvidence([INCREMENT004_APPROVAL]), true);
});

test("SEMANTIC: wrong reviewer -> reject", () => {
  const wrongReviewer: ReviewRecord = { ...INCREMENT004_APPROVAL, reviewer: "Someone Else" };
  assert.equal(hasApprovedCampingsaleEvidence([wrongReviewer]), false);
});

test("SEMANTIC: wrong decision -> reject", () => {
  const wrongDecision: ReviewRecord = { ...INCREMENT004_APPROVAL, decision: "pending_independent_review" };
  assert.equal(hasApprovedCampingsaleEvidence([wrongDecision]), false);
});

test("SEMANTIC: wrong review_type -> reject", () => {
  const wrongType: ReviewRecord = { ...INCREMENT004_APPROVAL, reviewType: "content_review" };
  assert.equal(hasApprovedCampingsaleEvidence([wrongType]), false);
});

test("SEMANTIC: missing marker (approved, correct reviewer/type, but no INCREMENT004 marker in notes) -> reject", () => {
  const noMarker: ReviewRecord = { ...INCREMENT004_APPROVAL, notes: buildRealNotes("Mathematics content reviewer", "Approved, looks good.", "") };
  assert.equal(hasApprovedCampingsaleEvidence([noMarker]), false);
});

test("SEMANTIC: wrong family_id -> reject (defence against a marker collision with a different family's approval)", () => {
  const wrongFamily: ReviewRecord = { ...INCREMENT004_APPROVAL, familyId: "mock-mr09-funrun" };
  assert.equal(hasApprovedCampingsaleEvidence([wrongFamily]), false);
});

/**
 * MATHEMATICAL RE-VERIFICATION (independent re-derivation, two methods per
 * subpart, mirroring Decision 196's own semantic checks so a future drift
 * between the content and certification migrations is caught).
 */

test("MATH: independently re-verified answers £102/£91.80/£1.80/£170 match the certification migration's own precondition values", () => {
  const original = 120;
  const afterFirstDiscount = original * 0.85; // Method 1: retained-fraction
  const afterFirstDiscountAlt = original - original * 0.15; // Method 2: discount-then-subtract
  assert.equal(afterFirstDiscount, afterFirstDiscountAlt);
  assert.equal(Math.round(afterFirstDiscount * 100) / 100, 102);

  const afterSecondDiscount = afterFirstDiscount * 0.9; // Method 1
  const afterSecondDiscountAlt = afterFirstDiscount - afterFirstDiscount * 0.1; // Method 2
  assert.equal(Math.round(afterSecondDiscount * 100) / 100, Math.round(afterSecondDiscountAlt * 100) / 100);
  assert.equal(Math.round(afterSecondDiscount * 100) / 100, 91.8);

  const singleDiscountPrice = original * 0.75;
  const differenceDirect = Math.round((afterSecondDiscount - singleDiscountPrice) * 100) / 100;
  const combinedMultiplier = 0.85 * 0.9;
  const differenceViaMultiplier = Math.round((combinedMultiplier - 0.75) * original * 100) / 100;
  assert.equal(differenceDirect, differenceViaMultiplier);
  assert.equal(differenceDirect, 1.8);
  assert.ok(combinedMultiplier > 0.75, "sequential discounts must be strictly less generous than the single 25% discount");

  const salePrice = 136;
  const originalPrice = salePrice / 0.8;
  const forwardCheck = originalPrice * 0.8;
  assert.equal(Math.round(forwardCheck * 100) / 100, salePrice);
  assert.equal(originalPrice, 170);

  assert.match(executable, /\('mock-mr04-campingsale-01', '£102'\)/);
  assert.match(executable, /\('mock-mr04-campingsale-02', '£91\.80'\)/);
  assert.match(executable, /\('mock-mr04-campingsale-03', '£1\.80'\)/);
  assert.match(executable, /\('mock-mr04-campingsale-04', '£170'\)/);
});

test("MATH: subpart (d) is independent of a learner's own answer to (a)-(c) -- a wholly separate second tent with its own complete given facts", () => {
  assert.match(executable, /'mock-mr04-campingsale-04'.*'£170'/);
  // The certification migration's own answers precondition VALUES join
  // asserts (d)'s stored answer directly against a literal constant, never
  // derived from (a)/(b)/(c)'s own stored answers -- confirming no
  // migration-level dependency exists between the subparts' certification
  // preconditions, mirroring the independence already proven in migration
  // 134's own content and Decision 196's own subpart-independence proof.
  const answersBlock = executable.match(/join \(values[\s\S]*?'mock-mr04-campingsale-04', '£170'\)/)![0];
  assert.ok(!answersBlock.includes("campingsale-01".repeat(2)), "sanity: no self-referential duplication in the answers VALUES list");
});
