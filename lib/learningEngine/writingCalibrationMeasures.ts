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
 * The human reference level for one cell: both readers agree, or a third reader decides. Any difference is a disagreement for
 * adjudication: with no third reading the cell stays "unresolved" and is excluded from any comparison, never guessed or averaged.
 */
export function humanReference(a: CalCell, b: CalCell, third?: CalCell): ReferenceResult {
  if (!isLevel(a) || !isLevel(b)) return { level: null, how: "could_not_judge" };
  if (a === b) return { level: a, how: "both_agree" };
  if (isLevel(third)) return { level: third, how: "third_reader" };
  return { level: null, how: "unresolved" };
}

export type DisagreementKind = "none" | "adjacent" | "major" | "not_comparable";

/**
 * Classifies a pair of reader judgements. EVERY difference ("adjacent" = one level, "major" = two levels) is queued for
 * adjudication by the caller; nothing is averaged or resolved here, and each reader's own judgement is always preserved.
 * No calibration threshold exists in code: thresholds are not set before human evidence exists.
 */
export function disagreementKind(a: CalCell, b: CalCell): DisagreementKind {
  if (!isLevel(a) || !isLevel(b)) return "not_comparable";
  const d = Math.abs(ORD[a] - ORD[b]);
  return d === 0 ? "none" : d === 1 ? "adjacent" : "major";
}
