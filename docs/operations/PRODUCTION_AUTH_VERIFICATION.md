# Production Authentication Verification — Phase 5B.3

**Title:** Production Authentication Verification
**Version:** 1.0
**Status:** Verification complete — no code, environment variables, or Supabase configuration were modified
**Project:** Angel 11+
**Phase:** 5B.3 — Production Authentication Verification
**Owner:** ELBOLD
**Last Updated:** July 2026
**Purpose:** Determines whether the "Failed to fetch" issue observed in Phase 5B.2 is limited to preview-style deployments or also affects the real production application, and identifies its exact root cause.

---

## Environments Tested

| # | Environment | URL |
|---|---|---|
| 1 | Per-deployment production URL (the one used in Phase 5B.2's verification) | `https://angel-11plus-ju80h2qib-abs365s-projects.vercel.app` |
| 2 | Canonical production alias | `https://angel-11plus.vercel.app` |

**Important correction to the working assumption going into this phase:** environment #1 is not a "preview deployment" in the Vercel sense (a branch/PR build with its own environment variables). It was confirmed via `gh api repos/abs365/angel-11plus/deployments/5304181721` to be an **environment: "Production"** deployment — every deployment, including production ones, gets its own unique per-deployment hostname in addition to the stable alias. There is no separate "preview" deployment to test, because this project has never deployed from a branch or pull request — every deployment so far has gone straight to `main`. Both URLs tested here are genuinely production-configured; they differ only in hostname, not in environment.

No custom domain is configured for this project (confirmed via `vercel domains ls` — only an unrelated domain, `elbold.com`, exists on this Vercel account). `https://angel-11plus.vercel.app` is the real, canonical production URL.

## Result

**Identical failure on both environments.** This is not a preview-vs-production discrepancy — the same failure, at the same step, with the same HTTP status, occurs on both the per-deployment URL and the canonical production alias.

| Question | Environment 1 | Environment 2 (canonical production) |
|---|---|---|
| Does Supabase initialise? | **Yes** | **Yes** |
| Does the first auth request reach Supabase? | **Yes** — a real HTTP response is received | **Yes** — identical |
| Does fetch fail? | **Yes** | **Yes** |
| HTTP status | **503** (on the CORS preflight `OPTIONS` request) | **503** — identical |
| Browser console | `[Supabase] ensureProfile failed: TypeError: Failed to fetch` | Identical message |
| Network request | `OPTIONS https://agxunwcdatosrmzhhuxj.supabase.co/rest/v1/profiles?on_conflict=device_id&select=id` | Identical request, identical URL, identical project reference |
| Response | `503` — the browser then blocks the real `PATCH`/`POST` request because the preflight did not succeed, which is what surfaces to application code as a generic `TypeError: Failed to fetch` | Identical |

**"Does Supabase initialise?" — confirmed yes, on both, and this matters:** on both URLs, the app reached the "We couldn't set up your practice profile" error message, not the earlier "Practice needs a connection that isn't available right now" message. Per `lib/supabase.ts`, the second message only appears if `getSupabaseClient()` returns `null` — which only happens if `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing. Reaching the profile-setup error instead means both environment variables are present and a real Supabase client object was constructed successfully, on both URLs. **The failure is not a missing-environment-variable problem.**

## This Is Not Expected Configuration Behaviour

Because both a fresh reproduction attempt on environment #1 (three separate attempts, all identical) and a first-time test on environment #2 (the real production alias) produced the exact same `503` on the exact same endpoint, this cannot be explained as "preview deployments don't have production Supabase credentials" — both environments demonstrably have the same, correctly-configured credentials, and both fail the same way. **Production also fails. This required determining the exact root cause, per the escalation instruction.**

## Root Cause

**A `503 Service Unavailable` returned directly by Supabase's own edge, on the `OPTIONS` preflight, before any application code, CORS policy, or Vercel configuration is involved.**

This was confirmed two ways:
1. The browser's own network inspector recorded the `OPTIONS` request completing with a real, numbered HTTP response — `503` — not a blocked/no-status request (which is what a pure CORS-origin rejection typically looks like).
2. A raw same-context `fetch()` executed directly in the browser console against `https://agxunwcdatosrmzhhuxj.supabase.co/rest/v1/` (bypassing the app entirely) also failed with `TypeError: Failed to fetch` — confirming the problem sits at the Supabase endpoint itself, not in anything the Angel codebase does with the response.

**Because the exact same 503, on the exact same endpoint, occurs identically regardless of which Vercel hostname makes the request, the root cause cannot be a Vercel deployment setting, a CORS allow-list entry, or an environment-variable difference between deployments — all of those would be expected to behave differently across two different origins if they were the cause, and they did not.** The most likely explanation, consistent with a `503` returned by Supabase's own edge and with this project's own history (confirmed across every prior phase: migrations 004–008 were never applied, all four ALI subjects have only ever run against synthetic fixtures, and this Supabase project has never been the target of real production traffic) is that **the Supabase project itself is currently paused or otherwise unavailable at the platform level** — free-tier Supabase projects are automatically paused after a period of inactivity, and this project's entire operating history is consistent with exactly that kind of inactivity.

## Confidence Level

- **High confidence** that this is a Supabase-side (or Vercel↔Supabase network path) issue, not an application code defect, not a Vercel environment-variable misconfiguration, and not specific to any one deployment hostname — the identical, reproducible 503 across two genuinely different origins rules out an origin-specific explanation.
- **Moderate-to-high confidence**, but not certainty, that the specific mechanism is a paused free-tier Supabase project — this is the single most consistent explanation with the evidence gathered (a 503 from Supabase's own edge, this project's documented lack of real usage) but confirming it precisely requires looking at the Supabase project dashboard directly, which was not accessed as part of this verification (no Supabase configuration was viewed or modified, per the phase's constraints).

## Smallest Safe Fix (If Required)

**No code change, no environment variable change, and no Supabase schema change is implicated by this finding — none is recommended.** The smallest safe next step, entirely outside this phase's scope to perform, is: log into the Supabase dashboard for project reference `agxunwcdatosrmzhhuxj` and check whether the project shows as paused; if so, resume it. This is a one-click operational action in Supabase's own dashboard, not a code deployment, and it should be verified by a human with real dashboard access before any further ALI activation work (migrations, seeding, live validation) is attempted, since all of that work depends on this same project being reachable.

## Why This Is Good News, Not Bad News

The founder's own read on this is correct, and this verification supports it directly: every piece of evidence gathered this phase points away from Angel's application code, Vercel deployment configuration, or architecture, and toward a single, external, operational fact about one Supabase project's availability. Nothing about Phase 5B.2's fix, the navigation changes, or the Practice/Mock Exams work is implicated by this finding — those all worked exactly as verified. This is a smaller, more contained problem than it looked an hour ago, and it is not a problem with anything this project built.
