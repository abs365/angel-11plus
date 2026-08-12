# Release 1 — Assessment Eligibility Model

**Programme:** Angel Assessment Transformation Execution Programme — Release 1
**Prepared:** 2026-08-10
**Status:** Design only. No database field created, no migration written, no existing item classified under this model yet. Per the Founder's instruction: "First determine the educational governance model" — implementation is explicitly deferred.

---

## 1. Purpose

Define the statuses an Angel assessment question can hold, the evidence required to move between them, and which statuses make a question eligible for which surface (practice, authentic mock, etc.) — so that "exists in the question bank" and "eligible for an authentic CSSE assessment" (per the Founder's Baseline Correction) are never conflated again, structurally, not just by convention.

## 2. The Five Statuses

### Provisional Content
A question exists in `ali_question_bank` but has not yet been evaluated against `RELEASE_1_CSSE_AUTHENTIC_QUESTION_SPECIFICATION.md`. This is the default status for all content that predates this specification, and the status the Founder has already assigned to the 11 migration-016 rows (`REPOSITORY_BASELINE_ASSESSMENT.md`'s CRITICAL CORRECTION). **Not eligible for any assessment surface** — practice or mock — until reviewed.

### Practice Eligible
A question has a disclosed, traceable Question Type/competency mapping (the standard the original 18 items already meet, per `RELEASE_1_GAP_ANALYSIS.md` §1/§5) but has not been checked against this specification's fuller authenticity characteristics (wording, reasoning steps, information density, etc.) or independently reviewed. **Eligible for low-stakes practice only** — explicitly not presented as mock-equivalent, matching the disclosure banner Release 0 already shipped for the current mock (`app/learning-intelligence/mock-exam/page.tsx`, commit `1dbd90a`).

### Authentic Assessment Candidate
A question has been authored (or, for existing content, retrospectively documented) with an explicit traceability chain per the Specification §6 — a named Asset ID, Question Type, competency, and matched assessment characteristics — but has not yet had independent educational review. **Not yet mock-eligible.** This status exists so authoring work and review work can be tracked as separate, sequential steps, matching the Validation Strategy's "no stage may be self-certified by whoever authored the content" rule.

### Independently Validated
A qualified reviewer who did not author the item has confirmed: the traceability chain holds, no forced fit exists (Gate 2), and the item's difficulty label is at minimum internally consistent (per Increment 1's rubric-consistency finding — not empirical calibration, since that evidence does not yet exist). **Still not mock-eligible** — validation confirms the item is sound; it does not by itself confirm the *pool* as a whole is balanced enough to constitute a mock.

### Mock Eligible
An Independently Validated item that additionally sits within a pool meeting the Mock Authenticity requirements of the Founder's Educational Authenticity Clarification — genuine Question Type coverage balance, realistic timing fit, no single Question Type dominating the pool (the QT-MR-01 concentration problem `RELEASE_1_LIVE_QUESTION_BANK_RECONCILIATION_REPORT.md` flagged). This is a **pool-level gate layered on top of item-level validation** — an individually excellent item does not become mock-eligible just because it is excellent; the pool it would join must also be evidenced as balanced.

## 3. Evidence Required to Progress Between Statuses

| Transition | Evidence required | Who certifies |
|---|---|---|
| (none) → Provisional Content | Item is registered into `ali_question_bank` at all | Whoever performs the registration/import |
| Provisional → Practice Eligible | Disclosed, non-forced Question Type/competency mapping (Gap Analysis §1 standard) | Content author, self-disclosed reasoning acceptable at this stage |
| Practice Eligible → Authentic Assessment Candidate | Full traceability chain per Specification §6 populated for this item; item's characteristics checked against the relevant Specification entry (or, for a not-yet-deep-analysed Question Type, an explicit note that full-depth comparison is not yet possible) | Content author |
| Authentic Assessment Candidate → Independently Validated | A qualified educational reviewer who did not author the item confirms the chain, confirms no forced fit, confirms difficulty-label internal consistency | External reviewer (per Validation Strategy's "no self-certification" rule) |
| Independently Validated → Mock Eligible | Pool-level review: the item's addition does not create or worsen a Question-Type concentration imbalance (a check, not a guarantee any single item can satisfy alone); paper/section timing fit confirmed once Gate 5 timing work lands | A pool-level review step, not a per-item one — mechanism TBD in future implementation work |

**No status is skippable.** An item cannot move from Provisional directly to Independently Validated even if a reviewer is available immediately — the intermediate self-disclosure and traceability-documentation steps exist so a reviewer is checking documented reasoning, not producing it from scratch themselves (which would blur authoring and review into one role).

## 4. Regression Rule

A status is not permanent. If new evidence contradicts a prior classification (e.g. a future 2024+ AR-01 paper shows a previously-Independently-Validated Applied Reasoning item's format assumption was wrong), the item returns to Provisional Content and re-enters the chain — mirroring `KNOWLEDGE_GOVERNANCE.md` §11.3's "Conflicting Sources, Unresolved" pattern for admissions data, applied here to question-level evidence instead.

## 5. Relationship to the 29 Live Items

Per the Founder's Decision on migration 016: all 29 current `ali_question_bank` rows are, as of this document, **Provisional Content** — including the original 18, which meet the Practice Eligible bar under the Gap Analysis's existing standard but have not yet been checked against this Specification or independently reviewed, and the 11 migration-016 rows, which sit at the identical evidentiary stage. This document does not itself move any item's status — that is the subject of `RELEASE_1_EXISTING_CONTENT_AUTHENTICITY_REVIEW_PLAN.md`, not performed here.

## 6. What This Model Deliberately Does Not Do

- **Does not invent a database column, enum, or migration.** Per the Founder's explicit instruction, this is a governance model, not a schema change. A future, separately-approved implementation phase would decide how (or whether) to represent these five statuses in `ali_question_bank`.
- **Does not set a numeric threshold** for what counts as "balanced" Question-Type coverage at the Mock Eligible gate — that requires the Timing Strategy (Gate 5) and further Founder decision, not invention here.
- **Does not retroactively assess any of the 29 live items** against these statuses — see the companion Review Plan document.
