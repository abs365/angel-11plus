// Computes descriptive calibration measures from filled reader sheets and builds the ADJUDICATION QUEUE.
// It preserves every individual reader judgement, never averages disagreement away, sets NO thresholds (none exist before human
// evidence does), and produces no mark, band or CSSE-equivalent number.
// Usage: npx tsx scripts/analyse-writing-calibration.mjs <dir with sample-register.csv, reader-1.csv, reader-2.csv, [reader-3.csv], ai-run-1.csv, [ai-run-2.csv]>
import fs from "node:fs";
import path from "node:path";
import { CAL_DIMENSIONS, disagreementKind, humanReference, pairStats, quadraticWeightedKappa } from "../lib/learningEngine/writingCalibrationMeasures.ts";

const dir = process.argv[2];
if (!dir) { console.error("usage: analyse-writing-calibration.mjs <dir>"); process.exit(1); }
function csv(name, required = true) {
  const p = path.join(dir, name);
  if (!fs.existsSync(p)) { if (required) { console.error("missing " + p); process.exit(1); } return null; }
  const lines = fs.readFileSync(p, "utf8").split(/\r?\n/).filter((l) => l.trim() && !l.startsWith("("));
  const head = lines[0].split(",");
  return lines.slice(1).map((l) => {
    // minimal CSV: quoted fields may contain commas
    const cells = []; let cur = "", q = false;
    for (const ch of l) { if (ch === '"') q = !q; else if (ch === "," && !q) { cells.push(cur); cur = ""; } else cur += ch; }
    cells.push(cur);
    return Object.fromEntries(cells.map((v, i) => [head[i], (v ?? "").trim()]));
  });
}
const register = csv("sample-register.csv");
const A = csv("reader-1.csv");
const B = csv("reader-2.csv");
const C = csv("reader-3.csv", false) ?? [];
const AI1 = csv("ai-run-1.csv");
const AI2 = csv("ai-run-2.csv", false) ?? [];
const by = (rows) => new Map(rows.map((r) => [r.script_id, r]));
const a = by(A), b = by(B), c = by(C), ai1 = by(AI1), ai2 = by(AI2), reg = by(register);
const cell = (m, s, d) => { const v = m.get(s)?.[d]; return v ? v : undefined; };
const pct = (x) => (x === null ? "n/a" : (100 * x).toFixed(0) + "%");
const num = (x) => (x === null ? "n/a" : x.toFixed(2));

const ids = register.map((r) => r.script_id).filter((s) => a.has(s) && b.has(s) && ai1.has(s));
const out = [];
out.push("# Writing calibration results (descriptive measures only)", "", `Scripts analysed: ${ids.length} of ${register.length} in the register. This is **not** a mark, a band or a CSSE-equivalent number, and no pass/fail threshold is applied: thresholds are not set before human evidence exists.`, "");

// 1. Individual judgements are preserved in a long-form file, one row per script and dimension.
const longRows = ["script_id,dimension,reader_1,reader_2,reader_3,disagreement,ai_run_1,ai_run_2,evidence_1,evidence_2"];
const queue = ["script_id,dimension,reader_1,reader_2,kind,evidence_1,evidence_2,reader_3_supplied,adjudicated_level,adjudication_notes"];
let disagreements = 0, major = 0;
for (const s of ids) for (const d of CAL_DIMENSIONS) {
  const ra = cell(a, s, d) ?? "could_not_judge", rb = cell(b, s, d) ?? "could_not_judge", rc = cell(c, s, d) ?? "";
  const kind = disagreementKind(ra, rb);
  const ea = a.get(s)?.["evidence_" + d] ?? "", eb = b.get(s)?.["evidence_" + d] ?? "";
  const qd = (x) => '"' + String(x).replace(/"/g, '""') + '"';
  longRows.push([s, d, ra, rb, rc, kind, cell(ai1, s, d) ?? "", cell(ai2, s, d) ?? "", qd(ea), qd(eb)].join(","));
  if (kind === "adjacent" || kind === "major") { disagreements++; if (kind === "major") major++; queue.push([s, d, ra, rb, kind, qd(ea), qd(eb), rc ? "yes" : "no", rc, ""].join(",")); }
}
fs.writeFileSync(path.join(dir, "individual-judgements.csv"), longRows.join("\n") + "\n");
fs.writeFileSync(path.join(dir, "adjudication-queue.csv"), queue.join("\n") + "\n");

out.push("## Human-human agreement (Readers 1 and 2)", "", "| Dimension | n | exact | within one | weighted kappa |", "|---|---|---|---|---|");
const ref = {};
for (const d of CAL_DIMENSIONS) {
  const x = ids.map((s) => cell(a, s, d)), y = ids.map((s) => cell(b, s, d));
  const st = pairStats(x, y);
  out.push(`| ${d} | ${st.n} | ${pct(st.exact)} | ${pct(st.withinOne)} | ${num(quadraticWeightedKappa(x, y))} |`);
  ref[d] = ids.map((s, i) => humanReference(x[i] ?? "could_not_judge", y[i] ?? "could_not_judge", cell(c, s, d)));
}
const unresolved = CAL_DIMENSIONS.reduce((n, d) => n + ref[d].filter((r) => r.how === "unresolved").length, 0);
out.push("", `## Disagreements for adjudication: ${disagreements}`, "", `${major} are two-level differences. **Every** difference between the two readers is in \`adjudication-queue.csv\` with both readers' own judgements and evidence lines. Nothing has been averaged or resolved. Cells still awaiting a third reading: **${unresolved}**; they are excluded from the AI comparison below, not guessed. Each reader's complete judgements are preserved in \`individual-judgements.csv\`.`, "");
out.push("## AI vs human reference (only where a human reference exists)", "", "| Dimension | n | exact | within one | weighted kappa | AI more generous (share of disagreements) |", "|---|---|---|---|---|---|");
for (const d of CAL_DIMENSIONS) {
  const h = ids.map((s, i) => ref[d][i].level ?? undefined), g = ids.map((s) => cell(ai1, s, d));
  const st = pairStats(h, g);
  out.push(`| ${d} | ${st.n} | ${pct(st.exact)} | ${pct(st.withinOne)} | ${num(quadraticWeightedKappa(h, g))} | ${pct(st.secondMoreGenerousShare)} |`);
}
const rep = ids.filter((s) => ai2.has(s));
const repRows = CAL_DIMENSIONS.map((d) => pairStats(rep.map((s) => cell(ai1, s, d)), rep.map((s) => cell(ai2, s, d))));
out.push("", "## AI repeatability (same script twice)", "", `Scripts with a second AI run: ${rep.length}.`, "", "| Dimension | n | exact | within one |", "|---|---|---|---|");
CAL_DIMENSIONS.forEach((d, i) => out.push(`| ${d} | ${repRows[i].n} | ${pct(repRows[i].exact)} | ${pct(repRows[i].withinOne)} |`));
const awkward = ids.filter((s) => reg.get(s)?.awkward_type);
const flagged = awkward.filter((s) => (ai1.get(s)?.flagged_low_confidence_or_review_required ?? "").toLowerCase() === "yes");
out.push("", "## Safety net on awkward scripts", "", `Awkward scripts analysed: ${awkward.length}; flagged low-confidence or review-required by the AI run: ${flagged.length} (${pct(awkward.length ? flagged.length / awkward.length : null)}).`, "");
out.push("These are descriptive measures for the Founder's decision record. No claim of calibrated Writing assessment follows from them until the Founder has reviewed actual human comparison evidence.");
fs.writeFileSync(path.join(dir, "results.md"), out.join("\n") + "\n");
console.log(out.join("\n"));
