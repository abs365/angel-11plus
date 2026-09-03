# Angel 11+ English — Programme Completion Increment 006: Writing Review, Eligibility and Activation Readiness

**Session date:** 3 September 2026. **Commits this increment:** `7f6571e`, `3f98209` (pushed to `origin/main`). **Prior:** `86c8fef`, `7a494e6` (Increment 005, now pushed).

**Governing decision:** Increment 005 approved with one required correction (§1), now applied and pushed. No further Writing authoring occurs this increment — this is a review/reconciliation increment, per direct instruction.

---

## 1. ESLint correction and final engineering verification

The 5 net-new `@typescript-eslint/no-explicit-any` errors in `tests/supabase/programmeCompletionInc005Writing.test.ts` are fixed by replacing `any` with a real `ExtractedWritingPromptJson` interface (mirrors `WritingPrompt`, `types/index.ts`) — no rule suppressed, no config changed. Fixing the type surfaced one genuine latent gap the `any` had masked: `checklist.at(-1)` is `string | undefined`, not `string`; resolved with an explicit non-empty assertion before matching (strengthens the test, doesn't weaken it).

| Guard | Result |
|---|---|
| `tsc --noEmit` | Clean |
| `npm test` | 3169/3169 passing |
| ESLint, full repo | **72 errors / 23 warnings — identical to the pre-Increment-005 baseline, zero net-new errors** (confirmed via `git stash` isolation both before and after this correction) |
| `npm run migration-sql-guard` | PASS — 199 migration files, all quote-balanced |
| `npm run copy-guard` | PASS — 0 violations across 264 files |
| `npm run build` | PASS, exit 0, 56/56 static pages. Two `ReferenceError: location is not defined` messages during static generation are **pre-existing** — confirmed present on the tree before this session's fix via the same stash isolation, unrelated to any file this session touches. |

## 2. Pushed/deployed Increment 005 state

Pushed to `origin/main`: `9622eae..3f98209` (4 commits: the Increment 005 code+content, the Increment 005 report doc, the ESLint correction, the composed-path proof tests). No database migration was applied — commits are code/content-in-migration-files only. Deployment platform status (e.g. Vercel build/deploy confirmation) was **not checked this session** — no deploy-status tooling was available or used; this is disclosed rather than assumed.

## 3. Guided Practice defect — proof

**OLD real mapping** (`lib/learningEngine/writingTeachingContent.ts`, `PROMPT_TYPE_TO_FAMILY`):
```ts
{ reflective: "writing-reflective-discursive", discursive: "writing-reflective-discursive" }
```

**ACTUAL stored prompt type values**: `WritingPrompt.type` (`types/index.ts`) is a closed union: `"narrative" | "descriptive" | "persuasive"`. Confirmed by grepping every `"type":"..."` value across every Writing migration (013 through 198) — no row has ever used, or can type-check as, `"reflective"` or `"discursive"`.

**Why the old branch was unreachable**: the call site (`app/learning-intelligence/practice/[area]/page.tsx`, `WritingActivity`) computes `getWritingTaskFamilyForPromptType(prompt.type)`, where `prompt.type` can only ever be `narrative`/`descriptive`/`persuasive`. The old map's keys (`reflective`/`discursive`) could never match any value that function is ever actually called with — the lookup returned `undefined` for every real prompt, 100% of the time, unconditionally.

**NEW mapping**:
```ts
{ narrative: "writing-reflective-discursive", descriptive: "writing-reflective-discursive" }
```
`persuasive` stays unmapped — `wrt-003` is a genuine, disclosed forced fit (migration 033) with no confirmed CSSE evidence, so it correctly still receives no CSSE-aligned scaffold.

**Tests proving a real prompt now receives the intended scaffold** (`tests/lib/learningEngine/writingTeachingContent.test.ts`, added this increment): three tests call the *exact composed sequence* `WritingActivity` uses — `getWritingTeachingContent(getWritingTaskFamilyForPromptType(promptType))` — for each real type value:
- `"narrative"` → returns the real `writing-reflective-discursive` content object (non-`undefined`, real `whatToNotice`/`planningScaffold` fields) — covers `eng-inc003-writing-imaginedplace-01`, `eng-pc003-writing-difficulttask`, `eng-pc005-writing-somethingnew`.
- `"descriptive"` → same, real content returned — covers `mock-writing-mindchange-01` and every other descriptive-tagged row.
- `"persuasive"` → still correctly returns `undefined` (proves the fix widens coverage, it does not remove the deliberate `wrt-003` exclusion).

All three pass (see commit `3f98209`).

## 4. Core/coaching classification defect — proof

**Affected IDs**: `wrt-003`, `eng-pc003-writing-difficulttask`, `eng-pc003-writing-meaningfulplace` (none had an entry in `WRITING_CHECKLIST_ITEM_SUPPORT_LEVELS`).

**Previous classification result**: `checklistItemSupportLevel(promptId, index)` falls back to `"coaching"` for any id/index not explicitly listed (`lib/writing/supportLevelPolicy.ts` line 87: `levels?.[index] ?? "coaching"`). With no entry, **every** item — including "Write at least six sentences" and the closing proofreading check — was `coaching`.

**What the learner would have lost, previously, under each context** (for `eng-pc003-writing-difficulttask`, 7 items, as a worked example):
- **Guided Practice** (`teaching` context): unaffected — this context always returns the full stored checklist regardless of classification. **No loss here.**
- **Independent Practice**: `presentWritingChecklistForContext` filters to `core` items, then appends one generic reminder if any `coaching` items exist. With zero items classified `core`, the result would have been **only the generic reminder** — "Write at least six sentences" itself would have vanished.
- **Mock-style presentation** (where applicable — not yet live for Writing, but the same policy function is the one that would be called if/when it is): filters to `core` items only. With zero `core` items, the result is **an empty array** — no instructions of any kind, not even the length requirement.

**New classification result** (matches every other real row's own established core/coaching pattern):
- `wrt-003`: `["coaching","coaching","core","coaching","coaching","coaching","coaching","coaching","core"]` — item 3 ("Use three separate, distinct arguments") and item 9 (proofreading) are `core`.
- `eng-pc003-writing-difficulttask`: `["core","coaching","coaching","coaching","coaching","coaching","core"]`.
- `eng-pc003-writing-meaningfulplace`: `["core","coaching","coaching","coaching","coaching","core"]`.

**What is retained now, under each context** (proven by new tests in `tests/lib/writing/supportLevelPolicy.test.ts`):
- **Guided Practice**: full stored checklist, unchanged (as always).
- **Independent Practice**: the `core` items plus the one generic, non-prescriptive reminder — for `difficulttask`/`meaningfulplace`, that means "Write at least six sentences" + proofreading + the reminder now genuinely survive; a new test asserts no `coaching` item leaks through for any of the three ids.
- **Mock-style presentation**: `core` items only, never empty — a new test (`"mock context: {id} retains at least one core item, never collapses to nothing"`) proves the result is non-empty for all three ids, and a second explicit test proves `eng-pc005-writing-personinfluence`/`eng-pc005-writing-somethingnew` retain exactly `["Write at least six sentences", "Check your spelling and punctuation before you finish"]` under Mock.

**Authentic assessment instruction vs. Angel coaching**: preserved exactly as designed — the fix classifies content into the *existing* two-tier system (length/proofreading/safety = authentic; everything else = Angel's own coaching scaffolding), it does not introduce a third category or blur the boundary.

## 5. Migration 169/172/173 lifecycle reconciliation

**Reconstructed from repository evidence only — no live database access used.**

| Migration | What it does | Evidence of live status |
|---|---|---|
| 169 | Inserts `eng-inc003-writing-favouriteplace-01` and `eng-inc003-writing-pocketmoney-01` as `authentic_assessment_candidate` | File header: "NOT APPLIED." Git history: authored in commit `997ace2`, never touched again. `ANGEL_ENGLISH_CONTENT_FOUNDATION_INCREMENT_004_WRITING_FOUNDER_INSPECTION_V1.md` (same-day, 2 Sep evening): "Migration 169 has not been run against any database." |
| 173 | Corrects `eng-inc003-writing-pocketmoney-01`'s checklist (2 of 7 items were near-verbatim duplicates of `mock-writing-cookopinion-01`'s coaching items) and its `addresses_misconception` field — a fail-closed PL/pgSQL block whose own *first* precondition is `select count(*) ... where id = v_id` must equal 1, i.e. **173 cannot even run unless 169 has already been applied.** | File header: "NOT APPLIED." `ANGEL_11PLUS_COMPLETION_READINESS_REGISTER.md` (dated 2026-09-01, the most recent authoritative completion register found in the repo): "**Writing — checklist remediation (migration 173, NOT APPLIED)**." Git history: authored in commit `ea6eaca`, never touched again. |
| 172 | Registers both 169 rows for `pending_independent_review` in `ali_family_review`, keyed by `family_id` | File header: "NOT APPLIED... after (or together with) migration 169." `ANGEL_INCREMENT007_009_REVIEW_PACK_V1.md` (2026-09-01) lists both as still awaiting review, and explicitly instructs: **"Reviewer should assess the CORRECTED checklist (post-173), not the original migration-169 version, if applying migrations before review."** |

**Disposition: MISSING / SAFE APPLICATION REQUIRED for all three — 169, 173, then 172, in that exact order (169+173 may be applied together; 172 must not precede 169).**

**Regression risk this reconciliation catches**: Increment 005's own recommendation ("apply migrations 169+172... together") did not mention 173 at all — migration 173 had not yet been found in Increment 005. Applying 169+172 without 173 would put the *pre-correction*, Founder-identified-as-flawed Pocket Money checklist live, silently discarding an already-authored, already-documented fix. **This correction supersedes Increment 005's own recommendation on this point.** No migration was applied this session — this is a reconciliation only, per direct instruction.

## 6. Migration 198 — complete learner-facing content

| Field | Value |
|---|---|
| Candidate ID / family | `eng-pc005-writing-personinfluence` / `mock-writing-wc01a-personinfluence` |
| Title | Someone Who Has Made a Difference to You |
| Exact prompt | "Think of a person who has genuinely made a difference to you — it could be a family member, a teacher, a friend, or someone else entirely. Write about who they are, what they are like, and describe one specific moment or example that shows the difference they have made. Explain why it has mattered to you." |
| Time | 25 minutes (1500 seconds) |
| Response shape | descriptive (person-portrait + illustrative anecdote + justification) |
| QT type / competency | QT-WC-01a / WC-01 |
| **Authentic assessment instructions** (`core`, survive Independent/Mock) | 1. Write at least six sentences · 6. Check your spelling and punctuation before you finish |
| **Angel coaching checklist** (`coaching`, Guided Practice only) | 2. Describe the person with specific, real detail — not just a list of qualities like 'kind' or 'funny' with nothing to show them · 3. Include one specific moment or example that actually shows the difference they have made, not only a general statement that they have · 4. Explain clearly why this has mattered to you personally · 5. Organise your writing into clear paragraphs |
| Scoring/feedback contract | No per-question right/wrong answer (no Writing prompt has one). `/api/writing-feedback`'s LLM-derived `overallScore` (0–100, uncalibrated against any exam board, disclosed in its own system prompt) is converted to a boolean via `WRITING_CORRECTNESS_THRESHOLD = 70`; recorded with `supportTier: "supported"`, quarantined from independent mastery (same mechanism every Writing row uses). |
| Intended destination | **Practice** (once independently reviewed) — see §10; fills the person-centred gap, no existing row competes with it. |

| Field | Value |
|---|---|
| Candidate ID / family | `eng-pc005-writing-somethingnew` / `mock-writing-wc01a-somethingnew` |
| Title | Something You Would Like to Learn |
| Exact prompt | "Think of something you would genuinely like to learn how to do — it doesn't have to be connected to school, and you don't have to be good at it already. Write about what it is and why it interests you, then imagine what it might actually be like once you could do it — picture one specific moment where you are doing it." |
| Time | 25 minutes (1500 seconds) |
| Response shape | narrative (imaginative projection of a real, plausible future) |
| QT type / competency | QT-WC-01a / WC-01 |
| **Authentic assessment instructions** (`core`) | 1. Write at least six sentences · 6. Check your spelling and punctuation before you finish |
| **Angel coaching checklist** (`coaching`) | 2. Explain clearly what you would like to learn and why it genuinely interests you, not just that it 'sounds fun' · 3. Imagine one specific, particular moment of actually doing it — what you would see, hear, or notice — not a vague general statement like 'I'd be really good at it' · 4. Keep your imagined moment realistic and believable, not an impossible or exaggerated version of yourself · 5. Organise your writing so the order makes sense: what it is and why first, then the imagined moment |
| Scoring/feedback contract | Identical mechanism to above. |
| Intended destination | **Practice** (once independently reviewed) — see §10; the first prospective-orientation row in the whole inventory. |

Both remain in migrations 198/199, **NOT APPLIED**, pending Founder review of this exact content.

## 7–8. Authoritative Writing inventory

**14 rows ever authored in total** (12 pre-Increment-005 + 2 from migration 198). Note on the Founder's "11" framing: this is **11 if `wrt-003` is counted separately** as the sole pre-dating, non-batch legacy row (it predates the whole Continuous Writing candidate-batch programme and is usually discussed apart from it) — the table below includes it for completeness, since historical review decisions must not be erased.

| ID | Title | Migration | Shape | Orientation | Review history | Eligibility | Live-state confidence | Duplicate/template risk | Recommended destination |
|---|---|---|---|---|---|---|---|---|---|
| `wrt-003` | Should Schools Ban Smartphones? | 013 | persuasive | retrospective(n/a) | Never independently reviewed — direct provisional classification (migration 033) | `provisional` | HIGH (long-standing, corroborated by multiple independent session docs) | Sole persuasive-speech register; not itself duplicated | **RETIRE** from Practice-candidate pipeline (keep as historical/quarantined; already correctly `provisional`) |
| `mock-writing-mindchange-01` | A Time You Changed Your Mind | 098 | descriptive | retrospective, event | `approved` (098 batch review) | `independently_validated` | HIGH | Event-recount ("Write about a time...") — 1 of 5 | **PRACTICE** |
| `mock-writing-kindness-01` | An Act of Kindness | 098 | descriptive | retrospective, event | `approved` | `independently_validated` | HIGH | Event-recount — 2 of 5 | **PRACTICE** |
| `mock-writing-cookopinion-01` | Should Everybody Learn to Cook? | 098 | descriptive | retrospective, opinion | `approved` | `independently_validated` | HIGH | Near-verbatim template match to screentime | **PRACTICE** (the surviving member of the duplicate pair) |
| `mock-writing-newplace-01` | Somewhere New | 153 | descriptive | retrospective, event (arrival/change) | `approved_with_amendment` → remediated (158/159) → amendment verification resolved → promoted (160) | `independently_validated` | HIGH | Event-recount — 3 of 5, but structurally distinct (arrival/change arc, not single-moment) | **PRACTICE** |
| `mock-writing-mistakelearned-01` | A Mistake You Learned From | 153 | descriptive | retrospective, event | `approved` (plain, no amendment needed) | `independently_validated` | HIGH | Event-recount — 4 of 5 | **PROTECTED RESERVE** |
| `mock-writing-screentime-01` | Should Children Have Limits on Screen Time? | 153 | descriptive | retrospective, opinion | `approved_with_amendment` → remediated (159) → verification resolved → promoted (160) | `independently_validated` | HIGH | **Near-verbatim template match to cookopinion** (Increment 004 Part 5's own finding) | **REVISE** — needs a migration-173-style checklist remediation before Practice; not authored this increment (no new authoring permitted) |
| `eng-inc003-writing-imaginedplace-01` | An Invented Place | 167 | narrative | pure invention | Never submitted to the independent-review promotion step (distinct from its own separate Amendment Verification track, Increment 004 Part 1, which is content-readiness only) | `authentic_assessment_candidate` | HIGH (live; confirmed by multiple session docs) | None — sole invention-shape row | **PRACTICE**, pending independent review |
| `eng-inc003-writing-favouriteplace-01` | Your Favourite Place to Be | 169 (NOT APPLIED) | descriptive | retrospective, place | `pending_independent_review` registered (172, NOT APPLIED) | n/a — not yet live | **NOT LIVE** (§5) | Similar shape to meaningfulplace | **PRACTICE**, pending 169+173+172 application then review |
| `eng-inc003-writing-pocketmoney-01` | Pocket Money or Helping Anyway? | 169 (NOT APPLIED), corrected by 173 (NOT APPLIED) | descriptive | retrospective, opinion (two-position) | `pending_independent_review` registered (172, NOT APPLIED) | n/a — not yet live | **NOT LIVE** (§5) | Genuinely distinct from cookopinion/screentime post-173 | **PRACTICE**, pending 169+173+172 application then review |
| `eng-pc003-writing-difficulttask` | Something You Found Difficult | 196 | narrative | retrospective, event | `pending_independent_review` registered (197). **Founder reports manually executed 2 Sep 2026, post-state verification outstanding — not treated as confirmed live.** | `authentic_assessment_candidate` (believed, unverified) | **UNVERIFIED** | Event-recount — 5 of 5 | **PROTECTED RESERVE** — a 5th/6th event-recount row would over-saturate the live pool |
| `eng-pc003-writing-meaningfulplace` | A Place That Means Something to You | 196 | descriptive | retrospective, place | Same as above | Same as above | **UNVERIFIED** | Similar shape to favouriteplace | **PROTECTED RESERVE** — holding one of the two near-duplicate place prompts back |
| `eng-pc005-writing-personinfluence` | Someone Who Has Made a Difference to You | 198 (NOT APPLIED) | descriptive | retrospective, person | `pending_independent_review` registered (199, NOT APPLIED) | n/a — not yet live | NOT LIVE | None — sole person-centred row | **PRACTICE**, pending 198/199 application, Founder content approval, then review |
| `eng-pc005-writing-somethingnew` | Something You Would Like to Learn | 198 (NOT APPLIED) | narrative | prospective | `pending_independent_review` registered (199, NOT APPLIED) | n/a — not yet live | NOT LIVE | None — sole prospective row | **PRACTICE**, pending 198/199 application, Founder content approval, then review |

`data/writing.ts`'s `wrt-001`/`wrt-002`/`wrt-004` remain **FIXTURE ONLY** — never migrated into `ali_question_bank`, wrong evidence lineage (free creative-writing/story-opening genre, not QT-WC-01a's evidenced reflective/discursive demand) — **not counted as programme capacity**, unchanged from Increment 005's finding.

## 9. Independent review batch (prepared, not decided)

Per direct instruction, this uses the existing `ali_family_review` / `/admin-beta/review` architecture exclusively — no new review mechanism is proposed. **7 rows are the real outstanding batch**, all already registered `pending_independent_review` (or about to be, pending their content migrations' application):

1. `eng-inc003-writing-imaginedplace-01` (live; review never actually submitted despite being the longest-standing candidate)
2. `eng-inc003-writing-favouriteplace-01` (blocked on 169 application)
3. `eng-inc003-writing-pocketmoney-01` (blocked on 169+173 application; **reviewer must assess the post-173 checklist**, per the existing review pack's own instruction)
4. `eng-pc003-writing-difficulttask` (status per §5/§8 of this table — Founder-reported executed, unverified)
5. `eng-pc003-writing-meaningfulplace` (same)
6. `eng-pc005-writing-personinfluence` (blocked on Founder content approval + 198/199 application)
7. `eng-pc005-writing-somethingnew` (same)

`mock-writing-screentime-01` is **not** added to this batch — it already cleared independent review once (§7 table); it needs a targeted checklist *remediation* (mirroring 173's pattern), not a fresh review submission, and that remediation is out of scope this increment.

**Advisory pre-check only** (against the ten stated criteria) — this is not a review decision, and none of the following is entered into `ali_family_review`:

| ID | CSSE authenticity | Age-appropriate | Clarity | Shape distinction | Instruction/coaching separation | Originality | British English | Template/memorisation risk | Scoring compatibility |
|---|---|---|---|---|---|---|---|---|---|
| imaginedplace | QT-WC-01a evidenced | Yes | Yes | Sole invention shape | Classified (§4, prior increment) | Original | Yes | Low | Standard Writing feedback contract |
| favouriteplace | QT-WC-01a evidenced (CSSE-004/014) | Yes | Yes | Distinct from newplace (steady vs. arrival) | Classified | Original | Yes | Moderate — generic "favourite place" topic could invite a rehearsed answer (disclosed in Increment 004 doc) | Standard |
| pocketmoney | QT-WC-01a evidenced (CSSE-009) | Yes | Yes | Genuinely distinct post-173 | Classified | Original | Yes | Low, post-173 | Standard |
| difficulttask | QT-WC-01a evidenced | Yes | Yes | **Weak — 5th/6th instance of event-recount** | Classified (this increment) | Original | Yes | **High** — over-represented shape | Standard |
| meaningfulplace | QT-WC-01a evidenced | Yes | Yes | Weak — overlaps favouriteplace | Classified (this increment) | Original | Yes | Moderate | Standard |
| personinfluence | QT-WC-01a evidenced | Yes | Yes | **Strong — new subject-focus** | Classified | Original | Yes | Low | Standard |
| somethingnew | QT-WC-01a evidenced | Yes | Yes | **Strong — new orientation** | Classified | Original | Yes | Low | Standard |

A qualified human reviewer must still make the actual decision for each row via `/admin-beta/review`; nothing above is treated as an approval.

## 10. Practice vs. reserve recommendation

Against the planning guides (Practice Launch ~8/≥3 shapes; Protected reserve ~3–4) and the explicit instruction not to consume the whole inventory:

**PRACTICE (9 rows, once each clears independent review + the separate, still-never-exercised Practice-track promotion to `practice_eligible`):** mindchange, kindness, cookopinion, newplace, imaginedplace, favouriteplace, pocketmoney, personinfluence, somethingnew.

**PROTECTED RESERVE (3 rows):** mistakelearned, difficulttask, meaningfulplace.

**REVISE, held out of both pools until fixed:** screentime.

**RETIRED from the candidate pipeline:** wrt-003.

**FIXTURE ONLY, not counted:** wrt-001/002/004.

This deliberately holds back 2 of the 5 event-recount rows and 1 of the 3 place-description rows specifically to avoid a family doing repeated Practice quickly recognising a template, while still meeting the numeric planning guide almost exactly (9 in Practice against a ~8 target; 3 in reserve against a ~3–4 target — both are guides, not mechanically forced).

## 11. Exact remaining Writing depth gap

Even under this favourable allocation, **the binding gap is not content, it is process**: zero Writing rows have ever been promoted to `practice_eligible`, ever, in this codebase's history — not because content is insufficient, but because nobody has yet exercised that separate, deliberate Practice-track promotion decision (distinct from the Mock-track `independently_validated` promotion 6 rows already have). Closing this requires, in order: (a) apply 169+173+172 and 198+199, (b) complete the 7-row independent-review batch above, (c) make the separate decision to promote the resulting approved set to `practice_eligible`. No further authoring is needed to reach the ~8-prompt/≥3-shape Practice Launch guide — the content already exists.

## 12. Writing activation readiness decision

**NOT MET. Writing Practice is not activated this increment.** None of the required evidences hold today: zero independently reviewed rows from the outstanding batch have been reviewed; zero rows are `practice_eligible`; migrations 169/172/173/198/199 remain unapplied; the screentime duplication defect is unresolved. The software `≥2 prompts/≥2 shapes` gate remains a technical minimum only, not evidence of readiness, and is not the basis for this decision.

## 13. Migrations prepared/recommended

No new migration authored this increment (no new Writing content, per instruction). Recommended sequencing for Founder's own future action, **not executed here**: 169 → 173 → 172 (together or in that order), then 198 → 199 (after Founder content-approves §6's exact text), then the independent-review batch (§9), then a separate Practice-track promotion decision.

## 14. Tests/build/guards

See §1 — all green, zero net-new ESLint errors, full suite passing, both named guards passing, build passing.

## 15. Production changes

None. No migration applied. Code changes only (§1, code fixes from Increment 005 + the ESLint correction + proof tests, already pushed).

## 16. Authoritative migration register (updates from Increment 005)

| # | Status |
|---|---|
| 169 | **MISSING / SAFE APPLICATION REQUIRED — must be applied together with or before 173, never alone.** |
| 172 | **MISSING / SAFE APPLICATION REQUIRED — must be applied after (or together with) 169.** |
| 173 | **MISSING / SAFE APPLICATION REQUIRED — corrects 169's own content; never omit when applying 169.** |
| 182 | HOLD / NOT APPLIED. (unchanged) |
| 195 | MANUALLY APPLIED BY FOUNDER 3 SEP 2026; LIVE VERIFIED. (unchanged) |
| 191–194, 196, 197 | MANUALLY EXECUTED BY FOUNDER 2 SEP 2026; POST-STATE LIVE VERIFICATION OUTSTANDING; DO NOT REAPPLY. (unchanged) |
| 198, 199 | NOT APPLIED — pending Founder content review of §6's exact text. |

## 17. Next bounded increment (recommendation)

Apply 169+173+172 and (once Founder approves §6's content) 198+199, then run the actual independent-review batch (§9) through `/admin-beta/review` — this is now genuinely a human-review-throughput increment, not an engineering or authoring one. No further Writing authoring is recommended until that batch is dispositioned.
