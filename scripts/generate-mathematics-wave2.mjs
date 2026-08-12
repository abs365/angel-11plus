#!/usr/bin/env node
/**
 * Educational Increment 005B — Mathematics Wave 2 Content Factory.
 * Same discipline as Wave 1 (generate-mathematics-wave1.mjs): every
 * answer computed in code from the item's own parameters, enumerated
 * (not random) parameter sets, validated before authoring. Four NEW
 * structures, not values-variation of Wave 1's families:
 *
 *   mr02-compare        (QT-MR-06, MR-02) — COMPARISON: evaluate two
 *     linear expressions at a given n and judge Greater/Less/Equal.
 *     Genuinely distinct reasoning from Wave 1's mr02-sequence-rule
 *     (apply-a-rule) and mr02-substitution (solve-a-system).
 *
 *   mr03-classify        (QT-MR-07, MR-03) — CLASSIFICATION: given a
 *     triangle's three angles, classify it as equilateral/isosceles/
 *     scalene by angle-equality (equal angles -> equal opposite sides).
 *     Genuinely distinct from Wave 1's mr03-angle-sum (compute-the-
 *     missing-angle) — this asks what KIND of triangle, not a value.
 *
 *   mr04-far-percent      (QT-MR-04, MR-04) — FAR_TRANSFER: two paired
 *     before/after values establish a proportional relationship (a
 *     price reduction) with NO mention of "percentage," "fraction," or
 *     "ratio" anywhere in the prompt; the learner must recognise that
 *     the same proportional relationship applies to a second value and
 *     derive it themselves. Classification justified in the migration
 *     comment, not asserted here alone.
 *
 *   mr04-mixed-divisibility (QT-MR-13, primary MR-04 + supporting MR-05)
 *     — MIXED_TRANSFER: a constraint-satisfaction word problem (a
 *     population fits two simultaneous grouping conditions) that
 *     genuinely requires MR-04's multi-step interpretation to set up
 *     the two conditions AND MR-05's number-property/divisibility
 *     reasoning to search the valid range — not incidental arithmetic.
 *
 * Run: node scripts/generate-mathematics-wave2.mjs
 */
import { writeFileSync } from "node:fs";

// ============================================================
// Family generators
// ============================================================

function mr02Compare({ id, n, exprA, exprB }) {
  const valA = exprA.fn(n);
  const valB = exprB.fn(n);
  const answer = valA === valB ? "Equal" : valA > valB ? "Greater" : "Less";
  return {
    id,
    family: "mr02-compare",
    structure: "COMPARISON",
    transferClass: "ROUTINE",
    primaryCompetency: "MR-02",
    supportingCompetencies: [],
    question: `When n = ${n}, is ${exprA.label} greater than, less than, or equal to ${exprB.label}? Answer Greater, Less, or Equal.`,
    answer,
    workingSteps: [
      `${exprA.label} at n=${n}: ${exprA.working(n)} = ${valA}`,
      `${exprB.label} at n=${n}: ${exprB.working(n)} = ${valB}`,
      `${valA} ${answer === "Equal" ? "=" : answer === "Greater" ? ">" : "<"} ${valB}, so the answer is ${answer}`,
    ],
    misconception: "Evaluating only one expression, or evaluating both but comparing them the wrong way round.",
  };
}

function mr03Classify({ id, angles }) {
  const sum = angles.reduce((a, b) => a + b, 0);
  if (sum !== 180) throw new Error(`${id}: angles do not sum to 180 (got ${sum})`);
  const uniqueCount = new Set(angles).size;
  const answer = uniqueCount === 1 ? "Equilateral" : uniqueCount === 2 ? "Isosceles" : "Scalene";
  return {
    id,
    family: "mr03-classify",
    structure: "CLASSIFICATION",
    transferClass: "ROUTINE",
    primaryCompetency: "MR-03",
    supportingCompetencies: [],
    question: `A triangle has angles of ${angles.map((a) => a + "°").join(", ")}. Is it isosceles, equilateral or scalene?`,
    answer,
    workingSteps: [
      `Equal angles mean equal opposite sides`,
      uniqueCount === 1
        ? "All three angles are equal, so all three sides are equal: equilateral"
        : uniqueCount === 2
        ? "Exactly two angles are equal, so exactly two sides are equal: isosceles"
        : "All three angles are different, so all three sides are different: scalene",
    ],
    misconception: "Assuming a triangle with one right or notably large angle must be scalene without checking whether two angles are actually equal.",
  };
}

function mr04FarPercent({ id, beforeA, afterA, beforeB }) {
  const ratio = afterA / beforeA;
  const afterB = beforeB * ratio;
  if (!Number.isInteger(afterB)) throw new Error(`${id}: afterB is not an integer (${afterB})`);
  return {
    id,
    family: "mr04-far-percent",
    structure: "CONTEXTUAL PROBLEM SOLVING",
    transferClass: "FAR_TRANSFER",
    primaryCompetency: "MR-04",
    supportingCompetencies: ["MR-01"],
    question: `A shop reduces every price by the same amount, proportionally. A book that cost £${beforeA} now costs £${afterA}. Using the same reduction, what is the new price of a jacket that originally cost £${beforeB}?`,
    answer: `£${afterB}`,
    workingSteps: [
      `The book's new price is £${afterA} out of an original £${beforeA}. Every price keeps the same fraction of its original value`,
      `£${afterA} out of £${beforeA} is the same fraction as £${afterB} out of £${beforeB}`,
      `£${beforeB} × (${afterA}/${beforeA}) = £${afterB}`,
    ],
    misconception: "Subtracting the same fixed amount (£" + (beforeA - afterA) + ") from the second price instead of applying the same proportional reduction. The reduction is a fraction of the price, not a fixed amount.",
  };
}

function mr04MixedDivisibility({ id, answer, groupA, remainderA, groupB, rangeLow, rangeHigh, context, unit }) {
  // Verify uniqueness: exactly one multiple of groupB in (rangeLow, rangeHigh) with the stated remainder mod groupA.
  const candidates = [];
  for (let n = rangeLow + 1; n < rangeHigh; n++) {
    if (n % groupB === 0 && n % groupA === remainderA) candidates.push(n);
  }
  if (candidates.length !== 1 || candidates[0] !== answer) {
    throw new Error(`${id}: expected unique answer ${answer}, found candidates [${candidates.join(",")}]`);
  }
  return {
    id,
    family: "mr04-mixed-divisibility",
    structure: "CONSTRAINT SATISFACTION",
    transferClass: "MIXED_TRANSFER",
    primaryCompetency: "MR-04",
    supportingCompetencies: ["MR-05"],
    question: `${context} has more than ${rangeLow} but fewer than ${rangeHigh} ${unit}. If they ${
      remainderA === 0 ? `stand in rows of ${groupA}, every row is full` : `are put into groups of ${groupA}, there ${remainderA === 1 ? "is" : "are"} ${remainderA} left over`
    }. If they ${groupB && "are split into groups of " + groupB + ", there are none left over"}. How many are there?`,
    answer: String(answer),
    workingSteps: [
      `Multiples of ${groupB} between ${rangeLow} and ${rangeHigh}: ${candidates.length >= 1 ? "check each against the other condition" : ""}`,
      `Only ${answer} also ${remainderA === 0 ? `divides exactly by ${groupA}` : `leaves ${remainderA} over when divided by ${groupA}`}`,
    ],
    misconception: "Finding a number that satisfies only one of the two conditions and stopping there, instead of checking both conditions together.",
  };
}

// ============================================================
// Wave 2 parameter sets
// ============================================================

const items = [];

const EXPR = {
  a1: { label: "3n + 5", fn: (n) => 3 * n + 5, working: (n) => `3×${n} + 5` },
  b1: { label: "5n − 3", fn: (n) => 5 * n - 3, working: (n) => `5×${n} − 3` },
  a2: { label: "2n + 9", fn: (n) => 2 * n + 9, working: (n) => `2×${n} + 9` },
  b2: { label: "4n + 1", fn: (n) => 4 * n + 1, working: (n) => `4×${n} + 1` },
  a3: { label: "2n + 1", fn: (n) => 2 * n + 1, working: (n) => `2×${n} + 1` },
  b3: { label: "4n − 5", fn: (n) => 4 * n - 5, working: (n) => `4×${n} − 5` },
};
items.push(mr02Compare({ id: "mr02-cmp-01", n: 4, exprA: EXPR.a1, exprB: EXPR.b1 }));
items.push(mr02Compare({ id: "mr02-cmp-02", n: 3, exprA: EXPR.a2, exprB: EXPR.b2 }));
items.push(mr02Compare({ id: "mr02-cmp-03", n: 5, exprA: EXPR.a3, exprB: EXPR.b3 }));

items.push(mr03Classify({ id: "mr03-cls-01", angles: [60, 60, 60] }));
items.push(mr03Classify({ id: "mr03-cls-02", angles: [90, 45, 45] }));
items.push(mr03Classify({ id: "mr03-cls-03", angles: [80, 60, 40] }));

items.push(mr04FarPercent({ id: "mr04-far-01", beforeA: 20, afterA: 15, beforeB: 60 }));
items.push(mr04FarPercent({ id: "mr04-far-02", beforeA: 50, afterA: 40, beforeB: 75 }));
items.push(mr04FarPercent({ id: "mr04-far-03", beforeA: 16, afterA: 10, beforeB: 64 }));

items.push(
  mr04MixedDivisibility({
    id: "mr04-mix-01",
    answer: 95,
    groupA: 6,
    remainderA: 5,
    groupB: 5,
    rangeLow: 90,
    rangeHigh: 100,
    context: "A school", unit: "students",
  })
);
items.push(
  mr04MixedDivisibility({
    id: "mr04-mix-02",
    answer: 133,
    groupA: 4,
    remainderA: 1,
    groupB: 7,
    rangeLow: 130,
    rangeHigh: 150,
    context: "A youth club", unit: "members",
  })
);
items.push(
  mr04MixedDivisibility({
    id: "mr04-mix-03",
    answer: 152,
    groupA: 6,
    remainderA: 2,
    groupB: 8,
    rangeLow: 145,
    rangeHigh: 160,
    context: "A choir", unit: "singers",
  })
);

// ============================================================
// Validation
// ============================================================

let failed = false;
const seenIds = new Set();
const seenQuestions = new Set();
const byFamily = new Map();
const BINARY_LIKE_FAMILIES = new Set(["mr02-compare", "mr03-classify"]);

for (const item of items) {
  if (seenIds.has(item.id)) {
    console.error(`FAIL: duplicate id "${item.id}"`);
    failed = true;
  }
  seenIds.add(item.id);
  if (seenQuestions.has(item.question)) {
    console.error(`FAIL: duplicate question text for "${item.id}"`);
    failed = true;
  }
  seenQuestions.add(item.question);
  if (!item.answer) {
    console.error(`FAIL: "${item.id}" has no answer`);
    failed = true;
  }
  if (!byFamily.has(item.family)) byFamily.set(item.family, []);
  byFamily.get(item.family).push(item);
}

for (const [family, members] of byFamily) {
  if (BINARY_LIKE_FAMILIES.has(family)) continue;
  const answers = new Set();
  for (const m of members) {
    if (answers.has(m.answer)) {
      console.error(`FAIL: family "${family}" has two variants sharing the answer "${m.answer}" ("${m.id}")`);
      failed = true;
    }
    answers.add(m.answer);
  }
}

// mr02-compare / mr03-classify: still must not have ALL THREE variants share the same answer (would mean no real spread was tested)
for (const family of BINARY_LIKE_FAMILIES) {
  const members = byFamily.get(family) || [];
  const distinctAnswers = new Set(members.map((m) => m.answer));
  if (distinctAnswers.size < 2) {
    console.error(`FAIL: family "${family}" has no answer spread (all variants: ${[...distinctAnswers]})`);
    failed = true;
  }
}

if (failed) {
  console.error(`\nWave 2 generation: FAIL`);
  process.exit(1);
}

console.log(`Wave 2 generation: PASS`);
console.log(`  ${items.length} items across ${byFamily.size} families`);
for (const [family, members] of byFamily) {
  console.log(`  - ${family} (${members[0].structure}, ${members[0].transferClass}): ${members.length} items`);
}

writeFileSync(
  "C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin/135f4c11-3911-48ce-b2ad-471be84f3f8b/scratchpad/wave2_items.json",
  JSON.stringify(items, null, 2)
);
console.log(`\nWritten to scratchpad/wave2_items.json for review.`);
