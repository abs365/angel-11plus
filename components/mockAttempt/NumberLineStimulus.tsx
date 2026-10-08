import type { MockNumberLineStimulus } from "@/lib/mockAttempt/types";

/**
 * Shared number-line renderer (same family as the table / chart / grid / angle renderers). Callers validate with
 * isValidNumberLineStimulus() first. Deterministic SVG from the stimulus data only: a horizontal line, labelled major
 * ticks, shorter unlabelled minor ticks, and labelled arrow markers for the points. Restrained Angel palette, no gradients.
 * The text equivalent names the points but NOT their values, because reading the value is the task.
 */
function decimalsOf(n: number): number {
  const m = Math.round(Math.abs(n) * 1000);
  if (m % 1000 === 0) return 0;
  if (m % 100 === 0) return 1;
  if (m % 10 === 0) return 2;
  return 3;
}

export function NumberLineStimulus({ stimulus }: { stimulus: MockNumberLineStimulus }) {
  const { min, max, majorStep, minorDivisions } = stimulus;
  const W = 520;
  const H = 110;
  const pad = 36;
  const y0 = 66;
  const px = (v: number) => pad + ((v - min) / (max - min)) * (W - pad * 2);
  const dec = decimalsOf(majorStep);
  const intervals = Math.round((max - min) / majorStep);
  const ticks: { v: number; major: boolean }[] = [];
  for (let i = 0; i <= intervals; i++) {
    ticks.push({ v: min + i * majorStep, major: true });
    if (i < intervals) for (let j = 1; j < minorDivisions; j++) ticks.push({ v: min + i * majorStep + (j * majorStep) / minorDivisions, major: false });
  }
  const fmt = (v: number) => (Math.abs(v) < 1e-9 ? 0 : v).toFixed(dec);
  const textEquivalent = `Number line from ${fmt(min)} to ${fmt(max)}, with labelled marks every ${fmt(majorStep)}${minorDivisions > 1 ? ` and ${minorDivisions - 1} smaller marks between each pair` : ""}. Marked points: ${stimulus.points.map((p) => p.label).join(", ")}.`;

  return (
    <figure className="my-4 rounded-lg border border-[var(--angel-border)] bg-[var(--angel-paper)] p-3">
      {stimulus.title && <figcaption className="text-xs font-semibold text-[var(--angel-muted)] mb-1">{stimulus.title}</figcaption>}
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={textEquivalent} className="w-full h-auto max-w-[560px] mx-auto block">
        <line x1={px(min)} x2={px(max)} y1={y0} y2={y0} stroke="var(--angel-ink)" strokeWidth={2.5} strokeLinecap="round" />
        {ticks.map((t, i) => (
          <line key={`k${i}`} x1={px(t.v)} x2={px(t.v)} y1={y0 - (t.major ? 9 : 5)} y2={y0 + (t.major ? 9 : 5)} stroke="var(--angel-ink)" strokeWidth={t.major ? 2 : 1.25} />
        ))}
        {ticks.filter((t) => t.major).map((t, i) => (
          <text key={`m${i}`} x={px(t.v)} y={y0 + 28} textAnchor="middle" fontSize="14" fill="var(--angel-ink)">
            {fmt(t.v)}
          </text>
        ))}
        {stimulus.points.map((p) => (
          <g key={p.label}>
            <path d={`M ${px(p.value)} ${y0 - 3} l -7 -14 l 14 0 z`} fill="var(--angel-blue)" />
            <text x={px(p.value)} y={y0 - 24} textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--angel-ink)">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
