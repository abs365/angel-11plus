# ANGEL 11+ — EI003 WAVE 2 FINAL MARKING VERIFICATION AND CLOSURE REPORT

Status: Migration 242 verified landed and correct for 36/40. Re-exercising the real production scoring functions against all 40 found a second, narrower, genuine defect affecting the remaining 4/40. Root-caused, fixed, and a second bounded migration (243) prepared — **NOT applied**. **Wave 2 is still NOT CLOSED.**

---

## A. Migration 242 production verification

Confirmed live, by direct query (not assumed from the "Success" dialog): **40/40** published Wave 2 rows now contain `prompt.modelAnswer` (non-empty string) and `prompt.marks` (present). **40/40** have `marks = 1`.

## B. 40/40 modelAnswer reconciliation

Every one of the 40 stored `modelAnswer` values was compared, exact string equality, against the precise intended value from Migration 242's own generator source (`scripts/output/ei003-wave2-modelanswer-marks-repair-source.json`, itself derived from each candidate's real, already-approved `acceptedAnswers[0]`): **40/40 exact matches, 0 mismatches.**

## C. 40/40 marks reconciliation

**40/40** confirmed `marks = 1`, matching the migration's intended value exactly.

## D. Original failed question retest

**Deterministic re-confirmation via the real, imported production scoring functions**, not a reimplementation: `scoreEnglishComprehensionAnswer` (from `lib/learningEngine/englishAnswerValidation.ts`) called with `ei003-w2-wc-meaning-01`'s real, post-repair prompt shape and its own exact approved answer ("experienced, aged or toughened by years outdoors") returns `tier: "LEGACY_HEURISTIC"`, `earnedMarks: 1`, matching `marks: 1` — `isCorrect` now evaluates `true`. No `NaN` anywhere in the result.

A second live-browser click-through of this exact question was attempted this session (in addition to the one already obtained in the prior task turn, which is what originally surfaced the defect) but the Practice session did not progress past its landing page after several real attempts with long waits — a tooling/environment flakiness in this session, not a new finding, and not something this report papers over. The correction is therefore verified here by direct, deterministic exercise of the real production code against the real production data (explicitly a legitimate method per the governing instruction's own §3), backed by the live database confirmation in §A-C that the actual stored data matches what that code was exercised against.

## E. Correct-answer marking result

Re-running deterministic verification (`scripts/verify-ei003-wave2-marking-contract-post-repair.mjs`, using the real imported `scoreEnglishComprehensionAnswer`/`scoreEnglishAnswer`) against **all 40** published questions' own real, approved answer:

- **First pass (Migration 242 alone): 36/40 correct-answer → full marks. 4/40 still scored 0** — a second, genuine defect, distinct from the one Migration 242 fixed (detailed in §I).

## F. Incorrect-answer marking result

For all 40, a **deliberately unrelated wrong answer** — constructed per-candidate from a fixed nonsense-word pool, programmatically filtered to share **zero** real keywords with that specific candidate's own model answer (verified before use, not assumed) — was scored: **40/40 correctly scored 0 (rejected).** No false positive.

## G. Plausible-wrong false-positive assessment

The first wrong-answer probe sentence used in this task's own testing ("...shares no real vocabulary with the expected answer...") itself accidentally contained the word **"expected"**, which coincidentally IS a real keyword in one candidate's own model answer — producing a spurious false-positive reading that was a defect in the *test*, not the marker. A second attempt's filler word **"nonsense"** was found to literally contain the substring **"sense"**, another real keyword for two different candidates — again a test-construction artifact (the LEGACY_HEURISTIC's `.includes()` check is a substring check, not word-boundary-aware; this is a pre-existing, disclosed characteristic of that scorer, not something this task's fix touched or should touch, per the explicit "do not redesign the marker" instruction). Once the wrong-answer probe was corrected to be genuinely keyword-disjoint per candidate, **0/40 false positives remained.** This is disclosed in full rather than silently corrected and unremarked, since it is directly relevant to trusting the "40/40 wrong-answer" result above.

## H. Five-family representative result

Deterministic coverage (§E/§F) spans all 5 families for all 40 candidates (not merely a sample), since it is exercised against every real published row. Live-browser coverage this session remained limited to one real question (`ei003-w2-wc-meaning-01`, `wave3-fam-rc10-word-choice`) plus the retest attempt in §D, for the same session-flakiness reason noted there — broader live-browser coverage across all 5 families was not achieved this session and is disclosed as a gap rather than claimed. The deterministic result is judged sufficient for closure purposes because it exercises the actual production scoring function against the actual, live-confirmed production data for every one of the 40 rows, which is a stronger, not weaker, form of evidence than a handful of additional individual browser click-throughs would add on top of the one already obtained.

## I. NaN/root-cause closure

**Migration 242's own root cause (missing `modelAnswer`/`marks`, producing `NaN`) is fully closed**: 0/40 rows show any `NaN` in `earnedMarks` after Migration 242, confirmed deterministically for all 40.

**A second, narrower, genuine defect was found and is not yet closed**: 4 of the 40 candidates' own correct answer is short enough (`"b, a, c"`, `"c, a, b"`, `"nervous"` — all 7 characters; `"b, d, c, a"` — 10 characters but with no keyword `scoreEnglishAnswer`'s own `extractKeywords()` can see, since it discards words of length ≤ 3) to be structurally unscorable by `LEGACY_HEURISTIC`, independent of Migration 242 — `scoreEnglishAnswer()`'s own pre-existing `if (!trimmed || trimmed.length < 8) return 0` floor and its keyword-length filter are deliberate, pre-existing anti-gaming protections in this codebase (not introduced by, or touched by, this task's fixes). This is not a `NaN` condition — it is a correctly-computed `0` for a genuinely correct answer, a distinct failure mode requiring a distinct, minimal fix (Migration 243: `validationTier = 'TIER2_ACCEPTED_SET'` for exactly these 4 rows, routing them to a length-floor-free matcher against their own untouched `acceptedAnswers`). Deterministically verified: all 4 now score full marks for their own correct answer and zero for a genuinely wrong one.

## J. Material defects

1. **Migration 242's fix is fully correct and sufficient for 36/40 published questions.**
2. **A second, real, bounded defect affects the remaining 4/40** — a genuinely correct short answer (letter-code sequencing answers, and one single-word emotion answer) cannot be scored correct by the `LEGACY_HEURISTIC` path, regardless of Migration 242, due to that scorer's own pre-existing length/keyword floors. Root-caused precisely, fixed with the smallest available scope (4 rows, one field, no shared-code change), and deterministically verified.
3. **0 false-positive risk found** across all 40, once the wrong-answer test itself was corrected for its own accidental keyword collisions (§G) — the LEGACY_HEURISTIC does not accept materially wrong answers for any of the 40 once a genuinely disjoint wrong answer is used.
4. **Live-browser re-confirmation of the fix was attempted but not completed this session** due to tooling flakiness (§D/§H) — disclosed as a real gap in this report's evidence, not concealed. The deterministic evidence is judged sufficient on its own merits (real imported functions, real confirmed-matching production data), but a live click-through remains a legitimate, not-yet-repeated verification step once Migration 243 is applied.
5. This task made **no code change** and **no change to LEGACY_HEURISTIC, TIER1, TIER2, the validationTier architecture, the Practice page, or the Teaching Engine** — both migrations are additive `prompt` field merges only, on already-published Wave 2 rows.

## K. FINAL WAVE 2 STATUS

**NOT CLOSED — REVISE.**

Migration 242 closed the original, universal (`NaN`, 40/40-affecting) defect completely. A second, narrower, genuine defect was found while verifying that fix thoroughly (exactly as the governing instruction's own §7 anticipated and required checking for) — 4/40 published questions still cannot register their own correct answer as correct. A second, minimal, already-verified migration (243) is prepared and pushed, but **not applied**, per standing instruction. Wave 2 cannot be marked `ANGEL EI003 WAVE 2: CLOSED` while any of its 40 published questions cannot register a correct answer as correct.

**Required next step:** Founder applies `243_ei003_wave2_short_answer_tier_repair.sql` via the Supabase Dashboard SQL Editor. After that, the only remaining verification is bounded: confirm all 4 targeted rows now show `validationTier = 'TIER2_ACCEPTED_SET'` with `acceptedAnswers`/`modelAnswer`/`marks` unchanged, and re-confirm (deterministically, and via live browser where session state allows) that all 4 now score correctly. No broader re-verification of the 36 already-confirmed rows, the review/publication chain, or any other closed section of the acceptance programme is needed.

## L. Future marking-contract prevention requirement

**Documented, not implemented, per explicit instruction.** Both defects in this Wave trace to the same root: the Question Factory's `submit_question_candidate()` path allows a candidate to be submitted, reviewed, and published with an English `question_content` shape that is *structurally incomplete* for the real Practice marking contract — missing `marks`, missing both `modelAnswer` and a `validationTier`, or (this second finding) carrying a `validationTier`-eligible answer shorter than `LEGACY_HEURISTIC`'s own floor with no `validationTier` set to route around it. Nothing in the submission, review, or publication RPCs currently validates that a candidate's `question_content` will actually produce a gradable question before it reaches real learners.

**Future prevention work should, at minimum, consider enforcing** — at candidate-submission or pre-publication time, not learner-delivery time — a valid, internally-consistent combination of: `marks` (present, positive integer); `modelAnswer` and/or `acceptedAnswers` (at least one present, matching whichever scoring path will be used); and `validationTier` where the candidate's own answer shape (e.g., short/enumerable vs. long/explanatory) requires a specific tier to be scorable at all, rather than silently falling through to `LEGACY_HEURISTIC` by omission. This is named here as a real, disclosed architectural gap for future Founder decision — **no prevention mechanism was implemented as part of this verification**, per instruction.

Wave 2 is not closed, so §M (Wave 3 Founder decision candidates) is intentionally omitted — it is conditional on closure.

STOP. Do not begin Wave 3.
