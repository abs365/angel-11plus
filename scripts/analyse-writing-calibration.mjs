// Computes the agreed calibration measures from filled reader sheets. Reports measures only: no mark, no band, no CSSE number.
// Usage: npx tsx scripts/analyse-writing-calibration.mjs <dir containing sample-register.csv, reader-a.csv, reader-b.csv, [third-reader.csv], ai-run-1.csv, [ai-run-2.csv]>
import fs from "node:fs";
import path from "node:path";
import { CAL_DIMENSIONS, checkThresholds, humanReference, needsThirdReader, pairStats, quadraticWeightedKappa } from "../lib/learningEngine/writingCalibrationMeasures.ts";

const dir = process.argv[2];
if (!dir) { console.error("usage: analyse-writing-calibration.mjs <dir>"); process.exit(1); }
function csv(name, required = true) {
  const p = path.join(dir, name);
  if (!fs.existsSync(p)) { if (required) { console.error("missing " + p); process.exit(1); } return null; }
  const lines = fs.readFileSync(p, "utf8").split(/\r?\n/).filter((l) => l.trim() && !l.startsWith("("));
  const head = lines[0].split(",");
  return lines.slice(1).map((l) => Object.fromEntries(l.split(",").map((v, i) => [head[i], (v ?? "").trim()])));
}
const register = csv("sample-register.csv");
const A = csv("reader-a.csv");
const B = csv("reader-b.csv");
const C = csv("third-reader.csv", false) ?? [];
const AI1 = csv("ai-run-1.csv");
const AI2 = csv("ai-run-2.csv", false) ?? [];
const by = (rows) => new Map(rows.map((r) => [r.script_id, r]));
const a = by(A), b = by(B), c = by(C), ai1 = by(AI1), ai2 = by(AI2), reg = by(register);
const cell = (m, s, d) => { const v = m.get(s)?.[d]; return v ? v : undefined; };
const pct = (x) => (x === null ? "n/a" : (100 * x).toFixed(0) + "%");
const num = (x) => (x === null ? "n/a" : x.toFixed(2));

const ids = register.map((r) => r.script_id).filter((s) => a.has(s) && b.has(s) && ai1.has(s));
const out = [];
out.push("# Writing calibration results (measures only)", "", `Scripts analysed: ${ids.length} of ${register.length} in the register. This is **not** a mark, a band or a CSSE-equivalent number.`, "");
out.push("## Human-human agreement (readers A and B)", "", "| Dimension | n | exact | within one | weighted kappa | third reader required | recommended |", "|---|---|---|---|---|---|---|");
const ref = {};
for (const d of CAL_DIMENSIONS) {
  const x = ids.map((s) => cell(a, s, d)), y = ids.map((s) => cell(b, s, d));
  const st = pairStats(x, y);
  const need = ids.map((s, i) => needsThirdReader(x[i] ?? "could_not_judge", y[i] ?? "could_not_judge"));
  out.push(`| ${d} | ${st.n} | ${pct(st.exact)} | ${pct(st.withinOne)} | ${num(quadraticWeightedKappa(x, y))} | ${need.filter((n) => n === "required").length} | ${need.filter((n) => n === "recommended").length} |`);
  ref[d] = ids.map((s, i) => humanReference(x[i] ?? "could_not_judge", y[i] ?? "could_not_judge", cell(c, s, d)));
}
const unresolved = CAL_DIMENSIONS.reduce((n, d) => n + ref[d].filter((r) => r.how === "unresolved").length, 0);
out.push("", `Cells with no human reference (readers split and no third reading supplied): **${unresolved}**. These are excluded from the AI comparison below, not guessed.`, "");
out.push("## AI vs human reference", "", "| Dimension | n | exact | within one | weighted kappa | AI more generous (share of disagreements) |", "|---|---|---|---|---|---|");
const agg = { w1: [], gen: [] };
for (const d of CAL_DIMENSIONS) {
  const h = ids.map((s, i) => ref[d][i].level ?? undefined), g = ids.map((s) => cell(ai1, s, d));
  const st = pairStats(h, g);
  out.push(`| ${d} | ${st.n} | ${pct(st.exact)} | ${pct(st.withinOne)} | ${num(quadraticWeightedKappa(h, g))} | ${pct(st.secondMoreGenerousShare)} |`);
  if (st.withinOne !== null) agg.w1.push(st.withinOne);
  if (st.secondMoreGenerousShare !== null) agg.gen.push(st.secondMoreGenerousShare);
}
const mean = (v) => (v.length ? v.reduce((s, x) => s + x, 0) / v.length : null);
// AI repeatability on the scripts that have a second run
const rep = ids.filter((s) => ai2.has(s));
const repW1 = rep.length ? mean(CAL_DIMENSIONS.map((d) => pairStats(rep.map((s) => cell(ai1, s, d)), rep.map((s) => cell(ai2, s, d))).withinOne).filter((x) => x !== null)) : null;
out.push("", `## AI repeatability (same script twice)`, "", `Scripts with a second AI run: ${rep.length}. Mean within-one-level agreement across dimensions: ${pct(repW1)}.`, "");
// Awkward scripts and the safety net
const awkward = ids.filter((s) => reg.get(s)?.awkward_type);
const flagged = awkward.filter((s) => (ai1.get(s)?.flagged_low_confidence_or_review_required ?? "").toLowerCase() === "yes");
const awkFlagged = awkward.length ? flagged.length / awkward.length : null;
out.push("## Safety net on awkward scripts", "", `Awkward scripts analysed: ${awkward.length}; flagged low-confidence or review-required by the AI run: ${flagged.length} (${pct(awkFlagged)}).`, "");
out.push("## Against the PROPOSED, provisional thresholds (Founder sets the real ones)", "", "| Check | value | threshold | met |", "|---|---|---|---|");
for (const t of checkThresholds({ withinOne: mean(agg.w1), secondMoreGenerousShare: mean(agg.gen), repeatabilityWithinOne: repW1, awkwardFlagged: awkFlagged })) out.push(`| ${t.name} | ${pct(t.value)} | ${pct(t.threshold)} | ${t.met === null ? "not computable" : t.met ? "yes" : "no"} |`);
out.push("", "Nothing in the product changes automatically from these numbers.");
fs.writeFileSync(path.join(dir, "results.md"), out.join("\n") + "\n");
console.log(out.join("\n"));
