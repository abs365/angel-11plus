#!/usr/bin/env node
/**
 * Generates ANGEL_CSSE_MATHS_EXPANSION_B_EDUCATIONAL_REVIEW.md: the Founder-readable educational summary for the
 * 16 blueprints behind the 144 pending candidates of (a) the data-handling set (tables/charts) and (b) the breadth set
 * (precision, measurement, time, rules, averages, missing numbers). Numbers are computed from the real blueprints and
 * packages; the "structural difference" and "transfer value" lines are authored judgements for the Founder to confirm.
 * Read-only: submits, approves and publishes nothing.
 *
 * Run: npx tsx scripts/csse-expansion-b-review-summary.mjs
 */
import fs from "node:fs";
import { MR01_DATA_HANDLING_EXPANSION } from "../lib/ali/questionFactory/csseDataHandlingBlueprints.ts";
import { CSSE_BREADTH_EXPANSION_FAMILIES } from "../lib/ali/questionFactory/csseBreadthBlueprints.ts";
import { generateBlueprintCandidate } from "../lib/ali/questionFactory/candidateGeneration.ts";

const load = (dir) => JSON.parse(fs.readFileSync(`scripts/output/${dir}/submission-payload.json`, "utf8")).submissionPayload.map((p) => p.args);
const payload = [...load("csse-data-handling-expansion"), ...load("csse-breadth-expansion")];

function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const J = {
  "mr01-bp-table-read-and-combine": { s: "Existing data items list values in a sentence ('Amy: 7, Ben: 4 ...'). Here the data is only in a table and the child must pick the two rows named. Reading a table is the skill; the arithmetic is deliberately easy.", t: "Medium. Table reading is a standard exam skill that could not be practised at all before.", r: "Three situations; five distinct values per table so the space is large." },
  "mr01-bp-table-compare-column-totals": { s: "A two-column table where the child totals each column and subtracts. Adds multi-step reading across the whole table, not two cells.", t: "Medium-high. Comparing weeks or periods is the typical data question.", r: "Three situations; eight values constrained so the difference is 5 to 60." },
  "mr01-bp-bar-chart-read-difference": { s: "A bar chart with a scale that varies (steps of 2, 4, 5, 10, 20) and bars that often end between gridlines. The skill is reading the scale, which prose cannot test.", t: "High. Scale reading is the most common chart error. In tests, over 40% of items have a between-gridline bar and over 20% would be answered wrongly by reading the lower gridline.", r: "Five scales x three situations x bar heights: large space." },
  "mr01-bp-bar-chart-mean": { s: "Read five bars, total, divide by five. Connects averages to a chart (existing mean items use lists).", t: "High for Final preparation; hard by design.", r: "Same space as the difference chart; every item is hard." },
  "mr01-bp-think-of-a-number-two-step": { s: "Undo a two-step process. Existing missing-operand items are one operation (box x 7 = 84). Reversing two steps in the right order is new.", t: "High. 'I think of a number' is a classic exam shape and a direct gateway to algebraic thinking.", r: "Three wordings (including a machine); numbers vary widely. Mostly medium difficulty." },
  "mr01-bp-consecutive-numbers-from-sum": { s: "Uses the symmetry of consecutive numbers (the mean is the middle). Structurally unlike any existing missing-number item; the trap answer (total / count) is never the answer, enforced by tests.", t: "Medium-high. Strong reasoning item; also exercises house-number and page-number contexts.", r: "Three wordings, 3 or 5 numbers, smallest or largest asked. A fairly small structure; do not scale beyond about 10." },
  "mr06-bp-round-decimal-places": { s: "Existing precision items are division to 2 d.p. This isolates the rounding decision itself, with a bias toward the instructive cases: a 5 after the cut, and a carry through a 9.", t: "High for precision under exact-match marking. Tests verify truncating gives a wrong answer wherever rounding up is needed.", r: "Large numeric space; three wordings." },
  "mr06-bp-round-nearest-in-context": { s: "Rounding whole numbers to the nearest 10, 100 or 1,000 in a sentence, including exact midpoints (which round up).", t: "Medium. Foundational for estimation; exam wording is often exactly this.", r: "Three situations x three units; midpoints deliberately over-represented." },
  "mr01-bp-compare-different-units": { s: "Existing measurement items add mixed units and report in the larger unit. This asks for a difference in the smaller unit, so conversion must happen before any comparison; tests confirm subtracting the written numbers gives a different answer.", t: "High. Converting before comparing is the core measurement skill.", r: "Three unit families x three items; a modest space; keep volume low." },
  "mr01-bp-convert-then-divide": { s: "Convert, then divide into equal portions (how many cups from 2.4 litres). Division by a converted quantity is new here.", t: "Medium-high. A very common exam shape.", r: "Three unit families; constrained to exact division, so the space is smaller than it looks; keep volume low." },
  "mr04-bp-timetable-journey-time": { s: "Existing time items are prose ('starts at 14:00 ... lasts 45 minutes'). Here the times are in a timetable, and the journey crosses an hour boundary for roughly a third of items.", t: "High. Timetable reading is core Year 5-6 time work.", r: "Three routes; start time and gaps vary widely." },
  "mr04-bp-timetable-wait-for-next": { s: "A different timetable skill: find the first departure AFTER a stated time. Tests check an earlier departure exists that must not be used (the usual error).", t: "High. Closer to real life and a distinct error pattern from journey time.", r: "Three services; large space." },
  "mr02-bp-function-table-rule": { s: "Infer 'multiply then add' from the first rows of an input-output table and apply it far beyond the table. Existing sequence items give a list or a rule in words.", t: "High. Function tables are the natural bridge to algebra.", r: "Three captions (machine, counters, savings); a, b and the target vary independently." },
  "mr02-bp-function-table-reverse": { s: "Same table, run backwards from an output. The trap (dividing by the multiplier before removing the added amount) is the target misconception.", t: "High. Reversing a rule is harder than applying it; strong mastery check.", r: "Same space as the forward version; use with it, not instead of it." },
  "mr01-bp-mean-from-table": { s: "Mean from a table of five named values (existing mean items give lists inside a sentence).", t: "Medium. Same mean, now from a table.", r: "Three captions; five values with a divisible total." },
  "mr01-bp-mean-missing-value-table": { s: "Reverse mean in a table: total needed = mean x 5, minus the known values. A reverse-mean family already exists (prose); this adds the table form with the unknown shown as '?'.", t: "High for Final preparation; a classic hard exam item.", r: "Three captions; four values and the mean vary; every item is hard." },
};

const families = [MR01_DATA_HANDLING_EXPANSION, ...CSSE_BREADTH_EXPANSION_FAMILIES];
const rows = [];
const sections = [];
for (const family of families) {
  for (const bp of family.blueprints) {
    const mine = payload.filter((a) => a.p_generation_spec_id === bp.blueprintId);
    const diff = {};
    const ctx = new Set();
    for (const a of mine) { diff[a.p_difficulty] = (diff[a.p_difficulty] ?? 0) + 1; ctx.add(a.p_question_content.contextTag); }
    const rnd = seeded(97);
    const texts = new Set();
    for (let i = 0; i < 4000; i++) {
      const c = generateBlueprintCandidate(bp, rnd);
      texts.add(c.question + (c.stimulus ? JSON.stringify(c.stimulus) : ""));
    }
    const j = J[bp.blueprintId];
    if (!j) throw new Error("no judgement for " + bp.blueprintId);
    const ex = mine[0];
    const rep = bp.representationType({});
    rows.push(`| ${bp.blueprintId} | ${bp.competencyId} | ${bp.familyId} | ${mine.length} | ${Object.entries(diff).map(([k, v]) => `${k} ${v}`).join(", ")} | ${rep === "prose" ? "prose" : rep} | ${texts.size >= 3000 ? "LOW" : texts.size >= 400 ? "MODERATE" : "HIGHER"} (${texts.size} distinct / 4000) |`);
    const stim = ex.p_question_content.stimulus;
    sections.push(
      `### ${bp.blueprintId}`, "",
      `- **Competency / family / skill:** ${bp.competencyId} / \`${bp.familyId}\` / ${bp.questionTypeId}`,
      `- **Purpose:** ${bp.mathematicalObjective}`,
      `- **Misconception targeted:** ${bp.misconceptionTargeted}`,
      `- **Example question:** ${ex.p_question_content.question}`,
      ...(stim ? [`- **Stimulus shown with it:** ${stim.type === "table" ? "table " + JSON.stringify({ headers: stim.headers, rows: stim.rows }) : "bar chart " + JSON.stringify({ categories: stim.categories, values: stim.values, scaleStep: stim.scaleStep })}`] : []),
      `- **Answer and derivation:** answer **${ex.p_claimed_answer}**. ${ex.p_question_content.workingSteps.join(" ")}  _(deterministic; re-derived in tests by an independent method from the text/stimulus the child sees.)_`,
      `- **Structural difference from existing material:** ${j.s}`,
      `- **Context variation:** ${ctx.size} context tag(s) in the prepared set: ${[...ctx].join(", ")}`,
      `- **Difficulty (of ${mine.length} prepared):** ${Object.entries(diff).map(([k, v]) => `${k} ${v}`).join(", ")}. Basis: ${bp.difficultyDimensions.join(", ")}.`,
      `- **Transfer value:** ${j.t}`,
      `- **Repetition risk:** ${j.r}`,
      ""
    );
  }
}

const out = [];
out.push("# CSSE Maths candidates, expansion B (144 pending): educational review summary", "");
out.push("Prepared for Founder review. **Nothing has been submitted, approved or published.** Covers the 48 data-handling candidates (tables and bar charts) and the 96 breadth candidates (precision, measurement, time, rules, averages, missing numbers). Numbers are computed from the real blueprints; 'structural difference' and 'transfer value' are my judgements for you to confirm or reject.", "");
out.push("Questions to ask of each blueprint: (1) is the demand different from what the child already meets; (2) would an 11+ child recognise it as exam-style; (3) is the working correct and teachable; (4) is repetition acceptable.", "");
out.push("## At a glance", "", "| Blueprint | Competency | Family | Prepared | Difficulty mix | Representation | Repetition (distinct texts incl. stimulus) |", "|---|---|---|---|---|---|---|", ...rows, "");
out.push("## Cross-cutting points", "");
out.push("- **Every family gets two structurally different blueprints.** The diversity gate rates a single-blueprint batch CRITICAL, so no family is fed from one structure. At two blueprints the gate still rates a family batch HIGH (its own rule: depth of 2 or fewer). That is a reason to keep these volumes small (8 per breadth blueprint, 12 per data-handling blueprint) and to add a third structure per family before scaling, not a reason to hide it.");
const breadth = load("csse-breadth-expansion");
const tiers = {};
for (const a of breadth) tiers[a.p_difficulty] = (tiers[a.p_difficulty] ?? 0) + 1;
const tableOrChart = payload.filter((a) => a.p_question_content.stimulus).map((a) => a.p_generation_spec_id);
const repBlueprints = new Set(tableOrChart).size;
out.push(`- **Difficulty is mostly medium and hard** (breadth set: ${Object.entries(tiers).map(([k, v]) => `${k} ${v}`).join(", ")}). Easy items for these competencies already exist in the bank or are not the gap; the easy tier is thin here.`);
out.push(`- **Representation:** ${repBlueprints} of the 16 blueprints carry a table or bar chart that the question needs; the other ${16 - repBlueprints} are prose by nature (rounding, missing numbers, unit conversion).`);
out.push("- **Not Mock:** every blueprint is `mockEligible: false`.");
out.push("- **Volume if everything is approved:** 901 + 140 (context set) + 144 (this set) = 1,185 practice-eligible. That is short of the 1,200 milestone and is a direction, not a target to hit by adding permutations.", "");
out.push("## Blueprint detail", "", ...sections);
fs.writeFileSync("ANGEL_CSSE_MATHS_EXPANSION_B_EDUCATIONAL_REVIEW.md", out.join("\n"));
console.log("written; blueprints:", rows.length);
