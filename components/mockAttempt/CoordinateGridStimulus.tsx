import type { MockCoordinateGridStimulus } from "@/lib/mockAttempt/types";

/**
 * Shared coordinate-grid renderer (same family as DataTableStimulus / BarChartStimulus / ImageStimulus). Callers validate
 * with isValidCoordinateGridStimulus() first. Deterministic SVG from the stimulus data only. Unit gridlines, bold axes with
 * numbered ticks (every unit, or every 2 on a large grid), labelled points, solid segments / shape, dashed mirror line.
 * Square cells so reflections and translations look true. Restrained Angel palette, no gradients.
 * The text equivalent names the plotted points but NOT their coordinates, because "read the coordinates" is the task.
 */
export function CoordinateGridStimulus({ stimulus }: { stimulus: MockCoordinateGridStimulus }) {
  const { xMin, xMax, yMin, yMax } = stimulus;
  const unit = Math.min(26, Math.floor(440 / Math.max(xMax - xMin, yMax - yMin)));
  const pad = 30;
  const W = (xMax - xMin) * unit + pad * 2;
  const H = (yMax - yMin) * unit + pad * 2;
  const px = (x: number) => pad + (x - xMin) * unit;
  const py = (y: number) => pad + (yMax - y) * unit;
  const tickEvery = xMax - xMin > 14 || yMax - yMin > 14 ? 2 : 1;
  const byLabel = new Map(stimulus.points.map((p) => [p.label, p]));
  const line = (a: string, b: string) => {
    const p = byLabel.get(a)!;
    const q = byLabel.get(b)!;
    return { x1: px(p.x), y1: py(p.y), x2: px(q.x), y2: py(q.y) };
  };
  const mirror = (() => {
    if (!stimulus.mirrorLine) return null;
    if (stimulus.mirrorLine === "x-axis") return { x1: px(xMin), y1: py(0), x2: px(xMax), y2: py(0) };
    if (stimulus.mirrorLine === "y-axis") return { x1: px(0), y1: py(yMin), x2: px(0), y2: py(yMax) };
    const lo = Math.max(xMin, yMin);
    const hi = Math.min(xMax, yMax);
    return { x1: px(lo), y1: py(lo), x2: px(hi), y2: py(hi) };
  })();
  const textEquivalent = `Coordinate grid, x from ${xMin} to ${xMax} and y from ${yMin} to ${yMax}. Plotted points: ${stimulus.points.map((p) => p.label).join(", ")}.${stimulus.mirrorLine ? ` A dashed mirror line is drawn along ${stimulus.mirrorLine === "y=x" ? "the line y = x" : `the ${stimulus.mirrorLine}`}.` : ""}`;

  const xs: number[] = [];
  for (let x = xMin; x <= xMax; x++) xs.push(x);
  const ys: number[] = [];
  for (let y = yMin; y <= yMax; y++) ys.push(y);

  return (
    <figure className="my-4 rounded-lg border border-[var(--angel-border)] bg-[var(--angel-paper)] p-3">
      {stimulus.title && <figcaption className="text-xs font-semibold text-[var(--angel-muted)] mb-1">{stimulus.title}</figcaption>}
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={textEquivalent} className="w-full h-auto max-w-[520px] mx-auto block">
        {xs.map((x) => (
          <line key={`gx${x}`} x1={px(x)} x2={px(x)} y1={py(yMin)} y2={py(yMax)} stroke="var(--angel-border)" strokeWidth={1} />
        ))}
        {ys.map((y) => (
          <line key={`gy${y}`} y1={py(y)} y2={py(y)} x1={px(xMin)} x2={px(xMax)} stroke="var(--angel-border)" strokeWidth={1} />
        ))}
        <line x1={px(xMin)} x2={px(xMax)} y1={py(0)} y2={py(0)} stroke="var(--angel-ink)" strokeWidth={2} />
        <line y1={py(yMin)} y2={py(yMax)} x1={px(0)} x2={px(0)} stroke="var(--angel-ink)" strokeWidth={2} />
        {xs.filter((x) => x !== 0 && x % tickEvery === 0).map((x) => (
          <text key={`tx${x}`} x={px(x)} y={py(0) + 14} textAnchor="middle" fontSize="11" fill="var(--angel-ink)">
            {x}
          </text>
        ))}
        {ys.filter((y) => y !== 0 && y % tickEvery === 0).map((y) => (
          <text key={`ty${y}`} x={px(0) - 6} y={py(y) + 4} textAnchor="end" fontSize="11" fill="var(--angel-ink)">
            {y}
          </text>
        ))}
        <text x={px(xMax) + 2} y={py(0) - 6} fontSize="13" fontWeight="600" fill="var(--angel-ink)">x</text>
        <text x={px(0) + 6} y={py(yMax) - 4} fontSize="13" fontWeight="600" fill="var(--angel-ink)">y</text>
        <text x={px(0) - 6} y={py(0) + 14} textAnchor="end" fontSize="11" fill="var(--angel-ink)">0</text>
        {mirror && <line {...mirror} stroke="var(--angel-ink)" strokeWidth={2} strokeDasharray="7 5" />}
        {stimulus.polygon && (
          <polygon
            points={stimulus.polygon.map((l) => `${px(byLabel.get(l)!.x)},${py(byLabel.get(l)!.y)}`).join(" ")}
            fill="var(--angel-sky)"
            fillOpacity={0.6}
            stroke="var(--angel-blue)"
            strokeWidth={2.5}
          />
        )}
        {stimulus.segments?.map((s) => (
          <line key={`${s.from}${s.to}`} {...line(s.from, s.to)} stroke="var(--angel-blue)" strokeWidth={2.5} />
        ))}
        {stimulus.points.map((p) => (
          <g key={p.label}>
            <circle cx={px(p.x)} cy={py(p.y)} r={5} fill="var(--angel-blue)" stroke="#fff" strokeWidth={1.5} />
            <text x={px(p.x) + 8} y={py(p.y) - 8} fontSize="14" fontWeight="700" fill="var(--angel-ink)">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
