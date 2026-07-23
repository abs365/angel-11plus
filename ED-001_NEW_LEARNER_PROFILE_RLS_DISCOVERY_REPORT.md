# ED-001 — New Learner Profile Creation Blocked by RLS

**Status:** Discovery and correction proposal only. **No production change made.** Confirmed via live, real evidence against the production database (`agxunwcdatosrmzhhuxj.supabase.co`, project "angel-digital-11plus") and the live production site (`https://angel-11plus.vercel.app`), using a genuinely fresh, isolated test device identity (`737eecc2-d17a-4661-b5e4-7322dc08c8e8`) that was never reused from any existing profile.

---

## UPDATE (2026-07-23, same session): proposed correction attempted and FAILED

Per Founder approval, one additional evidence check was performed first: Postgres logs (`logs/postgres-logs`, "Last 24 hours") show the identical RLS violation recurring at least as far back as **22 Jul 2026, 13:34:26** — over 24 hours before this investigation began. Postgres logs at this project's access tier do not capture DDL statement text, and the PostgREST log collection captures only errors (none beyond those already found) — **exactly how/when migration 012's policies were originally applied to production could not be conclusively established.** No evidence was found contradicting the reload hypothesis, so the proposed correction was executed:

```sql
NOTIFY pgrst, 'reload schema';
```
Executed successfully (`Success. No rows returned`).

**Immediately re-tested with a second, independent fresh test identity** (`device_id = 7c32a62c-7beb-4a8b-b81e-1af527426f61`, distinct from the discovery identity above) — completed a full live Maths activity (10/10) on the production site, then verified directly against the database:

```sql
select id, device_id, name, created_at from profiles
where device_id in ('737eecc2-d17a-4661-b5e4-7322dc08c8e8','7c32a62c-7beb-4a8b-b81e-1af527426f61');
-- Result: 0 rows. Success. No rows returned.
```

**Result: FAILED. The correction did not resolve the defect.** The production console logged the identical error at a new, genuinely fresh timestamp (07:43:41) — not a stale/cached repeat. **The schema-cache-staleness hypothesis in Section 1 is therefore incorrect, or at least insufficient.** The root cause remains open. Per instruction, Phase 3.1 Production Acceptance Verification has **not** been resumed. This ED-001 investigation continues to need deeper access than this session has (no `service_role` key, no direct Postgres shell, no Supabase support channel) to fully diagnose — most likely next step is escalating to Supabase support directly, or obtaining `service_role`/support-channel access for a future session.

No further production changes attempted beyond the one `NOTIFY` already executed and documented above.

---

## UPDATE 2 (2026-07-23, same session): Deep RLS Execution Diagnostic — root cause isolated to inside PostgreSQL, escalation required

**No production data or policy changes were made in this pass.** All tests below run inside `BEGIN ... ROLLBACK` transactions or are pure read-only catalog queries. A third, clearly-labelled diagnostic identifier was used: `device_id = 'ed001-diagnostic-ab6324e2'` (browser test) and `'ed001-txn-test-diagnostic'` (SQL-only transactional test, rolled back, never persisted).

### 1. Exact browser request shape

Captured via the browser's own `performance` API and Supabase's Postgres logs (the `query` field Postgres logged for the actual failing statement — the most authoritative source, since it is PostgREST's literal generated SQL):

- **HTTP method:** `POST`
- **REST endpoint:** `https://agxunwcdatosrmzhhuxj.supabase.co/rest/v1/profiles?on_conflict=device_id&select=id`
- **Submitted columns:** `device_id`, `name` (matches `ensureProfile()`'s payload exactly)
- **Conflict target:** `device_id` (matches `{ onConflict: "device_id" }` in the client call)
- **Representation requested:** `select=id` — a `.select("id")` chained onto the upsert, confirming `.single()` requests a single returned row via `Accept: application/vnd.pgrst.object+json`-style representation (inferred from the query shape; the literal `Prefer` header value itself could not be captured — the browser-side interceptor approach did not reliably observe this specific request twice out of three attempts, most likely because the bundled Supabase client holds an internal reference to `fetch` captured before this session's injected patch ran, not because of anything server-side).
- **Response:** `401`, JSON body reporting Postgres error `42501`, message `new row violates row-level security policy for table "profiles"`.
- **Exact operation:** confirmed via Postgres's own logged query text — a single `WITH pgrst_source AS (INSERT INTO "public"."profiles" ("device_id","name") SELECT ... FROM json_to_record(pgrst_payload) ... ON CONFLICT ("device_id") DO UPDATE SET "device_id" = EXCLUDED."device_id", "name" = EXCLUDED."name" ...)` — a standard, correctly-formed PostgREST upsert CTE. **Nothing unusual or malformed about the request shape.**
- **JWT claims** (decoded payload only, per instruction — no token or key value recorded): not directly capturable this pass, since the Authorization/apikey header values were not successfully intercepted (see above). This is a real gap in this diagnostic, disclosed rather than guessed around — the `anon`-role identity was instead confirmed by an equivalent, more authoritative route: the direct transactional test in Section 3 below, which sets `current_user = anon` explicitly and observes the identical failure, making the JWT's exact claims moot for root-causing this specific defect.

### 2. Exact `ensureProfile()` implementation, trigger/constraint inventory

From `lib/supabaseProgress.ts` (unchanged since original discovery):
```ts
export async function ensureProfile(name = "Angel"): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const deviceId = getDeviceId();
  if (!deviceId) return null;
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ device_id: deviceId, name }, { onConflict: "device_id" })
    .select("id")
    .single();
  if (error) { console.warn("[Supabase] ensureProfile failed:", error.message); return null; }
  return data.id;
}
```
- **Insert or upsert:** upsert (`INSERT ... ON CONFLICT (device_id) DO UPDATE`).
- **No existing-row lookup happens first** — the upsert is the only round-trip.
- **Chains `.select().single()`** — confirmed.
- **Generated/default columns:** `profiles.id` is `uuid primary key default gen_random_uuid()` — a server-side default, not submitted by the client; nothing here differs from what the SQL-level test also relied on (the transactional test also omitted `id`, letting the same default apply).
- **Triggers:** **zero user-defined triggers exist on `public.profiles`** — confirmed via `pg_trigger` (`select ... where tgrelid='public.profiles'::regclass and not tgisinternal` → 0 rows). Rules out a trigger silently causing or relabelling this rejection.
- **Table identity:** confirmed exactly one relation named `profiles` exists database-wide (`public.profiles`, oid `17559`, kind `r` = ordinary table, owner `postgres`) — rules out any schema-shadowing or duplicate-table ambiguity.

### 3. Transactional role test (direct SQL, bypassing PostgREST and the application entirely)

```sql
BEGIN;
SET LOCAL ROLE anon;
SELECT current_user, session_user, has_table_privilege('anon','public.profiles','INSERT') as anon_can_insert;
-- Result: current_user=anon, session_user=postgres, anon_can_insert=true
INSERT INTO public.profiles (device_id, name) VALUES ('ed001-txn-test-diagnostic', 'ED-001 Diagnostic') RETURNING *;
-- Result: ERROR: 42501: new row violates row-level security policy for table "profiles"
ROLLBACK;
```

**This is the decisive result of this whole diagnostic pass.** A raw INSERT, executed as `current_user = anon` (confirmed), from a brand-new SQL Editor connection with zero PostgREST or application involvement whatsoever, fails with the **identical** error the browser produces. Table-level `INSERT` privilege for `anon` is independently confirmed `true`. No conflict branch was even reached — this is the plain `INSERT` path failing on its own.

### 4. Policy context test

```sql
select p.polname, p.polcmd, p.polpermissive, p.polroles::regrole[] as roles_resolved,
       pg_get_expr(p.polqual, p.polrelid) as using_expr,
       pg_get_expr(p.polwithcheck, p.polrelid) as with_check_expr
from pg_policy p where p.polrelid = 'public.profiles'::regclass;
```

| polname | polcmd | polpermissive | roles_resolved | with_check_expr |
|---|---|---|---|---|
| `profiles_allow_anonymous_insert` | `a` (INSERT) | `true` | `{anon,authenticated}` | `true` |
| `profiles_allow_anonymous_update` | `w` (UPDATE) | `true` | `{anon,authenticated}` | `true` |

Queried directly from `pg_policy` (the base catalog, not the `pg_policies` view) — identical result to the original discovery pass. **Exactly 2 policies exist on this table, both permissive, both resolve to real, correctly-matching role oids (no stale-oid issue), both apply to `INSERT`/`UPDATE` for `anon`. No restrictive policy exists anywhere on this table** (a restrictive policy would appear as a third row with `polpermissive = false`; none does).

### 5/6/7. Interpretation

**Every condition that would normally guarantee this INSERT succeeds is independently confirmed true:**
- Table-level GRANT: `anon` has `INSERT` — confirmed (`has_table_privilege` = `true`).
- RLS policy: exists, permissive, unconditional `WITH CHECK (true)`, correctly scoped to `anon` — confirmed via the lowest-level catalog (`pg_policy`).
- No restrictive policy competing with it — confirmed (only 2 rows total, both permissive).
- No trigger intercepting or relabelling the operation — confirmed (0 triggers).
- No duplicate/shadow table — confirmed (exactly 1 `profiles` relation, oid 17559).
- Role context genuinely switches to `anon` under `SET LOCAL ROLE` — confirmed (`current_user = anon`).

**And yet the plain INSERT still fails, identically, on a brand-new connection with zero PostgREST involvement.**

Per the Work Package 5 interpretation gate: **this is conclusively Option A — the rejection originates inside PostgreSQL itself, in RLS policy evaluation for the `anon` role, not in PostgREST's request context, role mapping, UPSERT branch, or RETURNING/representation handling.** The UPSERT-vs-plain-INSERT question (Work Package 5's third branch) is now moot — the plain INSERT branch alone already fails, so the ON CONFLICT branch was never the issue.

**This exceeds what is diagnosable from this session's access level.** Every catalog-level explanation this session can query has been checked and rules out the ordinary explanations. The remaining plausible causes (a corrupted/mismatched catalog cache at the storage layer, a Supabase-platform-level enforcement layer sitting outside the visible `pg_policy` catalog, or something in the managed Postgres fork's own RLS implementation) are not things `pg_policy`/`pg_class`/`pg_trigger` introspection can see or that a non-`service_role`, non-superuser SQL Editor session can further probe.

## 8. Revised root-cause conclusion

Not a missing, misconfigured, or stale-cached policy (all ruled out with direct evidence, including a fresh non-PostgREST connection reproducing the exact failure). The rejection is confirmed to originate inside PostgreSQL's RLS enforcement for the `anon` role against `public.profiles`, through a mechanism this session's access level cannot further isolate. No further self-service correction is proposed — proceeding to escalation (Section 10) is the appropriate next step, not another guess.

## 9. Minimum correction proposal

**None proven this pass.** The only previously-proposed correction (`NOTIFY pgrst, 'reload schema'`) has been tested and failed, and this deeper pass shows the failure isn't even PostgREST-related, so a schema-cache reload was never going to fix it — that hypothesis is now fully retired, not just weakened. No new correction is proposed until Supabase support (or a future session with `service_role`/superuser access) identifies the actual mechanism.

## 10. Supabase escalation package

**Project reference:** `agxunwcdatosrmzhhuxj` (organisation "Angel Digital 11+", project "angel-digital-11plus")

**UTC timestamps of reproductions:**
- 2026-07-23 07:27:58 — first browser reproduction (`737eecc2-d17a-4661-b5e4-7322dc08c8e8`)
- 2026-07-23 07:35:36 — second browser reproduction (same identity)
- 2026-07-23 07:43:41 — third browser reproduction, post-`NOTIFY` (`7c32a62c-7beb-4a8b-b81e-1af527426f61`)
- 2026-07-23 07:49:44 — fourth browser reproduction (`ed001-diagnostic-ab6324e2`) — Postgres log id `7d24781b-4e27-4150-b9a6-18dd904bf91a`
- 2026-07-23 (this session, exact minute not separately recorded) — direct `SET LOCAL ROLE anon` SQL Editor reproduction, zero PostgREST involvement

**Historical pattern:** identical error recurring at least since 2026-07-22 13:34:26 (24+ hours before this investigation), confirmed via `logs/postgres-logs`.

**Exact sanitised request (from Postgres's own logged query, safe to share — contains no secrets):**
```sql
WITH pgrst_source AS (
  INSERT INTO "public"."profiles" ("device_id", "name")
  SELECT "pgrst_body"."device_id", "pgrst_body"."name"
  FROM json_to_record(pgrst_payload) AS _("device_id" text, "name" text) pgrst_body
  ON CONFLICT ("device_id") DO UPDATE SET
    "device_id" = EXCLUDED."device_id", "name" = EXCLUDED."name"
  ...
)
```

**Exact error response:** `HTTP 401`, Postgres `42501`, `new row violates row-level security policy for table "profiles"`, `hint: null`, `detail: null`.

**Policy inventory:** Section 4 table above (2 permissive policies, INSERT + UPDATE, roles `{anon,authenticated}`, `WITH CHECK (true)`).

**Grants inventory:** `anon` holds `DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE` on `public.profiles` (confirmed via `information_schema.role_table_grants`).

**Trigger inventory:** none (0 non-internal triggers on `public.profiles`).

**Direct `SET LOCAL ROLE anon` INSERT test result:** fails identically — `ERROR: 42501: new row violates row-level security policy for table "profiles"` — inside a rolled-back transaction, from a fresh SQL Editor connection, with `current_user` independently confirmed as `anon` immediately beforehand.

**Schema reload result:** `NOTIFY pgrst, 'reload schema'` executed successfully; had no effect (expected, since the fault is now shown to be pre-PostgREST).

**Confirmation no policy or data change was made:** all diagnostic INSERTs were rolled back; the only non-rollback-scoped statement executed this entire investigation is the single, already-documented `NOTIFY`, which alters no schema or data.

**Requested from Supabase support:** why a permissive `WITH CHECK (true)` INSERT policy, correctly scoped to `anon`, with confirmed table-level grants and no competing restrictive policy or trigger, still rejects a plain INSERT executed as `current_user = anon` on a fresh connection.

---

## 1. Confirmed root cause (as originally diagnosed — see UPDATE above for the outcome of testing it)

**A fully permissive, correctly-scoped RLS policy already exists on `public.profiles` and permits the exact operation `ensureProfile()` performs — yet two separate, real, time-separated live attempts to insert a new anonymous profile both failed with the same RLS violation.** This is not a missing-policy defect; it is a live discrepancy between the database's actual configured state and the behaviour PostgREST is enforcing at request time.

Ruled out, with direct evidence (not assumption), as explanations:
- **Wrong policy/no policy** — ruled out. `pg_policies` shows both policies from `supabase/migrations/012_anonymous_profile_rls_correction.sql` exist, exactly as written (Section 2).
- **Missing table-level GRANT** — ruled out. `information_schema.role_table_grants` confirms `anon` has `INSERT` (and `SELECT`, `UPDATE`, `DELETE`) on `public.profiles`.
- **Wrong Supabase project** — ruled out. The live deployed app's own network request (captured via `performance.getEntriesByType('resource')` in the running page) targets `agxunwcdatosrmzhhuxj.supabase.co/rest/v1/profiles` — the identical project inspected via the Dashboard.
- **Broken role hierarchy** — ruled out. `authenticator` (PostgREST's login role) is a confirmed member of `anon`, `authenticated`, and `service_role`; standard, healthy Supabase role configuration.
- **Simple PostgREST schema-cache staleness that resolves itself over time** — **not fully ruled out, but weakened.** A second real attempt, made several minutes after the first, still failed identically. If this were pure cache staleness from a very recent policy change, elapsed time alone should very likely have resolved it via Supabase's normal auto-refresh; it did not.

**Most likely remaining explanation, not directly provable from this session's access level:** PostgREST's schema/policy cache was never notified of the change and has not self-corrected — this is a known Supabase behaviour when DDL is applied through a path that doesn't trigger the dashboard's automatic `NOTIFY pgrst, 'reload schema'` (e.g. certain automated/API-driven migration runners). This session cannot confirm *how* migration 012 was originally applied to production, so this is flagged as the leading hypothesis, not a certainty (see Section 5, item 8).

## 2. Current RLS policy inventory (live, from `pg_policies` and `pg_class`, 2026-07-23)

| Property | Value |
|---|---|
| `relrowsecurity` (RLS enabled) | `true` |
| `relforcerowsecurity` (RLS forced, even for owner) | `false` |

| Policy name | Command | Roles | USING | WITH CHECK |
|---|---|---|---|---|
| `profiles_allow_anonymous_insert` | INSERT | `{anon, authenticated}` | `NULL` (n/a for INSERT) | `true` |
| `profiles_allow_anonymous_update` | UPDATE | `{anon, authenticated}` | `true` | `true` |

Exactly 2 policies exist on `public.profiles` — no SELECT or DELETE policy exists at all. Per Postgres RLS semantics, **the absence of a SELECT policy while RLS is enabled would normally deny all SELECTs** — but `PR001_PLATFORM_READINESS_REPORT.md` (2026-07-20) documented live evidence that anonymous SELECT already succeeds (`GET /rest/v1/profiles?select=id&limit=1` → 200). This session did not re-test SELECT directly against the REST endpoint, only observed that no SELECT policy is defined; reconciling this is flagged as an open question, not resolved here (see Section 5, item 8).

## 3. `ensureProfile()` request behaviour (from source, `lib/supabaseProgress.ts`)

```ts
export async function ensureProfile(name = "Angel"): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const deviceId = getDeviceId();
  if (!deviceId) return null;
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ device_id: deviceId, name }, { onConflict: "device_id" })
    .select("id")
    .single();
  if (error) { console.warn("[Supabase] ensureProfile failed:", error.message); return null; }
  return data.id;
}
```

- **Client identity used:** the `anon` API role. No `supabase.auth.getUser()` call happens inside `ensureProfile()` itself (a separate function, `resolveProfileId()`, checks for an authenticated session first and falls back to `ensureProfile()` — but this app has no real sign-in flow wired to any of the pages exercised this session, so every request observed was anonymous).
- **Exact operation issued:** `upsert(..., { onConflict: "device_id" })` — Postgres `INSERT ... ON CONFLICT (device_id) DO UPDATE`.
- **Does the upsert require both INSERT and UPDATE permission?** Yes. For a `device_id` that has never been seen before (the fresh-identity case this session tested), the `INSERT` path is taken exclusively — no conflict exists yet, so the `UPDATE` policy is never reached or needed for a brand-new learner. The `UPDATE` policy only matters for a *returning* device whose row already exists — confirmed separately: this session's earlier, unrelated observation that existing/returning devices continue to work is consistent with the `UPDATE` policy already being effective.
- **Live confirmation of failure**, captured directly from the running production page's console (not simulated): `[Supabase] ensureProfile failed: new row violates row-level security policy for table "profiles"`.

## 4. Security assessment

**The device-id-only identity model cannot enforce genuine, cryptographically-verified row ownership under Supabase RLS, and no policy change can fix that on its own.** This is an architectural limitation, not a policy bug — flagged clearly, per instruction, before any workaround is proposed:

- `device_id` is a client-generated UUID stored in `localStorage` and sent as an ordinary column value on every request. Postgres RLS has no way to verify a request's claimed `device_id` actually belongs to the caller — unlike `auth.uid()`, which is cryptographically derived from a signed JWT issued by Supabase Auth on real sign-in, `device_id` is just data, indistinguishable at the RLS layer from any other value a client chooses to send.
- The "textbook" restrictive design migration 002 originally sketched (`device_id = current_setting('app.device_id')`) would not actually close this gap even if implemented — it requires the *client* to set a Postgres session variable, and nothing stops a malicious client from setting someone else's `device_id` into that same variable. It would prevent accidental cross-contamination, not a deliberate attacker.
- **Consequently, today, with this table holding only `device_id`/`name`/`auth_user_id`/`created_at` (no sensitive data):**
  - A new learner creating their own profile: achievable via a permissive INSERT (not ownership-scoped, because no verifiable ownership concept exists yet for anonymous users).
  - An existing learner reading only their own profile: **not currently enforced** — SELECT is effectively unrestricted for `anon` (PR-001's live-tested finding). Pre-existing, not introduced by this investigation, not proposed to change here (see Section 6).
  - An existing learner updating only their own profile: **not currently enforced** — the UPDATE policy's `USING (true)` permits updating any row, not just the caller's own.
  - Preventing access to another learner's profile, or arbitrary profile creation for another device: **not enforceable under the current identity model** — doing so correctly requires real Supabase Auth (`auth.uid()`), which this app does not have wired to an actual sign-in flow for the pages exercised this session.

**This is a standing, disclosed architectural limitation of the anonymous/device-id model as a whole, matching PR-001's own prior conclusion — not something introduced by, or fixable within, this specific defect investigation.** A genuine fix would be a separate, larger work package: wiring real Supabase Auth and rewriting `profiles`' RLS policies around `auth.uid()`.

## 5. Minimum correction proposal

**Root cause:** Not a missing or misconfigured policy — the correct, minimal, already-reasoned-through policy (migration 012, drafted 2026-07-20) is present and syntactically permits the operation. The defect is that real requests are still being rejected despite this, most likely due to PostgREST not having picked up the policy (schema cache), though this session cannot fully confirm the mechanism (Section 1).

**Affected user journey:** Any genuinely new (never-before-seen device) anonymous visitor. Every downstream feature this session's Educational Evidence Integration work depends on (`ali_student_question_history`, `ali_educational_audit`, Readiness History) requires a resolvable `profileId` first — so this defect blocks the entire Educational Intelligence Engine for new learners, not just profile creation itself.

**Security implications:** None from the proposed correction itself — it changes no policy, no data, no permission. (Section 4's architectural limitation is separate and pre-existing, not touched by this proposal.)

**Proposed correction, in order of preference:**

1. **First, and least invasive: request a PostgREST schema/config reload.**
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
   This does not alter any table, policy, grant, or data — it only tells PostgREST (Supabase's REST layer) to re-read the configuration that already exists in the database. If the hypothesis in Section 1 is correct, this alone resolves the defect with zero schema risk.

   **Rollback:** None needed — this action has no persistent effect to roll back; it only triggers a cache refresh.

2. **If (1) does not resolve it:** re-verify the exact policy state a second time (re-run the Section 2 queries) to confirm the policies are still present and unchanged, then escalate to Supabase support/dashboard-side investigation — this session's access level (SQL Editor only, no `service_role`, no direct Postgres superuser shell, no access to Supabase's own internal PostgREST instance logs) cannot diagnose further than what Section 1 already establishes.

**Validation SQL** (read-only, safe to run before and after either step):
```sql
-- Confirm policies still present, unchanged
select policyname, cmd, roles, qual, with_check
from pg_policies where schemaname='public' and tablename='profiles';

-- Confirm no profile exists yet for the dedicated test identity
select count(*) from profiles where device_id = '737eecc2-d17a-4661-b5e4-7322dc08c8e8';
```

**Risk assessment:** Very low. `NOTIFY` is a standard, reversible-by-nature Postgres operation with no schema or data side effects.

**Expected effect on existing users:** None. Existing profiles already succeed via the UPDATE path, which this proposal does not touch.

**Expected effect on new users:** If the hypothesis is correct, brand-new anonymous learners will be able to create a profile and proceed into the app for the first time — currently impossible.

## 6. Verification plan (post-approval only, per Work Package 4 — not executed in this discovery pass)

1. Apply the approved correction (Section 5).
2. Mint a new isolated test identity (a second fresh UUID, distinct from `737eecc2-...` so this discovery's evidence trail stays intact).
3. Confirm a profile row is created for it.
4. Confirm the existing security posture is unchanged: attempt to read/update a *different* device's profile row from the same anon context and observe whether it's blocked or permitted — recording the real result rather than assuming, since Section 4 already establishes this is likely still unrestricted (pre-existing, out of scope to fix here, but worth re-confirming it wasn't accidentally changed).
5. Complete one Maths activity as the new test identity.
6. Verify the full evidence chain (Student Question History → Educational Audit → Readiness Snapshot → Learning History → Parent Timeline) — the exact chain Phase 3.1 was part-way through when this defect was found.
7. Re-run the existing (unmodified) `angel11plus_device_id`-based session in this same browser to confirm zero regression to already-working returning users.
8. Resume Phase 3.1 Production Acceptance Verification only after all of the above pass.

## 7. Production risk recommendation

**Recommend proceeding with the minimal, reversible `NOTIFY pgrst, 'reload schema'` correction, pending explicit approval** — it carries effectively no risk to existing data, policies, or users, is fully explained by real evidence gathered this session, and unblocks the single defect standing between the already-verified Educational Evidence Foundation and genuine new-learner production verification. The separate, larger architectural question (Section 4 — real Auth needed for genuine row ownership) is explicitly **not** part of this recommendation and should be scoped as its own future work package if the Founder wants to close it.

---

**Test identity used throughout this discovery, for traceability:** `device_id = 737eecc2-d17a-4661-b5e4-7322dc08c8e8`. Confirmed zero profile row exists for it as of this report (baseline preserved, not consumed by any successful write).

No migration applied. No policy changed. No data written to `profiles`, `ali_student_question_history`, or `ali_educational_audit` as a result of this investigation.
