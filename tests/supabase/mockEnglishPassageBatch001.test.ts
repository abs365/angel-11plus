import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mock Programme Increment 006, English Mock Content Foundation, Batch 001
 * (Track B), migration 097. Parses the real migration SQL text -- both the
 * passage row and every question's real $json$ prompt payload -- and
 * independently re-verifies it, mirroring tests/content/
 * mockMathematicsBatch001.test.ts's own established convention. Every
 * quotationRequired string is checked against the migration's own stored
 * passage text, not a separately hand-typed copy, so this test would fail
 * if the passage text and a quotation ever drifted apart.
 */

const sql = fs.readFileSync("supabase/migrations/097_mock_english_passage_content_foundation.sql", "utf8");

interface ParsedPrompt {
  id: string;
  marks: number;
  skill: string;
  question: string;
  modelAnswer?: string;
  passageTitle?: string;
  passageText?: string;
  acceptedAnswers?: string[];
  quotationRequired?: string[];
  orderedAnswer?: string[];
  correctOptions?: string[];
  requiredSelectionCount?: number;
  validationTier: string;
}

// The passage block ($passage$...$passage$) appears once, inside the
// ali_passage_bank INSERT, before any $json$ block.
function parsePassage(sqlText: string): string {
  const parts = sqlText.split("$passage$");
  assert.equal(parts.length, 3, "expected exactly one $passage$...$passage$ block");
  return parts[1];
}

function parseJsonBlocks(sqlText: string): ParsedPrompt[] {
  const parts = sqlText.split("$json$");
  assert.equal(parts.length, 27, `expected 13 $json$ blocks (27 split parts); found ${(parts.length - 1) / 2}`);
  const prompts: ParsedPrompt[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    prompts.push(JSON.parse(parts[i]) as ParsedPrompt);
  }
  return prompts;
}

const passageText = parsePassage(sql);
const prompts = parseJsonBlocks(sql);

// Strips full-line `--` comments (this project's own migration header/
// disclosure convention) so counts of the real executable SQL are never
// inflated by this migration's own extensive commentary, which
// legitimately re-states values like 'authentic_assessment_candidate' in
// prose.
function stripComments(sqlText: string): string {
  return sqlText
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("--"))
    .join("\n");
}

const executableSql = stripComments(sql);

test("passage word count matches the migration's own declared word_count (627)", () => {
  const wordCount = passageText.split(/\\n+|\s+/).filter(Boolean).length;
  assert.equal(wordCount, 627);
  assert.match(sql, /'narrative-extract', 'contemporary-realistic-fiction', 627,/);
});

test("passage row is eligibility_status = authentic_assessment_candidate, active, angel_original -- never independently_validated or mock_eligible", () => {
  const passageRowMatch = sql.match(/\('mock-eng-boathouse', 'The Boat in the Boathouse',[\s\S]*?'angel_original', '[^']*', array\['csse'\], 'medium', 1,\s*\n\s*'(\w+)', (\w+), '([\w-]+)', null\)/);
  assert.ok(passageRowMatch, "could not parse the passage row's own tail fields");
  const [, eligibilityStatus, active, passageFamilyId] = passageRowMatch!;
  assert.equal(eligibilityStatus, "authentic_assessment_candidate");
  assert.equal(active, "true");
  assert.equal(passageFamilyId, "mock-eng-two-character-repair-narrative");
});

test("parses exactly 13 question rows -- 11 standalone + 2 grouped subparts", () => {
  assert.equal(prompts.length, 13);
});

test("expected question IDs are exactly the 13 authored, no more, no fewer", () => {
  const expectedIds = [
    "mock-eng-boathouse-q01", "mock-eng-boathouse-q02", "mock-eng-boathouse-q03",
    "mock-eng-boathouse-q04", "mock-eng-boathouse-q05", "mock-eng-boathouse-q06",
    "mock-eng-boathouse-q07", "mock-eng-boathouse-q08", "mock-eng-boathouse-q09",
    "mock-eng-boathouse-q10", "mock-eng-boathouse-q11",
    "mock-eng-boathouse-q12a", "mock-eng-boathouse-q12b",
  ];
  assert.deepEqual(prompts.map((p) => p.id).sort(), [...expectedIds].sort());
});

test("all 10 evidence-catalogued QT-RC types (01-10) are covered at least once", () => {
  const skillMatches = [...sql.matchAll(/'english', '(QT-RC-\d\d)',/g)].map((m) => m[1]);
  const expectedTypes = Array.from({ length: 10 }, (_, i) => `QT-RC-${String(i + 1).padStart(2, "0")}`);
  for (const t of expectedTypes) {
    assert.ok(skillMatches.includes(t), `expected ${t} to appear at least once; found types: ${[...new Set(skillMatches)].join(", ")}`);
  }
  assert.equal(skillMatches.length, 13, "expected exactly 13 QT-RC-tagged rows (one per question row)");
});

test("every question row is eligibility_status = authentic_assessment_candidate -- never independently_validated or mock_eligible", () => {
  assert.doesNotMatch(executableSql, /'independently_validated'/);
  assert.doesNotMatch(executableSql, /'mock_eligible'/);
  const statusCount = (executableSql.match(/'authentic_assessment_candidate'/g) || []).length;
  // 1 passage row + 13 question rows = 14 occurrences
  assert.equal(statusCount, 14);
});

test("every quotationRequired string is an exact, verbatim substring of this migration's own stored passage text", () => {
  let checked = 0;
  for (const p of prompts) {
    if (!p.quotationRequired) continue;
    for (const q of p.quotationRequired) {
      assert.ok(passageText.includes(q), `quotation for ${p.id} not found verbatim in passage text: ${JSON.stringify(q)}`);
      checked++;
    }
  }
  assert.equal(checked, 4, "expected exactly 4 quotationRequired strings across the batch (Q3 has 2, Q6 has 1, Q12b has 1)");
});

test("Q5 (QT-RC-04 synonym list) references exactly 5 line-referenced words, all present in the passage text", () => {
  const q5 = prompts.find((p) => p.id === "mock-eng-boathouse-q05")!;
  for (const w of ["convinced", "faintly", "steadier", "wedged", "rush"]) {
    assert.ok(q5.question.includes(`'${w}'`), `expected word '${w}' to be named in Q5's own question text`);
    assert.ok(passageText.includes(w), `expected word '${w}' to actually appear in the passage text`);
  }
});

test("Q10 (QT-RC-09 multi-select) correctOptions are independently verifiable against the passage: exactly 4 of 8, matching true statements", () => {
  const q10 = prompts.find((p) => p.id === "mock-eng-boathouse-q10")!;
  assert.deepEqual(q10.correctOptions, ["1", "3", "5", "7"]);
  assert.equal(q10.requiredSelectionCount, 4);
  // Statement 1: grandfather died before boat finished
  assert.ok(passageText.includes("He had died before the boat was finished"));
  // Statement 3: sorted tools into three piles
  assert.ok(passageText.includes("three careful piles"));
  // Statement 5: worked mostly on weekends
  assert.ok(passageText.includes("they worked most weekends"));
  // Statement 7: note in grandfather's handwriting
  assert.ok(passageText.includes("It was their grandfather's handwriting"));
  // Falsifying evidence for the 4 false statements
  assert.ok(passageText.includes("rear seat"), "statement 2 claims 'front seat' -- passage says rear seat");
  assert.ok(passageText.includes("bottom board like a fault line"), "statement 4 claims 'top edge' -- passage says bottom board");
  assert.ok(passageText.includes("looked exactly the same as the second"), "statement 6 claims 'completely different' -- passage says exactly the same");
  assert.ok(passageText.includes("Priya climbed in first"), "statement 8 claims Kabir climbed in first -- passage says Priya");
});

test("Q7 (QT-RC-06 ordering) orderedAnswer matches the passage's own stated order (crack, sanding, varnish)", () => {
  const q7 = prompts.find((p) => p.id === "mock-eng-boathouse-q07")!;
  assert.deepEqual(q7.orderedAnswer, ["filling the crack", "sanding again", "applying the varnish"]);
  const crackIdx = passageText.indexOf("first the crack");
  const sandIdx = passageText.indexOf("then the sanding");
  const varnishIdx = passageText.indexOf("and finally the varnish");
  assert.ok(crackIdx > -1 && sandIdx > crackIdx && varnishIdx > sandIdx, "passage's own stated order must be crack, then sanding, then varnish");
});

test("grouped question Q12: only q12a/q12b carry question_group_id/group_order/subpart_label/marking_mode; no other row does", () => {
  const updateBlocks = [...sql.matchAll(/update public\.ali_question_bank\s*\nset question_group_id = '([\w-]+)',\s*\n\s*group_order = (\d),\s*\n\s*subpart_label = '(\([ab]\))',\s*\n\s*marking_mode = '([\w_]+)'\s*\nwhere id = '([\w-]+)';/g)];
  assert.equal(updateBlocks.length, 2, "expected exactly 2 targeted UPDATE statements populating the grouped-question columns");

  const byId = new Map(updateBlocks.map((m) => [m[5], m]));
  const a = byId.get("mock-eng-boathouse-q12a")!;
  const b = byId.get("mock-eng-boathouse-q12b")!;
  assert.ok(a && b, "expected UPDATEs for exactly mock-eng-boathouse-q12a and mock-eng-boathouse-q12b");

  assert.equal(a[1], "mock-eng-boathouse-q12", "q12a question_group_id");
  assert.equal(b[1], "mock-eng-boathouse-q12", "q12b question_group_id");
  assert.equal(a[2], "1", "q12a group_order");
  assert.equal(b[2], "2", "q12b group_order");
  assert.equal(a[3], "(a)", "q12a subpart_label");
  assert.equal(b[3], "(b)", "q12b subpart_label");
  assert.equal(a[4], "deterministic", "q12a marking_mode");
  assert.equal(b[4], "structured_acceptable_response", "q12b marking_mode");

  // marking_mode must be one of migration 093's own 3 allowed values
  const allowed = new Set(["deterministic", "structured_acceptable_response", "criterion_rubric"]);
  assert.ok(allowed.has(a[4]) && allowed.has(b[4]));
});

test("no row outside Q12a/Q12b is ever the target of a grouped-column UPDATE", () => {
  const updateTargets = [...sql.matchAll(/where id = '([\w-]+)';/g)].map((m) => m[1]);
  assert.deepEqual(updateTargets.sort(), ["mock-eng-boathouse-q12a", "mock-eng-boathouse-q12b"].sort());
});

test("no row's INSERT column list ever sets question_group_id/group_order/subpart_label/marking_mode directly -- only the two targeted UPDATEs do", () => {
  const insertHeaderMatch = sql.match(/insert into public\.ali_question_bank\s*\n\s*\(([^)]*)\)/);
  assert.ok(insertHeaderMatch);
  for (const col of ["question_group_id", "group_order", "subpart_label", "marking_mode"]) {
    assert.ok(!insertHeaderMatch![1].includes(col), `${col} must not appear in the ali_question_bank INSERT column list`);
  }
});

test("Applied Reasoning is never referenced -- Decision 58's current-format boundary is respected", () => {
  assert.doesNotMatch(sql, /QT-AR-01/);
  assert.doesNotMatch(sql, /Applied Reasoning is (?:re)?introduced/i);
});

test("no mock_eligible or ali_mock_form reference anywhere in this migration", () => {
  assert.doesNotMatch(sql.replace(/-- .*$/gm, ""), /'mock_eligible'/);
  assert.doesNotMatch(sql, /ali_mock_form/);
});

test("family_id values used for Q1-Q11 are all distinct per-type families; Q12a/Q12b share one grouped family", () => {
  const familyIds = new Set<string>();
  for (const id of ["mock-eng-rc01-literal", "mock-eng-rc02-judgejustify", "mock-eng-rc03-vocabexplain", "mock-eng-rc04-synonymlist", "mock-eng-rc05-quoteexplain", "mock-eng-rc06-sequence", "mock-eng-rc07-comparative", "mock-eng-rc08-listextract", "mock-eng-rc09-multiselect", "mock-eng-rc10-effectlanguage", "mock-eng-boathouse-q12-judgequote"]) {
    assert.ok(sql.includes(`'${id}'`), `expected family_id ${id} to appear`);
    familyIds.add(id);
  }
  assert.equal(familyIds.size, 11);
});
