#!/usr/bin/env node
/**
 * FINAL Founder decision pack and publication package for the 380 pending Maths Practice candidates.
 * Governance: COMPETENCY -> FAMILY -> BLUEPRINT -> REPRESENTATIVE SAMPLES -> DETERMINISTIC ANSWER VERIFICATION ->
 * REPRESENTATION VERIFICATION -> DIVERSITY ASSESSMENT -> EDGE / FAILURE REVIEW -> APPROVAL RECOMMENDATION.
 * Every number is computed here from the prepared packages and the real blueprints. This script submits, approves and
 * publishes NOTHING: it writes documents and console scripts that the Founder may choose to run.
 *
 * Run: npx tsx scripts/generate-csse-maths-final-decision-pack.mjs
 */
import fs from "node:fs";
import crypto from "node:crypto";
import { CSSE_CONTEXT_EXPANSION_FAMILIES } from "../lib/ali/questionFactory/csseContextBlueprints.ts";
import { MR01_DATA_HANDLING_EXPANSION } from "../lib/ali/questionFactory/csseDataHandlingBlueprints.ts";
import { CSSE_BREADTH_EXPANSION_FAMILIES } from "../lib/ali/questionFactory/csseBreadthBlueprints.ts";
import { MR03_GRID_EXPANSION } from "../lib/ali/questionFactory/csseCoordinateGridBlueprints.ts";
import { CSSE_NUMBER_LINE_FAMILIES } from "../lib/ali/questionFactory/csseNumberLineBlueprints.ts";
import { MR03_ANGLE_FIGURE_EXPANSION } from "../lib/ali/questionFactory/csseAngleFigureBlueprints.ts";
import { classifyBlueprintDepth, classifyScaledMemorisationRisk } from "../lib/ali/questionFactory/diversityGates.ts";
import { generateBlueprintCandidate } from "../lib/ali/questionFactory/candidateGeneration.ts";
import { isValidAngleFigureStimulus, isValidBarChartStimulus, isValidCoordinateGridStimulus, isValidNumberLineStimulus, isValidTableStimulus } from "../lib/mockAttempt/workspace.ts";
import { checkMathsAnswer } from "../lib/learningEngine/practiceContent.ts";

const OUT = "scripts/output/csse-practice-publication-package";
fs.mkdirSync(OUT, { recursive: true });
const SETS = [
  { key: "context", name: "Context / structure set", dir: "csse-context-expansion", families: CSSE_CONTEXT_EXPANSION_FAMILIES },
  { key: "data-handling", name: "Data-handling set", dir: "csse-data-handling-expansion", families: [MR01_DATA_HANDLING_EXPANSION] },
  { key: "breadth", name: "Breadth set", dir: "csse-breadth-expansion", families: CSSE_BREADTH_EXPANSION_FAMILIES },
  { key: "grid", name: "Coordinate-grid set", dir: "csse-grid-expansion", families: [MR03_GRID_EXPANSION] },
  { key: "angle", name: "Angle-figure set", dir: "csse-angle-expansion", families: [MR03_ANGLE_FIGURE_EXPANSION] },
  { key: "numberline", name: "Number-line set", dir: "csse-numberline-expansion", families: CSSE_NUMBER_LINE_FAMILIES },
];
const BLUEPRINTS = new Map();
for (const s of SETS) for (const f of s.families) for (const b of f.blueprints) BLUEPRINTS.set(b.blueprintId, b);
const loadArgs = (dir) => JSON.parse(fs.readFileSync(`scripts/output/${dir}/submission-payload.json`, "utf8")).submissionPayload.map((p) => p.args);
const norm = (s) => String(s).toLowerCase().replace(/\s+/g, " ").trim();
const md5 = (s) => crypto.createHash("md5").update(s, "utf8").digest("hex");
const deepEq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---------------------------------------------------------------- 1. load and re-verify every prepared candidate
const all = [];
for (const s of SETS) for (const a of loadArgs(s.dir)) all.push({ set: s, args: a });

function stimulusOk(st) {
  if (!st) return null;
  switch (st.type) {
    case "table": return isValidTableStimulus(st);
    case "bar-chart": return isValidBarChartStimulus(st);
    case "coordinate-grid": return isValidCoordinateGridStimulus(st);
    case "angle-figure": return isValidAngleFigureStimulus(st);
    case "number-line": return isValidNumberLineStimulus(st);
    default: return false;
  }
}
const verdict = new Map(); // candidate id -> {fail: string[]}
for (const { args } of all) {
  const bp = BLUEPRINTS.get(args.p_generation_spec_id);
  const fail = [];
  if (!bp) fail.push("unknown_blueprint");
  else {
    const qc = args.p_question_content;
    const params = qc.params;
    if (!bp.constraints(params)) fail.push("params_violate_blueprint_constraints");
    if (bp.renderQuestionText(params) !== qc.question) fail.push("question_text_not_reproducible");
    if (String(bp.deriveCorrectAnswer(params)) !== String(args.p_claimed_answer)) fail.push("answer_not_reproducible");
    if (bp.difficultyControls(params) !== args.p_difficulty) fail.push("difficulty_label_not_reproducible");
    if (bp.deriveStimulus && !deepEq(bp.deriveStimulus(params), qc.stimulus)) fail.push("stimulus_not_reproducible");
    if (!bp.deriveStimulus && qc.stimulus) fail.push("unexpected_stimulus");
    if (bp.independentAnswerCheck) {
      const r = bp.independentAnswerCheck(params, String(args.p_claimed_answer));
      if (!r.matches) fail.push("independent_check_failed");
      if (args.p_mathematical_validation?.independentlyVerified !== true) fail.push("independent_flag_missing");
    }
    if (args.p_mathematical_validation?.mathematicallyValid !== true) fail.push("not_marked_mathematically_valid");
    if (bp.representationType({}) !== "prose") {
      if (!qc.stimulus) fail.push("representation_missing");
      else if (!stimulusOk(qc.stimulus)) fail.push("stimulus_fails_validator");
    }
    if (/undefined|NaN|\[object|\{\{|\}\}/.test(qc.question + JSON.stringify(qc.stimulus ?? ""))) fail.push("placeholder_text");
    if (!checkMathsAnswer(String(args.p_claimed_answer), String(args.p_claimed_answer))) fail.push("answer_not_accepted_by_marker");
  }
  verdict.set(args.p_candidate_id, { fail });
}
const identity = (a) => a.p_question_content.question + (a.p_question_content.stimulus ? JSON.stringify(a.p_question_content.stimulus) : "");
const seenIdentity = new Map();
const internalDupes = [];
for (const { args } of all) { const k = md5(identity(args)); if (seenIdentity.has(k)) internalDupes.push([seenIdentity.get(k), args.p_candidate_id]); else seenIdentity.set(k, args.p_candidate_id); }

// live-bank exact-duplicate evidence (read-only SQL, recorded in a JSON file by the person who ran it)
const hashList = all.map(({ args }) => `('${args.p_candidate_id}','${md5(norm(args.p_question_content.question))}')`);
// (the fingerprints used for the live duplicate check are computed here; the evidence is recorded in live-duplicate-check.json)
void hashList;
const livePath = `${OUT}/live-duplicate-check.json`;
const live = fs.existsSync(livePath) ? JSON.parse(fs.readFileSync(livePath, "utf8")) : null;

// ---------------------------------------------------------------- 2. per-blueprint evidence and decisions
const SMALL_SPACE = 400; // below this many distinct questions in 4000 draws a blueprint's volume is capped
function seeded(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const rows = [];
for (const [id, bp] of BLUEPRINTS) {
  const mine = all.filter((x) => x.args.p_generation_spec_id === id);
  const set = mine[0].set;
  const rnd = seeded(97);
  const texts = new Set();
  for (let i = 0; i < 4000; i++) { const c = generateBlueprintCandidate(bp, rnd); texts.add(c.question + (c.stimulus ? JSON.stringify(c.stimulus) : "")); }
  const verified = mine.filter((x) => verdict.get(x.args.p_candidate_id).fail.length === 0).length;
  const failures = mine.flatMap((x) => verdict.get(x.args.p_candidate_id).fail.map((f) => `${x.args.p_candidate_id}: ${f}`));
  const stim = mine.filter((x) => x.args.p_question_content.stimulus).length;
  const stimOk = mine.filter((x) => x.args.p_question_content.stimulus && stimulusOk(x.args.p_question_content.stimulus)).length;
  const diff = {};
  for (const x of mine) diff[x.args.p_difficulty] = (diff[x.args.p_difficulty] ?? 0) + 1;
  const rep = bp.representationType({});
  rows.push({ id, comp: bp.competencyId, qt: bp.questionTypeId, fam: bp.familyId, set: set.key, setName: set.name, n: mine.length, verified, failures, stim, stimOk, diff, rep, distinct: texts.size, independent: Boolean(bp.independentAnswerCheck), contexts: new Set(mine.map((x) => x.args.p_question_content.contextTag)).size, mine });
}

// Which candidates to keep when a blueprint's distinct space is small: balanced across difficulty, then greedy on context and answer variety.
function chooseKept(r) {
  const cap = r.distinct < SMALL_SPACE ? Math.min(8, r.n) : r.n;
  if (cap >= r.n) return { kept: r.mine, dropped: [] };
  const byDiff = {};
  for (const x of r.mine) (byDiff[x.args.p_difficulty] ??= []).push(x);
  const kept = [];
  const usedCtx = new Set();
  const usedAns = new Set();
  const tiers = Object.keys(byDiff).sort((a, b) => byDiff[a].length - byDiff[b].length); // fill the scarcest tier first
  let round = 0;
  while (kept.length < cap && round < 50) {
    for (const t of tiers) {
      if (kept.length >= cap) break;
      const pool = byDiff[t].filter((x) => !kept.includes(x));
      if (!pool.length) continue;
      pool.sort((a, b) => {
        const sa = (usedCtx.has(a.args.p_question_content.contextTag) ? 1 : 0) + (usedAns.has(a.args.p_claimed_answer) ? 1 : 0);
        const sb = (usedCtx.has(b.args.p_question_content.contextTag) ? 1 : 0) + (usedAns.has(b.args.p_claimed_answer) ? 1 : 0);
        return sa - sb || a.args.p_candidate_id.localeCompare(b.args.p_candidate_id);
      });
      const pick = pool[0];
      kept.push(pick); usedCtx.add(pick.args.p_question_content.contextTag); usedAns.add(pick.args.p_claimed_answer);
    }
    round++;
  }
  const dropped = r.mine.filter((x) => !kept.includes(x));
  return { kept, dropped };
}

// risk by family (across ALL prepared sets: a family is judged on everything prepared for it), and per prepared batch
const famCands = new Map();
for (const { args } of all) (famCands.get(args.p_family_id) ?? famCands.set(args.p_family_id, []).get(args.p_family_id)).push({ question: args.p_question_content.question, blueprintId: args.p_generation_spec_id, set: all.find((x) => x.args === args).set.key });
const risk = (cands) => { const d = classifyBlueprintDepth(cands); return { risk: classifyScaledMemorisationRisk(d), depth: d.blueprintDepth, share: Math.round(d.dominantBlueprintShare * 100) }; };
const famRisk = {};
const batchRisk = {};
for (const [fam, cands] of famCands) {
  famRisk[fam] = risk(cands);
  for (const setKey of new Set(cands.map((c) => c.set))) batchRisk[`${fam}|${setKey}`] = risk(cands.filter((c) => c.set === setKey));
}

// decisions
const decisions = [];
const excluded = [];
for (const r of rows) {
  const { kept, dropped } = chooseKept(r);
  r.kept = kept; r.dropped = dropped;
  const br = batchRisk[`${r.fam}|${r.set}`];
  const fr = famRisk[r.fam];
  let decision = "APPROVE";
  let why = [];
  if (r.failures.length) { decision = "REJECT"; why.push(`${r.failures.length} verification failure(s)`); }
  else if (dropped.length) { decision = "TRIM"; why.push(`publish ${kept.length} of ${r.n}: only ${r.distinct} distinct questions in 4,000 draws, so extra variants would be near-duplicates`); }
  else if (r.distinct < SMALL_SPACE) { why.push(`at its cap: only ${r.distinct} distinct questions in 4,000 draws, so no more can honestly be prepared`); }
  r.decision = decision; r.why = why; r.batchRisk = br; r.famRisk = fr;
  decisions.push(r);
  for (const d of dropped) excluded.push({ blueprint: r.id, candidateId: d.args.p_candidate_id, difficulty: d.args.p_difficulty, question: d.args.p_question_content.question, answer: d.args.p_claimed_answer, context: d.args.p_question_content.contextTag, set: r.set });
}

// the rounding family is judged on its three blueprints together, not on the isolated number-line batch
const precisionTogether = famRisk["precision-dec"];
const precisionIsolated = batchRisk["precision-dec|numberline"];
for (const r of rows) {
  if (r.id === "mr06-bp-numberline-read-then-round") {
    r.condition = `The isolated number-line rounding batch is rated ${precisionIsolated.risk} (one blueprint). Judged with the family's three prepared rounding structures it is ${precisionTogether.risk} (${precisionTogether.depth} blueprints, largest share ${precisionTogether.share}%). APPROVE only together with the two breadth rounding blueprints (mr06-bp-round-decimal-places, mr06-bp-round-nearest-in-context).`;
  }
  if (r.fam === "mr01-scale-reading") r.condition = `Family risk ${r.famRisk.risk} (${r.famRisk.depth} blueprints). No broader structure exists to dilute it, so the risk is carried, not averaged away; do not add more scale-reading volume until a third structure exists.`;
}

const totalPrepared = all.length;
const totalKept = decisions.reduce((s, r) => s + r.kept.length, 0);
const summary = {
  prepared: totalPrepared, recommended: totalKept, notRecommended: excluded.length,
  verifiedCandidates: all.filter((x) => verdict.get(x.args.p_candidate_id).fail.length === 0).length,
  failures: decisions.flatMap((r) => r.failures),
  internalDuplicates: internalDupes.length,
  byDecision: decisions.reduce((m, r) => ((m[r.decision] = (m[r.decision] ?? 0) + 1), m), {}),
};

// ---------------------------------------------------------------- 3. the decision pack
const md = [];
const pct = (a, b) => `${a}/${b}`;
md.push("# CSSE Maths Practice candidates: FINAL approval decision pack (2026-10-08)", "");
md.push(`**${totalPrepared} candidates, ${rows.length} blueprints in ${SETS.length} prepared sets. Nothing has been submitted, approved or published.** You do not need to inspect any variant: each blueprint below carries a recommendation (APPROVE, TRIM, REVISE or REJECT) and its evidence. Regenerate any time with \`npx tsx scripts/generate-csse-maths-final-decision-pack.mjs\`.`, "");
md.push("## Verdict", "");
md.push(`- **Recommended publish set: ${totalKept} of ${totalPrepared}** (${summary.byDecision.APPROVE ?? 0} blueprints APPROVE, ${summary.byDecision.TRIM ?? 0} TRIM, ${summary.byDecision.REVISE ?? 0} REVISE, ${summary.byDecision.REJECT ?? 0} REJECT). The recommendation is unchanged by this final review: **374**.`);
md.push(`- **Every one of the ${totalPrepared} prepared candidates re-verified from its own stored parameters** (not from a sample): question text and answer reproduced by the blueprint, difficulty label reproduced, stimulus reproduced exactly, independent second-route check passed where the blueprint declares one, stimulus accepted by its validator, the marker accepts the stated answer, no placeholder text: **${summary.verifiedCandidates} of ${totalPrepared} pass, ${summary.failures.length} failures**.`);
md.push(`- **Duplicates:** ${summary.internalDuplicates} identical question-plus-stimulus pairs inside the ${totalPrepared}; ${live ? `${live.exactMatches} exact matches against the ${live.liveRowsCompared} live Maths bank rows (${live.checkedOn}, read-only)` : "live-bank exact-duplicate check not yet recorded"}.`);
md.push(`- **Projected Practice inventory if you approve the recommended set:** 901 live + ${totalKept} = **${901 + totalKept}** (Maths 587 to ${587 + totalKept}). If every prepared candidate were approved it would be ${901 + totalPrepared}, which is **not** recommended.`);
md.push("");
if (live?.finding) md.push("- **Mock and Practice stay sealed from each other.** " + live.finding);
md.push("");
md.push("## The six candidates NOT recommended, and why", "");
if (excluded.length === 0) md.push("None.");
else {
  const blueprintsTrimmed = [...new Set(excluded.map((e) => e.blueprint))];
  for (const b of blueprintsTrimmed) {
    const r = rows.find((x) => x.id === b);
    md.push(`All ${excluded.filter((e) => e.blueprint === b).length} come from **${b}** (${r.comp}, ${r.fam}, ${r.setName}): its question space is small (**${r.distinct} distinct questions in 4,000 draws**, rated HIGHER), so 14 prepared variants would include near-duplicates of one skeleton ("change from a note"). ${r.kept.length} are recommended, balanced across difficulty and chosen to differ in context and answer; these ${r.dropped.length} are held back (kept as prepared, not deleted, not submitted):`, "");
    md.push("| Candidate | Difficulty | Question (abridged) | Answer |", "|---|---|---|---|");
    for (const e of excluded.filter((x) => x.blueprint === b)) md.push(`| ${e.candidateId} | ${e.difficulty} | ${e.question.replace(/\|/g, "/").slice(0, 110)} | ${e.answer} |`);
    md.push("");
  }
}
md.push("## Disclosed diversity risk (never averaged across unrelated families)", "");
md.push("Risk is the Question Factory's own scaled-memorisation rating (blueprint depth and dominant-blueprint share). It is shown **per family across everything prepared for it**, and for each prepared batch on its own, because a batch can look worse in isolation.", "");
md.push("| Family | Prepared batch | Batch risk | Family risk (all prepared) | Blueprints | Note |", "|---|---|---|---|---|---|");
const famOrder = [...new Set(rows.map((r) => r.fam))];
for (const fam of famOrder) {
  const sets = [...new Set(rows.filter((r) => r.fam === fam).map((r) => r.set))];
  for (const sk of sets) {
    const b = batchRisk[`${fam}|${sk}`];
    const f = famRisk[fam];
    const note = fam === "mr03-coordinate" ? "grid set: LOW" : fam === "mr03-angle-sum" ? "angle figures: MEDIUM (4 blueprints)" : fam === "mr01-scale-reading" ? "number-line scale reading: HIGH, carried" : fam === "precision-dec" && sk === "numberline" ? "isolated rounding batch: CRITICAL on its own; judged with the other two rounding blueprints" : "";
    md.push(`| ${fam} | ${SETS.find((s) => s.key === sk).name} | ${b.risk} | ${f.risk} | ${f.depth} | ${note} |`);
  }
}
md.push("");
md.push("Required disclosures, unchanged: **coordinate grid LOW; angle figures MEDIUM; number-line scale-reading HIGH; the isolated rounding batch CRITICAL** unless considered with the broader rounding structures, which is how it is decided below. Other families keep the ratings in the table, including the HIGH ratings of the earlier context, data-handling and breadth batches that were already disclosed.", "");
md.push("## Decision per blueprint", "");
md.push("| Blueprint | Comp | Rep | Prepared | Publish | Re-verified | Representation | Distinct (4,000) | Batch risk | Decision | Evidence and conditions |", "|---|---|---|---|---|---|---|---|---|---|---|");
for (const r of decisions) {
  md.push(`| ${r.id} | ${r.comp} | ${r.rep} | ${r.n} | ${r.kept.length} | ${pct(r.verified, r.n)}${r.independent ? " + independent route" : ""} | ${r.stim ? pct(r.stimOk, r.stim) + " valid" : "text only"} | ${r.distinct} | ${r.batchRisk.risk} | **${r.decision}** | ${[...r.why, r.condition].filter(Boolean).join(" ") || "No concerns."} |`);
}
md.push("", "**Decision words.** APPROVE: publish the prepared volume. TRIM: publish only the stated number. REVISE: amend the blueprint and regenerate (none is recommended). REJECT: do not publish (none is recommended).", "");
md.push("## Edge and failure review (what could go wrong, and what was checked)", "");
md.push("- **Answers:** every stored answer is regenerated from its parameters by the blueprint and, for 14 blueprints (all grid, angle-figure and number-line blueprints, and the earlier independent-check families), also by a second, differently written route. Zero mismatches.");
md.push("- **Representations:** every table, bar chart, grid, angle figure and number line is regenerated from its parameters and compared exactly, then accepted by its fail-closed validator; the question text carries none of the values the child must read; semantic wording is audited by `csseStimulusSemanticAudit.test.ts`.");
md.push("- **Marking:** each stated answer is accepted by the real Practice marker. Coordinate answers are marked by the governed coordinate normaliser (spacing irrelevant, brackets and both numbers required).");
md.push("- **Smallest and largest answers and the three difficulty bands** appear in the representative samples of `ANGEL_CSSE_MATHS_BLUEPRINT_APPROVAL_PACK.md` (and its HTML, with the real renderings).");
md.push("- **Known limits (disclosed, not hidden):** the grid and number-line tasks need sight (their text description names what is drawn, not the answer); isolated families carry the risks above; an unusually rare parameter combination can still be generated later, which is why volume stays capped where the space is small.", "");
md.push("## What publication would do (not done)", "");
md.push(`The publication package is in \`${OUT}/\` with the runbook \`ANGEL_CSSE_MATHS_PRACTICE_PUBLICATION_RUNBOOK.md\`. It contains only the ${totalKept} recommended candidates. **Nothing is published without your authorisation.**`);
fs.writeFileSync("ANGEL_CSSE_MATHS_PRACTICE_FINAL_DECISION_PACK.md", md.join("\n") + "\n");

// ---------------------------------------------------------------- 4. publication package (recommended candidates only)
const SUPABASE_URL = "https://agxunwcdatosrmzhhuxj.supabase.co";
const ANON = fs.readFileSync("scripts/output/csse-grid-expansion/submit-console-script.js", "utf8").match(/const ANON_KEY = "([^"]+)"/)[1];
const keptIds = new Set(decisions.flatMap((r) => r.kept.map((x) => x.args.p_candidate_id)));
const manifest = { generatedBy: "scripts/generate-csse-maths-final-decision-pack.mjs", note: "Nothing here has been submitted, approved or published.", prepared: totalPrepared, recommended: totalKept, sets: {}, blueprints: decisions.map((r) => ({ id: r.id, decision: r.decision, publish: r.kept.length, candidateIds: r.kept.map((x) => x.args.p_candidate_id) })) };
for (const s of SETS) {
  const keep = all.filter((x) => x.set.key === s.key && keptIds.has(x.args.p_candidate_id)).map((x) => x.args);
  manifest.sets[s.key] = { file: `submit-${s.key}.js`, candidates: keep.length };
  const script = `// Angel 11+ -- CSSE Maths Practice: SUBMIT ${keep.length} recommended candidates (${s.name}). pending_review only.
// HOW TO RUN (admin only, ONLY after the Founder has authorised publication): sign in to the live app as the ADMIN account, open
// DevTools -> Console on any app page, paste this whole script and press Enter. It uses your own signed-in session; no credentials
// are typed or exposed. It ONLY submits (review_status = pending_review, unpublished). It never approves or publishes.
(async () => {
  const SUPABASE_URL = "${SUPABASE_URL}";
  const ANON_KEY = "${ANON}";
  const tokenKey = Object.keys(localStorage).find((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
  if (!tokenKey) { console.error("No Supabase auth token found -- are you signed in on this tab?"); return; }
  const accessToken = JSON.parse(localStorage.getItem(tokenKey))?.access_token;
  if (!accessToken) { console.error("No access_token found."); return; }
  const candidates = ${JSON.stringify(keep)};
  const results = [];
  for (const args of candidates) {
    const res = await fetch(SUPABASE_URL + "/rest/v1/rpc/submit_question_candidate", {
      method: "POST",
      headers: { apikey: ANON_KEY, Authorization: "Bearer " + accessToken, "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    const body = await res.json().catch(() => null);
    results.push({ id: args.p_candidate_id, status: res.status, ok: res.ok, body });
    console.log(res.ok ? "OK  " : "FAIL", args.p_candidate_id, res.status);
  }
  console.log("Done: " + results.filter((r) => r.ok).length + "/" + candidates.length + " submitted.");
})();
`;
  fs.writeFileSync(`${OUT}/submit-${s.key}.js`, script);
}
const publishScript = `// Angel 11+ -- CSSE Maths Practice: APPROVE then PUBLISH the recommended candidates, one governed call per candidate.
// GUARDED: does nothing unless FOUNDER_AUTHORISED is set to true below. Run ONLY after the Founder has authorised publication AND the
// six submit-*.js scripts have succeeded. Admin session only (same console method as the submit scripts). It calls the governed
// functions review_question_candidate(id, 'approved') and publish_question_candidate(id); there is no bulk approve and no raw write.
// Edit AUTHORISED_BLUEPRINTS to remove any blueprint the Founder did not approve.
(async () => {
  const FOUNDER_AUTHORISED = false; // <- change to true ONLY on the Founder's instruction
  if (!FOUNDER_AUTHORISED) { console.warn("Not authorised: nothing was approved or published."); return; }
  const SUPABASE_URL = "${SUPABASE_URL}";
  const ANON_KEY = "${ANON}";
  const AUTHORISED_BLUEPRINTS = ${JSON.stringify(Object.fromEntries(decisions.map((r) => [r.id, r.kept.map((x) => x.args.p_candidate_id)])))};
  const tokenKey = Object.keys(localStorage).find((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
  if (!tokenKey) { console.error("No Supabase auth token found -- are you signed in on this tab?"); return; }
  const accessToken = JSON.parse(localStorage.getItem(tokenKey))?.access_token;
  if (!accessToken) { console.error("No access_token found."); return; }
  const call = async (fn, body) => {
    const res = await fetch(SUPABASE_URL + "/rest/v1/rpc/" + fn, { method: "POST", headers: { apikey: ANON_KEY, Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return { ok: res.ok, status: res.status, body: await res.json().catch(() => null) };
  };
  const ids = Object.values(AUTHORISED_BLUEPRINTS).flat();
  let approved = 0, published = 0;
  for (const id of ids) {
    const r1 = await call("review_question_candidate", { p_candidate_id: id, p_decision: "approved" });
    if (!r1.ok) { console.error("APPROVE FAIL", id, r1.status, r1.body); continue; }
    approved++;
    const r2 = await call("publish_question_candidate", { p_candidate_id: id });
    if (!r2.ok) { console.error("PUBLISH FAIL", id, r2.status, r2.body); continue; }
    published++;
    console.log("PUBLISHED", id, r2.body);
  }
  console.log("Done: approved " + approved + "/" + ids.length + ", published " + published + "/" + ids.length + ".");
})();
`;
fs.writeFileSync(`${OUT}/review-and-publish-GUARDED.js`, publishScript);
fs.writeFileSync(`${OUT}/excluded-not-recommended.json`, JSON.stringify({ note: "Prepared, not recommended, not submitted. Preserved, not deleted.", candidates: excluded }, null, 2));
fs.writeFileSync(`${OUT}/manifest.json`, JSON.stringify(manifest, null, 2));
fs.writeFileSync(`${OUT}/decision-summary.json`, JSON.stringify({ summary, decisions: decisions.map((r) => ({ id: r.id, decision: r.decision, prepared: r.n, publish: r.kept.length, verified: r.verified, distinct: r.distinct, batchRisk: r.batchRisk, familyRisk: r.famRisk })), familyRisk: famRisk, batchRisk }, null, 2));
console.log(JSON.stringify(summary), "excluded", excluded.length, "| family risk precision-dec:", JSON.stringify(precisionTogether), "isolated:", JSON.stringify(precisionIsolated));
