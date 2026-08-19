import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveBankEvidenceContext } from "@/lib/learningEngine/legacyPracticeEvidence";

/**
 * Stage 2 Educational Integrity Correction (Learn-path investigation) —
 * proves the boundary that makes most of the Learn path (app/english/[id],
 * app/maths, app/vocabulary, app/writing) evidence-NEUTRAL: only a
 * question_id that is a real, tagged ali_question_bank row can ever reach
 * recordOutcome()/processEvidenceForCompetency() at all. Most legacy
 * content (data/lessons.ts, data/maths.ts, etc.) is untagged — for those
 * rows, recordLegacyPracticeEvidence() returns { recorded: false,
 * outcome: "untagged-question" } before touching any evidence table,
 * regardless of what the learner answered. This module had no prior
 * unit test coverage.
 */

test("an untagged question (not in ali_question_bank) is never treated as having a competency mapping -- the FK-safety boundary", () => {
  const context = resolveBankEvidenceContext(null);
  assert.deepEqual(context, { found: false });
});

test("a bank row with an unmapped skill code resolves competencyId to undefined, honestly, rather than guessing", () => {
  const context = resolveBankEvidenceContext({ skill: "QT-DOES-NOT-EXIST", mastery_threshold: 2 });
  assert.equal(context.found, true);
  if (context.found) {
    assert.equal(context.competencyId, undefined);
  }
});

test("a genuinely tagged, mapped question resolves its real competency -- the one path that DOES produce evidence", () => {
  // eng-001-q2 (migration 013) -- one of the 5 legacy English rows actually
  // tagged into ali_question_bank; skill QT-RC-03 maps to competency RC-03.
  const context = resolveBankEvidenceContext({ skill: "QT-RC-03", mastery_threshold: 2 });
  assert.equal(context.found, true);
  if (context.found) {
    assert.equal(context.competencyId, "RC-03");
  }
});
