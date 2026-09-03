# Angel 11+ English — Programme Completion Increment 005: Writing Depth Report

**Session date:** 3 September 2026. **Commit:** `86c8fef` (local; NOT pushed — Founder decision). **Prior commit:** `9622eae` (Increment 004).

**Scope discipline observed:** no Neon/fabricated production access; no migration applied; migrations 191–197 not reapplied; Writing not activated; English Mock not activated; no standalone Vocabulary; Gates 3–6 not reopened; no Gate 7; no whole-programme completion declared; no Mathematics authoring; no new Reading passage.

---

## 1–5. Writing inventory reconciliation

### 1.1 Complete real inventory (all 12 rows ever authored, every migration 013→198)

| ID | Migration | Type (gate field) | True register | Eligibility (last confirmed) |
|---|---|---|---|---|
| `wrt-003` | 013 | persuasive | Formal persuasive speech (forced fit) | `provisional` — never promoted |
| `mock-writing-mindchange-01` | 098 | descriptive | Personal-event recount ("Write about a time...") | `independently_validated` |
| `mock-writing-kindness-01` | 098 | descriptive | Personal-event recount | `independently_validated` |
| `mock-writing-cookopinion-01` | 098 | descriptive | Societal opinion ("Do you think X?") | `independently_validated` |
| `mock-writing-newplace-01` | 153 | descriptive | Personal-event recount | `independently_validated` |
| `mock-writing-mistakelearned-01` | 153 | descriptive | Personal-event recount | `independently_validated` |
| `mock-writing-screentime-01` | 153 | descriptive | Societal opinion (near-identical template to cookopinion) | `independently_validated` |
| `eng-inc003-writing-imaginedplace-01` | 167 | narrative | Pure imaginative invention (invented place) | `authentic_assessment_candidate` |
| `eng-inc003-writing-favouriteplace-01` | 169 **NOT APPLIED** | descriptive | Place description + justification | file-only, not live |
| `eng-inc003-writing-pocketmoney-01` | 169 **NOT APPLIED** | descriptive | Societal opinion, two-position | file-only, not live |
| `eng-pc003-writing-difficulttask` | 196 | narrative | Personal-event recount ("Write about a time...") | `authentic_assessment_candidate` — **Founder reports manually executed 2 Sep 2026, post-state verification outstanding** |
| `eng-pc003-writing-meaningfulplace` | 196 | descriptive | Place description + justification | same status as above |

`practice_eligible` count across the **entire migration history, every increment**: **0**. No migration has ever promoted a Writing row to `practice_eligible` — confirmed by grepping every migration file for the string, cross-checked against `lib/ali/questionBank.ts`'s `PRACTICE_ELIGIBLE_STATUS` constant.

### 1.2 Response-shape distribution (gate-relevant `type` field)

Even in the best case — 196/197 confirmed applied exactly as authored — the distribution is:

- **descriptive:** 6 independently_validated + up to 3 unverified/unapplied candidates
- **narrative:** 1 live candidate (imaginedplace) + 1 unverified candidate (difficulttask)
- **persuasive:** 1 (`wrt-003`, quality-flagged, `provisional`)

### 1.3 True purpose/register distribution — the finding the gate field hides

The `type` field (narrative/descriptive/persuasive) is a UI/readiness-diversity tag, not a purpose taxonomy. Grouping by **actual task demand**:

| Register | Count | Rows |
|---|---|---|
| Personal-event recount, chronological ("Write about a time...") | **6** | mindchange, kindness, mistakelearned, newplace, difficulttask, (+ wrt-003's persuasive framing of the same underlying demand) |
| Societal opinion / discursive | 3 | cookopinion, screentime (near-verbatim identical template — confirmed in the codebase's own prior critical review, `ANGEL_ENGLISH_CONTENT_FOUNDATION_INCREMENT_004_WRITING_FOUNDER_INSPECTION_V1.md` Part 5), pocketmoney |
| Place description + justification | 3 | favouriteplace, meaningfulplace, (imaginedplace differs — invented, not real) |
| Pure imaginative invention | 1 | imaginedplace |
| Person-centred | **0** | — |
| Prospective/aspirational | **0** | — |

**5 of 11 pre-Increment-005 rows literally open "Write about a time..."** — the exact template the Founder's instruction named as something new content must avoid. It already dominates the existing inventory. Every single row across the whole 11-row inventory is retrospective; none project forward.

### 1.4 Fixture-only content requiring proper lifecycle

`data/writing.ts` (static, never read by any live route since Increment 004's rewrite — confirmed by direct inspection of `app/writing/page.tsx`) holds 4 prompts: `wrt-001` (story-opening narrative, atmospheric), `wrt-002` (pure imaginative-landscape description), `wrt-003` (duplicate of the DB row), `wrt-004` (story-opening narrative, at sea). `wrt-001/002/004` have **never** been migrated into `ali_question_bank`. They are well-written but represent a different genre (free creative-writing/story-opening) than QT-WC-01a's evidenced reflective/discursive, no-stimulus-image demand — promoting them wholesale would repeat exactly the "forced fit" problem already disclosed for `wrt-003`. **Recommendation: leave as protected/deprioritised reserve, do not promote without new evidence.**

### 1.5 Practice vs. protected-reserve recommendation

- **Practice-track candidates (once independently reviewed):** all 8 confirmed-live/near-live rows except `wrt-003`.
- **Protected reserve:** `wrt-001`, `wrt-002`, `wrt-004` (wrong evidence lineage), plus 1–2 of the two new Increment 005 prompts once the inventory is deep enough (per the ~3–4 protected/unseen reserve planning guide).
- **Quarantined, not reserve:** `wrt-003` — quality-flagged forced fit, should not enter Practice as-is.

### 1.6 Exact sustainable Writing depth gap

Against the planning guides (not certification thresholds):

- **Foundation (~9 prompts / 4 shapes):** currently ~8 usable rows (excluding `wrt-003`) across effectively 4 true registers (event-recount, opinion, place, invention) once 196 is confirmed — but event-recount is 5–6× over-represented and opinion is a near-duplicate pair. **Genuine shape count is closer to 2–3 than 4.**
- **Practice Launch (~8 / ≥3 shapes):** numerically close, but not met on genuine variety — still zero person-centred, zero prospective content until this increment's batch.
- **Practice-eligible (software gate):** **0**, unaffected by any of the above — even a fully successful 196/197 application only adds `authentic_assessment_candidate` rows, never `practice_eligible`.
- **Review debt:** 0 of 11 pre-existing candidate/independently-validated rows have ever completed independent review to `mock_eligible`; none has ever been promoted to `practice_eligible`. This — not raw content count — is the actual blocker.

---

## 6. New Writing content authored this increment (migrations 198/199, NOT APPLIED)

Two new QT-WC-01a candidates, closing the two structural gaps found in §1.3/1.6 rather than adding another topic on an already-saturated shape:

**"Someone Who Has Made a Difference to You"** (`eng-pc005-writing-personinfluence`, descriptive) — the first person-centred row in the whole inventory: portrait + one specific illustrative anecdote + justification, not another event-recount or place-description.

**"Something You Would Like to Learn"** (`eng-pc005-writing-somethingnew`, narrative) — the first prospective row in the whole inventory: names a real, plausible future skill and imagines one specific moment of doing it. Structurally closest to `imaginedplace` (both require imagining a specific moment rather than reporting a real past event) but genuinely distinct (real future self vs. an invented external place).

Both: QT-WC-01a, `authentic_assessment_candidate`, 25 minutes, "Write at least six sentences" retained verbatim as the evidenced first item, proofreading retained as the last item, every middle item is disclosed Angel coaching, not exam instruction. No opener resembles "Write about a time...", "Describe a place...", or "Do you think...".

---

## 7. CSSE alignment / originality / editorial evidence

- **CSSE alignment:** both QT-WC-01a, same Confidence-HIGH/EMC-3 evidence basis every prior row in this bank already relies on (`CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md`) — format position Question 1, reflective/discursive demand, no stimulus image, consistent 3/3 known real years. No QT-WC-01b (picture-stimulus) attempted; confirmed no image field anywhere in either prompt JSON (enforced by a new automated test).
- **Originality:** both prompts are original composition; no phrase is drawn from any exam text or from the framework doc's own short quoted fragments.
- **Editorial standard:** contemporary British English, no formulaic AI-style opener, no artificial moral conclusion, no implausible child voice, no repetitive template (an automated test now asserts neither prompt opens "Write about a time..."). Human-review status: **not claimed as human-reviewed** — these are Founder-directed, machine-authored candidates pending independent review, exactly like every prior candidate batch in this codebase's own convention.
- **Copyright:** no overlap with any evidenced CSSE asset or existing prompt topic.

---

## 8. `/writing` learner-experience verification

| Check | Result |
|---|---|
| No fixture leakage | **Verified.** `app/writing/page.tsx` reads only `fetchEligibleWritingPrompts()` → `ali_question_bank`, `eligibility_status = 'practice_eligible'`, `active = true`. `data/writing.ts` is never imported by the route. |
| No candidate/provisional leakage | **Verified**, on both real delivery paths. `/writing`'s own fetch filters `practice_eligible` only. The general Practice pool (`fetchQuestionBank()`, feeding `/learning-intelligence/practice/continuous-writing`) independently enforces the same single-status allow-list (Decision 152 correction) — `provisional` (`wrt-003`) and every Mock-track status are structurally excluded, not merely unlikely. |
| No fabricated AI numeric score | **Verified.** `WRITING_CORRECTNESS_THRESHOLD` and the feedback route's own system prompt explicitly disclose the score is uncalibrated against any exam board; it is quarantined from mastery via `supportTier: "supported"`. |
| Task instructions vs. Angel coaching distinguishable | **Two real defects found and fixed this increment** (see §9). One residual **Observation, not a defect**: `/writing` itself renders `selectedPrompt.checklist` directly and never calls `presentWritingChecklistForContext` — it has no Guided/Independent toggle at all, so it always shows the full checklist regardless of context. This may be intentional for a dedicated single-mode Practice page (distinct from the graduated `/learning-intelligence/practice/continuous-writing` surface, which does apply the policy) — flagged for a Founder decision, not changed unbidden. |
| 25-minute guidance | **Verified** for all candidate/live content — every real QT-WC-01a row, including both new prompts, carries `timeMinutes: 25`, surfaced in the UI's timer chip. |
| Mobile/tablet usability | **Observation, not device-tested this session.** Responsive Tailwind classes present throughout (`md:` breakpoints, flex layout, sticky sidebar collapsing to stacked on small screens), consistent with the rest of the codebase's convention — not independently confirmed on a real viewport this session. |
| Useful fallback from not-ready state | **Verified.** The honest "Writing Practice isn't ready yet" state (loading and empty states rendered identically, matching the Mock Centre's own discipline) links out to `/learning-intelligence/practice`, never fabricates readiness. |

**Current honest state, regardless of the 196/197 verification gap:** `/writing` is **NOT READY**. Even if migrations 196/197 are confirmed to have succeeded exactly as authored, they only add `authentic_assessment_candidate` rows — zero effect on the `practice_eligible` count, which remains 0.

---

## 9. Review lifecycle progress (this increment's code changes)

Two demonstrated code defects were found while verifying §8 and fixed (both in-scope, both bounded, both covered by new/updated tests — 3166/3166 passing, `tsc --noEmit` clean):

1. **`lib/learningEngine/writingTeachingContent.ts`** — `PROMPT_TYPE_TO_FAMILY` was keyed on `"reflective"`/`"discursive"`, values `WritingPrompt.type` (a closed `narrative | descriptive | persuasive` union, `types/index.ts`) can never carry. Guided Practice's worked-example teaching scaffold for Continuous Writing was therefore **unreachable for every real prompt**, despite being reported "Confirmed" in the Increment 004 Founder Inspection doc — that verification called the function with a hand-constructed family id, not the real `prompt.type` value production actually passes through it. Corrected to map the real values (`narrative`, `descriptive`); `persuasive` stays unmapped, since `wrt-003` is a genuine, disclosed forced fit with no confirmed CSSE evidence.
2. **`lib/writing/supportLevelPolicy.ts`** — `WRITING_CHECKLIST_ITEM_SUPPORT_LEVELS` had no entry for `wrt-003` or either of migration 196's two rows. Per the function's own documented fail-safe, an unlisted id defaults **every** item — including the length requirement and the proofreading check — to `coaching`, which would silently strip even the core instructions under Independent/Mock presentation. Closed for all three, plus this increment's two new rows.

Both defects are pre-existing (from Increments 003/004 and the original Decision 257 wiring respectively), not introduced this session; both are now closed with regression coverage.

Review-debt items **preserved exactly as directed**, no silent lifecycle change made:
- Salmon: `APPROVED FOLLOWING REVALIDATION`, historical `requires_revalidation` preserved.
- Pepper's Breakfast / Compass Rose Challenge: historical `approved_with_amendment`, Amendment Verification lifecycle unchanged; Compass Rose remains protected from Practice.
- Fossil Hunter / Two Different Projects: Founder content-approved; independent-review lifecycle kept separate, not converted.
- All new Writing prompts (196 and 198 batches): Founder-directed **candidates only** — not silently treated as independently approved or Practice-eligible.

---

## 10. Migrations prepared this increment

`198_programme_completion_inc005_writing_content.sql` and `199_programme_completion_inc005_writing_pending_review.sql` — both insert-only, idempotent (`on conflict do nothing`), `NOT APPLIED`, mirroring 196/197's structure exactly. Founder remains production execution owner.

---

## 11. Tests / build / guards

- **Full suite:** `npm test` → **3166/3166 passing** (0 fail, 0 skipped). Includes 2 new/updated test files (`tests/supabase/programmeCompletionInc005Writing.test.ts`, new; `tests/lib/writing/supportLevelPolicy.test.ts`, extended) plus corrections to 3 existing writing test files to match the fixed behaviour.
- **TypeScript:** `tsc --noEmit` → clean, no errors.
- **ESLint:** measured before/after this session's changes via `git stash` isolation — **72 → 77 errors** (+5, entirely confined to the new migration-198 test file's `Record<string, any>` pattern, which mirrors the identical, already-accepted convention in migration 196's own test file), **23 → 23 warnings** (+0). Note: the last documented baseline (Decision 260, same evening) recorded 64 errors; this session's own pre-edit measurement found 72 already present in the committed tree — an 8-error drift unrelated to this session's work, not chased further.

---

## 12. Production changes

**None.** No migration applied, no database write, no eligibility_status change, no Practice/Mock activation. The two code fixes (§9) are real, committed, deployable changes but affect only currently-unreachable code paths (Guided Practice teaching-content mapping; checklist support-level classification for content that is not yet `practice_eligible`) — they change no learner-visible behaviour today.

---

## 13. Authoritative migration register (181–199)

| # | Status |
|---|---|
| 181 | EXPECTED LIVE STATE VERIFIED; HISTORICAL MANUAL APPLICATION EVENT UNCONFIRMED; NO REAPPLICATION REQUIRED. |
| 182 | HOLD / NOT APPLIED. |
| 189 | APPLIED MANUALLY BY FOUNDER ON 2 SEP 2026 AND LIVE VERIFIED. |
| 190 | APPLIED AND LIVE VERIFIED. |
| 191 | MANUALLY EXECUTED BY FOUNDER ON 2 SEP 2026; POST-STATE LIVE VERIFICATION OUTSTANDING; DO NOT REAPPLY. |
| 192 | MANUALLY EXECUTED BY FOUNDER ON 2 SEP 2026; POST-STATE LIVE VERIFICATION OUTSTANDING; DO NOT REAPPLY. |
| 193 | MANUALLY EXECUTED BY FOUNDER ON 2 SEP 2026; POST-STATE LIVE VERIFICATION OUTSTANDING; DO NOT REAPPLY. |
| 194 | MANUALLY EXECUTED BY FOUNDER ON 2 SEP 2026; POST-STATE LIVE VERIFICATION OUTSTANDING; DO NOT REAPPLY. |
| 195 | MANUALLY APPLIED BY FOUNDER ON 3 SEP 2026; LIVE VERIFIED; NO FURTHER ACTION REQUIRED. |
| 196 | MANUALLY EXECUTED BY FOUNDER ON 2 SEP 2026; POST-STATE LIVE VERIFICATION OUTSTANDING; DO NOT REAPPLY. |
| 197 | MANUALLY EXECUTED BY FOUNDER ON 2 SEP 2026; POST-STATE LIVE VERIFICATION OUTSTANDING; DO NOT REAPPLY. |
| 198 | NOT APPLIED (new this increment). |
| 199 | NOT APPLIED (new this increment). |

No execution ownership is asserted for 169 or 172 (Decision 259 batch) — the last documented state (Increment 004 Founder Inspection, same day) is explicitly "NOT applied"; nothing in this session's instructions covers them, so they are reported unchanged, not assumed applied.

---

## 14. Updated whole-programme completion position

Not a completion declaration. Writing remains the least mature CSSE English component: zero rows have ever reached `practice_eligible`; the review-lifecycle bottleneck (independent review, never yet completed for any Writing row) is the real blocker, not raw content volume. Two latent code defects affecting Writing's future correctness were found and closed this increment before they could reach a real learner. Reading (Fossil Hunter, Two Different Projects) remains Founder-content-approved with independent review tracked separately. Mathematics reserve (~34 marks) and the 22-mark gap to the 56-mark Mock 2 floor are unchanged (no Mathematics work this increment). Migration 182 remains HOLD.

---

## 15. Next bounded increment (recommendation)

Independent review is now the binding constraint, not content authoring. The highest-value next bounded increment is: **apply migrations 169+172 and 198+199 together (4 candidates), then run a genuine independent-review pass against all outstanding QT-WC-01a candidates** (imaginedplace, favouriteplace, pocketmoney, difficulttask, meaningfulplace, personinfluence, somethingnew — 7 rows), using the existing `mock_writing_prompt_independent_review` workflow, before authoring any further new Writing prompts. Authoring more content ahead of clearing this backlog would only grow the gap between "written" and "practice-eligible."
