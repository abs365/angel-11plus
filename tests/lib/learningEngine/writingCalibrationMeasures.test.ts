import { test } from "node:test";
import assert from "node:assert/strict";
import { disagreementKind, humanReference, pairStats, quadraticWeightedKappa, type CalCell } from "@/lib/learningEngine/writingCalibrationMeasures";

const L = (s: string): CalCell[] => s.split("").map((c) => (c === "d" ? "developing" : c === "s" ? "secure" : c === "g" ? "strong" : "could_not_judge"));

test("pair statistics: exact, within one, direction, and exclusion of 'could not judge'", () => {
  const s = pairStats(L("dsgsx"), L("dsssg"));
  // pairs used: (d,d) (s,s) (g,s) (s,s); the fifth pair has x on one side and is excluded
  assert.equal(s.n, 4);
  assert.equal(s.exact, 3 / 4);
  assert.equal(s.withinOne, 1);
  assert.equal(s.disagreements, 1);
  assert.equal(s.secondMoreGenerousShare, 0, "the only disagreement has the second rater harsher");
  assert.equal(pairStats(L("x"), L("d")).n, 0);
  assert.equal(pairStats(L("x"), L("d")).exact, null);
});

test("quadratic-weighted kappa: hand-computed value 0.8; perfect agreement 1; reversal negative; undefined without variation", () => {
  assert.ok(Math.abs(quadraticWeightedKappa(L("ddsg"), L("dssg"))! - 0.8) < 1e-12);
  assert.equal(quadraticWeightedKappa(L("dsgdsg"), L("dsgdsg")), 1);
  assert.ok(quadraticWeightedKappa(L("dgdg"), L("gdgd"))! < 0);
  assert.equal(quadraticWeightedKappa(L("ssss"), L("ssss")), null);
  assert.equal(quadraticWeightedKappa(L("x"), L("x")), null);
});

test("human reference: agree, or third reader; any split with no third reader is left unresolved, never guessed or averaged", () => {
  assert.deepEqual(humanReference("secure", "secure"), { level: "secure", how: "both_agree" });
  assert.deepEqual(humanReference("developing", "strong", "secure"), { level: "secure", how: "third_reader" });
  assert.deepEqual(humanReference("developing", "secure"), { level: null, how: "unresolved" });
  assert.deepEqual(humanReference("could_not_judge", "secure"), { level: null, how: "could_not_judge" });
  assert.equal(disagreementKind("developing", "strong"), "major");
  assert.equal(disagreementKind("developing", "secure"), "adjacent");
  assert.equal(disagreementKind("secure", "secure"), "none");
  assert.equal(disagreementKind("secure", "could_not_judge"), "not_comparable");
});

test("no calibration thresholds exist in code: they are not set before human evidence exists", async () => {
  const mod = await import("@/lib/learningEngine/writingCalibrationMeasures");
  assert.equal("checkThresholds" in mod, false);
  assert.equal("PROPOSED_THRESHOLDS" in mod, false);
});

test("analysis script runs end to end on SYNTHETIC ARITHMETIC TEST DATA (not writing, not calibration) and reports measures only", async () => {
  const fs = await import("node:fs");
  const os = await import("node:os");
  const path = await import("node:path");
  const { spawnSync } = await import("node:child_process");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cal-"));
  const dims = "ideas,vocabulary,grammar,structure,punctuation";
  fs.writeFileSync(path.join(dir, "sample-register.csv"), "script_id,genre,task_code,quality_target,awkward_type\nT1,reflective,QT-WC-01a,weak,\nT2,reflective,QT-WC-01a,strong,too_short\nT3,narrative,QT-WC-01b,middling,\n");
  const sheet = (rows: string[][]) => `script_id,${dims}\n` + rows.map((r) => r.join(",")).join("\n") + "\n";
  fs.writeFileSync(path.join(dir, "reader-1.csv"), sheet([["T1", ...Array(5).fill("developing")], ["T2", ...Array(5).fill("strong")], ["T3", ...Array(5).fill("secure")]]));
  fs.writeFileSync(path.join(dir, "reader-2.csv"), sheet([["T1", ...Array(5).fill("developing")], ["T2", ...Array(5).fill("strong")], ["T3", ...Array(5).fill("secure")]]));
  fs.writeFileSync(path.join(dir, "ai-run-1.csv"), `script_id,${dims},flagged_low_confidence_or_review_required\nT1,developing,developing,developing,developing,developing,no\nT2,strong,strong,strong,strong,strong,yes\nT3,secure,secure,secure,secure,secure,no\n`);
  const r = spawnSync(process.execPath, ["--import", "tsx", "scripts/analyse-writing-calibration.mjs", dir], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Scripts analysed: 3 of 3/);
  assert.match(r.stdout, /not\*\* a mark, a band or a CSSE-equivalent number/);
  assert.match(r.stdout, /flagged low-confidence or review-required by the AI run: 1 \(100%\)/);
  assert.ok(fs.existsSync(path.join(dir, "results.md")));
  assert.doesNotMatch(r.stdout, /\bscore\b|\bmark awarded\b/i);
});
