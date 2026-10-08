/**
 * Independent answer verification for Maths blueprints (completes the September question-factory work in progress).
 *
 * The factory's core safety rule is that a candidate's answer is recomputed rather than trusted. Recomputing with the
 * SAME function that produced the answer proves nothing about that function. A blueprint can therefore declare an
 * `independentAnswerCheck` that recomputes through the generic, transform-agnostic functions below: shared, separately
 * tested, and never a blueprint's own inline sign flip or addition. A blueprint whose own formula is buggy is then
 * caught because the generic function disagrees with it.
 *
 * Pure functions, no I/O.
 */

export interface CoordinatePoint {
  x: number;
  y: number;
}

export type CoordinateTransform =
  | { kind: "reflect_x_axis" }
  | { kind: "reflect_y_axis" }
  | { kind: "reflect_line_y_equals_x" }
  | { kind: "translate"; dx: number; dy: number }
  | { kind: "rotate_about_origin"; quarterTurnsClockwise: number };

/** Applies one transformation to a point. Reflections use the textbook definitions, applied literally. */
export function applyCoordinateTransform(point: CoordinatePoint, transform: CoordinateTransform): CoordinatePoint {
  switch (transform.kind) {
    case "reflect_x_axis":
      return { x: point.x, y: -point.y };
    case "reflect_y_axis":
      return { x: -point.x, y: point.y };
    case "reflect_line_y_equals_x":
      return { x: point.y, y: point.x };
    case "translate":
      return { x: point.x + transform.dx, y: point.y + transform.dy };
    case "rotate_about_origin": {
      // One clockwise quarter turn about the origin maps (x, y) to (y, -x).
      let p = { ...point };
      const turns = ((transform.quarterTurnsClockwise % 4) + 4) % 4;
      for (let i = 0; i < turns; i++) p = { x: p.y, y: -p.x };
      return p;
    }
  }
}

/** The canonical written form used everywhere in the bank: "(x, y)" with one space. `-0` is written as 0. */
export function formatCoordinatePoint(point: CoordinatePoint): string {
  const n = (v: number) => String(Object.is(v, -0) ? 0 : v);
  return `(${n(point.x)}, ${n(point.y)})`;
}

/** The midpoint of two points. May be non-integer; callers that need a whole-number midpoint constrain their inputs. */
export function midpoint(a: CoordinatePoint, b: CoordinatePoint): CoordinatePoint {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
