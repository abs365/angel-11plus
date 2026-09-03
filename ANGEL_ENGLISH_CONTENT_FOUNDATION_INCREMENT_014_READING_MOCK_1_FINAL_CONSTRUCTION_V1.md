# Angel English Content Foundation — Increment 014: Reading Comprehension Mock 1 Final Construction + Firewall Verification

State as of HEAD `b396bda` (branch `main`) before this increment's commit,
2026-09-03. Evidence tiers as established in Increments 012/013, plus
**SOURCE-VERIFIED** (confirmed this session by reading the actual
function/schema definitions this migration builds on, e.g.
`mock_create_attempt()`, `mock_get_active_form()`, `ali_mock_form`'s real
column list).

---

## 1. Migration 208 Lifecycle Assessment (Scenarios A–J)

| Scenario | 208 alone | Corrected (209) |
|---|---|---|
| A. Mathematics Mock 1, existing | Unaffected — 208 never mutates existing data | Unaffected — 209 is also purely additive; Mock 1's manifest is already immutable in practice (frozen since migration 147/150) and the new immutability trigger only *formalises* that, applying going forward |
| B. Reading Comprehension Mock 1, creation (freeze) | Would have been treated as instantly, permanently "exposed" the moment inserted — **wrong**, since `active=false` means no learner could ever reach it | Correctly treated as merely "claimed" (Tier 1) until genuinely activated or attempted (Tier 2) — see Section 2 |
| C. Form curation before release | 208's reuse-block trigger (unchanged) already permits this: editing a draft form's own manifest is not "reuse across forms," so it was never blocked | Unchanged, still correct |
| D. Freezing a form | Same INSERT path as migration 147 used; both 208 and 209's reuse-block trigger fire only on genuine cross-form overlap — freezing content that belongs to no other form succeeds | Unchanged |
| E. Learner attempt creation | **Confirmed unaffected structurally**: `mock_create_attempt()`/`mock_create_cycle_attempt()`/scoring/report-release functions (migrations 070/072/074) never write to `ali_question_bank` or `ali_mock_form` — grepped directly, zero matches — so neither trigger can ever fire during this flow | Unchanged |
| F. Scoring | Same as E — writes only to `ali_mock_attempt`/`ali_mock_attempt_answer` | Unchanged |
| G. Analysis | Same — `mockAnalysisEngine.ts` is a pure function over attempt data, no writes to the two triggered tables | Unchanged |
| H. Report release | Same as E — `mock_release_report()` writes to attempt/report tables only | Unchanged |
| I. Future Reading Mock 2 | 208's reuse-block trigger correctly refuses if Mock 2 tries to reuse a Mock-1-claimed question. **Real, disclosed operational risk found this session**: `mock_get_active_form(attempt_type)` (migration 072) returns only the single most-recent `active=true` row for a given `attempt_type`, silently, with no error, if two rows of the same type are ever both active — an existing latent property of this schema, not introduced by 208/209. Recommendation, not a schema change: never activate two forms of the same `attempt_type` simultaneously. |
| J. Future Mathematics Mock 2 | Same reuse-block protection applies automatically the moment Mock 2's content overlaps Mock 1's frozen manifest | Unchanged |

**Conclusion, corrected from Increment 013's own report**: 208's reuse-
block trigger (Scenario C/I/J protection) was already correct and needed
no change. Its *practice-eligible-block* trigger's exposure definition
was the actual defect — over-broad, treating drafting as if it were
release. Corrected in migration 209.

---

## 2. Draft vs. Exposure Behaviour

**Confirmed via direct source read** (not assumed): `mock_create_attempt()`
(migration 070, line ~196) is defined as `where id = p_form_id and
active = true` — a form with `active = false` **cannot**, by construction,
ever have produced a real attempt. This is the load-bearing fact behind
the corrected model:

```
allocated/protected  →  frozen              →  released/exposed        →  retired/protected
(a proposal doc,         (an ali_mock_form      (active=true, or a         (both triggers apply
 no DB row — this          row exists,            real ali_mock_attempt      permanently, forever)
 increment's own            active=false —          exists — Tier 2)
 Sections 5/12)             Tier 1 only)
```

- **Tier 1 (206's existing views, unchanged)**: any row ever referenced
  by any `ali_mock_form.question_manifest`. Used only to block a
  *different* form from reusing already-claimed content — cheap,
  harmless, and never blocks correcting the claiming form's own
  manifest.
- **Tier 2 (new, migration 209)**: `ali_mock_exposed_question_ids` /
  `ali_mock_exposed_passage_ids` — a form that is/was `active=true`, or
  has a real `ali_mock_attempt`. This, not Tier 1, now gates the
  practice-eligible-promotion block.

**Rollback/correction proven, not merely claimed**: a draft form
(`active=false`, no attempts) is invisible to the Tier-2 views by
construction — its manifest can be corrected by an ordinary Founder-run
migration `UPDATE` with zero resistance from either trigger, satisfying
"a safe governed way to correct a draft without permanently burning the
content" exactly. Once genuinely exposed, migration 209's new
`ali_block_exposed_form_manifest_mutation` trigger makes the manifest
permanently immutable — "freshness protection must be strict" — the
correct response to a post-exposure problem becomes a new Mock form, not
a mutated old one, matching this project's own established discipline
(new migrations correct old content; nothing already reported is
silently rewritten).

---

## 3. Bounded Enforcement Correction

**Migration 209** (committed, NOT APPLIED). Does not edit 206 or 208 in
place (both already reported as final). Adds: two Tier-2 views;
`CREATE OR REPLACE` on 208's practice-block function (same function/
trigger, corrected body — no re-attachment needed, a trigger always
executes its function's current definition); one new trigger
(`ali_mock_form_block_exposed_manifest_mutation`) for exposed-form
immutability.

**206's status**: NOT superseded — it remains the correct, unchanged Tier-1
data source both the original reuse-block trigger (208) and the
observability use case still depend on. **208's status**: NOT superseded
either — its reuse-block trigger (Scenario C/I/J) is correct and
untouched; only the *body* of its practice-block function is corrected,
via 209's `CREATE OR REPLACE`. All three (206, 208, 209) must be applied
together, in that order, for the enforcement model to be complete and
correct.

---

## 4. Final Mock Purpose

**Angel Reading Comprehension Mock 1**: a fresh, timed, unseen
assessment of Reading Comprehension, designed to measure transfer across
multiple passages and feed Angel's Educational Intelligence Engine
(Section 14). Its value is diagnostic quality — skill coverage, transfer,
genuine discrimination between learner ability levels — not a claim to
reproduce an unsupported, unevidenced CSSE marks split. It is explicitly
**not** English Mock 1, not a Full English Mock, not a Full CSSE Mock,
and not a statement about the current CSSE English paper's actual
component weighting.

---

## 5. Final Passage Allocation

Unchanged from Increment 013's proposal, now Founder-approved: **How
Bees Find Their Way Home → The Boat in the Boathouse → The Understudy**.
Loose Connection and Sail and Steam remain reserved (mock_eligible via
migration 210, but excluded from this form's manifest — guard-checked in
migration 212 itself, not merely asserted in prose).

## 6. Final Question Count

**28 questions** (27 numbered experiences — Boathouse's Q12 has two
lettered sub-parts, 12a/12b, counted as one experience with two scored
components, matching this codebase's own established convention).

## 7. Final Mark Total

**65 marks** — the real total of the three complete, unmodified source
passages. Not curated down. See Section 8 below for why.

## 8. Timing Decision and Evidence Basis

**45 minutes + 10 minutes reading time — explicit ANGEL IMPLEMENTATION
DECISION, not a CSSE-equivalent duration.** Reasoning, re-examined this
increment against the Founder's specific request not to invent a
CSSE-equivalent figure: Assessment Brain V1's own evidence gives 30
minutes for the historical Comprehension-only section (itself covering
an unstated but implied ~30-35 marks, per Observation 4's combined-
section figures). 65 marks is not a small extension of that — proportional
scaling (65/32.5 ≈ 2x) gives roughly 45-60 minutes as a defensible
working range; 45 minutes is the conservative end of that range, chosen
deliberately rather than the more generous 60, to keep completion demand
realistic for an 11+-aged learner sitting three full passages in one
session. This is disclosed as an estimate, not measured against any real
learner completing this exact form (no live testing was possible or
performed this session).

---

## 9. Difficulty Assessment (corrected and substantially expanded this increment)

**Reading load**: 1,718 words across three passages (627 + 570 + 521).

**Answer-writing load**: 28 responses, marks ranging 1-4 per question;
answer formats span single-word/short-phrase (TIER1/2), quotation-plus-
explanation (TIER3), ordered-list (TIER4), and multi-select tick-box
(TIER6) — genuine format variety, not repetitive.

**Cognitive load and competency distribution** (65 marks): evidence
26m/40%, inference 17m/26%, vocabulary 10m/15%, structure 7m/11% (plus
one further writer's-craft-adjacent question, Sail and Steam Q7, held in
the Mock 2 reserve, not this form).

**Difficulty progression — corrected finding, real new evidence this
increment**: Increment 013 checked only passage-level `content_
difficulty`/`reading_complexity` tags (uniformly `medium`/`moderate` or
`moderate-high` across all five Mock-track passages) and concluded no
easy tier existed. **That was incomplete.** This increment checked the
*question-level* `content_difficulty` field in `ali_question_bank`
directly (a separate, real per-row field, distinct from the passage-level
tag) and found genuine spread:

| Passage | Easy | Medium | Hard |
|---|---|---|---|
| Bees | 2 | 6 | 0 |
| Boathouse | 1 | 11 | 1 |
| Understudy | 2 | 4 | 1 |
| **Total (28 questions)** | **5 (18%)** | **21 (75%)** | **2 (7%)** |

Both passages open with an `easy`-tagged retrieval question (Bees Q1/Q2;
Understudy Q1/Q2), and both `hard`-tagged questions (Boathouse Q11,
Understudy Q7) are the same question type, `QT-RC-10` — a real, if
narrow, difficulty ceiling within the form.

## 10. Easy-tier Limitation Decision — CORRECTED, RESOLVED

**Increment 013's "no easy tier" finding is withdrawn as stated.** It was
based on passage-level tags only; the genuine per-question difficulty
field shows 5 of 28 questions (18%) are `easy`, appropriately front-
loaded as simple retrieval items at the start of two of the three
passages. **This does not cause an unreasonable floor effect.** No STOP
is warranted. The corrected, narrower finding worth preserving: no
passage as a *whole* is tagged easy/accessible (all three sit at
`content_difficulty: medium`, `reading_complexity: moderate`/
`moderate-high` at the passage level) — meaning a learner who struggles
with basic reading fluency, rather than with comprehension skill
specifically, has no maximally-gentle full passage to start on. This is
a real, secondary, disclosed limitation, not a blocking one — the
question-level easy items already provide genuine floor protection
within each passage.

## 11. Writer's-method Limitation Decision — DISCLOSED, PRESERVED, NOT AUTHORED

Confirmed unchanged from Increment 013: this specific 3-passage selection
carries no `TIER5_NAMED_COMPONENT_PLUS_EXPLANATION` (writer's-craft)
question — both instances that exist in the ready content estate (Loose
Connection Q8, Sail and Steam Q7) sit in the Mock 2 reserve set, not this
form. **Judged a secondary coverage limitation, not a validity-
threatening one**: evidence, inference, vocabulary, and structure are
all well-represented (Section 9); writer's-method is one competency among
several this codebase's own Question Intelligence Framework recognises,
and its absence from one specific 28-question form does not itself
invalidate the form's diagnostic value. Per the Founder's own
instruction — "do not force every competency into every Mock" — this gap
is disclosed and preserved for a future form (Reading Comprehension Mock
2, which already has two writer's-method-tagged questions available in
its own reserved content), not remediated by authoring new content this
increment.

---

## 12. Exact Frozen Form

**Migration 212** (committed, NOT APPLIED, NOT activated). Freezes,
exactly:
- `id`: `reading-comprehension-mock-1`
- Display name (external to the schema — see Section 15): "Reading
  Comprehension Mock 1"
- `subject`: `'english'` — matches the real check constraint
  (`'mathematics'`/`'english'`, migration 085) and migration 147's own
  precedent of setting a real subject for a genuinely subject-pure form;
  confirmed this session that setting it does not itself trigger any
  combined-cycle behaviour (that requires a separate, explicit
  `mock_create_cycle_attempt()` call this migration never makes)
- `attempt_type`: `'timed_section'` — a disclosed ANGEL IMPLEMENTATION
  DECISION, chosen specifically to avoid a real, confirmed collision risk
  with Mathematics Mock 1's hardcoded `ATTEMPT_TYPE = "full_mock"` query
  (Section 15)
- `question_manifest`: the exact 28 IDs (Section 6), each
  `{"question_id": ..., "section": "reading_comprehension"}`
- `active`: `false`
- `composition_provenance`: full JSON record — marks/skill/difficulty
  distributions, passage order and per-passage marks, the explicit
  timing-decision disclosure, and the explicit `reservedNotIncluded`
  list (Loose Connection, Sail and Steam, `mock-writing-screentime-01`)
- Guard checks built into the migration itself (not just asserted in
  this report): manifest row count = 28; zero rows matching Loose
  Connection/Sail and Steam/any Writing id/any Applied-Reasoning-shaped
  id; live-computed marks total from `ali_question_bank.prompt->>'marks'`
  equals 65 (re-derived at apply time, not merely trusted from the
  authored constant).
- **Scoring contract**: reuses the existing deterministic Reading answer-
  validation pipeline unchanged — no new scoring logic authored or
  proposed.
- **Release state**: `active = false`. Release/activation is a distinct,
  later, separately-authorised migration — not created this increment.
- **Report identity**: inherits Mathematics Mock 1's proven
  `ali_mock_attempt`/report architecture unmodified (Section 14) — a
  separate `form_id` automatically yields a separate attempt/report
  identity; no new tables, no new engine.

No synthetic filler content. No Practice questions (guard-checked). No
Writing prompt (guard-checked). No Loose Connection (guard-checked). No
Sail and Steam (guard-checked). No Applied Reasoning (guard-checked, and
none has ever existed in this codebase's Mock-track estate regardless).

---

## 13. Writing Screentime Allocation Decision

**Promote now, via a standalone migration (211), include in no Mock this
increment.** Reasoning: promotion to `mock_eligible` does not expose,
consume, or commit the content to anything (Decision 59's firewall means
`mock_eligible` alone is inert until a real, active form references it
and a learner attempts it) — so promoting it now removes a future
blocker at zero real cost, the same judgement already applied to the two
reserved Reading passages. But its actual *use* remains genuinely
undecided pending the still-open full-English-Mock architecture question
(Increment 013, Section 14) — deliberately not reopened this increment.
Migration 207 is split into 210 (Reading) + 211 (Writing) specifically so
the Founder can apply Reading firewall activation independently of the
still-open Writing allocation question — "explicit allocation over
bundled convenience."

---

## 14. Mock-analysis/Evidence-loop Verification

**No new engine built or proposed** — the Founder's instruction was to
prove reuse, not construct a parallel path. Confirmed via direct source
inspection: `mockAnalysisEngine.ts`, `mockScoringSimulation.ts`, and the
`mock_score_attempt()`/`mock_release_report()` SQL functions
(migration 074) operate purely on `ali_mock_attempt`/`ali_mock_attempt_
answer` rows and a form's own `question_manifest`/scored answers — none
of this logic is Mathematics-specific in any way that would need
duplicating for a Reading form; a new `form_id` with `subject = 'english'`
flows through the identical attempt → scoring → analysis → report
pipeline unmodified. The loop `attempt → scoring → competency evidence →
weakness detection → recommendation → parent interpretation → next
preparation` is therefore structurally provable to extend to Reading
Comprehension Mock 1 without new code — **not executed or observed live
this session** (no attempt exists yet; the form isn't even active), so
this is CODE/SQL VERIFIED (the pipeline's data-agnosticism is proven by
reading its actual implementation), not PRODUCTION VERIFIED (no real
attempt has ever run through it for this form).

---

## 15. Learner/Parent Naming Verification — real gap found, disclosed

**Confirmed, not assumed**: `ali_mock_form` has **no display-name column
at all** (its real columns: `id, subject, specification_version,
attempt_type, question_manifest, active, composition_provenance,
created_at`). "Mathematics Mock 1" is **hardcoded literal text** in two
places — `app/learning-intelligence/mock-exam/page.tsx:495` and
`app/mocks/page.tsx:280,332` — not derived from any form metadata.
`ATTEMPT_TYPE` is also hardcoded to `"full_mock"` in the mock-exam page,
and `getActiveMockForm()` queries `mock_get_active_form('full_mock')`
specifically.

**Consequence, stated plainly**: freezing this form (migration 212) is
**provably inert** with respect to the existing learner/parent UI — no
current page queries `attempt_type = 'timed_section'`, so nothing would
display it, misname it as "Mathematics Mock 1," or collide with Mock 1's
own query path. This is a *good* property for a freeze-only increment
(zero risk of misrepresentation), but it also means: **real learner-
facing release of this Mock, whenever authorised, will require actual
frontend work** — either a new route or generalising the existing
hardcoded pages to read a display name from `composition_provenance`
(which this migration already populates with `"displayName":"Reading
Comprehension Mock 1"` for exactly this future purpose) — not merely a
database activation flip. This is out of scope for this increment ("do
not broadly redesign Mock Centre") and is recorded as a real prerequisite
for release, not glossed over.

---

## 16. Anti-memorisation Regression Evidence

**CODE/SQL VERIFIED, NOT PRODUCTION VERIFIED** throughout — stated once
here to avoid repeating it at every line. New test file:
`tests/content/readingComprehensionMock1Increment014.test.ts`, 15 tests,
all passing (`npx tsx --test`, confirmed this session), parsing the real
migration SQL/JSON as text, matching this repository's own established
test methodology for migration content (no test in this codebase, this
file included, connects to a live database):

1. Manifest has exactly 28 unique rows across exactly the 3 named
   passages.
2. Manifest excludes both reserved passages.
3. Manifest contains no Continuous Writing content.
4. Manifest contains no Applied Reasoning content.
5. Manifest contains no Practice-track content (id-prefix check *and*
   an explicit check against all 7 known live `practice_eligible`
   Writing IDs).
6. `composition_provenance` totals are internally consistent.
7. The form is frozen `active=false` and migration 212 never sets
   `active=true`.
8. `attempt_type='timed_section'`, confirmed absent from the executable
   SQL as `'full_mock'`.
9. None of migrations 209–212 reference any Mathematics question id or
   the Mathematics Mock 1 form id.
10. Migration 210 promotes both reserved passages (held, not forgotten).
11. Migration 211 touches Writing only, no Reading content.
12. Migration 209's corrected function uses the narrow Tier-2 exposed
    views, not the broad Tier-1 views — proves the draft/exposure
    distinction is actually implemented, not just described.
13. The Tier-2 views' own definitions require `active=true` or a real
    attempt — structurally, not by assertion.
14. The new immutability trigger only raises inside its
    `v_was_exposed` branch — proves draft correction remains possible.
15. All four migrations disclose `NOT APPLIED` in their own header.

Full suite (`npm test`): **3235/3235 passing**, `tsc --noEmit` clean,
Migration SQL Guard PASS (212 files), Copy Quality Guard PASS (0/264) —
confirmed no regression anywhere else in the codebase.

**What these tests do NOT prove**: that the two triggers actually fire
correctly inside a real Postgres engine, that RLS behaves as designed
under concurrent access, or that `jsonb_array_elements`/`cross join
lateral` perform as expected at scale. No Docker, no local Postgres, no
service-role write access existed this session (same disclosed
limitation as Increment 013). Founder application via Supabase Dashboard
remains the first genuine production test.

---

## 17. Migrations Created and Status

| # | File | Status |
|---|---|---|
| 209 | `209_mock_exposure_enforcement_draft_vs_exposure_correction.sql` | Committed, NOT APPLIED |
| 210 | `210_reading_mock_eligible_promotion.sql` | Committed, NOT APPLIED |
| 211 | `211_writing_screentime_mock_eligible_promotion.sql` | Committed, NOT APPLIED |
| 212 | `212_reading_comprehension_mock_1_freeze.sql` | Committed, NOT APPLIED, NOT activated |

206, 207, 208 unchanged (still NOT APPLIED). 207 is now fully superseded
(both its Reading and Writing portions replaced, by 210 and 211
respectively) — **207 should not be applied.**

---

## 18. Exact Proposed Founder Execution Sequence

Strict dependency order — later migrations reference objects earlier
ones create:

1. **206** — `ali_mock_retired_question_ids`/`ali_mock_retired_passage_ids` (Tier-1 observability views)
2. **208** — enforcement triggers (initial version; its reuse-block trigger is final as-is)
3. **209** — Tier-2 exposed views + corrected practice-block function body + new immutability trigger
4. **210** — Reading mock_eligible promotion (5 passages)
5. **211** — Writing mock_eligible promotion (screentime, standalone)
6. **212** — Reading Comprehension Mock 1 freeze (`active=false`)

**Do not apply**: 182, 200, 205, 207 (all superseded or independently
held). **A separate, later, explicitly-authorised migration** — not yet
created — is required to set `active=true` on
`reading-comprehension-mock-1`; nothing in this sequence does that.

---

## 19. Tests/Build/Guards

`npm test`: 3235/3235 passing. `npx tsc --noEmit`: clean. Migration SQL
Guard: PASS, 212 files. Copy Quality Guard: PASS, 0/264. All confirmed by
direct execution this session, not assumed.

---

## 20. READING COMPREHENSION MOCK 1 = READY FOR FOUNDER ACTIVATION or HOLD

**HOLD** — precisely because the Founder's own directive requires it:
"Nothing is authorised for learner release yet." Construction is
complete, verified, tested, and frozen. The exact remaining step is
Founder application of migrations 206→208→209→210→211→212 (Section 18),
followed by a separate, later, explicitly-authorised activation migration
whenever release is genuinely decided — plus the frontend work disclosed
in Section 15, which release (not this increment) will require.

---

## 21. Remaining Whole-Programme Blockers

- Full English Mock: still CONTENT/ASSESSMENT-CONTRACT INCOMPLETE
  (Increment 013, Section 14 — unevidenced marks split;
  unconfirmed-not-blocking picture-stimulus question), untouched this
  increment.
- Frontend generalisation for Reading Comprehension Mock 1's eventual
  display (Section 15) — a genuine, newly-disclosed prerequisite for
  release, not yet started, correctly out of scope for a freeze-only
  increment.
- `eng-pc003-writing-difficulttask`/`meaningfulplace` — still unresolved
  review provenance (Increment 012/013), untouched.
- Reading Comprehension Mock 2 — content-ready (Loose Connection + Sail
  and Steam, 39 marks, both now `mock_eligible`-pending via migration
  210), not composed; a natural, bounded next-next increment once Mock 1
  is actually released and evidence starts coming back.
- `mock_get_active_form`'s silent-latest-wins behaviour when two forms
  share an `attempt_type` (Section 1, Scenario I) — a disclosed,
  pre-existing schema property, not a defect introduced here; worth a
  standing operational discipline (never activate two same-`attempt_type`
  forms at once), not a schema change.

---

## 22. Next Bounded Increment

**Once the Founder applies the Section 18 sequence and separately
authorises activation**: build the small, isolated frontend surface
Reading Comprehension Mock 1 actually needs to be discoverable and
correctly named to a learner (Section 15) — reusing
`getActiveMockForm(supabase, "timed_section")`, which already works
unmodified, and reading the display name from `composition_provenance`
rather than hardcoding a second literal string alongside "Mathematics
Mock 1." This is a small, bounded UI increment, not a Mock Centre
redesign — the two existing pages' *logic* (available/resumable/
submitted-attempt checks) already generalises; only the hardcoded name
and `ATTEMPT_TYPE` constant need to become form-driven. Still not a
release decision — that remains separately, explicitly Founder-gated.
