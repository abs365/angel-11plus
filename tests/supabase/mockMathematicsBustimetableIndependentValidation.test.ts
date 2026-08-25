import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics Structural Capacity, Wave 002 — Bus Timetable Independent
 * Validation (Decision 186/187/188). Structural tests against migration
 * 129's own SQL text, mirroring migration 123's own established
 * independent-validation-promotion pattern, extended with the
 * Decision-182-corrected unanchored review-evidence predicate and full
 * content-shape preservation preconditions.
 */

const sql = fs.readFileSync("supabase/migrations/129_mock_mathematics_bustimetable_independent_validation.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const TARGET_IDS = ["mock-mr10-bustimetable-01", "mock-mr10-bustimetable-02", "mock-mr10-bustimetable-03", "mock-mr10-bustimetable-04"];

test("targets exactly the 4 mock-mr10-bustimetable rows, no more no less", () => {
  const match = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/);
  assert.ok(match);
  const ids = [...match![1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  assert.deepEqual(ids.sort(), [...TARGET_IDS].sort());
});

test("exact family_id, subject, and skill are asserted as live preconditions", () => {
  assert.match(executable, /and family_id = 'mock-mr10-bustimetable'/);
  assert.match(executable, /where id = any\(v_target_ids\) and subject = 'maths' and skill = 'QT-MR-10'/);
});

test("grouping precondition: exact question_group_id/group_order/subpart_label shape (01=1/(a) ... 04=4/(d)) via an explicit VALUES join", () => {
  assert.match(executable, /join \(values\s*\n\s*\('mock-mr10-bustimetable-01', 1, '\(a\)'\),\s*\n\s*\('mock-mr10-bustimetable-02', 2, '\(b\)'\),\s*\n\s*\('mock-mr10-bustimetable-03', 3, '\(c\)'\),\s*\n\s*\('mock-mr10-bustimetable-04', 4, '\(d\)'\)/);
  assert.match(executable, /v_grouping_count <> 4/);
});

test("difficulty precondition: medium/medium/hard/hard across the 4 rows in order", () => {
  assert.match(executable, /join \(values\s*\n\s*\('mock-mr10-bustimetable-01', 'medium'\),\s*\n\s*\('mock-mr10-bustimetable-02', 'medium'\),\s*\n\s*\('mock-mr10-bustimetable-03', 'hard'\),\s*\n\s*\('mock-mr10-bustimetable-04', 'hard'\)/);
});

test("answers precondition: 95/7/370/28 across the 4 rows in order -- subpart (d)'s corrected answer must still be 28", () => {
  assert.match(executable, /join \(values\s*\n\s*\('mock-mr10-bustimetable-01', '95'\),\s*\n\s*\('mock-mr10-bustimetable-02', '7'\),\s*\n\s*\('mock-mr10-bustimetable-03', '370'\),\s*\n\s*\('mock-mr10-bustimetable-04', '28'\)/);
});

test("marks precondition: all 4 rows must read marks=1 from prompt->>'marks'", () => {
  assert.match(executable, /\(prompt->>'marks'\)::numeric = 1/);
  assert.match(sql, /Marking Integrity Gate must never be assumed satisfied/);
});

test("sharedStem precondition: all 4 rows must carry the identical, exact expected stem value, unaffected by migration 127's own wording fix", () => {
  assert.match(executable, /v_expected_stem constant text := 'A bus company runs a route from Hillview to Oakford/);
  assert.match(executable, /where id = any\(v_target_ids\) and \(prompt->>'sharedStem'\) = v_expected_stem/);
});

test("stimulus precondition: all 4 rows must carry a valid table stimulus", () => {
  const block = executable.match(/select count\(\*\) into v_stimulus_count[\s\S]*?end if;/)![0];
  assert.match(block, /jsonb_typeof\(prompt->'stimulus'\) = 'object'/);
  assert.match(block, /prompt->'stimulus'->>'type' = 'table'/);
});

test("marking_mode=deterministic precondition present for all 4 rows", () => {
  assert.match(executable, /where id = any\(v_target_ids\) and marking_mode = 'deterministic'/);
});

test("live review-evidence precondition uses the CORRECTION001 marker specifically, not the original WAVE002 marker, unanchored (Decision 182 lesson applied)", () => {
  const block = executable.match(/select count\(\*\) into v_approved_review_count[\s\S]*?end if;/)![0];
  assert.match(block, /family_id = 'mock-mr10-bustimetable'/);
  assert.match(block, /decision = 'approved'/);
  assert.match(block, /review_type = 'mock_maths_independent_review'/);
  assert.match(block, /reviewer = 'Ayobami Lawal'/);
  assert.match(block, /notes like '%MOCK-BUSTIMETABLE-CORRECTION001%'/);
  assert.ok(!block.includes("MOCK-STRUCTURAL-CAPACITY-WAVE002"), "must never accept the original, uncorrected-wording approval as certification evidence");
  assert.match(block, /v_approved_review_count < 1/);
});

test("REGRESSION: the marker predicate is unanchored (leading %), never anchored to the start of notes", () => {
  assert.ok(!executable.includes("notes like 'MOCK-BUSTIMETABLE-CORRECTION001%'"), "must never use an anchored (no leading %) marker pattern -- the exact Decision 182 defect");
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
  for (const column of ["prompt", "active", "family_id", "skill", "content_difficulty", "question_group_id", "group_order", "subpart_label", "marking_mode"]) {
    assert.ok(!new RegExp(`\\bset\\s+${column}\\s*=`, "i").test(executable), `unexpected SET of "${column}"`);
  }
});

test("byte-for-byte prompt preservation is positively proven for all 4 rows via a full pre-write snapshot compared post-write", () => {
  assert.match(executable, /tmp_bustimetable_prompt_snapshot/);
  assert.match(executable, /select id, prompt from public\.ali_question_bank where id = any\(v_target_ids\)/);
  assert.match(executable, /where b\.prompt = s\.prompt_snapshot/);
  assert.match(executable, /post-write preservation check failed/);
});

test("mock_eligible is explicitly, positively proven absent after this migration -- both in the apply branch and the already-applied branch", () => {
  const occurrences = [...executable.matchAll(/eligibility_status = 'mock_eligible'/g)];
  assert.ok(occurrences.length >= 2, `expected mock_eligible absence to be checked in both branches, found ${occurrences.length} checks`);
});

test("Craft Stall exclusion: never appears in the target array, and is explicitly re-verified untouched pre-write, post-write, and in the already-applied branch", () => {
  const targetMatch = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/)![1];
  assert.ok(!targetMatch.includes("craftstall"));
  assert.match(executable, /where t like 'mock-mr13-craftstall%' or t like 'mock-mr03mr07-perimeterarea%'/);
  assert.match(executable, /mock-mr13-craftstall.*must never appear in the target array/);
  const preconditionBlock = executable.match(/select count\(\*\) into v_excluded_still_untouched_count[\s\S]*?end if;/)![0];
  assert.match(preconditionBlock, /where id like 'mock-mr13-craftstall%' and eligibility_status = 'authentic_assessment_candidate'/);
  const postWriteBlock = executable.match(/where id like 'mock-mr13-craftstall%' and eligibility_status <> 'authentic_assessment_candidate'/);
  assert.ok(postWriteBlock);
});

test("perimeterarea is excluded from the target array by construction (same guard as craft-stall)", () => {
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
  assert.match(executable, /Migration 129 refused: expected 4 authentic_assessment_candidate rows for mock-mr10-bustimetable \(found %\), or 4 already independently_validated \(found %\)/);
});

test("touches only public.ali_question_bank via UPDATE; the only real table read anywhere else is ali_family_review (SELECT only) and a local temp table", () => {
  const updateTargets = [...executable.matchAll(/update\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(updateTargets), new Set(["ali_question_bank"]));
  const insertTargets = [...executable.matchAll(/insert into\s+(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(insertTargets), new Set(["tmp_bustimetable_prompt_snapshot"]));
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
  assert.ok(exceptionCount >= 12, `expected several RAISE EXCEPTION guards, found ${exceptionCount}`);
  assert.ok(noticeCount >= 2);
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present, documents dependency on migrations 125/126/127/128", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /migrations 125,\s*\n-- 126, 127, and 128/);
});

/**
 * SEMANTIC PREDICATE REGRESSION SUITE (Decision 182's own lesson,
 * applied directly here rather than merely cited) — reproduces the REAL
 * production ali_family_review notes shape (via the actual
 * buildNotesWithQualification()/notesPrefix concatenation logic) and
 * exercises a pure re-implementation of migration 129's own
 * review-evidence predicate against it, not merely a substring check
 * against the SQL text.
 */

const MARKER = "MOCK-BUSTIMETABLE-CORRECTION001";

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

/** Pure re-implementation of migration 129's own corrected predicate: `notes LIKE '%MARKER%'` mirrored as .includes(). */
function hasApprovedCorrectionEvidence(records: readonly ReviewRecord[]): boolean {
  return records.some(
    (r) =>
      r.familyId === "mock-mr10-bustimetable" &&
      r.decision === "approved" &&
      r.reviewType === "mock_maths_independent_review" &&
      r.reviewer === "Ayobami Lawal" &&
      r.notes.includes(MARKER)
  );
}

const REAL_CORRECTION_NOTES_PREFIX = `${MARKER} re-review after content correction: mock-mr10-bustimetable (Question IDs: mock-mr10-bustimetable-01, mock-mr10-bustimetable-02, mock-mr10-bustimetable-03, mock-mr10-bustimetable-04)`;
const REAL_ORIGINAL_WAVE002_NOTES_PREFIX = `MOCK-STRUCTURAL-CAPACITY-WAVE002 new content review: mock-mr10-bustimetable (Question IDs: mock-mr10-bustimetable-01, mock-mr10-bustimetable-02, mock-mr10-bustimetable-03, mock-mr10-bustimetable-04)`;

const ORIGINAL_WAVE002_APPROVAL: ReviewRecord = {
  familyId: "mock-mr10-bustimetable",
  reviewer: "Ayobami Lawal",
  decision: "approved",
  reviewType: "mock_maths_independent_review",
  notes: buildRealNotes("Mathematics content reviewer", REAL_ORIGINAL_WAVE002_NOTES_PREFIX, ""),
};

const CORRECTION_APPROVAL: ReviewRecord = {
  familyId: "mock-mr10-bustimetable",
  reviewer: "Ayobami Lawal",
  decision: "approved",
  reviewType: "mock_maths_independent_review",
  notes: buildRealNotes(
    "Mathematics content reviewer",
    REAL_CORRECTION_NOTES_PREFIX,
    "Re-reviewed the complete corrected grouped question. Verified reducing the 35-minute journey by 20% gives 28 minutes, unambiguous and consistent with the stored answer."
  ),
};

test("SEMANTIC: the marker for a real corrected-content approval is NOT at position 0 of the stored notes (confirming the root cause directly)", () => {
  assert.ok(!CORRECTION_APPROVAL.notes.startsWith(MARKER));
  assert.ok(CORRECTION_APPROVAL.notes.includes(MARKER));
  assert.match(CORRECTION_APPROVAL.notes, /^Reviewer qualification: /);
});

test("SEMANTIC: marker not at position zero is still correctly ACCEPTED by the corrected predicate", () => {
  assert.equal(hasApprovedCorrectionEvidence([CORRECTION_APPROVAL]), true);
});

test("SEMANTIC: the ORIGINAL WAVE002 approval (uncorrected wording) does NOT satisfy the correction-specific predicate -- it lacks the CORRECTION001 marker entirely", () => {
  assert.equal(hasApprovedCorrectionEvidence([ORIGINAL_WAVE002_APPROVAL]), false);
});

test("SEMANTIC: original approval present alongside the real correction approval -- correctly accepted (multiple legitimate review records must never invalidate certification)", () => {
  assert.equal(hasApprovedCorrectionEvidence([ORIGINAL_WAVE002_APPROVAL, CORRECTION_APPROVAL]), true);
});

test("SEMANTIC: missing correction approval (pending-only) -> reject", () => {
  const pendingOnly: ReviewRecord = { ...CORRECTION_APPROVAL, decision: "pending_independent_review" };
  assert.equal(hasApprovedCorrectionEvidence([pendingOnly]), false);
});

test("SEMANTIC: wrong reviewer -> reject", () => {
  const wrongReviewer: ReviewRecord = { ...CORRECTION_APPROVAL, reviewer: "Someone Else" };
  assert.equal(hasApprovedCorrectionEvidence([wrongReviewer]), false);
});

test("SEMANTIC: wrong decision -> reject", () => {
  const wrongDecision: ReviewRecord = { ...CORRECTION_APPROVAL, decision: "approved_with_amendment" };
  assert.equal(hasApprovedCorrectionEvidence([wrongDecision]), false);
});

test("SEMANTIC: wrong review_type -> reject", () => {
  const wrongType: ReviewRecord = { ...CORRECTION_APPROVAL, reviewType: "content_review" };
  assert.equal(hasApprovedCorrectionEvidence([wrongType]), false);
});

test("SEMANTIC: missing marker (approved, correct reviewer/type, but no CORRECTION001 marker in notes) -> reject", () => {
  const noMarker: ReviewRecord = { ...CORRECTION_APPROVAL, notes: buildRealNotes("Mathematics content reviewer", "Approved, looks good.", "") };
  assert.equal(hasApprovedCorrectionEvidence([noMarker]), false);
});

test("SEMANTIC: wrong family_id -> reject (defence against a marker collision with a different family's approval)", () => {
  const wrongFamily: ReviewRecord = { ...CORRECTION_APPROVAL, familyId: "mock-mr13-craftstall" };
  assert.equal(hasApprovedCorrectionEvidence([wrongFamily]), false);
});
