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

**Gate 4 (revised) — Committed and Deployed.**
- Commit `e1150f0146bff803be14045f63b7f213b3b9f6ba` — "fix: establish secure learner identity and profile ownership" — 18 files, scoped to exactly: anonymous authenticated learner identity, profile ownership correction, legacy profile claim integration, and the already-reviewed Phase 3 application integration. Migration 020 and all Phase 2C identity-registration files deliberately excluded (020 is being reworked per the evidence-table RLS finding below; Phase 2C was never part of this approval).
- Pre-commit: `tsc --noEmit` clean, full lint run across all 12 changed/new files (one genuine new finding — a React Compiler memoization-skip in `app/maths/page.tsx`'s `finishSession`, caused by this diff — fixed by removing the manual `useCallback` wrapper, re-verified clean; every other lint item confirmed pre-existing via `git diff`, unrelated to this change), both test suites pass, `next build` succeeds (48 routes), full diff secret-scanned (clean — only prose references to the role name `service_role`, never a key value).
- Pushed to `origin/main`: `bc00f99..e1150f0`.
- Vercel production deployment `dpl_DmTv847DEREEFJUiePLrWvgGvxbW`, created 2026-07-23 12:49:07 BST (11:49:07 UTC), status **Ready**, aliased to `https://angel-11plus.vercel.app` (the production domain) — confirmed via `git rev-parse origin/main`/`HEAD` both resolving to `e1150f0`, with no intervening commits.

**Gate 5 — Fresh Learner Identity Verification (identity/profile ownership scope only): PASSED, all 8 checks, against the real deployed application.**

**Disclosure (test-preparation error, not a production defect)**: to obtain a genuinely fresh browser identity, the existing test browser's `angel11plus_device_id` and Supabase auth-token localStorage keys were backed up to a page-scoped JS variable before clearing them, intending to restore afterward. The subsequent page navigation (needed to trigger the real app's bootstrap flow) reset that in-page JS state before the values were read back out, so the original 25-character `device_id` could not be restored. Consequences, precisely: no production database rows were changed, deleted, or modified by this — only this one browser's local pointer to its previous identity was lost. No learner profile was deleted. The browser was subsequently, intentionally treated as a fresh-identity test environment for the remainder of Gate 5, per Founder instruction. Legacy continuity verification (i.e., whether an existing device can still resume its old profile) is Gate 6, using a separately controlled device_id, not this browser.

**Results, against `https://angel-11plus.vercel.app` (commit `e1150f0`), Supabase project `agxunwcdatosrmzhhuxj`:**

| # | Check | Result |
|---|---|---|
| 1 | Anonymous sign-in succeeds | ✅ Real session created via the app's own `AuthProvider` bootstrap (no manual client construction) |
| 2 | Browser receives an authenticated session | ✅ `role: "authenticated"`, `aud: "authenticated"`, `is_anonymous: true`, confirmed by reading the app's own persisted session from localStorage |
| 3 | One new profile is created | ✅ `profiles` row `a3c1b503-687b-4db2-91bd-51efd915b756` created automatically by the deployed app's `ensureProfile()`/`onAuthStateChange` flow — no manual insert |
| 4 | `profiles.auth_user_id` matches `auth.uid()` | ✅ Both equal `6d377363-f15d-43dc-b575-07ad78ecc863`, confirmed via direct SQL query |
| 5 | Owner can select and update | ✅ Both HTTP 200, using the real session's own access/refresh token |
| 6 | Cross-identity denial | ✅ A second, independently signed-in anonymous identity got 0 rows on SELECT and 0 rows affected on UPDATE (RLS silently filtered); confirmed at the DB level the owner's data was unchanged afterward |
| 7 | `claim_legacy_profile` role behaviour | ✅ Session-less `anon` call: HTTP 401, `42501 permission denied`. Authenticated call: HTTP 200, no error (null data — no-op, no matching legacy device row, as expected for a made-up id) |
| 8 | No duplicate profile | ✅ Total `profiles` count went 5→6 (exactly +1); exactly 1 row matches the new `auth_user_id` |

**Gate 5: CLOSED.**

**Gate 6 — Controlled Legacy Profile Continuity: PASSED.**

Since no real family device_id may be used for this test, a clearly-synthetic legacy profile fixture was created directly via SQL to simulate a pre-auth device: `device_id = 'gate6-synthetic-legacy-device-id'`, `name = 'GATE6_TEST_LEGACY_PROFILE_DO_NOT_USE'`, `auth_user_id` left `NULL` — exactly the shape of a genuine pre-correction legacy row.

- A fresh anonymous identity (`27571cfb-31bb-41ba-bee6-c814b241897d`) called `claim_legacy_profile` with that exact `device_id` — succeeded, returning the fixture's real id, no error.
- A follow-up `SELECT` confirmed the fixture's `auth_user_id` was genuinely updated to match this claimant.
- A **second**, independently signed-in identity (`34cfdf6b-37ff-4425-8f8f-08cf802d4d18`) then attempted to claim the **same, now-already-owned** `device_id` — got `null` back, no error: an already-claimed legacy row cannot be re-claimed by anyone else, confirmed live.
- The synthetic fixture row was deleted immediately afterward (`DELETE ... WHERE id = 'c5fbd30c-b966-4f29-b023-7abcbd9bf844'`, confirmed via `RETURNING id`) — production left clean, no lingering test data.

**Not cleaned up (disclosed, not deleted without being asked)**: the handful of anonymous test auth identities created across Gate 5/6 verification (including the one now-real `profiles` row from Gate 5, `a3c1b503-687b-4db2-91bd-51efd915b756`) remain in `auth.users`/`profiles` — harmless, isolated, no connection to any real family's data, available for inspection or cleanup on request.

**Gate 6: CLOSED.**

**Migration 020 (revised) — Applied, Verified, Committed.** See `ARCH-001_MIGRATION_020_READINESS_REVIEW.md` for the full pre-execution analysis. Applied in one transaction; post-execution verification confirmed: all 10 tables' RLS/policy state exactly matches the revised design (old `user_stats`/`lesson_progress` permissive policies replaced, not left active alongside new ones; `ali_operational_events`/`_aggregates` untouched at 0 policies; content tables get `anon+authenticated` SELECT-only); a fresh authenticated learner can write/read their own `user_stats`/`lesson_progress`/evidence rows; a second identity is denied read/insert/update on the first's data (confirmed both via HTTP response and DB state); `anon` can read both content tables but not write them (catalog-confirmed: only 1 SELECT policy exists on each); row counts before/after match exactly once test data is cleaned up. Committed as `2356319` (not yet pushed — no push was requested for this specific step).

**Gate 7 — Full Evidence Chain, Real Browser Flow: PASSED for Maths and English; honest, documented no-ops for Vocabulary and Writing (not defects).**

All of the following was done through genuine UI interaction (typing answers, clicking buttons, reading real API responses) against `https://angel-11plus.vercel.app`, using the Gate 5 test identity (`profile a3c1b503-687b-4db2-91bd-51efd915b756`, `auth_user_id 6d377363-f15d-43dc-b575-07ad78ecc863`) — no direct API/SQL shortcuts were used to fabricate evidence, only to verify what the real UI produced.

- **Maths** (`/maths`, Reasoning Problems): completed a 10-question session live, reloaded the page to generate a genuinely separate session id, then answered 2 of the same-competency questions correctly across the two sessions. Confirmed, live: `ali_student_question_history` rows written correctly (`mth-001` reached `distinct_correct_sessions: 2`, `mastery_state: "mastered"`); this **crossed the real mastery threshold and produced two live `ali_educational_audit` "mastery" rows** (`MR-04`, `MR-03`) — not fabricated, the app's own `processEvidenceForCompetency()` wrote them; clicking "Finish" then produced **four real `readiness-dimension` audit rows** (English Comprehension, Applied Reasoning, Continuous Writing: "Not Yet Evidenced"; Mathematics: "Partially Evidenced") via `recordLegacyPracticeSessionCompletion()` → `recordReadinessSnapshot()`. `user_stats.total_xp` and `lesson_progress` both updated correctly.
- **Disclosed anomaly, unrelated to today's RLS/migration-020 work**: `mth-002` independently reached `distinct_correct_sessions: 2` (its own threshold) with `lastAttemptCorrect: true`, yet its `mastery_state` stayed `"learning"` instead of `"mastered"` — per `lib/ali/mastery.ts`'s `applyAttemptOutcome()`, this should have flipped. Root cause not yet isolated; this is a pre-existing business-logic question in the mastery-computation code (weeks old, unrelated to RLS/auth), found only because Gate 7's real-browser test happened to exercise it. Flagged for a separate, future investigation — does not affect the RLS/migration-020 verdict, since the underlying write mechanism itself is proven correct by the MR-04/MR-03 rows that did fire correctly.
- **Parent Timeline**: visually loaded `/learning-intelligence/parent/readiness-timeline` as this identity — showed "Available for the CSSE pathway only," since this synthetic test account never went through pathway selection (an honest test-account limitation, not something the underlying data confirms is broken — the `readiness-dimension` rows themselves are verified correct at the DB level).
- **English** (`/english/eng-001`, "The Lighthouse Mystery"): answered and submitted all 4 real comprehension questions. Confirmed live: 4 rows in `ali_student_question_history` (`eng-001-q1` through `q4`, `source: legacy_english_practice`).
- **Vocabulary** (`/vocabulary`, flashcard session): answered "I knew it!" on a real flashcard. Confirmed live: **0 rows written** — this is the documented, honest `untagged-question` outcome (no vocabulary word is tagged into `ali_question_bank` yet), not a defect; the code correctly declines to fabricate evidence for untagged content.
- **Writing** (`/writing`, "The Empty House"): wrote a real ~100-word story, submitted, and requested Angel Smart Feedback — received a genuine AI score (75%, "Strong"). Confirmed live: **0 rows written**, again the same honest `untagged-question` outcome — only one writing prompt (`wrt-003`) is currently tagged into `ali_question_bank`, and "The Empty House" isn't it.

Migration 019 and migration 020 are both live in production, both fully verified via real browser interaction, not just direct SQL/API tests. ED-001 and the evidence-table RLS defect are both resolved and verified.

**Repository push and deployment (migration 020 revision).**
- Pre-push checks: current branch confirmed `main`; `git show --stat --oneline 2356319` confirmed exactly 3 files (the migration file, the readiness review, this report) — no application code; `git diff --check 2356319^ 2356319` clean; `git merge-base --is-ancestor e1150f0 2356319` confirmed migration 019's commit is a true ancestor of migration 020's commit (correct repository order). One on-topic, non-blocking uncommitted change was disclosed (this report file's own Gate 7 addition, made after the commit snapshot) — not unrelated work, and irrelevant to `git push` since only committed history is ever pushed.
- Pushed: `git push origin main` → `e1150f0..2356319 main -> main`, a clean fast-forward, no force used.
- Remote confirmation: `git ls-remote origin main` returns `2356319499d0ae82df02e2bca0420ffeb8e12391`, exact match. `git log origin/main -3` shows only the expected 3 commits, no unrelated history.
- Deployment: Vercel deployment `dpl_D4SJr4zCKdjmoyRGtJCYBnmMiTE7`, created 2026-07-23 13:59:53 BST (12:59:53 UTC), status **Ready** (41s build), aliased to `https://angel-11plus.vercel.app` (production domain) — confirmed via `vercel inspect`.
- Repository/production synchronisation: re-queried live production policies immediately after deployment — exactly 8 tables carry policies (`user_stats`, `lesson_progress`, `ali_student_adaptive_state`, `ali_student_question_history`, `ali_durable_mastery`, `ali_educational_audit`, `ali_question_bank`, `ali_mastery_defaults`), `ali_operational_events`/`_aggregates` correctly carry none — an exact match to the committed migration file. Repository and production are fully synchronised.

**Recommendation: Phase 3.1 acceptance is ready to proceed.** The evidence-table RLS defect that blocked it is resolved, verified live via direct API tests (Gate 3-6 methodology) and via the real browser flow (Gate 7) across Maths and English, with Vocabulary/Writing correctly and honestly no-op for untagged content. The `mth-002` mastery-state anomaly is unrelated to RLS/access-control and does not block this recommendation — per instruction, it is tracked as a separate defect to be recorded after Phase 3.1 closure, not folded into this migration's scope.

Founder Acceptance Certificate: **not issued** — awaiting explicit approval of the Phase 3.1 acceptance decision, per standing instruction.
