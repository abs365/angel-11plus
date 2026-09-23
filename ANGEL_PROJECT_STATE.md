# ANGEL 11+ — PROJECT STATE

**This is the single authoritative handover document for a fresh Claude session.**
It records current state only — not history. For history, see the specific `ANGEL_*.md` report
named under each item below. For operating rules, see `AGENTS.md` (imported by `CLAUDE.md`).

Last updated: 2026-09-18, Educational Depth Phase 1 Wave 2 (Writing picture-narrative) —
**GO, CLOSED.** The Founder independently reviewed migration 255's riverboat candidate and
REJECTED it (real Year 5 learner evidence: "there is nothing to write with the picture"). A
replacement, "The Treehouse Lantern", was authored, independently reviewed by the Founder
(APPROVED), governed-promoted via migration 259, and production-verified live and
practice_eligible. See "Closed programme (most recent)" below.

---

## Access-control investigation (2026-09-21) -- REMEDIATION PREPARED: Migration 261 awaits Founder application

Founder saw "Viewing: Child 1" + "Sign out" in a browser they believed signed out. Verified: EVERY visitor silently gets a real ANONYMOUS
Supabase session (anonymous-first design, no route guards/middleware), and the header shows the account menu for it -- so this is
expected behaviour, not a bypass; a browser with NO session shows "Sign in" and no learner data. Signing out in one browser does not
end another browser's session. Confirmed by count-only probes on production: every learner table/RPC/write fails closed for the
public key and for anonymous sessions; ownership header is DB-validated. **DEFECTS FOUND:** (1) migration-003 views
`profile_summary`, `recent_activity`, `lesson_analytics`, `subject_analytics` are readable by the PUBLIC anon key (98/101/37/26 rows;
profile_summary exposes profile_id, device_id, auth_user_id, XP, streak, last_activity, session counts; recent_activity exposes
per-learner lesson scores; NOT learner_name/emails). Unused by the app. Needs a Founder-authorised migration (revoke select from
anon/authenticated + security_invoker) -- NOT created yet. (2) `/api/writing-feedback` had no authentication (unauthenticated OpenAI
use) -- fixed by `lib/server/requireSupabaseUser.ts` (verifies a Supabase session; anonymous allowed) + client sends the token.
Reset page said "wait a minute" for the project-level email limit (`over_email_send_rate_limit`, blocks the send, ~1h) -- fixed copy.

**Founder decisions 2026-09-21 and what they changed.** (a) Migration `261_revoke_public_access_to_learner_analytics_views.sql`
(revoke all on the four views from public/anon/authenticated + `security_invoker = true`; nothing else touched) is PREPARED, verified on real
Postgres, and NOT yet applied -- AUTH ACCESS CONTROL stays FAIL until the Founder applies it and the production AFTER probes pass.
(b) Controlled-beta policy: **a registered parent account is required for the persistent learner experience.** A Supabase anonymous
session is a technical identity, not a parent account: `lib/registeredAccess.ts` (`hasRegisteredParentAccount`, `decideAccess`,
fail-closed route lists) + `components/RegisteredAccountGate.tsx` (wrapped once in `app/layout.tsx`) show a Create account / Sign in panel
instead of any learner surface (Today, Learn, Practice, Mock, Progress, Pathways, Parent Dashboard, Add child) for anonymous/no
session, and the learner page never mounts (no reads, no evidence writes). Header/Navigation show Sign in + Create account (no
"Viewing: ...", no account menu, no "Sign out") for anonymous; `AuthProvider` no longer creates/activates/claims a learner profile for an
anonymous session. The anonymous session itself is still bootstrapped (support forms call ensureProfile). Public pages unchanged.
Existing anonymous learners/evidence (139 anonymous accounts) are untouched but no longer reachable from the UI.

---

## Parent authentication UX (2026-09-21) -- password primary, email link secondary

/login is now the familiar model: **Create account** = email + password + confirm (Supabase `signUp`, address confirmed by an
emailed link; an already-registered address is detected from an empty `identities` list and nothing is created), **Sign in** =
email + password, with "Forgot password, or need to set one?" (the existing reset flow, which lets an email-link account CHOOSE
its first password -- those accounts hold a random temporary password nobody knows, so a wrong-password message points there) and
"Email me a sign-in link instead" as the secondary passwordless option (still `shouldCreateUser:false` on Sign in). No migration, no
learner-table change; multi-learner context clearing/restoration untouched. Logic + copy: `lib/authEmailFeedback.ts`.

---

## Multi-learner household architecture (2026-09-21) -- DATABASE APPLIED + CLIENT INTEGRATED

Founder decision: one parent account -> many learners (max 8). **Migration 260 was applied to production ONCE**
(project `agxunwcdatosrmzhhuxj`) and accepted: AFTER preflight PASS -- 92 learners / 90 owned / 2 unowned, profile identity
checksum `e77235fe0dedfa3251ddf5a9fa2e6158` unchanged, evidence 2069 rows / fingerprint `df5e191d...` unchanged, 0 legacy
resolvers, `is_admin`/`auth_user_id` no longer client-writable. **Never re-run 260.** The file is on main
(`supabase/migrations/260_...`, sha256 `2E76C5F4...FD58`, 24340 bytes).
The multi-learner CLIENT was integrated into main by a controlled merge that preserved the newer production auth/login work
(6d643be/389ab83/3862f09). Design + dependency map: `ANGEL_MULTI_LEARNER_HOUSEHOLD_ARCHITECTURE.md`; evidence:
`ANGEL_ACCOUNT_ISOLATION_AND_AUTH_MODEL_EVIDENCE.md`; before/after pack: `ANGEL_MULTI_LEARNER_MIGRATION_VERIFICATION_PACK.sql`.
Every request carries a database-validated `x-angel-learner-id`; learner browser state is scoped per learner (closes the
device-wide localStorage contamination). Clean checkout builds/type-checks/tests by the normal process
(`scripts/verify-clean-checkout.mjs`); the earlier "7 baseline failing tests" were tracked tests with session-local paths / a
missing migration-235 file, fixed in this work (they are NOT untracked files).
Founder-only acceptance still needed: real parent journey (Child 1 -> add Child 2 -> switch -> back -> logout/login).

---

## New-account / same-browser isolation + returning-parent auth clarity (2026-09-21, commit 6d643be, deployed)

Founder's real new-email journey showed another user's progress. Verified root cause on production code: the whole
learner blob (`angel11plus_progress`: sessions, readiness chip, missions, pathway) is ONE device-wide localStorage key
read by `getProgress()` with no account awareness, so ANY account on that browser renders it ("5 sessions so far",
"Solid progress", "Building Confidence", CSSE, English mission all derive from it -- reproduced with the real functions).
Fixed by the multi-learner client (per-learner keys + claim only when profiles.device_id matches; tests
`tests/lib/crossAccountDeviceState.test.ts`). Anonymous->permanent is NOT a claim in the current architecture: signInWithOtp
creates a new auth user; the anonymous profile stays owned by the anonymous identity. Provenance of the Founder's actual
browser needs `ANGEL_ACCOUNT_ISOLATION_PROVENANCE_CHECK.sql` (read-only).
Auth: Create account never asks the parent to choose a password (Supabase stores a random temporary one nobody knows); a password can only be chosen via the reset flow. /login Sign in now
leads with the email link (password secondary) and uses shouldCreateUser:false so a typo can never create an account.

---

## Create-account production defect (2026-09-21, commits 3862f09 + 389ab83, deployed, Vercel Ready)

Founder found the live /login Create account button did nothing. Reproduced on real production: with an empty email
the submit button was `disabled` (dead click, no message); malformed email only showed the browser's own bubble;
server errors were raw / the project-level email limit was shown as a 60s wait. Fixed: buttons never disabled by an
empty box, `noValidate` so our inline messages always show, errors mapped to plain language (`lib/authEmailFeedback.ts`),
success copy per spec. Same email-link mechanism; password sign-in / reset / email-link sign-in unchanged. Verified on
real production signed-out (empty/invalid/valid -> otp reaches Supabase with redirect to /dashboard; success state;
real Supabase 400 -> friendly message; returning sign-in incl. real wrong-credentials 400). Multi-learner branch
`multi-learner-household` preserved, NOT merged; migration 260 NOT applied. Merge note: that branch also edits
app/login/page.tsx (moves helper exports) -> expect a small conflict when merging. Founder-only checks: real inbox
round-trip; Supabase email template subject; Auth URL Configuration allow-list for the /dashboard redirect.

---

## Family #1 onboarding correction (2026-09-21, commit `9381ed1`, deployed, Vercel Ready)

Real-family evidence: a parent could not tell how to register on `/login`, and could not see which child
the dashboards showed. Corrected (bounded, no new auth, no schema change):
- `/login` leads with two journeys: **Create account** (existing email-link flow underneath) and **Sign in**
  (password / explained email link / reset). Bare `/login` opens Create account; shell "Sign in" links use `?mode=signin`.
- Child display name is still local-only (LR-01) but now **scoped per signed-in account** (`lib/childProfile.ts`);
  the legacy device-wide name is claimed by the first permanent account and never deleted.
- Parent Dashboard shows "Viewing: <name>'s progress"; dashboard shows a first-run setup card (pathway + first name).
- **Verified architecture finding: multi-child is NOT supported.** `profiles.auth_user_id` is UNIQUE (one learner per
  account) and pathway/progress/XP are device-wide localStorage. No "Add another child" control exists by design; the UI
  states the one-child limit. Multi-child is a Founder decision requiring a schema + per-learner local-state change.

---

## Current production status

**Live** at `https://angel-11plus.vercel.app` (Vercel project `angel-11plus`, org `abs365s-projects`).
Currently deployed from commit **`c856396`** (`origin/main`) — pushed this Wave (the Full Review
Backlog fix + migration 259's own file); confirmed live in production by re-querying
`ali_family_review` and `ali_question_bank` directly against `https://agxunwcdatosrmzhhuxj.supabase.co`
this session. Migration 259 itself (a database change, not a code deploy) was applied separately by
the Founder via Supabase Dashboard, per this repo's standing Founder-applied-migration convention.

Supabase project: `agxunwcdatosrmzhhuxj` (`https://agxunwcdatosrmzhhuxj.supabase.co`) — confirmed
identical between the Vercel production build and local dev; not a project-mismatch risk.

## Current production inventory (live-verified, not from a report)

| | Count |
|---|---|
| Practice-eligible + active questions | **901** |
| — Maths | 587 |
| — English | 306 |
| — Writing | **8** (7 QT-WC-01a + 1 QT-WC-01b, "The Treehouse Lantern") |
| Distinct question families | 62 (+27 rows with no `family_id`) |
| Distinct English passages | 34 (largest concentration 7.5% — healthy) |

Publication is admin-gated (`submit_question_candidate` / `publish_question_candidate` RPCs,
`is_current_user_admin()` required) — an anon session can read but never publish.

## Closed milestones — do not reopen without genuinely new material evidence

- Controlled 405-question activation programme
- Answer-integrity incident (remediated)
- Diagram rendering incident (remediated)
- Synonym marking incident (remediated)
- Adaptive Learning Loop — production acceptance
- Mock → Educational Intelligence (EI) bridge — production acceptance
- **Complete CSSE Two-Paper Mock — production learner acceptance: GO** (the milestone that closed
  before the Educational Depth Programme began)
- Authentication / password recovery — production acceptance
- **Educational Depth Phase 1 Wave 1 (MR-01 Arithmetic Foundation) — production acceptance: GO**
  (`b65721a` on `origin/main`, deployed, smoke-verified)
- **Educational Depth Phase 1 Wave 2 (Writing picture-narrative) — production acceptance: GO**
  (migration 259 applied, `c856396` on `origin/main`, deployed and production-verified). See
  "Closed programme (most recent)" below for the full evidence chain.

## Closed programme (most recent)

**Educational Depth & Daily Preparation Programme, Phase 1, Wave 2** — Writing picture-narrative
teaching depth + Practice image-stimulus infrastructure + one new, Founder-approved original
picture-narrative Practice prompt. **CLOSED, GO.**

- **Baseline (live-verified, not from a prior report)**: all 7 `practice_eligible` Writing rows
  were QT-WC-01a (reflective/discursive); zero QT-WC-01b (picture-narrative) rows existed anywhere
  in the bank, in Practice or Mock-applied state. Zero teaching content and zero image-stimulus
  rendering capability existed in Practice.
- **What changed (code, live, `c856396` on `origin/main`)**: a new `writing-picture-narrative`
  teaching family (`lib/learningEngine/writingTeachingContent.ts`) teaching picture-evidence
  reasoning (observe → interpret → commit to one direction → structure), routed via a new,
  separate `"picture-narrative"` prompt type so no existing `narrative`/`descriptive` row's
  teaching content changed. `WritingPrompt` gained an optional `stimulus` field
  (`types/index.ts`), validated defensively and rendered in Practice's `WritingActivity` (absent on
  every pre-existing row, regression-safe by construction).
- **First candidate rejected, real target-learner evidence.** Migration 255's "The Riverboat at
  Dawn" was applied, registered for review (migration 256), and independently reviewed by the
  Founder via the live `/admin-beta/review` interface. **Decision: REJECTED.** A real Year 5 child
  preparing for the 11+ (with a private tutor) was shown the picture unprompted and said "there is
  nothing to write with the picture" — the scene was visually describable but not narratively
  generative enough (atmosphere and static objects, too little action/relationship/tension/
  discovery for a Year 5 learner to build a story from). This rejection remains preserved exactly
  as the Founder recorded it in `ali_family_review`, live-reconfirmed this Wave (`decision =
  'rejected'`, `reviewer = 'Ayobami Lawal'`, `2026-09-17T20:39:49Z`); the row itself remains
  untouched, still `authentic_assessment_candidate`.
- **Educational-quality principle established from this rejection** (recorded in
  `.claude/skills/angel-educational-quality/SKILL.md`): a picture-led narrative stimulus must not
  merely be describable — it must be **narratively generative**, giving a learner several credible
  footholds (action, relationship, discovery, tension, an unusual object, evidence something just
  happened, etc.) while staying genuinely open to more than one legitimate story.
- **Replacement authored, independently reviewed, and APPROVED.** "The Treehouse Lantern"
  (`eng-practice-writing-picturenarrative-treehouselantern-01`, family_id
  `eng-practice-writing-wc01b-treehouselantern`, migration 257) is a new, original SVG scene
  (`public/practice-assets/writing-picture-narrative/treehouselantern-v1.svg`) with multiple
  deliberate narrative footholds (a rope ladder pulled up off the ground, a lantern-lit window in
  bright daylight, a dropped bag with spilled compass/torch/note, two distinct sets of footprints, a
  watching magpie) and no text/title/speech bubble dictating a plot. The SAME real Year 5 target
  learner independently proposed her own narrative from it unprompted ("how a bird's mother taught
  it how to fly") — material evidence of narrative generativity, materially different from the
  directions considered during authoring. Registered for review (migration 258), then genuinely
  reviewed by the Founder through the live `/admin-beta/review` interface: **two real, non-UNASSIGNED
  `approved` decisions** exist in `ali_family_review` (`reviewer = 'Ayobami Lawal'`,
  `2026-09-17T21:23:22Z` and `2026-09-18T10:06:32Z`), independently re-confirmed this Wave via the
  authenticated review surface, not inferred from a chat claim.
- **Governed promotion applied.** `supabase/migrations/259_writing_picture_narrative_
  treehouselantern_promotion.sql` promotes exactly this one row from `authentic_assessment_candidate`
  to `practice_eligible`, gated on live re-verification of the real review decision above (mirroring
  migrations 200/203/224's own established pattern). Applied by the Founder via Supabase Dashboard.
  Live-reconfirmed this Wave: `eligibility_status = 'practice_eligible'`, `active = true`, correct
  family/skill, stimulus JSON intact.
- **A real, separate small defect was found and fixed in this Wave** (`c856396`): the "Full Review
  Backlog" section of `/admin-beta/review` kept showing Treehouse Lantern as unresolved even after
  its real approval was recorded, because its own exclusion check (`fetchReviewedTargetIds()`,
  `lib/adminReview.ts`) only ever queried `review_type = 'content_review'`, never the
  `mock_writing_prompt_independent_review` type this family's decision actually used. Fixed by
  adding `fetchAllOriginalReviewClosedFamilyIds()` (reuses the existing
  `ORIGINAL_CONTENT_REVIEW_TYPES` constant) and wiring it into that one section only;
  `fetchReviewedTargetIds()` itself was left untouched, since other call sites correctly depend on
  its narrower scope.
- **Production selection/readiness verification (this Wave, real imported production function, not
  a reimplementation)**: `fetchEligibleWritingPrompts()` + `isWritingPracticeReady()`
  (`lib/learningEngine/writingPracticeContent.ts`), run against live production data with a real
  client, return Treehouse Lantern (shape/stimulus surviving the real validation gate),
  correctly exclude the rejected Riverboat row and Mock's own `eng-q2-picturenarrative-oldshed`
  row, and report `isWritingPracticeReady() = true`.
- **Production asset verification**: the live SVG
  (`https://angel-11plus.vercel.app/practice-assets/writing-picture-narrative/
  treehouselantern-v1.svg`) returns HTTP 200, `image/svg+xml`, 9060 bytes, well-formed.
- **Genuine Writing Practice-start verified live**, real authenticated production account: two
  independent real sessions were started successfully via `/learning-intelligence/practice/
  continuous-writing`, each producing a genuine live Writing prompt.
- **A previously reported "Start Practice failure" was investigated and traced to a Claude/browser-
  tooling error, not an Angel defect.** The route momentarily renders two `<main>` elements around
  the session-start transition — one stale/collapsed (0×0, still `isConnected`), one real and
  visible. The verification tooling used in this Wave was reading the stale one, so a genuinely
  successful state transition (confirmed directly: the button's real `onClick` handler resolved
  with no error, and the second, visible `<main>` showed a live practice session) looked like no
  response at all. No product code was changed for this — there was nothing to fix.
- **Verification limitation, recorded accurately, not disguised**: Treehouse Lantern was not
  captured pixel-by-pixel inside a randomly-drawn live learner session. Session draws are random
  across the (now 8) practice_eligible Writing prompts; two genuine live draws did not happen to
  select it, and further random re-draws or a synthetic/placeholder submission (which would write
  false evidence into a real learner's Skills/Evidence Profile) were deliberately not attempted.
  The Founder has accepted the combined database, real-selection-function, readiness-validation,
  live-asset, automated teaching-wiring, and genuine Practice-start evidence as sufficient in place
  of that one specific live render.
- **Riverboat/Mock separation, live-reconfirmed**: Riverboat remains `authentic_assessment_candidate`
  (never promoted), its rejection unchanged in `ali_family_review`; Mock's own
  `eng-q2-picturenarrative-oldshed` remains `mock_eligible`, absent from both the eligible-row query
  and the real selection function's output. The 7 pre-existing QT-WC-01a rows remain
  `practice_eligible`, untouched.
- Tests: 4594/4601 pass this Wave; the 7 failures are byte-identical to the pre-existing baseline
  this file already discloses (`englishWave1`, `englishWave2`, `englishWave2ExposureExpansion`,
  `englishWave2PipelineVerification`, `migration237PublishAnswerPersistenceCorrection`, plus the two
  untracked Factory files under "Deferred / non-blocking issues" below) — 0 regressions. `tsc
  --noEmit` clean for every file this Wave touched. 14 new structural tests cover migration 259's
  own scope, refusal conditions, idempotency, and disclosure.

- Pushed to `origin/main` at `c542bef` (implementation) and `b65721a` (Angel Claude Operating
  System v1.0 docs). Vercel Git integration deployed both; production alias
  `angel-11plus.vercel.app` confirmed pointing at the resulting Ready deployment.
- Content: 0 new questions generated (deliberate — the gap was teaching, not volume). Added
  teaching content for 4 MR-01 families (73 existing questions, 0/73 → 73/73 worked-example
  reach) and fixed a defect where 398 of 472 covered Maths questions showed nothing after a wrong
  answer (→ 0 silent).
- Tests: 4536/4543 pass; the 7 failures are byte-identical to the pre-change baseline (measured by
  stashing the work) — 0 regressions.
- **Production acceptance evidence** (real authenticated learner, `balletman20@yahoo.com`,
  Founder-authenticated):
  - **Check 2 (direct live) — PASS**: `mr01-multistep-order-of-operations`,
    `maxGuidedRevealSteps = 1` — reveal control capped correctly at 0 of 1, final answer never
    leaked, wrong answer produced family-level + row-level remediation, Next available.
  - **Check 3 (direct live) — PASS**: `mr04-time-reverse` (non-MR-01 fallback) — wrong answer
    produced the widened family-level remediation fallback with no silence, Next available.
  - **Check 1 (combined deterministic + live equivalent-path, not a direct live hit on the exact
    target family)** — MR-01 whole-number family, `maxGuidedRevealSteps = 0`, was not drawn
    across 4 bounded real sessions (32 questions). Accepted on: the identical cap=0 code path
    observed live on other zero-real-step rows; deterministic verification of all 49 real
    whole-number rows finding 0 answer leaks. Do not report this as a direct live hit on the exact
    family.
  - **Bounded post-deploy production smoke check (this session)** — PASS: fresh session against
    `https://angel-11plus.vercel.app`, real authenticated learner session, Mathematics practice
    loaded (after one transient "timed out waiting for today's activities" retry — not reproduced
    on retry, treated as transient, not investigated further), a deliberately wrong answer
    produced a genuine per-question misconception remediation note, correct answer + worked steps,
    and Next — confirming the Wave 1 learner path is live and operating in production. This was a
    smoke check, not a repeat of the 3-check acceptance programme above.

**Do not begin Wave 2 (Writing) without this record** — see next priority below.

## Known material educational risks (from Wave 1's live-production baseline)

1. **Writing is still thin, though no longer single-shape**: 8 practice-eligible rows across 8
   one-question families — 7 QT-WC-01a (reflective/discursive) + 1 QT-WC-01b (picture-narrative,
   "The Treehouse Lantern", Wave 2 GO). One approved picture-led prompt establishes the vertical
   slice; it does not constitute mature picture-led narrative content depth. Future depth must
   introduce multiple high-quality, narratively generative, structurally varied stimuli through the
   governed Question Factory, not shallow permutations.
2. **Representation variation is nearly absent**: one representation type in 10 of the 12
   structurally-deepened Maths families. Reasoning-route and unknown-position variation are real;
   representation variation is not.
3. **26 of 38 Maths families have no structural (Question Factory) metadata**, sitting at 3–7
   questions each.
4. **27 rows carry no `family_id`** and sit outside family-based teaching entirely.
5. **591 of 900 rows have no `addresses_misconception` text.** The Wave 1 fallback now prevents
   silence, but generic category framing is weaker than real per-question guidance — the Question
   Factory should author this field going forward.
6. **Learner exposure telemetry is too thin (178 usages) to support any strong claim about content
   exhaustion**, in either direction. Don't cite memorisation risk as measured fact — it's
   evidence-based structural risk, not telemetry-confirmed.

## Approved architectural decisions (current, still valid)

- **Question Factory**: competency → family → blueprint library → controlled variants →
  deterministic correctness → structural/diversity gate → candidate store → human calibration →
  approval → publication → learner exposure → telemetry. One system — do not build a second.
- **Preparation Horizon model** (Increment 019/021): Year 4 = Foundation, Year 5 = Main, Year 6 =
  Final readiness — evidence-adjusted, never a hard ability lock. Live in the real Practice session
  generator (not just a dashboard recommendation) as of Increment 021 — Founder-approved with
  amendment, verification still awaiting Founder per that increment's own record.
- **Five-dimension Writing rubric** (Ideas / Vocabulary+Spelling / Grammar / Structure /
  Punctuation) — the only sanctioned internal marking framework; no official CSSE numeric split is
  ever to be invented.
- **Angel Learning Intelligence (ALI)** — internal engineering name only, never user-facing.

## Deferred / non-blocking issues

- Two **untracked, incomplete** Factory files break `tsc --noEmit` and `npm run build` at baseline:
  `lib/ali/questionFactory/candidateStoreMapping.ts`, `lib/ali/questionFactory/mr03CoordinateBlueprints.ts`
  (plus their test files). Pre-existing, not caused by any change recorded here — confirmed by
  stashing unrelated work and reproducing the same failures. Quarantine them (move out, build,
  move back) when you need a clean build signal; do not "fix" them without understanding why they
  were left mid-work.
- 5 other pre-existing test-file failures at the `f4f21fa` baseline (`englishWave1`,
  `englishWave2`, `englishWave2ExposureExpansion`, `englishWave2PipelineVerification`,
  `migration237PublishAnswerPersistenceCorrection`) — not caused by Wave 1, confirmed by baseline
  stash-and-measure.
- A large number of untracked `ANGEL_*.md` reports and `lib/ali/questionFactory/english*.ts` /
  `scripts/*.mjs` files sit in the working tree, uncommitted, from prior EI-003 wave sessions.
  Investigate their state (committed? abandoned? still needed?) before assuming they're either
  live or safe to delete.

## Launch context

Angel is being prepared for a **controlled beta launch**: Controlled Beta → evidence-led Soft
Launch → Public Launch. Initial controlled beta target: **10–25 real families**. **Public
commercial launch is not yet authorised.**

Active launch-readiness work: Children's privacy / DPIA, parent + learner onboarding, legal/trust,
support/operations, educational depth, production readiness. **Do not claim legal/privacy
compliance merely because documentation exists** — formal Children's Code / DPIA work is active
and not yet independently verified as complete. Treat any privacy/compliance claim as unverified
until a dedicated review says otherwise.

### LR-01 — Child data, privacy + controlled-beta readiness (2026-09-18)

**GO FOR CONTROLLED BETA. Not a full public-launch certification, not a formal legal compliance
certification.** Full evidence pack: `ANGEL_LR01_DPIA_AND_CHILDRENS_CODE_ASSESSMENT.md` (new
document — no prior DPIA artefact existed), closed this same day after the one real discrepancy it
found was corrected and the one transparency gap it found was closed — see below. It remains the
evidence pack a formal Founder/legal DPIA sign-off should be made from, not the sign-off itself.

- **Verified data inventory**: no table anywhere in the schema holds a child's DOB, home address,
  phone number, photograph, precise geolocation, or real school name. `profiles.name` is always
  the literal default `"Angel"` — the database never captures a real child's name (consistent with
  LR-02/AN-102). Real PII collected is limited to: the account email (Supabase-managed
  `auth.users`, not this app's own table), and — only if a parent voluntarily submits a beta
  application/testimonial/feedback form — `parent_name` + `email`.
- **Processor footprint is genuinely minimal**, checked against `package.json`/`.env.local`, not
  assumed: only Supabase (DB/auth), Vercel (hosting), and OpenAI (Writing AI feedback). Confirmed
  **absent**: Sentry, Stripe, Upstash, Google Analytics, PostHog, Amplitude, Mixpanel, Segment, or
  any advertising/tracking SDK. The one AI call (OpenAI, Writing feedback) sends only the prompt
  and the child's writing text — verified in code, no name/email/profile ID accompanies it.
- **RLS/ownership verified live, not assumed**: an unauthenticated anon-key request returns zero
  rows from every learner-data table checked (`profiles`, `ali_student_question_history`,
  `user_stats`, `lesson_progress`, `ali_mock_attempt`, `ali_mock_attempt_answer`,
  `beta_family_applications`, `ali_family_focus_selection`); the Founder's own authenticated
  session sees exactly its own 1 row, not other families'. No P0/P1 exposure found.
- **The parental-consent discrepancy is CORRECTED, live** (`1256305`): both `/privacy` ("Parent or
  guardian consent is required before account creation") and `/terms` ("Children must have
  parental permission") stated a safeguard with no corresponding technical gate anywhere in the
  actual sign-up flow (`/login` — no consent checkbox, no age/parent affirmation step), and without
  Article 8 being established as the actual lawful basis relied on. Both now describe the real,
  verified mechanism instead: a parent/carer sets up and controls the account using their own
  email; a child does not sign up independently. The parent-led model itself is not weakened, only
  stated more precisely — no consent checkbox was added merely to match the old wording. Whether
  Article 8 formally applies to this account-creation mechanic remains genuinely open
  (**FOUNDER/LEGAL REVIEW REQUIRED** — the ICO guidance consulted does not explicitly resolve it
  for a service shaped like Angel's) — the corrected wording does not depend on resolving it.
- **Child-accessible transparency is now LIVE** (`1256305`): a small info icon on the dashboard's
  "Angel recommends next" card (the one point the product acts on a child's own performance
  evidence) opens a plain-language, Year 4–6-appropriate explanation — reuses the existing
  `components/ui/Popover.tsx`, names no internal terminology (EI, profiling, OpenAI, API), does not
  claim data "never leaves Angel," and links through to the full `/privacy` Notice. Confirmed
  rendering correctly in production this session, including the link's `href`.
- **OpenAI retention/training position — verified against OpenAI's own published policy, account
  setting not independently confirmable from this codebase**: by default, API data is not used for
  model training, and is retained up to 30 days for abuse monitoring unless the account has Zero
  Data Retention (a separate, opt-in tier). Recorded as **OPENAI RETENTION CONFIGURATION — FOUNDER
  VERIFICATION REQUIRED** in the evidence pack, with the exact dashboard location
  (`platform.openai.com` → Settings → Organization → Data controls → Data Retention) — not falsely
  claimed as zero-retention.
- **Minor factual correction, live**: `/privacy` §8 said "session cookies for authentication" — the
  actual mechanism is `localStorage`, not a cookie. Corrected.
- **Manual beta deletion process — documented precisely, not assumed**: verified every
  `references public.profiles(id)` foreign key declared across the migration history directly.
  Several tables cascade-delete with `profiles` (`user_stats`, `lesson_progress`,
  `ali_durable_mastery`, `ali_student_adaptive_state`, `ali_family_focus_selection`); some instead
  `on delete set null` and would **survive** profile deletion with real parent PII intact unless
  separately deleted (`beta_family_applications`, `testimonials`, `feedback_submissions`); and
  `ali_mock_attempt` has no `on delete` clause at all, so deleting `profiles` directly while mock
  attempts exist would fail outright on a foreign-key violation. A real deletion request is a
  real multi-table operation, not a single click — documented in the evidence pack §10 so the
  Founder can execute it correctly. Accepted as the beta position (no self-service portal built,
  per instruction); recommended the Founder execute one real deletion end-to-end early in the beta
  to confirm the documented sequence actually works.
- **Children's Code**: standard-by-standard assessment in the evidence pack, against live-fetched
  ICO guidance. No standard assessed as materially unmet for a closed, Founder-invited beta.
- Tests: unchanged baseline (4594/4601), `tsc --noEmit` clean. Deployed `1256305`; all three
  corrections (privacy wording, terms wording, child-facing popover) reconfirmed live in production
  this session.
- **PUBLIC-LAUNCH requirements, explicitly preserved, not required for this beta**: a real
  age-assurance mechanism beyond parent-selected year group (2026 ICO enforcement has hardened
  specifically here); closing the no-login-wall residual risk once the URL is publicly
  discoverable beyond direct invitation; a self-service/single-RPC deletion path once manual
  multi-table deletion no longer scales; formal legal sign-off of the evidence pack.

### LR-02 — Parent + learner first-10-minutes journey (2026-09-18)

**GO**, with one real defect found and fixed, and one disclosed evidence gap (see below) —
not a full fresh-registration walkthrough.

- **Journey mapped and largely already works well**: `/pathways` (target-pathway setup, optional
  exam date/year group, plain-language pathway cards, clear disclaimers) is genuinely good
  first-run UX. The dashboard's "Today's Admission Mission" gives one clear primary action
  ("Start Today's Mission") with 3 concrete, plain-language reasons per item. Parent Dashboard
  (`/learning-intelligence/parent`) gives a real progress summary and one clear next action ("See
  This Week's Revision Plan"). `/login` explains what Angel is briefly ("Selective School
  Preparation") and lets anyone continue without signing in first (anonymous-first session,
  upgradeable later via magic link) — reasonable for a Founder-invited controlled beta.
- **Real defect found and fixed (`a5f004e`, deployed, live-reconfirmed)**: the dashboard's "Angel
  recommends next" card was showing the raw internal decision-audit string verbatim to families
  (e.g. `Top-priority competency "MR-02" (trigger: weak-competency-remediation).`,
  `app/dashboard/page.tsx:660`) instead of the existing, purpose-built family-facing
  `stagePrinciple()` text (`lib/learningEngine/preparationStage.ts` — "never engine terminology,"
  already used successfully on `/pathways`'s "Current focus"). One-line fix: stopped reading
  `decisionReasons` (an internal explainability trail, never written for display) for this UI
  spot. `preparationDecision.decisionReasons` itself is untouched — still available to any other
  (e.g. admin/debug) consumer.
- **Evidence gap, disclosed not manufactured**: this was verified against the Founder's own real,
  mature account (3 sessions, achievements already earned) — the true zero-session first message
  (`"Your admission journey starts here."`, confirmed in code,
  `app/dashboard/page.tsx`'s `getEncouragingMessage`) was not observed live, and a genuinely fresh
  registration (new email, new household, new learner profile) was deliberately not created this
  session, to avoid casually adding a fake family to production. If a true fresh-account
  walkthrough is wanted, the smallest safe route is the Founder creating one real test family via
  the live sign-up flow (`/login` → "Email me a secure sign-in link") and sharing what it showed.
- **Known, previously-disclosed limitation, not new**: a child's display name
  (`localStorage` key `angel_child_name`, `app/dashboard/page.tsx`) is local-only — it does not
  persist across devices or reach the database (`profiles.name` stays the literal default
  `"Angel"`). Already flagged for Founder review in the AN-102 report; DEFER, not a beta blocker —
  the product functions correctly without it.
- Tests: 4594/4601 pass (unchanged baseline, 0 regressions from this fix). `tsc --noEmit` clean.
  Deployed `a5f004e` on `origin/main`; production alias confirmed pointing at the resulting Ready
  deployment; the corrected text (`"Building the core ideas first..."`) reconfirmed live on
  `https://angel-11plus.vercel.app/dashboard`.

### LR-03 — Controlled beta operations + Family #1 readiness (2026-09-18)

**GO — ANGEL IS READY TO INVITE FAMILY #1.** Full operating document:
`ANGEL_CONTROLLED_BETA_OPERATING_PACK.md` (new — no equivalent existed). No product code changed
this pass; every requirement was met by documenting and correctly sequencing capabilities the
product already has, per this pass's own explicit instruction not to build an invitation engine,
a beta-management platform, or a CRM.

- **Existing capability inventory, confirmed live**: `/beta-family`, `/contact`, `/feedback`,
  `/report-bug`, `/feature-request`, `/testimonial`, `/privacy`, `/terms` all return HTTP 200 in
  production — checked directly, not assumed. Admin visibility into every beta-relevant table
  (`beta_family_applications`, `bug_reports`, `feedback_submissions`, `feature_requests`,
  `testimonials`) is via Supabase Dashboard → Table Editor — the same tool already used for every
  migration in this project; deliberately no new in-app admin page was built for this.
- **Invitation process**: Founder sends a direct message (email/WhatsApp, no new tooling) with the
  production URL and one line of context; the parent uses the existing `/login` magic-link flow
  (or the child can start anonymously first) — both real, working paths per LR-02. Documented in
  full in the Operating Pack §4.
- **Activation defined precisely, not as "account created"**: a family is activated when the
  learner's preparation stage moves out of `insufficient_evidence`
  (`derivePreparationStage()`, `lib/learningEngine/preparationStage.ts`) — the exact, already-live
  signal that flips the dashboard's "Angel recommends next" card from the generic "not enough
  practice yet" message to a real, specific recommendation. Founder-observable without new tooling
  (Operating Pack §5).
- **8-measure beta scorecard** (access, activation, return, educational function, parent
  understanding, reliability, support burden, safety/privacy) — each marked INITIAL OPERATING
  SIGNAL vs VALIDATED BENCHMARK, explicitly not pretending statistical significance at 10–25
  families (Operating Pack §6).
- **Parent feedback**: reuses `/feedback` directly; 6 questions the Founder sends once a family has
  activated. **Learner feedback**: deliberately a short spoken conversation (6 child-appropriate
  questions), not a new written form — avoids collecting a child's own written text into a new
  table purely for this beta, and avoids a research-questionnaire feel (Operating Pack §7).
- **Support/issue routing mapped onto TECHNICAL / EDUCATIONAL CONTENT / EDUCATIONAL RECOMMENDATION
  / ACCOUNT-ACCESS / PRIVACY-DATA / OTHER** using existing routes. One genuine, bounded gap
  disclosed, not fixed: `/feedback`/`/report-bug` have no dedicated recommendation/privacy
  category yet — BETA IMPORTANT, not a blocker, since Founder-read free text is adequate triage at
  this scale (Operating Pack §8).
- **P0–P3 severity model** and a specific **educational-incident procedure** that protects
  historical learner evidence — a report like "this question is wrong" is explicitly routed
  through this repo's existing governed content-review mechanism (Question Factory /
  `/admin-beta/review`), never a same-session silent content edit, and a past attempt's own
  recorded evidence is never rewritten after a fix (Operating Pack §9–§10).
- **Privacy/deletion turned into a concrete, ordered Founder procedure**, built directly on LR-01's
  verified multi-table foreign-key findings — not redesigned, made executable (Operating Pack
  §11). OpenAI account-level retention setting remains **FOUNDER VERIFICATION REQUIRED** (LR-01,
  unchanged, does not block this closure).
- **Light Founder cadence and a 3-wave cohort ramp** (1 family → 2–5 → remaining up to 25), gated
  on no open P0/P1 rather than a fixed calendar (Operating Pack §2, §13).

**2026-09-18 UPDATE — two real Family #1 pre-launch defects found via genuine Founder production
use, and CORRECTED, `ab6cfda` on `origin/main`, deployed and reconfirmed live:**

- **Defect A (anonymous entry undermining the parent-led onboarding path) — FIXED.** `/login`'s
  own "Continue without signing in" button sat directly beside the sign-in form. Investigated
  first: anonymous sessions are real, persistent (same `profiles`/`ali_student_question_history`
  tables), and genuinely upgradeable to a permanent account via `claim_legacy_profile()`
  (device-keyed, migration 019) the moment a parent signs in on the same device — sound,
  deliberate architecture, left completely untouched. Removed only the one explicit skip button
  on `/login` itself. The Operating Pack's own invitation instructions (§4) corrected to link
  invited families to `/login` specifically, not the bare domain (which still redirects straight
  to an anonymous dashboard — root-level routing was not touched, since preserving that capability
  for a future public trial/demo is appropriate; only the beta invitation's own entry point moved).
- **Defect B (misleading placement-diagnostic feedback), the priority defect — FIXED.** The
  Increment 021 Placement diagnostic (`app/learning-intelligence/placement/page.tsx`) showed
  "That's alright, this helps Angel just as much either way" after an incorrect answer — read
  exactly like "wrong answers don't matter," contradicting the intro screen's own honest framing.
  Confirmed first that this surface genuinely is an intentional, Mathematics-only, deterministically
  -marked diagnostic (not Practice) that must not reveal answers/hints across its 6
  one-per-competency questions — the *design* was correct, only the wording was wrong. Corrected
  to "Not quite — and that's completely fine. This is exactly the kind of thing Angel uses to work
  out where to help you first." — honestly signals the outcome without revealing the answer,
  preserving diagnostic validity. Confirmed this exact string existed only on this one surface, not
  shared with the separate, already-verified-correct Practice remediation system.
- **Both example questions independently re-verified against live production data — no content
  defect found.** "A baking recipe starts at 15:40…" (`mr04-time-05`): canonical answer `17:30`,
  matching the Founder's own reasoning exactly. "Point D was translated 4 units left and 7 units
  down to end up at (1, -10)…" (a live Question-Factory-generated row,
  `qf-factory-candidate-mr03-coordinate-8933871035696954`): canonical answer `(5, -3)`, also exact.
  Both submitted answers (`98766`, `19`) were correctly marked incorrect — `checkMathsAnswer()`'s
  existing text-equality fallback correctly rejects a non-matching answer with no format-validation
  gap; no new validation was added.
- Tests: 4595/4602 pass (net +1: one outdated test assertion replaced with two reflecting the
  corrected behaviour), the 7 failures byte-identical to the pre-existing baseline — 0 regressions.
  `tsc --noEmit` clean. Both fixes reconfirmed live in production this session (the login page no
  longer shows the skip button; a real, bounded placement-diagnostic submission on the Founder's
  own account rendered the corrected feedback text exactly).
- **No further FAMILY #1 BLOCKER remains.**

**Superseded**: migration 255 (the riverboat candidate) was applied, reviewed, and REJECTED by the
Founder — do not apply it as a promotion target; its rejection stands as governance evidence.
Migrations 257/258/259 (the replacement, its review registration, and its governed promotion) are
all applied — Wave 2 is CLOSED; do not reopen it or re-review Treehouse Lantern without genuinely
new material evidence.

**Next educational Wave**: Writing picture-narrative still has only ONE Practice prompt (Treehouse
Lantern) — genuine family depth (structural/representation variation across several picture
stimuli, not just one) is the next material gap, following the same Family Depth Standard Wave 1
established for Maths. Do not generate volume for its own sake; check what teaching gap remains
first, and author any new stimulus through the governed Question Factory / independent-review
mechanism this Wave used, never a shallow permutation of the existing scene.

**2026-09-22 — Experience Gap Audit (`ANGEL_11PLUS_EXPERIENCE_GAP_AUDIT_V1.md`), Increment 1
(`ANGEL_11PLUS_INCREMENT1_PUBLIC_EXPERIENCE_REPORT.md`), and its Release Readiness follow-up
(`ANGEL_11PLUS_INCREMENT1_RELEASE_READINESS_REPORT.md`). STATUS: TECHNICAL RELEASE GO, VISUAL
FOUNDER ACCEPTANCE PENDING. Committed (`060663f`, `3a28115`), pushed to `origin/main`, and
deployed to the existing Vercel production environment (`https://angel-11plus.vercel.app`).
`angel11plus.com` itself remains disconnected, exactly as instructed.**

**Correction to the same-day entry below**: the original PARTIAL verdict treated a local `next
build` typecheck failure as a real, deploy-blocking defect. It was not. Root-cause diagnosis
(git history, `git grep`, a genuinely clean `git worktree` checkout) proved the untracked
`lib/ali/questionFactory/*` files responsible were deliberately `git rm --cached` in an earlier,
unrelated session (`810208b`, 2026-09-08, per explicit Founder instruction) specifically because
committing them broke the Vercel build — they were never part of `main`, so Vercel never saw them.
A clean-checkout build from `HEAD` passes genuinely (no bypass), with typecheck, the full test
suite (4,736/4,737, 0 failures), and migration-sql-guard all clean; the pre-existing ESLint/copy-guard
baselines (114 problems / 51 violations) are confirmed byte-identical before and after Increment 1
— zero new issues. See the Release Readiness report for full evidence. Do not re-open this as a
live blocker without genuinely new evidence.

- The audit found the platform's product architecture stronger than assumed, and four material
  gaps: no public first-impression page existed at all (`/` unconditionally redirected to
  `/dashboard`); an undisclosed split between the CSSE and non-CSSE learner experiences, most
  visible in a non-CSSE Parent Dashboard that reads as a generic template; two real, built English
  lessons unreachable from any navigation; and six live Zero-Purple violations, two inside the
  CSSE Mock Report/Mock card themselves.
- Increment 1 built a real public homepage at `/` (isolated `components/public/*` shell, not the
  authenticated app's `Navigation`/`Header`), canonical-domain readiness for `angel11plus.com`
  (`lib/siteUrl.ts`), and `app/robots.ts`/`app/sitemap.ts` (this product had neither before). The
  Zero-Purple violations and the two unreachable lessons were deliberately NOT touched (recorded
  as Increment 2 inputs); Today/Learn/Practice/Mock Centre/Parent Dashboard were NOT redesigned.
- Tests (clean-checkout, see correction above): 4,736/4,737 pass, 0 failures. The local
  working-directory `next build` failure this entry originally reported was traced to the
  untracked files above and does **not** occur on `main` — see the correction note above this
  entry.
- Same-day `angel11plus.com` unreachability finding still stands as reported (DNS resolution
  failure from this environment, consistent with the domain simply not being connected yet, not
  confirmed as an outage) — irrelevant now that verification moved to the actual deployed Vercel
  URL instead, where the homepage was directly confirmed live and working.
- TECHNICAL RELEASE STATUS: GO (Release Readiness report). VISUAL FOUNDER ACCEPTANCE: PENDING —
  the Founder should view `https://angel-11plus.vercel.app` directly before any `angel11plus.com`
  cutover decision.
- **Do not reopen** the CSSE/non-CSSE split, the two unreachable lessons, or the Zero-Purple
  inventory without a scoped Increment 2 — all three are recorded, not solved, by design.

**2026-09-22 (same day) — Increment 1A, Public Homepage Visual Refinement + Brand Foundation v1.0
(`ANGEL_11PLUS_INCREMENT1A_VISUAL_REFINEMENT_REPORT.md`). TECHNICAL STATUS GO, BRAND FOUNDATION
IMPLEMENTATION GO, VISUAL FOUNDER ACCEPTANCE PENDING. Commit `e2a64cb`, pushed, deployed to
`https://angel-11plus.vercel.app`:**

- Founder visual review of the Increment 1 homepage found it too close to a generic icon-card
  SaaS pattern. This increment introduces the Angel Brand Foundation v1.0 (`--angel-*` tokens,
  `app/globals.css`, scoped to `components/public/*` only) and rebuilds the homepage content
  around it: the six Learn/Practise/Check/Review/Mock/Improve cards become one connected numbered
  progression; the subjects/trust sections lose their icon-in-circle cards for plain editorial
  typography; two new, explicitly-labelled illustrative sections ("A clear plan for today," "Going
  well / Needs attention / Coming next") were added, both disclosing they are not real learner
  data; the wordmark moved to Academic Navy.
- WCAG contrast verified by direct relative-luminance calculation for every colour pairing used;
  Warm Gold fails 4.5:1 against both backgrounds and is restricted to decorative, non-text accents
  only (documented in the token block itself), not used as text anywhere.
- A real `next dev` (Turbopack) CSS/HMR artifact was found and root-caused during this increment:
  newly-introduced `md:` utility classes intermittently failed to apply live after hot-reloads.
  Confirmed dev-only (not a real defect) by a genuine `next build && next start` locally, then
  reconfirmed on the actual Vercel deployment — every utility applies correctly in production.
- Clean-checkout gate: typecheck 0 errors, tests 4,736/4,737 (0 failures, matching baseline),
  migration-sql-guard PASS, ESLint/copy-guard baselines (114/51) confirmed byte-identical
  before/after, genuine `next build` PASS (no bypass).
- Live production verification: hero, preparation journey, product story, personalisation,
  subjects, parent story, Mock section, and CTA/footer all confirmed via real screenshots and a
  full page-text capture; zero console errors; no purple, no AI/dev terminology anywhere on the
  new page; the existing authenticated dashboard was confirmed still fully reachable and
  unaffected.
- **Not verified this pass**: a genuine ~390px mobile screenshot (same `resize_window` tooling
  limitation as before) and a dedicated tablet-width check — neither blocks the technical GO;
  recommended as a quick follow-up before or shortly after Founder visual review.
- `angel11plus.com`, Cloudflare, SMTP and Supabase Auth configuration were not touched.

**2026-09-22 (same day) — Increment 1B, Final Public Homepage Visual Finish
(`ANGEL_11PLUS_INCREMENT1B_FINAL_VISUAL_FINISH_REPORT.md`). TECHNICAL STATUS GO, EDITORIAL VISUAL
FINISH GO, PHOTOGRAPHY PENDING FOUNDER ASSET APPROVAL, FINAL VISUAL FOUNDER ACCEPTANCE PENDING.
Commit `c2e88b0`, pushed, deployed to `https://angel-11plus.vercel.app`:**

- Founder review of the real Increment 1A production screenshots accepted the structure, content
  and Brand Foundation, and asked for narrower visual finishing only: preparation-journey
  legibility, hero scale, editorial composition, and whitespace (the parent section specifically).
  No section added/removed/reordered, no card/icon system reintroduced.
- Preparation journey: 6 narrow single-row columns → 3-wide/2-row grid (each step roughly doubles
  in width), bigger numerals/titles, shortened copy, and the connecting rule now uses Warm Gold as
  a restrained, purely decorative "journey connector."
- Parent section: the illustrative example and the real benefit list were stacked, leaving the
  desktop canvas under-filled — now paired side by side at larger scale, the Founder's main
  whitespace complaint.
- Hero: heading enlarged, the image slot's `max-w-sm` cap removed so it fills its column;
  `StudyIllustration.tsx` now documents and implements the full photography-ready spec (desktop/
  tablet/mobile container sizes, object-fit/object-position, a real mobile 4:3 crop override) so a
  licensed photograph can replace it with a one-line change, never a restructure.
- Responsive verification used a genuine, legitimate method (a same-origin iframe sized to the
  exact target CSS width, confirmed via `iframe.contentWindow.innerWidth`) after `resize_window`
  again failed to change the real viewport in this environment — real desktop/tablet/mobile
  evidence was captured against the actual deployed production URL, not simulated.
- Clean-checkout gate: typecheck 0 errors, tests 4,736/4,737 (matches baseline), migration-sql-guard
  PASS, lint/copy-guard baselines unchanged, genuine `next build` PASS.
- `angel11plus.com`, Cloudflare, SMTP and Supabase Auth configuration were not touched. Photography
  sourcing was not begun as a separate programme, per instruction.

**2026-09-22 (same day) — Homepage Final Image + Footer Completion
(`ANGEL_11PLUS_HOMEPAGE_IMAGE_FOOTER_COMPLETION_REPORT.md`). TECHNICAL STATUS GO, HERO IMAGE
INTEGRATION GO, FOOTER GO, FINAL VISUAL FOUNDER ACCEPTANCE PENDING FOUNDER REVIEW. Commit `56762c1`,
pushed, deployed to `https://angel-11plus.vercel.app`:**

- The Founder supplied the approved hero photograph (`public/images/hero-preparation.png`, copied
  byte-for-byte, unaltered). It is 1536x1024 (3:2 landscape), a single image containing two
  photographs side by side — not the single-subject portrait Increment 1B's documented 4:5 spec
  assumed. Forcing that portrait crop onto a 3:2 source would cut through the boundary between the
  two photos, violating the governing instruction's own "do not crop faces/heads/activity" rule, so
  the hero image container's aspect ratio was set to match the source (`aspect-[3/2]`) instead —
  a disclosed, necessary deviation, not a silent one. `components/public/StudyIllustration.tsx` (the
  temporary SVG) was removed outright; `components/public/HeroPhoto.tsx` replaces it, served via
  `next/image`.
- Footer corrected to a two-row composition (wordmark+descriptor/nav links, divider, independence
  statement/copyright) on the same content grid as the rest of the page — presentation/alignment
  only, legal wording unchanged.
- No other homepage change: structure, copy, Brand Foundation, preparation journey, Today's Plan,
  personalisation, subjects, parent section, Mock section and CTA are all untouched.
- Clean-checkout gate: typecheck 0 errors, tests 4,736/4,737 (matches baseline), migration-sql-guard
  PASS, lint/copy-guard baselines unchanged, genuine `next build` PASS (no layout-shift risk, `/`
  still statically prerendered with `next/image` in the hero).
- Real production evidence captured (not DOM text) at desktop, genuine tablet (998px) and genuine
  mobile (390px) widths, all against `https://angel-11plus.vercel.app` directly.
- `angel11plus.com`, Cloudflare, SMTP and Supabase Auth were not touched.

**2026-09-22 (same day) — Hero Background + Footer Simplification
(`ANGEL_11PLUS_HERO_BACKGROUND_FOOTER_SIMPLIFICATION_REPORT.md`). TECHNICAL STATUS GO, HERO VISUAL
FINISH GO, FOOTER GO, FINAL HOMEPAGE FOUNDER ACCEPTANCE PENDING FOUNDER REVIEW. Commit `a6a6b75`,
pushed, deployed to `https://angel-11plus.vercel.app`:**

- Founder review: the hero's plain white background read as too empty/clinical. Added a warm ivory
  base plus two large, heavily blurred, low-opacity decorative shapes (`--angel-gold` at 8% opacity
  lower-left, `--angel-sky` at 60% opacity upper-right) — both already-existing Brand Foundation
  tokens, no new colour, no gradient, no image, no animation. Shapes are `aria-hidden`,
  `pointer-events-none`, sit behind the content (content explicitly `relative z-10`), clipped by
  `overflow-hidden`. Structure, copy, CTAs, the approved photograph and responsive behaviour
  unchanged.
- Footer: "Sign in" removed from the footer nav per Founder decision (redundant with the header's own
  Sign in, which is untouched). Footer nav is now Privacy / Terms / Contact and support only.
- Clean-checkout gate: typecheck 0 errors, tests 4,736/4,737 (matches baseline), migration-sql-guard
  PASS, lint/copy-guard baselines unchanged, genuine `next build` PASS.
- Real production evidence captured (not DOM text) at desktop, genuine tablet (900px) and genuine
  mobile (390px) widths, all against `https://angel-11plus.vercel.app` directly.
- `angel11plus.com`, Cloudflare, SMTP and Supabase Auth were not touched.

**2026-09-22 (same day) — App Icon / Favicon Brand Correction
(`ANGEL_11PLUS_APP_ICON_BRAND_CORRECTION_REPORT.md`). ANGEL 11+ APP ICON BRAND CORRECTION: GO. Commit
`72ab3ec`, pushed, deployed. Verified live on the now-connected permanent domain,
`https://www.angel11plus.com/`:**

- Root cause: `app/favicon.ico` was the literal, unreplaced default Next.js/Vercel scaffold icon
  (black circle, white triangle), dated to the project's original scaffolding — never swapped in any
  prior branding pass. `app/layout.tsx`'s icon metadata already correctly pointed at `/favicon.ico`;
  this was purely a file-content problem, not a wiring problem.
- Fix: regenerated `app/favicon.ico` as a proper multi-resolution ICO (16/32/48/64/256px) from the
  already-correct Angel "A" mark (`public/icon-192.png`/`icon-512.png`), so the whole icon system is
  now one consistent mark rather than two different ones. Verified legible at true 16px scale.
- `public/sw.js` `CACHE_VER` bumped v3 to v4, since the fetch handler serves `/favicon.ico`
  cache-first from `STATIC_CACHE` once fetched once — without the bump, returning visitors' installed
  service workers would keep serving the old cached icon indefinitely.
- Verified by fetching `https://www.angel11plus.com/favicon.ico` directly (not through a browser) and
  decoding it: confirmed the new mark, `Last-Modified` matching the deployment timestamp exactly (not
  a stale edge cache). `angel11plus.com` is genuinely connected and reachable now, confirmed directly.
- No homepage, layout, hero, photograph, colours, typography, navigation, footer, copy, or
  authenticated-app change. Disclosed, non-fixable-from-here caveat: individual browsers'/messaging
  apps' own favicon caching may still show the old icon to some returning visitors/previously-shared
  links until their own cache expires — not a server-side defect, confirmed by the direct fetch above.

**2026-09-23 — Family Account & Entry Experience Correction
(`ANGEL_11PLUS_FAMILY_ACCOUNT_ENTRY_ACCEPTANCE_REPORT.md`). ANGEL 11+ FAMILY ACCOUNT & ENTRY
EXPERIENCE: PARTIAL. Commit `a13a48f`, pushed, deployed, confirmed live on
`https://www.angel11plus.com`:**

- Part A root cause: `AuthProvider.updatePassword()` called Supabase's `updateUser()` but never
  `signOut()` afterward, so the genuine recovery session established by the emailed link silently
  continued on as the ongoing authenticated session — the parent landed straight in the account
  instead of being asked to sign in with the new password. Fixed at the source (`updatePassword()`
  now signs out + clears learner context on success, so every caller gets the guarantee).
  `app/reset-password/page.tsx`'s success screen now says the parent has been signed out and routes
  to `/login?mode=signin` (was `/dashboard`). A test that had encoded the old buggy destination as
  "expected" was corrected to require the fix and forbid regressing to it.
- Part B: Header's account-menu popover was icon-only with no "Parent Account" label and duplicated
  the adjacent LearnerSwitcher's "Viewing: {child}" inside its own Parent Dashboard link. Added an
  explicit "Parent Account" label, removed the duplicated subtitle. LearnerSwitcher,
  LearnerIdentityBanner and ParentSetupCard were audited and already satisfy the parent/learner
  hierarchy requirement — left unchanged.
- Part C: verified current authoritative facts for GL/CSSE/CEM/ISEB by web research. CSSE and ISEB
  descriptions now spell out the consortium/board name in plain English. **Material finding**: CEM
  has withdrawn from the standard paper-based grammar-school 11+ market and is no longer administered
  by Durham University (acquired by Cambridge University Press & Assessment, 2019); the prior
  "Birmingham, Kent, Bucks" claim was stale (Kent confirmed GL, not CEM). `lib/pathways.ts`'s CEM
  entry rewritten to state this honestly and direct families to confirm with their target school;
  badge changed to "Check With School". The existing "Not Sure Yet" pathway (already in
  `lib/pathways.ts`, already selectable on `/pathways`, deliberately excluded from
  `REAL_PATHWAY_IDS`) already serves as the safe "not sure" route — confirmed working, nothing new
  built.
- Part D: audited the first-entry journey (`/login` → `/dashboard`, `ParentSetupCard`'s
  name-or-pathway-missing gating, `/add-child`) — already short, non-wizard, and does not re-prompt
  an already-set-up single-learner family. No change made.
- Clean-checkout gate: typecheck 0 errors, tests 4,737/4,738 (baseline 4,736/4,737 plus this
  increment's own new regression test), migration-sql-guard PASS, copy-guard 51 violations and eslint
  114 problems both unchanged from baseline, genuine `next build` PASS.
- Production evidence: fetched the live JS bundles for `/pathways` and `/reset-password` directly (not
  through a browser) and confirmed the new CSSE/CEM/reset-password/Header copy is genuinely deployed.
  This session's browser tab, previously assumed authenticated from a prior increment's carryover, was
  found unauthenticated (screenshotted the public access gate) — per AGENTS.md, no account was created
  and no password was entered. PARTIAL rather than GO because the real email-based password-reset
  round trip and the fully-authenticated re-render of the Parent Account/learner-hierarchy surfaces
  still require the Founder's own hands-on production pass (items 1-4, 7 and the live-rendered check
  of 8-11 of the report's 13-point checklist) — everything reachable without a real inbox or a real
  login was verified directly.
- Per the governing instruction, this increment stops here — no wider authenticated-experience
  redesign or "Increment 2" was started.

**2026-09-23 (same day) — Private Learner Space & Family Access Model
(`ANGEL_11PLUS_PRIVATE_LEARNER_SPACE_ACCEPTANCE_REPORT.md`,
`ANGEL_11PLUS_PRIVATE_LEARNER_SPACE_DECISION_RECORD.md`). ANGEL 11+ PRIVATE LEARNER SPACE: PARTIAL.
Commit `fc0e45f`, pushed, deployed, confirmed live on `https://www.angel11plus.com`. Founder note:
**password recovery is now CLOSED by real Founder production acceptance — do not reopen without new
regression evidence.**

- Current-state finding: every learner under one parent shares the parent's own Supabase JWT (no
  separate credential per child) — `current_learner_id()` (migration 260) validates account
  ownership, not "which family member is holding the device," so true DB-level cryptographic
  sibling isolation is architecturally bounded without either separate per-learner identities
  (explicitly forbidden) or a Supabase Auth Custom Access Token Hook (assessed as disproportionate
  auth-pipeline risk this session, right after this same project closed a real auth incident).
  Decision record written before implementation, with alternatives honestly rejected on the record.
- Selected model: Parent Mode / Learner Mode (`lib/householdMode.ts`, mirrors
  `lib/learnerContext.ts`'s own account-scoped pointer pattern, default always Parent Mode), plus
  two real server-enforced pieces: (1) `PARENT_ONLY_PATH_PREFIXES`/`isParentOnlyRoute()`
  (`/add-child`, `/pathways`, `/learning-intelligence/parent`) blocked in `RegisteredAccountGate`
  regardless of how they're reached; (2) migration 262's Parent PIN (salted `sha256()`, core
  Postgres, not pgcrypto — this repo's PGlite test harness has no pgcrypto compiled in, confirmed
  directly rather than assumed; rate-limited 5 attempts / 5 min lockout, never readable by any
  client role) gating the one controlled route back from Learner Mode to Parent Mode.
- Real defect found and closed while inspecting the architecture: `lib/learnerContext.ts`'s
  pre-existing `fetchLearners()` fetched every sibling's id/name on every request regardless of
  mode; now narrowed to the pinned learner's own row while in Learner Mode, verified by a new test
  against a fake backend mirroring PostgREST's own `id=eq.<x>` filtering.
- Header/Navigation: sibling switcher, pathway switcher, Parent Dashboard links and School
  Intelligence nav entry removed entirely (not hidden) in Learner Mode. Dashboard pathway line reads
  "Your preparation: X" instead of a pathway-configuration link in Learner Mode (Part 5).
  LearnerIdentityBanner: "Enter learner space" per learner, requires a Parent PIN to exist first.
- Honestly disclosed, not closed: a technically sophisticated user with dev-tools access to their
  own account's already-valid JWT can still hand-craft a request for sibling data — this is a real
  architectural boundary of the shared-JWT/no-separate-child-account model, not a gap this increment
  silently missed.
- Clean-checkout gate: typecheck 0 errors, tests 4,760/4,761 (includes migration 262's own 10 tests
  run against a real Postgres engine, PGlite, the same harness migration 260 uses), migration-sql-guard
  PASS (258 files), copy-guard 51 violations and eslint 114 problems both unchanged from baseline,
  genuine `next build` PASS.
- Production evidence: fetched the live JS bundles directly (not through a browser) and confirmed
  the new copy ("Return to Parent Mode", "learner space", "Ask a parent or carer", "Your
  preparation:") is genuinely deployed; all affected routes return HTTP 200; browser screenshot
  confirms no regression to the public access gate.
- PARTIAL rather than GO: **migration 262 is NOT YET APPLIED** (Founder-applied convention, per
  every prior migration in this project) — "Enter learner space" is live in the UI but inert
  (fails with a plain error, no crash or data exposure) until applied. The instruction's own
  required two-real-learner acceptance walkthrough also could not be performed this session (no
  authenticated session available; per this project's standing rule, none was created) and is the
  Founder's next step.
- Per the governing instruction, this increment stops here — no wider authenticated-experience
  redesign was started.

**2026-09-23 (same day) — Private Learner Space Entry: Production Finding, fixed. Commit `9c73cce`,
pushed, deployed, confirmed live on `https://www.angel11plus.com`. Migration 262 confirmed applied by
the Founder (not rerun). Not marked GO — the Founder still needs to perform the real Plantest1/
Plantest2 isolation acceptance now that the entry control is reachable:**

- Root cause (confirmed by direct code inspection, matching the governing instruction's own
  candidate #1 exactly): "Enter learner space" existed only inside `LearnerIdentityBanner`, rendered
  solely on the separate Parent Dashboard page (`/learning-intelligence/parent`) — never on the main
  Today page or in the always-visible Header/Navigation shell the Founder's screenshot showed. Not a
  detection/deployment/environment problem — the control genuinely didn't exist anywhere reachable
  from Today.
- Smallest correction: the same, already-built `enterLearnerSpace()`/PIN-gate flow is now also
  reachable from Header's account menu (the small avatar icon, top right, visible on every page) as
  its first, distinctly-styled item, "Enter {name}'s space". Self-contained state in `Header.tsx`
  rather than a shared hook, so `LearnerIdentityBanner` and the rest of the architecture are
  untouched. No architecture change, no migration change.
- Clean-checkout gate: typecheck 0 errors, tests 4,761/4,762 (baseline plus one new structural test),
  migration-sql-guard PASS, copy-guard/eslint unchanged from baseline, genuine `next build` PASS.
- Production evidence: fetched the live JS bundle referenced by `/dashboard` directly and confirmed
  the new "Enter {name}'s space" text is genuinely deployed.
- Founder next step: sign in, open the account menu from Today, confirm "Enter Plantest1's space" is
  visible and reachable, then perform the real two-learner isolation acceptance.

**2026-09-23 (same day) — Learner Entry Authentication + Product Identity Standard. Commit `2ecd9cf`,
pushed, deployed, confirmed live on `https://www.angel11plus.com`. Migration 262 confirmed applied
(not rerun); migration 263 NOT YET APPLIED. Not GO — Founder cross-learner PIN acceptance still
required:**

- Founder production testing confirmed the Parent Mode/Learner Mode/Parent PIN architecture genuinely
  works (Plantest1 entering, Plantest2 fully hidden and vice versa, sibling switcher/Parent Dashboard/
  pathway controls all absent in Learner Mode, Parent PIN correctly gating the return trip) — not
  retested or redesigned. Two material findings remained: (1) family environment -> a *specific*
  learner's space had no credential at all (the Founder could enter Plantest2 supplying nothing of
  Plantest2's own); (2) the authenticated app's visual identity is fragmented from the approved
  homepage, formally recorded as a product-wide requirement.
- Fix for (1): migration 263 adds a per-learner PIN (`learner_access`, salted `sha256()`, same
  core-Postgres-no-pgcrypto finding as migration 262) plus `learner_pin_sessions` (opaque tokens
  minted only by a correct PIN). `current_learner_id()` is redefined (not replaced) to require a
  matching token once a learner has a PIN configured — every one of the ~38 functions migration 260
  already routes through it is protected, with no other function touched. **16 new tests, run against
  a real Postgres engine (PGlite), reproduce and prove fixed the exact production scenario**: a token
  verified for Plantest1 never satisfies a request naming Plantest2, rate limiting is per-learner not
  per-account, resetting a PIN invalidates every existing session. Honestly disclosed, not closed: a
  raw REST query naming a sibling's `profile_id` directly still bypasses `current_learner_id()`
  entirely, since every evidence table's own RLS is still account-scoped only (migration 260's
  original design) — closing that fully means rewriting ~30 tables' RLS, explicitly out of this
  increment's "smallest safe extension" scope.
- Fix for (2): `ANGEL_11PLUS_PRODUCT_DESIGN_STANDARD_V1.md` created, derived directly from the
  approved homepage's own Brand Foundation tokens and `components/ui/Button.tsx` — nothing invented.
  Applied only to this increment's own new surfaces (`LearnerPinModal`, the Header/
  LearnerIdentityBanner additions), per the governing instruction's explicit scope limit. The full
  authenticated-surface migration (Parent Dashboard, Today, Learn, Practise, Mock, Progress, Results)
  is recorded as the next, not-yet-started increment.
- Clean-checkout gate: typecheck 0 errors, tests 4,783/4,784 (baseline plus 25 new/updated tests),
  migration-sql-guard PASS (259 files), copy-guard/eslint unchanged from baseline, genuine
  `next build` PASS.
- Production evidence: fetched the live JS bundles referenced by `/dashboard` directly and confirmed
  both the new Learner PIN copy and the new `x-angel-learner-token` header mechanism are genuinely
  deployed.
- Founder next step: apply migration 263 (do not rerun 260/261/262), then perform the real Plantest1/
  Plantest2 cross-PIN acceptance walkthrough (governing instruction Part 16) before Private Learner
  Space is called GO.

**2026-09-23 (same day) — Private Learner Space: FINAL FOUNDER PRODUCTION ACCEPTANCE. Documentation
only, no code change, no redeployment. Migration 263 confirmed applied by the Founder (not rerun; 260/
261/262 also untouched).**

- Real Founder production testing (not an automated result): Learner PIN creation for Plantest1 and
  Plantest2 both PASS; an incorrect PIN is rejected with the exact production message "That PIN
  doesn't match. Please try again."; cross-learner PIN isolation tested in both real directions in
  production — Plantest1's PIN against Plantest2 REJECTED, Plantest2's PIN against Plantest1
  REJECTED, each learner's own correct PIN PASS; learner environment isolation reconfirmed (sibling/
  Parent Dashboard/pathway controls absent in each Learner Mode, Today/Learn/Practise/Mock/Progress
  retained); Parent PIN protection reconfirmed (Return to Parent Mode requires it, wrong PIN
  rejected, correct PIN restores Parent Mode) — Parent PIN and Learner PIN confirmed operating as two
  distinct controls in live use, not merely in code.
- **ANGEL 11+ PRIVATE LEARNER SPACE MILESTONE: CLOSED, GO.** Do not reopen absent a genuine new
  production defect. Do not rerun migrations 260-263.
- **Security-hardening debt formally recorded, not closed by this GO**: `LEARNER DATA RLS HARDENING`
  — some evidence-table RLS remains account-scoped from the migration 260 architecture; a raw REST
  request naming a sibling `profile_id` directly may bypass `current_learner_id()` where a table's
  own RLS doesn't separately enforce learner-level ownership. Required before broader/public launch
  security sign-off. Not started, not scoped. Next step is a bounded adversarial assessment ("can an
  ordinary authenticated learner/browser, using realistically available production-client
  capabilities, retrieve or mutate a sibling's data outside the intended app flows?"), not a ~30-table
  RLS rewrite — the assessment determines scope, not assumed in advance.
- `ANGEL_11PLUS_PRODUCT_DESIGN_STANDARD_V1.md` reconfirmed as the governing visual standard, derived
  from the approved/frozen homepage; the authenticated app does not yet consistently meet it. Next
  major experience increment, **recorded, not started**: **ANGEL 11+ AUTHENTICATED EXPERIENCE &
  DESIGN SYSTEM MIGRATION** (Parent Dashboard, Today, Learn, Practise, Mock, Progress, Results —
  preserve educational engines, learner isolation, Parent/Learner Mode; remove legacy/generic SaaS
  visual language; zero-purple/no-gradient; do not disguise educational-content gaps with redesign).

**2026-09-23 (same day) — Authenticated Experience & Design System Migration, Increment 1 (Today +
Learn). Commit `bbac365`, pushed, deployed, confirmed live on `https://www.angel11plus.com`. Private
Learner Space untouched (still CLOSED, GO). IMPLEMENTED/TESTED/DEPLOYED/PRODUCTION-VERIFIED as far as
available access permits — Founder visual/experience acceptance still required:**

- Presentation-layer only: `app/dashboard/page.tsx`'s entire data-fetching effect (every real engine
  call — analytics, adaptive state, gamification, parent report, the CSSE preparation-decision block)
  is byte-identical to before; only composition and colour changed.
- **Real content gap found and fixed, not just stale copy**: `lib/learningEngine/
  fullLessonRegistry.ts` lists 5 real lessons (3 Mathematics + 2 English Reading, RC-01/RC-02), but
  the Learn hub only ever showed the 3 Mathematics ones — found by reading the actual registry rather
  than trusting the Founder's own (now-stale) screenshot. Both real English lessons now appear,
  grouped by subject.
- The internal-development-process copy ("Angel's CSSE Learn experience is being rebuilt one real
  lesson at a time...") is removed entirely, confirmed absent from the live production bundle.
- Today: the previous two-stacked-cards layout (a standalone "Angel recommends next" card above a
  separate mission-list card) is now one connected hero — Today's Plan -> primary recommended
  activity -> "Why this today?" (real `preparationDecision.stagePrincipleText` or the mission item's
  own real reason, never invented) -> duration -> Start -> a de-emphasised "Then" list. Zero-evidence
  state now reads "Let's find your starting point" / "A short check helps Angel choose the right level
  and what to practise first," per the governing instruction's own wording.
- Both pages now use `ANGEL_11PLUS_PRODUCT_DESIGN_STANDARD_V1.md`'s tokens throughout
  (`--angel-navy/-ink/-blue/-sky/-border/-paper`), reusing `components/ui/Button.tsx` (already
  token-identical to the homepage's own CTAs) rather than hand-rolled classes. No new shared component
  library was built, per the instruction's own "do not create a giant design-system project."
  `components/ui/Card.tsx` (shared with out-of-scope Progress/Parent Dashboard) was deliberately left
  untouched to avoid rippling into pages this increment must not redesign.
- Private Learner Space files (Header.tsx, Navigation.tsx, RegisteredAccountGate.tsx,
  useHouseholdMode.ts, learnerPin.ts, householdPin.ts) were **not touched** — confirmed by `git diff
  --stat` showing only the two page files changed.
- Clean-checkout gate: typecheck 0 errors, tests 4,783/4,784 (unchanged count — presentation-only),
  migration-sql-guard PASS, copy-guard/eslint unchanged from baseline, genuine `next build` PASS
  (`/dashboard` and all 5 real Learn lesson routes built and statically prerendered).
- Production evidence: fetched the live JS bundles directly and confirmed the new Today/Learn copy is
  genuinely deployed and the old "being rebuilt" copy is genuinely absent.
- **Not verifiable this session, disclosed**: the governing instruction's own Real Content Test and
  Acceptance Evidence (zero-evidence/some-evidence/recommendation states, desktop/tablet/mobile
  screenshots of the real authenticated pages) require a real authenticated session, which I do not
  have and, per this project's standing rule, did not create — this is the Founder's required next
  step before this increment is considered complete.
- Per the governing instruction, this increment stops here: Practise, Mock, Progress, Results and
  Parent Dashboard were not started; the full authenticated experience migration is not marked
  complete.

**2026-09-23 (same day) — Increment 1B: Today + Learn Visual Correction. Commit `469f97d`, pushed,
deployed, confirmed live. Presentation-only correction on top of Increment 1 (no data/logic change).
Founder visual GO not declared — production screenshots still required:**

- Founder review of Increment 1 found the content fixes sound (all 5 lessons, no dev-process copy)
  but the composition still plain/application-like. Every new treatment is a direct, named reuse of a
  specific homepage section (checked in `app/page.tsx` before use): the sky-tinted panel + divided
  list from "A clear plan for today", the `GoldRule` accent, the `text-3xl md:text-4xl` heading scale,
  the icon+name+intro subject identity from "Five subjects. One connected plan."
- Today: primary recommendation now lives in one large `bg-[var(--angel-sky)]` panel instead of a
  bordered white card; typography scaled up to homepage rhythm throughout.
- Learn: Mathematics and English Reading are now real subject sections (icon + large heading + intro)
  each holding their lessons as one flowing divided list in a sky panel, replacing the previous narrow
  bordered-row list.
- Confirmed unchanged: all 5 real lessons, no new/fake data, Private Learner Space and PIN
  architecture (diff shows only the two page files touched), migrations 260-263 untouched.
- Clean-checkout gate and production bundle verification both clean, matching established baseline.
- Not verifiable this session (disclosed, same as Increment 1): real tablet/mobile screenshots against
  a live authenticated session — Founder's required next step for final visual acceptance.

**2026-09-23 (same day) — Increment 1C: Today + Learn Final Visual Acceptance Corrections. Commit
`d56d3b3`, pushed, deployed, confirmed live. Bounded finishing pass on top of Increment 1B (visual
direction preserved, not redesigned). Founder visual GO not declared — real screens still required:**

- Today's "Progress/Mock clipped beyond viewport" root cause: not a horizontal-overflow bug (none
  reproducible 390-1920px with worst-case text) but the `lg:` (1024px) grid breakpoint — any window
  narrower than 1024px, a very common non-maximised desktop width, single-column-stacked Progress/Mock
  below a tall primary panel, far enough down to require scrolling past it.
- Fix: grid split moved to `md:` (768px); `md:col-span-2`/`md:col-span-1` + defensive `min-w-0` on both
  columns and the recommendation headline; small proportionate spacing trim above "Today's Plan".
  Single-column fallback now only below 768px (true mobile/tablet-portrait), matching the instruction's
  own explicit allowance.
- Learn: container widened `max-w-3xl` → `max-w-4xl lg:max-w-6xl` (matches Today's own convention);
  lesson text capped `max-w-2xl` for readability inside the wider panel.
- Lesson rows: weak `ArrowRight`-only affordance replaced with an explicit "Start lesson"/"Continue"
  pill, genuine-state only (same not-started condition `hubProgressionLabel` already uses).
- "Practise instead"/"See your Learning Report" moved out of the sky panel into a small plain-text
  "More ways to work" strip, no longer sharing lesson-row visual weight.
- Subject copy reworded to plain, child-friendly language with no internal/pathway terminology.
- Confirmed unchanged: all 5 real lessons; Private Learner Space, PIN architecture, migrations 260-263,
  Educational Intelligence and recommendation logic untouched (diff shows only the two page files).
- Clean-checkout gate: typecheck 0, tests 4,783/4,784 (unchanged), migration-sql-guard PASS,
  copy-guard/eslint unchanged from baseline, genuine `next build` PASS.
- Responsive verification: no authenticated session used (standing rule). Genuine static-HTML
  reproduction (real Angel tokens + real className strings) tested via injected iframes at 390/430
  (mobile), 768/900/1024 (tablet/common laptop), 1280/1366/1440/1920 (desktop), heights down to 700px —
  zero overflow at any width, grid confirmed genuinely active/inactive via `getComputedStyle` at each
  breakpoint. This verifies the real CSS rules, not a live authenticated screenshot.
- Production evidence: fetched the live deployed JS chunks for both routes directly and confirmed the
  new copy, the Start/Continue pill text, "More ways to work", and the `md:grid` breakpoint class are
  genuinely present; the old copy and the old `lg:grid` class are genuinely absent.
- Founder's required next step: final visual acceptance from real production screens.

**2026-09-23 (same day) — Increment 2: Practise + Mock Angel Foundation Visual Pass. Commit `c3bd15e`
(feature) + `3b4cc28` (test fixes), pushed, deployed, confirmed live. Founder milestone: Today + Learn
— GO, frozen. Visual GO not declared for this increment — real screens still required:**

- Full-journey inspection (not just landing pages) confirmed: the real CSSE Practice runner
  (`practice/[area]/page.tsx`, shared engine for Reading/Maths/Writing) and the real CSSE Mock journey
  (`/mocks` — the literal front door for every pathway including CSSE — through `mock-exam/**`) used
  zero Angel tokens; Today/Learn's redesign stopped at the first click of "Practise"/"Mock".
- Practise: question now the dominant object (bigger stem typography); Reading passage readability
  fixed (was `text-xs`, height-capped at 224px scrollable — now readable, capped 288–384px); Angel-paper
  cards replace `InfoCard`/generic-gray throughout; "Angel progress indicator" → "Your writing score".
- Mock: deliberately calmer than Practise (per instruction) — exam-board cards moved from full bright
  coloured backgrounds to a thin neutral accent stripe; sitting engine + all 5 shared `mockAttempt/*`
  components restyled the same way; already-correct calm/sealed behaviour (no hints, no mid-sitting
  feedback, flat non-celebratory submission) confirmed unchanged by diff.
- Two genuine defects fixed in passing (small, targeted, on this increment's own "no internal
  terminology" rule): raw competencyId codes leaking on the two-paper Mock results screen (now via
  `childFriendlySkillLabel()`); internal section-numbering ("1. Result"..."6. Exam context") leaking
  into the parent Mock report (prefixes removed).
- Reported, not fixed: `app/mocks/[pathway]/page.tsx` (legacy GL/CEM/ISEB Mock) shows correct/incorrect
  + explanation feedback DURING the timed section — a real "Mock never teaches" violation for the three
  pathways with no other Mock experience. Separate, larger decision; out of this increment's visual scope.
- Clean-checkout gate: typecheck 0, tests 4,783/4,784 (unchanged), migration-sql-guard PASS,
  copy-guard/eslint unchanged from baseline, genuine `next build` PASS across every touched route.
  Three pre-existing structural source-text tests had selectors updated to match deliberate markup/copy
  changes (not reverted); their real assertions unaffected.
- Production evidence: fetched the live deployed JS chunks for Practice hub, Mock hub and the Mock
  sitting engine and confirmed new copy/markup genuinely present, old generic classes genuinely absent.
- Founder's required next step: real device visual acceptance, and a separate decision on the legacy
  GL/CEM/ISEB Mock mid-sitting-feedback defect above.

**2026-09-23 (same day) — Increment 2 Closure: Bounded Mock Assessment-Integrity Correction. Commit
`3312f3c`, pushed, deployed, confirmed live. Fixes the mid-sitting feedback leak Increment 2 reported
(not fixed) in the legacy GL/CEM/ISEB Mock. Increment 2 GO still not declared:**

- Root cause: `app/mocks/[pathway]/page.tsx`'s answered-state render showed "Correct!"/"Incorrect.
  Answer: {answer}" plus the full explanation immediately after each answer, while that section's own
  timer was still counting down — violates "Practice teaches, Mock measures."
- Confirmed shared runtime, not inferred: the whole file has exactly one pathway-conditional branch (an
  unrelated results-tagging line) — GL/CEM/ISEB genuinely share one implementation of the leaking code
  path, verified structurally and by test.
- Fix: the confirmation is now neutral ("Answer recorded." + Next/End Section), no colour/icon/answer/
  explanation. Correctness is still computed and recorded into `sectionAnswers` exactly as before — only
  the render branch changed, never scoring. Dead `wasCorrect` display state removed with it.
- Post-assessment (between-section/results) screens inspected first: only ever showed aggregate section/
  overall percentages, never per-question correctness — unaffected, not changed.
- Non-regression confirmed: Practice's own real feedback untouched; the real CSSE Mock engine
  (`mock-exam/page.tsx`) not touched at all (diff shows only the one file + new test).
- Tests: 13 new structural tests (`tests/app/mockLegacyAssessmentIntegrityCorrection.test.ts`) proving
  the leak is gone, recording/navigation/scoring still work, and Practice/CSSE Mock are unaffected.
- Clean-checkout gate: typecheck 0, tests 4,796/4,797 (unchanged baseline + 13 new, all pass),
  migration-sql-guard PASS, copy-guard/eslint unchanged from baseline, genuine `next build` PASS.
- Production evidence: fetched the live deployed `/mocks/gl` JS chunk directly — "Answer recorded." is
  genuinely present, "Incorrect. Answer:" and "Correct!" are genuinely absent.
- Founder's required next step: final production visual and behavioural acceptance.

**2026-09-23 (same day) — Increment 2 Final Visual Closure: Practise Hub Only. Commit `1d64162` +
`89ce3cd`, pushed, deployed, confirmed live. Founder accepted the Practice question runner unchanged;
rejected the Practice hub (`app/reasoning/page.tsx`). Increment 2 GO still not declared:**

- Root cause: `app/reasoning/page.tsx` — the actual destination any learner reaches when their locally
  persisted pathway (per-active-learner localStorage, migration 260, no server fallback) hasn't resolved
  to "csse" at click time, even a genuinely CSSE learner on a fresh session/device. Nav routing itself
  (`components/Navigation.tsx`) was already correctly pathway-branched (Answer A); the page it could
  still land a learner on had zero pathway-conditional content of its own (Answer C).
- Fix: the page now reads `getSelectedPathwayId()` itself and reorganises around it — CSSE learners see
  the two real CSSE subjects (Mathematics, Reading Comprehension) foregrounded as "What should I
  practise?", with the four Reasoning subjects + GL Verbal Reasoning/Vocabulary demoted to "What else can
  I choose?", honestly framed (not part of the CSSE exam, useful for other schools). Non-CSSE learners
  keep every existing card, unchanged capability, just reordered/re-skinned above the subject grid.
- Visual: removed `SubjectCard.tsx`'s lime/cyan/violet/rose/pink/yellow identity (confirmed this page is
  its only real consumer — component itself left untouched); inline Angel-token cards instead, matching
  Today/Learn/Practice's own convention; repeated GL/CEM/ISEB badge pills removed from every card.
- Internal language: "Currently a small sample set while we build out the full question bank." removed
  from the hub; swept related Practice surfaces and found + fixed the same pattern in
  `/mocks/adaptive/vocabulary` and `/mocks/adaptive/gl`. Mock's own two remaining instances
  (`app/mocks/page.tsx`) found but not touched — explicitly out of this correction's "do not touch Mock"
  scope.
- Non-regression confirmed: Today, Learn, the accepted Practice runner, and all of Mock untouched (diff
  shows only the 3 files above). No new recommendation/evidence logic — reuses existing real data only.
- Responsive: verified at all 9 required widths (390–1920) via the established static-reproduction +
  iframe methodology — zero overflow, correct grid reflow, container never trapped narrow on desktop.
- Clean-checkout gate: typecheck 0, tests 4,796/4,797 (unchanged), migration-sql-guard PASS, eslint
  unchanged. Copy-guard caught a genuine +2 regression (two new em dashes) mid-pass — fixed, back to the
  51-violation baseline before the final gate run.
- Production evidence: fetched the live `/reasoning`, `/mocks/adaptive/vocabulary` and `/mocks/adaptive/
  gl` JS chunks directly — new hierarchy headings and honest copy genuinely present, old badges/internal
  language genuinely absent, across all three.
- Founder's required next step: final visual acceptance decision from the real production Practice hub.

**2026-09-23 (same day) — Practise Hub Final Human-Design Refinement. Commit `186f53a`, pushed,
deployed, confirmed live. Founder accepted the Increment 2 pathway correction (Plantest2 correctly gets
CSSE-focused Reading Comprehension/Mathematics/Continuous Writing); pathway routing not reopened. GO
still not declared:**

- Removed the "Vocabulary: not available here" block (exposed internal architecture language — "this
  skills structure", "connect to the learner profile", "this dashboard") entirely, no replacement card.
- Simplified intro copy: "updates your Skills Profile, Evidence Profile, Readiness and Recommendations"
  → "Practise the skills you need for your preparation. Angel 11+ uses your work to understand what
  you're doing well and what to focus on next."
- Removed decorative per-row icon tiles (no accessibility/navigation need found) from the three subject
  rows; filled "Start" pill became a plain "Start →" text-plus-arrow affordance. Typography/spacing/
  divider carry hierarchy now — no replacement icon, card, or additional pill.
- Added a new governing, product-wide section to `ANGEL_11PLUS_PRODUCT_DESIGN_STANDARD_V1.md`: "no
  AI-interface visual fingerprint" — components/icons/pills/cards only when they aid comprehension or
  navigation; solve hierarchy with typography/spacing/composition first.
- **Recorded technical debt, not fixed**: Practice pathway resolution depends on per-active-learner
  localStorage with no server fallback (both nav routing and this page's own pathway-aware content).
  Founder testing confirms correct CSSE routing today — not a current blocker, but flagged for later
  bounded assessment of multi-learner-household transient-staleness risk.
- Non-regression confirmed: pathway logic, question runner, Today, Learn, Mock, Progress, Results,
  Parent Dashboard, PIN architecture, migrations 260–263 all untouched (diff shows only 2 files).
- Clean-checkout gate: typecheck 0, tests 4,796/4,797 (unchanged), migration-sql-guard PASS, copy-guard/
  eslint unchanged from baseline, genuine `next build` PASS.
- Production evidence: fetched the live `/learning-intelligence/practice` JS chunk directly — new copy
  genuinely present, both old internal-language strings genuinely absent.
- Founder's required next step: final production visual acceptance.
