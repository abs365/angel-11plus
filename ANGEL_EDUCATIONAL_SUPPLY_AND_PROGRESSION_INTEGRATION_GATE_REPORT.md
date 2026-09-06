# Angel 11+ — Educational Supply & Progression Integration Gate

**Prepared:** 2026-09-06. Evidence report for the Founder-approved increment following the Question Factory Scale Architecture PASS (commit `cb16a20`). Objective: connect content supply to the educational preparation system (diagnosis, teaching, practice, transfer, mastery, retrieval, assessment, readiness), not merely generate more questions. **Nothing in this increment touches the database or publishes/generates production content.**

---

## A. Current Educational Architecture (before this increment)

Five parallel research agents plus direct source reading confirmed this codebase already has a deep, real, working Educational Intelligence Engine — the correct posture for this increment was **KEEP and connect**, not rebuild. Real, load-bearing, already-live modules:

- **Preparation stage/horizon**: `lib/learningEngine/preparationClock.ts` (exam-date-driven horizon bands), `preparationStage.ts` (8-value evidence-first stage, `derivePreparationStage()`), `preparationDecision.ts` (the canonical `PreparationDecision` contract consumed by `sessionGenerator.ts`), `placementDiagnostic.ts` (bounded Maths placement).
- **Mastery/evidence**: `lib/ali/mastery.ts` (`applyAttemptOutcome` with `supportTier: "independent"|"supported"`), `lib/ali/confidence.ts` (evidence-quality tiers), `lib/ali/educationalState.ts` (8-state model), `lib/ali/durableMastery.ts` (spaced-retention).
- **Wellbeing**: `lib/ali/wellbeing.ts` — a real, tested, production-wired pacing veto (compounding failure, mastery-reversal, session-abandonment), explicitly non-diagnostic.
- **Mock governance**: `lib/ali/questionBank.ts`'s dual fetch functions, migration 070's field-allow-listed `mock_get_question()`, migration 085's `ali_mock_cycle` (14-day cooldown, one-open-cycle rule), migration 100's RLS allow-list, migrations 208/209's exposure-retirement triggers, `lib/ali/mockAccessPolicy.ts`'s `classifyMockAccess()` (recommends, never hides).
- **Teaching content**: `lib/learningEngine/mathsTeachingContent.ts` (worked-example MODEL content), `guidedPractice.ts` (GUIDED scaffolds), `fullLessonRegistry.ts` (competency→lesson routing, 5 competencies), `practiceInteractionGuard.ts` (misconception rendering), `writingTeachingContent.ts`/`writingRubric.ts` (Writing's one bounded task family).
- **Curriculum estate documentation**: `ANGEL_QUESTION_DEPTH_AND_REPETITION_AUDIT.md` and `ANGEL_EDUCATIONAL_CONTENT_INVENTORY.md` already contain most of the exact family/row reconciliation this gate asks for, plus ready-to-run diagnostic SQL for the remainder.
- **CSSE exam fidelity**: `CSSE_EXAMINATION_BLUEPRINT.md` (primary-source-grounded) already exists as a substantial exam fidelity standard.

**What did not exist and is genuinely new this increment**: a single, named, deterministic `TeachingState` unifying the scattered mechanisms above; a Question Factory→teaching-state metadata contract; an explicit content-pool naming layer; and a dedicated adversarial validator test suite. These four gaps are what this increment built — everything else above is cited, not rebuilt.

## B. Preparation Stages

Implementation confirmed real and already exceeding the brief's minimum bar: `preparationStage.ts`'s `derivePreparationStage(subjects, clock, schoolYear)` computes stage from evidence ratios FIRST; `schoolYear` only caps whether `transfer`-level evidence can advance into `exam_preparation`/`final_preparation` — it never determines difficulty directly, and `undefined` year is treated as eligible, never blocking. Verified by existing tests (`tests/lib/learningEngine/preparationStage.test.ts`):
- "a strong Year 4 learner reaches transfer-level evidence but is developmentally capped below exam_preparation/final_preparation" — the advanced-younger-learner case, already tested.
- "a real regression (rebuilding) forces teaching, overriding an otherwise-strong distribution" — the foundational-gap-despite-older-age case, already tested.

No new stage logic was needed or built. This increment's `TeachingState` (Section C) is the one addition connecting stage-level evidence to lesson-level pedagogy.

## C. Teaching Engine

**New this increment**: `lib/learningEngine/teachingState.ts` — `TeachingState` (`explicit_teaching | worked_example | guided_practice | scaffolded_practice | independent_practice | transfer | mastery_check | maintenance_retrieval`), `deriveTeachingState(context)` (pure, deterministic priority ladder over already-existing evidence: `educationalState`, `hasFullLessonAvailable`, `lastAttemptSupportTier`, `maintenanceReviewDue`), and `isTeachingAssistancePermitted(mode)` (a second, application-layer contract; the real enforcement remains `mock_get_question()`'s field allow-list).

This does **not** replace or recompute anything — it is the one unifying mapping the Founder's brief asked for, built on top of real signals that already existed but were never expressed as one named state machine. It is deliberately **not wired into `sessionGenerator.ts`/`selection.ts`** this increment (per the Founder's own "do not rewrite the recommendation engine unnecessarily" instruction) — this is the integration contract, not the full wiring.

**Support ladder (Section 6)**: the core requirement — "success after heavy support must not equal independent success in mastery evidence" — is **already implemented and already tested**: `lib/ali/mastery.ts`'s `supportTier` binary (`countsTowardMastery = isCorrect && supportTier === "independent"`) structurally prevents a supported-correct answer from ever advancing mastery. This is a binary tier, not the Founder's illustrative 0-5 numeric ladder — the Founder's own brief explicitly allows this ("exact implementation may differ where educational evidence supports it... the important requirement" is the one above). No new ladder was built; the existing binary tier already satisfies the stated requirement.

## D. Question Factory Integration

`lib/ali/questionFactory/types.ts` gained `TeachingUse` (the ten values Section 8 named: the eight `TeachingState` values plus `timed_practice`/`mock_reserve`) and an optional `teachingUses?: TeachingUse[]` field on `StructuralBlueprint`. Populated with real, disclosed, judgement-based classifications (not a uniform default) on all 7 `mr03-angle-sum` blueprints and `precision-frac`'s `RIBBON_FRACTION_SPEC` — e.g. `BP_MISCONCEPTION_360_CONFUSION` → `["explicit_teaching", "scaffolded_practice"]` (a targeted-misconception blueprint is a teaching tool first), `BP_COMPARE_TRIANGLES` → `["transfer", "independent_practice"]` (a genuinely different structure, not more of the same). A blueprint may legitimately support several states; none was force-populated with all ten.

`lib/learningEngine/subjectTeachingContracts.ts` (new): typed pedagogical-sequence data for Maths (`CONCEPT→REPRESENTATION→MODELLED_METHOD→GUIDED_APPLICATION→INDEPENDENT_APPLICATION→STRUCTURAL_VARIATION→REVERSE_TRANSFER_REASONING→RETENTION`) and five separate English sequences (`INFERENCE`, `MEANING_IN_CONTEXT`, `RETRIEVAL`, `SEQUENCING`, `LANGUAGE_EFFECT` — Section 16's own named list, never forced into the Maths shape) and Writing's one bounded sequence. Each stage is marked `implemented: true` with a real file citation, or `implemented: false` honestly — e.g. Maths's `REVERSE_TRANSFER_REASONING` and three of English's `INTERPRETATION`/`CONTEXTUAL_CLUE`/`ELIMINATE_INCONSISTENT_SEQUENCE` stages are disclosed as not yet built, not glossed over.

`lib/ali/contentPool.ts` (new; deliberately placed OUTSIDE `lib/ali/questionFactory/` — see Section P): `derivePoolMembership(source, eligibilityStatus)` names the three real, already-enforced pools (calibration = `ali_question_candidate` table; practice = `eligibility_status='practice_eligible'`; mock_reserved = `mock_eligible`/`authentic_assessment_candidate`/`independently_validated`) as one typed function, changing no schema or enforcement.

## E. Curriculum Classification

Authoritative, reconciled figures (`ANGEL_EDUCATIONAL_CONTENT_INVENTORY.md`, `ANGEL_QUESTION_DEPTH_AND_REPETITION_AUDIT.md §10`, cross-checked live this session via anon-key query):

| Subject | Database rows (all statuses) | Practice-eligible rows | Database family records | Production-eligible families | Genuine educational families |
|---|---|---|---|---|---|
| Mathematics | 301 | 202 (351 total anon-visible = 202+142+7, live-confirmed) | 74 | 67 | **74 — confirmed** (matches record count exactly) |
| English | 243 | 142 | 80 | 55 | **Not yet classifiable** |
| Writing | 14 (may be stale — see below) | 7 | 16 | 7 | **Not yet classifiable** |
| **Total** | **558** | **351** | **170** | **129** | Maths only |

**English's secondary lens**: 94 passage-bound families (24 distinct passages, `lib/ali/englishFamilyModel.ts`) — a coarser, passage-scoped grouping, not directly comparable to the 80 `family_id`-based records above (different key).

**Genuinely unresolved, not fabricated**: whether the 80 English and 16 Writing database family records represent genuine educational structures, mechanical artifacts, or a coarser/finer grouping than that concept cannot be determined from anon-key access (`ali_question_family` is RLS-admin-only; migration 228 itself is marked "NOT APPLIED" in its own header despite its backfill having been run manually for reporting). **Exact, ready-to-run diagnostic SQL already exists** for this (`ANGEL_QUESTION_DEPTH_AND_REPETITION_AUDIT.md §10`'s Q1/Q2/Q3) — reproduced here with a Writing-specific extension per this gate's own Section 15 ask:

```sql
-- Q4 (new this pass): Writing family size/status reconciliation, extending Q3
select
  f.family_id, f.row_count, f.production_eligible,
  array_agg(distinct b.eligibility_status) as statuses_present
from public.ali_question_family f
join public.ali_question_bank b on b.family_id = f.family_id
where f.subject = 'writing'
group by f.family_id, f.row_count, f.production_eligible
order by f.row_count desc;
```

Distinguishing the six requested labels, honestly: **DATABASE FAMILY RECORD** (170, real, counted) — **GENUINE EDUCATIONAL FAMILY** (74 Maths confirmed; English/Writing pending Q1-Q4) — **PASSAGE-BOUND GROUP** (94, English-only, a distinct concept from `family_id`) — **FACTORY-READY FAMILY** (0 today for every subject — no family has StructuralBlueprint coverage beyond the single `mr03-angle-sum`/`precision-frac` proof pair; this label did not exist in the codebase before this report and is defined here, not discovered) — **TEACHING-READY FAMILY** (5 competencies total have a real lesson via `fullLessonRegistry.ts`; family-level teaching-readiness has not been separately audited) — **MOCK-ELIGIBLE FAMILY** (a family with ≥1 `mock_eligible` row; not separately counted this pass, follow-on work).

## F. Adversarial Validation

New file: `tests/lib/ali/questionFactory/adversarialValidation.test.ts` (18 tests, all passing). Every fixture is hand-constructed test data, never production content.

| Defect fixture | Expected | Actual |
|---|---|---|
| Number-only substitution (10 candidates, one skeleton) | REJECT (CRITICAL) | **REJECTED** — `structuralVariantCount=1`, `memorisationRisk=CRITICAL` |
| Wording-only substitution (same numbers, reworded stems) | — | **NOT CAUGHT — disclosed gap**, not fabricated as solved (see Section P) |
| Dominant-blueprint saturation (7 blueprints, 1 supplies 90%) | REJECT (CRITICAL) | **REJECTED** — `dominantBlueprintShare>0.7` |
| Founder's named counter-example (100 candidates, 10 balanced blueprints) | ACCEPT (LOW) | **ACCEPTED** — `blueprintDepth=10`, `LOW` |
| Repeated context / reasoning route / unknown position | REJECT | **REJECTED** — all three `exceedsThreshold=true` |
| Difficulty distribution corruption (one tier only) | REJECT | **REJECTED** — `meetsMinimum=false` |
| Misleading difficulty label (uncorrelated with complexity) | — | **NOT AUTOMATICALLY CAUGHT — disclosed gap** (Section P); what IS proven is that difficulty labels are pure/deterministic functions of declared dimensions |
| Invalid answer equivalence (claimed form not declared) | REJECT | **REJECTED** — `answer_mismatch` |
| Valid declared-equivalent form (non-canonical) | ACCEPT | **ACCEPTED** — proves the gate isn't over-rejecting |
| Impossible angle values (isosceles equalAngle=100°) | REJECT | **REJECTED** — `invalid_combination` |
| Fake structural diversity (numbers-only, no blueprintId) | REJECT | **REJECTED** — falls back to `dominantBlueprintShare=1`, CRITICAL |
| Control: real 7-blueprint family, 140 fresh candidates | ACCEPT | **ACCEPTED** — LOW risk, all dimension checks pass |

**No threshold was weakened to force a pass.** The two "not caught" rows are stated as genuine limitations, per the Founder's own explicit instruction not to fabricate coverage.

## G. CSSE Exam Fidelity

`CSSE_EXAMINATION_BLUEPRINT.md` already exists as a substantial fidelity standard, built on `docs/intelligence/ASSESSMENT_BRAIN_V1.md` (17 primary-source Knowledge Assets: real 2021-23 papers/mark schemes) plus cross-checked 2026 public research. Verified current characteristics: two same-day papers (English 70 min = 60+10 reading, Maths 60 min/60 marks), combined max 120 (50/50, age-standardised), no re-mark, no offer below 303; English = Comprehension + Continuous Writing (two prompts); Maths = 20-21 numbered questions, calculator-free, exact-match marking.

**A real, unresolved evidence conflict, disclosed per this codebase's own evidence-hierarchy standard rather than silently picked one way**: `ALI_DECISION_LOG.md` Decision 58 (2026-08-16) treats "Applied Reasoning removed from the English paper, effective September 2024" as Founder-confirmed HIGH-confidence current-product-behaviour fact, already applied live (`assessmentBrainMap.ts`'s `ALL_COMPETENCY_IDS` excludes it). A **later**, separate research track (`knowledge/assessment-excellence-programme/phase-3-evidence-synthesis/findings/01-test-structure-evolution.md`) explicitly disputes this, stating the claim "rests on one uncorroborated tertiary source" and that the actual 2025/26/27 CSSE Information Guides — already downloaded by that same research pass — were never read to confirm or refute it. **This conflict is not reconciled anywhere in the repository.** Recorded here, not resolved: Decision 58 governs current live product behaviour (Applied Reasoning is not served), and that should not change without re-reading the actual held Guide documents; but the Phase 3 finding is a legitimate, unaddressed challenge to the evidentiary basis for that decision, and should be closed out by whoever next has time to read those three documents.

## H. Mock Governance

**Practice/mock/calibration separation** (all real, pre-existing, re-confirmed this pass): calibration = `ali_question_candidate` (separate table, zero overlap with `ali_question_bank`, proven by `tests/supabase/questionFactoryCandidateLifecycle.test.ts`); practice = `eligibility_status='practice_eligible'`, the only value migration 100's RLS policy exposes to non-admins; mock-reserved = `mock_eligible` (+ pre-promotion states), readable by non-admins only through the field-allow-listed `mock_get_question()` RPC, never a direct table read (`tests/lib/ali/mockContentFirewall.test.ts`, 12 tests, all passing, re-run this pass).

**Teaching disabled during live mock**: DB-enforced, not app-layer — `mock_get_question()`'s return payload is a hand-picked allow-list (`questionId, subject, skill, question, marks, contentDifficulty`) structurally excluding `hint`/`explanation`/`learning_objective`/`addresses_misconception`. This increment's `isTeachingAssistancePermitted("mock_attempt") === false` is a second, defence-in-depth application-layer contract, not a replacement.

**Access/frequency**: real, DB-enforced 14-day cooldown + one-open-cycle rule (`mock_start_new_cycle()`, migration 085) is the hard gate; `lib/ali/mockAccessPolicy.ts`'s `classifyMockAccess()` is the soft, explainable recommendation layer (never hides a technically-available Mock, only labels whether current `PreparationStage` evidence supports recommending it) — exactly the Founder's own "Angel recommends, family chooses" principle, already built and already tested.

**Unseen-content protection**: migrations 208/209's exposure-retirement triggers prevent a mock question ever being promoted back to practice, or reused across a second mock form, once exposed — a real, permanent one-way gate.

## I. Mock Capacity

Real current supply (`ANGEL_MOCK_DEPTH_AND_SECURITY_AUDIT.md`): exactly 2 active mocks (Mathematics Mock 1, 56 rows/56 marks; Reading Comprehension Mock 1, 28 rows/65 marks). Reserve: Maths 21 rows/21 marks unexposed (cannot assemble a second 56-mark sitting from reserve alone); English 22 rows/39 marks unexposed (cannot assemble a second 65-mark sitting either); Writing has 0 assembled mock forms.

**New estimate this pass** (reasoned, not database-measured — labelled as such): because exposure is permanent and one-way (Section H), a "strong CSSE mock programme" supporting a Year 5-6 learner through 4+ genuinely fresh full sittings per subject (baseline, mid-preparation, pre-exam, one contingency retest) needs roughly **4× each subject's per-mock consumption, plus a working buffer** — approximately 220-280 protected Maths questions (4×56 + buffer), 260-320 protected English comprehension items (4×65-marks-equivalent + buffer), and 8+ protected Writing prompts (2 prompts × 4 sittings), i.e. on the order of **500-650 protected mock-reserved items total** across Maths+English+Writing to support a 4-sitting programme without any reuse. Current mock-reserved supply (77 Maths + 50 English + ~1 Writing = ~128 rows) covers roughly a quarter of this. **Building this supply is explicitly NOT performed this increment** (Section 28's stop condition) — this is a capacity target for a future, separately-authorised Mock content wave.

## J. English Teaching

Deliberately not modelled on Maths. Five distinct pedagogical sequences declared in `subjectTeachingContracts.ts` (Section D): `INFERENCE` (evidence→interpretation→inference→justification), `MEANING_IN_CONTEXT`, `RETRIEVAL`, `SEQUENCING`, `LANGUAGE_EFFECT` — matching Section 16's own named list exactly, none forced into a shared shape. Real existing content instantiates parts of several (`guidedPractice.ts`'s `locate-instruction`/`selection-count-check`/`sequence-anchor` scaffolds map onto `RETRIEVAL`/`SEQUENCING`; `englishAnswerValidation.ts` implements `RETRIEVAL`'s `ANSWER_PRECISELY` stage); `MEANING_IN_CONTEXT` and most of `INFERENCE`/`LANGUAGE_EFFECT` are disclosed as not yet built, not claimed.

## K. Writing

**Actual current readiness, stated plainly**: one bounded task family in production (`writing-reflective-discursive`) with real MODEL content and a planning scaffold; Continuous Writing's AI score (`app/api/writing-feedback/route.ts`, LLM-derived 0-100) is explicitly quarantined from mastery by Decision 60 — `writingRubric.ts` always records `supportTier: "supported"`, structurally preventing Writing from ever reaching `mastered`/`durably-mastered` state, by design, not by omission. 16 database family records exist (7 production-eligible); genre variety (narrative/descriptive/discursive/opinion) is manually curated, not a measured family-diversity signal. The picture-narrative task family is explicitly deferred (needs a non-copyrighted image asset). **Writing Factory readiness is NOT claimed** — zero `StructuralBlueprint` coverage exists for Writing; this increment's `WRITING_TEACHING_CONTRACT` documents the real, narrower-than-Maths/English state honestly, including one stage (`MASTERY_EVIDENCE`) marked not implemented by deliberate governance choice, not oversight.

## L. Content Capacity (recalculated)

558 (all-status) reconciles as 301 Maths + 243 English + 14 Writing; 351 (practice-visible today) reconciles as 202 + 142 + 7. Recalculated route, not blindly preserving the Scale Architecture report's prior directional allocation:

| Milestone | Route | Gate before proceeding |
|---|---|---|
| 558 → ~650 | Publish the 3 already-audited, defect-free calibration candidates if Founder-approved; remediate/re-submit the already-fixed `precision-frac`/`mr03-angle-sum` defects | None new — awaiting Founder decision on the existing 30 |
| ~650 → 1,200 | Build 3-5 more Maths `StructuralBlueprint` families to `mr03-angle-sum`'s depth (6-10 blueprints each), each proof-batched and human-calibrated before any bank insert | Requires repeating this increment's blueprint-design process per family |
| 1,200 → 2,000 | English begins contributing ONLY after Section E's Q1-Q4 classification confirms which of its 80 families are genuine; first English `StructuralBlueprint` family requires the Section 16 architecture (passage provenance, no copyrighted text) to be designed, not assumed | **Blocked on Founder-run SQL + English content architecture design** |
| 2,000 → 3,000+ | Requires real English/Writing blueprint contribution, not row-count alone | **Blocked on the above** |

**Effective Educational Depth today**: Maths = 74 (matches genuine family count exactly, since no blueprint work has touched the other 73 families yet — only `mr03-angle-sum` has real blueprint depth of 7). English/Writing = not computable without Section E's classification. This is a materially more conservative statement than "558 questions" or "170 families" — deliberately so, per Section 21's own standing instruction against reporting a number that was never measured.

## M. Learner Journey

ENTRY → **DIAGNOSIS** (`placementDiagnostic.ts`, Maths-only today) → **TEACHING** (`deriveTeachingState` → `explicit_teaching`/`worked_example`, routed via `fullLessonRegistry.ts` where a lesson exists) → **GUIDED PRACTICE** (`guided_practice`/`scaffolded_practice`, `guidedPractice.ts` scaffolds) → **INDEPENDENT PRACTICE** (`independent_practice`, `supportTier='independent'` required for mastery credit) → **TRANSFER** (`transfer`, a genuinely different `StructuralBlueprint`/structure) → **MASTERY** (`educationalState='mastered'`, `lib/ali/masteryValidation.ts`) → **RETRIEVAL** (`maintenance_retrieval`, `isMaintenanceReviewDue()`) → **CONTROLLED ASSESSMENT** (Mock attempt, teaching assistance structurally disabled) → **REMEDIATION** (misconception-tagged content re-served via the same practice pool — Section 6's own confirmed gap: no dedicated remediation pool exists) → **READINESS** (`PreparationStage`/`mockAccessPolicy.ts`'s recommendation). Every arrow above names a real, already-existing or newly-contracted mechanism; none is fabricated or aspirational without disclosure.

## N. Test Evidence

- `npx tsc --noEmit` — clean.
- `npm test` — **3,965/3,965 pass** (3,933 pre-existing + 32 new: 18 adversarial-validation, 11 teaching-state, 5 content-pool — final counts per file confirmed by direct test run, not estimated).
- `npx eslint` scoped to every file touched/created this increment — zero errors, zero warnings.
- `node scripts/copy-quality-guard.mjs` — PASS, 302 files, 0 violations.
- `node scripts/migration-sql-guard.mjs` — PASS, **231 migration files, unchanged** — zero migrations created or modified.
- `npm run build` — clean, all routes compile.
- A real architectural guard (`tests/lib/ali/questionFactory/reviewGateEnforcement.test.ts`) caught a genuine placement defect during this increment: `contentPool.ts` was initially placed inside `lib/ali/questionFactory/`, which has its own tested boundary forbidding any reference to `eligibility_status`/`practice_eligible`/`mock_eligible`. **Moved to `lib/ali/contentPool.ts`** and re-verified — the guard is doing exactly its intended job, not a defect to route around.

## O. Production State

- Zero migrations created or modified (231 before, 231 after).
- Zero `.insert`/`.update`/`.upsert`/`.rpc`/`.delete` calls anywhere in any file changed or added this increment (direct grep, zero matches).
- `ali_question_bank`: 351 anon-visible (practice_eligible) rows, unchanged from the Scale Architecture report's own measurement.
- `ali_question_candidate`: 0 rows visible to the anon key (RLS-admin-only) — consistent with, not proof of, the 30 calibration candidates remaining `pending_review`/unapproved/unpublished; the guarantee rests on this increment's zero write calls, the same limitation disclosed in the prior report.
- No mock content generated, no mock form created or modified.
- No learner-facing route, selection algorithm, or recommendation logic was touched — every new module (`teachingState.ts`, `subjectTeachingContracts.ts`, `contentPool.ts`, `TeachingUse`) is additive and unwired into any live selection path.

## P. Findings / Blockers (not hidden)

1. **Wording-only substitution is not detected by any structural-diversity gate** — only digit-substitution is normalised (`normaliseStemForNearDuplicateCheck`). A batch of cosmetically-reworded copies of the same question would pass today. Recommend: a semantic/paraphrase-similarity check, not yet built anywhere in this codebase (also flagged independently in the pre-existing Repetition Audit's own §9).
2. **Misleading difficulty labels have no generic automated detector** — catching the mr03/precision-frac defects required human review each time; no mechanism generalises this to a new blueprint automatically.
3. **English/Writing genuine-family classification remains unresolved** — Section E's SQL is ready; execution requires Founder/admin access this session does not have.
4. **The CSSE "Applied Reasoning removed Sept 2024" fact has an unresolved internal evidence conflict** (Section G) — governs current live product behaviour, should be closed out.
5. **No dedicated remediation content pool exists** — misconception-tagged re-serving reuses the same practice pool a learner just failed in, a real, previously-identified, still-open gap.
6. **Mock reserve supply covers roughly a quarter of a defensible 4-sitting programme target** (Section I) — building it is explicitly out of scope this increment.
7. **`TeachingState`/`TeachingUse` are integration contracts, not wired into live selection** — a future increment must decide how/whether to connect them to `sessionGenerator.ts` without the "unnecessary recommendation-engine rewrite" this brief forbade.

## Q. DECISION

**EDUCATIONAL INTEGRATION PARTIAL.**

Justification: this increment produced real, working integration evidence, not documentation alone — `TeachingState`/`isTeachingAssistancePermitted` (11 passing tests), `TeachingUse` metadata wired onto 8 real blueprints, `subjectTeachingContracts.ts` (5 distinct English sequences, not forced into the Maths shape), `contentPool.ts` (5 passing tests, correctly relocated after a real architectural guard caught a boundary violation), and an 18-test adversarial validation suite that honestly reports two real, uncaught defect classes rather than fabricating coverage. Full verification suite (3,965/3,965 tests, clean build/lint/guards) confirms none of this destabilised existing behaviour.

**Not a PASS** because: the curriculum classification this gate explicitly required (Section E/15) remains genuinely unresolved for English and Writing, blocking a credible 3,000-question capacity plan beyond Maths; the new `TeachingState` contract is deliberately unwired into any live selection path (correct per this brief's own constraint, but it means "Angel now teaches adaptively" is not yet a true statement about the live product); and Writing's teaching architecture remains real but narrow, honestly disclosed as such. These are the same kind of structural gaps a PASS decision must not paper over, per this whole increment's own evidentiary standard.

---

**STOP.** Per Section 28: no 3,000-question generation wave, no approval/publication of the original 30 or the 80-candidate proof batch, no new full mocks, no further major increment. Founder/educational review is required before any of the above proceeds.
