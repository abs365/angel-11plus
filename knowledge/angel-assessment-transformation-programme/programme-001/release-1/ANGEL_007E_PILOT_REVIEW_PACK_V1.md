# Angel 11+ — 007E Pilot Review Pack

**Purpose:** the bounded first human-review batch, per the Founder's Part 8 instruction. A real reviewer (meeting `ANGEL_EDUCATIONAL_REVIEW_STANDARD_V1.md §2`'s qualification standard) should start here, using `/admin-beta/review`, not the full backlog.

**Status: CLOSED, 7 of 7 approved.** Per Decision 51 (`ALI_DECISION_LOG.md`), reviewer Ayobami Lawal decided `approved` for all 7 targets below, on the strength of the Founder's own authenticated Table Editor inspection of `public.ali_family_review`. Educational Increment 007G computed and generated the resulting controlled-activation migration (055) from this decision.

## Why these 6 targets

Prioritises English because releasing the new English supply has the highest immediate learner value (Part 8), covers every family the Founder's own directives repeatedly named as a priority (multi-select, sequencing, quote-explain, two-character, vocabulary-in-context — 007C Part 8, 007D Part 8), includes one complete passage (Part 8's explicit requirement — passages are never covered by family-level sampling, Operating Model §3), and includes one Mathematics family so the operating model is demonstrated across both subjects in the same pilot, not just English.

| # | Target | Type | Why this one |
|---|---|---|---|
| 1 | `wave2-fam-multiselect` | question_family | Newest family (6 instances, evidenced by a single CSSE year only — the thinnest evidence base in the programme, so the reviewer's judgement matters most here). |
| 2 | `wave1-fam-sequencing` | question_family | 15 instances, 3 structurally distinct sub-types added in 007C completion (reorder, action-reconstruction, cause/effect, dispersed-evidence) — tests whether family-level review genuinely covers structural variety, not just the original pattern. |
| 3 | `wave1-fam-quote-explain` | question_family | 13 instances; the single most frequent real CSSE question pattern across all 3 years read (007A evidence). |
| 4 | `wave1-fam-two-character` | question_family | 6 instances, exactly at its coverage-matrix floor — the family with the least room for error if review finds a defect. |
| 5 | `wave1-fam-vocab-explain` | question_family | 17 instances, largest family by volume, gained a FULL worked example only at 007C completion — good test of whether the newest teaching material holds up under review. |
| 6 | `wave2-eng-surprise` | passage | The most recently authored passage (007C completion), carrying 2 of the priority families (two-character, multiselect) at once — reviewing it also reviews real instances of targets 1 and 4 in situ, not just in isolation. |
| 7 | `mr02-compare` | question_family (Mathematics) | Already has a prepared review pack (`MATHEMATICS_WAVE2_REVIEW_PACKS.md`) from Educational Increment 005/006B — lowest-friction Mathematics review available, proves the same `/admin-beta/review` interface and `ali_family_review` mechanism work identically across both subjects. |

## What the reviewer needs, already provided by `/admin-beta/review`

- Sign in with an email the Founder has granted admin access to (`is_admin = true` on `profiles`, per migration 008's existing bootstrap process — no new access-grant mechanism was created for this pilot).
- Open each of the 7 targets above in turn.
- For the 6 question families: the interface shows up to 8 representative items, ordered by difficulty (surfacing an easy-boundary and hard-boundary instance within that sample automatically via the difficulty ordering).
- For the 1 passage: the interface shows the full original text plus every question attached to it.
- Work through `ANGEL_EDUCATIONAL_REVIEW_STANDARD_V1.md`'s criteria, record a real name, choose one of the 4 canonical decisions, and submit.

## What happened after the pilot

Each submitted decision was a new `ali_family_review` row — nothing was promoted automatically (Operating Model §5). With all 7 decided `approved`, `scripts/generate-pilot-activation-migration.mjs` (Educational Increment 007G) recomputed the exact live manifest (60 questions + 1 passage, 0 exclusions) and generated migration 055 — a single, scoped, idempotent activation for exactly this set, for the Founder to apply.
