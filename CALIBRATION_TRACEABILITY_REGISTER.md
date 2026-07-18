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
| **Rationale** | Below this `confidence_weight`, a question is treated as guessable enough that repetition alone cannot justify High confidence (AEP-005 §6's "Low Confidence... easily guessable format" criterion). 0.85 was chosen as a conservative cutoff — closer to 1.00 (fully diagnostic) than to 0.50 (a coin-flip-guessable format) — without a real distribution of confidence_weight values across the live question bank to calibrate against yet. |
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
| **Constant name** | Maintenance Review interval (AEP-004 §9.2) |
| **Current value** | Not yet implemented — no Durable Mastery Processing work package has begun |
| **Rationale** | Interim placeholder proposed at architecture time (`EAW-005` §4.1): on the order of 2–3 weeks, loosely consistent with spaced-retrieval literature ranges (AEP-001 §2.2) — explicitly not yet a real constant in any file |
| **Owner** | Founder |
| **Validation status** | Not implemented |
| **Review trigger** | Before Durable Mastery Processing (`EAW-002` §8) is implemented — the work package that will actually need this value |

| Field | Value |
|---|---|
| **Constant name** | Examination-proximity weighting curve (`EAW-004` §4–§5, Recommendation Orchestration Tier 3) |
| **Current value** | Not yet implemented |
| **Rationale** | Deliberately gated on `target_exam_date` (added `EAW-004` §2.1) having accumulated real usage data first — calibrating a curve against no real behavioural data would repeat the same class of error the original EAW-D001 defect was |
| **Owner** | Founder |
| **Validation status** | Not implemented — blocked on a real data-collection prerequisite, not merely undecided |
| **Review trigger** | Once families have begun entering `target_exam_date` values in real usage |

---

*(Future provisional constants introduced by any subsequent work package should be appended here in the same format at the time they are implemented, not retroactively.)*
