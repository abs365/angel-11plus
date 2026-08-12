# Release 1 — Validation Strategy

**Programme:** Angel Assessment Transformation Execution Programme — Release 1 (Question Bank and Assessment Authenticity)
**Status:** Strategy design only. Defines how validation will occur for a future execution phase — does not itself validate any content, because no content is authored under this document.
**Prepared:** 2026-08-05

---

## Why a Dedicated Validation Strategy Is Required

`RELEASE_1_GAP_ANALYSIS.md` §5 found that **zero of the 18 items currently in the CSSE question pool have ever been reviewed by a qualified educational reviewer** — every Question Type tag is "this work package's own reasoned judgement," by the migration's own admission. Whatever content-authoring work Release 1 eventually authorises will inherit this same risk unless validation is designed as a first-class gate, not an afterthought applied once content already exists. This strategy exists to make that gate explicit, specific, and mandatory — for newly authored content and, retroactively, for the 18 items already in production.

---

## 1. Educational Validation

**What it checks:** does each item genuinely test what its assigned Question Type is supposed to test?

**Method:** every item — new or existing — is reviewed by a qualified educational reviewer directly against its Question Type's **Measurement Purpose** definition, as stated in the underlying AEP-004 source document (`CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md`, cited by Assessment Brain V1 §4 but not reproduced there). This is a **content-fit** check, distinct from and prior to any correctness/grading check.

**Specific application to the 6 already-flagged weak items** (`RELEASE_1_GAP_ANALYSIS.md` §4): each must be explicitly re-judged — confirmed as an acceptable approximate fit worth keeping, or flagged for replacement — by a reviewer who was not the original author of the migration's own judgement calls. Self-review by the same party who made the original tagging decision does not satisfy this requirement.

**Pass/fail standard:** an item passes only if a reviewer can state, in their own words, which specific real CSSE exam behaviour the item is testing, without needing to reference the item's own inline comment as justification. If the justification only exists in a code comment and not in the item's actual content and answer key, the item fails this check.

## 2. Technical Validation

**What it checks:** does the item integrate correctly with the existing platform — schema, tagging, scoring, evidence pipeline — without introducing a regression?

**Method:** reuse the existing verification pattern already established in this codebase (`ADAPTIVE_MOCK_INTELLIGENCE_SPECIFICATION_V1.md` §10's acceptance criteria) — every new item must: use a `skill` value matching an existing, real `QT-*` ID (never an invented one); resolve correctly through `QUESTION_TYPE_PRIMARY_COMPETENCY`; carry an `estimated_time_seconds` value consistent with its Question Type's real-exam time allocation (§12 of the Implementation Blueprint); and, where its answer format is non-trivial (e.g. mth-006's compound-answer pattern, flagged in the Gap Analysis as a format fragility), be checked against the actual grading function it will be evaluated by, not assumed compatible.

**Regression requirement:** `npx tsc --noEmit` must remain clean, matching the standard already applied in Release 0. No existing item's `id`, `skill`, or scoring behaviour may change as a side effect of adding new items.

## 3. Trust and Explainability Validation

**What it checks:** does the item's presence in the pool overclaim what it actually demonstrates?

**Method:** applying `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §9's three-audience Explainability model — for any item, a reviewer must be able to state what evidence it produces, for which competency, at what confidence, without inflating a weak or forced-fit item into an apparent full demonstration of a Question Type it does not cleanly represent. This is the direct institutional fix for the pattern found in the Gap Analysis (6 forced/approximate items presented identically to 12 clean ones, with the distinction visible only in a code comment, not in any learner- or parent-facing signal).

## 4. Wellbeing Protection Validation

**What it checks:** does new content or a new timing model introduce anxiety-inducing framing?

**Method:** per the Educational Safety Principle (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §3), reviewed with the same "extra scrutiny" standard already applied to admissions-adjacent content in Release 0. Specifically relevant to Release 1: the new paper/section-timed model (§12 of the Implementation Blueprint) must not introduce countdown-style urgency messaging beyond what a real exam setting itself requires; difficulty calibration (§11) must not concentrate excessively hard items early in a session in a way that could discourage a learner before they reach content they could succeed at.

## 5. Founder Validation

**What it checks:** has the Founder actually approved the specific gate in question — never inferred.

**Method:** each of the 5 Founder Validation Gates named in `RELEASE_1_IMPLEMENTATION_BLUEPRINT.md` §15 is tracked as its own explicit approval record (see `RELEASE_1_FOUNDER_DECISION_PACK.md`), not bundled into a single "approve Release 1" action. In particular, Gate 3 (AR-01 content authoring) must not be treated as approved merely because a general Release 1 approval was given — its own dependency (AEP4-C04's resolution) is a separate, harder precondition.

## 6. Pilot Validation

**What it checks:** does authored content and the new timing model actually work for a real learner before wider release?

**Method:** consistent with the Roadmap's own Wave 2 (Mock Transformation) validation requirement — a small-scale real-user or Founder-family test pass, run only after Educational, Technical, Trust, and Wellbeing validation have each independently passed for the content/timing set being piloted. Pilot validation is not a substitute for the earlier checks; it is a final, holistic check that the individually-validated pieces work together as an actual sitting.

## 7. Production Validation

**What it checks:** once released, does the transformed pool continue to behave as validated, with no silent drift?

**Method:** reuse the existing Assessment Coverage panel (`EvidenceProfile.tsx`) as a live, ongoing dashboard of per-Question-Type coverage — any future addition or removal of content should be visible there without a separate reporting mechanism being built. Any new "weak coverage" item introduced after this Release (i.e., someone bypassing the "no forced fit" rule from `RELEASE_1_IMPLEMENTATION_BLUEPRINT.md` §9) should be detectable by the same educational-validation process, applied on an ongoing basis, not only at the point of this Release's own launch.

---

## Validation Ownership

No stage above may be self-certified by whoever authored the content or built the timing model. This mirrors the existing Educational Intelligence Engine V1 §12 discipline (6 dimensions, "all required, none sufficient alone") and directly closes the gap the Gap Analysis found in the current pool — where the sole "reviewer" of all 18 items was the same work package that authored the tagging.

## What This Strategy Does Not Do

This document defines *how* validation will occur — it does not validate anything, since Release 1 has authored no content and changed no timing model. It becomes operative only once a future, separately-Founder-approved execution phase produces something to validate against it.
