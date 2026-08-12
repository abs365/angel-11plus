import { writeFileSync } from "node:fs";

// ============================================================
// Educational Increment 006B — Mathematics Wave 3B.
// 10 new families targeting genuinely under-supplied Question Types
// (QT-MR-03, 09, 10, 12, and second structures under QT-MR-04/05/06/07/11/13),
// covering measurement, data interpretation, time, averages, sequences,
// money-based algebra, angle ratios, factors/primes, compound percentage,
// and best-value comparison — the topic areas the Founder named, mapped
// onto the REAL competency model (MR-01..MR-06), not invented codes.
// Every answer is computed from parameters in code, never hand-typed.
// ============================================================

const items = [];
const rejectedVariants = [];

function assertNoDash(text, ctx) {
  if (/[—–]/.test(text)) throw new Error(`${ctx}: em/en dash found — "${text}"`);
}

// UK currency convention: whole pounds show with no decimals, anything with
// pence shows exactly 2 decimal places (never a bare single decimal like "£1.2").
function formatMoney(value) {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(2);
}

// ---------- 1. mr01-measurement-conversion (QT-MR-03, MR-01) ----------
function mr01MeasurementConversion({ id, aVal, aUnit, bVal, bUnit, targetUnit, context }) {
  const scaleOf = { m: 1, cm: 0.01, kg: 1, g: 0.001, l: 1, ml: 0.001 };
  const totalBase = aVal * scaleOf[aUnit] + bVal * scaleOf[bUnit];
  const totalInTarget = totalBase / scaleOf[targetUnit];
  const rounded = Math.round(totalInTarget * 100) / 100;
  const answer = `${rounded}${targetUnit}`;
  const question = `${context.prefix} is ${aVal}${aUnit}. ${context.second} is ${bVal}${bUnit}. What is the total ${context.noun} in ${targetUnit}?`;
  assertNoDash(question, id);
  return {
    id,
    family: "mr01-measurement-conversion",
    primaryCompetency: "MR-01",
    supportingCompetencies: [],
    structure: "UNIT CONVERSION THEN ARITHMETIC",
    transferClass: "ROUTINE",
    question,
    answer,
    workingSteps: [
      `Convert both amounts to the same unit (${targetUnit})`,
      `${aVal}${aUnit} + ${bVal}${bUnit} = ${rounded}${targetUnit}`,
    ],
    misconception: `Adding the two numbers directly without converting to the same unit first (e.g. ${aVal} + ${bVal}).`,
  };
}

items.push(
  mr01MeasurementConversion({
    id: "mr01-conv-01", aVal: 3.4, aUnit: "m", bVal: 85, bUnit: "cm", targetUnit: "m",
    context: { prefix: "A ribbon", second: "A second ribbon", noun: "length" },
  }),
  mr01MeasurementConversion({
    id: "mr01-conv-02", aVal: 2.15, aUnit: "m", bVal: 40, bUnit: "cm", targetUnit: "m",
    context: { prefix: "A piece of rope", second: "A second piece", noun: "length" },
  }),
  mr01MeasurementConversion({
    id: "mr01-conv-03", aVal: 1.2, aUnit: "kg", bVal: 350, bUnit: "g", targetUnit: "kg",
    context: { prefix: "A bag of flour", second: "A second bag", noun: "mass" },
  }),
  mr01MeasurementConversion({
    id: "mr01-conv-04", aVal: 1.75, aUnit: "l", bVal: 400, bUnit: "ml", targetUnit: "l",
    context: { prefix: "A bottle of juice", second: "A second bottle", noun: "volume" },
  })
);

// ---------- 2. mr01-data-table (QT-MR-09, MR-01 primary, MR-04 supporting) ----------
function mr01DataTable({ id, title, rows, question, computeAnswer, misconception }) {
  const tableText = rows.map(([label, value]) => `${label}: ${value}`).join(", ");
  const fullQuestion = `${title}. ${tableText}. ${question}`;
  assertNoDash(fullQuestion, id);
  const answer = computeAnswer(rows);
  return {
    id,
    family: "mr01-data-table",
    primaryCompetency: "MR-01",
    supportingCompetencies: ["MR-04"],
    structure: "TABLE READING THEN ARITHMETIC",
    transferClass: "NEAR_TRANSFER",
    question: fullQuestion,
    answer: String(answer),
    workingSteps: ["Read the correct values from the table", `Compute the answer: ${answer}`],
    misconception,
  };
}

items.push(
  mr01DataTable({
    id: "mr01-data-01",
    title: "Umbrellas sold by day",
    rows: [["Mon", 12], ["Tue", 18], ["Wed", 9], ["Thu", 15], ["Fri", 21]],
    question: "What is the total number sold from Monday to Wednesday?",
    computeAnswer: (r) => r[0][1] + r[1][1] + r[2][1],
    misconception: "Adding all five values in the table instead of only the days actually asked for.",
  }),
  mr01DataTable({
    id: "mr01-data-02",
    title: "Umbrellas sold by day",
    rows: [["Mon", 12], ["Tue", 18], ["Wed", 9], ["Thu", 15], ["Fri", 21]],
    question: "How many more were sold on Friday than on Wednesday?",
    computeAnswer: (r) => r[4][1] - r[2][1],
    misconception: "Subtracting in the wrong order, or comparing the wrong two days.",
  }),
  mr01DataTable({
    id: "mr01-data-03",
    title: "Books read this month",
    rows: [["Amy", 7], ["Ben", 4], ["Cara", 9], ["Dan", 6]],
    question: "What is the total read by Amy and Cara?",
    computeAnswer: (r) => r[0][1] + r[2][1],
    misconception: "Including a child not named in the question.",
  }),
  mr01DataTable({
    id: "mr01-data-04",
    title: "Books read this month",
    rows: [["Amy", 7], ["Ben", 4], ["Cara", 9], ["Dan", 6]],
    question: "How many fewer did Ben read than Cara?",
    computeAnswer: (r) => r[2][1] - r[1][1],
    misconception: "Subtracting in the wrong order and giving a negative or reversed result.",
  }),
  mr01DataTable({
    id: "mr01-data-05",
    title: "Daily temperature in degrees Celsius",
    rows: [["Mon", 14], ["Tue", 17], ["Wed", 12], ["Thu", 19], ["Fri", 15]],
    question: "What is the range (the difference between the highest and lowest values)?",
    computeAnswer: (r) => Math.max(...r.map((x) => x[1])) - Math.min(...r.map((x) => x[1])),
    misconception: "Finding the highest or lowest value alone instead of the difference between them.",
  })
);

// ---------- 3. mr04-elapsed-time (QT-MR-10, MR-04 primary, MR-01 supporting) ----------
function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
function minutesToTime(total) {
  const t = ((total % 1440) + 1440) % 1440;
  const h = Math.floor(t / 60);
  const m = t % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function mr04ElapsedTime({ id, context, start, durations, questionSuffix }) {
  const finishMinutes = durations.reduce((acc, d) => acc + d, timeToMinutes(start));
  const answer = minutesToTime(finishMinutes);
  const question = `${context} starts at ${start}. ${questionSuffix}`;
  assertNoDash(question, id);
  return {
    id,
    family: "mr04-elapsed-time",
    primaryCompetency: "MR-04",
    supportingCompetencies: ["MR-01"],
    structure: "MULTI-STEP TIME ADDITION",
    transferClass: "MIXED_TRANSFER",
    question,
    answer,
    workingSteps: [
      `Add each stage in turn, carrying minutes into hours where needed`,
      `${start} + ${durations.join(" + ")} minutes = ${answer}`,
    ],
    misconception: "Adding the minutes and hours separately without carrying over when the minutes pass 60.",
  };
}

items.push(
  mr04ElapsedTime({
    id: "mr04-time-01", context: "A football match",
    start: "14:00", durations: [45, 15, 45],
    questionSuffix: "The first half lasts 45 minutes, followed by a 15 minute half-time break, followed by a second half of 45 minutes. What time does the match finish?",
  }),
  mr04ElapsedTime({
    id: "mr04-time-02", context: "A workshop",
    start: "10:30", durations: [50, 20, 40],
    questionSuffix: "The first session lasts 50 minutes, followed by a 20 minute break, followed by a second session of 40 minutes. What time does the workshop finish?",
  }),
  mr04ElapsedTime({
    id: "mr04-time-03", context: "A train journey",
    start: "07:55", durations: [95, 20, 55],
    questionSuffix: "The first leg takes 1 hour 35 minutes, followed by a 20 minute stop, followed by a second leg of 55 minutes. What time does the train arrive?",
  }),
  mr04ElapsedTime({
    id: "mr04-time-04", context: "An exam",
    start: "09:15", durations: [80, 10, 70],
    questionSuffix: "The first paper lasts 1 hour 20 minutes, followed by a 10 minute break, followed by a second paper of 1 hour 10 minutes. What time does the exam finish?",
  }),
  mr04ElapsedTime({
    id: "mr04-time-05", context: "A baking recipe",
    start: "15:40", durations: [25, 55, 30],
    questionSuffix: "Preparation takes 25 minutes, followed by 55 minutes of baking, followed by 30 minutes of cooling. What time is the recipe finished?",
  })
);

// ---------- 4. mr01-average-mean (QT-MR-12, MR-01) ----------
function mr01AverageMean({ id, context, values, unit }) {
  const sum = values.reduce((a, b) => a + b, 0);
  if (sum % values.length !== 0) throw new Error(`${id}: mean is not an integer`);
  const mean = sum / values.length;
  const answer = unit ? `${unit}${mean}` : String(mean);
  const question = `${context} were ${values.map((v) => (unit ? `${unit}${v}` : v)).join(", ")}. What was the mean?`;
  assertNoDash(question, id);
  return {
    id,
    family: "mr01-average-mean",
    primaryCompetency: "MR-01",
    supportingCompetencies: [],
    structure: "MEAN CALCULATION",
    transferClass: "ROUTINE",
    question,
    answer,
    workingSteps: [`Add all the values: ${sum}`, `Divide by how many values there are (${values.length}): ${mean}`],
    misconception: "Dividing by the wrong count (e.g. one more or fewer than the number of values actually given).",
  };
}

items.push(
  mr01AverageMean({ id: "mr01-mean-01", context: "Amy's scores in four games", values: [14, 18, 22, 26] }),
  mr01AverageMean({ id: "mr01-mean-02", context: "Five days of temperature readings", values: [18, 21, 15, 22, 19] }),
  mr01AverageMean({ id: "mr01-mean-03", context: "Weekly savings amounts over four weeks", values: [12, 15, 9, 20], unit: "£" }),
  mr01AverageMean({ id: "mr01-mean-04", context: "Distances run (km) over five days", values: [5, 7, 6, 8, 9] })
);

// ---------- 5. mr02-nth-term (QT-MR-05, MR-02) — infer the rule, don't state it ----------
function mr02NthTerm({ id, first, diff, n }) {
  const terms = [first, first + diff, first + 2 * diff];
  const nthTerm = first + (n - 1) * diff;
  const question = `A sequence begins ${terms.join(", ")}, ... and continues with the same pattern. What is the ${n}th term?`;
  assertNoDash(question, id);
  return {
    id,
    family: "mr02-nth-term",
    primaryCompetency: "MR-02",
    supportingCompetencies: [],
    structure: "PATTERN INFERENCE THEN GENERALISATION",
    transferClass: "FAR_TRANSFER",
    question,
    answer: String(nthTerm),
    workingSteps: [
      `Find the common difference between terms: ${diff}`,
      `The nth term is the first term plus (n − 1) lots of the difference`,
      `${first} + (${n} − 1) × ${diff < 0 ? `(${diff})` : diff} = ${nthTerm}`,
    ],
    misconception: `Multiplying the term position directly by the difference without adjusting for the starting term (e.g. giving ${n * diff} instead of ${nthTerm}).`,
  };
}

items.push(
  mr02NthTerm({ id: "mr02-nth-01", first: 4, diff: 5, n: 10 }),
  mr02NthTerm({ id: "mr02-nth-02", first: 7, diff: 3, n: 12 }),
  mr02NthTerm({ id: "mr02-nth-03", first: 2, diff: 6, n: 8 }),
  mr02NthTerm({ id: "mr02-nth-04", first: 100, diff: -7, n: 9 }),
  mr02NthTerm({ id: "mr02-nth-05", first: 15, diff: 4, n: 15 })
);

// ---------- 6. mr02-sum-difference (QT-MR-06, MR-02) — sum-and-difference simultaneous structure ----------
function mr02SumDifference({ id, subject, names, difference, total }) {
  // a - b = difference, a + b = total  ->  a = (total+difference)/2, b = (total-difference)/2
  const a = (total + difference) / 2;
  const b = (total - difference) / 2;
  if (!Number.isInteger(a) || !Number.isInteger(b) || b <= 0) throw new Error(`${id}: non-integer or invalid solution`);
  const question = `${names[0]} has £${difference} more than ${names[1]} in ${subject}. Together they have £${total}. How much does ${names[1]} have?`;
  assertNoDash(question, id);
  return {
    id,
    family: "mr02-sum-difference",
    primaryCompetency: "MR-02",
    supportingCompetencies: [],
    structure: "SUM-AND-DIFFERENCE SIMULTANEOUS REASONING",
    transferClass: "NEAR_TRANSFER",
    question,
    answer: `£${b}`,
    workingSteps: [
      `If the smaller amount is x, the larger amount is x + ${difference}`,
      `x + (x + ${difference}) = ${total}`,
      `2x = ${total - difference}, so x = ${b}`,
    ],
    misconception: `Splitting the total evenly (£${total / 2}) without accounting for the stated difference.`,
  };
}

items.push(
  mr02SumDifference({ id: "mr02-sumdiff-01", subject: "savings", names: ["Priya", "Sam"], difference: 8, total: 36 }),
  mr02SumDifference({ id: "mr02-sumdiff-02", subject: "pocket money", names: ["Leo", "Mia"], difference: 6, total: 24 }),
  mr02SumDifference({ id: "mr02-sumdiff-03", subject: "prize money", names: ["Noah", "Ava"], difference: 12, total: 50 }),
  mr02SumDifference({ id: "mr02-sumdiff-04", subject: "birthday money", names: ["Zara", "Tom"], difference: 10, total: 40 }),
  mr02SumDifference({ id: "mr02-sumdiff-05", subject: "collected coins", names: ["Ellis", "Nia"], difference: 5, total: 25 })
);

// ---------- 7. mr03-angle-ratio (QT-MR-07, MR-03 primary, MR-02 supporting) ----------
function mr03AngleRatio({ id, kind, ratioA, ratioB, ratioC }) {
  const parts = ratioC !== undefined ? [ratioA, ratioB, ratioC] : [ratioA, ratioB];
  const total = kind === "straight-line" ? 180 : 360;
  const sumRatio = parts.reduce((a, b) => a + b, 0);
  if (total % sumRatio !== 0) throw new Error(`${id}: ratio does not divide evenly`);
  const unit = total / sumRatio;
  const values = parts.map((p) => p * unit);
  const largest = Math.max(...values);
  const kindLabel = kind === "straight-line" ? "on a straight line" : "around a point";
  const ratioLabel = parts.join(":");
  const countWord = parts.length === 3 ? "Three" : "Two";
  const question = `${countWord} angles ${kindLabel} are in the ratio ${ratioLabel}. What is the size of the largest angle?`;
  assertNoDash(question, id);
  return {
    id,
    family: "mr03-angle-ratio",
    primaryCompetency: "MR-03",
    supportingCompetencies: ["MR-02"],
    structure: "RATIO-BASED ANGLE REASONING",
    transferClass: "MIXED_TRANSFER",
    question,
    answer: `${largest}°`,
    workingSteps: [
      `Angles ${kindLabel} add up to ${total}°`,
      `Split ${total}° in the ratio ${ratioLabel}: each share is ${unit}°`,
      `The largest angle is ${Math.max(...parts)} × ${unit} = ${largest}°`,
    ],
    misconception: `Treating the ratio numbers themselves as the answer in degrees, instead of scaling them to fit ${total}°.`,
  };
}

items.push(
  mr03AngleRatio({ id: "mr03-angratio-01", kind: "straight-line", ratioA: 2, ratioB: 3 }),
  mr03AngleRatio({ id: "mr03-angratio-02", kind: "straight-line", ratioA: 5, ratioB: 4 }),
  mr03AngleRatio({ id: "mr03-angratio-03", kind: "around-point", ratioA: 1, ratioB: 2, ratioC: 3 }),
  mr03AngleRatio({ id: "mr03-angratio-04", kind: "around-point", ratioA: 2, ratioB: 3, ratioC: 4 }),
  mr03AngleRatio({ id: "mr03-angratio-05", kind: "straight-line", ratioA: 7, ratioB: 5 })
);

// ---------- 8. mr05-factors-primes (QT-MR-11, MR-05) ----------
function factorsOf(n) {
  const f = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) f.push(i);
  return f;
}
function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}
function mr05FactorsPrimes({ id, kind, n }) {
  let question, answer, workingSteps, misconception;
  if (kind === "count-factors") {
    const f = factorsOf(n);
    question = `How many factors does ${n} have?`;
    answer = String(f.length);
    workingSteps = [`List every number that divides exactly into ${n}: ${f.join(", ")}`, `Count them: ${f.length}`];
    misconception = "Listing only the obvious factor pairs and missing one, or including a number that does not divide exactly.";
  } else {
    const prime = isPrime(n);
    question = `Is ${n} a prime number? Answer True or False.`;
    answer = prime ? "True" : "False";
    const smallestFactor = prime ? n : factorsOf(n).find((x) => x > 1 && x < n);
    workingSteps = prime
      ? [`Check every number from 2 up to the square root of ${n}`, `None divide exactly into ${n}, so it is prime`]
      : [`${n} can be divided exactly by ${smallestFactor}`, `A number with a factor other than 1 and itself is not prime`];
    misconception = "Assuming odd numbers are always prime, or forgetting that 1 is not a prime number.";
  }
  assertNoDash(question, id);
  return {
    id,
    family: "mr05-factors-primes",
    primaryCompetency: "MR-05",
    supportingCompetencies: [],
    structure: "FACTOR/PRIME PROPERTY REASONING",
    transferClass: "ROUTINE",
    question,
    answer,
    workingSteps,
    misconception,
  };
}

items.push(
  mr05FactorsPrimes({ id: "mr05-fp-01", kind: "count-factors", n: 24 }),
  mr05FactorsPrimes({ id: "mr05-fp-02", kind: "count-factors", n: 36 }),
  mr05FactorsPrimes({ id: "mr05-fp-03", kind: "is-prime", n: 29 }),
  mr05FactorsPrimes({ id: "mr05-fp-04", kind: "is-prime", n: 51 }),
  mr05FactorsPrimes({ id: "mr05-fp-05", kind: "count-factors", n: 18 })
);

// ---------- 9. mr04-compound-percentage (QT-MR-04, MR-04 primary, MR-01 supporting) ----------
function mr04CompoundPercentage({ id, item, price, increasePct, decreasePct }) {
  const afterIncrease = price * (1 + increasePct / 100);
  const finalPrice = afterIncrease * (1 - decreasePct / 100);
  const rounded = Math.round(finalPrice * 100) / 100;
  if (rounded === price) {
    rejectedVariants.push({ id, reason: "final price coincidentally equals the original price — rewards the wrong 'it cancels out' reasoning as if correct" });
    throw new Error(`${id}: increase/decrease combination returns to the original price — ambiguous, rejected`);
  }
  const question = `${item} costs £${formatMoney(price)}. The price is increased by ${increasePct}%, then later decreased by ${decreasePct}%. What is the final price?`;
  assertNoDash(question, id);
  return {
    id,
    family: "mr04-compound-percentage",
    primaryCompetency: "MR-04",
    supportingCompetencies: ["MR-01"],
    structure: "SUCCESSIVE PERCENTAGE CHANGE",
    transferClass: "MIXED_TRANSFER",
    question,
    answer: `£${formatMoney(rounded)}`,
    workingSteps: [
      `Increase: £${formatMoney(price)} × ${1 + increasePct / 100} = £${formatMoney(afterIncrease)}`,
      `Decrease: £${formatMoney(afterIncrease)} × ${1 - decreasePct / 100} = £${formatMoney(rounded)}`,
    ],
    misconception: `Applying both percentages to the original price separately instead of applying the second change to the already-changed price.`,
  };
}

function tryGenerate(fn, args) {
  try {
    return fn(args);
  } catch (e) {
    console.log(`REJECTED VARIANT: ${e.message}`);
    return null;
  }
}

// Demonstrates the validator actually rejects unsuitable combinations, not just
// passes everything through — this candidate uses a +25%/-20% combination which
// is a genuine mathematical identity (always returns to the original price) and
// must be caught, not silently authored.
tryGenerate(mr04CompoundPercentage, { id: "mr04-cpct-rejected-identity", item: "A speaker", price: 100, increasePct: 25, decreasePct: 20 });

items.push(
  mr04CompoundPercentage({ id: "mr04-cpct-01", item: "A jacket", price: 80, increasePct: 25, decreasePct: 15 }),
  mr04CompoundPercentage({ id: "mr04-cpct-02", item: "A bicycle", price: 200, increasePct: 10, decreasePct: 10 }),
  mr04CompoundPercentage({ id: "mr04-cpct-03", item: "A games console", price: 150, increasePct: 20, decreasePct: 15 }),
  mr04CompoundPercentage({ id: "mr04-cpct-04", item: "A watch", price: 60, increasePct: 50, decreasePct: 40 }),
  mr04CompoundPercentage({ id: "mr04-cpct-05", item: "A tablet", price: 250, increasePct: 8, decreasePct: 25 })
);

// ---------- 10. mr04-best-value (QT-MR-13, MR-04 primary) ----------
function mr04BestValue({ id, item, optionA, optionB }) {
  const unitPriceA = optionA.price / optionA.count;
  const unitPriceB = optionB.price / optionB.count;
  if (Math.abs(unitPriceA - unitPriceB) < 0.001) {
    rejectedVariants.push({ id, reason: "the two options are equal value — no unambiguous correct answer" });
    throw new Error(`${id}: options are equal value, ambiguous, rejected`);
  }
  const better = unitPriceA < unitPriceB ? "A" : "B";
  const question = `${item}: Option A is ${optionA.count} for £${formatMoney(optionA.price)}. Option B is ${optionB.count} for £${formatMoney(optionB.price)}. Which option is better value, A or B?`;
  assertNoDash(question, id);
  return {
    id,
    family: "mr04-best-value",
    primaryCompetency: "MR-04",
    supportingCompetencies: [],
    structure: "UNIT-PRICE COMPARISON",
    transferClass: "FAR_TRANSFER",
    question,
    answer: better,
    workingSteps: [
      `Option A: £${formatMoney(optionA.price)} ÷ ${optionA.count} = £${formatMoney(unitPriceA)} each`,
      `Option B: £${formatMoney(optionB.price)} ÷ ${optionB.count} = £${formatMoney(unitPriceB)} each`,
      `The lower price-per-item is better value: Option ${better}`,
    ],
    misconception: "Comparing the total prices directly instead of working out the price per item first.",
  };
}

// Demonstrates the validator rejects a genuinely ambiguous pair (both options
// are exactly the same unit price, so "which is better value" has no answer).
tryGenerate(mr04BestValue, { id: "mr04-bv-rejected-tie", item: "Erasers", optionA: { count: 4, price: 2.00 }, optionB: { count: 2, price: 1.00 } });

items.push(
  mr04BestValue({ id: "mr04-bv-01", item: "Apples", optionA: { count: 3, price: 1.20 }, optionB: { count: 5, price: 2.25 } }),
  mr04BestValue({ id: "mr04-bv-02", item: "Notebooks", optionA: { count: 4, price: 3.60 }, optionB: { count: 6, price: 4.80 } }),
  mr04BestValue({ id: "mr04-bv-03", item: "Juice cartons", optionA: { count: 2, price: 1.50 }, optionB: { count: 3, price: 2.10 } }),
  mr04BestValue({ id: "mr04-bv-04", item: "Pencils", optionA: { count: 10, price: 2.00 }, optionB: { count: 6, price: 1.50 } }),
  mr04BestValue({ id: "mr04-bv-05", item: "Bottled water", optionA: { count: 6, price: 3.00 }, optionB: { count: 8, price: 4.40 } })
);

// ============================================================
// Validation: duplicate id/question/answer, dash check (already asserted per-item)
// ============================================================
const ids = new Set();
const questions = new Set();
let failCount = 0;
for (const item of items) {
  if (ids.has(item.id)) {
    console.error(`DUPLICATE ID: ${item.id}`);
    failCount++;
  }
  ids.add(item.id);
  if (questions.has(item.question)) {
    console.error(`DUPLICATE QUESTION: ${item.id}`);
    failCount++;
  }
  questions.add(item.question);
}

const families = new Set(items.map((i) => i.family));

if (failCount > 0) {
  console.error(`Wave 3B generation: FAIL (${failCount} problems)`);
  process.exit(1);
}

writeFileSync(
  "C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin/135f4c11-3911-48ce-b2ad-471be84f3f8b/scratchpad/wave3b_items.json",
  JSON.stringify(items, null, 2)
);
writeFileSync(
  "C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin/135f4c11-3911-48ce-b2ad-471be84f3f8b/scratchpad/wave3b_rejected.json",
  JSON.stringify(rejectedVariants, null, 2)
);
console.log(`Wave 3B generation: PASS, ${items.length} items across ${families.size} families`);
console.log("Families:", [...families].join(", "));
console.log(`Rejected variants: ${rejectedVariants.length}`);
