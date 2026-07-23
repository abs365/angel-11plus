# ADR-001: Recommendation Platform

**Angel 11+, Phase 4, Sprint 4**
**Status:** Founder Approved (kickoff). Decision record only. No code implemented or modified against this document.
**Context this ADR resolves:** flagged as Opportunity E in `EDUCATIONAL_EXCELLENCE_BLUEPRINT_V1.md` §5/§9/§10, and explicitly left open by `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §8.3: *"a separate, older, flat-score-based system (`lib/adaptiveEngine.ts`, the Daily Mission engine, covering every subject/pathway) remains outside this document's scope — consolidating the two is a future implementation decision this specification does not make, restated not resolved."* This ADR makes that decision.

---

## 1. Current Recommendation Architecture

Two real, independently-maintained implementations exist today:

| | `lib/learningEngine/recommendations.ts` | `lib/adaptiveEngine.ts` |
|---|---|---|
| Scope | CSSE only | All pathways (CSSE, GL, CEM, ISEB, Independent, etc.) |
| Size/shape | 61 lines, one pure function | 492 lines, tier/urgency/reason-text machinery |
| Input | Evidence Signal × Evidence Tier per competency, Diagnostic Findings (`LEARNING_ENGINE_V1.md` §4, §7) | Flat `avgScore`/`status` per subject (`AnalyticsReport`), plus a narrow, partial bridge (`aliCompetencySignal`) that overrides urgency/reason-text for subjects with real ALI competency data — currently effective mainly for Verbal Reasoning |
| Output | 4 of Learning Engine V1's 5 categories (Practice, Consolidation, Revision, Extension) — Review deliberately withheld, no persistence for it existed until this Foundation | A ranked Daily Mission (primary/secondary/review items), ordering *is* computed and implied — the opposite of `recommendations.ts`'s explicit "no priority ordering" rule |
| Real callers | `/learning-intelligence/*` (Learner Dashboard, Recommendation Centre, Mock Exam) | The Learn Hub's Daily Mission card — including CSSE's own `/english`, `/maths`, `/vocabulary`, `/writing` practice pages |
| Evidence store | `ali_student_question_history` / `ali_educational_audit` | `lib/progress.ts` (localStorage, synced to `user_stats`/`lesson_progress`) |

**A material fact changes the calculus since the Foundation's §8.3 was written:** the evidence layer these two systems read from is no longer as fully separate as that section describes. `lib/learningEngine/legacyPracticeEvidence.ts` (built under the same-day Educational Intelligence Foundation Integration Correction) now wires the legacy CSSE practice pages (`/english/[id]`, `/maths`, `/vocabulary`, `/writing`) to also write real evidence into `ali_student_question_history` via the same `recordPresentation → recordOutcome → processEvidenceForCompetency` path `/learning-intelligence/practice` already uses — gated honestly on whether the specific question is tagged in `ali_question_bank` (18 rows today). **Evidence collection is already converging in practice; recommendation computation is not.** This is the gap this ADR addresses.

## 2. Educational Differences

Genuinely pathway-specific, and must remain so under any future architecture:

- **Which competency/evidence model applies.** CSSE has a real Assessment-Brain-equivalent (13 competencies, 27 Question Types, evidence-rated from 17 real exam-paper assets). GL/CEM/ISEB rest on a materially weaker, non-reconciled taxonomy (63 codes, practitioner convention, not real exam papers — `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §4). This is a genuine, evidence-grounded difference in *what can be claimed*, not a cosmetic one.
- **Which subjects/reasoning domains are eligible at all.** CSSE never tests Verbal/Non-Verbal/Spatial/Numerical Reasoning; GL/CEM/ISEB do, in varying combinations. Already correctly handled by one shared function (`getEligibleSubjectKeys()`), not duplicated per pathway — this is the right pattern to keep, not a problem to fix.
- **Subject-specific reason-text copy.** Per-subject wording ("Verbal Reasoning appears in GL, CEM and ISEB…") is legitimately content, not logic, and should remain pathway/subject-configurable data under any converged platform.
- **Evidence-tier ceiling per competency/board.** A converged platform must still let a pathway with weaker underlying evidence honestly report lower-confidence conclusions than CSSE — the platform must not flatten this difference, only host it consistently (Section 4).

## 3. Shared Behaviour

Should remain common across every pathway under any future architecture, with no per-pathway variation permitted:

- **The definition of evidence itself** — Evidence Signal, Evidence Tier (ET-0–4), Diagnostic categories (Strengths/Development Areas/Emerging/Mastered/Low Confidence) — one model, reused, never re-derived per pathway (`LEARNING_ENGINE_V1.md` Principles 1–4).
- **The Educational Safety Principle (Wellbeing veto)** — binds identically regardless of pathway or exam proximity; must not be a pathway-configurable rule.
- **"Absence of evidence is not evidence of absence"** — an untested subject/competency must never default to a weak or negative status in any pathway's recommendations, including `adaptiveEngine.ts`'s "not-started" handling today.
- **No forecasting, no percentile, no peer comparison** — `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §13's boundaries apply to every pathway's recommendation output equally.
- **Explainability** — every recommendation, from every pathway, must be able to answer what evidence supports it, why now, and what would change it, for three audiences (§9) — today only `recommendations.ts`'s output reliably can; `adaptiveEngine.ts`'s reason-text templates are copy, not evidence-traced explanation.
- **Ordering/priority policy** — if recommendations are ranked (as `adaptiveEngine.ts` does today, and `recommendations.ts` explicitly does not), that policy must be one documented rule applied consistently, not an artifact of which of the two systems happens to serve a given pathway.

## 4. Long-term Recommendation Strategy

**Recommendation: converge on one Recommendation Platform with pathway-specific educational rules.**

Not: maintain two separate implementations indefinitely.

The convergence is architectural, not evidentiary: one platform, one shared core (Section 3's behaviours as fixed logic), parameterised per pathway by whichever Assessment-Brain-equivalent that pathway actually has (Section 2's differences as data, not forked code) — exactly the extensibility mechanism `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §4 already specifies for pathway extension: *"a new pathway gains Educational Intelligence coverage the moment it has its own Assessment-Brain-equivalent... no pathway's Educational Intelligence coverage may ever be inferred from another pathway's."* A converged platform does not give GL/CEM/ISEB false rigor — it gives CSSE's already-rigorous model, and any future pathway's equivalent, one home instead of two diverging ones.

## 5. Founder Recommendation

**Converge, and do it before further pathway-specific recommendation work is built on either existing system.** Evidence:

1. `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §8.3 already names this exact consolidation as an open decision, not a hypothetical one — this ADR is that decision, not a new proposal invented here.
2. The evidence layer has already started converging in practice (Section 1's `legacyPracticeEvidence.ts` finding) — proof that bridging these systems is tractable, and a natural forcing function to decide the recommendation layer now rather than let a third informal bridge (`aliCompetencySignal`, already a partial, subject-scoped patch) become a fourth.
3. Every additional feature built directly onto either system while undecided (e.g. Sprint 4's proposed Review category, `EDUCATIONAL_EXCELLENCE_BLUEPRINT_V1.md` §6.1) compounds future migration cost — the longer convergence is deferred, the more there is to reconcile later.
4. Convergence does not require, and must not attempt, closing Section 2's genuine educational differences — GL/CEM/ISEB's weaker evidence base is a real, disclosed limitation (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §4) that a converged platform must continue to honestly represent, not paper over.

This ADR makes the decision only. Scoping, sequencing, and design of the converged platform itself is separate future work, not authorised by this document.

---

**Version History**

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-07-23 | Created. Resolves the open Recommendation Model consolidation question (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §8.3, `EDUCATIONAL_EXCELLENCE_BLUEPRINT_V1.md` Opportunity E): converge on one Recommendation Platform with pathway-specific rules, rather than maintain `lib/adaptiveEngine.ts` and `lib/learningEngine/recommendations.ts` as separate systems. No code. |
