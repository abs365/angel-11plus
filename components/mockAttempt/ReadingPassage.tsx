/**
 * Programme Completion Increment 016 (production defect correction) —
 * the smallest generic, reusable renderer for a Reading Comprehension
 * question's own passage. Mirrors DataTableStimulus.tsx's own
 * established shape exactly: every value comes from props, nothing
 * hard-coded, no page-specific logic. `title` is optional (a passage
 * could in principle carry text with no title); `text` is required —
 * callers only render this component when `passageText` is genuinely
 * present (`payload.passageText && <ReadingPassage .../>`), matching
 * every other conditional-stimulus render site in this file.
 *
 * Real semantic markup (<section aria-labelledby>/<h2>) rather than a
 * plain <div>, so the passage has an accessible name and is
 * distinguishable from the question that follows it by assistive
 * technology, not just by visual position.
 */
export function ReadingPassage({ title, text }: { title: string | null; text: string }) {
  const headingId = title ? `${title.replace(/\s+/g, "-").toLowerCase()}-passage-heading` : undefined;
  return (
    <section
      className="my-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 p-4"
      aria-labelledby={headingId}
    >
      {title && (
        <h2 id={headingId} className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h2>
      )}
      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">{text}</p>
    </section>
  );
}
