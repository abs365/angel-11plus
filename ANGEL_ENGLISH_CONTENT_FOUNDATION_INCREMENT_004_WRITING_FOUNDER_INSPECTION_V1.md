# Angel 11+ English — Increment 004 Writing Founder Inspection

**Version 1 — Decision 260, post-Decision-259/migration 169 (NOT applied).**
**Status:** Inspection artifact only. Neither prompt below is `practice_eligible`, `mock_eligible`, or `independently_validated`. Migration 169 has not been run against any database. This document also closes Decision 256's amendment-verification evidence trace for "An Invented Place" — it records a readiness finding only; it does not itself record verification.

All prompt text, checklists, and provenance below are extracted verbatim from `supabase/migrations/169_english_content_foundation_writing_depth_extension_decision259.sql` (the two new candidates) and `supabase/migrations/167_english_content_foundation_increment003_writing.sql` (An Invented Place), cross-checked against `lib/writing/supportLevelPolicy.ts`'s live classification table and confirmed by `tests/lib/writing/decision259WritingDepthExtension.test.ts` and `tests/lib/writing/decision257EndToEndWiring.test.ts` (119/119 targeted tests pass).

---

## PART 1 — AN INVENTED PLACE: AMENDMENT VERIFICATION READINESS

**Binding amendment (Decision 255):** the core imaginative task is educationally sound; the stored checklist is too prescriptive for independent/formal assessment presentation and must be separated into scaffolding (Teaching) vs. authentic instructions (Independent/Mock).

Verified against the current implementation on `main` (commit `997ace2`):

| Requirement | Verified against | Result |
|---|---|---|
| Teaching/Guided: full scaffold available | `lib/writing/supportLevelPolicy.ts` `presentWritingChecklistForContext(id, checklist, "teaching")` returns the unmodified 6-item checklist | **Confirmed** |
| Independent: itemised coaching suppressed, core + generic reminder only | Same function, `"independent"` context, for `eng-inc003-writing-imaginedplace-01` | **Confirmed** — see exact text below |
| Mock: coaching suppressed, core instructions only | Same function, `"mock"` context | **Confirmed** — see exact text below |
| Wired to a real learner surface, not dead code | `app/learning-intelligence/practice/[area]/page.tsx`'s `WritingActivity`, driven by the same real Guided-Practice toggle Reading/Maths already use (Decision 257, confirmed unchanged at commit `b78048d`→present) | **Confirmed** |
| Admin review: canonical checklist visible, Core/Coaching tags visible, suppression note present, by-context preview exists | `app/admin-beta/review/page.tsx` lines ~443, ~450, ~462 (read directly this session) | **Confirmed** |
| Canonical content not duplicated or rewritten | Migration history for `eng-inc003-writing-imaginedplace-01`: only migration 167 (insert) and 168 (pending-review placeholder) ever reference this id; no later migration alters it | **Confirmed** |
| `eligibility_status` still `authentic_assessment_candidate` | Migration history (above) shows no promotion migration exists for this row | **Confirmed via migration history.** Live-database confirmation attempted via read-only anon-key REST query (`ali_question_bank?id=eq.eng-inc003-writing-imaginedplace-01`) — returned `200 []` (empty), consistent with RLS filtering anon reads on this table, **not** proof the row is absent. This is the same access limitation Decisions 257 and 258 already hit and disclosed; it is unchanged. |
| No `amendment_verification` row yet exists | Grep of all migrations for `amendment_verification` referencing this id/family: none exists (only Increment 001's separate "Somewhere New" amendment-verification rows, migrations 157/158/160, are unrelated) | **Confirmed via migration history**, same live-read caveat as above |
| No Practice/Mock activation occurred | No migration since 167 changes this row's status; `app/mocks/[pathway]` still explicitly excludes Writing content | **Confirmed** |

**Exact learner-visible checklist for "An Invented Place" (`eng-inc003-writing-imaginedplace-01`), independently reproduced this session from the live source (stored checklist + policy function, not assumed):**

- **Teaching (all 6 stored items, unchanged):**
  1. Write at least six sentences
  2. Invent a specific place with real, particular details — not a vague or generic setting like 'a magical forest' with no distinguishing features
  3. Describe what it would FEEL like to be there, using at least one sensory or emotional detail, not only what it looks like
  4. Include one specific thing that happens when someone visits, giving the writing a clear moment or event rather than only description
  5. Keep the invented place internally consistent — do not contradict a detail you have already given
  6. Check paragraphing, spelling and punctuation carefully

- **Independent (core + generic reminder, 3 items):**
  1. Write at least six sentences
  2. Check paragraphing, spelling and punctuation carefully
  3. Plan and write your response independently, using what the task above asks for.

- **Mock (core only, 2 items):**
  1. Write at least six sentences
  2. Check paragraphing, spelling and punctuation carefully

**Finding:** every element of the binding amendment is implemented and provable in code and test, on a real (not demonstration-only) delivery path. The one item this session could not independently re-confirm from a live database read is governance state (`eligibility_status`, absence of any `amendment_verification` row) — migration history is unambiguous on both points, but a direct database read was blocked by RLS under the anon key available in this environment, exactly as in Decisions 257/258.

**FOUNDER AMENDMENT IMPLEMENTATION VERIFICATION: READY TO RECORD**, subject to the Founder's own (or a service-role) confirmation of the two governance facts above, which this session's tooling cannot reach. This is not recorded here — recording remains a separate, deliberate Founder action.

---

## PART 2 — CAPACITY RECONCILIATION (before / after migration 169)

**Before migration 169**, by lifecycle state, all 7 real QT-WC-01a rows:

| State | Count | IDs |
|---|---|---|
| `practice_eligible` | **0** | — |
| `independently_validated` | 6 | mindchange, kindness, cookopinion, newplace, mistakelearned, screentime (all `mock-writing-*-01`) |
| `authentic_assessment_candidate` | 1 | `eng-inc003-writing-imaginedplace-01` (An Invented Place) |

**After migration 169 (if applied — it is NOT):**

| State | Count | IDs |
|---|---|---|
| `practice_eligible` | **0** — unchanged | — |
| `independently_validated` | 6 — unchanged | (as above) |
| `authentic_assessment_candidate` | 3 | An Invented Place, Your Favourite Place to Be, Pocket Money or Helping Anyway? |

**Practice-authorised total: 0, before and after.** No wording anywhere in this document should be read as "9 validated prompts" — 6 are independently validated (Mock governance track only, not Practice), 3 are unvalidated candidates. Applying migration 169 changes the candidate count, not the validated or practice-authorised count.

---

## PART 3 — FULL CONTENT INSPECTION PACK

### 3.1 — Your Favourite Place to Be

| Field | Value |
|---|---|
| Canonical ID | `eng-inc003-writing-favouriteplace-01` |
| Learner-facing prompt | "Write about a place where you feel most relaxed or comfortable — it could be somewhere in your home, somewhere outdoors, or anywhere else that matters to you. Describe what the place is like, and explain why it makes you feel this way." |
| Response shape | `descriptive` (Decision 254 taxonomy) — descriptive-justificatory |
| QT-WC taxonomy | QT-WC-01a (Reflective/Discursive Response Prompt) |
| Difficulty | `hard` / `year6-exam` |
| Estimated time | 1500 seconds = 25 minutes (matches every other QT-WC-01a prompt) |
| Complete learner checklist (6 items, Core/Coaching per `supportLevelPolicy.ts`) | 1. Write at least six sentences — **Core** · 2. Describe a specific, real place you actually spend time in, not a vague or general type of place — **Coaching** · 3. Include at least one concrete sensory detail — something you see, hear, or notice there — **Coaching** · 4. Explain clearly WHY this place makes you feel relaxed or comfortable, not only what it looks like — **Coaching** · 5. Organise your writing into clear paragraphs — **Coaching** · 6. Check paragraphing, spelling and punctuation carefully — **Core** |
| Misconception (`addresses_misconception`) | "Describing the place only in generic sensory terms without ever explaining WHY it produces the relaxed/comfortable feeling, leaving the prompt's required justification unanswered — or choosing a vague category of place ('my bedroom', with no distinguishing detail) rather than a specific, particular one." |
| Transfer classification | `NEAR_TRANSFER` |
| Provenance | `angel_original`; explanation field cites CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md, Confidence HIGH, EMC-3, grounded in the CSSE-004/CSSE-014 evidenced asset shape (see Part 4) |
| Originality declaration | Wording is original composition; no phrase is copied from the framework doc's own short quoted fragments ("favourite place ... to relax", "favourite building") or from any exam text — confirmed by direct comparison this session |
| Educational purpose | Fills a real evidenced gap: no existing prompt uses the descriptive-justificatory "favourite place" shape; closest existing prompt (`mock-writing-newplace-01`, "Somewhere New") is a change-over-time narrative about an *unfamiliar* place — opposite structural demand (arrival/change vs. established/steady preference) |
| Closest existing prompt & distinction | `mock-writing-newplace-01` — distinct because Favourite Place requires no narrated event, no before/after arc, and instead sustained description-plus-justification of something already familiar |
| Guided presentation | Full 6-item checklist |
| Independent presentation | Core items 1 & 6 + the shared generic reminder ("Plan and write your response independently, using what the task above asks for.") — 3 items total |
| Mock presentation | Core items 1 & 6 only — 2 items |
| Over-scaffolding risk | Low — 4 of 6 items are genuinely technique-level (coaching), correctly suppressed outside Teaching; the prompt's own text already carries the substantive task (describe + explain why) independent of the checklist |
| Rehearsed/template response risk | Low-moderate — "favourite place" is a common personal-writing topic in general (not CSSE-specific) that a learner could plausibly have a pre-written answer for; mitigated by requirement 4 ("explain clearly WHY"), which a generic pre-written description would not automatically satisfy, but this is a genuine, disclosed risk, not eliminated |

### 3.2 — Pocket Money or Helping Anyway?

| Field | Value |
|---|---|
| Canonical ID | `eng-inc003-writing-pocketmoney-01` |
| Learner-facing prompt | "Some people think children should be given pocket money for helping at home. Other people think children should help at home anyway, without being paid for it. What do you think, and why?" |
| Response shape | `descriptive` (opinion sub-shape) |
| QT-WC taxonomy | QT-WC-01a |
| Difficulty | `hard` / `year6-exam` |
| Estimated time | 1500 seconds = 25 minutes |
| Complete learner checklist (7 items) | 1. Write at least six sentences — **Core** · 2. Refer to both views given in the question, not only the one you agree with — **Coaching** · 3. State clearly which view you agree with, or explain a genuine middle position, and why — **Coaching** · 4. Support your view with your own experience or something you have genuinely noticed, not a generic list of reasons — **Coaching** · 5. Keep a consistent personal voice throughout, since this is your own opinion, not a formal debate speech — **Coaching** · 6. Organise your writing into clear paragraphs — **Coaching** · 7. Check spelling and punctuation carefully — **Core** |
| Misconception | "Answering as if only one view was offered — stating an opinion without ever referring to the second, named position — which fails the prompt's explicit two-position framing even if the opinion itself is well argued." |
| Transfer classification | `MIXED_TRANSFER` |
| Provenance | `angel_original`; same evidenced QT-WC-01a opinion basis as CSSE-009 |
| Originality declaration | Original composition; topic (pocket money for chores) does not overlap with any evidenced CSSE asset or existing prompt |
| Educational purpose | Targets a genuine structural gap: no existing opinion prompt requires engagement with a stated second position as a mandatory element — every existing opinion prompt (cookopinion, screentime) only optionally invites "considering" disagreement |
| Closest existing prompts & distinction | `mock-writing-cookopinion-01` / `mock-writing-screentime-01` — see Part 5 for the full comparative analysis; the prompt TEXT is genuinely restructured (two named positions stated, not "Do you think X?"), and items 2–3 of the checklist are substantively rewritten to enforce that; items 1, 5, 6, 7 are near-verbatim shared craft/mechanics boilerplate (sentence count, voice, paragraphing, spelling) — appropriately generic across the whole opinion sub-family, not evidence of template reuse in the sense Decision 259 itself warned against |
| Guided presentation | Full 7-item checklist |
| Independent presentation | Core items 1 & 7 + the shared generic reminder — 3 items |
| Mock presentation | Core items 1 & 7 only — 2 items |
| Over-scaffolding risk | Low — same pattern as Favourite Place |
| Rehearsed/template response risk | **Moderate** — this is the specific concern Part 5 examines directly |

---

## PART 4 — FAVOURITE PLACE: EVIDENCE TRACE

`docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md`, QT-WC-01a entry (line ~209–214), read directly this session:

> "**Supporting Asset IDs:** CSSE-004 Q1 (2023, "favourite place... to relax"); CSSE-009 Q1 (2022, "Do you think that food can change a person's mood?"); CSSE-014 Q1 (2021, favourite building)"
> "**Confidence Rating:** HIGH. **Evidence Maturity Classification:** EMC-3 — format position (always Question 1) and structural demand (reflective/discursive, no stimulus image) consistent 3/3 years; capped below EMC-4 because … topic content itself is unpredictable."

**Historical exam evidence, directly stated by the framework doc:** two of the three known real CSSE Question-1 assets (2023 and 2021) are "favourite place/building" prompts. This is historical fact as recorded in this repo's own evidence base, not invented.

**Architectural inference, made by Decision 259 (and re-verified, not re-derived, this session):** that this shape is therefore worth authoring a dedicated candidate prompt for, since none of the 7 existing prompts use it. That reasoning step — "evidenced but unrepresented, therefore a gap" — is Decision 259's judgement, clearly separable from the historical fact it rests on.

**Originality:** the framework doc itself only ever quotes 2–4 word fragments ("favourite place ... to relax", "favourite building") — not full exam question text. The new prompt's full wording ("Write about a place where you feel most relaxed or comfortable...") is original composition, thematically consistent with but not copied from those fragments. No copyright concern identified.

---

## PART 5 — POCKET MONEY: DISTINCTIVENESS ASSESSMENT (critical review)

Direct three-way comparison, checklist item by item:

| # | cookopinion-01 / screentime-01 (verbatim identical to each other) | pocketmoney-01 |
|---|---|---|
| Prompt template | "Do you think [X]? Write about your own opinion, using your own experience or things you have noticed to support what you think." | "Some people think [A]. Other people think [B]. What do you think, and why?" — **structurally different**: states two named positions in the question itself, not an open "do you think" invitation |
| 1 | Write at least six sentences | Write at least six sentences — **identical** |
| 2 | State your own opinion clearly, near the start | Refer to both views given in the question, not only the one you agree with — **new, substantively different** |
| 3 | Support your opinion with your own experience... (item 3 in old pair) | State clearly which view you agree with, or explain a genuine middle position, and why — **new position**, function-related to old item 2 but explicitly allows a middle position the old template never offered |
| 4 | Consider, briefly, why someone might disagree with you *(optional, easily-skippable)* | Support your view with your own experience... — **near-identical wording to old item 3**, one word changed ("view" vs "opinion") |
| 5 | Keep a consistent personal voice throughout... | Keep a consistent personal voice throughout... — **identical** |
| 6 | Organise your writing into clear paragraphs | Organise your writing into clear paragraphs — **identical** |
| 7 | Check spelling and punctuation carefully | Check spelling and punctuation carefully — **identical** |

**Honest count:** 4 of 7 checklist items are verbatim identical, 1 is a one-word variant, and only 2 are substantively rewritten. Taken as raw checklist-text overlap alone, this prompt reuses more of the old template's wording than migration 169's own commentary emphasises.

**However**, the reused items (sentence count, voice, paragraphing, spelling) are generic writing-craft/mechanics requirements that this project's own convention (confirmed against all 7 existing prompts) already repeats near-verbatim across every QT-WC-01a prompt regardless of topic or shape — they are not the source of the "structurally identical" problem Decision 259 itself flagged in cookopinion/screentime. That problem was the *entire* task (prompt template AND checklist, topic noun aside) being identical. Here:

- **Prompt text itself** is genuinely restructured: two named positions stated up front, "What do you think, and why?" rather than an open "Do you think X?" — this is a real difference in decision structure (choosing between/against two given claims vs. forming an opinion from nothing).
- **Checklist items 2–3** convert "consider, briefly" (optional, skippable) into a mandatory requirement to engage both named positions and explicitly permit a middle position — a genuine increase in perspective-handling and justification demand, reflected in the `MIXED_TRANSFER` rating vs. the pair's `FAR_TRANSFER`.
- Regression test `"cookopinion-01 and screentime-01 really are the structurally-identical pair migration 169 cites (regression baseline)"` and `"Pocket Money prompt requires referencing both stated positions, unlike the existing 'Do you think X?' pair"` both pass, independently confirming this distinction at the code level.

**Conclusion:** this is not a third noun substituted into the same template — the task's decision structure and required response shape are genuinely different, even though shared craft-mechanics checklist wording is (appropriately) reused. This is disclosed plainly rather than defended reflexively; the Founder should weigh the checklist-wording overlap themselves when reviewing, since it is real, even if not disqualifying in this session's assessment.

---

## PART 6 — AGE / CSSE AUTHENTICITY JUDGMENT

**Your Favourite Place to Be:** clear, accessible wording for an 11+ candidate; realistic cognitive demand (sustained description + justification, no specialist knowledge required); rewards communication quality and specificity over prior knowledge; plausible selective-school Writing demand, directly evidenced by two of three known real assets, without reproducing protected text; 25 minutes is consistent with every other stored prompt and appropriate for a 6-sentence-minimum extended response.

**Pocket Money or Helping Anyway?:** clear and age-relevant (pocket money/chores is a genuinely familiar dilemma for this age group); slightly higher cognitive demand than a single-position opinion prompt (must represent two views before responding), which is appropriate differentiation — stronger writers can develop both positions and a nuanced middle ground, weaker writers can still pass by stating a simple preference while referencing both; rewards communication and reasoning, not specialist knowledge; plausible selective-school demand, distinct topic from any evidenced asset; 25 minutes remains appropriate.

---

## PART 7 — SUPPORT POLICY COMPATIBILITY

Confirmed by direct inspection of `WRITING_CHECKLIST_ITEM_SUPPORT_LEVELS` in `lib/writing/supportLevelPolicy.ts` and by the passing test suite (119/119 targeted Writing tests, including 12 tests specific to the two new prompts): both prompts are classified using the same generic per-item core/coaching table every other QT-WC-01a prompt uses, with no prompt-specific `if` branches, no new hardcoded IDs anywhere in `WritingActivity`'s rendering path, no duplicate canonical content, and no coaching item ever appearing in a Mock-context render for either prompt.

---

## PART 8 — MIGRATION 169 SAFETY INSPECTION

Read directly this session. Confirmed:
- Candidate-only insertion — a single `insert ... on conflict (id) do nothing`, no `update`, no `delete`.
- `eligibility_status = 'authentic_assessment_candidate'` on both rows, `content_version = 1`, `active = true` — matches every other candidate migration's convention exactly.
- No `practice_eligible`, `mock_eligible`, or `independently_validated` value anywhere in the file.
- No `ali_family_review` row is written by this migration.
- No reference to `app/mocks` or any Mock form.
- No existing row (any of the 7 canonical prompts, or any other table) is read, referenced, or modified.
- Idempotent (`on conflict (id) do nothing`) — safe to run more than once.
- Header explicitly states "NOT APPLIED."

**No defect found. Migration 169 is unchanged by this decision.**

---

## PART 9 — ESLINT ASSURANCE RECORD (carried forward, re-verified this session)

- Baseline at `9b4c30a` (pre-Decision-257): **62 errors** (corrects Decision 254/256's earlier, wrong "5" figure).
- Decision 257 (`b78048d`): 64 errors, **+2** disclosed `react-hooks/refs` findings, unfixed by deliberate choice (consistency with two pre-existing sibling occurrences).
- Decision 258 (`d8f0bb2`): +0.
- Decision 259 (`997ace2`): +0.
- Decision 260 (this session, no code changes made): re-ran ESLint directly — **64 errors, 23 warnings**, identical to Decision 259's state. No drift.

---

## PART 10 — FOUNDER RECOMMENDATIONS

**Your Favourite Place to Be — Approved.** Directly evidenced shape, genuinely fills a real gap, low over-scaffolding risk, moderate but disclosed generic-topic rehearsal risk, clean support-policy compatibility.

**Pocket Money or Helping Anyway? — Approved with amendment.** The underlying task is genuinely structurally distinct from the existing opinion pair and is recommended for content approval. The amendment: the Founder should be aware the checklist reuses 4–5 of 7 items' wording near-verbatim from cookopinion/screentime (craft-mechanics items) — recommend no content change is required, but this should be an explicit, seen judgement rather than an unseen one, which is why it is flagged here rather than silently passed as a clean "Approved."

**An Invented Place — amendment implementation: FOUNDER AMENDMENT IMPLEMENTATION VERIFICATION READY TO RECORD**, per Part 1, subject to the Founder's (or a service-role query's) own confirmation of the two governance facts this session's anon-key access could not reach.

---

*Generated by direct source inspection and the project's real test suite this session (Decision 260). No database write, migration application, eligibility change, Practice/Mock activation, amendment verification, or certification occurred.*
