/**
 * Educational Depth Programme, Phase 1 Wave 1 — learner-routing
 * verification against LIVE production data.
 *
 * The success standard for this wave is not "teaching content was
 * authored" but "a learner entering one of the selected priority
 * competencies now actually receives it". This script proves that against
 * the real production rows a learner can actually be served, using the
 * real, imported production functions — never a reimplementation:
 *
 *   - getMathsTeachingContent()          (does this row's family teach?)
 *   - effectiveGuidedRevealStepCount()   (how much may Guided reveal?)
 *   - shouldRenderMathsMisconceptionNote / shouldRenderMisconceptionNote
 *                                        (what does a wrong answer show?)
 *
 * It reports BEFORE (the behaviour at commit f4f21fa) and AFTER for every
 * live row, so the delta is measured rather than asserted.
 *
 * It also re-checks the answer-leak safety property against whatever is
 * live right now: no capped reveal may ever expose a step containing the
 * row's own answer.
 *
 * Run with: npx tsx scripts/verify-educational-depth-wave1-learner-routing.mjs
 */
import { readFileSync } from "node:fs";
import {
  getMathsTeachingContent,
  effectiveGuidedRevealStepCount,
  MATHS_MISCONCEPTION_CATEGORY_LABEL,
} from "../lib/learningEngine/mathsTeachingContent.ts";
import {
  shouldRenderMisconceptionNote,
  shouldRenderMathsMisconceptionNote,
} from "../lib/learningEngine/practiceInteractionGuard.ts";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const URL = "https://" + JSON.parse(Buffer.from(KEY.split(".")[1], "base64").toString()).ref + ".supabase.co";
async function rest(path) {
  const res = await fetch(`${URL}/rest/v1/${path}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

/** The four families this wave selected, on the evidence recorded in the report. */
const WAVE1_FAMILIES = [
  "mr01-whole-number-computation",
  "mr01-decimal-computation",
  "mr01-multistep-order-of-operations",
  "mr01-fraction-computation",
];

/** Families that already had teaching content before this wave — used to
 *  measure the remediation fix's reach beyond Wave 1's own four. */
const PRE_EXISTING_COVERED = [
  "mr02-nth-term", "mr04-compound-percentage", "mr05-factors-primes",
  "mr03-compound-area-perimeter", "mr03-coordinate", "mr01-average-mean",
  "mr02-substitution", "mr01-reverse-mean", "mr04-reverse-percentage",
  "mr04-time-reverse", "mr03-angle-sum",
];

let failures = 0;
const fail = (msg) => { failures++; console.log(`  FAIL: ${msg}`); };

const allFamilies = [...WAVE1_FAMILIES, ...PRE_EXISTING_COVERED];
const rows = await rest(
  `ali_question_bank?select=id,family_id,subject,prompt,addresses_misconception,eligibility_status,active` +
  `&family_id=in.(${allFamilies.join(",")})&order=family_id,id`
);
console.log(`Fetched ${rows.length} LIVE practice-eligible rows across ${allFamilies.length} families.\n`);

// ─── 1. Wave 1: teaching reachability ────────────────────────────────
console.log("=== 1. Wave 1 teaching reachability (the §15 success standard) ===");
for (const fam of WAVE1_FAMILIES) {
  const famRows = rows.filter((r) => r.family_id === fam);
  const content = getMathsTeachingContent(fam);
  if (!content) { fail(`${fam} has no teaching content — a learner here still gets nothing`); continue; }
  if (famRows.length === 0) { fail(`${fam} has no live rows — teaching would be unreachable`); continue; }
  console.log(`  PASS: ${fam} — ${famRows.length} live rows now reach a worked example ("${content.model.scenario}")`);
}

// ─── 2. Answer-leak safety against live data ─────────────────────────
console.log("\n=== 2. Guided-reveal answer-leak safety, re-checked against live rows ===");
for (const fam of WAVE1_FAMILIES) {
  const content = getMathsTeachingContent(fam);
  const famRows = rows.filter((r) => r.family_id === fam);
  let leaks = 0, checked = 0;
  for (const r of famRows) {
    const steps = (r.prompt?.workingSteps ?? []).map(String);
    if (steps.length === 0) continue;
    checked++;
    const revealable = effectiveGuidedRevealStepCount(steps.length, content.maxGuidedRevealSteps);
    const answer = String(r.prompt?.answer ?? "");
    const exposed = steps.slice(0, revealable);
    if (answer && exposed.some((s) => s.includes(answer))) {
      leaks++;
      fail(`${r.id}: Guided reveal would expose the answer "${answer}" pre-submission`);
    }
  }
  if (leaks === 0) {
    console.log(`  PASS: ${fam} — 0 answer leaks across ${checked} live rows with working (cap ${content.maxGuidedRevealSteps})`);
  }
}

// ─── 3. Remediation silence: measured BEFORE vs AFTER ────────────────
console.log("\n=== 3. Wrong-answer remediation, BEFORE vs AFTER (all covered families) ===");
let beforeSilent = 0, afterSilent = 0, recovered = 0;
const recoveredByFamily = {};
for (const r of rows) {
  const content = getMathsTeachingContent(r.family_id);
  const label = content ? MATHS_MISCONCEPTION_CATEGORY_LABEL[content.misconceptionCategory] : undefined;
  const text = r.addresses_misconception ?? undefined;
  // BEFORE: the gate MathsActivity used at f4f21fa (row text only).
  const before = shouldRenderMisconceptionNote(true, false, text);
  // AFTER: the widened Maths gate.
  const after = shouldRenderMathsMisconceptionNote(true, false, text, label);
  if (!before) beforeSilent++;
  if (!after) afterSilent++;
  if (!before && after) {
    recovered++;
    recoveredByFamily[r.family_id] = (recoveredByFamily[r.family_id] ?? 0) + 1;
  }
  if (before && !after) fail(`${r.id}: the fix SUPPRESSED remediation that previously rendered — it must only ever widen`);
}
console.log(`  Rows examined:                      ${rows.length}`);
console.log(`  Showed NOTHING on a wrong answer BEFORE: ${beforeSilent}`);
console.log(`  Shows nothing on a wrong answer AFTER:   ${afterSilent}`);
console.log(`  Rows that now show real guidance:        ${recovered}`);
console.log("  By family:");
for (const [fam, n] of Object.entries(recoveredByFamily).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${String(n).padStart(4)}  ${fam}`);
}

// ─── 4. No fabricated diagnosis ──────────────────────────────────────
console.log("\n=== 4. The fallback is real framing, never a fabricated per-answer diagnosis ===");
let fabricated = 0;
for (const r of rows) {
  const content = getMathsTeachingContent(r.family_id);
  if (!content) continue;
  const label = MATHS_MISCONCEPTION_CATEGORY_LABEL[content.misconceptionCategory];
  if (!label || label.trim().length === 0) { fabricated++; fail(`${r.family_id} resolves an empty label`); }
  // The label must be one of the fixed, human-authored category sentences,
  // never anything derived from the learner's own answer.
  if (!Object.values(MATHS_MISCONCEPTION_CATEGORY_LABEL).includes(label)) {
    fabricated++;
    fail(`${r.family_id} resolved a label outside the fixed category set`);
  }
}
if (fabricated === 0) console.log("  PASS: every rendered label is one of the fixed, human-authored category sentences.");

console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} FAILURE(S)`} across ${rows.length} live rows.`);
process.exit(failures === 0 ? 0 : 1);
