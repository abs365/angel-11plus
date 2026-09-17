# ANGEL 11+ — PROJECT STATE

**This is the single authoritative handover document for a fresh Claude session.**
It records current state only — not history. For history, see the specific `ANGEL_*.md` report
named under each item below. For operating rules, see `AGENTS.md` (imported by `CLAUDE.md`).

Last updated: 2026-09-17, end of Educational Depth Phase 1 Wave 1 closure attempt.

---

## Current production status

**Live** at `https://angel-11plus.vercel.app` (Vercel project `angel-11plus`, org `abs365s-projects`).
Currently deployed from commit **`f4f21fa`** (`origin/main`) — confirmed by matching the
production deployment's creation timestamp to that commit's push.

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

## Active programme

**Educational Depth & Daily Preparation Programme, Phase 1, Wave 1** — MR-01 Arithmetic Foundation
teaching depth + Maths remediation-silence fix.

- Committed locally at **`c542bef`** (on `f4f21fa`). **Not pushed, not deployed.**
- Content: 0 new questions generated (deliberate — the gap was teaching, not volume). Added
  teaching content for 4 MR-01 families (73 existing questions, 0/73 → 73/73 worked-example
  reach) and fixed a defect where 398 of 472 covered Maths questions showed nothing after a wrong
  answer (→ 0 silent).
- Tests: 4536/4543 pass; the 7 failures are byte-identical to the pre-change baseline (measured by
  stashing the work) — 0 regressions.
- **Status: closure blocked on real production learner verification.** The session investigating
  this found the blocker was environmental (a stray local `.env.local` misconfiguration + a guest/
  unauthenticated browser session), not a genuine Angel defect — see
  `ANGEL_EDUCATIONAL_DEPTH_PHASE1_WAVE1_REPORT.md` and the Wave 1 closure session's report for
  full detail. **Founder authentication is required to complete the 3 representative learner
  checks; push + deploy are withheld until that passes**, per the Angel Constitution's "no direct
  unsafe production mutation" and "real evidence before claiming GO" rules.

**Do not begin Wave 2 (Writing) until Wave 1 is formally closed.**

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

**Writing — picture-led narrative learning depth**, once Wave 1 is formally closed. Reasoning: the
Full English Paper can assess picture-led narrative, but current production learning content has
an absence (not just a thinness) problem for this mode — see "Known material educational risks"
above.
