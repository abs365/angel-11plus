import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

// SYNTHETIC ARITHMETIC TEST DATA: not writing, not calibration evidence.
test("a disagreement is queued for adjudication with both readers' own judgements and evidence, never averaged", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cal2-"));
  const dims = "ideas,vocabulary,grammar,structure,punctuation";
  const ev = "evidence_ideas,evidence_vocabulary,evidence_grammar,evidence_structure,evidence_punctuation";
  fs.writeFileSync(path.join(dir, "sample-register.csv"), "script_id,genre,task_code,quality_target,awkward_type\nT1,reflective,QT-WC-01a,weak,\n");
  fs.writeFileSync(path.join(dir, "reader-1.csv"), `script_id,${dims},${ev}\nT1,developing,secure,secure,secure,secure,"has a quoted, comma",,,,\n`);
  fs.writeFileSync(path.join(dir, "reader-2.csv"), `script_id,${dims},${ev}\nT1,strong,secure,secure,secure,secure,"different view",,,,\n`);
  fs.writeFileSync(path.join(dir, "ai-run-1.csv"), `script_id,${dims},flagged_low_confidence_or_review_required\nT1,secure,secure,secure,secure,secure,no\n`);
  const r = spawnSync(process.execPath, ["--import", "tsx", "scripts/analyse-writing-calibration.mjs", dir], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Disagreements for adjudication: 1/);
  assert.match(r.stdout, /1 are two-level differences/);
  const queue = fs.readFileSync(path.join(dir, "adjudication-queue.csv"), "utf8");
  assert.match(queue, /T1,ideas,developing,strong,major,"has a quoted, comma","different view",no/);
  const long = fs.readFileSync(path.join(dir, "individual-judgements.csv"), "utf8");
  assert.match(long, /T1,ideas,developing,strong,,major/);
  assert.match(long, /T1,vocabulary,secure,secure,,none/);
  assert.match(r.stdout, /Cells still awaiting a third reading: \*\*1\*\*/);
  assert.doesNotMatch(r.stdout, /pass mark|threshold:/i);
});
