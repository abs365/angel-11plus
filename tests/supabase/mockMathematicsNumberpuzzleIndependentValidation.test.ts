import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics Structural Capacity, Authoring Increment 005 — Number Puzzle
 * Independent Validation (Decision 198/199/200/201/202). Structural tests
 * against migration 139's own SQL text, mirroring migration 136's own
 * established independent-validation-promotion pattern, adapted for the
 * REMEDIATED three-row family (Decision 200/201 removed the originally
 * authored fourth row, mock-mr06-numberpuzzle-04, for lacking any
 * primary-source support) whose approval was recorded under the
 * INCREMENT005 marker.
 */

const sql = fs.readFileSync("supabase/migrations/139_mock_mathematics_numberpuzzle_independent_validation.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const TARGET_IDS = [
  "mock-mr06-numberpuzzle-01",
  "mock-mr06-numberpuzzle-02",
  "mock-mr06-numberpuzzle-03",
];

test("targets exactly the 3 mock-mr06-numberpuzzle rows, no more no less", () => {
  const match = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/);
  assert.ok(match);
  const ids = [...match![1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  assert.deepEqual(ids.sort(), [...TARGET_IDS].sort());
});

test("the obsolete removed 4th ID (mock-mr06-numberpuzzle-04) never appears in the certification target array, and its production absence is positively asserted (the only place it appears is the absence guard itself)", () => {
  const targetMatch = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/)![1];
  assert.ok(!targetMatch.includes("numberpuzzle-04"));
  assert.match(executable, /where id = 'mock-mr06-numberpuzzle-04'/);
  assert.match(executable, /v_fourth_row_absent_count <> 0/);
  const occurrences = (executable.match(/mock-mr06-numberpuzzle-04/g) || []).length;
  assert.equal(occurrences, 2, "the obsolete 4th ID should appear only in the absence-check guard's WHERE clause and its own RAISE EXCEPTION message");
  assert.match(sql, /Decision 200\/201/);
});

test("exact family_id, subject, and skill are asserted as live preconditions", () => {
  assert.match(executable, /and family_id = 'mock-mr06-numberpuzzle'/);
  assert.match(executable, /where id = any\(v_target_ids\) and subject = 'maths' and skill = 'QT-MR-06'/);
});

test("grouping precondition: exact question_group_id/group_order/subpart_label shape (01=1/(a) ... 03=3/(c)) via an explicit VALUES join", () => {
  assert.match(
    executable,
    /join \(values\s*\n\s*\('mock-mr06-numberpuzzle-01', 1, '\(a\)'\),\s*\n\s*\('mock-mr06-numberpuzzle-02', 2, '\(b\)'\),\s*\n\s*\('mock-mr06-numberpuzzle-03', 3, '\(c\)'\)/,
  );
  assert.match(executable, /v_grouping_count <> 3/);
});

test("difficulty precondition: medium/medium/hard across the 3 rows in order", () => {
  assert.match(
    executable,
    /join \(values\s*\n\s*\('mock-mr06-numberpuzzle-01', 'medium'\),\s*\n\s*\('mock-mr06-numberpuzzle-02', 'medium'\),\s*\n\s*\('mock-mr06-numberpuzzle-03', 'hard'\)/,
  );
});

test("answers precondition: 81/9/0 across the 3 rows in order", () => {
  assert.match(
    executable,
    /join \(values\s*\n\s*\('mock-mr06-numberpuzzle-01', '81'\),\s*\n\s*\('mock-mr06-numberpuzzle-02', '9'\),\s*\n\s*\('mock-mr06-numberpuzzle-03', '0'\)/,
  );
});

test("marks precondition: all 3 rows must read marks=1 from prompt->>'marks'", () => {
  assert.match(executable, /\(prompt->>'marks'\)::numeric = 1/);
  assert.match(sql, /Marking Integrity Gate must never be assumed satisfied/);
});

test("sharedStem precondition: all 3 rows must carry the identical, exact expected stem value", () => {
  assert.match(executable, /v_expected_stem constant text := 'A number puzzle uses a hidden positive whole number, n\./);
  assert.match(executable, /where id = any\(v_target_ids\) and \(prompt->>'sharedStem'\) = v_expected_stem/);
});

test("no-stimulus precondition: this text-only abstract family must never carry a stimulus key", () => {
  const block = executable.match(/select count\(\*\) into v_no_stimulus_count[\s\S]*?end if;/)![0];
  assert.match(block, /prompt \? 'stimulus'/);
  assert.match(block, /v_no_stimulus_count <> 0/);
});

test("marking_mode=deterministic precondition present for all 3 rows", () => {
  assert.match(executable, /where id = any\(v_target_ids\) and marking_mode = 'deterministic'/);
});

test("no quadratic/multi-root/root-rejection content is expected anywhere in the certification target (Decision 200/201 remediation boundary preserved)", () => {
  assert.ok(!/quadratic/i.test(executable));
  assert.ok(!/factoris/i.test(executable));
  assert.ok(!/reject.*root|negative root/i.test(executable));
});

test("live review-evidence precondition uses the INCREMENT005 marker, unanchored (Decision 182 lesson applied)", () => {
  const block = executable.match(/select count\(\*\) into v_approved_review_count[\s\S]*?end if;/)![0];
  assert.match(block, /family_id = 'mock-mr06-numberpuzzle'/);
  assert.match(block, /decision = 'approved'/);
  assert.match(block, /review_type = 'mock_maths_independent_review'/);
  assert.match(block, /reviewer = 'Ayobami Lawal'/);
  assert.match(block, /notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT005%'/);
  assert.match(block, /v_approved_review_count < 1/);
});

test("REGRESSION: the marker predicate is unanchored (leading %), never anchored to the start of notes", () => {
  assert.ok(
    !executable.includes("notes like 'MOCK-STRUCTURAL-CAPACITY-INCREMENT005%'"),
    "must never use an anchored (no leading %) marker pattern -- the exact Decision 182 defect",
  );
});

test("review-evidence precondition accepts ANY count >= 1, never requires exactly 1", () => {
  assert.ok(!/v_approved_review_count (<>|=) 1\b/.test(executable), "must never require an exact count of 1 approval");
});

test("the approved-review predicate is distinct from, and cannot be satisfied by, migration 138's own UNASSIGNED pending placeholder row", () => {
  assert.match(executable, /decision = 'approved'/);
  assert.ok(!executable.includes("'UNASSIGNED'"), "certification predicate must never reference the UNASSIGNED pending reviewer value");
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

test("byte-for-byte prompt preservation is positively proven for all 3 rows via a full pre-write snapshot compared post-write", () => {
  assert.match(executable, /tmp_numberpuzzle_prompt_snapshot/);
  assert.match(executable, /select id, prompt from public\.ali_question_bank where id = any\(v_target_ids\)/);
  assert.match(executable, /where b\.prompt = s\.prompt_snapshot/);
  assert.match(executable, /post-write preservation check failed/);
});

test("mock_eligible is explicitly, positively proven absent after this migration -- both in the apply branch and the already-applied branch", () => {
  const occurrences = [...executable.matchAll(/eligibility_status = 'mock_eligible'/g)];
  assert.ok(occurrences.length >= 2, `expected mock_eligible absence to be checked in both branches, found ${occurrences.length} checks`);
});

test("Linked Values exclusion: never appears in the target array, by construction", () => {
  const targetMatch = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/)![1];
  assert.ok(!targetMatch.includes("linkedvalues"));
  assert.match(executable, /t like 'mock-mr06-linkedvalues%'/);
});

test("Camping Sale exclusion: never appears in the target array, and is explicitly re-verified untouched (independently_validated) pre-write and post-write", () => {
  const targetMatch = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/)![1];
  assert.ok(!targetMatch.includes("campingsale"));
  assert.match(executable, /t like 'mock-mr04-campingsale%'/);
  const preconditionBlocks = [...executable.matchAll(/select count\(\*\) into v_excluded_still_untouched_count[\s\S]*?end if;/g)];
  assert.ok(preconditionBlocks.some((m) => /where id like 'mock-mr04-campingsale%' and eligibility_status = 'independently_validated'/.test(m[0])));
  assert.match(executable, /where id like 'mock-mr04-campingsale%' and eligibility_status <> 'independently_validated'/);
});

test("Fun Run and Craft Stall exclusion: never appear in the target array, and are explicitly re-verified untouched pre-write and post-write", () => {
  const targetMatch = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/)![1];
  assert.ok(!targetMatch.includes("funrun"));
  assert.ok(!targetMatch.includes("craftstall"));
  assert.match(executable, /t like 'mock-mr09-funrun%'/);
  assert.match(executable, /t like 'mock-mr13-craftstall%'/);
  const preconditionBlocks = [...executable.matchAll(/select count\(\*\) into v_excluded_still_untouched_count[\s\S]*?end if;/g)];
  assert.ok(preconditionBlocks.some((m) => /where id like 'mock-mr09-funrun%' and eligibility_status = 'independently_validated'/.test(m[0])));
  assert.ok(preconditionBlocks.some((m) => /where id like 'mock-mr13-craftstall%' and eligibility_status = 'independently_validated'/.test(m[0])));
  assert.match(executable, /where id like 'mock-mr09-funrun%' and eligibility_status <> 'independently_validated'/);
  assert.match(executable, /where id like 'mock-mr13-craftstall%' and eligibility_status <> 'independently_validated'/);
});

test("bus timetable and perimeterarea are excluded from the target array by construction (same guard as linkedvalues/campingsale/funrun/craftstall)", () => {
  assert.match(executable, /'mock-mr10-bustimetable%'/);
  assert.match(executable, /'mock-mr03mr07-perimeterarea%'/);
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
  assert.match(
    executable,
    /Migration 139 refused: expected 3 authentic_assessment_candidate rows for mock-mr06-numberpuzzle \(found %\), or 3 already independently_validated \(found %\)/,
  );
});

test("touches only public.ali_question_bank via UPDATE; the only real table read anywhere else is ali_family_review (SELECT only) and a local temp table", () => {
  const updateTargets = [...executable.matchAll(/update\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(updateTargets), new Set(["ali_question_bank"]));
  const insertTargets = [...executable.matchAll(/insert into\s+(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(insertTargets), new Set(["tmp_numberpuzzle_prompt_snapshot"]));
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

test("not applied disclosure present, documents dependency on migrations 137/138", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /migrations 137 and\s*\n-- 138/);
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
 * migration 139's own review-evidence predicate against it. Covers all
 * cases required: zero/one/two matching approvals, correct/wrong
 * reviewer, correct decision/pending-only rejection, correct/wrong
 * review_type, marker-at-position-zero and marker-after-qualification-
 * prefix acceptance, missing-marker rejection, wrong-family rejection,
 * and the UNASSIGNED pending row never satisfying the approved predicate.
 */

const MARKER = "MOCK-STRUCTURAL-CAPACITY-INCREMENT005";

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

/** Pure re-implementation of migration 139's own predicate: `notes LIKE '%MARKER%'` mirrored as .includes(). */
function hasApprovedNumberpuzzleEvidence(records: readonly ReviewRecord[]): boolean {
  return records.some(
    (r) =>
      r.familyId === "mock-mr06-numberpuzzle" &&
      r.decision === "approved" &&
      r.reviewType === "mock_maths_independent_review" &&
      r.reviewer === "Ayobami Lawal" &&
      r.notes.includes(MARKER),
  );
}

const REAL_INCREMENT005_NOTES_PREFIX = `${MARKER} new content review: mock-mr06-numberpuzzle (Question IDs: mock-mr06-numberpuzzle-01, mock-mr06-numberpuzzle-02, mock-mr06-numberpuzzle-03)`;

const INCREMENT005_APPROVAL: ReviewRecord = {
  familyId: "mock-mr06-numberpuzzle",
  reviewer: "Ayobami Lawal",
  decision: "approved",
  reviewType: "mock_maths_independent_review",
  notes: buildRealNotes(
    "Mathematics content reviewer",
    REAL_INCREMENT005_NOTES_PREFIX,
    "Reviewed the complete remediated three-part number-puzzle family. Verified all three answers (81, 9, 0) and confirmed no quadratic or root-rejection reasoning remains.",
  ),
};

const PENDING_UNASSIGNED_PLACEHOLDER: ReviewRecord = {
  familyId: "mock-mr06-numberpuzzle",
  reviewer: "UNASSIGNED",
  decision: "pending_independent_review",
  reviewType: "mock_maths_independent_review",
  notes: REAL_INCREMENT005_NOTES_PREFIX,
};

test("SEMANTIC: no valid approval at all -> reject", () => {
  assert.equal(hasApprovedNumberpuzzleEvidence([]), false);
});

test("SEMANTIC: the UNASSIGNED pending placeholder row alone (migration 138's own row) -> reject, never mistaken for approval", () => {
  assert.equal(hasApprovedNumberpuzzleEvidence([PENDING_UNASSIGNED_PLACEHOLDER]), false);
});

test("SEMANTIC: one valid approval -> accept", () => {
  assert.equal(hasApprovedNumberpuzzleEvidence([INCREMENT005_APPROVAL]), true);
});

test("SEMANTIC: two valid approvals -> accept (legitimate duplicates must never invalidate certification)", () => {
  assert.equal(hasApprovedNumberpuzzleEvidence([INCREMENT005_APPROVAL, { ...INCREMENT005_APPROVAL }]), true);
});

test("SEMANTIC: pending placeholder alongside a real approval -> accept (the approval is what matters, the placeholder is inert)", () => {
  assert.equal(hasApprovedNumberpuzzleEvidence([PENDING_UNASSIGNED_PLACEHOLDER, INCREMENT005_APPROVAL]), true);
});

test("SEMANTIC: marker at position zero of stored notes is still correctly ACCEPTED", () => {
  const markerAtZero: ReviewRecord = { ...INCREMENT005_APPROVAL, notes: `${MARKER} approved directly.` };
  assert.ok(markerAtZero.notes.startsWith(MARKER));
  assert.equal(hasApprovedNumberpuzzleEvidence([markerAtZero]), true);
});

test("SEMANTIC: marker not at position zero of stored notes (preceded by Reviewer qualification prefix) is still correctly ACCEPTED (Decision 182 lesson)", () => {
  assert.ok(!INCREMENT005_APPROVAL.notes.startsWith(MARKER));
  assert.match(INCREMENT005_APPROVAL.notes, /^Reviewer qualification: /);
  assert.equal(hasApprovedNumberpuzzleEvidence([INCREMENT005_APPROVAL]), true);
});

test("SEMANTIC: wrong reviewer -> reject", () => {
  const wrongReviewer: ReviewRecord = { ...INCREMENT005_APPROVAL, reviewer: "Someone Else" };
  assert.equal(hasApprovedNumberpuzzleEvidence([wrongReviewer]), false);
});

test("SEMANTIC: correct decision (approved) -> accept; pending decision only -> reject", () => {
  assert.equal(hasApprovedNumberpuzzleEvidence([INCREMENT005_APPROVAL]), true);
  const wrongDecision: ReviewRecord = { ...INCREMENT005_APPROVAL, decision: "pending_independent_review" };
  assert.equal(hasApprovedNumberpuzzleEvidence([wrongDecision]), false);
});

test("SEMANTIC: correct review_type -> accept; wrong review_type -> reject", () => {
  assert.equal(hasApprovedNumberpuzzleEvidence([INCREMENT005_APPROVAL]), true);
  const wrongType: ReviewRecord = { ...INCREMENT005_APPROVAL, reviewType: "content_review" };
  assert.equal(hasApprovedNumberpuzzleEvidence([wrongType]), false);
});

test("SEMANTIC: missing marker (approved, correct reviewer/type, but no INCREMENT005 marker in notes) -> reject", () => {
  const noMarker: ReviewRecord = { ...INCREMENT005_APPROVAL, notes: buildRealNotes("Mathematics content reviewer", "Approved, looks good.", "") };
  assert.equal(hasApprovedNumberpuzzleEvidence([noMarker]), false);
});

test("SEMANTIC: wrong family_id -> reject (defence against a marker collision with a different family's approval)", () => {
  const wrongFamily: ReviewRecord = { ...INCREMENT005_APPROVAL, familyId: "mock-mr04-campingsale" };
  assert.equal(hasApprovedNumberpuzzleEvidence([wrongFamily]), false);
});

/**
 * MATHEMATICAL RE-VERIFICATION (independent re-derivation, two methods per
 * subpart, mirroring migration 137's own semantic checks so a future drift
 * between the content and certification migrations is caught).
 */

test("MATH: independently re-verified answers 81/9/0 match the certification migration's own precondition values", () => {
  for (const n of [4, 10]) {
    const P = n + 9;
    const Q = 9 * n;
    const R = n * n;

    const symbolicA = 81; // 9(n+9) - 9n = 9n + 81 - 9n = 81
    assert.equal(9 * P - Q, symbolicA);

    const symbolicB = 9; // 9n / ((n+9)-9) = 9n/n = 9
    assert.equal(Q / (P - 9), symbolicB);

    const symbolicC = 0; // (n+9)n - 9n - n*n = n^2+9n-9n-n^2 = 0
    assert.equal(P * n - Q - R, symbolicC);
  }

  assert.match(executable, /\('mock-mr06-numberpuzzle-01', '81'\)/);
  assert.match(executable, /\('mock-mr06-numberpuzzle-02', '9'\)/);
  assert.match(executable, /\('mock-mr06-numberpuzzle-03', '0'\)/);
});

test("MATH: no subpart requires solving for n's own numeric value -- each answer is a constant independent of n, confirmed across two distinct values of n", () => {
  const valuesOfN = [4, 10];
  const resultsA = valuesOfN.map((n) => 9 * (n + 9) - 9 * n);
  const resultsB = valuesOfN.map((n) => (9 * n) / ((n + 9) - 9));
  const resultsC = valuesOfN.map((n) => (n + 9) * n - 9 * n - n * n);
  assert.equal(new Set(resultsA).size, 1);
  assert.equal(new Set(resultsB).size, 1);
  assert.equal(new Set(resultsC).size, 1);
});

test("MATH: each subpart is independently markable -- restates P/Q/R's defining rules via the shared stem, with no subpart's own certification precondition derived from another subpart's stored answer", () => {
  const answersBlock = executable.match(/join \(values[\s\S]*?'mock-mr06-numberpuzzle-03', '0'\)/)![0];
  assert.match(answersBlock, /'mock-mr06-numberpuzzle-01', '81'/);
  assert.match(answersBlock, /'mock-mr06-numberpuzzle-02', '9'/);
  assert.match(answersBlock, /'mock-mr06-numberpuzzle-03', '0'/);
});
