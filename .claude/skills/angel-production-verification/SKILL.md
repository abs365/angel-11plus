---
name: angel-production-verification
description: Use before claiming any Angel 11+ change is verified, working, or ready to close — deciding when browser verification is actually required, how to do a representative (not endless) check, and how to tell a genuine product defect from an environment/test-fixture problem.
---

# Angel — Production Verification

## When live browser verification is required

Required for anything a real learner will directly experience differently: new/changed teaching
UI, remediation rendering, session routing, scoring/marking display, auth flows. Not required for
pure data-layer or backend-only changes with adequate automated coverage — say which case you're
in rather than skipping silently.

## Representative, not endless

Three genuinely different real-condition checks that would each independently catch a plausible
failure mode beat ten checks of the same shape. Pick checks that exercise different code paths
(e.g., a zero-reveal-cap case, a one-reveal-cap case, and a previously-silent-now-fixed case are
three different risks — not three repeats of one). Stop once the representative set passes; don't
manufacture more scenarios to feel more certain.

## Environment vs product defect — check in this order before reporting either

1. **Is the repo's own template correct?** (`.env.example`, `.env.local.example`, etc.) If yes,
   a broken local `.env.local` is a local workspace fixture issue, not a product defect.
2. **Does Vercel production actually have the variable set, and does the deployed client bundle
   point at the same backend project as local dev?** (`NEXT_PUBLIC_*` vars are inlined into the
   client bundle by Next.js — safe to grep the built JS for the real value; never decrypt/print a
   non-public secret to check this.) A project mismatch between local dev and production explains
   a lot of "it's broken" findings that are actually "you're pointed at the wrong backend."
3. **Is the browser session actually authenticated**, or in guest/local-only mode? A "Sign in" link
   still present, or zero network requests to the backend, means no real backend session exists —
   personalized-looking content can still render from local/guest state. Check
   `read_network_requests` for real backend calls before trusting what's on screen.
4. Only once 1–3 are ruled out does a genuine backend data issue (e.g. an orphaned auth user with
   no profile row) become the live hypothesis — and even then, verify it's the *specific account*
   relevant to the check, not confused with an unrelated stray dev/test session.

## What to do when a real learner login is required

- **Never** request, expose, store, log, or type a real learner's password, even redacted, even if
  offered.
- Navigate to the exact real login page, confirm it renders correctly (form fields present, no
  console errors), then **stop**. Hand the exact URL to the Founder/owner and say specifically what
  you need them to do next.
- If the browser already carries a plausible saved credential (autofill), do not click submit
  yourself — that's the human's action to take, not yours to trigger.

## Credential hygiene while verifying

- If you must pull an encrypted production value to check its *format* (e.g. "is this a URL"),
  extract only a derived boolean/pattern-match result, never print the value or even a redacted
  prefix — treat any command that would surface even a slice of a secret as something to route
  around, not force through. Delete any locally-pulled secret file immediately after the check.

## Build/test baseline discipline

- Before claiming "0 regressions," actually measure the pre-change baseline in the same session
  (stash your change, run tests, note the exact pass/fail counts and failing files, then restore)
  — don't cite a baseline from an old report, which goes stale fast in an actively-changing repo.
- If the build fails on files your change didn't touch, confirm by stashing your change and
  reproducing the same failure before calling it pre-existing.
