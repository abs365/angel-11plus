import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics First Mock Structural Capacity, Authoring Increment 001 —
 * Independent Validation (Decision 181). Structural tests against
 * migration 123's own SQL text, mirroring migration 116's own
 * established independent-validation-promotion pattern, extended with
 * live review-evidence and content-shape preconditions per the
 * Founder's own explicit directive.
 */

const sql = fs.readFileSync("supabase/migrations/123_mock_mathematics_linkedvalues_independent_validation.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const TARGET_IDS = ["mock-mr06-linkedvalues-01", "mock-mr06-linkedvalues-02", "mock-mr06-linkedvalues-03"];

test("targets exactly the 3 mock-mr06-linkedvalues rows, no more no less", () => {
  const match = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/);
  assert.ok(match);
  const ids = [...match![1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  assert.deepEqual(ids.sort(), [...TARGET_IDS].sort());
});

test("exact family_id, subject, and skill are asserted as live preconditions", () => {
  assert.match(executable, /and family_id = 'mock-mr06-linkedvalues'/);
  assert.match(executable, /where id = any\(v_target_ids\) and subject = 'maths' and skill = 'QT-MR-06'/);
});

test("marks precondition: all 3 rows must read marks=1 from prompt->>'marks', refusing rather than assuming the Marking Integrity Gate is satisfied", () => {
  assert.match(executable, /\(prompt->>'marks'\)::numeric = 1/);
  assert.match(sql, /Marking Integrity Gate must never be assumed satisfied/);
});

test("sharedStem precondition: all 3 rows must carry the identical, exact expected stem value", () => {
  assert.match(executable, /v_expected_stem constant text := 'A collector has three bags of marbles/);
  assert.match(executable, /where id = any\(v_target_ids\) and \(prompt->>'sharedStem'\) = v_expected_stem/);
});

test("non-empty question-text precondition present", () => {
  assert.match(executable, /coalesce\(length\(prompt->>'question'\), 0\) > 0/);
});

test("grouping precondition: exact question_group_id/group_order/subpart_label shape (01=1/(a), 02=2/(b), 03=3/(c)) verified via an explicit VALUES join, not a broken multi-row aggregate", () => {
  assert.match(executable, /join \(values\s*\n\s*\('mock-mr06-linkedvalues-01', 1, '\(a\)'\),\s*\n\s*\('mock-mr06-linkedvalues-02', 2, '\(b\)'\),\s*\n\s*\('mock-mr06-linkedvalues-03', 3, '\(c\)'\)/);
  assert.match(executable, /v_grouping_count <> 3/);
});

test("marking_mode=deterministic precondition present for all 3 rows", () => {
  assert.match(executable, /where id = any\(v_target_ids\) and marking_mode = 'deterministic'/);
});

test("live review-evidence precondition: requires an approved ali_family_review row with the exact family, decision, review_type, reviewer, and MOCK-STRUCTURAL-CAPACITY-INC001 marker, never merely trusted from the header", () => {
  const block = executable.match(/select count\(\*\) into v_approved_review_count[\s\S]*?end if;/)![0];
  assert.match(block, /from public\.ali_family_review/);
  assert.match(block, /family_id = 'mock-mr06-linkedvalues'/);
  assert.match(block, /decision = 'approved'/);
  assert.match(block, /review_type = 'mock_maths_independent_review'/);
  assert.match(block, /reviewer = 'Ayobami Lawal'/);
  assert.match(block, /notes like '%MOCK-STRUCTURAL-CAPACITY-INC001%'/);
  assert.match(block, /v_approved_review_count < 1/);
});

test("Decision 182 regression: the marker LIKE pattern is UNANCHORED (leading %), never anchored to the start of notes -- the exact production defect that made migration 123 reject 2 genuinely valid approvals", () => {
  const block = executable.match(/select count\(\*\) into v_approved_review_count[\s\S]*?end if;/)![0];
  assert.ok(!block.includes("notes like 'MOCK-STRUCTURAL-CAPACITY-INC001%'"), "must never regress to the anchored (no leading %) pattern that broke production");
  assert.match(block, /notes like '%MOCK-STRUCTURAL-CAPACITY-INC001%'/);
});

test("no ali_family_review mutation anywhere: only SELECT (via count) ever touches that table, no INSERT/UPDATE/DELETE", () => {
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
  for (const column of ["prompt", "active", "family_id", "skill", "content_difficulty", "question_group_id", "group_order", "subpart_label", "marking_mode", "provenance", "content_version"]) {
    assert.ok(!new RegExp(`\\bset\\s+${column}\\s*=`, "i").test(executable), `unexpected SET of "${column}"`);
  }
});

test("byte-for-byte prompt preservation is positively proven: a full pre-write prompt snapshot is captured and compared against the post-write value for all 3 rows", () => {
  assert.match(executable, /tmp_linkedvalues_prompt_snapshot/);
  assert.match(executable, /select id, prompt from public\.ali_question_bank where id = any\(v_target_ids\)/);
  assert.match(executable, /where b\.prompt = s\.prompt_snapshot/);
  assert.match(executable, /post-write preservation check failed/);
});

test("mock_eligible is explicitly, positively proven absent after this migration -- both in the apply branch and the already-applied branch", () => {
  const occurrences = [...executable.matchAll(/eligibility_status = 'mock_eligible'/g)];
  assert.ok(occurrences.length >= 2, `expected mock_eligible absence to be checked in both branches, found ${occurrences.length} checks`);
  assert.match(executable, /mock_eligible must never be set by this migration/);
  assert.match(executable, /mock_eligible found set on % rows in the already-applied branch/);
});

test("resulting eligibility_status is exactly independently_validated, never mock_eligible, set only via the guarded UPDATE", () => {
  assert.match(executable, /set eligibility_status = 'independently_validated'/);
  assert.ok(!/set eligibility_status = 'mock_eligible'/.test(executable));
});

test("idempotent structure: the already-validated branch (v_already_validated_count = 3) contains no UPDATE statement", () => {
  const alreadyAppliedBranch = executable.match(/elsif v_already_validated_count = 3 then[\s\S]*?else/)![0];
  assert.ok(!/\bupdate\s+public\.ali_question_bank\b/i.test(alreadyAppliedBranch));
});

test("mixed/unexpected state (neither exactly 3 pending nor exactly 3 already-validated) is explicitly refused via RAISE EXCEPTION, not silently repaired", () => {
  assert.match(executable, /Migration 123 refused: expected 3 authentic_assessment_candidate rows for mock-mr06-linkedvalues \(found %\), or 3 already independently_validated \(found %\)/);
});

test("touches only public.ali_question_bank via UPDATE; the only real table read anywhere else is ali_family_review (SELECT only) and a local temp table", () => {
  const updateTargets = [...executable.matchAll(/update\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(updateTargets), new Set(["ali_question_bank"]));
  const insertTargets = [...executable.matchAll(/insert into\s+(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(insertTargets), new Set(["tmp_linkedvalues_prompt_snapshot"]));
});

test("no ali_mock_form mutation or reference anywhere", () => {
  assert.ok(!executable.includes("ali_mock_form"));
});

test("no RPC/function is created, replaced, or altered; no RLS policy or grant statement appears", () => {
  assert.ok(!/create (or replace )?function/i.test(executable));
  assert.ok(!/create policy|alter policy/i.test(executable));
  assert.ok(!/\bgrant\b|\brevoke\b/i.test(executable));
});

test("no other Mathematics family, English, or Writing content is referenced", () => {
  assert.ok(!/mock-eng-|mock-writing-/.test(executable));
  assert.ok(!/mock-mr0[1-5]-|mock-mr0[7-9]-|mock-mr1[0-3]-/.test(executable.replace(/mock-mr06-linkedvalues/g, "")));
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

test("not applied disclosure present, documents dependency on migrations 119/120/121/122", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /migrations 119,\s*\n-- 120, 121, and 122/);
});

test("correction disclosure present: documents the exact production failure, root cause, and that this is an in-place fix, not a new migration number", () => {
  const collapsed = sql.replace(/\n--\s?/g, " ");
  assert.match(collapsed, /CORRECTION \(Decision 182\)/);
  assert.match(collapsed, /has NEVER successfully applied/);
  assert.match(collapsed, /marker is NEVER the first character of the stored string/);
  assert.match(collapsed, /Corrected IN PLACE/);
});

/**
 * Decision 182 semantic regression suite — reproduces the REAL
 * production ali_family_review notes shape (via the actual
 * buildNotesWithQualification()/notesPrefix concatenation logic,
 * lib/adminReview.ts and app/admin-beta/review/page.tsx), and exercises
 * a pure re-implementation of migration 123's own review-evidence
 * predicate against it -- not merely a substring check against the SQL
 * text, which is exactly what let the original anchored-LIKE defect
 * through undetected in Decision 181's own test suite.
 */

const MARKER = "MOCK-STRUCTURAL-CAPACITY-INC001";

/** Mirrors lib/adminReview.ts's buildNotesWithQualification() exactly. */
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

/** Pure re-implementation of migration 123's own corrected predicate: `notes LIKE '%MARKER%'` mirrored as .includes(). */
function hasApprovedReviewEvidence(records: readonly ReviewRecord[]): boolean {
  return records.some(
    (r) =>
      r.familyId === "mock-mr06-linkedvalues" &&
      r.decision === "approved" &&
      r.reviewType === "mock_maths_independent_review" &&
      r.reviewer === "Ayobami Lawal" &&
      r.notes.includes(MARKER)
  );
}

/** The ORIGINAL, broken predicate (anchored, no leading wildcard) -- kept only to prove it fails against real production shape. */
function hadApprovedReviewEvidence_BROKEN(records: readonly ReviewRecord[]): boolean {
  return records.some(
    (r) =>
      r.familyId === "mock-mr06-linkedvalues" &&
      r.decision === "approved" &&
      r.reviewType === "mock_maths_independent_review" &&
      r.reviewer === "Ayobami Lawal" &&
      r.notes.startsWith(MARKER)
  );
}

const REAL_NOTES_PREFIX = `${MARKER} new content review: mock-mr06-linkedvalues (Question IDs: mock-mr06-linkedvalues-01, mock-mr06-linkedvalues-02, mock-mr06-linkedvalues-03)`;

const PENDING_PLACEHOLDER: ReviewRecord = {
  familyId: "mock-mr06-linkedvalues",
  reviewer: "UNASSIGNED",
  decision: "pending_independent_review",
  reviewType: "mock_maths_independent_review",
  // Migration 120's own raw INSERT -- the marker genuinely IS at position 0 here, unlike every UI-submitted row.
  notes: REAL_NOTES_PREFIX,
};

const APPROVED_RECORD_1: ReviewRecord = {
  familyId: "mock-mr06-linkedvalues",
  reviewer: "Ayobami Lawal",
  decision: "approved",
  reviewType: "mock_maths_independent_review",
  notes: buildRealNotes("Mathematics content reviewer", REAL_NOTES_PREFIX, ""),
};

const APPROVED_RECORD_2: ReviewRecord = {
  familyId: "mock-mr06-linkedvalues",
  reviewer: "Ayobami Lawal",
  decision: "approved",
  reviewType: "mock_maths_independent_review",
  notes: buildRealNotes(
    "Mathematics content reviewer",
    REAL_NOTES_PREFIX,
    "Re-reviewed after the shared-stem presentation correction (migrations 121/122): shared scenario now renders once, subparts are clear, answers verified."
  ),
};

test("the reconstructed REAL production notes shape does NOT start with the marker -- confirming the root cause directly, not merely asserting it", () => {
  assert.ok(!APPROVED_RECORD_1.notes.startsWith(MARKER));
  assert.ok(APPROVED_RECORD_1.notes.includes(MARKER));
  assert.match(APPROVED_RECORD_1.notes, /^Reviewer qualification: /);
});

test("the ORIGINAL anchored predicate fails against the real 2-approval production shape -- proving this is the actual production defect, not a hypothetical one", () => {
  assert.equal(hadApprovedReviewEvidence_BROKEN([PENDING_PLACEHOLDER, APPROVED_RECORD_1, APPROVED_RECORD_2]), false);
});

test("the CORRECTED predicate accepts the real 2-approval production shape (1 pending + 2 legitimate approvals)", () => {
  assert.equal(hasApprovedReviewEvidence([PENDING_PLACEHOLDER, APPROVED_RECORD_1, APPROVED_RECORD_2]), true);
});

test("0 valid approvals (pending only) -> reject", () => {
  assert.equal(hasApprovedReviewEvidence([PENDING_PLACEHOLDER]), false);
});

test("1 valid approval -> accept", () => {
  assert.equal(hasApprovedReviewEvidence([PENDING_PLACEHOLDER, APPROVED_RECORD_1]), true);
});

test("2 valid approvals -> accept (multiple legitimate approvals must never invalidate certification)", () => {
  assert.equal(hasApprovedReviewEvidence([PENDING_PLACEHOLDER, APPROVED_RECORD_1, APPROVED_RECORD_2]), true);
});

test("correct reviewer but wrong decision -> reject", () => {
  const wrongDecision: ReviewRecord = { ...APPROVED_RECORD_1, decision: "approved_with_amendment" };
  assert.equal(hasApprovedReviewEvidence([wrongDecision]), false);
});

test("correct decision but wrong reviewer -> reject", () => {
  const wrongReviewer: ReviewRecord = { ...APPROVED_RECORD_1, reviewer: "Someone Else" };
  assert.equal(hasApprovedReviewEvidence([wrongReviewer]), false);
});

test("wrong review_type -> reject", () => {
  const wrongType: ReviewRecord = { ...APPROVED_RECORD_1, reviewType: "content_review" };
  assert.equal(hasApprovedReviewEvidence([wrongType]), false);
});

test("missing marker in notes -> reject", () => {
  const noMarker: ReviewRecord = { ...APPROVED_RECORD_1, notes: buildRealNotes("Mathematics content reviewer", "Approved, looks good.", "") };
  assert.equal(hasApprovedReviewEvidence([noMarker]), false);
});

test("wrong family_id -> reject (defence against a marker collision with a different family's approval)", () => {
  const wrongFamily: ReviewRecord = { ...APPROVED_RECORD_1, familyId: "mock-mr06-multiplerelation" };
  assert.equal(hasApprovedReviewEvidence([wrongFamily]), false);
});
