# Adaptive Mock Intelligence — Specification V1

**Work Package:** Phase 4, Sprint 2 (2026-07-23). Implements `MOCK_INTELLIGENCE_BLUEPRINT_V1.md`'s own deferred item — B5's "Future, out of scope: GL/CEM/ISEB Assessment-Brain-equivalents... Only once real, evidenced competency models exist for those boards" — read the other direction: CSSE **already has** a real Assessment-Brain-equivalent, so the one adaptive-selection capability the Blueprint withheld from every pathway becomes buildable for CSSE specifically, now.

**Status:** Specification only. No code, no migration. Governed by `MOCK_INTELLIGENCE_BLUEPRINT_V1.md` (frozen, v1.1) and `MOCK_ATTEMPT_LEDGER_SPECIFICATION_V1.md` — both cited throughout, neither restated.

---

## 1. Purpose

Today's CSSE Mock Exam (`app/learning-intelligence/mock-exam/page.tsx`) is deliberately non-adaptive: it fetches **every currently-tagged CSSE activity** across English, Maths, and Writing and presents it as one fixed sitting (`fetchQuestionBank(...)` for all three subjects, filtered only by `q.skill.startsWith("QT-")` — no selection logic exists at all, confirmed by reading the file: `const tagged = [...english, ...maths, ...writing].filter(...)`). This is a legitimate design — a genuine mock should, at least once, sample everything — but it means a learner who mocks repeatedly re-sits the same fixed set indefinitely, with no mechanism to weight the paper toward what their own recorded evidence says still needs work.

**Adaptive Mock Intelligence is the missing selection layer**: given a learner's real, already-computed Educational Intelligence (`fetchLearnerIntelligenceProfile("csse")` — competency tiers, diagnostics, readiness), construct a mock paper that samples the full Assessment Brain structure but weights toward competencies the evidence says need it, the same way `lib/adaptiveMockBuilder.ts` already does for GL's Verbal Reasoning section — but driven by CSSE's real competency evidence, not GL's separate ALI confidence-tier model.

It is not a new engine. It produces zero new educational conclusions — every fact it consumes (`CompetencyStatus`, `DiagnosticFindings`, `EvidenceConfidenceTier`) already exists, unchanged, in `lib/learningEngine/*`.

## 2. Scope

**In scope**: CSSE only. This is not a preference — it is the same binding rule `MOCK_INTELLIGENCE_BLUEPRINT_V1.md` §2 already states and Increment 3A independently re-verified with live evidence: Educational-Audit-level conclusions may only be produced for content whose competency tag derives from a real Assessment-Brain-equivalent, which today means CSSE-tagged content only. Adaptive Mock Intelligence is that rule's first real *consumer* — it needs the same real per-competency evidence Educational Audit already requires, so it inherits the same pathway restriction for the same reason, not a new one.

**Out of scope, explicitly**:
- **GL** (or CEM/ISEB). `app/mocks/adaptive/gl/page.tsx`'s existing "adaptive" section already does selection — via `AdaptiveTier` (`lib/adaptiveDifficulty.ts`) and `lib/ali/selection.ts`'s weak-skill/cooldown model — but that model is explicitly, in writing (`lib/learningEngine/types.ts`'s own header comment), a *different, deliberately-not-reused* system from the CSSE Assessment Brain competency model this specification is built on. Nothing here touches GL's page, its selection model, or its Ledger integration. Per the Architecture Rules given for this sprint, GL and CSSE's architecture boundary stays exactly where Increment 3A found it, until a separate, explicitly-approved multi-pathway strategy exists.
- The existing fixed CSSE Mock Exam is not removed or replaced by this specification — whether Adaptive Mock Intelligence becomes a new mode on that page, a new route, or a Founder-decided replacement is an open decision (§8), not resolved here.
- Any new Educational Intelligence conclusion, confidence tier, or readiness dimension. Zero new ones are introduced (Architecture Rules).

## 3. Adaptive Paper Construction

Reuses Assessment Brain V1's own real structure (`ASSESSMENT_BRAIN_V1.md` §2, transcribed in `lib/learningEngine/assessmentBrainMap.ts`): English Comprehension + Applied Reasoning (one paper), Mathematics (one paper), Continuous Writing (one task) — the same three-subject shape `mock-exam/page.tsx` already fetches (`fetchQuestionBank(supabase, "english"|"maths"|"writing", "csse")`).

An adaptive paper is constructed as:

1. **Fetch** the full tagged bank per subject (unchanged — `fetchQuestionBank()`, `lib/ali/questionBank.ts:37`).
2. **Fetch** the learner's current `LearnerIntelligenceProfile` (unchanged — `fetchLearnerIntelligenceProfile("csse")`, `lib/learningEngine/profile.ts:22`) — the real, already-computed per-competency tiers and diagnostics.
3. **Select** a bounded-size subset per subject (§4) instead of "every tagged item."
4. **Assemble** into the same `activities: BankQuestion[]` shape the fixed exam already uses — no new question-rendering component, no new answer-checking logic (`checkMathsAnswer`, `scoreEnglishAnswer`, the writing LLM grader — all reused unchanged, `lib/learningEngine/practiceContent.ts`).
5. **Time budget** — sum of `estimatedTimeSeconds` over the *selected* subset (same computation `mock-exam/page.tsx:110` already performs over the full set), so an adaptive paper is proportionally shorter, not the same fixed length with fewer real questions padded by nothing.

No new paper format, no new question type, no new UI shell — the existing exam-mode rendering (`ExamEnglish`/`ExamMaths`/`ExamWriting`, `mock-exam/page.tsx:470-519`) is reused as-is.

## 4. Question Selection Rules

A new, pure, no-I/O selection function is required — analogous in *shape* to `buildAdaptiveSection()` (`lib/adaptiveMockBuilder.ts:58`), but **not the same function and not the same inputs**: `buildAdaptiveSection` is keyed on `AdaptiveTier`, GL's own confidence model, out of scope here (§2). The new function is keyed on real CSSE `CompetencyStatus[]`/`DiagnosticFindings` instead.

Rules, in priority order:

1. **Never select an untagged Question Type.** Every candidate question's `skill` must resolve to a `CompetencyId` with `contentExists: true` for at least one exposure (`CompetencyStatus.mappedQuestionTypes[].contentExists`, `lib/learningEngine/types.ts`) — the same honesty discipline `resolveBankEvidenceContext()` (`lib/learningEngine/legacyPracticeEvidence.ts:76`) already applies: never invent evidence for content that doesn't exist. This is a hard floor, not a preference — it is currently a *real* constraint, since only 12 of 27 Question Types have any content authored (confirmed live, `EvidenceProfile.tsx`'s "Assessment Coverage" panel, this session).
2. **Weight toward the real diagnostics, never invent a new score.** Competencies appearing in `diagnostics.developmentAreas`, `diagnostics.lowConfidenceAreas`, or `diagnostics.notYetEvidenced` (`lib/learningEngine/diagnostics.ts`, already computed, unchanged) receive a higher target count than `diagnostics.strengths`/`masteredSkills`. The weighting is a target-count distribution exactly like `distributionCounts()` (`lib/adaptiveMockBuilder.ts:23`) — same pure-function shape, different input taxonomy (diagnostic category, not `ContentDifficulty`/`AdaptiveTier`).
3. **Still sample the whole structure.** A real mock must still touch every subject area with tagged content — an adaptive paper that skips Mathematics entirely because English shows more development areas would not be a genuine mock. A minimum floor per subject (not per individual competency) applies, matching the real exam's own two-paper-plus-writing shape (§3).
4. **No question repeats within a cooldown window.** The same non-repetition principle `lib/ali/selection.ts` already applies for GL (never re-presenting a question seen too recently) is required here too — described generically because the concrete mechanism (distance-since-last-presented, read from `ali_student_question_history.last_presented_at`) is pathway-agnostic evidence already recorded by `recordPresentation()`/`recordOutcome()` for every CSSE sitting today, not a new read path.
5. **Deterministic given the same evidence, seedable for testing.** Same discipline as `buildAdaptiveSection`'s `random: () => number = Math.random` parameter (`lib/adaptiveMockBuilder.ts:65`) — a caller-supplied RNG for reproducible test fixtures, real `Math.random` in production.

## 5. Educational Intelligence Integration

**The one evidence flow, unchanged** (`MOCK_INTELLIGENCE_BLUEPRINT_V1.md` §4):

```
Question answered
  → recordPresentation() + recordOutcome()        [already called, mock-exam/page.tsx:130,223]
  → applyAttemptOutcome()                          [inside recordOutcome(), unchanged]
  → processEvidenceForCompetency()                 [already called, mock-exam/page.tsx:250]
  → (session end) recordReadinessSnapshot()         [see finding below]
  → ali_educational_audit
```

**A real, pre-existing gap found while grounding this specification, not introduced by it**: `app/learning-intelligence/mock-exam/page.tsx` calls `processEvidenceForCompetency()` per question (Educational Audit is live for this page) but **never calls `recordReadinessSnapshot()`** at session end — confirmed by exhaustive grep; the only two callers of `recordReadinessSnapshot()` in the entire repository are `app/learning-intelligence/practice/[area]/page.tsx:312` and `recordLegacyPracticeSessionCompletion()` (`lib/learningEngine/legacyPracticeEvidence.ts:166`, itself called from the four legacy subject pages). Every CSSE mock exam sitting to date has silently never produced a Readiness snapshot. This is not something Adaptive Mock Intelligence is scoped to fix on the existing fixed exam — that is a separate, one-line defect correction on unrelated existing code — but **Adaptive Mock Intelligence's own implementation must not repeat it**: its session-end hook must call `recordReadinessSnapshot(supabase, profileId, profile.readiness)` exactly as `practice/[area]/page.tsx:312` already does, using the same post-session `fetchLearnerIntelligenceProfile()` read the fixed exam already performs (`mock-exam/page.tsx:306`) to get `profile.readiness` for the call.

**No duplicate evidence, no duplicate readiness logic, no duplicate scoring model** (Architecture Rules): the selection function (§4) reads `CompetencyStatus`/`DiagnosticFindings` — it does not write them, does not recompute confidence tiers, and does not touch `ali_durable_mastery`/`ali_educational_audit` directly. All writes remain exactly `recordPresentation`/`recordOutcome`/`processEvidenceForCompetency`/`recordReadinessSnapshot` — the same four functions, same call order, same tables, whether the paper was fixed or adaptive.

## 6. Quality Validation Rules

1. **Coverage gate before offering adaptivity at all.** If fewer than a Founder-set minimum number of Question Types have `contentExists: true` for the competencies a paper would need, Adaptive Mock Intelligence must not present itself as "personalised" — same honesty pattern as GL's `usingSyntheticFixture` banner (`app/mocks/adaptive/gl/page.tsx`, "Sample practice questions — not yet your full personalised set"). The exact minimum is a rollout decision (§11), not invented here.
2. **Never claim a competency was targeted with zero real candidates.** If rule 4.2's weighting names a development area but zero tagged, cooldown-eligible questions exist for it, that competency is silently dropped from this sitting's target list (the same top-up behaviour `buildAdaptiveSection` already has for a sparse bank, `lib/adaptiveMockBuilder.ts:87-99`) — never backfilled with an unrelated question mislabelled as addressing it.
3. **Structural validation, not content validation.** This specification validates paper *composition* (subject floors, no untagged content, no repeats) — it does not and must not validate answer correctness or content quality; that remains `checkMathsAnswer`/`scoreEnglishAnswer`/the writing LLM grader, unchanged.
4. **Evidence-fact capture stays additive.** Any per-question timing/confidence/working-shown facts (`AttemptEvidenceFacts`, migration 015) an adaptive sitting captures follow `recordOutcome()`'s existing "only supplied fields overwrite" contract (`lib/ali/history.ts:158-165`) — no new fact-capture model.

## 7. Parent Explanation Model

Extends, rather than replaces, `assessMockReadiness()`'s categorical-dispatch discipline (`lib/learningEngine/mockReadiness.ts:41`: "pure categorical dispatch over already-real, already-computed facts... zero arithmetic, zero new numeric thresholds"). A parent-facing explanation of *why an adaptive paper looked the way it did* must be built from the same already-real fields already surfaced elsewhere:

- Which competencies drove selection → `diagnostics.developmentAreas`/`lowConfidenceAreas`/`notYetEvidenced` (already the same fields `RecommendationSummary`/`EvidenceProfile` render today, cited not duplicated).
- No new score, no new band, no prediction of exam outcome — the same constraint `MockReadinessAssessment.explanation` already honours (`lib/learningEngine/mockReadiness.ts:31`) and the same Educational Safety Principle (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §9, cited).
- Explainability stays 3-audience-aware per the frozen Engine spec (learner/parent/admissions framing) — this specification adds no new audience and no new explanation surface beyond what `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §9 already governs.

## 8. Repository Impact

**Would be created** (not built now):
- `lib/learningEngine/adaptiveMockPaperBuilder.ts` (naming illustrative) — the pure selection function, §4. Sole new module.
- Possibly one new route or one new mode on `app/learning-intelligence/mock-exam/page.tsx` — **explicitly an open decision, not resolved here**: a Founder call on whether Adaptive Mock Intelligence replaces the fixed exam, sits beside it as a second entry point, or is offered as a toggle at the intro screen. Nothing in this specification requires deciding this before Sprint 2's incremental delivery begins (§ Sprint 2 delivery plan).

**Would change**:
- `app/learning-intelligence/mock-exam/page.tsx` — wherever the new entry point lands, to call the new selection function instead of "fetch everything tagged," and to add the missing `recordReadinessSnapshot()` call (§5).

**Would not change**: `lib/ali/*` (GL's model, untouched), `lib/adaptiveMockBuilder.ts` (GL's builder, untouched), `app/mocks/adaptive/gl/page.tsx`, `lib/mockProgress.ts` (the Mock Attempt Ledger — reused as-is, see below), any `docs/intelligence/*.md` frozen document, any Assessment Brain transcription (`assessmentBrainMap.ts`), any migration.

**Mock Attempt Ledger reuse**: the completed adaptive sitting is recorded via the exact same `MockResult`/`lib/mockProgress.ts` API Sprint 1 already made async-ready — `completeMockAttempt(result)` (or `saveMockResult(result)` if the existing exam page's direct-call pattern is kept) with `pathway: "csse"`, matching `mock-exam/page.tsx:290-298`'s existing `MockResult` construction exactly. No new attempt-record shape, no new persistence layer — Sprint 1's work is consumed, not extended.

## 9. API Boundaries

All new surfaces are pure functions or thin wrappers around already-existing I/O, matching the codebase's established call style:

```ts
// New — pure, no I/O, seedable (mirrors buildAdaptiveSection's shape, §4)
function buildAdaptivePaper(
  bankBySubject: { english: BankQuestion[]; maths: BankQuestion[]; writing: BankQuestion[] },
  profile: LearnerIntelligenceProfile,          // real, already fetched — fetchLearnerIntelligenceProfile()
  history: Map<string, StudentQuestionHistoryRow>, // real, already fetched — fetchStudentHistory()
  targetCounts: { english: number; maths: number; writing: number },
  random: () => number = Math.random
): { activities: BankQuestion[]; trace: MockGenerationTrace }

// Reused unchanged — no new signature
fetchQuestionBank(supabase, subject, "csse")            // lib/ali/questionBank.ts:37
fetchLearnerIntelligenceProfile("csse")                 // lib/learningEngine/profile.ts:22
recordPresentation(supabase, profileId, ids, source)    // lib/ali/history.ts:95
recordOutcome(supabase, profileId, qId, correct, sessionId, threshold) // lib/ali/history.ts:166
getEducationalIntelligence(supabase, profileId, competencyId)         // educationalIntelligenceService.ts:160
processEvidenceForCompetency(supabase, profileId, competencyId, pre, correct) // educationalIntelligenceService.ts:180
recordReadinessSnapshot(supabase, profileId, readiness) // learningHistory.ts:67 — newly CALLED here, not newly defined
completeMockAttempt(result) / saveMockResult(result)    // lib/mockProgress.ts — Sprint 1's async API, unchanged
```

No new database function, no new RPC, no new table.

## 10. Acceptance Criteria

1. A generated adaptive paper contains zero questions whose `skill` has `contentExists: false` for its owning competency.
2. Every subject with any tagged CSSE content (English, Maths, Writing) appears in the paper with at least the rollout-decided minimum count, even when 4.2's weighting would otherwise skip it.
3. Given identical evidence and an identical `random` seed, paper construction is deterministic (same test discipline as `buildAdaptiveSection`).
4. Completing an adaptive sitting produces, in order: a `ali_student_question_history` row per answered question with the sitting's `sessionId`; a `processEvidenceForCompetency()`-driven `ali_educational_audit` row for any competency newly reaching Higher-Evidence-Required (mastery/durable-mastery); one `recordReadinessSnapshot()`-driven readiness row; and one `MockResult` in the Mock Attempt Ledger with `pathway: "csse"` and the same session id as its Attempt ID (Sprint 1's own Increment 3 discipline, reused).
5. The parent-facing explanation of an adaptive paper's composition cites only fields that already exist on `LearnerIntelligenceProfile`/`DiagnosticFindings` — verifiable by grep, zero new fields introduced.
6. Zero changes to any file under `lib/ali/*`, `lib/adaptiveMockBuilder.ts`, or `app/mocks/adaptive/gl/page.tsx`.
7. `npx tsc --noEmit` and `npm run build` remain clean.

## 11. Production Rollout Plan

- **Sprint 2, Increment 1** (scoping decision, no code): Founder decision on the open item in §8 — new route vs. mode toggle on the existing exam page vs. replacement. Also sets the rollout's coverage-gate minimum (§6.1).
- **Sprint 2, Increment 2**: build `buildAdaptivePaper()` (§4/§9) as a pure, independently-testable function against real (not synthetic) CSSE bank fixtures — no page wiring yet.
- **Sprint 2, Increment 3**: wire the chosen entry point (§8) to call `buildAdaptivePaper()` instead of "fetch everything tagged," reusing the existing exam-mode rendering unchanged. Add the missing `recordReadinessSnapshot()` call in the same increment (§5) — a real defect fix riding along with genuinely related work, not a separate detour.
- **Sprint 2, Increment 4**: live browser + database verification (same rigor as Sprint 1's Increment 5) — confirm the full evidence flow (§ Acceptance Criteria 4) with a real test profile, confirm coverage gate (§6.1) behaves honestly when content is sparse (it currently is — 12/27 Question Types).
- **Not in Sprint 2, explicitly deferred**: any GL/CEM/ISEB adaptive-paper equivalent (blocked on those pathways ever getting a real Assessment-Brain-equivalent — Blueprint §2, Increment 3A); any change to the existing fixed CSSE Mock Exam's availability unless §8's Increment 1 decision calls for it.

---

**Version History**

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-07-23 | Created. Specifies Adaptive Mock Intelligence as a CSSE-only, pure-selection layer over the existing, unmodified Educational Intelligence Engine and Mock Attempt Ledger. Finds and documents (does not fix) a real pre-existing gap: the CSSE Mock Exam has never called `recordReadinessSnapshot()`. No code, no migration. |
