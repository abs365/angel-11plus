/**
 * Governed coordinate-answer normaliser. Applies ONLY where the STORED answer is itself a coordinate pair "(x, y)" (two plain
 * decimal numbers in brackets). It makes harmless formatting irrelevant (spaces, the Unicode minus sign, a trailing ".0") and
 * nothing else: brackets are still required, both numbers must be equal to the stored ones, and anything malformed, with a
 * different number of values, or mathematically different is rejected. No fuzzy matching. The same rule is implemented in SQL
 * for the Mock scorer (migration 274, prepared) and tested against the same cases.
 */
const NUM = "[+-]?[0-9]+(?:\\.[0-9]+)?";
const COORD = new RegExp(`^\\(\\s*(${NUM})\\s*,\\s*(${NUM})\\s*\\)$`);

export interface CoordinatePair {
  x: number;
  y: number;
}

const tidy = (s: string) => s.trim().replace(/−/g, "-");

/** Parses "(x, y)" if (and only if) the whole string is a bracketed pair of plain decimal numbers. */
export function parseCoordinateAnswer(text: string): CoordinatePair | null {
  const m = tidy(text).match(COORD);
  if (!m) return null;
  return { x: Number(m[1]), y: Number(m[2]) };
}

/** True when a STORED answer is coordinate-type (so the normaliser applies to it). */
export function isCoordinateAnswer(stored: string): boolean {
  return parseCoordinateAnswer(stored) !== null;
}

/** A learner response matches a coordinate-type stored answer if it is also a bracketed pair with both numbers equal. */
export function coordinateAnswersMatch(response: string, stored: string, tolerance = 0.0001): boolean {
  const s = parseCoordinateAnswer(stored);
  if (!s) return false;
  const r = parseCoordinateAnswer(response);
  if (!r) return false;
  return Math.abs(r.x - s.x) < tolerance && Math.abs(r.y - s.y) < tolerance;
}
