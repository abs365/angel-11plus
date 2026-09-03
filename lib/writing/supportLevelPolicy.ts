/**
 * Decision 256 — Increment 003 Writing Assessment-Scaffolding Amendment.
 *
 * Decision 255 recorded "An Invented Place" as `approved_with_amendment`:
 * the core imaginative Writing task is educationally sound, but its
 * stored learner-facing checklist is too prescriptive for authentic
 * independent/formal assessment presentation (it coaches HOW to write —
 * setting specificity, sensory/emotional technique, response-development,
 * internal-consistency — rather than only stating WHAT the task requires).
 *
 * This module separates PRESENTATION POLICY from CONTENT: it never
 * changes, deletes, or duplicates a prompt's stored checklist. It is a
 * pure, generic classifier + filter any Continuous Writing delivery
 * surface (present or future) can call with a prompt id, its own stored
 * checklist, and the educational context it is being shown in, to decide
 * which items to render. No existing route currently calls this (see the
 * Decision 256 handoff report — Increment 003 QT-WC-01a content, including
 * "An Invented Place", is not yet wired into any learner-facing delivery
 * route; only `data/writing.ts`'s unrelated legacy prompt set is), so
 * calling it does not itself activate Practice or Mock for this content.
 */

export type WritingSupportContext = "teaching" | "independent" | "mock";

export const WRITING_SUPPORT_CONTEXTS: WritingSupportContext[] = ["teaching", "independent", "mock"];

export type ChecklistItemSupportLevel = "core" | "coaching";

/**
 * `core` — a task-completion or technical-accuracy requirement (length,
 * proofreading) or an exam-appropriateness/safety constraint. Authentic
 * to any formal assessment presentation; never suppressed.
 *
 * `coaching` — prescriptive instruction on HOW to write well: avoiding
 * vagueness/genericness, required sensory/emotional detail, internal-
 * consistency coaching, response-development/structuring strategy, voice
 * or vocabulary technique. Valuable instructional scaffolding for
 * Teaching/Guided Practice; reduced for Independent Practice; suppressed
 * for Mock/formal assessment, where Angel measures independent
 * application rather than checklist-following (Decision 256 §3,
 * anti-memorisation).
 *
 * Classification is index-aligned with each prompt's own stored
 * `checklist` array (never re-ordered, never re-worded). Every one of the
 * 7 real, live QT-WC-01a rows (migrations 098, 153, 167 — the complete
 * live set; confirmed by grep, no other applied QT-WC-01a rows exist) is
 * classified below, item by item, against its own actual checklist text.
 * Further ids (migrations 169, 196, 198 — Decisions 259/Programme
 * Completion Increments 003/005) are also classified here even though
 * some of those migrations are NOT applied — each id is `authentic_
 * assessment_candidate`-only, unreachable content until a human promotes
 * it, but classifying it now means no unaudited-content default is ever
 * relied on once it does become reachable. An unlisted prompt id, or an
 * index beyond a listed prompt's classified length, defaults to
 * `coaching` (see `checklistItemSupportLevel`) — new or unaudited content
 * is never assumed safe for Mock; a human author must explicitly record
 * an item as `core`.
 *
 * Programme Completion Increment 005 correction: `wrt-003` and migration
 * 196's two rows (`eng-pc003-writing-difficulttask`,
 * `eng-pc003-writing-meaningfulplace`) were reachable content (wrt-003 via
 * the pre-Decision-152 Practice pool history; migration 196's rows once
 * promoted) with NO entry here at all, meaning every one of their items —
 * including the length requirement and the proofreading check — silently
 * defaulted to `coaching` and would have been stripped from both
 * Independent and Mock presentation. Closed this increment, alongside the
 * two new Increment 005 rows (migration 198), so no candidate content
 * ships without an explicit classification again.
 */
export const WRITING_CHECKLIST_ITEM_SUPPORT_LEVELS: Record<string, ChecklistItemSupportLevel[]> = {
  // Migration 013 — the original illustrative prompt (`provisional`,
  // forced-fit persuasive-speech register, never promoted to Practice).
  // No explicit sentence-count item exists on this older row; item 3
  // ("Use three separate, distinct arguments (one per paragraph)") is the
  // closest analogue to every later prompt's length requirement, so it is
  // classified `core` alongside the closing proofreading check.
  "wrt-003": ["coaching", "coaching", "core", "coaching", "coaching", "coaching", "coaching", "coaching", "core"],

  // Migration 167 — Increment 003. The amendment's own named example.
  "eng-inc003-writing-imaginedplace-01": ["core", "coaching", "coaching", "coaching", "coaching", "core"],

  // Migration 098 — the 3 originally-certified prompts.
  "mock-writing-mindchange-01": ["core", "coaching", "coaching", "coaching", "coaching", "coaching", "core"],
  "mock-writing-kindness-01": ["core", "coaching", "coaching", "coaching", "coaching", "coaching", "core"],
  "mock-writing-cookopinion-01": ["core", "coaching", "coaching", "coaching", "coaching", "coaching", "core"],

  // Migration 153 — Increment 001's 3 candidate prompts.
  "mock-writing-newplace-01": ["core", "coaching", "coaching", "coaching", "coaching", "core"],
  // Item 3 here ("Avoid choosing a mistake so serious or personal that it
  // would be uncomfortable to write about in an exam setting") is an
  // exam-appropriateness/safety constraint, not a writing-technique —
  // classified `core`, unlike every other coaching-shaped item.
  "mock-writing-mistakelearned-01": ["core", "coaching", "coaching", "coaching", "core", "core"],
  "mock-writing-screentime-01": ["core", "coaching", "coaching", "coaching", "coaching", "coaching", "core"],

  // Migration 169 — Decision 259 Writing depth extension (candidate
  // content, `authentic_assessment_candidate` only; classified here on
  // authoring so no unaudited-content default is ever relied on for
  // these two ids).
  "eng-inc003-writing-favouriteplace-01": ["core", "coaching", "coaching", "coaching", "coaching", "core"],
  "eng-inc003-writing-pocketmoney-01": ["core", "coaching", "coaching", "coaching", "coaching", "coaching", "core"],

  // Migration 196 — Programme Completion Increment 003 (candidate
  // content; classification was missing until this Increment 005 fix).
  "eng-pc003-writing-difficulttask": ["core", "coaching", "coaching", "coaching", "coaching", "coaching", "core"],
  "eng-pc003-writing-meaningfulplace": ["core", "coaching", "coaching", "coaching", "coaching", "core"],

  // Migration 198 — Programme Completion Increment 005 (candidate
  // content, classified on authoring).
  "eng-pc005-writing-personinfluence": ["core", "coaching", "coaching", "coaching", "coaching", "core"],
  "eng-pc005-writing-somethingnew": ["core", "coaching", "coaching", "coaching", "coaching", "core"],
};

export function checklistItemSupportLevel(promptId: string | null, index: number): ChecklistItemSupportLevel {
  if (!promptId) return "coaching";
  const levels = WRITING_CHECKLIST_ITEM_SUPPORT_LEVELS[promptId];
  return levels?.[index] ?? "coaching";
}

/**
 * The single generic reminder shown in place of itemised coaching for
 * Independent Practice — deliberately non-prescriptive (it names no
 * technique), so it cannot itself become a new fixed formula a learner
 * could mechanically satisfy (Decision 256 §3).
 */
export const INDEPENDENT_PRACTICE_REMINDER =
  "Plan and write your response independently, using what the task above asks for.";

/**
 * Pure. Returns the checklist a learner should actually see for a given
 * context, derived from the prompt's own stored checklist — never a
 * second copy of the prompt, never a rewrite of any item's text.
 *
 * - teaching: the full stored checklist, unchanged (Decision 256 §1.A).
 * - independent: only `core` items, plus one generic non-prescriptive
 *   reminder if any `coaching` items exist to reduce (Decision 256 §1.B,
 *   §3). If a prompt is 100% `core` already (or unclassified — every
 *   real prompt above is fully classified), no reminder is manufactured.
 * - mock: only `core` items — the authentic task instructions required
 *   for the assessment; the prompt text itself (never filtered by this
 *   function) already carries the task's substantive requirement
 *   (Decision 256 §1.C).
 */
export function presentWritingChecklistForContext(
  promptId: string | null,
  checklist: string[],
  context: WritingSupportContext
): string[] {
  if (context === "teaching") return checklist;

  const core = checklist.filter((_, i) => checklistItemSupportLevel(promptId, i) === "core");

  if (context === "mock") return core;

  const hasCoaching = checklist.some((_, i) => checklistItemSupportLevel(promptId, i) === "coaching");
  return hasCoaching ? [...core, INDEPENDENT_PRACTICE_REMINDER] : core;
}

/**
 * Decision 257 — the real, existing "does a Guided Practice difference
 * exist for this family" signal, reused unchanged from the same
 * getWritingTeachingContent/getWritingTaskFamilyForPromptType pair
 * WritingActivity already calls for its worked-example toggle. Extracted
 * here (rather than left inline in the page component) so the eligibility
 * rule that seeds the session's guided-families set is unit-testable
 * without a DOM/React harness, matching this repo's existing convention
 * (see lib/learningEngine/practiceInteractionGuard.ts).
 */
export function isWritingFamilyGuidedEligible(
  familyId: string | null | undefined,
  promptType: string | null | undefined,
  hasTeachingContentForType: (promptType: string | null | undefined) => boolean
): boolean {
  return Boolean(familyId) && hasTeachingContentForType(promptType);
}

/**
 * Maps the real, existing Guided Practice toggle (identical control to
 * Reading/Maths) to a WritingSupportContext. Only two of the three
 * contexts are reachable through this mapping: there is no live Mock
 * renderer for Continuous Writing yet (app/mocks/[pathway] explicitly
 * excludes Writing content — "we don't yet have enough original English
 * comprehension and writing content to honestly represent a full CSSE
 * English paper"), so "mock" is never produced here. It remains a valid
 * WritingSupportContext for whenever a Mock Writing renderer exists, and
 * for the admin review preview, which can show all three without a live
 * route.
 */
export function writingSupportContextForGuidedToggle(guidedMode: boolean): WritingSupportContext {
  return guidedMode ? "teaching" : "independent";
}
