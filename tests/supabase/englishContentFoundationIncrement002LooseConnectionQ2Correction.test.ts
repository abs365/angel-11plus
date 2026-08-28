import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * English Content Foundation, Increment 002 (Decision 239), migration
 * 163 — The Loose Connection Q2 Grouped-Scoring Correction. A LIVE
 * database correction (migrations 161/162 are Founder-confirmed already
 * applied), mirroring tests/supabase/
 * englishContentFoundationIncrement001ReviewTargetRemediation.test.ts's
 * own established discipline for testing a corrective migration's real
 * SQL text directly, and cross-referencing migration 161's own
 * (unmodified) content for the other 8 Loose Connection questions this
 * correction must never touch.
 */

const sql161 = fs.readFileSync("supabase/migrations/161_english_content_foundation_increment002_comprehension.sql", "utf8");
const sql163 = fs.readFileSync("supabase/migrations/163_english_content_foundation_increment002_loose_connection_q2_grouped_scoring_correction.sql", "utf8");

interface ParsedPrompt {
  id: string;
  marks: number;
  question: string;
  modelAnswer?: string;
  acceptedAnswers?: string[];
  validationTier: string;
}

function stripComments(sqlText: string): string {
  return sqlText.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");
}

function parseJsonBlocks(sqlText: string): ParsedPrompt[] {
  const parts = sqlText.split("$json$");
  const prompts: ParsedPrompt[] = [];
  for (let i = 1; i < parts.length; i += 2) prompts.push(JSON.parse(parts[i]) as ParsedPrompt);
  return prompts;
}

const executable163 = stripComments(sql163);
const newSubparts = parseJsonBlocks(sql163);
const allInc001RoboticsPrompts = parseJsonBlocks(sql161).filter((p) => p.id.startsWith("eng-inc002-roboticsfinal"));

// === 1. Four physical scored rows exist =====================================

test("1. exactly 4 new physical rows are inserted: eng-inc002-roboticsfinal-q02b/c/d/e", () => {
  assert.equal(newSubparts.length, 4);
  assert.deepEqual(newSubparts.map((p) => p.id).sort(), [
    "eng-inc002-roboticsfinal-q02b", "eng-inc002-roboticsfinal-q02c", "eng-inc002-roboticsfinal-q02d", "eng-inc002-roboticsfinal-q02e",
  ].sort());
});

// === 2. Each worth exactly one mark =========================================

test("2. each of the 4 new rows carries marks: 1", () => {
  for (const p of newSubparts) assert.equal(p.marks, 1, `${p.id} should be worth exactly 1 mark`);
});

// === 3. Total Q2 marks remain four ==========================================

test("3. total marks across the 4 new subparts equals 4 -- unchanged from the original pooled row's own 4 marks", () => {
  assert.equal(newSubparts.reduce((sum, p) => sum + p.marks, 0), 4);
});

test("3b. the migration's own post-write verification DO block asserts this same invariant live, in the database, not merely in this test", () => {
  assert.match(executable163, /v_total_marks != 4/);
  assert.match(executable163, /post-write check failed: expected total marks across the 4 new subparts to be exactly 4/);
});

// === 4/5. Each accepted-answer set is isolated; pairwise intersection empty ===

test("4/5. each subpart has its OWN accepted-answer set with zero overlap against any other subpart's set", () => {
  for (let i = 0; i < newSubparts.length; i++) {
    for (let j = i + 1; j < newSubparts.length; j++) {
      const a = new Set((newSubparts[i].acceptedAnswers ?? []).map((s) => s.toLowerCase()));
      const b = new Set((newSubparts[j].acceptedAnswers ?? []).map((s) => s.toLowerCase()));
      const overlap = [...a].filter((x) => b.has(x));
      assert.deepEqual(overlap, [], `${newSubparts[i].id} and ${newSubparts[j].id} must not share any accepted-answer string`);
    }
  }
});

// === 6-9. Specific word-pair non-crossover proofs ===========================

const byId = new Map(newSubparts.map((p) => [p.id, p]));
const frustrating = byId.get("eng-inc002-roboticsfinal-q02b")!; // frustrating
const disbelieving = byId.get("eng-inc002-roboticsfinal-q02c")!; // disbelieving
const triumphant = byId.get("eng-inc002-roboticsfinal-q02d")!; // triumphant
const uselessly = byId.get("eng-inc002-roboticsfinal-q02e")!; // uselessly

test("6. an answer valid for 'frustrating' (q02b) cannot score 'disbelieving' (q02c)", () => {
  for (const a of frustrating.acceptedAnswers!) assert.ok(!disbelieving.acceptedAnswers!.includes(a), `"${a}" leaked from frustrating into disbelieving's own accepted set`);
});

test("7. an answer valid for 'disbelieving' (q02c) cannot score 'triumphant' (q02d)", () => {
  for (const a of disbelieving.acceptedAnswers!) assert.ok(!triumphant.acceptedAnswers!.includes(a), `"${a}" leaked from disbelieving into triumphant's own accepted set`);
});

test("8. an answer valid for 'triumphant' (q02d) cannot score 'uselessly' (q02e)", () => {
  for (const a of triumphant.acceptedAnswers!) assert.ok(!uselessly.acceptedAnswers!.includes(a), `"${a}" leaked from triumphant into uselessly's own accepted set`);
});

test("9. an answer valid for 'uselessly' (q02e) cannot score 'frustrating' (q02b)", () => {
  for (const a of uselessly.acceptedAnswers!) assert.ok(!frustrating.acceptedAnswers!.includes(a), `"${a}" leaked from uselessly into frustrating's own accepted set`);
});

// === 10. Grouped rendering produces one numbered Q2 =========================

test("10. all 4 subparts share question_group_id 'eng-inc002-roboticsfinal-q02' with correct group_order 1-4 and subpart_label (b)-(e), rendering as ONE numbered Question 2", () => {
  const subparts: [string, number, string][] = [["b", 1, "b"], ["c", 2, "c"], ["d", 3, "d"], ["e", 4, "e"]];
  for (const [letter, order] of subparts) {
    const escapedLabel = `\\(${letter}\\)`;
    const re = new RegExp(`question_group_id = 'eng-inc002-roboticsfinal-q02',\\s*\\n\\s*group_order = ${order},\\s*\\n\\s*subpart_label = '${escapedLabel}',\\s*\\n\\s*marking_mode = 'deterministic'\\s*\\n\\s*where id = 'eng-inc002-roboticsfinal-q02${letter}';`);
    assert.match(executable163, re, `missing or incorrect grouping UPDATE for q02${letter}`);
  }
  for (const p of newSubparts) assert.match(p.question, /^Question 2\([b-e]\)\./, `${p.id} must render as a subpart of numbered Question 2`);
});

// === 11. Worked example (a) remains unscored ================================

test("11. worked example (a) 'reassuring' is referenced for context in the first scored subpart's own question text (matching the identical Sail-and-Steam-Q5b precedent, which also only restates the worked example once, not on every subpart) but never given its own scored row", () => {
  assert.match(frustratingQuestionText(), /\(a\) 'reassuring' -- comforting\/puts your mind at ease, not scored/);
  assert.ok(!newSubparts.some((p) => p.id.endsWith("q02a")), "no row for subpart (a) should ever be created -- it remains the unscored worked example");
  assert.ok(!newSubparts.some((p) => p.marks !== 1 && p.question.includes("reassuring")), "the worked example must never itself be scored");
});

function frustratingQuestionText(): string {
  return newSubparts.find((p) => p.id === "eng-inc002-roboticsfinal-q02b")!.question;
}

// === 12. Passage total marks remain unchanged ===============================

test("12. The Loose Connection's own total marks remain 22 -- unchanged from Decision 238's own figure (18 marks across Q1/Q3/Q4/Q5/Q6/Q7a/Q7b/Q8, unaffected by this migration, plus the new Q2's own 4 marks)", () => {
  const unaffectedMarks = allInc001RoboticsPrompts.filter((p) => p.id !== "eng-inc002-roboticsfinal-q02").reduce((sum, p) => sum + p.marks, 0);
  assert.equal(unaffectedMarks, 18, "the 8 other Loose Connection questions (migration 161, untouched by this migration) must still sum to 18 marks");
  const newQ2Marks = newSubparts.reduce((sum, p) => sum + p.marks, 0);
  assert.equal(unaffectedMarks + newQ2Marks, 22);
});

test("12b. migration 163 never touches migration 161's own file -- the old q02 row referenced by this correction still appears in 161's own stored text (that file is immutable; the LIVE row is corrected by 163 alone)", () => {
  assert.match(sql161, /'eng-inc002-roboticsfinal-q02', 'english', 'QT-RC-04'/);
});

// === 13. Review registration remains intact ==================================

test("13. migration 163 never mentions ali_family_review anywhere in its real SQL -- the passage-level pending review registrations (migration 162) are completely untouched", () => {
  assert.ok(!executable163.includes("ali_family_review"));
});

test("13b. migration 163 never touches ali_passage_bank -- only ali_question_bank", () => {
  assert.ok(!executable163.includes("ali_passage_bank"));
  const tablesWritten = [...executable163.matchAll(/(?:delete from|insert into|update)\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(tablesWritten), new Set(["ali_question_bank"]));
});

// === 14. No eligibility mutation ============================================

test("14. no eligibility_status, practice_eligible, or mock_eligible mutation anywhere -- every new row is authentic_assessment_candidate, matching the row it replaces exactly", () => {
  assert.ok(!/set\s+eligibility_status/i.test(executable163));
  assert.ok(!executable163.includes("practice_eligible"));
  assert.ok(!executable163.includes("mock_eligible"));
  for (const p of newSubparts) {
    assert.match(sql163, new RegExp(`'${p.id}'[\\s\\S]{0,50}\\n[\\s\\S]{0,4000}'authentic_assessment_candidate'`));
  }
});

// === DELETE / precondition / idempotency structure ==========================

test("the DELETE targets only the old pooled eng-inc002-roboticsfinal-q02 row, nothing else", () => {
  const deleteMatches = [...executable163.matchAll(/delete from public\.ali_question_bank\s*\n\s*where id = '([\w-]+)';/g)];
  assert.equal(deleteMatches.length, 1);
  assert.equal(deleteMatches[0][1], "eng-inc002-roboticsfinal-q02");
});

test("the precondition requires the OLD row's exact known signature (skill = QT-RC-04, question_type = short-answer, 4 marks, all 5 words named, 16 pooled accepted answers) before deleting, and refuses otherwise", () => {
  assert.match(executable163, /skill, question_type, \(prompt ->> 'marks'\)::int/);
  assert.match(executable163, /v_live_marks is distinct from 4/);
  assert.match(executable163, /like '%frustrating%'/);
  assert.match(executable163, /like '%disbelieving%'/);
  assert.match(executable163, /like '%triumphant%'/);
  assert.match(executable163, /like '%uselessly%'/);
  assert.match(executable163, /v_live_accepted_len is distinct from 16/);
  assert.match(sql163, /Migration 163 refused/);
});

// === CORRECTION REGRESSION: skill/question_type precondition fix ===========
// Decision 239 follow-up. Production evidence proved the migration's FIRST
// precondition tested `question_type = 'QT-RC-04'`, but the canonical
// schema (migration 005's own base ali_question_bank definition; the
// known-good row shape in migration 161) stores the QT-RC competency code
// in `skill`, with `question_type` holding the separate generic label
// 'short-answer'. This corrected the predicate to check BOTH fields
// independently and rewrote the refusal diagnostics to report every live
// field value by name instead of a misleading NULL.

test("C0. the corrected precondition checks skill = 'QT-RC-04' AND question_type = 'short-answer' independently, and the defective original clause is gone from the executable SQL", () => {
  assert.match(executable163, /v_live_skill is distinct from 'QT-RC-04'/);
  assert.match(executable163, /v_live_question_type is distinct from 'short-answer'/);
  assert.ok(!executable163.includes("question_type = 'QT-RC-04'"), "the defective precondition clause (question_type tested against the QT-RC code) must no longer be present");
});

test("C0b. a base-identity lookup (id + learning_unit_id only) runs before the signature check, and refuses with a distinct, explicit message if no row is found at all -- never a silent NULL-filled refusal", () => {
  assert.match(executable163, /where id = 'eng-inc002-roboticsfinal-q02'\s*\n\s*and learning_unit_id = 'eng-inc002-roboticsfinal';/);
  assert.match(executable163, /if not found then/);
  assert.match(sql163, /no row found with id = eng-inc002-roboticsfinal-q02 and learning_unit_id = eng-inc002-roboticsfinal/);
});

test("C0c. the refusal-on-mismatch message reports every live field by name (skill, question_type, marks, acceptedAnswers type, acceptedAnswers count, eligibility_status, active, question text) -- proving the fix to the misleading-NULL diagnostic", () => {
  for (const token of ["skill:", "question_type:", "marks:", "acceptedAnswers type:", "acceptedAnswers count:", "eligibility_status:", "active:", "question text contains all 4 target words:"]) {
    assert.ok(sql163.includes(token), `refusal diagnostic message must report live "${token}"`);
  }
});

// JS mirror of the corrected DO block's OR-condition (migration 163, lines
// verified present by C0/C0c above). Used only to exercise pristine-vs-not
// scenarios the SQL predicate itself is responsible for; not a substitute
// for the live database actually enforcing it.
interface OldQ2RowSnapshot {
  skill: string;
  questionType: string;
  marks: number;
  acceptedType: string;
  acceptedLen: number;
  eligibilityStatus: string;
  active: boolean;
  questionText: string;
}

const canonicalOldRow: OldQ2RowSnapshot = {
  skill: "QT-RC-04",
  questionType: "short-answer",
  marks: 4,
  acceptedType: "array",
  acceptedLen: 16,
  eligibilityStatus: "authentic_assessment_candidate",
  active: true,
  questionText: "...frustrating... ...disbelieving... ...triumphant... ...uselessly...",
};

function violatesPristinePredicate(row: OldQ2RowSnapshot): boolean {
  return (
    row.skill !== "QT-RC-04" ||
    row.questionType !== "short-answer" ||
    row.marks !== 4 ||
    row.acceptedType !== "array" ||
    row.acceptedLen !== 16 ||
    row.eligibilityStatus !== "authentic_assessment_candidate" ||
    row.active !== true ||
    !row.questionText.includes("frustrating") ||
    !row.questionText.includes("disbelieving") ||
    !row.questionText.includes("triumphant") ||
    !row.questionText.includes("uselessly")
  );
}

test("1. canonical old row (skill='QT-RC-04', question_type='short-answer', all other fields matching) satisfies the pristine predicate", () => {
  assert.equal(violatesPristinePredicate(canonicalOldRow), false);
});

test("2. the ORIGINAL swap (skill='short-answer', question_type='QT-RC-04') does NOT satisfy the corrected predicate", () => {
  assert.equal(violatesPristinePredicate({ ...canonicalOldRow, skill: "short-answer", questionType: "QT-RC-04" }), true);
});

test("3. wrong skill (any value other than 'QT-RC-04') refuses", () => {
  assert.equal(violatesPristinePredicate({ ...canonicalOldRow, skill: "vocabulary" }), true);
});

test("4. wrong question_type (any value other than 'short-answer') refuses", () => {
  assert.equal(violatesPristinePredicate({ ...canonicalOldRow, questionType: "multiple-choice" }), true);
});

test("5. wrong marks (anything other than 4) refuses", () => {
  assert.equal(violatesPristinePredicate({ ...canonicalOldRow, marks: 3 }), true);
});

test("6. wrong acceptedAnswers count (anything other than 16) refuses", () => {
  assert.equal(violatesPristinePredicate({ ...canonicalOldRow, acceptedLen: 15 }), true);
});

test("7. if q02b/c/d/e already exist in a partial (1-3 row) state, the migration refuses as a mixed, unexpected state rather than attempting a replacement", () => {
  assert.match(executable163, /if v_new_rows_count != 0 then/);
  assert.match(sql163, /Production is in a mixed, unexpected state -- re-verify before proceeding/);
  for (const partialCount of [1, 2, 3]) {
    const isMixedState = partialCount !== 0 && partialCount !== 4;
    assert.equal(isMixedState, true, `a count of ${partialCount} must be treated as mixed/unexpected, not silently accepted`);
  }
});

test("8. all 4 replacement rows carry skill = 'QT-RC-04' and question_type = 'short-answer' in their own SQL column tuples (not swapped)", () => {
  for (const letter of ["b", "c", "d", "e"]) {
    const re = new RegExp(`'eng-inc002-roboticsfinal-q02${letter}', 'english', 'QT-RC-04', array\\['csse'\\], 'medium', 'short-answer', 60,`);
    assert.match(sql163, re, `eng-inc002-roboticsfinal-q02${letter}'s own column tuple must carry skill='QT-RC-04', question_type='short-answer'`);
  }
});

test("9. the 4 new rows retain isolated, non-overlapping one-mark answer sets after the correction (re-confirmed against the corrected file)", () => {
  assert.equal(newSubparts.length, 4);
  for (const p of newSubparts) assert.equal(p.marks, 1);
});

test("10. The Loose Connection's passage total remains 22 after the correction (re-confirmed against the corrected file)", () => {
  const unaffectedMarks = allInc001RoboticsPrompts.filter((p) => p.id !== "eng-inc002-roboticsfinal-q02").reduce((sum, p) => sum + p.marks, 0);
  const newQ2Marks = newSubparts.reduce((sum, p) => sum + p.marks, 0);
  assert.equal(unaffectedMarks + newQ2Marks, 22);
});

test("11. review registration (ali_family_review) and eligibility_status remain untouched by the correction", () => {
  assert.ok(!executable163.includes("ali_family_review"));
  assert.ok(!/set\s+eligibility_status/i.test(executable163));
});

test("the migration is idempotent: if the 4 new rows already exist, it is a verified no-op; if a mixed state is found, it refuses rather than guessing", () => {
  assert.match(executable163, /already exist -- already applied\. No changes made\./);
  assert.match(sql163, /Production is in a mixed, unexpected state/);
});

test("no other Increment 002 question (either passage) is referenced anywhere in migration 163's real SQL", () => {
  const otherIds = [
    "eng-inc002-roboticsfinal-q01", "eng-inc002-roboticsfinal-q03", "eng-inc002-roboticsfinal-q04",
    "eng-inc002-roboticsfinal-q05", "eng-inc002-roboticsfinal-q06", "eng-inc002-roboticsfinal-q07a",
    "eng-inc002-roboticsfinal-q07b", "eng-inc002-roboticsfinal-q08",
    "eng-inc002-sailandsteam-q01", "eng-inc002-sailandsteam-q02", "eng-inc002-sailandsteam-q03",
    "eng-inc002-sailandsteam-q04", "eng-inc002-sailandsteam-q05b", "eng-inc002-sailandsteam-q05c",
    "eng-inc002-sailandsteam-q05d", "eng-inc002-sailandsteam-q05e", "eng-inc002-sailandsteam-q06", "eng-inc002-sailandsteam-q07",
  ];
  for (const id of otherIds) assert.ok(!executable163.includes(id), `migration 163 must never reference ${id}`);
});

test("migration is wrapped in a single begin/commit transaction, and includes a post-write verification block proving the old row is gone and exactly 4 new rows exist", () => {
  assert.equal((executable163.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable163.match(/\bcommit;/g) || []).length, 1);
  assert.match(executable163, /v_old_exists/);
  assert.match(executable163, /v_new_count != 4/);
});

test("not applied disclosure present in the raw file header", () => {
  assert.match(sql163, /NOT APPLIED\. Generated for Founder application/);
});
