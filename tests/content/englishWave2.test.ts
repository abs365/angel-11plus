import { test } from "node:test";
import assert from "node:assert/strict";
import * as wave2Content from "../../scripts/generate-english-wave2.mjs";
import { checkAcceptedAnswerSet, checkQuotationPresent, checkOrderedSequence, checkNamedComponent, checkMultiSelect } from "@/lib/learningEngine/englishAnswerValidation";

interface Wave2Passage {
  id: string;
  originalText: string;
}
interface Wave2Item {
  id: string;
  passageId: string;
  question: string;
  competency: string;
  family: string;
  validation: string;
  misconception: string;
  acceptedAnswers: string[] | null;
  quotationRequired: string[] | null;
  orderedAnswer: string[] | null;
  correctOptions: string[] | null;
  requiredSelectionCount: number | null;
}

const passages = wave2Content.passages as Wave2Passage[];
const items = wave2Content.items as Wave2Item[];

/**
 * Educational Increment 007C. Same discipline as tests/content/
 * englishWave1.test.ts — re-verifies the Wave 2 content invariants the
 * generator already checks at generation time, as a standing regression
 * test against future edits.
 */

test("Wave 2: 9 passages authored (8 original + 1 added on completion, Part 4)", () => {
  assert.equal(passages.length, 9);
});

test("Wave 2: at least 60 questions authored (completion requirement)", () => {
  assert.ok(items.length >= 60, `expected at least 60 questions, got ${items.length}`);
});

test("Wave 2: every question id is unique", () => {
  const ids = new Set(items.map((i) => i.id));
  assert.equal(ids.size, items.length);
});

test("Wave 2: every question text is unique", () => {
  const qs = new Set(items.map((i) => i.question));
  assert.equal(qs.size, items.length);
});

test("Wave 2: every question maps to a real passage id", () => {
  const passageIds = new Set(passages.map((p) => p.id));
  for (const it of items) {
    assert.ok(passageIds.has(it.passageId), `${it.id} references unknown passage ${it.passageId}`);
  }
});

test("Wave 2: every required quotation appears verbatim in its own passage", () => {
  const passageById = new Map(passages.map((p) => [p.id, p.originalText]));
  for (const it of items) {
    if (!it.quotationRequired) continue;
    const text = passageById.get(it.passageId)!;
    for (const quote of it.quotationRequired) {
      assert.ok(text.includes(quote), `${it.id}: quotation "${quote}" not found verbatim in ${it.passageId}`);
    }
  }
});

test("Wave 2: every question has a populated misconception", () => {
  for (const it of items) {
    assert.ok(it.misconception && it.misconception.length > 0, `${it.id} has no misconception recorded`);
  }
});

test("Wave 2: every question's declared tier actually matches the data it carries (tier conformance)", () => {
  const CLEARLY_WRONG = "zzz_no_semantic_overlap_qqq";
  for (const it of items) {
    if (it.validation === "TIER2_ACCEPTED_SET") {
      assert.ok(it.acceptedAnswers && it.acceptedAnswers.length > 0, `${it.id}: TIER2 requires acceptedAnswers`);
      assert.ok(checkAcceptedAnswerSet(it.acceptedAnswers![0], it.acceptedAnswers!).correct, `${it.id}`);
      assert.ok(!checkAcceptedAnswerSet(CLEARLY_WRONG, it.acceptedAnswers!).correct, `${it.id}`);
    } else if (it.validation === "TIER3_QUOTATION_PLUS_EXPLANATION") {
      assert.ok(it.quotationRequired && it.quotationRequired.length > 0, `${it.id}: TIER3 requires quotationRequired`);
      for (const q of it.quotationRequired!) {
        assert.ok(checkQuotationPresent(`context ${q} context`, q).quotationFound, `${it.id}`);
      }
    } else if (it.validation === "TIER4_ORDERED_LIST") {
      assert.ok(it.orderedAnswer && it.orderedAnswer.length > 0, `${it.id}: TIER4 requires orderedAnswer`);
      const sets = it.orderedAnswer!.map((s) => [s]);
      assert.equal(checkOrderedSequence(it.orderedAnswer!, sets).marks, it.orderedAnswer!.length, `${it.id}`);
    } else if (it.validation === "TIER5_NAMED_COMPONENT_PLUS_EXPLANATION") {
      assert.ok(it.acceptedAnswers && it.acceptedAnswers.length > 0, `${it.id}: TIER5 requires acceptedAnswers`);
      assert.ok(checkNamedComponent(it.acceptedAnswers![0], it.acceptedAnswers!).namedComponentCorrect, `${it.id}`);
    } else if (it.validation === "TIER6_MULTI_SELECT") {
      assert.ok(it.correctOptions && it.correctOptions.length > 0, `${it.id}: TIER6 requires correctOptions`);
      assert.equal(it.correctOptions!.length, it.requiredSelectionCount, `${it.id}: correctOptions length must match requiredSelectionCount`);
      const exact = checkMultiSelect(it.correctOptions!, it.correctOptions!, it.requiredSelectionCount!);
      assert.equal(exact.exactMatch, true, `${it.id}: the question's own correct answer must score as an exact match`);
    } else {
      assert.fail(`${it.id}: unrecognised validation tier "${it.validation}"`);
    }
  }
});

test("Wave 2: multi-select over-selection loses all marks for every wave2-fam-multiselect question", () => {
  const multiSelectItems = items.filter((it) => it.validation === "TIER6_MULTI_SELECT");
  assert.ok(multiSelectItems.length >= 6, "expected at least 6 multi-select questions after completion (Part 3A)");
  for (const it of multiSelectItems) {
    const overSelected = [...it.correctOptions!, "Z"]; // one extra, definitely-wrong option beyond the required count
    const result = checkMultiSelect(overSelected, it.correctOptions!, it.requiredSelectionCount!);
    assert.equal(result.marks, 0, `${it.id}: over-selection must lose all marks`);
  }
});

test("Wave 2: all four evidence-confirmed competencies plus the new multi-select QT are covered", () => {
  const competencies = new Set(items.map((i) => i.competency));
  for (const c of ["RC-01", "RC-02", "RC-03", "RC-04"]) {
    assert.ok(competencies.has(c), `competency ${c} has no coverage in Wave 2`);
  }
  const multiSelectCount = items.filter((i) => i.validation === "TIER6_MULTI_SELECT").length;
  assert.ok(multiSelectCount > 0, "the new multi-select family must have real coverage");
});

test("Wave 2: two-character family reaches at least 5 new instances, cumulative total (with Wave 1's 1) at least 6", () => {
  const twoCharacterCount = items.filter((i) => i.family === "wave1-fam-two-character").length;
  assert.ok(twoCharacterCount >= 5, "Wave 2 must contribute at least 5 two-character instances so the cumulative total (with Wave 1's 1) reaches at least 6");
});

test("Wave 2 completion: sequencing gains structural variety, not just repeated 3-item reorder questions", () => {
  const sequencing = items.filter((i) => i.family === "wave1-fam-sequencing");
  assert.ok(sequencing.length >= 9, "sequencing must grow beyond Wave 1+original-Wave-2's combined 12... at least 9 within Wave 2 alone");
  const fourItemSequences = sequencing.filter((i) => i.orderedAnswer && i.orderedAnswer.length === 4);
  assert.ok(fourItemSequences.length >= 3, "at least 3 completion-added sequencing questions must use a 4-item chain, a structurally distinct shape from the original 3-item reorder pattern");
});

test("Wave 2 completion: the new passage (wave2-eng-surprise) is real, original, and distinct from the other 8", () => {
  const surprise = passages.find((p) => p.id === "wave2-eng-surprise");
  assert.ok(surprise, "wave2-eng-surprise must exist");
  const others = passages.filter((p) => p.id !== "wave2-eng-surprise");
  for (const other of others) {
    assert.notEqual(surprise.originalText, other.originalText);
  }
  assert.ok(surprise.originalText.length > 1000, "the new passage must be a real, substantial passage, not a stub");
});

test("Wave 2: no question declares its own eligibility_status in content data", () => {
  for (const it of items) {
    assert.ok(!("eligibilityStatus" in it), `${it.id} must not declare its own eligibility_status in content data`);
  }
});
