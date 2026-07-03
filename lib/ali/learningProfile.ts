import type { AliCompetencySignal } from "@/types/ali/missionSignal";
import type { LearningGainSnapshot } from "@/types/ali/learningGain";
import type { LearningProfile, LearningProfileDimensions } from "@/types/ali/learningProfile";

/**
 * Curated cross-subject competency pools (LEARNING_PROFILE_MODEL.md §2) —
 * a judgement call, documented there, about which real competency codes
 * represent "logical"/multi-step rule-application vs. "verbal"/language-
 * relationship skill. Some Mathematics competencies appear in both the
 * Logical Reasoning pool and the Numerical Confidence pool — genuinely
 * both things (multi-step algebra is both logical and numerical), not a
 * bug.
 */
const LOGICAL_REASONING_POOL = [
  "vr.letter-codes", "vr.number-codes", "vr.sequences",
  "maths.algebra", "maths.problem-solving", "maths.powers-roots", "maths.factors-multiples",
];

const VERBAL_REASONING_POOL = [
  "vr.analogies", "vr.odd-one-out", "vr.synonyms", "vr.antonyms",
  "vr.word-codes", "vr.hidden-words", "vr.compound-words",
  "vocabulary.synonyms", "vocabulary.antonyms", "vocabulary.in-context",
  "english.inference", "english.vocabulary-in-context",
];

const NUMERICAL_CONFIDENCE_POOL = [
  "maths.addition-subtraction", "maths.multiplication", "maths.division", "maths.fractions",
  "maths.decimals", "maths.percentages", "maths.ratio-proportion", "maths.algebra",
  "maths.geometry", "maths.measurement", "maths.time", "maths.money", "maths.statistics",
  "maths.problem-solving", "maths.powers-roots", "maths.factors-multiples",
];

function poolMasteryRatio(
  signals: Partial<Record<string, AliCompetencySignal>>,
  pool: string[]
): number | null {
  let attempted = 0;
  let mastered = 0;
  for (const signal of Object.values(signals)) {
    if (!signal) continue;
    for (const code of pool) {
      if (signal.attemptedCompetencies.includes(code)) {
        attempted += 1;
        if (signal.masteredCompetencies.includes(code)) mastered += 1;
      }
    }
  }
  if (attempted === 0) return null;
  return Math.round((mastered / attempted) * 100);
}

/**
 * Coarse resilience signal (LEARNING_PROFILE_MODEL.md §2.4) — only
 * assessable once a subject has actually had a weak competency to persist
 * through. Averages a 3-point score (positive/flat/negative cumulative
 * Learning Gain) across every subject that currently has one.
 */
function computePersistence(
  signals: Partial<Record<string, AliCompetencySignal>>,
  gains: Partial<Record<string, LearningGainSnapshot>>
): number | null {
  const strugglingSubjects = Object.entries(signals).filter(
    ([, signal]) => signal && signal.weakCompetencies.length > 0
  );
  if (strugglingSubjects.length === 0) return null;

  const scores = strugglingSubjects.map(([subject]) => {
    const cumulative = gains[subject]?.cumulative ?? 0;
    if (cumulative > 0) return 75;
    if (cumulative < 0) return 25;
    return 50;
  });
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function buildInterpretation(d: LearningProfileDimensions): string[] {
  const phrases: string[] = [];
  if (d.verbalReasoning !== null && d.verbalReasoning >= 70) phrases.push("Confident with words and language");
  if (d.logicalReasoning !== null && d.logicalReasoning >= 70) phrases.push("Strong logical problem solver");
  if (d.numericalConfidence !== null && d.numericalConfidence < 40) phrases.push("Benefits from additional numerical practice");
  if (d.numericalConfidence !== null && d.numericalConfidence >= 70) phrases.push("Confident problem solver with numbers");
  if (d.persistence !== null && d.persistence >= 70) phrases.push("Keeps trying and improves over time");
  if (d.persistence !== null && d.persistence <= 30) phrases.push("May need encouragement to persist through difficulty");
  if (phrases.length === 0) phrases.push("Not enough practice yet to build a learning profile");
  return phrases;
}

/**
 * Computes the internal Learning Profile from existing ALI evidence only —
 * no new Supabase reads, no new stored fact about the student. Pure, no I/O.
 * See LEARNING_PROFILE_MODEL.md for the full interpretation, including an
 * honest accounting of the 4 dimensions this function cannot compute yet.
 */
export function computeLearningProfile(
  signals: Partial<Record<string, AliCompetencySignal>>,
  gains: Partial<Record<string, LearningGainSnapshot>>
): LearningProfile {
  const dimensions: LearningProfileDimensions = {
    logicalReasoning: poolMasteryRatio(signals, LOGICAL_REASONING_POOL),
    verbalReasoning: poolMasteryRatio(signals, VERBAL_REASONING_POOL),
    numericalConfidence: poolMasteryRatio(signals, NUMERICAL_CONFIDENCE_POOL),
    learningConsistency: null,
    learningSpeed: null,
    confidenceVsAccuracy: null,
    persistence: computePersistence(signals, gains),
    revisionBehaviour: null,
  };

  return {
    dimensions,
    interpretation: buildInterpretation(dimensions),
    computedAt: new Date().toISOString(),
  };
}
