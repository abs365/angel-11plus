import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyPersistGuard, type PersistGuardId } from "@/lib/mockAttempt/persistGuardClassifier";

/**
 * Increment 025 (Founder-approved, bounded observability only) — real
 * behavioural coverage (not source-text assertion) for the one pure
 * function this Founder-approved diagnostic adds: given a caught error's
 * `message`, return only a safe, allow-listed identifier naming which of
 * mock_persist_reading_scoring()'s (migration 219) own fixed RAISE
 * EXCEPTION templates produced it — never the message, never any
 * interpolated attempt/question id or count it carries.
 *
 * Each fixture below is the REAL, fully-interpolated message text
 * Postgres would send for that exact migration 219 template (verified
 * against supabase/migrations/219_mock_reading_scoring_authority.sql at
 * the time this was written), not an invented approximation.
 */

const KNOWN_MESSAGE_FIXTURES: readonly { guard: PersistGuardId; message: string }[] = [
  { guard: "persist_guard:attempt_not_found", message: "Attempt e2f26f8d-25b6-452d-bd1c-3d5ad2436a0f not found" },
  { guard: "persist_guard:attempt_not_submitted", message: "Attempt e2f26f8d-25b6-452d-bd1c-3d5ad2436a0f is not submitted (status=in_progress) -- only a locked, submitted attempt may be scored" },
  { guard: "persist_guard:wrong_attempt_form", message: "Attempt e2f26f8d-25b6-452d-bd1c-3d5ad2436a0f is not a Reading Comprehension Mock 1 attempt (attempt_type=full_mock, form_id=mathematics-mock-1)" },
  { guard: "persist_guard:outcomes_not_array", message: "p_outcomes must be a JSON array" },
  { guard: "persist_guard:outcome_count_mismatch", message: "Outcome count (27) does not match assigned question count (28)" },
  { guard: "persist_guard:question_not_in_manifest", message: "Question reading-q99 is not part of attempt e2f26f8d-25b6-452d-bd1c-3d5ad2436a0f's assigned manifest" },
  { guard: "persist_guard:duplicate_outcome", message: "Duplicate outcome supplied for question reading-q07" },
  { guard: "persist_guard:question_bank_row_missing", message: "Question reading-q12 no longer resolves to a bank row" },
  { guard: "persist_guard:marks_out_of_bounds", message: "Question reading-q03 supplied marksAwarded 4 outside canonical bound [0,2]" },
  { guard: "persist_guard:report_row_missing", message: "No report row exists for attempt e2f26f8d-25b6-452d-bd1c-3d5ad2436a0f -- the migration 072 report-init trigger should have created one on submission" },
];

for (const { guard, message } of KNOWN_MESSAGE_FIXTURES) {
  test(`classifyPersistGuard maps the real migration 219 "${guard}" message to its own safe identifier`, () => {
    assert.equal(classifyPersistGuard(message), guard);
  });
}

test("every known guard is reachable regardless of the specific interpolated attempt id, question id, or count -- the guard id never depends on those values", () => {
  const first = classifyPersistGuard("Outcome count (1) does not match assigned question count (2)");
  const second = classifyPersistGuard("Outcome count (999) does not match assigned question count (1000)");
  assert.equal(first, "persist_guard:outcome_count_mismatch");
  assert.equal(second, "persist_guard:outcome_count_mismatch");
  assert.equal(first, second, "two structurally identical messages with different interpolated numbers must classify identically");
});

test("the returned guard id never contains the raw message or any interpolated value from it", () => {
  const attemptId = "e2f26f8d-25b6-452d-bd1c-3d5ad2436a0f";
  const message = `Attempt ${attemptId} not found`;
  const result = classifyPersistGuard(message);
  assert.equal(result, "persist_guard:attempt_not_found");
  assert.doesNotMatch(result, new RegExp(attemptId), "the attempt id must never leak into the returned identifier");
  assert.notEqual(result, message, "the raw message must never be returned verbatim");
});

test("an unrecognised message safely falls back to persist_guard:unknown -- never guessed, never throws", () => {
  assert.equal(classifyPersistGuard("some future Postgres error text this classifier has never seen"), "persist_guard:unknown");
  assert.equal(classifyPersistGuard(""), "persist_guard:unknown");
  assert.equal(classifyPersistGuard(undefined), "persist_guard:unknown");
  assert.equal(classifyPersistGuard(null), "persist_guard:unknown");
});

test("a coincidental partial match (a real message that merely contains a known phrase as a substring) does not misclassify -- every pattern is start-to-end anchored", () => {
  assert.equal(
    classifyPersistGuard("Some unrelated wrapper error: p_outcomes must be a JSON array (nested detail)"),
    "persist_guard:unknown"
  );
});

test("a plain non-Postgres Error's message is handled exactly like any other unrecognised message -- no special-casing, no throw", () => {
  const ordinary = new Error("connect ECONNREFUSED 127.0.0.1:5432");
  assert.equal(classifyPersistGuard(ordinary.message), "persist_guard:unknown");
});
