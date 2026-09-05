# ANGEL 11+ — Question Depth and Repetition Audit

**Status:** Extracted and cross-checked from `ANGEL_EDUCATIONAL_CAPACITY_AUDIT.md` (primary source — Sections 5, 6, 7, 24.1, §26), plus new corroborating evidence gathered this pass. Purpose: answer, with evidence, "does Angel have genuinely different educational problems, or database rows generated from a handful of patterns with names/numbers changed" — the Founder's own framing.

---

## 1. The core distinction: database row vs. genuine educational family

**Database rows (all statuses): 558 (correction: 301 Mathematics, not 293 — see `ANGEL_EDUCATIONAL_CONTENT_INVENTORY.md` §1 for the Increment 020 reconciliation). Genuine question families: 74 (Mathematics only) + not-tracked (English) + not-tracked (Writing).** A "row" and a "genuinely different educational problem" are not the same thing — two rows in the same family typically differ only in surface numbers/names, not in the underlying conceptual demand. This audit treats family count, not row count, as the primary depth signal, per the Founder's own explicit instruction.

## 2. Mathematics family depth (authoritative — Capacity Audit §24.1, §26)

- **74 distinct `family_id` values** across 301 active rows (293 pre-Increment-020 + the 8-row `mr03-compound-area-perimeter` family added 2026-09-04).
- **Family-size distribution** (the load-bearing evidence for the repetition question): **2 families have exactly 1 row; 51 families have 2–4 rows; 18 families have 5–9 rows; 2 families have 10+ rows.** 51/74 (≈69%) of all Mathematics families sit in the thinnest band — 2 to 4 surface variants of the same underlying problem.
- **No procedural/template generation exists anywhere in the codebase** — every row in every family is individually hand-authored (confirmed directly in `ALI_DECISION_LOG.md`, cited by the Capacity Audit). "Changing names or numbers" is, today, literally the entire variant-production mechanism for Mathematics.
- Cross-check performed this pass: a live anon-key query against the 202 Mathematics **practice-eligible** rows only (a subset of the 301 total, since 77 more sit in the mock-eligible/reserve pool) returned a *combined* (all-subjects) family tally of 62 distinct `family_id` keys across the full 351-row practice pool, average size 5.66, 8 singleton families. This is **not directly comparable** to the audit's 74-family Mathematics-only, all-status figure — different denominators (practice-eligible-only vs. all-status; all-subjects-combined vs. Mathematics-only) — and is recorded here only as a corroborating signal that family sizes remain small and single-digit-dominated, not as a replacement figure. **The audit's 74-family, all-status, Mathematics-only figure is authoritative.**

## 3. English Reading — first real family measurement (Question Factory Wave 1, Phase 6, 2026-09-05)

**Superseded finding, kept for history**: this section previously read "no family concept exists... unmeasurable, not measured-and-safe," on the correct basis that `ali_question_bank`'s `family_id` column is never populated for English rows (Capacity Audit §4, §5). That schema gap is still real and unchanged. What has changed is that `lib/ali/englishFamilyModel.ts` — a dormant, previously-never-executed module — has now actually been run against the real, live, 142 practice-eligible English rows (anon-key read-only query, same methodology as the rest of this document), producing the **first trustworthy, reproducible answer** to "how many genuinely different English question families does Angel have?"

**A real, fixable defect was found and corrected in the process**: `englishFamilyModel.ts`'s own docstring claimed its `skill` input was the real `ali_question_bank.skill` column. Live data proves this column actually holds the `QT-RC-XX` Question Type code (e.g. `QT-RC-04`), never a value like `"vocabulary"` — every one of the module's `SKILL_TO_PATTERN` keys. Feeding the documented-but-wrong column would have silently classified 100% of rows as `"unclassified"`. The real free-text label lives at `prompt->>'skill'`. The docstring is corrected (`lib/ali/englishFamilyModel.ts`); the classification logic itself needed no change beyond this. Two previously-undocumented live skill values were also found: `"retrieval"` (1 row — added to `SKILL_TO_PATTERN` as an unambiguous direct match) and `"judgement"` (1 row — deliberately left unclassified; no defensible mapping exists from the label alone). Tests: `tests/lib/ali/englishFamilyModel.test.ts`, 8/8 passing.

**Result, applying the (corrected) family key — (passage, reasoning-pattern) pair — to all 142 rows**:

| Metric | Value |
|---|---|
| Distinct English families | **94** |
| Rows unclassified (`reasoningPattern === "unclassified"`) | 8 / 142 (5.6%) |
| Family-size distribution | 54 families @ 1 row (57.4%), 40 @ 2-4 rows (42.6%), 0 @ 5-9, 0 @ 10+ |
| Distinct passages (`learning_unit_id`) | 24 |
| Average families per passage | ~3.9 |
| Exact-duplicate stems (mechanical check, `antiMemorisationChecks.findExactDuplicateStems`) | 0 |
| Near-identical stems (numeric-substitution check, `findNearIdenticalStems`) | 0 |

**Reading this honestly**: 94 genuine families from 142 rows is, if anything, a *thinner* average family size (1.51 rows/family) than Mathematics's own 74 families from 301 rows (4.07 rows/family) — 57.4% of English families are singletons, versus only 2/74 (2.7%) for Mathematics. This is a coarser grouping than Mathematics's own `family_id` (a family here is passage-bound — two questions on different passages testing the identical reasoning pattern are, by this model's own explicit design, never the same family, since an English question's stem is inseparable from its passage), so 94 is not directly comparable to 74 as a measure of "which subject has more variety" — but it is now a real, reproducible number rather than an unmeasurable gap. The mechanical duplicate checks finding zero hits is a genuine, if narrow, positive signal (no cosmetic copy-paste duplication detected at the stem level) — it does not and cannot rule out the "changing names/numbers" pattern for question forms that don't have a literal text stem to compare (this check is stem-text-only, per its own documented scope).

**Reproducible methodology**: anon-key query against `ali_question_bank` where `subject='english'` (142 rows, RLS-limited to `practice_eligible`), extracting `prompt->>'skill'` and `prompt->>'validationTier'` per row, applying `englishFamilyKeyOf(learning_unit_id, {skill, validationTier})`, grouping by `englishFamilyKeyToString()`. Full family list and counts available in this pass's own working notes; not reproduced verbatim here to keep this document at a summary level — re-running the query above reproduces it exactly.

### 3a. CORRECTION (Question Factory Wave 1, Phase 1, same day) — `family_id` IS populated for English; the "schema gap" claim above and in the pre-existing Capacity Audit was wrong

While building `scripts/content-governance-report.mjs` (Phase 1 wiring work, same pass), a direct live query found: **129 of the 142 English practice-eligible rows carry a non-null `family_id`, spanning 17 distinct real values** (e.g. `wave1-fam-synonym-battery`, `wave3-fam-rc01-retrieval`, `wave1-fam-quote-explain`) — the exact same column and mechanism Mathematics has always used, not a derived/inferred concept. Only 13/142 rows have no `family_id`.

This directly contradicts the repeated claim, made throughout this document and inherited from `ANGEL_EDUCATIONAL_CAPACITY_AUDIT.md` §4/§5 ("no equivalent concept exists for English at all... a schema gap"), that English has never had a populated `family_id`. That claim was never re-verified this session before being repeated — it is now corrected, per the Founder's own standard that production evidence overrides a prior document's claim.

| Metric | Value |
|---|---|
| Rows with a real, non-null `family_id` | 129 / 142 (90.8%) |
| Distinct `family_id` families | **17** |
| Average rows per family | 7.6 |
| Family-size distribution | 1 family @1 row, 5 @2-4 rows, 5 @5-9 rows, 6 @10+ rows |
| Rows with no `family_id` | 13 / 142 (9.2%) |

**This is a materially deeper, better-populated family structure than the passage+reasoning-pattern derivation above (17 large families, avg 7.6 rows/family) — and deeper, per family, than Mathematics itself (74 families, avg 4.07 rows/family).** The two English measurements are not contradictory, they answer different questions: `family_id` groups by authored content-topic across passages (e.g. every "synonym battery" item regardless of which passage it accompanies); the passage+reasoning-pattern key groups by passage-bound reasoning shape. **`family_id` is the authoritative measure going forward** — it is the same mechanism Mathematics uses, already reviewed/authored intentionally (the `wave1-`/`wave2-`/`wave3-` naming shows deliberate content-wave authorship, not an accident), and is the column the new cross-subject family model (`ANGEL_QUESTION_SUPPLY_ARCHITECTURE.md`, Phase 2 migration) should build on directly rather than inventing a parallel concept. The passage+reasoning-pattern derivation remains useful as a secondary, finer-grained lens, not a replacement.

**Practical consequence for Phase 2 (the family-model migration)**: English does not need a family concept built — it needs the existing, real `family_id` values reconciled against a proper family registry, exactly like Mathematics. The genuinely open English gap is the 13 rows (9.2%) with no `family_id` at all, and the 40 pathway-question-instances-vs-families reconciliation, not "does a family concept exist."

### 3b. Disposition of the 13 unfamilied rows, and English pilot-candidate safety assessment (Question Factory Wave 2, Section 10, 2026-09-05)

**Live inspection of all 13 rows** (read-only anon-key query; `id`, `prompt->>'skill'`, `learning_unit_id`, `question_type`, `content_difficulty`, stem text) resolves cleanly into two distinct, well-explained clusters — neither is a mystery or a data-quality accident:

| Cluster | Rows | Disposition |
|---|---|---|
| `eng-001`/`eng-002`/`eng-003` (three passages, 8 rows) | `eng-001-q1..q4`, `eng-002-q1`, `eng-002-q3`, `eng-003-q1`, `eng-003-q3` | **Plausibly belongs to an existing family, never retroactively tagged.** Naming (`eng-NNN`, not `wave1-/wave2-/wave3-fam-*`) marks these as pre-dating the family-tagging convention entirely. Task-pattern matching against the 17 named families is strong: `eng-001-q2` ("what does the word X tell us... as used in the passage") is the same task shape as `wave1-fam-vocab-explain`; `eng-002-q1`/`eng-001-q1` (character/atmosphere impression from evidence) match `wave1-fam-two-character`/`wave1-fam-emotion-cause`'s pattern; `eng-003-q3` ("find three specific examples") matches `wave1-fam-quote-explain`. **Recommendation, not applied**: a content owner should confirm each row's accepted-answer rubric actually matches its candidate family's own tier convention before retroactively setting `family_id` — this is a data-completeness fix, not a new-family question. |
| `fv-eng-001` (one passage, 5 rows) | `fv-eng-001-q1..q5` | **Should be excluded from ordinary family-based accounting, not malformed.** The `fv-` prefix matches this session's own already-confirmed `csse-founder-validation` pathway tag (distinct from the 340 `csse`-tagged rows) — this is a Founder-validation/pilot batch serving a different governance purpose, not an oversight. Recommend leaving these untagged (or tagging with a distinct, non-family sentinel) rather than folding them into the 17-family count. |

**Net effect on the 17-family figure**: unchanged as the authoritative current count — none of the 13 rows should be added as new families; at most 8 of them are candidates for retroactive assignment into existing families (which would raise those families' row counts, not the family count itself), and 5 are intentionally out of scope. This is a data-completeness recommendation, not a correction to last turn's 17-family figure.

**Pilot-candidate safety assessment** (2-4 families, per the Founder's explicit instruction not to begin uncontrolled English generation this wave — this is evaluation only, no content is generated):

| Family | Rows | Ambiguity risk | Passage/generation risk | Distractor risk | Verdict |
|---|---|---|---|---|---|
| `wave3-fam-rc01-retrieval` | 5 | **Very low** — literal fact retrieval directly stated in text (e.g. "which day did Grandad usually pick Tom up?" → "Thursday"), single defensible answer | **None** — can draw a new literal-fact question from an EXISTING already-approved passage the family hasn't yet asked about, no new passage needed | N/A (short-answer) | **SAFER CANDIDATE** — lowest-risk pattern found across all 17 families |
| `wave1-fam-synonym-battery` | 11 | **Low** — a synonym for a specific word as used in a specific sentence has a narrow, checkable set of correct answers (already authored as an accepted-answer array per row) | **None if scoped correctly** — the safest generation shape found: pick 3 *different* vocabulary words from a passage the family already uses, never a new passage | N/A | **SAFER CANDIDATE** — reuses existing approved passages entirely; generation reduces to "pick an unused word + list its synonyms," a bounded lexical task |
| `wave1-fam-sequencing` | 15 | **Low** — order of stated events is explicit in the text, one correct sequence | **Low** — can draw a different 3-step subsequence from an existing passage, or apply the identical pattern to another already-approved passage | N/A | **SAFER CANDIDATE** |
| `wave1-fam-vocab-explain` | 17 | **Moderate** — "explain what you think the word means as used here" requires the generator to correctly infer contextual meaning and produce a genuinely defensible accepted-answer set (already shows 3-4 phrasing variants per row today, authored by a human) — a generated explanation could plausibly miss a correct paraphrase or accept a wrong one | Low if scoped to existing passages | N/A | **NOT YET SAFE** — the generation step itself would be doing real interpretive work (inferring "meaning as used"), not just parameter substitution; needs a validated approach for authoring the accepted-answer set before this is safe, unlike the three above where the correct answer is either stated outright or a narrow lexical lookup |

**Excluded from this shortlist as clearly NOT YET SAFE, for the record**: any inference/motive/emotion-cause/effect-of-language family (`wave1-fam-motive-inference`, `wave1-fam-emotion-cause`, `wave1-fam-effect-of-language`, `wave3-fam-rc10-*`, `wave1-fam-comparative-extraction`) — every one of these already shows 3-6 distinct accepted-answer phrasings per row today, itself evidence that these tasks have genuine interpretive latitude a human author navigated carefully; and `wave2-fam-multiselect` (TIER6, 8 options/4 correct) — distractor plausibility for a generated option set is a materially harder, unvalidated problem this pass does not attempt to solve.

**Recommendation for a future pilot**: `wave3-fam-rc01-retrieval` is the single lowest-risk starting point if/when English controlled generation is authorised — literal retrieval has no ambiguity, no passage-generation requirement, and no distractor-design problem.

## 4. Writing — single competency, no family tracking

14 Writing rows, all tagged the single competency code `QT-WC-01a` (reflective/discursive, open-response). No family concept applies; genres vary (narrative/descriptive/discursive/opinion) but this is a manually-curated genre spread, not a measured family-diversity metric.

## 5. Item-granularity check — new finding this pass

`question_group_id` (the schema's own subpart-clustering column, which would let several DB rows represent sub-parts of one real "item" rather than independent questions) is **null on all 351 live practice-eligible rows** — unused in the current practice pool. This means the 351/550 row counts are **not inflated by subpart-splitting** in the practice pool specifically; each row is a genuinely standalone item at that layer. (The Mock-eligible pool has at least one documented case of a 28-row/27-display-unit distinction — Reading Comprehension Mock 1, §24.5 of the Capacity Audit — but that pool was not independently re-checked for `question_group_id` usage this pass.)

## 6. Anti-memorisation risk classification (authoritative — Capacity Audit §6, unchanged by this pass's evidence)

| Risk factor | Classification |
|---|---|
| Narrow family pool relative to raw row count (Mathematics) | **HIGH** |
| No family concept at all (English) | **HIGH** (unmeasurable ≠ safe) |
| Remediation reuses the same pool a learner just failed (no separate remediation content exists) | **HIGH** |
| Retention resurfacing draws from the same small family pool | **CRITICAL** for a capable, frequent user over 6–24 months |
| Practice/Mock content firewall | **LOW** — genuinely well-engineered and test-proven (migrations 208/209) |
| Predictable distractor construction / repeated wording at individual-question level | **UNPROVEN** — not exhaustively reviewed across all 558 items, flagged as a real gap, not claimed safe |

**Net verdict, carried forward unchanged: HIGH, rising to CRITICAL for the Founder's own named "capable, frequent user" persona** — driven structurally by family-pool thinness and the total absence of any generation/variation mechanism, not by any flaw in the retention engine itself (which is a genuine, separately-evidenced strength, §12).

## 7. Reproducible methodology (for anyone re-running this audit later)

1. Live count/breakdown: `createClient(url, anonKey).from("ali_question_bank").select(...)`, paginated at 1000 rows/page, tallied by `family_id`. Anon key only sees `eligibility_status='practice_eligible'` rows (RLS positive allow-list) — a full-status family audit requires an authenticated/admin channel, exactly as Capacity Audit §24 already did.
2. Historical/authored-count cross-check: `grep -rli "insert into public.ali_question_bank" supabase/migrations` (49 files touch this table over the project's history — not reconciled row-by-row this pass).
3. Family-size distribution for a full-status view (not just practice-eligible): the exact Founder-run query already used successfully in Increment 018 is the template — group by `family_id`, bucket by count, per subject.

## 8. Sustained Practice Capacity Test (Founder's exact scenarios) — added this pass

The Founder asked specifically: can a child practise 20/day×5days, 30/day×5days, or 30/day×7days for 4, 12, or 26 weeks "without unhealthy structural repetition"? This reuses the existing Capacity Audit's own methodology (§7, Weekly Interaction Volume = days/week × rate/day) against the real, current Mathematics figures (202 practice-eligible rows, 74 families) — English has no equivalent family denominator (Section 3 above), so its numbers below are row-count only, a materially weaker (more optimistic) proxy.

| Scenario | Weekly volume | Raw-pool exhaustion (202 Maths rows) | Family-fresh exhaustion (74 families, ~3.6 rows/family average) |
|---|---|---|---|
| 20/day × 5 days | 100/week | **≈2.0 weeks** | **≈4-5 days** (each family's few siblings seen almost immediately) |
| 30/day × 5 days | 150/week | **≈1.3 weeks** | **≈3 days** |
| 30/day × 7 days | 210/week | **≈0.96 weeks (under 7 days)** | **≈2 days** |

**Answer to the Founder's question, stated plainly: no, not at any of the three intensities, for any of the three durations (4/12/26 weeks).** Every scenario exhausts first-time-fresh Mathematics content in under a week by raw row count, and within days by genuine family-diversity count. This is arithmetically identical in character to the existing Capacity Audit's own §7 finding for its own (different) intensity grid — the new scenarios the Founder asked for do not change the conclusion, they confirm it holds across this specific set of realistic usage patterns too. English (142 rows, no family concept) exhausts on a similar or shorter raw-row timeline and cannot be assessed for family-level safety at all (Section 3).

**Distinguishing intentional spaced retrieval from accidental repetition, per the Founder's own instruction**: once the fresh pool is exhausted (days, not weeks, at these intensities), the learner does not simply see the same questions immediately again — the live, wired `lib/ali/selection.ts` cooldown mechanism (5/10/15/20 intervening questions by difficulty tier, mastered content on a 3x-longer secondary cooldown) legitimately spaces out reuse. This is genuine, working spaced retrieval, not a defect, and is exactly the mechanism the existing audit credits as this codebase's one clear architectural strength (§12). **The unhealthy repetition risk is not "the same question appears back-to-back"** (that is already prevented) **— it is that, within any given week after the first, the total number of distinct underlying educational problems a child at these intensities encounters is bounded by ~74 Mathematics families, not 202 rows**, so a perceptive or frequent learner will recognise recurring problem structures well within a 4-week window, let alone 12 or 26. This is the same structural finding as Section 6's anti-memorisation classification (HIGH, rising to CRITICAL for a frequent/capable user), now expressed against the Founder's own specific named usage scenarios rather than the audit's original, broader intensity grid.

## 9. What this document does NOT establish

It does not attempt a semantic/conceptual-similarity check between rows in the same family (e.g. "is `mr01-whole-number-computation`'s 13th row conceptually novel or a renamed 3rd row") — no tooling for this exists in the codebase (`lib/ali/structuralSignature.ts` is explicitly non-semantic/structural-only per the Capacity Audit §16). This is the single largest evidence gap in the entire repetition question and should be the first target of any Question Factory duplicate-detection work (see `ANGEL_QUESTION_FACTORY_SPECIFICATION.md`).

---

## Summary table

| Metric | Value | Source |
|---|---|---|
| Mathematics distinct families | 74 | Capacity Audit §24.1/§26 |
| Mathematics families with ≤4 rows | 53 / 74 (≈72%, incl. 2 singletons) | Capacity Audit §24.1 |
| English distinct families — `family_id` (authoritative, corrected this pass) | **17** (129/142 rows tagged, avg 7.6 rows/family) | Corrected this pass (§3a) — the Capacity Audit's "no family_id for English" claim was never re-verified and was wrong |
| English distinct families — passage+reasoning-pattern (secondary lens) | 94 (from 142 rows; 54 singletons, 40 @ 2-4 rows) | New, this pass (§3), `englishFamilyModel.ts` wired for the first time |
| Writing family concept | Does not exist | Capacity Audit §4 |
| Subpart-clustering in use (practice pool) | No (`question_group_id` null on all 351) | New, this pass |
| Procedural/template generation mechanism | None exists | Capacity Audit §5 (`ALI_DECISION_LOG.md`) |
| Sustained practice at 20-30/day, 5-7 days/week, for 4-26 weeks, without unhealthy repetition | **Not achievable today** — raw-pool exhaustion under 1-2 weeks, family-fresh exhaustion in 2-5 days, at every tested intensity | New, this pass (§8) |
| Anti-memorisation net verdict | HIGH, CRITICAL for frequent users | Capacity Audit §6, unchanged |
| Semantic duplicate-detection tooling | None exists (structural-only signature) | Capacity Audit §16 |
