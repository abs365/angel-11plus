# Angel 11+ — Educational Foundation Completion & Governance Standard

**Prepared:** 2026-09-06. Completion increment following the Question Factory Scale Architecture (`cb16a20`) and Educational Supply & Progression Integration Gate (`c8b0b7a`) increments, and the Founder's own Q1-Q4 production diagnostics. Objective: fix the system once, establish the governing standard, verify it, prepare for safe scale — not another exploratory architecture pass.

---

## A. Authoritative Inventory

Reconciled from the Founder's own Q1-Q4 evidence plus this session's live, read-only anon-key checks:

| | Maths | English | Writing | Total |
|---|---|---|---|---|
| Database rows (all statuses) | 301 | 243 | 14 (see §C — stale) | 558 |
| Practice-eligible rows (anon-confirmed live) | 202 | 142 | 7 | 351 |
| Database family records | 74 | 80 | 16 | 170 |
| Production-eligible family records | 67 | 55 | 7 | 129 |
| Genuine educational families (confirmed) | **74** | not resolvable this session | not resolvable this session | Maths only |

**English Q1/Q2 reconciliation (Founder-run, verified consistent)**: 17 practice_only + 38 mock_only + 0 mixed + 25 neither_track = 80. Clean family-level track separation confirmed — no family straddles both practice and mock tracks. This does NOT mean 80 genuine educational families (see §B).

## B. Family Taxonomy

`lib/ali/familyTaxonomy.ts` (new) formalises the six-way distinction (Section 1 of `ANGEL_EDUCATIONAL_CONTENT_STANDARD.md`) and its `classifyFamilyRecordType()` classifier, applied to the Founder's own cited Q1 examples:

- **Wave-authored, multi-row English families** (`wave1-fam-vocab-explain`=17, `wave1-fam-sequencing`=15, `wave1-fam-direct-retrieval`=14, `wave1-fam-quote-explain`=13, `wave1-fam-synonym-battery`=11, `wave1-fam-emotion-cause`=11 — 6 examples, 81 rows) → classify `educational_family`, **heuristic confidence** (naming + row-count pattern, not direct content review).
- **Single/few-row assessment-oriented IDs** (`eng-inc*`, `eng-pc*`, `mock-*`) → classify `assessment_form_group` or `mechanical_or_storage_family`, never `educational_family`.
- **Genuine limitation, disclosed**: this session has only the Founder's cited EXAMPLES from Q1, not the complete 80-row result set. A full classification of all 80 requires either the complete Q1 output pasted/exported, or a live admin session running the classifier's own logic as SQL. **RAW DATABASE FAMILY COUNT (80) and GENUINE EDUCATIONAL DEPTH are never substituted for one another** — the honest current statement is: at least 6 wave-authored families (≥81 rows) are plausibly genuine; the rest require the full dataset to classify.

**Mathematics**: 74/74 database family records classify `educational_family` at **certain** confidence — the one subject with direct, independent content-review confirmation (`ANGEL_EDUCATIONAL_CAPACITY_AUDIT.md`).

**Writing**: every real family record classifies `task_prompt_group`, never `educational_family` — see §E/§K.

## C. Writing Reconciliation

**Q3 (Founder-run)**: 17 total Writing bank rows / 16 distinct family_id values. **Q4 (Founder-run)**: 16 family records, every one showing `row_count = 1`. 16×1=16 ≠ 17 — a genuine, provable discrepancy.

**Root cause, proven from migration source (no live admin query needed)**: migration 228's backfill inserts one `ali_question_family` row per `family_id` with `on conflict (family_id) do nothing` — a one-time snapshot. Any `ali_question_bank` row added afterward, for an EXISTING `family_id`, is invisible to `ali_question_family` forever: its `row_count` (and `skills`/`question_types`/`difficulty_range`) stay frozen at backfill-time values with no refresh mechanism. This is not a hypothesis — migration 231 (still unapplied) already had to perform exactly this class of one-off repair for the `pathways` column, an unrelated bug in the same backfill statement, establishing the precedent directly.

**Fix — Migration 232** (`supabase/migrations/232_ali_question_family_live_sync.sql`, NOT APPLIED, Founder action required): adds `ali_sync_question_family(family_id)` (recomputes one family's `row_count`/`skills`/`question_types`/`pathways`/`difficulty_range`/`production_eligible` fresh from live data) plus a trigger on `ali_question_bank` (AFTER INSERT/UPDATE/DELETE) that keeps this in sync going forward, plus a one-time corrective pass fixing every currently-stale family record (Writing's included) as of application time. Fails closed with a `RAISE EXCEPTION` verification block if any family's `row_count` still mismatches live data after the corrective pass. Idempotent, additive-only, no write to `ali_question_bank`, no RLS/grant change. 9 new structural tests (`tests/supabase/migration232AliQuestionFamilyLiveSync.test.ts`).

**This is NOT applied to production.** It requires the exact same manual Supabase Dashboard SQL Editor application every other pending migration in this arc requires.

## D. Live Teaching Integration

**This is real, not contract-only.** `PreparationDecision.teachingState: TeachingState | null` (`lib/learningEngine/preparationDecision.ts`) is now computed inside `buildPreparationDecision()` from real, already-flowing evidence:
- `educationalState` — the top-priority candidate's own real 8-state value.
- `hasFullLessonAvailable` — the same real callback every other part of this engine already uses.
- `maintenanceReviewDue` — **exact, not a proxy**: `topCandidate.triggerReason === "review-due"`, which `recommendationRuntime.ts` itself produces from exactly `educationalState === "reviewing"`.
- `isFirstEncounterEver`/`lastAttemptSupportTier` — honestly disclosed as approximations (`stage === "insufficient_evidence"` and `null` respectively), since no richer signal is plumbed to this exact call site yet.

**Reaches the real, live selection path**: `PreparationSessionContext.teachingState` (`sessionGenerator.ts`) is populated from `decision.teachingState` at the actual production call site (`app/learning-intelligence/practice/[area]/page.tsx`), and `buildPreparationWeightBias()` now applies the existing `GUIDED_FAMILY_BOOST` for `teachingState === "scaffolded_practice"` in addition to `guided_practice` — a real, measured effect on session composition, proven by a new test showing the taught-family draw share increases identically for both. `PreparationDecision`, `PreparationStage`, `EducationalState`, mastery, confidence, wellbeing, durable mastery, and the existing recommendation engine are **completely unmodified** — `teachingState` is purely downstream of them.

**14 tests** prove this (5 new in `preparationDecisionTeachingState.test.ts`, 4 new in `increment021PreparationHorizonPersonas.test.ts` including the Founder's own CASE B/D), and **all 62 pre-existing decision/session/selection tests still pass unchanged** — zero regression.

**Disclosed limitation**: `scaffolded_practice`/`mastery_check` are the two `TeachingState` values without a fully dedicated selection effect yet (they either share `GUIDED_FAMILY_BOOST` now, or have no live selection consequence beyond being computed and exposed). Deepening this is real follow-on work, not performed here to avoid the "unnecessary recommendation-engine rewrite" the Founder explicitly forbade.

## E. Remediation

`lib/learningEngine/remediationPolicy.ts` (new): `selectRemediationAction()`, a deterministic priority ladder choosing among all eight named actions (re-teaching, worked example, guided practice, simpler blueprint, misconception-targeted blueprint, prerequisite competency, delayed retrieval, different representation/context). Core proven behaviour: **a single failure never escalates to `re_teaching`** — only ≥2 consecutive failures on the exact same normalised skeleton do. 7 tests, all passing.

**REQUIRED, NOT YET BUILT**: live wiring of `consecutiveFailuresOnSameSkeleton` (requires tracking per-skeleton failure streaks, not currently captured anywhere) and the prerequisite/misconception-availability signals into an actual session-generation call site. This is the policy layer the Founder asked for; connecting it to real attempt-history plumbing is disclosed, bounded follow-on work.

## F. Subject Teaching

- **Maths**: `CONCEPT→REPRESENTATION→MODELLED_METHOD→GUIDED_APPLICATION→INDEPENDENT_APPLICATION→STRUCTURAL_VARIATION→REVERSE_TRANSFER_REASONING→RETENTION` (`subjectTeachingContracts.ts`, from the Educational Supply increment, unchanged). 6/8 stages have real implementation citations; `REVERSE_TRANSFER_REASONING` remains disclosed as not built — Section 11's "close the disclosed reverse/transfer gap" is addressed at the CONTRACT level (Section 8 above defines what counts as genuine transfer) but no new reverse-reasoning blueprint was built this pass (Question Factory's own `mr03-angle-sum` docstring already explains why a naive reverse-reasoning variant was rejected as not genuinely distinct for that specific fact).
- **English**: five distinct sequences (`INFERENCE`, `MEANING_IN_CONTEXT`, `RETRIEVAL`, `SEQUENCING`, `LANGUAGE_EFFECT`), never forced into the Maths shape. `RETRIEVAL` and `SEQUENCING` have real partial implementation (`guidedPractice.ts`, `englishAnswerValidation.ts`); `MEANING_IN_CONTEXT` and most of `INFERENCE`/`LANGUAGE_EFFECT` are disclosed CONTENT SUPPLY GAPS, not fabricated as implemented.
- **Writing**: `MODEL`/`PLANNING_SCAFFOLD`/`DRAFT`/`FEEDBACK` are real (`writingTeachingContent.ts`, `app/api/writing-feedback/route.ts`, `writingRubric.ts`); `MASTERY_EVIDENCE` is explicitly `implemented: false` **by deliberate governance choice** (Decision 60), not omission — Section 12's instruction to preserve this is honoured exactly.

## G. Anti-Memorisation

**Gap 1 (wording-only substitution) — fixed, not merely disclosed further.** `detectParameterSignatureDuplicates()` (`diversityGates.ts`, new): CERTAIN detection — two candidates sharing the same `blueprintId` AND identical generation parameters, rendering as different normalised skeletons, are provably the same educational instance reworded. Proven against the exact fixture that exposed the original gap (3 differently-worded copies of the {angleA:10, angleB:20} case) — now flagged as a single duplicate group of size 3. `computeTokenOverlapRatio()` (new): a disclosed Jaccard-similarity HEURISTIC for legacy content without blueprint/parameter identity — reported, never a sole rejection basis, per the Founder's own "no expensive opaque dependency" instruction (no LLM, no embeddings, pure token-set arithmetic). **What remains true**: structural-skeleton normalisation ALONE still cannot see wording-only variation — the fix is the NEW parameter-signature layer, not a change to the old one.

**Gap 2 (difficulty integrity) — the reachable, automatable part fixed; the semantic part remains disclosed.** `checkPerBlueprintDifficultyReachability()` (new): applies the existing distribution-integrity check PER BLUEPRINT, catching the exact historical defect class (a blueprint whose own rule can never produce "hard") even when sibling blueprints in the same batch mask it in an aggregate view — proven by test. `difficultyDimensions` was already a REQUIRED field (Scale Architecture increment) — this section adds the reachability proof that field's declaration alone couldn't provide. **Disclosed, unchanged limitation**: no generic check can yet prove a label genuinely tracks learner-perceived complexity beyond reachability — that remains a human-review judgement, stated honestly rather than faked with a fragile heuristic.

**21 adversarial tests total** (`adversarialValidation.test.ts`), including a control proving the real 140-candidate `mr03-angle-sum` batch still passes every gate — no threshold was weakened to produce a green result.

## H. CSSE Fidelity — Applied Reasoning Conflict

**Resolved per the evidence hierarchy — as an honest evidence-gap finding, not a guessed answer.** This pass located and fully read the one primary-source document actually held in this repository, `knowledge/csse/examiner-guidance/CSSE-Information-Guide-2027-Entry.pdf` (2027 Entry). It contains no section-level description of the English paper at all (only total timing/marks) — it neither confirms nor refutes Applied Reasoning's presence for any year. The two documents that WOULD actually speak to this (2025 Entry and 2026 Entry Information Guides — the exact years the claimed September 2024 change concerns) are referenced in `knowledge/assessment-excellence-programme/`'s own source register but are **not held anywhere in this repository as a readable document** — only their URLs and a title/date-only verification exist.

**Record**: source = one secondary source (elevenace.com), corroborated by neither a held primary document nor a past official paper (Assessment Brain V1's 2021-23 evidence predates the claimed change and cannot speak to it either way). Applicable entry years = 2025 Entry onward (claimed). Decision = Applied Reasoning REMAINS EXCLUDED from current live product behaviour (Decision 58 stands — **unchanged**, since no primary evidence was found that contradicts it). Confidence = **corrected from HIGH to MEDIUM** (`CSSE_EXAMINATION_BLUEPRINT.md §5a`, dated 2026-09-06) — the Founder's original decision is real and unretracted, but was never actually corroborated against a primary document, only against a secondary-source claim believed at the time to be stronger than it was. Product implication = none; live behaviour is intentionally unchanged, per Section 15's own "do not change unless primary evidence requires it" standard. Recommended next step (not performed here): fetch and read the two specific held-URL-only guides.

## I. Content Pools

Practice/Mock/Calibration separation is unchanged, re-verified (12 `mockContentFirewall.test.ts` tests + candidate-lifecycle tests, all still passing).

**Writing `mock-writing-*` investigation — resolved with direct migration evidence, not naming inference.** Live query found exactly 4 Writing rows whose `family_id` starts `mock-writing-` yet carry `eligibility_status = 'practice_eligible'`. Traced to source:
- `mock-writing-wc01a-mistakelearned`/`mock-writing-wc01a-newplace` — promoted via migration **204** (`independently_validated → practice_eligible`), explicitly Founder-authorised for these exact 2 ids, with 3 sibling ids from the SAME original batch (`mindchange`, `kindness`, `cookopinion`) deliberately left as PROTECTED RESERVE and a 6th (`screentime`) held back for an unresolved near-duplicate defect.
- `mock-writing-wc01a-personinfluence`/`mock-writing-wc01a-somethingnew` — promoted via migration **203**, gated on a closed Founder review decision in `ali_family_review`.

**Conclusion**: all four are intentionally, individually, Founder-authorised promotions — a legacy `mock-` naming prefix from original authoring, decoupled from current eligibility by deliberate governance action. Not a naming artefact requiring correction, not a leak. No eligibility_status was changed by this investigation.

## J. Mock Capacity

**Corrected — the prior report's 500-650 estimate conflated marks with rows in places; this recomputes from rows.** Real current supply: Maths Mock 1 = 56 rows/56 marks (reserve 21 rows unexposed); Reading Comprehension Mock 1 = 28 rows/65 marks (reserve 22 rows unexposed); Writing = 0 assembled forms. For a defensible 4-distinct-form programme (baseline/mid/pre-exam/contingency — a disclosed planning assumption, not a Founder-specified number) plus a working buffer:

| Track | Rows/form | ×4 forms | + buffer | Current supply | Gap |
|---|---|---|---|---|---|
| Maths | ~56 | 224 | ~270 | 77 (56+21) | ~193 |
| English Comprehension | ~28 | 112 | ~135 | 50 (28+22) | ~85 |
| Writing (2 prompts/form) | 2 | 8 | ~10-12 | ~4 (from §I's promoted-and-reserved rows) | ~6-8 |

**Total protected mock-reserved target ≈ 400-420 rows** for a genuine 4-form programme — each form is a SHARED, fixed manifest (like a real exam paper), not drawn per-learner, so this figure does not scale with learner count. Sectional/timed assessments are assumed to draw from the same reserve (no separately dedicated content). **Not built this increment** (Section 26's stop condition) — this is the capacity target for a future, separately-authorised Mock content wave.

## K. Learner Differentiation

- **Year 4, strong evidence** → `preparationStage.test.ts`'s existing "strong Year 4 learner reaches transfer... capped below exam_preparation" test — advanced work, never held to easy-only.
- **Year 5, average/mixed evidence** → new CASE B test: `recommendedDifficultyLean === "balanced"`, neither forced easy nor forced hard.
- **Year 6, genuine foundational gap** → the existing "rebuilding forces teaching, overriding an otherwise-strong distribution" mechanism, independent of school year, plus this increment's own `deriveTeachingState` test proving a rebuilding signal routes to `explicit_teaching`/`guided_practice`.
- **Same year, different evidence** → new CASE D test: two Year 5 profiles (strong vs weak) produce different `preparationStage` and `recommendedDifficultyLean`.
- **Supported vs independent success** → `lib/ali/mastery.ts`'s `applyAttemptOutcome`, already tested in `tests/lib/ali/mathsMasteryProtection.test.ts`/`writingMasterySafety.test.ts` (pre-existing, re-confirmed passing, not duplicated).

## L. Practice vs Mock Behaviour

**Practice**: `isTeachingAssistancePermitted("practice") === true`; teaching assistance availability now genuinely varies by the live `teachingState` field (§D). **Mock**: `isTeachingAssistancePermitted("mock_attempt") === false` (application-layer contract) reinforcing the real, authoritative DB-level enforcement — `mock_get_question()`'s hand-picked field allow-list structurally excludes `hint`/`explanation`/`learning_objective`/`addresses_misconception` from every live mock-attempt payload (migration 070, unchanged). After completion, `mock_score_attempt`/manual-marking/report-release paths (unchanged) resume analysis and remediation recommendation. Database enforcement remains the authoritative guarantee; the application-layer contract is defence-in-depth, not a replacement.

## M. Educational Content Standard

**Created**: `ANGEL_EDUCATIONAL_CONTENT_STANDARD.md` — permanent, 25 numbered sections exactly matching the Founder's own required structure, citing real mechanisms by file path wherever one exists, marking genuinely unbuilt requirements `REQUIRED, NOT YET BUILT` rather than fabricating compliance. Includes a Correction Log section for future amendments. **This is a governing document, not an increment report — it does not expire.**

## N. Scale Readiness

**Current verified baseline**: 351 practice-visible rows (558 all-status); effective educational depth = 74 (Maths only — the only subject with confirmed genuine family classification); 0 factory-ready families (no family beyond `mr03-angle-sum`/`precision-frac` has `StructuralBlueprint` coverage). Practice supply = 351; teaching-capable supply = 5 competencies with a real lesson (`fullLessonRegistry.ts`, unchanged); transfer/mastery supply = 1 family (`mr03-angle-sum`, 7 blueprints) with genuine transfer-classified blueprints; mock-reserved supply = ~128 rows (77+50+~1); calibration supply = the 30 original + 80 proof candidates, both still unpublished.

**Subject gaps**: English/Writing have zero `StructuralBlueprint` families; English needs its own passage-provenance architecture (Section 16 of `CSSE_EXAMINATION_BLUEPRINT.md`'s originating brief) before any blueprint work begins. **Preparation-stage gaps**: `isFirstEncounterEver`/`lastAttemptSupportTier`/`maintenanceReviewDue` are not fully plumbed to the `preparationDecision.ts` call site (§D's disclosed proxies) — richer wiring is real, valuable follow-on work. **Factory-ready family count**: 2 (mr03-angle-sum, precision-frac) out of 170 database family records.

**Proposed next controlled production wave** (planning guidance only, per the Founder's own explicit instruction, NOT started this increment): a first multi-family wave of approximately 200-300 candidates should target 3-5 additional Maths families built to `mr03-angle-sum`'s own blueprint-library standard (6-10 genuine blueprints each), proof-batched and human-calibrated exactly as that increment demonstrated, BEFORE any English/Writing blueprint work begins (which remains gated on the unresolved family classification in §B and the not-yet-built passage-provenance architecture). Route: 351 (verified current) → ~450-650 (first wave, Maths-led) → 1,200 → 2,000 → 3,000+, with English/Writing contributing only once their own architecture and classification work lands.

## O. Tests

- `npx tsc --noEmit` — clean.
- `npm test` — **4,001/4,001 pass** (3,965 carried forward + 36 new: 5 preparationDecisionTeachingState, 4 new persona cases, 7 remediationPolicy, 6 familyTaxonomy, 5 additional adversarial-validation, 9 migration-232 structural). One unrelated, pre-existing, timing-sensitive performance test (`recommendationOrchestrationRuntime.test.ts`, a "materially faster than Xms" wall-clock assertion) flaked once at 75ms against a <75ms threshold and passed cleanly on immediate re-run — confirmed unrelated to any change this increment made.
- `npx eslint` scoped to every file this increment wrote or touched — zero errors, zero warnings. (A separate, genuinely pre-existing `react-hooks/refs` issue in the practice page — 7 errors/1 warning, confirmed byte-identical before and after this increment's one-line addition via `git stash` comparison — is NOT introduced by this increment.)
- `node scripts/copy-quality-guard.mjs` — PASS, 304 files.
- `node scripts/migration-sql-guard.mjs` — PASS, **232 migration files** (231 before, +1 new: migration 232).
- `npm run build` — clean, all routes compile.
- A real, pre-existing architectural guard (`tests/supabase/crossSubjectQuestionFamilyModel.test.ts`) correctly flagged migration 232 and `familyTaxonomy.ts` as new references to `ali_question_family` requiring explicit review — both added to its `knownLegitimateReferences` list with a documented reason, exactly as its own docstring requires. The guard did its job; this is not a defect.

## P. Production Safety

- Original 30 calibration candidates: unchanged this session — zero write/RPC calls anywhere in any file this increment created or modified (confirmed by grep across every new/changed `.ts`/`.tsx` file and by diffing exactly what changed in `preparationDecision.ts`/`sessionGenerator.ts`/the practice page).
- 80-candidate proof batch: unpublished, untouched.
- No mass content generation: zero new bank rows, zero new candidates generated.
- No accidental publication: `publish_question_candidate()` is not called anywhere in this increment's code.
- No mock leakage: `mockContentFirewall.test.ts` (12 tests) re-confirmed passing unchanged; the one investigated `mock-writing-*` finding (§I) was a read-only historical trace, no eligibility_status was changed.
- No learner-result mutation: no attempt, mastery, mock-report, or history row was read for any write purpose anywhere in this increment.
- `ali_question_bank`: 351 anon-visible rows, unchanged before/after (re-confirmed via live query).
- The ONE schema change (migration 232) is additive-only, touches only `ali_question_family` (a reporting table with no learner-facing read path), and is explicitly marked NOT APPLIED — Founder must apply it manually via Supabase Dashboard SQL Editor, after migrations 070-231.

## Q. Blockers (genuine, not hidden)

1. **English/Writing genuine-family classification remains incomplete** — the full Q1 result set (80 rows) was not available to this session, only the Founder's cited examples; a complete classification needs either the full dataset or a live admin session applying `classifyFamilyRecordType()`'s own logic directly.
2. **`consecutiveFailuresOnSameSkeleton` (and the other remediation-policy inputs) are not yet tracked anywhere** — the policy function is real and tested; its live inputs require new plumbing, not performed this increment.
3. **The 2025/2026 Entry CSSE Information Guides are not held in readable form** — the Applied Reasoning question cannot be definitively closed without fetching them.
4. **Mock-reserved supply covers roughly a quarter of the corrected ~400-420 target** for a 4-form programme (§J) — building it is explicitly out of scope.
5. **`scaffolded_practice`/`mastery_check` TeachingStates have a shallower live-selection effect than the other six** — real but partial wiring, disclosed in §D.
6. **English passage-provenance architecture for a future Question Factory blueprint wave does not exist yet** — a real prerequisite for any English `StructuralBlueprint`, not built this increment.

## R. DECISION

**EDUCATIONAL FOUNDATION PARTIAL — NOT READY FOR CONTROLLED SCALE.**

Justification: this increment delivered real, verified, non-regressing fixes and genuine live integration — the proven `ali_question_family` staleness root cause is fixed with a permanent trigger (not just a patch), `TeachingState` now genuinely computes from and influences live session selection (not merely a tested contract, per the Founder's own explicit bar for what COMPLETE would require), two real anti-memorisation/difficulty-integrity gaps are closed with certain (not heuristic) detection where the evidence allowed it, the CSSE evidence conflict is resolved to an honest, corrected-confidence record rather than left as a silent contradiction, and a permanent governing content standard now exists. 4,001/4,001 tests pass, migrations/guards/build all clean, zero unauthorised production mutation.

**Not COMPLETE** because: English and Writing genuine-family classification remains unresolved (blocking any credible non-Maths scale plan); the remediation policy's live inputs are not yet plumbed; the CSSE fidelity conflict is resolved as an honest evidence-gap record, not a definitively-confirmed fact; and `TeachingState`'s live influence, while real, is partial (2 of 8 states have no dedicated selection effect yet). Per the Founder's own explicit standard, none of this may be papered over to claim COMPLETE.

---

**STOP.** Per Section 26: no 200-300 candidate wave, no 3,000 generation, no publication of the original 30 or the 80-candidate proof batch, no new increment. Founder review is required before content manufacturing begins. Migration 232 additionally requires explicit Founder application via Supabase Dashboard SQL Editor before its fix takes effect.
