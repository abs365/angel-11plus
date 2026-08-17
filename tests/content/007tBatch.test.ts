import { test } from "node:test";
import assert from "node:assert/strict";
import { mathsQuestions, verify as verifyMaths } from "../../scripts/generate-007t-mathematics-mr01.mjs";
import { passages, rc10Questions, verify as verifyEnglish } from "../../scripts/generate-007t-english-rc10.mjs";

/**
 * Educational Increment 007T. Re-verifies the first controlled content
 * expansion batch's own invariants as a standing regression test — so a
 * future edit to either generator script that silently breaks an answer,
 * a quotation, or a structural constraint can't slip through without
 * `npm test` catching it. Mirrors tests/content/englishWave1.test.ts's
 * established pattern exactly.
 */

test("007T: Mathematics generator's own verify() reports zero problems", () => {
  assert.deepEqual(verifyMaths(), []);
});

test("007T: English generator's own verify() reports zero problems", () => {
  assert.deepEqual(verifyEnglish(), []);
});

test("007T: exactly 20 Mathematics questions, 5 per family across the 4 frozen families", () => {
  assert.equal(mathsQuestions.length, 20);
  const byFamily: Record<string, number> = {};
  for (const q of mathsQuestions) byFamily[q.family_id] = (byFamily[q.family_id] ?? 0) + 1;
  assert.deepEqual(byFamily, {
    "mr01-whole-number-computation": 5,
    "mr01-decimal-computation": 5,
    "mr01-fraction-computation": 5,
    "mr01-multistep-order-of-operations": 5,
  });
});

test("007T: exactly 5 English passages and 14 QT-RC-10 questions across the 2 frozen families", () => {
  assert.equal(passages.length, 5);
  assert.equal(rc10Questions.length, 14);
  const byFamily: Record<string, number> = {};
  for (const q of rc10Questions) byFamily[q.family_id] = (byFamily[q.family_id] ?? 0) + 1;
  assert.deepEqual(byFamily, {
    "wave3-fam-rc10-word-choice": 8,
    "wave3-fam-rc10-atmosphere-mood": 6,
  });
});

test("007T: every Mathematics question has non-empty workingSteps and a misconception tag", () => {
  for (const q of mathsQuestions) {
    assert.ok(Array.isArray(q.workingSteps) && q.workingSteps.length > 0, `${q.id} missing workingSteps`);
    assert.ok(q.misconception && q.misconception.length > 0, `${q.id} missing misconception`);
  }
});

test("007T: every RC-10 question has a modelAnswer, at least 2 acceptedAnswers, and a misconception tag", () => {
  for (const q of rc10Questions) {
    assert.ok(q.modelAnswer && q.modelAnswer.length > 0, `${q.id} missing modelAnswer`);
    assert.ok(q.acceptedAnswers.length >= 2, `${q.id} has fewer than 2 acceptedAnswers`);
    assert.ok(q.misconception && q.misconception.length > 0, `${q.id} missing misconception`);
  }
});

test("007T: no em/en dash reaches any learner-facing field, matching the platform's Copy Quality Guard standard", () => {
  const DASH_CHARS = /[—–]/;
  for (const q of mathsQuestions) {
    assert.ok(!DASH_CHARS.test(q.question), `${q.id} question contains a dash character`);
    for (const step of q.workingSteps) assert.ok(!DASH_CHARS.test(step), `${q.id} workingSteps contains a dash character`);
  }
  for (const p of passages) assert.ok(!DASH_CHARS.test(p.text), `${p.id} passage text contains a dash character`);
  for (const q of rc10Questions) {
    assert.ok(!DASH_CHARS.test(q.question), `${q.id} question contains a dash character`);
    assert.ok(!DASH_CHARS.test(q.modelAnswer), `${q.id} modelAnswer contains a dash character`);
    for (const a of q.acceptedAnswers) assert.ok(!DASH_CHARS.test(a), `${q.id} acceptedAnswers contains a dash character`);
  }
});

test("007T: no passage is reused by more than the 007S-approved ceiling (<=3 families)", () => {
  const byPassage: Record<string, Set<string>> = {};
  for (const q of rc10Questions) {
    (byPassage[q.passageId] ??= new Set()).add(q.family_id);
  }
  for (const [passageId, families] of Object.entries(byPassage)) {
    assert.ok(families.size <= 3, `${passageId} used by ${families.size} families, exceeds the <=3 reuse ceiling`);
  }
});

test("007T: no Mathematics question shares an identical structural fingerprint within its own family", () => {
  // A coarse fingerprint intentionally flags real number-swap clones while
  // NOT flagging legitimate difficulty progression (same operator, different
  // magnitude, via the digit-count-band of every numeric token) or genuine
  // structural variation (like vs unlike fraction denominators, via the
  // denominatorsEqual signal below — without it, "2/9+4/9" and "1/4+1/6"
  // would incorrectly collide despite testing a materially different skill:
  // finding a common denominator is not required for the first).
  const byFamily: Record<string, typeof mathsQuestions> = {};
  for (const q of mathsQuestions) (byFamily[q.family_id] ??= []).push(q);
  for (const [family, qs] of Object.entries(byFamily)) {
    const fingerprints = new Set<string>();
    for (const q of qs) {
      const ops = q.question.match(/[+\-−×÷/]/g)?.join("") ?? "(word-form)";
      const brackets = /[()]/.test(q.question) ? "brackets" : "no-brackets";
      const decimal = /\d\.\d/.test(q.question) ? "decimal" : "int";
      const fractionMatches = [...q.question.matchAll(/(\d+)\/(\d+)/g)];
      const fraction = fractionMatches.length > 0 ? "fraction" : "no-fraction";
      const denominators = new Set(fractionMatches.map((m) => m[2]));
      const denominatorsEqual = fractionMatches.length > 0 ? (denominators.size === 1 ? "like-denom" : "unlike-denom") : "n/a";
      const digitBand = (q.question.match(/\d+(\.\d+)?/g) ?? []).map((n) => n.replace(".", "").length).join("-");
      const fingerprint = `${ops}|${brackets}|${decimal}|${fraction}|${denominatorsEqual}|${digitBand}`;
      assert.ok(!fingerprints.has(fingerprint), `${family}: ${q.id} shares fingerprint [${fingerprint}] with an earlier sibling`);
      fingerprints.add(fingerprint);
    }
  }
});
