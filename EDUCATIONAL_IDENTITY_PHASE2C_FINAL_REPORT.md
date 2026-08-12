# Educational Identity Coverage — Phase 2C Final Report

**Status: NOT committed. NOT applied to any database.** Awaiting review per explicit Founder instruction. Migrations 016-018 exist only as local files; this sandbox has no reachable Supabase instance (confirmed, not assumed — see §14).

---

## 1. All 218 source items by source and subject

| Source file | Subject | Item count |
|---|---|---|
| `data/lessons.ts` | english | 10 |
| `data/maths.ts` | maths | 20 |
| `data/vocabulary.ts` | vocabulary | 12 |
| `data/writing.ts` | writing | 4 |
| `data/verbal-reasoning/*` | verbal-reasoning | 52 |
| `data/non-verbal-reasoning/*` | non-verbal-reasoning | 40 |
| `data/spatial-reasoning/*` | spatial-reasoning | 39 |
| `data/numerical-reasoning/*` | numerical-reasoning | 41 |
| **Total** | | **218** |

Scanned programmatically (`scanAllSources()`, real imports of the real content modules), not by hand — verified by an automated test asserting the exact per-subject count.

## 2. Canonical identity disposition for every item

| Status | Count | Meaning |
|---|---|---|
| `already-registered` | 18 | Pre-existing `ali_question_bank` rows (migration 013), reconciled and confirmed unchanged |
| `newly-registered` | 11 | Batch 1 (English + Maths), evidence-supported, ready in migration 016 |
| `requires-review` | 189 | Explicitly evaluated, evidence-based determination that no defensible Question Type mapping exists yet — never guessed |
| **Total** | **218** | |

Zero items are unaccounted for — an automated test explicitly asserts no item falls through to an "UNACCOUNTED" fallback state.

## 3. Identity coverage percentage

**29 / 218 = 13.3%** (18 already-registered + 11 newly-registered).

## 4. Evidence-supported QT-* classification coverage percentage

**29 / 218 = 13.3% — numerically identical to identity coverage in this report.**

This is not a coincidence and not double-counting — it is a direct, structural consequence of the schema: `ali_question_bank.skill` is declared `not null` (migration 005). There is currently no way for an item to receive a canonical row without also receiving a real skill/Question Type value. Until that constraint changes (or some other mechanism is introduced), **identity coverage cannot exceed classification coverage** — every classified item is automatically an identified one, and vice versa. This coupling is itself a finding of this work package, not an oversight: see §15 for the decision it implies.

## 5. Items requiring educational review (189)

| Group | Count | Reason category |
|---|---|---|
| Batch 1 correction | 2 | `eng-002-q2`, `eng-003-q2` — genuine ambiguity between two real Question Types, not resolved by preference (full disclosure in §6 below and `EDUCATIONAL_IDENTITY_BATCH1_RECONCILIATION.md`) |
| Batch 2, Writing | 3 | `wrt-001`, `wrt-002`, `wrt-004` — narrative/descriptive genre has no match in Assessment Brain V1's 2-type Continuous Writing catalogue (both existing types are reflective/discursive or picture-stimulus) |
| Batch 2, Vocabulary | 12 | All 12 words — standalone lexical flashcards have no match among Assessment Brain V1's 27 Question Types; the two closest (`QT-RC-03`/`QT-RC-04`) are explicitly passage-context-dependent |
| Batch 3, all reasoning subjects | 172 | Assessment Brain V1 defines competencies/Question Types only for CSSE's own tested domains (English/Maths/Writing/Vocabulary) — it has zero coverage for Verbal/Non-Verbal/Spatial/Numerical Reasoning, since CSSE tests none of them |

Every one of these 189 has an individual, evidence-cited reason recorded in `scripts/educational-identity-registration.ts` (`BATCH_1_REVIEW`, `BATCH_2_REVIEW`, `BATCH_3_REVIEW`) and in the machine-readable `EDUCATIONAL_IDENTITY_RECONCILIATION_REPORT.json`.

## 6. Evidence-supported exclusions

**None.** Every one of the 189 "requires-review" items is an **open, evidenced flag pending a future decision** (e.g. a schema change, a genre-specific Question Type addition to Assessment Brain V1, or a Founder ruling on the two ambiguous Batch 1 items) — not a closed, permanent exclusion. No item has been permanently excluded from ever receiving an identity; nothing has been declared structurally impossible except within Assessment Brain V1's *current* scope.

## 7. Reconciliation of all pre-existing bank rows

All 18 rows from migration 013 re-verified against the current source tree: every id still matches a real, present source item (`data/lessons.ts`, `data/maths.ts`, `data/writing.ts`). Zero conflicts, zero orphaned rows, zero renamed sources. Full table in `EDUCATIONAL_IDENTITY_BATCH1_RECONCILIATION.md` §2 of the original version (unchanged by the correction).

## 8. Cross-source collision results

**Zero collisions** across all 218 real items (`validateCrossSourceUniqueness`). The check's correctness is proven, not assumed — a test injects a synthetic collision and confirms it is caught. **Zero conflicts** between any of the 11 Batch 1 registrations and the existing 18 rows (`validateBatchAgainstExisting`), likewise proven via an injected-conflict test.

## 9. All migrations generated

| Migration | Batch | Rows inserted | Content |
|---|---|---|---|
| `016_educational_identity_batch1_english_maths.sql` | 1 (English + Maths) | **11** | `eng-001-q1`, `eng-001-q4`, `eng-003-q1`, `qa-001`–`qa-006`, `qa-009` |
| `017_educational_identity_batch2_writing_vocabulary.sql` | 2 (Writing + Vocabulary) | **0** | Documented no-op — every remaining item in this batch is requires-review |
| `018_educational_identity_batch3_reasoning_subjects.sql` | 3 (reasoning subjects) | **0** | Documented no-op — Assessment Brain V1 has no coverage for these domains |

All three are additive-only, use `on conflict (id) do nothing` (016) or an explicit `select 1;` no-op (017, 018), and depend only on migrations 005/007/013 — none depends on another of the three, and none depends on any Practice Evidence Integration code.

## 10. Idempotency evidence for each generated artefact

Ran the full generator twice in immediate succession and diffed every output file byte-for-byte:

```
016 IDENTICAL
017 IDENTICAL
018 IDENTICAL
REPORT IDENTICAL
```

Also asserted programmatically in the test suite (`generateBatch1/2/3MigrationSql()` and `buildFullReport()` each called twice per test run, compared for exact equality).

## 11. Complete dotted-code consumer inventory

(Unchanged from the Batch 1 report — re-confirmed, not re-derived.)

| File | Role | Live? |
|---|---|---|
| `lib/ali/recommendations.ts` (`COMPETENCY_RELATIONSHIPS`) | Real, live cross-subject transfer edges for the older, separate ALI Daily Mission engine. Self-contained. | **Yes, live** |
| `lib/ali/learningProfile.ts` | Canonical dotted-code list feeding `computeLearningProfile()`. | **Yes, live** |
| `lib/ali/labels.ts` (`competencyLabel()`) | Consumed by 4 real files: `components/learningEngine/EducationalTimeline.tsx`, `components/parent/ReadinessEvidenceTimeline.tsx`, `lib/ali/explainability.ts`, `lib/parentInsights.ts`. | **Yes, live** |
| `data/ali/*SyntheticFixture.ts` | Dev-only fixtures, never a real DB row. | Dev-only |
| `types/ali/questionBank.ts`, `types/ali/parentSummary.ts`, `lib/ali/persistence/competencyEvidence.ts` | Comments only. | Not a runtime consumer |

**No CHECK constraint was added.** Confirmed again this round: none of the 11 new Batch 1 rows, nor any hypothetical Batch 2/3 row (there are none), uses a dotted code — 100% of every row this tool has ever proposed or reconciled is `QT-*` only.

## 12. Tests, TypeScript, lint, and production build results

- **Tests**: 47/47 assertions pass (`npx tsx scripts/test-educational-identity-registration.ts`), including adversarial tests (injected collision, injected conflict, injected invalid Question Type, injected duplicate) proving each validator actually rejects bad input.
- **TypeScript**: `tsc --noEmit` clean across the whole project.
- **Lint**: `eslint` clean on every new/changed file this batch (`scripts/educational-identity-registration.ts`, `scripts/test-educational-identity-registration.ts`).
- **Build**: `next build` succeeds, 48 routes, unchanged.

## 13. Final diff, separated by work stream

**Identity discovery and reconciliation** (docs only):
```
?? EDUCATIONAL_IDENTITY_INTEGRATION_DISCOVERY.md
?? EDUCATIONAL_IDENTITY_BATCH1_RECONCILIATION.md   (corrected this turn)
?? EDUCATIONAL_IDENTITY_PHASE2C_FINAL_REPORT.md    (this file)
```

**Registration tooling and tests**:
```
?? scripts/educational-identity-registration.ts
?? scripts/test-educational-identity-registration.ts
```

**Database migrations** (none applied):
```
?? supabase/migrations/016_educational_identity_batch1_english_maths.sql   (11 rows)
?? supabase/migrations/017_educational_identity_batch2_writing_vocabulary.sql   (0 rows, documented no-op)
?? supabase/migrations/018_educational_identity_batch3_reasoning_subjects.sql   (0 rows, documented no-op)
?? EDUCATIONAL_IDENTITY_RECONCILIATION_REPORT.json   (machine-readable, generated)
```

**Paused Practice Evidence Integration** (untouched this turn, exactly as previously paused):
```
 M app/english/[id]/page.tsx
 M app/maths/page.tsx
 M app/vocabulary/page.tsx
 M app/writing/page.tsx
 M scripts/test-educational-intelligence-foundation.ts
?? lib/learningEngine/legacyPracticeEvidence.ts
```
Not expanded to any additional route. Not committed. Remains independently reviewable from the identity work above — the registration tool imports nothing from `legacyPracticeEvidence.ts`, and the reverse is also true.

## 14. Exact live Supabase validation procedure

This sandbox has no reachable Supabase instance — confirmed by a direct connectivity test in the prior turn (`.env.local`'s configured host did not respond), matching this project's own long-documented constraint (`ALI_LIVE_VALIDATION_PROTOCOL.md`). **No live validation has been performed or claimed.** When run in an environment with genuine Supabase access:

1. Run `supabase/migrations/016_educational_identity_batch1_english_maths.sql` in Supabase Dashboard > SQL Editor.
2. Confirm: `select count(*) from ali_question_bank;` returns 29 (18 + 11), not 18 or 31+.
3. Confirm the 11 new rows individually: `select id, subject, skill from ali_question_bank where id in ('eng-001-q1','eng-001-q4','eng-003-q1','qa-001','qa-002','qa-003','qa-004','qa-005','qa-006','qa-009');` — every `skill` value must exactly match §9's list.
4. Confirm the original 18 rows are byte-for-byte unchanged (`select * from ali_question_bank where id in (<18 original ids>)` and diff against migration 013's own values).
5. Run migrations 017 and 018 (no-ops) — confirm they execute without error and change nothing (`ali_question_bank` row count stays at 29 after both).
6. Re-run the existing mock/practice pages (`/mocks/adaptive/maths`, `/mocks/adaptive/english`, `/learning-intelligence/practice/[area]`) end-to-end to confirm zero regression against the pre-existing 18 rows' behaviour.

## 15. Any educational item that still lacks a canonical disposition

**None lack a disposition.** All 218 have one of exactly two explicit, evidenced outcomes: registered (29) or flagged requires-review with a specific, individual reason (189). However, 189 of those remain in a genuinely **open** state — not permanently excluded — pending one of:

- A Founder ruling on the two genuinely ambiguous Batch 1 items (`eng-002-q2`, `eng-003-q2`).
- A decision on whether Assessment Brain V1 should gain new Question Type(s) for standalone vocabulary and narrative/descriptive writing (currently structurally absent from its 27+2-type catalogue) — a content/curriculum decision, not something this tool can resolve.
- **The load-bearing open question this whole batch surfaced**: `ali_question_bank.skill`'s `NOT NULL` constraint currently makes identity coverage and classification coverage inseparable. Closing the remaining 189-item gap — including the 172 reasoning-subject items, which may never get a real CSSE Question Type since CSSE doesn't test those domains at all — requires a decision on whether identity-without-classification should become possible (e.g. a nullable `skill` column, or a defined placeholder/sentinel value), and if so, how. This is squarely a Founder/architecture decision, not one this work package makes unilaterally.

Nothing has been committed. Nothing has been applied to any database.
