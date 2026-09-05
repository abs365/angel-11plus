# ANGEL 11+ — Mock Depth and Security Audit

**Status:** Primary source `ANGEL_EDUCATIONAL_CAPACITY_AUDIT.md` §15, §24.4–24.7 (Founder-executed production reconciliation). New evidence this pass: confirmation of the exact activation/freeze migration pairs and the RLS mechanism that prevents anon-level verification of live Mock form state.

---

## 1. Complete usable Mocks — exactly 2

| Mock form | Manifest rows | Marks | Status | Attempts |
|---|---|---|---|---|
| **Mathematics Mock 1** (`first-mock-mathematics-v1`) | 56 | 56 | active = true | 2 total / 1 submitted |
| **Reading Comprehension Mock 1** (`reading-comprehension-mock-1`) | 28 (27 display units) | 65 | active = true | 5 total / 4 submitted |

Source: Capacity Audit §24.4/§24.5, Founder-executed live query. No Writing Mock, no Verbal/Non-Verbal Reasoning Mock, and no second sitting ("Mock 2") of either subject exists — confirmed independently this pass: exactly 4 migration files in the entire 227-file history are named as a Mock freeze/activation pair (`147_mock_mathematics_first_mock_1_inactive_freeze.sql` → `150_mock_mathematics_first_mock_1_activation.sql`; `212_reading_comprehension_mock_1_freeze.sql` → `217_reading_comprehension_mock_1_activation.sql`), and no others exist for any other subject or a second sitting.

**Correction to this fork's own earlier draft**: migration 147's own text describes a 21-question/56-mark composition at authoring time; the audit's live-queried result is 56 rows/56 marks. The two are not necessarily contradictory (content may have been restructured between authoring and the audit's query), but **the live-queried figure (56/56) is authoritative** — migration text alone, without a live re-query, is not reliable evidence of current Mock composition. This is the same lesson the audit already learned twice for the "NOT APPLIED" header (§4, §24.2) — a static/historical artifact is not proof of the live state either way, positive or negative.

## 2. Mock-eligible reserve pool (the "how many more Mocks could we assemble" question)

| Subject | Mock-eligible total | Consumed into an active form | Strict unexposed reserve |
|---|---|---|---|
| Mathematics | 77 rows | 56 rows / 56 marks | **21 rows / 21 marks** |
| English Reading | 50 rows | 28 rows / 65 marks | **22 rows / 39 marks**, + 2 unexposed passages (Loose Connection, Sail and Steam) |
| Writing | 0 assembled Mock form | n/a | 1 named reserved prompt, no Mock form built |

Source: Capacity Audit §24.6/§24.7, exact Founder-run query results.

**A fresh 56-mark Mathematics Mock cannot currently be assembled from the 21-mark reserve alone** — this is a verified, not estimated, capacity constraint (§24.6). English Reading's 39-mark/22-row reserve is thin relative to Reading Mock 1's own 65-mark composition — a full second sitting is not currently assemblable from reserve either, though a shorter one might be.

## 3. Security / overlap audit — the Practice/Mock firewall

**Genuine strength, confirmed by both the existing audit and this session's own direct experience** (migrations 208/209 enforce a bidirectional firewall — Practice content cannot leak into Mock-eligible status and vice versa — proven by `mockContentFirewall.test.ts`). This session's own Increment 025 work independently corroborates the firewall's integrity: the real production Reading Mock attempt (`e2f26f8d-25b6-452d-bd1c-3d5ad2436a0f`) that was scored, manually marked, analysed and released today drew exclusively from the frozen `reading-comprehension-mock-1` manifest — no practice-pool question ever entered that attempt's `assigned_question_ids`, and the 3 passages it consumed (Bees, Boathouse, Understudy) remain marked exposed/consumed, not returned to Practice (§24.7).

**RLS confirms the same protection at the database layer, independently verified this pass**: `ali_mock_form`'s anon/authenticated read policy was **deliberately dropped entirely** by migration 071 ("FIX B: drops `ali_mock_form_select_all` entirely. No replacement SELECT policy is added for anon or authenticated") — meaning a live public/anon query cannot read Mock form content or composition at all today (confirmed directly: an anon-key query against `ali_mock_form` and `ali_mock_cycle` both this pass returned 0 rows, not because the tables are empty but because the read policy denies it — the same distinction the existing audit already draws for `ali_passage_bank`, §17/§23). Mock form authoring is admin-only (`is_current_user_admin()` gate, migration 070's `ali_mock_form_admin_write` policy), matching this session's own established, twice-proven pattern (Increment 025's `mock_apply_manual_mark`/`mock_release_report` authenticated-transport work) for every other admin-gated Mock write path.

## 4. Mock-reserved content leaking into normal Practice — checked, not found

The Founder's brief specifically asks that "mock reserve questions should not routinely leak into normal practice." No evidence of leakage was found: the live anon-key query (this pass) against the 351 practice-eligible rows found **zero** rows carrying `mock_eligible` or any Mock-track `eligibility_status` — the RLS policy structurally enforces this as a positive allow-list (`eligibility_status = 'practice_eligible'` only), not merely a convention. Combined with the firewall migrations above, this is a **doubly-enforced** protection (application-level firewall + RLS-level allow-list), assessed as genuinely low-risk.

## 5. What remains unverified

- Whether `ali_mock_cycle` (migration 085, "Mock Cycle Governance Architecture") currently gates or schedules anything live — not queried this pass (anon-blocked, and out of this fork's time budget); the existing audit does not cover this table either. Flagged as an open item for whoever next has admin query access.
- Individual-question-level review of the Mock-eligible reserve pool (77+50 rows) for the same predictable-distractor/repeated-wording risk named in the Repetition Audit — not performed for the reserve pool specifically, only implied by the general "unproven, not exhaustively reviewed" finding.

---

## 6. Conceptual pool mapping (Question Factory Wave 1, Phase 8, 2026-09-05)

The Founder asked for six conceptual content pools (TEACHING, PRACTICE, REMEDIATION, MASTERY CHECK, UNSEEN ASSESSMENT, MOCK RESERVE) to be "supported conceptually," reusing existing concepts rather than building redundant architecture. All six already map cleanly onto real, existing fields — no new column or table is needed:

| Conceptual pool | Existing mechanism | Real value(s) |
|---|---|---|
| TEACHING | `lib/ali/inventoryClass.ts`'s `contentType: "teaching"` branch, and `lib/learningEngine/mathsTeachingContent.ts`'s real lesson content | `classifyInventoryClass()` → `"open"` |
| PRACTICE | `ali_question_bank.eligibility_status = 'practice_eligible'` + `active = true` | `classifyInventoryClass()` → `"renewable"` (or `"measurement"` for FAR_TRANSFER-tagged rows) |
| REMEDIATION | No dedicated pool exists (confirmed by the pre-existing Capacity Audit §3/§20 and unchanged by this pass) — remediation today reuses the same PRACTICE pool via `addresses_misconception`-tagged rendering, not a separate content pool. Recorded honestly as a gap, not mapped to a mechanism that doesn't exist |
| MASTERY CHECK | `lib/ali/exposureIntelligence.ts`'s `MASTERY_MAINTENANCE`/`SPACED_RETRIEVAL` retrieval stages, live-wired via `applyRetrievalPriority()` in `lib/learningEngine/sessionGenerator.ts` | Retrieval stage classification, not a separate table |
| UNSEEN ASSESSMENT | `ali_question_bank.eligibility_status = 'mock_eligible'`, unexposed (`ali_mock_exposed_question_ids`/`ali_mock_exposed_passage_ids`, migrations 208/209) | `classifyInventoryClass()` → `"sealed"` |
| MOCK RESERVE | Same as UNSEEN ASSESSMENT — a "reserve" is simply the subset of `mock_eligible` rows not yet consumed into an active Mock form's manifest (Section 2 above) | `"sealed"`, cross-referenced against the active manifest |

This mapping is documentation only — it changes no code and no schema. It confirms the Founder's own instruction ("reuse existing concepts where already present... do not create redundant architecture") is already satisfiable without new work for five of the six pools; REMEDIATION is the one genuine, already-known content gap (carried forward from the Capacity Audit, not new this pass).

---

## Summary table

| Metric | Value | Source |
|---|---|---|
| Complete, active Mock forms | 2 (Mathematics Mock 1, Reading Comprehension Mock 1) | Capacity Audit §24.4/§24.5 |
| Mathematics Mock 1 composition | 56 rows / 56 marks | Capacity Audit §24.4 (live-queried, authoritative) |
| Reading Comprehension Mock 1 composition | 28 rows/27 display units / 65 marks | Capacity Audit §24.5 |
| Mathematics strict unexposed reserve | 21 rows / 21 marks — cannot assemble a fresh 56-mark Mock | Capacity Audit §24.6 |
| English strict unexposed reserve | 22 rows / 39 marks + 2 passages | Capacity Audit §24.7 |
| Writing Mock form | Does not exist | Capacity Audit §15 |
| Practice/Mock firewall | LOW risk — DB-enforced, test-proven, RLS-confirmed this pass | Capacity Audit §6/§11, confirmed this pass |
| Mock-reserve leakage into Practice | None found | This pass, live query |
| Mock form live composition readable by anon | No (RLS policy dropped by migration 071) | This pass, live query + migration citation |
