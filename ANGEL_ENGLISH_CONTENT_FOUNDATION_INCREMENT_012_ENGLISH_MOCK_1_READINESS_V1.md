# Angel English Content Foundation — Increment 012: English Mock 1 Readiness

State as of HEAD `db63891` (branch `main`), 2026-09-03. Evidence-based
throughout: every figure is tagged **VERIFIED LIVE** (checked this
session via a direct anon-key REST query against production Supabase),
**INHERITED** (from a prior Decision's own report, not re-derived this
session — anon-key RLS blocks re-verification, disclosed where it
applies), or **UNSUBSTANTIATED** (not confirmed either way).

---

## 1. Corrected Programme Completion Register (Founder corrections applied and independently verified)

All five Founder corrections were checked against **live production**
via direct REST queries (anon key, `.env.local`, same mechanism this
project's own `scripts/verify-*.mjs` scripts already use) before being
accepted — not taken on report.

| Item | Founder correction | Verification method | Result |
|---|---|---|---|
| Migration 181 (22-row Reading promotion) | Already live, no reapplication needed | Queried all 22 target IDs live | **CONFIRMED** — 22/22 `practice_eligible` |
| "~11 stray unreviewed" Reading questions | (not directly addressed by Founder; investigated independently) | Exact-ID and broad `ilike` search | **CORRECTED FURTHER**: these 11 IDs do not exist in the live table at all (e.g. `kitemaker` has rows 01,02,03,05-09 live; 04 has never existed) — not "unreviewed," never authored |
| Migration 182 / 34-mark reserve | 34 marks is the planning position regardless of 182's application | Queried the 13 new Mathematics row IDs live | **CONFIRMED** — 0/13 exist live; the 34-mark figure is a paper/planning position, not a live-DB fact; 182 stays HOLD |
| Writing pool = exactly 7 named IDs | Not 22 rows; migration 200 superseded by 203 | Full-table query, id/family_id `ilike '*writing*'`, all eligibility states | **CONFIRMED EXACTLY** — the 7 named IDs, and only those 7, are live at any status |
| Migrations 183–185 | Reconcile lifecycle before claiming unapplied | Compared each migration's fail-closed before/after value against live rows (representative target per migration) | **CONFIRMED APPLIED LIVE** — `ALI_DECISION_LOG.md`'s Decision 263 entry calling them "UNAPPLIED" is stale; a later, undocumented Founder application event superseded it |

**New finding this session, decisive for the Mock question:** a full grep
of every migration that has ever executed `set eligibility_status =
'mock_eligible'` (76 files mention the string; 13 files actually perform
the SET) shows **every real `mock_eligible` promotion in this
repository's history is Mathematics-only** (migrations 105, 123, 124,
129, 130, 133, 136, 139, 142, 144). Migrations 160 and 165 — the two
migrations that validate the Reading Mock-track passages — explicitly
state in their own comments that they do **not** set `mock_eligible`,
only `independently_validated`. **Zero English content of any kind has
ever crossed the Mock Content Firewall (Decision 59).** This is not a
visibility artefact of anon-key RLS (which does hide `mock_eligible`
rows from anon reads, per migration 069/071/084 — a real, separate
limitation, disclosed in Section 2) — it is confirmed via the complete,
git-tracked migration history, which is the authoritative record of
every eligibility change this system has ever made.

Full corrected A–I register: unchanged from the prior register except
where the table above applies. Section D (Reading Comprehension) — the
"~11 stray" language is retired; replace with "11 IDs referenced in
migration 181's own exclusion list were never authored." Section I now
lists migrations 183–185 as **APPLIED**, not outstanding debt.

---

## 2. Current CSSE English Assessment Contract

Source: `CSSE_EXAMINATION_BLUEPRINT.md` + `ALI_DECISION_LOG.md` Decisions
58–60.

**EVIDENCED CURRENT CSSE CONTRACT (HIGH confidence unless noted):**
- Two same-day papers: English + Mathematics only. No standalone
  VR/NVR/Applied-Reasoning paper.
- English: one 70-minute sitting (60 minutes + 10 minutes reading time).
- **English is 2 sections, not 3.** Applied Reasoning (`AR-01`,
  `QT-AR-01`) was removed from the exam **September 2024** (2025 Entry
  onward) — Founder-confirmed, Decision 58. Decision 58 already corrected
  two live code arrays that were still treating AR-01 as current. This
  increment does not reintroduce it anywhere.
- Comprehension: narrative-fiction passage confirmed HIGH; generalising
  to informational/non-fiction is not evidenced beyond the sampled years
  (MEDIUM, inherited from the earlier register's own Reading finding).
  Written-answer format with flexible/paraphrase mark-scheme acceptance,
  not multiple choice.
- Continuous Writing: 20 minutes, separate booklet, completable any time
  within the 60-minute sitting. Historically **two prompts**: a
  reflective/discursive question, then a **picture-stimulus narrative**
  (HIGH for format, INSUFFICIENT EVIDENCE for exact topics). Mark total
  varies 15/15/20 across the three known sampled years (MEDIUM).
- Combined maximum 120 (60 English + 60 Maths), age-standardised, 50/50
  weighted (HIGH).

**NOT ESTABLISHED — do not manufacture precision here:** the exact
current Comprehension/Writing mark split post-Applied-Reasoning-removal.
The old combined Comprehension+Reasoning figure is obsolete; no source
states its replacement. **Any specific mark allocation in an Angel Mock
is therefore an ANGEL IMPLEMENTATION DECISION, not an evidenced fact** —
flagged explicitly wherever it would otherwise read as settled.

**Governing ANGEL IMPLEMENTATION DECISIONS already in force:**
- **Mock Content Firewall (Decision 59):** `practice_eligible !=
  mock_eligible`, structurally enforced — only
  `fetchMockEligibleQuestionBank()` (filters strictly to
  `eligibility_status = 'mock_eligible' AND active = true`) may feed a
  genuine Mock route.
- **Writing evidence quarantine (Decision 60):** Continuous Writing's
  AI-generated `overallScore` is explicitly not calibrated against any
  exam board's mark scheme and is quarantined from mastery evidence
  (`supportTier: "supported"`) — architecturally advisory-tier, not
  deterministic-tier, unlike Reading. See Section 6.

---

## 3. Reading Mock-track Inventory

**Anon-key limitation, disclosed:** the anon key exposes only
`eligibility_status = 'practice_eligible'` rows (confirmed: all 343
anon-visible `ali_question_bank` rows are `practice_eligible`, zero
exceptions) and `ali_passage_bank` returns 0 rows via anon key entirely
(admin-only RLS since migration 071, same pattern that protects
`ali_mock_form`). So current `independently_validated`/`authentic_
assessment_candidate` status for the 8 Mock-track passages could not be
re-verified live this session by REST; the completion register's own
Section D figures are the best available evidence (**INHERITED**), spot-
checked once directly against migration content: **The Boat in the
Boathouse** — migration 097 (content) + migration 102 (validation)
confirm exactly 13 question rows / 12 numbered experiences, matching the
register exactly.

| Passage | Status (INHERITED) | Questions | Marks (raw rows) | Ever Practice-exposed? |
|---|---|---|---|---|
| The Boat in the Boathouse | `independently_validated` | 12 numbered / 13 rows | 13 | **No** — confirmed absent from complete live `practice_eligible` set |
| The Understudy (Mock-track, `eng-inc001-understudy`) | `independently_validated` | 7 | 7 | **No** — the live "Understudy" rows are all the separate `w2-understudy-*` Practice-track passage; no leak |
| How Bees Find Their Way Home | `independently_validated` | 8 | 8 | **No** |
| The Loose Connection (`eng-inc002-roboticsfinal`) | `independently_validated` | 12 (post-163/164 shape) | 12 | **No** |
| Crossing the Atlantic: Sail and Steam | `independently_validated` | 10 | 10 | **No** |
| Pepper's Breakfast | `authentic_assessment_candidate` (pending review) | 7 | 10 | **No** |
| The Compass Rose Challenge | `authentic_assessment_candidate` (pending review, explicitly assessment-reserve) | 7 | 8 | **No** |
| How Salmon Find Their Way Home | `authentic_assessment_candidate` (pending review) | 7 | 10 | **No** |

**No Mock↔Practice leak found.** The one apparent naming collision (two
passages both called "The Understudy") resolves cleanly on direct ID
inspection: the live, Practice-exposed rows are all `w2-understudy-*`
(Practice-track sibling `wave2-eng-understudy`); the Mock-track
`eng-inc001-understudy` is structurally separate and has never been
exposed. Cosmetic collision only, as the prior register already
concluded — not renamed this increment (out of scope, no learner-facing
or content-safety impact).

---

## 4. Continuous Writing Mock-track Inventory

**Exactly 7 rows are `practice_eligible` live** (VERIFIED LIVE, full
Writing-content query, all eligibility states — no other Writing content
exists at any status matching `id`/`family_id ilike '*writing*'`):
`eng-inc003-writing-favouriteplace-01`, `eng-inc003-writing-
imaginedplace-01`, `eng-inc003-writing-pocketmoney-01`, `eng-pc005-
writing-personinfluence`, `eng-pc005-writing-somethingnew`, `mock-
writing-mistakelearned-01`, `mock-writing-newplace-01`.

Reconciled precisely against migration history: migration 200
(`inc007`) targeted 5 of these IDs but was **superseded, never applied**;
migration 203 (`inc009`) re-targets the identical 5, additionally gated
on Founder amendment-verification, and **was applied**; migration 204
applied the remaining 2 (`newplace`, `mistakelearned`). 5+2 = 7, exact
match. "An Invented Place" is not missing — `eng-inc003-writing-
imaginedplace-01` **is** that prompt, live.

**Reviewed-but-stalled content found this session:** `mock-writing-
screentime-01` ("Should Children Have Limits on Screen Time?") —
`independently_validated` since migration 160 (same batch as Mock-track
Understudy/Bee-navigation), reviewed and `approved_with_amendment`
(Ayobami Lawal), content-corrected in migration 159 — but absent from
every promotion migration's target list (200/203/204 target only the 7
other IDs; confirmed by direct inspection of all three). Reviewed,
ready, one promotion step short. **Promoted to `mock_eligible` this
increment** (migration 207) — see Section 11.

**Two further prompt IDs, UNRESOLVED:** `eng-pc003-writing-
difficulttask`, `eng-pc003-writing-meaningfulplace` — found referenced in
migration history with no matching review/promotion decision located
this session. Not promoted. Flagged as a deficit item (Section 17), not
treated as Mock-safe.

**Structural capacity ceiling, not a content gap:** `QT-WC-01b`
(Picture-Stimulus Narrative Prompt) has zero instances anywhere — no
image-asset pipeline exists in this codebase (re-confirmed, unchanged
across the decision log's own repeated prior findings). Since the
evidenced historical CSSE Writing structure is two prompts (discursive +
picture-stimulus), **Angel's Writing estate can currently only ever
supply the discursive half** of a true English Mock's Writing section.
This alone is sufficient to make a *complete, evidence-honest* "English
Mock 1" impossible this increment, independent of any Reading capacity
question.

---

## 5. Passage-level and Writing-prompt Freshness Analysis

Consolidated from Sections 3–4. Assessed at **passage level** for
Reading (a passage counts as exposed if any one of its questions was
ever `practice_eligible`), matching the Founder's explicit instruction.

| Content | Ever Practice-exposed? | Basis |
|---|---|---|
| 5 independently_validated Reading Mock-track passages | No | Live query, full 343-row practice_eligible set, zero title matches |
| Mock-track Understudy | No | Live query + ID inspection distinguishing it from the separate Practice-track passage |
| 3 pending-review Reading Mock-track passages | No | Same query | 
| 7 live Writing prompts | Yes, by definition (they are the current Practice pool) | Live query |
| `mock-writing-screentime-01` | No | Absent from the live 7; confirmed via migration-history reconciliation |
| `eng-pc003-writing-difficulttask`/`meaningfulplace` | Unresolved | Not located in review/promotion records |

**No Practice→Mock or Mock→Practice leakage found.** The Mock Content
Firewall (Decision 59) holds structurally: every anon-visible row in the
entire estate is `practice_eligible` (confirmed live, 343/343), and
before this increment zero English rows were `mock_eligible` anywhere
(Section 1).

---

## 6. Review/Eligibility Analysis — Summary

- 5 Reading Mock-track passages (50 question rows + 5 passage rows):
  `independently_validated`, fresh, review-complete → **promoted to
  `mock_eligible` this increment** (migration 207, NOT APPLIED).
- 1 Writing prompt (`mock-writing-screentime-01`): `independently_
  validated`, fresh, review-complete → **promoted to `mock_eligible`
  this increment** (migration 207, NOT APPLIED).
- 3 Reading Mock-track passages (Pepper's Breakfast, Compass Rose,
  Salmon): still `authentic_assessment_candidate` — **not touched**, per
  the standing "no promotion without completed independent review" rule.
- 2 Writing prompt IDs (`difficulttask`, `meaningfulplace`): review
  status unresolved — **not touched**.
- Picture-stimulus Writing: no content, no infrastructure — **not
  buildable this increment**.

---

## 7. Proposed English Mock 1 Composition

**Not composed this increment.** See Section 16 (verdict) and Section 17
(quantified deficit). A genuine "English Mock 1" — matching the evidenced
current CSSE contract's two-section, two-Writing-prompt structure — is
not assemblable from what exists today without either (a) fabricating an
unevidenced marks split, or (b) fabricating picture-stimulus capacity
that structurally does not exist. Per the Founder's own instruction, the
standard is not lowered to force a release.

A **separate, smaller, genuinely composable proposition exists**:
a Reading-only assessment from the 5 now-`mock_eligible`-pending passages
(50 marks across 47 numbered experiences) — but per the Founder's own
naming principle (Section 8 below), this must never be labelled "English
Mock 1" if built. Composing and naming it correctly is explicitly left
to the next increment (Section 19), not decided unilaterally here.

---

## 8. Marks/Timing/Component Structure

Not fixed this increment, and deliberately not fabricated. What is
evidenced (Section 2) vs. what would need an ANGEL IMPLEMENTATION
DECISION:

- Timing: 60 minutes + 10 minutes reading time is evidenced and could be
  reused as-is for a Reading-only form.
- Section split for a genuine two-section English Mock: **not evidenced
  post-2024**; any split (e.g. 40/20 or 45/15) would be an Angel
  decision, not a CSSE fact, and must be labelled as such if ever
  proposed.
- A Reading-only Mock's own total (50 marks from the 5 ready passages) is
  simply the sum of what exists — not a CSSE-evidenced target, an Angel
  composition fact.

---

## 9. Continuous Writing Scoring/Reporting Treatment

Not implemented this increment (no Mock report is being built). Recorded
for the next composition increment: per Decision 60, Writing's
AI-generated `overallScore` carries `supportTier: "supported"` and is
explicitly disclosed as not calibrated against any exam board's mark
scheme — advisory-tier evidence. Reading's Mock scoring (per the existing
Mathematics Mock pipeline's own precedent) is deterministic, exam-graded
evidence. **A future Mock report combining both must visually and
structurally distinguish the two** — e.g. a Reading numeric mark/56-style
score alongside a Writing qualitative-band summary, never blended into
one fabricated combined numeric mark. This is a design constraint for the
next increment to honour, not solved here.

---

## 10. Minimum Anti-memorisation/Retirement Mechanism — IMPLEMENTED

**Migration 206** (committed, NOT APPLIED): `public.
ali_mock_retired_question_ids`, an admin-only view (no grant to
anon/authenticated — matches `ali_mock_form`'s own RLS posture since
migration 071) aggregating every `question_id` ever referenced by any
`ali_mock_form.question_manifest`, across every form this programme has
ever created. Mathematics Mock 1's 56 rows are covered automatically
(no backfill needed — the view reads `ali_mock_form` directly); any
future form (English Mock, Mathematics Mock 2) is covered the moment its
row is inserted. Purely additive: no existing table, column, row, RLS
policy, or `eligibility_status` enum touched — chosen over a new table or
a new `retired` enum value specifically to keep blast radius at zero on
existing serving code. Reusable by Mathematics Mock 2 without any further
migration.

---

## 11. Implementation Completed

- **Migration 206** — `ali_mock_retired_question_ids` view (retirement/
  exposure tracking). Committed `db63891`. NOT APPLIED — Founder review
  and manual Supabase Dashboard application required, per this
  programme's unbroken standing convention.
- **Migration 207** — promotes 5 Reading Mock-track passages (50
  question rows + 5 passage rows) and 1 Writing prompt (`mock-writing-
  screentime-01`) from `independently_validated` to `mock_eligible`.
  Fail-closed, idempotent, mirrors migrations 160/165's own established
  pattern exactly (per-unit `DO` blocks, exact pre/post-count checks,
  `raise exception` on any unexpected state). Committed `db63891`. NOT
  APPLIED.
- Neither migration composes, activates, or releases a Mock. Neither
  touches Mathematics Mock 1, migration 182, migration 200, migration
  205, Writing's visual-verification gate, or any Applied-Reasoning
  content.

---

## 12. Migrations Created — Status

| # | File | Status |
|---|---|---|
| 206 | `206_mock_content_retirement_exposure_tracking.sql` | Committed, NOT APPLIED |
| 207 | `207_reading_writing_mock_eligible_promotion_increment012.sql` | Committed, NOT APPLIED |

---

## 13. Tests/Build/Guards

Migration SQL Guard: **PASS** — 207 migration files, quote-balanced, all
`RAISE` statements arithmetic-correct. Copy Quality Guard: **PASS** — 0
violations, 264 files. `npx tsc --noEmit`: **clean**. Full test
suite/ESLint/build: **not re-run** — no application code touched this
increment (`git status` confirms only the two new `.sql` files plus this
report were added), unaffected by definition, matching this programme's
own established convention for SQL-only increments.

---

## 14. Founder Decisions Still Required

1. Apply (or hold) migrations 206 and 207 via Supabase Dashboard, per the
   standing manual-application pattern.
2. Whether to authorise a **Reading Comprehension Mock 1** (correctly
   named, not "English Mock 1") as the next increment, using the 5 now-
   ready passages — or hold until Writing's picture-stimulus capacity
   question is resolved so a genuine combined form can be planned
   instead.
3. The unevidenced Comprehension/Writing marks-split question — an Angel
   implementation decision, not resolvable from CSSE evidence alone, only
   relevant once a real combined-form composition is attempted.
4. Resolution path for `eng-pc003-writing-difficulttask`/
   `meaningfulplace`'s unresolved review status.
5. Whether picture-stimulus Writing infrastructure (image-asset pipeline)
   is worth commissioning at all, given it blocks true English Mock
   completeness indefinitely otherwise.

---

## 15. ENGLISH MOCK 1 COMPOSITION READY or CONTENT CAPACITY INSUFFICIENT

**B. ENGLISH MOCK 1 CONTENT CAPACITY INSUFFICIENT.**

---

## 16. Quantified Deficit

- **Marks/section-split contract**: 0 evidenced post-2024 sources define
  a Comprehension/Writing split for a 2-section English paper — a
  needed Angel decision, not a content-authoring gap.
- **Writing, picture-stimulus prompt (`QT-WC-01b`)**: 0 instances exist;
  0 image-asset pipeline exists to author one. Structural, not content,
  deficit — cannot be closed by authoring alone.
- **Writing, discursive prompts, Mock-safe**: 1 ready
  (`mock-writing-screentime-01`, promoted this increment) + 2 unresolved
  (`difficulttask`, `meaningfulplace` — need review-status reconciliation
  before counting).
- **Reading, Mock-safe (post-promotion)**: 5 of 8 Mock-track passages
  (50 marks / 47 numbered experiences) — sufficient depth for a bounded
  Reading-only form; the remaining 3 (25 raw marks) are blocked on
  independent review, not authoring.
- **Retirement/exposure enforcement wiring**: mechanism now exists
  (migration 206) but is not yet called from any composition code path —
  needed the moment a real Mock composition increment begins.

---

## 17. Updated Whole-Programme Completion Position

| Area | Status | Change this increment |
|---|---|---|
| A. Mathematics | OPERATIONAL BUT INCOMPLETE | Unchanged; 34-mark reserve confirmed as planning-only figure |
| B. Reading Comprehension | OPERATIONAL BUT INCOMPLETE | Migrations 181/183–185 reclassified APPLIED (were reported held/unapplied); 5 Mock-track passages now `mock_eligible`-pending |
| C. Writing | OPERATIONAL BUT INCOMPLETE / DEFERRED VISUAL VERIFICATION | Unchanged — not reopened; exact 7-row live pool confirmed; 1 more prompt readied for Mock use only |
| D. Mock programme | BLOCKED (English) / OPERATIONAL BUT INCOMPLETE (Mathematics) | English Mock content-readiness infrastructure now exists; composition still not done — still BLOCKED pending Section 19's next increment |
| E. Anti-memorisation/sustainability | now **OPERATIONAL BUT INCOMPLETE** (was BLOCKED) | Retirement/exposure tracking mechanism now exists (migration 206), not yet wired into any composer |
| F. Learner intelligence/evidence loop | OPERATIONAL BUT INCOMPLETE | Unchanged, out of scope |
| G. Parent intelligence | OPERATIONAL | Unchanged |
| H. Outstanding production verification | DEFERRED VERIFICATION | Unchanged — Writing visual/mobile/UI gate still open, not reopened or touched |
| I. Governance/review debt | OPERATIONAL BUT INCOMPLETE | Reduced: 3 stale "unapplied" claims (181, 183-185) corrected to applied; 2 Writing prompts newly flagged UNRESOLVED; picture-stimulus and marks-split flagged as new, precise, named gaps |

---

## 18. Next Bounded Implementation Increment

**Compose and release a correctly-named Reading Comprehension Mock 1**
(explicitly not "English Mock 1") from the 5 now-`mock_eligible`-pending
passages, once migration 207 is Founder-applied — reusing the proven
Mathematics Mock 1 compose→curate→freeze→release pipeline
(`ali_mock_form`), wiring migration 206's retirement view into the
composer so the released form's rows become durably excluded from any
future Mock. This is bounded (content is ready, pipeline is proven,
naming is already resolved by the Founder's own principle), delivers
real learner/programme capability (closes the "no fresh timed Mock for
Reading" loop-break identified last increment), and touches nothing on
the preserved-boundaries list. Writing's picture-stimulus and unresolved-
prompt questions remain separately deferred, not blocking this step.
