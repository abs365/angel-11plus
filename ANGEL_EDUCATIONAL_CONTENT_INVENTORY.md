# ANGEL 11+ — Educational Content Inventory

**Status:** Evidence-only inventory. **Primary source of truth is `ANGEL_EDUCATIONAL_CAPACITY_AUDIT.md`** (Programme Increments 017/018/020, most recently updated 2026-09-04, Section 24 = Founder-executed authoritative production reconciliation across every `eligibility_status`, not just the practice-eligible slice). This document restructures that audit's already-reconciled figures into the file the Founder's newly-issued brief names, and adds a small number of genuinely new findings this pass surfaced that the existing audit does not cover. It does **not** re-derive numbers the existing audit already settled, and does not contradict any of them.

**Independent corroboration performed this pass:** a fresh, read-only, anon-key live query against `ali_question_bank` (same privilege level as any real visitor's browser — no service-role key, no learner data) returned **351 rows**, 100% `eligibility_status = 'practice_eligible'`, split `subject`: maths 202 / english 142 / writing 7. This is an **exact match** to the existing audit's own practice-eligible figures (§24.1/24.2/24.3: 202/142/7). The audit's authoritative totals and today's live state agree — nothing has drifted since 2026-09-04, and Increment 025 (today, Reading Mock scoring/release for one attempt) touched no content-table rows.

---

## 1. TOTAL ACTIVE USABLE QUESTIONS

| Status | Mathematics | English Reading | Writing | Total |
|---|---|---|---|---|
| **Total active rows (all eligibility statuses)** | 301 | 243 | 14 | **558** |
| **Practice-eligible (learner-reachable in ordinary Practice)** | 202 | 142 | 7 | **351** |
| **Mock-eligible** | 77 | 50 | 0 (no assembled Writing Mock exists) | **127** |

Source: `ANGEL_EDUCATIONAL_CAPACITY_AUDIT.md` §24.1–24.3 (Founder-executed production queries, Increment 018), re-confirmed live today for the practice-eligible layer (see corroboration note above). **Correction applied to this fork's own original draft**: the Mathematics total-active-rows figure is **301, not 293** — §26 of the capacity audit records the Increment 020 addition of the 8-row `mr03-compound-area-perimeter` family (2026-09-04), and the 202 practice-eligible figure already reflects that addition (194→202, +8); the 293 figure is the pre-Increment-020 count and must not be paired with the post-Increment-020 202. **558 is the correct "total active usable questions" figure — not 550, and not 351.** 351 is the correct figure for "questions an ordinary Practice session can draw from today."

## 2. ENGLISH / MATHEMATICS SPLIT

Mathematics 301 (53.9%), English Reading 243 (43.5%), Writing 14 (2.5%) of 558 total. Writing is tracked as a **third, distinct `subject` value** in the live schema, not a sub-category of English — any "English vs Maths" framing should decide explicitly whether Writing counts as English (one number) or stands alone (three numbers), and state which.

## 3. PATHWAY / CSSE COVERAGE — new finding this pass

Live query (anon key, `pathway` jsonb array column, 351 practice-eligible rows): **340 rows tagged `["csse"]`, 11 tagged `["csse-founder-validation"]`.** Every single one of the 351 practice-eligible rows carries a CSSE-family pathway tag — **100% CSSE coverage, 0% any other pathway** (GL, ISEB, Common Pre-Test, Bespoke). `csse-founder-validation` is a review/staging tag (co-occurs with recent Founder-validation migrations, e.g. Increment 020's Decision pattern), not a second genuine pathway offering.

**This is a genuine content/marketing mismatch, not previously flagged in the existing audit**: `lib/pathways.ts` presents six pathway options to parents (GL, CSSE, ISEB Common Pre-Test, Bespoke, Core 11+ Foundation, and one more) as apparent live choices, each with a `recommendedYears` descriptive string — but only CSSE has any content behind it. `lib/pathways.ts` is descriptive/marketing metadata only; it is not wired to `lib/ali/pathwayEligibility.ts` or any question-selection logic (confirmed by direct grep — no shared identifiers between the two files' pathway lists). **CSSE COVERAGE = 100% of live content; every other advertised pathway = 0%.**

## 4. YEAR 4 / 5 / 6

**No functional year-targeting mechanism exists** — confirmed independently by this pass (no `year`/`year_group` column in `ali_question_bank`'s live 30-column schema; zero matches for "year" in `lib/ali/assessmentHierarchy.ts`) and matches the existing audit's own, more thorough finding (§8, §21, §24.8): a real Preparation Horizon clock (`preparationClock.ts`/`preparationStage.ts`) computes a genuine stage from year/time-remaining/evidence, but its own code comment states it is *"deliberately kept to messaging/emphasis only... not wired into which questions get selected"* — confirmed at both real call sites. A Year 4 and a Year 6 learner with identical history receive an identical Practice set. See `ANGEL_YEAR_4_5_6_COVERAGE_MATRIX.md` for the full matrix.

## 5. QUESTION FAMILIES (headline; full detail in the Repetition Audit doc)

Mathematics: **74 distinct families** across 301 rows (post-Increment-020; was 73/293 before the MR-03 compound-shape addition), family-size distribution 2 families @1 row, 51 @2–4, 18 @5–9, 2 @10+ (§24.1). English Reading: **CORRECTION (Question Factory Wave 1, Phase 1)** — the Capacity Audit's own §4/§5 claim that "no formal family concept exists... a genuine schema gap" was never re-verified live and was wrong: `family_id` is in fact populated on 129/142 (90.8%) practice-eligible English rows, spanning **17 real families** (avg 7.6 rows/family, deeper on average than Mathematics's 4.07) — see `ANGEL_QUESTION_DEPTH_AND_REPETITION_AUDIT.md` §3a for full detail and reconciliation against a second, passage-bound measurement (94 families). Writing: **CORRECTION (post-migration-228 production evidence)** — previously reported as "not tracked by family at all"; production now shows 16 real `ali_question_family` records for `subject='writing'` (7 production-eligible) — see `ANGEL_QUESTION_DEPTH_AND_REPETITION_AUDIT.md` §10 for the full reconciliation, including that the prior "14 total Writing rows" figure may itself be stale given 16 distinct families cannot be backed by fewer than 16 rows.

## 6. PASSAGES (English Reading)

30 distinct passages defined and active (§24.2). Passage-level `eligibility_status` **lags behind question-level eligibility**: only 1/30 passages is `practice_eligible` and 5/30 are `mock_eligible` despite 142 questions being practice-eligible — the audit flags this as a real, previously-undetected binding constraint on reachable Reading content (§24.2, "New finding"), not yet resolved.

## 7. PROVENANCE — new finding this pass

Live query, 351 practice-eligible rows: `provenance = 'angel_original'` on 311 (88.6%), `null` (unset) on 40 (11.4%). No row is tagged as past-paper-derived, licensed, or AI-generated. Not further investigated this pass (out of scope) — flagged for the Content Supply / provenance-governance phase.

## 8. QUESTION-ITEM GRANULARITY — new finding this pass

`question_group_id` is **null on all 351 practice-eligible rows** — the subpart-grouping mechanism the schema supports (`question_group_id`, `group_order`, `subpart_label`) exists structurally but is **entirely unused** in the current practice pool. Every practice-eligible row is a genuinely standalone item; raw row count is not inflated by subpart-clustering in this pool (it may be different in the Mock-eligible pool, e.g. Reading Mock 1's own 28-rows/27-experiences distinction, §24.5 — not independently re-checked here).

## 9. USAGE / PERFORMANCE TELEMETRY

Live query: `usage_count = 0` and `avg_success_rate = null` on **all 351** practice-eligible rows. Either no practice attempts have been served from this pool since these columns were introduced, or the write path that increments them is not firing. Not previously flagged in the existing audit as a live-confirmed 100% figure (the audit names the columns as "exist but unread," §16 Performance Calibration = MISSING, consistent with this finding — this pass adds the confirmation that consumption itself, not just calibration, appears to be zero). Flagged for the Content Supply phase, since live performance calibration (Founder's Phase 4, item 10) depends on this telemetry working.

## 10. MOCKS

Exactly 2 live, active Mock forms: **Mathematics Mock 1** (`first-mock-mathematics-v1`, 56 manifest rows, 56 marks) and **Reading Comprehension Mock 1** (`reading-comprehension-mock-1`, 28 manifest rows/27 display units, 65 marks) — §24.4/§24.5, exact production-query figures, superseding this pass's own migration-text reading of migration 147 (which described a since-superseded 21-question/56-mark composition — the audit's live-queried 56-row/56-mark figure is authoritative; migration text alone is not reliable evidence of current composition, consistent with the wider "NOT APPLIED header ≠ not live" lesson the audit already learned twice, §4 "single most consequential finding," §24.2). No Writing Mock, no Verbal/Non-Verbal Reasoning Mock, no second sitting of either subject. Full detail in `ANGEL_MOCK_DEPTH_AND_SECURITY_AUDIT.md`.

## 11. Remaining unknowns

The existing audit (§23) already named and closed most of the original unknowns via Founder-executed queries (§24). Genuinely still open, per the audit's own honest accounting: individual-question-level content review for predictable distractors/repeated wording (553-row corpus, not exhaustively reviewed); English family-diversity quantification (no concept exists to quantify); whether the zero-usage-telemetry finding (§9 above) reflects a real production defect or simply a fresh reset — not investigated this pass.

---

## Summary table

| Metric | Value | Source |
|---|---|---|
| Total active questions (all statuses) | 558 (301 Maths / 243 English / 14 Writing) | Capacity Audit §24.1–24.3, §26 |
| Practice-eligible (learner-reachable) | 351 (202/142/7) | Capacity Audit §24, re-confirmed live this pass |
| Mock-eligible | 127 (77/50/0) | Capacity Audit §24.1–24.3 |
| Distinct Mathematics families | 74 | Capacity Audit §24.1/§26 |
| English family concept | **Exists: 17 `family_id` families (129/142 rows)** — corrected, see §5 above | New this pass, corrects Capacity Audit §5 |
| CSSE pathway coverage | 100% of live content | New, this pass |
| Other advertised pathways (GL/ISEB/etc.) | 0% content | New, this pass |
| Year 4/5/6 targeting | Not wired (exists, cosmetic-only) | Capacity Audit §8/§21/§24.8, confirmed this pass |
| Complete usable Mocks | 2 | Capacity Audit §24.4/§24.5 |
| Rows with recorded usage telemetry | 0 / 351 | New, this pass |
