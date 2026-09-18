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

## Exact next educational priority

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
