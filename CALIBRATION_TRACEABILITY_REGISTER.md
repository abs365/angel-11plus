# Calibration Traceability Register

**Status:** Living implementation documentation. Created 2026-07-18 per Programme Decision APD-022.
**Purpose:** Every provisional calibration constant introduced during the Implementation Programme is recorded here — constant name, current value, rationale, owner, validation status, and review trigger — so no provisional value is left silently untracked once it's shipped in code.
**Relationship to `EAW-005_IMPLEMENTATION_READINESS_ARCHITECTURE.md` §4.1:** that section assigned ownership for calibration parameters at the architecture level, before any of them existed in code. This register is the concrete, per-constant record of that assignment being exercised as each constant is actually implemented.

---

## Confidence Processing thresholds (WP-05, `lib/ali/confidence.ts`)

| Field | Value |
|---|---|
| **Constant name** | `GUESSABLE_CONFIDENCE_WEIGHT` |
| **Current value** | `0.85` |
| **Rationale** | Below this `confidence_weight`, evidence caps at **Low** confidence outright, regardless of how many times the mastery threshold is met (AEP-005 §6's "Low Confidence... easily guessable format" criterion) — corrected during WP-06 cross-verification; the original WP-05 implementation capped this case at Moderate, which would have let a guessable-format-only result incorrectly pass the WP-06 Mastery Validation gate. 0.85 was chosen as a conservative cutoff — closer to 1.00 (fully diagnostic) than to 0.50 (a coin-flip-guessable format) — without a real distribution of confidence_weight values across the live question bank to calibrate against yet. |
| **Owner** | Founder + first implementation engineer, jointly (per `EAW-005` §4.1) |
| **Validation status** | Provisional — not validated against real usage data |
| **Review trigger** | Before Confidence Processing output is surfaced in any learner- or parent-facing feature (per `EAW-005` §4.1's original milestone: "before Confidence Processing ships to production") |

| Field | Value |
|---|---|
| **Constant name** | `HIGH_TIER_SPREAD_MARGIN` |
| **Current value** | `2` (distinct correct sessions beyond the bare `mastery_threshold` minimum) |
| **Rationale** | A real, evidence-grounded proxy for "evidence across time" (AEP-005 §7) using only data that actually exists (`distinct_correct_sessions`) — not a calendar-time gap, since no per-attempt timestamp log exists to compute one (the same honest limitation `LEARNING_PROFILE_MODEL.md` §1 already found for its Learning Consistency dimension). The value 2 was chosen so High confidence requires meaningfully more evidence than the bare minimum, without yet having real data on what margin actually predicts durable mastery. |
| **Owner** | Founder + first implementation engineer, jointly |
| **Validation status** | Provisional — not validated against real usage data |
| **Review trigger** | Same as above |

---

## Educational State Coordination threshold (WP-08, `lib/ali/educationalState.ts`)

| Field | Value |
|---|---|
| **Constant name** | `APPROACHING_THRESHOLD_RATIO` |
| **Current value** | `0.5` (fraction of `mastery_threshold` progress) |
| **Rationale** | Distinguishes "Building Knowledge" from "Practising" within the Confidence "low" tier — a distinction EAW-004 §3 names qualitatively but does not itself quantify. Computed from real, already-captured data (`distinct_correct_sessions / mastery_threshold`, taking the closest-to-threshold question in the competency), not a new capture. 0.5 (halfway) was chosen as the simplest defensible midpoint without real data on where this distinction actually matters to a learner's experienced journey. |
| **Owner** | Founder + first implementation engineer, jointly |
| **Validation status** | Provisional — not validated against real usage data |
| **Review trigger** | Once Educational State labels are used to drive a real, observable difference in recommendation behaviour (Recommendation Orchestration, a future work package) — before then, the distinction has no behavioural consequence to validate against |

---

## Pre-existing, same category (Decision 10, predates this Implementation Programme — registered here for completeness now that formal traceability exists)

| Field | Value |
|---|---|
| **Constant name** | `ali_mastery_defaults` (`easy`=2, `medium`=2, `hard`=3, `challenge`=3 distinct sessions) |
| **Current value** | See above — a configurable table (`supabase/migrations/005_ali_question_bank.sql`), not a hard-coded constant |
| **Rationale** | Original Decision 10 rationale: lenient-but-real thresholds, low enough not to punish genuine mastery, high enough to rule out a lucky-guess pattern. Already calibration-drift-monitorable via `avg_success_rate` (`QUESTION_AUTHORING_STANDARD.md` §4.4). |
| **Owner** | Founder (original Decision 10 owner) |
| **Validation status** | Live in production schema; drift-monitored, not independently re-validated since Decision 10 |
| **Review trigger** | `avg_success_rate` drift signal flags a specific question, per the existing, standing mechanism — not a fixed calendar date |

---

## Not yet implemented in code — ownership already assigned, tracked here so nothing is lost between architecture and implementation

| Field | Value |
|---|---|
| **Constant name** | `MAINTENANCE_REVIEW_INTERVAL_DAYS` (`lib/ali/durableMastery.ts`) — was "Maintenance Review interval (AEP-004 §9.2)," now implemented |
| **Current value** | `14` days |
| **Rationale** | Implemented at WP-07 (Durable Mastery Processing), the exact trigger this row's "review trigger" previously named. Set to the lower end of `EAW-005` §4.1's originally-proposed 2–3 week range, loosely consistent with spaced-retrieval literature ranges (AEP-001 §2.2) — chosen as a real, computable calendar gap against `ali_student_question_history.last_presented_at` (a genuine existing timestamp, not a new capture), rather than the question-count-based cooldown mechanism used for short-term spacing. |
| **Owner** | Founder (implemented per the ownership `EAW-005` §4.1 assigned) |
| **Validation status** | Provisional — implemented, not yet validated against real usage data |
| **Review trigger** | Once real usage data exists on how often mastered competencies genuinely decay across a 14-day gap |

| Field | Value |
|---|---|
| **Constant name** | `EXAM_PROXIMITY_WINDOW_DAYS` (`lib/ali/recommendationOrchestration.ts`) — was "Examination-proximity weighting curve (EAW-004 §4-§5)," partially implemented at WP-09 |
| **Current value** | `60` days |
| **Rationale** | WP-09 implements the Tier 3 *mechanism* (a binary on/off reweighting window, promoting format-matching candidates within their existing tier) but deliberately does **not** implement the graduated *curve* EAW-004 §4-§5 describes — that remains gated on `target_exam_date` (WP-09's own `types/index.ts` field) accumulating real usage data first, exactly as this row previously stated. 60 days was chosen as a conservative "final stretch" window without real data on when exam-proximity should actually start influencing recommendations. |
| **Owner** | Founder |
| **Validation status** | Provisional — mechanism implemented, graduated curve still not implemented, blocked on the same real-data prerequisite as before |
| **Review trigger** | Once families have begun entering `target_exam_date` values in real usage |

---

## Operational Event retention (WP-11, `lib/ali/operationalEvent.ts`)

| Field | Value |
|---|---|
| **Constant name** | `RETENTION_WINDOW_DAYS` |
| **Current value** | `60` days |
| **Rationale** | Implements the retention strategy `EAW-ERR-HOTFIX-001`'s Engineering Action 2 required. Raw, learner-identified events are kept for near-term diagnostics within this window; beyond it, only learner-identifier-free monthly aggregates survive. 60 days ("weeks, not indefinitely," per the hotfix's own framing) was chosen without real data on how long raw per-event detail is actually useful. |
| **Owner** | Founder + first implementation engineer, jointly |
| **Validation status** | Provisional — not validated against real usage/storage-volume data |
| **Review trigger** | Once real Operational Event volume exists to check retention cost/usefulness against |

---

## Competency Aggregation Rules (WP-18, `lib/ali/persistence/educationalStateRuntime.ts`)

Per Programme Decision APD-041 (Competency Aggregation Governance): any rule converting question-level evidence into a competency-level conclusion is recorded here with its aggregation method, educational rationale, relationship to existing mastery rules, known limitations, calibration status, and required validation evidence — distinct from the simple numeric constants elsewhere in this register, since these are *rules*, not thresholds.

| Field | Value |
|---|---|
| **Rule name** | `deriveCompetencyMasteryState` |
| **Aggregation method** | "Any question qualifies": a competency's mastery_state is `"mastered"` if any constituent question is `"mastered"`, else `"weak"` if any is `"weak"`, else `"learning"` if any has been attempted, else `"new"`. |
| **Educational rationale** | Mirrors WP-06's `thresholdMet` check, which already uses the identical "any question meets its own threshold" principle at the individual-mastery-decision level — applying the same philosophy one level up (competency, not question) keeps the two closely related concepts internally consistent rather than introducing a second, different aggregation logic for a sibling decision. |
| **Relationship to existing mastery rules** | Additive only — does not change `mastery_state`'s own per-question computation (`lib/ali/mastery.ts`, Decision 7/20/21, unmodified). This rule only summarises multiple already-correct per-question states into one label for Educational State Coordination (WP-08) to consume. |
| **Known limitations** | An "any question mastered" rule can label a competency `"mastered"` even when only one of many constituent questions has individually reached that state — this is a deliberately lenient aggregation, not a strict one, and has not been checked against whether it produces the *felt* sense of competency mastery a parent or learner would recognise as accurate. |
| **Calibration status** | Provisional — implemented, not validated against representative learner data. |
| **Required validation evidence** | Real multi-question competency histories (once WP-02's proposed NVR/Spatial/Mathematical Reasoning tagging, or any multi-question competency, has real attempt data) checked against whether the "any question mastered" label matches an independent, human judgement of whether that competency is genuinely mastered. |

| Field | Value |
|---|---|
| **Rule name** | `deriveReviewDue` |
| **Aggregation method** | "Any question qualifies," at the same granularity as `deriveCompetencyMasteryState` above: a competency's Maintenance Review is due if any of its `mastered`-state questions individually satisfies WP-07's `isMaintenanceReviewDue()` (14-day calendar gap, itself already provisional — see this register's Durable Mastery entry). |
| **Educational rationale** | Deliberately kept at the same "any" granularity as the mastery-state rule immediately above, rather than introducing a different aggregation philosophy (e.g. "majority" or "all") for a closely related concept — internal consistency between the two rules was prioritised over independently optimising each one. |
| **Relationship to existing mastery rules** | Additive only — does not change `isMaintenanceReviewDue()`'s own per-question calendar-gap logic (WP-07, unmodified). Only decides, at competency level, whether *any* eligible question triggers the review. |
| **Known limitations** | Compounds `isMaintenanceReviewDue()`'s own provisional 14-day interval with a second, also-provisional "any question" aggregation choice — two stacked provisional decisions, not independently validated from each other. A competency with many questions is more likely to have *some* question cross the 14-day gap at any given time than a competency with few, meaning review frequency is not currently normalised by competency size. |
| **Calibration status** | Provisional — implemented, not validated against representative learner data. |
| **Required validation evidence** | Real usage data showing how often this rule actually fires per competency size, checked against whether review frequency feels appropriately calibrated (not excessive for large competencies, not absent for small ones) once real multi-question competencies have attempt histories to observe. |

**Per APD-041's explicit instruction, neither rule's implementation is altered by this documentation entry — both remain exactly as approved in WP-18 (commit `79f1e50`), provisional and unvalidated, pending the evidence described above.**

---

## Wellbeing Signal thresholds (WP-21A, `lib/ali/wellbeing.ts`)

| Field | Value |
|---|---|
| **Constant name** | `COMPOUNDING_FAILURE_THRESHOLD` |
| **Current value** | `3` consecutive incorrect attempts, same competency |
| **Rationale** | The exact threshold `WP-21_WELLBEING_DESIGN.md` §6 Condition A named, chosen to require genuinely *compounding* evidence (Programme Decision APD-044 item 5) rather than firing on a single wrong answer — consistent with this signal's deliberate false-positive-over-false-negative bias (WP-21 §8), 3 was judged a reasonable minimum run-length without real data confirming it. |
| **Owner** | Founder + first implementation engineer, jointly |
| **Validation status** | Provisional — implemented, not validated against real usage data |
| **Review trigger** | Once real multi-attempt session data exists to check whether 3 consecutive failures reliably corresponds to genuine strain versus ordinary desirable-difficulty struggle (AEP-001 §2.2-2.4) |

**Educational Wellbeing Governance note (extending APD-041's format to this new category, per the same discipline):** `checkCompoundingFailure`, `checkMasteryReversalLowEngagement`, and `checkSessionAbandonmentPattern` (`lib/ali/wellbeing.ts`) are themselves competency-adjacent aggregation rules in the sense APD-041 defined, applied to a wellbeing rather than a mastery conclusion — **aggregation method:** "any qualifying condition fires the veto, evaluated independently, first-match-wins" (Condition A, then B, then C); **educational rationale:** WP-21 §6's three named conditions, each requiring compounding/dual-signal evidence per APD-044 item 5; **relationship to existing mastery rules:** consumes WP-08's `EducationalState` and the existing `aliLearningGain` signal, recomputes neither; **known limitations:** all three conditions are unvalidated, Condition C is permanently unevaluable until session-abandonment capture is built (explicitly out of WP-21A's own scope), and the "first-ever contact" exclusion in Condition A is a documented judgement call (`currentEducationalState !== "exploring"`), not a directly-specified rule; **calibration status:** provisional; **required validation evidence:** real multi-learner usage data checked against independent human judgement of whether each firing genuinely corresponded to a moment where easing off was the right call.

---

## Recommendation Orchestration Runtime Rules (WP-19, `lib/ali/persistence/recommendationRuntime.ts`)

Per Programme Decision APD-041's format, extended (as WP-21A's entry above already did) to a rule converting existing conclusions into a new one — here, an `EducationalState` (WP-08) into a `RecommendationTrigger` (WP-09), and a real-data availability boundary into a candidate-emission decision.

| Field | Value |
|---|---|
| **Rule name** | `deriveTriggerReason` |
| **Aggregation method** | Direct, non-overlapping mapping: `"exploring"` → `never-attempted`; `"reviewing"` → `review-due`; `"building-knowledge"`/`"practising"`/`"reinforcing"`/`"rebuilding"` → `weak-competency-remediation`; `"mastered"`/`"durably-mastered"` → no trigger, no candidate emitted. |
| **Educational rationale** | Each mapped state's own definition (`lib/ali/educationalState.ts`) already names the real condition the trigger describes — this is a labelling exercise over an existing conclusion, not a new educational judgement. Two of `RecommendationTrigger`'s five values (`cooldown-expired`, `mastery-event-on-linked-competency`) are never produced: the first needs a per-question cooldown signal not exposed at competency granularity, the second needs the Knowledge Graph WP-20 has not yet built. Deferred, not fabricated. |
| **Relationship to existing mastery rules** | Additive only — consumes `computeEducationalState()`'s output (WP-08, unmodified) and produces a label for `orchestrateRecommendations()` (WP-09, unmodified) to consume. Recomputes nothing upstream. |
| **Known limitations** | Collapses four distinct educational states (`building-knowledge`, `practising`, `reinforcing`, `rebuilding`) into one trigger value — real, ordered nuance between them (already preserved in `educationalState` on the same candidate) is not separately visible in `triggerReason` alone. A `mastered`/`durably-mastered` competency with no review due generates no candidate at all, which is a real scope decision (no honest trigger exists), not an oversight. |
| **Calibration status** | Provisional — implemented, not validated against representative learner data or against whether the resulting trigger vocabulary reads correctly to Explainability's audiences. |
| **Required validation evidence** | Real usage data checked against whether `weak-competency-remediation` firing across four different underlying states produces appropriately differentiated Explainability output (WP-10 already varies phrasing by `educationalState` directly, so this is a check on the full pipeline, not `deriveTriggerReason` in isolation). |

**Known limitation, not a rule but a real data-availability boundary worth its own entry:** `fetchRecentAttemptSignalsForCompetency` approximates a chronologically-ordered, cross-question attempt sequence from `ali_student_question_history`'s `last_attempt_correct`/`second_last_attempt_correct`/`last_presented_at_sequence` fields, because no per-attempt log exists anywhere in this schema. The most recent attempt's position is exact; the one before it is approximated as `sequence - 1`, which can misorder attempts interleaved across multiple questions. `learningGainTrend` and `daysUntilExam` are accepted as optional caller-supplied inputs rather than derived here, since both remain genuinely client-local today (`types/ali/learningGain.ts`, `lib/progress.ts`'s `getTargetExamDate()`) with no Supabase-persisted history behind either — left undefined, both default to the same fails-open behaviour their own governing contracts already specify.

**Per APD-041's explicit instruction, this documentation entry alters nothing in the WP-19 implementation itself.**

---

*(Future provisional constants introduced by any subsequent work package should be appended here in the same format at the time they are implemented, not retroactively.)*
