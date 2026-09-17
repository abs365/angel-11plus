# ANGEL 11+ — PROJECT STATE

**This is the single authoritative handover document for a fresh Claude session.**
It records current state only — not history. For history, see the specific `ANGEL_*.md` report
named under each item below. For operating rules, see `AGENTS.md` (imported by `CLAUDE.md`).

Last updated: 2026-09-17, Educational Depth Phase 1 Wave 2 (Writing picture-narrative) —
REJECTED STIMULUS CORRECTION. The Founder independently reviewed migration 255's riverboat
candidate and REJECTED it (real Year 5 learner evidence: "there is nothing to write with the
picture"). A replacement candidate ("The Treehouse Lantern", migrations 257/258) is authored,
registered for independent review, and awaiting the Founder. See "Closed programme (most recent)"
below.

---

## Current production status

**Live** at `https://angel-11plus.vercel.app` (Vercel project `angel-11plus`, org `abs365s-projects`).
Currently deployed from commit **`b777431`** (`origin/main`) — confirmed by `git push` showing
`origin/main` advance from `9276412` to `b777431`, and by `vercel inspect`/`vercel alias ls` showing
`angel-11plus.vercel.app` aliased to the resulting Ready production deployment.

Supabase project: `agxunwcdatosrmzhhuxj` (`https://agxunwcdatosrmzhhuxj.supabase.co`) — confirmed
identical between the Vercel production build and local dev; not a project-mismatch risk.

## Current production inventory (live-verified, not from a report)

| | Count |
|---|---|
| Practice-eligible + active questions | **900** |
| — Maths | 587 |
| — English | 306 |
| — Writing | **7** |
| Distinct question families | 61 (+27 rows with no `family_id`) |
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

**Not closed — open pending one Founder action:**
- **Educational Depth Phase 1 Wave 2 (Writing picture-narrative) — production acceptance: PARTIAL,
  now mid-correction after a real Founder rejection.**
  Code (teaching content, image-stimulus render path, type/routing) is deployed and live
  (`b777431`), smoke-verified against a real live row with zero regression.
  - **Migration 255's candidate ("The Riverboat at Dawn") was applied, registered for review
    (migration 256), and independently reviewed by the Founder via the live `/admin-beta/review`
    interface. Decision: REJECTED.** Root cause (direct target-learner evidence): a real Year 5
    child preparing for the 11+ was shown the picture unprompted and said "there is nothing to
    write with the picture" — the scene was visually describable but not narratively generative
    enough (atmosphere and static objects, too little action/relationship/tension/discovery for a
    Year 5 learner to build a story from). The rejection is preserved exactly as the Founder
    recorded it in `ali_family_review`; the row itself is untouched, still
    `authentic_assessment_candidate`, and structurally unpromotable (every real promotion migration
    in this repo — 200/203/224's own pattern — requires `decision = 'approved'` or
    `'approved_with_amendment'`; `'rejected'` satisfies neither, so no further lock was needed).
  - **A new educational-quality principle was established from this rejection**: a picture-led
    narrative stimulus must not merely be describable — it must be **narratively generative**,
    giving a learner several credible footholds (action, relationship, discovery, tension, an
    unusual object, evidence something just happened, etc.) while staying genuinely open to more
    than one legitimate story.
  - **Replacement candidate authored and staged**: "The Treehouse Lantern"
    (`eng-practice-writing-picturenarrative-treehouselantern-01`,
    `supabase/migrations/257_writing_picture_narrative_replacement_practice_content.sql`, NOT
    APPLIED), a new original SVG scene (`public/practice-assets/writing-picture-narrative/
    treehouselantern-v1.svg`) with multiple deliberate narrative footholds (a rope ladder pulled up
    off the ground, a lantern-lit window in bright daylight, a dropped bag with spilled compass/
    torch/note, two distinct sets of footprints, a watching magpie) and no text/title/speech
    bubble dictating a plot. Registered for independent review
    (`supabase/migrations/258_writing_picture_narrative_replacement_pending_review.sql`, NOT
    APPLIED) via the same `ali_family_review` mechanism as migration 256.
  - **Response-shape metadata defect fixed in the same commit**: the review screen's "Response
    shape" label displayed "Not yet catalogued (picture-narrative)" for both the rejected and
    replacement rows — a real small defect (the new `picture-narrative` response type had never
    been added to `lib/adminReview.ts`'s `WRITING_RESPONSE_SHAPE_LABEL` map, unlike `descriptive`/
    `narrative`), now labelled "Picture-Stimulus Narrative". This was a display gap only —
    `promptWritingTask()` already read `responseType` correctly for these rows.
  - No real learner can reach picture-narrative Practice content until the Founder (a) applies
    migrations 257 and 258 via Supabase Dashboard > SQL Editor, and (b) completes a genuine
    independent review of the replacement through `/admin-beta/review`. See "Closed programme
    (most recent)" below for full detail. Do not re-attempt to apply any of these migrations
    directly; it is a Founder action by this repo's own standing convention (every migration here
    is Founder-applied, `DEPLOYMENT.md`).

## Closed programme (most recent)

**Educational Depth & Daily Preparation Programme, Phase 1, Wave 2** — Writing picture-narrative
teaching depth + Practice image-stimulus infrastructure + one new original candidate prompt.
**Code: CLOSED, deployed, GO. Content: OPEN, awaiting one Founder migration application. Overall:
PARTIAL.**

- Pushed to `origin/main` at `b777431`. Vercel Git integration deployed it; production alias
  `angel-11plus.vercel.app` confirmed (via `vercel alias ls`) pointing at the resulting Ready
  deployment.
- **Baseline (live-verified this session, not from a prior report)**: all 7 `practice_eligible`
  Writing rows are QT-WC-01a (reflective/discursive); zero QT-WC-01b (picture-narrative) rows
  existed anywhere in the bank, in Practice or Mock-applied state. Zero teaching content and zero
  image-stimulus rendering capability existed in Practice.
- **What changed (code, live)**: a new `writing-picture-narrative` teaching family
  (`lib/learningEngine/writingTeachingContent.ts`) teaching picture-evidence reasoning (observe →
  interpret → commit to one direction → structure), routed via a new, separate `"picture-narrative"`
  prompt type so no existing `narrative`/`descriptive` row's teaching content changed.
  `WritingPrompt` gained an optional `stimulus` field (`types/index.ts`), validated defensively and
  rendered in Practice's `WritingActivity` (absent on every pre-existing row, regression-safe by
  construction).
- **Content created**: exactly one new, original Practice picture-narrative prompt ("The Riverboat
  at Dawn") with its own hand-authored SVG stimulus, deliberately a different scene from Mock's own
  Q2 picture (a shed, migration 246) so Practice can never preview the exact image a learner could
  later meet in a sealed Mock sitting. Staged at `authentic_assessment_candidate`, matching this
  repo's own first-content convention (migrations 098/153/246) — not yet learner-reachable.
- Tests: 4554/4561 pass; the 7 failures are byte-identical to the pre-existing baseline this file
  already discloses (`englishWave1`, `englishWave2`, `englishWave2ExposureExpansion`,
  `englishWave2PipelineVerification`, `migration237PublishAnswerPersistenceCorrection`, plus the two
  untracked Factory files under "Deferred / non-blocking issues" below) — 0 regressions. `tsc
  --noEmit` clean for every file this Wave touched. Independent subagent review found no material
  defects.
- **Production learner verification** (real authenticated learner, `balletman20@yahoo.com`,
  Founder-authenticated, post-deploy): Continuous Writing Practice loaded a real live row
  (`mock-writing-mistakelearned-01`); its worked-example panel correctly still showed the unchanged
  `writing-reflective-discursive` scaffold (not the new family); its checklist rendered unchanged;
  no image block rendered (correct — this row has no `stimulus`); no console errors. This proves
  zero regression to the one thing a real learner can reach today. It cannot prove the new
  picture-narrative content works for a real learner, because no learner can reach it yet — that
  check is only possible after the Founder applies migration 255.
- **Why this is PARTIAL, not GO**: this repo's own `submit_question_candidate`/
  `publish_question_candidate` RPCs are admin-gated by design, and `DEPLOYMENT.md` records every
  migration in this repo (schema, function, or content) as Founder-applied via Supabase Dashboard >
  SQL Editor — there is no automated or Claude-held path to production content publication, by
  design, not by omission. This mirrors migration 246's own identical treatment of Mock's Q2 row.

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

1. **Writing is critically thin**: 7 practice-eligible rows across 7 one-question families, still
   entirely QT-WC-01a (reflective/discursive). Wave 2 built the picture-narrative teaching/render
   infrastructure and authored one original candidate prompt, but it is not yet `practice_eligible`
   (see "Not closed" above) — until the Founder applies migration 255, this risk is unchanged in
   practice, even though the code to close it is now live.
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

## Exact next educational priority

**Superseded**: migration 255 (the riverboat candidate) was applied, reviewed, and REJECTED by the
Founder — do not apply it as a promotion target; its rejection stands as governance evidence.

**Immediate, one-step, non-engineering**: apply `supabase/migrations/257_writing_picture_
narrative_replacement_practice_content.sql` and `258_..._replacement_pending_review.sql` (Founder
review + Supabase Dashboard > SQL Editor), then complete a genuine independent review of "The
Treehouse Lantern" through `/admin-beta/review` — review the new prompt/checklist/image
(`public/practice-assets/writing-picture-narrative/treehouselantern-v1.svg`) directly, per this
repo's own standing content-review discipline. Only after a real approved/approved_with_amendment
decision exists in `ali_family_review` can a promotion migration (matching 200/203/224's pattern)
be authored — never inferred, never fabricated.

**Next educational Wave** (after that Founder action, or in parallel if the Founder prefers to
batch it with the next Wave's own content): Writing picture-narrative still has only ONE Practice
prompt once 255 is applied — genuine family depth (structural/representation variation across
several picture stimuli, not just one) is the next material gap, following the same Family Depth
Standard Wave 1 established for Maths. Do not generate volume for its own sake; check what teaching
gap remains first.
