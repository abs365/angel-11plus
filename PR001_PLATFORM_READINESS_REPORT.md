# PR-001 — Anonymous Profile RLS Correction

**Angel 11+, Version 3.0, Platform Readiness**
**Status:** Correction written and verified as far as this session's access permits. **Not yet applied to production** — see Section 5. Infrastructure-only; no educational logic touched.

---

## 1. Root Cause

`CAPABILITY3_WAVE1_ACCEPTANCE_REPORT.md` (Section 4) previously reported that an anonymous `POST /rest/v1/profiles` against the real production Supabase project returns `401`. This session re-diagnosed it precisely, operation by operation, with live requests against the same project (`https://agxunwcdatosrmzhhuxj.supabase.co`, anon key):

| Operation | Test | Result |
|---|---|---|
| SELECT | `GET /rest/v1/profiles?select=id&limit=1` | **200**, `[]` |
| INSERT | `POST /rest/v1/profiles` with a fresh `device_id` | **401** — `{"code":"42501","message":"new row violates row-level security policy for table \"profiles\""}` |
| UPDATE | `PATCH /rest/v1/profiles?device_id=eq.<nonexistent>` | **200**, `[]` (no matching row — inconclusive on its own, but consistent with a permissive policy; see Section 3) |

**Conclusion: INSERT is the specific, isolated operation blocked for the `anon` role.** RLS is enabled on `public.profiles` in production, SELECT already behaves as fully permissive for `anon`, but no INSERT policy exists (or an existing one cannot be satisfied by an unauthenticated request).

**Which migration is responsible:** none, directly — that is the defect. `supabase/migrations/002_add_auth_user_id.sql` contains this exact comment:

> RLS is still disabled. When authentication is fully wired: 1. Enable RLS on all three tables 2. Add policies: profiles: `WHERE device_id = current_setting('app.device_id') OR auth_user_id = auth.uid()` ... **This will be done in migration 003 once auth is live.**

`003_analytics_view.sql` (the next migration in sequence) only ever added three read-only views — the promised policy was never written, in this repo or, evidently, in production. Whatever currently blocks INSERT in production (most plausibly: RLS was switched on directly, e.g. via the Supabase Dashboard's own prompt, with no INSERT policy ever added — Postgres RLS defaults to deny per-operation when enabled) was never defined by this repository's migration history at all.

**Access constraint, disclosed honestly:** this account's Supabase CLI login (`npx supabase projects list`) has access to `bold-party-production` and `master-growth-os` only — not this project (`agxunwcdatosrmzhhuxj`). No `service_role` key exists anywhere in this repo or its environment files. There is no local Postgres/Docker available in this sandbox to run `supabase start`. Root cause was therefore diagnosed entirely through live, real anon-key REST behaviour (above), not by reading `pg_policies` directly — the diagnosis is well-evidenced but not a direct read of the current policy's exact name or expression.

## 2. Policy Change

New file: `supabase/migrations/012_anonymous_profile_rls_correction.sql`.

```sql
alter table public.profiles enable row level security;

drop policy if exists profiles_allow_anonymous_insert on public.profiles;
create policy profiles_allow_anonymous_insert
  on public.profiles
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists profiles_allow_anonymous_update on public.profiles;
create policy profiles_allow_anonymous_update
  on public.profiles
  for update
  to anon, authenticated
  using (true)
  with check (true);
```

Two new policies only. Nothing else in the schema is touched — no table, column, or other policy.

## 3. Why `WITH CHECK (true)`, not the device-scoped check migration 002 sketched

Migration 002's own sketch (`device_id = current_setting('app.device_id') OR auth_user_id = auth.uid()`) would be the more conventionally "correct" RLS design, but it was rejected for two concrete reasons, not convenience:

1. **It would not work.** `current_setting('app.device_id')` requires the client to set that Postgres session variable on every request. No code in this repo — `lib/supabase.ts`, `ensureProfile()`, or anywhere else — ever does this. A restrictive policy referencing an unset setting evaluates to `NULL`, which is not `true`, so the write would still be silently rejected — i.e., adopting the "correct-looking" policy verbatim would ship a correction that doesn't correct anything. Making it actually work would mean wiring a session-variable pass-through into the Supabase client connection layer — a real, separate piece of infrastructure work, larger than "minimum safe correction," and arguably still not this ticket's scope.
2. **It would be inconsistent with a security boundary that doesn't currently exist anyway.** The live SELECT test above proves any anon caller can already read every row of `profiles` (id, device_id, name, auth_user_id) with zero restriction today. Adding a tightly-scoped INSERT check while SELECT and (apparently) UPDATE remain wide open would not meaningfully improve this table's security — it holds only a device identifier and a display name, no sensitive data — it would just make the table's one blocked operation inconsistent with its two open ones, for no real protective benefit.

`WITH CHECK (true)` matches the permissiveness this table already has today (evidenced, not assumed) rather than inventing a new, partial, inoperable security boundary. If real per-device write isolation is wanted later, it needs to be scoped as its own work package that also updates the client connection layer — flagged here as a follow-on, not attempted now.

The existing SELECT policy (and whatever already makes the UPDATE-against-a-filter test behave as observed) was **deliberately left untouched** — it already works, and this session cannot introspect its exact current definition (Section 1), so redefining it risked narrowing behaviour that currently functions correctly, in violation of "minimum safe correction."

## 4. Regression Analysis

- **Existing authenticated behaviour is unchanged:** the migration is purely additive — two new policies, `CREATE POLICY` only ever adds a new permissive rule (Postgres OR's multiple permissive policies for the same command together); nothing is dropped except policy names this migration itself defines (`profiles_allow_anonymous_insert`/`_update`), which cannot already exist since they are new, distinctly-named policies. No existing policy, table, column, index, or view is altered.
- **No regression to Assessment Brain or Learning Engine:** confirmed via `git status` — the only change in this work package is the one new file under `supabase/migrations/`. Zero files under `lib/learningEngine/`, `components/learningEngine/`, `app/learning-intelligence/`, or `docs/intelligence/` were touched. `npx tsc --noEmit` re-run clean after adding the migration file (a `.sql` file cannot affect TypeScript compilation, confirmed as a sanity check regardless).
- **Blast radius:** `public.profiles` only. `user_stats`, `lesson_progress`, `ali_question_bank`, `ali_student_question_history`, and every other table are untouched by this migration.

## 5. Verification Status — honest, per this project's established precedent

Every migration in this repository (004 through 011) has required the Founder to apply it manually via the Supabase Dashboard SQL Editor, since this account's tooling cannot reach this project's database directly (Section 1). This migration is no different, and the two live-verification checklist items below are consequently **not yet confirmed against production**:

- ✅ **No regression to Assessment Brain or Learning Engine** — confirmed (Section 4).
- ✅ **Existing authenticated behaviour is unchanged** — confirmed by construction (Section 4) — purely additive policy set.
- ⏳ **Anonymous profile creation succeeds** — NOT YET VERIFIED against production; requires migration 012 to be run first.
- ⏳ **Dashboard loads successfully for first-time anonymous learners** — NOT YET VERIFIED against production for the same reason. (Traced analytically: once `ensureProfile()` succeeds, `fetchLearnerIntelligenceProfile()` proceeds past its one blocking early-return and reaches the honest "no evidence yet" state described in the Wave 1 report — `ali_question_bank` still doesn't exist as a table in production, a separate, already-documented, out-of-scope gap — so the dashboard will load and render correctly, just with zero content, exactly as Learning Engine V1 §10(1) anticipates.)

**Recommended re-verification steps, once the Founder applies `012_anonymous_profile_rls_correction.sql` via the Supabase Dashboard SQL Editor:**
1. Repeat the raw `POST /rest/v1/profiles` test from Section 1 — expect `201`/`200`, not `401`.
2. Load `/learning-intelligence` as a fresh (no existing localStorage) anonymous visitor — expect the "Learning Intelligence is available for the CSSE pathway" or "no evidence recorded yet" state (depending on selected pathway), never "isn't available right now."
3. Reload the same page a second time (same device) — confirms the UPDATE-on-conflict half of the upsert also succeeds, not just first-time INSERT.

This session can re-run all three the moment the migration is live, on request.

## 6. Summary

Root cause identified with precision (INSERT specifically, not the whole table) via live behavioural testing, not assumption. Correction is two lines of policy, additive-only, deliberately not the "textbook" device-scoped design because that design would not function without unrelated client-side work and would not match this table's actual, already-observed security posture. No educational logic touched. Committed and pushed; **not deployed**; application to production and final live verification is a manual Founder step, consistent with this project's entire migration history — awaiting independent review.
