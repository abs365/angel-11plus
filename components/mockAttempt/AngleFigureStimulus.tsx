"use client";

import type { MockAngleFigureStimulus } from "@/lib/mockAttempt/types";
import { isNarrowFigure, MIN_FIGURE_TEXT_PX, useFigureWidth } from "./useFigureWidth";

/**
 * Shared angle-figure renderer (same family as the table / chart / grid renderers). Callers validate with
 * isValidAngleFigureStimulus() first. Deterministic SVG from the stimulus data only: a triangle, angles on a straight line,
 * or angles around a point, with arcs and labels. Drawn to scale, and says plainly that it is not to be measured.
 * Restrained Angel palette, no gradients. The text equivalent lists the known angles and says which are unknown, but never
 * gives an unknown size.
 */
const rad = (d: number) => (d * Math.PI) / 180;
const isUnknown = (s: string) => /^[a-z]$/.test(s);

/** Angle labels stay at 16 units normally; on a very narrow figure they grow (capped) so they still render at about 10px. */
export function angleLabelFont(width: number | null): number {
  if (!isNarrowFigure(width)) return 16;
  return Math.min(22, Math.max(16, Math.ceil((MIN_FIGURE_TEXT_PX * 360) / Math.min(width, 420))));
}

export function AngleFigureStimulus({ stimulus }: { stimulus: MockAngleFigureStimulus }) {
  const [ref, width] = useFigureWidth();
  const labelFont = angleLabelFont(width);
  const W = 360;
  const H = 240;
  const labels: { x: number; y: number; text: string; unknown: boolean }[] = [];
  const arcs: string[] = [];
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];

  // Angles in degrees, anticlockwise from the +x axis; screen y points down.
  const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
    const p = (a: number) => `${cx + r * Math.cos(rad(a))} ${cy - r * Math.sin(rad(a))}`;
    return `M ${p(a0)} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 0 ${p(a1)}`;
  };

  if (stimulus.figure === "triangle") {
    const [A, B, C] = stimulus.angles.map((a) => a.size);
    const ac = (250 * Math.sin(rad(B))) / Math.sin(rad(C));
    const raw = [
      [0, 0],
      [250, 0],
      [ac * Math.cos(rad(A)), ac * Math.sin(rad(A))],
    ];
    const height = raw[2][1];
    const k = Math.min(1, 170 / height, 280 / Math.max(250, raw[2][0], 1));
    const ox = 40 + (280 - 250 * k) / 2;
    const oy = 205;
    const v = raw.map(([x, y]) => [ox + x * k, oy - y * k]);
    lines.push({ x1: v[0][0], y1: v[0][1], x2: v[1][0], y2: v[1][1] }, { x1: v[1][0], y1: v[1][1], x2: v[2][0], y2: v[2][1] }, { x1: v[2][0], y1: v[2][1], x2: v[0][0], y2: v[0][1] });
    const cen = [(v[0][0] + v[1][0] + v[2][0]) / 3, (v[0][1] + v[1][1] + v[2][1]) / 3];
    const dir = (from: number[], to: number[]) => (Math.atan2(from[1] - to[1], to[0] - from[0]) * 180) / Math.PI;
    for (let i = 0; i < 3; i++) {
      const vx = v[i];
      const dx = cen[0] - vx[0];
      const dy = cen[1] - vx[1];
      const d = Math.hypot(dx, dy);
      const pull = Math.min(42, d * 0.6);
      labels.push({ x: vx[0] + (dx / d) * pull, y: vx[1] + (dy / d) * pull + 5, text: stimulus.angles[i].shown, unknown: isUnknown(stimulus.angles[i].shown) });
      let a0 = dir(vx, v[(i + 1) % 3]);
      let a1 = dir(vx, v[(i + 2) % 3]);
      if ((a1 - a0 + 360) % 360 > 180) [a0, a1] = [a1, a0];
      if (a1 < a0) a1 += 360;
      arcs.push(arc(vx[0], vx[1], 22, a0, a1));
    }
  } else {
    const straight = stimulus.figure === "straight-line";
    const cx = 180;
    const cy = straight ? 190 : 120;
    const R = straight ? 150 : 105;
    const cumulative = [0];
    for (const a of stimulus.angles) cumulative.push(cumulative[cumulative.length - 1] + a.size);
    if (straight) lines.push({ x1: cx - R, y1: cy, x2: cx + R, y2: cy });
    const rays = straight ? cumulative.slice(1, -1) : cumulative.slice(0, -1);
    for (const a of rays) lines.push({ x1: cx, y1: cy, x2: cx + R * Math.cos(rad(a)), y2: cy - R * Math.sin(rad(a)) });
    let start = 0;
    stimulus.angles.forEach((a, i) => {
      const mid = start + a.size / 2;
      // adjacent arcs alternate radius so they read as separate angles rather than one circle
      const r = 24 + (i % 2) * 9;
      arcs.push(arc(cx, cy, r, start + 2, start + a.size - 2));
      const lr = a.size < 45 ? (straight ? 100 : 80) : r + 34;
      labels.push({ x: cx + lr * Math.cos(rad(mid)), y: cy - lr * Math.sin(rad(mid)) + 5, text: a.shown, unknown: isUnknown(a.shown) });
      start += a.size;
    });
  }

  const known = stimulus.angles.filter((a) => !isUnknown(a.shown)).map((a) => a.shown);
  const unknownLetters = stimulus.angles.filter((a) => isUnknown(a.shown)).map((a) => a.shown);
  const what = stimulus.figure === "triangle" ? "a triangle" : stimulus.figure === "straight-line" ? "angles on a straight line" : "angles around a point";
  const textEquivalent = `Angle diagram of ${what}. Known angles: ${known.join(", ")}. Unknown: ${unknownLetters.join(", ")}. Not drawn accurately.`;

  return (
    <figure className="my-4 rounded-lg border border-[var(--angel-border)] bg-[var(--angel-paper)] p-2 sm:p-3">
      {stimulus.title && <figcaption className="text-xs font-semibold text-[var(--angel-muted)] mb-1">{stimulus.title}</figcaption>}
      <div ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={textEquivalent} className="w-full h-auto max-w-[420px] mx-auto block">
        {lines.map((l, i) => (
          <line key={`l${i}`} {...l} stroke="var(--angel-blue)" strokeWidth={2.5} strokeLinecap="round" />
        ))}
        {arcs.map((d, i) => (
          <path key={`a${i}`} d={d} fill="none" stroke="var(--angel-ink)" strokeWidth={1.5} />
        ))}
        {labels.map((l, i) => (
          <text key={`t${i}`} x={l.x} y={l.y} textAnchor="middle" fontSize={labelFont} fontWeight="700" fontStyle={l.unknown ? "italic" : "normal"} fill="var(--angel-ink)">
            {l.text}
          </text>
        ))}
      </svg>
      </div>
      <p className="text-[11px] text-[var(--angel-muted)] text-center">Diagram not drawn accurately. Work the angle out; do not measure.</p>
    </figure>
  );
}
