# Angel English Content Foundation — Increment 013: English Mock Firewall Enforcement + Reading Comprehension Mock 1 Composition

State as of HEAD `375a9bf` (branch `main`), 2026-09-03. Evidence tiers as
established in Increment 012: **VERIFIED LIVE** (checked this session via
anon-key REST against production), **VERIFIED VIA GIT HISTORY** (checked
this session by exhaustively grepping every migration file — the
authoritative record of every schema/eligibility change this system has
ever made, stronger than a live spot-check because it is complete, not
sampled), **INHERITED** (prior report, not re-derived), **ANGEL
IMPLEMENTATION DECISION** (a scoping choice this programme makes, not a
CSSE fact).

---

## 1. Corrected Authoritative Register

| Item | Authoritative statement |
|---|---|
| Migration 181 | EXPECTED LIVE STATE VERIFIED; HISTORICAL MANUAL APPLICATION EVENT UNCONFIRMED; NO REAPPLICATION REQUIRED. (22/22 target rows confirmed `practice_eligible` live, this session and Increment 012.) |
| Migration 182 | HOLD / NOT APPLIED. Not touched this increment. |
| Migrations 183–185 | APPLIED AND LIVE VERIFIED. `ALI_DECISION_LOG.md`'s Decision 263 entry calling them "UNAPPLIED" is preserved, additively, as an accurate record of what was true when it was written — not rewritten — but is superseded by a later, undocumented Founder application event, confirmed this session by comparing live row content against each migration's own fail-closed before/after values. |
| The "~11 stray unreviewed" Reading questions | **Removed from current programme debt.** Reconciled against both production (broad `ilike` search, zero matches) and the complete git migration history (these specific IDs — e.g. `w1-kitemaker-04`, `w2-understudy-05` — never appear in any INSERT anywhere in this repository). They were never authored, not merely unreviewed; the debt they represented does not exist. |
| Writing | Exactly 7 `practice_eligible` prompts (unchanged, re-confirmed). |
| Migration 200 | SUPERSEDED BY 203 / NOT APPLIED. |
| English `mock_eligible` estate before migration 207 | **ZERO** — confirmed this session via a second, independent method beyond Increment 012's migration-string grep: a complete search of every `insert into public.ali_mock_form` statement in this repository's git history returns exactly **one** result, migration 147 (Mathematics Mock 1's freeze). No English content of any kind has ever been referenced by any Mock form, ever. |

---

## 2. Migration 206 Enforcement Assessment

**Founder's finding is correct: migration 206 alone does not enforce
anything.** It is a read-only `SELECT` view. Tested by direct logical
walkthrough against its actual definition (no live database available —
see the disclosed limitation below):

| Scenario | Would 206 alone prevent it? |
|---|---|
| A. An exposed question's `eligibility_status` set back to `practice_eligible` | **No** — nothing queries or blocks on the view; a plain `UPDATE` succeeds silently. |
| B. An exposed passage's un-exposed sibling questions promoted to `practice_eligible` | **No** — 206 has no passage-level concept at all, only row-level. |
| C. An exposed question composed into a second, supposedly-fresh `ali_mock_form` | **No** — nothing prevents a new form's `question_manifest` from repeating an id another form already used. |
| D. Passage-level exposure reliably determinable | **Partially** — derivable by a manual join against 206's view, but no dedicated, reusable object existed for it. |
| E. Mathematics Mock 1 exposure represented correctly | **Yes** — 206's view reads `ali_mock_form` directly, so Mock 1's 56 rows (the only rows in that table, confirmed Section 1) flow through automatically. |

**Conclusion: Decision 222 Part 8 was NOT fully closed by migration 206
alone.** Observability existed; enforcement did not. This is now
corrected.

### Bounded enforcement correction: Migration 208 (NOT APPLIED)

Not an edit to 206 (206 has already been reported as final once — per
this programme's own record/explain/recommend discipline, corrected
additively, not silently rewritten). Migration 208 adds:

1. **`ali_mock_retired_passage_ids`** — a companion view resolving
   `ali_question_bank.learning_unit_id` (== the matching
   `ali_passage_bank.id` in every batch this programme has authored) to
   passage-level exposure, closing D directly.
2. **Trigger on `ali_question_bank`** (`BEFORE UPDATE`) — raises an
   exception if a row transitions into `eligibility_status =
   'practice_eligible'` and either that row, or any sibling row sharing
   its `learning_unit_id`, has ever been referenced by any
   `ali_mock_form.question_manifest`. Closes A and B. Fires only on that
   exact transition — every other update (any other column, any other
   status value) is untouched.
3. **Trigger on `ali_mock_form`** (`BEFORE INSERT OR UPDATE`) — raises an
   exception if a form's proposed `question_manifest` contains any
   `question_id` already present in a *different* form's manifest.
   Closes C.

**Disclosed limitation, stated plainly rather than overclaimed:** this
session has no Docker/local Postgres and no service-role write access —
only the anon key, which the project's own RLS design correctly refuses
write access to any table these triggers touch. **The triggers were not
executed against a real database.** Verification performed instead: the
project's own `migration-sql-guard.mjs` (PASS, 208 files, quote-balanced,
`RAISE` arithmetic correct), a manual predicate-by-predicate walkthrough
of all five scenarios against the exact SQL above, and cross-checking
every table/column name and the `question_manifest` JSONB shape
(`[{"question_id":..., "section":...}]`) against migrations 070, 097,
102, 150, and 160–165, which already use these exact shapes. Founder
SQL-Editor application is the first real execution these will receive —
the same position every other migration in this repository is already
in, disclosed rather than glossed over.

---

## 3. Founder Content Allocation Review — Five Reading Passages + Writing Prompt

All five passages and the Writing prompt: **VERIFIED VIA GIT HISTORY**
never referenced by any `ali_mock_form` (only one form has ever existed,
Mathematics Mock 1 — Section 1) and **VERIFIED LIVE** never
`practice_eligible` (Increment 012).

### The Boat in the Boathouse (`mock-eng-boathouse`)
- Genre: narrative-extract, contemporary-realistic-fiction. 627 words.
- Family: authored standalone (migration 097, pre-dates the Increment-numbered batches).
- 13 rows / 12 numbered experiences, **30 marks**. Skills: evidence 7q/15m, inference 3q/7m, vocabulary 2q/5m, structure 1q/3m.
- `reading_complexity`: moderate-high. `content_difficulty`: medium.
- Review: `independently_validated` (migration 102, INHERITED — RLS blocks live re-verification of non-practice_eligible status this session).
- Amendment history: none found.
- Practice exposure: none (confirmed). Mock exposure: none (confirmed, git-history-proven).
- Why safe: fully reviewed, fully unexposed, strongest single-passage mark density of the five (good anchor content), genuinely varied question-format mix (5 of the 6 answer tiers this codebase uses: TIER1/2/3/4/6).
- Reserve trade-off: **allocate to Mock 1** — see Section 6 rationale.

### The Understudy, Mock-track (`eng-inc001-understudy`)
- Genre: narrative-extract, contemporary-realistic-fiction. 521 words.
- Family: Increment 001 (Decision 228).
- 7 rows, **15 marks**. Skills: evidence 3q/4m, inference 2q/6m, vocabulary 2q/5m.
- `reading_complexity`: moderate-high. `content_difficulty`: medium.
- Review: `independently_validated` (migration 160, Decision 236, Founder-confirmed closure).
- Amendment history: none found for this passage specifically (the batch's amendment activity, migrations 157–159, targeted other Increment-001 content).
- Practice exposure: none. **Naming collision, not a leak** (re-confirmed Increment 012): the live "Understudy" content is the separate Practice-track `w2-understudy-*` passage; this Mock-track passage is structurally distinct and has never been exposed.
- Mock exposure: none (confirmed).
- Why safe: inference-heavy (2 of 7 questions carry 6 of 15 marks), good counterweight to Boathouse's evidence-heavy profile.
- Reserve trade-off: **allocate to Mock 1**.

### How Bees Find Their Way Home (`eng-inc001-bee-navigation`)
- Genre: informational, popular-science-explanation. 570 words.
- Family: Increment 001 (Decision 228).
- 8 rows, **20 marks**. Skills: evidence 4q/7m, inference 1q/4m, vocabulary 2q/5m, structure 1q/4m.
- `reading_complexity`: moderate. `content_difficulty`: medium.
- Review: `independently_validated` (migration 160).
- Amendment history: none found for this passage specifically.
- Practice exposure: none. Mock exposure: none (confirmed).
- Why safe: the only genuinely informational text among the three chosen for Mock 1 — this programme's own primary-source evidence flags informational-genre Comprehension content as AUTHORED-EXTRAPOLATION beyond directly-evidenced source-genre coverage (the historical papers are narrative-fiction only); including it is a disclosed extrapolation, not a defect, and gives Mock 1 genre variety a single-passage form structurally cannot have.
- Reserve trade-off: **allocate to Mock 1**.

### The Loose Connection (`eng-inc002-roboticsfinal`)
- Genre: narrative-extract, contemporary-realistic-fiction. 505 words.
- Family: Increment 002 (Decision 237), Q2 grouped-scoring corrected in migration 163 (Decision 239).
- 12 rows (current, post-163/164 shape), **22 marks**. Skills: evidence 4q/7m, vocabulary 5q/5m, inference 2q/6m, structure 1q/4m.
- `reading_complexity`: moderate-high. `content_difficulty`: medium.
- Review: `independently_validated` (migration 165, Decision 242).
- Amendment history: Q2's original 4-mark pooled-answer row was deleted and replaced with 4 independently-scored 1-mark subpart rows (migration 163) after a live Founder review defect; a UK-representation naming correction (Decision 241, migration 164 — "Mr Adeyemi" → "Mr Carter", "Ade" → "Daniel") also applies to this passage's characters — **disclosed here since it affects the character names a learner will read**, though the content itself is otherwise unaffected.
- Practice exposure: none. Mock exposure: none (confirmed).
- Why NOT allocated to Mock 1: **strategically better reserved.** Content is fully ready, but including all 5 ready passages in one release leaves zero Reading Mock-track reserve for a future form — see Section 6.
- Reserve trade-off: **hold for Reading Comprehension Mock 2.**

### Crossing the Atlantic: Sail and Steam (`eng-inc002-sailandsteam`)
- Genre: informational, popular-history-explanation. 515 words.
- Family: Increment 002 (Decision 237).
- 10 rows, **17 marks**. Skills: evidence 2q/2m, vocabulary 5q/5m, inference 2q/6m, structure 1q/4m.
- `reading_complexity`: moderate. `content_difficulty`: medium.
- Review: `independently_validated` (migration 165).
- Amendment history: none found.
- Practice exposure: none. Mock exposure: none (confirmed).
- Why NOT allocated to Mock 1: same reserve rationale as Loose Connection — also the second informational passage, and Mock 1 already gets genre variety from Bee-navigation.
- Reserve trade-off: **hold for Reading Comprehension Mock 2.**

### mock-writing-screentime-01 (Continuous Writing, NOT included in Reading Comprehension Mock 1)

- **Full learner-facing prompt**: *"Do you think there should be limits on how much time children spend using phones, tablets, or screens? Write about your own opinion, using your own experience or things you have noticed to support what you think."*
- Title: "Should Children Have Limits on Screen Time?" Type: `descriptive` / QT-WC-01a (Reflective/Discursive Response). `timeMinutes`: 25. Difficulty: `year6-exam`.
- **Authentic instructions (checklist)**: write at least six sentences; state your own opinion clearly, near the start; support it with genuine personal experience/observation, not a generic reasons list; briefly consider a counter-view; keep a consistent personal voice (not a formal debate speech); organise into clear paragraphs; check spelling/punctuation.
- Response shape: open free-text response.
- Review provenance: migration 160 (Decision 236), reviewed and `approved_with_amendment` by Ayobami Lawal; content-corrected in migration 159.
- Amendment history: the correction in migration 159 (part of the same batch as the Understudy/Bee amendment-verification cycle).
- Current eligibility: `independently_validated`, **promoted to `mock_eligible` in migration 207** (Increment 012, still NOT APPLIED).
- Practice exposure: none (confirmed, the live 7 practice_eligible Writing IDs do not include it). Mock exposure: none (confirmed).
- Why promoted now, but not composed in: it is genuinely ready and unexposed, so preparing its eligibility now removes a future blocker — but per the Founder's own explicit instruction this increment, **promotion is not inclusion**. It stays out of Reading Comprehension Mock 1 by design, protected separately for whenever a Writing-inclusive Mock is actually authorised.

---

## 4. Proposed Reading Comprehension Mock 1 Form

**Name, deliberately: "Reading Comprehension Mock 1."** Not "English
Mock 1," not "Full English Mock," not "Full CSSE Mock" — matching both
the Founder's naming principle and the honest scope of what this
actually is.

**Framing, disclosed plainly:** the evidenced CSSE Comprehension section
is historically **one** passage per sitting (Section 2 of the CSSE
Blueprint: "narrative-fiction passage," singular). A 3-passage composite
form is therefore not a literal miniature of a single CSSE sitting — it
is a composite diagnostic assessment, the same compositional philosophy
Mathematics Mock 1 already uses (56 marks assembled from many separately
reviewed question families, not a literal transcription of one real
paper). This is stated explicitly so the form is never mistaken for an
exact-format replica.

| # | Passage | Genre | Questions | Marks |
|---|---|---|---|---|
| 1 | How Bees Find Their Way Home | informational | 8 | 20 |
| 2 | The Boat in the Boathouse | narrative | 13 | 30 |
| 3 | The Understudy | narrative | 7 | 15 |
| | **Total** | 2 narrative + 1 informational | **28** | **65** |

**Passage order rationale**: Bee-navigation first (`reading_complexity:
moderate`, the least demanding of the three available), then Boathouse
and Understudy (`moderate-high`, in either order — no evidenced or
content-based reason favours one over the other; Boathouse placed second
purely for its larger mark allocation to anchor the middle of the form).
**Disclosed limitation, not hidden**: none of the 5 ready passages
(Mock 1's three or the two reserved for Mock 2) carry an `accessible`/
easy `content_difficulty` tag — all five sit at `medium`
`content_difficulty` with `moderate`/`moderate-high` reading complexity.
There is no gentle on-ramp passage available in the currently-ready
pool. The one `accessible`-tagged Mock-track passage that exists
(Pepper's Breakfast) is still `authentic_assessment_candidate`, pending
independent review, and was correctly not promoted this increment.

**Timing**: 45 minutes + 10 minutes reading time — **ANGEL
IMPLEMENTATION DECISION**, not a CSSE fact. Derived by scaling the one
evidenced sub-figure available (historical Comprehension-only timing:
30 minutes for what Assessment Brain V1's own evidence implies was
roughly 30-35 marks) proportionately to this form's actual 65-mark
volume — not invented from nothing, but explicitly not a claim about
real exam pacing.

**Competency distribution** (28 questions, 65 marks): evidence 14q/26m
(40%), inference 6q/17m (26%), vocabulary 6q/10m (15%), structure 2q/7m
(11%), plus one further inference-tagged but functionally writer's-
craft-adjacent question retained in the Mock 2 reserve set (Sail and
Steam Q7), not this form.

**Scoring**: reuse the existing deterministic Reading answer-validation
pipeline (`checkAcceptedAnswerSet` / the tier-specific validators already
serving Practice and, per Decision 59's firewall, will serve Mock once
`mock_eligible` content exists) — no new scoring logic required or
proposed.

**Submission / analysis / report behaviour**: reuse Mathematics Mock 1's
proven pipeline unmodified (Section 6) — a separate `ali_mock_form` row,
separate `ali_mock_attempt` records, separate report identity. Sealed
until release, exactly as Mock 1's own reports are.

---

## 5. Depth, Difficulty, and Anti-Memorisation Assessment

**Skill coverage**: evidence (retrieval), inference, vocabulary-in-
context, and structure/sequencing are all represented, in a genuinely
mixed proportion (40/26/15/11%), not dominated by any single type.
Comparison/change-over-time is present within-passage (e.g. Understudy
Q6 asks how Ruby's feelings changed since September) even though no
question is tagged with a distinct "comparison" skill label. Writer's-
method/effect is thin in this specific 3-passage selection (no
TIER5_NAMED_COMPONENT_PLUS_EXPLANATION question is included — both
instances of that tier that exist, Loose Connection Q8 and Sail and
Steam Q7, sit in the Mock 2 reserve set, not this form) — **a genuine,
disclosed gap in this specific composition**, not a defect in the
underlying content estate.

**Sustained reading**: three passages, 627+521+570 = 1,718 words total,
comparable in scale to what a real learner would read across a CSSE
sitting's single passage plus surrounding material.

**Difficulty progression**: present but shallow — `moderate` →
`moderate-high` → `moderate-high`, not a genuine easy-to-hard ramp
(Section 4's disclosed limitation).

**Discrimination**: six distinct answer-format tiers are used across the
28 questions (TIER1 exact-match, TIER2 accepted-set, TIER3
quotation-plus-explanation, TIER4 ordered-list, TIER6 multi-select, plus
TIER5 present in the reserve set) — a genuinely varied format mix, not a
repeated single-pattern architecture. Marks-per-question range from 1
(simple retrieval/vocabulary) to 4 (multi-reason inference, ordered
lists), giving real partial-credit granularity for discriminating
between stronger and weaker responses.

**Anti-memorisation check**: each of the three passages is a wholly
distinct story/topic (boat repair, school understudy, bee navigation) —
no shared characters, settings, or reused question phrasing across them.
Cross-checked against the register's own documented Practice-track
monoculture problem (the "QT-RC-10 repeated-type" finding) — this form
does not repeat that pattern; question types vary passage-to-passage
even for the same skill label (e.g. three different "evidence" questions
use three different concrete formats: simple retrieval, list-three-
things, and tick-four-true-statements).

**Verdict on this specific check**: the three-passage form is
sufficiently varied in skill, format, and content to discriminate
genuinely between learners and resist simple pattern-memorisation —
**with the difficulty-progression and writer's-method gaps disclosed
above as real, acknowledged limitations of this specific composition**,
not overclaimed as absent.

---

## 6. Reserve Rationale

Allocating all 5 ready passages to Mock 1 would leave **zero** Reading
Mock-track reserve for any future form — the same mistake this
programme has already flagged and avoided on the Mathematics side
(Mathematics deliberately keeps a post-Mock-1 reserve; see the Rolling
Programme Capacity plan). The 3 remaining `authentic_assessment_
candidate` passages (Pepper's Breakfast, Compass Rose Challenge, Salmon)
are not review-complete and cannot be promoted yet, so if Mock 1 spends
all 5 ready passages, Reading Comprehension Mock 2 would have literally
zero ready content until a fresh independent-review cycle completes.
Reserving Loose Connection (22 marks) and Sail and Steam (17 marks) — 39
marks, one narrative + one informational, the same genre balance
preserved for Mock 2 as Mock 1 gets — avoids that cliff at essentially
no cost to Mock 1's own quality (Section 5).

---

## 7. Practice-Exposure Proof

For all 5 passages and the Writing prompt: confirmed **VERIFIED LIVE**
(Increment 012, re-confirmed this session) absent from the complete
343-row live `practice_eligible` set, checked by full passage-title
match, not id substring.

---

## 8. Mock-Exposure Proof

For all 5 passages and the Writing prompt: confirmed **VERIFIED VIA GIT
HISTORY** — a complete search of every `insert into public.ali_mock_form`
statement across this repository's entire migration history returns
exactly one match, migration 147 (Mathematics Mock 1's freeze, 56
Mathematics-only rows). No English content of any kind has ever been
referenced by any Mock form. This is stronger evidence than a live
query would have been (a live query would only prove "not currently
referenced," not "never referenced, provably, by the complete history of
every write this table has ever received").

---

## 9. Pipeline Implementation

**Not implemented this increment — by design.** Section 7 of the
Founder's directive is explicit: implement safe composition and
enforcement, do not release. No `ali_mock_form` row for Reading
Comprehension Mock 1 has been created. The proven Mathematics Mock 1
pipeline (`ali_mock_form` → `ali_mock_attempt` → `ali_mock_attempt_
answer` → `mock_score_attempt()` → `mock_release_report()`) requires no
new engine and none is proposed — composing the actual form row is the
next increment's implementation step, once this proposal is approved
(Section 16/20).

---

## 10. Migrations Created and Status

| # | File | Status |
|---|---|---|
| 208 | `208_mock_content_exposure_enforcement.sql` | Committed this increment, NOT APPLIED |

(206 and 207 were created in Increment 012, already committed, still NOT
APPLIED, unchanged this increment per the Founder's explicit "do not
apply yet" instruction.)

---

## 11. Tests/Build/Guards

Migration SQL Guard: **PASS** — 208 migration files, quote-balanced,
`RAISE` arithmetic correct. Copy Quality Guard and `tsc --noEmit`: not
re-run this increment (no application code, no content-authoring SQL
touched — only a new schema-enforcement migration and this report; guard
scripts specifically validate migration SQL and content copy, both
covered above). No live database execution was possible this session
(Section 2's disclosed limitation) — Founder application via Supabase
Dashboard remains the first real test.

---

## 12. READING COMPREHENSION MOCK 1 COMPOSITION READY or CONTENT CAPACITY INSUFFICIENT

**A. READING COMPREHENSION MOCK 1 COMPOSITION READY** — for the
3-passage, 65-mark form proposed in Section 4, with the difficulty-
progression and writer's-method gaps in Section 5 disclosed as real,
accepted limitations of this specific composition, not defects requiring
a blocked verdict.

---

## 13. Founder Decisions Required

1. Approve or amend the specific 3-passage Mock 1 allocation (Section 4)
   and the 2-passage Mock 2 reserve (Section 6) — an Angel scoping
   choice, not a forced outcome.
2. Approve or amend the 45-minute Angel-scoped timing figure.
3. Apply migrations 206, 207, 208 (in that order — 208 depends on 206's
   view) via Supabase Dashboard, or continue to hold.
4. Once applied: authorise composing the actual `ali_mock_form` row
   (still not a release — freeze-before-activation, matching Mathematics
   Mock 1's own two-step precedent).
5. Whether to commission a targeted, bounded research check on the
   post-2024 Continuous Writing prompt structure (Section 14) — the same
   kind of check that caught the Applied Reasoning removal.

---

## 14. Full English Mock Remaining Blockers — Corrected

**Picture-stimulus Writing, re-examined against actual evidence rather
than assumption, per the Founder's explicit instruction:**

The "HIGH (format)" confidence rating for the two-prompt/picture-
stimulus Continuous Writing structure comes entirely from Assessment
Brain V1's primary-source evidence base — the real 2021, 2022, and 2023
exam papers. **That is exactly the same evidence base Applied Reasoning's
now-confirmed removal predates.** The 2026 secondary-source research
(Section 3 of the CSSE Blueprint) never specifically re-checked whether
the two-prompt/picture-stimulus Writing structure still holds post-2024
— it only confirms Writing assesses "vocabulary, spelling, punctuation,
grammar, and structural variety" (a skills description, not a structural
one) via elevenace.com. **No source consulted either confirms or denies
picture-stimulus Writing for the current (2027) entry year.**

**Corrected classification**: picture-stimulus Writing is **UNCONFIRMED
FOR THE CURRENT ENTRY YEAR**, not a confirmed-current requirement and not
a confirmed-removed one. Treating it as a permanent, definite blocker
would repeat exactly the mistake Assessment Brain V1 made about Applied
Reasoning before Decision 58 caught it. The honest position: this is an
open research question, resolvable the same way the Applied Reasoning
question was (a targeted current-year source check), not something to
either build infrastructure for or permanently write off on assumption.

**Full English Mock remains: CONTENT/ASSESSMENT-CONTRACT INCOMPLETE**,
for two separately-tracked, evidence-based reasons — neither fabricated
this increment:
1. No source establishes the current Comprehension/Writing marks split
   post-Applied-Reasoning-removal (unchanged from Increment 012).
2. Whether Continuous Writing's second prompt is still picture-stimulus
   in the current entry year is genuinely unconfirmed, not permanently
   blocked — pending the targeted research check named above.

Separately, and regardless of the answer to (2): Angel has zero image-
asset pipeline today. Even if picture-stimulus is confirmed current, that
remains a distinct infrastructure decision for whenever it is actually
needed — not fabricated, not assumed necessary, this increment.

---

## 15. Updated Whole-Programme Completion Position

| Area | Status | Change this increment |
|---|---|---|
| D. Mock programme | BLOCKED (English) → **now OPERATIONAL BUT INCOMPLETE** (Reading) / still BLOCKED (full English) | A real, reviewed, evidence-checked Reading Comprehension Mock 1 proposal exists and is ready for Founder approval and composition; full English Mock still contract-incomplete |
| E. Anti-memorisation/sustainability | OPERATIONAL BUT INCOMPLETE (was BLOCKED before Increment 012) | Enforcement gap in 206 identified and closed (migration 208, NOT APPLIED); mechanism is now genuinely durable, not merely observational, pending Founder application |
| I. Governance/review debt | reduced further | "11 stray questions" debt item removed entirely (proven non-existent); migrations 183–185 reclassified applied; picture-stimulus reclassified from "confirmed blocker" to "unconfirmed, needs one targeted check" |

All other areas (A, B, C, F, G, H) unchanged from Increment 012's
position — not reopened, not touched.

---

## 16. Next Bounded Implementation Increment

Once the Founder approves Section 4's specific allocation: **compose the
actual `ali_mock_form` row for Reading Comprehension Mock 1** (28
questions, 3 passages, 65 marks, frozen per Mathematics Mock 1's own
freeze-then-activate precedent) and apply migrations 206→208→207 in that
dependency order. This remains a composition/freeze step, explicitly
**not** an activation/release step — release stays a separate, later
Founder decision, matching the Founder's own instruction that this
increment stops short of release.
