# ANGEL_CONTENT_SCALE_GATE_V1

**Prepared:** 2026-08-12, Angel 11+ Completion Programme, Continuation Directive 002.
**Purpose:** determine whether controlled content scaling may begin, and under what constraints, per the Founder's explicit "Content Scale Gate" control.

## 1. Gate requirements and current status

| Requirement | Status | Evidence |
|---|---|---|
| Canonical competency mapping | **MET** | `lib/learningEngine/assessmentBrainMap.ts`, 13 competencies, transcribed from `ASSESSMENT_BRAIN_V1.md` §3/§9; frozen, in production use |
| Canonical archetype model | **PARTIALLY MET** | `RELEASE_1_CSSE_AUTHENTIC_QUESTION_SPECIFICATION.md` has full 20-field depth for 6 Tier-1 Question Types (QT-RC-01, QT-RC-02, QT-MR-03, QT-MR-06, QT-MR-09, QT-MR-12); the remaining 21 types have AEP-004's shallower depth only. Sufficient to begin authoring for the 6 Tier-1 types; not yet sufficient for the other 21. |
| Provenance controls | **MET (documentation), NOT MET (schema)** | Traceability chain is well-documented (Specification §6) and followed in practice (every `explanation` field in migrations 021/023/025/029 cites a specific real evidence basis); but `ali_question_bank` has no dedicated provenance column — provenance currently lives in free-text `explanation`, not a structured, queryable field |
| Copyright classification | **MET (discipline), NOT MET (schema)** | Specification §7 states the discipline clearly (no CSSE wording/passages/numbers reproduced) and it has been followed in every sampled item; no `content_origin`/`rights_status` column exists to enforce or audit this at the database level |
| Deterministic answer validation | **MET** | Every sampled item has a single, hand-verified `answer` field; the Guided/Independent Check ladders in the Mathematics Reference Vertical hand-verify answers before migration (documented per-migration in SQL comments) |
| Controlled variation | **NOT MET** | No template/parameter-constrained generation system exists (Content Sufficiency Standard §3, layer C) |
| Duplication detection | **NOT MET** | No automated near-duplicate check exists; reliance is entirely on individual authoring care |
| Difficulty classification | **PARTIALLY MET** | `content_difficulty` enum exists and is populated on every row (`medium`/`hard`/`year5-core`/`year5-advanced` — inconsistent vocabulary across batches, itself a minor cleanup item); no calibration against real learner performance exists (`avg_success_rate` is null on every row) |
| Misconception mapping | **PARTIALLY MET** | `addresses_misconception` column exists but is populated on 0/46 rows; the Mathematics Reference Vertical's own lesson pages implement real, working misconception classification in application code (`classifyWrongAnswer()`), just not yet reflected back into the content-bank schema |
| Exposure compatibility | **PARTIALLY MET** | `ali_student_question_history` (the real evidence table) tracks `times_seen`/`times_correct`/`last_presented_at` per item per learner — a genuine, working exposure-tracking mechanism, confirmed live in this session's own Lesson 002 verification. Bank-level "how many items has this learner not yet seen" logic exists (`selectQuestions()` in the session generator) but is subject-scoped, not competency- or archetype-scoped |
| Practice/Mock eligibility separation | **PARTIALLY MET** | The five-status model defines this conceptually; no code enforces it yet — nothing currently prevents a Provisional Content item from being served in a mock context, because mocks do not yet read eligibility status at all (§ Mock Integrity Checkpoint, below) |
| Automated validation | **NOT MET** | No CI/build step validates a new question row's schema, answer computability, or duplicate-similarity before it reaches production; migrations are hand-reviewed only |
| Human educational review workflow | **NOT MET (as workflow), MET ONCE (as evidence)** | The Eligibility Model defines the review step; `RELEASE_1_VALIDATION_STRATEGY.md`'s "no self-certification" rule is sound; but no *tooling* exists to route an item to a reviewer, and zero of the 46 live items have completed this step (see Content Inventory §1's Provisional-Content-for-all finding) |
| Versioning | **NOT MET** | No version field on `ali_question_bank` rows; a corrected item silently overwrites, or more commonly a new ID is minted (`*-retry` suffix pattern) rather than tracked as a revision |
| Retirement | **NOT MET** | No retirement/inactive flag exists; a row can only be removed by deletion, which would break existing learner evidence history (`ali_student_question_history` foreign-keys on `question_id`) — retirement needs a soft-delete mechanism before it can be used safely |
| Auditability | **PARTIALLY MET** | Every migration file is a permanent, reviewable SQL record with a disclosed rationale in its header comment — strong for *how content arrived*; weak for *what changed after arrival*, since there is no per-row change log |

## 2. What may be generated automatically right now

**Nothing.** No controlled-variation/template system exists (layer C, Content Sufficiency Standard). Any "automatic generation" today would mean an LLM call per item with no deterministic answer guarantee and no duplicate check — exactly the failure mode the wider directive's §6/§20 warn against.

## 3. What requires human review before it can be trusted

Every new item, for every competency, until:
1. A template/parameter-constrained generation approach exists with a deterministic, code-verifiable answer function (not "the LLM said so"), **and**
2. A basic duplicate-similarity check exists, **and**
3. At minimum one external (non-author) educational review has happened for a representative sample of that competency's authoring pattern, establishing the pattern is sound before it's used to generate many instances of it.

## 4. What cannot yet be safely generated

- **AR-01 (Applied Reasoning)** — Gate 3 remains deferred; no post-2024 CSSE English paper has been acquired to confirm the format is still current. Authoring here would be speculative, not evidence-based. **Do not author until this is resolved** (a genuine stop condition, not a workflow gap).
- Any Question Type among the 21 not yet given full 20-field Specification depth, if the intent is to reproduce authentic CSSE-pattern items rather than generic maths/English practice — the finer wording/reasoning-step/burden fields that distinguish "authentic-pattern" from "plausible-but-generic" don't exist yet for those types.
- Continuous Writing (WC-01/WC-02) via this table specifically — real writing prompts live in `data/*.ts`, not `ali_question_bank`; scaling writing content is a different mechanism from scaling the question bank and is out of this Gate's scope.

## 5. GATE RESULT: CONDITIONAL

**Content scaling may begin, narrowly, under these conditions:**

1. Scope the first controlled increment to **one competency**, chosen from the highest-value gap identified in the Content Inventory (§4) — **MR-06** (zero coverage, EMC-4, Established evidence) or completing **MR-02** (EMC-4, only 2 items) are the two strongest candidates, not a blanket "generate everything" pass.
2. That increment must still be **hand-authored, individually verified** content, exactly like the 46 items that already exist — the Gate is CONDITIONAL specifically because the *automatic* generation infrastructure (layers C, duplicate detection, automated validation) does not exist yet. Scaling the *number of hand-authored items* for one high-value competency is safe today; scaling via automated generation is not.
3. Any item authored under this conditional pass should populate `addresses_misconception` and cite its evidence basis in `explanation`, closing part of the schema gap identified in §1, even though the full provenance/versioning schema work remains a separate, later increment.
4. Do not touch AR-01.
5. Do not attempt Question Types outside the 6 Tier-1 types without first extending the Specification's 20-field depth to that type (Specification §4's own stated next step) — authoring against AEP-004's shallower depth alone risks the "generic, not authentic-pattern" failure mode the whole Specification exists to prevent.

This is not a FAIL, because real, usable evidence and architecture already exist and a safe, bounded next step is available. It is not a PASS, because the automated-generation, duplication-detection, versioning, and retirement infrastructure the wider Completion Programme will eventually need does not exist yet, and claiming otherwise would misrepresent the platform's actual capacity.
