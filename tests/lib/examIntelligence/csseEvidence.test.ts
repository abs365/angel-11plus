import { test } from "node:test";
import assert from "node:assert/strict";
import { CSSE_EVIDENCE_FACTS, getCurrentCsseFacts } from "@/lib/examIntelligence/csseEvidence";

/**
 * Programme Increment 008B, Part 25 — the Continuous Writing marks/
 * weighting figure remains disclosed as medium-confidence (not silently
 * upgraded), and must never surface to parents as a confirmed fact until
 * independently re-verified.
 */

test("every evidence entry carries a real source URL and retrieval date", () => {
  for (const fact of CSSE_EVIDENCE_FACTS) {
    assert.ok(fact.sourceUrl.startsWith("https://"), `${fact.id} missing a real source URL`);
    assert.match(fact.retrievedAt, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("getCurrentCsseFacts only returns official_exam_fact entries, never unknown/unverified categories", () => {
  const facts = getCurrentCsseFacts();
  assert.ok(facts.length > 0);
  for (const f of facts) assert.equal(f.category, "official_exam_fact");
});

test("the unverified Continuous Writing marks/weighting figure is NOT surfaced to parents via getCurrentCsseFacts", () => {
  const facts = getCurrentCsseFacts();
  assert.ok(!facts.some((f) => f.id === "continuous-writing-marks-weighting"), "the disclosed medium-confidence figure must not appear in the parent-facing fact list");
});

test("the unverified figure still exists in the full record, disclosed, not deleted", () => {
  const entry = CSSE_EVIDENCE_FACTS.find((f) => f.id === "continuous-writing-marks-weighting");
  assert.ok(entry);
  assert.equal(entry!.category, "unknown_requires_evidence");
  assert.equal(entry!.confidence, "unverified");
});

test("Applied Reasoning removal is present and current, matching the verbatim official quote", () => {
  const entry = CSSE_EVIDENCE_FACTS.find((f) => f.id === "applied-reasoning-removed");
  assert.ok(entry);
  assert.equal(entry!.confidence, "current");
  assert.match(entry!.detail, /Applied Reasoning/);
});
