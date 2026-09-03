# Angel 11+ English — Programme Completion Increment 007: Writing Independent Review and Practice Capacity

**Session date:** 3 September 2026. **New this increment:** migration `200` (NOT APPLIED) + its test file. No Writing prompt authored. No migration applied.

---

## 1–2. Complete learner-facing content: migrations 198 and 199

*(Reproduced in full, unabridged — not applied, not yet Founder-approved.)*

### Prompt 1 — `eng-pc005-writing-personinfluence`

**Exact title:** Someone Who Has Made a Difference to You

**Exact prompt text, verbatim (what the child reads):**
> Think of a person who has genuinely made a difference to you — it could be a family member, a teacher, a friend, or someone else entirely. Write about who they are, what they are like, and describe one specific moment or example that shows the difference they have made. Explain why it has mattered to you.

**Time guidance:** 25 minutes

**Authentic assessment instruction** (survives Independent and Mock-style presentation, per `lib/writing/supportLevelPolicy.ts`):
1. Write at least six sentences
6. Check your spelling and punctuation before you finish

**Angel coaching checklist** (Guided Practice only; a single generic, non-prescriptive reminder replaces these under Independent; removed entirely under Mock-style):
2. Describe the person with specific, real detail — not just a list of qualities like 'kind' or 'funny' with nothing to show them
3. Include one specific moment or example that actually shows the difference they have made, not only a general statement that they have
4. Explain clearly why this has mattered to you personally
5. Organise your writing into clear paragraphs

**Response shape:** descriptive (person-portrait + illustrative anecdote + justification)
**Orientation:** retrospective, person-centred — the first row in the whole inventory whose subject is a person rather than an event, a place, or a societal opinion.
**QT type:** QT-WC-01a (Reflective/Discursive Response Prompt)
**Competency:** WC-01
**Scoring/feedback contract:** No per-question right/wrong answer (no Writing prompt has one). `/api/writing-feedback`'s LLM-derived `overallScore` (0–100, explicitly disclosed as uncalibrated against any exam board mark scheme) converts to a boolean correctness signal at `WRITING_CORRECTNESS_THRESHOLD = 70`; recorded with `supportTier: "supported"`, quarantined from independently reaching mastery — identical mechanism to every existing Writing row.
**Family / ID:** `mock-writing-wc01a-personinfluence` / `eng-pc005-writing-personinfluence`
**Proposed destination:** **Practice**, pending independent review (§4).

---

### Prompt 2 — `eng-pc005-writing-somethingnew`

**Exact title:** Something You Would Like to Learn

**Exact prompt text, verbatim:**
> Think of something you would genuinely like to learn how to do — it doesn't have to be connected to school, and you don't have to be good at it already. Write about what it is and why it interests you, then imagine what it might actually be like once you could do it — picture one specific moment where you are doing it.

**Time guidance:** 25 minutes

**Authentic assessment instruction:**
1. Write at least six sentences
6. Check your spelling and punctuation before you finish

**Angel coaching checklist** (Guided Practice only):
2. Explain clearly what you would like to learn and why it genuinely interests you, not just that it 'sounds fun'
3. Imagine one specific, particular moment of actually doing it — what you would see, hear, or notice — not a vague general statement like 'I'd be really good at it'
4. Keep your imagined moment realistic and believable, not an impossible or exaggerated version of yourself
5. Organise your writing so the order makes sense: what it is and why first, then the imagined moment

**Response shape:** narrative (imaginative projection of a real, plausible future — a single imagined moment, not a plot)
**Orientation:** prospective — the first row in the whole inventory that is forward-looking rather than retrospective.
**QT type:** QT-WC-01a
**Competency:** WC-01
**Scoring/feedback contract:** Identical mechanism to Prompt 1.
**Family / ID:** `mock-writing-wc01a-somethingnew` / `eng-pc005-writing-somethingnew`
**Proposed destination:** **Practice**, pending independent review (§4).

## 3. Founder recommendation for 198/199

**Recommend Founder approve both as candidates**, content as written above, unchanged — subject to the genre-fit disclosure raised honestly in §4 for `somethingnew` (self-authored content should not be self-certified without flagging its own weakest point). Approval here means "candidate content is sound and may proceed to independent review" — it is explicitly **not** a Practice-eligibility decision, which remains separate (§12).

## 4. 169 → 173 → 172 execution package

| Migration | Exact purpose | Dependency |
|---|---|---|
| **169** | Inserts `eng-inc003-writing-favouriteplace-01` ("Your Favourite Place to Be") and `eng-inc003-writing-pocketmoney-01` ("Pocket Money or Helping Anyway?") into `ali_question_bank` as `authentic_assessment_candidate` | None — first in sequence |
| **173** | Corrects `eng-inc003-writing-pocketmoney-01`'s checklist and `addresses_misconception` (2 of 7 checklist items were near-duplicates of `mock-writing-cookopinion-01`'s own coaching items) | **Requires 169 already applied** — its own first precondition (`select count(*) ... where id = v_id`) fails closed otherwise |
| **172** | Registers both rows for `pending_independent_review` in `ali_family_review`, keyed by `family_id` | Its own header: "after (or together with) migration 169" — content-independent of 173, but logically should follow so the reviewer is pointed at the corrected content |

**Expected post-state after all three applied:** both rows present in `ali_question_bank` with `eligibility_status = 'authentic_assessment_candidate'`; `pocketmoney-01`'s checklist carries 173's corrected wording (not 169's original); both `family_id`s have exactly one `pending_independent_review` row in `ali_family_review` under `review_type = 'mock_writing_prompt_independent_review'`.

**One combined read-only verification query** (Supabase Dashboard → SQL Editor; safe to run any number of times, writes nothing):

```sql
select
  q.id,
  q.eligibility_status,
  q.prompt->>'title'                                as title,
  q.prompt->'checklist'                              as checklist,
  case when q.id = 'eng-inc003-writing-pocketmoney-01' then
    (q.prompt->'checklist' @> '["Say specifically what is genuinely appealing about EACH view, even the one you lean away from, before explaining which way you lean (or a genuine middle position)"]'::jsonb)
  end                                                 as has_migration_173_correction,
  exists (
    select 1 from public.ali_family_review r
    where r.family_id = q.family_id
      and r.review_type = 'mock_writing_prompt_independent_review'
      and r.decision = 'pending_independent_review'
  )                                                   as review_registered
from public.ali_question_bank q
where q.id in ('eng-inc003-writing-favouriteplace-01', 'eng-inc003-writing-pocketmoney-01')
order by q.id;
```
Expected result: 2 rows; both `eligibility_status = 'authentic_assessment_candidate'`; `pocketmoney`'s `has_migration_173_correction = true`; both `review_registered = true`.

Executed together, applying 169 without 173 is structurally impossible to do safely afterward without also running 173 (173 would simply fail closed if run against un-169'd data, and running 169 alone leaves the pre-correction checklist live) — **apply all three together, in this order, in one sitting.**

## 5–6. Seven-row independent review batch

**This uses the existing `ali_family_review` / `/admin-beta/review` architecture exclusively.** Claude has no production database access and is not a qualified independent reviewer for this codebase's own governance purposes — what follows is **Claude's own recommended disposition and full reasoning for each row, prepared to make the Founder's actual review fast**, not a completed human decision. **Zero decisions have been recorded in `ali_family_review` this session.** All 7 genuinely require the Founder's own click-through at `/admin-beta/review` — that boundary is not crossed here, per direct instruction.

### 1. `eng-inc003-writing-imaginedplace-01` — An Invented Place
| Criterion | Assessment |
|---|---|
| A. CSSE authenticity | **Disclosed concern**: none of the three real evidenced CSSE Question-1 assets (CSSE-004/009/014) is a pure invented/fantastical place — all three are grounded personal-experience or opinion prompts. This prompt's imaginative-invention framing may itself be a forced fit onto QT-WC-01a, similar in kind to `wrt-003`'s own disclosed problem, just less explicit. Not previously flagged this way. |
| B. Age-appropriate | Yes |
| C. Clarity | Yes |
| D. British English | Yes |
| E. Originality | Yes |
| F. Shape distinction | Sole pure-invention row — no duplicate |
| G/H. Instruction/coaching separation | Already fixed (Decision 256; verified working, Increment 004/005) |
| I. Scoring compatibility | Standard |
| J. Memorisation/template risk | Low |
| K. Repeated-Practice usefulness | High — genuinely distinct task |
| L. Protected-assessment usefulness | N/A — Practice-track only |
**Recommended disposition: APPROVED WITH AMENDMENT** — the amendment is the genre-fit disclosure above, made explicit and seen rather than silently passed; no content change recommended.

### 2. `eng-inc003-writing-favouriteplace-01` — Your Favourite Place to Be
Directly evidenced (CSSE-004/014, "favourite place ... to relax" / "favourite building"). Clear, age-appropriate, distinct from `mock-writing-newplace-01` (steady/established vs. arrival/change). Low memorisation risk. Blocked only on migration application (§4), not on content quality.
**Recommended disposition: APPROVED.**

### 3. `eng-inc003-writing-pocketmoney-01` — Pocket Money or Helping Anyway? (post-173)
The specific defect previously identified (near-duplicate checklist wording against `cookopinion`) is already resolved in migration 173's own content — see the direct three-way comparison already on record (`ANGEL_ENGLISH_CONTENT_FOUNDATION_INCREMENT_004_WRITING_FOUNDER_INSPECTION_V1.md`, Part 5). Genuinely distinct two-position structure, moderate-but-disclosed rehearsal risk unchanged from that finding.
**Recommended disposition: APPROVED**, contingent on 173 being applied together with 169.

### 4. `eng-pc003-writing-difficulttask` — Something You Found Difficult
Content itself is sound: clear, age-appropriate, genuinely evidenced QT-WC-01a shape, checklist now correctly classified (Increment 005 fix). **Concern is not quality — it is inventory position**: this is the 5th (of what would become 6, if all promoted) event-recount ("Write about a time...") row.
**Recommended disposition: APPROVED (content)**, but **destination: Protected Reserve, not Practice** — see §8.

### 5. `eng-pc003-writing-meaningfulplace` — A Place That Means Something to You
Content sound, directly evidenced (same CSSE-004/014 basis as favouriteplace). Concern: near-duplicate shape to `favouriteplace-01` (both "place + why it matters").
**Recommended disposition: APPROVED (content)**, **destination: Protected Reserve** — holding one of the two near-duplicate place prompts back, per §8.

### 6. `eng-pc005-writing-personinfluence` — Someone Who Has Made a Difference to You
Self-authored this programme; reviewed here with the same rigour as any other row, not self-certified. Genre fit is an extrapolation from the general reflective/discursive pattern (as is most of this bank's `angel_original` content — not a new weakness). Genuinely fills the person-centred gap. No sensitive-disclosure risk beyond what any personal-reflection prompt carries.
**Recommended disposition: APPROVED**, flagged that this is Claude's own authored content and should be weighted lightly relative to the Founder's independent read.

### 7. `eng-pc005-writing-somethingnew` — Something You Would Like to Learn
Same self-authorship caveat as #6. **Honest self-critical note**: this prompt shares the *same* genre-fit concern raised for `imaginedplace` (imaginative projection vs. the evidenced grounded-reality genre) — arguably more acutely, since nothing in the prompt has actually happened at all. Genuinely fills the prospective-orientation gap; no other row is forward-looking.
**Recommended disposition: APPROVED WITH AMENDMENT** — same treatment as `imaginedplace`: the genre-fit disclosure made explicit and seen, no content change recommended.

**Summary — actual decisions completed vs. awaiting human decision:** **0 of 7 formally decided.** All 7 have Claude's full recommended disposition and reasoning above, ready for the Founder to confirm or override quickly at `/admin-beta/review`. No `REQUIRES REVALIDATION` or `REJECTED` recommendation resulted from this review — all 7 are genuinely sound content; none has a blocking defect.

## 7. Authoritative Writing inventory after review

| ID | Claude's recommended disposition | Recommended destination |
|---|---|---|
| `wrt-003` | (unchanged — never submitted to this pipeline) | RETIRE from candidate pipeline |
| `mock-writing-mindchange-01` | (historically `approved`) | See §8 — Mock/Practice track question |
| `mock-writing-kindness-01` | (historically `approved`) | See §8 |
| `mock-writing-cookopinion-01` | (historically `approved`) | See §8 |
| `mock-writing-newplace-01` | (historically `approved_with_amendment`, resolved) | See §8 |
| `mock-writing-mistakelearned-01` | (historically `approved`) | See §8 |
| `mock-writing-screentime-01` | (historically `approved_with_amendment`, resolved) | REVISE — needs a migration-173-style checklist correction against `cookopinion` before Practice; not authored this increment |
| `eng-inc003-writing-imaginedplace-01` | Claude: APPROVED WITH AMENDMENT | **PRACTICE** |
| `eng-inc003-writing-favouriteplace-01` | Claude: APPROVED | **PRACTICE** |
| `eng-inc003-writing-pocketmoney-01` | Claude: APPROVED | **PRACTICE** |
| `eng-pc003-writing-difficulttask` | Claude: APPROVED (content) | PROTECTED RESERVE |
| `eng-pc003-writing-meaningfulplace` | Claude: APPROVED (content) | PROTECTED RESERVE |
| `eng-pc005-writing-personinfluence` | Claude: APPROVED | **PRACTICE** |
| `eng-pc005-writing-somethingnew` | Claude: APPROVED WITH AMENDMENT | **PRACTICE** |

## 8. Practice/Reserve/Revise/Retire recommendation, derived from actual review

**An architectural question must be resolved before the 6 pre-existing `independently_validated` rows can be allocated, and this report does not resolve it — it is flagged for an explicit Founder decision:**

`lib/ali/questionBank.ts`'s own Decision 152 docstring states that an `independently_validated` row is architecturally "reserved, protected assessment content specifically because it has NOT been exposed to any learner yet" — i.e. these 6 rows may have been intended as *future Mock* reserve, not Practice candidates, and promoting them to Practice would cross that boundary. However: **no live Mock Writing delivery mechanism exists** (`app/mocks/[pathway]` explicitly excludes Writing), and Mock Writing activation is out of scope for the foreseeable programme. Holding these 6 rows reserved for a Mock surface that does not exist and is not being built, while Practice starves, is a genuine tension.

**Recommendation (advisory, not decided):** promote a bounded subset — `mock-writing-cookopinion-01` (opinion, distinct shape) and `mock-writing-newplace-01` (event, but structurally distinct arrival/change arc) and `mock-writing-kindness-01` (the strongest, most naturally-written of the three remaining single-moment event-recount rows) — 3 of 6, holding `mock-writing-mindchange-01` and `mock-writing-mistakelearned-01` reserved (further reduces event-recount dominance in the live pool beyond Increment 006's draft), and leaving `mock-writing-screentime-01` in REVISE. **This promotion is not included in migration 200** — it requires the Founder's own decision on the Mock/Practice boundary question first, and would need its own, separate migration once decided.

**Combining both the clean 5-row set (migration 200, ready now) and this advisory 3-row set (pending the boundary decision), the eventual full Practice pool would be 8 rows** — `imaginedplace`, `favouriteplace`, `pocketmoney`, `personinfluence`, `somethingnew`, `cookopinion`, `newplace`, `kindness` — matching the ~8-prompt planning guide with genuine purpose diversity (invention, prospective, place, two distinct opinion structures, person, two distinct event-recount sub-shapes), not merely gate-satisfying labels.

**Reserve (4 rows, holding genuinely strong, not weak, content):** `difficulttask`, `meaningfulplace`, `mindchange`, `mistakelearned` — matching the ~3–4 planning guide. None of these is Reserve because it is unsuitable for Practice; all four are content-approved and held back purely to preserve unseen-repetition capacity and reduce shape saturation.

**Revise:** `screentime` (checklist correction needed, not authored this increment).
**Retire from pipeline:** `wrt-003`.
**Fixture only, uncounted:** `wrt-001`/`002`/`004`.

## 9. Response-shape and orientation distribution (the 8-row eventual Practice pool)

| Shape (gate field) | Count | True purpose-register | Count |
|---|---|---|---|
| descriptive | 6 | Place (favouriteplace) | 1 |
| narrative | 2 | Opinion, single-position (cookopinion) | 1 |
| | | Opinion, two-position (pocketmoney) | 1 |
| | | Person-centred (personinfluence) | 1 |
| | | Event, arrival/change (newplace) | 1 |
| | | Event, single-moment (kindness) | 1 |
| | | Pure invention (imaginedplace) | 1 |
| | | Prospective (somethingnew) | 1 |

**Six genuinely distinct purpose-registers across 8 rows** — a material improvement on today's live inventory, where 5 of the (pre-review) 11 rows collapse into one register.

## 10. Memorisation/template-risk assessment

- **"Write about a time..." dominance, addressed by allocation, not rewording** (per direct instruction not to solve this by changing the first five words): of 6 total event-recount rows in the whole inventory (mindchange, kindness, mistakelearned, newplace, difficulttask, + wrt-003's persuasive framing of the same underlying demand), only **2** (`newplace`, `kindness`) reach the live Practice pool under this recommendation — down from Increment 006's own draft, which would have put 3–4 event-recount rows live.
- **cookopinion/screentime near-identical template**: resolved by promoting only `cookopinion` and holding `screentime` for revision rather than promoting both.
- **favouriteplace/meaningfulplace near-duplicate place shape**: resolved by promoting only `favouriteplace` and reserving `meaningfulplace`.
- **Residual risk**: `newplace` and `kindness`, while structurally distinct from each other (arrival/change vs. single-moment), are still both "real personal event, retrospective" at the broadest level — a family doing Practice repeatedly over months will still eventually notice this. This is disclosed, not eliminated; genuinely closing it further requires either revising `screentime` into a released third opinion-shape row, or a currently-out-of-scope new authoring pass once Reserve is exhausted.

## 11. Exact sustainable Practice gap remaining

**None in raw count** — the 8-row pool above meets the ~8/≥3-shapes Practice Launch guide today, using only already-authored content. **The actual remaining gap is entirely procedural**: (a) apply 169+173+172, (b) Founder completes the real independent-review decisions for the 7-row batch (§5), (c) Founder makes the Mock/Practice boundary decision for the 3 additional pre-existing rows (§8), (d) apply migration 200 (and a follow-up migration for the 3-row set, once written), (e) only then does any row become `practice_eligible` for the first time in this codebase's history.

## 12. Proposed `practice_eligible` promotion set

**5 rows, ready now, pending real review decisions**: `eng-inc003-writing-imaginedplace-01`, `eng-inc003-writing-favouriteplace-01`, `eng-inc003-writing-pocketmoney-01`, `eng-pc005-writing-personinfluence`, `eng-pc005-writing-somethingnew`.

**3 further rows, pending the separate Mock/Practice boundary decision (§8)**: `mock-writing-cookopinion-01`, `mock-writing-newplace-01`, `mock-writing-kindness-01` — **not** included in migration 200; would need its own migration once decided.

## 13. Promotion migration — prepared, NOT applied

`supabase/migrations/200_programme_completion_inc007_writing_practice_eligible_promotion.sql`: fail-closed, targets exactly the 5-row set above, promotes `authentic_assessment_candidate → practice_eligible` directly (the Mock-track statuses are deliberately skipped, matching migration 181's own precedent, not migration 103/160's two-step pattern). Explicitly documents that — unlike migration 181, written *after* real review evidence existed — this migration is prepared *in advance* and must not be applied until the Founder has genuinely completed the 7-row review batch with real `approved`/`approved_with_amendment` decisions for these exact 5 ids. Covered by 13 new structural tests (`tests/supabase/programmeCompletionInc007WritingPracticeEligiblePromotion.test.ts`), all passing.

## 14. `/writing` activation readiness decision

**Still NOT MET.** No row is `practice_eligible` yet (migration 200 not applied; no real review decisions recorded). `/writing` continues to show the honest not-ready state — confirmed unchanged this session (no code touched on that route). No fixture leakage, no provisional/candidate leakage, no fabricated AI score — all previously verified (Increment 005/006), nothing regressed (no changes to `writingRubric.ts`, the feedback API, the evidence pipeline, competency processing, or the Guided Practice scaffold this increment).

## 15. Tests/build/guards

| Guard | Result |
|---|---|
| `tsc --noEmit` | Clean |
| `npm test` | **3182/3182** passing (up from 3169 — 13 new tests for migration 200) |
| `npm run migration-sql-guard` | PASS — 200 migration files |
| `npm run copy-guard` | PASS — 0 violations across 264 files |
| `npm run build` | PASS, exit 0, 56/56 static pages (same two pre-existing, unrelated `location` messages as Increment 006, unchanged) |
| ESLint, full repo | **72 errors / 23 warnings — unchanged, zero net-new** |

## 16. Production/deployment state

No database change. Migration 200 committed to the repo (code/file only), **not applied**. This report and migration 200 will be pushed to `origin/main` following this session's established pattern (report/engineering commits, no destructive action) — the same disclosure as prior increments applies: deployment-platform status was not independently checked.

## 17. Authoritative migration register (updates from Increment 006)

| # | Status |
|---|---|
| 169, 172, 173 | MISSING / SAFE APPLICATION REQUIRED — execution package prepared (§4), sequence 169→173→172, single combined verification query provided. Not applied this session. |
| 198, 199 | Content review complete (Claude's recommendation, §1–3); **awaiting Founder's own content approval** before application. Not applied. |
| 200 | **New this increment.** Practice-eligible promotion for the 5-row clean set. Fail-closed, tested, NOT APPLIED — must not be applied until real independent-review decisions exist for its 5 target ids. |
| 181 | EXPECTED LIVE STATE VERIFIED; historical manual application event unconfirmed; NO REAPPLICATION REQUIRED. (unchanged) |
| 182 | HOLD / NOT APPLIED. (unchanged) |
| 189 | APPLIED MANUALLY BY FOUNDER 2 SEP 2026 + LIVE VERIFIED. (unchanged) |
| 190 | APPLIED AND LIVE VERIFIED. (unchanged) |
| 191–194, 196, 197 | MANUALLY EXECUTED BY FOUNDER 2 SEP 2026; post-state combined verification still outstanding; DO NOT REAPPLY. (unchanged) |
| 195 | MANUALLY APPLIED BY FOUNDER 3 SEP 2026 + LIVE VERIFIED. (unchanged) |

Salmon / Pepper's Breakfast / Compass Rose Challenge review-debt lines preserved exactly as stated in the Founder's own instruction, unchanged, no new evidence this session.

## 18. Next bounded increment (recommendation)

Two things must happen, in this order, before any further Writing engineering work is useful: (1) Founder applies the 169→173→172 package and reviews the 7-row batch at `/admin-beta/review` (or explicitly overrides Claude's recommended dispositions); (2) Founder makes the Mock/Practice boundary decision for the 3 additional pre-existing rows (§8). Once either or both land, the next increment applies migration 200 (and, if the boundary decision favours it, a follow-up 3-row promotion migration), then verifies `/writing` genuinely activates against real `practice_eligible` content for the first time — that verification, not further review preparation, is the next real engineering step.
