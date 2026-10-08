import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  BP_TABLE_READ_AND_COMBINE, BP_TABLE_COMPARE_COLUMN_TOTALS, BP_BAR_CHART_READ_DIFFERENCE, BP_BAR_CHART_MEAN, MR01_DATA_HANDLING_EXPANSION,
} from "@/lib/ali/questionFactory/csseDataHandlingBlueprints";
import { generateBlueprintCandidate, runFamilyBatch } from "@/lib/ali/questionFactory/candidateGeneration";
import { mapMathsCandidateToStoreRow } from "@/lib/ali/questionFactory/mathsCandidateStoreMapping";
import { checkPerBlueprintDifficultyReachability } from "@/lib/ali/questionFactory/diversityGates";
import { isValidBarChartStimulus, isValidTableStimulus } from "@/lib/mockAttempt/workspace";
import { BarChartStimulus } from "@/components/mockAttempt/BarChartStimulus";
import { StructuredStimulus } from "@/components/mockAttempt/StructuredStimulus";
import type { StructuralBlueprint } from "@/lib/ali/questionFactory/types";
import type { MockBarChartStimulus, MockTableStimulus } from "@/lib/mockAttempt/types";

/**
 * Representation extension: data handling that REQUIRES a table or bar chart. Answers are re-derived from the
 * STIMULUS OBJECT ITSELF (the thing the child sees), by a different route from the blueprint's own formula, so a
 * mismatch between what is drawn and what is asked cannot pass.
 */
// mulberry32: a well-mixed 32-bit PRNG. (The multiply-add LCG used by older scripts loses low bits above 2^53 and correlates
// consecutive draws, which shows up as spurious duplicates when a blueprint draws many parameters.)
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
const N = 250;
function candidates<T extends Record<string, number>>(bp: StructuralBlueprint<T>, seed = 3) {
  const rnd = seeded(seed);
  return Array.from({ length: N }, () => generateBlueprintCandidate(bp, rnd));
}
const mentioned = (text: string, names: string[]) => names.map((n) => ({ n, at: text.indexOf(n) })).filter((x) => x.at >= 0).sort((a, b) => a.at - b.at).map((x) => x.n);

test("table: combine two rows -- answer equals the two named rows read from the table", () => {
  for (const c of candidates(BP_TABLE_READ_AND_COMBINE)) {
    const t = c.stimulus as MockTableStimulus;
    assert.ok(isValidTableStimulus(t));
    const names = t.rows.map((r) => r[0]);
    const named = mentioned(c.question, names);
    assert.equal(named.length, 2, c.question);
    const total = t.rows.filter((r) => named.includes(r[0])).reduce((s, r) => s + Number(r[1]), 0);
    assert.equal(c.claimedAnswer, String(total), c.question);
  }
});

test("table: compare column totals -- answer equals (sum of Week 2) - (sum of Week 1) read from the table", () => {
  for (const c of candidates(BP_TABLE_COMPARE_COLUMN_TOTALS)) {
    const t = c.stimulus as MockTableStimulus;
    assert.ok(isValidTableStimulus(t));
    assert.deepEqual(t.headers.slice(1), ["Week 1", "Week 2"]);
    const w1 = t.rows.reduce((s, r) => s + Number(r[1]), 0);
    const w2 = t.rows.reduce((s, r) => s + Number(r[2]), 0);
    assert.equal(c.claimedAnswer, String(w2 - w1), c.question);
    assert.ok(w2 - w1 > 0);
  }
});

test("bar chart: difference -- the first named bar minus the second, read from the chart's own values", () => {
  for (const c of candidates(BP_BAR_CHART_READ_DIFFERENCE)) {
    const ch = c.stimulus as MockBarChartStimulus;
    assert.ok(isValidBarChartStimulus(ch), JSON.stringify(ch));
    const named = mentioned(c.question, ch.categories);
    assert.equal(named.length, 2, c.question);
    const val = (name: string) => ch.values[ch.categories.indexOf(name)];
    assert.equal(c.claimedAnswer, String(val(named[0]) - val(named[1])), c.question);
    assert.ok(val(named[0]) > val(named[1]));
  }
});

test("bar chart: mean -- total of the drawn bars divided by five", () => {
  for (const c of candidates(BP_BAR_CHART_MEAN)) {
    const ch = c.stimulus as MockBarChartStimulus;
    assert.ok(isValidBarChartStimulus(ch));
    const total = ch.values.reduce((s, x) => s + x, 0);
    assert.equal(total % 5, 0);
    assert.equal(c.claimedAnswer, String(total / 5), c.question);
  }
});

test("the representation is NECESSARY: the data is never restated in the question text", () => {
  for (const bp of [BP_TABLE_READ_AND_COMBINE, BP_BAR_CHART_READ_DIFFERENCE, BP_BAR_CHART_MEAN] as StructuralBlueprint<Record<string, number>>[]) {
    for (const c of candidates(bp)) assert.doesNotMatch(c.question, /\d/, `${bp.blueprintId}: ${c.question}`);
  }
  for (const c of candidates(BP_TABLE_COMPARE_COLUMN_TOTALS)) assert.equal(c.question.replace(/Week [12]/g, "").match(/\d/g), null, c.question);
});

test("scale reading is genuinely exercised: many bars end between gridlines, and reading them as the lower gridline would give a different answer", () => {
  let betweenGridlines = 0;
  let wouldDiffer = 0;
  for (const c of candidates(BP_BAR_CHART_READ_DIFFERENCE)) {
    const ch = c.stimulus as MockBarChartStimulus;
    if (ch.values.some((v) => v % ch.scaleStep !== 0)) betweenGridlines++;
    const named = mentioned(c.question, ch.categories);
    const val = (n: string) => ch.values[ch.categories.indexOf(n)];
    const lower = (v: number) => Math.floor(v / ch.scaleStep) * ch.scaleStep;
    if (lower(val(named[0])) - lower(val(named[1])) !== val(named[0]) - val(named[1])) wouldDiffer++;
  }
  assert.ok(betweenGridlines / N > 0.4, `between-gridline share ${betweenGridlines / N}`);
  assert.ok(wouldDiffer / N > 0.2, `misconception-distinguishing share ${wouldDiffer / N}`);
});

test("scales vary across candidates (the child must read each chart's own scale)", () => {
  const steps = new Set(candidates(BP_BAR_CHART_READ_DIFFERENCE).map((c) => (c.stimulus as MockBarChartStimulus).scaleStep));
  assert.ok(steps.size >= 4, JSON.stringify([...steps]));
});

test("validators fail closed on malformed charts", () => {
  const ok: MockBarChartStimulus = { type: "bar-chart", categories: ["A", "B"], values: [4, 6], scaleStep: 2, axisMax: 8 };
  assert.ok(isValidBarChartStimulus(ok));
  assert.ok(!isValidBarChartStimulus({ ...ok, values: [4] }));
  assert.ok(!isValidBarChartStimulus({ ...ok, values: [4, 9] }), "value above the axis");
  assert.ok(!isValidBarChartStimulus({ ...ok, axisMax: 7 }), "scale must divide the axis");
  assert.ok(!isValidBarChartStimulus({ ...ok, values: [4, 5.5] }));
  assert.ok(!isValidBarChartStimulus({ ...ok, scaleStep: 1, axisMax: 40 }), "too many gridlines to read");
  assert.ok(!isValidBarChartStimulus({ ...ok, categories: ["A"], values: [1] }));
  assert.ok(!isValidBarChartStimulus(null));
});

test("renderer: draws one bar per category, a labelled scale, a text equivalent, and no value labels on the bars", () => {
  const ch: MockBarChartStimulus = { type: "bar-chart", title: "Fruit sold", yLabel: "Kilograms sold", categories: ["Apples", "Pears", "Plums"], values: [10, 25, 15], scaleStep: 5, axisMax: 30 };
  const html = renderToStaticMarkup(React.createElement(BarChartStimulus, { stimulus: ch }));
  assert.equal((html.match(/<rect /g) ?? []).length, 3);
  for (const c of ch.categories) assert.ok(html.includes(`>${c}</text>`));
  for (const t of [0, 5, 10, 15, 20, 25, 30]) assert.ok(html.includes(`>${t}</text>`), `tick ${t}`);
  assert.match(html, /role="img" aria-label="Bar chart: Fruit sold\. Apples: 10, Pears: 25, Plums: 15\./);
  assert.doesNotMatch(html, /fill="url\(/, "no gradients");
});

test("StructuredStimulus shows valid table and chart, and renders nothing for an invalid or unknown stimulus", () => {
  const table: MockTableStimulus = { type: "table", headers: ["Day", "Books"], rows: [["Mon", "12"]] };
  assert.match(renderToStaticMarkup(React.createElement(StructuredStimulus, { stimulus: table })), /<table/);
  const chart: MockBarChartStimulus = { type: "bar-chart", categories: ["A", "B"], values: [2, 4], scaleStep: 2, axisMax: 4 };
  assert.match(renderToStaticMarkup(React.createElement(StructuredStimulus, { stimulus: chart })), /<svg/);
  assert.equal(renderToStaticMarkup(React.createElement(StructuredStimulus, { stimulus: { type: "bar-chart", categories: ["A"] } })), "");
  assert.equal(renderToStaticMarkup(React.createElement(StructuredStimulus, { stimulus: undefined })), "");
});

test("the stimulus survives the governed route: candidate -> submit args (question_content.stimulus) -> prompt.stimulus on publication", () => {
  const c = generateBlueprintCandidate(BP_BAR_CHART_MEAN, seeded(1));
  const args = mapMathsCandidateToStoreRow("csse-data-test-01", c, BP_BAR_CHART_MEAN as StructuralBlueprint<Record<string, number>>, { mathematicallyValid: true, approved: true, reasons: [] });
  assert.deepEqual((args.p_question_content as { stimulus: unknown }).stimulus, c.stimulus);
  // publish_question_candidate copies question_content whole into prompt (migration 237), then adds `answer`
  const sql = fs.readFileSync("supabase/migrations/237_publish_question_candidate_answer_persistence_correction.sql", "utf8");
  assert.match(sql, /v_final_prompt := v_candidate\.question_content;/);
  // a blueprint without a stimulus does not gain a stimulus key (existing candidates are unaffected)
  assert.ok(!("stimulus" in mapMathsCandidateToStoreRow("x", { ...c, stimulus: undefined }, BP_BAR_CHART_MEAN as StructuralBlueprint<Record<string, number>>, { mathematicallyValid: true, approved: true, reasons: [] }).p_question_content));
});

test("family batch validation and diversity: all four blueprints are used, tiers are reachable, nothing dominates", () => {
  const { metrics } = runFamilyBatch(MR01_DATA_HANDLING_EXPANSION, [], 120, seeded(9));
  assert.ok(metrics.approved / metrics.rawGenerated > 0.9, `${metrics.approved}/${metrics.rawGenerated}`);
  assert.equal(metrics.distinctBlueprintsUsed, 4);
  for (const bp of [BP_TABLE_READ_AND_COMBINE, BP_BAR_CHART_READ_DIFFERENCE, BP_TABLE_COMPARE_COLUMN_TOTALS] as StructuralBlueprint<Record<string, number>>[]) {
    const [r] = checkPerBlueprintDifficultyReachability(candidates(bp), 2);
    assert.ok(r.meetsMinimum, `${bp.blueprintId} ${JSON.stringify(r.tierCounts)}`);
  }
});

test("Practice renders the stimulus; Mock surfaces are untouched by this extension", () => {
  const practice = fs.readFileSync("app/learning-intelligence/practice/[area]/page.tsx", "utf8");
  assert.match(practice, /<StructuredStimulus stimulus=\{prompt\.stimulus\} \/>/);
  const mock = fs.readFileSync("app/learning-intelligence/mock-exam/page.tsx", "utf8");
  assert.doesNotMatch(mock, /StructuredStimulus|BarChartStimulus/);
});
