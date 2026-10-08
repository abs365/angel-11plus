/**
 * Pure measures for the Continuous Writing human-calibration exercise (ANGEL_WRITING_CALIBRATION_PACK.md,
 * ANGEL_WRITING_HUMAN_CALIBRATION_PROTOCOL.md). No calibration has been run; these functions only compute the agreed measures once
 * readers' sheets exist. They never produce a mark, a band or a CSSE-equivalent number, and nothing in the product reads them.
 */
export type CalLevel = "developing" | "secure" | "strong";
export type CalCell = CalLevel | "could_not_judge";
export const CAL_DIMENSIONS = ["ideas", "vocabulary", "grammar", "structure", "punctuation"] as const;
export type CalDimension = (typeof CAL_DIMENSIONS)[number];

const ORD: Record<CalLevel, number> = { developing: 0, secure: 1, strong: 2 };
const isLevel = (c: CalCell | undefined | null): c is CalLevel => c === "developing" || c === "secure" || c === "strong";

export interface PairStats {
  n: number;
  exact: number | null;
  withinOne: number | null;
  /** Positive: the second rater is more generous than the first. */
  meanSigned: number | null;
  /** Of the disagreements, the share where the second rater is more generous (null if none). */
  secondMoreGenerousShare: number | null;
  disagreements: number;
}

/** Agreement between two raters over paired cells; pairs where either side could not judge are excluded and counted separately by the caller. */
export function pairStats(a: readonly (CalCell | undefined)[], b: readonly (CalCell | undefined)[]): PairStats {
  const pairs: [number, number][] = [];
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (isLevel(a[i]) && isLevel(b[i])) pairs.push([ORD[a[i] as CalLevel], ORD[b[i] as CalLevel]]);
  const n = pairs.length;
  if (n === 0) return { n: 0, exact: null, withinOne: null, meanSigned: null, secondMoreGenerousShare: null, disagreements: 0 };
  const diffs = pairs.map(([x, y]) => y - x);
  const dis = diffs.filter((d) => d !== 0);
  return {
    n,
    exact: diffs.filter((d) => d === 0).length / n,
    withinOne: diffs.filter((d) => Math.abs(d) <= 1).length / n,
    meanSigned: diffs.reduce((s, d) => s + d, 0) / n,
    secondMoreGenerousShare: dis.length ? dis.filter((d) => d > 0).length / dis.length : null,
    disagreements: dis.length,
  };
}

/** Quadratic-weighted kappa over the three-level ordinal scale. Returns null if undefined (no pairs, or no variation on either side). */
export function quadraticWeightedKappa(a: readonly (CalCell | undefined)[], b: readonly (CalCell | undefined)[]): number | null {
  const pairs: [number, number][] = [];
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (isLevel(a[i]) && isLevel(b[i])) pairs.push([ORD[a[i] as CalLevel], ORD[b[i] as CalLevel]]);
  const n = pairs.length;
  if (n === 0) return null;
  const k = 3;
  const w = (i: number, j: number) => ((i - j) * (i - j)) / ((k - 1) * (k - 1));
  const pa = [0, 0, 0];
  const pb = [0, 0, 0];
  let observed = 0;
  for (const [x, y] of pairs) {
    pa[x]++;
    pb[y]++;
    observed += w(x, y);
  }
  observed /= n;
  let expected = 0;
  for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) expected += (pa[i] / n) * (pb[j] / n) * w(i, j);
  if (expected === 0) return null;
  return 1 - observed / expected;
}

export type ReferenceResult = { level: CalLevel; how: "both_agree" | "third_reader" } | { level: null; how: "unresolved" | "could_not_judge" };

/**
 * The human reference level for one cell, per the protocol: both readers agree, or a third reader decides. The protocol requires
 * a third reader at a two-level difference; for a ONE-level difference it is silent, so this returns "unresolved" unless a third
 * reader is supplied (a gap for the Founder to settle: the safest reading is to send every difference to the third reader).
 */
export function humanReference(a: CalCell, b: CalCell, third?: CalCell): ReferenceResult {
  if (!isLevel(a) || !isLevel(b)) return { level: null, how: "could_not_judge" };
  if (a === b) return { level: a, how: "both_agree" };
  if (isLevel(third)) return { level: third, how: "third_reader" };
  return { level: null, how: "unresolved" };
}

export function needsThirdReader(a: CalCell, b: CalCell): "required" | "recommended" | "no" {
  if (!isLevel(a) || !isLevel(b)) return "no";
  const d = Math.abs(ORD[a] - ORD[b]);
  return d >= 2 ? "required" : d === 1 ? "recommended" : "no";
}

export interface ThresholdCheck {
  name: string;
  value: number | null;
  threshold: number;
  met: boolean | null;
}

/** The protocol's PROPOSED, provisional thresholds (section 7). They are inputs the Founder sets; this only reports against whatever is passed. */
export const PROPOSED_THRESHOLDS = { withinOne: 0.9, oneDirectionalBias: 0.7, repeatabilityWithinOne: 0.9, lowConfidenceOnAwkward: 0.8 } as const;

export function checkThresholds(input: { withinOne: number | null; secondMoreGenerousShare: number | null; repeatabilityWithinOne: number | null; awkwardFlagged: number | null }, t = PROPOSED_THRESHOLDS): ThresholdCheck[] {
  const ge = (name: string, value: number | null, threshold: number): ThresholdCheck => ({ name, value, threshold, met: value === null ? null : value >= threshold });
  const bias = input.secondMoreGenerousShare;
  const biasOk = bias === null ? null : Math.max(bias, 1 - bias) <= t.oneDirectionalBias;
  return [
    ge("AI vs human reference, within one level", input.withinOne, t.withinOne),
    { name: "No one-directional bias beyond the limit", value: bias === null ? null : Math.max(bias, 1 - bias), threshold: t.oneDirectionalBias, met: biasOk },
    ge("AI repeatability, within one level", input.repeatabilityWithinOne, t.repeatabilityWithinOne),
    ge("Low-confidence flag fires on awkward scripts", input.awkwardFlagged, t.lowConfidenceOnAwkward),
  ];
}
