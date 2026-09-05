# Increment 025 — Programme Completion Evidence & Reselection

## Original selection (superseded, preserved for history)

**Original Increment 025 selection:** wire the Preparation Horizon's `revision_retrieval` recommendation into real Practice session weighting (`buildPreparationWeightBias()`).

**Founder decision: CANCELLED AS NOT REQUIRED.** Implementation pre-flight traced the complete real execution path (as required before writing any code) and found the original defect claim did not hold as stated. A separate, real, already-operational mechanism exists in `generatePersonalisedSession()` itself (`lib/learningEngine/sessionGenerator.ts`, "Review Scheduling, Deliverable 3"): when `getRecommendations()` returns a `triggerReason: "review-due"` candidate, the function directly reserves the most calendar-overdue previously-mastered question for that competency into the real session — unconditionally, on every call, independent of whether a `PreparationSessionContext` is even supplied. This predates Increment 021's own weight-bias wiring. `revision_retrieval` as a dashboard *label* has no `buildPreparationWeightBias()` case, but the underlying real signal it derives from already, genuinely, changes session selection today.

**Reusable engineering lesson, recorded per Founder instruction:** a Preparation Horizon activity type does not necessarily need a `buildPreparationWeightBias()` case to have operational effect — a recommendation can be consumed by a different part of the same session-generation function. Future programme audits must trace the *complete* execution path before classifying any recommendation as unwired, not stop at the first function checked.

**Two real, smaller characteristics of the existing mechanism, disclosed as observations, not authorised defects, per explicit Founder instruction:**
1. `REVIEW_SLOT_CAP = 1` — a documented, deliberate calibration choice ("so a genuine review doesn't crowd out every other priority"), not evidence of a defect.
2. The reserved review question is always a previously-mastered, previously-seen item (never fresh material) — arguably correct for genuine decay-checking, not a defect.

Neither was modified. No code was changed for the original Increment 025 scope. `HEAD` at cancellation: `85479e3` (unchanged).

---

## Reselection — corrected programme assessment

### Preparation Horizon destinations (corrected)

Of the 7 real `ActivityType` values: `teaching_lesson`, `guided_practice`, `unseen_transfer_check` are consumed by `buildPreparationWeightBias()`; `placement_check` is handled via a separate page redirect; **`revision_retrieval` is now confirmed consumed by the separate Review Scheduling mechanism** (corrected from the prior audit's "zero effect" claim); `independent_practice` and `timed_assessment` remain "no special session-generation effect" by design (the former is simply the absence of a stronger recommendation; the latter routes to Mock, a wholly separate flow). No remaining Preparation Horizon destination is confirmed genuinely unwired.

### Reading Mock scoring — investigated fresh this turn, not assumed

Real architecture exists and is deployed: migration 219 (`mock_claim_reading_scoring_work` / `mock_persist_reading_scoring`, a dedicated least-privilege `mock_scoring_writer` Postgres role), `lib/server/mockScoringAuthority.ts` (the one file holding `MOCK_SCORING_DATABASE_URL`), `lib/mockAttempt/readingScoringOrchestration.ts` (pure, tested scoring computation reusing the exact same engine Practice already uses), and `app/api/mock-reading-scoring/route.ts` (the real, deployed, learner-facing API route, commit `3c905c1`, "reliable Reading scoring invocation + bounded recovery").

**`READING MOCK SCORING = OPEN TECHNICAL BLOCKER.`** The route's own exception handler (line 125, `logScoringEvent(attemptId, "scorer", "failure", \`exception:${err.name}\`)`) is exactly where a real, previously-reported `"exception:r2"` log line would originate — consistent with the Founder's own account of a positive-control attempt that reached the privileged scoring call and failed. No commit since `3c905c1` (the tip of this feature's entire history, unchanged through this whole session's Increments 019–025) touches this code, so whatever state produced that failure is the current state. Static code review of `mockScoringAuthority.ts` found no obvious logic defect in the connection/query code itself — the failure most likely originates in the `MOCK_SCORING_DATABASE_URL` credential/connection layer (missing, misconfigured, or a network/pooler restriction), which cannot be diagnosed or fixed from source code alone. **Confirming genuine closure requires production execution**: either a fresh real (or intentionally test) Reading Mock submission with the resulting Vercel log line shared back, or Founder confirmation that the `mock_scoring_writer` role and `MOCK_SCORING_DATABASE_URL` were ever actually configured. This was not attempted this turn (explicitly out of scope: "do not fix Reading Mock scoring yet," "do not mutate production merely to answer this selection question").

### Mathematics / Reading / Writing bottlenecks (reassessed, largely unchanged from the prior audit)

- **Mathematics:** 202 rows/37 families, 3/6 full teaching, family-depth thinness (unchanged) remains the real capacity constraint; no untaught competency's intervention-loop gap outranks Reading Mock scoring's severity.
- **Reading:** 142 rows/24 passages, 2/4 full teaching; the 24-passage ceiling remains real but is a *content-freshness* constraint, not a *loop-breaking* one the way Mock scoring failure is.
- **Writing:** 7 live prompts (Increment 023's 3 held, correctly excluded from usable capacity), 0 full teaching, thinnest capacity in the system — a capacity + teaching problem, but not currently loop-breaking (Writing has no Mock at all, so there is no scoring-closure risk analogous to Reading's).

### Frequent-user / late-entrant / strong-learner bottlenecks (corrected)

With maintenance review now confirmed operational, the *revision* dimension is no longer the dominant frequent-user risk. The corrected dominant risk across all three learner profiles is: **any learner who reaches the Reading Mock — the core timed-assessment/readiness stage of the whole preparation loop — currently risks the scoring pipeline failing silently from their perspective**, based on the last known real evidence. This affects a late-entrant relying on Mock readiness most acutely (least runway to recover from a broken assessment cycle), but is a real risk for every learner who takes the Reading Mock.

### Ranked candidates (this turn)

1. **Reading Mock scoring closure** — highest severity (a live, learner-reachable, core-loop-breaking failure risk), but lowest immediate executability (requires a Founder-supplied fresh diagnostic step before any code fix, if one is even needed, can be written).
2. Another full teaching lesson (RC-03/RC-04/MR-02/MR-05/Writing WC-01) — fully executable, moderate impact, no new evidence elevates one specific competency over the others named in the prior audit.
3. Reading/Mathematics content-capacity deepening — moderate impact, blocked by the same independent-reviewer governance constraint as any new content.
4. Migration 221 (passage-eligibility architecture) — real but narrower, no fresh evidence elevates it this round.

### Selected outcome

**Increment 025 (reselected): Diagnose and close Reading Mock scoring**, beginning with a Founder-collaborative diagnostic step (a fresh test/real Reading Mock submission with the resulting server log shared back), before any code change is proposed — mirroring the same Founder-collaborative verification pattern already proven throughout this program (e.g., Increment 020/023's own migration-application verification cycles). This is not implemented this turn (selection only).

**Status: SELECTED / NOT IMPLEMENTED (superseded by closure below).**

---

## Closure — technical Reading Mock scoring blocker (2026-09-05)

**Status: PRODUCTION COMPLETE — TECHNICAL READING MOCK SCORING VERIFIED.**

The full diagnostic-to-closure chain, preserved accurately (no historical record rewritten):

1. **Client-side recovery investigation** (production attempt `e2f26f8d-25b6-452d-bd1c-3d5ad2436a0f`) found two real code-quality/observability findings — an unguarded `getSession().then(...)` in `components/providers/AuthProvider.tsx`, and a silent-skip branch in the mock-report recovery effect — neither of which was proven to be, or was, the blocker. **Not fixed as part of this closure**; recorded as open, disclosed findings for a future increment.
2. Production evidence proved client recovery reliably reaches `/api/mock-reading-scoring` and the request is not the failure point.
3. A bounded, Founder-approved observability commit (`4cbcf6e`) replaced the route's `exception:${err.name}` diagnostic (uninformative under production minification) with the real Postgres `code`/`severity`/`routine` fields plus a claim/compute/persist stage tag.
4. Fresh production evidence then showed `exception:P0001;severity:ERROR;routine:exec_stmt_raise;stage:persist` — a genuine `mock_persist_reading_scoring()` (migration 219) RAISE EXCEPTION, not a connection/auth/schema failure. Two hypotheses were formed and **disproved by Founder-run, read-only production queries**: a missing `ali_question_bank` row for one of the 28 assigned questions, and a `marks = 0` legacy-heuristic overflow. Live function signature drift was also checked and disproved.
5. A second bounded, Founder-approved observability commit (`7e6bb74`) added `lib/mockAttempt/persistGuardClassifier.ts`, matching the caught error's message against migration 219's own 10 fixed RAISE EXCEPTION templates and logging only a safe allow-listed identifier — never the raw message. Fresh production evidence then named the exact guard: `persist_guard:outcomes_not_array`.
6. Static and local reproduction against the actual installed `postgres` 3.4.9 package's own Bind-message code proved the existing manual `JSON.stringify(outcomes)::jsonb` boundary did **not** double-encode the array — this was verified, not assumed, and is recorded accurately: **JSON.stringify was never proven to be the root cause.**
7. A bounded, Founder-approved correction (commit `9420faa`) replaced that manual boundary with postgres.js's own explicit JSONB parameter mechanism (`sql.json()`) and added a fail-closed `Array.isArray(outcomes)` invariant immediately before persistence — changing nothing about `outcomes` itself, `computeReadingScoringOutcomes()`, the English scoring engine, or migration 219.

**Production verification, same previously-stalled attempt, same evidence hierarchy this whole increment used (fresh production evidence over static inference):**

> The explicit postgres.js JSONB binding correction resolved the production persistence failure. The same previously stalled production attempt subsequently scored successfully, with all 28 assigned questions persisted and integrity checks passing.

Fresh production scorer event: `outcome: success, reason: scored` (deployment `9420faa`). Founder-run, read-only production verification confirmed: `scoring_state = scoring`, `marking_version = 1`, `question_outcomes` is a genuine JSON array of exactly 28 entries reconciling to the attempt's 28 assigned questions, zero duplicate outcome IDs, zero outcomes outside the assigned manifest, zero automatic-mark bound violations, and 6 questions correctly resolved to `requires_manual_marking`. `overall.percentage = null`, `analysis_state = not_started`, and `report_release_state = pending` are the **expected**, correct state while 6 questions still require manual marking — not a defect, and not evidence the closure is incomplete. The report was not manually released; `scoring_state`/`analysis_state`/`report_release_state` were not altered by this increment.

**Explicitly not touched by this closure**, remaining open for a future increment if selected: the AuthProvider/report-silent-skip client findings (item 1 above); manual marking of the 6 `requires_manual_marking` questions for this attempt; the resulting analysis/report-release stage once marking completes; migrations 221 and 182 (still HOLD / NOT APPLIED); Increment 023 (still HOLD AT INDEPENDENT HUMAN REVIEW).
