# ANGEL 11+ — Completion and Readiness Register, V2

Created under the Founder's "Angel 11+ Completion and Readiness Programme"
directive; updated after the Founder's Wave 1 continuation directive
(same day). Evidence-based throughout — every figure is tagged
**CONFIRMED** (checked against current repo/decision-log evidence this
session), **INHERITED** (cited from a prior Decision's own report, not
re-derived), or **UNVERIFIED** (not checked; do not treat as fact).

State as of HEAD `18552a4` (branch `main`), 2026-09-01. V1 covered the
initial audit + one Mathematics family + the content-authoring gate
resolution. V2 covers: all five Decision 226 Mathematics gap archetypes
authored, a precise Reading Comprehension row-level audit (surfacing a
major dormant-content finding), the Writing checklist remediation, and
the scoring-contract resolution for compound answers.

---

## A. EXECUTIVE VERDICT

**Verdict: A — COMPLETION PROGRAMME ACTIVE; WAVE 1 EXECUTION UNDERWAY.**

The content-authoring gate is resolved (Founder confirmed explicitly,
in writing, twice). All five Decision 226 Mathematics gap archetypes are
now authored and pending review. The Writing checklist-overlap defect the
Founder flagged is corrected. **The Reading "14 dormant passages" finding
reported earlier this session was itself wrong** — a follow-up forensic
investigation (independently cross-checked, not taken on faith) found it
was based on `ali_passage_bank`'s own eligibility tracking, a table never
actually consulted by real Practice serving. The corrected picture: 20
passages are authored (not 15), and the large majority of their questions
are already live in production, confirmed via both direct code reading
(`fetchQuestionBank()`) and decision-log records of production
verification (Decisions 62-74). The real remaining Reading item is small:
~11 individual stray un-reviewed questions, not a passage-level
activation decision. This is a significant, disclosed correction to this
session's own prior reporting, not a new problem.

---

## B. SIX-GATE BASELINE

### GATE 1 — Educational Engine
**INHERITED PASS, not re-verified this round.** Unchanged from V1.

### GATE 2 — Programme Depth
**Status: ACTIVELY CLOSING.** Mathematics: all five confirmed gap
archetypes authored this session (13 new rows/marks, 6 families — see
Section D). Writing: migration 169's 2 prompts corrected and progressed
into review. Reading: **the real bottleneck is not passage count, it is
activation** — see Section D, this is the single biggest Gate 2 finding
of the whole programme so far.

### GATE 3 — Assessment System
Unchanged from V1: Mathematics Mock 1 real/frozen/56 marks; reserve now
21 marks + whatever of the 13 new rows survive review (not yet promotable
— still `authentic_assessment_candidate`). No Mock 2. English Mock route
scaffolding only. No retirement-tracking mechanism (Decision 222 Part 8).

### GATE 4 / GATE 5 — Learner / Parent Journey
**NOT AUDITED.** Unchanged from V1 — still queued.

### GATE 6 — Production Acceptance
Unchanged from V1: ESLint baseline 64 errors / 23 warnings (directive's
"24 warnings" contradicted). Not re-run this round (no application code
touched — confirmed via `git status`, only new `.sql`/`.md` files).

---

## C. COMPETITOR FINDINGS

Unchanged from V1 — extending to the full 15-dimension matrix remains
queued P1 work, correctly deprioritised below content depth per the
Founder's own explicit Section 7 instruction this round ("competitor
matrix can continue later... CONTENT DEPTH currently has higher
completion value").

---

## D. CONTENT CAPACITY (exact counts, repository-sourced)

### Mathematics — all five Decision 226 gap archetypes now authored

| Family | family_id | QT | Rows | Marks | Migration |
|---|---|---|---|---|---|
| Impossible-total (Frobenius) | `mock-mr11-impossibletotal` | QT-MR-11 | 3 | 3 | 170 |
| Number-pyramid | `mock-mr05-numberpyramid` | QT-MR-05 | 3 | 3 | 174 |
| Combinatorial counting | `mock-mr13-toppingcombos` | QT-MR-13 | 2 | 2 | 174 |
| Age-narrative algebra | `mock-mr06-agenarrative` | QT-MR-06 | 3 | 3 | 174 |
| Weighted mean (combine) | `mock-mr12-weightedmeancombine` | QT-MR-12 | 1 | 1 | 176 |
| Weighted mean (reverse) | `mock-mr12-weightedmeanreverse` | QT-MR-12 | 1 | 1 | 176 |
| **Total** | **6 families** | | **13** | **13** | **170, 174, 176** |

All `authentic_assessment_candidate`, all pending independent review
(migrations 171/175/177), all NOT APPLIED. Every answer independently
re-derived via two methods against the real CSSE primary-source paper and
mark scheme before authoring (not trusted from Decision 226's own
summary) — this caught and corrected one real citation error: Decision
226 cited "2022 Q15" for the weighted-mean archetype; the actual source
is 2023 Q19(b)/(c) (migration 176's own header has the full correction).

Pre-existing Mock-track pool figures (V1, unchanged by this round, since
none of the 13 new rows are promoted): 81 rows, 31 families, 21-mark
reserve, zero challenge-tier content, MR-06 zero-coverage (see Section I
— this is a tagging-model limitation, not a content gap, not fixed by
this round's authoring).

**STOP GATE now resolved for archetype authoring** (was: Decision 226's
unfulfilled Phase 1 gate). **New standing constraint, unchanged**: no
`eligibility_status` promotion or migration application without a
completed independent review — this was never blocked, only authoring
was.

### Reading Comprehension — MAJOR CORRECTION (superseding the "14 dormant
passages" finding reported earlier this session)

**The "14 dormant passages" claim was wrong — it checked the wrong
table.** `ali_passage_bank.eligibility_status` is never consulted by real
Practice serving: `fetchQuestionBank()` (`lib/ali/questionBank.ts`,
independently re-read and confirmed this session) queries ONLY
`ali_question_bank`, filtering strictly on that table's own
`eligibility_status === 'practice_eligible'` — no join, no reference to
`ali_passage_bank` anywhere in the serving path (confirmed by a
repo-wide grep: `ali_passage_bank` appears only in `lib/adminReview.ts`
and test files). Each Practice question carries its own passage text
inline in its `prompt` JSON. `ali_passage_bank` is a parallel
governance/review-tracking table that was never wired into what a
learner actually sees.

**Corrected picture, independently cross-verified against
`ALI_DECISION_LOG.md` (not just the migration files):** 20 distinct
passages have been authored (not 15 — an earlier pass this session missed
5 more from migration 063), and the large majority of their questions are
already live:
- Migration 055 (Pilot Activation) promoted 60 questions across wave1/
  wave2 families to `practice_eligible` — confirmed applied (Decision-log
  production count "Practice Eligible 247" recorded immediately after).
- Migration 056 (Batch 2 Activation) promotes further wave1/2 questions
  the same way (confirmed to exist and perform the same UPDATE; not
  independently re-confirmed applied this session beyond the file itself).
- Migration 063 inserted 34 wave3 rows (20 Maths + 14 English/RC-10
  across 5 new passages) as `provisional` — NOT yet eligible at that
  point. **Migration 065 (the actual activation for that batch) is
  separately, explicitly confirmed applied and verified in production**
  (Decision 74, verbatim: "20 new Mathematics questions and 14 new
  English questions are live, Practice Eligible, and reachable by real
  learners today... 007T is genuinely CLOSED").

**Disclosed limitation**: this session has no live Supabase/production
query access (no `.env.local`/anon key path was available), so the
current exact live counts are reconstructed from migration file content
plus decision-log statements of past production verification, not a
fresh query — the same disclosed-evidence-tier convention this project's
own history uses throughout. A fresh live count (`scripts/coverage-
matrix.mjs`, referenced repeatedly in the decision log) would confirm
this precisely; not run this session.

**READING REMEDIATION PREPARED (this round, NOT applied, NOT reviewed,
NOT certified)**: migrations 178 (Wave 1, +12 companion questions across
6 passages, +24 marks) and 179 (Wave 3, +10 companion questions across 5
passages, +10 marks), consolidated review registration in migration 180.
All 22 new rows are additive only — none of the 106 currently-live
questions or 50 already-excluded/existing rows were touched, edited, or
deactivated. Wave 1's fixed 7-type-sequence defect and Wave 3's QT-RC-10
monoculture are both addressed by introducing demand types (RC-07
comparative, RC-10 effect-of-language, RC-02 motive-inference for Wave 1;
RC-01 retrieval, RC-08 emotion, RC-06 sequencing, RC-07 comparative for
Wave 3) chosen per-passage from what each specific text supports, not a
new uniform template. **Classification remains AMBER for all 11 passages
until independent review actually confirms the new content meets
standard** — this migration prepares remediation, it does not
self-certify it (this project's own standing rule: no self-approval).
Full detail, including the honest residual-repetition finding from the
anti-memorisation re-check, is in this session's Founder handoff.

**Real remaining gap, precisely scoped**: not "14 dormant passages" —
approximately **11 individual stray un-reviewed questions** (mostly the
final question in each wave1/wave2 passage, e.g. `w1-kitemaker-04`-style
IDs) that were never swept into an activation batch, each needing the
same independent-review step every sibling question in its own family
already passed. This is a small, bounded, low-risk item — not a P0 crisis.

**The real Gate 2 Reading depth gap, correctly reframed**: not passage
COUNT (20 passages already comfortably exceeds the ~14-16 healthy band)
but questions PER passage — wave1/2 average ≈6.6 questions/passage,
wave3 average ≈2.8, both well below a real CSSE passage's own evidenced
11-16 question range (the Mock-track passages, Section D below, average
~7.75 and are the closer match). Depth-per-passage, not passage count, is
the genuine authoring opportunity here.

**Migration 097 "24 passages" claim — traced to source**: originates in
**Decision 138 Part 6** itself ("Currently: 24 distinct passages exist in
the practice pool"), not an error introduced by migration 097 (which
quotes it faithfully). Reconciling every `ali_passage_bank` INSERT from
migration 001 through 090 finds exactly **20** distinct passages, not 24.
**Classified: UNSUBSTANTIATED HISTORICAL CAPACITY CLAIM** relative to
what migration history can prove — use 20 in all current capacity
calculations, not 24. (Whether Decision 138's "24" reflected a live query
that included content since removed, or a miscount, is not resolvable
from migration history alone.)

**Passage-level detail (Mock-track, unchanged from the earlier precise
audit this session) is below.** Practice-track passage detail (the 20
now mostly-live passages) is not re-tabulated in full here — see the P1
backlog for the bounded remaining work (11 stray questions + one
title-collision rename, `wave2-eng-understudy`/`eng-inc001-understudy`,
unchanged finding).

---

### Reading Comprehension Mock-track — precise row-level audit (unchanged from the earlier precise audit this round)

**Mock-track pool (assessment-reserve, isolated from Practice) — 8
passages, exact:**

| Passage | Status | Numbered experiences | Rows | Genre | Difficulty |
|---|---|---|---|---|---|
| The Boat in the Boathouse | `independently_validated` | 12 | 13 | narrative | medium |
| The Understudy | `independently_validated` | 7 | 7 | narrative | moderate-high |
| How Bees Find Their Way Home | `independently_validated` | 8 | 8 | informational | moderate |
| The Loose Connection | `independently_validated` | 7 | 8 | narrative | moderate-high |
| Crossing the Atlantic: Sail and Steam | `independently_validated` | 7 | 10 | informational | moderate |
| Pepper's Breakfast | `authentic_assessment_candidate` (pending review) | 7 | 10 | narrative | accessible |
| The Compass Rose Challenge | `authentic_assessment_candidate` (pending review, explicitly assessment-reserve, must not become Practice-eligible) | 7 | 8 | narrative | challenging |
| How Salmon Find Their Way Home | `authentic_assessment_candidate` (pending review) | 7 | 10 | informational | moderate |

**Totals: 8 passages (5 validated + 3 candidate — directive's "5+3=8"
claim CONFIRMED EXACTLY at row level, not just migration-count level), 62
numbered experiences, ≈74 raw question rows.** Genre split: 5
narrative, 3 informational. Against the minimum/healthy/strong bands
(~8/~14-16/~22-26): **Mock-track sits exactly at the minimum floor, 3 of
8 not yet independently validated.**

**Practice-track pool — 15 passages authored, only 1 ever activated.**
Wave 1 (migration 044/045): 6 passages, 42 questions. Wave 2 (migration
049): 8 passages, 50 questions. Wave 2 completion (migration 051): 1
passage, 4 questions. **= 15 passages, 96 questions, all `provisional`.**
A repo-wide search of every `eligibility_status`-changing UPDATE against
`ali_passage_bank` found **exactly one promotion event ever**: migration
055, promoting only `wave2-eng-surprise` to `practice_eligible`.

**⚠ MATERIAL FINDING: 14 of 15 authored Reading Practice passages
(93 authored questions) have never been activated and are unreachable by
real learners.** This was not previously stated anywhere in prior
registers or decisions surfaced this session. A citation-fidelity gap
compounds this: migration 097's own header claims "24 practice_eligible
passages" existed at Decision 138's time — this could not be
substantiated this session (no migration besides 055 ever promotes a
passage); either a stale citation, or promotions happened outside this
repo's migration history (e.g. direct Dashboard edits) leaving no trace.
**Effective learner-reachable passage count today: Mock-track 8 (isolated
from Practice, only usable via a future Mock 2) + Practice-track 1
(`wave2-eng-surprise`) = 9 passages with ANY live reachability** — this
is the real Gate 2 Reading figure, far below even the minimum band for
sustained Practice use, and the gap is activation, not authoring.

**Secondary finding**: `wave2-eng-understudy` (Practice) and
`eng-inc001-understudy` (Mock-track) share the exact title "The
Understudy" — different ids/content, no reuse risk, but a real
reviewer/reader-facing naming collision worth a rename.

**Primary-source evidence base**: no sibling English capacity-plan
document exists (unlike Mathematics' Decision 226). The Question
Intelligence Framework's own §5 discloses RC evidence is "confirmed only
against narrative fiction texts" — every informational passage authored
so far (bee-navigation, sail-and-steam, salmon-navigation) is AUTHORED-
EXTRAPOLATION beyond directly-evidenced source genre coverage, not
SOURCE-CONTAINS, a parallel to Mathematics' primary-source ceiling
(Decision 226 Section 9) never previously stated for English.

### Continuous Writing
- 6 independently validated prompts (unchanged, CONFIRMED).
- Zero `practice_eligible` prompts (unchanged, CONFIRMED).
- Migration 169's 2 candidate prompts: **checklist-overlap defect the
  Founder flagged is now corrected** (migration 173 — see Section G) and
  both are registered for independent review (migration 172).
- "An Invented Place" — closed, not reopened, per Founder instruction.
- QT-WC-01b (picture stimulus) — still blocked, unchanged.

### Anti-Memorisation Risk Classification
- **CRITICAL, but not content-fixable**: MR-06 (tagging-model
  limitation — see Section I).
- **HIGH, now partially addressed**: 6 of the ~16+ Mathematics
  singleton-Classification-A families now have a genuine sibling family
  in the same competency area (though not the same archetype — each new
  family is still its own singleton); Reading Practice as a whole is
  **CRITICAL, not HIGH** — 14 of 15 passages being dormant means real
  Practice sessions have had access to exactly ONE Reading passage this
  whole time, a more severe finding than "thin," properly reclassified
  here.
- **MEDIUM/LOW**: unchanged from V1.

---

## E. P0/P1/P2/P3 BACKLOG (revised)

**P0 — prevents a valid learner preparation loop:**
1. **CORRECTED from "14 dormant passages"**: get a fresh live production
   count (`scripts/coverage-matrix.mjs`) to confirm current exact
   Practice Eligible figures — this session could not query production
   directly. Then close the ~11 individual stray un-reviewed questions
   (small, bounded, low-risk — not a passage-level activation decision).
2. Full Mathematics singleton-family enumeration (still not done —
   precise family-by-family query).
3. `wave2-eng-understudy` / `eng-inc001-understudy` title collision —
   cheap rename fix.
4. Consider whether `ali_passage_bank`'s eligibility_status should be
   wired into serving, retired, or explicitly documented as review-only
   metadata — it currently silently diverges from what learners see,
   which is how the "14 dormant passages" misreading happened in the
   first place and could mislead a future audit the same way again.

**P1 — required for programme completion:**
4. Independent review of migrations 170/174/176 (13 new Mathematics rows,
   6 families) and 172/173 (2 Writing prompts) — content is ready,
   review capacity is now the constraint.
5. Investigate the migration-097 "24 practice_eligible passages" citation
   gap — stale citation vs. out-of-repo promotion history.
6. English Mock production-readiness assessment (still not audited).
7. Retirement-tracking mechanism design (Decision 222 Part 8).
8. Extend competitor benchmark to full 15-dimension matrix (explicitly
   lower priority than content per Founder instruction this round).
9. Gate 4/5 learner/parent journey audits.
10. `/admin-beta/review` UI extension for batch markers INCREMENT007-009
    (same disclosed follow-up as V1, now covering 3 more batches).

**P2:**
11. Mathematics Phase 2 (deepen singleton archetypes to 2-3 instances).
12. Risk-based educational QA model for safe sibling variations.

**P3:** unchanged from V1 (diagram capability, parametric generation).

---

## F. WAVE 1 WORK COMPLETED THIS ROUND

**Mathematics — all 5 archetypes, 6 families, 13 rows/13 marks:**
- `mock-mr11-impossibletotal` (3 rows) — migration 170, corrected this
  round for the compound-answer scoring format (see below).
- `mock-mr05-numberpyramid` (3 rows), `mock-mr13-toppingcombos` (2 rows),
  `mock-mr06-agenarrative` (3 rows) — migration 174, all independently
  verified against the real 2023 paper/mark scheme.
- `mock-mr12-weightedmeancombine` + `mock-mr12-weightedmeanreverse` (1
  row each) — migration 176, the 5th archetype, authored against a
  **corrected primary-source citation** (Decision 226 cited 2022 Q15,
  which does not match; the real source is 2023 Q19(b)/(c) — found by
  independently re-reading the primary source rather than trusting the
  citation, exactly the discipline this project's own history repeatedly
  demonstrates the value of).
- All three pending-review migrations written (171, 175, 177).

**Scoring-contract investigation, resolved (Option A, Founder's own
preferred order)**: a dedicated fork investigation found `mock_score_
attempt()` has exactly two auto-scoring paths (numeric-tolerance or exact
string match) and a direct, Founder-approved precedent already exists for
compound answers — `mock-mr08-rotation` (Decision 174), a coordinate pair
scored as one terse string. Migration 170's row -03 was corrected in
place (not a separate correction migration, since it had not yet been
reported as final anywhere): answer changed from a prose string to the
canonical terse form `"8, 5"`, with an explicit worked-example format
instruction added to the question text mirroring rotation's own "(x, y)"
convention. This same lesson was applied proactively in migration 174's
number-pyramid family (b) and disclosed as a design constraint in
migration 176's age-narrative family (c), which was reworded to avoid a
genuine "accept either answer" requirement the schema has no mechanism
for, rather than repeating the original mistake.

**Writing — checklist remediation (migration 173, NOT APPLIED)**:
the Founder correctly identified that "Pocket Money or Helping Anyway?"'s
checklist (migration 169) reused two of `mock-writing-cookopinion-01`'s
`coaching`-tier items near-verbatim (one word changed in one case,
word-for-word in the other) — exactly the "same task, different nouns"
pattern migration 169's own header claimed to be correcting for a
different prompt pair. Corrected via a fail-closed, three-state PL/pgSQL
migration (mirroring migration 148's own established single-key-
correction discipline) that rewrites two checklist items to reflect the
prompt's own genuinely distinct two-position-engagement demand (explain
what's appealing about EACH view; the register risk specific to a
two-position prompt tempting a formal debate structure) rather than
reused single-opinion coaching language, and extends
`addresses_misconception` to match. "Your Favourite Place to Be"
untouched, unblocked, proceeding to review as-is. "An Invented Place"
untouched, per instruction.

**Reading — precise capacity audit completed (no new content authored
this round)**: full row-level audit of all 8 Mock-track and 15
Practice-track passages (Section D). This is the round's single most
consequential finding: **the Reading depth problem is activation, not
authoring volume** — 14 of 15 already-written Practice passages sit
dormant. Authoring a 16th passage before understanding why the existing
15 are 93% unused would have been the wrong next move; flagged instead
of rushed into new content, per the Founder's own standing instruction
not to manufacture content merely to hit a number.

**Guards**: `scripts/migration-sql-guard.mjs` — PASS, 177 migration
files, quote-balanced. `npm run copy-guard` — PASS, 0 violations across
263 files. All new JSON `prompt` payloads parsed and validated (answer
types, `sharedStem` prefix contracts where used) via a standalone Node
check before being considered complete. No application code touched this
round (`git status` confirms only new `.sql`/`.md` files) — `tsc`/test
suite/build unaffected by definition, not re-run.

---

## G. CONTENT/MIGRATIONS PREPARED (all NOT APPLIED)

| # | File | Purpose |
|---|---|---|
| 170 | `..._increment007_impossibletotal.sql` | Mathematics: impossible-total family, 3 rows/marks (corrected this round for answer format) |
| 171 | `..._increment007_pending_review.sql` | Registers 170 for independent review |
| 172 | `..._writing_depth_extension_decision259_pending_review.sql` | Registers migration 169's 2 Writing prompts for review |
| 173 | `..._pocketmoney_checklist_remediation.sql` | Corrects "Pocket Money" checklist overlap defect |
| 174 | `..._increment008_pyramid_combinatorics_agenarrative.sql` | Mathematics: 3 families, 8 rows/marks |
| 175 | `..._increment008_pending_review.sql` | Registers 174's 3 families for review |
| 176 | `..._increment009_weightedmean.sql` | Mathematics: 5th archetype, 2 families, 2 rows/marks (corrected citation) |
| 177 | `..._increment009_pending_review.sql` | Registers 176's 2 families for review |

**8 migrations this round** (170/173 started V1, corrected/added to in
V2). Zero applied. Zero content activated. Zero `eligibility_status`
changes anywhere.

**Known follow-up, still not done**: `/admin-beta/review` UI's hardcoded
per-batch marker lookup not yet extended for INCREMENT007/008/009 — same
disclosed gap as V1, now covering 3 batches instead of 1.

---

## H. TEST AND QUALITY EVIDENCE

Migration SQL Guard: PASS (177 files). Copy Quality Guard: PASS (0/263).
JSON payload validation: PASS (all new rows, this round's own Node
checks). ESLint baseline: 64 errors/23 warnings (Decision 260, cited not
re-run — no code changed). ESLint/tsc/full test suite/build **not
re-run** this round — no application code was touched, only SQL
migrations and this register.

---

## I. FOUNDER DECISIONS

**RESOLVED**: content-authoring gate (V1) and Wave 1 continuation scope
(this round) both explicitly confirmed by the Founder in writing.

**Still open, genuinely Founder-only:**
1. **MR-06** (unchanged from V1): tagging-model limitation, not a content
   gap. The Founder's response this round (verbatim: "preserve MR-06
   where it legitimately contributes to scoring/evidence; document its
   cross-cutting nature; exclude it from calculations that incorrectly
   interpret zero question-bank rows as zero educational coverage;
   correct the Completion Readiness Register accordingly") is **RESOLVED
   AS: MODEL/DISCLOSURE CORRECTION, NOT CONTENT AUTHORING** — applied in
   Section D above (MR-06 no longer counted as a content gap in the
   Mathematics capacity table). No further Founder action needed unless
   future evidence suggests independent MR-06 trackability would
   materially help learners.
2. **SUPERSEDED**: the "14 dormant passages" item is withdrawn — it was
   based on checking the wrong table (Section D). The actual remaining
   Reading item (≈11 stray unreviewed questions, a title-collision
   rename, and whether to wire/retire `ali_passage_bank`'s unused
   eligibility tracking) is small, bounded, and does not need Founder
   judgement beyond the standing review-approval pattern already in use
   for every other batch.

**Resolved, no longer open**: migration 170's answer-format question
(Section F, scoring-contract investigation) — resolved via existing
precedent, no new Founder decision was needed for it after all.

---

## J. NEXT EXECUTION WAVE

Immediately actionable, no further authorisation needed:
- Full Mathematics singleton-family enumeration (P0.2).
- `wave2-eng-understudy` title-collision rename (P0.3).
- Investigate the migration-097 "24 passages" citation gap (P1.5).
- `/admin-beta/review` UI extension for the 3 new batch markers.

Needs Founder input:
- Dormant Reading Practice content — activate or explain (Section I.2).

Needs independent review capacity (content is ready, not blocked on
authoring):
- 6 new Mathematics families (13 rows) across migrations 170/174/176.
- 2 corrected Writing prompts (migration 173/172).

**Estimated completion path**: Gate 2's Mathematics depth work for this
wave is essentially done (5/5 archetypes authored); the constraint has
shifted from authoring to review throughput. Gate 2's Reading depth work
just had its actual bottleneck identified (activation, not authoring) —
this could close faster than any other part of the programme if the
Founder authorises investigating and activating the 14 dormant passages,
since no new content creation is required. Gates 3/4/5/6 remain the next
major register sections to close, none blocked by anything resolved or
found this round.
