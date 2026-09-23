# ANGEL 11+ — Private Learner Space: Acceptance Report

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
