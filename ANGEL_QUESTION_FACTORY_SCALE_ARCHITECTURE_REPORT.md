# Angel 11+ — Question Factory Scale Architecture: Effective Educational Depth + Bulk Generation

**Prepared:** 2026-09-06. Evidence report for the Founder-approved Scale Architecture increment that followed the Human Educational Calibration Gate (`ANGEL_QUESTION_FACTORY_WAVE2_CALIBRATION_REPORT.md`, CRITICAL memorisation risk finding on the original 30-candidate batch, structural diversity ratio 0.10 in every family). **Nothing in this increment touches the database.** All work is application/library code plus two read-only or local-file-only scripts. Per the Founder's explicit Section 23 instruction, this report is followed by a full stop — no 3,000-question generation, no proof-batch publication, no approval of the original 30, no new subject-scale wave.

---

## A. Architecture — What Changed

Four library files extended, one new library file added, zero migrations, zero database writes:

- **`lib/ali/questionFactory/types.ts`** — added `StructuralBlueprint<TParams> extends FamilyGenerationSpec<TParams>` (a family may now own many genuine blueprints, each declaring `blueprintId`, `representationType`, `misconceptionTargeted`, `difficultyDimensions`, `deriveAcceptedAnswerForms`, `provenance`, `mockEligible`), `EducationalFamily` (`familyId` + `subject: "maths"|"english"|"writing"` + `blueprints[]` — the subject field is intentionally not hardcoded to Maths), and `ReasoningRoute`/`reasoningRoute()`/`contextTag()`/`unknownPosition()` as tracked, required dimensions on every spec.
- **`lib/ali/questionFactory/candidateGeneration.ts`** — added `generateBlueprintCandidate()` (stamps blueprint provenance onto a generated candidate), `validateBlueprintCandidate()` (recomputes mathematical validity when a declared accepted-answer-form matches the claimed answer, replacing a hardcoded single-answer check), and `runFamilyBatch()` (round-robins generation across every blueprint in a family, cross-checks duplicates against the whole family's approved set, returns per-blueprint usage metrics).
- **`lib/ali/questionFactory/angleSumBlueprints.ts`** (new) — the 7-blueprint `mr03-angle-sum` proof family (Section B below).
- **`lib/ali/questionFactory/diversityGates.ts`** — added `classifyBlueprintDepth()` and `classifyScaledMemorisationRisk()`, a genuinely new model (not a formula tweak) that scores memorisation risk from BOTH blueprint count and balance of exposure across blueprints, with an explicit legacy fallback that preserves the original calibration gate's behaviour for pre-blueprint content unchanged.
- **`lib/ali/questionFactory/familySpecs.ts`** — `RIBBON_FRACTION_SPEC` (`precision-frac`) upgraded to a full `StructuralBlueprint`: the ambiguous-wording defect the calibration gate found is fixed (question now explicitly asks for "a fraction or mixed number"), and `deriveAcceptedAnswerForms()` now declares both the mixed-number and improper-fraction form as correct — a concrete fix of the exact defect Section 9 named, not an abstract capability.

The architecture is typed generically over `subject: "maths"|"english"|"writing"` and stores blueprints as data, not Maths-specific code — English and Writing families can be added as new `EducationalFamily` values without further type changes. **No English or Writing blueprint has been built.** CSSE/Maths remains the only pathway with real, tested depth.

## B. Proof Family — `mr03-angle-sum`, Before vs After

| | Before (calibration batch) | After (this increment) |
|---|---|---|
| Blueprints | 1 (undeclared) | **7**, each with a stable `blueprintId` |
| Reasoning routes | 1 (`direct_computation` only) | **4** (`direct_computation`, `multi_step_application`, `comparison`, `error_identification`) |
| Unknown positions | 1 (`third_angle`) | **6** distinct positions |
| Representation types | 1 (prose) | **2** (prose, table) |
| Named misconceptions targeted | 0 | **6**, each distinct and disclosed |
| Difficulty dimensions | 1 defective rule (keyed off the *answer's* divisibility by 5 — a defect fixed last pass) | 2-3 genuine dimensions per blueprint (sum magnitude, ratio complexity, discrepancy closeness, result closeness, doubling-step) |
| Structural diversity ratio (10 candidates) | 0.10 (CRITICAL) | n/a — see blueprint-depth model below, which supersedes the raw ratio for multi-blueprint families |

One blueprint honestly **not** built: a "reverse reasoning" variant, because `180 - a - b` is symmetric across all three angle positions for this fact — relabelling the unknown does not create a mathematically distinct computation. Forcing it in would have been exactly the "force structures to hit a blueprint count" the Founder's brief forbade. This is disclosed in `angleSumBlueprints.ts`'s own module docstring, not hidden. 6 of the requested 6-10 blueprint range's low end was exceeded (7 built); all 7 are competency-locked to MR-03/QT-MR-07 — none changes the underlying competency to inflate the count.

## C. Proof Batch — 80 Candidates, Generated + Validated, NOT Published

Run via `scripts/question-factory-scale-proof-batch.mjs` (real production `mr03-angle-sum` rows fetched read-only for duplicate comparison; 7 existing rows found). Full output: `scripts/output/question-factory-scale-proof-batch-report.json`.

- **Generated: 80. Automated-pass: 80. Automated-reject: 0.**
- Per-blueprint spread: 11-12 candidates each (round-robin), all 7 blueprints represented.
- **Blueprint depth: 7. Variant depth (skeleton count): 8. Dominant blueprint share: 0.15** (no single blueprint dominates the batch).
- **Scaled memorisation risk: LOW** — under the new blueprint-depth model. Under the *old* raw ratio (8 skeletons / 80 = 0.10) this batch would have been mislabelled CRITICAL, which is exactly the false-negative case Section 11 named and required the new model to fix.
- Difficulty: 3 distinct tiers present (medium 33, easy 26, hard 21) — no missing tier, no single-tier collapse.
- Reasoning routes: 4 distinct, none over 29% share (direct_computation 12, multi_step_application 23, comparison 23, error_identification 22).
- Representation: prose 75 / table 5 (table only exists within one blueprint by design, not evenly forced).
- Unknown position: 6 distinct values, spread 11-22 each.
- 6 distinct named misconceptions covered, zero overlap in wording.

**Effective educational depth of this 80-candidate batch: 7 principal structures** (the blueprint count), not 80 and not the raw 8-skeleton figure — a materially different, evidence-based number from the calibration batch's effective depth of 1 for the same family. **This batch has NOT been submitted, approved, or published.** No submit/review/publish RPC exists anywhere in the generation or proof-batch script code (verified by grep — zero `.insert`/`.update`/`.upsert`/`.rpc`/`.delete` calls across all new/changed files this increment).

## D. Family Depth Standard — Metrics Now Reported

`classifyBlueprintDepth()` now reports, for any candidate batch carrying `blueprintId`: raw variant count, blueprint depth, variant (skeleton) depth, dominant-blueprint share, average variants per blueprint. `classifyScaledMemorisationRisk()` consumes both blueprint depth *and* balance:

- `blueprintDepth <= 1` → CRITICAL (unchanged from the old single-structure case)
- `dominantBlueprintShare > 0.7` → CRITICAL (many blueprints exist on paper, but one dominates in practice — a real filler-blueprint trap, not a hypothetical one)
- `blueprintDepth <= 2` or share `> 0.5` → HIGH
- `blueprintDepth <= 4` or share `> 0.35` → MEDIUM
- else → LOW

Verified by test (`scaleArchitecture.test.ts`) against exactly the Founder's own named example: **100 candidates generated from 10 balanced blueprints does NOT classify CRITICAL** under this model, while a batch with 7 nominal blueprints but one dominant filler blueprint **still does** classify CRITICAL — balance, not just blueprint count, is load-bearing. Legacy single-blueprint content (no `blueprintId` present) still falls back to the old raw-skeleton-ratio behaviour unchanged, so this is additive, not a silent re-grading of already-audited content.

## E. Curriculum-Wide Estate — What Is and Is Not Known

**Authoritatively known this session (read-only, anon-key verified):**
- `ali_question_bank` currently holds **351 rows** (all statuses, all subjects) — this is a raw table count, not the Founder's own stated "558 active usable questions" figure, which is presumably filtered by publication/eligibility criteria this session did not independently reproduce. **This discrepancy is disclosed, not resolved** — recommend the Founder or a follow-up increment reconcile the two counts with an explicit query definition before either number is used in a capacity plan.
- Maths: **74 confirmed genuine educational families** (carried forward from the prior increment's own audit — not re-derived this session).
- English: a secondary passage-bound lens of **94** was previously identified; the family-record count (previously noted around 80 database records) has **not** been classified into genuine-educational-family vs passage-bound-group vs factory-ready-family this session.
- Writing: database family-record count (previously noted around 16) has **not** been classified this session either.

**Not done this session, and not fabricated:** no diagnostic query was run against English or Writing family records to produce a genuine-family count, a factory-ready-family count, or a passage-bound-group count. Section 13's own instruction — "do NOT assume 170 database family records = 170 genuine educational families" — is being honoured here by explicitly declining to report a number that was never measured, rather than estimating one. **This is the single largest open item blocking a credible capacity plan for English/Writing** (Section F/G below are therefore Maths-only where they cite hard numbers).

## F. 3,000-Question Capacity Plan — Realistic Route, Not a Promise

Directional, Maths-led (the only pathway with real blueprint-depth evidence):

| Milestone | Route | Basis |
|---|---|---|
| 558 → ~650 | Publish the existing 3 already-audited, non-defective calibration candidates (`mr01-decimal-computation` #1-3) if Founder-approved; remediate and re-submit the `precision-frac`/`mr03-angle-sum` defects already fixed this increment and last | Evidence-based, small, immediate |
| ~650 → 1,200 | Build 3-5 more Maths blueprint families to the same 6-10-blueprint depth as `mr03-angle-sum`, run each through the same proof-batch-then-human-calibration cycle before any production insert | Requires repeating this increment's process per family — not yet done |
| 1,200 → 2,000 | Extend blueprint architecture to the strongest 10-15 of the 74 confirmed genuine Maths families; begin first English blueprint family only after English's own family-classification work (Section E) is complete | English is explicitly gated, not assumed |
| 2,000 → 3,000+ | Requires English contributing a real share (directional allocation per the Founder's own Section 14: Maths≈1200, English≈1000, verbal/reasoning≈300, Writing≈200, mock/reserve≈300+) — **none of this English/Writing volume is currently backed by any built blueprint architecture** | Aspirational until Section E's classification work lands |

**Unpublished candidates are not counted as active supply anywhere in this table.** The 80-candidate proof batch and the original 30 calibration candidates remain outside every figure above.

## G. 5,000+ Maturity Path

Beyond 3,000, the same constraint dominates: genuine blueprint depth per family, not raw generation throughput (Section H proves throughput is not the bottleneck). The realistic path to 5,000+ requires (a) English and Writing reaching Maths's current level of blueprint-architecture maturity, (b) a working answer-equivalence and anti-memorisation pipeline extended per-family (this increment builds the mechanism, not the full per-family content), and (c) the mock/practice pool separation from Section K actually implemented, since otherwise a chunk of the 5,000 would need to be mock-reserved rather than practice-facing. No further work toward 5,000 is recommended before 3,000 is genuinely, safely reached.

## H. Speed / Throughput — Real Measurement, Real Bottleneck

Measured via `scripts/question-factory-scale-throughput-probe.mjs` (in-process `runFamilyBatch`, no database access, no RPC calls; full data in `scripts/output/question-factory-scale-throughput-probe-report.json`):

| Batch size | Total time | ms/candidate | Approved | Approval rate |
|---|---|---|---|---|
| 100 | 9.7ms | 0.097ms | 98 | 98.0% |
| 200 | 10.2ms | 0.051ms | 196 | 98.0% |
| 500 | 32.2ms | 0.065ms | 465 | 93.0% |
| 1,000 | 106.7ms | 0.107ms | 898 | 89.8% |
| 1,500 | 212.7ms | 0.142ms | 1,316 | 87.7% |
| 2,000 | 349.4ms | 0.175ms | 1,600 | 80.0% |
| 3,000 | 576.1ms | 0.192ms | 1,345 | 44.8% |
| 5,000 | 979.5ms | 0.196ms | 1,183 | 23.7% |

**Raw generation+validation compute speed is not the bottleneck** — it stays sub-millisecond per candidate throughout, even at 5,000. **The real, load-bearing bottleneck is finite parameter space per blueprint**, most acutely `BP_ISOSCELES_RELATIONSHIP` (a genuinely single-parameter blueprint, `equalAngle` in a ~76-value range, disclosed as such in its own `similarityControls` field) and, to a lesser extent, `BP_RATIO_SPLIT` (constrained to integer-dividing ratios, excluding 1:1). Because `runFamilyBatch` round-robins evenly across all 7 blueprints, once a batch's per-blueprint share exceeds a narrow blueprint's real distinct-value count, that blueprint starts generating duplicates against its own family's approved set — dragging down the whole batch's approval rate even though the other 5-6 wide-parameter-space blueprints keep supplying fresh, valid candidates.

This distinguishes, per the Founder's own Section 15 requirement:
- **Generation speed**: extremely fast, not a constraint at any tested scale (sub-millisecond/candidate).
- **Validation/duplicate-rejection speed**: also fast — the collapse is in *approval rate*, not processing time.
- **Genuinely fresh supply capacity**: this single 7-blueprint family cannot safely supply much beyond roughly 500-1,000 total lifetime questions before its narrowest blueprint saturates. **This is a real, disclosed ceiling for THIS family as built**, not a hypothetical concern — widening `BP_ISOSCELES_RELATIONSHIP`'s parameter range (e.g. finer angle increments, or a second free parameter) or adding further blueprints would raise it, but neither has been done this increment.
- **Human-calibration and publication speed**: unmeasured this increment (no human review or publication activity occurred) — Section I addresses this qualitatively only.

**The illustrative batch sizes from Section 15 (A:50-100, B:200-300, C:500+, D:3,000+) map onto this evidence as: Batch A and B are safely within this family's real capacity; Batch C is at or near its practical ceiling; Batch D (3,000+) is NOT achievable from this one family alone at genuine, non-duplicate quality — it would require either widening this family's blueprints or drawing the volume from many families, exactly as the capacity plan in Section F already assumes.**

## I. Human Review Model

Not implemented this increment (out of scope per the Founder's own "define the integration contract if full implementation belongs later" allowance for exploratory sections). The blueprint architecture now provides the concentration signal Section 12 asked for: `blueprintId` on every candidate is a ready-made sampling key. A future review queue can prioritise (a) every genuinely new `blueprintId` in full, (b) a small deterministic sample per already-approved blueprint, (c) 100% of automated-validation failures, (d) any candidate where `deriveAcceptedAnswerForms()` changed the automated verdict (the answer-equivalence override path), (e) any candidate at a near-threshold similarity score. None of this is built; this is the integration contract only.

## J. English Scale Model

Not started. English requires an architecture Maths does not (Section 16: passage provenance, no copyrighted past-paper text, passage-question dependency, answer-evidence grounding) that has not been designed this increment. The `EducationalFamily.subject` type already accepts `"english"` so a future family does not require a type-system change, but zero English blueprints, passages, or family classifications exist as of this report.

## K. Mock Scale Model

Not started. `StructuralBlueprint.mockEligible: boolean` exists as a field (every blueprint built this increment declares it `false`, since none has been validated for mock use), giving a future practice/mock/calibration pool split a place to attach without a further type change. No pool-separation logic has been built.

## L. Test Evidence

- `npx tsc --noEmit` — clean, zero errors.
- `npm test` (`tsx --test tests/**/*.test.ts`) — **3,933/3,933 pass**, including the new `tests/lib/ali/questionFactory/scaleArchitecture.test.ts` (17 tests: competency alignment, blueprint ID stability, a real 140-candidate batch with zero `answer_mismatch`, generation-constraint enforcement, representation-saturation detection, the Founder's exact "100 from 10 balanced blueprints ≠ CRITICAL" case, dominant-filler-blueprint still CRITICAL, answer-equivalence accept/reject, misconception-coverage distinctness).
- `npx eslint` scoped to every file touched or created this increment — **zero errors, zero warnings**. (The repo-wide `npm run lint` shows 76 pre-existing errors/23 warnings in unrelated legacy test files this increment did not touch — confirmed by name against the changed-file list; not introduced this session.)
- `node scripts/copy-quality-guard.mjs` — PASS, 299 files, 0 violations.
- `node scripts/migration-sql-guard.mjs` — PASS, **231 migration files** (unchanged from before this increment — confirms zero migrations were created or modified).
- `npm run build` (`next build`) — completes cleanly, all routes compile.

## M. Production State — Confirmed

- Zero migrations created or modified (231 before, 231 after).
- Zero `.insert`/`.update`/`.upsert`/`.rpc`/`.delete` calls anywhere in any file changed or added this increment (verified by direct grep across `lib/ali/questionFactory/*.ts` and both new scripts — no matches).
- `ali_question_bank` read-only row count checked via anon key: **351** (a raw count; not compared against a matching prior-session baseline query, so this figure confirms "no obvious mass insert happened," not a row-for-row diff against a known-good snapshot).
- The 30 original calibration candidates' exact `pending_review`/`approved`/`published` counts could **not** be independently re-confirmed this session: `ali_question_candidate` is RLS-protected from the anon key used for read-only checks (query returned 0 rows, consistent with admin-only access, not with the table being empty). This is a genuine limitation, disclosed rather than papered over — the guarantee for "the 30 are untouched" rests on this session's code having made zero write calls of any kind (confirmed above), not on a live re-query of their status.
- The 80-candidate proof batch exists only in `scripts/output/question-factory-scale-proof-batch-report.json` (a local file) and was never submitted via any RPC.
- No learner-facing code path was touched — no route, no selection/recommendation logic, no published content.

## N. DECISION

**SCALE ARCHITECTURE — PASS WITH FINDINGS.**

Justification: this increment produced real, tested evidence — not code-generation-speed alone — that Angel can produce a substantially larger batch with genuine educational diversity from a single family: 7 competency-locked, genuinely distinct blueprints (not cosmetic variants), an 80-candidate real proof batch classified LOW memorisation risk under a new, honestly-validated depth model (superseding a raw-ratio formula that would have wrongly flagged the same batch CRITICAL), zero automated-validation failures, 3 difficulty tiers, 4 reasoning routes, 6 named misconceptions, and a concrete fix of the Section 9 answer-equivalence defect. All of this is backed by 3,933 passing tests, a clean build, and unchanged migration/production-safety guards.

The "WITH FINDINGS" qualifier is deliberate and required by the evidence itself: (1) this single family's real safe-supply ceiling is roughly 500-1,000 candidates before its narrowest blueprint (`BP_ISOSCELES_RELATIONSHIP`) saturates — a genuine limit disclosed in Section H, not a theoretical one; (2) the curriculum-wide estate for English and Writing remains unclassified (Section E), so the 3,000/5,000 targets are credible for Maths only until that work is done; (3) human review, English architecture, and mock-pool separation are contract-only, not built. None of these findings block the PASS — they define exactly what "Founder/educational review" (Section 23) should weigh before authorising any further generation wave.

---

**STOP.** Per the Founder's Section 23 instruction: no proceeding to 3,000 questions, no publication of the 80-candidate proof batch, no approval of the original 30 calibration candidates, no new subject-scale generation wave. This report and its underlying code (not yet committed) await Founder/educational review.
