import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BP_THINK_OF_A_NUMBER, BP_ROUND_DECIMAL_PLACES, BP_ROUND_NEAREST_IN_CONTEXT, BP_COMPARE_IN_DIFFERENT_UNITS,
  BP_TIMETABLE_JOURNEY, BP_FUNCTION_TABLE_RULE, BP_MEAN_FROM_TABLE, CSSE_BREADTH_EXPANSION_FAMILIES,
  BP_CONSECUTIVE_FROM_SUM, BP_CONVERT_THEN_DIVIDE, BP_TIMETABLE_WAIT, BP_FUNCTION_TABLE_REVERSE, BP_MEAN_MISSING_VALUE_TABLE,
} from "@/lib/ali/questionFactory/csseBreadthBlueprints";
import { generateBlueprintCandidate, runFamilyBatch } from "@/lib/ali/questionFactory/candidateGeneration";
import { checkPerBlueprintDifficultyReachability } from "@/lib/ali/questionFactory/diversityGates";
import { isValidTableStimulus } from "@/lib/mockAttempt/workspace";
import { checkMathsAnswer } from "@/lib/learningEngine/practiceContent";
import type { StructuralBlueprint } from "@/lib/ali/questionFactory/types";
import type { MockTableStimulus } from "@/lib/mockAttempt/types";

/**
 * Breadth expansion: each answer is re-derived from the TEXT/STIMULUS the child sees, by a different route from the
 * blueprint's own formula (search, string-digit rounding, nearest-multiple scan, table reading).
 */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const N = 300;
function candidates<T extends Record<string, number>>(bp: StructuralBlueprint<T>, seed = 5) {
  const rnd = seeded(seed);
  return Array.from({ length: N }, () => generateBlueprintCandidate(bp, rnd));
}
const toMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));

test("think of a number: the answer is the unique start that really produces the stated result", () => {
  for (const c of candidates(BP_THINK_OF_A_NUMBER)) {
    const nums = (c.question.match(/\d+/g) ?? []).map(Number);
    const [m, a, r] = nums;
    const subtract = /subtract|take[s]? away/.test(c.question) && !/add/.test(c.question);
    const starts = [];
    for (let x = 1; x <= 2000; x++) if ((subtract ? x * m - a : x * m + a) === r) starts.push(x);
    assert.deepEqual(starts.map(String), [c.claimedAnswer], c.question);
  }
});

test("round to decimal places: string-digit rounding (half up, carries included) agrees with the answer", () => {
  let carries = 0;
  let fives = 0;
  for (const c of candidates(BP_ROUND_DECIMAL_PLACES)) {
    const text = c.question.match(/\d+\.\d{3}/)![0];
    const dp = Number(c.question.match(/(\d) decimal place/)![1]);
    const [whole, frac] = text.split(".");
    let kept = Number(whole + frac.slice(0, dp));
    const next = Number(frac[dp]);
    if (next >= 5) kept += 1;
    const s = kept.toString().padStart(dp + 1, "0");
    const expected = `${s.slice(0, s.length - dp)}.${s.slice(s.length - dp)}`;
    assert.equal(c.claimedAnswer, expected, c.question);
    // a child who truncates gets it wrong where it matters, and the checker enforces that
    const truncated = `${whole}.${frac.slice(0, dp)}`;
    if (next >= 5) assert.equal(checkMathsAnswer(truncated, c.claimedAnswer), false, `${c.question} truncation must not pass`);
    assert.equal(checkMathsAnswer(c.claimedAnswer, c.claimedAnswer), true);
    if (next === 5) fives++;
    if (next >= 5 && frac.slice(dp - 1, dp) === "9") carries++;
  }
  assert.ok(fives > 15 && carries > 8, `edge-case coverage fives=${fives} carries=${carries}`);
});

test("round to the nearest 10/100/1000: nearest multiple by scan, exact midpoints round up", () => {
  let midpoints = 0;
  for (const c of candidates(BP_ROUND_NEAREST_IN_CONTEXT)) {
    const n = Number(c.question.match(/(\d{1,3}(?:,\d{3})*)/)![1].replace(/,/g, ""));
    const unit = Number(c.question.match(/nearest (\d+)/)![1]);
    let best = 0;
    for (let k = 0; k <= Math.ceil(n / unit) + 1; k++) {
      const cand = k * unit;
      if (Math.abs(cand - n) < Math.abs(best - n) || (Math.abs(cand - n) === Math.abs(best - n) && cand > best)) best = cand;
    }
    assert.equal(c.claimedAnswer, String(best), c.question);
    if (n % unit === unit / 2) midpoints++;
  }
  assert.ok(midpoints > 20, `midpoint coverage ${midpoints}`);
});

test("compare in different units: convert the written quantities and subtract", () => {
  for (const c of candidates(BP_COMPARE_IN_DIFFERENT_UNITS)) {
    const m = c.question.match(/is (\d+\.\d) (metres|kilograms|litres)\. Another .* is (\d+) (centimetres|grams|millilitres)\./)!;
    const per = { metres: 100, kilograms: 1000, litres: 1000 }[m[2] as "metres"];
    const bigInSmall = Math.round(Number(m[1]) * per);
    assert.equal(c.claimedAnswer, String(bigInSmall - Number(m[3])), c.question);
    assert.ok(bigInSmall > Number(m[3]));
    assert.notEqual(Number(m[1]) - Number(m[3]), bigInSmall - Number(m[3]), "unconverted subtraction must differ from the answer");
  }
});

test("timetable journey: times read from the TABLE, stops named in the question", () => {
  for (const c of candidates(BP_TIMETABLE_JOURNEY)) {
    const t = c.stimulus as MockTableStimulus;
    assert.ok(isValidTableStimulus(t));
    const times = t.rows.map((r) => toMin(r[1]));
    assert.ok(times.every((x, i) => i === 0 || x > times[i - 1]), "times increase down the table");
    const named = t.rows.map((r) => r[0]).filter((s) => c.question.includes(s)).sort((a, b) => c.question.indexOf(a) - c.question.indexOf(b));
    assert.equal(named.length, 2, c.question);
    const from = times[t.rows.findIndex((r) => r[0] === named[0])];
    const to = times[t.rows.findIndex((r) => r[0] === named[1])];
    assert.equal(c.claimedAnswer, String(to - from), c.question);
  }
});

test("function table: the rule recovered from the table's own rows reproduces every row and gives the answer", () => {
  for (const c of candidates(BP_FUNCTION_TABLE_RULE)) {
    const t = c.stimulus as MockTableStimulus;
    assert.ok(isValidTableStimulus(t));
    const rows = t.rows.map((r) => [Number(r[0]), Number(r[1])]);
    const a = rows[1][1] - rows[0][1];
    const b = rows[0][1] - a;
    for (const [n, out] of rows) assert.equal(a * n + b, out);
    const target = Number(c.question.match(/(\d+)\??$/)![1]);
    assert.equal(c.claimedAnswer, String(a * target + b), c.question);
    assert.ok(target >= 12 && target > rows[rows.length - 1][0], "the question goes beyond the table");
    assert.ok(a !== b);
  }
});

test("mean from a table: total of the table's values divided by five", () => {
  for (const c of candidates(BP_MEAN_FROM_TABLE)) {
    const t = c.stimulus as MockTableStimulus;
    assert.ok(isValidTableStimulus(t));
    const total = t.rows.reduce((s, r) => s + Number(r[1]), 0);
    assert.equal(total % 5, 0);
    assert.equal(c.claimedAnswer, String(total / 5), c.question);
  }
});

test("consecutive numbers: the run found by search sums to the stated total and its end is the answer", () => {
  for (const c of candidates(BP_CONSECUTIVE_FROM_SUM)) {
    const total = Number(c.question.match(/\d+/g)!.pop());
    const count = /three|Three/.test(c.question) ? 3 : 5;
    const askSmall = /smallest|lowest|first/.test(c.question);
    let run: number[] = [];
    for (let x = 1; x <= total; x++) {
      const r = Array.from({ length: count }, (_, k) => x + k);
      if (r.reduce((s, y) => s + y, 0) === total) { run = r; break; }
    }
    assert.equal(run.length, count, c.question);
    assert.equal(c.claimedAnswer, String(askSmall ? run[0] : run[count - 1]), c.question);
    assert.notEqual(c.claimedAnswer, String(total / count), "the middle number is the trap, never the answer");
  }
});

test("convert then divide: convert by the stated factor, then the portions count is exact", () => {
  for (const c of candidates(BP_CONVERT_THEN_DIVIDE)) {
    const m = c.question.match(/(\d+\.\d) (metres|kilograms|litres)[\s\S]*?(\d+) (centimetres|grams|millilitres)/)!;
    const per = { metres: 100, kilograms: 1000, litres: 1000 }[m[2] as "metres"];
    const total = Math.round(Number(m[1]) * per);
    assert.equal(total % Number(m[3]), 0, c.question);
    assert.equal(c.claimedAnswer, String(total / Number(m[3])), c.question);
  }
});

test("timetable wait: the next departure strictly after the stated arrival, read from the table", () => {
  for (const c of candidates(BP_TIMETABLE_WAIT)) {
    const t = c.stimulus as MockTableStimulus;
    assert.ok(isValidTableStimulus(t));
    const deps = t.rows.map((r) => toMin(r[1]));
    const arrival = toMin(c.question.match(/at (\d\d:\d\d)\./)![1]);
    const next = deps.find((d) => d > arrival)!;
    assert.equal(c.claimedAnswer, String(next - arrival), c.question);
    assert.ok(deps.some((d) => d < arrival), "there is an earlier departure that must NOT be used");
  }
});

test("function table reverse: the rule read from the table, run backwards by search, gives the input", () => {
  for (const c of candidates(BP_FUNCTION_TABLE_REVERSE)) {
    const t = c.stimulus as MockTableStimulus;
    const rows = t.rows.map((r) => [Number(r[0]), Number(r[1])]);
    const a = rows[1][1] - rows[0][1];
    const b = rows[0][1] - a;
    const out = Number(c.question.match(/(\d+)/)![1]);
    let found = -1;
    for (let n = 1; n <= 200; n++) if (a * n + b === out) found = n;
    assert.equal(c.claimedAnswer, String(found), c.question);
    assert.ok(found > rows[rows.length - 1][0], "beyond the table");
  }
});

test("mean with a missing value: the table's four values plus the answer give exactly the stated mean", () => {
  for (const c of candidates(BP_MEAN_MISSING_VALUE_TABLE)) {
    const t = c.stimulus as MockTableStimulus;
    assert.ok(isValidTableStimulus(t));
    assert.equal(t.rows[4][1], "?", "the missing value is shown as ?");
    const known = t.rows.slice(0, 4).reduce((s, r) => s + Number(r[1]), 0);
    const mean = Number(c.question.match(/is (\d+)\./)![1]);
    assert.equal((known + Number(c.claimedAnswer)) / 5, mean, c.question);
  }
});

test("representation is necessary: no data in the question text of the three table blueprints", () => {
  for (const bp of [BP_TIMETABLE_JOURNEY, BP_MEAN_FROM_TABLE] as StructuralBlueprint<Record<string, number>>[]) {
    for (const c of candidates(bp)) assert.doesNotMatch(c.question, /\d/, c.question);
  }
  for (const c of candidates(BP_FUNCTION_TABLE_RULE)) assert.equal((c.question.match(/\d+/g) ?? []).length, 1, "only the target input is stated");
});

test("no undefined/NaN leaks into any question, step or answer", () => {
  for (const f of CSSE_BREADTH_EXPANSION_FAMILIES) for (const bp of f.blueprints) {
    for (const c of candidates(bp as StructuralBlueprint<Record<string, number>>, 11)) {
      assert.doesNotMatch([c.question, c.claimedAnswer, ...c.workingSteps].join(" "), /undefined|NaN|\[object/, bp.blueprintId);
    }
  }
});

test("family batch validation passes, every blueprint is used, difficulty reaches two tiers, misconceptions are named", () => {
  for (const f of CSSE_BREADTH_EXPANSION_FAMILIES) {
    const { metrics } = runFamilyBatch(f, [], f.blueprints.length * 40, seeded(21));
    assert.ok(metrics.approved / metrics.rawGenerated > 0.8, `${f.familyId}: ${metrics.approved}/${metrics.rawGenerated} ${JSON.stringify(metrics.rejectedByReason)}`);
    assert.equal(metrics.distinctBlueprintsUsed, f.blueprints.length);
    for (const bp of f.blueprints) {
      assert.ok(bp.misconceptionTargeted && bp.misconceptionTargeted.length > 20, bp.blueprintId);
      assert.equal(bp.mockEligible, false);
    }
  }
  for (const bp of [BP_THINK_OF_A_NUMBER, BP_ROUND_DECIMAL_PLACES, BP_ROUND_NEAREST_IN_CONTEXT, BP_TIMETABLE_JOURNEY, BP_FUNCTION_TABLE_RULE, BP_MEAN_FROM_TABLE] as StructuralBlueprint<Record<string, number>>[]) {
    const [r] = checkPerBlueprintDifficultyReachability(candidates(bp), 2);
    assert.ok(r.meetsMinimum, `${bp.blueprintId} ${JSON.stringify(r.tierCounts)}`);
  }
});
