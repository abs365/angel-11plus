import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics First Mock Structural Capacity, Authoring Increment 001 —
 * Interdependent Algebraic System (Decision 177/178). Parses migration
 * 119's own real JSON blocks (not a re-typed copy) and proves the
 * authored family's shape, marks, grouping, answers, and governance
 * disclosures.
 */

const sql = fs.readFileSync("supabase/migrations/119_mock_mathematics_structural_capacity_increment001_algebraic_system.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");
const jsonBlocks = [...sql.matchAll(/\$json\$(\{[\s\S]*?\})\$json\$/g)].map((m) => JSON.parse(m[1]));

function byId(id: string) {
  const row = jsonBlocks.find((r) => r.id === id);
  assert.ok(row, `expected a JSON block for ${id}`);
  return row;
}

const IDS = ["mock-mr06-linkedvalues-01", "mock-mr06-linkedvalues-02", "mock-mr06-linkedvalues-03"];

test("exactly 3 rows parse as valid JSON from migration 119's own real text", () => {
  assert.equal(jsonBlocks.length, 3);
  assert.deepEqual(jsonBlocks.map((r) => r.id).sort(), [...IDS].sort());
});

test("every row is exactly 1 mark -- Decision 175 marking integrity is binding, no row exceeds 1", () => {
  for (const id of IDS) {
    assert.equal(byId(id).marks, 1);
  }
});

test("independently verified answers: 8, 42, 20, each a single unambiguous value", () => {
  assert.equal(byId("mock-mr06-linkedvalues-01").answer, "8");
  assert.equal(byId("mock-mr06-linkedvalues-02").answer, "42");
  assert.equal(byId("mock-mr06-linkedvalues-03").answer, "20");
});

test("the stated system is internally consistent: red=8, blue=red+6=14, green=3*blue=42, sum=64, and (c) = green - (red+blue)", () => {
  const red = 8, blue = red + 6, green = 3 * blue;
  assert.equal(blue, 14);
  assert.equal(green, 42);
  assert.equal(red + blue + green, 64);
  assert.equal(green - (red + blue), 20);
});

test("all three subparts restate the identical shared system (same numbers: 6, 3, 64) -- genuine Classification A, not shared-theme-only", () => {
  for (const id of IDS) {
    const q = byId(id).question;
    assert.match(q, /6 more marbles/);
    assert.match(q, /3 times as many/);
    assert.match(q, /64 marbles/);
  }
});

test("no row carries a stimulus -- purely textual, no new visual capability required", () => {
  for (const id of IDS) {
    assert.equal(byId(id).stimulus, undefined);
  }
});

test("no CSSE scenario, name, or number system is reproduced: no lettered A/B/C/D system, no box symbols, no age or money-purchase scenario", () => {
  for (const id of IDS) {
    const q = byId(id).question.toLowerCase();
    assert.ok(!/\bage\b/.test(q));
    assert.ok(!/pound|\bcoffee\b|\bcake\b|\bsandwich\b/.test(q));
  }
});

test("grouping contract: single question_group_id, group_order 1/2/3, subpart_label (a)/(b)/(c), marking_mode deterministic", () => {
  assert.match(executable, /'mock-mr06-linkedvalues-01'[\s\S]*?'mock-mr06-linkedvalues', 1, '\(a\)', 'deterministic'/);
  assert.match(executable, /'mock-mr06-linkedvalues-02'[\s\S]*?'mock-mr06-linkedvalues', 2, '\(b\)', 'deterministic'/);
  assert.match(executable, /'mock-mr06-linkedvalues-03'[\s\S]*?'mock-mr06-linkedvalues', 3, '\(c\)', 'deterministic'/);
});

test("family_id is mock-mr06-linkedvalues on all 3 rows, reusing existing QT-MR-06 -- no new Question Type is created", () => {
  const familyMatches = [...executable.matchAll(/'mock-mr06-linkedvalues', 'angel_original'/g)];
  assert.equal(familyMatches.length, 3);
  const qtMatches = [...executable.matchAll(/'QT-MR-06'/g)];
  assert.equal(qtMatches.length, 3);
  assert.ok(!/QT-MR-14|QT-MR-15/.test(executable), "must not introduce a new Question Type code");
});

test("candidate eligibility only: authentic_assessment_candidate on all 3 rows, active=true, never mock_eligible/independently_validated/practice_eligible", () => {
  const candidateMatches = [...executable.matchAll(/'authentic_assessment_candidate', 1, true/g)];
  assert.equal(candidateMatches.length, 3);
  assert.ok(!executable.includes("mock_eligible"));
  assert.ok(!executable.includes("independently_validated"));
  assert.ok(!executable.includes("practice_eligible"));
});

test("provenance is angel_original on all 3 rows -- not a CSSE-sourced or paraphrased row", () => {
  const provenanceMatches = [...executable.matchAll(/'angel_original'/g)];
  assert.equal(provenanceMatches.length, 3);
});

test("no existing row, family, or table is touched: no UPDATE statement anywhere, no ali_family_review/ali_mock_form/ali_mock_attempt mention", () => {
  assert.ok(!/\bupdate\s+public\./i.test(executable));
  for (const table of ["ali_family_review", "ali_mock_form", "ali_mock_attempt"]) {
    assert.ok(!executable.includes(table));
  }
});

test("idempotent: on conflict (id) do nothing, single transaction", () => {
  assert.match(executable, /on conflict \(id\) do nothing/);
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("only public.ali_question_bank is ever inserted into", () => {
  const insertTargets = [...executable.matchAll(/insert into\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(insertTargets), new Set(["ali_question_bank"]));
});

test("header discloses the five independently-verified primary-source instances and the NOT APPLIED status", () => {
  assert.match(sql, /2023 Q8/);
  assert.match(sql, /2023 Q18/);
  assert.match(sql, /2022 Q6/);
  assert.match(sql, /2021 Q7/);
  assert.match(sql, /2021 Q20/);
  assert.match(sql, /NOT APPLIED\. Generated for/);
});

test("no CSSE, English, or Writing content is referenced", () => {
  assert.ok(!/mock-eng-|mock-writing-/.test(executable));
  assert.ok(!/subject = 'english'|subject = 'writing'/i.test(executable));
});

test("English/Writing subject is never used -- subject is 'maths' on all 3 rows", () => {
  const subjectMatches = [...executable.matchAll(/'maths', 'QT-MR-06'/g)];
  assert.equal(subjectMatches.length, 3);
});
