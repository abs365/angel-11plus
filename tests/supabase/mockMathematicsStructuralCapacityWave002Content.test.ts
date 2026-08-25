import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { isValidTableStimulus } from "../../lib/mockAttempt/workspace";

/**
 * Mathematics First Mock Structural Capacity, Authoring Wave 002 —
 * Shared Timetable + Shared Price-List/Menu (Decision 184/185). Parses
 * migration 125's own real JSON blocks and proves both families' shape,
 * marks, grouping, answers, stimulus, and sharedStem correctness.
 */

const sql = fs.readFileSync("supabase/migrations/125_mock_mathematics_structural_capacity_wave002_timetable_pricelist.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");
const jsonBlocks = [...sql.matchAll(/\$json\$(\{[\s\S]*?\})\$json\$/g)].map((m) => JSON.parse(m[1]));

function byId(id: string) {
  const row = jsonBlocks.find((r) => r.id === id);
  assert.ok(row, `expected a JSON block for ${id}`);
  return row;
}

const TIMETABLE_IDS = ["mock-mr10-bustimetable-01", "mock-mr10-bustimetable-02", "mock-mr10-bustimetable-03", "mock-mr10-bustimetable-04"];
const CRAFTSTALL_IDS = ["mock-mr13-craftstall-01", "mock-mr13-craftstall-02", "mock-mr13-craftstall-03"];

test("exactly 7 rows parse as valid JSON from migration 125's own real text -- 4 timetable + 3 craft-stall", () => {
  assert.equal(jsonBlocks.length, 7);
  assert.deepEqual(jsonBlocks.map((r) => r.id).sort(), [...TIMETABLE_IDS, ...CRAFTSTALL_IDS].sort());
});

test("every row is exactly 1 mark -- Decision 175 marking integrity is binding", () => {
  for (const id of [...TIMETABLE_IDS, ...CRAFTSTALL_IDS]) {
    assert.equal(byId(id).marks, 1);
  }
});

test("timetable independently verified answers: 95, 7, 370, 28", () => {
  assert.equal(byId("mock-mr10-bustimetable-01").answer, "95");
  assert.equal(byId("mock-mr10-bustimetable-02").answer, "7");
  assert.equal(byId("mock-mr10-bustimetable-03").answer, "370");
  assert.equal(byId("mock-mr10-bustimetable-04").answer, "28");
});

test("timetable answers are re-derivable independently from the stated table, via minutes-since-midnight arithmetic (semantic re-check, not merely stored-value trust)", () => {
  const toMin = (hhmm: string) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
  const morning = { H: "08:00", M: "08:40", R: "09:05", O: "09:35" };
  const afternoon = { H: "14:15", M: "14:50", R: "15:22", O: "15:50" };
  assert.equal(toMin(morning.O) - toMin(morning.H), 95);
  const morningMR = toMin(morning.R) - toMin(morning.M);
  const afternoonMR = toMin(afternoon.R) - toMin(afternoon.M);
  assert.equal(afternoonMR - morningMR, 7);
  assert.equal(toMin(afternoon.M) - toMin(morning.M), 370);
  const afternoonHM = toMin(afternoon.M) - toMin(afternoon.H);
  assert.equal(Math.round(afternoonHM * 0.8), 28);
});

test("craft-stall independently verified answers: 18.00, Stickers, 3", () => {
  assert.equal(byId("mock-mr13-craftstall-01").answer, "18.00");
  assert.equal(byId("mock-mr13-craftstall-02").answer, "Stickers");
  assert.equal(byId("mock-mr13-craftstall-03").answer, "3");
});

test("craft-stall (a) and (b) are re-derivable independently from the stated price list", () => {
  const keyringPackPrice = 2.0, keyringPackSize = 5;
  const braceletPrice = 1.2;
  const stickerPackPrice = 1.6, stickerPackSize = 8;
  const costA = (15 / keyringPackSize) * keyringPackPrice + 6 * braceletPrice + (24 / stickerPackSize) * stickerPackPrice;
  assert.equal(costA.toFixed(2), "18.00");
  const n = 40;
  const unitCosts = {
    keyrings: (n / keyringPackSize) * keyringPackPrice,
    bracelets: n * braceletPrice,
    stickers: (n / stickerPackSize) * stickerPackPrice,
  };
  const cheapest = Object.entries(unitCosts).sort((a, b) => a[1] - b[1])[0][0];
  assert.equal(cheapest, "stickers");
});

test("craft-stall (c)'s solution is independently proven UNIQUE by exhaustive search, not merely assumed", () => {
  const braceletPrice = 1.2, stickerPackPrice = 1.6, total = 8.4;
  const solutions: number[] = [];
  for (let p = 1; p <= 10; p++) {
    const remaining = Math.round((total - p * stickerPackPrice) * 100) / 100;
    if (remaining < 0) break;
    const bracelets = remaining / braceletPrice;
    if (Number.isInteger(Math.round(bracelets * 100) / 100) && bracelets >= 1) solutions.push(bracelets);
  }
  assert.deepEqual(solutions, [3]);
});

test("both families carry a valid table stimulus, identical across every row in the family (selectDisplayUnitStimulus() renders it once per experience)", () => {
  const timetableStimuli = TIMETABLE_IDS.map((id) => byId(id).stimulus);
  for (const s of timetableStimuli) assert.equal(isValidTableStimulus(s), true);
  assert.deepEqual(timetableStimuli[0], timetableStimuli[1]);
  assert.deepEqual(timetableStimuli[0], timetableStimuli[2]);
  assert.deepEqual(timetableStimuli[0], timetableStimuli[3]);

  const craftstallStimuli = CRAFTSTALL_IDS.map((id) => byId(id).stimulus);
  for (const s of craftstallStimuli) assert.equal(isValidTableStimulus(s), true);
  assert.deepEqual(craftstallStimuli[0], craftstallStimuli[1]);
  assert.deepEqual(craftstallStimuli[0], craftstallStimuli[2]);
});

test("timetable stimulus has the exact real dataset: 4 stops, correct headers, correct values, in order", () => {
  const stimulus = byId("mock-mr10-bustimetable-01").stimulus;
  assert.deepEqual(stimulus.headers, ["Stop", "Morning", "Afternoon"]);
  assert.deepEqual(stimulus.rows, [
    ["Hillview", "08:00", "14:15"], ["Milltown", "08:40", "14:50"], ["Riverside", "09:05", "15:22"], ["Oakford", "09:35", "15:50"],
  ]);
});

test("craft-stall stimulus has the exact real dataset: 3 items, correct headers, correct values", () => {
  const stimulus = byId("mock-mr13-craftstall-01").stimulus;
  assert.deepEqual(stimulus.headers, ["Item", "Pack size", "Price"]);
  assert.deepEqual(stimulus.rows, [
    ["Keyrings", "Pack of 5", "£2.00"], ["Bracelets", "Sold individually", "£1.20"], ["Stickers", "Pack of 8", "£1.60"],
  ]);
});

test("both families carry an identical, non-empty sharedStem across every row, and every row's question genuinely starts with it (the exact resolveGroupSharedStem() safety rule)", () => {
  for (const ids of [TIMETABLE_IDS, CRAFTSTALL_IDS]) {
    const stems = ids.map((id) => byId(id).sharedStem);
    assert.ok(stems[0] && stems[0].length > 0);
    for (const s of stems) assert.equal(s, stems[0]);
    for (const id of ids) {
      const row = byId(id);
      assert.ok(row.question.startsWith(row.sharedStem), `${id}'s question must start with its own sharedStem`);
      assert.ok(row.question.slice(row.sharedStem.length).trim().length > 0, `${id} must have a non-empty tail after the stem`);
    }
  }
});

test("grouping contract: timetable is question_group_id=mock-mr10-bustimetable, group_order 1-4, subpart_label (a)-(d), marking_mode deterministic", () => {
  assert.match(executable, /'mock-mr10-bustimetable-01'[\s\S]*?'mock-mr10-bustimetable', 1, '\(a\)', 'deterministic'/);
  assert.match(executable, /'mock-mr10-bustimetable-02'[\s\S]*?'mock-mr10-bustimetable', 2, '\(b\)', 'deterministic'/);
  assert.match(executable, /'mock-mr10-bustimetable-03'[\s\S]*?'mock-mr10-bustimetable', 3, '\(c\)', 'deterministic'/);
  assert.match(executable, /'mock-mr10-bustimetable-04'[\s\S]*?'mock-mr10-bustimetable', 4, '\(d\)', 'deterministic'/);
});

test("grouping contract: craft-stall is question_group_id=mock-mr13-craftstall, group_order 1-3, subpart_label (a)-(c), marking_mode deterministic", () => {
  assert.match(executable, /'mock-mr13-craftstall-01'[\s\S]*?'mock-mr13-craftstall', 1, '\(a\)', 'deterministic'/);
  assert.match(executable, /'mock-mr13-craftstall-02'[\s\S]*?'mock-mr13-craftstall', 2, '\(b\)', 'deterministic'/);
  assert.match(executable, /'mock-mr13-craftstall-03'[\s\S]*?'mock-mr13-craftstall', 3, '\(c\)', 'deterministic'/);
});

test("QT reuse: QT-MR-10 on all 4 timetable rows, QT-MR-13 on all 3 craft-stall rows -- no new Question Type is created", () => {
  const qt10Matches = [...executable.matchAll(/'QT-MR-10'/g)];
  assert.equal(qt10Matches.length, 4);
  const qt13Matches = [...executable.matchAll(/'QT-MR-13'/g)];
  assert.equal(qt13Matches.length, 3);
  assert.ok(!/QT-MR-14|QT-MR-15/.test(executable), "must not introduce a new Question Type code");
});

test("candidate eligibility only: authentic_assessment_candidate on all 7 rows, active=true, never mock_eligible/independently_validated/practice_eligible", () => {
  const candidateMatches = [...executable.matchAll(/'authentic_assessment_candidate', 1, true/g)];
  assert.equal(candidateMatches.length, 7);
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

test("idempotent: on conflict (id) do nothing (twice, once per family INSERT), single transaction", () => {
  assert.equal((executable.match(/on conflict \(id\) do nothing/g) || []).length, 2);
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("only public.ali_question_bank is ever inserted into", () => {
  const insertTargets = [...executable.matchAll(/insert into\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(insertTargets), new Set(["ali_question_bank"]));
});

test("header discloses the two independently-verified primary-source instances (2022 Q19, 2021 Q6) and the NOT APPLIED status", () => {
  assert.match(sql, /2022 Q19/);
  assert.match(sql, /2021 Q6/);
  assert.match(sql, /NOT APPLIED\. Generated for/);
});

test("no third family, no English/Writing content, no shared-diagram archetype is referenced", () => {
  assert.ok(!/mock-eng-|mock-writing-/.test(executable));
  assert.ok(!/subject = 'english'|subject = 'writing'/i.test(executable));
  const familyIds = new Set([...executable.matchAll(/'(mock-mr\d+-\w+)', 'angel_original'/g)].map((m) => m[1]));
  assert.deepEqual(familyIds, new Set(["mock-mr10-bustimetable", "mock-mr13-craftstall"]));
});
