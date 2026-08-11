# Family Choice Data and Provenance Report

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Family Choice Pilot
**Prepared:** 2026-08-11

---

## 1. Schema

`supabase/migrations/022_family_focus_selection.sql` (additive-only; does not alter any existing table):

```sql
create table public.ali_family_focus_selection (
  profile_id       uuid not null references public.profiles(id) on delete cascade,
  competency_code  text not null,
  source           text not null default 'family-selected',
  active           boolean not null default true,
  selected_at      timestamptz not null default now(),
  removed_at       timestamptz,
  updated_at       timestamptz not null default now(),
  constraint ali_family_focus_selection_pk primary key (profile_id)
);
```

- **One row per profile** — the pilot's scope is exactly one active chosen competency at a time, per the Founder-approved single-competency increment. Re-selecting upserts the existing row rather than accumulating history rows.
- **`source` is a plain text column**, not an enum, fixed to `'family-selected'` for every row this pilot ever writes — matching `ali_student_question_history.source`'s own established "plain, open-ended text by design" convention, so a future provenance source (e.g. an Angel-suggested-then-confirmed flow) needs no migration.
- **No DELETE policy, ever.** Removing a focus sets `active = false` and stamps `removed_at` — an UPDATE, never a row delete — so the prior choice and its timestamps remain visible. This is deliberate: provenance is never erased.

## 2. Row Level Security

Authenticated-owner pattern, copied exactly from migration 020's established convention (`ali_durable_mastery` etc.):

```sql
using (exists (select 1 from public.profiles p where p.id = profile_id and p.auth_user_id = auth.uid()))
```

SELECT/INSERT/UPDATE only, for the `authenticated` role. No policy for `anon`. No DELETE policy for any role.

## 3. Application code

`lib/ali/persistence/familyFocusStore.ts` — three functions, matching `durableMasteryStore.ts`'s conventions exactly (graceful failure: `console.warn` + safe fallback, never throw):

- `fetchFamilyFocusSelection(supabase, profileId)` → `FamilyFocusSelection | null`. Returns `null` both when no row exists and when the underlying query fails — a caller must check `.active` to distinguish "no selection" from "an inactive/removed one," never coerced together.
- `saveFamilyFocusSelection(supabase, profileId, competencyCode, now)` → upserts on `profile_id`, sets `active: true`, `selected_at: now`, `removed_at: null`.
- `removeFamilyFocusSelection(supabase, profileId, now)` → sets `active: false`, `removed_at: now`. Does not delete the row.

## 4. What provenance this satisfies

Per the governing instruction's requirement to persist "learner, selected competency, selection source, timestamp, active/inactive state" using existing architecture, with no parallel profile system: every field is present, on one small additive table, following the exact schema/RLS/persistence-module pattern already established for every other per-learner ALI table (`ali_durable_mastery`, `ali_student_adaptive_state`, `ali_student_question_history`). No new profile concept, no duplicate identity model.

## 5. Verification status

**Confirmed, real, this session:**
- Migration SQL reviewed line-by-line against migration 020's own established pattern — no deviation in RLS predicate shape, trigger convention, or additive-only discipline.
- `types/supabase.ts` extended with the matching `Row`/`Insert`/`Update` shapes; `tsc --noEmit` passes clean against the real Supabase client types.
- Graceful-degradation path directly observed in the live browser console: `[ALI] fetchFamilyFocusSelection failed: Could not find the table 'public.ali_family_focus_selection' in the schema cache` — a `console.warn`, not a thrown error, and the page rendered "No focus chosen" correctly rather than crashing.

**Not yet confirmed (blocked on the same external dependency as the rest of this pilot):**
- A real INSERT/UPDATE round-trip against the live table — migration 022 has not yet been applied. `create table`, `enable row level security`, and `create policy` all require elevated DB privileges this environment's anon key does not have (no service-role key is present in `.env.local`, confirmed by direct inspection) — this must be applied via the Supabase Dashboard SQL Editor by the Founder, exactly as migration 021 was applied earlier in this programme.
- Cross-session persistence (choose a focus, reload the page, confirm it's still shown as active) — cannot be tested until the table exists.

Once migration 022 is applied, `FOUNDER_VALIDATION_INSTRUCTIONS.md` gives the exact steps to complete this verification — no code changes will be required.
