import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveSubjectEvidenceState, getCompetencyIdsForComponent } from "@/lib/learningEngine/preparationState";

/** Educational Increment 007V, Part 3/4 — the whole-subject evidence-state aggregation, the one genuinely new piece of logic in the canonical preparation-state module. */

test("no evidence anywhere yields no_evidence, never zero-as-established", () => {
  assert.equal(deriveSubjectEvidenceState([]), "no_evidence");
  assert.equal(deriveSubjectEvidenceState(["insufficient", "insufficient"]), "no_evidence");
});

test("any competency reaching moderate or high yields established_evidence", () => {
  assert.equal(deriveSubjectEvidenceState(["insufficient", "moderate"]), "established_evidence");
  assert.equal(deriveSubjectEvidenceState(["low", "high"]), "established_evidence");
});

test("real attempts below threshold (low), with nothing established, yields developing_evidence", () => {
  assert.equal(deriveSubjectEvidenceState(["low"]), "developing_evidence");
  assert.equal(deriveSubjectEvidenceState(["insufficient", "low"]), "developing_evidence");
});

test("getCompetencyIdsForComponent returns real Assessment Brain competencies, never invents one", () => {
  const maths = getCompetencyIdsForComponent("Mathematics");
  assert.ok(maths.includes("MR-01"));
  assert.ok(!maths.includes("RC-01"), "must not cross-contaminate components");
  const writing = getCompetencyIdsForComponent("Continuous Writing");
  assert.deepEqual(new Set(writing), new Set(["WC-01", "WC-02"]));
});
