# Profiles RLS Investigation

**Title:** Profiles RLS Investigation
**Version:** 1.0
**Status:** Investigation complete — no code, migrations, or Supabase configuration were modified
**Project:** Angel 11+
**Phase:** 5B.6 — Profiles RLS Investigation
**Owner:** ELBOLD
**Last Updated:** July 2026
**Purpose:** Determines the exact, evidenced cause of the `new row violates row-level security policy for table "profiles"` error found in the Final Production Smoke Test, by comparing the live production database's actual behaviour against every committed migration and the code path that triggers the failure.

---

## Current RLS Configuration

**Is RLS enabled? Yes — confirmed empirically, not assumed.** The exact Postgres error text `new row violates row-level security policy for table "profiles"` is only ever raised when Row Level Security is active on that table; Postgres cannot produce this specific message if RLS is disabled, regardless of any policy content. This is conclusive on its own.

**Which INSERT policy exists?** No committed migration ever creates one (see below). Live behaviour — a genuine `POST .../rest/v1/profiles?on_conflict=device_id&select=id` returning `401` with the RLS-violation message, reproduced six times across all four practice routes and a retry, from a fresh anonymous session — shows that whatever policy state currently exists in production, it does not permit an `anon`-role insert.

**Which SELECT policy exists?** Not directly enumerable from this environment (see "What could not be directly verified," below), but a live, read-only probe was run: a bare `GET https://agxunwcdatosrmzhhuxj.supabase.co/rest/v1/profiles?select=id&limit=1` sent with only the anon key returned **`200` with an empty array `[]`**. This is consistent with either (a) no working SELECT policy for `anon` — Postgres RLS silently filters SELECT results to nothing rather than throwing, unlike INSERT/UPDATE which throw explicitly — or (b) a policy that does work but currently matches zero rows, which is itself plausible if every anonymous INSERT attempt to date has failed (meaning the table may hold few or no anon-created rows at all). The asymmetry itself — SELECT fails silently, INSERT fails loudly — is expected, standard Postgres RLS behaviour and is not itself informative about which specific policy text exists.

**Which UPDATE policy exists?** Not empirically tested (would require a row to already exist to attempt an update against, and no row could be created — see Root Cause). No committed migration creates one.

**Which DELETE policy exists?** Not tested (no legitimate reason to probe this destructively during a verification task). No committed migration creates one.

**What could not be directly verified:** this environment has no Supabase Dashboard access, no service-role key, and no direct Postgres connection — only the same public anon key the application itself uses, via a real browser session. `pg_policies` (the system catalog that would list policy names, roles, and conditions verbatim) is not exposed through Supabase's PostgREST API to the anon role, RLS or no RLS. Everything above is the strongest evidence obtainable without dashboard/service-role credentials, and the migration-history comparison below is independently conclusive regardless of this gap.

## Intended Architecture — Verified Against the Actual Schema, Not Assumed

Read every migration file touching `profiles`, in order, rather than trusting any single document's summary:

- **`supabase/migrations/001_initial_schema.sql`, lines 70–77**: creates `profiles`, then explicitly — `alter table public.profiles disable row level security;` — with the comment: *"Disabled for now (no auth). Enable when authentication lands. Each policy will filter by: `profiles.device_id = requesting device`."* This is a stated **plan**, not yet an implementation.
- **`supabase/migrations/002_add_auth_user_id.sql`, lines 15–24**: adds `auth_user_id` to link anonymous device profiles to real Supabase Auth users, with the comment: *"RLS is still disabled. When authentication is fully wired: 1. Enable RLS on all three tables 2. Add policies: profiles: `WHERE device_id = current_setting('app.device_id') OR auth_user_id = auth.uid()` … This will be done in migration 003 once auth is live."*
- **`supabase/migrations/003_analytics_view.sql`**: read in full — contains **only** four read-only SQL views (`subject_analytics`, `lesson_analytics`, `recent_activity`, `profile_summary`). **It does not enable RLS and does not add any policy**, despite migration 002 explicitly saying this is where it would happen. The planned step was never taken.
- **`supabase/migrations/008_admin_and_beta_submissions.sql`, lines 26–29** (the most recent migration to touch `profiles`, written during Phase 5A): *"SECURITY DEFINER so it can check `profiles.is_admin` without requiring RLS changes on the profiles table itself (**profiles/user_stats/lesson_progress intentionally keep their existing RLS-disabled state from migrations 001–002** — out of scope for this phase, no regression risk introduced to the existing anonymous device-based progress sync)."*

**This is unambiguous.** Every single committed migration, including the most recent one, agrees: `profiles` is intended to have RLS **disabled**, right now, as the current and deliberate state — not a stale historical fact, but a position actively reaffirmed as recently as Phase 5A. A future RLS-enable step was sketched twice (in comments) with a specific policy design (`device_id` session variable OR `auth.uid()`), and never implemented in any migration or in application code.

**Verdict on the three possibilities posed:** this is **not** "RLS intentionally disabled" in the sense of a closed, permanent decision — the comments frame it as temporary, pending a real implementation. It is **not** "RLS intended but the required policy is missing" as an oversight in the committed code — the code is internally consistent and correctly matches its own stated intent (disabled, with a documented future plan). It is squarely the third option: **the live database has evolved independently of, and now contradicts, every committed migration and every piece of documentation** — something enabled RLS directly against production, outside of any migration file, and did not add the policy that would have been required to make that safe.

## Root Cause

**Trace of the failing code path**, read directly from source rather than inferred:

1. `app/mocks/adaptive/{gl,maths,english,vocabulary}/page.tsx` — every one of the four Personalised Practice routes calls `ensureProfile()` as the very first step of `loadAndStart()`, before anything else can happen.
2. `lib/supabaseProgress.ts`, `ensureProfile()` (lines 58–76): builds a Supabase client via `getSupabaseClient()` (anon key only, no service role), then executes:
   ```ts
   const { data, error } = await supabase
     .from("profiles")
     .upsert({ device_id: deviceId, name }, { onConflict: "device_id" })
     .select("id")
     .single();
   ```
3. **Which role executes this**: `getSupabaseClient()` (`lib/supabase.ts`) constructs its client from `NEXT_PUBLIC_SUPABASE_ANON_KEY` alone. Decoding that key's JWT payload shows `"role": "anon"` explicitly. Unless a user has already completed the separate magic-link sign-in flow (which establishes a `authenticated`-role session on top of this), every Personalised Practice attempt — which is the default, pre-login state for any new visitor — executes this upsert as the plain **`anon`** Postgres role.
4. **Why that role does not satisfy the current policy**: because RLS is live-enabled on `profiles` (confirmed above) and no migration ever created an INSERT policy admitting `anon`. Whatever policy configuration currently exists in production, it does not include a `WITH CHECK` clause the `anon` role can satisfy for an INSERT — either because there is no INSERT policy at all (Postgres's default-deny stance the instant RLS is turned on with zero policies present), or because an INSERT policy exists but is scoped to `authenticated` / `auth.uid()` only, matching migration 002's *sketch* but without the corresponding `device_id`-matching branch the anonymous flow actually depends on.

**In one sentence:** RLS was turned on for `profiles` in production without also adding the anonymous-friendly INSERT policy that the application's entire pre-login flow requires, and without this change ever being captured in a migration file — so the committed codebase, which everywhere else correctly assumes RLS is off, is now running against a database that silently disagrees with it.

## Smallest Safe Fix

Two options exist; only the first is being recommended as immediate action, precisely because of the instruction to prefer restoring intended state over weakening protection — and here, the *intended, currently-documented* state genuinely is "RLS disabled," not a security compromise.

**Recommended — Option A: restore RLS to its documented, currently-intended state.** In the Supabase Dashboard, run `alter table public.profiles disable row level security;` — the exact statement `001_initial_schema.sql` already contains and `008`'s own comment reaffirms as current. This is not "disabling security that was meant to be on" — it is undoing an undocumented, out-of-band change and returning the live database to match what every committed migration and the most recent phase's own documentation already says is true today. It carries no new risk beyond what has already been running in production since this project's inception, since it is the state the entire application was built and tested against.

**Not recommended for immediate action, but the correct long-term direction — Option B: finish the RLS implementation migrations 001–002 already sketched.** This means: (1) keep RLS enabled, (2) add an INSERT/SELECT/UPDATE policy on `profiles` matching migration 002's own design — `device_id = current_setting('app.device_id', true) OR auth_user_id = auth.uid()` — and (3) modify the application's Supabase client calls to actually set that `app.device_id` session variable per request (via a Postgres `SET` executed through an RPC, or a custom claim), which does not exist anywhere in the current codebase today. This is real, if modest, application code work, explicitly out of scope for this investigation-only task, and should be scoped as its own follow-up phase rather than attempted as a same-session dashboard fix.

## Security Implications

- **Choosing Option A (disable RLS again) does not introduce a new gap** — it returns to exactly the security posture that has been live in production since Phase 1, the posture every prior audit and phase of this project (including the independent Foundation Audit) has already reviewed and accepted as a scoped, deliberate decision for these three tables specifically.
- **The real, standing risk this investigation surfaces is process, not data exposure**: a change was made directly against the live database that contradicts every committed migration, and nothing in the repository recorded it. That's a gap in change control for this Supabase project, not a new vulnerability in the schema itself — worth a operational fix (always capture schema/policy changes in a migration file, even ones made through the Dashboard UI) independent of which RLS option is chosen.
- **Choosing Option B properly closes a real, if low-severity, gap** that has existed since Slice 1: today, any anonymous or authenticated client holding only the public anon key can read or write any profile's row by guessing/iterating `device_id` values, since there is no server-side check tying a request to the profile it claims. This has been a known, accepted, scoped risk throughout this project's history (per every prior phase's documentation) — Option B is the actual fix for it, whenever a future phase takes it on.

## Recommendation

**Restore RLS to disabled on `public.profiles` (Option A)**, matching what `001_initial_schema.sql` and `008_admin_and_beta_submissions.sql`'s own comments both already state is the current, intended, and recently-reaffirmed architecture. This is the smallest, safest, immediately available fix, requires no application code changes, and carries no security regression relative to what has already been running throughout this project's life. Separately — not urgently, but genuinely — this project should decide, in its own time, whether to finally implement the device-id-based RLS policy migration 002 sketched three phases ago (Option B), since "enable it properly later" has now been deferred through two migrations without being picked back up.
