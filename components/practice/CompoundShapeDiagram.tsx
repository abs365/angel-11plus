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
  const accessibleName = diagram.notToScale
    ? "A diagram of the shape described in this question, with its known side lengths labelled. This diagram is not drawn to scale."
    : "A diagram of the shape described in this question, with its known side lengths labelled.";

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        role="img"
        aria-label={accessibleName}
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
      {/* Founder Educational Review amendment (Increment 020 Wave 1) -- a
          visible, learner-facing notice for the one diagram whose vertices
          are deliberately schematic, never proportionally accurate, so an
          "unknown" edge's true value can never be read off the rendering. */}
      {diagram.notToScale && (
        <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 mt-1 italic">Diagram not drawn to scale.</p>
      )}
    </div>
  );
}

/**
 * Post-Activation Diagram Rendering Repair — a question's prompt sets
 * EITHER `diagram` (one shape) OR `diagrams` (an ordered array, for
 * comparison-style questions such as "Shape A ... Shape B ... which is
 * larger?"), never both. This wrapper is the single place that decision is
 * made, so the Practice page itself doesn't need to duplicate it, and so
 * the decision is independently testable via `renderToStaticMarkup`
 * without needing to render the whole Practice page.
 *
 * `diagrams` reuses CompoundShapeDiagram per entry (same per-shape schema
 * as `diagram`) rather than a second renderer. Array order is preserved
 * exactly — it is the question's own canonical shape order, never
 * re-sorted. Captions are generic ("Diagram N of M") rather than derived
 * from the question's prose (e.g. "Shape A"), since nothing guarantees
 * every future plural-diagram question follows that same convention.
 */
export function CompoundShapeDiagramGroup({
  diagram,
  diagrams,
}: {
  diagram?: CompoundRectilinearDiagram;
  diagrams?: CompoundRectilinearDiagram[];
}) {
  if (diagram) {
    return (
      <div className="mb-3">
        <CompoundShapeDiagram diagram={diagram} />
      </div>
    );
  }
  if (diagrams && diagrams.length > 0) {
    return (
      <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {diagrams.map((d, i) => (
          <div key={i}>
            <p className="text-center text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Diagram {i + 1} of {diagrams.length}
            </p>
            <CompoundShapeDiagram diagram={d} />
          </div>
        ))}
      </div>
    );
  }
  return null;
}
