# ANGEL 11+ — CSSE TWO-PAPER MOCK PRE-ACTIVATION COMPLETION REPORT

Date: 2026-09-09. Commit: `357c56e` (pushed to `origin/main`, on top of `ec09f72`). Migrations 245, 246, 247: **all prepared, validated, committed, pushed — NONE applied.** No production activation has occurred: `english-full-mock-v1` remains `active=false`, the Complete CSSE Mock remains unpublished, no learner can reach any of this work today.

---

## A. Q2 completion and asset evidence

**Complete.** `public/mock-assets/q2-picture-narrative/old-shed-v1.svg` — an original, hand-authored, copyright-safe SVG ("The Old Shed": an old wooden garden shed with its door ajar, a climbing vine, a large tree, two birds, a gradient sky, ~5.8KB). Confirmed well-formed (custom tag-balance script, 0 errors) and confirmed to render correctly and attractively via a live browser screenshot (temporary local dev server, since removed cleanly). Meets every stated criterion: age-appropriate, suggests multiple plausible narratives without prescribing one, no embedded answer text, no photographic/stock/AI-generated source material, renders clearly at normal size.

`lib/ali/questionFactory/englishQ2PictureNarrativeFamily.ts`'s `imageAssetUrl` now points at this real path (previously `null`). `MockImageStimulus`/`isValidImageStimulus()` (fail-closed: an `imageAssetUrl: null` stimulus is never rendered) and a new `ImageStimulus` React component (modelled directly on `DataTableStimulus.tsx`) are wired into both the standalone and grouped-question render paths of `app/learning-intelligence/mock-exam/page.tsx`.

Migration 246 inserts the real Q2 content row (`eng-q2-picturenarrative-oldshed`, `skill='QT-WC-01b'` — the exact code migration 098's own header named as future, disclosed, not-yet-authored work) and appends it to `english-full-mock-v1`'s manifest. **Gate A: MET.**

## B. Q1/Q2 assessment evidence

Q1 (`mock-writing-mindchange-01`) was already wired by migration 245 and remains untouched in substance. Q2 reuses the identical `mock_persist_writing_assessment()`/`mock_review_writing_assessment()` machinery — no new SQL function was needed, since `ali_writing_assessment.task_type` already allowed `'Q2'`.

`app/api/mock-writing-assessment/route.ts`'s previously-hardcoded `taskType = "Q1"` is fixed: task type is now derived from a real structural signal already on the row's own prompt (`stimulus.type === "image"` → Q2, else Q1) rather than a literal that would have silently mislabelled Q2 responses as Q1 forever.

**A genuine, previously-undisclosed defect was found and fixed while proving this end-to-end** (documented in migration 246's own header): `mock_get_question()` returns the learner-facing question text and marks from `prompt.question`/`prompt.marks`. Every Writing row (including `mock-writing-mindchange-01`, migration 245's own promoted Q1 item) was authored only for Practice's separate consumption contract (`prompt.prompt`/`prompt.title`/`prompt.checklist`) and never set `prompt.question`/`prompt.marks`. Left uncorrected, a learner reaching Q1 in a real, in-progress English attempt would have received a blank/`null` prompt — no visible instruction to write to. `mock_score_attempt()` was unaffected (it already defensively coalesces a missing mark to 1); this was specifically a live-question-display defect, invisible until now because migration 245 was never applied or exercised. Migration 246 fixes it additively (a `jsonb ||` merge, every existing key preserved, Practice's own consumption of the same row completely unaffected). Q2's row was authored with `question`/`marks` present from the start.

**Gates C/D: structurally correct and unit-tested (the SQL logic, the route's task-type derivation, the assessment engine, the report page's rendering), but not live-exercised** — migration 245/246/247 are unapplied, so no real Q2 submission has ever actually flowed through a live database. This is an honest, disclosed limitation, not a claim of live proof.

## C. Two-paper learner journey

Built: `/learning-intelligence/mock-exam/sitting` (hub) and `/learning-intelligence/mock-exam/sitting/results` (sitting result). Reuses 100% of the existing, unmodified `mock-exam` page for actually taking each paper (`?type=full_mock&subject=english|mathematics` — the exact param this pass added to that page, threaded into its existing, already-correct cycle-aware attempt-creation logic). No new Mock engine, no duplicated attempt-creation logic.

The hub reads sitting state fresh on every load via a new, pure, tested reader (`lib/mockAttempt/cycleState.ts`, `getMockCycleAttempts()` in `client.ts`) — never trusted from browser memory. Each paper is gated independently by the same `getActiveMockForm()`/`isMockFormAvailable()` signal every other Mock entry point already uses, so English honestly shows "Not available yet" for as long as `english-full-mock-v1` stays inactive — this page changes nothing about that gate.

## D. Cycle orchestration

Unmodified `ali_mock_cycle`/`mock_create_cycle_attempt()` (migration 085) — reused exactly as designed. `getMockCycleAttempts(supabase, cycleId)` is a new, direct RLS-gated read (owner-scoped `ali_mock_attempt_select_own` policy, migration 070) rather than a new RPC — deliberately, since `mock_cycle_is_open()` is internal-only by design and the owner can already read their own attempt rows. `deriveMockCycleSittingState()` is a pure function computing NOT_STARTED/IN_PROGRESS/SUBMITTED per subject plus `sittingComplete`, covered by 7 unit tests including the exact acceptance-gate scenarios (K/L/M/O below).

## E. English timing

Untouched by this pass. `reading_phase_minutes=10`, `default_duration_minutes=70` remain exactly as migration 245 set them; `mock_start_attempt()`/`mock_submit_answer()` are not touched by migrations 246/247.

## F. Mathematics regression

Untouched. Migrations 246/247 make zero changes to `mock_score_attempt()`, `mock_analyse_attempt()`, `mock_release_report()`, or `mock_apply_manual_mark()` — confirmed by dedicated structural tests in both new migrations' test files. The existing Mathematics full_mock form, its manifest, and its scoring are not referenced anywhere in this pass's changes.

## G. Sitting completion semantics

Enforced entirely by `deriveMockCycleSittingState()`: `sittingComplete` is `true` only when **both** subjects' own attempt status is `submitted`. Tested explicitly: English submitted alone → not complete (gate K); Mathematics submitted alone → not complete (gate L); an expired-but-not-finalised attempt is never treated as submitted (gate M — refresh/resume safety); both submitted → complete (gate O). The hub page renders a deliberate transition message ("English completed. Mathematics remains." / the reverse) only when exactly one paper is done — never auto-advances the learner into the second paper (gate N).

## H. Results/readiness

`/learning-intelligence/mock-exam/sitting/results` composes existing evidence only: each paper's own `ali_mock_attempt_report` (via the existing, unmodified `getMockAttemptReport()`) and English's own `ali_writing_assessment` rows (via the existing, unmodified `getMockWritingAssessments()`). English and Mathematics are always rendered as separate sections (gate P). No combined/official CSSE score is computed or displayed anywhere — the page's own banner states explicitly that no confirmed official English mark split exists (gate Q). Component-level reporting throughout, never false precision.

## I. Writing → Educational Intelligence integration

A new, smallest-legitimate adapter (`lib/mockAttempt/writingEvidenceIntegration.ts`), **not** a reuse of the binary correct/incorrect bridge (`evidenceIntegration.ts`, migration 244) — that bridge's classifier only ever accepts a `correct`/`incorrect` outcome, and Writing outcomes permanently stay `requires_manual_marking` by migration 245's own explicit design, so they were already, correctly, invisible to it (gate W: existing Mock→EI Mathematics behaviour is completely unaffected — confirmed, zero lines of `evidenceIntegration.ts` touched).

Reuses everywhere legitimate: `recordPresentation()`/`recordOutcome()` (the same shared evidence-persistence path every other source uses, `source="mock"`); the **same** `supportTier="supported"` mastery-quarantine mechanism Decision 60 already established for Practice's own Writing evidence (`lib/ali/mastery.ts`'s `countsTowardMastery` gate structurally prevents any single Writing response, Mock or Practice, from ever advancing `distinctCorrectSessions` or reaching `"mastered"` — gate S); the **same** `WRITING_CORRECTNESS_THRESHOLD` (70) Practice's own Writing feedback path already uses, so Mock and Practice Writing evidence now mean the same thing to Educational Intelligence; the existing `QUESTION_TYPE_PRIMARY_COMPETENCY` mapping (`QT-WC-01a`/`QT-WC-01b` → `WC-01`, both already present before this pass).

A human review (`mock_review_writing_assessment()`) supersedes the automated score for this adapter's own correctness question **without ever writing back to `ali_writing_assessment`** — proven by a dedicated test asserting the fake Supabase client records zero calls against that table from this adapter. `assessment_status='review_required'` is recorded as `verified=false` (Angel is not yet confident in the automated read); `'complete'` as `verified=true`.

Idempotent via a new, question-granularity claim (`mock_claim_writing_evidence_ingestion()`, migration 247) — deliberately **separate** from migration 244's own attempt-granularity claim, so Reading (binary) and Writing (qualitative) evidence for the same English attempt are each ingested exactly once, independently, never colliding on one shared claim (gate T).

9 unit tests cover: denied/errored claim → zero writes; a successful claim → `supportTier` always `"supported"`; Q1 and Q2 both resolve to `WC-01`; score-at/above/below-threshold → correct true/false; `review_required`/`complete` → `verified` false/true; human review overrides the automated score without touching the original record.

**Not yet wired to display a "was this ingested" indicator anywhere** — a deliberate, disclosed scope boundary (the brief asked for the adapter and its idempotency, not a new UI surface for it).

## J. Review-required behaviour

The sitting-results page's own banner distinguishes **"Sitting complete — all assessment complete"** from **"Sitting complete — some assessment still under review"** — the second only when at least one Writing assessment has `assessmentStatus === "review_required"`. The rest of the result (Mathematics, Reading Comprehension, any already-`complete` Writing task) renders regardless — a `review_required` item never blocks the sitting from showing (gate U). The pre-existing `WritingAssessmentSection` on the individual paper report page already implements "reviewed supersedes automated for display, without altering the original record" (`humanReviewDimensions ?? dimensions`) — untouched, reused.

## K. Migration status

Three migrations, all prepared/validated/committed/pushed, **none applied**:

- **245** (`ec09f72`, prior pass): `ali_writing_assessment`, the two assessment RPCs, timing columns, subject-aware `mock_get_active_form()`, one Q1 content promotion, the inactive `english-full-mock-v1` form.
- **246** (this pass): the Q1 `question`/`marks` defect fix (additive `jsonb` merge), the real Q2 content row, the manifest append. Pure content — no schema/function/RLS change (structurally verified by its own test).
- **247** (this pass): one additive column (`ali_writing_assessment.ei_evidence_ingested_at`) and one new claim function (`mock_claim_writing_evidence_ingestion`), for the Writing→EI adapter's idempotency. No other schema/RLS change.

**Founder action required, in order, once Founder review is complete:** apply 245, then 246, then 247 (each has a hard ordering dependency on the previous — 246 updates a row 245 creates; 247 adds a column to a table 245 creates). `english-full-mock-v1.active` and any "publish Complete CSSE Mock" step remain **separate, later, one-line actions**, not part of any of these three migrations.

## L. Test/build evidence

- New tests this pass: 17 (image stimulus validators) + 7 (cycle state) + 10 (migration 246 structural) + 9 (writing evidence adapter) + 8 (migration 247 structural) = **51**, all passing.
- 2 pre-existing test files updated (not weakened) to tolerate legitimate structural insertions: `adminReview.sharedStemPresentation.test.ts` (an import-adjacency regex, now asserting the same invariant across a widened import list) and `mockAvailabilityPresentation.test.ts` (a literal count of "Go to Practice" fallbacks, now 3 instead of 2, reflecting the real new `CsseCompleteMockCard`).
- Full project suite: **4340/4343 pass** — the exact 3 pre-existing, permanently-unrelated failures (`candidateStoreMapping.test.ts`, `mr03CoordinateBlueprints.test.ts`, `migration237PublishAnswerPersistenceCorrection.test.ts`), unchanged by this work, per the Founder's own instruction not to treat these as new defects.
- `tsc --noEmit`: clean relative to this change (the same 3 pre-existing, unrelated files' errors remain; zero new errors anywhere touched this pass).
- Isolated `next build` (fresh `git worktree`, bounded 22-file changeset + symlinked `node_modules` + copied `.env.local`): **exit code 0**, all 67 routes built, including the two new sitting pages. Worktree removed after (manual `rm -rf` fallback used for a Windows file-lock on the initial `git worktree remove`, matching this session's established pattern).

## M. Production activation status

**Fully blocked, unchanged from before this pass.** `english-full-mock-v1.active = false` (migration 245, untouched). No migration in this pass or any prior one flips it. The Mock Centre's new "Complete CSSE Mock" card and the sitting hub page both independently, honestly compute their own availability live from `getActiveMockForm()`/`isMockFormAvailable()` — today that resolves to "Not available yet" for English, and the card/hub both render the same honest fallback ("Go to Practice") every other gated Mock entry point in this app already uses. Nothing was activated, published, or made discoverable to a real learner.

## N. Remaining P0/P1/P2 defects

- **P1 (found and fixed this pass, disclosed above in §B):** the Q1 `question`/`marks` display defect. Fixed in migration 246; not yet live-verified against a real database (migration unapplied).
- **P2 (disclosed, not fixed):** the Writing→EI adapter has no UI indicator for "this evidence has been ingested" — a learner/parent cannot currently see that a Writing response contributed to Educational Intelligence. Low priority: the same is true of the existing binary bridge (migration 244), so this is consistency with an existing gap, not a new one.
- **P2 (disclosed, not fixed):** `english-full-mock-v1`'s manifest now contains 30 items (28 Reading + Q1 + Q2); no change was made to `default_duration_minutes` (still 70, i.e. 10 reading + 60 working) to account for Q2's own `timeMinutes: 25` planning/writing allowance. This mirrors the CSSE-evidenced structure (both Writing tasks' ~20min suggested times are folded into the 60min working time, per the authoritative contract established in the prior pass) — not a new gap, but worth the Founder's own attention when reviewing Q2's content, since Angel has not independently re-verified that 60 minutes comfortably covers Reading Comprehension + both Writing tasks together.
- **Founder review of Q2's actual prompt/checklist/visual asset content remains outstanding** — this pass authored and tested the mechanism; it did not obtain independent educational review of the Q2 prompt itself, matching this project's own established convention that new content and its activation are reviewed separately (see migration 246's own header, "Q2 eligibility" section, for the explicit disclosure of departing from the usual authentic_assessment_candidate-first sequencing, and why).
- No other new P0/P1 defect was found in the newly-built orchestration, results, or evidence-adapter code — all covered by passing unit tests; the honest limitation is that none of it has been exercised against a live, applied database (identical in kind to every other not-yet-applied piece of this arc).

## O. Exact Founder action required

1. Review this report and the three migrations' own SQL (245, then 246, then 247).
2. Apply migrations 245 → 246 → 247, in that order, via Supabase Dashboard > SQL Editor.
3. Independently review Q2's actual content (prompt wording, checklist, planning scaffold, and the visual asset itself) — the mechanism is built and tested; the content has not had a separate educational review pass.
4. Only once satisfied: flip `english-full-mock-v1.active = true` (a separate, one-line `UPDATE`, not part of any migration above) to make the Full English Paper — and therefore the Complete CSSE Mock — actually discoverable to a real learner.
5. No other action is required to exercise the two-paper journey once step 4 is done — the hub, results page, and Writing→EI adapter all work off existing/newly-applied infrastructure with no further code change needed.

## P. GO / REVISE / NO-GO

**REVISE remains the correct verdict for wider production activation — but this pass closes every material gap named in the prior REVISE report.**

Reconciling against the governing brief's own 24 acceptance gates (A–X):

- **Proven, by test or direct structural verification:** A (real Q2 asset), B (renders correctly, browser-verified), E (Q1 remains functional — plus a real defect found and fixed), F/G (English timing unchanged), I (Mathematics unchanged), J (English+Mathematics can share one cycle — unmodified mechanism, now exercised by new orchestration code), K/L (neither paper alone completes the sitting), M (refresh/resume-safe — state always re-read, never cached), N (deliberate transition state, no auto-advance), O (both papers → sitting complete), P (results preserve component distinctions), Q (no fabricated score), R (Writing evidence reaches EI via a real, tested adapter), S (no durable mastery from one response — same quarantine mechanism reused), T (idempotent — own dedicated claim), U (review_required never blocks the rest of the result), V (Mock-reserved content stays `mock_eligible`, never `practice_eligible` — unchanged), W (existing Mock→EI Mathematics path untouched), X (existing released Mock results unaffected — no existing table row is ever mutated by 246/247 outside the one guarded, additive `mock-writing-mindchange-01` correction).
- **Structurally correct but not live-exercised** (all three migrations remain unapplied): C (Q2 submission persists correctly), D (Q2 five-dimension assessment works) — both proven by unit tests against the real functions/route logic, not yet proven against a real running attempt, because doing so requires the very production activation this brief continues to forbid.
- **Deliberately out of scope, disclosed, not defects:** independent Founder educational review of Q2's own content (§N); a UI indicator for Writing→EI ingestion status.

This is real, substantial, tested work that closes Q2's absence, the two-paper learner journey's absence, the Mock Centre terminology gap, and the Writing→EI connection — the four gaps the prior report named as unmet. Declaring GO would still overstate what has been *live-exercised* (nothing has, by design — no migration is applied). Declaring NO-GO would understate genuinely working, tested capability. **REVISE, in the narrow sense of "apply migrations 245→246→247 and complete Founder content review before activating"** — not because of any known defect in what was built, but because live production activation itself remains, correctly, a separate, later, explicit Founder decision this pass does not make.

---

**STOP. Migrations 245, 246, and 247 have NOT been applied. The English full paper, the Complete CSSE Mock, and Q2 content all remain unpublished and unreachable by any real learner.**
