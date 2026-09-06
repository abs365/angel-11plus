# Angel 11+ — Educational Foundation Completion & Governance Standard

**Prepared:** 2026-09-06. Updated in place (Migration 232 Production Reconciliation + Educational Foundation Closure) following the Founder's direct production application of a hardened migration 232 and fresh post-application production evidence. This revision reconciles source control to production reality, corrects a disproven root-cause inference, completes two of the three previously-open blockers, and re-decides accordingly.

---

## A. Migration 232 Reconciliation

**The Founder applied a corrected migration 232 directly to production, not the repository's original draft.** The repository file (`supabase/migrations/232_ali_question_family_live_sync.sql`) has been rewritten in place — not superseded by a migration 233 — to exactly match the production-applied definition, with a CORRECTION HISTORY section disclosing what changed and why (matching this repo's own established convention, e.g. migrations 163/227/228/231).

Hardening now present in the repository file, matching production exactly:
- **A. Security definer hardening**: `revoke all on function ... from public, anon, authenticated` for both `ali_sync_question_family(text)` and `ali_question_bank_family_sync_trigger()`.
- **B. Zero-member family handling**: a family with zero live `ali_question_bank` rows is NORMALISED (`row_count=0`, `production_eligible=false`, `skills`/`question_types`/`pathways`/`difficulty_range` cleared), never deleted — its identity is preserved.
- **C. Zero-member corrective pass**: the one-time repair walks every existing `ali_question_family` record with zero live members (via a `LEFT JOIN`), not only `family_id` values currently present in the bank.
- **D. Fail-closed verification**: uses `LEFT JOIN`/`COALESCE` so every family record — including zero-member ones — is checked against live bank membership, plus a separate check that no zero-member family remains `production_eligible=true`.
- **E. Cross-subject integrity**: `ali_sync_question_family` now fails closed (`RAISE EXCEPTION`) if a single `family_id` spans more than one `subject`, rather than arbitrarily picking one via `(array_agg(distinct subject))[1]`.
- **F.** The file now correctly records migration 231 as already Founder-applied and production-verified, not pending.

**14 structural tests** (`tests/supabase/migration232AliQuestionFamilyLiveSync.test.ts`, rewritten) prove every one of these six properties from the file's own source text. This migration is **already applied** — the repository file exists as the accurate historical record and regression guard, and must NOT be re-applied. No migration 233 was created.

## B. Root-Cause Correction

**The prior report's inference is disproven, and this is recorded plainly, not concealed.** The prior report reasoned: 17 Writing bank rows, 16 distinct `family_id` values, and Q4 showing `row_count=1` for every one of those 16 families, therefore some family must hold 2 live rows invisible to `ali_question_family` due to staleness.

**Post-application production evidence** (Founder-run, single read-only query, authoritative):

| Metric | Value |
|---|---|
| `writing_total_rows` | 17 |
| `writing_rows_with_family` | 16 |
| `writing_rows_without_family` | **1** |
| `writing_distinct_families` | 16 |
| `stale_family_row_counts` | 0 |
| `invalid_zero_member_production_families` | 0 |
| `cross_subject_family_ids` | 0 |

**16 + 1 = 17.** The real cause was one Writing bank row with `family_id IS NULL` — simple arithmetic, not a stale `row_count` hiding a second row inside an existing family. The original inference is **disproven**, and this correction is recorded in `ANGEL_EDUCATIONAL_CONTENT_STANDARD.md`'s Correction Log and in migration 232's own file header.

**This does not mean migration 232 was unnecessary.** Two genuinely separate things are true at once, and must not be conflated:
- **ORIGINAL WRITING DISCREPANCY ROOT CAUSE**: one Writing bank row lacks `family_id` — nothing to do with staleness.
- **SEPARATE ARCHITECTURAL WEAKNESS**: `ali_question_family` was a one-time backfill snapshot (migration 228's `on conflict (family_id) do nothing`) with no ongoing synchronisation after content changes — a real, independently-verified problem (`stale_family_row_counts = 0` proves it is now fixed, and would have caught a genuine staleness case had one existed for any subject).
- **Migration 232** closes the architectural weakness and hardens derived-family integrity generally — its justification stands independent of what specifically caused the Writing 17-vs-16 discrepancy.

## C. Authoritative Inventory (corrected)

| | Maths | English | Writing | Total |
|---|---|---|---|---|
| Database rows (all statuses) | 301 | 243 | **17** (corrected from the prior report's stale 14) | 561 |
| Practice-eligible rows (anon-confirmed live) | 202 | 142 | 7 | 351 |
| Database family records | 74 | 80 | 16 | 170 |
| Production-eligible family records | 67 | 55 | 7 | 129 |
| Rows without a family_id | 0 (confirmed) | not separately confirmed this pass | **1** | — |
| Genuine educational families (confirmed) | **74** | not resolvable this session | not resolvable this session | Maths only |

**English Q1/Q2 (Founder-run, authoritative)**: 17 practice_only + 38 mock_only + 0 mixed_practice_and_mock + 25 neither_track = 80. Confirms clean family-level track separation — no family straddles both tracks. **This total row-count correction (558→561) is disclosed, not hidden** — it reflects Writing's corrected 17 (not the stale 14), not new content.

## D. The Unfamilied Writing Row

**Not identifiable from this session's own access.** The anon key can only read `practice_eligible` rows (RLS allow-list, migration 100); all 7 anon-visible Writing rows carry a real `family_id` — the unfamilied row must be among the other 10 Writing rows (provisional/`authentic_assessment_candidate`/`independently_validated`/`mock_eligible`), which anon access cannot see. Per the Founder's own explicit instruction, no guess is offered. **Exact, sufficient, read-only Founder SQL**:

```sql
select id, family_id, eligibility_status, provenance, active, created_at,
       question_type, prompt->>'skill' as skill
from public.ali_question_bank
where subject = 'writing' and family_id is null;
```

**Disposition (once identified) must be evidence-based, per the Founder's own three options** — this cannot be pre-judged without the row's own identity:
- **(A) legitimately remain unclassified** — defensible if the row is a genuine one-off (e.g. a single evidence-only/experimental item never intended to join a reusable family).
- **(B) join an existing family** — defensible only if its competency/task-type/topic genuinely matches an existing Writing family's own scope, not merely to eliminate a NULL.
- **(C) a new, justified family** — defensible only if it represents a genuinely distinct task/topic not covered by any existing Writing family.
**No family was created or assigned in this increment.** No production data was mutated.

## E. English Family Classification

Using `lib/ali/familyTaxonomy.ts`'s `classifyFamilyRecordType()` against the corrected inventory (Section C) and the Founder's own cited Q1 examples (unchanged from the prior report, since no new per-row Q1 detail was provided this pass beyond the aggregate track split):

- **Wave-authored, multi-row families** (`wave1-fam-vocab-explain`=17, `wave1-fam-sequencing`=15, `wave1-fam-direct-retrieval`=14, `wave1-fam-quote-explain`=13, `wave1-fam-synonym-battery`=11, `wave1-fam-emotion-cause`=11 — 6 examples, 81 rows) → `educational_family`, **heuristic** confidence.
- **Single/few-row assessment-oriented IDs** (`eng-inc*`, `eng-pc*`, `mock-*`) → `assessment_form_group`/`mechanical_or_storage_family`, never `educational_family`.
- **RAW DATABASE FAMILY COUNT = 80. GENUINE EDUCATIONAL DEPTH remains not fully established** — the practice_only=17/mock_only=38/mixed=0/neither=25 split (Section C) is a real, useful TRACK classification, but it is not itself an educational-genuineness classification (a mock_only family can still be a genuine educational family, just not yet Practice-visible). **A full classification of all 80 records still requires the complete Q1 row-level result set** (family_id, row_count, statuses_present per family), which this session does not have — only the Founder's cited aggregate/example rows. This is the one blocker genuinely not closed this pass (Section L).

## F. Writing Family Classification

**16 database family records DOES NOT prove 16 genuine educational Writing families — no evidence supports that claim.** Every real Writing family record observed to date (via anon-visible practice_eligible rows, Section D of the prior report) is a single `wc01a`-tagged task/prompt instance, distinguished by topic/genre only. `classifyFamilyRecordType()` classifies every one `task_prompt_group`, never `educational_family`, at heuristic confidence. **RAW DATABASE FAMILY COUNT = 16 (17 rows, 1 unfamilied). GENUINE EDUCATIONAL DEPTH = not established** — genre/topic variation is manually curated, not a measured educational-dimension signal (`ANGEL_EDUCATIONAL_CONTENT_STANDARD.md` Section 15's own standing rule).

## G. Remediation — Live Integration

**Closed to the full extent real evidence permits; the remainder is an honest CONTENT SUPPLY BLOCKER, not a wiring gap.** `PreparationDecision.remediationAction: RemediationAction | null` (new field) is now computed inside `buildPreparationDecision()` from the SAME real "rebuilding" regression evidence (`weakCompetencies`) the contract already computes — `null` whenever no real regression exists anywhere, never guessed. `deriveLiveRemediationAction()`/`deriveRemediationContext()` (`lib/learningEngine/remediationPolicy.ts`, new) map this onto `selectRemediationAction()`'s existing policy, reusing PreparationDecision/EducationalState directly — **no parallel recommendation engine was built.**

A real defect was caught and fixed during this wiring: the first draft checked `hasFullLessonAvailable(recommendedCompetencyId)` — the TOP-priority candidate — rather than the actually-regressing competency, which can differ (e.g. a `never-attempted` competency can outrank a separately-`rebuilding` one). Corrected to check the first weak competency's own lesson availability; proven by a dedicated test using exactly this scenario.

**Genuinely live signals**: `hasRealRegressionSignal` (from `weakCompetencies`), `hasFullLessonAvailable` (the same real callback every other part of this engine uses). **Honest CONTENT SUPPLY BLOCKERS, disclosed not fabricated**: `hasMisconceptionTargetedBlueprintAvailable`/`hasAlternativeRepresentationAvailable`/`hasMultipleBlueprintsInFamily` require live Question Factory `StructuralBlueprint` metadata connected to a learner's specific family — today that metadata exists for exactly one family (`mr03-angle-sum`) and no pipeline connects a learner's family_id to it at this decision layer; `hasPrerequisiteCompetencyWithWeakEvidence` is honestly `false` because the one real prerequisite graph in this codebase (`COMPETENCY_RELATIONSHIPS`) covers Vocabulary/Verbal-Reasoning/Numerical-Reasoning competency codes only, not the CSSE `MR-XX`/`RC-XX`/`WC-XX` codes this decision contract actually serves.

**3 new tests** prove: no false positive (no regression → `null`), correct escalation (`re_teaching` with a lesson, `worked_example` without), and the exact bug-catch scenario above. All pre-existing decision/session tests still pass.

## H. TeachingState — All 8 States, Live Effect Proven

**Fully closed. All eight states now have a demonstrated, real, tested effect on the actual learner/session path — no arbitrary behaviour was added merely to claim 8/8.**

| State | Live mechanism | Evidence |
|---|---|---|
| `explicit_teaching`/`worked_example` | Routes `recommendedActivityType` to `teaching_lesson` when a real lesson exists | Pre-existing, re-confirmed tests |
| `guided_practice` | `GUIDED_FAMILY_BOOST` (family has real `mathsTeachingContent.ts` coverage) | Pre-existing |
| `scaffolded_practice` | **Completed this pass**: now ALSO receives a family-independent `favour_guided_and_easier` tier boost (the existing, calibrated multiplier table reused, not a new number), closing the gap where it previously had zero effect for the ~59 of 74 Maths families with no real teaching content | New test: easy-tier share increases even for an untaught family |
| `independent_practice` | `favour_independent_and_harder` lean (via stage) | Pre-existing (PERSONA B/D) |
| `transfer` | `UNSEEN_TRANSFER_BOOST` for FAR_TRANSFER-tagged material | Pre-existing (PERSONA D) |
| `mastery_check` | **Completed this pass**: now receives a `favour_independent_and_harder` tier boost, previously had NO session-composition effect at all | New test: hard-tier share increases under an otherwise-balanced lean |
| `maintenance_retrieval` | Routes `recommendedActivityType` to `revision_retrieval` | `preparationDecisionTeachingState.test.ts` |

Both completions reuse `DIFFICULTY_LEAN_MULTIPLIER`'s own existing, already-calibrated values as a second, additive layer — never a replacement of `recommendedDifficultyLean`, never an invented number. **2 new tests**, both passing; all 16 tests in the persona/session file pass with zero regression.

## I. Educational Content Standard

`ANGEL_EDUCATIONAL_CONTENT_STANDARD.md` remains the permanent governing standard, unchanged in structure. Its Correction Log now records the Section B root-cause correction, dated, with the reason and the specific fact corrected — demonstrating the Correction Log mechanism itself working as designed, not merely declared.

## J. Test Evidence

- `npx tsc --noEmit` — clean.
- `npm test` — **4,011/4,011 pass** (4,001 carried forward + 10 new: 3 remediation live-wiring, 2 TeachingState completion, plus the 14 rewritten migration-232 structural tests replacing the prior 9 — net +10 after replacement accounting matches exactly).
- `npx eslint` scoped to every file touched this pass — zero errors, zero warnings.
- `node scripts/copy-quality-guard.mjs` — PASS, 304 files.
- `node scripts/migration-sql-guard.mjs` — PASS, **232 migration files** (unchanged count — migration 232 was rewritten in place, not added anew).
- `npm run build` — clean, all routes compile.
- Zero regressions: every pre-existing test in `preparationDecision.test.ts`, `increment021PreparationHorizonPersonas.test.ts`, `sessionGenerator.test.ts`, `selection.test.ts`, `remediationPolicy.test.ts`, and `mockContentFirewall.test.ts` still passes unchanged.

## K. Production Safety

- **No migration was applied by this session.** Migration 232 was already applied by the Founder before this increment began; the repository file was corrected in place to match, never re-applied.
- **No migration 233 was created.**
- **No production content was mutated** — the unfamilied Writing row was not assigned a family; zero write/RPC calls exist anywhere in this pass's application-code changes (`remediationPolicy.ts`, `preparationDecision.ts`, `sessionGenerator.ts`) — confirmed by grep (the only `.delete(` matches found are pre-existing in-memory `Set.delete()` calls, not database writes).
- No candidates published, no bulk generation, no new mocks, no released learner result altered, no RLS weakened, no mock/calibration content exposed.
- `ali_question_bank`: 351 anon-visible rows, unchanged before/after this pass (re-confirmed via live query).

## L. Remaining Blockers (only genuine ones)

1. **English/Writing genuine-family classification remains open** — this session has the Founder's own aggregate Q1/Q2 track-split evidence (a real, useful classification dimension) but not the complete per-family Q1 row-level result set needed to classify all 80 English records individually. This is a data-access limitation, not an effort limitation — closing it requires either the full Q1 export or a live admin session applying `classifyFamilyRecordType()` directly.
2. **The unfamilied Writing row's identity and disposition remain undetermined** — the exact SQL to find it is provided (Section D); its A/B/C disposition cannot be judged without that row's own data.
3. **`hasMisconceptionTargetedBlueprintAvailable`/`hasAlternativeRepresentationAvailable`/`hasMultipleBlueprintsInFamily`/`hasPrerequisiteCompetencyWithWeakEvidence` remain honest content-supply/architecture gaps** in the remediation policy's live inputs — correctly reclassified from "not wired" to "the wiring exists; the underlying content/graph coverage does not yet extend to these signals for CSSE competencies."

## M. DECISION

**EDUCATIONAL FOUNDATION PARTIAL — NOT READY FOR CONTROLLED SCALE.**

Justification: two of the three previously-open blockers are now genuinely closed with real, tested evidence — TeachingState materially influences live session selection across all 8 states (not merely 6), and the remediation policy is genuinely wired to real regression evidence with its remaining gaps honestly reclassified as content-supply limitations rather than missing plumbing. Migration 232 is correctly reconciled to production, its false root-cause inference is disclosed and corrected rather than concealed, and the separate, real architectural weakness it fixes remains genuinely fixed regardless of that correction. 4,011/4,011 tests pass, zero regressions, zero unauthorised production mutation.

**Not COMPLETE** because English/Writing genuine-family classification — one of the Founder's own three explicitly-named remaining blockers — is still open, for a real, disclosed data-access reason (this session does not have the complete Q1 row-level result set), not a resolved-and-forgotten item. This specifically limits confidence in any future English/Writing content-production wave; it does not, on its own logic, block a Maths-only next step, but the Founder's own three-way decision does not offer a scope-qualified answer, and awarding COMPLETE while a named blocker remains open — even one arguably orthogonal to the narrowest possible next step — would risk exactly the "COMPLETE merely because most things now pass" pattern this whole increment was explicitly warned against.

---

**STOP.** Per Section 14: no 200-300 candidate wave, no 3,000 generation, no publication of the original 30 or the 80-candidate proof batch, no new increment. Founder review remains the gate to controlled scale.
