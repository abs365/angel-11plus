# Angel 11+ — 007T Post-Migration Reconciliation and Human Review Preparation V1

**Prepared 2026-08-17.** Founder has applied migrations 062 and 063 (Supabase reported "Success. No rows returned" for both — confirmed to mean SQL execution only, not verified content). Every claim below is independently re-derived from live production, not inferred from the success message.

---

## Part 1 — Production reconciliation

**Top-line, fresh query:** TOTAL 298 (264 + 34, exact), Practice Eligible 247 (**unchanged**), Provisional 51 (17 + 34, exact), Mathematics: 166 total / 141 PE (unchanged) / 25 provisional (5 + 20, exact), English: 131 total / 106 PE (unchanged) / 25 provisional (11 + 14, exact), Mock Eligible 0 (unchanged).

**All 34 new rows fetched by exact ID** (20 Mathematics, 14 English) — 34/34 found. **Full field-by-field reconciliation** of every row against the committed generator scripts' expected values (subject, skill, family_id, competency inference via skill, provenance, content_version, active, difficulty, `addresses_misconception`, answer/question text, `workingSteps`/`modelAnswer`/`acceptedAnswers`, `learning_unit_id` passage mapping) — **34/34 PASS, zero discrepancies.**

**`ali_passage_bank` is RLS-opaque to the anon key** — confirmed pre-existing and universal, not specific to this migration (a known pre-existing passage, `wave1-eng-kitemaker`, returns the identical `200`/`content-range: */0`/`[]` signature as the 5 new passage IDs). Per this project's own standing principle (Decision 48), this is never read as "the table is empty." **Strong indirect evidence the 5 passage rows committed successfully:** migration 063 is a single `begin;...commit;` transaction containing the passage INSERT followed by the 20 Mathematics and 14 English question INSERTs; since all 34 question rows are independently confirmed to exist, the passage INSERT (earlier in the same atomic transaction) must also have committed. Corroborated by content: every one of the 14 new English rows' own embedded `prompt.passageText` field matches the generator script's known-good passage text exactly (byte-for-byte, confirmed in Part 1's field reconciliation). **This is the strongest verification available without Founder-authenticated Table Editor access** — full certainty on `ali_passage_bank`'s own stored field values (title, genre, word_count, reading_complexity, etc.) would require that authenticated read, not performed this session.

**`mock_eligible` as a separate concept:** the schema does not represent this as a distinct state from `eligibility_status`; `mock_eligible` is itself one possible value of the same `eligibility_status` column. No `independently_validated` field exists anywhere in `ali_question_bank`'s schema.

---

## Part 2 — Exact family reconciliation (from production rows, not generator manifests)

| Family | Count | IDs (production-confirmed) |
|---|---|---|
| `mr01-whole-number-computation` | 5 | `mr01-wholenum-01` … `05` |
| `mr01-decimal-computation` | 5 | `mr01-decimal-01` … `05` |
| `mr01-fraction-computation` | 5 | `mr01-fraction-01` … `05` |
| `mr01-multistep-order-of-operations` | 5 | `mr01-multistep-01` … `05` |
| `wave3-fam-rc10-word-choice` | 8 | `w3-rc10-wc-01` … `08` |
| `wave3-fam-rc10-atmosphere-mood` | 6 | `w3-rc10-am-01` … `06` |

**Every count matches 007T exactly. 5+5+5+5 = 20 Mathematics; 8+6 = 14 English.**

---

## Part 3 — Passage reconciliation

**Live distinct English passage count** (via `ali_question_bank.learning_unit_id`, the readable-table method used throughout this programme since `ali_passage_bank` is RLS-opaque): **24** — exactly 19 + 5, confirmed. All 5 new passage IDs present.

**Orphan check:** initially found 3 "unrecognised" `QT-RC-10` rows (`eng-001-q3`, `eng-001-q4`, `fv-eng-001-q4`) beyond the expected 14 — investigated and confirmed these are the **pre-existing legacy QT-RC-10 pool** (`family_id: null`, `eligibility_status: practice_eligible`), the same 3 rows every baseline query this entire arc (007R, 007S, 007T) has reported. **Not a defect** — total QT-RC-10 rows = 3 legacy (unchanged) + 14 new = 17, correctly accounted for.

**No unexpected cross-family mapping:** every one of the 5 new passages is fed only by `wave3-fam-rc10-word-choice` and/or `wave3-fam-rc10-atmosphere-mood` — no other family (existing or new) references them.

**No orphan questions:** all 14 new rows' `learning_unit_id` values fall within the 5 new passage IDs.

---

## Part 4 — Difficulty reconciliation

| | EASY | EXAM-STANDARD | HARD |
|---|---|---|---|
| Mathematics (production) | 7 | 8 | 5 |
| Mathematics (007T expected) | 7 | 8 | 5 |
| English (production) | 4 | 5 | 5 |
| English (007T expected) | 4 | 5 | 5 |

**Exact match. No discrepancy — no STOP required.**

---

## Part 5 — Mathematical verification

**Independent recomputation against the actual 20 production rows** — each answer freshly recomputed from the production row's own `prompt.question` text (a separate check, not merely comparing production against the generator's stored answer): **20/20 PASS.**

**Bank-wide Mathematics answer regression, re-run live:** 166 Mathematics rows fetched (146 existing + 20 new), **188/188 checks PASS** (168 existing + 20 new).

---

## Part 6 — English content integrity

**All 14 quoted phrases re-verified verbatim against the production `prompt.passageText` field directly** (not the generator's own passage array): 13/14 auto-verified by direct substring match; 1/14 (`w3-rc10-am-06`) requires the same disclosed manual check as at authoring time — the passage renders `the word "storm"` in double quotes (correct, as literal in-narrative usage), while the question, nested inside its own outer double-quoted span, correctly renders it `'storm'` per standard English nesting convention. Confirmed identical wording, a typographic quote-style conversion only, not a content discrepancy. **14/14 verified.**

**Effect-of-Language authenticity, re-confirmed structurally:** every one of the 14 questions anchors to a specific quoted phrase and asks what it *suggests*, never what it *means* (would be vocabulary/QT-RC-03), never a plot-level feeling without reference to language choice (would be emotion/cause/QT-RC-08), never a bare retrieval or generic inference prompt. **This is a content-integrity/structural check, not a self-certification of educational quality** — final educational judgement belongs to the Founder's own human review, not to this verification pass.

---

## Part 7 — Anti-memorisation regression

Re-run against production-equivalent data (field-by-field reconciliation in Part 1 already established the generator manifest and live production are identical, so the existing `tests/content/007tBatch.test.ts` suite constitutes a genuine production regression): **9/9 PASS** — no duplicate questions, no number-swap clones (structural fingerprinting including a like/unlike-denominator signal), no repeated answer-template patterns, English pairwise similarity within bounds (max 0.28).

**Passage-aware exposure recognition, proved directly against live production rows** (not merely the generator): all 14 production rows, mapped into the real `BankQuestion` shape and passed through the actual `passageGroupingKeyOf()` logic (Decision 68), resolve correctly to one of the 5 new passage IDs — zero special-casing required. Directly demonstrated: `wave3-eng-emptyclassroom` is shared by 2 families in production exactly as designed, confirming the passage-level exposure pass would catch a same-passage, cross-family repeat for this content the moment it is ever activated.

---

## Part 8 — Eligibility firewall

**Critical result: all 34 new rows carry `eligibility_status: 'provisional'`, zero exceptions** — verified by direct field inspection, not inferred. Zero rows are `practice_eligible`. Zero rows are `mock_eligible`. **Practice Eligible total (247) is unchanged from before migrations 062/063.** **Mock Eligible (database-wide, live) = 0, unchanged.** **The eligibility firewall is fully intact. No production defect found.**

---

## Part 9 — Review interface

**A real, disclosed gap was found and closed as a bounded extension, per this task's own explicit authorisation.** `fetchPendingReviewTargets()` (`lib/adminReview.ts`) reads `ali_family_review` **where `decision = 'pending_independent_review'`** — it does not derive pending targets from `ali_question_bank` directly. Migrations 062/063 create the *content*; they do not create the *placeholder review rows* that make a target visible in `/admin-beta/review`'s pending list. Without a further step, the 6 new families and 5 new passages, though fully content-complete, would **not** appear in the Founder's review queue at all.

**This exact pattern — a dedicated placeholder-seeding migration — is the established precedent** for every prior English wave (migrations 048, 050, 052). **Migration `064_007t_pending_review_records.sql` was generated**, following that precedent exactly: 6 `question_family` rows + 5 `passage` rows, `reviewer: 'UNASSIGNED'`, `decision: 'pending_independent_review'`, idempotent (`WHERE NOT EXISTS`), inserting **only placeholder rows that record review is awaited — it does not itself constitute, preselect, or imply any review decision.** **STOPPED for Founder review and manual application**, same as 062/063.

**Child-facing display names added** (`app/admin-beta/review/page.tsx`'s existing `FAMILY_DISPLAY_NAME` dictionary — a bounded extension of an existing mechanism, no parallel system created):

| Family ID | Display name shown to Founder |
|---|---|
| `mr01-whole-number-computation` | Whole-Number Direct Arithmetic |
| `mr01-decimal-computation` | Decimal Direct Arithmetic |
| `mr01-fraction-computation` | Fraction Direct Arithmetic |
| `mr01-multistep-order-of-operations` | Multi-Step and Order of Operations |
| `wave3-fam-rc10-word-choice` | Word-Choice Implication |
| `wave3-fam-rc10-atmosphere-mood` | Atmosphere and Mood |

Without this addition, the UI's own graceful fallback (`formatFallbackName`) would have shown a formatted-but-not-curated label (e.g. "Whole Number Computation") rather than a raw ID — never actually broken, but the directive's own instruction ("do not make the Founder review raw IDs as the primary description") is now met by curated names, not merely a fallback.

**Passage review evidence:** existing `PassageDetail`/`fetchPassageDetail()` machinery is family-id-agnostic (confirmed by direct code inspection, no allowlist), so the 5 new passages will display via their own real `title`/`original_text`/`genre`/`word_count`/`reading_complexity` fields once `ali_passage_bank` is read through the Founder's own authenticated session (which has real access, unlike this session's anon key).

**Review criteria availability, confirmed present:** correctness (Part 5/6), CSSE relevance (007T Parts 3/5), age appropriateness, wording (Copy Quality Guard equivalent, 0 violations), answer integrity (Part 5), working explanation (`workingSteps` on every Mathematics row), difficulty (Part 4 + 007T Part 8's dimension-scored table), structural variation (Part 7), teaching quality (Part 10 below), misconception usefulness (every row's tag), anti-memorisation strength (Part 7, STRONG), passage quality (Part 3/6), Effect-of-Language authenticity (Part 6). **No decision was preselected by this reconciliation** — migration 064 inserts `UNASSIGNED`/`pending_independent_review` only.

---

## Part 10 — Teaching disclosure (truthful status, not inflated)

**Mathematics — 4 new families:**

| | Status |
|---|---|
| Question/Practice content | **REVIEW READY** — 20 questions, every one carrying `workingSteps` and a distinct misconception tag |
| Dedicated MODEL/Guided teaching content | **NOT YET AUTHORED** |

These 4 families do **not** have the same teaching maturity as the 26 previously Founder-approved Mathematics families, which each have separate MODEL/Guided-stage teaching rows (e.g. `learn-mth-arith-guided`, `learn-mth-arith-independent`). This is disclosed plainly, not implied otherwise anywhere in this document or the review-pack notes (migration 064's own notes text states this explicitly per family).

**English — 2 new families:** teaching compatibility matches the **existing** convention exactly — every named English family (e.g. `wave1-fam-vocab-explain`) uses the question row's own `modelAnswer` field as its model demonstration; there is no separate teaching-content-row convention for English the way Mathematics has. RC-10's 14 rows all carry `modelAnswer` + `acceptedAnswers`, matching this convention precisely — **not inflated, a genuine like-for-like match**, confirmed against real production rows (`w1-atticdoor-02`, `w1-letter-02`) in the original 007T work.

---

## Part 11 — Verification

| Check | Result |
|---|---|
| Full automated test suite | **398/398 PASS** |
| TypeScript (`tsc --noEmit`) | Clean, 0 errors |
| Copy Quality Guard | PASS — 0 violations across 233 files |
| Production build (`next build`) | Succeeds, 0 errors |
| First-principles Mathematics verification (against production) | 20/20 PASS |
| Bank-wide Mathematics answer regression (live) | 188/188 PASS |
| English content-integrity verification (against production) | 14/14 quotes verified |
| Passage-aware exposure tests | PASS — proved directly against live production rows |
| Mastery-protection tests | 24/24 PASS |
| Mock firewall tests | PASS, unaffected |
| Production counts, re-queried after all verification | Unchanged: TOTAL 298, PE 247, Mock Eligible 0 |

---

## Governance

**Recorded as Decision 70** in `ALI_DECISION_LOG.md`.
