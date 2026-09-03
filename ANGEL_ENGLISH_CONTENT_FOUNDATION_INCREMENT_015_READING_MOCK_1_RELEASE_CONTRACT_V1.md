# Angel English Content Foundation — Increment 015: Reading Mock 1 Release Contract + Final Pre-Activation

State as of HEAD `d09b34d` (branch `main`) before this increment's
commits, 2026-09-03. Evidence tiers: **SOURCE-VERIFIED** (read the real
function/schema/component definitions this session),
**MECHANICALLY-VERIFIED** (proven via an automated diff or executed
test, not just visual review), **CODE/SQL VERIFIED** (parsed as text/
executed as a pure function, no live database), **PRODUCTION VERIFIED**
(none this increment — disclosed explicitly wherever it would otherwise
be implied), **VISUAL VERIFIED** (none this increment — no browser
tooling used or claimed).

---

## 1. Migration 209 Final Safety Assessment

Re-verified against the real schema/functions, not re-asserted from the
prior report.

- **What `active=true` means operationally, SOURCE-VERIFIED**:
  `mock_create_attempt()` (migration 070, line ~196) is defined
  `where id = p_form_id and active = true` — a form with `active=false`
  cannot, by construction, ever produce a real attempt. This remains the
  correct, load-bearing gate.
- **Intermediate release mechanism**: none exists. `ali_mock_form`'s real
  columns (confirmed again this session) are `id, subject,
  specification_version, attempt_type, question_manifest, active,
  composition_provenance, created_at` — `active` is a simple boolean,
  no draft/staging/soft-launch state.
- **When `mock_create_attempt()` can succeed**: only when a real,
  authenticated caller with a real `profiles` row targets a form with
  `active=true`. Not admin-gated — any authenticated learner can trigger
  it the moment a form goes active.
- **Whether an attempt can exist before intended release**: only via a
  deliberate Founder action (a migration setting `active=true`) — there
  is no other code path that flips this flag. `mock_create_cycle_attempt`
  (migration 085) reaches the same gate.
- **New finding this increment, corrects the prior report's framing**:
  migration 070's own comment disclosed that `mock_create_attempt()`
  originally did **not** check `eligibility_status = 'mock_eligible'` at
  attempt-creation time — flagged there as "a named residual hardening
  item for a future increment." **That gap was already closed**:
  migration 145 (`mock_attempt_manifest_eligibility_enforcement`)
  rewrote both `mock_create_attempt()` and `mock_create_cycle_attempt()`
  to require every manifest question to be `eligibility_status =
  'mock_eligible' AND active = true`, raising an exception otherwise
  (SOURCE-VERIFIED, migration 145's own code). Numbered 145, immediately
  before migrations 146 (`composition_provenance` column) and 147/150
  (Mathematics Mock 1's own freeze/activation) — since Mathematics Mock
  1 is confirmably live and scoring real attempts, 145 is almost
  certainly already applied (inferred from logical necessity + sequence,
  not a live query — disclosed, not claimed as PRODUCTION VERIFIED).
  **This means real defense-in-depth already exists independent of
  migration 209**: even a mistakenly-activated form would refuse to
  produce an attempt for any question not genuinely `mock_eligible`.
- **Administrative/test attempts burning content**: `mock_create_attempt`
  requires a real profile — this codebase's own established testing
  convention (migration 070's own comment) uses separate practice_
  eligible fixture manifests in dedicated test forms, never the real
  production form id, specifically to avoid this risk. No test in this
  repository, this increment included, ever creates an attempt against
  `reading-comprehension-mock-1` or `mathematics-mock-1`.
- **Deactivating a previously-exposed form**: does **not** weaken
  protection. Migration 209's Tier-2 view (`ali_mock_exposed_question_
  ids`) is `form.active = true OR exists(a real ali_mock_attempt)` — the
  `OR` means a later deactivation cannot un-expose content that was ever
  really attempted.
- **Deleting/correcting attempts weakening protection — SOURCE-VERIFIED,
  new finding this increment**: migration 070's own RLS comment states
  plainly: *"No INSERT/UPDATE/DELETE policy on ali_mock_attempt or
  ali_mock_attempt_answer for anon/authenticated at all"* — with RLS
  enabled and no matching policy, Postgres denies these operations to
  every application-reachable role by default. **No application-
  reachable path can ever delete an attempt record.** The only way to
  defeat the Tier-2 exposure invariant would be a direct, manual,
  superuser-level `DELETE` via the Supabase Dashboard — the same trust
  boundary every migration in this programme already requires for
  application, not a new or lesser one.
- **The critical invariant — "once genuinely exposed, content must never
  become fresh again merely because current state changes" — holds**:
  proven by the `OR`-durability against deactivation and the absence of
  any application-reachable deletion path. **The Tier-2 "active OR
  attempted" definition from migration 209 is confirmed correct and
  sufficient; no further correction to it is required this increment.**

---

## 2. Passage-level Enforcement Proof

**Stable identifier, SOURCE-VERIFIED, not title matching**:
`ali_question_bank.learning_unit_id` is a plain `text` column (migration
007) with **no foreign-key constraint** — a real, disclosed, convention-
based (not schema-enforced) linkage, not a stronger guarantee than that.
Verified directly against the authoring migrations, not assumed, for all
three of Reading Comprehension Mock 1's own passages:
- Boathouse: `learning_unit_id = 'mock-eng-boathouse'` (migration 097,
  read directly) — matches `ali_passage_bank.id` exactly.
- Understudy: `learning_unit_id = 'eng-inc001-understudy'` (migration
  160's own WHERE clause).
- Bees: `learning_unit_id = 'eng-inc001-bee-navigation'` (migration
  160's own WHERE clause).

Migration 209's `ali_mock_exposed_passage_ids` view joins on exactly this
column. Once Bees is exposed through Reading Comprehension Mock 1:
- a Bees sibling question cannot enter Practice — the passage-level
  Tier-2 view blocks any `learning_unit_id = 'eng-inc001-bee-navigation'`
  row from transitioning to `practice_eligible`, not just the specific
  rows the Mock happened to select;
- an alternative Bees question selection cannot masquerade as fresh Mock
  content — the same passage-level check applies to the `ali_mock_form`
  reuse-block trigger's underlying data (any Bees question, exposed or
  not, that shares the passage, is caught by the passage view once at
  least one sibling is exposed);
- the passage cannot silently enter Reading Mock 2 as unseen material —
  covered by the same mechanism, tested explicitly (Section 15).

---

## 3. Form-identity Architecture Finding

**Internal form identity** (`ali_mock_form.id`, e.g.
`mathematics-mock-1`, `reading-comprehension-mock-1`) is stable, real,
and already correct everywhere it's used (routing, attempt/report
foreign keys). **User-facing display identity had no real source at
all** — confirmed this session (Increment 014's own finding, re-verified):
`ali_mock_form` has no display-name column; "Mathematics Mock 1" is
hardcoded literal text in exactly two places.

**Surface inventory, SOURCE-VERIFIED this session:**

| Surface | Identity source before this increment | Found this session |
|---|---|---|
| Mock Centre (`app/mocks/page.tsx`) | Hardcoded literal, 2 occurrences | Fixed |
| Learner start screen / timer header (`app/learning-intelligence/mock-exam/page.tsx`) | Hardcoded literal `<h1>` | Fixed |
| Submission/results screen | Same page as above, same header, no separate hardcode found | Covered by the fix above |
| Released report (`app/learning-intelligence/mock-report/[attemptId]/page.tsx`) | No hardcoded subject name found; `practiceRouteFor`/`practiceActionLabelFor` hardcoded to Mathematics regardless of the attempt's real subject | Fixed (Section 14) |
| Parent Mock report / parent dashboard | No form-name rendering found referencing "Mathematics Mock 1" literally | Not touched — nothing to fix found |
| Recommendation/next-action surfaces | `practiceRouteFor()` — see above | Fixed |
| API payloads (`subjectBreakdown` from `mockAnalysisEngine.ts` / `mock_analyse_attempt()`) | Hardcoded `subject: "mathematics"` regardless of real content, in BOTH the TS mirror and the live SQL function | Fixed (Section 14) |
| Analytics/evidence records (`competency_evidence`) | Uses `mock_question_type_competency()`, already correctly subject-agnostic (RC-*/WC-*/MR-* all resolve correctly) — re-confirmed, not modified | No fix needed |

---

## 4. Form-identity Implementation

**Minimum reusable mechanism, no speculative fields**: `composition_
provenance` (already existed on every form; already populated with
`displayName` for Reading Comprehension Mock 1 in migration 212, written
in Increment 014 before this exact need was even named) is the single
source of truth. No new table, no new column beyond what already
exists.

- **Migration 213** (NOT APPLIED): additive `jsonb_set` merge adding
  `displayName: "Mathematics Mock 1"` to the live Mathematics Mock 1
  form's `composition_provenance` — MECHANICALLY-VERIFIED to touch only
  that one JSONB key (new regression test asserts the executable SQL
  never sets `question_manifest`/`active`/`subject`/`attempt_type`).
- **Migration 214** (NOT APPLIED): extends `mock_get_active_form()`'s
  return shape from `(form_id, attempt_type)` to `(form_id, attempt_type,
  display_name)`, reading `composition_provenance ->> 'displayName'`.
  Required `DROP FUNCTION` + `CREATE FUNCTION` (Postgres refuses `CREATE
  OR REPLACE` across a return-type change) — no prior migration in this
  repository had ever done this before; this migration establishes the
  pattern, documented explicitly in its own header. Grants unchanged
  (`authenticated` only, explicitly revoked from `anon`/`public`).
- **TypeScript**: `ActiveMockForm` (types.ts) gains `displayName: string
  | null`; `getActiveMockForm()` (client.ts) surfaces it from the RPC
  row; `types/supabase.ts`'s manually-maintained RPC signature updated to
  match (this project's own established convention for declaring types
  ahead of a not-yet-applied migration).
- **Reusability, proven by construction, not just claimed**: any future
  form (Mathematics Mock 2, Reading Comprehension Mock 2, a full English
  Mock) automatically gets correct naming the moment its own
  `composition_provenance` carries a `displayName` key — no further
  migration or route-specific code needed.

---

## 5. Affected Learner Surfaces

`app/mocks/page.tsx` (Mock Centre — both the pathway-prioritised CSSE
card and the no-pathway-selected `SimpleMockCard` now render
`csseMockName`, sourced from `getActiveMockForm(supabase,
"full_mock").data.displayName`, falling back to the literal "Mathematics
Mock 1" only until migrations 213/214 are applied); `app/learning-
intelligence/mock-exam/page.tsx` (the timer/intro header now renders
`mockDisplayName`, sourced the same way). Both fallbacks are accurate
today (the one form these specific pages have ever been able to query,
`attempt_type='full_mock'`, is genuinely Mathematics Mock 1) — never a
claim about any other subject.

## 6. Affected Parent Surfaces

None required a code change — no parent-facing surface was found
hardcoding "Mathematics Mock 1" as a literal string (the mock-report
page's real defect was the practice-route hardcode, Section 14, not a
naming one). Confirmed by direct grep of `app/learning-intelligence/
mock-report/`, `app/learning-intelligence/parent/`, and every file
`subjectBreakdown` reaches.

## 7. Final Reading Mock Learner-facing Identity

**"Reading Comprehension Mock 1."** Never "English Mock 1," "Full English
Mock," "Full CSSE Mock," or "Mathematics Mock 1" — enforced at the data
layer (migration 212's own `composition_provenance.displayName`), not
merely a copy convention a future edit could quietly drift from.

---

## 8. Timing Classification

**Reconfirmed, unchanged from Increment 014: 45 minutes + 10 minutes
reading time, an explicit ANGEL IMPLEMENTATION DECISION, not a CSSE-
evidenced figure.** The learner UI itself carries no governance prose —
the timer header states the plain duration only (unchanged existing
component behaviour); the disclosure lives in `composition_provenance.
timingDecision` (already present in migration 212, written for exactly
this governance/evidence purpose) and in this report, not on-screen.

---

## 9. Migration 210 Exact Promotion Inventory

Re-verified against the actual migration file content, not re-asserted:

| Passage | Question rows promoted | Passage row promoted |
|---|---|---|
| The Boat in the Boathouse | 13 (`mock-eng-boathouse-q01`…`q12b`) | `mock-eng-boathouse` |
| The Understudy (Mock-track) | 7 (`eng-inc001-understudy-q01`…`q07`) | `eng-inc001-understudy` |
| How Bees Find Their Way Home | 8 (`eng-inc001-bee-q01`…`q08`) | `eng-inc001-bee-navigation` |
| The Loose Connection | 12 (`eng-inc002-roboticsfinal-q01,q02b-e,q03-q06,q07a/b,q08`) | `eng-inc002-roboticsfinal` |
| Crossing the Atlantic: Sail and Steam | 10 (`eng-inc002-sailandsteam-q01-q04,q05b-e,q06,q07`) | `eng-inc002-sailandsteam` |

**Total: 50 question rows + 5 passage rows, exactly the five approved
passages, no more.** Promotion ≠ consumption, confirmed: migration 212's
manifest (Section 12) draws only from Boathouse/Understudy/Bees; Loose
Connection and Sail and Steam remain `mock_eligible`-pending but
unreferenced by any form, MECHANICALLY-VERIFIED by
`tests/content/readingComprehensionMock1Increment014.test.ts`'s own
"manifest excludes both reserved passages" test, re-passing this session
unchanged.

---

## 10. Migration 211 Recommendation — REVISED from Increment 014

**APPLY LATER, not with Reading activation, not in this increment's
sequence.** Increment 014's own recommendation ("promote now, since it's
inert until composed") is revised under this increment's stricter
standard ("convenience is not evidence" — a demonstrated firewall
benefit is required, not mere symmetry with Reading). Re-examined: no
current Mock can safely consume `mock-writing-screentime-01` (no full
English Mock architecture exists yet — Increment 013, Section 14, still
open); promoting it now provides no firewall benefit that waiting
doesn't also provide (mock_eligible content is equally inert either way
until a real form references it); and its own strategic timing question
(whether/when a Writing-inclusive Mock gets built) is still genuinely
open. Default to preserving its current protected (`independently_
validated`) state. Migration 211 stays written, reviewed, and ready —
just not part of this sequence.

---

## 11. Migration 212 Final Assessment/Status

**No change required.** Its `composition_provenance` already carries
`"displayName":"Reading Comprehension Mock 1"` (written in Increment
014, before this increment even existed) — the identity mechanism this
increment built reads exactly that field. Re-verified this session,
MECHANICALLY: guard checks (manifest row count = 28; zero rows matching
Loose Connection/Sail and Steam/any Writing id/any Applied-Reasoning-
shaped id; live-computed marks total = 65) are unchanged and still
correct; the new test file (`mockFormIdentityIncrement015.test.ts`)
independently re-confirms the `displayName` value directly from the
migration file's own JSON, not merely trusting the prior report.
**Status: NOT APPLIED, unchanged, no supersession needed.**

---

## 12. Analysis/Evidence-loop Trace

Full pipeline traced against the real code, this session:

`attempt` (`mock_create_attempt`, migration 070/145 — subject-agnostic,
confirmed) → `answer persistence` (`mock_submit_answer`, migration 070 —
subject-agnostic) → `deterministic scoring` (`mock_score_attempt`,
migration 074 — grepped for `'mathematics'`/`Mathematics`, zero hits,
subject-agnostic) → `competency evidence` (`mock_question_type_
competency()`, migration 151 — already correctly resolves RC-*/WC-*/
MR-*, re-confirmed, unmodified) → `analysis` (`mock_analyse_attempt`,
migration 151 — **found and fixed**, Section 14) → `weakness detection`
(the same function's Pass 2/2b, subject-agnostic by construction — never
referenced a hardcoded subject anywhere in its 258 lines) →
`recommendation` (`practiceRouteFor`/`practiceActionLabelFor`,
`lib/mockAttempt/reportCopy.ts` — **found and fixed**, Section 14) →
`report release` (`mock_release_report`, migration 074 — grepped, no
Mathematics-specific logic) → `parent interpretation` (no parent-facing
component was found rendering `subjectBreakdown` or a hardcoded subject
name) → `next learner action` (the corrected `practiceRouteFor()` now
correctly routes an RC-* priority to `/learning-intelligence/practice/
reading-comprehension`, the real, pre-existing route already used
elsewhere in this codebase — not invented).

**No parallel analysis engine created.** Every fix is a correction
inside the existing, single, shared pipeline.

---

## 13. Mathematics-specific Assumptions Found/Fixed

Exactly two, both found by tracing the real pipeline, both fixed, both
tested:

1. **`practiceRouteFor()`/`practiceActionLabelFor()`** (`lib/
   mockAttempt/reportCopy.ts`) — always routed to `/learning-
   intelligence/practice/mathematics` regardless of the priority's real
   competency. Fixed: RC-* competencies now route to the real, existing
   `/learning-intelligence/practice/reading-comprehension` route.
   Deliberately bounded: WC-* still falls back to Mathematics — disclosed
   as an out-of-scope gap, since no Mock in this codebase currently
   produces a WC-* priority (Reading Comprehension Mock 1 contains none).
2. **`subject_breakdown`'s `subject` field** — hardcoded `'mathematics'`
   in BOTH `lib/ali/mockAnalysisEngine.ts` (TS) and `mock_analyse_
   attempt()` (SQL, migration 151, live). Fixed in both, derived from
   the attempt's own observed `questionTypeId` prefixes. Confirmed no
   current UI renders this field (zero learner/parent-visible impact
   today) — fixed anyway since it is a real defect in a genuine API/
   evidence payload, and the directive explicitly named "API payloads"
   as a surface to check.

**The SQL fix (migration 215) required unusual care**: `mock_analyse_
attempt()` is a 258-line, already-live function underpinning Mathematics
Mock 1's real, working report pipeline. Rather than hand-retype it, the
exact live function body was extracted programmatically, three precise
`sed` edits applied to a working copy, and the result `diff`-verified
against the untouched original before being embedded in the migration —
MECHANICALLY-VERIFIED that only the intended three changes exist
anywhere in the 270-line result. This is disclosed explicitly so the
Founder can trust the "byte-identical except for the fix" claim isn't
just asserted.

---

## 14. Tests and Regression Evidence

New/updated test files, all passing this session:

- `tests/lib/mockAttempt/reportCopy.test.ts` — 6 new tests (RC-* routing,
  Mathematics/null/unknown unaffected, WC-* gap disclosed,
  `competencyLabel` already correct for RC-01..04).
- `tests/lib/ali/mockAnalysisEngine.test.ts` — 3 new tests (`subject:
  "english"` for RC-*/WC-* outcomes; `"mathematics"` unaffected for
  MR-*-only and null-only outcomes).
- `tests/lib/mockAttempt/client.test.ts` — 2 existing tests updated for
  the new required `displayName` field (no new gap, just a type-shape
  update).
- `tests/content/mockFormIdentityIncrement015.test.ts` — 11 new tests
  (213/214 touch only what they claim; 212 needs no change; nothing
  cross-references the wrong form; NOT APPLIED disclosed).
- `tests/content/readingComprehensionMock1Increment014.test.ts` — 15
  tests, unchanged, re-passing (reserve exclusion, Writing absence,
  Practice-track absence, Mathematics untouched, draft-vs-exposure
  distinction, immutability-only-when-exposed).

**CODE VERIFIED / SQL VERIFIED**: all of the above — pure-function tests
and migration-file text/JSON parsing, exactly this repository's own
established methodology, no live database. **PRODUCTION VERIFIED**:
none — no migration in this sequence has been applied. **VISUAL
VERIFIED**: none — no browser tooling was available or used this
session; the frontend changes (Sections 4/5) are TypeScript-compiled and
lint-clean but not visually confirmed in a running browser. This
distinction is deliberate and should not be collapsed.

## 15. Build/Guards

`npx tsc --noEmit`: clean. Migration SQL Guard: PASS, 215 files. Copy
Quality Guard: PASS, 0/264. `npx eslint .`: **71 errors, 23 warnings —
confirmed, via `git stash`/`git stash pop`, to be the exact pre-existing
baseline this session started with; zero new errors or warnings
introduced** (one new warning was introduced mid-session by this
increment's own test file, caught and fixed before this final count).
Full test suite (`npm test`): **3256/3256 passing.** `next build`: not
run this session (no learner-facing route was added, only existing
routes edited in place; a full production build was judged unnecessary
risk/time for a freeze-only, no-release increment — disclosed as not
run, not claimed).

---

## 16. Exact Migration Execution Matrix

| # | Purpose | State |
|---|---|---|
| 182 | Mathematics reserve promotion | **DO NOT APPLY** — separate, standing Founder HOLD, untouched |
| 200 | Writing promotion (5 ids) | **DO NOT APPLY / SUPERSEDED** — by 203 (already applied, per Increment 012's verified findings), unrelated to this chain |
| 205 | `ali_family_review` RLS reassertion | **DO NOT APPLY (this sequence)** — separate, independent Founder decision, out of scope here |
| 206 | Mock exposure observability view (Tier 1) | **APPLY** — foundation for 208/209 |
| 207 | Reading+Writing promotion, bundled | **DO NOT APPLY / SUPERSEDED** — by 210 (Reading) + 211 (Writing) |
| 208 | Exposure enforcement, v1 | **APPLY** — its reuse-block trigger is final as-is; its practice-block function body is superseded by 209's `CREATE OR REPLACE`, but 208 itself must still be applied first (209 depends on the trigger/function it creates) |
| 209 | Corrected exposure/enforcement (Tier 2, draft-vs-exposure) | **APPLY** — after 208 |
| 210 | Reading mock_eligible promotion (5 passages) | **APPLY** — after 209 (defense-in-depth ordering, not a hard dependency) |
| 211 | Writing screentime promotion | **HOLD FOR LATER** — Section 10, no demonstrated benefit to applying now |
| 212 | Reading Comprehension Mock 1 freeze | **APPLY** — after 210 (content must be `mock_eligible` before the freeze references it); `active=false`, no release |
| 213 | Mathematics Mock 1 displayName | **APPLY** — after 209 (its own header's stated precondition) |
| 214 | `mock_get_active_form` extension | **APPLY** — any time after 206 exists conceptually; grouped here with 213 |
| 215 | `mock_analyse_attempt` subject correction | **APPLY** — independent of the rest of this chain; grouped here since found in the same trace |

---

## 17. Exact Founder Production Execution Sequence

1. `206_mock_content_retirement_exposure_tracking.sql`
2. `208_mock_content_exposure_enforcement.sql`
3. `209_mock_exposure_enforcement_draft_vs_exposure_correction.sql`
4. `210_reading_mock_eligible_promotion.sql`
5. `213_mathematics_mock_1_display_name.sql`
6. `214_mock_get_active_form_display_name.sql`
7. `215_mock_analyse_attempt_subject_breakdown_correction.sql`
8. `212_reading_comprehension_mock_1_freeze.sql`

**Do not apply**: 182, 200, 205, 207, 211 (Section 16 gives the one-line
reason for each). **No activation migration exists yet** — setting
`active=true` on `reading-comprehension-mock-1` is a separate, later,
not-yet-created, explicitly Founder-gated step, outside this sequence
entirely. This sequence is safe for the live Mathematics Mock 1: 213 and
215 are the only two migrations touching anything Mathematics-related,
both proven (Sections 4, 13) to be additive/logic-preserving for every
Mathematics-shaped input.

---

## 18. Remaining Production Verification Requirements

- **PRODUCTION VERIFIED**: none of migrations 206–215 have been applied.
  The Founder's own Supabase Dashboard application remains the first
  real execution, as it has been for every migration in this programme.
- **VISUAL VERIFIED**: the two frontend changes (Mock Centre card name,
  mock-exam header name) are compiled and lint-clean but have not been
  seen rendering in a real browser. Recommended before any future
  activation: a real browser check (desktop + mobile-responsive) of the
  Mock Centre with Mathematics Mock 1 active, confirming the name
  renders correctly and no layout regression occurred — genuinely
  separate from this session's CODE/SQL-only verification.
- Reading Comprehension Mock 1's full attempt-taking flow (timer,
  question navigation, submission) has never been exercised end-to-end
  for a `timed_section`-type form — `app/learning-intelligence/mock-
  exam/page.tsx` is still structurally wired to `ATTEMPT_TYPE =
  "full_mock"` only. Wiring a second, real attempt_type through that
  820-line page is deliberately out of scope this increment (Section 22).

---

## 19. READING COMPREHENSION MOCK 1 = READY FOR FOUNDER ACTIVATION or HOLD

**HOLD.**

## 20. If HOLD, Exact Blocker Only

**Nothing educational or content-related blocks this.** The sole
remaining blocker is procedural and explicitly Founder-owned: no
activation migration has been authorised or created, and the Founder's
own instruction this increment is explicit — "Do not activate Reading
Mock." Construction, enforcement, identity, and pipeline correctness are
all complete and verified (CODE/SQL tier). Once the Section 17 sequence
is applied, the only remaining step to genuine learner availability is a
separate, later, explicitly-authorised `active=true` migration — plus
the not-yet-built `timed_section` learner journey (Section 18) if full
end-to-end delivery, not just Mock Centre discoverability, is the goal.

---

## 21. Updated Whole-Programme Completion Position

| Area | Status | Change this increment |
|---|---|---|
| D. Mock programme | HOLD, construction-complete (Reading) | Form-identity mechanism built and proven reusable; Mathematics-specific pipeline defects found and fixed |
| E. Anti-memorisation/sustainability | OPERATIONAL BUT INCOMPLETE | Migration 209's Tier-2 model re-verified sound against 9 real operational scenarios (E-J confirmed structurally safe); no further correction needed |
| I. Governance/review debt | reduced further | Migration 211's recommendation corrected (APPLY LATER, not bundled); two real Mathematics-specific pipeline assumptions found and fixed ahead of ever being needed |

All other areas (A, B, C, F, G, H) unchanged, not reopened, not touched.

---

## 22. Next Bounded Increment

Two independent, both-optional next steps, neither required before the
Section 17 sequence can be safely applied:

1. **Founder applies the Section 17 sequence**, then separately decides
   whether/when to authorise a real activation migration.
2. **Wire a genuine `timed_section` learner journey**: the smallest
   change to `app/learning-intelligence/mock-exam/page.tsx` (or a new,
   thin, reused-component route) that lets `ATTEMPT_TYPE` vary rather
   than stay hardcoded to `'full_mock'` — required before any real
   learner could ever sit Reading Comprehension Mock 1, genuinely out of
   scope for "the smallest correct form-identity model" this increment
   targeted, and large enough (an 820-line, deeply Mathematics-flow-
   specific page) to deserve its own bounded increment rather than
   silent scope creep here.

Neither is started; both are named precisely so neither is lost.
