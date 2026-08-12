# Pathway Evidence Integrity Assessment

Section 7 requires this to be a hard integrity check, not an assumption. Findings below are from direct inspection of every relevant migration and persistence module (`supabase/migrations/*.sql`, `lib/ali/persistence/*`, `lib/ali/history.ts`, `lib/learningEngine/profile.ts`, `lib/mockProgress.ts`, `lib/supabaseProgress.ts`).

## What exists today

- `ali_question_bank` has a `pathway text[]` column (`005_ali_question_bank.sql`) — this tags which pathway(s) a *question* belongs to.
- `ali_student_question_history` (unique on `profile_id, question_id`), `ali_durable_mastery` (unique on `profile_id, competency_code`), `ali_educational_audit` (keyed on `learner_id, competency_or_dimension`) — **none of these carry a pathway column.** A row records evidence for a specific question or competency, not which exam board it was attempted under.
- `profiles` (the real Supabase row per learner, created by `ensureProfile()`) has no pathway field at all.
- `selectedPathwayId` (`lib/progress.ts`) exists **only in client localStorage.** There is no server-side record, anywhere, of a learner's current or past selected pathway.
- `MockResult` (client-side, `lib/mockProgress.ts`) does carry a `pathway` field, but mock results are never synced to Supabase — they live in the same localStorage blob as everything else in `UserProgress`.

## Is evidence actually at risk of contamination today?

No, for a narrower and more specific reason than "pathway is tracked everywhere it needs to be":

- The Learning Engine's competency/mastery/durable-mastery layer (`lib/learningEngine/profile.ts` and everything downstream of it — `generatePersonalisedSession()`, `getRecommendations()`, durable mastery, wellbeing) is gated to CSSE only at the application layer: `pathwayEligible = pathwayId === "csse"`, checked before any real query runs. In practice today, this layer is never invoked for a non-CSSE learner.
- CSSE's competency-code namespace (Assessment Brain V1 IDs, e.g. `RC-01`) and the legacy pathways' `SkillType` namespace (e.g. `arithmetic`, `inference`) are disjoint string spaces — they never collide. A `(profile_id, competency_code)` row in `ali_durable_mastery` can only ever have come from the CSSE pipeline, because nothing else writes rows shaped that way.
- At the raw question level, `ali_student_question_history` rows are implicitly pathway-scoped through `question_id`: a CSSE question and a GL question are different rows in `ali_question_bank` with different ids, and CSSE's own read paths (e.g. `fetchQuestionBank(supabase, area.subject, "csse")` in `lib/learningEngine/sessionGenerator.ts`) already filter by pathway at read time.

So: **switching a learner's active pathway today cannot retroactively relabel, inflate, or blend evidence, because no code path reads evidence without already being scoped to the right competency/question namespace.** This is safety by construction, not safety by an explicit pathway column — worth stating plainly rather than implying a guarantee that does not exist.

## The one real gap

`selectedPathwayId` having no database row means Section 20's requirement to "verify persistence and evidence isolation at database level" cannot be performed for the pathway-switch itself — there is no database row to inspect. This is a genuine limitation, reported honestly (see `REGRESSION_AND_VERIFICATION_REPORT.md`, item: **NOT VERIFIED**) rather than claimed as passed.

## What this increment does about it

A minimal, additive migration, `supabase/migrations/026_active_pathway_context.sql`:

```sql
alter table profiles
  add column if not exists selected_pathway_id text,
  add column if not exists pathway_selected_at timestamptz;
```

This touches only `profiles`, adds two nullable columns, and does not modify, rename, or constrain anything that already exists. It gives the active pathway a real, inspectable database row, going forward, without touching any evidence table's shape or write path — the exact boundary Section 15/16 draws around the Learning Engine.

**This migration is prepared but not applied.** This session's Supabase access is the anon key (confirmed SELECT-only in an earlier round of this programme); applying a schema migration requires Founder action via the Supabase SQL editor or CLI with service-role/owner privileges. The application does not depend on this migration: `setSelectedPathway()`/`getSelectedPathwayId()` continue to work exactly as they do today via localStorage regardless of whether it is applied, and the dual-write to `profiles.selected_pathway_id` is best-effort and fire-and-forget, matching the existing pattern `lib/progress.ts`'s `addXP()` already uses for `syncFullProgress()` — a failed or missing column write never blocks or breaks the UI.

**Founder action required:** run `supabase/migrations/026_active_pathway_context.sql` against the production database when convenient. Until then, pathway switching, focus, and all learner-facing behaviour in this increment work fully; only the database-level audit trail for *which* pathway was active *when* is unavailable.

## Recommendation for a future increment (not built here, out of scope)

If stronger, explicit database-level evidence isolation is wanted beyond the by-construction safety demonstrated above (for example, to support an audit report showing "this specific attempt was recorded under pathway X"), a future increment could add a `pathway` column to `ali_student_question_history`, populated at write time from the active pathway. This would touch `recordPresentation()`/`recordOutcome()` in `lib/ali/history.ts` and every caller — a real Learning Engine change, deliberately not undertaken in this increment per its own scope discipline.
