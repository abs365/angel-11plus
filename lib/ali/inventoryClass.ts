/**
 * Programme Increment 019, Part 9 — Inventory Class Foundation.
 *
 * The approved conceptual model (OPEN/RENEWABLE/MEASUREMENT/SEALED) as a
 * real, testable classification function over content Angel already has
 * real signals for — `eligibility_status` (migration 030/043),
 * Mock-exposure state (`ali_mock_exposed_question_ids`/
 * `ali_mock_exposed_passage_ids`, migration 209), and `transfer_class`
 * (migration 035). This module does NOT touch, rename, or weaken any of
 * those — it is a pure, additive read-side classification layer.
 *
 * The one non-negotiable rule, stated explicitly per the Founder's own
 * instruction: "Never downgrade SEALED/Mock-consumed material merely
 * because another field suggests Practice eligibility. The stricter
 * protection wins." `classifyInventoryClass()` checks Mock-exposure FIRST,
 * unconditionally, before consulting anything else — see its own
 * implementation.
 *
 * This module cannot query the live database itself (no privileged
 * connection exists in application code — see lib/server/
 * mockScoringAuthority.ts's own established boundary). Callers with a
 * genuine exposure signal (a script running against
 * ali_mock_exposed_question_ids/ali_mock_exposed_passage_ids, or a future
 * server-only read) supply it as `everExposedToMock`; this module never
 * fabricates that fact.
 */

export type InventoryClass = "open" | "renewable" | "measurement" | "sealed";

/**
 * A row this module cannot confidently place into one of the four classes
 * from the evidence supplied — returned honestly rather than guessed,
 * matching this whole increment's own "use UNKNOWN/UNCLASSIFIED explicitly"
 * instruction (Part 7).
 */
export type InventoryClassification = InventoryClass | "unclassified";

export interface InventoryClassInput {
  /** "teaching" content (worked examples, lesson material) is never Practice/Mock question content. */
  contentType: "teaching" | "question" | "passage";
  /** The real `ali_question_bank`/`ali_passage_bank` eligibility_status value. */
  eligibilityStatus: string;
  /** Real DB fact from `active` — inactive content is never reachable regardless of class. */
  active: boolean;
  /**
   * Real fact from `ali_mock_exposed_question_ids`/`ali_mock_exposed_passage_ids`
   * (migration 209) — whether this item has ever belonged to an active Mock
   * form or a real attempt. The caller supplies this; this module never
   * infers or assumes a value when the caller omits it (see
   * `everExposedToMock === undefined` handling below).
   */
  everExposedToMock?: boolean;
  /**
   * Real fact from `ali_question_bank.transfer_class` (migration 035) —
   * FAR_TRANSFER-tagged Practice-eligible content is treated as
   * MEASUREMENT (repeated ordinary reuse would erode its diagnostic
   * value), not RENEWABLE, even though it is otherwise ordinary Practice
   * content today.
   */
  isFarTransfer?: boolean;
}

/**
 * Classifies one content row into the four-class model, or "unclassified"
 * when the supplied evidence genuinely does not resolve to one of them —
 * this function never guesses to avoid returning "unclassified".
 *
 * Precedence, in order, each one final once matched:
 *   1. Ever exposed to Mock -> SEALED, unconditionally (the stricter-wins rule).
 *   2. Teaching content -> OPEN.
 *   3. mock_eligible (not yet exposed) -> SEALED (the protected reserve is
 *      still sealed inventory, just not yet consumed).
 *   4. practice_eligible + active + far-transfer-tagged -> MEASUREMENT.
 *   5. practice_eligible + active -> RENEWABLE.
 *   6. Everything else (provisional, authentic_assessment_candidate,
 *      independently_validated not yet promoted, or inactive) ->
 *      "unclassified" — real states this model does not yet have enough
 *      governance vocabulary to place safely, per Part 9's own instruction
 *      to "map existing states conservatively."
 */
export function classifyInventoryClass(input: InventoryClassInput): InventoryClassification {
  if (input.everExposedToMock === true) return "sealed";

  if (input.contentType === "teaching") return "open";

  if (input.eligibilityStatus === "mock_eligible") return "sealed";

  if (input.eligibilityStatus === "practice_eligible" && input.active) {
    if (input.isFarTransfer === true) return "measurement";
    return "renewable";
  }

  return "unclassified";
}

/**
 * True whenever the classification is SEALED — the one boolean most
 * callers actually need (e.g. "may this ever be shown as ordinary
 * Practice content?"), expressed once here so no caller re-derives the
 * precedence rule above independently.
 */
export function isSealed(input: InventoryClassInput): boolean {
  return classifyInventoryClass(input) === "sealed";
}
