/**
 * Educational Increment 007L — Mathematics Teaching Architecture, bounded
 * proof. Family-keyed lookup, same shape as lib/adminReview.ts's
 * FAMILY_EDUCATIONAL_CONTEXT and lib/learningEngine/guidedPractice.ts's
 * FAMILY_SCAFFOLD: a plain Record<familyId, …>, not a database table.
 *
 * A family absent from MATHS_FAMILY_TEACHING_CONTENT renders the Practice
 * page's unmodified, pre-007L ASSESSMENT ONLY behaviour — this module only
 * ever adds content for a family, never changes behaviour for one it
 * doesn't cover. See ANGEL_007L_MATHEMATICS_TEACHING_ARCHITECTURE_V1.md
 * Part 6 for the full architecture rationale, and Part 5 for why these 4
 * families (and no others) were selected for this bounded proof.
 */

/**
 * Part 3D's bounded remediation taxonomy — derived from what the reviewed
 * corpus's own addresses_misconception field genuinely supports across the
 * Batch 1-4 families, not invented and not English's categories forced
 * onto Mathematics (checkMathsAnswer returns only a boolean; there is no
 * structural scoring detail to classify a wrong answer automatically the
 * way englishErrorClassification.ts does for English's tiered results).
 */
export type MathsMisconceptionCategory =
  | "OPERATION_SELECTION"
  | "PROCEDURAL_SEQUENCE_ERROR"
  | "UNIT_OR_CONVERSION_ERROR"
  | "MISREAD_QUANTITY"
  | "STRUCTURAL_MISAPPLICATION";

export const MATHS_MISCONCEPTION_CATEGORY_LABEL: Record<MathsMisconceptionCategory, string> = {
  OPERATION_SELECTION: "This looks like the wrong operation or approach was chosen for this question.",
  PROCEDURAL_SEQUENCE_ERROR: "This looks like the right idea, applied in the wrong order or stopped one step early.",
  UNIT_OR_CONVERSION_ERROR: "This looks like a units or conversion slip.",
  MISREAD_QUANTITY: "This looks like one of the given numbers was used for the wrong purpose.",
  STRUCTURAL_MISAPPLICATION: "This looks like a method that fits a similar-looking question, but not quite this one.",
};

/**
 * MODEL content — Part 3A's contract: a fixed, safe, NON-LIVE worked
 * example demonstrating the reasoning process, never the current
 * question's own numbers. Hand-authored, same discipline as
 * ENGLISH_FAMILY_WORKED_EXAMPLE (lib/learningEngine/englishExamStrategies.ts).
 */
export interface MathsModelExample {
  /** What to notice — the structural cue that identifies this family. */
  whatToNotice: string;
  /** The mathematical relationship/rule that matters, in words. */
  relationship: string;
  /** A safe, separate worked scenario — never the live question. */
  scenario: string;
  /** The ordered reasoning applied to that scenario. */
  reasoning: string[];
  /** The scenario's own answer, so the worked example is checkable/complete. */
  answer: string;
  /** How to verify the result (inverse-operation or plausibility check). */
  verification: string;
}

export interface MathsFamilyTeachingContent {
  model: MathsModelExample;
  misconceptionCategory: MathsMisconceptionCategory;
}

export const MATHS_FAMILY_TEACHING_CONTENT: Record<string, MathsFamilyTeachingContent> = {
  "mr01-missing-operand": {
    model: {
      whatToNotice: "A box (▢) stands in for a missing number in a simple equation. The two numbers you CAN see, and the operation joining them, are both given.",
      relationship: "Whatever operation is shown, use its INVERSE to find the missing number: the inverse of × is ÷, the inverse of + is −, and the other way round.",
      scenario: "▢ × 6 = 54. What number replaces the box?",
      reasoning: [
        "The box is multiplied by 6 to give 54, and multiplication's inverse is division.",
        "54 ÷ 6 = 9.",
      ],
      answer: "9",
      verification: "Put the answer back in: 9 × 6 = 54 ✓. If it doesn't match the original equation, the wrong inverse was used.",
    },
    misconceptionCategory: "OPERATION_SELECTION",
  },
  "mr04-best-value": {
    model: {
      whatToNotice: "Two options give a different QUANTITY for a different TOTAL PRICE. The totals alone don't tell you which is cheaper per item.",
      relationship: "Divide each option's total price by its quantity to get a price PER ITEM, then compare those two smaller numbers, not the totals.",
      scenario: "Oranges: Option A is 4 for £2.00. Option B is 7 for £3.15. Which is better value?",
      reasoning: [
        "Option A: £2.00 ÷ 4 = £0.50 each.",
        "Option B: £3.15 ÷ 7 = £0.45 each.",
        "£0.45 is lower than £0.50, so Option B is better value.",
      ],
      answer: "B",
      verification: "Check the division: 7 × £0.45 = £3.15 and 4 × £0.50 = £2.00, both match the totals given.",
    },
    misconceptionCategory: "OPERATION_SELECTION",
  },
  "mr03-angle-ratio": {
    model: {
      whatToNotice: "A total angle (180° on a straight line, or 360° around a point) is split by a ratio. The ratio numbers themselves are NOT the answer in degrees.",
      relationship: "Add the ratio parts to find how many equal shares make up the total, divide the total by that many shares, then multiply by the share you need.",
      scenario: "Two angles on a straight line are in the ratio 4:1. What is the size of the largest angle?",
      reasoning: [
        "Angles on a straight line add up to 180°.",
        "4 + 1 = 5 equal shares, so each share is 180° ÷ 5 = 36°.",
        "The largest angle is 4 × 36° = 144°.",
      ],
      answer: "144°",
      verification: "Add both angles back: 144° + 36° = 180° ✓.",
    },
    misconceptionCategory: "STRUCTURAL_MISAPPLICATION",
  },
  "mr01-measurement-conversion": {
    model: {
      whatToNotice: "Two measurements are given in DIFFERENT units (e.g. m and cm). They cannot be added together until they match.",
      relationship: "Convert both amounts into the same unit first (the one the question asks for), then add.",
      scenario: "A plank is 1.5m long. A second plank is 60cm long. What is the total length in m?",
      reasoning: [
        "Convert both amounts to the same unit (m): 60cm = 0.60m.",
        "1.5m + 0.60m = 2.1m.",
      ],
      answer: "2.1m",
      verification: "Convert the answer back to cm and check it matches: 2.1m = 210cm, and 150cm + 60cm = 210cm ✓.",
    },
    misconceptionCategory: "UNIT_OR_CONVERSION_ERROR",
  },
};

export function getMathsTeachingContent(familyId?: string | null): MathsFamilyTeachingContent | undefined {
  if (!familyId) return undefined;
  return MATHS_FAMILY_TEACHING_CONTENT[familyId];
}
