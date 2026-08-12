# Implementation Dependency and Gate Report

**Programme:** Angel Assessment Transformation Execution Programme — Release 1
**Prepared:** 2026-08-11
**Status:** Sequencing and gating only. No implementation authorised by this document.

---

## 1. Dependency Chain

```
1. Choice-injection point (weakSkills extension + provenance state)
   — smallest, most isolated, no other new work depends on anything but this
        |
        v
2. "Current focus" state + provenance model live
        |
        +---> 3a. Rebalancing/escalation check (Tier 0 sibling)
        |
        +---> 3b. Parent/learner experience surfaces (consumes 1+2)
                        |
                        v
                4. Stagnation-detection signal (genuinely new evidence tracking)
                        |
                        v
                5. Real server-side Mock Attempt Ledger (independent gap, not blocking 1-4,
                   but required before any of this is reliable cross-device)
```

## 2. What Must Remain Blocked (§F, §19)

- **WC-02 content/assessment work** — blocked on Assessment Brain V1 gaining a Question Type mapping for it. This is a frozen-architecture decision, not an engineering task. **Do not build around it with an invented mapping.**
- **Any Continuous Writing scoring change** — blocked on either (a) acquiring better official marking evidence, or (b) an explicit Founder decision to accept Angel-internal, clearly-disclosed-as-non-CSSE-equivalent scoring as an interim measure. Neither has happened.
- **Mass content authoring** — explicitly out of scope for this increment regardless of any finding here.
- **Production Mock modification** — explicitly out of scope.
- **GL/CEM/ISEB transformation** — explicitly out of scope; this entire investigation is CSSE-only.

## 3. Frozen Foundation Documents — Does Anything Require Changing One? (§M)

**One clear case: Assessment Brain V1's Question Type catalogue, specifically for WC-02.** No other frozen document (Learning Engine V1, Educational Intelligence Engine V1) requires a change — every mechanism this investigation relies on already exists and already works as designed within those documents' current scope. The choice-injection point is an *addition* (a new parameter path into existing functions), not a *modification* of documented behaviour — `selectQuestions()`'s signature already accepts `weakSkills` as an open set; populating it from a new source doesn't change what the function does with it.

## 4. Smallest Sensible First Increment (recommended, per §L and the STOP GATE's own request)

**Recommendation: build the choice-injection point and provenance state only (dependency step 1-2 above), applied to a single competency, in a controlled, non-production surface — mirroring exactly the Founder Validation Assessment's own successful pattern this Release (isolated pathway, real evidence pipeline, Founder-only visibility, no production exposure).**

Concretely, illustratively (not a commitment): let the Founder manually select one competency as a "chosen focus" in a controlled test route, confirm the `weakSkills` injection genuinely changes what `selectQuestions()` returns (provably, the same way marking accuracy was proven this Release — a deliberate test case, checked against the database), confirm provenance is recorded and never silently relabelled, and confirm the maintenance-review mechanism keeps surfacing other competencies at low weight throughout. This tests the one genuinely new mechanism in complete isolation before any parent/learner-facing experience or rebalancing logic is attempted.

**Why this is the right size:** it is provably the smallest slice that exercises the one real gap identified across all nine deliverables — everything else in the loop is already working. It reuses this Release's own just-proven verification method (real browser test + direct authenticated DB query, not code-inspection-only claims).

## 5. Does This Alter the Current CSSE Assessment Transformation Sequence? (§N)

**No.** Per the governing instruction's own §16, and confirmed by this report: Release 1's content-authoring and Founder Validation Assessment work continues on its existing track. This personalisation investigation is a parallel, separately-gated design thread that consumes Release 1's outputs (competencies, evidence, content) but does not require Release 1 to pause, and Release 1 does not require this thread to complete before continuing its own next increment.
