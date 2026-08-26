import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics Structural Capacity, Authoring Increment 003 — Fun Run
 * Independent Validation (Decision 192/193/194). Structural tests against
 * migration 133's own SQL text, mirroring migration 130's own established
 * independent-validation-promotion pattern, adapted for a 4-row family
 * whose approval was recorded under the INCREMENT003 marker.
 */

const sql = fs.readFileSync("supabase/migrations/133_mock_mathematics_funrun_independent_validation.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const TARGET_IDS = ["mock-mr09-funrun-01", "mock-mr09-funrun-02", "mock-mr09-funrun-03", "mock-mr09-funrun-04"];

test("targets exactly the 4 mock-mr09-funrun rows, no more no less", () => {
  const match = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/);
  assert.ok(match);
  const ids = [...match![1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  assert.deepEqual(ids.sort(), [...TARGET_IDS].sort());
});

test("exact family_id, subject, and skill are asserted as live preconditions", () => {
  assert.match(executable, /and family_id = 'mock-mr09-funrun'/);
  assert.match(executable, /where id = any\(v_target_ids\) and subject = 'maths' and skill = 'QT-MR-09'/);
});

test("grouping precondition: exact question_group_id/group_order/subpart_label shape (01=1/(a) ... 04=4/(d)) via an explicit VALUES join", () => {
  assert.match(
    executable,
    /join \(values\s*\n\s*\('mock-mr09-funrun-01', 1, '\(a\)'\),\s*\n\s*\('mock-mr09-funrun-02', 2, '\(b\)'\),\s*\n\s*\('mock-mr09-funrun-03', 3, '\(c\)'\),\s*\n\s*\('mock-mr09-funrun-04', 4, '\(d\)'\)/,
  );
  assert.match(executable, /v_grouping_count <> 4/);
});

test("difficulty precondition: medium/medium/hard/hard across the 4 rows in order", () => {
  assert.match(
    executable,
    /join \(values\s*\n\s*\('mock-mr09-funrun-01', 'medium'\),\s*\n\s*\('mock-mr09-funrun-02', 'medium'\),\s*\n\s*\('mock-mr09-funrun-03', 'hard'\),\s*\n\s*\('mock-mr09-funrun-04', 'hard'\)/,
  );
});

test("answers precondition: 30/74/2.5/14 across the 4 rows in order", () => {
  assert.match(
    executable,
    /join \(values\s*\n\s*\('mock-mr09-funrun-01', '30'\),\s*\n\s*\('mock-mr09-funrun-02', '74'\),\s*\n\s*\('mock-mr09-funrun-03', '2\.5'\),\s*\n\s*\('mock-mr09-funrun-04', '14'\)/,
  );
});

test("marks precondition: all 4 rows must read marks=1 from prompt->>'marks'", () => {
  assert.match(executable, /\(prompt->>'marks'\)::numeric = 1/);
  assert.match(sql, /Marking Integrity Gate must never be assumed satisfied/);
});

test("sharedStem precondition: all 4 rows must carry the identical, exact expected stem value", () => {
  assert.match(executable, /v_expected_stem constant text := 'Riverside Primary School held a sponsored fun run/);
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

test("live review-evidence precondition uses the INCREMENT003 marker, unanchored (Decision 182 lesson applied)", () => {
  const block = executable.match(/select count\(\*\) into v_approved_review_count[\s\S]*?end if;/)![0];
  assert.match(block, /family_id = 'mock-mr09-funrun'/);
  assert.match(block, /decision = 'approved'/);
  assert.match(block, /review_type = 'mock_maths_independent_review'/);
  assert.match(block, /reviewer = 'Ayobami Lawal'/);
  assert.match(block, /notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT003%'/);
  assert.match(block, /v_approved_review_count < 1/);
});

test("REGRESSION: the marker predicate is unanchored (leading %), never anchored to the start of notes", () => {
  assert.ok(
    !executable.includes("notes like 'MOCK-STRUCTURAL-CAPACITY-INCREMENT003%'"),
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
  assert.match(executable, /tmp_funrun_prompt_snapshot/);
  assert.match(executable, /select id, prompt from public\.ali_question_bank where id = any\(v_target_ids\)/);
  assert.match(executable, /where b\.prompt = s\.prompt_snapshot/);
  assert.match(executable, /post-write preservation check failed/);
});

test("mock_eligible is explicitly, positively proven absent after this migration -- both in the apply branch and the already-applied branch", () => {
  const occurrences = [...executable.matchAll(/eligibility_status = 'mock_eligible'/g)];
  assert.ok(occurrences.length >= 2, `expected mock_eligible absence to be checked in both branches, found ${occurrences.length} checks`);
});

test("Craft Stall exclusion: never appears in the target array, and is explicitly re-verified untouched (independently_validated) pre-write, post-write, and in the already-applied branch", () => {
  const targetMatch = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/)![1];
  assert.ok(!targetMatch.includes("craftstall"));
  assert.match(executable, /where t like 'mock-mr13-craftstall%' or t like 'mock-mr10-bustimetable%' or t like 'mock-mr03mr07-perimeterarea%'/);
  assert.match(executable, /mock-mr13-craftstall.*must never appear in the target array/);
  const preconditionBlock = executable.match(/select count\(\*\) into v_excluded_still_untouched_count[\s\S]*?end if;/)![0];
  assert.match(preconditionBlock, /where id like 'mock-mr13-craftstall%' and eligibility_status = 'independently_validated'/);
  const postWriteBlock = executable.match(/where id like 'mock-mr13-craftstall%' and eligibility_status <> 'independently_validated'/);
  assert.ok(postWriteBlock);
});

test("bus timetable and perimeterarea are excluded from the target array by construction (same guard as craft stall)", () => {
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
    /Migration 133 refused: expected 4 authentic_assessment_candidate rows for mock-mr09-funrun \(found %\), or 4 already independently_validated \(found %\)/,
  );
});

test("touches only public.ali_question_bank via UPDATE; the only real table read anywhere else is ali_family_review (SELECT only) and a local temp table", () => {
  const updateTargets = [...executable.matchAll(/update\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(updateTargets), new Set(["ali_question_bank"]));
  const insertTargets = [...executable.matchAll(/insert into\s+(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(insertTargets), new Set(["tmp_funrun_prompt_snapshot"]));
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

test("not applied disclosure present, documents dependency on migrations 131/132", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /migrations 131 and\s*\n-- 132/);
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
 * migration 133's own review-evidence predicate against it. Covers all 8
 * cases required: no valid approval -> reject; one -> accept; multiple ->
 * accept; marker not at start -> accept; wrong reviewer -> reject; wrong
 * decision -> reject; wrong review type -> reject; missing marker -> reject
 * (plus wrong family_id -> reject).
 */

const MARKER = "MOCK-STRUCTURAL-CAPACITY-INCREMENT003";

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

/** Pure re-implementation of migration 133's own predicate: `notes LIKE '%MARKER%'` mirrored as .includes(). */
function hasApprovedFunrunEvidence(records: readonly ReviewRecord[]): boolean {
  return records.some(
    (r) =>
      r.familyId === "mock-mr09-funrun" &&
      r.decision === "approved" &&
      r.reviewType === "mock_maths_independent_review" &&
      r.reviewer === "Ayobami Lawal" &&
      r.notes.includes(MARKER),
  );
}

const REAL_INCREMENT003_NOTES_PREFIX = `${MARKER} new content review: mock-mr09-funrun (Question IDs: mock-mr09-funrun-01, mock-mr09-funrun-02, mock-mr09-funrun-03, mock-mr09-funrun-04)`;

const INCREMENT003_APPROVAL: ReviewRecord = {
  familyId: "mock-mr09-funrun",
  reviewer: "Ayobami Lawal",
  decision: "approved",
  reviewType: "mock_maths_independent_review",
  notes: buildRealNotes(
    "Mathematics content reviewer",
    REAL_INCREMENT003_NOTES_PREFIX,
    "Reviewed the complete shared frequency-table family. Verified all four answers (30, 74, 2.5, 14) and the rounding instruction in subpart (c).",
  ),
};

test("SEMANTIC: no valid approval at all -> reject", () => {
  assert.equal(hasApprovedFunrunEvidence([]), false);
});

test("SEMANTIC: one valid approval -> accept", () => {
  assert.equal(hasApprovedFunrunEvidence([INCREMENT003_APPROVAL]), true);
});

test("SEMANTIC: multiple valid approvals -> accept (legitimate duplicates must never invalidate certification)", () => {
  assert.equal(hasApprovedFunrunEvidence([INCREMENT003_APPROVAL, { ...INCREMENT003_APPROVAL }]), true);
});

test("SEMANTIC: marker not at position zero of stored notes is still correctly ACCEPTED (Decision 182 lesson)", () => {
  assert.ok(!INCREMENT003_APPROVAL.notes.startsWith(MARKER));
  assert.match(INCREMENT003_APPROVAL.notes, /^Reviewer qualification: /);
  assert.equal(hasApprovedFunrunEvidence([INCREMENT003_APPROVAL]), true);
});

test("SEMANTIC: wrong reviewer -> reject", () => {
  const wrongReviewer: ReviewRecord = { ...INCREMENT003_APPROVAL, reviewer: "Someone Else" };
  assert.equal(hasApprovedFunrunEvidence([wrongReviewer]), false);
});

test("SEMANTIC: wrong decision -> reject", () => {
  const wrongDecision: ReviewRecord = { ...INCREMENT003_APPROVAL, decision: "pending_independent_review" };
  assert.equal(hasApprovedFunrunEvidence([wrongDecision]), false);
});

test("SEMANTIC: wrong review_type -> reject", () => {
  const wrongType: ReviewRecord = { ...INCREMENT003_APPROVAL, reviewType: "content_review" };
  assert.equal(hasApprovedFunrunEvidence([wrongType]), false);
});

test("SEMANTIC: missing marker (approved, correct reviewer/type, but no INCREMENT003 marker in notes) -> reject", () => {
  const noMarker: ReviewRecord = { ...INCREMENT003_APPROVAL, notes: buildRealNotes("Mathematics content reviewer", "Approved, looks good.", "") };
  assert.equal(hasApprovedFunrunEvidence([noMarker]), false);
});

test("SEMANTIC: wrong family_id -> reject (defence against a marker collision with a different family's approval)", () => {
  const wrongFamily: ReviewRecord = { ...INCREMENT003_APPROVAL, familyId: "mock-mr13-craftstall" };
  assert.equal(hasApprovedFunrunEvidence([wrongFamily]), false);
});

/**
 * MATHEMATICAL RE-VERIFICATION (mirrors Decision 193's own semantic
 * regression tests from mockMathematicsStructuralCapacityIncrement003Content.test.ts,
 * re-asserted here against the certification migration's own precondition
 * VALUES so a future drift between the two migrations is caught).
 */

test("MATH: independently re-verified answers 30/74/2.5/14 match the certification migration's own precondition values", () => {
  const laps = [0, 1, 2, 3, 4, 5];
  const freq = [3, 5, 8, 6, 5, 3];
  const totalRunners = freq.reduce((a, b) => a + b, 0);
  const totalLaps = laps.reduce((acc, l, i) => acc + l * freq[i], 0);
  const exactMean = totalLaps / totalRunners;
  const roundedMean = Math.round(exactMean * 10) / 10;
  const aboveMean = laps.reduce((acc, l, i) => acc + (l > exactMean ? freq[i] : 0), 0);
  assert.equal(totalRunners, 30);
  assert.equal(totalLaps, 74);
  assert.equal(roundedMean, 2.5);
  assert.equal(aboveMean, 14);
  assert.match(executable, /\('mock-mr09-funrun-01', '30'\)/);
  assert.match(executable, /\('mock-mr09-funrun-02', '74'\)/);
  assert.match(executable, /\('mock-mr09-funrun-03', '2\.5'\)/);
  assert.match(executable, /\('mock-mr09-funrun-04', '14'\)/);
});
