import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

/**
 * Question Factory Wave 2, Section 6 — the first-batch generation script
 * must never call submit/review/publish RPCs itself (this environment
 * holds no production write credentials, and even if it did, submission
 * and review are human/admin actions this script has no authority to
 * perform on its own output). It writes a local, ready-to-load payload
 * only. Also verifies the script actually ran and produced a real,
 * bounded, honestly-reported artifact.
 */

const SCRIPT_SOURCE = readFileSync("scripts/question-factory-wave2-first-batch.mjs", "utf8");

test("the script never calls submit_question_candidate, review_question_candidate, or publish_question_candidate via .rpc() -- generation/validation only", () => {
  assert.doesNotMatch(SCRIPT_SOURCE, /\.rpc\(\s*["'](submit_question_candidate|review_question_candidate|publish_question_candidate)["']/);
});

test("the script's only Supabase table interaction is a read (.select) against ali_question_bank -- no .insert/.update/.upsert/.delete anywhere", () => {
  assert.doesNotMatch(SCRIPT_SOURCE, /\.(insert|update|upsert|delete)\(/);
  assert.match(SCRIPT_SOURCE, /\.from\("ali_question_bank"\)\.select/);
});

test("the batch size per family is a small, fixed, disclosed constant -- not derived from any 'maximise volume' logic", () => {
  assert.match(SCRIPT_SOURCE, /const BATCH_SIZE_PER_FAMILY = 10;/);
});

test("the script's own console output explicitly discloses that nothing has been submitted, approved, or published", () => {
  assert.match(SCRIPT_SOURCE, /Nothing here has been submitted, approved, or published\./);
});

test("a real batch was actually run and its output artifact exists with honest, internally-consistent numbers", () => {
  const outputPath = "scripts/output/question-factory-wave2-first-batch.json";
  assert.ok(existsSync(outputPath), "expected the batch script to have been run and its output committed");
  const output = JSON.parse(readFileSync(outputPath, "utf8"));
  assert.equal(output.summary.candidatesConsidered, output.submissionPayload.length + output.summary.candidatesRejected);
  assert.equal(output.summary.candidatesApproved, output.submissionPayload.length);
  assert.ok(output.summary.familyDistribution.length === 3, "expected exactly the 3 Wave 1 families in this batch");
  for (const entry of output.submissionPayload) {
    assert.equal(entry.rpc, "submit_question_candidate");
    assert.ok(entry.args.p_candidate_id && entry.args.p_family_id);
  }
});
