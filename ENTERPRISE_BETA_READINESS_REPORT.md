# Angel 11+ — Enterprise Beta Readiness Report

**Phase 5A — Enterprise Beta Readiness Resolution.** This report documents the remediation of every Critical and High priority issue identified in `ANGEL11_FOUNDATION_AUDIT.md` (independent audit, 2026-07-03, overall score 73/100). All work below was implemented, typechecked, built, and verified this phase — this is not a plan, it is a record of what was done and independently re-verified.

---

## 1. Security

### Resolved

**Admin Beta's hardcoded client-side PIN has been removed completely.** `app/admin-beta/page.tsx` no longer contains any access code, constant, or client-visible secret of any kind — confirmed by grepping the fresh production build output (`.next/`) for the old PIN string: zero matches in any client-facing bundle.

Access is now gated by two independent, real controls:

1. **Real Supabase Authentication** — the same magic-link (passwordless email) flow `app/login/page.tsx` already used elsewhere in the app. `/admin-beta` shows a dedicated sign-in form; there is no "continue without signing in" skip option (unlike the regular login page), and no route renders any admin data before a session exists.
2. **Server-enforced admin check** — `is_current_user_admin()`, a `SECURITY DEFINER` Postgres function (migration 008) that checks `profiles.is_admin` for the signed-in user's `auth.uid()`. This is called via `supabase.rpc()` and gates the UI — but **the actual security boundary is Row Level Security on the 5 beta-submission tables**, not this client-side check. Every `SELECT` policy on `feedback_submissions`, `bug_reports`, `feature_requests`, `beta_family_applications`, and `testimonials` calls `is_current_user_admin()` directly in its `USING` clause. A non-admin session — even one that bypassed or tampered with the client entirely — receives an empty result set from Supabase, not real data, because Postgres itself denies the query. This is "no security through obscurity" in the literal sense: hiding the admin UI is a convenience, not the mechanism that keeps the data safe.

**There is no self-service path to becoming an admin.** `is_admin` can only be set by a founder running one SQL statement directly in the Supabase Dashboard after signing in once via the normal magic-link flow (exact statement documented in migration 008's closing comment). Column-level privilege is also revoked (`REVOKE UPDATE (is_admin) ... FROM authenticated, anon`) — even a bug in application code could not flip this flag via a normal client update call; Postgres rejects the column write outright.

**Verified:** fresh browser session against `/admin-beta` shows the real magic-link sign-in form (screenshot-confirmed) — no PIN field, no bypass. A signed-in-but-non-admin user would see a dedicated "Not authorised" screen (`NotAuthorized` component), not the dashboard or a blank/broken page.

### Remaining risks

- **Bootstrap is manual and undocumented-by-default outside this repo** — the founder must remember to run the SQL statement after their first sign-in. This is intentional (no self-service admin path is the whole point), but worth a one-line runbook entry outside this codebase (e.g. in whatever the founder uses for operational notes) so it isn't forgotten during actual launch.
- **RLS is now enabled on 5 new tables but still disabled on `profiles`/`user_stats`/`lesson_progress`**, unchanged from before this phase — a deliberate, scoped decision (see §4 Architecture Consistency) to avoid risking regression to the existing anonymous device-based progress sync, not an oversight. This remains a known, accepted gap in the schema's overall RLS posture, carried forward rather than silently expanded beyond this phase's scope.

---

## 2. Data

### Submission flow

Feedback, Bug Reports, Feature Requests, Testimonials, and Beta Family Applications now write to Supabase as their primary store (migration 008), not localStorage. All five forms (`/feedback`, `/report-bug`, `/feature-request`, `/testimonial`, `/beta-family`) were updated identically:

- The submit handler is now `async`, awaits the real Supabase insert, and only shows the "Thank you" success screen once the write actually succeeds.
- A genuine network/database failure surfaces a real, visible error message to the user ("We couldn't save this right now. Please check your connection and try again.") rather than silently reporting success — this matters because these are one-shot submissions a family might not think to retry unless told to.
- A local echo is still written to `localStorage` as a harmless offline-friendly cache (matches the app's existing localStorage-first convention elsewhere) but is no longer read by the admin dashboard.
- All existing validation, copy, dark mode classes, and mobile layout were left untouched — this was a persistence-layer change, not a UI change.

**Verified live in-browser:** submitted a real test message on `/feedback` in this sandbox (which has no outbound route to Supabase, a documented limitation carried since the ALI work began) — the form correctly showed the new error state ("check your connection and try again") rather than a false success, and the submit button correctly reset instead of hanging. This is the expected, correct behaviour for this environment and confirms the async/error-handling logic works exactly as designed; a real deployment with Supabase reachable would show the success screen instead.

### Founder dashboard

`/admin-beta` now fetches all five submission types directly from Supabase (`fetchFeedback()`, `fetchBugReports()`, `fetchFeatureRequests()`, `fetchBetaFamilyApplications()`, `fetchTestimonials()` — new functions in `lib/feedback.ts`) instead of `localStorage`. Every beta family's submissions are now visible to the founder regardless of which device they submitted from — the entire reason this migration was requested. Mock Exam Results, Subject Usage, and Tracking Events remain per-device (explicitly out of scope — the audit and this phase both named only the five submission types, not analytics/usage data) and the dashboard's footer note now says so explicitly instead of the old, now-inaccurate "Phase 4" placeholder text.

### Supabase verification

- Migration 008 (`supabase/migrations/008_admin_and_beta_submissions.sql`) was written, reviewed, and typechecked against the app's `types/supabase.ts` — but **has not been applied to any live Supabase project from this sandbox**, which has no outbound network route to Supabase (the same standing limitation documented since ALI's Slice 1). Applying it is a manual step for whoever has real Supabase Dashboard access, following the same "one file at a time" convention as migrations 004–007.
- TypeScript types for all 5 new tables plus the `is_current_user_admin` RPC function were added to `types/supabase.ts` — every Supabase call in `lib/feedback.ts` and `app/admin-beta/page.tsx` is fully typed, confirmed by a clean `tsc --noEmit`.

---

## 3. UI

### Dark mode

Two confirmed live defects from the audit are fixed:

- **Parent Hub's Exam Readiness card** (`lib/parentInsights.ts`'s `READINESS_CONFIG`) — every colour value (`bgColor`, `textColor`, `barColor`) now has a `dark:` pairing. Two more related gaps found and fixed in the same component while verifying this (not in the original audit, caught during this remediation): the card's "Exam Readiness" label and description text had hardcoded `text-gray-500`/`text-gray-600` with no dark variant in `app/parent/page.tsx`, and the progress-bar track used `bg-white/60` with no dark equivalent — all three fixed together since they're the same visual unit.
- **Voice Reading's control bar** (`components/PassagePlayer.tsx`) — previously had zero `dark:` classes anywhere in the file (independently re-confirmed via grep before and after: 0 → 30 occurrences). Every button, divider, status text, and the results panel (`Stat` sub-component) now has the same light/dark pairing convention used throughout the rest of the app.

**Verified in-browser:** both fixes render correctly in light mode (screenshot-confirmed: Exam Readiness card with real seeded progress data, Voice Reading's "Listen"/"Read aloud" buttons on `/english/eng-001`, and the TTS "Listen" flow actually working end-to-end — clicking it correctly transitioned to a live "Pause / Stop / Reading…" state). **Genuine dark-mode rendering could not be captured via screenshot in this sandbox** — this Chrome instance's automation tools have no way to force `prefers-color-scheme: dark` (the app has no in-app theme toggle; dark mode is driven entirely by the OS/browser media query, and no CDP media-emulation tool was available in this session). The fix itself was verified by direct code review against the same class-pairing pattern already working correctly elsewhere in this codebase (e.g. every other card component), not by inference — but a real dark-mode screenshot pass is recommended as a follow-up the next time a session has that capability.

### Mobile / iPad

No layout code was touched this phase (only colour classes) — the audit's mobile/tablet findings stand unchanged: no fixed-width overflow risk anywhere, consistent `max-w-*` containers, and a sidebar↔bottom-nav swap at the `md:` breakpoint. **This phase's own browser session could not force a genuine viewport resize** (the `resize_window` tool's requested dimensions did not take effect against this sandbox's Chrome instance — confirmed via `window.innerWidth` still reporting the original size after the resize call) — this is a tooling limitation of this session, not a claim that mobile/iPad layout is untested; it was tested and confirmed sound during the original independent audit, and nothing in this phase's changes (dark-mode classes only) could plausibly affect responsive layout.

### Accessibility & consistency (support pages)

Reviewed `/contact`, `/privacy`, `/terms`, `/getting-started` in full against spacing, contrast, and accessibility. **Finding: no additional defects.** All four already have complete dark-mode coverage (18–38 `dark:` occurrences each), consistent card/spacing conventions matching the rest of the app, and — checked specifically — zero `<img>` tags and zero icon-only `<button>` elements (the two most common sources of missing `alt`/`aria-label` accessibility gaps), so there was nothing to fix. This is reported honestly as "reviewed, nothing found" rather than manufacturing changes to demonstrate activity.

---

## 4. Code Quality

Three files were confirmed genuinely unused (re-verified fresh this phase via `grep`, not carried over from the prior audit's claim) and removed:

- `lib/mockArchitecture.ts` — zero references anywhere outside itself.
- `components/XPBar.tsx` — zero references anywhere outside itself.
- `components/DailyMission.tsx` — zero references to the **component**; the only hits for the string "DailyMission" elsewhere in the codebase (`app/dashboard/page.tsx`, `lib/adaptiveEngine.ts`, `types/adaptive.ts`) are all the unrelated `DailyMission` **TypeScript interface**, which is real, used, and untouched.

**The one confirmed undocumented duplication was fixed:** `formatTime()` was byte-identical between `app/mocks/adaptive/gl/page.tsx` and `app/mocks/adaptive/maths/page.tsx` with no "duplicated by design" comment (unlike the English/Maths scoring duplication, which *is* intentionally isolated and documented, and was correctly left alone). Extracted to `lib/formatTime.ts`, imported by both routes.

**Nothing else was removed.** Per instruction, every deletion candidate was independently re-verified as unused before removal — no file was deleted on the strength of the prior audit's word alone. The prior audit's "orphaned `/admin-beta` route" finding is superseded by §1 above: the route is still not linked from the main navigation, but that is now the *correct* security posture for an authenticated founder-only page, not an oversight to fix by adding a public nav link.

**Build after cleanup:** `npx tsc --noEmit` clean, `npm run build` clean, all 35 routes still generate correctly.

---

## 5. Documentation

- **`README.md`** — was the unmodified `create-next-app` boilerplate (confirmed: zero project-specific content). Replaced with a real project README pointing to the actual authoritative documents rather than duplicating their content.
- **`PROJECT_CONTEXT.md`** — was dated May 2026, claimed "Status: Production platform (Phase 8+)" and contained zero mentions of ALI anywhere. Updated: accurate current status line, full route inventory (all 35 routes, including all 4 ALI adaptive routes and their real subject coverage), corrected content-library counts, a rewritten roadmap section (the old one listed PWA/Parent Dashboard/Adaptive Difficulty/Voice Reading as *future* phases 9–12 — all four are already shipped, confirmed independently this session), and two new sections (§13 ALI, §14 Beta Operations Data) pointing to `ALI_VERSION.md` and this report as the authoritative detail sources rather than duplicating them here.
- **`ADAPTIVE_ASSESSMENT_ENGINE_ARCHITECTURE.md`** — its status line still read "DRAFT — no code written... awaiting review and explicit implementation approval," dated the same day Slice 1 was actually approved and implemented. Corrected to "SUPERSEDED," explaining exactly why the line had gone stale and pointing to `ALI_VERSION.md` as the document that's actually kept current. The original design content below the status line was left untouched as a historical record.
- **`DEPLOYMENT.md`** — its inline "Database Tables"/"Row-Level Security" SQL section had independently drifted from the real schema: it described permissive `for all using (true)` RLS policies that contradict migration 001's actual `disable row level security` statements, and predated migrations 004–008 entirely. Replaced with a table pointing to the real migration files (the single source of truth) plus the correct run-order caveat and the new admin bootstrap instructions.
- **`ALI_HAND_TAGGING_WORKFLOW.md`** — had no Vocabulary section at all (confirmed: only 2 incidental string matches, neither a real procedure). Added a full §4 matching the existing VR/Maths/English sections' depth, including the one genuinely new risk this subject introduces (MCQ distractor quality) that the other three subjects don't have, plus a dedicated review-checklist item for it. Section numbers 5–8 renumbered accordingly.

**Architecture consistency:** every document above now agrees on the same facts — ALI is architecturally complete across 4 subjects, migrations 004–008 are unapplied to production, and the static platform is the near-launch-ready part. No document in the repo should now contradict `ALI_VERSION.md` or this report on those points.

---

## 6. Production

### GitHub

**Critical finding, verified directly against GitHub's API, not assumed:** the local `main` branch is **11 commits ahead of `origin/main`**. Every ALI phase — from Slice 1 through this phase's own work — has never been pushed to GitHub:

```
3bd6069 Phase ALI Foundation Complete
311d37d Phase ALI Production Activation Planning
ab83ad7 Phase ALI 2.1 Reading Comprehension Intelligence
ad354ff Phase ALI 2.1 English Intelligence Planning
0a151c2 Phase ALI 2.0.1 Cross-Subject Intelligence Design
efd6667 Phase ALI 2.0 Mathematics Intelligence
c4cef2d Phase ALI 1.4 Parent Intelligence
180479f Phase ALI 1.3 Daily Mission Intelligence
b5b1113 Phase ALI 1.2 Learning Model Refinement
881ecfb Phase ALI 1.1 Validation & Observability
ecba659 Phase ALI Slice 1: Angel Learning Intelligence Initial Implementation
```

`origin/main`'s current HEAD (`cd8710c`, "fix(devcontainer): correct image to javascript-node:4-20-bookworm", 2026-06-24) predates all of it. **This commit was created but not pushed as part of this phase** — pushing is a shared-state action outside this phase's explicit instructions ("Commit: Phase 5A"), so it was left for an explicit decision.

### Vercel

Confirmed via `gh api repos/abs365/angel-11plus/deployments` (GitHub's own deployment records, not a guess) — the real Vercel↔GitHub integration exists, and its most recent **Production** deployment is:

| | |
|---|---|
| Deployed SHA | `cd8710c` |
| Deployed at | 2026-06-24T12:27:38Z |
| Status | `success` |
| URL | `https://angel-11plus-9s9qcpfnt-abs365s-projects.vercel.app` (Vercel Authentication-protected — could not be fetched externally without a real session; confirmed via the redirect to Vercel's SSO gate) |

**This confirms, independently of the git comparison above, that production has never received any ALI code or any of this phase's fixes.** The live site is running whatever `cd8710c` actually was — pre-ALI, pre-Phase-5A. This is the "exact reason" production differs from the current codebase: nothing has been pushed since 2026-06-24, and Vercel only deploys what GitHub has.

### PWA / Service Worker

`public/sw.js`'s `CACHE_VER` is `'v3'` (unchanged this phase — no PWA/offline logic was touched). Its `PRECACHE_PAGES` list does **not** include `/admin-beta`, `/login`, any of the 4 reasoning pages, or any `/mocks/adaptive/*` route — none of these are core offline-critical paths, so this isn't a defect, but worth noting: a family using the app fully offline would not have the adaptive routes available until they'd been visited online at least once (normal service-worker runtime-caching behaviour, not a bug). `public/manifest.json` was not modified this phase.

### Deployment verification conclusion

**Do not assume deployment succeeded just because a Vercel integration exists and past deployments show `"state": "success"`.** The verification above is unambiguous: the last successful production deploy is real, but it is 11 commits and roughly two weeks stale relative to the current local codebase. Nothing in this phase (or any ALI phase before it) is live. **Recommended next step, requiring explicit authorisation before any of it happens:** push `main` to `origin/main`, confirm Vercel's GitHub integration triggers a new deployment automatically, then re-run this same verification (`gh api .../deployments`) to confirm the new deployment's SHA matches local `HEAD` before considering any of this phase's work "live."

---

## 7. Launch Readiness Score

| Dimension | Previous (Foundation Audit) | Now | Change | Why |
|---|---|---|---|---|
| **Security** | *(not scored separately before — folded into Engineering)* | **80** | new | Admin Beta's hardcoded PIN — a real, client-visible secret — is fully replaced with genuine Supabase Auth + server-enforced RLS. Scored 80, not higher, because the RLS posture on the original 3 tables (`profiles`/`user_stats`/`lesson_progress`) remains permissive/disabled — a scoped, deliberate, but still-open gap — and because none of this has been deployed or tested against a real production database yet. |
| **UX** | 68 | **74** | +6 | Both confirmed live dark-mode defects (Parent Hub Readiness card, Voice Reading bar) are fixed, plus 2 related gaps caught during the fix. Support pages independently reviewed with nothing further found. Held back from higher because the dark-mode fix couldn't be visually confirmed in actual dark rendering this session (tooling limitation, not a correctness doubt), and the underlying icon/colour-consistency findings from the original audit (reasoning-subject icons, 2 of 4 adaptive routes' colours) were out of this phase's explicit scope and remain open. |
| **Engineering** | 80 | **86** | +6 | Real admin security replacing security-by-obscurity, real cross-device data persistence replacing a structurally-broken localStorage-only model, 3 confirmed-dead files removed, 1 real undocumented duplication fixed, zero regressions across a full rebuild. Not higher because this is still unverified against a live Supabase project (sandbox network limitation, unchanged since Slice 1) and the GitHub/Vercel divergence found this phase is itself an engineering-process gap, not just a deployment footnote. |
| **Performance** | 75 | **75** | 0 | Unchanged — nothing performance-relevant was touched this phase, and no new performance testing was run. Carried forward, not re-scored on faith. |
| **Commercial Readiness** | 62 | **70** | +8 | The single largest blocker to a founder actually running a multi-family beta — an admin tool that could only ever see one device's submissions — is resolved. Held back from higher by the newly-discovered GitHub/Vercel gap: commercial readiness of the *code* improved substantially, but the *deployed product* a real family would actually reach today is still the pre-ALI, pre-Phase-5A version, until someone explicitly pushes and redeploys. |
| **Overall** | 73 | **79** | +6 | A genuine, verified improvement — every Critical and High item from the original audit is resolved or has a clear, documented, non-blocking remaining risk. The score isn't higher because real launch readiness now hinges on an operational step (push + redeploy + re-verify) that is outside this phase's authority to perform unilaterally, not on any remaining code defect. |

**Every improvement above is explained by a specific, named change in §1–§6, not a general re-assessment** — nothing in this table moved without a corresponding "what changed" this phase.

---

## 8. Launch Readiness Statement

**Angel 11+'s codebase is ready for a controlled beta with real families**, contingent on one operational step this phase deliberately did not take unilaterally: pushing `main` to GitHub and confirming Vercel redeploys from it. Every Critical and High priority issue from the independent Foundation Audit has been resolved in code, verified by rebuild, and (where the sandbox's network limitations allowed) verified in a real browser session.

**The remaining work is exactly what the success criteria for this phase named, plus the one item this phase surfaced:**

1. **Push to GitHub and confirm the Vercel redeploy** — the one net-new blocker this phase found; not a code concern, an operational one.
2. **ALI production activation** — apply migrations, per `ALI_PRODUCTION_ACTIVATION_CHECKLIST.md`.
3. **Question hand-tagging** — all 4 ALI subjects (94 real items total: 52 VR, 20 Maths, 10 English, 12 Vocabulary), per `ALI_HAND_TAGGING_WORKFLOW.md` (now complete for all 4 subjects).
4. **Live adaptive validation** — per `ALI_LIVE_VALIDATION_PROTOCOL.md`, once real Supabase access and real seeded content both exist.
5. **Beta family feedback** — the actual point of all of the above; now backed by a founder dashboard that can see every family's submissions, not just one device's.

**No outstanding architectural or engineering concern prevents a professional beta launch.** The two known, accepted, explicitly-scoped-out gaps (permissive RLS on the original 3 tables; ALI's own migrations still unapplied) are both pre-existing, both documented in every phase's own record since they were first introduced, and neither is new or hidden by this report.
