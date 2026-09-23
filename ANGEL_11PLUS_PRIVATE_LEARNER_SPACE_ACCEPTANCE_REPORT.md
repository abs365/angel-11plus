# ANGEL 11+ — Private Learner Space: Acceptance Report

## UPDATE 2026-09-23 — Learner PIN (Part 2), superseding the verdict below

This section is the current, authoritative status. Everything below it is the original increment's
report, kept as history, not rewritten.

### Production findings that triggered this update

Real Founder production testing (this same day, after the previous increment's fixes) confirmed as
genuinely PASSING: Parent Mode managing both learners; Plantest1 entering Learner Mode; Plantest2
disappearing completely from Plantest1's Learner Mode (and vice versa); the sibling switcher, Parent
Dashboard and pathway-changing controls all disappearing in Learner Mode; Today/Learn/Practise/Mock/
Progress retained; Return to Parent Mode correctly protected by the Parent PIN, with a wrong PIN
denied and a correct PIN restoring Parent Mode. None of this was retested or redesigned here, per the
governing instruction's own "do not retest or redesign working architecture without cause."

Two material findings remained:

1. **Learner entry itself was not authenticated.** The Parent PIN protects Learner Mode -> Parent
   Mode, but nothing protected family environment -> a *specific* learner's space — the Founder was
   able to enter Plantest2's workspace without Plantest2 supplying any credential of their own.
2. **Visual identity fragmentation**, formally recorded as a product-wide requirement — see
   `ANGEL_11PLUS_PRODUCT_DESIGN_STANDARD_V1.md` (new this update), derived from the approved homepage.

### What this update implements

A learner-specific PIN, distinct from the household's own Parent PIN, that a browser must verify
before it may act as a given learner — see the **Threat model**, **Learner PIN lifecycle** and
**Cross-learner tests** sections below for the full detail, and
`ANGEL_11PLUS_PRIVATE_LEARNER_SPACE_DECISION_RECORD.md`'s own "UPDATE" section for the design
reasoning. In one sentence: migration 263 adds `learner_access` (one PIN per learner, salted
`sha256()`, never client-readable) and `learner_pin_sessions` (opaque tokens minted only by a correct
PIN), and redefines `current_learner_id()` — the single resolver every real data path already goes
through — to require a token matching the specific learner named, once that learner has a PIN
configured. A token verified for Plantest1 does not satisfy a request naming Plantest2; proven
directly against a real Postgres engine, including the exact production scenario the Founder found.

### Revised access model

```
Parent Account
  |
  +-- PARENT ACCOUNT PASSWORD -- protects authentication into the family account (unchanged)
  |
  +-- Parent Mode
  |     +-- PARENT PIN -- protects Learner Mode -> Parent Mode (unchanged, migration 262)
  |
  +-- Plantest1
  |      +-- PLANTEST1'S LEARNER PIN -- protects family environment -> Plantest1's space (NEW, migration 263)
  |      +-- Plantest1's private workspace
  |
  +-- Plantest2
         +-- PLANTEST2'S LEARNER PIN -- protects family environment -> Plantest2's space (NEW, migration 263)
         +-- Plantest2's private workspace
```

Architecture is unchanged: one Parent Account, one household, multiple learner profiles. The Learner
PIN is a household learner-access mechanism the parent creates/manages/resets from Parent Mode — not
a second Supabase Auth identity. No independent email/Supabase account was created for either learner.

### Threat model

**What the Learner PIN genuinely stops, server-side, proven not asserted:** any request that resolves
"which learner" through `current_learner_id()` — which is every one of the ~38 functions migration
260 already routes through it (mock attempts, recommendations, preparation state, and everything the
product's own client code actually calls) — now fails closed (`angel_learner_pin_required`) unless the
browser holds a session token minted by that *specific* learner's own correct PIN. Verified directly:
a token minted for Plantest1 is refused for a request naming Plantest2, even though the account owns
both (16 tests, real Postgres, PGlite — the same engine migration 260's own test suite already proved
itself against). Rate limiting (5 wrong attempts -> 5-minute lockout) is per learner, not per account
— Plantest1 being locked out never affects Plantest2's own attempts, also proven directly. Resetting a
PIN invalidates every existing session for that learner immediately.

**What it does not stop, disclosed honestly, unchanged in principle from the Parent PIN's own
boundary:** `current_learner_id()` is what the product's *own code* uses. It is not RLS itself. Every
evidence table's row-level security (all ~30 of them) is still scoped only to account ownership
(`profiles.auth_user_id = auth.uid()`), per migration 260's own original design — a raw REST query
that names a sibling's `profile_id` directly, bypassing `current_learner_id()` and the app's own code
entirely, would still succeed today. Closing that fully would mean rewriting every evidence table's
own RLS policy — explicitly out of this increment's "smallest safe extension" scope (Part 15's
protected-systems list), and a materially larger, separately-reviewable change if the Founder wants it
closed. A second, narrower nuance specific to this update: `lib/learnerContext.ts`'s own
`fetchLearners()` (restricted to the pinned learner's row while in Learner Mode, the previous
increment's own hardening) reads `profiles` directly, not through `current_learner_id()` — so a user
who manually edits the browser's stored *active-learner id* (not the PIN token) to a sibling's id
could still see that sibling's *name and pathway* (not their evidence, progress, Mock results or
recommendations, which all remain blocked by the token check) via this one specific path. Disclosed,
not closed, for the same "smallest safe extension" reason.

### Learner PIN lifecycle

- **Create**: Parent Mode -> "Enter {name}'s learner space" (no PIN yet) -> `LearnerPinModal` (mode
  `set`) -> "Create {name}'s learner PIN", explicitly distinguished from the Parent PIN in its own
  copy ("This PIN lets {name} open their own learning space... different from your own Parent PIN") ->
  `set_learner_pin()` -> immediately verified with the same value (still in memory, not re-typed) to
  mint the first session token, so establishing the PIN and entering happen in one smooth flow.
- **Normal entry**: "Enter {name}'s learner space" (PIN already exists) -> `LearnerPinModal` (mode
  `verify`) -> correct PIN -> `verify_learner_pin()` mints a session token -> Learner Mode. Wrong PIN:
  refused, remains in Parent Mode, no sibling information exposed at any point.
- **Reset**: Parent Mode -> the key icon beside "Enter learner space" ("Manage learner PIN") ->
  `LearnerPinModal` (mode `set`, reused) -> new PIN saved, every existing session for that learner
  invalidated immediately.
- **No raw PIN stored, returned, or logged**: only a per-row random salt (`gen_random_uuid()`) and a
  `sha256()` hash are ever written (core Postgres, no `pgcrypto` — this repo's PGlite test harness has
  none compiled in, confirmed directly, same finding as migration 262). `verify_learner_pin()` returns
  a `session_token` only on success — an opaque, unguessable id, never the PIN itself, never logged.

### Parent PIN lifecycle (unchanged, re-affirmed working, not retested beyond confirming it still is)

Learner Mode -> Header's account menu -> "Return to Parent Mode" -> `ParentPinModal` (mode `verify`,
migration 262, untouched this update) -> correct PIN -> Parent Mode restored; wrong PIN -> denied. Not
modified, not rerun, not reopened — Part 9's explicit instruction. The two PINs are visually and
functionally distinct: the Parent PIN modal never mentions a learner by name; the Learner PIN modal's
own eyebrow label always names the specific learner and never appears in the same flow as the Parent
PIN.

### Server-side enforcement

`current_learner_id()` (migration 263, redefining migration 260's own function, not a second
resolver) now: resolves the learner exactly as before (explicit `x-angel-learner-id` header validated
against account ownership, or the existing single-learner no-header fallback) — then, only if that
learner has a `learner_access` row (opt-in, matching the create-PIN-first bootstrap), requires the
request to also carry a valid `x-angel-learner-token` header naming a `learner_pin_sessions` row for
that exact learner, that exact account, not expired. Any mismatch, absence, or malformed value raises
`angel_learner_pin_required` — fails closed, not silently falls back to account-ownership-only.

### Schema / migration changes

**Migration 263 (`263_learner_pin.sql`) — NOT YET APPLIED.** Generated for Founder review and manual
application via the Supabase Dashboard, matching this repository's standing convention (identical to
how migrations 260, 261 and 262 were delivered). **Migration 262 is confirmed applied in production
and was not rerun.** Migrations 260 and 261 were not touched. If the Founder later wants the deeper
RLS-level closure disclosed above, that is explicitly a *separate*, independently-reviewable
migration, not an extension of 263.

New objects: `public.learner_access` (table), `public.learner_pin_sessions` (table),
`public.set_learner_pin(uuid, text)`, `public.verify_learner_pin(uuid, text)`,
`public.learner_pin_status(uuid)` (functions), `public.current_learner_id()` (redefined).

### Cross-learner tests (real Postgres, `tests/supabase/migration263LearnerPin.test.ts`, 16 tests, all passing)

Directly proves, against a real Postgres engine (PGlite) running the actual migration chain: a
learner with no PIN is unaffected; only the owning parent account can set a learner's PIN; invalid PIN
formats rejected; once a PIN is configured, the plain learner-id header alone is refused
(`angel_learner_pin_required`); a correctly-verified token is accepted for that learner; **the exact
production finding, reproduced and proven fixed** — a token verified for Plantest1 does not satisfy a
request naming Plantest2, even before Plantest2 has their own PIN, and still fails after Plantest2
gets one; Plantest1 PIN against Plantest2 = fails, Plantest2 PIN against Plantest1 = fails, each
learner's own correct PIN against themself = succeeds; a random/garbage token satisfies neither
learner; 5 wrong attempts lock out that learner only (Plantest2's own attempts are unaffected by
Plantest1's lockout); resetting a PIN invalidates every existing session for that learner; the two new
tables are never directly readable by `authenticated`; `learner_pin_status` is parent-only and never
exposes the hash/salt, and never confirms or denies another account's learner has a PIN at all; a
learner belonging to a different account entirely is fully isolated. No real PIN value appears in any
test assertion, evidence, or log — only synthetic test values (`'4821'`, `'9911'`, etc.).

### Bypass tests

- **Direct URL to Learn/Practice/Mock/Progress while in Learner Mode with no valid token**: blocked
  before the page renders — `RegisteredAccountGate`'s new branch (`isLearnerMode && !hasLearnerToken`)
  shows "Enter your learner PIN" instead of mounting the page, for any learner-surface route, not only
  the parent-only ones. Even if that client check were bypassed, the underlying data fetch would still
  fail server-side (`current_learner_id()` raises `angel_learner_pin_required`).
- **Browser refresh**: the token is session-storage-scoped (per tab, not per device — see the decision
  record's own storage-model note), so a refresh within the same tab keeps the verified session; no
  re-prompt.
- **Browser back / bookmarked learner URL**: same route-gate check applies regardless of navigation
  method; no special-cased bypass exists.
- **Changed learner ID (manipulating the active-learner pointer while a token for a different learner
  is held)**: the token is bound to one specific learner id server-side; presenting it alongside a
  different `x-angel-learner-id` fails `current_learner_id()`'s match check — proven directly in the
  "crossed tokens" test above. The one disclosed nuance (sibling *name*, not evidence, visible via
  `fetchLearners()`'s own direct `profiles` read in this specific manipulation) is documented in the
  Threat model section above, not silently left out.
- **`x-angel-learner-id` / `x-angel-learner-token` manipulation directly (not through the app's own
  UI)**: this is exactly what the cross-learner test suite exercises — a garbage token, a token for
  the wrong learner, and a missing token are all refused.
- **`localStorage`/`sessionStorage` manipulation**: the mode pointer (parent/learner) is deliberately
  separate from the PIN session token; editing the mode pointer alone (e.g. forcing `"learner"` in a
  fresh tab) without a genuine token still lands on the "Enter your learner PIN" re-prompt, never a
  silent bypass, because the route gate checks the token's *presence*, and any subsequent real data
  request checks the token's *validity* server-side regardless of what the client claims.

### Session behaviour

- Mode pointer: unchanged from the previous increment (session then local storage, account-scoped),
  not touched by this update.
- Learner-PIN session token: **session-storage only, deliberately never written to localStorage** — a
  full browser/tab close always requires the learner's PIN again on the next visit, even on the same
  device, which is the correct property for a shared family device (see decision record).
- A freshly opened second tab on the same device, after Learner Mode was entered in a first tab: mode
  pointer says "learner" (inherited via localStorage), no token (session-only) -> the new
  `RegisteredAccountGate` branch re-prompts for that learner's PIN before rendering anything, rather
  than showing a blank or broken page.
- Signing out, or returning to Parent Mode, always clears the token immediately.

### Files changed

`supabase/migrations/263_learner_pin.sql` (new); `lib/learnerPin.ts` (new, RPC wrapper);
`components/parent/LearnerPinModal.tsx` (new, built to the new design standard);
`ANGEL_11PLUS_PRODUCT_DESIGN_STANDARD_V1.md` (new); `lib/householdMode.ts` (session-only token
pointer added alongside the existing mode pointer); `lib/useHouseholdMode.ts` (`enterLearnerSpace` now
takes the token; new `hasLearnerToken`); `lib/learnerContext.ts` (`x-angel-learner-token` sent
alongside the existing learner-id header, both call sites); `components/Header.tsx` and
`components/parent/LearnerIdentityBanner.tsx` ("Enter learner space" re-gated to the Learner PIN, not
the Parent PIN; "Manage learner PIN" added); `components/RegisteredAccountGate.tsx` (new re-prompt
branch); `types/supabase.ts` (three new RPC types); `tests/supabase/support/pgliteHarness.ts` (test
harness extended to send a second header); 6 test files updated/added — see Tests/build below.

### Tests / build (clean-checkout gate, genuine `git worktree` of the deployed commit)

Typecheck 0 errors; tests **4,783 / 4,784 pass, 0 failures, 1 pre-existing skip** (includes migration
263's own 16 real-Postgres tests plus 9 new/updated client-side tests); `migration-sql-guard` PASS, 259
files; `copy-guard` 51 violations, identical to the established baseline, every touched file clean;
`eslint` 114 problems (83 errors / 31 warnings), identical to the established baseline; genuine `next
build` PASS, no bypass flag.

### Commit

`2ecd9cf` — `feat(learner-space): per-learner PIN binds Learner Mode to the authorised learner`.

### Deployment

Pushed to `origin/main`. Vercel deployed automatically
(`angel-11plus-47bn86p2n-abs365s-projects.vercel.app`, status Ready), confirmed aliased to
`https://www.angel11plus.com` and the other production domains.

### Production verification

Fetched the live JS bundles referenced by `/dashboard` directly (not through a browser) and confirmed
both the new Learner PIN UI copy and the new `x-angel-learner-token` header mechanism are genuinely
deployed. Loaded the live homepage/gate in a real browser: renders correctly, no regression. I do not
have an authenticated production session and, per this project's standing rule, did not create one —
the exact Founder acceptance steps below are the required next step, not something I could complete
from here.

### Exact Founder acceptance steps (governing instruction, Part 16 — unchanged, quoted for convenience)

1. **Apply migration 263** in the Supabase Dashboard SQL editor (do not rerun 260, 261 or 262).
2. Parent -> Plantest1 -> establish/use Plantest1's learner PIN -> enter Plantest1 -> verify Plantest2
   unavailable -> confirm Return to Parent Mode still requires the Parent PIN.
3. Parent -> Plantest2 -> establish/use Plantest2's learner PIN -> enter Plantest2 -> verify Plantest1
   unavailable -> confirm Return to Parent Mode still requires the Parent PIN.
4. Plantest1's PIN entered against Plantest2 -> MUST FAIL. Plantest2's PIN entered against Plantest1
   -> MUST FAIL.

Only after those real production tests may Private Learner Space be considered for GO.

### Product design standard created

`ANGEL_11PLUS_PRODUCT_DESIGN_STANDARD_V1.md` — derived directly from the approved, frozen homepage
(`app/page.tsx`, the Brand Foundation token block in `app/globals.css`) and the existing shared
`components/ui/Button.tsx`; nothing invented. Documents the nine `--angel-*` tokens and their roles,
the reusable primitives, the "strictly avoid" list (re-affirmed, unchanged), and — explicitly — which
authenticated surfaces still need migrating (Parent Dashboard, Today, Learn, Practise, Mock, Progress,
Results, the pre-existing `ParentPinModal`) as the next, not-yet-started increment. This increment's
own new surfaces (`LearnerPinModal`, the "Enter learner space" / "Manage learner PIN" additions to
`Header.tsx` and `LearnerIdentityBanner.tsx`) were built to it directly.

### Authenticated surfaces remaining to migrate

Recorded, not started, per Part 14: Parent Dashboard, Today, Learn, Practise, Mock, Progress, Results,
and the existing `ParentPinModal` (migration 262's own UI) all still use pre-Brand-Foundation styling.
The next increment, not started automatically, is **ANGEL 11+ AUTHENTICATED EXPERIENCE & DESIGN SYSTEM
MIGRATION**. Separately recorded, not addressed here: the current Learn page's own "being rebuilt one
real lesson at a time" state and its three-lesson Mathematics-only inventory is content/educational
depth debt, explicitly not to be fixed by any visual redesign.

### Genuine remaining limitations (this update)

- Migration 263 is not yet applied — the Learner PIN UI is live but inert (a plain error, no crash, no
  data exposure) until the Founder applies it.
- The RLS-level boundary disclosed in the Threat model section (a raw REST query naming a sibling's
  `profile_id` directly bypasses `current_learner_id()` entirely) is real, not closed by this update,
  and was judged out of this increment's scope.
- The narrower `fetchLearners()` name/pathway-only nuance disclosed in the Threat model section is
  real, not closed, for the same reason.
- The Founder's own real two-learner cross-PIN acceptance walkthrough (Part 16) is the one item this
  update cannot complete from here.

---

**ANGEL 11+ PRIVATE LEARNER SPACE: PARTIAL (superseding the original verdict below).**

The Learner PIN is designed, implemented as the smallest extension that gives genuine server-side
per-learner binding (not a client-side gate alone), proven directly against a real Postgres engine
including the exact production scenario reported, deployed, and confirmed live. PARTIAL, not GO,
because migration 263 has not yet been applied and the Founder's own required cross-learner PIN
acceptance walkthrough has not yet been run against production — both are now ready to complete.

Per the governing instruction: this increment stops here. The full authenticated-interface redesign
was not started.

---

# Original report (history, superseded by the update above)

Governing instruction: "ANGEL 11+ — PRIVATE LEARNER SPACE & FAMILY ACCESS MODEL." Password recovery
is confirmed CLOSED by real Founder production acceptance and was not reopened or touched by this
increment. Sequence followed exactly as instructed: inspect -> decision record -> implement -> test
-> deploy -> production verification -> stop.

Full reasoning lives in `ANGEL_11PLUS_PRIVATE_LEARNER_SPACE_DECISION_RECORD.md`, written before any
code was changed. This report summarises it and adds everything Section 12 asks for.

## Current-state finding

Every learner under one parent shares the parent's own Supabase Auth session (JWT) — there is no
separate credential per child. `current_learner_id()` (migration 260) validates that the active-
learner header names a learner owned by the signed-in account; it cannot, and structurally could not
without a new credential, distinguish "the parent chose this child" from "a child is holding the
parent's already-authenticated device." This is the honest starting point every decision below is
built on.

## Selected access model

**Household Mode**: Parent Mode / Learner Mode, a client-side concept (`lib/householdMode.ts`,
mirroring `lib/learnerContext.ts`'s own account-scoped pointer pattern exactly, default always Parent
Mode), paired with two pieces of real, server-verified enforcement:

1. **Route gate** (`lib/registeredAccess.ts`'s `PARENT_ONLY_PATH_PREFIXES` + `isParentOnlyRoute()`,
   applied in `RegisteredAccountGate.tsx`): `/add-child`, `/pathways` and
   `/learning-intelligence/parent` (and everything under it) never render their real content in
   Learner Mode, however they're reached — a link, a typed URL, browser history, a bookmark.
2. **Parent PIN** (migration 262): a salted, rate-limited, server-verified PIN that gates the one
   controlled route back from Learner Mode to Parent Mode. Never readable by any client role — only
   three `SECURITY DEFINER` RPCs touch it. A PIN must exist before Learner Mode can ever be entered
   for the first time.

## Alternatives rejected and why

Full reasoning in the decision record. Summary: separate Supabase identities per child (explicitly
forbidden); a Supabase Auth Custom Access Token Hook (would give genuine JWT-level cryptographic
isolation, but changes the token-issuance pipeline for every sign-in and needs external Dashboard
wiring I can't verify from here — judged disproportionate risk this session, right after this same
instruction set closed a real auth-stability incident); a hand-rolled HMAC "learner lock" token
verified in Postgres (raises the bar against naive tampering but cannot stop a user who extracts the
account's own already-valid JWT and bypasses the header entirely — building unverifiable cryptography
that can't deliver the protection it implies was judged worse than being honest); requiring the
account password to return to Parent Mode (this product explicitly supports password-less, magic-
link-only accounts, so this would lock those parents out entirely).

## Security / privacy reasoning

**What this genuinely stops**: a child using Angel 11+ normally — clicking, tapping, typing a URL,
browser back/forward, refreshing, reopening a tab — can never see a sibling's name, progress,
Practice evidence, Mock results or recommendations, and can never reach household/account management.
Confirmed two ways beyond the route gate itself:
- The sibling switcher, pathway switcher, Parent Dashboard links and "School Intelligence" nav entry
  are removed entirely from Learner Mode's rendered chrome (`Header.tsx`, `Navigation.tsx`) — not
  styled away, not present in the DOM at all.
- **A real, previously-existing exposure was found and closed while inspecting the architecture**:
  `lib/learnerContext.ts`'s `fetchLearners()` — the mechanism every authenticated request already
  relies on to resolve "which child" — fetched **every sibling's id and name** on every request,
  regardless of mode (this predates this increment; it exists because the parent legitimately needs
  the full list to switch). In Learner Mode this is now narrowed to fetch only the pinned learner's
  own row, so a sibling's id/name never enters this session's network traffic or in-memory state at
  all. Verified directly with a new test against a fake backend that mirrors PostgREST's own
  `id=eq.<x>` filtering (`tests/lib/learnerContext.test.ts`) — not asserted, executed.
- The Parent PIN is real and rate-limited: 5 wrong attempts locks verification out for 5 minutes per
  account, enforced in the database. Proven against a real Postgres engine (PGlite, the same harness
  migration 260's own test suite uses), not assumed — see Tests below.

**What this does not stop, disclosed honestly (unchanged from the decision record)**: a technically
sophisticated user who deliberately opens developer tools, extracts the account's own already-valid
session token, and hand-crafts a direct API request naming a different sibling's learner id, can still
read that sibling's data — because that request is, at the database level, indistinguishable from the
parent's own legitimate access to their own account. No claim to the contrary is made anywhere in this
work.

## Parent Mode behaviour

Unchanged from before this increment, plus: the Parent Dashboard's learner banner
(`LearnerIdentityBanner.tsx`) now offers "Enter {name}'s learner space" for the active child. If no
household PIN exists yet, this first opens a "Set a Parent PIN" modal (`ParentPinModal.tsx`, mode
`"set"`) explaining why, before anything can be entered — Learner Mode can never exist without a
working return gate already in place. Parent Mode itself is otherwise untouched: all learners visible,
switching, add-learner, account/security, pathway configuration.

## Learner Mode behaviour

Entering a learner's space (from Parent Mode only) sets that learner active and switches the mode,
then performs one full navigation to `/dashboard` (same pattern the existing learner-switch mechanism
already uses, so no Parent Mode state can linger in memory). The learner then sees: Today, Learn,
Practise, Mock, Progress (the same five primary items, unchanged) and a plain "Your preparation: {X}"
statement instead of a link into pathway configuration (Part 5) — no sibling switcher, no Parent
Dashboard link, no pathway switcher, no household management anywhere in the chrome. Header's account
menu still shows the Parent Account label and email (so the parent, glancing over, can confirm this is
still their account) with a "Return to Parent Mode" action in place of "Parent Dashboard".

## Parent-return protection

The only path from Learner Mode back to Parent Mode is Header's account menu -> "Return to Parent
Mode" -> `ParentPinModal` (mode `"verify"`) -> a correct PIN, verified server-side
(`verify_household_pin`), before `returnToParentMode()` ever runs. Wrong PIN: rejected with an honest
message; 5th consecutive wrong attempt: locked out for 5 minutes, server-enforced, proven against real
Postgres. There is no other button, link or route in Learner Mode's chrome that reaches Parent Mode
(confirmed by the removal, not hiding, described above) — satisfying Section 4's explicit "a child
must never escape learner mode into household management simply by clicking a visible button."

## Multi-learner isolation evidence

**What was verified directly, not assumed:**
- Migration 262's cross-account isolation (two different *parent* accounts' PINs/lockouts never
  interfere) — real Postgres test, passing.
- The route gate's exact classification of every parent-only vs. learner-facing path, including the
  specific `/learning-intelligence/*` collision the instruction's own architecture creates (parent's
  `/learning-intelligence/parent/*` vs. the CSSE learner's own `/learning-intelligence/learn`,
  `/practice`, and bare `/learning-intelligence` for Progress) — a real risk of over- or under-
  matching that a plain top-level-segment check would have gotten wrong; a dedicated full-path-prefix
  function and 4 tests cover exactly this.
- The learner-list fetch restriction in Learner Mode (above).
- `current_learner_id()`'s own pre-existing sibling-ownership validation (migration 260, unchanged,
  still covered by that migration's own test suite) — a learner id the account does not own is still
  refused; this increment did not touch it.

**What genuinely requires the Founder, and could not be produced here (disclosed, not skipped):**
Migration 262 is **NOT YET APPLIED** to production (this repository's standing convention — every
migration is Founder-applied via the Supabase Dashboard SQL Editor). Until it is applied, "Enter
learner space" is reachable in the UI but every PIN-related action will fail with a plain error
message (no crash, no data exposure — just not functional yet). The instruction's own Section 6
acceptance walkthrough (two real learner profiles, Learner A Mode / Learner B Mode / Parent Return,
items 1-12) requires a real authenticated household with at least two real learners — I have no
authenticated production session this session (confirmed by direct screenshot: the persistent browser
tab shows the public "Create your free parent account" gate, not a signed-in family), and per this
project's standing rule I did not create an account, enter a password, or otherwise authenticate. This
is the same "stop at the exact login point and hand it to the Founder" pattern used at every prior
point in this project a real login was needed.

## Direct URL / manipulation tests

Covered structurally (real, executed tests, not descriptions):
- `isParentOnlyRoute()` against every parent-only path, every learner path that shares a top-level
  segment with a parent-only one, and every public/ordinary route — 4 tests, all passing.
- `RegisteredAccountGate.tsx`'s new branch is checked before the plain "allow" branch (verified by
  source position, not just presence) — a route added after the plain allow check would never be
  reached, which a source-text-only assertion could easily miss; this test checks the order.
- The household-mode storage pointer: a pointer belonging to a different account is never inherited
  on a shared device (mirrors `learnerContext.ts`'s own proven pattern, same property, new test).
- A learner id the signed-in account does not own is still refused by `current_learner_id()`
  (migration 260's own unchanged, still-passing test suite — not re-tested here, not re-opened).

## Session behaviour

- **Refresh / close-reopen tab**: the mode pointer is written to both `sessionStorage` (per-tab) and
  `localStorage` (per-device), so a refresh or a reopened tab on the same device restores the same
  mode for the same account — proven by the same pointer read/write tests as `learnerContext.ts`'s own
  established, already-production-proven pattern.
- **Sign out**: always resets to Parent Mode for whoever signs in next on that device/tab
  (`clearHouseholdMode()`, wired into `AuthProvider`'s `SIGNED_OUT` handling and into both
  `updatePassword()`'s and the ordinary `signOut()`'s explicit paths) — a session boundary should
  never leave a device silently pinned into a child's space for the next person to sign in.
- **Switching Learner A to Learner B**: only reachable through Parent Mode (the switcher itself is
  entirely absent from Learner Mode's chrome), matching Section 7's own "switching from Learner A to
  Learner B through Parent Mode" framing exactly.

## Pathway responsibility (Part 5)

`/pathways` is now a parent-only route. In Learner Mode, the dashboard's pathway line reads "Your
preparation: {shortName}" as plain text, not a link into pathway configuration — the child is never
invited to tap into an admissions-configuration surface that would refuse them anyway.

## Files changed / created

- `ANGEL_11PLUS_PRIVATE_LEARNER_SPACE_DECISION_RECORD.md` — new, written before implementation.
- `supabase/migrations/262_household_parent_pin.sql` — new. `household_access` table (RLS enabled, no
  client policies, explicit revoke), `set_household_pin` / `verify_household_pin` /
  `household_pin_status` RPCs.
- `lib/householdMode.ts`, `lib/householdPin.ts`, `lib/useHouseholdMode.ts` — new.
- `components/parent/ParentPinModal.tsx` — new.
- `lib/registeredAccess.ts` — `PARENT_ONLY_PATH_PREFIXES` / `isParentOnlyRoute()` added.
- `components/RegisteredAccountGate.tsx` — new "ask a parent" branch.
- `components/Header.tsx`, `components/Navigation.tsx` — Learner Mode hides the sibling switcher,
  pathway switcher, Parent Dashboard links, School Intelligence nav entry; Header carries the PIN-
  gated return control.
- `components/parent/LearnerIdentityBanner.tsx` — "Enter learner space" action, first-time PIN setup.
- `app/dashboard/page.tsx` — plain "Your preparation: X" in Learner Mode instead of a pathway-
  configuration link.
- `lib/learnerContext.ts` — learner-list fetch narrowed to the pinned learner while in Learner Mode.
- `components/providers/AuthProvider.tsx` — `clearHouseholdMode()` wired into sign-out.
- `types/supabase.ts` — the three new RPCs added to the typed `Functions` map.
- Tests: `tests/supabase/migration262HouseholdPin.test.ts` (new, 10 tests, real Postgres),
  `tests/lib/householdMode.test.ts` (new, 7 tests), `tests/lib/registeredAccess.test.ts` (+5 tests, 1
  updated for the now-mode-aware LearnerSwitcher condition), `tests/lib/learnerContext.test.ts` (+1
  test for the fetch-restriction behaviour).

## Database / schema changes

**Migration 262 — NOT YET APPLIED.** Generated for Founder review and manual application via the
Supabase Dashboard, matching this repository's standing convention (identical to how migrations
260/261 were delivered). Migrations 260 and 261 themselves were **not touched or rerun**. See the
migration file's own header for the full "what/why" and the rollback block (manual only, never
automatic).

## Tests / build (clean-checkout gate, genuine `git worktree` of the deployed commit)

- Typecheck: 0 errors (project files only).
- Tests: **4,760 / 4,761 pass, 0 failures, 1 pre-existing skip** — includes migration 262's own 10
  tests run against a real Postgres engine (PGlite, the same harness proven on migration 260), plus 13
  new/updated client-side tests.
- `npm run migration-sql-guard`: PASS, 258 files (257 + the new migration 262).
- `npm run copy-guard`: 51 violations, identical to the established baseline; every file this
  increment touched is clean.
- `npx eslint .`: 114 problems (83 errors / 31 warnings) — identical to the established baseline
  (a local dev-tree run briefly showed 116 due to extra untracked files not present in the clean
  checkout; the clean-worktree count, the one that matters, is unchanged).
- `next build`: genuine PASS, no bypass flag, full route manifest built.

## Commits

- `fc0e45f` — `feat(learner-space): Parent Mode / Learner Mode with a real server-verified return
  gate`.

## Production deployment

Pushed to `origin/main`. Vercel deployed automatically
(`angel-11plus-fb7rkehyk-abs365s-projects.vercel.app`, status Ready), confirmed aliased to
`https://www.angel11plus.com` and the other production domains.

## Production verification

Fetched the live JS bundles for `/pathways` and `/dashboard` directly (not through a browser) and
confirmed the new copy is genuinely deployed: "Return to Parent Mode", "learner space", "Ask a parent
or carer", "Your preparation:". `/pathways`, `/add-child`, `/learning-intelligence/parent` and
`/dashboard` all return HTTP 200. Loaded `https://www.angel11plus.com/dashboard` in a real browser:
renders correctly, on-brand, no regression to the existing controlled-beta access gate for an
unauthenticated visitor (confirmed by screenshot).

**Explicitly not verifiable this session, and why**: the actual two-learner Parent/Learner Mode
walkthrough (Section 6's 12 items) requires a real authenticated household with a Parent PIN actually
set (which itself requires migration 262 to be applied first) and at least two real learner profiles.
I have no such session and, per this project's standing rule, did not create one. This is the one
genuinely outstanding item, and it is squarely the Founder's next step.

## Genuine remaining limitations

- Migration 262 must be applied before "Enter learner space" and the Parent PIN function at all — the
  UI is live but inert until then (fails with a plain error message, not a crash or data exposure).
- The disclosed architectural boundary (a technically sophisticated user with dev-tools access to
  their own account's JWT can still reach sibling data by hand-crafting a request) is real and not
  closed by this increment — see Security/Privacy Reasoning and the decision record's Alternatives
  section for what closing it fully would require and why that was judged out of scope here.
- `ParentSetupCard` (the dashboard's own first-run "add a name/pathway" prompt) can still render while
  in Learner Mode for a learner who has no pathway set yet, and its "Choose pathway" link will correctly
  land on the "Ask a parent" panel rather than pathway configuration — functionally safe, but not
  polished; not fixed this increment to keep the change bounded.
- Section 6's real two-learner walkthrough itself is outstanding, as disclosed above.

---

**ANGEL 11+ PRIVATE LEARNER SPACE: PARTIAL.**

The access model is designed (with alternatives honestly weighed and rejected on the record),
implemented as the smallest solution that gives genuine route-level and rate-limited-PIN server
enforcement (not UI-hiding alone), tested against a real Postgres engine and a real fake-backend
network harness, deployed, and confirmed live in production. PARTIAL rather than GO because migration
262 has not yet been applied and the instruction's own required two-real-learner acceptance
walkthrough has not yet been run against a real household — both are now ready for the Founder to
complete, and the outcome should be reported back before this item is called fully closed.

Per the governing instruction: this increment stops here. No wider authenticated-experience redesign
has been started.
