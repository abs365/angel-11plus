# English Passage Eligibility — Architecture Decision Note

Programme Increment 020. Design note only — **no implementation, no migration application, no production change**. Migration 221 (the prepared, evidence-computed data reconciliation) remains **HOLD / NOT APPLIED** per the Founder's own explicit instruction: do not mutate any passage status before the rule below is designed and proven together with its code gate.

## The issue, precisely

Two eligibility signals exist for English Reading content:

- **Question-level** `ali_question_bank.eligibility_status` — confirmed, by direct code inspection, to be the **only** signal `lib/ali/questionBank.ts` (the real Practice retrieval/eligibility gate) ever consults. This is what actually controls what a learner can reach today.
- **Passage-level** `ali_passage_bank.eligibility_status` — exists, is populated (30 active passages), but is **never read by any Practice-selection code path**. Today it gates nothing.

This is why the numbers looked inconsistent (142 practice-eligible *questions*, but only 1 practice-eligible *passage*): the two fields have simply never been connected. Migration 043's own table comment shows this was not always intended to be the case — it states plainly that a passage's own eligibility/provenance was meant to "gate every question that shares this passage's id," with the enforcement explicitly deferred ("application-layer... not yet wired since zero passages exist") at a time when no real passage existed yet. That wiring was never built once real passages arrived.

**Verdict: a designed-but-never-wired reachability gate**, not intentional governance and not (by itself) a reachability defect in the sense of "learners see the wrong content" — because nothing currently enforces the passage-level field, no learner has ever been incorrectly blocked or incorrectly admitted by it. The risk is the opposite: the field currently provides **no real protection at all**, despite looking like it does.

## Recommended future rule (design only)

A Reading question should be learner-reachable only when **both**:

1. the question's own `eligibility_status` permits the requested use (Practice or Mock, exactly as today), **and**
2. its containing passage's own `eligibility_status` (resolved via `ali_question_bank.learning_unit_id = ali_passage_bank.id`) also permits that same use.

With one absolute precedence rule, carried over unchanged from `lib/ali/inventoryClass.ts`'s own established discipline: **Mock exposure / SEALED protection always wins**, at both levels independently. A question already protected by `ali_mock_exposed_question_ids` stays protected regardless of its passage's status, and a passage already protected by `ali_mock_exposed_passage_ids` (or at `mock_eligible`) must block every one of its questions from Practice regardless of what any individual question row says — the exact "one mistagged row cannot leak" property migration 043's own comment already named as the goal.

This makes the passage field a genuine **floor**, never a grant: a passage can only ever narrow what its questions are allowed to do, never widen it. A question that is not independently practice-eligible is never made reachable merely because its passage is.

## Remediation questions on a Practice passage

The same rule extends unchanged: a remediation question that shares a passage's `learning_unit_id` is gated by that passage's own status exactly like any other question tied to it — there is no separate remediation-specific carve-out, since remediation content reuses the same passage context and must respect the same floor.

## Why this is not implemented now

Building the actual code gate (a change to `lib/ali/questionBank.ts`'s retrieval query or a post-filter) without first reconciling the passage-level data (migration 221, still on HOLD) would immediately and silently break all 142 currently-reachable Practice questions whose passages were never promoted to match — a real regression, not a fix. The Founder's own instruction is exactly right to require the rule and the data to be proven together, not sequenced apart. This note exists so that when the English Reading scale wave begins, the rule is already agreed and does not need re-deriving from scratch.

## What must happen together, in the future English Reading scale wave

1. Design/finalise the exact SQL shape of the join (a view, a function, or an inline join in `questionBank.ts` — an implementation choice not made here).
2. Reconcile passage-level data to match already-live reality (migration 221, or its successor at that time) — applied together with, not before, step 3.
3. Wire the real two-level gate into `lib/ali/questionBank.ts`.
4. Add test coverage proving: a question whose passage is SEALED/Mock-exposed is never reachable even if the question row itself says otherwise; a question whose passage is below practice-eligible is never reachable even if the question row itself says practice-eligible; the existing 142 known-live questions remain reachable after the change (a regression guard).

None of this is started. Recorded here so it is not re-discovered from zero next time.
