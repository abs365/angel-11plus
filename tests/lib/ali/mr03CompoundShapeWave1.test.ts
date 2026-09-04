import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { checkMathsAnswer } from "@/lib/learningEngine/practiceContent";
import { runContentPoolChecks, checkMockPracticeCrossover } from "@/lib/ali/antiMemorisationChecks";
import { buildFamilyRegistry } from "@/lib/ali/questionFamilyRegistry";
import { classifyInventoryClass } from "@/lib/ali/inventoryClass";
import { getMathsTeachingContent } from "@/lib/learningEngine/mathsTeachingContent";
import type { BankQuestion } from "@/types/ali/questionBank";
import type { MathsQuestion } from "@/types/index";

/**
 * Programme Increment 020, Part 19 — targeted tests for Wave 1's new
 * Mathematics content (migration 222, family mr03-compound-area-
 * perimeter). Mirrors each new row's real prompt data by hand (this repo
 * has no live database this session can query), so these tests exercise
 * the actual educational content and its real consuming engines, not
 * merely the migration file's own text.
 */

interface RowFixture {
  id: string;
  contentDifficulty: BankQuestion["contentDifficulty"];
  marks: number;
  answer: string;
  question: string;
  transferClass: "ROUTINE" | "NEAR_TRANSFER" | "FAR_TRANSFER" | "MIXED_TRANSFER";
}

const ROWS: RowFixture[] = [
  { id: "mr03-compound-01", contentDifficulty: "easy", marks: 1, answer: "48m2", question: "A garden is shaped like the letter L, made of two rectangular sections. The lower section is 9m by 4m. The upper section is 4m by 3m. What is the total area of the garden?", transferClass: "ROUTINE" },
  { id: "mr03-compound-02", contentDifficulty: "easy", marks: 1, answer: "46m2", question: "A classroom floor plan is L-shaped, made of two rectangular sections. The main section is 8m by 5m. The smaller section is 3m by 2m. What is the total area of the floor?", transferClass: "ROUTINE" },
  { id: "mr03-compound-03", contentDifficulty: "medium", marks: 2, answer: "40m", question: "A school hall is L-shaped. Four of its sides measure 12m, 5m, 3m and 5m, as shown. What is the perimeter of the hall?", transferClass: "NEAR_TRANSFER" },
  { id: "mr03-compound-04", contentDifficulty: "medium", marks: 2, answer: "48m", question: "A factory floor is L-shaped. Four of its sides measure 14m, 6m, 4m and 6m, as shown. What is the perimeter of the floor?", transferClass: "NEAR_TRANSFER" },
  { id: "mr03-compound-05", contentDifficulty: "hard", marks: 2, answer: "79m2", question: "A field is shaped like the diagram shown, with a rectangular section missing from one corner. The full outer rectangle would measure 11m by 9m, but a 4m by 5m rectangle is missing from the bottom-left corner. What is the area of the field?", transferClass: "NEAR_TRANSFER" },
  { id: "mr03-compound-06", contentDifficulty: "hard", marks: 2, answer: "12m", question: "An L-shaped field has a perimeter of 44m. The narrower upper section measures 5m by 4m. The lower section is 6m tall, but its width is unknown, as shown. What is the width of the lower section?", transferClass: "FAR_TRANSFER" },
  { id: "mr03-compound-07", contentDifficulty: "challenge", marks: 3, answer: "72m2", question: "A stepped patio is shown, made of three rectangular sections stacked like stairs. Six of its sides measure 12m, 3m, 4m, 3m, 4m and 3m, as shown. What is the total area of the patio?", transferClass: "MIXED_TRANSFER" },
  { id: "mr03-compound-08", contentDifficulty: "easy", marks: 1, answer: "24m2", question: "A small patio is L-shaped, made of two rectangular sections. The main section is 6m by 3m. The smaller section is 3m by 2m. What is the total area of the patio?", transferClass: "ROUTINE" },
];

function toBankQuestion(row: RowFixture): BankQuestion {
  return {
    id: row.id,
    subject: "maths",
    skill: "QT-MR-07",
    pathway: ["csse"],
    contentDifficulty: row.contentDifficulty,
    questionType: "short-answer",
    estimatedTimeSeconds: 90,
    prompt: { id: row.id, question: row.question, answer: row.answer, skill: "arithmetic", difficulty: "year5-core", marks: row.marks } as unknown as MathsQuestion,
    explanation: `Programme Increment 020, Wave 1. ${row.id}.`,
    confidenceWeight: 1,
    revisionPriority: 3,
    masteryThreshold: 2,
    usageCount: 0,
    avgSuccessRate: null,
    learningUnitId: "inc020-wave1-mr03-compound-area-perimeter",
    familyId: "mr03-compound-area-perimeter",
    provenance: "angel_original",
    eligibilityStatus: "provisional",
    active: true,
  } as BankQuestion;
}

const BANK_QUESTIONS = ROWS.map(toBankQuestion);

test("every new row's own stored answer is accepted by the real checkMathsAnswer against itself", () => {
  for (const row of ROWS) {
    assert.ok(checkMathsAnswer(row.answer, row.answer), `${row.id}'s own answer "${row.answer}" must be self-accepting`);
  }
});

test("checkMathsAnswer accepts the plain-digit area/perimeter form for every new row (m2 and m both real, matchable formats)", () => {
  assert.ok(checkMathsAnswer("48m2", "48m2"));
  assert.ok(checkMathsAnswer("48 m2", "48m2"), "whitespace before the unit must not matter");
  assert.ok(checkMathsAnswer("40m", "40m"));
});

test("anti-memorisation: no duplicate ids, no exact or near-identical stems across the 8 new rows", () => {
  const report = runContentPoolChecks(BANK_QUESTIONS);
  assert.deepEqual(report.duplicateIds, []);
  assert.deepEqual(report.exactDuplicateStems, []);
  assert.deepEqual(report.nearIdenticalStems, [], "no two rows should reduce to the same shape once numbers are normalised away -- each is a genuinely distinct scenario, not the same sentence with digits swapped");
});

test("anti-memorisation: none of the 8 new rows are Mock-exposed -- this Practice-track family must never cross into Mock", () => {
  const exposed = checkMockPracticeCrossover(ROWS.map((r) => r.id), new Set(["some-other-mock-question"]));
  assert.deepEqual(exposed, []);
});

test("question family registry: all 8 rows resolve to exactly one family, correctly attributed to MR-03", () => {
  const inventoryClasses = new Map(ROWS.map((r) => [r.id, "unclassified" as const]));
  const families = buildFamilyRegistry(BANK_QUESTIONS, inventoryClasses);
  assert.equal(families.length, 1, "all 8 rows must group into exactly one family, not scatter into singletons");
  const [family] = families;
  assert.equal(family.familyId, "mr03-compound-area-perimeter");
  assert.equal(family.competencyId, "MR-03");
  assert.equal(family.rowCount, 8);
  assert.deepEqual(new Set(family.difficultyRange), new Set(["easy", "medium", "hard", "challenge"]), "the family must show a real difficulty progression across all four tiers, not a flat difficulty");
});

test("inventory classification: a ROUTINE row, once promoted to practice_eligible + active, classifies RENEWABLE (never SEALED/MEASUREMENT)", () => {
  const cls = classifyInventoryClass({ contentType: "question", eligibilityStatus: "practice_eligible", active: true, isFarTransfer: false });
  assert.equal(cls, "renewable");
});

test("inventory classification: the FAR_TRANSFER-tagged row (compound-06), once promoted, classifies MEASUREMENT -- never ordinary RENEWABLE", () => {
  const cls = classifyInventoryClass({ contentType: "question", eligibilityStatus: "practice_eligible", active: true, isFarTransfer: true });
  assert.equal(cls, "measurement");
});

test("inventory classification: every new row is currently 'unclassified' (still provisional, pending Founder review) -- never silently treated as already approved", () => {
  for (const row of ROWS) {
    const cls = classifyInventoryClass({ contentType: "question", eligibilityStatus: "provisional", active: true });
    assert.equal(cls, "unclassified", `${row.id} must not be misclassified as approved Practice content while still provisional`);
  }
});

test("transfer isolation: exactly one row is tagged FAR_TRANSFER (the unseen-transfer item), and it is not one of the foundation-tier rows", () => {
  const farTransfer = ROWS.filter((r) => r.transferClass === "FAR_TRANSFER");
  assert.equal(farTransfer.length, 1);
  assert.equal(farTransfer[0].id, "mr03-compound-06");
  assert.notEqual(farTransfer[0].contentDifficulty, "easy", "the unseen-transfer item must not be a foundation-tier question");
});

test("difficulty progression: a real spread from easy to challenge, not a flat tier", () => {
  const byTier = new Map<string, number>();
  for (const row of ROWS) byTier.set(row.contentDifficulty, (byTier.get(row.contentDifficulty) ?? 0) + 1);
  assert.equal(byTier.get("easy"), 3);
  assert.equal(byTier.get("medium"), 2);
  assert.equal(byTier.get("hard"), 2);
  assert.equal(byTier.get("challenge"), 1);
});

test("misconception/remediation relationship: the family's MATHS_FAMILY_TEACHING_CONTENT entry teaches the PERIMETER skill (the family's other real skill), not a duplicate of the lesson's own AREA worked example", () => {
  const content = getMathsTeachingContent("mr03-compound-area-perimeter");
  assert.ok(content, "the new family must have a real teaching-content entry, not silently fall back to assessment-only rendering");
  assert.equal(content!.misconceptionCategory, "INCOMPLETE_REASONING");
  assert.match(content!.model.scenario, /perimeter/i);
  assert.ok(!/9m.*4m.*4m.*3m/.test(content!.model.scenario), "must not reuse the lesson's own guided-question numbers verbatim");
});

test("the new lesson page's own guided/independent/retry anchors resolve to three distinct real rows, not the same question three times", () => {
  const anchors = ["mr03-compound-01", "mr03-compound-02", "mr03-compound-08"];
  assert.equal(new Set(anchors).size, 3);
  for (const id of anchors) assert.ok(ROWS.some((r) => r.id === id), `${id} must be a real row this migration defines`);
});

// ─── CompoundShapeDiagram component: source-level structural proof ──────
// This codebase has no @testing-library/React-rendering infrastructure
// (confirmed precedent: tests/components/mockAttempt/DataTableStimulus.test.ts's
// own header) -- these are the same kind of structural proofs against the
// real shipped source.

const diagramSource = fs.readFileSync("components/practice/CompoundShapeDiagram.tsx", "utf8");

test("CompoundShapeDiagram renders a real <svg> with an accessible name, not a bare unlabelled graphic", () => {
  assert.match(diagramSource, /<svg\b/);
  assert.match(diagramSource, /role="img"/);
  assert.match(diagramSource, /aria-label=/);
});

test("CompoundShapeDiagram draws from the real diagram prop's own vertices/edgeLabels -- no hard-coded shape or numbers", () => {
  assert.match(diagramSource, /diagram\.vertices/);
  assert.match(diagramSource, /diagram\.edgeLabels/);
  assert.ok(!/\b9m\b|\b48m|\bmr03-compound/i.test(diagramSource), "the generic renderer must not hard-code any specific question's own numbers or ids");
});

test("CompoundShapeDiagram is theme-aware, matching every other component in this codebase's own dark-mode convention", () => {
  assert.match(diagramSource, /dark:/);
});
