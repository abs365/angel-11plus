# ANGEL 11+ — CSSE ASSESSMENT PROGRESSION: TWO-PAPER MOCK READINESS REVIEW

Date: 2026-09-09. Read-only review — no code written, no schema touched, no source commit made.

Method: three parallel read-only research passes (CSSE specification + English Mock reality; Mathematics Mock reality + combined-cycle architecture; learner journey + progression ladder + Writing role) plus direct live-production database verification of every load-bearing claim (forms, attempts, cycles, question inventory).

---

## A. Executive finding

**Two independent, real, individually-substantial Mock experiences exist. They are not joined into one complete CSSE assessment.** The joining *infrastructure* (a Mock cycle table, a cycle-aware attempt-creation path, a per-subject completion check) genuinely exists in schema and code — and was even exercised once, for the real Mathematics attempt — but no English attempt has ever been able to join it, no combined result has ever been produced, and the product's own UI explicitly discloses this gap to users today ("Full CSSE Mock (English + Mathematics together)... still being built"). Additionally, the English side is itself only one component of a complete English paper (Comprehension only; Continuous Writing has no Mock presence at all) — so the gap is not solely "not joined," it also includes "one of the two papers is not itself complete yet."

## B. Verified current CSSE assessment model

Per the repo's own most authoritative research (`ALI_DECISION_LOG.md` Decision 58, which supersedes an earlier, explicitly-corrected document):
- **Exactly 2 papers: English and Mathematics.** Applied Reasoning is confirmed **removed** from the current spec (Decision 58, Founder-confirmed from official CSSE information) — not reintroduced anywhere in current Angel content.
- **Mathematics**: 60 minutes, 60 marks, 20-21 questions, no calculator, exact-match marking, frequent multi-part questions. (A-tier evidence.)
- **English (post-AR-removal)**: Comprehension (1 passage, 11-16 questions) + Continuous Writing (2 tasks). Current total marks and total duration for English are **not independently confirmed** by the repo's own research — explicitly named as a gap, not silently assumed. Historical (pre-2024, with AR) was 70 min / 60 marks total.
- **Sitting structure**: the two papers are **taken as two separate timed papers**, not one combined sitting — stated explicitly in the repo's own research. How they combine into one overall CSSE result is not specified (CSSE's own standardisation method is external and unknown to Angel — correctly not fabricated anywhere).

## C. Current English Mock reality

- Real form: `reading-comprehension-mock-1`. **Labelled "Reading Comprehension Mock 1" everywhere in the UI** — never "English Mock" or "English paper." This is an honest, self-limiting label, not an overclaim.
- Live-verified: 65 total marks, 27 numbered questions (28 rows), 3 passages. `subject='english'` (schema-marked subject-pure) but **`attempt_type='timed_section'`, not `'full_mock'`**.
- Its own activation migration (212) states plainly: **"a single-component timed assessment, not a full-subject-paper replica."** Self-disclosed, not something this review is asserting independently.
- Coverage: Comprehension only. **No Continuous Writing anywhere in its Mock lifecycle.** Since a complete CSSE English paper (per §B) requires both components, this Mock does not yet represent a complete English paper on its own — a distinct finding from "not joined to Maths."
- The Founder's own previously-observed **4/65** result is confirmed to represent exactly this: one Comprehension-only timed section, not a complete authentic English paper.
- Questions are Mock-reserved (established firewall discipline, consistent with every other Mock content in this codebase).

## D. Current Mathematics Mock reality

- Real form: `first-mock-mathematics-v1`. `subject='mathematics'`, `attempt_type='full_mock'`, active.
- Live-verified: 56 total marks across 56 gradeable subparts, but **21 distinct numbered questions** (grouped multi-part items, e.g. a 4-part question contributing 4 marks) — closely mirroring the CSSE spec's own "20-21 questions, frequent multi-part items" pattern. 60-minute duration (matches spec exactly). 11 distinct competency codes covered (MR-01 through MR-13, non-contiguous).
- 56 marks vs. the spec's 60 — close, not exact; a small, disclosed near-miss, not a fabricated match.
- The real released **6/56 (10.7%)** result already used successfully for adaptive evidence (prior closure) represents a genuinely complete, structurally CSSE-shaped Mathematics paper — the strongest single piece of content in the whole Mock system.
- Questions are Mock-reserved (confirmed in the prior EI003 verification).

## E. Whether a combined two-paper Mock exists

**No — not as a completable, reportable event, though real joining infrastructure exists.**

- `ali_mock_cycle` is real (migration 085): `id, profile_id, initiated_by, created_at` only — **no combined-result field of any kind**.
- `ali_mock_attempt` gained `subject`/`cycle_id` (migration 085), with a unique index enforcing one attempt per subject per cycle, and `mock_create_cycle_attempt()` requires the target form to be both `subject`-pure and `attempt_type='full_mock'`.
- **Live-verified**: the real Mathematics attempt does have `cycle_id` populated (it went through the cycle-aware path). A real cycle row exists for this exact profile. But that cycle contains **exactly one** attempt — no English attempt has ever joined it, and **none currently can**, because the only live English form is `timed_section`, not `full_mock`.
- `mock_cycle_is_open()` is a real, internal (never client-granted) helper that detects "both subjects submitted" — but nothing in the codebase consumes that signal to produce a combined result. No results page, no combined report, no cross-paper analysis exists anywhere (`grep`-confirmed across `app/`).
- **Most decisive evidence**: the product's own live UI (`app/mocks/page.tsx`) lists **"Full CSSE Mock (English + Mathematics together)"** explicitly under a `COMING_LATER` section, with an author comment stating this was added specifically so a family can see, plainly, that today's Mathematics Mock is not yet that complete experience. This is not an inference — it is the product admitting the gap to its own users today.

## F. Current learner journey

Two separate, independently-startable cards (Mathematics, Reading Comprehension), each with its own "Start mock" button. **No "Paper 1"/"Paper 2" framing anywhere.** No shared instructions-to-results journey. Results for both route to the same Parent Dashboard destination, but the underlying `MockResult` type has **no field distinguishing which subject a result belongs to** — disclosed as a known limitation in the code's own comments, not a genuine combined-result architecture. Two cards on one screen, not architectural integration — confirmed precisely as the brief warned against assuming otherwise.

## G. Exam-familiarity assessment

| Feature | Status |
|---|---|
| Pre-exam instructions | **Present** (real content: materials, quiet space, flag/review, submission is final) |
| Reading time vs working time as distinct phases | **Absent** — one single combined timer; Reading Comprehension's 10-minute reading allowance is folded into one 55-minute total, never separately enforced. Disclosed as a deferred gap in the exam-workspace code's own header. |
| Visible countdown | **Present** |
| Navigation / flag / review before submit | **Present** |
| Unanswered-question handling at submission | **Present** — an explicit "N questions not yet answered" warning, not silent |
| Transition-between-papers screen | **Absent** — structurally impossible today, since there is no second paper in the same sitting to transition to |

## H. Assessment progression ladder

| Stage | Status | Evidence |
|---|---|---|
| Diagnostic | **DORMANT** | `attempt_type="diagnostic_mock"` exists in the schema/type union; no real content found using it |
| Skill/topic check, Mixed check | **Present, but in Practice, not Mock** | These shapes already exist as short, adaptive Practice sessions (a separate, already-verified-working architecture — not part of the Mock lifecycle at all) |
| Timed section | **WORKING** | `reading-comprehension-mock-1`, real, live, used |
| Full English paper | **PARTIAL** | Real Comprehension component exists and is real/substantial; Continuous Writing entirely absent from any Mock lifecycle (§C) |
| Full Mathematics paper | **WORKING** | `first-mock-mathematics-v1`, real, live, close to CSSE spec (§D) |
| Complete two-paper CSSE Mock | **MISSING** | Self-disclosed by the product's own UI (§E) |
| Readiness analysis | **WORKING (per-Mock, not cross-paper)** | The Mock→EI bridge (prior closure) proves real evidence flows into readiness/priority per attempt; no cross-paper readiness synthesis exists |
| Targeted learning | **WORKING** | Proven live in the prior closure (Mock weakness → real, structurally-varied Practice content) |
| Later reassessment | **PARTIAL** | Mechanically possible (nothing prevents a second Mock attempt), but inventory capacity for it is real but limited (§L) |

## I. Individual-paper vs complete-Mock terminology

A real mismatch exists, already self-corrected by the product in one place but not everywhere: `app/mocks/page.tsx`'s own copy for the Mathematics card states "The complete CSSE Mock, with English and Mathematics together, is still being built" — meaning the product **already avoids** calling the standalone Mathematics attempt a "Full CSSE Mock" in that specific location. However, `first-mock-mathematics-v1`'s own `attempt_type` value is literally `full_mock` at the schema/code level, and the general Mock-taking UI (`app/learning-intelligence/mock-exam/page.tsx`) is generically titled around "Mock," not "Mathematics Paper" specifically. The vocabulary risk is real but narrower than "the product currently claims a single-subject paper is the complete CSSE Mock" — it is closer to "the schema's own `full_mock` naming is a term of art that could confuse a future reader/builder," while the actual learner-facing copy in the one place checked already gets this right. Not renamed, per instruction — flagged only.

## J. Results architecture

Confirmed: Angel can show real per-paper results (Mathematics: 6/56, 10.7%, real competency evidence, per the prior closure; Reading Comprehension: 4/65, 6.2%, per the Founder's own earlier citation). **No combined "COMPLETE MOCK" results view exists** — no overall performance, no cross-paper strengths/weaknesses, no combined readiness interpretation. No combined-score formula was found anywhere, invented or otherwise — consistent with the instruction not to fabricate one; Angel correctly does not claim any raw score is an official CSSE standardised result (`OFFICIAL_SCORE_DISCLAIMER`, already confirmed live in the prior closure's own report-page trace).

## K. Readiness architecture

Readiness currently derives from whatever evidence exists in `ali_student_question_history`/`ali_durable_mastery` — Practice, Teaching, and (as of the prior closure) Mock evidence, all pooled together without a "has this child completed both required CSSE papers" gate. **A child can currently appear "ready" (or simply accumulate positive evidence) having taken only the Mathematics Mock, or only the Reading Comprehension Mock, or neither at all** — readiness is evidence-volume-driven, not CSSE-completion-gated. This is a real, disclosed **educational design risk**: nothing in the current architecture distinguishes "broad practice evidence" readiness from "has genuinely sat both required papers" readiness.

## L. Mock-reserved inventory and complete-paper capacity

Live-queried directly against production:

| Subject | Mock-reserved questions (non-practice-eligible) | Consumed by the one live form | Remaining |
|---|---|---|---|
| English | 101 | 28 (Reading Comprehension Mock 1) | ~73 |
| Mathematics | 99 | 56 (first-mock-mathematics-v1) | ~43 |
| Writing | 10 | 0 (no Mock lifecycle at all, §M) | 10 |

**Question count is not the same as authentic complete-paper capacity.** English's ~73 remaining questions are real, but there is no evidence they are organised into passage-linked, complete-paper-shaped units the way the live 65-mark form is — capacity for *another* complete Reading Comprehension paper is plausible but not confirmed. Mathematics's ~43 remaining marks are meaningfully short of a full second 56-60-mark paper from current inventory alone. **Neither subject currently has confirmed capacity for more than one complete authentic paper**, and Writing has zero Mock-lifecycle capacity regardless of its 10-question pool. No content was manufactured to answer this — only counted.

## M. Writing's legitimate role

`lib/ali/pathwayEligibility.ts` confirms Writing **is** part of the CSSE pathway's own Practice-eligible subject list (`csse: ["english", "writing", "maths", "vocabulary"]`). However, Writing has **zero Mock-attempt-lifecycle presence** — `app/writing` contains no references to Mock/attempt/timer concepts at all; it is a standalone Practice/feedback feature. The product's own `COMING_LATER` list explicitly names "Continuous Writing" as not-yet-built for Mock purposes. Writing's low production count (17 rows, from the prior closure) is a Practice-content-depth question, entirely separate from — and should not distort — the CSSE two-paper Mock architecture decision, per instruction. Writing's real, current relevance to the CSSE Mock specifically is: it is the missing second component of a complete English paper (§C, §H), not an unrelated pathway concern.

## N. Copyright/authenticity position

No evidence of any protected CSSE paper content was found in this review — the Mock content encountered (percentage-compounding word problems, linked-algebra problems, comprehension passages) reads as original, skill/difficulty/structure-matched content, consistent with the established, already-verified content-authoring discipline (evidence-quote integrity checks, anti-memorisation checks, marking-contract gates — all previously verified in the EI003 arc). No new concern raised.

## O. P0–P4 gaps

- **P1** — No combined two-paper CSSE Mock exists; the product's own UI already discloses this to users. Prevents authentic complete-CSSE-assessment readiness by definition.
- **P1** — English's own Mock component omits Continuous Writing entirely — even a standalone "English Mock" is not yet a complete English paper by the spec's own two-component definition.
- **P2** — Readiness can currently be reached without either CSSE paper being completed (§K) — a real educational design risk, not currently gated.
- **P2** — Reading time vs working time are not separately enforced (§G) — reduces exam-familiarity fidelity for the one real timed English component that exists.
- **P2** — Confirmed inventory shortfall for a second complete authentic paper in either subject without new content authoring (§L).
- **P3** — `full_mock` as a schema-level term for a single-subject paper is a latent naming/vocabulary risk (§I), not yet a user-facing overclaim in the one place checked.
- **P4** — `diagnostic_mock` attempt type exists but is unused (cosmetic backlog, no current educational impact).

No P0 found.

## P. COMPLETE / PARTIAL / FRAGMENTED / NOT READY

**C. FRAGMENTED.**

Reasoning: real, substantial, non-trivial components genuinely exist and are not merely UI mockups — a close-to-spec Mathematics full paper, a real (if partial) English Comprehension component, and real cycle-joining database/RPC infrastructure that was even exercised once for the Mathematics side. This is meaningfully more built than "PARTIAL" would undersell if PARTIAL is read strictly (per the Founder's own definition, PARTIAL requires "both subject papers substantially exist" as complete papers — English does not, since it lacks Continuous Writing entirely). It is also meaningfully more built than "NOT READY" would suggest, since the Mathematics paper specifically is close to genuinely exam-ready and the joining mechanism is real, tested-once infrastructure, not vapourware. FRAGMENTED — useful, real Mock components exist, but the current architecture does not yet represent an authentic CSSE two-paper assessment progression — is the accurate, evidence-matched verdict.

## Q. Smallest recommended next increment

Not to be implemented now, per instruction. The smallest coherent next move, reusing existing components rather than building a new subsystem:

**A read-only, orchestration-only "Combined Mock Sitting" results view, keyed by the already-existing `cycle_id`.** This requires no new engine: it would read the existing `ali_mock_cycle` row, the existing (already cycle-linked) Mathematics attempt/report, and — once/if a genuinely subject-pure, cycle-eligible English form exists — the existing English attempt/report, presenting them side by side using the already-built report-rendering patterns (`MockAnalysisSections` and equivalents) and the already-working Mock→EI bridge for any cross-paper evidence. This is primarily **orchestration of existing components**, exactly as anticipated — not a new Mock subsystem.

This smallest move deliberately does **not** by itself solve the deeper, separate content decision (§C, §H, §O): whether `reading-comprehension-mock-1` should be re-typed to `full_mock` and extended with Continuous Writing, or whether a new, genuinely complete English paper should be authored alongside it. That is a real, larger decision requiring the Founder's own explicit choice — not bundled into "the smallest move," and not decided by this review.

## R. Exact existing capabilities to reuse

- `ali_mock_cycle` / `ali_mock_attempt.cycle_id` / `ali_mock_attempt.subject` (migration 085) — the joining mechanism, already built, already exercised once.
- `mock_create_cycle_attempt()` / `getOpenMockCycle()` / `startNewMockCycle()` (`lib/mockAttempt/client.ts`) — the cycle-attempt lifecycle, already wired into `app/learning-intelligence/mock-exam/page.tsx`'s existing `full_mock` routing.
- `mock_cycle_is_open()` — the existing, real completion-detection helper (currently unused for anything user-facing; ready to be read from).
- The existing `first-mock-mathematics-v1` full paper, unmodified.
- The existing `reading-comprehension-mock-1` Comprehension component, unmodified (whether or not it is later extended is a separate decision, §Q).
- The existing Mock report-rendering components (`MockAnalysisSections`, `reportCopy.ts` sentence-builders) as the template for a combined view, not a new design.
- The existing, now-live Mock → Educational Intelligence bridge (migration 244, closed GO) for any cross-paper evidence the combined view might want to surface.

---

**STOP. No implementation performed. No recommendation implemented.**
