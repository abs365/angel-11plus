import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BP_NL_READ_VALUE, BP_NL_DIFFERENCE, BP_NL_READ_THEN_ROUND, CSSE_NUMBER_LINE_FAMILIES } from "@/lib/ali/questionFactory/csseNumberLineBlueprints";
import { generateBlueprintCandidate, runFamilyBatch, validateBlueprintCandidate } from "@/lib/ali/questionFactory/candidateGeneration";
import { checkPerBlueprintDifficultyReachability } from "@/lib/ali/questionFactory/diversityGates";
import { isValidNumberLineStimulus } from "@/lib/mockAttempt/workspace";
import { NumberLineStimulus } from "@/components/mockAttempt/NumberLineStimulus";
import { StructuredStimulus } from "@/components/mockAttempt/StructuredStimulus";
import { mapMathsCandidateToStoreRow } from "@/lib/ali/questionFactory/mathsCandidateStoreMapping";
import type { StructuralBlueprint } from "@/lib/ali/questionFactory/types";
import type { MockNumberLineStimulus } from "@/lib/mockAttempt/types";

/** Answers are re-derived from the STIMULUS OBJECT with exact thousandths arithmetic written separately here. */
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
type BP = StructuralBlueprint<Record<string, number>>;
const all = CSSE_NUMBER_LINE_FAMILIES.flatMap((f) => f.blueprints) as BP[];
const N = 300;
const cands = (bp: BP, seed = 31) => {
  const r = seeded(seed);
  return Array.from({ length: N }, () => generateBlueprintCandidate(bp, r));
};
const st = (c: { stimulus?: unknown }) => c.stimulus as MockNumberLineStimulus;
const u = (n: number) => Math.round(n * 1000);
const val = (s: MockNumberLineStimulus, l: string) => u(s.points.find((p) => p.label === l)!.value);

test("three blueprints across two families; the read/difference questions carry no digits", () => {
  assert.equal(all.length, 3);
  for (const bp of [BP_NL_READ_VALUE, BP_NL_DIFFERENCE] as unknown as BP[]) for (const c of cands(bp, 3)) assert.doesNotMatch(c.question, /\d/, c.question);
});

test("read value: the arrow's value is the answer, and it is not on a labelled mark in non-easy cases", () => {
  let between = 0;
  let negative = 0;
  let decimal = 0;
  for (const c of cands(BP_NL_READ_VALUE as unknown as BP)) {
    const s = st(c);
    assert.ok(isValidNumberLineStimulus(s));
    assert.equal(u(Number(c.claimedAnswer)), val(s, "P"), c.claimedAnswer);
    if ((val(s, "P") - u(s.min)) % u(s.majorStep) !== 0) between++;
    if (s.min < 0) negative++;
    if (!Number.isInteger(s.majorStep)) decimal++;
  }
  assert.ok(between > 150 && negative > 30 && decimal > 30, `${between}/${negative}/${decimal}`);
});

test("difference: B minus A, read from the drawn arrows", () => {
  for (const c of cands(BP_NL_DIFFERENCE as unknown as BP)) {
    const s = st(c);
    assert.ok(val(s, "B") > val(s, "A"));
    assert.equal(u(Number(c.claimedAnswer)), val(s, "B") - val(s, "A"));
  }
});

test("read then round: nearest labelled mark by distance, never a tie, never already on a mark", () => {
  const seen = new Set<string>();
  for (const c of cands(BP_NL_READ_THEN_ROUND as unknown as BP)) {
    const s = st(c);
    const v = val(s, "P");
    const m = u(s.majorStep);
    assert.notEqual((v - u(s.min)) % m, 0, "arrow is between marks");
    const marks = [] as number[];
    for (let x = u(s.min); x <= u(s.max); x += m) marks.push(x);
    const dists = marks.map((x) => Math.abs(x - v)).sort((a, b) => a - b);
    assert.ok(dists[0] < dists[1], "no tie between the two nearest marks");
    const nearest = marks.reduce((best, x) => (Math.abs(x - v) < Math.abs(best - v) ? x : best));
    assert.equal(u(Number(c.claimedAnswer)), nearest);
    assert.match(c.question, /nearest (tenth|whole number|10|100)\./);
    seen.add(c.question);
  }
  assert.equal(seen.size, 4, "all four rounding units appear");
});

test("independently verified from the line; a wrong answer is rejected", () => {
  for (const bp of all) {
    const r = seeded(5);
    for (let i = 0; i < 60; i++) {
      const c = generateBlueprintCandidate(bp, r);
      const v = validateBlueprintCandidate(c, bp, []);
      assert.equal(v.independentlyVerified, true, bp.blueprintId);
      assert.ok(v.mathematicallyValid);
      const tv = validateBlueprintCandidate({ ...c, claimedAnswer: String(Number(c.claimedAnswer) + 1) }, bp, []);
      assert.ok(tv.reasons.includes("answer_mismatch"), bp.blueprintId);
    }
  }
});

test("validator fails closed", () => {
  const ok: MockNumberLineStimulus = { type: "number-line", min: 0, max: 1, majorStep: 0.5, minorDivisions: 5, points: [{ label: "P", value: 0.3 }] };
  assert.ok(isValidNumberLineStimulus(ok));
  assert.ok(!isValidNumberLineStimulus({ ...ok, points: [{ label: "P", value: 0.33 }] }), "off a minor tick");
  assert.ok(!isValidNumberLineStimulus({ ...ok, points: [{ label: "P", value: 2 }] }), "outside the line");
  assert.ok(!isValidNumberLineStimulus({ ...ok, min: 0.2 }), "min must be a multiple of the major step");
  assert.ok(!isValidNumberLineStimulus({ ...ok, minorDivisions: 3 }));
  assert.ok(!isValidNumberLineStimulus({ ...ok, max: 20, majorStep: 1 }), "too many intervals");
  assert.ok(!isValidNumberLineStimulus({ ...ok, majorStep: 0 }));
  assert.ok(!isValidNumberLineStimulus({ ...ok, points: [{ label: "P", value: 0.3 }, { label: "P", value: 0.4 }] }));
});

test("renderer: labelled majors only, one marker per point, text equivalent hides the value", () => {
  const s: MockNumberLineStimulus = { type: "number-line", min: -1, max: 1, majorStep: 0.5, minorDivisions: 5, points: [{ label: "P", value: 0.3 }] };
  const html = renderToStaticMarkup(React.createElement(NumberLineStimulus, { stimulus: s }));
  for (const t of ["-1.0", "-0.5", "0.0", "0.5", "1.0"]) assert.ok(html.includes(`>${t}</text>`), t);
  assert.ok(!html.includes(">0.3</text>"), "the arrow's value is not printed");
  const aria = html.match(/aria-label="([^"]*)"/)![1];
  assert.ok(!aria.includes("0.3") && aria.includes("Marked points: P"));
  assert.ok(!html.includes("url(#"));
  assert.match(renderToStaticMarkup(React.createElement(StructuredStimulus, { stimulus: s })), /<svg/);
});

test("governed route carries the line; batch healthy; tiers reachable", () => {
  const bp = BP_NL_READ_THEN_ROUND as unknown as BP;
  const c = generateBlueprintCandidate(bp, seeded(3));
  const v = validateBlueprintCandidate(c, bp, []);
  const args = mapMathsCandidateToStoreRow("csse-nl-test-01", c, bp, v);
  assert.deepEqual((args.p_question_content as { stimulus: unknown }).stimulus, c.stimulus);
  for (const f of CSSE_NUMBER_LINE_FAMILIES) {
    const { metrics } = runFamilyBatch(f, [], 100, seeded(9));
    assert.ok(metrics.approved / metrics.rawGenerated > 0.9, `${f.familyId} ${JSON.stringify(metrics.rejectedByReason)}`);
  }
  for (const b of all) {
    const [r] = checkPerBlueprintDifficultyReachability(cands(b), 2);
    assert.ok(r.meetsMinimum, `${b.blueprintId} ${JSON.stringify(r.tierCounts)}`);
  }
});
