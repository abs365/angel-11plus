# ANGEL 11+ — Multi-Learner Household Architecture (Wave 0 Family Architecture Correction)

**Status: READY FOR PRODUCTION MIGRATION — migration `260` prepared, NOT applied. Code is on branch
`multi-learner-household`, NOT merged or deployed.** Founder decision (2026-09-21): one parent/family account
→ multiple learners, correctly implemented (no display-name faking, no separate-account workaround).

Evidence tags: **[V]** verified from code/schema/tests in this pass · **[O]** observation · **[A]** assumption ·
**[R]** recommendation.

---

## 1. Existing account/learner coupling — what was found

- `profiles.auth_user_id` was `UNIQUE` (migration 002): one account = exactly one `profiles` row, and
  `profiles.id` meant BOTH "the account" and "the learner". **[V]**
- ~30 evidence tables key on `profile_id`/`learner_id` → `profiles.id`; their RLS asks "does this profile
  belong to `auth.uid()`?" — a correct **account-ownership** test that already works for N learners. **[V]**
- **23 SECURITY DEFINER functions** (Mock lifecycle, scoring, reports, Writing, telemetry, …) resolved the
  learner with `select id into v_profile_id from profiles where auth_user_id = auth.uid()`. With two learners
  this silently picks an arbitrary row — the exact cross-child contamination to prevent. **[V]**
- Learner-specific state lived in **device-wide `localStorage`**: the whole `UserProgress` blob (XP, streak,
  scores, completed lessons, **pathway, exam date, school year**, ALI signals), the in-progress Mock slot and
  the one-time migration flag. Sign-out cleared none of it. Only the pathway was mirrored to the database. **[V]**
- Server API routes forward the caller's JWT into an anon-key client and call the learner-resolving RPCs. **[V]**
- Two pre-existing security gaps on `profiles` (see §7). **[V]**

## 2. Dependency map (summary)

| Concern | Was | Now |
|---|---|---|
| Learner identity | `profiles.id` (1 per account) | `profiles.id` (N per account) — **unchanged key**, so no evidence moves |
| Ownership | `profiles.auth_user_id` UNIQUE | `profiles.auth_user_id` (non-unique) + guard trigger + governed `create_learner()` |
| Evidence tables (~30) | key `profile_id`/`learner_id` | **unchanged** — same rows, same keys |
| Evidence RLS | account-ownership via `profiles` | **unchanged** (correct for N learners) |
| Learner-resolving RPCs (23) | account → single row | `public.current_learner_id()` — header-named, ownership-validated, fail-closed |
| Reviewer/marker identity (4 fns) | account → single row | `current_account_default_learner_id()` (oldest learner; identity of the admin, not a child) |
| `claim_legacy_profile()` | claims an empty device profile | additionally refuses if the account already owns a learner |
| Pathway | local blob + mirrored column | learner column (authoritative) + learner-scoped cache |
| Exam date / provenance / school year | device-wide local blob only | learner columns (authoritative) + learner-scoped cache |
| XP / streak | local blob + `user_stats` mirror | learner-scoped cache + existing `user_stats` (seeds a fresh device) |
| Mock in-progress slot, migration flag | device-wide keys | learner-scoped keys |
| Child first name | device-wide local key | `profiles.learner_name` (parent-entered first name/nickname only) |
| Anonymous → account upgrade | `claim_legacy_profile()` | same, hardened (§5) |
| Analytics views (`profile_summary`, …) | per profile | unchanged (already per profile) |

## 3. New architecture

```
Parent / family account  (auth.users)
   └─ profiles row = LEARNER   (id = stable learner id; auth_user_id = owning account)
        ├─ Learner 1   ← every existing account's current profile, automatically
        ├─ Learner 2   ← create_learner()
        └─ Learner N   (max 8)
```

**Active learner = ONE context** (`lib/learnerContext.ts`). Every Supabase REST/RPC from the browser carries
`x-angel-learner-id`; the database validates it on every request:

| Header | Result |
|---|---|
| present + owned | that learner |
| present + not owned / malformed | `angel_learner_not_owned` — **never** falls back to another learner |
| absent + 1 learner | that learner (currently deployed client keeps working) |
| absent + >1 learners | `angel_learner_required` (fail closed) |
| no learners | `NULL` (identical to the old no-row case) |

Per-request (not a server-side "current child" flag), so two devices/tabs on different children cannot flip
each other. The choice is remembered per **tab** (sessionStorage) and per device (localStorage) as an
account-keyed pointer that is ignored for any other account. Server API routes forward the header; the
database still validates it.

## 4. Migration strategy (`supabase/migrations/260_multi_learner_household_architecture.sql`)

Single transaction; **self-verifying** (any failed invariant RAISEs → full rollback, production untouched):

1. Snapshot: profile identity checksum, exact row count of **every** table with a `profile_id`/`learner_id`
   column, owner-account count.
2. Add nullable learner columns (`learner_name`, `target_exam_date`, provenance, `school_year`) with CHECKs.
3. Drop `UNIQUE(auth_user_id)`; install guard trigger reproducing its effect (same name/code `23505`) for
   direct INSERT/UPDATE, so additional learners exist **only** via the governed RPC; forces `is_admin=false`
   on client inserts; advisory-lock serialised per account.
4. Replace the table-level UPDATE grant with explicit safe column grants (closes the `is_admin` gap).
5. `current_learner_id()`, `current_account_default_learner_id()`, `create_learner()` (auth required, refuses
   anonymous, name/pathway validated, cap 8).
6. **Rewrite the live definitions** of every function containing the single-row pattern (regex over
   `pg_get_functiondef`, so it is correct whichever migration last defined each) — and RAISE if any function
   still contains the pattern afterwards.
7. Harden `claim_legacy_profile()`.
8. Post-checks: checksum and every row count identical, zero functions left on the old pattern, constraint
   gone, trigger present, client can no longer UPDATE `is_admin`/`auth_user_id`.

**No evidence row is touched.** Rollback (commented at the end of the file) refuses while any account owns >1
learner, so it can never merge or drop a real learner.

**Safe order (backward compatible):** apply 260 → verify → merge/deploy the new client. Until an account adds a
second learner (only possible via the new client), every account has one learner and the currently deployed
client behaves identically. **[V by test: "single learner, no header … behaves exactly as before".]**

## 5. Existing-data preservation and anonymous upgrade

- Every current profile keeps its id, owner, device id, pathway, admin flag (checksum) and every evidence row
  (counts) — asserted inside the migration **and** by tests on a production-shaped seeded database.
- **Family #1** becomes the account's first learner automatically (it *is* the existing profile). Their
  evidence, pathway and history are untouched. Their browser's device-wide progress blob is **copied** (never
  moved/deleted) to the learner's scoped key — but only when `profiles.device_id` equals that device's id (so a
  different account or a second learner on a shared device can never inherit it). The one-time "already pushed
  lessons" flag travels with it, so no `lesson_progress` rows are duplicated. If a learner was created on a
  different device, the server-held setup (pathway, XP) still seeds the cache; only device-local extras
  (cached badge/weekly stats) may not carry, and the parent may need to re-enter the name once. **[O]**
- An anonymous learner upgraded into a parent account becomes **one** learner; `claim_legacy_profile()` now
  refuses when the account already owns a learner, still refuses evidence-bearing device profiles (migration
  188) and never re-claims a claimed one.

## 6. Learner name, per-learner state, UX

- **`learner_name`**: parent-entered first name/nickname only (≤40 chars, DB-enforced). Existing pre-260 local
  names are adopted onto the first learner automatically. Privacy notice + DPIA amended
  (`ANGEL_LR01_DPIA_AND_CHILDRENS_CODE_ASSESSMENT.md` §16); the earlier "device-only" wording was removed.
- **XP/streak** are legacy engagement state feeding Today's missions/badges; the canonical educational
  decisions use the DB evidence tables. Kept, learner-scoped, seeded from `user_stats` — not migrated into the
  core model **[R: leave as is; do not invest]**.
- **UI:** header "Viewing: Loni ▾" switcher on every page; `/add-child` (first name + optional pathway; rest of
  setup reuses the existing Pathways/dashboard steps); Parent Dashboard family overview (who is shown, choose
  child, "Add another child"); no aggregate across children; learner ids never shown. Switching does a full
  navigation so nothing from the previous child lingers in memory.

## 7. Security findings (found by test on real Postgres)

1. `profiles_insert_own` let a client INSERT its own row with `is_admin=true`.
2. Migration 008's column-level `revoke update (is_admin)` is **ineffective** under Supabase's table-level
   default grants — a client could `UPDATE profiles SET is_admin=true`. **Production status is an [A] until the
   verification pack's has_column_privilege check is run.** Both are closed by 260.

## 8. Test evidence

- `tests/supabase/migration260MultiLearner.test.ts` — **22 tests on real Postgres (PGlite)** replaying the
  actual migration chain: preservation, first-learner mapping, active-learner validation, cross-account and
  cross-sibling isolation (real RLS + real RPCs incl. a real Mock RPC), governed creation, anonymous upgrade,
  admin gaps, static coverage of every learner-resolving function.
- `tests/supabase/migration260VerificationPack.test.ts` — the Founder's read-only pack is valid, read-only, and
  reports the documented before/after values.
- `tests/lib/multiLearnerEiIsolation.test.ts` — real Educational Intelligence functions through a **strict**
  client that throws on any unscoped learner read: A2's evidence has zero effect on A1 and vice-versa.
- `tests/lib/learnerContext.test.ts` — transport header, switching, shared-device/sign-out/sign-in, per-learner
  storage, legacy claim, setup reconciliation, server-route forwarding.

## 9. Founder actions (in order)

1. Run `ANGEL_MULTI_LEARNER_MIGRATION_VERIFICATION_PACK.sql` (read-only) in the Supabase SQL Editor; save output.
2. Apply `supabase/migrations/260_multi_learner_household_architecture.sql` (one paste, one run).
3. Re-run the pack; compare. Expected: identical checksum/row counts/per-account evidence; `is_admin` and
   `auth_user_id` not client-updatable; 0 functions on the old pattern.
4. Tell Claude to merge `multi-learner-household` to `main` (deploys via Vercel) and run the production smoke.

## 10. Disclosed limits

- Removing a single child from an account is not self-service (request-based; DPIA §16).
- Max 8 learners per account. No co-parent, child login, sibling comparison, or billing (out of scope).
- Learner-list load failure fails closed for multi-learner accounts (no guess); the next request retries.
