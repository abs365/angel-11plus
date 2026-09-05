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

## 3. English Reading — no family concept exists

**This is a schema gap, not a "not yet measured" gap** (Capacity Audit §4, §5, explicit): `ali_question_bank`'s `family_id` column is populated for Mathematics rows but there is no equivalent conceptual-grouping mechanism ever built or used for English Reading content. 142 practice-eligible English questions exist with **zero declared family structure** — it is not possible today to say how many of those 142 are surface-variants of the same underlying comprehension skill versus genuinely distinct. Recorded as **unmeasurable, not measured-and-safe** — the Founder's own instruction not to infer safety from absence of a bad measurement applies directly here.

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
| English family concept | Does not exist | Capacity Audit §4/§5 |
| Writing family concept | Does not exist | Capacity Audit §4 |
| Subpart-clustering in use (practice pool) | No (`question_group_id` null on all 351) | New, this pass |
| Procedural/template generation mechanism | None exists | Capacity Audit §5 (`ALI_DECISION_LOG.md`) |
| Sustained practice at 20-30/day, 5-7 days/week, for 4-26 weeks, without unhealthy repetition | **Not achievable today** — raw-pool exhaustion under 1-2 weeks, family-fresh exhaustion in 2-5 days, at every tested intensity | New, this pass (§8) |
| Anti-memorisation net verdict | HIGH, CRITICAL for frequent users | Capacity Audit §6, unchanged |
| Semantic duplicate-detection tooling | None exists (structural-only signature) | Capacity Audit §16 |
