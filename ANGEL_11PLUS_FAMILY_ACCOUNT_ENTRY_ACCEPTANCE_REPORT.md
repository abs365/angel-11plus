# ANGEL 11+ — Family Account & Entry Experience Correction: Acceptance Report

Governing instruction: "ANGEL 11+ — FAMILY ACCOUNT & ENTRY EXPERIENCE CORRECTION" (2026-09-23),
parts A-G. This report covers exactly that increment. Per its own explicit instruction, this
increment stops here — it does not begin a wider authenticated-experience redesign or "Increment 2."

## Part A — Password recovery

### Root cause (found by inspection, as instructed)

`components/providers/AuthProvider.tsx`'s `updatePassword()` called Supabase's own
`auth.updateUser({ password })` and returned — nothing anywhere ever called `signOut()` afterward.
The recovery link's redirect establishes a **genuine, valid Supabase session** (`detectSessionInUrl:
true`, a real `PASSWORD_RECOVERY` auth event). Once the parent chose a new password, that same
recovery session simply continued on as the app's ordinary authenticated session — `isPasswordRecovery`
correctly flipped back to `false` (stopping the recovery *form* from showing), but nothing ever ended
the *session* itself. `app/reset-password/page.tsx`'s own success screen then compounded this by
routing straight to `/dashboard` ("Continue to Angel 11+"), so the parent was silently carried into
the account on the old recovery session rather than being asked to sign in again.

### Fix (smallest safe correction)

`updatePassword()` now calls `supabase.auth.signOut()` and `clearLearnerContext()` immediately after
a successful `updateUser()`, before returning. This is centralised at the source in `AuthProvider`
(not duplicated in the page), so the guarantee — a password-recovery session can never silently
become the ongoing authenticated session — holds for every current and future caller, not just this
one screen.

`app/reset-password/page.tsx`'s success screen was updated to match: heading "Password updated",
body "For your security, we've signed you out. Please sign in again with your new password.", button
"Sign in" routing to `/login?mode=signin` (the existing Sign-in tab, password form by default —
confirmed via `lib/loginRouting.ts`'s `resolveLoginTab`/`isPermanentlyAuthenticated`, which no longer
bounces the parent straight back to `/dashboard` now that the session has genuinely ended).

`/reset-password` is a `PUBLIC_TOP_LEVEL_ROUTES` route, so briefly going unauthenticated mid-page
(the `SIGNED_OUT` auth event firing while the success screen is still showing) does not trigger any
gate redirect away from the confirmation — checked directly against `lib/registeredAccess.ts`.

### New authenticated-behaviour target, now implemented

Reset email → recovery link → choose new password → "Password updated, you've been signed out" →
Sign in → parent authenticates fresh with the new password → normal entry. No new authentication
mechanism was introduced; this uses only Supabase's own `signOut()`/`updateUser()`/`resetPasswordForEmail`.

### Reset-password screen copy review

The rest of the screen's copy ("Reset your password" / "We'll email you a secure link to choose a
new one" / "Never set a password? You can set one here, or you can always sign in with an email link
instead." / "Check your email" / "Choose a new password" / "You'll use this to sign in from now on")
was already plain, short and human — no changes were needed there beyond the success-state copy above.

### Tests updated

`tests/app/resetPasswordPage.test.ts` previously asserted the *old, buggy* destination
(`router.push("/dashboard")`) as the expected behaviour. That assertion has been replaced with one
that requires the corrected behaviour (`router.push("/login?mode=signin")`) and explicitly forbids
the old one, so the fix cannot silently regress. `tests/components/authProviderPasswordSupport.test.ts`
gained a new test asserting `updatePassword()` calls `signOut()`/`clearLearnerContext()` only after
the success path, not before the error check.

## Part B — Parent Account vs Learner Profile

Audited: `components/Header.tsx`, `components/LearnerSwitcher.tsx`,
`components/parent/LearnerIdentityBanner.tsx`, `components/parent/ParentSetupCard.tsx`,
`app/dashboard/page.tsx`, `app/add-child/page.tsx`, `components/ui/UserMenu.tsx`.

**Real defect found and fixed:** the Header's account-menu popover (top-right icon button) was
unlabelled — just a person icon — and its one link conflated two different things in a single
tappable element: "go to Parent Dashboard" and "which child is currently active" (a "Viewing:
{childName}" subtitle duplicating the adjacent LearnerSwitcher's own "Viewing: {childName}" control).
This is a plausible direct contributor to the Founder's reported difficulty telling parent-account
context apart from learner context. Fixed: the popover now opens with an explicit "PARENT ACCOUNT"
label above the email, and the duplicated child-name subtitle was removed from the Parent Dashboard
link (the LearnerSwitcher immediately to its left already owns that signal, and now owns it alone).

**Already satisfactory, no change made (smallest-safe-correction discipline):**
- `LearnerSwitcher.tsx` — "Viewing: {name} ▾" on every page, with a "Your children" list and "Add
  another child" — already the one clear, consistent place a parent sees/changes the active learner.
- `LearnerIdentityBanner.tsx` (Parent Dashboard) — an explicit "VIEWING" label, "{name}'s progress",
  pathway shortname, a full multi-child switcher and "Each child has their own progress, practice and
  recommendations" — this already states parent-vs-learner and multi-child isolation plainly.
- `ParentSetupCard.tsx` — a short, two-step, dismiss-once-complete setup card, not a configuration
  system.
- No internal IDs or implementation terminology are exposed anywhere in these surfaces (checked).

No change was made to the existing Parent Account / Learner Profile architecture — no separate child
auth accounts were introduced, matching the explicit instruction to preserve it.

## Part C — Pathway selection

### Research performed (required before any factual copy change)

Verified current authoritative facts by web search for each real pathway in `lib/pathways.ts`
(`gl`, `cem`, `csse`, `iseb`):
- **CSSE** = Consortium of Selective Schools in Essex, confirmed (Wikipedia, CSSE's own site
  csse.org.uk, multiple independent 11+ guides).
- **GL Assessment** — confirmed as a UK 11+ test publisher/administrator; its own current
  self-description does not lean on expanding "GL", so (matching the governing instruction's own
  example, which also doesn't expand "GL") no expansion was added — this would have been invented
  emphasis, not a real clarity gain.
- **ISEB** = Independent Schools Examinations Board, confirmed (iseb.co.uk); the Pre-Test roster
  (Eton, Harrow, Wycombe Abbey) was independently confirmed, not stale.
- **CEM — material finding.** Multiple current sources confirm CEM (Centre for Evaluation and
  Monitoring) withdrew from the standard paper-based grammar-school 11+ market and was acquired by
  Cambridge University Press & Assessment in 2019 — it is **no longer administered by Durham
  University**, which the app's pathway data asserted. The app also claimed CEM was current in "
  Birmingham, Kent, Bucks" — directly checked: Kent is confirmed GL Assessment, not CEM; Birmingham's
  current status is genuinely contested across current sources (some say moved to GL, some say still
  partially CEM), so it was not safe to assert either way.

### Correction made (`lib/pathways.ts`, evidence-based, no invented facts)

- **CSSE** description now opens by naming the consortium in full: "CSSE stands for the Consortium of
  Selective Schools in Essex, a group of Essex grammar schools that share a common 11+ entrance exam."
- **ISEB** description now opens: "ISEB (the Independent Schools Examinations Board) sets the Common
  Pre-Test used by many independent senior schools, including Eton, Harrow, Wycombe Abbey and others."
- **CEM** — name simplified from the now-inaccurate "CEM (Durham University)" to "CEM"; description
  rewritten to state the real, current situation honestly: originally Durham, now Cambridge University
  Press & Assessment; withdrawn from the standard paper-based grammar-school market; many former areas
  have moved to GL Assessment or a school-set test; asks the family to confirm directly with their
  target school. Badge changed from "Grammar Schools" to **"Check With School"** so a parent sees at a
  glance that this pathway specifically needs direct confirmation, unlike the others. `examFormatNotes`
  reworded to the same effect. `GL`/`CSSE`/`ISEB` badges/format notes were left unchanged (already
  accurate).
- **GL Assessment** — left unchanged; already accurate and already in plain language, per the research
  above.

This is a copy-only correction to `lib/pathways.ts` (the single source both the `/pathways` selector,
`PathwayCard`, the Target School Overview, and `add-child`'s dropdown all read from) — no educational
engine, mastery logic, or protected system was touched.

### "Not sure" route — already exists, verified working, no new build needed

`lib/pathways.ts` already contains a "Not Sure Yet" pathway (`id: "not-sure"`), deliberately excluded
from `REAL_PATHWAY_IDS` (`lib/activePathway.ts`) so it is never treated as a real exam target, but
still shown as a genuine, selectable card on `/pathways` alongside the real pathways, with honest copy
("We cover all key 11+ skills and you can update your pathway at any time"). Selecting it exercises
the same `applySelection()` path as any other pathway and works correctly. `add-child`'s pathway
dropdown offers "Choose later" as its own safe deferral for a new child. Both were verified by reading
`app/pathways/page.tsx` and `app/add-child/page.tsx` directly — no new "not sure" mechanism was built,
since a working one already exists.

### Learner-facing simplified view

The dashboard's pathway pill (`OrientationHeader`) already shows a small read-only badge, not a
configuration control — e.g. "CSSE (Essex)" or "No target school chosen yet" — and the mission
subtitle shows "{shortName} pathway · School Intelligence" as a link, not an editable field. This
already satisfies "the child sees a simplified statement, not a configuration system." No new
child-specific explanatory text was added, to avoid clutter on an already-dense dashboard header;
full pathway explanations remain one tap away via that same link.

## Part D — First entry after sign-in

Audited: `app/login/page.tsx`, `app/dashboard/page.tsx`, `components/parent/ParentSetupCard.tsx`,
`app/add-child/page.tsx`, `lib/loginRouting.ts`.

Current, verified journey: sign-in/sign-up → `/dashboard` directly (both password and magic-link
flows redirect there). On `/dashboard`, `ParentSetupCard` appears inline **only** when a child name
or pathway is genuinely missing (`!childName || !pathway`), and disappears permanently once both
exist — this is already a short, two-step, non-wizard setup embedded in the real first page, not a
separate forced flow. An existing single-learner family with a name and pathway already set sees no
setup step at all — straight into their Mission. A new learner profile already exists by default on
account creation (unnamed), so "add a first child" is never a separate required step; only "add
*another* child" is (`/add-child`), which is correctly optional. Multi-learner families get explicit,
safe switching via `LearnerSwitcher`/`LearnerIdentityBanner` (Part B) — no ambiguity about whose
evidence is on screen. No changes were made to this journey; it already satisfies the instruction's
requirements.

## Part E — Preserved systems

Not touched, confirmed by the diff below: Educational Intelligence Engine, mastery model, Question
Factory, practice selection logic, Mock Engine, Mock→EI bridge, question inventory, multi-learner
database architecture, **migrations 260/261 (not rerun)**, RLS/security model, production
domain/DNS, Resend DNS, SMTP credentials, public homepage, homepage photography/visual design,
assessment scoring, Writing engine. No secret was read, logged, or exposed at any point.

## Part F — Human experience standard

All new/changed copy is plain British English. No purple, no gradient, no AI/robot/brain/sparkle
imagery, no new pill/card clutter was introduced — the Header fix removes a redundant subtitle rather
than adding a new element; the CEM badge change reuses the existing badge slot. Copy Quality Guard
(em/en-dash ban) verified clean on every file touched. No layout/responsive change was made — text
and one small label only.

## Files changed

- `components/providers/AuthProvider.tsx` — `updatePassword()` now ends the recovery session on success.
- `app/reset-password/page.tsx` — success-state copy and destination corrected.
- `components/Header.tsx` — "Parent Account" label added; duplicated child-name subtitle removed;
  now-unused `useChildName` import/variable removed.
- `lib/pathways.ts` — CSSE/ISEB acronym-expansion; CEM factual correction (name, description,
  `examFormatNotes`, badge).
- `tests/app/resetPasswordPage.test.ts` — updated to require the corrected (not the old buggy)
  destination.
- `tests/components/authProviderPasswordSupport.test.ts` — new test locking in the signOut-after-
  success behaviour.

No dependency changes. No migration created or run.

## Tests / build (clean-checkout gate, genuine `git worktree` of the deployed commit)

- Typecheck: 0 errors (project files only; pre-existing untracked-Question-Factory-file noise
  confirmed absent from the clean checkout, as established in every prior increment).
- Tests: **4,737 / 4,738 pass, 0 failures, 1 pre-existing skip** (baseline was 4,736/4,737 — the +1
  is this increment's own new regression test; no other change in pass/fail/skip counts).
- `npm run migration-sql-guard`: PASS, 257 files.
- `npm run copy-guard`: 51 violations, **identical to the established baseline**; `lib/pathways.ts`
  and every other file this increment touched has zero violations.
- `npx eslint .`: 114 problems (83 errors / 31 warnings) — identical to the established baseline.
- `next build`: genuine PASS, no bypass flag, full route manifest built including `/reset-password`
  and `/pathways`.

## Commit and deployment

Commit `a13a48f` — `fix(auth): end password-recovery session after reset; clarify parent-account
context and pathway copy`. Pushed to `origin/main`. Vercel deployed automatically
(`angel-11plus-qje0ixy50-...`, status Ready), confirmed aliased to all production domains including
`https://www.angel11plus.com`.

## Production evidence (Part G)

### Verified directly against `https://www.angel11plus.com` (not inferred from the build)

- Fetched `/pathways`' and `/reset-password`'s referenced JS chunks directly from production (not
  through a browser) and grepped them: **confirmed present, live, in the exact deployed bundle**:
  the new CSSE "Consortium of Selective Schools" text, the new CEM "Check With School" badge and
  "withdrawn from the standard paper-based grammar-school 11+ market" description, the reset-password
  "we've signed you out" copy together with "Password updated" and the `/login?mode=signin` route,
  and the Header's new "Parent Account" label.
- Loaded `https://www.angel11plus.com/pathways` in a real browser: renders correctly, on-brand
  (Academic Navy/Angel Blue, ivory background, no purple, no gradient), and correctly shows the
  controlled-beta access gate ("Create your free parent account to get started" / Sign in / Create
  account) for a visitor with no registered parent session — confirmed no regression to that gate.
- `/reset-password` and `/pathways` both return HTTP 200 in production.

### 13-point checklist — what could and could not be safely verified this session

| # | Item | Result |
|---|---|---|
| 1 | Forgot-password request | **Not verified this session** — requires entering a real email into a live form; see limitation below. |
| 2 | Real reset email delivery | **Not verified** — requires access to a real inbox, which I do not have and must not seek. |
| 3 | Recovery link opens correct permanent domain | Not verified directly (no real email received); `redirectTo` is genuinely `${window.location.origin}/reset-password`, confirmed at the source and unchanged by this increment — was already working per the Founder's own prior real journey. |
| 4 | New password saved | Unchanged code path (`updateUser`), not touched by this fix beyond adding the sign-out after it — was already confirmed working by the Founder's own prior real journey. |
| 5 | Recovery session ends safely | **Fixed and code-level/bundle-level verified this session** (the actual subject of Part A). Not exercised end-to-end with a real recovery session, since that requires a real email. |
| 6 | User presented with Sign in, not silently in the account | **Fixed and verified** (new destination confirmed live in the production bundle; old destination confirmed absent). |
| 7 | New password successfully signs in | Unchanged sign-in code path, not touched by this fix. |
| 8 | Parent context clearly identifiable | **Fixed this increment** (Header "Parent Account" label); **not visually verified against an authenticated production session this session** — see limitation below. |
| 9 | Active learner profile clearly identifiable | Already satisfactory on inspection (LearnerSwitcher/LearnerIdentityBanner); not visually re-verified against a live authenticated session this session. |
| 10 | Multi-learner switching stays isolated | Unchanged this increment; not re-verified against a live authenticated session this session. |
| 11 | Pathway explanation understandable without prior acronym knowledge | **Fixed this increment** (CSSE/ISEB/CEM copy); confirmed live in the production bundle. Full rendered card view not visually verified against an authenticated session this session. |
| 12 | Existing learner not forced through setup again | Unchanged, confirmed correct by code inspection (`ParentSetupCard`'s own gating condition). |
| 13 | No regression to homepage/Mock/Practice/Learn/Parent Dashboard | Homepage confirmed rendering correctly; the other authenticated pages were not touched by any change in this increment and their build succeeded in the same clean gate as every other route. |

### Explicit disclosure of what could not be safely verified

This session's one available browser tab, which a prior increment's summary described as
already carrying the Founder's authenticated session, was checked directly and found to be
**unauthenticated** (it renders the public "Create your free parent account to get started" gate,
confirmed by screenshot) — session state does not persist indefinitely across environment restarts.
Per this task's own instruction and the standing AGENTS.md constraint, I did not create an account,
enter a password, or otherwise attempt to authenticate. This means checklist items 1-4, 7, and the
live-rendered (not bundle-text) confirmation of items 8-11 genuinely require the Founder's own
hands-on completion against production — exactly the "stop at the exact login point and hand it to
the Founder" pattern this project has used at every prior point a real login was needed. Everything
that could be verified without an authenticated session or real inbox access (source-level root
cause, the fix itself, the full clean-build gate, and direct confirmation that the corrected code and
copy are genuinely live in production) was verified directly, not assumed.

## Remaining limitations

- The CEM pathway's current real-world coverage is genuinely contested across independent sources as
  of this research (2026-09-23) — the new copy states this honestly and directs families to confirm
  with their target school, rather than asserting a specific, possibly-wrong list of current adopting
  areas. This is disclosed as an area worth a periodic re-check, not a defect.
- Items 1-4, 7, and the fully-authenticated re-verification of 8-11 require the Founder's own
  production pass, as disclosed above.

---

**ANGEL 11+ FAMILY ACCOUNT & ENTRY EXPERIENCE: PARTIAL.**

Rationale for PARTIAL rather than GO: the actual code fix, copy corrections, and every part of
production verification reachable without an authenticated session or real inbox access are complete,
tested, deployed, and directly confirmed live on `https://www.angel11plus.com`. GO is withheld only
because the genuinely security-relevant end-to-end path (a real recovery email, opened and completed,
ending in a successful fresh sign-in) has not yet been exercised by a human against production — that
step is now ready for the Founder to complete, and the outcome should be reported back before this
item is called fully closed.

Per the governing instruction: this increment stops here. No wider authenticated-experience redesign
or "Increment 2" work has been started.
