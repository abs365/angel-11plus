# ARCH-001 / ED-001 — Identity Foundation Correction: Implementation Report

**Status: implemented in code and migration files. NOT applied to production. NOT committed.** Awaiting review per explicit instruction.

---

## 1. Confirmed current identity flow

**Before this correction:**
```
Browser loads → device_id read/generated from localStorage
             → ensureProfile() upserts a profiles row keyed on device_id
             → RLS relies on device_id-based policies (ED-001: broken —
               INSERT rejected even with a fully permissive WITH CHECK(true)
               policy, root cause never isolated beyond "inside PostgreSQL")
             → No Supabase Auth session ever created for ordinary learners
               (AuthProvider.tsx only supported magic-link email sign-in;
               anonymous sign-in was never called anywhere in the codebase)
```

Discovery also found this was **already partially anticipated**: migration 002 (2026-07-?) already added a nullable, unique `auth_user_id` column and `AuthProvider.tsx` already had a real (if RLS-fragile) `linkAuthToDeviceProfile()` claim function for the magic-link path — the infrastructure existed for authenticated ownership, it just had no anonymous entry point and no real enforcement.

**After this correction:**
```
Browser loads → AuthProvider checks for an existing Supabase session
             → none exists → ensureLearnerSession() calls
               supabase.auth.signInAnonymously() → real row in auth.users,
               real signed JWT, role=authenticated, is_anonymous=true
             → ensureProfile() looks up a profile by auth_user_id = auth.uid()
             → not found → claim_legacy_profile() (SECURITY DEFINER) tries
               to attach this identity to an existing unowned device_id row
             → still not found → creates a brand-new profile row with
               auth_user_id = auth.uid(), device_id retained as continuity
               metadata only
             → RLS enforces auth.uid() = auth_user_id on every operation
```

## 2. Files changed

**New:**
- `lib/learnerIdentity.ts` — `ensureLearnerSession()`, the single reusable identity entry point (Work Package 1).
- `supabase/migrations/019_learner_identity_auth_foundation.sql` — profiles ownership correction (FK, claim function, new RLS policies).
- `supabase/migrations/020_evidence_tables_authenticated_ownership.sql` — evidence-table RLS (deferred — see Section 11).
- `scripts/test-learner-identity.ts` — focused tests for Work Package 7.

**Modified:**
- `lib/supabaseProgress.ts` — `ensureProfile()` rewritten auth-first; `resolveProfileId()` removed (now redundant, folded into `ensureProfile()`).
- `components/providers/AuthProvider.tsx` — bootstraps anonymous sign-in when no session exists; `linkAuthToDeviceProfile()` now calls the SECURITY DEFINER claim function instead of a raw client-side update.
- `types/supabase.ts` — added the `claim_legacy_profile` RPC function type.

**Not touched:** every page/component that calls `ensureProfile()` (mock pages, feedback forms, `lib/migrateProgress.ts`, Phase 3 evidence code) — the function's `Promise<string | null>` contract is unchanged, so none of these needed edits. No new pages, no scoring model changes, no UI redesign.

## 3 & 4. Migration and rollback SQL

Both migrations are additive-only with an embedded, manually-runnable rollback block at the end of each file (not auto-executed):

- **Migration 019** (`019_learner_identity_auth_foundation.sql`): adds the `auth_user_id → auth.users(id)` FK (confirmed safe: 5 total profiles, 1 already valid, 0 orphaned refs), creates `claim_legacy_profile()`, drops the two old permissive device-based policies, adds three new `auth.uid() = auth_user_id` policies (SELECT/INSERT/UPDATE).
- **Migration 020** (`020_evidence_tables_authenticated_ownership.sql`): enables RLS + adds EXISTS-based ownership policies on 7 Phase 3 evidence tables. **Explicitly marked DO NOT APPLY YET** — see Section 11.

Full SQL is in the files themselves rather than duplicated here — both are short enough to review directly.

## 5. RLS policy inventory — before and after

**`public.profiles`, before:**
| Policy | Command | Roles | Check |
|---|---|---|---|
| `profiles_allow_anonymous_insert` | INSERT | anon, authenticated | `true` (unconditional — the policy ED-001 found didn't work anyway) |
| `profiles_allow_anonymous_update` | UPDATE | anon, authenticated | `true` |
| *(none)* | SELECT | — | no explicit policy (PR-001 claimed anon SELECT worked regardless — never re-verified this session) |

**`public.profiles`, after (migration 019):**
| Policy | Command | Roles | Check |
|---|---|---|---|
| `profiles_select_own` | SELECT | authenticated | `auth.uid() = auth_user_id` |
| `profiles_insert_own` | INSERT | authenticated | `auth.uid() = auth_user_id` |
| `profiles_update_own` | UPDATE | authenticated | `auth.uid() = auth_user_id` (both USING and WITH CHECK) |

**7 Phase 3 evidence tables, before:** RLS disabled on all of them (deliberate, documented state since migrations 001/006/010 — "no auth-based RLS policy layer exists yet").

**Same 7 tables, after migration 020 (once applied):** RLS enabled, SELECT/INSERT/(UPDATE where used) policies via `EXISTS (select 1 from profiles p where p.id/learner_id = <owner column> and p.auth_user_id = auth.uid())`. Full inventory table is in migration 020's own header comment.

## 6. Legacy profile continuity method

**Chosen mechanism: a narrowly-scoped SECURITY DEFINER function**, not a server-side service-role route — documented reasoning in migration 019 itself:
- The function's entire security boundary is its own WHERE clause: `device_id = p_device_id and auth_user_id is null`. An already-owned row (by anyone) never matches, so a row can be claimed at most once, ever.
- `auth.uid()` is read from the caller's own verified JWT inside the function body — never a parameter — so a caller can only ever claim a row for themselves.
- `EXECUTE` granted to `authenticated` only, never `anon`.
- No service_role key anywhere in browser code, per explicit instruction.

## 7. Security assessment

- Ownership is now tied to `auth.uid()`, cryptographically derived from a signed Supabase-issued JWT — not client-supplied `device_id` data, which Postgres could never verify (this exact gap is what ARCH-001 flagged and what this correction closes).
- `is_admin`'s existing column-level protection (migration 008's `REVOKE UPDATE (is_admin) FROM authenticated, anon`) is untouched and orthogonal to these row-level policies — still fully in force.
- **A disclosed, unresolved risk carried over from ED-001**: the previous policy (`WITH CHECK (true)`, correctly scoped, correctly granted) still mysteriously failed against a direct `SET LOCAL ROLE anon` test, for reasons never isolated even at the raw `pg_policy` catalog level. There is a non-zero chance the *new* policies could exhibit similarly unexplained behaviour. This is exactly why Work Package 8's live verification is a hard gate, not a formality — code review alone cannot be trusted to guarantee this works, given this project's specific, recent history with this exact table.

## 8. Test results

- `test-learner-identity.ts`: **9/9 pass** — covers real, meaningful orchestration logic (no-session → sign-in exactly once; existing session reused; concurrent calls deduplicate to one sign-in attempt; sign-in failure returns null, never a fabricated identity; no client → null, never throws).
- **Honestly out of scope for this test file** (stated explicitly in its own header, not silently omitted): "learner cannot access another profile," "legacy unowned profile may be claimed once," "already-owned profile cannot be claimed" — these are real Postgres/RLS guarantees a JS-level fake client cannot enforce or meaningfully prove. They are Work Package 8 live-verification items, not unit tests.
- Existing suites re-run for regression: `test-educational-intelligence-foundation.ts` (27/27) and `test-educational-identity-registration.ts` (47/47) — both still pass unchanged.

## 9. Build results

`tsc --noEmit`: clean. ESLint: clean on every new/changed file (one pre-existing, unrelated error in `AuthProvider.tsx` confirmed via `git diff` to be outside this change's diff entirely). `next build`: succeeds, 48 routes.

## 10. Production verification plan (Work Package 8 — not yet executed)

1. **Prerequisite, separate from any migration**: enable "Allow anonymous sign-ins" (Authentication > Sign In / Providers) — confirmed OFF today. This is a dashboard configuration toggle, not SQL; needs its own explicit go-ahead.
2. Deploy this code.
3. Apply migration 019 only (not 020 yet).
4. Mint a completely fresh browser identity (new device, no localStorage).
5. Confirm a real row exists in `auth.users` and exactly one `profiles` row with matching `auth_user_id`.
6. Confirm the new learner can read/update only that profile; confirm a second, independent test identity cannot read or modify it.
7. Complete one Maths activity; verify the full chain through Educational Audit / Readiness History / Learning History / Parent Timeline.
8. Only after that passes: confirm an *existing* (already-real, already-used) device profile still works — this is the regression check that matters most given the small (5-profile) but real production user base.
9. Only after Section 10 steps 1-8 all pass, and with a separate explicit go-ahead: apply migration 020 (evidence tables), because of the sequencing risk in Section 11.

## 11. Remaining risks

- **The largest one**: migration 020 (evidence-table RLS) must not be applied until anonymous sign-in is confirmed live for real traffic — applying it first would immediately break every current learner's evidence writes (they're all still unauthenticated `anon`-role requests today). This is stated as prominently as possible in the migration file itself, not just here.
- **ED-001's own unresolved mystery**: the previous permissive policy failed for reasons never isolated. The new policy might too. Cannot be ruled out from code review; only live testing (Work Package 8) can.
- **`auth.uid()` semantics for anonymous sessions**: this assumes Supabase's anonymous auth issues a `role: authenticated` JWT (documented Supabase behaviour) — not independently re-verified against this specific project's configuration, since anonymous sign-ins are currently disabled and cannot be tested until enabled.
- **PR-001's unverified SELECT claim**: the "before" state's SELECT behaviour (Section 5) was never re-confirmed this session — moot now that an explicit SELECT policy exists, but worth noting the "before" picture isn't 100% independently confirmed.

## 12. Recommendation

**Apply migration 019 only, after (a) enabling anonymous sign-ins and (b) deploying this code, then complete Work Package 8's live verification before considering migration 020.** Do not apply migration 020 until Work Package 8 passes in full. This keeps the two real risks — "does the new profiles policy actually work" and "will enabling evidence-table RLS break existing traffic" — as two separate, sequenced decisions rather than one bundled one.

---

## 13. Controlled Production Activation — Gate Log

**Gate 1 — Enable Anonymous Authentication: PASSED.**
- Previous setting: "Allow anonymous sign-ins" disabled. Confirmed 2026-07-23 10:56:47 UTC.
- Changed to: enabled. Save confirmed 2026-07-23 ~10:57 UTC. Supabase's own confirmation banner text ("Anonymous users will use the `authenticated` role... subjected to RLS policies that apply to the `public` and `authenticated` roles") matches migration 019's policy scoping exactly.
- Live verification (2026-07-23 10:59:03 UTC): a real `signInAnonymously()` call against production returned a valid session — `hasUser: true, isAnonymous: true, role: "authenticated", aud: "authenticated"`.
- Project reference: `agxunwcdatosrmzhhuxj`.
- No other authentication provider or setting touched.

**Gate 2 — Final Migration 019 Review: PASSED, all 13 checklist points + executability confirmed** by direct line-by-line reading of the migration file (see conversation record for the full point-by-point table). One disclosed observation, not a blocker: the FK is `on delete cascade` — Supabase does not currently auto-expire anonymous `auth.users` rows, so there's no near-term trigger, but any future manual/cleanup deletion of a stale anon user would cascade-delete the matching `profiles` row. Flagged for awareness, not remediated as part of this gate.

**Gate 3 — Apply Migration 019: PASSED, with one interim finding and correction.**
- Baseline (pre-migration, queried live): `profiles`=5, `lesson_progress`=22, `user_stats`=5, FK absent, function absent, existing policies = exactly `profiles_allow_anonymous_insert, profiles_allow_anonymous_update` — matched Section 5's documented "before" state exactly.
- Migration 019 applied via Supabase SQL Editor: `Success. No rows returned`, no errors.
- Post-migration verification: `profiles`=5, `lesson_progress`=22, `user_stats`=5 (**all unchanged**), FK `profiles_auth_user_id_fkey` exists referencing `auth.users`, `claim_legacy_profile` exists, old policies gone, exactly 3 new ones present (`profiles_insert_own, profiles_select_own, profiles_update_own`).
- **Interim finding**: `claim_legacy_profile` had EXECUTE granted to `anon` in addition to `authenticated`/`postgres`/`service_role` — contradicting the migration's documented intent (Section 6/7 above). Root cause: Supabase's `public`-schema default privileges grant EXECUTE to `anon`/`authenticated`/`service_role` explicitly at `CREATE FUNCTION` time; migration 019's `revoke ... from public` only removed the implicit PUBLIC-level grant, not `anon`'s separate explicit one. Practical risk was assessed as low (the function's own `auth.uid() is null` guard makes a real `anon`-role call an immediate no-op) but the deployed state didn't match the documented design.
- **Founder-approved correction applied**: `revoke execute on function public.claim_legacy_profile(text) from anon;` — single statement, no other grants touched.
- **Post-correction verification, all 6 required checks, via `pg_proc.proacl` (catalog-level, not just `information_schema`) and live application-level calls**:
  1. `authenticated` retains EXECUTE — confirmed.
  2. `anon` no longer has EXECUTE — confirmed (absent from `pg_proc.proacl` entirely; only one function OID exists, no hidden overload).
  3. `service_role` retains EXECUTE — confirmed.
  4. `postgres` retains EXECUTE — confirmed.
  5. Authenticated application flow still works — confirmed live: a genuine fresh `signInAnonymously()` session (explicit `persistSession: false`, no inherited state) called the RPC and got HTTP 200, no error, `data: null` (correct no-op — no legacy row matches a made-up device id).
  6. Pre-session anonymous browser cannot invoke it — confirmed live: a genuinely session-less client (same explicit non-persisting config, `hadSession: false`) got HTTP 401, `42501 permission denied for function claim_legacy_profile`.
- **Methodology note, disclosed rather than silently corrected**: the first attempt at check 6 used a client without `persistSession: false`, which silently inherited a leftover anonymous session from `localStorage` (from Gate 1's or this gate's own earlier test sign-ins) and returned a misleading HTTP 200. This was caught by checking the raw HTTP status/error code rather than trusting an ambiguous null/null result, and corrected before the result was reported.

**Gate 3: CLOSED.**

**Pre-Gate-4 discovery, disclosed but out of scope for this correction**: while confirming migration 020 remained unapplied (checking `relrowsecurity` on its 7 target tables), found that `ali_question_bank`, `ali_mastery_defaults`, and all 7 of migration 020's target tables have RLS **enabled** with **zero policies**, for any role — confirmed live: a genuine anon-role SELECT against `ali_question_bank` returns HTTP 200 with 0 rows (silent RLS filtering); a rollback-only anon-role INSERT against `ali_student_question_history` fails with `42501: new row violates row-level security policy`. This predates this session entirely — none of today's SQL touched these tables — and directly contradicts this report's own Section 5 claim ("RLS disabled on all of them"), which was carried forward from migration file comments (001/006/010) never independently re-verified against live production state. Practical consequence: `/mocks/adaptive/*` routes are almost certainly already returning empty question pools for real users, and Phase 3's evidence-writing calls (in `app/maths`, `app/english/[id]`, `app/vocabulary`, `app/writing`, `app/learning-intelligence/practice/[area]`) fail with the same RLS error today, and will continue to fail identically post-deploy (under `authenticated` instead of `anon`) until migration 020 is separately reviewed and applied at Gate 8 — deploying today's code does not regress this, but does not fix it either. Founder decision: proceed with the already-approved commit/push as scoped; this gap is tracked separately, not remediated as part of Gates 4-5.

**Gate 4 — Deploy Identity Application Code: build/deploy-readiness verified, NOT actually deployed.**
- `tsc --noEmit`: clean, no output.
- `next build`: succeeds, 48 routes (matches Section 9's original count).
- `git status`: confirmed nothing committed — working tree matches exactly what Sections 2-3 describe (`lib/learnerIdentity.ts`, migrations 019/020, modified `AuthProvider.tsx`/`supabaseProgress.ts`/`types/supabase.ts` all still untracked/modified, not committed).
- ESLint on the 4 changed/new files: 1 pre-existing error in `AuthProvider.tsx` (`react-hooks/set-state-in-effect` on the `setLoading(false)` call inside the `if (!supabase)` guard) — re-confirmed via `git diff` that this exact line is unchanged context, not part of this correction's diff.
- `test-learner-identity.ts`: 9/9 pass. `test-educational-intelligence-foundation.ts` and `test-educational-identity-registration.ts`: both fully pass, no regressions.
- **Not done, and deliberately not attempted without a fresh explicit go-ahead**: an actual deploy. This project deploys via Vercel auto-deploy from a GitHub push — there is no "deploy without commit" path. Every instruction through Gate 4 has said "do not commit," so no commit or push has been made. This means the **application code is still not live** — only migration 019's database-level changes (Gate 3) are live in production right now. The currently-served app at https://angel-11plus.vercel.app is still running the pre-correction, device-id-based code.

---

Migration 019 is live in production. Migration 020 remains unapplied, per Section 11's sequencing risk — not touched by this gate. Not committed to git. ED-001 remains open until Work Package 8's full live verification (Gates 5-7) passes; Phase 3.1 remains paused until then, per standing instruction.
