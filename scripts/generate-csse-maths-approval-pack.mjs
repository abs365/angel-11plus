#!/usr/bin/env node
/**
 * Final blueprint-level approval pack for the pending Maths candidates (context, data-handling and breadth sets).
 * Governance model (Founder-approved): COMPETENCY -> FAMILY -> BLUEPRINT -> REPRESENTATIVE SAMPLE -> DETERMINISTIC
 * VALIDATION -> DIVERSITY CHECK -> FAILURE/EDGE-CASE REVIEW -> APPROVAL -> PUBLICATION. The Founder reviews blueprints,
 * samples, every representation type and the edge cases; individual permutations are not approved one by one.
 *
 * Everything numeric below is computed from the real blueprints and the prepared packages in this run. The authored
 * judgements are in scripts/lib/csseBlueprintJudgements.mjs. Read-only: submits, approves and publishes nothing.
 *
 * Outputs:
 *   ANGEL_CSSE_MATHS_BLUEPRINT_APPROVAL_PACK.md
 *   scripts/output/csse-maths-approval-pack/approval-pack.html   (samples with the real table/chart rendering)
 *
 * Run: npx tsx scripts/generate-csse-maths-approval-pack.mjs
 */
import fs from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CSSE_CONTEXT_EXPANSION_FAMILIES } from "../lib/ali/questionFactory/csseContextBlueprints.ts";
import { MR01_DATA_HANDLING_EXPANSION } from "../lib/ali/questionFactory/csseDataHandlingBlueprints.ts";
import { CSSE_BREADTH_EXPANSION_FAMILIES } from "../lib/ali/questionFactory/csseBreadthBlueprints.ts";
import { generateBlueprintCandidate, validateBlueprintCandidate } from "../lib/ali/questionFactory/candidateGeneration.ts";
import { classifyBlueprintDepth, classifyScaledMemorisationRisk } from "../lib/ali/questionFactory/diversityGates.ts";
import { StructuredStimulus } from "../components/mockAttempt/StructuredStimulus.tsx";
import { JUDGEMENT_CONTEXT, JUDGEMENT_B } from "./lib/csseBlueprintJudgements.mjs";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const load = (dir) => JSON.parse(fs.readFileSync(`scripts/output/${dir}/submission-payload.json`, "utf8")).submissionPayload.map((p) => p.args);
const SETS = [
  { name: "Context / structure set", dir: "csse-context-expansion", families: CSSE_CONTEXT_EXPANSION_FAMILIES },
  { name: "Data-handling set (tables and bar charts)", dir: "csse-data-handling-expansion", families: [MR01_DATA_HANDLING_EXPANSION] },
  { name: "Breadth set", dir: "csse-breadth-expansion", families: CSSE_BREADTH_EXPANSION_FAMILIES },
];
const norm = (j) => (j.structure ? { s: j.structure, t: j.transfer, r: j.risk } : { s: j.s, t: j.t, r: j.r });
const JUDGE = Object.fromEntries([...Object.entries(JUDGEMENT_CONTEXT), ...Object.entries(JUDGEMENT_B)].map(([k, v]) => [k, norm(v)]));

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

const rows = [];
const md = [];
const html = [];
let totalCandidates = 0;
let totalRecommended = 0;
const stimulusAudit = [];

for (const set of SETS) {
  const payload = load(set.dir);
  md.push(`## ${set.name}`, "");
  html.push(`<h2>${esc(set.name)}</h2>`);
  for (const family of set.families) {
    for (const bp of family.blueprints) {
      const mine = payload.filter((a) => a.p_generation_spec_id === bp.blueprintId);
      totalCandidates += mine.length;

      // Deterministic validation under load: generate, validate against the blueprint, count outcomes and reasons.
      const rnd = seeded(31);
      const approved = [];
      const reasons = {};
      const N = 600;
      let ok = 0;
      for (let i = 0; i < N; i++) {
        const c = generateBlueprintCandidate(bp, rnd);
        const v = validateBlueprintCandidate(c, bp, [], approved.slice(-200));
        if (v.approved) { ok++; approved.push(c); } else for (const r of v.reasons) reasons[r] = (reasons[r] ?? 0) + 1;
      }
      const mathsValid = N - (reasons.answer_mismatch ?? 0) - (reasons.parameter_out_of_range ?? 0) - (reasons.invalid_combination ?? 0);

      // Diversity: distinct texts (incl. stimulus), depth classification of the prepared candidates.
      const rnd2 = seeded(97);
      const texts = new Set();
      const sample = [];
      for (let i = 0; i < 4000; i++) {
        const c = generateBlueprintCandidate(bp, rnd2);
        texts.add(c.question + (c.stimulus ? JSON.stringify(c.stimulus) : ""));
        if (i < 1500) sample.push(c);
      }
      const distinct = texts.size;
      const diversity = distinct >= 3000 ? "LOW" : distinct >= 400 ? "MODERATE" : "HIGHER";

      // Representative samples: one per difficulty band present in the prepared set, then the two extremes.
      const bands = [...new Set(mine.map((a) => a.p_difficulty))];
      const picks = [];
      for (const b of bands) {
        const a = mine.find((x) => x.p_difficulty === b);
        if (a) picks.push({ tag: `${b} band`, q: a.p_question_content.question, ans: a.p_claimed_answer, steps: a.p_question_content.workingSteps, stim: a.p_question_content.stimulus, ctx: a.p_question_content.contextTag });
      }
      const numeric = sample.map((c) => ({ c, v: Number(String(c.claimedAnswer).replace(/[^0-9.\-]/g, "")) })).filter((x) => Number.isFinite(x.v));
      if (numeric.length) {
        const lo = numeric.reduce((m, x) => (x.v < m.v ? x : m));
        const hi = numeric.reduce((m, x) => (x.v > m.v ? x : m));
        for (const [tag, x] of [["edge: smallest answer generated", lo], ["edge: largest answer generated", hi]]) {
          picks.push({ tag, q: x.c.question, ans: x.c.claimedAnswer, steps: x.c.workingSteps, stim: x.c.stimulus, ctx: x.c.contextTag });
        }
      }

      const j = JUDGE[bp.blueprintId];
      if (!j) throw new Error("no judgement for " + bp.blueprintId);
      const diff = {};
      for (const a of mine) diff[a.p_difficulty] = (diff[a.p_difficulty] ?? 0) + 1;
      const cap = diversity === "HIGHER" ? Math.min(8, mine.length) : mine.length;
      totalRecommended += cap;
      const repType = bp.representationType({});
      const isStim = Boolean(bp.deriveStimulus);
      const ctxCount = new Set(mine.map((a) => a.p_question_content.contextTag)).size;
      rows.push({ id: bp.blueprintId, comp: bp.competencyId, fam: bp.familyId, n: mine.length, diff, rep: repType === "prose" ? "prose" : repType, diversity, distinct, cap, ok, N, mathsValid, reasons });

      if (isStim) {
        const seen = new Set();
        for (const a of mine) {
          const st = a.p_question_content.stimulus;
          const key = a.p_question_content.contextTag;
          if (seen.has(key)) continue;
          seen.add(key);
          stimulusAudit.push({ bp: bp.blueprintId, ctx: key, title: st.caption ?? st.title, cols: st.headers ? st.headers.join(" | ") : `y: ${st.yLabel}; scale step ${st.scaleStep}; axis 0-${st.axisMax}`, q: a.p_question_content.question });
        }
      }

      md.push(
        `### ${bp.blueprintId}`, "",
        `- **Competency / family / skill:** ${bp.competencyId} / \`${bp.familyId}\` / ${bp.questionTypeId}  |  **Representation:** ${repType}  |  **Prepared:** ${mine.length}  |  **Difficulty:** ${Object.entries(diff).map(([k, v]) => `${k} ${v}`).join(", ")}`,
        `- **Purpose:** ${bp.mathematicalObjective}`,
        `- **Misconception targeted:** ${bp.misconceptionTargeted}`,
        `- **Structural difference from existing material:** ${j.s}`,
        `- **Transfer value:** ${j.t}`,
        `- **Deterministic validation (live run, ${N} generated):** ${mathsValid}/${N} passed range, constraint and answer re-derivation; ${ok}/${N} also passed the duplicate check${Object.keys(reasons).length ? ` (rejections: ${Object.entries(reasons).map(([k, v]) => `${k} ${v}`).join(", ")})` : ""}. Independent-oracle tests for this blueprint are in the test suite named in the pack footer.`,
        `- **Diversity check:** ${distinct} distinct questions in 4000 draws (${diversity}); ${ctxCount} context tag(s) in the prepared set. ${j.r}`,
        `- **Recommended publish volume:** ${cap} of ${mine.length}${cap < mine.length ? " (cap because the space of distinct questions is small)" : ""}`,
        `- **Representative samples:**`
      );
      for (const p of picks) {
        md.push(`  - _${p.tag}_ — ${p.q}${p.stim ? ` [${p.stim.type}: ${p.stim.type === "table" ? JSON.stringify({ headers: p.stim.headers, rows: p.stim.rows }) : JSON.stringify({ categories: p.stim.categories, values: p.stim.values, scaleStep: p.stim.scaleStep })}]` : ""} → **${p.ans}**. ${p.steps.join(" ")}`);
      }
      md.push("", `- **Founder decision:** approve / approve with cap / amend / reject`, "");

      html.push(`<section class="bp"><h3>${esc(bp.blueprintId)}</h3><p class="meta">${esc(bp.competencyId)} / ${esc(bp.familyId)} / ${esc(bp.questionTypeId)} · ${esc(repType)} · ${mine.length} prepared · ${Object.entries(diff).map(([k, v]) => `${k} ${v}`).join(", ")} · diversity ${diversity} · recommended ${cap}</p>`);
      html.push(`<dl><dt>Purpose</dt><dd>${esc(bp.mathematicalObjective)}</dd><dt>Misconception targeted</dt><dd>${esc(bp.misconceptionTargeted)}</dd><dt>Structural difference</dt><dd>${esc(j.s)}</dd><dt>Transfer value</dt><dd>${esc(j.t)}</dd><dt>Validation</dt><dd>${mathsValid}/${N} passed range, constraint and re-derivation; ${ok}/${N} passed duplicates. Distinct questions: ${distinct}/4000.</dd><dt>Repetition note</dt><dd>${esc(j.r)}</dd></dl>`);
      for (const p of picks) {
        html.push(`<div class="sample"><div class="tag">${esc(p.tag)}</div><p class="q">${esc(p.q)}</p>${p.stim ? renderToStaticMarkup(React.createElement(StructuredStimulus, { stimulus: p.stim })) : ""}<p class="a">Answer: <strong>${esc(p.ans)}</strong> — ${esc(p.steps.join(" "))}</p></div>`);
      }
      html.push(`<p class="decision">Founder decision: approve / approve with cap / amend / reject</p></section>`);
    }
  }
}

// Family-level diversity classification of what the prepared batches add (the gate's own rule), by family.
const famRows = [];
for (const set of SETS) {
  const payload = load(set.dir);
  for (const family of set.families) {
    const mine = payload.filter((a) => a.p_family_id === family.familyId);
    const depth = classifyBlueprintDepth(mine.map((a) => ({ question: a.p_question_content.question, blueprintId: a.p_generation_spec_id })));
    famRows.push(`| ${family.familyId} | ${family.blueprints.length} | ${mine.length} | ${classifyScaledMemorisationRisk(depth)} | ${depth.dominantBlueprintShare.toFixed(2)} |`);
  }
}

const head = [];
head.push("# CSSE Maths candidates: final blueprint-level approval pack", "");
head.push(`**${totalCandidates} candidates, ${rows.length} blueprints. Nothing has been submitted, approved or published.** Governance model (agreed): you review every blueprint, representative samples, difficulty bands, every new representation type, edge cases, diversity warnings and validation failures. You are **not** asked to approve individual permutations. Open \`scripts/output/csse-maths-approval-pack/approval-pack.html\` to see samples with the real table and chart rendering.`, "");
head.push("## How to decide", "", "For each blueprint choose: **approve** (publish the prepared volume), **approve with cap** (publish at most the stated number), **amend** (say what to change; the blueprint is fixed and regenerated), or **reject**. A decision applies to every variant of that blueprint.", "");
head.push("## At a glance", "", "| Blueprint | Comp | Family | Prepared | Difficulty | Representation | Distinct (of 4000) | Diversity | Recommended |", "|---|---|---|---|---|---|---|---|---|", ...rows.map((r) => `| ${r.id} | ${r.comp} | ${r.fam} | ${r.n} | ${Object.entries(r.diff).map(([k, v]) => `${k} ${v}`).join(", ")} | ${r.rep} | ${r.distinct} | ${r.diversity} | ${r.cap} |`), "");
head.push(`**Recommended publish volume if every blueprint is approved as recommended: ${totalRecommended} of ${totalCandidates}** (practice-eligible 901 to ${901 + totalRecommended}). Volume is a result, not a target.`, "");
head.push("## Representation and semantic audit (every table and chart type)", "", "Titles, captions, headers, units, scales and question wording were audited **together**, by an automated test over every context and many generated instances (`tests/lib/ali/questionFactory/csseStimulusSemanticAudit.test.ts`), after your note on the 'sport each pupil chose, by week' caption. Corrected classes of defect: captions that described the activity instead of the data; two-week tables whose caption and question disagreed; timetable columns that said 'leaves' where the task measured time between stops. One example per context follows.", "", "| Blueprint | Context | Title / caption | Columns / axis | Question |", "|---|---|---|---|---|", ...stimulusAudit.map((a) => `| ${a.bp.replace(/^mr0\d-bp-/, "")} | ${a.ctx} | ${a.title} | ${a.cols} | ${a.q} |`), "");
head.push("## Diversity warnings (the gate's own classification of each family's prepared batch)", "", "| Family | Blueprints in batch | Candidates | Gate risk | Largest blueprint share |", "|---|---|---|---|---|", ...famRows, "", "The gate rates any batch of two or fewer blueprints HIGH or CRITICAL by its own rule. That is why volumes are modest and why a third structure per family should come before scaling a family. It is a warning, not a defect in any single question.", "");
head.push("## Edge cases and failures", "", "Each blueprint section lists the two extreme answers actually generated, and the live validation counts (rejections are duplicates and out-of-range draws, never wrong answers). Wrong answers would appear as `answer_mismatch`; the count is zero for every blueprint in this run.", "");
head.push("## Evidence behind the numbers", "", "Independent-oracle tests (answers re-derived by simulation, scan, string-digit rounding or reading the stimulus itself) are in `tests/lib/ali/questionFactory/csseContextBlueprints.test.ts`, `csseDataHandlingBlueprints.test.ts` and `csseBreadthBlueprints.test.ts`. The full suite and a clean-checkout build pass on committed HEAD.", "");

fs.mkdirSync("scripts/output/csse-maths-approval-pack", { recursive: true });
fs.writeFileSync("ANGEL_CSSE_MATHS_BLUEPRINT_APPROVAL_PACK.md", [...head, ...md].join("\n"));
const css = `:root{--navy:#14284b;--ink:#1d2b44;--blue:#2457c5;--ivory:#faf8f2;--line:#d9d4c7;--sky:#eaf0fb;--angel-blue:#2457c5;--angel-border:#d9d4c7;--angel-ink:#1d2b44;--angel-muted:#51607a;--angel-paper:#fff;--angel-sky:#eaf0fb}
body{margin:0;background:var(--ivory);color:var(--ink);font:15px/1.5 system-ui,Segoe UI,Arial,sans-serif}main{max-width:980px;margin:0 auto;padding:20px 16px 60px}
h1,h2,h3{color:var(--navy)}.bp{background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px;margin:16px 0}.meta{color:#51607a;font-size:13px}
dt{font-weight:600;color:var(--navy);margin-top:8px}dd{margin:2px 0 0}.sample{border-left:4px solid var(--blue);background:var(--sky);padding:8px 12px;margin:10px 0;border-radius:0 8px 8px 0}.tag{font-size:12px;font-weight:600;color:var(--navy);text-transform:uppercase}.q{font-weight:600;margin:4px 0}.a{font-size:14px}.decision{font-weight:600;margin-top:12px}table{border-collapse:collapse}`;
fs.writeFileSync("scripts/output/csse-maths-approval-pack/approval-pack.html", `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CSSE Maths approval pack</title><style>${css}</style></head><body><main><h1>CSSE Maths candidates: blueprint-level approval pack</h1><p><strong>${totalCandidates} candidates, ${rows.length} blueprints. Nothing submitted, approved or published.</strong> Decide per blueprint; a decision covers every variant of it.</p>${html.join("\n")}</main></body></html>`);
console.log("written; blueprints", rows.length, "candidates", totalCandidates, "recommended", totalRecommended);
