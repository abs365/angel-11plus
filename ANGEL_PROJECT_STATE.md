# ANGEL 11+ — PROJECT STATE

**This is the single authoritative handover document for a fresh Claude session.**
It records current state only — not history. For history, see the specific `ANGEL_*.md` report
named under each item below. For operating rules, see `AGENTS.md` (imported by `CLAUDE.md`).

Last updated: 2026-09-17, Educational Depth Phase 1 Wave 1 — production acceptance closed.

---

## Current production status

**Live** at `https://angel-11plus.vercel.app` (Vercel project `angel-11plus`, org `abs365s-projects`).
Currently deployed from commit **`b65721a`** (`origin/main`, includes `c542bef`) — confirmed by
`git fetch` showing `origin/main` at `b65721a`, and by `vercel inspect` showing the current
Production deployment (aliased to `angel-11plus.vercel.app`) Ready, created after that push.

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
  (`b65721a` on `origin/main`, deployed, smoke-verified — see "Closed programme" below)

## Closed programme (most recent)

**Educational Depth & Daily Preparation Programme, Phase 1, Wave 1** — MR-01 Arithmetic Foundation
teaching depth + Maths remediation-silence fix. **CLOSED — production acceptance: GO.**

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

1. **Writing is critically thin**: 7 practice-eligible rows across 7 one-question families.
   **Picture-led narrative has zero Practice content and zero teaching content** — it exists only
   as a Mock task. This is the sharpest gap against the platform's own teaching-progression
   standard.
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

## Exact next educational priority (not yet started)

**Writing — picture-led narrative learning depth.** Wave 1 is now formally closed; this is next.
Reasoning: the
Full English Paper can assess picture-led narrative, but current production learning content has
an absence (not just a thinness) problem for this mode — see "Known material educational risks"
above.
