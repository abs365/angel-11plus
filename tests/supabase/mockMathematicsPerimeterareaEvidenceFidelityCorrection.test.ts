import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics: Perimeter Area Evidence-Fidelity Documentation Correction
 * (Decision 208/209). Structural + semantic tests against migration 143's
 * own SQL text, mirroring migration 127's own established
 * assertion-and-refuse pattern for a single-field correction, adapted for
 * a top-level `explanation` column correction across two rows rather than
 * a `prompt->>'question'` correction on one.
 */

const sql = fs.readFileSync("supabase/migrations/143_mock_mathematics_perimeterarea_evidence_fidelity_correction.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const OLD_EXPLANATION_01A = "Mathematics First Mock Minimum, Compound Content Batch 001 (Decision 163). Grouped numbered-question instance 1, subpart (a) — QT-MR-03 (Unit Conversion / Measurement Calculation), competency MR-01, family mock-mr03mr07-perimeterarea. Forms one displayed numbered question together with subpart (b) below (question_group_id mock-mr03mr07-perimeterarea-01), representing the same structural relationship the CSSE_QUESTION_INTELLIGENCE_FRAMEWORK's own Section 6 records at CSSE-006 Q14 (\"combines QT-MR-03 (rounding/measurement) with QT-MR-07 (geometric perimeter/area)\"), independently confirmed against the real 2023 mark scheme's own 2-subpart, 1-mark-each structure. Original Angel scenario, not a paraphrase of the source question. Answer independently recomputed: 250cm = 2.5m, perimeter = 2×(3.6+2.5) = 12.2m.";
const NEW_EXPLANATION_01A = "Mathematics First Mock Minimum, Compound Content Batch 001 (Decision 163). Grouped numbered-question instance 1, subpart (a) — QT-MR-03 (Unit Conversion / Measurement Calculation), competency MR-01, family mock-mr03mr07-perimeterarea. Forms one displayed numbered question together with subpart (b) below (question_group_id mock-mr03mr07-perimeterarea-01). Evidence-fidelity corrected (Decision 208/209): SOURCE-CONTAINS -- the real 2023 Q14 pairs a measurement step with a geometric perimeter/area step, but its measurement step is rounding-bounds derivation (a length and width each given only as a rounded figure, requiring the smallest possible perimeter/area consistent with that rounding). ANGEL-IMPLEMENTS -- exact unit conversion (250cm to 2.5m) followed by ordinary perimeter arithmetic on the converted exact dimensions, with no rounding or bounds reasoning required or implied. RELATIONSHIP: PARTIAL/TRANSFORMED GROUNDING -- the two-step measurement-then-geometry compound structure is genuinely evidenced by 2023 Q14 and by Decision 163's own independently-proven three-year compound-question norm; the specific rounding-bounds reasoning is not implemented here and is not claimed. Original Angel scenario, not a paraphrase of the source question. Answer independently recomputed: 250cm = 2.5m, perimeter = 2×(3.6+2.5) = 12.2m.";

const OLD_EXPLANATION_02A = "Mathematics First Mock Minimum, Compound Content Batch 001 (Decision 163). Grouped numbered-question instance 2, subpart (a) — QT-MR-03, family mock-mr03mr07-perimeterarea, variant 2 — a genuinely different unit pair (mm/cm rather than instance 1's cm/m) and real-world context (window pane, not a garden bed), not a relabelled copy. Answer independently recomputed: 450mm = 45cm, perimeter = 2×(90+45) = 270cm.";
const NEW_EXPLANATION_02A = "Mathematics First Mock Minimum, Compound Content Batch 001 (Decision 163). Grouped numbered-question instance 2, subpart (a) — QT-MR-03, family mock-mr03mr07-perimeterarea, variant 2 — a genuinely different unit pair (mm/cm rather than instance 1's cm/m) and real-world context (window pane, not a garden bed), not a relabelled copy. Evidence-fidelity corrected (Decision 208/209): SOURCE-CONTAINS -- the real 2023 Q14 pairs a measurement step with a geometric perimeter/area step, but its measurement step is rounding-bounds derivation. ANGEL-IMPLEMENTS -- exact unit conversion (450mm to 45cm) followed by ordinary perimeter arithmetic on the converted exact dimensions, with no rounding or bounds reasoning required or implied. RELATIONSHIP: PARTIAL/TRANSFORMED GROUNDING -- the two-step measurement-then-geometry compound structure is genuinely evidenced by 2023 Q14 and by Decision 163's own independently-proven three-year compound-question norm; the specific rounding-bounds reasoning is not implemented here and is not claimed. Answer independently recomputed: 450mm = 45cm, perimeter = 2×(90+45) = 270cm.";

test("the evidence-fidelity defect is real: OLD text claims the same structural relationship as 2023 Q14's confirmed structure without distinguishing rounding-bounds (source) from unit-conversion (Angel)", () => {
  assert.match(OLD_EXPLANATION_01A, /representing the same structural relationship/);
  assert.match(OLD_EXPLANATION_01A, /CSSE-006 Q14/);
  assert.ok(!/rounding-bounds|SOURCE-CONTAINS|ANGEL-IMPLEMENTS/.test(OLD_EXPLANATION_01A), "the old text never distinguishes source-grounded from authored content");
});

test("the corrected wording explicitly states SOURCE-CONTAINS, ANGEL-IMPLEMENTS, and RELATIONSHIP: PARTIAL/TRANSFORMED GROUNDING for both rows", () => {
  for (const text of [NEW_EXPLANATION_01A, NEW_EXPLANATION_02A]) {
    assert.match(text, /SOURCE-CONTAINS/);
    assert.match(text, /ANGEL-IMPLEMENTS/);
    assert.match(text, /RELATIONSHIP: PARTIAL\/TRANSFORMED GROUNDING/);
    assert.match(text, /rounding-bounds/);
  }
});

test("the corrected wording never presents 2023 Q14 as direct evidence for the substituted unit-conversion reasoning", () => {
  for (const text of [NEW_EXPLANATION_01A, NEW_EXPLANATION_02A]) {
    assert.ok(!/representing the same structural relationship/.test(text), "must not repeat the overstated grounding claim");
    assert.match(text, /is not implemented here and is not claimed/);
  }
});

test("mathematical answers are unchanged in the corrected explanation text: 12.2m and 270cm, re-derived independently", () => {
  assert.equal(250 / 100, 2.5);
  assert.equal(2 * (3.6 + 2.5), 12.2);
  assert.equal(450 / 10, 45);
  assert.equal(2 * (90 + 45), 270);
  assert.match(NEW_EXPLANATION_01A, /perimeter = 2×\(3\.6\+2\.5\) = 12\.2m/);
  assert.match(NEW_EXPLANATION_02A, /perimeter = 2×\(90\+45\) = 270cm/);
});

test("old wording is present verbatim in the migration's own v_old_explanation constants, and the new wording is present verbatim in v_new_explanation constants", () => {
  assert.ok(executable.includes(`v_old_explanation_01a constant text := '${OLD_EXPLANATION_01A.replace(/'/g, "''")}';`));
  assert.ok(executable.includes(`v_new_explanation_01a constant text := '${NEW_EXPLANATION_01A.replace(/'/g, "''")}';`));
  assert.ok(executable.includes(`v_old_explanation_02a constant text := '${OLD_EXPLANATION_02A.replace(/'/g, "''")}';`));
  assert.ok(executable.includes(`v_new_explanation_02a constant text := '${NEW_EXPLANATION_02A.replace(/'/g, "''")}';`));
});

test("targets exactly mock-mr03mr07-perimeterarea-01a and -02a -- no other row's id ever appears as an UPDATE target", () => {
  assert.match(executable, /set explanation = v_new_explanation_01a\s*\n\s*where id = 'mock-mr03mr07-perimeterarea-01a'/);
  assert.match(executable, /set explanation = v_new_explanation_02a\s*\n\s*where id = 'mock-mr03mr07-perimeterarea-02a'/);
  const otherIds = ["mock-mr03mr07-perimeterarea-01b", "mock-mr03mr07-perimeterarea-02b"];
  for (const id of otherIds) {
    assert.ok(!executable.includes(`'${id}'`), `${id} must never be referenced`);
  }
});

test("only the explanation column is ever SET -- no other column is ever SET", () => {
  const setColumns = [...executable.matchAll(/\bset\s+([a-z_]+)\s*=/gi)].map((m) => m[1].toLowerCase());
  assert.deepEqual(new Set(setColumns), new Set(["explanation"]));
});

test("live preconditions verify family_id, subject, skill, active, eligibility_status, marking_mode, content_difficulty, grouping, answer, and marks for both rows before any write", () => {
  const preconditionBlock = executable.match(/select count\(\*\) into v_precondition_count[\s\S]*?end if;/)![0];
  assert.match(preconditionBlock, /family_id = 'mock-mr03mr07-perimeterarea'/);
  assert.match(preconditionBlock, /subject = 'maths'/);
  assert.match(preconditionBlock, /skill = 'QT-MR-03'/);
  assert.match(preconditionBlock, /eligibility_status = 'independently_validated'/);
  assert.match(preconditionBlock, /marking_mode = 'deterministic'/);
  assert.match(preconditionBlock, /content_difficulty::text = 'hard'/);
  assert.match(preconditionBlock, /group_order = 1/);
  assert.match(preconditionBlock, /subpart_label = '\(a\)'/);
  assert.match(preconditionBlock, /'mock-mr03mr07-perimeterarea-01a', 'mock-mr03mr07-perimeterarea-01', '12\.2'/);
  assert.match(preconditionBlock, /'mock-mr03mr07-perimeterarea-02a', 'mock-mr03mr07-perimeterarea-02', '270'/);
  assert.match(executable, /v_precondition_count <> 2/);
});

test("byte-for-byte prompt preservation is positively proven for both rows via a full pre-write snapshot of the entire prompt jsonb compared post-write", () => {
  assert.match(executable, /tmp_perimeterarea_evidence_correction_snapshot/);
  assert.match(executable, /select id, prompt from public\.ali_question_bank where id = any\(v_target_ids\)/);
  assert.match(executable, /where b\.prompt = s\.prompt_snapshot/);
  assert.match(executable, /post-write preservation check failed/);
});

test("post-write structural re-check re-verifies family_id/active/eligibility_status/marking_mode/content_difficulty/grouping unchanged for both rows", () => {
  const postWriteBlock = executable.match(/select count\(\*\) into v_post_write_structural_count[\s\S]*?post-write structural verification failed/)![0];
  assert.match(postWriteBlock, /family_id = 'mock-mr03mr07-perimeterarea'/);
  assert.match(postWriteBlock, /eligibility_status = 'independently_validated'/);
  assert.match(postWriteBlock, /content_difficulty::text = 'hard'/);
  assert.match(postWriteBlock, /group_order = 1/);
  assert.match(postWriteBlock, /subpart_label = '\(a\)'/);
});

test("idempotent structure: the already-corrected branch (v_already_corrected_count = 2) contains no UPDATE statement", () => {
  const alreadyAppliedBranch = executable.match(/elsif v_already_corrected_count = 2 then[\s\S]*?else/)![0];
  assert.ok(!/\bupdate\s+public\.ali_question_bank\b/i.test(alreadyAppliedBranch));
});

test("mixed/unexpected state (neither old nor new wording present on both rows) is explicitly refused via RAISE EXCEPTION", () => {
  assert.match(executable, /Migration 143 refused: expected both target rows to carry the exact pre-correction explanation text/);
});

test("no ali_family_review, ali_mock_form, mock_eligible, or RPC/RLS mutation anywhere -- Decision 208's own rule that no fresh review is required for a documentation-only correction is upheld structurally, not just asserted", () => {
  for (const table of ["ali_family_review", "ali_mock_form"]) {
    assert.ok(!executable.includes(table));
  }
  assert.ok(!executable.includes("mock_eligible"));
  assert.ok(!/create (or replace )?function|create policy|alter policy|\bgrant\b|\brevoke\b/i.test(executable));
});

test("eligibility_status is never referenced in a SET clause anywhere -- certification is structurally preserved, not merely asserted in prose", () => {
  assert.ok(!/set\s+eligibility_status/i.test(executable));
});

test("wrapped in a single begin/commit transaction, header discloses NOT APPLIED and cites Decision 208/209", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /Decision 208\/209/);
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
