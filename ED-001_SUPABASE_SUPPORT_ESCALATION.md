# ED-001 — Supabase Support Escalation Package

**Prepared for submission to Supabase Support. Not yet submitted — pending confirmation before sending, since this creates a real external communication under the project's Supabase account.**

---

## Ticket text (ready to submit verbatim)

**Subject:** Permissive `WITH CHECK (true)` INSERT policy on `public.profiles` still rejects `anon`-role INSERT — reproduces via direct `SET LOCAL ROLE`, bypassing PostgREST entirely

**Project reference:** `agxunwcdatosrmzhhuxj`

**Body:**

> We have a table, `public.profiles`, with RLS enabled and exactly two policies:
>
> - `profiles_allow_anonymous_insert` — permissive, command INSERT, roles `{anon, authenticated}`, `WITH CHECK (true)`
> - `profiles_allow_anonymous_update` — permissive, command UPDATE, roles `{anon, authenticated}`, `USING (true)`, `WITH CHECK (true)`
>
> No restrictive policy exists on this table (confirmed via `pg_policy` directly, not just the `pg_policies` view). `anon` has the table-level `INSERT` grant (confirmed via `has_table_privilege('anon','public.profiles','INSERT')` → `true`). There are no triggers on the table (confirmed via `pg_trigger`, excluding internal triggers). There is exactly one relation named `profiles` in the database (`public.profiles`, oid 17559, ordinary table, owner `postgres`) — no shadow/duplicate table.
>
> Despite all of the above, both of the following fail identically with the same error:
>
> **1. A real anonymous POST via our app's PostgREST client** (`.from("profiles").upsert({device_id, name}, {onConflict:"device_id"}).select("id").single()`), reproduced live multiple times across roughly 24+ hours (earliest observed: 2026-07-22 13:34:26 UTC; most recent: 2026-07-23 07:49:44 UTC).
>
> **2. A direct SQL reproduction in the Supabase SQL Editor, executed as the `anon` role via `SET LOCAL ROLE`, with zero PostgREST or application involvement:**
> ```sql
> BEGIN;
> SET LOCAL ROLE anon;
> SELECT current_user; -- confirmed: anon
> INSERT INTO public.profiles (device_id, name)
> VALUES ('sanitised-diagnostic-id', 'ED-001 Diagnostic')
> RETURNING *;
> ROLLBACK;
> ```
> Result: `ERROR: 42501: new row violates row-level security policy for table "profiles"`.
>
> We also tried `NOTIFY pgrst, 'reload schema';` in case PostgREST's schema cache was stale — no effect, and given (2) above reproduces with zero PostgREST involvement, we don't believe PostgREST is actually implicated at all.
>
> **Question for support:** why does PostgreSQL reject a plain INSERT, executed as a role directly confirmed to be `current_user = anon`, against a table where the only applicable policy for that role and command is an unconditional permissive `WITH CHECK (true)`, with no competing restrictive policy, no trigger, and confirmed table-level grants? We've exhausted what we can diagnose via SQL Editor access to `pg_policy`/`pg_class`/`pg_trigger`/`information_schema` and would appreciate help identifying what's actually enforcing this rejection.
>
> All diagnostic INSERTs above were rolled back; no schema, policy, or learner data was changed during this investigation.

---

## Attachments / evidence excerpts (numbered per the required checklist)

**1. Project reference:** `agxunwcdatosrmzhhuxj` (organisation "Angel Digital 11+", project "angel-digital-11plus")

**2. Exact UTC timestamps of failures:**
- 2026-07-22 13:34:26 — earliest observed occurrence found in retained logs (24-hour log window; earlier occurrences may exist but are outside retention)
- 2026-07-23 07:27:58, 07:35:36, 07:43:41, 07:49:44 — four independent live browser reproductions, each with a distinct, never-reused test identity
- 2026-07-23 (same session) — direct `SET LOCAL ROLE anon` SQL reproduction, rolled back

**3. Sanitised SQL reproduction:** as shown in the ticket body above, using the literal placeholder id `sanitised-diagnostic-id` (the actual diagnostic ids used during investigation — `ed001-diagnostic-ab6324e2`, `ed001-txn-test-diagnostic`, `737eecc2-d17a-4661-b5e4-7322dc08c8e8`, `7c32a62c-7beb-4a8b-b81e-1af527426f61` — are safe to share too if requested; none persisted, all rolled back or never wrote a row).

**4. Exact PostgreSQL error code and message:** `42501` / `new row violates row-level security policy for table "profiles"`. Postgres log fields `hint` and `detail` were both `null` for every occurrence.

**5. Table grants evidence:**
```
grantee        | privilege_type
anon           | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
```
(from `information_schema.role_table_grants` filtered to `table_name='profiles'`)

**6. Raw `pg_policy` catalogue evidence:**
```
polname                              | polcmd | polpermissive | roles_resolved          | with_check_expr
profiles_allow_anonymous_insert      | a      | true          | {anon,authenticated}   | true
profiles_allow_anonymous_update      | w      | true          | {anon,authenticated}   | true
```
(queried directly from `pg_policy`, joined to `pg_get_expr()` for the human-readable expressions — not the summarised `pg_policies` view, to rule out a view-level discrepancy)

**7. Confirmation no restrictive policy exists:** the query in (6) returns every policy on the table regardless of permissive/restrictive status; only 2 rows exist, both `polpermissive = true`. No third, restrictive row exists.

**8. Trigger inventory:** `select tgname from pg_trigger where tgrelid='public.profiles'::regclass and not tgisinternal;` → 0 rows.

**9. Relation inventory:** `select nspname, relname, relkind, relowner, oid from pg_class join pg_namespace ... where relname='profiles';` → exactly 1 row (`public.profiles`, kind `r`, owner `postgres`, oid `17559`).

**10. PostgREST request log evidence:** Postgres's own logged query for the failing request (from `logs/postgres-logs`, log id `7d24781b-4e27-4150-b9a6-18dd904bf91a`, 2026-07-23 07:49:44):
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
A standard, correctly-formed PostgREST-generated upsert — nothing malformed.

**11. Result of `NOTIFY pgrst, 'reload schema';`:** executed successfully (`Success. No rows returned`); re-test immediately after with a fresh identity still failed identically at 07:43:41.

**12. Confirmation all diagnostic writes were rolled back:** the SQL-level reproduction used `BEGIN ... ROLLBACK`; the browser-level reproductions never succeeded in writing a row (that's the defect itself) — in both cases, `select count(*) from profiles where device_id in (...)` for every diagnostic identity used returns `0`.

**13. Confirmation no production policy, schema, or learner data was changed during diagnosis:** the only non-rolled-back statement executed in this entire investigation is the single `NOTIFY pgrst, 'reload schema'` (Section 11 above), which alters no schema, policy, or data — it only requests a cache refresh. No `ALTER`, `CREATE`, `DROP`, or persisted `INSERT`/`UPDATE`/`DELETE` was run against this project during ED-001.

---

**Status: prepared, not yet submitted.**
