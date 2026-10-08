import type { MockBarChartStimulus } from "@/lib/mockAttempt/types";

/**
 * CSSE Completion, mathematical representation extension -- the shared bar-chart renderer, in the same family as
 * DataTableStimulus and ImageStimulus (callers validate with isValidBarChartStimulus() first; this component trusts
 * its prop). Deterministic SVG drawn from the stimulus data only; no stock image. Bars carry no value labels: reading
 * the value from the scale is the skill. A text equivalent of the data is provided to assistive technology.
 * Restrained Angel palette (blue bars, navy text); no gradients.
 */
export function BarChartStimulus({ stimulus }: { stimulus: MockBarChartStimulus }) {
  const W = 480; // narrow viewBox so text stays readable when the chart shrinks to a phone width
  const H = 300;
  const left = 52;
  const right = 16;
  const top = 28;
  const bottom = 60;
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
    <figure className="my-4 rounded-lg border border-[var(--angel-border)] bg-[var(--angel-paper)] p-3">
      {stimulus.title && <figcaption className="text-xs font-semibold text-[var(--angel-muted)] mb-1">{stimulus.title}</figcaption>}
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={textEquivalent} className="w-full h-auto">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={left} x2={W - right} y1={y(t)} y2={y(t)} stroke="var(--angel-border)" strokeWidth={t === 0 ? 2 : 1} />
            <text x={left - 8} y={y(t) + 4} textAnchor="end" fontSize="14" fill="var(--angel-ink)">
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
              <text x={cx} y={top + plotH + 18} textAnchor="middle" fontSize="14" fill="var(--angel-ink)">
                {c}
              </text>
            </g>
          );
        })}
        {stimulus.yLabel && (
          <text x={14} y={top + plotH / 2} textAnchor="middle" fontSize="14" fill="var(--angel-muted)" transform={`rotate(-90 14 ${top + plotH / 2})`}>
            {stimulus.yLabel}
          </text>
        )}
        {stimulus.xLabel && (
          <text x={left + plotW / 2} y={H - 10} textAnchor="middle" fontSize="14" fill="var(--angel-muted)">
            {stimulus.xLabel}
          </text>
        )}
      </svg>
    </figure>
  );
}
