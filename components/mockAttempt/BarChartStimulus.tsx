"use client";

import type { MockBarChartStimulus } from "@/lib/mockAttempt/types";
import { isNarrowFigure, useFigureWidth } from "./useFigureWidth";

/**
 * CSSE Completion, mathematical representation extension -- the shared bar-chart renderer, in the same family as
 * DataTableStimulus and ImageStimulus (callers validate with isValidBarChartStimulus() first; this component trusts
 * its prop). Deterministic SVG drawn from the stimulus data only; no stock image. Bars carry no value labels: reading
 * the value from the scale is the skill. A text equivalent of the data is provided to assistive technology.
 * Restrained Angel palette (blue bars, navy text); no gradients.
 */
export interface BarChartLayout {
  W: number;
  H: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
  fontSize: number;
  rotateLabels: boolean;
  labelBand: number;
  xLabelFromBottom: number;
}

/**
 * Desktop/tablet (width null or wide): the original geometry. Phone (narrow measured width): the viewBox is about the rendered
 * width, so text is drawn at close to real pixels (>= 10px), the left margin and padding shrink before any text does, and
 * category labels tilt when they would not fit their slot.
 */
export function barChartLayout(width: number | null, categories: string[], hasXLabel: boolean): BarChartLayout {
  if (!isNarrowFigure(width)) return { W: 480, H: 300, left: 52, right: 16, top: 28, bottom: 60, fontSize: 14, rotateLabels: false, labelBand: 18, xLabelFromBottom: 10 };
  const W = Math.max(260, width);
  const fontSize = 11;
  const left = 40;
  const right = 8;
  const top = 14;
  const slot = (W - left - right) / categories.length;
  const widest = Math.max(...categories.map((c) => c.length)) * fontSize * 0.58;
  const rotateLabels = widest > slot - 4;
  const labelBand = rotateLabels ? Math.ceil(Math.sin((35 * Math.PI) / 180) * widest) + 14 : 18;
  const bottom = labelBand + 8 + (hasXLabel ? 16 : 0);
  return { W, H: Math.round(top + W * 0.5 + bottom), left, right, top, bottom, fontSize, rotateLabels, labelBand, xLabelFromBottom: 6 };
}

export function BarChartStimulus({ stimulus }: { stimulus: MockBarChartStimulus }) {
  const [ref, width] = useFigureWidth();
  const { W, H, left, right, top, bottom, fontSize, rotateLabels, labelBand, xLabelFromBottom } = barChartLayout(width, stimulus.categories, Boolean(stimulus.xLabel));
  const plotW = W - left - right;
  const plotH = H - top - bottom;
  const n = stimulus.categories.length;
  const slot = plotW / n;
  const barW = Math.min(56, slot * 0.62);
  const y = (v: number) => top + plotH - (v / stimulus.axisMax) * plotH;
  const ticks: number[] = [];
  for (let t = 0; t <= stimulus.axisMax; t += stimulus.scaleStep) ticks.push(t);

  const textEquivalent = `Bar chart${stimulus.title ? `: ${stimulus.title}` : ""}. ${stimulus.categories
    .map((c, i) => `${c}: ${stimulus.values[i]}`)
    .join(", ")}. The vertical scale goes up in steps of ${stimulus.scaleStep}.`;

  return (
    <figure className="my-4 rounded-lg border border-[var(--angel-border)] bg-[var(--angel-paper)] p-2 sm:p-3">
      {stimulus.title && <figcaption className="text-xs font-semibold text-[var(--angel-muted)] mb-1">{stimulus.title}</figcaption>}
      <div ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={textEquivalent} className="w-full h-auto">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={left} x2={W - right} y1={y(t)} y2={y(t)} stroke="var(--angel-border)" strokeWidth={t === 0 ? 2 : 1} />
            <text x={left - 8} y={y(t) + 4} textAnchor="end" fontSize={fontSize} fill="var(--angel-ink)">
              {t}
            </text>
          </g>
        ))}
        <line x1={left} x2={left} y1={top} y2={top + plotH} stroke="var(--angel-ink)" strokeWidth={2} />
        {stimulus.categories.map((c, i) => {
          const cx = left + slot * i + slot / 2;
          const v = stimulus.values[i];
          return (
            <g key={c}>
              <rect x={cx - barW / 2} y={y(v)} width={barW} height={top + plotH - y(v)} fill="var(--angel-blue)" />
              <text
                x={rotateLabels ? cx + 4 : cx}
                y={top + plotH + (rotateLabels ? 12 : labelBand)}
                textAnchor={rotateLabels ? "end" : "middle"}
                transform={rotateLabels ? `rotate(-35 ${cx + 4} ${top + plotH + 12})` : undefined}
                fontSize={fontSize}
                fill="var(--angel-ink)"
              >
                {c}
              </text>
            </g>
          );
        })}
        {stimulus.yLabel && (
          <text x={fontSize} y={top + plotH / 2} textAnchor="middle" fontSize={fontSize} fill="var(--angel-muted)" transform={`rotate(-90 ${fontSize} ${top + plotH / 2})`}>
            {stimulus.yLabel}
          </text>
        )}
        {stimulus.xLabel && (
          <text x={left + plotW / 2} y={H - xLabelFromBottom} textAnchor="middle" fontSize={fontSize} fill="var(--angel-muted)">
            {stimulus.xLabel}
          </text>
        )}
      </svg>
      </div>
    </figure>
  );
}
