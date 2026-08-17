# Angel 11+ — 007T Migration 064 Review-Surface Reconciliation V1

**Prepared 2026-08-17.** Founder applied migration 064; Supabase reported "Success. No rows returned" (SQL-execution confirmation only, per this project's standing discipline — never read as content verification). Founder's own live screenshots of `/admin-beta/review` show no dedicated 007T section; the 6 new families and 5 new passages are not identifiable. This document reconciles the cause and records the fix applied.

---

## Part 1 — Migration 064 authoritative verification: **BLOCKED by RLS, evidence requested**

`ali_family_review` is confirmed RLS-opaque to the anon key this session holds — re-tested directly this session (`200` status, `content-range: */0`, body `[]`), the identical signature Decisions 48/53/54/56/63/65/67 have all documented for this table. **No claim is made about whether migration 064's 11 rows actually exist** — that would require reading data this session cannot read.

**Exact authenticated query requested** (Supabase Dashboard → SQL Editor, run as the Founder's own authenticated session):

```sql
select review_target_type, family_id, reviewer, decision, notes
from ali_family_review
where family_id in (
  'mr01-whole-number-computation',
  'mr01-decimal-computation',
  'mr01-fraction-computation',
  'mr01-multistep-order-of-operations',
  'wave3-fam-rc10-word-choice',
  'wave3-fam-rc10-atmosphere-mood',
  'wave3-eng-emptyclassroom',
  'wave3-eng-bakersapprentice',
  'wave3-eng-lettertograndad',
  'wave3-eng-stormharbour',
  'wave3-eng-newtrainers'
)
order by review_target_type, family_id;
```

Expected result if migration 064 succeeded exactly as written: **11 rows**, each with `reviewer = 'UNASSIGNED'` and `decision = 'pending_independent_review'`.

---

## Part 2 — Live review UI trace: **root cause confirmed via code, independent of the data question**

Traced `app/admin-beta/review/page.tsx` and `lib/adminReview.ts` directly. Finding:

**`fetchPendingReviewTargets()`** (`lib/adminReview.ts`) reads every row from `ali_family_review` where `decision = 'pending_independent_review'`, with no batch/wave filtering — a genuinely live, complete fetch.

**Section assignment, however, is entirely hardcoded.** Four named arrays exist in `page.tsx` — `PILOT_TARGET_IDS` (7), `BATCH2_TARGET_IDS` (6), `BATCH3_TARGET_IDS` (7), `BATCH4_TARGET_IDS` (9) — and **`FullBacklogSection`'s own filter is**:

```ts
const backlogTargets = targets.filter((t) =>
  !PILOT_TARGET_IDS.includes(t.id) && !BATCH2_TARGET_IDS.includes(t.id) &&
  !BATCH3_TARGET_IDS.includes(t.id) && !BATCH4_TARGET_IDS.includes(t.id));
```

**No fifth array existed for 007T.** This means: **root cause B, confirmed with certainty from code alone, independent of whether migration 064 actually inserted any rows.** Even if migration 064 succeeded perfectly, its 11 targets would be fetched correctly by `fetchPendingReviewTargets()` but would fall through every named-section filter and land, unlabelled, inside the generic "Full Review Backlog" bucket — exactly matching the Founder's own observation that the section is simply not identifiable.

**Ruled out, by direct code inspection:**
- **C (records not inserted):** cannot be ruled in or out without Part 1's authenticated evidence — but is not required to explain the observed symptom, since B alone fully explains it regardless.
- **D (ID mismatch):** the 11 IDs used in migration 064 are copied verbatim from the same generator scripts (`scripts/generate-007t-mathematics-mr01.mjs`, `scripts/generate-007t-english-rc10.mjs`) that produced migration 063's content — cross-checked, identical.
- **E (another prerequisite missing):** `fetchTargetSummary`/`fetchRepresentativeQuestions`/`fetchPassageDetail` are all family-id-agnostic (no allowlist), confirmed in the prior reconciliation (Decision 70) and re-confirmed this session — no other prerequisite exists.

**A (records inside the collapsed backlog):** genuinely possible — if migration 064 succeeded, its 11 targets would indeed be sitting inside the 26 (or more) backlog items, uncategorised, which is consistent with both the Founder's screenshot and the code trace.

---

## Part 3 — Backlog verification: **BLOCKED by RLS, evidence requested**

The same RLS opacity blocks enumeration of the 26-item backlog's exact contents. From code and prior context, the pre-007T backlog is known to include (not exhaustively confirmed): `wave1-fam-tick-justify`, `mr02-sequence-rule`, `mr02-substitution`, `mr03-angle-sum`, `mr05-number-property`, `precision-dec`, `precision-frac`, `writing-reflective-discursive`, and others carrying no curated display name at all (rendered via `formatFallbackName`). **Whether the 26 figure in the Founder's screenshot already includes migration 064's 11 targets cannot be determined from code alone** — it depends on live data this session cannot read.

**Exact authenticated query requested** (same session, same access):

```sql
select review_target_type, family_id, reviewer, decision
from ali_family_review
where decision = 'pending_independent_review'
order by review_target_type, family_id;
```

This single query answers both Part 1 and Part 3 completely — the 11 007T IDs above can be located within its output, and the remainder is the true backlog composition.

**No historical backlog item was modified, approved, or touched by this reconciliation.**

---

## Part 4 — Correction applied (bounded, code-only, safe regardless of the Part 1/3 data question)

**This fix does not depend on, or make any claim about, whether migration 064's rows exist.** It only changes how `ali_family_review`'s live data is *grouped and labelled* once fetched — exactly the same non-claim-dependent property every `BatchNSection`'s own honest empty-state message already has ("None of the N targets are visible yet").

`app/admin-beta/review/page.tsx`:
- Added `SEVEN_T_MATHS_TARGET_IDS` (4), `SEVEN_T_ENGLISH_TARGET_IDS` (2), `SEVEN_T_PASSAGE_TARGET_IDS` (5), and their union `SEVEN_T_TARGET_IDS` (11) — mirroring the exact naming/structure convention of `BATCH2_TARGET_IDS` etc.
- Added `SevenTSection`, a new "007T Content Review" section with three named sub-groups (Mathematics / English Effect of Language / Passages), each rendered via `SevenTSubGroup` — a thin wrapper reusing the exact same `TargetCard` every other section already uses. **No new evidence-fetching code was written**; `TargetCard`, `fetchTargetSummary`, `fetchRepresentativeQuestions`, and `fetchPassageDetail` are unchanged and already family-id-agnostic.
- The section header carries 5 explicit disclosure lines, matching the Founder's own required list verbatim in substance: all 34 provisional/no auto-activation; Mathematics teaching-content gap; English uses the new Effect-of-Language families; passage review is separate; no Mock involvement.
- `FullBacklogSection`'s filter extended to also exclude `SEVEN_T_TARGET_IDS`, so once migration 064's rows exist, they will never double-count in both the new section and the backlog.
- Inserted into the render tree directly after `Batch4Section`, before `FullBacklogSection` — the same position every prior batch section occupies relative to the backlog.
- One em-dash in the new disclosure text was found and fixed by the Copy Quality Guard's own automated check before commit.

**If migration 064's 11 rows exist:** they now render in a clearly labelled "007T Content Review" section, in three named sub-groups, with full evidence (question count, difficulty range, subject, target type) via the existing `TargetCard`, and full detail (questions, answers, working steps, misconceptions, passage text) via the existing, unmodified detail view on click.

**If migration 064's 11 rows do not yet exist:** each sub-group renders its own honest "None of the N targets are visible yet. Confirm migration 064 has been applied." message — never a silent gap, never a false claim of readiness.

**Files changed:** `app/admin-beta/review/page.tsx` only.

---

## Part 5 — Review evidence

Confirmed available via existing, unmodified machinery (no new code needed): `RepresentativeQuestion` (`lib/adminReview.ts`) already carries `question`, `modelAnswer`, `workingSteps`, `addressesMisconception`, `contentDifficulty`, `transferClass`, `provenance`, `eligibilityStatus`, `contentVersion`; `PassageDetail` already carries `title`, `originalText`, `genre`, `wordCount`, `readingComplexity`, `provenance`, `copyrightStatus`. The review page's existing detail view (`ReviewForm`) already renders `workingSteps` as a step-by-step explanation and `addressesMisconception` as a labelled "Common trap" callout, for any family regardless of ID — confirmed by direct code inspection, not assumed.

---

## Part 6 — Safety

No `eligibility_status` was changed. No content was activated. No Mock content exists or was created. No new content batch was authored. No historical review decision was touched. The 483 planning target was not changed. No visual redesign occurred — one new section, in the exact visual/structural pattern of the four sections already on the page.

---

## Part 7 — Regression

Full suite 398/398. TypeScript clean. Copy Quality Guard PASS (0 violations, 233 files — one em-dash found and fixed during this session). Production build succeeds. Bank-wide Mathematics regression 188/188. Passage-aware exposure and Mock Content Firewall suites re-run explicitly, all PASS. Production counts re-queried live, both before and after all code changes: **TOTAL 298, Practice Eligible 247, Maths PE 141, English PE 106, Provisional 51, Mock Eligible 0 — matches the expected state exactly, unchanged throughout.**

---

## Governance

**Recorded as Decision 71** in `ALI_DECISION_LOG.md`.
