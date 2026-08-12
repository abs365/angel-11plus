/**
 * Admissions Historical Context (Sprint 5, WP5A — Admissions Readiness
 * Foundation; restructured WP5E — Historical Context, for consistent reuse
 * across every Admissions Intelligence surface). Exactly one real, sourced
 * admissions fact this platform holds: CSSE's own published Consortium-wide
 * combined-score floor.
 *
 * Cited to ASSESSMENT_BRAIN_V1.md §2, Observation 1 (HIGH confidence,
 * Asset CSSE-001, "Information Guide, 2027 Entry") — frozen, unmodified.
 * A single static fact, not per-school variable data, so it lives here as
 * a disclosed constant (same pattern as WRITING_CORRECTNESS_THRESHOLD,
 * COMPONENT_REVISION_MINUTES elsewhere in this codebase) rather than the
 * `school`/`school_admission_threshold` schema EDUCATIONAL_INTELLIGENCE_
 * ENGINE_V1.md §11 explicitly reserves for real per-school data acquisition
 * this design does not perform.
 *
 * Governing rule, restated exactly (EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md
 * §10): may be shown to a parent only as a separate, historical fact
 * placed BESIDE — never blended into — the Engine's own Readiness output.
 * Never phrase this as a prediction, a target, or a claim about a specific
 * child. Not comparable to Angel's own mock scores without disclosure —
 * Angel does not replicate CSSE's real age-standardisation methodology.
 *
 * WP5E split the original single paragraph into four distinct strings —
 * fact, relevance, and disclaimer are separate REQUIREMENTS (explain why
 * it's shown; explicitly state what it does not imply), not one merged
 * sentence a reader could skim past. Render via components/parent/
 * HistoricalContextPanel.tsx everywhere this fact is shown, so the label,
 * structure, and wording are identical on every page — not re-typed.
 */
export const CSSE_COMBINED_SCORE_FLOOR = 303;

/** The fact itself — nothing about this child, only about CSSE. */
export const CSSE_ADMISSIONS_CONTEXT_FACT =
  `CSSE's own published guidance states that no offer is made below a combined score of ${CSSE_COMBINED_SCORE_FLOOR} ` +
  "across the English and Maths papers (age-standardised, weighted 50/50).";

/** Why this is shown at all, alongside the Engine's own evidence. */
export const CSSE_ADMISSIONS_CONTEXT_RELEVANCE =
  "This is shown because it's the one real, published fact about how CSSE itself admits students. Useful context " +
  "alongside your child's own recorded evidence, not part of it.";

/** What it explicitly does not mean — kept separate so it can't be skimmed past. */
export const CSSE_ADMISSIONS_CONTEXT_DISCLAIMER =
  "This is not a score your child has been given, not a target to reach, and not a prediction of whether they " +
  "will be offered a place. Angel's own scores are not on the same scale as CSSE's real, age-standardised result.";

export const CSSE_ADMISSIONS_CONTEXT_SOURCE =
  "Source: CSSE Information Guide, 2027 Entry (Assessment Brain V1, Observation 1).";

/** @deprecated Superseded by the four split strings above (WP5E). Kept only in case any external reference still imports it; no in-repo caller after WP5E. */
export const CSSE_ADMISSIONS_CONTEXT_TEXT = `${CSSE_ADMISSIONS_CONTEXT_FACT} ${CSSE_ADMISSIONS_CONTEXT_DISCLAIMER}`;
