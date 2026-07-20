# Architecture Closure Report

**Programme Decision:** final architecture review of the complete "Angel Excellence Programme" (AEP) series — 16 documents that have sat uncommitted in the working directory, never merged with or checked against the CSSE-specific Assessment Brain V1 / Learning Engine V1 lineage this project has actively built and frozen this session.
**Purpose:** not more documentation — permanently close this architecture phase. One report, all 16 documents classified, valuable content migrated inline below (not spun into new files), originals archived.
**After approval:** this architecture is frozen. No further review of these legacy documents unless a critical defect is discovered. The programme moves into implementation mode.

---

## 0. A naming collision worth resolving before anything else

Two completely different things in this project's history share the identifier **"AEP-001"**:

1. **`AEP-001_LEARNING_SCIENCE_CONSTITUTION.md`** (this review's subject) — "**Angel** Excellence Programme," Discovery Wave Document 1 of 5, dated 2026-07-18, never committed.
2. **The real, committed, deployed AEP-001** — "**Academic** Excellence Programme, Phase 1" (commit `ddfebb5`, 2026-07-19) — a completely separate, already-shipped defect-correction effort, documented in the already-committed `AEP-001_EVIDENCE_PACKAGE.md`, unrelated to this review and **not** one of the 16 documents classified below.

These are unconnected efforts that happened to reuse the same three-letter ID one day apart. Stated here once, plainly, so no future session confuses them — the real, live one is `AEP-001_EVIDENCE_PACKAGE.md`; every other `AEP-*` reference in this report means the uncommitted Discovery Wave document.

**A second, directly relevant discovery made while verifying this:** the real, deployed AEP-001 (`ddfebb5`) exists specifically *because* it corrected the two critical defects `AXP-001_ACADEMIC_ASSESSMENT_REPORT.md` (document 8 below) found. Checked directly against the live code (`app/mocks/[pathway]/page.tsx`'s CSSE section, which now carries a code comment reading *"per `AXP-001_ACADEMIC_ASSESSMENT_REPORT.md` §6.2"*) — this is not a coincidence or a stale claim; AXP-001's core findings are **already fixed, live, in production.**

---

## 1. Classification Summary

| # | Document | Classification | One-line reason |
|---|---|---|---|
| 1 | `AEP-001_LEARNING_SCIENCE_CONSTITUTION.md` | **Reuse** | Pathway-agnostic pedagogical evidence base; nothing like it exists in the current architecture |
| 2 | `AEP-002_KNOWLEDGE_FRAMEWORK.md` | **Reuse** | Only real competency architecture for GL/CEM/ISEB/reasoning domains, which Assessment Brain V1 explicitly excludes (CSSE-only scope) |
| 3 | `AEP-003_QUESTION_INTELLIGENCE_FRAMEWORK.md` | **Reuse** | Question Lifecycle and Cognitive Demand (Bloom's) models are genuinely new, not duplicated anywhere |
| 4 | `AEP-004_LEARNING_JOURNEY_FRAMEWORK.md` | **Reuse** | Knowledge Maintenance / Durable Mastery / Recommendation Explanations fill real, still-open gaps |
| 5 | `AEP-005_ASSESSMENT_FRAMEWORK.md` | **Reuse** | 4-tier Evidence Confidence Model directly answers this session's own open "Confidence" question |
| 6 | `ARR-001_ARCHITECTURE_READINESS_REVIEW.md` | **Superseded** | Review document; its verification work is complete, its subject (AEP-001–005) is being archived |
| 7 | `AIW-001_EDUCATIONAL_DATA_MODEL.md` | **Reuse** | Its core proposal is already real, live schema (migration `010`) — reuse already happened; archiving the design doc that predicted it |
| 8 | `AXP-001_ACADEMIC_ASSESSMENT_REPORT.md` | **Reuse** | Two critical findings already fixed and deployed (`ddfebb5`); remaining content-gap findings still real and unaddressed |
| 9 | `EAW-002_LEARNING_INTELLIGENCE_ENGINE_ARCHITECTURE.md` | **Reuse** | Decision Boundaries (Automatic / Higher-Evidence-Required) and Explainability Model are genuinely new governance concepts |
| 10 | `EAW-003_ASSESSMENT_ENGINE_ARCHITECTURE.md` | **Reuse** | Three-audience Explainability tiering and Operational Events are clean, additive, reusable |
| 11 | `EAW-004_RECOMMENDATION_ENGINE_ARCHITECTURE.md` | **Reuse** | Eight-state Educational State model maps almost exactly onto this session's own paused Progression Intelligence deliverable |
| 12 | `EAW-005_IMPLEMENTATION_READINESS_ARCHITECTURE.md` | **Reuse** | Engineering Contracts pattern + 6-dimension Verification Strategy is a reusable governance template, independent of which educational model it applies to |
| 13 | `ERR-001_ENGINEERING_READINESS_REVIEW.md` | **Superseded** | Review document; both defects it found were corrected by document 14 |
| 14 | `EAW-ERR-HOTFIX-001_ENGINEERING_READINESS_DEFECT_CORRECTION_REPORT.md` | **Reuse** | Bundled with 9/11 — its corrections are the *correct* final version of Stage-0 pathway filtering and exam-date sourcing to extract, not the pre-correction originals |
| 15 | `IWP-001_IMPLEMENTATION_WORK_PACKAGE_STRATEGY.md` | **Superseded** | A 15-item implementation plan for the older, broader system; the active priority is the CSSE-specific chain, not this sequence — kept for reference if that work resumes, not as an active plan |
| 16 | `ANGEL_PROJECT_CLOSURE_REPORT.md` | **Superseded** | Not actually part of the AEP series — an unrelated, much older (2026-07-03) closure report, entirely overtaken by every session since |

**Remove: zero documents.** None of the 16 contradicts or undermines the Angel product mission — every one is either genuinely valuable (Reuse) or a completed review whose findings are already incorporated elsewhere (Superseded). Forcing a Remove classification where none is warranted would misrepresent real, careful work as worthless; none of it is.

---

## 2. Reuse — extracted content, migrated here (not into new files, per this review's own "not more documentation" instruction)

### From AEP-001 (Learning Science Constitution)

The pedagogical evidence base has no equivalent anywhere in Assessment Brain V1 / Learning Engine V1, which describe *what* CSSE assesses and *what evidence* a learner has shown — never *how* learning science says content should be sequenced, spaced, or fed back on. The following principles are adopted as standing, evidence-rated pedagogical constraints on all future Angel work, regardless of pathway:

- **Retrieval practice over passive review** (Strong) — every practice interaction must ask for unaided production, never re-reading.
- **Spacing/spaced retrieval** (Strong) — already reflected in ALI's cooldown mechanism; the constitution formalises cooldown as a spacing instrument, not just anti-repetition.
- **Interleaving, subject-dependent** (Moderate, strongest for Maths/reasoning) — do not apply a uniform interleaving rule across English and Maths alike.
- **Cognitive load / worked examples** (Strong) — new content needs a worked model before independent practice.
- **Feedback must be specific, never a bare score** (Strong) — already the direction Assessment Brain V1/Learning Engine V1 independently took (competency-named, not percentage-named); this is now a doubly-confirmed principle from two independent evidence chains.
- **Growth-mindset messaging is explicitly rejected** (Contested — do not build slogans/streak-based motivation on this basis); **effort-specific feedback is retained** on the stronger, separate evidence base.
- **Self-determination theory: no loss-aversion/streak-shaming mechanics** — directly corroborates this session's own `ANGEL_V1_PRODUCT_EXPERIENCE_IMPLEMENTATION_AUDIT.md`/`_COMPLETION_REPORT.md` finding that XP/Streak UI needed removing; this document supplies the *why*, independently arrived at, for a correction this session already made for different (Product Experience) reasons.
- **Metacognitive scaffolding, not delegation, for 8–11-year-olds** (Moderate) — a young learner should not be asked to self-rate confidence or choose what to practise unaided.
- **Anxiety ceiling / Educational Safety Principle** (Strong/Constitutional) — *no feature may increase anxiety for a short-term score gain, ever, regardless of evidence strength for the underlying technique.* This is the single most important standing constraint to carry forward — it directly governs how any future "Speed" or "Confidence" dimension (flagged as open in this session's own `LEARNING_INTELLIGENCE_FRAMEWORK.md`) may ever be surfaced, if at all.
- **Intellectual Curiosity Principle** — enrichment activities outside the exam spec are legitimate and should never be silently repurposed as disguised drilling.
- **Learning Transfer Principle** — transfer must be explicitly designed for, not left incidental (directly relevant to this session's own Recommendation Engine Specification's "System A vs System B" duplication finding — transfer-aware recommendation is a real, named gap in both systems).

### From AEP-002 (Knowledge Framework)

Its 63-code competency taxonomy (Verbal/Non-Verbal/Spatial/Numerical Reasoning, English, Vocabulary, Mathematics, Writing) is the **only competency architecture that exists for GL/CEM/ISEB and the four reasoning domains** — Assessment Brain V1 is explicitly CSSE-only and does not cover them. Retained as the standing reference for any future GL/CEM/ISEB competency work, distinct from and not overriding Assessment Brain V1's CSSE-specific model. Its Terminology Governance rule (never call Angel's own `numreason` content "Numerical Reasoning" publicly, since that term is CEM's own combined-paper name) is adopted as a standing content-naming rule. Its Grammar School Readiness Definition (five dimensions, later six with Learning Independence) is a genuinely well-constructed, pathway-relative readiness concept, richer than this session's own CSSE-only Readiness Model — worth a future reconciliation pass once GL/CEM/ISEB gain their own Assessment-Brain-equivalent models.

### From AEP-003 (Question Intelligence Framework)

Two concepts adopted as standing, pathway-agnostic additions:
- **Question Lifecycle**: Authored → Reviewed → Imported → Live/In-Rotation → Calibration-Monitored → Flagged for Review → Retired. Directly extends this session's own `CSSE_QUESTION_TAXONOMY.md` schema (Deliverable 3, ANGEL-CSSE-001), which defined fields but not a lifecycle.
- **Cognitive Demand Levels** (Bloom's Taxonomy: Remember/Understand/Apply/Analyse/Evaluate/Create) — genuinely distinct from Difficulty (how hard within a type) and from this session's own Knowledge/Skill/Reasoning classification (`LEARNING_INTELLIGENCE_FRAMEWORK.md` §2.3). Worth reconciling the two classification schemes in a future pass rather than running both unreconciled.

### From AEP-004 (Learning Journey Framework)

- **Knowledge Maintenance Model / Durable Mastery**: a competency can decay silently; "Mastered" (threshold met) and "Durably Mastered" (survived a genuine post-gap Maintenance Review, plus transfer corroboration where a real link exists) are usefully distinct states. This is a real, missing capability — Learning Engine V1 §3.6 (Historical Progress) is explicitly descriptive-only with no persistence mechanism; this Durable Mastery concept is the concrete design that mechanism has been missing.
- **Recommendation Explanations** ("why is Angel suggesting this," in plain parent language) — independently identified in this session's own `RECOMMENDATION_ENGINE_SPECIFICATION.md` as a real gap between the two live recommendation systems; this document's design (grounded in transfer/examination-map evidence, never exposing mechanism) is a ready-made answer.

### From AEP-005 (Assessment Framework)

**The 4-tier Assessment Confidence Model (High / Moderate / Low / Insufficient Confidence)** directly resolves the open "Confidence" question this session's own `LEARNING_INTELLIGENCE_FRAMEWORK.md` §2.5 flagged and explicitly declined to build unilaterally. This document already built it — for a different (older, broader) system, but the model itself is pathway-agnostic and directly adoptable: a per-conclusion tier, computed from evidence only (attempt count, session-distinctness, time-spread, cross-context corroboration), never a psychological construct — precisely satisfying this session's ANGEL-CSSE-002 Deliverable 6 instruction ("Do not use psychological confidence. Use Evidence Confidence based only on observed performance"). Adopted as the answer to that open question. Also adopted: the **"readiness confidence is the minimum, not the average, of its dimensions"** rule — a rigorous, non-gameable design that directly improves on a simple average.

### From AIW-001 (Educational Data Model)

Its `DurableMasteryRecord` and `EducationalAuditRecord` illustrative shapes are, field-for-field, what migration `010_ali_persistence_layer.sql` already built as `ali_durable_mastery` and `ali_educational_audit` — confirmed by direct comparison. **This is not a proposal to migrate; it is confirmation that the proposal was already, separately, correctly implemented.** This session's own `ENTERPRISE_DATA_MODEL.md` (ANGEL-CSSE-001 Deliverable 8) already flagged these two tables as "very likely the correct existing home" for Historical Progress persistence — that flag is now resolved: they are exactly that, and were designed for exactly that purpose, by this same programme, previously.

### From AXP-001 (Academic Assessment Report)

Its two critical findings (synthetic-fixture non-disclosure, mock-exam wrong-content-bank sourcing) are fixed and live (§0 above). **Its remaining findings are real and not yet addressed anywhere else:** English/Writing/Vocabulary content volume is critically thin (10/4/12 items respectively); the 172-question Reasoning bank has no difficulty field at all; Vocabulary's schema cannot represent 7 of its own 10 named competencies. These should be added to a live backlog (this project already has `CURRICULUM_GAP_REGISTER.md` as the natural home, referenced but not reproduced here) rather than left to rot in an archived document.

### From EAW-002 (Learning Intelligence Engine Architecture)

- **Decision Boundaries**: a two-tier governance rule — *Automatic* decisions (revision recommendations, spacing/cooldown timing, transfer nudges) need only Low Confidence or above; *Higher Evidence Required* decisions (mastery declarations, Durable Mastery, any readiness claim, any definite-language parent statement) need High Confidence specifically, and cross-subject/transfer evidence alone can never satisfy this tier on its own. This is a genuinely valuable, adoptable rule for any future Recommendation Engine consolidation (this session's own `RECOMMENDATION_ENGINE_SPECIFICATION.md` System A/B duplication finding).
- **Explainability Model** — every recommendation must be able to answer three questions: what evidence supports it, why now, what would change it. Directly extends this session's own Recommendation Engine spec, which covered the first two ("why recommended," "evidence supporting") but never the third.

### From EAW-003 (Assessment Engine Architecture)

**Three-audience Explainability tiering** (Learner: encouraging, no mechanism; Parent: plain-language reasoning, the `recommendationExplanation` register; Engineering/Audit: full raw evidence) — a clean, directly reusable refinement of this session's own Parent Intelligence Specification's "never show raw codes" rule, now with an explicit third tier for engineering/audit use that this session's documents never separately named. **Operational Events** (lightweight, no-evidence-payload logging for Automatic-tier decisions, distinct from a full Educational Audit Record) is a genuinely useful, low-cost logging pattern with no current equivalent.

### From EAW-004 (Recommendation Engine Architecture)

**The eight-state Educational State model** (Exploring → Building Knowledge → Practising → Reinforcing → Mastered → Durably Mastered → Reviewing → Rebuilding) is the single most directly reusable concept in the entire 16-document set — it maps almost exactly onto this session's own paused ANGEL-CSSE-002 Deliverable 7 (Progression Intelligence: progression / revision / remediation / increased challenge / review scheduling). **Wellbeing as a non-negotiable ceiling, stated to bind with *greater*, not lesser, force as exam pressure rises** — the single clearest, most quotable safety rule in the whole legacy set, worth carrying forward verbatim into any future progression/recommendation work.

### From EAW-005 (Implementation Readiness Architecture)

**Engineering Contracts** (every component declares: required evidence, permitted decisions, expected outputs, explicit constraints, what it must never do) and the **6-dimension Verification Strategy** (technical correctness, educational correctness, explainability, trust, wellbeing protection, existing-behaviour regression) — a reusable governance template for verifying *any* future implementation phase of the current, CSSE-specific architecture, not tied to the older system it was written for.

### From EAW-ERR-HOTFIX-001

Bundled with EAW-002/EAW-004 above — its two corrections (an explicit, mandatory Pathway Eligibility Filter as Stage 0 of any recommendation pipeline, run before candidate generation, never merely de-prioritising; and `target_exam_date` as its own explicit, optional, parent-supplied field, never assumed implicit in pathway selection) are the *correct* versions of those two concepts to reuse, not the pre-correction ones in the original EAW-002/004 files.

### From AXP-001 and IWP-001 (Superseded/Reuse boundary note)

IWP-001's specific 15-work-package sequence is Superseded (not the active plan), but one general sequencing principle is worth retaining regardless of which system it applies to: **a pathway/domain eligibility filter must exist and be verified before any recommendation-orchestration work begins on top of it** — this is exactly the class of dependency this session's own `RECOMMENDATION_ENGINE_SPECIFICATION.md` flagged as unresolved between System A and System B.

---

## 3. Superseded — archived without extraction

- **`ARR-001_ARCHITECTURE_READINESS_REVIEW.md`** — verification-only; confirmed AEP-001–005's internal consistency, found and fixed one wording defect. Its job is complete now that AEP-001–005 are themselves archived.
- **`ERR-001_ENGINEERING_READINESS_REVIEW.md`** — verification-only; found two real defects, both corrected by `EAW-ERR-HOTFIX-001`. Its job is complete.
- **`IWP-001_IMPLEMENTATION_WORK_PACKAGE_STRATEGY.md`** — a real, well-reasoned 15-item sequencing plan, but for the older, broader system's implementation, which is not the active priority. Kept for reference, not as a live plan; one general principle extracted above.
- **`ANGEL_PROJECT_CLOSURE_REPORT.md`** — not part of the AEP series at all (2026-07-03, a different, much earlier project milestone). Entirely overtaken by this session's own real, verified work (RR-001, RR-002, the Product Experience programme). Archived as historical record only.

---

## 4. Archive

All 16 documents physically relocated to `docs/archive/angel-excellence-programme-2026-07-18/`, preserved verbatim (no edits) as the historical record this report's classifications and extractions are checkable against. Per this review's own instruction, none were committed to GitHub until this report was complete — this is the first commit touching any of them.

---

## 5. Open question for the Founder, not decided unilaterally here

This session was, prior to this review, mid-way through **ANGEL-CSSE-002** (Educational Intelligence Engine) — an 8-document specification work package whose deliverables (Competency Graph, Dependency Graph, Assessment/Learning/Evidence/Progression Intelligence, Exam Intelligence Boundary) substantially **overlap with what Section 2 above has now extracted from the legacy set**, particularly the Decision Boundaries model, the 8-state Educational State model, and the 4-tier Confidence Model. Given this report's own closing instruction — *"the programme moves into implementation mode... future work should be focused primarily on building production functionality rather than creating additional documentation"* — this report recommends **not resuming ANGEL-CSSE-002's original 8-document plan**, since its most valuable content now already exists here, extracted and reconciled against real, live schema. What remains genuinely undecided, and is a Founder call, not this report's to make: whether any further formal specification is wanted before implementation begins, or whether Section 2 above is sufficient to build from directly.

---

## 6. What this closure report is not

It does not implement any of the extracted concepts (no code, no migration, no new schema). It does not resolve the CSSE-vs-broader-pathway competency reconciliation Section 2 flags as a future task. It does not populate `CURRICULUM_GAP_REGISTER.md` with AXP-001's still-open content-volume findings — named as a recommended next step, not performed here, consistent with this review's own "not more documentation" instruction.
