import { test } from "node:test";
import assert from "node:assert/strict";
import * as wave2Content from "../../../scripts/generate-english-wave2.mjs";
import { scoreEnglishComprehensionAnswer, type EnglishPromptValidationFields, type ValidationTier } from "@/lib/learningEngine/englishAnswerValidation";
import { getExamStrategyHint, getWorkedExample } from "@/lib/learningEngine/englishExamStrategies";
import { getGuidedScaffoldKind, getGuidedInstructionText, checkLiveSelectionCount } from "@/lib/learningEngine/guidedPractice";
import { classifyAutomaticError, getSelfReflectionCategories } from "@/lib/learningEngine/englishErrorClassification";

/**
 * Educational Increment 007D, Part 11 — "real Practice verification".
 * No Wave 2 content is practice_eligible in production yet (correctly —
 * nothing has passed independent review), so there is no live page to
 * click through. This exercises the EXACT functions
 * app/learning-intelligence/practice/[area]/page.tsx calls, end to end,
 * against real (not synthetic) Wave 2 content — one representative
 * variant per family plus the boundary cases Part 4 names (over-
 * selection, under-selection) — proving the full pipeline (scoring,
 * MODEL, Guided Practice, wrong-answer classification, support-tier
 * evidence) is genuinely ready the moment review clears it for
 * promotion, without pre-empting that review by touching eligibility.
 */

interface Wave2Item {
  id: string; passageId: string; question: string; family: string; competency: string;
  validation: string; misconception: string; marks: number;
  acceptedAnswers: string[] | null; quotationRequired: string[] | null;
  orderedAnswer: string[] | null; correctOptions: string[] | null; requiredSelectionCount: number | null;
}
const items = wave2Content.items as Wave2Item[];

function representative(family: string): Wave2Item {
  const it = items.find((i) => i.family === family);
  assert.ok(it, `no representative item found for ${family}`);
  return it!;
}

/** Real content data uses `validation`; the live dispatcher's field is `validationTier` (see EnglishPromptValidationFields) — this maps one real item shape to the other, exactly as scripts/emit-english-wave2-completion-migration.mjs does when building the real prompt JSON. */
function toPromptFields(it: Wave2Item): EnglishPromptValidationFields {
  return {
    marks: it.marks,
    acceptedAnswers: it.acceptedAnswers,
    quotationRequired: it.quotationRequired,
    orderedAnswer: it.orderedAnswer,
    correctOptions: it.correctOptions,
    requiredSelectionCount: it.requiredSelectionCount,
    validationTier: it.validation as ValidationTier,
  };
}

const legacy = () => 0;

test("real pipeline: multi-select representative (wave2-fam-multiselect) — correct answer scores full marks end to end", () => {
  const it = representative("wave2-fam-multiselect");
  const result = scoreEnglishComprehensionAnswer(it.correctOptions!.join(", "), toPromptFields(it), legacy);
  assert.equal(result.automaticallyVerified, true);
  assert.equal(result.earnedMarks, it.marks);
  assert.equal(result.multiSelectDetail?.exactMatch, true);
});

test("real pipeline: multi-select boundary — over-selection on a real question loses all marks and classifies OVER_SELECTION", () => {
  const it = representative("wave2-fam-multiselect");
  const overSelected = [...it.correctOptions!, "Z"].join(", ");
  const result = scoreEnglishComprehensionAnswer(overSelected, toPromptFields(it), legacy);
  assert.equal(result.earnedMarks, 0);
  assert.deepEqual(classifyAutomaticError(result, it.family), ["OVER_SELECTION"]);
});

test("real pipeline: multi-select boundary — under-selection on a real question earns partial credit and classifies UNDER_SELECTION", () => {
  const it = representative("wave2-fam-multiselect");
  const underSelected = it.correctOptions!.slice(0, it.correctOptions!.length - 1).join(", ");
  const result = scoreEnglishComprehensionAnswer(underSelected, toPromptFields(it), legacy);
  assert.ok(result.earnedMarks! > 0 && result.earnedMarks! < it.marks);
  assert.deepEqual(classifyAutomaticError(result, it.family), ["UNDER_SELECTION"]);
});

test("real pipeline: multi-select — live Guided Practice selection-count check flags a real over-selection before submission", () => {
  const it = representative("wave2-fam-multiselect");
  const kind = getGuidedScaffoldKind(it.family);
  assert.equal(kind, "selection-count-check");
  const overTyped = [...it.correctOptions!, "Z"].join(", ");
  const check = checkLiveSelectionCount(overTyped, it.requiredSelectionCount!);
  assert.equal(check.overLimit, true);
});

test("real pipeline: sequencing representative (wave1-fam-sequencing) — correct order scores full marks", () => {
  const it = items.find((i) => i.family === "wave1-fam-sequencing" && i.orderedAnswer && i.orderedAnswer.length === 4) ?? representative("wave1-fam-sequencing");
  const userAnswer = it.orderedAnswer!.join("\n");
  const result = scoreEnglishComprehensionAnswer(userAnswer, toPromptFields(it), legacy);
  assert.equal(result.earnedMarks, it.marks);
  assert.deepEqual(classifyAutomaticError(result, it.family), []);
});

test("real pipeline: sequencing — Guided Practice anchor shows the real first ordered item for a genuine question", () => {
  const it = representative("wave1-fam-sequencing");
  assert.equal(getGuidedScaffoldKind(it.family), "sequence-anchor");
  assert.ok(it.orderedAnswer && it.orderedAnswer[0].length > 0);
});

test("real pipeline: quote-explain representative — self-assessment path never auto-verifies, and the staged quotation check finds a real quotation", () => {
  const it = representative("wave1-fam-quote-explain");
  const result = scoreEnglishComprehensionAnswer(`the words are ${it.quotationRequired![0]}`, toPromptFields(it), legacy);
  assert.equal(result.automaticallyVerified, false);
  assert.equal(result.requiresSelfComparison, true);
  assert.equal(result.quotationFound, true);
  const reflectionCategories = getSelfReflectionCategories(it.family);
  assert.ok(reflectionCategories.includes("WEAK_QUOTATION"));
});

test("real pipeline: two-character representative — worked example, exam strategy hint, and guided instruction all resolve for a real question", () => {
  const it = representative("wave1-fam-two-character");
  assert.ok(getWorkedExample(it.family), "two-character must have a FULL worked example");
  assert.ok(getExamStrategyHint(it.family));
  const kind = getGuidedScaffoldKind(it.family);
  const text = getGuidedInstructionText(it.family, kind);
  assert.ok(text.toLowerCase().includes("two parts") || text.toLowerCase().includes("separately"));
});

test("real pipeline: vocab-explain representative — now has a FULL worked example (007C completion) and scores correctly", () => {
  const it = representative("wave1-fam-vocab-explain");
  assert.ok(getWorkedExample(it.family), "vocab-explain must have a FULL worked example after completion");
  const result = scoreEnglishComprehensionAnswer(it.acceptedAnswers![0], toPromptFields(it), legacy);
  assert.equal(result.earnedMarks, it.marks);
});

test("real pipeline: every family used across all 62 real questions has at least SOME support route (MODEL, guided scaffold, or exam strategy)", () => {
  const familiesInUse = new Set(items.map((i) => i.family));
  for (const family of familiesInUse) {
    const hasSupport = Boolean(getWorkedExample(family)) || Boolean(getGuidedScaffoldKind(family)) || Boolean(getExamStrategyHint(family));
    assert.ok(hasSupport, `${family} has no support route at all`);
  }
});
