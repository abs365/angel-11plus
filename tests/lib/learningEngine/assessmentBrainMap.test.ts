import { test } from "node:test";
import assert from "node:assert/strict";
import {
  COMPETENCIES,
  ALL_COMPETENCY_IDS,
  ALL_ASSESSMENT_COMPONENTS,
  isValidCompetencyId,
} from "../../../lib/learningEngine/assessmentBrainMap";
import { computeComponentReadiness } from "../../../lib/learningEngine/readiness";
import { computeDiagnosticFindings } from "../../../lib/learningEngine/diagnostics";
import { computeCompetencyStatus } from "../../../lib/learningEngine/rollup";
import type { CompetencyStatus } from "../../../lib/learningEngine/types";

/** Every real competency, with zero learner evidence — exactly the state every learner starts in. */
function emptyCompetencyStatuses(): CompetencyStatus[] {
  return ALL_COMPETENCY_IDS.map((id) => computeCompetencyStatus(id, []));
}

/**
 * CSSE Completion Programme Phase A, Decision 58 — Applied Reasoning (AR-01)
 * was removed from the live CSSE English paper from September 2024 (2025
 * Entry) onward, Founder-confirmed. These tests prove the two live surfaces
 * that were confirmed (by direct code trace) to render it as a permanent,
 * unfixable "gap" to real parents/children no longer do so, while the
 * historical Assessment Brain V1 transcription (COMPETENCIES["AR-01"]) is
 * left completely intact.
 */

test("Decision 58: AR-01 remains in COMPETENCIES as unedited historical evidence", () => {
  assert.ok(COMPETENCIES["AR-01"], "the historical transcription must not be deleted");
  assert.equal(COMPETENCIES["AR-01"].name, "Letter-Code Pattern Inference and Application");
  assert.equal(COMPETENCIES["AR-01"].component, "Applied Reasoning");
});

test("Decision 58: AR-01 is excluded from ALL_COMPETENCY_IDS (the live-iteration set)", () => {
  // TypeScript itself now proves AR-01 cannot be a member of ALL_COMPETENCY_IDS's
  // narrowed type (inferred from the .filter() in assessmentBrainMap.ts) — cast
  // to a wider type here purely so this runtime double-check can still compile.
  assert.equal((ALL_COMPETENCY_IDS as readonly string[]).includes("AR-01"), false);
  assert.equal(ALL_COMPETENCY_IDS.length, 12, "13 historical competencies minus AR-01");
});

test("Decision 58: Applied Reasoning is excluded from ALL_ASSESSMENT_COMPONENTS (the live-iteration set)", () => {
  assert.equal(ALL_ASSESSMENT_COMPONENTS.includes("Applied Reasoning"), false);
  assert.deepEqual(ALL_ASSESSMENT_COMPONENTS, ["English Comprehension", "Continuous Writing", "Mathematics"]);
});

test("Decision 58: computeComponentReadiness never returns an Applied Reasoning card", () => {
  const readiness = computeComponentReadiness(emptyCompetencyStatuses());
  assert.equal(
    readiness.some((r) => r.component === "Applied Reasoning"),
    false,
    "a parent/child must never see a permanent, unfixable 'Applied Reasoning: Not Yet Evidenced' readiness card for a component that no longer exists in the current exam"
  );
  assert.equal(readiness.length, 3);
});

test("Decision 58: computeDiagnosticFindings never lists AR-01 as a coverage gap", () => {
  const findings = computeDiagnosticFindings(emptyCompetencyStatuses());
  assert.equal(
    findings.notYetEvidenced.includes("AR-01"),
    false,
    "AR-01 must never appear in the 'Not Yet Evidenced (coverage gap, not a finding)' chip list shown to parents/children"
  );
});

/**
 * Decision 225 (Mock Priority -> Targeted Practice Routing) —
 * isValidCompetencyId() is the one gate between an arbitrary,
 * caller-supplied string (a URL query parameter) and a value trusted
 * enough to cast to CompetencyId and pass into
 * generatePersonalisedSession()'s own familyFocusCompetencyId parameter.
 */
test("isValidCompetencyId accepts every real competency id, including AR-01 (unlike ALL_COMPETENCY_IDS, this validates against the true complete set)", () => {
  for (const id of Object.keys(COMPETENCIES)) {
    assert.equal(isValidCompetencyId(id), true, `expected ${id} to validate`);
  }
  assert.equal(isValidCompetencyId("AR-01"), true);
});

test("isValidCompetencyId rejects an unrecognised string, never throws", () => {
  assert.equal(isValidCompetencyId("NOT-A-REAL-ID"), false);
  assert.equal(isValidCompetencyId(""), false);
  assert.equal(isValidCompetencyId("mr-01"), false, "must be case-sensitive, never a fuzzy match");
});

test("isValidCompetencyId rejects prototype-pollution-shaped input safely (hasOwnProperty guard, not a bare `in` check)", () => {
  assert.equal(isValidCompetencyId("constructor"), false);
  assert.equal(isValidCompetencyId("toString"), false);
  assert.equal(isValidCompetencyId("hasOwnProperty"), false);
});
