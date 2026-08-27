# Angel 11+ English CSSE Programme Blueprint (Decision 227)

Investigation, audit, and programme design only. No content authored, no English Mock composed, no migration, no eligibility changed, no broad visual redesign, no Mathematics file touched. Every finding below is tagged **SOURCE-CONTAINS** (directly re-read from a real CSSE paper in this repository), **AUTHORED-EXTRAPOLATION** (a disclosed extension beyond direct source evidence), **RELATIONSHIP** (a claim about how two things relate, not a first-order source claim), or **INHERITED** (cited from a prior document/decision, not independently re-derived this session).

## 1. Current CSSE English Specification

**SOURCE-CONTAINS**, directly re-read from `knowledge/csse/official-papers/` (2021/2022/2023 Entry — the complete available primary-source base, three years, no fourth exists) this session: the real CSSE English paper has **three sections in one 70-minute sitting**: (1) Comprehension — one passage + questions, 30 min + 10 min separate reading time; (2) Applied Reasoning — 10 min, 5 questions, 5 marks, present in **all three** papers held in this repository; (3) Continuous Writing — a separate booklet, 20 min, 2 fixed-order prompts (reflective/discursive first, picture-narrative second), "at least six sentences" each, double-marked with moderation. Total marks are stable at **60** across all three years, with the internal Comprehension/Writing split shifting (2023 shows real internal movement — a minor, disclosed cross-check discrepancy in the exact 2023 Comprehension figure, not resolved this session, flagged rather than silently reconciled).

**RELATIONSHIP, Founder-confirmed, not itself SOURCE-CONTAINS** (Decision 58, unchanged, re-confirmed this session — no later decision reopens it): Applied Reasoning is excluded from the live CSSE English paper **from September 2024 (2025 Entry) onward** — a claim about a cycle newer than any paper held in this repository, not contradicted by the fact all three real papers here still show it (they predate the removal). **Current CSSE English preparation = Comprehension + Continuous Writing only.** Legacy AR-01 competency/`QT-AR-01` code remains preserved as unedited historical record but must stay excluded from any current Mock, Practice, or authoring — already correctly implemented, not a new instruction.

## 2. Real-Paper Evidence Map

**SOURCE-CONTAINS**, re-confirmed this session: Comprehension question counts recur with real variation (12/16/12 across the three years) rather than a fixed count. Recurring reasoning demands, confirmed against Angel's own competency frame: literal retrieval (RC-01), inference/justified interpretation (RC-02 — the single most frequent pattern across all three years, 3-5 instances/year, via quote-explain, tick-justify, emotion-cause, and two-character comparative sub-shapes), vocabulary/phrase-meaning-in-context (RC-03, present in 2 of 3 years), sequential ordering (RC-04). **AUTHORED-EXTRAPOLATION, already built, not fresh this session**: a below-competency archetype-family taxonomy (`ENGLISH_WAVE2_COVERAGE_MATRIX_V1.md`, dated 2026-08-13, itself SOURCE-CONTAINS-derived) already extended the QT taxonomy twice with real justification — `QT-RC-07` (two-character comparative inference) and `QT-RC-09` (multi-select, explicitly disclosed as the thinnest-evidenced family, only 1 of 3 years). **The RC-01–04 competency-level frame is confirmed sound and complete**; it is not the layer where any gap exists.

Continuous Writing: **SOURCE-CONTAINS, inherited from a prior direct-read session** — 2 prompts/year, fixed genre order, minimum six sentences, double-marked with moderation every year. Its own governing document's explicit finding, **independently corroborated by a second, separate evidence thread this session** (Decision 60's own AI-feedback quarantine history): **"marking rubric evidence remains insufficient for a defensible numeric score."** No genuine CSSE-equivalent Continuous Writing score exists or should ever be claimed — this is a structural fact about the exam's own real marking process, not a gap in Angel's own capability.

## 3. Existing Angel English Inventory

**The one fully current, unambiguous, critical figure**: `mock_eligible` = **0** for both English Comprehension and Continuous Writing content, and **zero `ali_mock_form` rows of subject `english` have ever existed** — confirmed directly this session, no staleness caveat. The Mock engine itself (`ali_mock_form.subject` check constraint, migration 085) is genuinely subject-agnostic and would serve English the moment a real English form existed — this is a content-promotion gap, not an architecture gap.

**Row-count figures below are the last-known, Decision-~161-era citation and are explicitly flagged as likely superseded** — two later, undated-in-this-summary authoring waves (Wave 1 and Wave 2, the same waves that added `QT-RC-07`/`QT-RC-09`, dated 2026-08-13) post-date this snapshot and were not re-tallied by a live migration recount this session, per this task's own "do not carry old figures forward without re-verifying" instruction, honestly disclosed rather than presented as current:

| Status | Comprehension (last known) | Continuous Writing (last known) |
|---|---|---|
| `practice_eligible` | 120 rows (pre-Wave-1/2, likely undercounts current state) | not separately broken out in the cited query |
| `independently_validated` | 13 rows / 1 passage / 12 numbered experiences / 30 marks, all 10 evidenced QT-RC types | 3 prompts, all `QT-WC-01a` |
| `provisional` | 11 | 1 |
| `mock_eligible` | **0 (current, confirmed)** | **0 (current, confirmed)** |

**A stale document was found and flagged this session**: `RELEASE_1_GAP_ANALYSIS.md` (2026-08-05) reports only 18 total rows and lists `QT-RC-01`/`QT-RC-02` as missing — this predates Wave 1/2 entirely (Wave 2's own matrix, 8 days later, shows Wave 1 supply already at 6 for `QT-RC-01`) and **must not be carried forward as current state**.

**ROW vs EXPERIENCE vs PASSAGE vs STRUCTURAL VARIANT**: the one certified passage collapses 13 rows into 12 numbered-question experiences under one shared stimulus — the passage itself is a genuinely distinct unit of capacity from a Mathematics "family" (an English passage constrains and generates multiple question experiences at once; a Mathematics family is one self-contained scenario). **Only one certified passage exists** — the single most consequential capacity fact for English specifically (Section 8/10 below).

**Confirmed critical content gap, unrelated to row-count staleness**: `QT-WC-01b` (the real paper's own picture-stimulus narrative task, Section 1) has **zero authored content and no image-asset pipeline exists anywhere in this codebase** to author it against. Any assembled English Mock today would be missing an entire evidenced paper component, not merely thinner than ideal.

## 4. Competency/Taxonomy Assessment

Confirmed sound at competency level (Section 2). AR-01 correctly, permanently excluded from current work (Section 1). No taxonomy incompleteness found at the RC-01–04 level; the two most recent QT-level extensions (`QT-RC-07`/`QT-RC-09`) were already evidence-justified and already built into the taxonomy, not a fresh gap this session discovered.

## 5. Comprehension Capability Assessment

Angel's Reading Comprehension practice (`ReadingActivity()`, `app/learning-intelligence/practice/[area]/page.tsx`) is **educationally rich, ahead of its own visual polish**: strategy hints, a worked-example toggle, guided-practice scaffolding, an honest self-assessment flow with explicit non-deterministic framing ("Angel can't read and judge an explanation the way a person can..."), classified wrong-answer remediation, and `addresses_misconception` notes (a real defect — present in the data, never rendered — found and fixed for 8 targets in Educational Increment 007O). This genuinely teaches comprehension, not merely tests it, within the bounds of one certified passage. **The passage-diversity-of-1 constraint (Section 3) is the real ceiling on "teaching rather than testing"** — no amount of question-side richness compensates for a learner encountering the same passage repeatedly across a genuinely sustained, multi-month programme.

## 6. Continuous Writing Capability Assessment

**Objective/deterministic checks, real and live** (`lib/learningEngine/writingRubric.ts`): sentence-count minimum (the real, CSSE-evidenced "at least six sentences," replacing an earlier, disclosed-as-invented "60 words" threshold), off-topic detection, template/copy detection (Jaccard similarity against model text), prompt-injection-marker detection — all pure, tested, run **before** any AI call.

**AI-supported feedback, real and live**: `app/api/writing-feedback/route.ts` calls OpenAI `gpt-4o-mini` against exactly the 5 CSSE-evidenced dimensions — Ideas, Vocabulary (incl. spelling), Grammar, Structure, Punctuation — each returned as a qualitative band (`developing`/`secure`/`strong`), never a fabricated numeric sub-score, plus a `confident` boolean the model may honestly set false. Angel's own overall indicator is computed **deterministically server-side** from the 5 bands, never trusting the model's own numeric self-report (found unreliable via live calibration, corrected).

**Rubric-based/advisory boundary, held correctly**: no deterministic PASS/FAIL or official numeric score is ever fabricated anywhere. **Decision 60's mastery quarantine** — every AI-scored Writing attempt is recorded with `supportTier: "supported"` unconditionally, regardless of score or confidence, and never counts toward durable mastery/readiness — is confirmed still standing, re-applied as recently as Educational Increment 007Q, and is independently corroborated (Section 2) by the primary-source evidence itself showing the real exam's own marking process cannot be reduced to a defensible number either. **This is Angel's own boundary held correctly, not a gap to close** — the correct target for a future increment is richer, more specific advisory feedback within this same honest boundary, not a push toward a fabricated score.

**Visual/experience gap, real**: the writing workspace is a bare `<textarea rows={10}>` with a word-count line and a plain checklist — functional, not a considered composition environment (no planning space, no autosave indicator, no distraction-reduced mode). The AI-feedback panel's own "Angel progress indicator: X/100" label sits closer to implying an official score than its own immediately-adjacent disclaimer intends — a small, concrete wording risk worth correcting in a future pass, not a structural defect.

## 7. English Mock Readiness

**A. Reading/Comprehension**: **not ready.** `mock_eligible` = 0; only one certified passage exists (a genuine second-Mock repeat-passage risk even if content were promoted); the pool-level marking-validity and form-assembly gates Mathematics also had to close (migrations 093/104/145 equivalents) do not yet exist for English.

**B. Continuous Writing**: **not ready**, for a different reason — even with content, `QT-WC-01b` (picture-stimulus task) has zero authored content and no image pipeline exists to build it against; a Mock missing an entire evidenced paper component would not be authentic.

**C. Complete English Mock experience**: **not ready.** The Mock *engine* itself is proven and subject-agnostic (confirmed structurally); the *content* has never been promoted past `independently_validated`, and one structural capability (image-stimulus authoring) does not exist at all. This is a content-and-one-capability gap, not an architecture gap — closer in kind to Mathematics' own pre-Decision-210 state than to a from-scratch build.

## 8. Anti-Memorisation Assessment

English carries a **materially higher** memorisation risk than Mathematics for one structural reason: a Mathematics "family" is a self-contained scenario, so 31 single-instance families still gave 31 independently-varying surfaces; **one English passage constrains an entire cluster of question experiences at once** — repeating the passage repeats the whole cluster's context simultaneously, not one isolated fact. With exactly one certified passage today, **any future second Mock or any sustained multi-month Practice programme genuinely cannot avoid passage repetition without new passage authoring** — this is not a tuning problem, it is a hard content-volume floor specific to English's own evidence unit.

**Controls required, by content type**:
- **Passage reuse**: requires the same retirement-tracking concept already named as a standing prerequisite for Mathematics (Decision 222 Part 8) — but for English, retirement operates at the *passage* level, retiring every question attached to it at once, not per-row.
- **Question reuse within a passage**: bounded by the passage itself — once a passage retires, all its questions retire with it; no independent question-level reuse policy is needed beneath a healthy passage-retirement policy.
- **Vocabulary/context reuse**: a genuine risk distinct from passage reuse — repeated *topics* or *vocabulary registers* across nominally different passages could still let a learner pattern-match without comprehension; requires genuine authored variation in subject matter and register, not merely a new passage id.
- **Structural template reuse**: the same "quote-explain"/"tick-justify"/"emotion-cause" archetype shapes will necessarily recur across passages (they are the real exam's own recurring demands, Section 2) — recurrence of the *shape* is expected and correct; recurrence of the *specific wording* is the actual risk to guard against, and requires genuine authored variation per passage, not parameterisation.
- **Practice vs Mock separation**: the same `practice_eligible`/`mock_eligible` positive-allow-list boundary already proven for Mathematics (Decision 220/225's own re-verified `fetchQuestionBank()` filter) applies identically and needs no new mechanism for English.
- **Writing-prompt reuse**: 2 fixed genres recur by the real exam's own design (Section 1) — the risk is a learner memorising a *specific* prompt's own model answer, not the genre shape; requires a genuine pool of distinct prompts per genre, not a single instance each (currently 3 prompts exist, all `QT-WC-01a` — no `QT-WC-01b` instance at all, Section 3).

**What may eventually support safe parameterisation, and what may not** (design boundary only, no generation engine built or designed this session, per explicit instruction): question-level numeric/name substitution within an already-authored, already-reviewed passage-question pair could plausibly be safe for *Mathematics-style* archetypes, but **is not straightforwardly available to English at all** — comprehension questions are not parametric in the same sense (they depend on the specific passage text, not a substitutable numeric variable), so genuine new passages and genuine new questions against them will always require independent educational authoring and review; only within a single already-authored passage might minor variation (e.g. alternate acceptable-answer phrasing for the same underlying question) be a defensible target for future parameterisation, and even that requires human review before use.

## 9. Sustained-Use Capacity

**Question-side** (Comprehension + Writing prompts combined, using the last-known ≈120-row Comprehension `practice_eligible` figure, disclosed as likely stale/an undercount — Section 3): at a Mathematics-comparable session size, a 3-5 sessions/week learner would exhaust meaningful non-repeating question-side variety within a similar multi-week window to Mathematics' own finding (Decision 226) — **not separately re-derived with a fresh live count this session**, disclosed rather than fabricated.

**Passage-side, the real binding constraint, not the question-side count**: with exactly **one** certified passage, a learner doing regular Comprehension practice over even a **single 4-week window** will exhaust the passage's own available question variety and begin re-encountering the same passage — this is true regardless of session frequency, since the constraint is the passage count, not the question count within it. **English cannot currently sustain a genuinely varied multi-month Comprehension programme on passage-side content alone**, independent of any Mathematics-style question-repetition analysis.

**MINIMUM**: at least 4-6 certified passages (enough for roughly a month of genuinely non-repeating rotation at a realistic session frequency), each with a full question cluster across the real archetype taxonomy (Section 2); `QT-WC-01b` authored with at least 1 real instance and a working image pipeline; enough Writing prompts (both genres) that a learner does not see the identical prompt twice within a normal multi-month programme.

**HEALTHY**: 10-15 certified passages, spanning a real range of genre/topic/register (guards the vocabulary/context-reuse risk, Section 8) and the full archetype taxonomy represented multiple times across different passages (guards template-wording reuse); a genuine multi-instance Writing prompt pool per genre; enough total content promoted to `mock_eligible` to support a real, first English Mock.

**STRONG**: 20+ certified passages with deliberate genre/topic/register spread, every archetype family evidenced across at least 3-4 different passages, a second Writing prompt pool ready for a Mock 2-equivalent, and genuine image-stimulus authoring capability proven, not merely a single instance.

## 10. Reporting/Remediation Architecture

The Mathematics principle — assessment → evidence → analysis → child-friendly report → targeted practice → new evidence (Decisions 220-225) — **does not transfer to English unmodified**, because English evidence is not uniformly deterministic the way Mathematics evidence is. **Reusable directly**: the report-row schema shape (`ali_mock_attempt_report`'s reserved `skill_evidence`/`strengths`/`weaknesses`/`competency_evidence` columns, migration 151), the competency-rollup/evidence-threshold discipline (Decision 223's own minimum-2-observations rule), the child-friendly labelling layer (Decision 224's `reportCopy.ts` pattern, directly extensible to RC-*/WC-* competencies), and the targeted-practice routing mechanism (Decision 225's `familyFocusCompetencyId` loop) — all subject-agnostic by construction, none Mathematics-specific in a way that blocks reuse.

**English-specific capability required, not yet built**: an analysis engine that correctly treats Comprehension evidence (mostly deterministic, like Mathematics) and Writing evidence (never deterministic, quarantined from mastery, Section 6) as **structurally different evidence classes within the same report** — a future English report must never present a Writing "band" (developing/secure/strong) with the same evidentiary confidence language a Comprehension "demonstrated securely" carries, or it would silently violate Decision 60's own quarantine by implication even while respecting it in the database. This is a genuine, English-specific design problem, not a Mathematics capability gap to close.

## 11. Visual Experience Audit

Design system reference (`ANGEL_DESIGN_LANGUAGE.md` V3) is current and already correctly assigns English's own identity (BookOpen icon, Purple — no drift found). Both English practice surfaces (`ReadingActivity`, `WritingActivity`, same file as Mathematics' own `MathsActivity`) are **functional but plain**, and concretely, not merely impressionistically, behind the Mathematics Mock report page's own recent (Decisions 223-225) visual standard:

- **Passage text renders at `text-xs`** inside a `max-h-56 overflow-y-auto` scroll box — below the design language's own body-text tier, a genuine readability defect for sustained reading of a real comprehension passage, not a subjective impression.
- Both surfaces use `InfoCard` (the shared card component) but **hand-roll every button** rather than using the shared `Button`/`ButtonLink` component the Mathematics Mock surfaces already standardise on — a real, concrete divergence from the design system's own component-reuse intent.
- The Writing workspace is a bare `<textarea>` with no considered composition-environment chrome.
- **This specific debt pattern (small text, hand-rolled buttons) appears to be shared with Mathematics' own `MathsActivity` in the same large file, not English-specific** — worth treating as a page-wide Practice-experience debt item in any future visual pass, not an English-only defect, though English's own passage-reading use case makes the text-size issue more consequential here than for a short Mathematics question.
- No raw internal codes, QT ids, or database terminology found rendered to any learner on either surface — clean on that specific, previously-established rule.
- Accessibility is genuinely above-average on Comprehension (deliberate focus management, `role="alert"` on errors) and includes at least one deliberate touch on Writing (`motion-reduce:animate-none`).
- No dedicated English Mock/report page exists yet (Section 7) — nothing to audit there.
- `app/mocks/adaptive/english/page.tsx` is legacy (synthetic fixture data, an explicitly self-described "intentional first-pass simplification") and must not be treated as representative of current quality.

**Verdict**: the educational substance of both surfaces is strong; the visual/typographic treatment has not yet received the same deliberate pass Mathematics received across Decisions 223-225. Per this task's own explicit instruction, no redesign is performed here — this section defines the standard a future implementation must meet: shared-component reuse throughout (no hand-rolled buttons where `Button`/`ButtonLink` exists), body-tier typography for sustained passage reading, and a considered Writing workspace, all consistent with `ANGEL_DESIGN_LANGUAGE.md`'s own existing "beautiful, calm, motivating, premium, child-friendly without being childish" language — not a new standard invented here, the existing one simply not yet fully applied to English.

## 12. Target Learner Journey

**Learn → Guided Practice → Independent Practice → Assessment → Mock → Report → Targeted Remediation → Reassessment**, mapped to English's own real structure:

- **Learn/Guided Practice**: already real and live for Comprehension (strategy hints, worked examples, `addresses_misconception` remediation) and partially real for Writing (planning-scaffold questions, gated to CSSE-evidenced task types). Preserve, do not rebuild.
- **Independent Practice**: real and live for both, bounded today by the passage/prompt-volume ceiling (Sections 8-9), not by missing capability.
- **Assessment**: exists in the sense that every Practice attempt already generates real, structured evidence; a distinct "sealed, timed, sectioned" assessment experience (short of a full Mock) does not yet exist for English the way it never separately existed for Mathematics either before Mock 1 — not a gap unique to English.
- **Mock**: not ready (Section 7) — engine proven, content and one capability (image-stimulus) missing.
- **Report**: the Mathematics report architecture is directly reusable in shape (Section 10) but requires an English-specific evidence-class distinction (deterministic Comprehension vs. quarantined-advisory Writing) before it can honestly serve English.
- **Targeted Remediation**: the Decision 225 targeted-practice-routing loop (`familyFocusCompetencyId`) already works for any competency, including RC-*/WC-* — genuinely reusable without English-specific work, once an English report exists to link from.
- **Reassessment**: depends entirely on Mock/report readiness above.

## 13. Content/Capability Gaps (Consolidated)

1. Only 1 certified Comprehension passage (Section 3/8/9) — the single most consequential gap.
2. `QT-WC-01b` (picture-stimulus writing) has zero content and no image pipeline (Section 3/7).
3. `mock_eligible` = 0 for all English content; no `ali_mock_form` row for English has ever existed (Section 3/7).
4. No pool-level marking-validity/form-assembly gate exists yet for English, unlike Mathematics' own proven equivalents (Section 7).
5. No passage-level retirement-tracking concept exists (Section 8), and English needs one at the passage granularity specifically, not the row granularity Mathematics' own still-open prerequisite (Decision 222 Part 8) already names.
6. No English-specific analysis-engine design exists distinguishing deterministic Comprehension evidence from quarantined-advisory Writing evidence within one report (Section 10).
7. Writing-prompt pool is thin (3 instances, one genre only, `QT-WC-01a`) — no `QT-WC-01b` prompt exists at all (Section 3).
8. Row-count figures across all eligibility statuses need a fresh live re-tally — the last-known figures (Section 3) predate the most recent authoring waves and are disclosed as likely stale, not usable as a planning baseline without re-verification.

## 14. Difficulty/Experience Gaps (Visual)

Not a content-difficulty gap in the Mathematics sense (CSSE English does not grade by an easy/medium/hard scale the way Mathematics questions do); the equivalent English gap is **experience quality**, consolidated in Section 11: sub-body-tier passage typography, hand-rolled buttons diverging from the shared component system, and a bare-textarea Writing workspace — none structural, all a defined-but-not-yet-executed future implementation target.

## 15. Minimum/Healthy/Strong Capacity Targets

Restated from Section 9 for completeness against this artifact's own required structure:

- **MINIMUM**: 4-6 passages, `QT-WC-01b` authored with a working image pipeline, no immediately-repeated Writing prompt within a normal programme.
- **HEALTHY**: 10-15 passages with genre/topic/register spread, full archetype taxonomy represented across multiple passages, multi-instance Writing prompt pool per genre, enough `mock_eligible` content for a first real English Mock.
- **STRONG**: 20+ passages, every archetype evidenced across 3-4+ passages, a second Writing prompt pool (Mock-2-equivalent), proven (not single-instance) image-stimulus authoring capability.

## 16. Sequenced Implementation Roadmap (not implemented — planning only)

**Phase 1 — Content Foundation (highest dependency, everything else needs it)**: a fresh, live re-tally of every English eligibility-status row count (closing Section 3's own disclosed staleness); author enough new, genuinely varied passages to reach the MINIMUM target (4-6); author a first `QT-WC-01b` instance and the minimum image-asset pipeline it requires; grow the Writing prompt pool past its current 3-instance, single-genre state.

**Phase 2 — Reading Comprehension Experience**: the visual/typography pass named in Section 11 (shared-component reuse, body-tier passage text), applied once Phase 1 gives it enough real passage content to be worth polishing against.

**Phase 3 — Continuous Writing Foundation**: the considered writing-workspace pass (Section 6/11), plus resolving the "Angel progress indicator: X/100" wording risk, kept strictly within Decision 60's own standing quarantine — richer advisory feedback, never a fabricated score.

**Phase 4 — English Assessment/Mock Foundation**: the pool-level marking-validity/form-assembly gates (mirroring Mathematics' own proven pattern), passage-level retirement-tracking design, and the English-specific evidence-class-aware analysis engine (Section 10) — gated on Phase 1's own content existing first; genuinely cannot be usefully started before Phase 1.

**Phase 5 (separately gated, far downstream, not scheduled)**: an actual English Mock composition and freeze, mirroring the Mathematics Decision 213-219 pattern — requires Phases 1 and 4 both complete.

## 17. STOP/GO Gates

- **GO** for Phase 1 (content foundation): requires a separate, explicit Founder authorisation — **not begun by this decision**.
- **STOP** before Phase 2/3 (visual passes): until Phase 1 provides enough real content to make the pass meaningful, not merely cosmetic on a thin estate.
- **STOP** before any English Mock composition: until Phases 1 and 4 are both complete, matching the exact discipline already proven for Mathematics (content and marking-validity gates both closed before composition, Decisions 210-213).
- **STOP** before any generation/parameterisation capability: no such design exists (Section 8's own explicit boundary), and English's comprehension-question dependency on specific passage text makes this a materially harder problem than for Mathematics — do not attempt before Phase 1's own human-authored depth is well underway.
- **STOP** before claiming a numeric Continuous Writing score of any kind: Decision 60's quarantine and this session's own independently-corroborated primary-source finding (Section 2) both hold; no future increment should weaken this without new evidence neither source currently supports.

---

**Final verdict: A — BEGIN ENGLISH EDUCATIONAL CONTENT FOUNDATION.**
