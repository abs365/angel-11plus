# ANGEL 11+ — Private Learner Space: Decision Record

Written before implementation, per the governing instruction's own sequence. Concise by design.

## Current-state finding

The multi-learner architecture (migration 260) is real and correctly built, but it enforces
isolation at exactly one boundary: **account vs account** (`profiles.auth_user_id = auth.uid()`).
Every learner under one parent shares the **same Supabase Auth session (the parent's JWT)** — there
is no separate credential per child, by explicit design, and this record does not propose one.
`current_learner_id()` validates that the `x-angel-learner-id` header names a learner owned by the
current account; it does **not**, and structurally cannot without a new credential, distinguish "the
parent is choosing which child to view" from "a child is holding the parent's already-authenticated
device." That distinction does not exist in the data the database receives today. This is the honest
starting point for every decision below.

## Selected access model

**Household Mode**, a client-side concept with one piece of real, testable server enforcement:

1. **Parent Mode / Learner Mode** — a per-tab/per-device pointer (`lib/householdMode.ts`), same
   storage pattern as the existing active-learner pointer (`lib/learnerContext.ts`), scoped to the
   signed-in account so it can never be inherited by a different account on a shared device.
   Default is **Parent Mode** for every session (nothing changes for any existing family until a
   parent deliberately enters a learner's space).
2. **Entering Learner Mode**: parent picks a learner from Parent Dashboard → "Enter learner space".
   This also sets that learner active (reusing the existing, unmodified `setActiveLearner`). The
   learner-facing chrome (Header, Navigation) then hides every sibling-revealing and household-
   management control — no switcher, no Parent Dashboard link, no pathway switcher, no add-learner.
3. **Route-level enforcement**: a new `PARENT_ONLY_PATH_PREFIXES` list (`/add-child`, `/pathways`,
   `/learning-intelligence/parent`) is checked in `RegisteredAccountGate` — while in Learner Mode,
   these routes never mount their real content, regardless of how they're reached (a visible link, a
   typed URL, browser history, a bookmark). This is the real defence against "escaping by clicking a
   visible button" and against direct navigation.
4. **Returning to Parent Mode: a real, server-verified Parent PIN** (migration 262). A 4-6 digit PIN,
   chosen by the parent, hashed and rate-limited server-side (never exposed to the client, never
   readable even by the owning account — only three narrow `SECURITY DEFINER` RPCs touch it: set,
   verify, status). A parent must set this PIN before Learner Mode can be entered for the first time
   (closes the obvious bootstrap gap — Learner Mode can never exist without a working return gate
   already in place). Verification is rate-limited (5 attempts, then a 5-minute lockout per account),
   enforced in the database, not the client.

## Alternatives considered and rejected

- **Separate Supabase Auth identity per learner.** Would give real cryptographic isolation, but is
  explicitly forbidden by the governing instruction ("DO NOT create independent Supabase/email
  accounts for every child") and is a materially larger change than this increment's own "smallest
  safe solution, do not turn this into a prolonged architecture programme" instruction allows.
- **A Supabase Auth Custom Access Token Hook**, embedding the active-learner lock directly into the
  JWT so Postgres could verify it via Supabase's own already-trusted signature (no new secret needed).
  This is the one mechanism that could give genuine request-level cryptographic sibling isolation
  without a new per-child identity. Rejected for this increment: it changes the token-issuance
  pipeline for every sign-in on the project, it requires an external Supabase Dashboard configuration
  step I cannot verify was wired correctly from here, and this same instruction set explicitly
  protects authentication stability elsewhere (Part 9's "do not reopen... password recovery", closed
  only last session after a real production incident). The risk/benefit does not clear the bar for a
  same-sitting change. Recorded as the correct next step if the Founder later wants full cryptographic
  sibling isolation against a technically sophisticated user manually crafting API requests.
- **A signed HMAC "learner lock" token verified inside `current_learner_id()`**, using a new secret
  stored in Postgres. Investigated in depth. Rejected: it raises the bar against naive tampering but
  cannot stop a technically sophisticated user who extracts the parent's own already-valid JWT and
  anon key from the browser and crafts a raw request without the lock header at all — the database
  cannot tell that request apart from the parent's own legitimate use, because it is, cryptographically,
  the same session. Building and shipping unverifiable-by-me cryptographic logic against production
  for a protection it cannot actually deliver was judged worse than being honest about the boundary.
- **Requiring the parent's account password to return to Parent Mode** (reusing `signInWithPassword`,
  zero new schema). Rejected: this product explicitly supports magic-link-only accounts with no
  password ever set ("Never set a password? You don't need one"), so this would lock those parents
  out of Parent Mode entirely — and is heavier for the realistic "picking the phone back up several
  times a day" household pattern than a short PIN.
- **Hashing the PIN with bcrypt via `pgcrypto`.** Checked directly: this project's real-Postgres test
  harness (PGlite) does not have `pgcrypto` compiled in, so this could not be verified end-to-end
  before asking the Founder to apply it against production. Core Postgres's built-in `sha256()`
  (confirmed available in both the test harness and, being a core function rather than an extension,
  guaranteed available on Supabase) with a per-row random salt was used instead — fully tested against
  a real Postgres engine before being proposed. See Security/Privacy Reasoning below for why this is a
  proportionate choice for a rate-limited, never-exposed, low-entropy convenience PIN, not a claim that
  it is equivalent to a real account password's own hashing.

## Security / privacy reasoning (honest, not overclaimed)

- **What this genuinely stops**: a child using Angel 11+ normally, through the product's own UI —
  clicking, tapping, typing a URL, using browser back/forward, refreshing, reopening a tab — can never
  see a sibling's name, progress, Practice evidence, Mock results, or recommendations, and can never
  reach household/account management, because Learner Mode's own code never fetches, renders, or links
  to that data, and every parent-only route is blocked by `RegisteredAccountGate` regardless of how
  it's reached.
- **What this does not stop, disclosed honestly**: a technically sophisticated user (or an adult) who
  deliberately opens browser developer tools, extracts the account's own already-valid Supabase
  session token, and hand-crafts a direct API request with a different sibling's learner id, can still
  read that sibling's data — because that request is, at the database level, indistinguishable from
  the parent's own legitimate access to their own account's data. This is the genuine architectural
  limit identified above, not a gap this increment silently ignored.
- **The Parent PIN is a real, rate-limited, server-verified gate** for the realistic threat it targets
  (a child casually trying to get back into Parent Mode, or clicking around) — never stored in
  plaintext, never readable by any client role, brute-force-limited server-side to 5 attempts per
  5 minutes per account. It is not a substitute for the account's own authentication and is not
  presented as one.

## Files changed / created

See the acceptance report for the full list and the exact diff summary; kept to what Parts 1-8 of the
governing instruction require, nothing added speculatively.

## Sequence followed

Inspect (this document's own "current-state finding") -> this decision record -> implement the
smallest safe solution -> test with two real learner profiles -> deploy -> production verification ->
stop, per the governing instruction's own Section 11.
