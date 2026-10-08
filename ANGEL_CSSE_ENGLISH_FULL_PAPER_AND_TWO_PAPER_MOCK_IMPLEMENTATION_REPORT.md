# ANGEL 11+ — COMPLETE CSSE ENGLISH + TWO-PAPER MOCK IMPLEMENTATION REPORT

Date: 2026-09-09. Commit: `ec09f72` (pushed to `origin/main`). Migration 245: **prepared, validated, committed, pushed — NOT applied.** No production activation has occurred.

---

## A. Architecture reused

Built entirely on existing infrastructure — no new engine:
- `mock_score_attempt()`'s existing `subject='writing'` → `requires_manual_marking` routing (confirmed unchanged, verified by direct re-read — zero modification needed).
- `ali_question_bank.marking_mode`'s `'criterion_rubric'` value, reserved since migration 093 explicitly for this exact purpose, never previously used.
- `mock_apply_manual_mark()` (migration 227) as the direct structural precedent for the two new writing-assessment functions.
- `ali_mock_cycle` / `mock_create_cycle_attempt()` (migration 085), unmodified.
- `lib/learningEngine/writingRubric.ts`'s already-live, already-tested 5-dimension rubric and deterministic pre-flight gate — reused, not duplicated.
- The existing Reading Comprehension Mock 1 manifest, copied via SQL subquery into the new form, never hand-transcribed.
- Migration 244's own established idempotency/ownership-gating pattern, mirrored for the new writing-assessment RPCs.

## B. Writing policy implemented

Angel may automatically evaluate Continuous Writing, criteria-based (the official 5-dimension rubric), never claiming equivalence to CSSE's human double-marking — the system prompt already disclaimed this before this increment and remains unchanged. The existing rubric engine is reused, not replaced by a generic score.

## C. Existing 17 Writing rows disposition

**Exactly one** of the four `independently_validated` rows (`mock-writing-mindchange-01`) was promoted to `mock_eligible` — not all four, per the explicit instruction not to promote merely to inflate inventory. The other 16 rows are untouched. `wrt-003` (the genre-mismatched legacy row) was not touched or reclassified this round — flagged, not acted on, consistent with "no implementation" boundaries on content this increment did not need to change.

## D. Q1 capability

**Built and tested.** `mock_persist_writing_assessment()` persists a real, immutable-original, versioned 5-dimension result for any Writing question in a submitted attempt's manifest. The assessment engine (`lib/learningEngine/mockWritingAssessmentEngine.ts`) reuses the live rubric/prompt modules unmodified; 6 unit tests (mocked OpenAI calls) prove: normal-response → `complete`; too-short → `review_required` with the exact deterministic reason; per-dimension model uncertainty → `review_required`; malformed model output → safely defaulted, never thrown; `overallIndicator` always deterministic, never trusted from the model; an OpenAI failure → thrown, never a fabricated pass.

## E. Q2 capability

**Not built — a disclosed, deliberate gap, not an oversight.** No image-generation or licensed-image-sourcing capability exists in this session. `lib/ali/questionFactory/englishQ2PictureNarrativeFamily.ts` fully specifies one task (title, prompt text matching CSSE's own evidenced phrasing pattern, a genre-appropriate planning scaffold distinct from Q1's, rubric compatibility confirmed) with `imageAssetUrl: null` — ready for a future increment with real image-authoring capability to complete without re-deriving the design. **Not inserted into `ali_question_bank`** — an incomplete task must never be marked eligible for any use, per the brief's own instruction.

## F. Visual-stimulus governance

`MockStimulus` (in `lib/mockAttempt/types.ts`) was widened to `MockTableStimulus | MockImageStimulus` — additive, exactly the extension point its own prior comment anticipated ("a future stimulus kind... can be added without redesigning"). `MockImageStimulus.imageAssetUrl: string | null` makes an unauthored image structurally visible/checkable, not silently absent. No image was copied from any real CSSE paper; none exists at all yet for Q2.

## G. Five-dimension marking

Confirmed identical to the official rubric independently verified in the prior contract review: Ideas, Vocabulary (incl. spelling), Grammar, Structure, Punctuation. No additional dimension was invented anywhere in this increment.

## H. Review-required safety

**Deterministic, not model self-confidence** — reuses the existing pre-flight gate's own already-computed signals: `meetsMinimumLength`, `likelyOffTopic`, `likelyTemplateOrCopied`, and each dimension's own `confident` flag. `assessment_status` is `complete`/`review_required` only, exactly as instructed — no invented percentage anywhere. Proven with 6 real test cases, not asserted.

## I. Human-review contract

`ali_writing_assessment` carries `response_text` (immutable, server-read-only, `NOT NULL`), `dimensions`/`assessment_status`/`review_required_reasons` (the original automated result), and separate, additive-only `human_reviewer_profile_id`/`human_review_dimensions`/`human_review_notes`/`human_reviewed_at` columns. `mock_review_writing_assessment()` (admin-only) can only ever ADD a reviewer's judgement — structurally, its own `UPDATE` statement never touches `dimensions`/`response_text`/`assessment_status` (verified by a dedicated structural test asserting exactly this). No review UI/dashboard was built — the brief explicitly scoped this to the data/state contract, not an operational review service; a minimal admin surface remains a smaller, separate follow-up.

## J. English full-paper implementation

`english-full-mock-v1`: `subject='english'`, `attempt_type='full_mock'`, manifest = Reading Comprehension's own 28 rows + 1 newly-`mock_eligible` Q1 Writing row (29 items total). **Honest limitation, not silently absorbed**: this is a Q1-only English form — Q2's absence (§E) means it does not yet represent the FULL CSSE English contract (both genres). It is real, substantial, and closer to complete than anything that existed before this increment, but should not be described as "the complete English paper" until Q2 exists.

## K. Reading/working timing

`reading_phase_minutes = 10`, `default_duration_minutes = 70` on the new form only — every existing form (both columns null) is completely unaffected, confirmed by 3 dedicated structural tests plus the full regression suite (0 new failures). `mock_submit_answer()` refuses any answer during the first 10 minutes; `mock_start_attempt()` uses the form's own server-authoritative duration, never trusting a client-supplied override once the form declares one.

## L. Mathematics reuse

**Untouched.** No change to `mock_score_attempt()`, `mock_analyse_attempt()`, `mock_release_report()`, or `mock_apply_manual_mark()` — confirmed by a dedicated structural test asserting none of these four functions appear anywhere in migration 245. The one Mathematics-adjacent change (`mock_get_active_form()`) is backward-compatible by construction (defaulted parameter) and the new English form is inserted `active=false`, so Mathematics discovery is unaffected either way. **MATHEMATICS HALF: SUFFICIENT FOR ORCHESTRATION** — reaffirmed, not reopened.

## M. `ali_mock_cycle` orchestration

Reused unmodified. The new English form now satisfies `mock_create_cycle_attempt()`'s existing requirement (`subject is not null`, `attempt_type='full_mock'`) — structurally correct, confirmed by direct code/schema comparison — but **not live-exercised**, since the form remains inactive and the migration is unapplied. This is a real, meaningful distinction: the mechanism is provably compatible, not yet provably exercised end-to-end for a real English+Mathematics pair.

## N. Two-paper learner journey

**Not built this increment.** The Founder's own §17 describes the intended flow (Mock Centre → Complete CSSE Mock → English → transition → Mathematics → results); this increment deliberately stopped at the orchestration-*capable* layer (§M) rather than building the learner-facing journey UI, consistent with staying bounded and with the instruction not to activate/publish. `mock_get_active_form()`'s new subject-awareness is a necessary prerequisite for that future UI work, not the UI itself.

## O. Results/readiness

Writing's own result is deliberately never pooled into `overall.rawMarksAchieved`/`rawMarksAvailable` — the report page's new `WritingAssessmentSection` renders it as a clearly separate block, with explicit copy stating Angel does not currently have a confirmed official mark split to combine against. No combined/fabricated CSSE score exists anywhere in this changeset.

## P. Mock → EI integration

**Not extended this round — a disclosed gap, not silently claimed as done.** Migration 244's bridge handles binary correct/incorrect Practice-shaped evidence; Writing's qualitative 5-dimension result does not fit that model directly, and the brief's own caution ("do not allow one Writing response automatically to establish durable mastery") argues for a deliberate, separately-scoped decision rather than a hasty fit into the existing binary pipeline this increment did not have time to design safely. `source="mock"` and idempotency are both preserved everywhere they already applied (untouched); this is specifically about a NEW connection (Writing → EI) that was not built.

## Q. Copyright/originality

No CSSE examination content (question text, mark scheme wording, or imagery) is reproduced anywhere in this changeset. The Q1 content promoted was already-authored, already-reviewed original material (`independently_validated` before this increment). The Q2 task specification is original; its image remains entirely unsourced (§E), so no copyright risk exists there either, by construction of not having one yet.

## R. Tests/build

- New tests: 6 (writing assessment engine, mocked OpenAI) + 20 (migration 245 structural verification) = 26, all passing.
- Full project suite: **4298/4301 pass** — the exact 3 pre-existing, permanently-unrelated failures, unchanged by this work.
- `tsc --noEmit`: clean relative to this change (two explicit, disclosed, well-commented type casts for the not-yet-applied RPC/table, matching migration 244's own established precedent; one narrowed return-type fix in `lib/mockAttempt/workspace.ts` that changes zero runtime behaviour).
- Isolated `next build` (git worktree, bounded changeset only): **exit code 0**, all 65 routes built including the new `/api/mock-writing-assessment`. Worktree removed after.

## S. Migrations requiring Founder action

`supabase/migrations/245_csse_english_full_paper_writing_assessment.sql` — **prepared, validated, committed, pushed, NOT applied.** Contains: the `ali_writing_assessment` table + RLS, `mock_persist_writing_assessment()`, `mock_review_writing_assessment()`, additive timing columns on `ali_mock_form`, extended `mock_start_attempt()`/`mock_submit_answer()`/`mock_get_active_form()`, one content promotion (1 row), and one new, deliberately **inactive** form insert.

## T. Production publication status

**Not published, not activated.** Even once the Founder applies migration 245, `english-full-mock-v1` remains `active=false` — a second, separate, later one-line `UPDATE` is required to make it discoverable at all, and that action was intentionally left out of this migration so the actual "go live" moment stays entirely in the Founder's own hands, per §26's own instruction.

## U. Material defects

None found in what was built (0 new test failures, 0 new typecheck errors, clean isolated build). Two **disclosed, deliberate scope boundaries**, not defects:
- Q2 content cannot exist without an image-authoring capability this session does not have (§E).
- Mock-derived Writing evidence does not yet reach Educational Intelligence (§P) — a deliberately deferred, separately-scoped decision, not an oversight.

## V. GO / REVISE / NO-GO for controlled production activation

**REVISE — before wider activation, not NO-GO, not GO.**

Reconciling against the Founder's own 19 acceptance tests (§24 of the governing brief) honestly:

- **Proven, by test**: G (immutability), F (review-required), H/I (timing, 10+60), most of E (Q1 dimension assessment), S (no duplicate evidence — via the unique constraint + idempotent RPC), R (no Mock content leaks — the promoted row is `mock_eligible`, never `practice_eligible`), L (Mathematics unaffected), O (no fake combined score), N (existing `mock_cycle_is_open()` logic untouched, so "requires both papers" is inherited correctly).
- **Structurally correct but not live-exercised** (migration unapplied, form inactive): C (Mock Q1 accepts unsupported timed writing), M (both attempts can join one cycle), J (no hints during live Mock — preserved by construction, not re-tested against a real running attempt).
- **Not met / explicitly out of scope this round**: B and D (Q2 does not exist), K in the strict "both mandatory CSSE components present" sense (Q2 absent), Q (Writing evidence does not yet enter EI).

This is real, substantial, well-tested progress that closes the specific material gap the prior contract review identified for Q1 — but it does not yet satisfy every one of the Founder's own 19 acceptance tests, most importantly Q2's total absence and the EI connection. Declaring GO would overstate what exists; declaring NO-GO would understate genuinely working, tested capability. **REVISE**: apply migration 245 when ready, but treat wider activation (making `english-full-mock-v1` discoverable) as gated on a further, explicit decision about Q2 and the EI connection — not on any defect in what this increment actually built.

---

**STOP. The recommendation (Q2 authoring, EI connection, learner-journey UI, activation) has not been implemented.**
