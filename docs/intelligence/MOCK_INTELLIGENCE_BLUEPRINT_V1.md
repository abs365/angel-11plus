# Mock Intelligence Blueprint — Version 1.0

**Work Package:** Phase 4, Mock Intelligence Blueprint Implementation (2026-07-23).
**Status:** Frozen on approval. Governs all future mock examination development. Fourth member of the canonical `docs/intelligence/` family — sibling to `ASSESSMENT_BRAIN_V1.md`, `LEARNING_ENGINE_V1.md`, and `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md`, all three unchanged and untouched by this document.

---

## PART A — BLUEPRINT

### 1. What this document is, and is not

**Mock Intelligence is not a new engine.** It is the pathway/attempt-shaped surface through which learners exercise the Educational Intelligence Engine already specified and frozen in `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md`. Every mechanic that document defines — Evidence Tier, Educational State, Decision Boundaries, the Recommendation Model, Explainability, Parent Intelligence — governs mock examinations exactly as it governs any other practice surface, unchanged and unrestated here except where cited.

This document does two things only:
1. **Maps** each of the seven named consumption points (Section 3) onto the real, already-built code that implements them — evidenced by file path and function name, not asserted.
2. **Names the one genuinely mock-specific concept** this domain needs that the Educational Intelligence Engine does not already provide (Section 6) — kept deliberately minimal.

Nothing here is a new scoring engine, a new readiness calculation, or a new evidence model. Where existing mock code is found to duplicate or bypass the canonical engine (Section 7), this document's role is to say so plainly and set the governing rule going forward — not to build a third parallel system to reconcile the first two.

### 2. Scope Boundary — Mock Intelligence vs. Educational Intelligence vs. Exam Intelligence

Following `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §4's own pattern exactly:

- **Educational Intelligence** (competency evidence, confidence, state, decisions) is pathway-agnostic and already fully specified. Mock Intelligence does not redefine any of it.
- **Exam Intelligence** (which competencies exist, how a board grades them) is Assessment Brain V1, **CSSE-only today**, built from 17 real exam-paper assets. GL/CEM/ISEB have no Assessment-Brain-equivalent yet — only a weaker, non-reconciled 63-code taxonomy (archived AEP-002 material, cited in `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §4).
- **Mock Intelligence** (this document) is narrower than both: it is the **attempt-shaped presentation and record-keeping layer** — timed sections, exam-board structure, a mock's start/finish/score — that sits on top of Exam Intelligence and Educational Intelligence without adding any competency, confidence, or readiness logic of its own.

**Binding consequence of this scope boundary**: a mock examination may only produce Educational-Audit-level conclusions (mastery, durable mastery, readiness dimensions) for content whose competency tag derives from a real Assessment-Brain-equivalent. In practice, today, that means **CSSE-tagged content only**. A GL, CEM, or ISEB mock may still feed the Evidence Engine (Section 3.3 — raw question-history facts are pathway-agnostic and harmless to record), but must not produce a mastery or readiness conclusion until that pathway has its own Assessment-Brain-equivalent, per `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §4's extensible pattern. **No pathway's mock-readiness may be inferred from another's.**

### 3. Consumption Map — what Mock Intelligence consumes, and where it already lives

Every item below is existing, already-built code. File paths and function names are the evidence; nothing here is proposed as new unless explicitly marked so.

#### 3.1 Educational Intelligence Engine
The full specification — Evidence Confidence, Educational State, Decision Boundaries, Explainability — governs mocks unchanged. `docs/intelligence/EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md`, cited, not reproduced, not touched.

#### 3.2 Assessment Engine
The exam model and content store: Assessment Brain V1's 13 competencies / 27 Question Types (CSSE), realised as `ali_question_bank` and read via `fetchQuestionBank(supabase, subject, pathway)` (`lib/ali/questionBank.ts:37`), which filters by `MockPathwayId` using `.contains("pathway", [pathway])`. Question selection for adaptive mock assembly reuses `selectQuestions()` (`lib/ali/selection.ts`) and `deriveWeakCompetencies()` (`lib/ali/weakness.ts`) via `buildAdaptiveSection()` (`lib/adaptiveMockBuilder.ts`) — already correctly described in that file's own header as "the sole consumer of `lib/ali/*`... mock assembly is one consumer of Angel Learning Intelligence, not the whole system." **This is the correct reuse pattern and the template for all future mock content assembly.**

#### 3.3 Evidence Engine
Raw per-question outcomes: `recordPresentation()` and `recordOutcome()` (`lib/ali/history.ts:95,166`), writing `ali_student_question_history` and `ali_student_adaptive_state`. Pathway-agnostic — safe to call for any mock, any pathway, since it records only observable facts (seen, correct, session), never a competency conclusion.

#### 3.4 Durable Mastery
`applyAttemptOutcome()` (`lib/ali/mastery.ts`) computing distinct-session mastery evidence; persisted in `ali_durable_mastery` (migration `010`) via `lib/ali/persistence/durableMasteryStore.ts`. Consumed indirectly — a mock's per-question `recordOutcome()` call is what feeds this; no mock-specific durable-mastery logic exists or is needed.

#### 3.5 Educational Audit
`processEvidenceForCompetency()` and `recordAuditIfNewlyHigherEvidence()` (`lib/learningEngine/educationalIntelligenceService.ts:180,244`), writing `ali_educational_audit` via `insertAuditRecord()` — the single mechanism by which any surface, mock or otherwise, produces a "mastery"/"durable-mastery" conclusion. **Verified live in production this session** (ARCH-001/Gate 7): a real browser session crossing a mastery threshold produced real `ali_educational_audit` rows with no mock-specific code involved.

#### 3.6 Readiness Engine
`recordReadinessSnapshot()` (`lib/learningEngine/learningHistory.ts`), writing `readiness-dimension` rows to the same `ali_educational_audit` table (Readiness is not a separate table — it is a `conclusion_type` on the one Educational Audit ledger, Section 4 below). `fetchLearnerIntelligenceProfile()` (`lib/learningEngine/profile.ts`) is the read side, consumed by the Parent Mock Readiness page. `assessMockReadiness()` (`lib/learningEngine/mockReadiness.ts`) is the one mock-specific function in this area — its own header states it is "a pure categorical dispatch over already-real, already-computed facts... zero arithmetic, zero new numeric thresholds." **This is the correct pattern: mock readiness reads the Readiness Engine's output, it does not compute its own.**

#### 3.7 Parent Intelligence
`PARENT_INTELLIGENCE_SPECIFICATION.md`'s absorbed conclusions (cited via `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §10) govern what a mock-readiness page may show a parent. The real implementation, `app/learning-intelligence/parent/mock-readiness/page.tsx`, is already compliant: it calls `fetchLearnerIntelligenceProfile()`, `getRecommendations()`, and `assessMockReadiness()` and computes nothing of its own — its own header states "every section reuses already-real, already-computed data."

### 4. The One Evidence Flow

There is exactly one path by which a learner's mock activity becomes competency evidence, and every compliant mock surface must follow it in this order:

```
Question answered
  → recordPresentation() + recordOutcome()        [Evidence Engine, §3.3]
  → applyAttemptOutcome()                          [Durable Mastery, §3.4, inside recordOutcome()]
  → processEvidenceForCompetency()                 [Educational Audit, §3.5 — only if a real competency resolves]
  → (session end) recordReadinessSnapshot()         [Readiness Engine, §3.6]
  → ali_educational_audit                          [single ledger for both mastery AND readiness conclusions]
```

No mock surface may write a mastery, durable-mastery, or readiness conclusion anywhere other than `ali_educational_audit` via the functions above. No mock surface may compute its own confidence tier, evidence signal, or readiness band. **`ali_question_bank`'s `mastery_threshold`, evidenced and already live, is the only threshold any mock may use — no mock-specific threshold may be introduced.**

### 5. The One Readiness Model

Readiness has exactly one source: `recordReadinessSnapshot()` writing `readiness-dimension` rows to `ali_educational_audit`, read back through `fetchLearnerIntelligenceProfile()`. `assessMockReadiness()` is a **read-through dispatch**, not a second readiness model — it classifies (has evidence? how many mock attempts? what's the top recommendation trigger?) without computing a new band, tier, or score. Any future mock feature that needs a "can this learner sit a mock now" verdict must extend `assessMockReadiness()`'s categorical inputs, never introduce a parallel readiness number.

### 6. The one genuinely new concept: the Mock Attempt Ledger

Everything above is competency-level and pathway-agnostic. Mocks additionally need one thing the Educational Intelligence Engine has no reason to model: **a record of the attempt itself** — which mock, which pathway, section-by-section score, timing, completion state. This is operational metadata, not competency evidence, and keeping it distinct from `ali_educational_audit` is deliberate, not an oversight — an attempt record answers "what did the learner do," never "what does the learner know."

**Current state (found, not proposed)**: this already exists as `MockResult`/`MockSectionResult` (`types/mock.ts`), persisted via `lib/mockProgress.ts` — but as **localStorage only, no Supabase table**, and split into a second, parallel localStorage key (`lib/adaptiveMockProgress.ts`'s `AdaptiveMockResult`) that the two halves of the mock system do not read from each other. Section B2 below addresses this as the one real gap this Blueprint identifies.

### 7. Governing rule: the Daily Mission boundary

`lib/adaptiveEngine.ts` (the Daily Mission engine, home-screen recommendations) is a **separate, older, flat-score system**, already explicitly out of scope per `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §8.3, and already self-documented in its own header (dated the same day as this Blueprint) as reading/writing a wholly separate evidence store. Today, some mock surfaces (`app/mocks/adaptive/*`) **dual-write**: real Evidence Engine calls alongside a legacy bridge (`recordAliCompetencySignal()` et al., `lib/progress.ts`) that feeds the Daily Mission. Two mock surfaces (`app/mocks/[pathway]/page.tsx`, `app/mock-test/page.tsx`) feed **only** the Daily Mission bridge, never the Evidence Engine.

**Binding rule for all future mock development**: no new mock code may add a new dual-write into the Daily Mission bridge. New mock surfaces follow the CSSE Mock Exam pattern (`app/learning-intelligence/mock-exam/page.tsx`) — Evidence Engine and Educational Audit only. Existing dual-writes are not required to be removed by this Blueprint (that is a separate consolidation decision, exactly as `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §8.3 left it), but they must not be extended or imitated going forward.

### 8. Decision Boundaries, Explainability, Wellbeing

Inherited unchanged from `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §§8–9. A mock producing a "you're ready" or "not yet ready" statement to a parent is a Higher-Evidence-Required decision (ET-4, or a genuine readiness-dimension conclusion) exactly like any other readiness claim — no mock-specific relaxation of this threshold is permitted, and the Educational Safety Principle (Principle 8) applies with the same, undiminished force as exam proximity increases, which for a mock examination is often the most acute moment this principle exists to protect against.

### 9. Freeze Declaration

This document is frozen on approval. Future changes require a defect correction, new educational evidence, or a formal programme decision — the identical discipline `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` established. **The programme transitions into Mock Intelligence implementation mode with immediate effect; from this point, progress is measured by working software built against Sections 3–8 above, not by further specification documents.**

---

## PART B — IMPLEMENTATION ASSESSMENT

### B1. Reusable components (no new work required)

| Component | Location | Role |
|---|---|---|
| Assessment Brain V1 / Educational Intelligence Engine V1 | `docs/intelligence/*.md` | Frozen specification, cited only |
| `fetchQuestionBank()` | `lib/ali/questionBank.ts:37` | Content read, pathway-filtered |
| `selectQuestions()`, `deriveWeakCompetencies()` | `lib/ali/selection.ts`, `lib/ali/weakness.ts` | Question selection |
| `buildAdaptiveSection()` | `lib/adaptiveMockBuilder.ts` | Mock section assembly — reference pattern |
| `recordPresentation()`, `recordOutcome()` | `lib/ali/history.ts:95,166` | Evidence Engine writes |
| `applyAttemptOutcome()` | `lib/ali/mastery.ts` | Durable-mastery computation |
| `processEvidenceForCompetency()` | `lib/learningEngine/educationalIntelligenceService.ts:180` | Educational Audit writer |
| `recordReadinessSnapshot()` | `lib/learningEngine/learningHistory.ts` | Readiness Engine writer |
| `fetchLearnerIntelligenceProfile()` | `lib/learningEngine/profile.ts` | Readiness/evidence reader |
| `assessMockReadiness()` | `lib/learningEngine/mockReadiness.ts` | Mock-readiness dispatch (read-through) |
| `PATHWAY_SUBJECT_KEYS` / `MockPathwayId` | `lib/ali/pathwayEligibility.ts`, `types/mock.ts` | Shared pathway model |
| `app/learning-intelligence/mock-exam/page.tsx` | — | **Reference implementation** — the one mock surface already fully compliant with Sections 3–5 |
| `app/learning-intelligence/parent/mock-readiness/page.tsx` | — | Reference implementation for Parent Intelligence compliance |

### B2. New components required (kept minimal, per Section 6)

1. **Mock Attempt Ledger — Supabase-backed** (replaces two localStorage-only, mutually-unaware stores). Proposed shape only, not built: a table (e.g. `ali_mock_attempt`) keyed by `profile_id`, storing pathway, subject(s), section scores, timing, completion state — following the exact ownership pattern (`profile_id` FK, `auth.uid()`-based RLS) established by today's migration 019/020. A new persistence module, `lib/ali/persistence/mockAttemptStore.ts`, would sit behind `lib/mockProgress.ts`'s and `lib/adaptiveMockProgress.ts`'s **existing function signatures**, so callers (`app/mocks/*`) do not change.
2. **Educational-Audit/Readiness calls added to `app/mocks/adaptive/*`** — these four pages already call `recordPresentation`/`recordOutcome` (Evidence Engine) but stop short of `processEvidenceForCompetency`/`recordReadinessSnapshot`. Not new logic — the same calls the CSSE Mock Exam page and today's `lib/learningEngine/legacyPracticeEvidence.ts` already make, added to four more call sites.
3. **Governance guard, not code**: the rule in Section 7 — no new dual-writes into the Daily Mission bridge.

Nothing else. No new scoring, no new readiness math, no new evidence model.

### B3. Integration points

| Surface | Current state | Target |
|---|---|---|
| `/learning-intelligence/mock-exam` (CSSE) | Fully compliant (Sections 3–5) | No change — reference pattern |
| `/learning-intelligence/parent/mock-readiness` | Fully compliant | No change — extend pathway eligibility only once a pathway earns its own Assessment-Brain-equivalent (Section 2) |
| `/mocks/adaptive/{gl,maths,vocabulary,english}` | Evidence Engine yes; Educational Audit/Readiness no; dual-writes into Daily Mission bridge | Add B2.2's missing calls (CSSE-tagged content only, per Section 2); no new dual-writes (Section 7) |
| `/mocks/[pathway]` (static timed exams) | Zero engine integration; content sourced from local data files, not `ali_question_bank` | Blocked on content tagging (a separate content work stream) before any engine wiring is meaningful — do not wire engine calls onto untagged content (would honestly no-op, per the same pattern Gate 7 already confirmed for untagged Vocabulary/Writing content this session) |
| `/mock-test` (legacy) | Zero engine integration; not even wired into `MockResult` | Recommend a Founder retirement decision — appears superseded by `/mocks/[pathway]`, not a candidate for new integration work |
| Mock Attempt Ledger | Two separate, mutually-unaware localStorage stores | Single Supabase-backed store (B2.1) |

### B4. Production risks

1. **Daily Mission duplication is real and pre-existing** (Section 7) — the risk is a new mock surface imitating the dual-write pattern rather than the CSSE Mock Exam's clean pattern. Mitigated by this Blueprint's governance rule, not by new code.
2. **Content-coverage ceiling**: `/mock-test` and `/mocks/[pathway]`'s non-CSSE-maths sections rely on untagged local content — even with engine wiring added, evidence recording would honestly no-op until content is tagged into `ali_question_bank` (same class of finding as this session's Gate 7 Vocabulary/Writing results). This is a real limiter on how much genuine evidence Mock Intelligence can produce near-term, not a defect.
3. **Cross-device/parent-visibility gap**: `MockResult` is localStorage-only today, so a parent viewing Mock Readiness from a different device sees no attempt history, unlike competency evidence (already Supabase-backed, already cross-device). This silently limits Parent Intelligence's usefulness specifically for mocks until B2.1 is built.
4. **Pathway-scope discipline**: GL/CEM/ISEB mocks must not receive Educational-Audit or Readiness-Engine treatment until each has a real Assessment-Brain-equivalent (Section 2) — the risk is a well-intentioned engineer wiring in readiness claims for a pathway whose competency model is the weaker, non-evidenced 63-code taxonomy, producing an overclaimed parent-facing statement Principle 8 forbids.
5. **English mock content asymmetry**: `/mocks/[pathway]`'s English section is currently `comingSoon` — any delivery plan must not assume full-subject symmetry across pathways yet.

### B5. Phased delivery plan

- **Phase 0 (this Blueprint)**: frozen on approval. No code.
- **Sprint 1** (CSSE-scope only, matching Assessment Brain V1's real evidence boundary):
  1. Add B2.2's missing `processEvidenceForCompetency`/`recordReadinessSnapshot` calls to the four `/mocks/adaptive/*` pages, for CSSE-competency-tagged content only.
  2. Design and apply the Mock Attempt Ledger migration (B2.1), following the same pre-execution/post-execution verification discipline used for migrations 019/020 this session (baseline row counts, exact policy inventory, live cross-identity isolation tests, real-browser Gate-7-style verification before any certification).
  3. Migrate `lib/mockProgress.ts`/`lib/adaptiveMockProgress.ts` to the new backend behind unchanged signatures — zero caller changes.
  4. Do **not** touch `/mocks/[pathway]` or `/mock-test` this sprint — both are blocked on the content-tagging prerequisite (B3) or a retirement decision.
- **Sprint 2** (content coverage): tag `/mocks/[pathway]`'s static content into `ali_question_bank` where reuse is highest (GL/CSSE maths overlap first), then wire `recordPresentation`/`recordOutcome` once tagged.
- **Sprint 3** (retirement decision): Founder decision on `/mock-test`'s fate — flagged here, not decided.
- **Future, out of scope**: GL/CEM/ISEB Assessment-Brain-equivalents. Only once real, evidenced competency models exist for those boards can Mock Intelligence extend Educational-Audit/Readiness claims beyond CSSE.

### Repository impact assessment (Sprint 1 only, not built now)

**Would change**: `lib/mockProgress.ts`, `lib/adaptiveMockProgress.ts` (backend swap, signatures unchanged); `app/mocks/adaptive/{gl,maths,vocabulary,english}/page.tsx` (add two function calls each). **Would be created**: one new migration file, `lib/ali/persistence/mockAttemptStore.ts`. **Would not change**: `app/learning-intelligence/mock-exam/page.tsx`, `app/learning-intelligence/parent/mock-readiness/page.tsx`, `lib/adaptiveMockBuilder.ts`, `lib/ali/selection.ts`, `lib/ali/weakness.ts`, `lib/learningEngine/mockReadiness.ts`, `lib/ali/pathwayEligibility.ts`, and all three frozen `docs/intelligence/*.md` files.

### Production readiness recommendation

This Blueprint is ready to freeze now — it is documentation only, zero production risk. **Sprint 1 implementation should not begin without three separate confirmations**: (a) explicit approval of the Mock Attempt Ledger's migration design, held to the same rigor as migrations 019/020 (baseline capture, exact policy review, live verification) given it touches production schema; (b) confirmation that adding Educational-Audit/Readiness calls to the four adaptive mock pages does not regress the evidence chain already verified live this session; (c) explicit reconfirmation that GL/CEM/ISEB remain excluded from Educational-Audit/Readiness claims until Section 2's pathway-equivalence condition is met.

---

## PART C — AMENDMENT: INCREMENT 3A FINDING (2026-07-23)

### C1. What Increment 3A set out to do

Sprint 1's Mock Attempt Ledger work (Increments 1–3) unified `app/mocks/adaptive/gl/page.tsx` onto one canonical Attempt ID. Increment 3A's objective was to go further: wire that page's per-question evidence into `processEvidenceForCompetency()` (Educational Audit) and `recordReadinessSnapshot()` (Readiness Engine) — the same calls `lib/learningEngine/legacyPracticeEvidence.ts` and the CSSE Mock Exam page already make — and verify the full chain (Attempt → Question History → Educational Audit → Durable Mastery → Readiness → Parent Intelligence) live, with real evidence.

### C2. Finding: this document already forbids it, correctly, and a defect was found in how B2.2/B5 stated it

Live verification (real Supabase queries against `agxunwcdatosrmzhhuxj`, not code-reading alone) confirmed:

1. `ali_question_bank` has zero rows tagged `subject = 'verbal-reasoning'` — GL's adaptive VR section has never once had real content to record evidence against; it always runs on the synthetic dev fixture (`data/ali/vrSyntheticFixture.ts`), which by existing, correct, pre-Increment-3 design skips `recordPresentation()`/`recordOutcome()` entirely.
2. Even setting that aside, the synthetic fixture's own skill codes (`vr.analogies`, `vr.letter-codes`, `vr.hidden-words`, `vr.sequences`) do not, and structurally cannot, resolve to any Assessment Brain `CompetencyId`. `lib/learningEngine/assessmentBrainMap.ts`'s `QUESTION_TYPE_PRIMARY_COMPETENCY` is keyed exclusively on CSSE `QT-*` Question Type IDs. `lib/learningEngine/types.ts`'s own header states this in writing: GL's dotted-skill-code evidence model (`lib/ali/confidence.ts`) is "real, live, and deliberately NOT reused here... Do not conflate the two."

This is **exactly** what Section 2 of this Blueprint already declares — "a mock examination may only produce Educational-Audit-level conclusions... for content whose competency tag derives from a real Assessment-Brain-equivalent. In practice, today, that means CSSE-tagged content only" — and what B4 Risk 4 already names as a risk to guard against. Increment 3A did not discover a new boundary; it verified, with live evidence, that the existing boundary is real and holds.

**A real internal inconsistency was found, however**: B2.2 and B5 Sprint 1 item 1 both describe the work as "the four `/mocks/adaptive/*` pages" without excluding GL — in tension with Section 2's own binding rule. This is corrected here as a defect correction (Section 9's permitted change class), not a scope reopening:

- **B2.2 and B5 Sprint 1 item 1 are corrected to read**: "the three CSSE-tagged `/mocks/adaptive/*` pages (`english`, `maths`, `vocabulary`)" — `gl` is excluded and remains excluded until GL earns its own Assessment-Brain-equivalent per Section 2.
- **B3's table row for `/mocks/adaptive/{gl,maths,vocabulary,english}` is split**: the GL row's target becomes "No integration into Educational Audit/Readiness — blocked on Section 2's pathway-equivalence condition, not merely a missing call site" (verified, not merely asserted, per C2 above); the maths/vocabulary/english rows retain the original target (add B2.2's calls, CSSE-tagged content only).

### C3. Disposition

No code was changed. No Educational Intelligence algorithm, competency mapping, or frozen `docs/intelligence/*.md` document was modified. `app/mocks/adaptive/gl/page.tsx` remains exactly as Increment 3 left it (one canonical Attempt ID, Evidence Engine + local-mirror Durable Mastery only). Increment 3A is closed on this finding; GL's inclusion in Educational Audit/Readiness is deferred pending a Founder decision on whether/how to build GL its own Assessment-Brain-equivalent (Section 2, B5 "Future, out of scope").

---

**Version History**

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-07-23 | Created. Establishes Mock Intelligence as a pure consumption layer over the frozen Educational Intelligence Engine, confirms one evidence flow and one readiness model, identifies the Daily Mission engine as a pre-existing, out-of-scope parallel system to be governed (not extended) rather than reconciled, and names the Mock Attempt Ledger as the one genuinely new component this domain requires. |
| 1.1 | 2026-07-23 | Part C added (Increment 3A). Live verification confirmed Section 2's CSSE-only Educational-Audit/Readiness boundary holds for GL specifically (zero tagged content; GL's own skill-code taxonomy does not and structurally cannot map to any Assessment Brain competency). Corrects an internal inconsistency in B2.2/B5 Sprint 1 item 1, which named "four" adaptive mock pages without excluding GL — narrowed to the three CSSE-tagged pages. No code, algorithm, or other frozen document changed. |
