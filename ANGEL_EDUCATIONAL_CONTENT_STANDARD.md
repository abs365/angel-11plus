# Angel 11+ — Educational Content Standard

**Status:** PERMANENT GOVERNING STANDARD, established 2026-09-06 by the Educational Foundation Completion increment. This is not an increment report — it does not expire, and it is not superseded by the next content wave. **All future Question Factory work, and all future content-bearing increments, must comply with it.** Where a future increment finds a real reason to change a rule here, it must amend this document explicitly (with a dated Correction Log entry, matching this codebase's own established migration-correction discipline), never silently diverge from it.

This document codifies real, already-built mechanisms wherever one exists (cited by file path) and states plainly where a rule is a requirement not yet fully implemented (marked **REQUIRED, NOT YET BUILT**). It does not fabricate compliance.

---

## 1. Content Taxonomy

Six distinct concepts, never conflated (`lib/ali/familyTaxonomy.ts`):

- **DATABASE FAMILY** — a `family_id` value / `ali_question_family` row. An implementation/storage grouping only.
- **EDUCATIONAL FAMILY** — a genuinely distinct skill/reasoning/problem family. Requires evidence to claim (Section 2), never assumed 1:1 with a database family.
- **STRUCTURAL BLUEPRINT** — a genuinely distinct question/problem structure within an educational family (`lib/ali/questionFactory/types.ts`'s `StructuralBlueprint`).
- **VARIANT** — a controlled instance of a structural blueprint (a generated candidate or bank row).
- **PASSAGE GROUP** — English questions dependent on the same passage (`lib/ali/englishFamilyModel.ts`).
- **TASK/PROMPT GROUP** — Writing questions grouped by task/prompt topic.
- **ASSESSMENT FORM GROUP** — questions grouped because they belong to a Mock/assessment form (`ali_mock_form`'s manifest).

**A new `family_id` does not automatically create educational depth. A changed passage does not automatically create a new reasoning family. A changed Writing topic does not automatically create a new Writing educational family. A changed number does not create a new structural blueprint.**

## 2. Educational Family Definition

A database family record may be classified an EDUCATIONAL FAMILY only when evidence supports it: either (a) direct content review confirming genuinely distinct reasoning demands across its member rows (Mathematics's 74 families, confirmed this way), or (b) `classifyFamilyRecordType()` (`lib/ali/familyTaxonomy.ts`) returning `educational_family` at `heuristic` confidence, disclosed as such, pending confirmation. **Confidence is never silently upgraded from `heuristic` to `certain`.**

## 3. Structural Blueprint Definition

A `StructuralBlueprint` (`lib/ali/questionFactory/types.ts`) must declare: `blueprintId`, `reasoningRoute`, `contextTag`, `unknownPosition`, `representationType`, `difficultyDimensions` (non-empty), `provenance`, `mockEligible`, and optionally `misconceptionTargeted`/`deriveAcceptedAnswerForms`/`teachingUses`. **A blueprint that changes only wording or numbers is not a new blueprint.** A genuinely new blueprint requires a different reasoning route, unknown position, or representation — never a cosmetic change alone (Question Factory Scale Architecture's own `mr03-angle-sum` design discipline, including its documented, honest rejection of a forced "reverse reasoning" variant that was not genuinely distinct).

## 4. Variant Definition

A variant is one generated candidate from a blueprint's `sampleParams`. Raw variant count is reported separately from blueprint depth and effective educational depth (Section 5) — **never substituted for either.**

## 5. Effective Educational Depth

Computed via `classifyBlueprintDepth()`/`classifyScaledMemorisationRisk()` (`lib/ali/questionFactory/diversityGates.ts`): blueprint depth (distinct genuine structures) and dominant-blueprint share (balance of exposure), not raw variant count and not a bare structural-skeleton ratio alone. **100 candidates from 10 balanced blueprints is not CRITICAL merely because 10/100=0.10** — the model must weigh blueprint count AND balance together (proven by test against this exact Founder-named case).

## 6. Practice Content Requirements

A row is Practice-visible only when `eligibility_status = 'practice_eligible'` (migration 100's RLS allow-list). A family should have genuine blueprint depth (Section 5) commensurate with expected learner exposure frequency — a family a frequent learner will encounter dozens of times needs more than 1-2 blueprints (Question Factory Scale Architecture's own throughput findings: a single 7-blueprint family safely supports roughly 500-1,000 lifetime candidates before its narrowest blueprint saturates).

## 7. Teaching Content Requirements

A `TeachingUse` value (`lib/ali/questionFactory/types.ts`) may be declared on a blueprint only where genuinely appropriate — never all ten values applied uniformly. `TeachingState` (`lib/learningEngine/teachingState.ts`) is the canonical vocabulary a blueprint's teaching suitability maps onto: `explicit_teaching | worked_example | guided_practice | scaffolded_practice | independent_practice | transfer | mastery_check | maintenance_retrieval`.

## 8. Transfer Requirements

A candidate may be classified/used as `transfer` only when it represents a genuinely different structure, representation, unknown position, or reasoning route from what the learner has already mastered — **never merely because numbers or wording changed.** This is a live rule, not aspirational: `BP_COMPARE_TRIANGLES`'s own `teachingUses: ["transfer", ...]` declaration is justified specifically because it is a structurally distinct demand (comparing two computed results), not a restyled direct-computation question.

## 9. Mastery-Check Requirements

Mastery credit requires `supportTier === "independent"` (`lib/ali/mastery.ts`'s `applyAttemptOutcome`) — **a supported-correct answer must never advance mastery.** This binary distinction is the proven, tested floor; it must not be weakened even if a richer numeric support ladder is built in future.

## 10. Maintenance/Retrieval Requirements

Spaced retrieval uses `isMaintenanceReviewDue()`/`evaluateDurableMastery()` (`lib/ali/durableMastery.ts`, 14-day gap) and the real `review-due` recommendation trigger, which `deriveTeachingState()` maps directly to `maintenance_retrieval`. Retrieval content should draw from the SAME family the learner previously succeeded in — intentional, not accidental, repetition (Section 13's "good repetition" principle).

## 11. Remediation Requirements

Remediation is a SELECTION POLICY (`lib/learningEngine/remediationPolicy.ts`'s `selectRemediationAction`), not a duplicate content pool. It must never immediately re-serve the identical skeleton with only numbers changed after a single failure — escalation to `re_teaching`/`worked_example` requires ≥2 consecutive failures on the SAME normalised skeleton. **REQUIRED, NOT YET FULLY BUILT**: live wiring of `consecutiveFailuresOnSameSkeleton`/prerequisite-gap/misconception-availability signals from real attempt history into this policy at the session-generation layer.

## 12. Difficulty Integrity

Every `StructuralBlueprint` must declare `difficultyDimensions: string[]` (compile-time enforced, non-optional) naming the real, measurable characteristics its own `difficultyControls()` uses — never divisibility/parity of an unrelated value (the proven historical `mr03-angle-sum`/`precision-frac` defect this whole standard exists partly to prevent recurring). `checkPerBlueprintDifficultyReachability()` (`diversityGates.ts`) must be run per blueprint, not only per batch, before a blueprint is considered factory-ready — catches a blueprint whose own candidates never reach more than one tier even when sibling blueprints mask it in an aggregate view. **Disclosed limitation**: no automated check can yet prove a difficulty label genuinely correlates with learner-perceived complexity beyond reachability — that remains a human-review responsibility.

## 13. Anti-Memorisation Requirements

Layered, disclosed signals, no single opaque score:
- Digit-substitution-invariant structural skeleton (`normaliseStemForNearDuplicateCheck`) — catches number-only substitution.
- **Parameter-signature duplication** (`detectParameterSignatureDuplicates`, new this increment) — CERTAIN detection of wording-only substitution when blueprintId+params are declared: two candidates sharing both, rendering as different skeletons, are provably the same educational instance reworded.
- **Token-overlap ratio** (`computeTokenOverlapRatio`, new this increment) — a disclosed HEURISTIC secondary signal for legacy content without blueprint/parameter identity; never a sole rejection basis.
- Repeated-dimension gates (`detectRepeatedDimension`) for context/reasoning route/unknown position saturation.
- Blueprint-depth/balance model (Section 5) for family-level risk.
**Good repetition is not banned**: intentional spaced retrieval and deliberate exam-format familiarisation are explicitly distinguished from shallow structural repetition (Section 16 below) — this standard forbids the latter, not the former.

## 14. English Passage/Provenance Requirements

No copyrighted past-paper text may be reproduced in generated content (Question Factory Wave 1's own standing rule). Official/past papers may inform format, difficulty calibration, competency coverage, and exam characteristics only. Passage-bound families use `learning_unit_id` (shared passage id), tracked via `lib/ali/englishFamilyModel.ts`. English teaching contracts (`lib/learningEngine/subjectTeachingContracts.ts`) are declared per competency shape (`INFERENCE`, `MEANING_IN_CONTEXT`, `RETRIEVAL`, `SEQUENCING`, `LANGUAGE_EFFECT`) — never forced into the Maths `CONCEPT→...→RETENTION` sequence.

## 15. Writing Governance

Continuous Writing's AI-derived score is quarantined from mastery (Decision 60, enforced structurally by `writingRubric.ts` always recording `supportTier: "supported"`, which `lib/ali/mastery.ts` then structurally excludes from ever reaching `mastered`). **This must never be weakened to make Writing content "look" factory-ready.** Every real Writing family record observed to date is a `task_prompt_group` (Section 1), not a confirmed educational family — genre/topic variation is manually curated, not a measured diversity signal.

## 16. Mock-Reserve Governance

`eligibility_status = 'mock_eligible'` (plus pre-promotion `authentic_assessment_candidate`/`independently_validated` states) is readable by non-admins ONLY through `mock_get_question()`'s field-allow-listed RPC (migration 070) — never a direct table read. Exposure-retirement triggers (migrations 208/209) permanently prevent a mock-exposed question re-entering Practice or a second mock form. Promotions between tracks require an explicit, named, Founder-authorised migration citing the specific ids and the review decision behind them (migrations 200/203/204 are the established precedent — a `mock-` naming prefix is a legacy authoring artefact, never itself a live governance signal; investigate provenance/exposure/history before ever changing an eligibility_status, per Section 16 of the Educational Foundation Completion increment's own investigation).

## 17. Calibration Governance

`ali_question_candidate` (migration 230) is structurally separate from `ali_question_bank` — a candidate cannot be read by any Practice/Mock fetch path until an admin-gated publish step inserts it (proven by `tests/supabase/questionFactoryCandidateLifecycle.test.ts`). Calibration content (proof batches, the original 30, the 80-candidate proof batch) must never be counted as active supply.

## 18. Human Review Requirements

Per Section 22 (this increment) and the Question Factory Specification's own review-gate discipline: every genuinely NEW blueprint requires full educational review before any production use; every genuinely NEW family requires full calibration; bulk variants within an already-approved blueprint may use deterministic validation plus stratified sampling, with mandatory review of every automated-validation failure and every near-threshold/ambiguous case. **No autonomous self-approval** — publication remains admin-gated (`is_current_user_admin()`), proven by `tests/lib/ali/*` and `tests/supabase/questionFactoryCandidateLifecycle.test.ts`.

## 19. Automated Validation Requirements

Every candidate must pass: parameter-range check, constraint/invalid-combination check, independent answer recomputation (never trusting a claimed answer), exact-duplicate check against real bank rows and batch siblings, and the full diversity-gate suite (Sections 5, 12, 13). `validateBlueprintCandidate()`'s answer-equivalence path only withdraws `answer_mismatch` when the claimed answer matches a blueprint-declared accepted form — never a silent broadening of what counts as correct.

## 20. Publication Gates

Publication (`publish_question_candidate()`, migration 230) is the sole path from calibration to `ali_question_bank`, admin-gated, and does not itself grant `practice_eligible`/`mock_eligible` status — those are separate, later, explicitly-reviewed promotions (Section 16). A migration that touches production data must disclose exactly which rows/ids it targets and refuse (via a `RAISE EXCEPTION` guard) if live state does not match its stated precondition — the established pattern this whole codebase's migrations already follow (e.g. migrations 200/203/204/232).

## 21. Learner Exposure Rules

A learner must never encounter mock-reserved or calibration content through ordinary Practice (Sections 16-17, structurally enforced, not merely conventional). Sustained use should draw on genuine blueprint/family diversity, not raw row count alone — the Question Factory Scale Architecture's own throughput evidence is the standing warning here: raw generation speed is never proof of safe supply capacity.

## 22. Copyright/Provenance Rules

Every bank row declares a real `provenance` value (`angel_original | generated_original | licensed | public_domain | authorised_import | evidence_only`). No copyrighted past-paper text is ever reproduced (Section 14). Official CSSE material may inform format/difficulty/coverage only.

## 23. CSSE Fidelity Requirements

`CSSE_EXAMINATION_BLUEPRINT.md` is the standing Exam Fidelity Standard, sourced from `ASSESSMENT_BRAIN_V1.md` (primary-source 2021-23 papers) plus corroborating current research, with every claim's confidence rating disclosed and dated. **Evidence hierarchy, permanent**: current official CSSE primary source > held official CSSE document > past official paper > secondary source > tertiary claim. A claim's confidence rating must be corrected, not silently left stale, the moment a stronger or weaker evidentiary check is actually performed (see the Applied Reasoning confidence correction, §5a of that document, 2026-09-06).

## 24. Content Retirement/Versioning

`content_version` (integer, `ali_question_bank`/`ali_passage_bank`) tracks revisions; a wording/answer-format defect fix increments this, never silently overwrites without record (matching this session's own `precision-frac` wording-defect correction). Migrations are immutable once applied; an unapplied migration may be corrected in place with a disclosed CORRECTION HISTORY section (established precedent: migrations 163, 227, 228). `ali_question_family`'s aggregate fields are kept live by a trigger (migration 232), not treated as a point-in-time snapshot — any future aggregate-bearing reporting table must either replicate this trigger pattern or explicitly document itself as a snapshot requiring manual refresh.

## 25. Evidence/Reporting Requirements

Every capacity/depth/readiness claim must cite its derivation (a real query, a real test, a real migration) — never a hand-copied number from a prior report treated as ground truth without re-verification. Where live production access is unavailable, exact, ready-to-run diagnostic SQL must be produced instead of guessing (established precedent: `ANGEL_QUESTION_DEPTH_AND_REPETITION_AUDIT.md §10`'s Q1-Q3, and this increment's own Q4 extension). A report's DECISION section must distinguish real integration evidence from documentation/contract-only work — a contract that is not wired into live selection is not equivalent to a live-selection change, and must not be reported as one.

---

**Correction Log**:

- **2026-09-06 (Migration 232 Production Reconciliation)** — Section 24 (Content Retirement/Versioning). The Educational Foundation Completion increment's own root-cause diagnosis for the Writing 17-rows/16-families discrepancy was DISPROVEN by direct post-application production evidence. It had inferred that migration 228's stale `row_count` was hiding a second live row inside an existing Writing family. Post-application evidence (`writing_total_rows=17`, `writing_rows_with_family=16`, `writing_rows_without_family=1`) instead proves the cause was ONE Writing bank row with `family_id IS NULL` — simple arithmetic, not staleness. This does not invalidate Section 24's own standing rule (`ali_question_family`'s aggregate fields must be kept live by a trigger, not treated as a snapshot) — that architectural weakness was real and independently confirmed fixed (`stale_family_row_counts = 0` post-application). Full record: `ANGEL_EDUCATIONAL_FOUNDATION_COMPLETION_REPORT.md` Section B, and migration 232's own CORRECTION HISTORY.
