import { redirect } from "next/navigation";

/**
 * Programme Completion Increment 011 — Writing Learner Surface
 * Consolidation. `/writing` was the pre-CSSE-pathway-migration Writing
 * Practice route (reached only via `/learn`'s legacy, non-CSSE nav
 * branch — the CSSE-pathway "Practise" tab has always pointed at
 * `/learning-intelligence/practice`, never here; `lib/learningEngine/
 * legacyPracticeEvidence.ts`'s own filename already named this route's
 * evidence path "legacy"). It independently re-implemented content
 * fetching, the checklist, and evidence recording rather than reusing
 * the canonical Practice engine — most visibly, it never applied the
 * core-instruction/Angel-coaching separation
 * (lib/writing/supportLevelPolicy.ts) the canonical engine already
 * enforces, so a learner reaching Writing through this route always saw
 * the full coaching checklist with no Guided/Independent distinction
 * (Increment 010's own finding).
 *
 * `/learning-intelligence/practice/continuous-writing`
 * (app/learning-intelligence/practice/[area]/page.tsx) is the one real
 * canonical Practice engine, already shared, unforked, across Reading,
 * Mathematics, and Writing alike: the same `generatePersonalisedSession`/
 * `fetchQuestionBank` content fetch every subject uses, the same
 * `recordAndAdvance` evidence pipeline (`recordOutcome` ->
 * `processEvidenceForCompetency`, identical to what Reading/Maths already
 * write through), the same shared `WritingFeedback` display component,
 * and the only place `presentWritingChecklistForContext` (Guided/
 * Independent core-vs-coaching separation) and the writing-reflective-
 * discursive teaching scaffold (Increment 006's fix) are actually wired
 * in. All Writing content in `ali_question_bank` is CSSE-pathway content
 * (`pathway = ['csse']`) without exception, so this redirect changes
 * nothing about WHAT a learner can reach — only routes them to the one
 * place that presents it correctly and records evidence through the one
 * real evidence pipeline.
 *
 * The route itself is preserved, not deleted — `/learn`, `lib/
 * parentInsights.ts`, and `lib/replayEngine.ts` all still link here, and
 * this keeps every one of those links valid rather than breaking them.
 */
export default function WritingRedirect() {
  redirect("/learning-intelligence/practice/continuous-writing");
}
