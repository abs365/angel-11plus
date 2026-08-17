# Angel 11+ — 007X: Mathematics Content Depth and Transfer Expansion V1

**Educational Increment 007X.** Prepared 2026-08-17. Founder-authorised. Continues from Decisions 76/77 (007W CLOSED, PASS WITH FINDINGS). Purpose: begin CSSE content completion for Mathematics — depth, not volume — via a fully-reconciled estate matrix, evidence-based prioritisation, and one bounded, tightly-governed authoring batch.

---

## 1. Baseline

Re-verified live at the start of this increment: clean working tree, `main` = `origin/main` at `f901ec0`, production **TOTAL 298, Practice Eligible 281, Mathematics PE 161, English PE 120, Writing PE 0, Provisional 17, Mock Eligible 0**, full suite **471/471**. No drift.

---

## 2. Strategic target

007R/007S's refined sustained Mathematics target: **~280-288 Practice Eligible**. Current: 161. Distance: ~119-127. This increment does not attempt that distance in one pass — see §21.

---

## 3. Full Mathematics estate matrix (re-queried live, not assumed from prior reports)

166 Mathematics rows total (161 PE + 5 provisional), across **32 groupings**: 31 named families + 1 ungrouped legacy pool (18 rows). Family-level depth, difficulty spread, eligibility, and provenance were re-queried directly from `ali_question_bank`, not inferred from any prior document.

| Family | Skill | n (pre-007X) | Difficulty spread | Notes |
|---|---|---|---|---|
| mr01-whole-number-computation | QT-MR-01 | 13 | easy 2/medium 9/hard 2 | Deep |
| mr01-decimal-computation | QT-MR-01 | 7 | easy 2/medium 4/hard 1 | Adequate |
| mr01-fraction-computation | QT-MR-01 | 7 | easy 2/medium 3/hard 2 | Adequate |
| mr01-multistep-order-of-operations | QT-MR-01 | 7 | easy 2/medium 3/hard 2 | Adequate |
| mr02-sequence-rule | QT-MR-05 | 10 | easy 5/medium 5 | Deep |
| mr02-nth-term | QT-MR-05 | 5 | medium 5 | Single-band |
| mr02-compare / far-ratio-context / sum-difference | QT-MR-06 | 3 each | medium only | Single-band, thin |
| mr02-substitution | QT-MR-06 | 5 | hard 5 | Known brittle answer-format risk (§14) |
| mr03-angle-sum | QT-MR-07 | 7 | easy 4/medium 3 | Adequate |
| mr03-angle-ratio / classify / **mixed-perimeter** / coordinate | QT-MR-07/08 | 3-5 | mostly single-band | **mixed-perimeter selected §4** |
| mr04-compound-percentage / best-value / elapsed-time | QT-MR-04/10/13 | 5 each | medium only | Single-band |
| mr04-far-percent / far-recipe / mixed-divisibility | QT-MR-04/13 | 3 each | medium only | Single-band, thin |
| mr05-factors-primes / number-property | QT-MR-11 | 5 each | mostly single-band | Adequate |
| mr05-constrained-multiple | QT-MR-11 | 3 | medium only | Thin |
| **mr05-number-property-search** | QT-MR-11 | **2** | medium only | **TRANSFER-UNSAFE, selected §4** |
| **precision-frac / precision-dec** | QT-MR-14 | 3 each | medium only | **LIMITED, selected §4** |
| (ungrouped legacy pool) | 11 distinct QT codes | 18 | mixed | See §9 |

Teaching maturity (`lib/learningEngine/mathsTeachingContent.ts`, re-verified by direct file inspection, 26 entries): **26 of 31 named families have MODEL/Guided/Remediation content. mr05-number-property-search has none (deliberately, TRANSFER-UNSAFE). The 4 MR-01 families (added 007T, after Phase B) have none — never assessed by Phase B because they did not exist yet.** This is a genuine, confirmed gap, not assumed.

---

## 4. Prioritisation (Part 4, criteria A-J) and selected batch

Ranked using the existing Phase B evidence record (`ANGEL_PHASE_B_MATHEMATICS_TEACHING_COMPLETION_V1.md`) rather than re-deriving prioritisation from scratch — that document already ranked LIMITED families by proximity to "a disguised clone set" (its own Part 7) and named `mr05-number-property-search` as the one deferred, TRANSFER-UNSAFE family with an explicit prescribed remedy. Criteria B (thinnest: 2-3 siblings), C (transfer weakness: only 1 family is TRANSFER-UNSAFE), D (single-difficulty-band: ~14 families are medium-only), E/F/G (Phase B's own LIMITED ranking), I (teaching maturity: only 1 family has zero teaching content) all converge on the same small set.

**Selected for this batch, in priority order:**
1. **mr05-number-property-search** — top priority: the only TRANSFER-UNSAFE family, the only family with zero teaching content, and Phase B's own explicit prescription was "add 3-4 more siblings varying the searched property."
2. **mr03-mixed-perimeter** — Phase B's #1-ranked LIMITED family ("identical word-problem template ×3").
3. **precision-frac** — Phase B's explicit fix: "needs a non-improper-fraction or already-simplified case."
4. **precision-dec** — Phase B's explicit fix: "needs a round-down example."

**Scope decision, disclosed:** the directive's "expected" range is 40-60 questions; this batch is **14 new questions** (plus 1 legacy-row reclassification), deliberately smaller. Reasoning: with 14 questions across 4 families, every answer could be independently hand-recomputed, every family's structural-variation claim could be verified against real prior siblings, and a real, evidenced review pack could be prepared — properties that would have been harder to sustain honestly at 40-60 across many more families in one pass. The directive explicitly permits this ("use a smaller batch if that is what can be properly governed and reviewed").

---

## 5. Difficulty standard

No second difficulty model was invented. `content_difficulty` (existing schema field: easy/medium/hard) is used throughout, mapped to the directive's EASY/EXAM-STANDARD/HARD language. Difficulty was assigned from structural demand, not magnitude: e.g. `mr05-search-06` (HARD) requires recognising a two-constraint LCM search — a genuinely different reasoning structure from `mr05-search-03` (EASY, a single nearest-square check) — not merely larger numbers. `mr03-mix-06` (HARD) requires a square-root extraction step absent from the original siblings' pure division. Distribution across the 14: **EASY 3, EXAM-STANDARD (medium) 5, HARD 6.**

---

## 6. Year group does not define difficulty

No content row in this batch (or anywhere in the estate) is tagged Year 4/5/6. Difficulty and family membership are the only content-level signals; selection by year group is explicitly not implemented at the content layer, preserving Decision 76/77's principle that year group is context for the preparation-intelligence layer, never a content label.

---

## 7. Four new MR-01 families — teaching status

**Confirmed, not assumed:** `grep` of `lib/learningEngine/mathsTeachingContent.ts` (524 lines, 26 family entries) returns zero matches for any of the 4 MR-01 family IDs. **They remain ASSESSMENT ONLY.**

**Disposition:** completing their teaching architecture to Phase B's own quality bar (hand-derived misconceptions, MODEL/Guided/Remediation content, its own dedicated evidence document) is a substantial, separate effort — Phase B itself was its own dedicated increment for 22 families. Attempting a rushed version inside 007X's primarily content-authoring scope risks exactly the under-reviewed quality Phase B's own rigor was designed to avoid. **Not attempted this increment.** Recommended: a dedicated "MR-01 Teaching Completion" increment, mirroring Phase B's structure, as this increment's own recommended next step (§21/47).

---

## 8. mr05-number-property-search disposition

Phase B classified this family TRANSFER-UNSAFE: 2 siblings, both "prime search near a bound," structurally near-identical ("2 data points cannot demonstrate independent transfer vs. memorisation"), zero `addresses_misconception` population. Phase B's own prescribed remedy: "add 3-4 more siblings varying the searched property before this family is considered for teaching content."

**Verdict: REMAINS TRANSFER-UNSAFE for teaching purposes as of the pre-007X baseline (2 siblings).** This increment adds 5 new provisional siblings genuinely varying the property (squares, proper factors, multiples, a two-constraint LCM search, a compute-then-square-then-search item) — exactly Phase B's own prescribed remedy, and beyond its "3-4" minimum. **This makes the family a strong, evidenced candidate for re-classification to SAFE AFTER STRUCTURAL REDESIGN once these siblings are reviewed and (if approved) activated — but teaching content itself was not authored this increment, so the family's teaching-maturity status remains ASSESSMENT ONLY pending Founder review of the new siblings.** No family was reclassified as safe merely to reach coverage; the classification remains disclosed as unresolved until real review evidence exists.

---

## 9. Legacy Mathematics content (18 ungrouped rows) — honest, individual disposition

Every row was fetched and read individually — none force-classified. `qa-008` (`√225 = ?`) is the directive's own named historical example and, per migration 062's own prior, explicit decision, **remains deliberately unclassified** — QT-MR-01 covers whole-number/decimal/fraction/multistep computation, none of which structurally fits a bare square-root extraction.

| Row(s) | Skill | Disposition |
|---|---|---|
| `learn-mth-pct-guided/independent/independent-retry`, `qa-007` | QT-MR-04 | Candidate for a **new** family ("percentage-of-amount") — 3 share an "X% of Y" template, near-duplicate risk; `mth-010` ("What percentage of 340 is 85?") is a genuine reverse-direction variant. **Not created this increment** — would need its own teaching/review scaffolding. |
| `qa-008` (√225) | QT-MR-01 | **Deliberately unclassified**, per the directive's own named example and migration 062's prior decision. Remains provisional-equivalent in status (already PE; no eligibility change made or proposed). |
| `mth-003` | QT-MR-07 | **Reclassified into mr03-mixed-perimeter** this increment (metadata only) — independently re-verified correct (perimeter 48cm, l=3w ⟹ w=6, l=18, area=108cm², matches stored answer exactly) and is precisely the structural variant Phase B recommended. |
| `mth-001` (train speed/time) | QT-MR-10 | Structurally distinct from `mr04-elapsed-time` (clock-time, not speed-distance-time). Candidate for a **new** family; not created this increment. |
| `mth-007b` (ratio, boys:girls) | QT-MR-04 | Skill-tag looks inconsistent with its ratio content (QT-MR-04 is used elsewhere for percentage families). **Flagged as educationally useful but unclassifiable without a dedicated skill-tag audit** — not forced into any family. |
| `mth-005` (profit/loss) | QT-MR-13 | Structurally distinct from `mr04-best-value` (unit-price comparison) and `mr04-mixed-divisibility`. Candidate for a **new** "profit and loss" family; not created this increment. |
| `qa-010` (LCM of 6,9) | QT-MR-11 | Possible fit for `mr05-constrained-multiple`; not confirmed against that family's actual siblings this increment — **not classified with certainty**. |
| `mth-009` (cylinder volume) | QT-MR-07 | 3D geometry, structurally distinct from the existing 2D angle/perimeter/classify siblings. Candidate for a **new** family; not created. |
| `fv-mth-002` (mm/m conversion) | QT-MR-03 | Strong candidate match for `mr01-measurement-conversion`; not confirmed against that family's siblings in detail this increment. |
| `fv-mth-003` (algebraic substitution) | QT-MR-06 | Strong candidate match for `mr02-substitution`. |
| `fv-mth-004` (isosceles apex angle) | QT-MR-07 | Strong candidate match for `mr03-angle-sum`. |
| `fv-mth-005` (data table) | QT-MR-09 | Strong candidate match for `mr01-data-table`. |
| `fv-mth-006` (average/mean) | QT-MR-12 | Strong candidate match for `mr01-average-mean`. |
| `mth-006` (nth-term) | QT-MR-05 | Strong candidate match for `mr02-nth-term`. |

**Disclosed decision:** beyond `mth-003` (independently re-verified and reclassified this increment), no other candidate match above was executed as a migration. Several are strong skill+content matches, but the directive's own caution ("any classification affecting eligibility requires its own evidence... do not force") and this increment's bounded scope mean a proper reclassification pass deserves its own dedicated, careful piece of work — matching how migration 062 itself was originally scoped as dedicated work, not folded into a content-authoring batch. Recommended as a named follow-on (§21/47).

---

## 10. Authoring batch — 14 new questions (see §4 for selection rationale)

Full content lives in `scripts/generate-007x-mathematics-batch.mjs` (self-verifying) and `supabase/migrations/066_007x_mathematics_depth_expansion.sql` (generated, **not applied**). All 14: `angel_original`, `provisional`, `active: true`, version 1, **not Mock Eligible**.

- **mr05-number-property-search** (+5): squares, proper factors, multiples, a two-constraint LCM search, a compute-then-search item.
- **mr03-mixed-perimeter** (+3 new, +1 reclassified `mth-003`): direct reverse-direction (one side given), decimal/non-integer forward-direction, square special case (square-root extraction).
- **precision-frac** (+3): proper-fraction result (already simplest form), a case requiring simplification before mixed-number conversion, a larger-magnitude case.
- **precision-dec** (+3): two genuine round-down cases (abstract division; money context), one 3-decimal-place target (varying the precision requirement, not just the rounding direction).

---

## 11. Structural variation

Genuine variation dimensions used, not template-with-numbers-swapped: unknown position (`mr03-mix-04` gives one side, asks for area — reverse of the existing area-to-perimeter direction), representation (money vs. abstract division vs. distance context in `precision-dec`), operation sequence (square-root extraction in `mr03-mix-06`, LCM reasoning in `mr05-search-06`), precision requirement (2dp vs. 3dp in `precision-dec`), number structure (decimal arithmetic in `mr03-mix-05`, larger magnitudes in `precision-frac-06`), answer form (proper fraction vs. mixed number in `precision-frac`). A structural near-duplicate guard (digit-stripped question-shape comparison) runs inside the generator's own `verify()` and is asserted directly in `tests/content/007xBatch.test.ts` — it caught and forced a real fix during authoring (an early draft of `precision-dec-05` shared the exact "A ÷ B = ? to N decimal places" shape with `precision-dec-04`; changed to a real-world relay-race framing).

---

## 12. Anti-memorisation classification

- **mr05-number-property-search: STRONG** (post-batch) — 7 siblings, 5 genuinely different searched properties, none sharing a template shape.
- **mr03-mixed-perimeter: SUFFICIENT** (post-batch) — 7 siblings across 4 distinct structural sub-patterns (area→perimeter division, perimeter→area via ratio, perimeter→area direct, square/sqrt).
- **precision-frac: SUFFICIENT** (post-batch) — 6 siblings; 3 original share one template (cut-length → mixed number via remainder) but the 3 new ones each break a different assumption (proper fraction, needs-simplification, larger magnitude).
- **precision-dec: SUFFICIENT, with a disclosed limitation** — 7 siblings; **4 of 7 still share the exact abstract "A ÷ B = ? to Ndp" template** (3 original round-up + 1 new round-down). This was a deliberate, disclosed design choice: isolating rounding-direction as the only varying dimension is the cleanest way to test whether a learner has genuinely learned "check the next digit" versus memorised "always round up" — but it does mean this specific subset remains template-similar. Recommended for further diversification in a future increment, not treated as blocking this batch (the family as a whole, counting the 2 real-world-context siblings, is not a "disguised clone set").

No family in this batch was activated while assessed LIMITED or UNSAFE — all remain provisional pending Founder review regardless.

---

## 13. Mathematical correctness

Every one of the 14 answers was independently recomputed from first principles in `scripts/generate-007x-mathematics-batch.mjs`'s `RECOMPUTE` map — hand-derived per item (primality checks, LCM search, GCD-based fraction simplification, floating-point-safe rounding via `toFixed`), not the same code path that authored the question. `mth-003`'s stored answer (108) was independently re-derived by hand (perimeter 48, l=3w ⟹ 8w=48 ⟹ w=6, l=18, area=108) before being reclassified, not merely trusted. `verify()` re-runs on every generator invocation and blocks the migration from being (re)generated if any mismatch is found — it currently reports 0/14 problems.

---

## 14. Answer validation (Decision 55 / brittle-format regression)

`mr02-substitution` and `mr03-coordinate` were **not touched** by this batch — no new siblings, no scoring-parser changes. The full regression suite (491/491, including all pre-existing tests referencing these families) was re-run and passes unchanged. **No new risk was introduced or exposed; the pre-existing brittleness classification is unchanged from before this increment**, and no architectural rewrite of the scoring parser was performed or required.

---

## 15. Teaching compatibility

`mr03-mixed-perimeter` and `precision-frac`/`precision-dec` already have MODEL/Guided/Remediation content (Phase B); the new siblings use the same `family_id`, so they become reachable by that existing teaching flow once (if) activated — no teaching-content change was required or made. `mr05-number-property-search` has no teaching content (§8) — the new siblings remain assessment-only, consistent with the family's existing, unchanged status. `workingSteps` for all 14 are genuine multi-step derivations (verified directly in `tests/content/007xBatch.test.ts`, which asserts the final step is not a bare restatement of the answer) — never restating the final answer as the only step. `maxGuidedRevealSteps` and Phase B's safety rules were not touched.

---

## 16-17. Content review

Uses the existing `ali_family_review` architecture exclusively — no new review system built. Migration 067 (generated, not applied) registers all 4 target families as `pending_independent_review`, `reviewer: 'UNASSIGNED'`, `review_type` default `content_review`, scoped explicitly to the **new siblings only** (each note names exactly which IDs are new versus pre-existing), since anon-key evidence for these families' prior review history is RLS-opaque (200/`[]`) and — per this project's own standing Evidence Hierarchy principle — is never read as "no review exists." The established Founder review basis (Essex CSSE 11+ parent/tuition experience) applies unchanged; no new basis was invented. Review history remains append-only — nothing was updated or deleted.

---

## 18. Mock separation

Mock Eligible confirmed **0** before and after this increment (§1, §21). No Mock paper authored. No Practice question reserved for or copied into Mock. No predictive scoring, Mock reporting, or AI Mock generation built or touched. No Mock firewall architecture code was modified.

---

## 19. Writing/English boundary

Zero English questions, passages, or Writing prompts authored. Writing PE and English PE confirmed unchanged (§1, §21).

---

## 20. Content generation and AI

Programmatic authoring (this session, model-assisted) was used to increase productivity, exactly as the directive permits — but every item passed schema validation, family-contract checking, independent mathematical re-verification, structural near-duplicate detection, and is explicitly marked `provisional`, gated on Founder review and controlled activation before ever reaching a learner. No learner-facing copy anywhere states or implies AI authorship; the product remains "Angel 11+" throughout.

---

## 21. Target after 007X

- Starting Maths PE: **161**
- New provisional questions this increment: **14**
- Review-approved questions: **0** (pending Founder review — migration 067 not yet applied)
- Activated questions: **0** (migration 066 not applied; requires separate Founder authorisation per the directive's own STOP condition)
- **Projected Maths PE if this batch is fully approved and activated: 161 + 14 = 175** (the mth-003 reclassification does not change PE — it was already Practice Eligible... **correction, disclosed**: `mth-003` is `provisional`, not PE — its reclassification alone does not change PE either; it would need its own separate activation decision like the 14 new siblings)
- Remaining distance to ~280-288 after this batch (if activated): **~105-113**

Success this increment is measured by the depth/evidence quality documented above (§4-14), not by percentage progress toward the count.

---

## 22. Exposure intelligence

No exposure/retrieval-priority/family-diversification code was modified this increment. The full suite (491/491) includes the pre-existing exposure-related tests, all passing unchanged. Since none of this batch is activated, there is no live change to verify against real session generation — this is disclosed explicitly, not claimed as verified beyond code-level regression.

---

## 23. Live learner experience

**Not performed and not claimed.** Nothing in this increment is Practice Eligible or reachable by a real learner. Per the directive's own Part 27 instruction, production learner verification is not required for provisional content, and none is claimed here.

---

## 24. Product language

No learner-facing copy was added or modified this increment (all changes are scripts, a migration, and internal documentation). Copy Quality Guard re-run: PASS, 0 violations, 237 files (unchanged file count — nothing in its scan scope was touched).

---

## 25. Product Experience boundary

No redesign performed. No UX observations to record this increment — no learner-facing surface was touched.

---

## 26. Tests added

`tests/content/007xBatch.test.ts` (16 tests): family contracts, difficulty distribution (all 3 bands represented), duplicate/near-duplicate ID and text protection, structural near-duplicate shape guard, misconception population, workingSteps quality, per-family structural-variation assertions, contract-level provisional/Mock-firewall checks, migration idempotency, reclassification correctness. `tests/content/007xPendingReview.test.ts` (4 tests): review registration completeness, reviewer/decision correctness, no eligibility touched, idempotency guard precision. 007W's determinism suite (`missionDeterminism.test.ts`, `parentInsights.focusAreas.test.ts`, `yearGroupSafeguards.test.ts`) re-ran unchanged as part of the full suite — all still passing, confirming repeated dashboard loads still produce identical educational judgement (no new evidence introduced this increment to change any recommendation).

---

## 27. Verification

- Full suite: **491/491** (471 baseline + 20 new).
- TypeScript: clean.
- Copy Quality Guard: PASS, 0 violations, 237 files.
- Production build: succeeds.
- Mathematics bank-wide answer regression: all 14 new answers independently recomputed, 0 mismatches; pre-existing bank unaffected (nothing applied).
- Decision 55 / mr02-substitution / mr03-coordinate regression: unaffected, re-confirmed (§14).
- Mastery-protection, Mock-firewall, 007W determinism, year-group-safeguard suites: all re-run as part of the full 491, unchanged, passing.
- Production counts, re-queried live after all work: **TOTAL 298, Practice Eligible 281, Mathematics PE 161, Mock Eligible 0** — byte-identical to §1. No drift.

---

## 28. Risks and recommendation

- The 14-question batch is smaller than the directive's expected range — disclosed as a deliberate governability choice (§4), not a shortfall against volume.
- `precision-dec`'s 4-of-7 shared-template subset (§12) is a disclosed, real, minor limitation worth a future diversification pass.
- The MR-01 teaching-content gap (§7) and the 18-row legacy pool's remaining candidate reclassifications (§9) are both real, confirmed gaps, deliberately not attempted this increment to keep 007X's own scope honest and governable.
- **Recommendation:** apply migrations 066 and 067 (Founder decision), route the 4 families through the existing Founder review interface, and treat "MR-01 Teaching Completion" and "Legacy Row Reconciliation" as the two most evidence-backed candidate next increments — both named, not started.

---

## 29. Post-Migration Reconciliation (addendum)

Migrations 066 and 067 were applied by the Founder. This section records independent post-application verification, the Migration 067 incident, and one new confirmed finding — all as a bounded reconciliation, no further content or activation work performed.

### 29.1 Migration 067 incident — accurately recorded

The Founder's own investigation (schema, RLS, enum, permission function, and a controlled `BEGIN`/`ROLLBACK` INSERT all independently verified healthy; the SQL Editor's "creates a table without enabling RLS" warning firing on SQL that creates no table) is accepted as conclusive: **this was a Supabase SQL Editor parsing/safety-analysis behaviour on the original file's prose-heavy comments and `values()`-table construct, not a database-schema defect.** It is not classified as an `ali_family_review` defect. The minimal, comment-free, four-statement `INSERT...SELECT...WHERE NOT EXISTS` form that was actually run is semantically equivalent to (and, in one respect, stricter than) the original draft — it explicitly sets and checks `review_type = 'content_review'` on every row, rather than relying on the column's own default. The migration file and `tests/content/007xPendingReview.test.ts` were both updated to reflect the actual applied SQL, with the incident recorded in the file's own header comment for the audit trail.

### 29.2 Part A — Migration 066 independent verification: exact match, zero discrepancy

Re-queried live, not inferred: **all 14 expected question IDs present**, each with the correct `family_id`, `provisional`/`angel_original`/`active: true`/`content_version: 1`, and the exact designed difficulty split (easy 3 / medium 5 / hard 6). `mth-003` carries `family_id = 'mr03-mixed-perimeter'` with every other field byte-identical to its pre-migration state. Mathematics row totals reconcile exactly: 180 total (166 + 14), 17 null-family rows (18 − 1, confirming no *other* legacy row was touched), and each target family's sibling count matches the design exactly (mr03-mixed-perimeter 7, mr05-number-property-search 7, precision-frac 6, precision-dec 6).

### 29.3 Part B — Migration 067 verification: RLS-opaque, authenticated query required

`ali_family_review` returned `200`/`content-range: */0`/`[]` to the anon key for all 4 target families — the exact RLS-opaque signature this project's own standing principle (Decision 48) requires is never read as "no rows exist." **Not inferred as absence.** The exact authenticated query needed was provided directly to the Founder in-session:

```sql
select
  id, family_id, review_target_type, review_type, decision, reviewer, created_at,
  left(notes, 80) as notes_preview
from public.ali_family_review
where family_id in ('mr05-number-property-search', 'mr03-mixed-perimeter', 'precision-frac', 'precision-dec')
order by family_id, created_at;
```

This single query resolves both Part B (do the 4 new placeholders exist, with correct reviewer/decision/review_type/review_target_type) and the live severity of §29.4 below (does any of these families carry a prior row that would interact with the new one). **Result pending** — not yet run at the time of this reconciliation.

### 29.4 Part C — a real, confirmed code-level review-surface risk (severity pending §29.3)

Direct reading of `app/admin-beta/review/page.tsx` (not speculation) found a genuine architectural risk for exactly this batch's situation:

- **`precision-frac` and `precision-dec` appear in NO hardcoded section list** (`PILOT_TARGET_IDS`/`BATCH2_TARGET_IDS`/`BATCH3_TARGET_IDS`/`BATCH4_TARGET_IDS`/`SEVEN_T_TARGET_IDS`), so their new pending targets fall through to `FullBacklogSection`, whose filter is `!reviewedIds.has(t.id)` — `reviewedIds` comes from `fetchReviewedTargetIds()`, which flags a family as "reviewed" if it has **any** non-pending `content_review` decision at all, regardless of which specific questions that decision covered. **If either family already carries an approved `content_review` row from an earlier batch, the new 007X pending placeholder would be silently excluded from every section on the page — invisible, not shown anywhere.**
- **`mr03-mixed-perimeter` IS in `BATCH4_TARGET_IDS`** (Controlled Review Batch 4 reviewed its original 3 siblings). `Batch4Section` renders via `targets.find(t => t.id === id)` — since `ali_family_review` is append-only and old pending placeholders are never deleted even after being superseded by a real decision, if this family has more than one row with `decision = 'pending_independent_review'` (an old, already-resolved one plus the new 007X one), `.find()` returns whichever comes first in an order the code does not control for this purpose — the card shown could display the wrong (stale) `notes` text, not clearly identifying it as the new 007X siblings needing review.
- **`mr05-number-property-search`** also appears in no hardcoded list, same `FullBacklogSection` exposure as above; its live risk is lower since it was deliberately excluded from every prior review batch (TRANSFER-UNSAFE), but this is not fully confirmed without §29.3's query.

At the *data* level, this batch already does the right thing — every new row's `notes` is uniquely prefixed `"007X new content review: ..."`, structurally distinct from any historical batch's notes text (§29.1). The risk is entirely in the **UI's exclusion/selection logic**, not in the data. This mirrors, and is a variant of, the exact class of defect this codebase already fixed once before for 007T's own new families (the original "missing 007T Content Review section" reconciliation) — the established fix pattern (a dedicated section, bypassing `reviewedIds`/`.find()`-first-match entirely, as `SevenTSection` already does) would resolve it here too, but **was not implemented this reconciliation** — verification only was authorised. Recommended as a named, bounded follow-on fix, not attempted here.

### 29.5 Part D — educational disclosure preserved

Confirmed unchanged since §8/§21: `mr05-number-property-search` remains TRANSFER-UNSAFE, not reclassified; the new siblings do not automatically upgrade the family's teaching maturity (§7 MR-01 gap and this family's ASSESSMENT ONLY status both unchanged); MR-01 teaching remains a separate, outstanding, named programme issue; no activation was performed or authorised this reconciliation.

### 29.6 Part E — regression

Full suite **492/492** (491 + 1 new: the reconciled `007xPendingReview.test.ts` gained one additional assertion during the fix). TypeScript clean. Copy Quality Guard PASS (0 violations, 237 files). Production build succeeds. Mathematics correctness for all 14 questions re-confirmed via §29.2's exact-ID/field reconciliation (independent of the generator's own `verify()`, which also still passes). Mock firewall, mastery-protection, and 007W determinism suites all re-ran unchanged as part of the full 492, passing.

**Production counts after migrations 066/067: TOTAL 312 (298 + 14), Practice Eligible 281 (unchanged), Mathematics PE 161 (unchanged), Provisional 31 (17 + 14), Mock Eligible 0 (unchanged).** No eligibility change occurred.

**Verdict: PASS WITH FINDINGS.** The one finding (§29.4) is real, disclosed, and does not affect data integrity, eligibility, or Mock/Writing/English boundaries — it affects only whether the Founder's own review UI will surface these targets correctly, which is precisely what still needs the §29.3 query to resolve with certainty.

---

## 30. Founder Review-Surface Correction

The Founder's own authenticated §29.3 query confirmed §29.4's risk precisely: all four target families carry historical review state (`mr03-mixed-perimeter`: historical pending + historical approved content review + approved Mathematics Teaching Review; `precision-frac`/`precision-dec`: approved Mathematics Teaching Review; `mr05-number-property-search`: none) coexisting with new 007X pending records, **and each family carries two duplicate 007X pending placeholders** (a detailed one created around 17:29 UTC, a short one around 17:49 UTC).

### 30.1 Duplicate-placeholder root cause (traced with direct evidence, not speculation)

`git show 0e926d3:supabase/migrations/067_007x_pending_review_records.sql` — the originally committed migration 067 (this increment's own first draft, before the §29.1 SQL Editor incident and reconciliation) — contains, verbatim, the exact prose the Founder's "detailed" 17:29 record carries (`"Educational Increment 007X, Part 8. 5 new provisional questions (mr05-search-03..07) added to this pre-existing, Phase-B-deferred TRANSFER-UNSAFE family..."`). This is direct, conclusive evidence that a variant of that original `values()`-table INSERT (likely with its problematic header comment reduced or stripped to work around the SQL Editor parsing issue, while its body and full prose notes were kept intact) executed successfully first, at 17:29. The short 17:49 records match, verbatim, the later, fully reconciled, comment-free four-statement form now committed at `934e7f6` (§29.1) — the version the Founder described as the "minimal executable-only version" that finally produced "Success. No rows returned." Both are genuine, valid attempts at the same underlying migration; neither is corrupted or wrong on its own, but together they left two rows per family. **Not deleted or mutated** — append-only history preserved exactly as instructed.

**Forward-looking prevention (no code change required, since the new derivation is already duplicate-safe — see §30.4):** future review-placeholder migrations should be drafted in the comment-free, explicit `INSERT...SELECT...WHERE NOT EXISTS` style from the outset (the form this incident converged on), rather than the prose-heavy `values()`-table style that triggered the SQL Editor's parsing/safety-analysis behaviour in the first place — reducing the chance a retry-under-parser-pressure produces a second, textually-different (and therefore not idempotency-guard-catchable) row for the same target.

### 30.2 Review-status derivation, before and after

**Before:** `fetchReviewedTargetIds()` (family-level: any non-pending `content_review` row for a `family_id`, regardless of which questions it covered) combined with `FullBacklogSection`'s `!reviewedIds.has(t.id)` exclusion and `Batch4Section`'s `.find()`-first-match — see §29.4. Confirmed live: `precision-frac`/`precision-dec` (approved Mathematics Teaching Review exists, but that is `review_type = 'maths_teaching_review'`, not `content_review`, so `fetchReviewedTargetIds()` itself would NOT have falsely excluded them; the real risk there was a possible content_review approval, which the Founder's evidence shows does not exist for these two, so §29.4's worst case for these two did not materialise, though the architectural gap was still real and is still fixed below). `mr03-mixed-perimeter` DOES have a historical approved `content_review` row, confirming §29.4's `Batch4Section` `.find()`-ambiguity risk was live and real for this family.

**After:** a new, dedicated, batch-marker-scoped derivation (`deriveSevenXReviewStatus()`/`fetchSevenXReviewStatus()`, `lib/adminReview.ts`) that only counts a `content_review` decision as "007X reviewed" if its `notes` contain the stable `SEVEN_X_BATCH_MARKER` (`"007X"`) substring, present in every 007X-related row regardless of which of the two duplicate forms produced it (§30.1), absent from every historical Batch 2-4/Phase B row (which predate 007X and cannot mention it). A `maths_teaching_review` row can never satisfy this at all, since the query itself is scoped to `review_type = 'content_review'`.

### 30.3 Exact 14-question review scope (Part 2)

`SEVEN_X_FAMILIES` (`lib/adminReview.ts`, moved there from the page component for direct testability): `mr05-number-property-search` (5: `mr05-search-03..07`), `mr03-mixed-perimeter` (3: `mr03-mix-04..06`, plus `mth-003` shown separately as reclassified-not-new), `precision-frac` (3: `precision-frac-04..06`), `precision-dec` (3: `precision-dec-04..06`). Exactly 14 new questions, verified directly (`tests/lib/adminReview.sevenX.test.ts`).

### 30.4 UI correction (Part 2/3/4)

A dedicated **"007X Mathematics Content Review"** section (`SevenXSection`, `app/admin-beta/review/page.tsx`) was added, positioned alongside (not replacing) the existing `SevenTSection`/batch sections, and `SEVEN_X_TARGET_IDS` was added to `FullBacklogSection`'s own exclusion list so these 4 families are never ALSO shown in the generic backlog. Each family card shows the new-question count, reclassified-row count where applicable, and a reviewed/not-reviewed badge driven exclusively by `fetchSevenXReviewStatus()`, never `reviewedIds`. Opening a card renders `ReviewForm` with a new optional `sevenX` prop that: (a) fetches exactly the family's new question IDs via a new `fetchQuestionsByIds()` function (never the family-wide `fetchRepresentativeQuestions()`), (b) separately fetches and displays any reclassified-but-unchanged row (`mth-003`) under its own "Reclassified, not new" heading, (c) renders a fixed amber disclosure banner stating "Reviewing newly authored content only" plus the family-specific text explaining exactly which prior approval exists and that it does not cover this batch, (d) for `mr05-number-property-search` specifically, states the family remains TRANSFER-UNSAFE and that these siblings do not on their own make it mature teaching content, and (e) on submission, prefixes the review's own `notes` with `buildSevenXNotesPrefix()` (the same batch marker plus the exact question IDs decided upon) before calling the existing, unmodified `submitReview()`, so the resulting decision row is itself correctly recognisable by the same derivation, not just the pending placeholder it resolves.

### 30.5 Schema changes

**None.** Part 4's own escape hatch ("if the schema genuinely cannot represent this, stop and report the smallest extension needed") was not needed: the existing `notes` free-text field, already present and already used this way for `mth-003`'s own disclosure precedent, was sufficient once a stable, always-present marker substring was adopted as the scoping key. No new column, no new `review_type` value, no new table.

### 30.6 Tests added (Part 8, all 10 items covered)

`tests/lib/adminReview.sevenX.test.ts` (13 tests): historical content approval does not satisfy 007X review; `maths_teaching_review` does not satisfy it; duplicate pending placeholders collapse to one status, not duplicate cards; `buildSevenXNotesPrefix` correctness; `mr03-mixed-perimeter`/`precision-frac`/`precision-dec`/`mr05-number-property-search` each independently proven reviewable despite their respective historical state; a genuine post-submission 007X approval IS correctly recognised; exactly the 14 real question IDs (matching migration 066) appear in scope, no more no less; `SEVEN_X_TARGET_IDS` covers exactly the 4 families; `mth-003` is disclosed as reclassified-not-new under `mr03-mixed-perimeter` only, never counted as a new question; the review-scope config contains no activation/Mock-eligibility mechanism.

### 30.7 Regression, deployment, and readiness

Full suite **505/505** (492 + 13). TypeScript clean. Copy Quality Guard PASS (0 violations, 237 files — 2 em-dash violations were found and fixed in the new disclosure copy during this same pass, since `app/admin-beta/review/page.tsx` and `lib/adminReview.ts` are both within the guard's scan scope). Production build succeeds. **Production counts, re-queried live after all this work: TOTAL 312, Practice Eligible 281, Mathematics PE 161, Writing PE 0, Provisional 31, Mock Eligible 0, unchanged from §29.6, since this correction made zero database writes.** No historical `ali_family_review` row was modified or deleted. `mth-003` remains exactly as verified in §29.2.

**The 007X Founder review is genuinely ready to perform** once this correction deploys: `/admin-beta/review` → "007X Mathematics Content Review" section.

---

## 31. Founder Review Reconciliation and Controlled Activation (addendum)

### 31.1 Reconciliation result

All 4 targets decided `approved` via authenticated `ali_family_review` evidence: `mr05-number-property-search` (5 IDs), `mr03-mixed-perimeter` (3 IDs), `precision-frac` (3 IDs), `precision-dec` (3 IDs) — 14 total. **Approved = 4, approved-with-amendment = 0, requires-revalidation = 0, rejected = 0.** Required outcome for activation met.

### 31.2 Duplicate review-row finding

The authenticated evidence contained three "new 007X Founder decision" rows for `mr05-number-property-search`, identical in scope and question IDs. Treated as one Founder decision recorded three times in append-only history, not three independent reviews. No row deleted, updated, or rewritten.

### 31.3 Pre-activation verification

14/14 IDs fetched live, all `provisional`/`angel_original`/`active`/`content_version 1`, correct families, no duplicates. Production content compared byte-for-byte against the authoring generator's manifest: zero drift since insertion. Generator's own independent `verify()` re-confirmed 0/14 problems. `mth-003` confirmed excluded structurally (never appears in the 14-ID manifest; the activation generator's own runtime guard would refuse to write a file if it ever did).

### 31.4 Activation migration

`supabase/migrations/068_007x_activation.sql`, generated by `scripts/generate-007x-activation-migration.mjs` (mirrors the 007T generator exactly, reuses `checkActivationEligibility()` unchanged, selects by exact ID never `family_id`). Single guarded `UPDATE` promoting exactly the 14 IDs from `provisional` to `practice_eligible`; idempotent; touches no other table or column. **NOT applied.**

### 31.5 Projected counts, independently recalculated

TOTAL 312 (unchanged) / PE 295 (281+14) / Maths PE 175 (161+14) / Provisional 17 (31−14) / Mock Eligible 0 (unchanged) — matches the Founder's own stated projection exactly.

### 31.6 Verification

Full suite **514/514** (505 + 9 new). TypeScript clean. Copy Quality Guard PASS (0 violations, 237 files). Production build succeeds. Mock firewall, mastery-protection, and 007W determinism suites unchanged, passing. Production counts unchanged (nothing applied yet).

**mr05-number-property-search's TRANSFER-UNSAFE classification and teaching-maturity status are unchanged** — explicitly disclosed in the migration's own header comment. Approval of the 5 new questions does not itself revalidate transfer safety.

**Verdict: PASS.** Migration 068 is READY FOR FOUNDER APPLICATION.

---

**STOP. This report concludes 007X's review/activation-preparation stage. Migration 068 has been committed and pushed, NOT applied. Awaiting Founder manual application, post-migration verification, and final closure. No further increment begun automatically.**
