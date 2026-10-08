import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const dir = "scripts/output/csse-practice-publication-package";
const manifest = JSON.parse(fs.readFileSync(`${dir}/manifest.json`, "utf8"));
const excluded = JSON.parse(fs.readFileSync(`${dir}/excluded-not-recommended.json`, "utf8")).candidates as { candidateId: string; blueprint: string }[];
const summary = JSON.parse(fs.readFileSync(`${dir}/decision-summary.json`, "utf8"));
const pack = fs.readFileSync("ANGEL_CSSE_MATHS_PRACTICE_FINAL_DECISION_PACK.md", "utf8");
const runbook = fs.readFileSync("ANGEL_CSSE_MATHS_PRACTICE_PUBLICATION_RUNBOOK.md", "utf8");
const setFiles = Object.values(manifest.sets as Record<string, { file: string; candidates: number }>);
const submitted = (file: string) => {
  const s = fs.readFileSync(`${dir}/${file}`, "utf8");
  const arr = JSON.parse(s.match(/const candidates = (\[[\s\S]*?\]);\n  const results/)![1]) as { p_candidate_id: string }[];
  return { s, ids: arr.map((a) => a.p_candidate_id) };
};

test("the package holds exactly the 374 recommended candidates; the six not recommended are preserved but never submitted", () => {
  assert.equal(manifest.prepared, 380);
  assert.equal(manifest.recommended, 374);
  assert.equal(excluded.length, 6);
  assert.ok(excluded.every((e) => e.blueprint === "mr01-bp-change-from-note"));
  const all = setFiles.flatMap((f) => submitted(f.file).ids);
  assert.equal(all.length, 374);
  assert.equal(new Set(all).size, 374);
  for (const e of excluded) assert.ok(!all.includes(e.candidateId), e.candidateId);
  const fromBlueprints = manifest.blueprints.flatMap((b: { candidateIds: string[] }) => b.candidateIds);
  assert.deepEqual([...fromBlueprints].sort(), [...all].sort());
  assert.deepEqual(setFiles.map((f) => f.candidates).reduce((a, b) => a + b, 0), 374);
});

test("submit scripts only submit as pending_review: they never approve or publish", () => {
  for (const f of setFiles) {
    const { s } = submitted(f.file);
    assert.match(s, /rpc\/submit_question_candidate/);
    assert.doesNotMatch(s, /review_question_candidate|publish_question_candidate|p_decision/);
  }
});

test("the approve-and-publish script is GUARDED (does nothing unless the Founder flips the switch) and uses only the governed functions", () => {
  const s = fs.readFileSync(`${dir}/review-and-publish-GUARDED.js`, "utf8");
  assert.match(s, /const FOUNDER_AUTHORISED = false;/);
  assert.match(s, /if \(!FOUNDER_AUTHORISED\) \{ console\.warn\("Not authorised: nothing was approved or published\."\); return; \}/);
  assert.ok(s.indexOf("FOUNDER_AUTHORISED") < s.indexOf("localStorage"), "the guard runs before any session is read");
  assert.match(s, /review_question_candidate/);
  assert.match(s, /publish_question_candidate/);
  assert.doesNotMatch(s, /\/rest\/v1\/ali_question_bank|\.insert\(|\.update\(|delete from/i, "no raw write");
  const ids = Object.values(JSON.parse(s.match(/const AUTHORISED_BLUEPRINTS = (\{[\s\S]*?\});\n/)![1]) as Record<string, string[]>).flat();
  assert.equal(ids.length, 374);
  for (const e of excluded) assert.ok(!ids.includes(e.candidateId));
});

test("decision pack: 380 re-verified from their own parameters, 374 recommended, risks preserved and not averaged, nothing published", () => {
  assert.equal(summary.summary.verifiedCandidates, 380);
  assert.deepEqual(summary.summary.failures, []);
  assert.equal(summary.summary.internalDuplicates, 0);
  assert.match(pack, /Recommended publish set: 374 of 380/);
  assert.match(pack, /901 live \+ 374 = \*\*1275\*\*/);
  assert.match(pack, /Nothing has been submitted, approved or published/);
  for (const id of Object.keys(manifest.blueprints.reduce((m: Record<string, 1>, b: { id: string }) => ((m[b.id] = 1), m), {}))) assert.ok(pack.includes(id), id);
  assert.match(pack, /coordinate grid LOW; angle figures MEDIUM; number-line scale-reading HIGH; the isolated rounding batch CRITICAL/);
  assert.equal(summary.familyRisk["precision-dec"].risk, "MEDIUM");
  assert.equal(summary.batchRisk["precision-dec|numberline"].risk, "CRITICAL");
  assert.equal(summary.batchRisk["mr03-coordinate|grid"].risk, "LOW");
  assert.equal(summary.batchRisk["mr03-angle-sum|angle"].risk, "MEDIUM");
  assert.equal(summary.batchRisk["mr01-scale-reading|numberline"].risk, "HIGH");
  assert.match(pack, /APPROVE only together with the two breadth rounding blueprints/);
  for (const d of ["APPROVE", "TRIM", "REVISE", "REJECT"]) assert.ok(pack.includes(d), d);
  assert.match(runbook, /NOT EXECUTED/);
  assert.match(runbook, /Do not run any step without the Founder's authorisation/);
});

test("the Mock and Practice crossover found by the live check is recorded and fixed", () => {
  const live = JSON.parse(fs.readFileSync(`${dir}/live-duplicate-check.json`, "utf8"));
  assert.equal(live.exactMatches, 0);
  assert.equal(live.liveRowsCompared, 710);
  assert.match(live.finding, /mock-fb-mr08-reflect-01/);
  assert.match(pack, /Mock and Practice stay sealed from each other/);
});
