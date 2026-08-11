# Mock Readiness Model V1

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, New Learner Experience Migration
**Prepared:** 2026-08-11
**Status:** Design only. Per governing instruction §17 ("Do NOT implement an unsupported Mock Readiness score"), nothing in this document is implemented this release.

---

## 1. What already exists

A real, working, evidence-based readiness verdict already exists: `assessMockReadiness()` (`lib/learningEngine/mockReadiness.ts`). Its own doc-comment states it is "a pure categorical dispatch over already-real, already-computed facts... zero arithmetic, zero new numeric thresholds" — exactly the discipline the governing instruction demands ("do not reduce Mock Readiness to a percentage invented from arbitrary weights").

Current signature and logic (verified directly, not summarised from memory):

```ts
export type MockReadinessVerdict = "practice-first" | "first-mock-valuable" | "mock-valuable";

export interface MockReadinessInput {
  hasAnyEvidence: boolean;
  mockAttemptCount: number;
  topTriggerReason: RecommendationTrigger | null;
}

export function assessMockReadiness(input: MockReadinessInput): MockReadinessAssessment
```

Dispatch: no evidence → `practice-first`; zero prior mock attempts → `first-mock-valuable`; a real top recommendation trigger exists → `practice-first`; otherwise → `mock-valuable`. Consumed only by `app/learning-intelligence/parent/mock-readiness/page.tsx` (CSSE-gated; no equivalent exists for other pathways).

This is a strong foundation, not a rebuild target — the target model below is an **extension**, not a replacement.

## 2. Gap between existing verdicts and the Founder's requested states

The governing instruction names five states: NOT ENOUGH EVIDENCE / KEEP PREPARING / APPROACHING MOCK READINESS / READY FOR NEXT MOCK / MOCK DUE-RECOMMENDED. The existing three-verdict system maps partially:

| Founder-requested state | Existing verdict it's closest to | Gap |
|---|---|---|
| NOT ENOUGH EVIDENCE | `practice-first` (no evidence branch) | Already correct, no gap |
| KEEP PREPARING | `practice-first` (top-trigger branch) | Already correct, no gap |
| APPROACHING MOCK READINESS | *(none)* | No intermediate state exists between "keep preparing" and "valuable" today |
| READY FOR NEXT MOCK | `mock-valuable` | Doesn't yet consider mastery maintenance, wellbeing, or breadth (see §3) |
| MOCK DUE / RECOMMENDED | *(none)* | No time-since-last-mock input exists at all today |

## 3. Real evidence inputs available vs. genuinely missing

Per the governing instruction's explicit list, cross-checked against what this codebase actually computes:

**Available today, not yet wired into `assessMockReadiness()`:**
- Competency coverage / breadth — `LearnerIntelligenceProfile.competencies`, `ComponentReadiness[]` (`computeComponentReadiness()`)
- Accuracy — `ali_student_question_history.times_correct`/`times_seen`
- Unresolved weaknesses — `DiagnosticFindings.developmentAreas`
- Mastery maintenance status — `DurableMasteryRecord`, `evaluateDurableMastery()`, `isMaintenanceReviewDue()`
- Wellbeing — `computeWellbeingSignal()`'s veto/steady signal
- Previous mock history — `getMockResults()` (once Founder-Validation-isolated, see `FOUNDER_VALIDATION_ISOLATION_ASSESSMENT.md`)
- Time since previous mock — derivable from `MockResult.date`, not currently read by any readiness function

**Not genuinely available (must not be fabricated):**
- "Improvement trajectory" / learning-gain trend — `learningGainTrend` is a documented, real gap elsewhere in this codebase (`recommendationRuntime.ts`'s own judgement call 4: no Supabase table backs it, currently always `null`/fail-open). Any V1 model must either leave this out or clearly mark it "not yet available," never approximate it.
- "Consistency" as a distinct metric — no existing computation; would need a new, disclosed definition before use, not invented silently.
- "Sufficient exposure to authentic question structures" — partially answerable via Question-Type coverage (`QuestionTypeExposure.contentExists`/`timesSeen`), but the *authenticity* half depends on the Eligibility Model's Independently Validated status, which almost no content has reached yet (per `REPEATED_FRESH_MOCK_READINESS_MODEL_V1.md`'s own finding). A V1 model should treat this as a real, disclosed limitation, not silently assume all attempted content counts.

## 4. V1 target design (categorical, not numeric)

A revised dispatch function, still zero-arithmetic, extending the existing one with two new real inputs (mastery/maintenance status, time-since-last-mock) and one new intermediate state:

```
NOT ENOUGH EVIDENCE       <- !hasAnyEvidence (unchanged)
KEEP PREPARING            <- hasAnyEvidence && topTriggerReason is a real weakness/never-attempted signal
APPROACHING MOCK READINESS <- hasAnyEvidence && topTriggerReason is only "review-due" (maintenance, not a fresh gap)
                              AND no unresolved development-area weaknesses
READY FOR NEXT MOCK        <- no real top trigger AND wellbeing signal is not vetoed
                              AND (mockAttemptCount === 0 OR sufficient time has passed since the last real mock)
MOCK DUE / RECOMMENDED     <- READY FOR NEXT MOCK conditions met AND a real, disclosed time-since-last-mock
                              threshold has elapsed (threshold itself would need explicit Founder calibration
                              input before being set — not invented here)
```

**Explicit design constraint carried over from the existing function:** "high activity with poor mastery must not trigger ready" is already structurally guaranteed by the trigger-reason check (an unresolved weakness always routes to KEEP PREPARING regardless of session count), and this V1 design preserves that guarantee rather than introducing any commitment/activity-based shortcut.

## 5. Explainability requirement

Both directions the governing instruction names ("why you are ready" / "what to improve before your next mock") are answerable using the exact same real, already-computed facts the verdict itself is built from — `generateExplanation()`'s existing parent-audience text generation is the correct, reusable mechanism, not a new one.

## 6. Explicitly not implemented this release

No code changes to `lib/learningEngine/mockReadiness.ts`, no new UI, no calibrated time-since-last-mock threshold (this needs real usage data and/or explicit Founder input, exactly like `EXAM_PROXIMITY_WINDOW_DAYS` and `MAINTENANCE_REVIEW_INTERVAL_DAYS` elsewhere in this codebase were disclosed as provisional pending real data).
