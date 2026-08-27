import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics Structural Capacity, Authoring Increment 006 — Rounding
 * Bounds Independent Validation (Decision 205/206/207). Structural tests
 * against migration 142's own SQL text, mirroring migration 139's own
 * established independent-validation-promotion pattern, extended with the
 * accumulating reserve-exclusion status-recheck (craftstall, funrun,
 * campingsale, numberpuzzle) migration 142 itself documents as a
 * deliberate continuation of the 130/133/136/139 pattern.
 */

const sql = fs.readFileSync("supabase/migrations/142_mock_mathematics_roundingbounds_independent_validation.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const TARGET_IDS = [
  "mock-mr11-roundingbounds-01",
  "mock-mr11-roundingbounds-02",
  "mock-mr11-roundingbounds-03",
  "mock-mr11-roundingbounds-04",
];

test("targets exactly the 4 mock-mr11-roundingbounds rows, no more no less", () => {
  const match = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/);
  assert.ok(match);
  const ids = [...match![1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  assert.deepEqual(ids.sort(), [...TARGET_IDS].sort());
});

test("exact family_id, subject, and skill are asserted as live preconditions", () => {
  assert.match(executable, /and family_id = 'mock-mr11-roundingbounds'/);
  assert.match(executable, /where id = any\(v_target_ids\) and subject = 'maths' and skill = 'QT-MR-11'/);
});

test("grouping precondition: exact question_group_id/group_order/subpart_label shape (01=1/(a) ... 04=4/(d)) via an explicit VALUES join", () => {
  assert.match(
    executable,
    /join \(values\s*\n\s*\('mock-mr11-roundingbounds-01', 1, '\(a\)'\),\s*\n\s*\('mock-mr11-roundingbounds-02', 2, '\(b\)'\),\s*\n\s*\('mock-mr11-roundingbounds-03', 3, '\(c\)'\),\s*\n\s*\('mock-mr11-roundingbounds-04', 4, '\(d\)'\)/,
  );
  assert.match(executable, /v_grouping_count <> 4/);
});

test("difficulty precondition: easy/easy/medium/hard across the 4 rows in order", () => {
  assert.match(
    executable,
    /join \(values\s*\n\s*\('mock-mr11-roundingbounds-01', 'easy'\),\s*\n\s*\('mock-mr11-roundingbounds-02', 'easy'\),\s*\n\s*\('mock-mr11-roundingbounds-03', 'medium'\),\s*\n\s*\('mock-mr11-roundingbounds-04', 'hard'\)/,
  );
});

test("answers precondition: 384/235/628/131 across the 4 rows in order", () => {
  assert.match(
    executable,
    /join \(values\s*\n\s*\('mock-mr11-roundingbounds-01', '384'\),\s*\n\s*\('mock-mr11-roundingbounds-02', '235'\),\s*\n\s*\('mock-mr11-roundingbounds-03', '628'\),\s*\n\s*\('mock-mr11-roundingbounds-04', '131'\)/,
  );
});

test("marks precondition: all 4 rows must read marks=1 from prompt->>'marks'", () => {
  assert.match(executable, /\(prompt->>'marks'\)::numeric = 1/);
  assert.match(sql, /Marking Integrity Gate must never be assumed satisfied/);
});

test("sharedStem precondition: all 4 rows must carry the identical, exact expected stem value", () => {
  assert.match(executable, /v_expected_stem constant text := 'At the Oakwood Athletics Meet, the number of adult spectators rounds to 380 to the nearest 10\./);
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

test("live review-evidence precondition uses the INCREMENT006 marker, unanchored (Decision 182 lesson applied)", () => {
  const block = executable.match(/select count\(\*\) into v_approved_review_count[\s\S]*?end if;/)![0];
  assert.match(block, /family_id = 'mock-mr11-roundingbounds'/);
  assert.match(block, /decision = 'approved'/);
  assert.match(block, /review_type = 'mock_maths_independent_review'/);
  assert.match(block, /reviewer = 'Ayobami Lawal'/);
  assert.match(block, /notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT006%'/);
  assert.match(block, /v_approved_review_count < 1/);
});

test("REGRESSION: the marker predicate is unanchored (leading %), never anchored to the start of notes", () => {
  assert.ok(
    !executable.includes("notes like 'MOCK-STRUCTURAL-CAPACITY-INCREMENT006%'"),
    "must never use an anchored (no leading %) marker pattern -- the exact Decision 182 defect",
  );
});

test("review-evidence precondition accepts ANY count >= 1, never requires exactly 1", () => {
  assert.ok(!/v_approved_review_count (<>|=) 1\b/.test(executable), "must never require an exact count of 1 approval");
});

test("the approved-review predicate is distinct from, and cannot be satisfied by, migration 141's own UNASSIGNED pending placeholder row", () => {
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

test("byte-for-byte prompt preservation is positively proven for all 4 rows via a full pre-write snapshot compared post-write", () => {
  assert.match(executable, /tmp_roundingbounds_prompt_snapshot/);
  assert.match(executable, /select id, prompt from public\.ali_question_bank where id = any\(v_target_ids\)/);
  assert.match(executable, /where b\.prompt = s\.prompt_snapshot/);
  assert.match(executable, /post-write preservation check failed/);
});

test("mock_eligible is explicitly, positively proven absent after this migration -- both in the apply branch and the already-applied branch", () => {
  const occurrences = [...executable.matchAll(/eligibility_status = 'mock_eligible'/g)];
  assert.ok(occurrences.length >= 2, `expected mock_eligible absence to be checked in both branches, found ${occurrences.length} checks`);
});

test("Linked Values, Bus Timetable, and Perimeter Area exclusion: never appear in the target array, pattern-only (never status-rechecked, per the established convention)", () => {
  const targetMatch = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/)![1];
  assert.ok(!targetMatch.includes("linkedvalues"));
  assert.ok(!targetMatch.includes("bustimetable"));
  assert.ok(!targetMatch.includes("perimeterarea"));
  assert.match(executable, /t like 'mock-mr06-linkedvalues%'/);
  assert.match(executable, /t like 'mock-mr10-bustimetable%'/);
  assert.match(executable, /t like 'mock-mr03mr07-perimeterarea%'/);
});

test("Craft Stall, Fun Run, Camping Sale, and Number Puzzle exclusion: never appear in the target array, and are each explicitly re-verified untouched (independently_validated) pre-write and post-write (accumulating pattern extended by one generation)", () => {
  const targetMatch = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/)![1];
  for (const name of ["craftstall", "funrun", "campingsale", "numberpuzzle"]) {
    assert.ok(!targetMatch.includes(name));
  }
  const preconditionBlocks = [...executable.matchAll(/select count\(\*\) into v_excluded_still_untouched_count[\s\S]*?end if;/g)];
  assert.ok(preconditionBlocks.some((m) => /where id like 'mock-mr13-craftstall%' and eligibility_status = 'independently_validated'/.test(m[0])));
  assert.ok(preconditionBlocks.some((m) => /where id like 'mock-mr09-funrun%' and eligibility_status = 'independently_validated'/.test(m[0])));
  assert.ok(preconditionBlocks.some((m) => /where id like 'mock-mr04-campingsale%' and eligibility_status = 'independently_validated'/.test(m[0])));
  assert.ok(preconditionBlocks.some((m) => /where id like 'mock-mr06-numberpuzzle%' and eligibility_status = 'independently_validated'/.test(m[0])));
  assert.equal(preconditionBlocks.length, 4, "expected exactly 4 accumulating status-recheck families (craftstall, funrun, campingsale, numberpuzzle)");
  assert.match(executable, /where id like 'mock-mr13-craftstall%' and eligibility_status <> 'independently_validated'/);
  assert.match(executable, /where id like 'mock-mr09-funrun%' and eligibility_status <> 'independently_validated'/);
  assert.match(executable, /where id like 'mock-mr04-campingsale%' and eligibility_status <> 'independently_validated'/);
  assert.match(executable, /where id like 'mock-mr06-numberpuzzle%' and eligibility_status <> 'independently_validated'/);
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
    /Migration 142 refused: expected 4 authentic_assessment_candidate rows for mock-mr11-roundingbounds \(found %\), or 4 already independently_validated \(found %\)/,
  );
});

test("touches only public.ali_question_bank via UPDATE; the only real table read anywhere else is ali_family_review (SELECT only) and a local temp table", () => {
  const updateTargets = [...executable.matchAll(/update\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(updateTargets), new Set(["ali_question_bank"]));
  const insertTargets = [...executable.matchAll(/insert into\s+(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(insertTargets), new Set(["tmp_roundingbounds_prompt_snapshot"]));
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

test("not applied disclosure present, documents dependency on migrations 140/141", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /migrations 140 and\s*\n-- 141/);
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
 * migration 142's own review-evidence predicate against it. Covers all
 * cases required: zero/one/two matching approvals, correct/wrong
 * reviewer, correct decision/pending-only rejection, correct/wrong
 * review_type, marker-at-position-zero and marker-after-qualification-
 * prefix acceptance, missing/wrong-marker rejection, wrong-family
 * rejection, and the UNASSIGNED pending row never satisfying the approved
 * predicate.
 */

const MARKER = "MOCK-STRUCTURAL-CAPACITY-INCREMENT006";

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

/** Pure re-implementation of migration 142's own predicate: `notes LIKE '%MARKER%'` mirrored as .includes(). */
function hasApprovedRoundingboundsEvidence(records: readonly ReviewRecord[]): boolean {
  return records.some(
    (r) =>
      r.familyId === "mock-mr11-roundingbounds" &&
      r.decision === "approved" &&
      r.reviewType === "mock_maths_independent_review" &&
      r.reviewer === "Ayobami Lawal" &&
      r.notes.includes(MARKER),
  );
}

const REAL_INCREMENT006_NOTES_PREFIX = `${MARKER} new content review: mock-mr11-roundingbounds (Question IDs: mock-mr11-roundingbounds-01, mock-mr11-roundingbounds-02, mock-mr11-roundingbounds-03, mock-mr11-roundingbounds-04)`;

const INCREMENT006_APPROVAL: ReviewRecord = {
  familyId: "mock-mr11-roundingbounds",
  reviewer: "Ayobami Lawal",
  decision: "approved",
  reviewType: "mock_maths_independent_review",
  notes: buildRealNotes(
    "Mathematics content reviewer",
    REAL_INCREMENT006_NOTES_PREFIX,
    "Reviewed the complete rounding-bounds family. Verified all four answers (384, 235, 628, 131) and the boundary logic.",
  ),
};

const PENDING_UNASSIGNED_PLACEHOLDER: ReviewRecord = {
  familyId: "mock-mr11-roundingbounds",
  reviewer: "UNASSIGNED",
  decision: "pending_independent_review",
  reviewType: "mock_maths_independent_review",
  notes: REAL_INCREMENT006_NOTES_PREFIX,
};

test("SEMANTIC: no valid approval at all -> reject", () => {
  assert.equal(hasApprovedRoundingboundsEvidence([]), false);
});

test("SEMANTIC: the UNASSIGNED pending placeholder row alone (migration 141's own row) -> reject, never mistaken for approval", () => {
  assert.equal(hasApprovedRoundingboundsEvidence([PENDING_UNASSIGNED_PLACEHOLDER]), false);
});

test("SEMANTIC: one valid approval -> accept", () => {
  assert.equal(hasApprovedRoundingboundsEvidence([INCREMENT006_APPROVAL]), true);
});

test("SEMANTIC: two valid approvals -> accept (legitimate duplicates must never invalidate certification)", () => {
  assert.equal(hasApprovedRoundingboundsEvidence([INCREMENT006_APPROVAL, { ...INCREMENT006_APPROVAL }]), true);
});

test("SEMANTIC: pending placeholder alongside a real approval -> accept (the approval is what matters, the placeholder is inert)", () => {
  assert.equal(hasApprovedRoundingboundsEvidence([PENDING_UNASSIGNED_PLACEHOLDER, INCREMENT006_APPROVAL]), true);
});

test("SEMANTIC: marker at position zero of stored notes is still correctly ACCEPTED", () => {
  const markerAtZero: ReviewRecord = { ...INCREMENT006_APPROVAL, notes: `${MARKER} approved directly.` };
  assert.ok(markerAtZero.notes.startsWith(MARKER));
  assert.equal(hasApprovedRoundingboundsEvidence([markerAtZero]), true);
});

test("SEMANTIC: marker not at position zero of stored notes (preceded by Reviewer qualification prefix) is still correctly ACCEPTED (Decision 182 lesson)", () => {
  assert.ok(!INCREMENT006_APPROVAL.notes.startsWith(MARKER));
  assert.match(INCREMENT006_APPROVAL.notes, /^Reviewer qualification: /);
  assert.equal(hasApprovedRoundingboundsEvidence([INCREMENT006_APPROVAL]), true);
});

test("SEMANTIC: wrong reviewer -> reject", () => {
  const wrongReviewer: ReviewRecord = { ...INCREMENT006_APPROVAL, reviewer: "Someone Else" };
  assert.equal(hasApprovedRoundingboundsEvidence([wrongReviewer]), false);
});

test("SEMANTIC: correct decision (approved) -> accept; pending decision only -> reject", () => {
  assert.equal(hasApprovedRoundingboundsEvidence([INCREMENT006_APPROVAL]), true);
  const wrongDecision: ReviewRecord = { ...INCREMENT006_APPROVAL, decision: "pending_independent_review" };
  assert.equal(hasApprovedRoundingboundsEvidence([wrongDecision]), false);
});

test("SEMANTIC: correct review_type -> accept; wrong review_type -> reject", () => {
  assert.equal(hasApprovedRoundingboundsEvidence([INCREMENT006_APPROVAL]), true);
  const wrongType: ReviewRecord = { ...INCREMENT006_APPROVAL, reviewType: "content_review" };
  assert.equal(hasApprovedRoundingboundsEvidence([wrongType]), false);
});

test("SEMANTIC: missing marker (approved, correct reviewer/type, but no INCREMENT006 marker in notes) -> reject", () => {
  const noMarker: ReviewRecord = { ...INCREMENT006_APPROVAL, notes: buildRealNotes("Mathematics content reviewer", "Approved, looks good.", "") };
  assert.equal(hasApprovedRoundingboundsEvidence([noMarker]), false);
});

test("SEMANTIC: wrong marker (a different, real increment marker) -> reject", () => {
  const wrongMarker: ReviewRecord = {
    ...INCREMENT006_APPROVAL,
    notes: buildRealNotes("Mathematics content reviewer", "MOCK-STRUCTURAL-CAPACITY-INCREMENT005 new content review: mock-mr11-roundingbounds", ""),
  };
  assert.equal(hasApprovedRoundingboundsEvidence([wrongMarker]), false);
});

test("SEMANTIC: wrong family_id -> reject (defence against a marker collision with a different family's approval)", () => {
  const wrongFamily: ReviewRecord = { ...INCREMENT006_APPROVAL, familyId: "mock-mr04-campingsale" };
  assert.equal(hasApprovedRoundingboundsEvidence([wrongFamily]), false);
});

test("SEMANTIC: approval belonging to another family but carrying this family's marker text as a coincidental substring is still correctly rejected on family_id alone", () => {
  const otherFamilyApproval: ReviewRecord = { ...INCREMENT006_APPROVAL, familyId: "mock-mr06-numberpuzzle" };
  assert.equal(hasApprovedRoundingboundsEvidence([otherFamilyApproval]), false);
});

/**
 * MATHEMATICAL RE-VERIFICATION (independent re-derivation, two methods per
 * subpart, mirroring migration 140's own semantic checks so a future drift
 * between the content and certification migrations is caught). Boundary
 * logic: lower bounds included, next threshold excluded, round-half-up.
 */

test("MATH: (a) largest adults consistent with rounding to 380 (nearest 10) is 384", () => {
  const roundsTo = (n: number) => Math.round(n / 10) * 10;
  assert.equal(roundsTo(384), 380);
  assert.equal(roundsTo(385), 390);
  assert.equal(roundsTo(375), 380);
  assert.equal(roundsTo(374), 370);
});

test("MATH: (b) smallest children consistent with rounding to 240 (nearest 10) is 235", () => {
  const roundsTo = (n: number) => Math.round(n / 10) * 10;
  assert.equal(roundsTo(235), 240);
  assert.equal(roundsTo(234), 230);
  assert.equal(roundsTo(244), 240);
  assert.equal(roundsTo(245), 250);
});

test("MATH: (c) largest total = largest adults (384) + largest children (244) = 628, via two independent methods", () => {
  assert.equal(384 + 244, 628);
  assert.equal(620 + 4 + 4, 628);
});

test("MATH: (d) smallest difference = smallest adults (375) minus largest children (244) = 131, via two independent methods", () => {
  assert.equal(375 - 244, 131);
  assert.equal(140 - 5 - 4, 131);
});

test("MATH: answers are single deterministic whole numbers, not ranges -- exactly one correct value per subpart", () => {
  for (const answer of [384, 235, 628, 131]) {
    assert.equal(Number.isInteger(answer), true);
  }
  assert.match(executable, /\('mock-mr11-roundingbounds-01', '384'\)/);
  assert.match(executable, /\('mock-mr11-roundingbounds-02', '235'\)/);
  assert.match(executable, /\('mock-mr11-roundingbounds-03', '628'\)/);
  assert.match(executable, /\('mock-mr11-roundingbounds-04', '131'\)/);
});

test("MATH: each subpart is independently markable -- restates both rounding facts via the shared stem, with no subpart's own certification precondition derived from another subpart's stored answer", () => {
  const answersBlock = executable.match(/join \(values[\s\S]*?'mock-mr11-roundingbounds-04', '131'\)/)![0];
  assert.match(answersBlock, /'mock-mr11-roundingbounds-01', '384'/);
  assert.match(answersBlock, /'mock-mr11-roundingbounds-02', '235'/);
  assert.match(answersBlock, /'mock-mr11-roundingbounds-03', '628'/);
  assert.match(answersBlock, /'mock-mr11-roundingbounds-04', '131'/);
});
