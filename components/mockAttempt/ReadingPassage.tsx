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
      className="my-4 rounded-lg border border-[var(--angel-border)] bg-[var(--angel-sky)] p-4 md:p-5"
      aria-labelledby={headingId}
    >
      {title && (
        <h2 id={headingId} className="text-[var(--angel-navy)] font-bold text-sm md:text-base mb-2">
          {title}
        </h2>
      )}
      <p className="text-sm md:text-base text-[var(--angel-ink)] whitespace-pre-line leading-relaxed">{text}</p>
    </section>
  );
}
