import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics Structural Capacity, Authoring Increment 006 — Rounding-
 * Bounds Reasoning Classification-A Family (Decision 205/206). Parses
 * migration 140's own real JSON blocks and proves the family's shape,
 * marks, grouping, answers, sharedStem, independence, and mathematical
 * correctness -- including a re-derivation directly from the stated
 * rounding facts, not merely asserted stored constants.
 */

const sql = fs.readFileSync("supabase/migrations/140_mock_mathematics_structural_capacity_increment006_roundingbounds.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");
const jsonBlocks = [...sql.matchAll(/\$json\$(\{[\s\S]*?\})\$json\$/g)].map((m) => JSON.parse(m[1]));

function byId(id: string) {
  const row = jsonBlocks.find((r) => r.id === id);
  assert.ok(row, `expected a JSON block for ${id}`);
  return row;
}

const ROUNDINGBOUNDS_IDS = [
  "mock-mr11-roundingbounds-01", "mock-mr11-roundingbounds-02", "mock-mr11-roundingbounds-03", "mock-mr11-roundingbounds-04",
];

// The stated rounding facts, re-derived from scratch (not copied from
// the SQL comments): adults round to 380, children round to 240, both to
// the nearest 10, using the round-half-up convention the real primary
// source itself uses (a value exactly halfway rounds UP).
function boundsFor(roundedTo: number): [number, number] {
  return [roundedTo - 5, roundedTo + 4];
}

test("exactly 4 rows parse as valid JSON from migration 140's own real text", () => {
  assert.equal(jsonBlocks.length, 4);
  assert.deepEqual(jsonBlocks.map((r) => r.id).sort(), [...ROUNDINGBOUNDS_IDS].sort());
});

test("every row is exactly 1 mark -- Decision 175 marking integrity is binding", () => {
  for (const id of ROUNDINGBOUNDS_IDS) {
    assert.equal(byId(id).marks, 1);
  }
});

test("independently verified answers: 384, 235, 628, 131", () => {
  assert.equal(byId("mock-mr11-roundingbounds-01").answer, "384");
  assert.equal(byId("mock-mr11-roundingbounds-02").answer, "235");
  assert.equal(byId("mock-mr11-roundingbounds-03").answer, "628");
  assert.equal(byId("mock-mr11-roundingbounds-04").answer, "131");
});

test("bound derivation re-check: adults round to 380 (nearest 10) => true value in [375,384], largest is 384", () => {
  const [lo, hi] = boundsFor(380);
  assert.equal(lo, 375);
  assert.equal(hi, 384);
});

test("bound derivation re-check: children round to 240 (nearest 10) => true value in [235,244], smallest is 235 and largest is 244", () => {
  const [lo, hi] = boundsFor(240);
  assert.equal(lo, 235);
  assert.equal(hi, 244);
});

test("subpart (c) semantic re-check: largest X+Y uses the largest of BOTH bounds, re-derived directly, not asserted", () => {
  const [, adultsHi] = boundsFor(380);
  const [, childrenHi] = boundsFor(240);
  assert.equal(adultsHi + childrenHi, 628);
});

test("subpart (d) semantic re-check: smallest X-Y uses the smallest adults bound AND the largest children bound simultaneously, re-derived directly", () => {
  const [adultsLo] = boundsFor(380);
  const [, childrenHi] = boundsFor(240);
  assert.equal(adultsLo - childrenHi, 131);
});

test("(d) is genuinely the minimum: every other combination of bound choices for X-Y is >= 131", () => {
  const [adultsLo, adultsHi] = boundsFor(380);
  const [childrenLo, childrenHi] = boundsFor(240);
  const candidates = [
    adultsLo - childrenLo, adultsLo - childrenHi,
    adultsHi - childrenLo, adultsHi - childrenHi,
  ];
  assert.equal(Math.min(...candidates), 131);
});

test("(c) is genuinely the maximum: every other combination of bound choices for X+Y is <= 628", () => {
  const [adultsLo, adultsHi] = boundsFor(380);
  const [childrenLo, childrenHi] = boundsFor(240);
  const candidates = [
    adultsLo + childrenLo, adultsLo + childrenHi,
    adultsHi + childrenLo, adultsHi + childrenHi,
  ];
  assert.equal(Math.max(...candidates), 628);
});

test("each answer is a single deterministic whole number, not a range or multiple-valid-answer format", () => {
  for (const id of ROUNDINGBOUNDS_IDS) {
    const row = byId(id);
    assert.ok(/^\d+$/.test(row.answer), `${id}'s answer must be a bare whole-number string`);
  }
});

test("subparts (a)-(d) restate the full shared rounding facts directly via sharedStem, never as 'your answer to a previous part'", () => {
  for (const id of ROUNDINGBOUNDS_IDS) {
    const row = byId(id);
    assert.ok(!/your answer/i.test(row.question), `${id} must not reference the learner's own prior answer`);
  }
});

test("all 4 rows carry an identical, non-empty sharedStem, and every row's question genuinely starts with it (the exact resolveGroupSharedStem() safety rule)", () => {
  const stems = ROUNDINGBOUNDS_IDS.map((id) => byId(id).sharedStem);
  assert.ok(stems[0] && stems[0].length > 0);
  for (const s of stems) assert.equal(s, stems[0]);
  for (const id of ROUNDINGBOUNDS_IDS) {
    const row = byId(id);
    assert.ok(row.question.startsWith(row.sharedStem), `${id}'s question must start with its own sharedStem`);
    assert.ok(row.question.slice(row.sharedStem.length).trim().length > 0, `${id} must have a non-empty tail after the stem`);
  }
});

test("sharedStem states both rounding facts (adults round to 380, children round to 240) needed across the whole family", () => {
  const stem = byId("mock-mr11-roundingbounds-01").sharedStem as string;
  assert.match(stem, /adult spectators rounds to 380/);
  assert.match(stem, /child spectators rounds to 240/);
  assert.match(stem, /nearest 10/);
});

test("no prompt.stimulus table is present anywhere in this family -- deliberately text-only narrative content", () => {
  for (const id of ROUNDINGBOUNDS_IDS) {
    assert.equal(byId(id).stimulus, undefined);
  }
});

test("grouping contract: question_group_id=mock-mr11-roundingbounds, group_order 1-4, subpart_label (a)-(d), marking_mode deterministic", () => {
  assert.match(executable, /'mock-mr11-roundingbounds-01'[\s\S]*?'mock-mr11-roundingbounds', 1, '\(a\)', 'deterministic'/);
  assert.match(executable, /'mock-mr11-roundingbounds-02'[\s\S]*?'mock-mr11-roundingbounds', 2, '\(b\)', 'deterministic'/);
  assert.match(executable, /'mock-mr11-roundingbounds-03'[\s\S]*?'mock-mr11-roundingbounds', 3, '\(c\)', 'deterministic'/);
  assert.match(executable, /'mock-mr11-roundingbounds-04'[\s\S]*?'mock-mr11-roundingbounds', 4, '\(d\)', 'deterministic'/);
});

test("difficulty progression: easy, easy, medium, hard -- honestly labelled, mirroring the real source's own implicit gradient", () => {
  assert.match(executable, /'mock-mr11-roundingbounds-01', 'maths', 'QT-MR-11', array\['csse'\], 'easy'/);
  assert.match(executable, /'mock-mr11-roundingbounds-02', 'maths', 'QT-MR-11', array\['csse'\], 'easy'/);
  assert.match(executable, /'mock-mr11-roundingbounds-03', 'maths', 'QT-MR-11', array\['csse'\], 'medium'/);
  assert.match(executable, /'mock-mr11-roundingbounds-04', 'maths', 'QT-MR-11', array\['csse'\], 'hard'/);
});

test("QT reuse: QT-MR-11 on all 4 rows -- no new Question Type is created", () => {
  const qtMatches = [...executable.matchAll(/'QT-MR-11'/g)];
  assert.equal(qtMatches.length, 4);
  assert.ok(!/QT-MR-15|QT-MR-16/.test(executable), "must not introduce a new Question Type code");
});

test("candidate eligibility only: authentic_assessment_candidate on all 4 rows, active=true, never mock_eligible/independently_validated/practice_eligible", () => {
  const candidateMatches = [...executable.matchAll(/'authentic_assessment_candidate', 1, true/g)];
  assert.equal(candidateMatches.length, 4);
  assert.ok(!executable.includes("mock_eligible"));
  assert.ok(!executable.includes("independently_validated"));
  assert.ok(!executable.includes("practice_eligible"));
});

test("no existing row, family, or table is touched: no UPDATE statement anywhere, no ali_family_review/ali_mock_form/ali_mock_attempt mention", () => {
  assert.ok(!/\bupdate\s+public\./i.test(executable));
  for (const table of ["ali_family_review", "ali_mock_form", "ali_mock_attempt"]) {
    assert.ok(!executable.includes(table));
  }
});

test("idempotent: on conflict (id) do nothing, single transaction", () => {
  assert.equal((executable.match(/on conflict \(id\) do nothing/g) || []).length, 1);
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("only public.ali_question_bank is ever inserted into", () => {
  const insertTargets = [...executable.matchAll(/insert into\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(insertTargets), new Set(["ali_question_bank"]));
});

test("header discloses both re-verified primary-source instances (2022 Q9, 2023 Q14), the evidence gate, and the NOT APPLIED status", () => {
  assert.match(sql, /2022 Q9/);
  assert.match(sql, /2023 Q14/);
  assert.match(sql, /Decision 205\/206/);
  assert.match(sql, /NOT APPLIED\. Generated for/);
});

test("header discloses the mock-mr03mr07-perimeterarea citation-fidelity finding explicitly, without claiming to correct it", () => {
  assert.match(sql, /mock-mr03mr07-perimeterarea/);
  assert.match(sql, /citation-fidelity/i);
});

test("SOURCE-CONTAINS vs AUTHORED-EXTRAPOLATION traceability discipline (Decision 200/201's minimal guard): every reasoning-demand claim in the header is explicitly tagged", () => {
  assert.match(sql, /SOURCE-CONTAINS:/);
  assert.match(sql, /AUTHORED-EXTRAPOLATION:/);
  const sourceContainsCount = (sql.match(/SOURCE-CONTAINS:/g) || []).length;
  const extrapolationCount = (sql.match(/AUTHORED-EXTRAPOLATION:/g) || []).length;
  assert.ok(sourceContainsCount >= 4, "at least one SOURCE-CONTAINS tag per subpart's own evidence claim");
  assert.ok(extrapolationCount >= 1, "at least one AUTHORED-EXTRAPOLATION tag distinguishing Angel's own original choices from the source");
});

test("no unsupported extra reasoning demand is introduced beyond the evidence envelope: no interval notation, no formal error-bound terminology, no secondary-school technique", () => {
  for (const id of ROUNDINGBOUNDS_IDS) {
    const row = byId(id);
    assert.ok(!/\[|\]|≤|≥|<=|>=|error bound|significant figure/i.test(row.question), `${id} must use only plain 'largest/smallest possible' phrasing, matching the real source`);
  }
});

test("no second family, no English/Writing content, no diagram/chart archetype is referenced", () => {
  assert.ok(!/mock-eng-|mock-writing-/.test(executable));
  assert.ok(!/subject = 'english'|subject = 'writing'/i.test(executable));
  const familyIds = new Set([...executable.matchAll(/'(mock-mr\d+-\w+)', 'angel_original'/g)].map((m) => m[1]));
  assert.deepEqual(familyIds, new Set(["mock-mr11-roundingbounds"]));
  assert.ok(!/"type":"chart"|"type":"diagram"|"type":"graph"|"type":"table"/.test(executable), "must not use a table/chart/diagram stimulus -- this family is deliberately text-only");
});

test("no reproduction of real CSSE past-paper wording in the learner-facing question text: does not use the letters 'X and Y' or the exact 'rounded to the nearest 10 gives N' phrasing from 2022 Q9, or the rectangle/cm wording from 2023 Q14 (the migration's own explanation/provenance columns legitimately quote the source for evidence purposes, matching every prior migration in this series -- only the learner-facing prompt.question text is checked here)", () => {
  for (const id of ROUNDINGBOUNDS_IDS) {
    const row = byId(id);
    assert.ok(!/X and Y are whole numbers/i.test(row.question));
    assert.ok(!/rounded to the nearest 10 gives \d+/i.test(row.question));
    assert.ok(!/rectangle below/i.test(row.question));
  }
});
