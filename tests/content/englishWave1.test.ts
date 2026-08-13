import { test } from "node:test";
import assert from "node:assert/strict";
import * as wave1Content from "../../scripts/generate-english-wave1.mjs";

interface Wave1Passage {
  id: string;
  originalText: string;
}
interface Wave1Item {
  id: string;
  passageId: string;
  question: string;
  competency: string;
  validation: string;
  misconception: string;
  quotationRequired: string[] | null;
}

const passages = wave1Content.passages as Wave1Passage[];
const items = wave1Content.items as Wave1Item[];

/**
 * Educational Increment 007B. Re-verifies the Wave 1 content invariants
 * that scripts/generate-english-wave1.mjs already checks at generation
 * time (duplicate id/question, quotation verbatim-in-passage), as a
 * standing regression test — so a future edit to the generator that
 * silently breaks one of these can't slip through without npm test
 * catching it, the same discipline Mathematics' wave scripts follow.
 */

test("Wave 1: exactly 6 passages, exactly 42 questions", () => {
  assert.equal(passages.length, 6);
  assert.equal(items.length, 42);
});

test("Wave 1: every question id is unique", () => {
  const ids = new Set(items.map((i) => i.id));
  assert.equal(ids.size, items.length);
});

test("Wave 1: every question text is unique", () => {
  const qs = new Set(items.map((i) => i.question));
  assert.equal(qs.size, items.length);
});

test("Wave 1: every question maps to a real passage id", () => {
  const passageIds = new Set(passages.map((p) => p.id));
  for (const it of items) {
    assert.ok(passageIds.has(it.passageId), `${it.id} references unknown passage ${it.passageId}`);
  }
});

test("Wave 1: every required quotation appears verbatim in its own passage", () => {
  const passageById = new Map(passages.map((p) => [p.id, p.originalText]));
  for (const it of items) {
    if (!it.quotationRequired) continue;
    const text = passageById.get(it.passageId)!;
    for (const quote of it.quotationRequired) {
      assert.ok(text.includes(quote), `${it.id}: quotation "${quote}" not found verbatim in ${it.passageId}`);
    }
  }
});

test("Wave 1: every question has a populated misconception", () => {
  for (const it of items) {
    assert.ok(it.misconception && it.misconception.length > 0, `${it.id} has no misconception recorded`);
  }
});

test("Wave 1: every question declares an answer-validation tier", () => {
  const validTiers = new Set(["TIER1_EXACT_MATCH", "TIER2_ACCEPTED_SET", "TIER3_QUOTATION_PLUS_EXPLANATION", "TIER4_ORDERED_LIST"]);
  for (const it of items) {
    assert.ok(validTiers.has(it.validation), `${it.id} has an unrecognised validation tier "${it.validation}"`);
  }
});

test("Wave 1: all four evidence-confirmed competencies (RC-01..04) are covered", () => {
  const competencies = new Set(items.map((i) => i.competency));
  for (const c of ["RC-01", "RC-02", "RC-03", "RC-04"]) {
    assert.ok(competencies.has(c), `competency ${c} has no coverage in Wave 1`);
  }
});

test("Wave 1: no question declares its own eligibility_status in content data", () => {
  // Structural guard: authoring data must never pre-empt the migration/
  // governance decision of what eligibility_status a row starts at.
  for (const it of items) {
    assert.ok(
      !("eligibilityStatus" in it),
      `${it.id} must not declare its own eligibility_status in content data — that is a migration/governance concern, not authoring`
    );
  }
});
