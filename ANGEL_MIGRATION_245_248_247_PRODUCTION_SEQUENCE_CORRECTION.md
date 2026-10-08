# ANGEL 11+ — MIGRATION 245/248/247 PRODUCTION SEQUENCE CORRECTION

Date: 2026-09-09. **No production action taken. This is verification only.**

Your production narrative (attempted 245 → trigger blocked it → stopped → `english-full-mock-v1` = 0 rows) is accurate and is not in dispute anywhere below. What needs correcting is a more precise claim: migration 245's file contains **two separate, independently-committing transactions**, and "245 failed" is true of one of them and not the other. I re-ran live verification against production **just now**, fresh for this report, not carried over from memory — full results below.

---

## A. Actual status of 245

**Split status — not a single yes/no.**
- **Schema transaction (table + functions + columns): CONFIRMED LIVE, verified again moments ago.**
- **Content transaction (Q1 promotion + `english-full-mock-v1` insert): CONFIRMED NOT APPLIED**, exactly as your own production history states.

I am not calling migration 245 "done." I'm stating precisely which of its two transactions is live, with fresh evidence for each, so nothing is assumed either way.

## B. What 245 contains, and the live status of each part

Read directly from `supabase/migrations/245_csse_english_full_paper_writing_assessment.sql`, which is structured as `begin...commit` (schema) followed by a second, separate `begin...commit` (content):

| Change | Transaction | Live status | Evidence |
|---|---|---|---|
| `ali_writing_assessment` table + RLS | Schema | **Live** | See below |
| `mock_persist_writing_assessment()` (function) | Schema | **Live** | Called just now with a bogus UUID → `P0001: No profile found for the current caller` (the function's own real body ran; a non-existent function returns `PGRST202`, not an application error) |
| `mock_review_writing_assessment()` (function) | Schema | **Live** | Called just now → `P0001: Only an admin may review a Writing assessment` (same reasoning) |
| `ali_mock_form.reading_phase_minutes` / `.default_duration_minutes` (2 new columns) | Schema | **Live, by transaction-atomicity inference** — not directly queryable (`ali_mock_form` has no anon SELECT policy at all, migration 071), but these columns are added in the *same* `begin...commit` as the two functions just confirmed live. Postgres transactions are atomic: it is not possible for the functions to have committed while the column additions in the same block did not. |
| `mock_start_attempt()` / `mock_submit_answer()` redefinitions (timing changes) | Schema | **Live, by the same atomicity inference** | Same transaction block as the above |
| `mock_get_active_form()` widened to accept `p_subject` | Schema | **Live** | Called just now with `p_attempt_type` + `p_subject` → returned `[]` cleanly, no error. The pre-245 function only accepted one argument; calling it with a second named parameter it doesn't recognise would fail, not return an empty result. |
| Promote `mock-writing-mindchange-01` to `mock_eligible` | **Content** | **NOT applied** | Your own earlier query: `eligibility_status = independently_validated` |
| Insert `english-full-mock-v1` | **Content** | **NOT applied** | Your own earlier query: 0 rows |

No question eligibility change and no form insert took effect — both live only in the content transaction, which is the one that failed.

## C. Can 248 be applied to a database where 245 was never applied?

**NO.** Traced line by line, not guessed:

Migration 248's final statement is:
```sql
insert into public.ali_mock_form (id, specification_version, attempt_type, subject, question_manifest, reading_phase_minutes, default_duration_minutes, active)
```
`reading_phase_minutes` and `default_duration_minutes` do not exist on `ali_mock_form` until migration 245's schema transaction adds them. On a database that never ran that transaction, this exact `INSERT` would fail with `column "reading_phase_minutes" of relation "ali_mock_form" does not exist`.

Every other statement in 248 (the two preflight `DO` blocks, the Q1 `UPDATE`, the Q2 `INSERT`) touches only `ali_question_bank`, which has no dependency on migration 245 at all — those would succeed independently. **The one hard dependency is the two new columns**, and per §A/§B that dependency is satisfied in the actual current production database, confirmed with evidence gathered fresh for this report, not assumed.

## D. Migration 247's exact prerequisite chain

Read directly from `supabase/migrations/247_writing_evidence_ingestion_claim.sql`:
```sql
alter table public.ali_writing_assessment
  add column if not exists ei_evidence_ingested_at timestamptz;
```
This is 247's first executable statement — it requires `ali_writing_assessment` to already exist (created in 245's schema transaction) or it fails outright with `relation "ali_writing_assessment" does not exist`. Its own function, `mock_claim_writing_evidence_ingestion()`, both reads and writes that same table.

**247 depends on exactly one thing: migration 245's schema transaction (specifically the `ali_writing_assessment` table).** It does not reference `ali_mock_form`, does not reference any English form row, and has zero textual or logical dependency on 246 or 248 — confirmed by grep, nothing in 247's file mentions either.

## E. Exact 246 supersession status

- **Does 248 contain all required work 246 intended?** Yes, fully. 246's three actions were: (1) the same `mock-writing-mindchange-01` `question`/`marks` jsonb fix — present in 248, identical logic; (2) the same Q2 content row insert — present in 248, byte-identical; (3) an `UPDATE ... append Q2 to english-full-mock-v1's manifest` — not needed in 248 because 248 creates the form with Q2 already included in the initial manifest. Functionally equivalent, nothing lost.
- **Is 246 definitely not to be applied?** Yes — it should not be run. Its own precondition (an already-existing `english-full-mock-v1` to append onto) does not hold under the corrected design.
- **Would applying it anyway cause harm?** No, worth disclosing precisely: if 246 were accidentally applied *after* 248, all three of its own write operations are individually guarded and would each resolve to a safe no-op (the `question`/`marks` fix is guarded by `prompt->'question' is null`, already false; the Q2 insert is `on conflict do nothing`, the row already exists; the manifest-append is guarded by `not exists (... question_id already in manifest)`, already true). Harmless if mistakenly run, but the instruction remains: don't run it, to avoid any confusion about which file is authoritative.

## F. Correct production migration sequence

**245's schema transaction (already live) → 248 → 247.**

This is not a mechanical pick from your examples — it's the direct consequence of §C (248 needs 245's schema, which is confirmed present) and §D (247 needs only 245's schema, independent of 248). Do **not** re-run migration 245's file. Its schema half is already live (re-running `create table if not exists`/`create or replace function` is harmless and idempotent, so it wouldn't corrupt anything), but its content half would simply fail again on the identical trigger collision — pointless, and risks confusion about what changed. 248 already fully replaces that content section.

## G. Additive corrective migration required

**None beyond what's already delivered.** Migration 248 (committed, pushed, not applied) already correctly assumes 245's schema transaction as its one prerequisite, and that assumption is verified true. No new migration is needed to resolve this dependency question.

## H. Exact SQL files the Founder should run, in order

1. `supabase/migrations/248_csse_english_full_paper_corrected_content.sql`
2. `supabase/migrations/247_writing_evidence_ingestion_claim.sql`

**Do not run** `245_csse_english_full_paper_writing_assessment.sql` again (its schema half is already applied; its content half would just fail again, harmlessly but pointlessly). **Do not run** `246_csse_english_q2_picture_narrative_completion.sql` (superseded by 248).

## I. GO / REVISE / NO-GO for migration application

**GO — for applying 248, then 247, in that order.** Unchanged from the prior report's conclusion, now on freshly re-verified evidence rather than carried-over claims: 248's one real dependency (245's schema transaction) is confirmed live, not assumed; 247's one real dependency (the `ali_writing_assessment` table) is confirmed live and unrelated to 246/248. Nothing here required any change to 248's own SQL — the correction was to my own reporting precision about what "245 is applied" actually meant, not to the migration itself.

---

**STOP. No migration has been applied. No production data has been changed. This report is verification only.**
