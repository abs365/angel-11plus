import type { FamilyGenerationSpec, StructuralBlueprint } from "./types";

/**
 * Question Factory Wave 1, Phase 4 — three real, live, hand-authored
 * Mathematics families, chosen deliberately narrow per the Founder's own
 * instruction ("Start with a bounded subset of existing, well-understood
 * families... do NOT immediately generate variants across all 74
 * families"). Confirmed live via a read-only, anon-key production query
 * against `ali_question_bank` this session (same privilege level as any
 * real visitor's browser): `mr01-decimal-computation` (7 rows),
 * `precision-frac` (6 rows), `mr03-angle-sum` (7 rows) all exist today
 * with real sibling rows, e.g. `mth-008` ("Calculate: 2.4 × 0.35" ->
 * "0.84"), `precision-frac-01` ("A 10m ribbon is cut into 3 equal
 * pieces..." -> "3 1/3"), `mr03-ang-01` ("A triangle has angles of 48°,
 * 62°..." -> "70"). Chosen to span three genuinely different
 * mathematical reasoning types (decimal arithmetic, division-with-
 * remainder-as-fraction, geometric angle-sum) and two different answer
 * forms (numeric, fraction -- per `lib/ali/structuralSignature.ts`'s own
 * `answerForm()` classifier).
 */

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

// ─── Family 1: mr01-decimal-computation (decimal multiplication) ───────

// Deliberately `type`, not `interface` -- an interface does not
// structurally satisfy the `Record<string, number>` generic constraint
// FamilyGenerationSpec requires, even when every one of its own
// properties is a number; a type alias does.
type DecimalMultiplicationParams = {
  /** a, stored ×10 as an integer (1 decimal place), e.g. 24 -> 2.4 */
  aTenths: number;
  /** b, stored ×100 as an integer (2 decimal places), e.g. 35 -> 0.35 */
  bHundredths: number;
};

function formatTenths(aTenths: number): string {
  return (aTenths / 10).toFixed(1);
}
function formatHundredths(bHundredths: number): string {
  return (bHundredths / 100).toFixed(2).replace(/0$/, "").replace(/\.$/, ".0");
}

/** Exact integer-domain product, formatted to at most 3 decimal places with trailing zeros stripped -- mirrors the real bank's own worked convention ("2.4 × 0.35 = 0.84", not "0.840"). */
function decimalProduct(aTenths: number, bHundredths: number): string {
  const rawThousandths = aTenths * bHundredths; // exact integer: (a*10)*(b*100) = product*1000
  let str = (rawThousandths / 1000).toFixed(3);
  str = str.replace(/0+$/, "").replace(/\.$/, "");
  return str;
}

export const DECIMAL_MULTIPLICATION_SPEC: FamilyGenerationSpec<DecimalMultiplicationParams> = {
  familyId: "mr01-decimal-computation",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-01",
  mathematicalObjective: "Multiply a 1-decimal-place number by a 2-decimal-place number, tracking decimal place value through the calculation.",
  parameterRanges: {
    aTenths: { min: 11, max: 99 }, // 1.1 .. 9.9
    bHundredths: { min: 10, max: 999 }, // 0.10 .. 9.99 -- the real seed row "2.4 x 0.35" has b=0.35, so the range must include sub-1.00 values
  },
  constraints: (p) => p.aTenths % 10 !== 0 && p.bHundredths % 100 !== 0, // both must genuinely carry a fractional part, not resolve to a whole number
  invalidCombinationDescription: "aTenths/bHundredths that reduce to a whole number of tenths/hundredths (e.g. 5.0) are excluded -- they no longer exercise decimal place-value tracking, the family's own objective.",
  difficultyControls: (p) => {
    const bothSmall = p.aTenths < 50 && p.bHundredths < 500;
    const bothLarge = p.aTenths >= 70 && p.bHundredths >= 700;
    return bothLarge ? "hard" : bothSmall ? "easy" : "medium";
  },
  sampleParams: (random) => ({
    aTenths: 11 + Math.floor(random() * 89),
    bHundredths: 10 + Math.floor(random() * 990),
  }),
  renderQuestionText: (p) => `Calculate: ${formatTenths(p.aTenths)} × ${formatHundredths(p.bHundredths)}`,
  deriveCorrectAnswer: (p) => decimalProduct(p.aTenths, p.bHundredths),
  deriveWorkedSteps: (p) => {
    const a = formatTenths(p.aTenths);
    const b = formatHundredths(p.bHundredths);
    const intA = p.aTenths;
    const intB = p.bHundredths;
    return [
      `${a} has 1 decimal place, ${b} has 2 decimal places → answer has 3 dp`,
      `Multiply as integers: ${intA} × ${intB} = ${intA * intB}`,
      `Divide by 1000 → ${(intA * intB / 1000).toFixed(3)} = ${decimalProduct(p.aTenths, p.bHundredths)}`,
    ];
  },
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "Both aTenths and bHundredths are resampled independently per candidate; a candidate is rejected as an exact duplicate if its rendered question text exactly matches an existing real row's question text (i.e. the same two decimal values as an already-authored question) or another candidate already accepted in the same batch.",
  // Human Educational Calibration Gate (Wave 2) -- honest disclosure, not
  // a fix: this spec has exactly one reasoning route, one presentation
  // context, and one unknown position, regardless of which parameters
  // are sampled. The Wave 2 calibration audit found this is the family's
  // real, confirmed weakness -- see ANGEL_QUESTION_FACTORY_WAVE2_CALIBRATION_REPORT.md.
  reasoningRoute: () => "direct_computation",
  contextTag: () => "bare_arithmetic",
  unknownPosition: () => "product",
};

// ─── Family 2: precision-frac (division expressed as an exact fraction) ─

type RibbonFractionParams = {
  lengthMetres: number;
  pieces: number;
};

export const RIBBON_FRACTION_SPEC: StructuralBlueprint<RibbonFractionParams> = {
  blueprintId: "precision-frac-bp-ribbon-cutting",
  familyId: "precision-frac",
  competencyId: "MR-06",
  questionTypeId: "QT-MR-14",
  mathematicalObjective: "Divide a whole quantity into equal pieces where the division does not resolve evenly, and express the exact result as a fraction in its simplest form (not a rounded decimal).",
  parameterRanges: {
    lengthMetres: { min: 4, max: 30 },
    pieces: { min: 3, max: 9 },
  },
  constraints: (p) => p.lengthMetres % p.pieces !== 0 && p.lengthMetres > p.pieces, // must NOT divide evenly (else no fraction is needed), and must produce at least 1 whole part
  invalidCombinationDescription: "Combinations where lengthMetres divides evenly by pieces are excluded -- the family's entire purpose is practising the exact-fraction case, not a whole-number division. Combinations where pieces >= lengthMetres are excluded -- each piece would be under 1m, changing the reasoning shape.",
  difficultyControls: (p) => (p.pieces <= 4 ? "easy" : p.pieces <= 6 ? "medium" : "hard"),
  difficultyDimensions: ["denominator_size"],
  sampleParams: (random) => ({
    lengthMetres: 4 + Math.floor(random() * 27),
    pieces: 3 + Math.floor(random() * 7),
  }),
  // CORRECTED (Question Factory Scale Architecture, Section 9) -- the
  // original wording, "Give your answer as an exact fraction... in its
  // simplest form," is inconsistent with every real answer this family
  // produces: the constraint `lengthMetres > pieces` guarantees the whole
  // part is always >= 1, so no answer is ever "a fraction" in the strict
  // under-1 sense a learner would expect from that phrase. Reworded to
  // match what the answer actually is, and paired with
  // deriveAcceptedAnswerForms() below so the mathematically-equivalent
  // improper-fraction form is also accepted, not just the canonical
  // mixed-number display form.
  renderQuestionText: (p) => `A ${p.lengthMetres}m ribbon is cut into ${p.pieces} equal pieces. What is the length of each piece, in metres? Give your answer as a fraction or mixed number, in its simplest form.`,
  deriveCorrectAnswer: (p) => {
    const whole = Math.floor(p.lengthMetres / p.pieces);
    const remainder = p.lengthMetres % p.pieces;
    const divisor = gcd(remainder, p.pieces);
    const simplifiedRemainder = remainder / divisor;
    const simplifiedDenominator = p.pieces / divisor;
    return whole > 0 ? `${whole} ${simplifiedRemainder}/${simplifiedDenominator}` : `${simplifiedRemainder}/${simplifiedDenominator}`;
  },
  // Section 9 -- Answer Equivalence. The canonical (display) form is the
  // mixed number `deriveCorrectAnswer()` already produces; the
  // mathematically-equivalent improper fraction is also a real, correct
  // answer a learner might legitimately write, and is now explicitly
  // accepted rather than silently marked wrong.
  deriveAcceptedAnswerForms: (p) => {
    const whole = Math.floor(p.lengthMetres / p.pieces);
    const remainder = p.lengthMetres % p.pieces;
    const divisor = gcd(remainder, p.pieces);
    const simplifiedRemainder = remainder / divisor;
    const simplifiedDenominator = p.pieces / divisor;
    const mixedForm = whole > 0 ? `${whole} ${simplifiedRemainder}/${simplifiedDenominator}` : `${simplifiedRemainder}/${simplifiedDenominator}`;
    if (whole === 0) return [mixedForm]; // already a pure fraction -- no separate improper form to add
    const improperNumerator = whole * simplifiedDenominator + simplifiedRemainder;
    const improperForm = `${improperNumerator}/${simplifiedDenominator}`;
    return [mixedForm, improperForm];
  },
  deriveWorkedSteps: (p) => {
    const whole = Math.floor(p.lengthMetres / p.pieces);
    const remainder = p.lengthMetres % p.pieces;
    return [
      `${p.lengthMetres} ÷ ${p.pieces} does not divide evenly`,
      `As an exact fraction: ${p.lengthMetres}/${p.pieces} m`,
      `${p.lengthMetres}/${p.pieces} = ${whole} remainder ${remainder}, so simplify to lowest terms`,
    ];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "lengthMetres and pieces are resampled independently per candidate, constrained to never divide evenly; a candidate producing the identical (lengthMetres, pieces) pair as an existing real row or another already-accepted candidate is rejected as an exact duplicate via rendered question text comparison.",
  // Honest disclosure: one reasoning route, one context ("ribbon
  // cutting" -- every single candidate, no exception, since
  // renderQuestionText() has no context parameter at all), one unknown
  // position -- still true after the Scale Architecture fix above, which
  // corrected the wording/answer-equivalence defect but did not add
  // genuine context/reasoning-route variation (that remains real,
  // scoped, future generation-architecture work, not this pass's task).
  reasoningRoute: () => "direct_computation",
  contextTag: () => "ribbon_cutting",
  unknownPosition: () => "piece_length",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
};

// ─── Family 3: mr03-angle-sum (triangle angle sum) ──────────────────────

type TriangleAngleSumParams = {
  angleA: number;
  angleB: number;
};

export const TRIANGLE_ANGLE_SUM_SPEC: FamilyGenerationSpec<TriangleAngleSumParams> = {
  familyId: "mr03-angle-sum",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-07",
  mathematicalObjective: "Apply the fact that a triangle's interior angles sum to 180° to find a missing angle given the other two.",
  parameterRanges: {
    angleA: { min: 10, max: 160 },
    angleB: { min: 10, max: 160 },
  },
  constraints: (p) => p.angleA + p.angleB < 175 && 180 - p.angleA - p.angleB >= 5, // the unknown angle must be a genuine, non-degenerate positive angle
  invalidCombinationDescription: "Combinations where the two known angles sum to 175° or more are excluded -- the resulting unknown angle (5° or less) is not a realistic or pedagogically useful triangle for this family's stage.",
  // CORRECTED (Wave 2 Human Educational Calibration Gate) -- the
  // original rule, `(180 - angleA - angleB) % 5 === 0 ? "easy" :
  // "medium"`, tied difficulty to an arithmetic coincidence in the
  // ANSWER (whether it happens to be a multiple of 5), which a learner
  // cannot perceive before solving and which has no relationship to how
  // hard the calculation actually is -- confirmed directly against all
  // 10 real production candidates (e.g. 29°/106° -> 45° was labelled
  // "easy" and 43°/53° -> 84° was labelled "medium", despite both being
  // an identical single-step sum-then-subtract with no meaningful
  // difference in cognitive demand). The corrected rule ties difficulty
  // to genuine arithmetic complexity of the one real computation this
  // family requires: the size of the addition (angleA + angleB), which
  // determines whether carrying is needed and how large the subsequent
  // subtraction from 180 is. Still a coarse, disclosed proxy -- not a
  // claim of scientific calibration -- but tied to a real, mechanically
  // checkable property of the computation itself, not its answer.
  difficultyControls: (p) => {
    const sum = p.angleA + p.angleB;
    return sum <= 90 ? "easy" : sum <= 140 ? "medium" : "hard";
  },
  sampleParams: (random) => ({
    angleA: 10 + Math.floor(random() * 151),
    angleB: 10 + Math.floor(random() * 151),
  }),
  renderQuestionText: (p) => `A triangle has angles of ${p.angleA}°, ${p.angleB}° and one unknown angle. What is the size of the unknown angle?`,
  deriveCorrectAnswer: (p) => String(180 - p.angleA - p.angleB),
  deriveWorkedSteps: (p) => [
    "The angles in a triangle always add up to 180°",
    `${p.angleA} + ${p.angleB} = ${p.angleA + p.angleB}`,
    `180 - ${p.angleA + p.angleB} = ${180 - p.angleA - p.angleB}`,
  ],
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "angleA and angleB are resampled independently per candidate; a candidate whose (angleA, angleB) pair (in either order) exactly matches an existing real row or another already-accepted candidate is rejected as an exact duplicate via rendered question text comparison.",
  // Honest disclosure: one reasoning route (always direct computation --
  // sum the two knowns, subtract from 180), one context (always "a
  // triangle," no real-world framing at all), one unknown position
  // (always the third angle -- reverse-reasoning variants like "given
  // the third angle and one known angle, find the other known angle"
  // are not implemented).
  reasoningRoute: () => "direct_computation",
  contextTag: () => "triangle_geometry",
  unknownPosition: () => "third_angle",
};

// Widened to a single common instantiation deliberately, so callers can
// iterate all three specs uniformly (e.g. `for (const spec of
// WAVE_1_FAMILY_SPECS) runBatch(spec, ...)`) without TypeScript's
// generic-inference-over-a-union limitation forcing per-family
// duplication at every call site. Safe because every function in
// candidateGeneration.ts is itself generic over `T extends
// Record<string, number>` and never assumes a specific family's own
// parameter shape.
export const WAVE_1_FAMILY_SPECS: FamilyGenerationSpec<Record<string, number>>[] = [
  DECIMAL_MULTIPLICATION_SPEC,
  RIBBON_FRACTION_SPEC,
  TRIANGLE_ANGLE_SUM_SPEC,
];
