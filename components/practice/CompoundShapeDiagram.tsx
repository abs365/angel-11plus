import type { CompoundRectilinearDiagram } from "@/types/index";

/**
 * Programme Increment 020, Part 11 — deterministic, renderable diagram
 * for a compound rectilinear (right-angled) 2D shape, built directly from
 * a question's own `prompt.diagram` (see CompoundRectilinearDiagram's own
 * docstring, types/index.ts). Plain inline SVG generated from the
 * supplied vertex coordinates -- no image asset, no external library, no
 * decorative content. This is the first diagram anywhere in Mathematics
 * content (the Increment 017/018 audit's own confirmed finding: "zero
 * diagrams, images, or charts anywhere").
 *
 * Deliberately narrow scope: a simple, non-self-intersecting rectilinear
 * polygon only (every interior angle 90° or 270°, matching every real
 * compound-shape question this increment authors) -- not a general
 * geometry renderer.
 */

const PADDING = 28;
const VIEW_SIZE = 240;

function scaleVertices(vertices: { x: number; y: number }[]): { x: number; y: number }[] {
  const xs = vertices.map((v) => v.x);
  const ys = vertices.map((v) => v.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const drawable = VIEW_SIZE - PADDING * 2;
  const scale = Math.min(drawable / spanX, drawable / spanY);
  // Centre the scaled shape inside the viewBox.
  const scaledSpanX = spanX * scale;
  const scaledSpanY = spanY * scale;
  const offsetX = PADDING + (drawable - scaledSpanX) / 2;
  const offsetY = PADDING + (drawable - scaledSpanY) / 2;
  return vertices.map((v) => ({
    x: offsetX + (v.x - minX) * scale,
    y: offsetY + (v.y - minY) * scale,
  }));
}

export function CompoundShapeDiagram({ diagram }: { diagram: CompoundRectilinearDiagram }) {
  const points = scaleVertices(diagram.vertices);
  const n = points.length;
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";

  return (
    <svg
      viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
      role="img"
      aria-label="A diagram of the shape described in this question, with its known side lengths labelled."
      className="w-full max-w-[240px] mx-auto"
    >
      <path
        d={pathD}
        className="fill-sky-50 dark:fill-sky-950 stroke-gray-700 dark:stroke-gray-300"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {diagram.edgeLabels.map(({ edgeIndex, label }) => {
        const a = points[edgeIndex % n];
        const b = points[(edgeIndex + 1) % n];
        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2;
        // Offset the label outward from the shape's own centroid so it never sits on top of the edge itself.
        const centroidX = points.reduce((sum, p) => sum + p.x, 0) / n;
        const centroidY = points.reduce((sum, p) => sum + p.y, 0) / n;
        const dx = midX - centroidX;
        const dy = midY - centroidY;
        const len = Math.hypot(dx, dy) || 1;
        const labelX = midX + (dx / len) * 14;
        const labelY = midY + (dy / len) * 14;
        return (
          <text
            key={edgeIndex}
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-gray-800 dark:fill-gray-200 text-[11px] font-semibold"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
