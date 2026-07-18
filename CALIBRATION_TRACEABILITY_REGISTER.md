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

*(Future provisional constants introduced by any subsequent work package should be appended here in the same format at the time they are implemented, not retroactively.)*
