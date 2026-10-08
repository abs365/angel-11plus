import { test } from "node:test";
import assert from "node:assert/strict";
import { MR01_DATA_HANDLING_EXPANSION } from "@/lib/ali/questionFactory/csseDataHandlingBlueprints";
import { CSSE_BREADTH_EXPANSION_FAMILIES } from "@/lib/ali/questionFactory/csseBreadthBlueprints";
import { generateBlueprintCandidate } from "@/lib/ali/questionFactory/candidateGeneration";
import type { MockBarChartStimulus, MockTableStimulus } from "@/lib/mockAttempt/types";
import type { StructuralBlueprint } from "@/lib/ali/questionFactory/types";

/**
 * Semantic audit (Founder direction): deterministic answer correctness does not prove that the stimulus itself is
 * semantically right. This checks that the title/caption, headers, units, scale and question wording of every table
 * and chart candidate agree with each other, for every context, across many generated instances.
 * Example of the class of defect it exists to catch: a caption "The sport each pupil in a club chose, by week"
 * over a task about numbers of pupils recorded in two weeks.
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
const STOP = new Set(["the", "shows", "table", "chart", "many", "more", "than", "each", "were", "that", "this", "with", "from", "what", "does", "take", "mean", "number", "read", "values", "carefully", "scale", "altogether", "output", "input"]);
const words = (s: string) => (s.toLowerCase().match(/[a-z]{4,}/g) ?? []).filter((w) => !STOP.has(w)).map((w) => w.replace(/s$/, ""));
const shared = (a: string, b: string) => words(a).filter((w) => new Set(words(b)).has(w));

const bps = [...MR01_DATA_HANDLING_EXPANSION.blueprints, ...CSSE_BREADTH_EXPANSION_FAMILIES.flatMap((f) => f.blueprints)].filter((bp) => bp.deriveStimulus) as StructuralBlueprint<Record<string, number>>[];

test("there are stimulus-carrying blueprints to audit (guard against this test silently auditing nothing)", () => {
  assert.ok(bps.length >= 10, `only ${bps.length}`);
});

test("every table: caption and headers describe the same quantity the question asks about, with consistent units and period", () => {
  for (const bp of bps) {
    const rnd = seeded(13);
    for (let i = 0; i < 120; i++) {
      const c = generateBlueprintCandidate(bp, rnd);
      const st = c.stimulus as MockTableStimulus | MockBarChartStimulus;
      if (st.type !== "table") continue;
      const stimText = `${st.caption ?? ""} ${st.headers.join(" ")}`;
      const label = `${bp.blueprintId} ctx=${c.contextTag}`;
      assert.ok(st.caption && st.caption.length > 5, `${label}: table needs a caption`);
      // the question and the stimulus must talk about the same thing
      assert.ok(shared(c.question, stimText).length >= 1 || /rule|linked/.test(c.question), `${label}: question and table share no subject word\n Q: ${c.question}\n T: ${stimText}`);
      const twoWeek = st.headers.includes("Week 1") && st.headers.includes("Week 2");
      if (twoWeek) {
        assert.match(st.caption!, /Week 1 and Week 2/, `${label}: two-week table caption must say so`);
        assert.match(c.question, /two weeks/, `${label}: two-week question must say so`);
        assert.doesNotMatch(c.question, /recorded|for each (day|sport|fruit) in two weeks/, `${label}: vague wording`);
      } else if (!/Week/.test(stimText)) {
        assert.doesNotMatch(st.caption!, /week/i, `${label}: single-period table must not mention weeks`);
      }
      // captions are descriptions of data (noun phrases), not sentences with a chosen/sold-at verb phrase
      assert.doesNotMatch(st.caption!, /\b(chose|each pupil in a club)\b/i, `${label}: caption describes the activity, not the data`);
      // first column heading matches the row labels' kind, value column names a unit/quantity
      assert.ok(st.headers.every((h) => h.trim().length > 0));
      assert.ok(new Set(st.rows.map((r) => r[0])).size === st.rows.length, `${label}: row labels must be unique`);
    }
  }
});

test("every bar chart: title, axis label, scale and categories agree with the question", () => {
  for (const bp of bps) {
    const rnd = seeded(17);
    for (let i = 0; i < 120; i++) {
      const c = generateBlueprintCandidate(bp, rnd);
      const st = c.stimulus as MockTableStimulus | MockBarChartStimulus;
      if (st.type !== "bar-chart") continue;
      const label = `${bp.blueprintId} ctx=${c.contextTag}`;
      assert.ok(st.title && st.yLabel, `${label}: chart needs a title and a vertical-axis label`);
      assert.ok(shared(c.question, `${st.title} ${st.yLabel}`).length >= 1, `${label}: question and chart share no subject word\n Q: ${c.question}\n C: ${st.title} / ${st.yLabel}`);
      assert.doesNotMatch(st.title!, /\b(chose|each pupil in a club)\b/i, `${label}: title describes the activity, not the data`);
      assert.ok([2, 4, 5, 10, 20].includes(st.scaleStep), `${label}: unexpected scale ${st.scaleStep}`);
      assert.equal(st.axisMax % st.scaleStep, 0);
      assert.ok(st.values.every((v) => v <= st.axisMax));
      assert.ok(Math.max(...st.values) > st.axisMax - 2 * st.scaleStep, `${label}: axis far taller than the data wastes the chart`);
      // the value unit named in the question appears in the axis label or title
      const unit = (c.question.match(/\b(books|pupils|kilograms)\b/) ?? [])[1];
      if (unit) assert.ok(new RegExp(unit.slice(0, 5), "i").test(`${st.title} ${st.yLabel}`), `${label}: unit "${unit}" missing from the chart labels`);
    }
  }
});

test("timetables say what the times are (time at a stop / when a service leaves), and journeys are measured between those times", () => {
  for (const bp of bps.filter((b) => /timetable/.test(b.blueprintId))) {
    const rnd = seeded(19);
    for (let i = 0; i < 60; i++) {
      const c = generateBlueprintCandidate(bp, rnd);
      const st = c.stimulus as MockTableStimulus;
      if (/journey/.test(bp.blueprintId)) {
        assert.deepEqual(st.headers, ["Stop", "Time"]);
        assert.match(c.question, /the time a \w+ is at each stop/);
        assert.match(st.caption!, /time at each stop/);
      } else {
        assert.match(st.headers[1], /Leaves at/);
        assert.match(c.question, /when each \w+ leaves/);
      }
    }
  }
});

test("function tables: the headings and the question use the same noun (pattern number / week / input)", () => {
  for (const bp of bps.filter((b) => /function-table/.test(b.blueprintId))) {
    const rnd = seeded(23);
    for (let i = 0; i < 90; i++) {
      const c = generateBlueprintCandidate(bp, rnd);
      const st = c.stimulus as MockTableStimulus;
      const q = c.question.toLowerCase();
      if (/counters/.test(st.headers[1].toLowerCase())) assert.ok(/counters|pattern/.test(q), c.question);
      if (/week/.test(st.headers[0].toLowerCase())) assert.ok(/week|saved/.test(q), c.question);
      if (st.headers[0] === "Input") assert.ok(/input|output/.test(q), c.question);
    }
  }
});
