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
  | "STRUCTURAL_MISAPPLICATION"
  | "INCOMPLETE_REASONING"
  | "PRECISION_INSTRUCTION_IGNORED";

export const MATHS_MISCONCEPTION_CATEGORY_LABEL: Record<MathsMisconceptionCategory, string> = {
  OPERATION_SELECTION: "This looks like the wrong operation or approach was chosen for this question.",
  PROCEDURAL_SEQUENCE_ERROR: "This looks like the right idea, applied in the wrong order or stopped one step early.",
  UNIT_OR_CONVERSION_ERROR: "This looks like a units or conversion slip.",
  MISREAD_QUANTITY: "This looks like one of the given numbers was used for the wrong purpose.",
  STRUCTURAL_MISAPPLICATION: "This looks like a method that fits a similar-looking question, but not quite this one.",
  /**
   * Phase B (CSSE Completion Programme) — evidenced by two independently
   * researched families (mr02-substitution: using only one of two given
   * relationships; mr03-classify: assuming a shape's type without checking
   * the rule directly) converging on the same real gap: not every genuine
   * wrong-answer pattern in this corpus is a wrong OPERATION, SEQUENCE,
   * UNIT, MISREAD, or STRUCTURAL mismatch — some are a step or check simply
   * left out. Added only because two separate families' own real
   * addresses_misconception text independently needed it, not invented
   * speculatively.
   */
  INCOMPLETE_REASONING: "This looks like part of the reasoning or a checking step was left out.",
  /**
   * Phase B — evidenced by precision-frac's real addresses_misconception
   * text: the working is otherwise correct, but the question's explicit
   * precision/format instruction (an exact fraction, not a rounded
   * decimal) was not followed. Distinct from PROCEDURAL_SEQUENCE_ERROR
   * (precision-dec's real error, incorrect rounding technique) — this is a
   * format-instruction miss, not a procedural mistake.
   */
  PRECISION_INSTRUCTION_IGNORED: "This looks like the working was right, but the question's instruction about how to give the answer wasn't followed.",
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
  /**
   * Phase B safety rule (found necessary by this phase's own family-by-
   * family design research, mr01-data-table): Guided step reveal must never
   * expose a step whose text contains the literal final answer value before
   * the learner's own submission. Some families' real, stored workingSteps
   * end in a generic templated step that is just the answer restated (e.g.
   * "Compute the answer: 39") rather than genuine intermediate working. For
   * those families only, this caps how many of the family's real
   * workingSteps the Guided reveal button may expose — post-submission the
   * full, unmodified workingSteps are still shown in full, unaffected
   * (that has always been complete, post-hoc explanation). Absent = no cap,
   * every real step may be revealed (007L's original 4 families' behaviour,
   * unchanged).
   */
  maxGuidedRevealSteps?: number;
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

  // ─── Phase B (CSSE Completion Programme) — extended from the 4 007L
  // proof families to every remaining Practice Eligible Mathematics family
  // safe to teach, per ANGEL_PHASE_B_MATHEMATICS_TEACHING_COMPLETION_V1.md.
  // mr05-number-property-search is deliberately absent (TRANSFER-UNSAFE,
  // only 2 near-identical siblings — see that document's Part 7).

  "mr01-average-mean": {
    model: {
      whatToNotice: "Several separate values need to be combined into one typical value, and how many values there are matters just as much as their total.",
      relationship: "Mean = (sum of all the values) ÷ (how many values there are).",
      scenario: "Four friends' heights, in cm, were 132, 128, 140 and 136. What is the mean height?",
      reasoning: [
        "Add all the values: 132 + 128 + 140 + 136 = 536.",
        "Count how many values there are: 4.",
        "Divide the total by the count: 536 ÷ 4 = 134.",
      ],
      answer: "134",
      verification: "134 × 4 = 536, matching the total ✓.",
    },
    misconceptionCategory: "MISREAD_QUANTITY",
  },
  "mr01-data-table": {
    model: {
      whatToNotice: "The question only names some of the table's rows, not all of them.",
      relationship: "Only combine or compare the specific values the question actually names, and ignore the rest of the table.",
      scenario: "Rainfall (mm) by day. Mon: 5, Tue: 11, Wed: 3, Thu: 8. What is the total rainfall from Tuesday to Wednesday?",
      reasoning: [
        "Identify exactly which values the question asks about: Tuesday and Wednesday.",
        "Read those specific values from the table: 11 and 3.",
        "Combine them as the question asks: 11 + 3 = 14.",
      ],
      answer: "14",
      verification: "Does 14 make sense given the individual values were 11 and 3? Yes.",
    },
    misconceptionCategory: "MISREAD_QUANTITY",
    // This family's real workingSteps are ["Read the correct values from
    // the table", "Compute the answer: <the live answer itself>"] — the
    // second step is not real working, it is the answer restated. Capped
    // at 1 so Guided reveal can never show it before submission.
    maxGuidedRevealSteps: 1,
  },
  "mr02-compare": {
    model: {
      whatToNotice: "Two different expressions both use the same value of n, and each one must be worked out separately before they can be compared.",
      relationship: "Substitute n into each expression on its own, then compare the two results. Never compare the expressions without evaluating them first.",
      scenario: "When n = 5, is 4n + 3 greater than, less than, or equal to 3n + 10?",
      reasoning: [
        "Evaluate the first expression: 4 × 5 + 3 = 23.",
        "Evaluate the second expression: 3 × 5 + 10 = 25.",
        "Compare the two results: 23 is less than 25.",
      ],
      answer: "Less than",
      verification: "Check each substitution separately: 4×5=20, 20+3=23 ✓; 3×5=15, 15+10=25 ✓.",
    },
    misconceptionCategory: "PROCEDURAL_SEQUENCE_ERROR",
  },
  "mr02-far-ratio-context": {
    model: {
      whatToNotice: "A total is split by a stated ratio, not evenly. The ratio tells you how much bigger one share is than the other.",
      relationship: "Add the ratio parts to find how many equal shares make up the total, use that to find each share, then apply any follow-on step.",
      scenario: "A ribbon is cut in the ratio 3:1 and is 40cm long in total. If 5cm is then cut off the shorter piece, how long is it now?",
      reasoning: [
        "3 + 1 = 4 equal shares, so each share is 40cm ÷ 4 = 10cm.",
        "The shorter piece is 1 share: 10cm.",
        "10cm − 5cm = 5cm.",
      ],
      answer: "5cm",
      verification: "Check the full split: 3 shares (30cm) + 1 share (10cm) = 40cm ✓.",
    },
    misconceptionCategory: "OPERATION_SELECTION",
  },
  "mr02-nth-term": {
    model: {
      whatToNotice: "A sequence increases (or decreases) by the same amount each time. That fixed amount is the key to finding any term without listing them all.",
      relationship: "nth term = first term + (n − 1) × common difference.",
      scenario: "A sequence begins 5, 12, 19, 26, ... What is the 7th term?",
      reasoning: [
        "Find the common difference: 12 − 5 = 7.",
        "The 7th term is the 1st term plus 6 lots of the difference: 5 + (7 − 1) × 7.",
        "5 + 42 = 47.",
      ],
      answer: "47",
      verification: "List forward to check: 5, 12, 19, 26, 33, 40, 47. The 7th term is 47 ✓.",
    },
    misconceptionCategory: "PROCEDURAL_SEQUENCE_ERROR",
  },
  "mr02-sequence-rule": {
    model: {
      whatToNotice: "A rule is given as two chained steps (e.g. multiply, then add). Finding an OUTPUT applies the rule forwards; finding an INPUT means reversing both steps, in reverse order.",
      relationship: "Forwards: apply each step in the order given. Backwards: undo each step with its inverse, in the OPPOSITE order, undoing the last step first.",
      scenario: "A rule is: multiply by 8, then add 7. What is the output when the input is 11? And if the output is 79, what was the input?",
      reasoning: [
        "Forwards: 11 × 8 = 88, then 88 + 7 = 95.",
        "Backwards from 79: undo the last step first (subtract 7): 79 − 7 = 72.",
        "Then undo the first step (divide by 8): 72 ÷ 8 = 9.",
      ],
      answer: "Forwards: 95. Backwards: 9.",
      verification: "Check the backwards answer forwards: 9 × 8 = 72, 72 + 7 = 79 ✓.",
    },
    misconceptionCategory: "PROCEDURAL_SEQUENCE_ERROR",
  },
  "mr02-substitution": {
    model: {
      whatToNotice: "Two relationships link three unknowns together, and both must be used. Using only one leaves the problem impossible to solve.",
      relationship: "Substitute both given relationships into the total equation so everything is written in terms of one unknown, then solve.",
      scenario: "B = 3A, and 2C = A. If A + B + C = 27, find A and C.",
      reasoning: [
        "Substitute B = 3A and C = A ÷ 2 into the total: A + 3A + (A ÷ 2) = 27.",
        "Combine: 4.5A = 27, so A = 6.",
        "Then C = A ÷ 2 = 3.",
      ],
      answer: "A=6, C=3",
      verification: "Check: B = 3×6 = 18. A + B + C = 6 + 18 + 3 = 27 ✓.",
    },
    misconceptionCategory: "INCOMPLETE_REASONING",
  },
  "mr02-sum-difference": {
    model: {
      whatToNotice: "Two amounts are not equal: one is stated to be a fixed amount more than the other, so splitting the total evenly would be wrong.",
      relationship: "If the smaller amount is x, the larger is x + (the stated difference); add these together to equal the total, then solve for x.",
      scenario: "Priya has £8 more than Sam. Together they have £32. How much does Sam have?",
      reasoning: [
        "Let Sam's amount be x, so Priya's is x + 8.",
        "x + (x + 8) = 32.",
        "2x = 24, so x = 12.",
      ],
      answer: "£12",
      verification: "Check: Sam £12, Priya £12 + £8 = £20. £12 + £20 = £32 ✓.",
    },
    misconceptionCategory: "OPERATION_SELECTION",
  },
  "mr03-angle-sum": {
    model: {
      whatToNotice: "A shape's angles always add up to a fixed total (180° for a triangle, 360° for a quadrilateral). One angle is unknown, and the rest are given.",
      relationship: "Add the known angles, then subtract that sum from the shape's fixed total to find the missing angle.",
      scenario: "A triangle has angles of 55° and 75°. What is the third angle?",
      reasoning: [
        "A triangle's angles always add up to 180°.",
        "Add the known angles: 55° + 75° = 130°.",
        "Subtract from the total: 180° − 130° = 50°.",
      ],
      answer: "50°",
      verification: "Add all three angles back: 55° + 75° + 50° = 180° ✓.",
    },
    misconceptionCategory: "STRUCTURAL_MISAPPLICATION",
  },
  "mr03-classify": {
    model: {
      whatToNotice: "A triangle's three angles determine its type, but only checking one angle, or assuming from appearance, can give the wrong answer.",
      relationship: "Equal angles mean equal opposite sides: check ALL three angles for equality (or a right angle) before deciding the type.",
      scenario: "A triangle has angles of 70°, 70° and 40°. Is it isosceles, equilateral or scalene?",
      reasoning: [
        "Check all three angles: 70°, 70°, 40°.",
        "Exactly two angles are equal (70° and 70°), and the third is different.",
        "Equal angles mean equal opposite sides, so this triangle is isosceles.",
      ],
      answer: "Isosceles",
      verification: "Check the total: 70° + 70° + 40° = 180° ✓, confirming it's a genuine triangle.",
    },
    misconceptionCategory: "INCOMPLETE_REASONING",
  },
  "mr03-coordinate": {
    model: {
      whatToNotice: "A coordinate transformation follows one exact rule. Which coordinate changes, and how, depends on exactly which transformation is named.",
      relationship: "Reflecting in the x-axis keeps x the same and reverses the sign of y. Reflecting in the y-axis keeps y the same and reverses the sign of x.",
      scenario: "Point D is at (6, -3). It is reflected in the x-axis. What are the new coordinates?",
      reasoning: [
        "Reflecting in the x-axis keeps the x-coordinate the same.",
        "It reverses the sign of the y-coordinate: -3 becomes 3.",
        "The new coordinates are (6, 3).",
      ],
      answer: "(6, 3)",
      verification: "Reflecting (6, 3) back in the x-axis should return the original point: (6, -3) ✓.",
    },
    misconceptionCategory: "STRUCTURAL_MISAPPLICATION",
  },
  "mr03-mixed-perimeter": {
    model: {
      whatToNotice: "A rectangle's area and one side are given, but the perimeter needs BOTH sides, so the missing side must be found first.",
      relationship: "Missing side = area ÷ known side, THEN perimeter = 2 × (both sides added together).",
      scenario: "A rectangular patio has an area of 32 m² and one side is 4m. What is the perimeter?",
      reasoning: [
        "Find the missing side: 32 ÷ 4 = 8m.",
        "Add both sides: 4m + 8m = 12m.",
        "Perimeter = 2 × 12m = 24m.",
      ],
      answer: "24m",
      verification: "Check the area with both sides: 4m × 8m = 32m² ✓.",
    },
    misconceptionCategory: "MISREAD_QUANTITY",
  },
  /**
   * Programme Increment 020, Wave 1 (migration 222) — the family's own
   * "extend beyond the lesson" teaching moment. The new Learn lesson page
   * (app/learning-intelligence/learn/mathematics/compound-shapes/page.tsx)
   * teaches this family's AREA method end-to-end; this entry deliberately
   * teaches the family's OTHER real skill (perimeter, requiring the two
   * "hidden" sides to be inferred first) rather than duplicating the
   * lesson's own worked example, matching this file's own "never the
   * current question's own numbers" discipline with a genuinely different
   * scenario from every one of the 8 real rows.
   */
  "mr03-compound-area-perimeter": {
    model: {
      whatToNotice: "A compound (L-shaped) figure has 6 sides in total, but a question may only label 4 of them -- the other 2 must be worked out before the perimeter can be found.",
      relationship: "Opposite horizontal sides must add up to the same total, and opposite vertical sides must add up to the same total -- use that to find each missing side before adding all 6 together.",
      scenario: "An L-shaped lawn has 4 labelled sides: 10m, 4m, 2m and 6m (going around). What is the perimeter?",
      reasoning: [
        "The missing horizontal side = 10m − 6m = 4m (the top and the step must add up to the bottom's 10m).",
        "The missing vertical side = 4m + 2m = 6m (the two right-hand sides must add up to the full left side).",
        "Add all 6 sides: 10 + 4 + 4 + 2 + 6 + 6 = 32m.",
      ],
      answer: "32m",
      verification: "Redraw the shape and count all 6 sides once, checking that the horizontal sides on one side of the shape add up to the same total as the horizontal sides on the other.",
    },
    misconceptionCategory: "INCOMPLETE_REASONING",
  },
  "mr04-compound-percentage": {
    model: {
      whatToNotice: "Two percentage changes happen one after another. The second change applies to the NEW value, not the original.",
      relationship: "Apply the first percentage change to the original value, then apply the second percentage change to that NEW result.",
      scenario: "A laptop costs £400. The price is increased by 15%, then later decreased by 20%. What is the final price?",
      reasoning: [
        "Increase: £400 × 1.15 = £460.",
        "Decrease: £460 × 0.80 = £368.",
      ],
      answer: "£368",
      verification: "Applying both changes in one go: £400 × 1.15 × 0.80 = £368 ✓, same result either way.",
    },
    misconceptionCategory: "PROCEDURAL_SEQUENCE_ERROR",
  },
  "mr04-elapsed-time": {
    model: {
      whatToNotice: "Several time stages are added in a row, and the running total of minutes can pass 60 partway through and must be carried into hours.",
      relationship: "Add all the minutes together first, convert every full 60 minutes into hours, then add what's left to the start time.",
      scenario: "A swimming lesson starts at 13:20. Warm-up takes 15 minutes, the main session 40 minutes, and cool-down 10 minutes. What time does it finish?",
      reasoning: [
        "Add all the minutes: 15 + 40 + 10 = 65 minutes.",
        "Convert: 65 minutes = 1 hour 5 minutes.",
        "Add to the start time: 13:20 + 1:05 = 14:25.",
      ],
      answer: "14:25",
      verification: "Add the stages one at a time instead: 13:20 + 15 = 13:35, + 40 = 14:15, + 10 = 14:25 ✓.",
    },
    misconceptionCategory: "UNIT_OR_CONVERSION_ERROR",
  },
  "mr04-far-percent": {
    model: {
      whatToNotice: "One item's before-and-after price gives a PROPORTION (a fraction), not a fixed amount, and that same proportion applies to a different item's price.",
      relationship: "Find the fraction the first price was reduced to (after price ÷ before price), then multiply the second item's original price by that same fraction.",
      scenario: "A toy's price dropped from £30 to £24 in a sale. Using the same proportional reduction, what would a £90 bike cost?",
      reasoning: [
        "Find the fraction: £24 ÷ £30 = 0.8.",
        "Apply the same fraction to the bike: £90 × 0.8 = £72.",
      ],
      answer: "£72",
      verification: "Check the fraction is consistent: £24/£30 = 4/5, and £90 × 4/5 = £72 ✓.",
    },
    misconceptionCategory: "STRUCTURAL_MISAPPLICATION",
  },
  "mr04-far-recipe": {
    model: {
      whatToNotice: "A recipe amount scales with the number of people. This is a MULTIPLYING relationship, not an adding one.",
      relationship: "Find the amount for ONE person first (divide), then multiply by however many people are actually needed.",
      scenario: "A recipe for 3 people uses 90ml of milk. How much milk is needed for 7 people?",
      reasoning: [
        "Find the amount per person: 90ml ÷ 3 = 30ml.",
        "Scale up to 7 people: 30ml × 7 = 210ml.",
      ],
      answer: "210ml",
      verification: "Check the ratio is equivalent: 3 people : 90ml = 7 people : 210ml (both simplify to 1 : 30) ✓.",
    },
    misconceptionCategory: "STRUCTURAL_MISAPPLICATION",
  },
  "mr04-mixed-divisibility": {
    model: {
      whatToNotice: "A number must satisfy TWO conditions at once (a range and a remainder rule). Checking only one of them is not enough.",
      relationship: "List the candidates that satisfy the simpler exact-divisibility condition within the range first (there are only a few), then test each one against the remainder condition.",
      scenario: "A choir has more than 40 but fewer than 60 members. Split into groups of 6, there are none left over. Split into groups of 9, there are 3 left over. How many members are there?",
      reasoning: [
        "List multiples of 6 between 40 and 60: 42, 48, 54.",
        "Check each against the groups-of-9 condition (remainder 3): 42÷9 = 4 r6 (no); 48÷9 = 5 r3 (yes); 54÷9 = 6 r0 (no).",
        "Only 48 satisfies both conditions.",
      ],
      answer: "48",
      verification: "Check both conditions directly: 48 ÷ 6 = 8 exactly ✓, 48 ÷ 9 = 5 remainder 3 ✓.",
    },
    misconceptionCategory: "PROCEDURAL_SEQUENCE_ERROR",
  },
  "mr05-constrained-multiple": {
    model: {
      whatToNotice: "The answer must be a multiple of BOTH given numbers, and must also satisfy a boundary condition. Finding a multiple of just one number is not enough.",
      relationship: "Find the lowest common multiple (LCM) of the two numbers first, then check it (or the next suitable multiple of the LCM) against the boundary condition.",
      scenario: "What is the smallest number that is a multiple of both 5 and 6, and is greater than 20?",
      reasoning: [
        "Find the LCM of 5 and 6: 30 (5 × 6, since they share no common factor).",
        "Check the boundary: is 30 greater than 20? Yes.",
        "30 is the smallest qualifying multiple.",
      ],
      answer: "30",
      verification: "Check divisibility directly: 30 ÷ 5 = 6 exactly ✓, 30 ÷ 6 = 5 exactly ✓.",
    },
    misconceptionCategory: "PROCEDURAL_SEQUENCE_ERROR",
  },
  "mr05-factors-primes": {
    model: {
      whatToNotice: "Factors of a number come in PAIRS that multiply to give that number. Finding them all means checking every pair systematically, not guessing.",
      relationship: "Test each whole number from 1 upwards to see if it divides exactly; each one that works gives you a pair of factors at once.",
      scenario: "How many factors does 16 have?",
      reasoning: [
        "Test each number from 1 up: 1×16, 2×8, 4×4.",
        "List the factors found: 1, 2, 4, 8, 16.",
        "Count them: 5 factors.",
      ],
      answer: "5",
      verification: "Check each pair multiplies back correctly: 1×16=16 ✓, 2×8=16 ✓, 4×4=16 ✓.",
    },
    misconceptionCategory: "STRUCTURAL_MISAPPLICATION",
  },
  "mr05-number-property": {
    model: {
      whatToNotice: "A number property (like being prime or square) has an exact test. A number that merely looks related (e.g. odd) is not automatically the property being asked about.",
      relationship: "Apply the exact definition of the property directly to the number, rather than a related but different rule of thumb.",
      scenario: "Is the average of 4 and 14 a square number?",
      reasoning: [
        "Compute the average first: (4 + 14) ÷ 2 = 9.",
        "Test whether 9 is a square number: 3 × 3 = 9.",
        "9 is a square number, so the answer is True.",
      ],
      answer: "True",
      verification: "Confirm the square root is a whole number: √9 = 3 ✓.",
    },
    misconceptionCategory: "STRUCTURAL_MISAPPLICATION",
    // This family's live rows have no stored workingSteps at all (checked
    // fresh, all 5 return null) — per the Guided-reveal contract (Part 3B),
    // reveal only ever shows a family's own real steps, never a second
    // authored copy, so this family genuinely cannot support step reveal.
    // Set to 0 so no reveal control renders even if a future row happens
    // to gain workingSteps without this being revisited.
    maxGuidedRevealSteps: 0,
  },
  "precision-dec": {
    model: {
      whatToNotice: "A division does not divide exactly. The answer must be ROUNDED to the number of decimal places asked for, not simply cut off.",
      relationship: "Work out one extra decimal place beyond what's needed, then round properly using that extra digit (5 or more rounds up).",
      scenario: "Calculate 17 ÷ 6, giving your answer to 2 decimal places.",
      reasoning: [
        "Divide to one extra decimal place: 17 ÷ 6 = 2.833...",
        "Look at the third decimal digit to round the second: it's 3, so round down.",
        "17 ÷ 6 = 2.83 to 2 decimal places.",
      ],
      answer: "2.83",
      verification: "Multiply back approximately: 2.83 × 6 = 16.98, close to 17, confirming the rounding is reasonable.",
    },
    misconceptionCategory: "PROCEDURAL_SEQUENCE_ERROR",
  },
  "precision-frac": {
    model: {
      whatToNotice: "The question asks for an EXACT fraction, not a rounded decimal. Amounts that don't divide evenly must be expressed as a fraction, not approximated.",
      relationship: "Write the division as a fraction directly (total over the number of parts), then simplify or convert it to a mixed number.",
      scenario: "A 16m rope is cut into 9 equal pieces. What is the length of each piece, as an exact fraction of a metre, in its simplest form?",
      reasoning: [
        "Write the division as a fraction: 16/9 m.",
        "This doesn't simplify further, so convert to a mixed number: 16 ÷ 9 = 1 remainder 7.",
        "16/9 = 1 7/9 m.",
      ],
      answer: "1 7/9",
      verification: "Check by multiplying back: 1 7/9 × 9 = 9 + 7 = 16 ✓.",
    },
    misconceptionCategory: "PRECISION_INSTRUCTION_IGNORED",
  },
};

export function getMathsTeachingContent(familyId?: string | null): MathsFamilyTeachingContent | undefined {
  if (!familyId) return undefined;
  return MATHS_FAMILY_TEACHING_CONTENT[familyId];
}

/**
 * CSSE Completion Programme, Phase B Founder review readiness — pure
 * extraction of the exact cap logic app/learning-intelligence/practice/
 * [area]/page.tsx's MathsActivity already applies inline, so the
 * Mathematics Teaching Review interface (app/admin-beta/review/page.tsx)
 * can show a family's real, live "maximum Guided reveal boundary" without
 * a second, potentially-drifting copy of this rule.
 */
export function effectiveGuidedRevealStepCount(workingStepsLength: number, cap?: number): number {
  return cap === undefined ? workingStepsLength : Math.min(workingStepsLength, cap);
}
