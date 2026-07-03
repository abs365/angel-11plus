# Angel Learning Intelligence (ALI) — Version

**Current phase:** ALI 2.1 — Reading Comprehension Intelligence (2026-07-03). ALI Version 0.1 (Slice 1 + Phases 1.1–1.4, Verbal Reasoning only) and ALI 2.0 (Mathematics) are complete. Reading Comprehension is the third ALI-enabled subject and the first to introduce the **Learning Unit** — a permanent architectural concept (Decision 36) for the schedulable, never-split unit of adaptive selection. For Verbal Reasoning and Mathematics a Learning Unit is exactly one question (unchanged behaviour); for Reading Comprehension it is one passage and every question linked to it. One subject at a time: Vocabulary is next, pending its own validation pass (see Roadmap).

Internal engineering name only — "ALI" never appears in user-facing product language (ALI_DECISION_LOG.md Decision 8).

---

## Current capabilities

- **Question bank** (`ali_question_bank`): content + metadata storage (subject, competency, pathway, content difficulty, question type, estimated time, explanation, hint, confidence weight, learning objective, revision priority, mastery threshold, global usage stats, **learning unit id** — migration 007). `subject` already accepted `"maths"` (migration 001) and `"english"` (migration 001) — neither Mathematics nor Reading Comprehension needed a `subject_type` enum change; `question_type` is a plain text column, so English's `"open-response"` value needed no schema change either.
- **Learning Unit** (new, Phase 2.1 — `lib/ali/learningUnit.ts`, `types/ali/learningUnit.ts`, Decision 36): the schedulable, never-split unit of adaptive selection, grouped by `learning_unit_id`. Atomic subjects (VR, Maths) have exactly one question per unit — unchanged behaviour, proven by both subjects' existing selection paths (`lib/ali/selection.ts`, `lib/adaptiveMockBuilder.ts`) continuing to work completely untouched. Reading Comprehension is the first subject where a unit spans multiple questions (one passage).
- **Mock assembly** (`lib/adaptiveMockBuilder.ts` + `lib/ali/selection.ts`): builds one adaptive section per mock, weighted toward unseen content, respecting per-difficulty question-count cooldowns, with a guaranteed minimum slot reserved for weak-competency remediation. Subject-agnostic since Slice 1 — proven by Mathematics requiring no changes to either file. VR and Maths still use this path unchanged; Reading Comprehension uses the new, separate `lib/ali/learningUnit.ts` selection path instead (one Learning Unit chosen per mock, at the highest selection weight if it covers a weak competency), so neither file needed to change to accommodate a subject with multi-question units.
- **Anti-repetition:** question-count-based cooldown (not calendar time) — Easy 5 / Medium 10 / Hard 15 / Challenge 20 (floor) intervening questions. A question from the immediately preceding mock can never reappear in the next one, unconditionally. Applied at Learning Unit granularity for Reading Comprehension (a unit's cooldown threshold uses its hardest constituent question's tier, a documented first-pass convention).
- **Mastery tracking** (`ali_student_question_history`, `lib/ali/mastery.ts`): evidence-based across distinct sessions (not single-attempt), with configurable per-difficulty default thresholds (`ali_mastery_defaults`), revocable on a subsequent wrong answer.
- **Weak-competency detection** (`lib/ali/weakness.ts`): native to ALI's own history data, at full competency granularity (e.g. distinguishes "weak at Analogies" from "weak at Letter Codes", or "weak at Fractions" from "weak at Geometry") — independent of the app's legacy subject-level replay signal.
- **Difficulty progression:** subject-level confidence tier (foundation/developing/advanced/challenge) drives a target difficulty-mix distribution per mock, re-evaluated between mocks (not live/within-mock).
- **Analytics write-back:** a dual-write bridge feeds both ALI's own tables and the existing localStorage-based confidence/replay/readiness/Parent Insights functions, so results are visible immediately without those four legacy functions being migrated yet.
- **Observability:** every generated mock section logs an internal, console-only trace — per-question selection reason, cooldown status, weak-skill-override firing, and which confidence tier drove the difficulty mix. Never persisted to a new table, never shown to end users.
- **Daily Mission Intelligence** (Phase 1.3): weak competencies get top priority (140+), priority reduces in bands as mastery ratio climbs, mission copy names the specific weak competency. Subject-agnostic (`lib/adaptiveEngine.ts` reads `progress.aliCompetencySignal?.[s.subject]` generically) — proven by Mathematics missions working with zero code changes to this file, reconfirmed by Reading Comprehension the same way.
- **Parent Intelligence** (Phase 1.4): competency-first Parent Insights (Strengths / Improving / Focus Next / Recently Mastered) replacing percentage-first messaging for ALI-covered subjects. Also subject-agnostic (`lib/parentInsights.ts` iterates `p.aliCompetencySignal` generically) — proven the same way, reconfirmed by Reading Comprehension.
- **Learning Gain** (Phase 1.4, internal only): a symmetric weighted delta measuring improvement over time per subject, not exposed in any UI yet — stored for a future Readiness Shadow Model.

## Supported pathways

- **GL** — the only pathway with any adaptive VR content (its Non-Verbal Reasoning, Numerical Reasoning, and Vocabulary Challenge sections still use the original static-slice logic). The Mathematics (`app/mocks/adaptive/maths/page.tsx`) and Reading Comprehension (`app/mocks/adaptive/english/page.tsx`) adaptive mocks are **not pathway-tied** — each a standalone practice session, since no existing static mock has a pure section for either subject to fit alongside (Decision 32).
- CEM, CSSE, ISEB — **not supported.** Their mocks remain entirely on the original static system; ALI has never touched them.

## Supported subjects

- **Verbal Reasoning** — hand-tagging process and competency taxonomy defined (`QUESTION_AUTHORING_STANDARD.md` §3); real question bank content still pending (running on a synthetic dev fixture, visible banner).
- **Mathematics** (Phase ALI 2.0) — competency taxonomy defined (`QUESTION_AUTHORING_STANDARD.md` §11, 16 competencies, grounded in the real 20-question `data/maths.ts` corpus and refined beyond the initially suggested list — see Decision 33); real question bank content also pending, same synthetic-fixture pattern as VR.
- **Reading Comprehension** (new, Phase ALI 2.1) — competency taxonomy defined (`ENGLISH_COMPETENCY_FRAMEWORK.md`, 2 approved/populated competencies — `english.inference`, `english.vocabulary-in-context` — out of a 10-competency taxonomy; the other 8 stay on the roadmap until real content exists, per explicit "do not invent competencies without evidence" instruction). First subject where a Learning Unit spans more than one question. Real question bank content pending (10-question synthetic fixture in the meantime, same visible-banner pattern as VR/Maths).
- All other subjects (Vocabulary, Writing, Non-Verbal/Spatial/Numerical Reasoning) remain entirely untouched by ALI. Explicitly one-at-a-time (standing directive) — Vocabulary is next, pending its own validation pass before starting (see Roadmap).

## Adaptive behaviours implemented

| Behaviour | Status |
|---|---|
| Dynamic mock assembly (no fixed paper) | ✅ VR (GL) + Maths (standalone) + Reading Comprehension (standalone) |
| Learning Unit selection (passage never split apart) | ✅ Reading Comprehension only — new in Phase 2.1 (Decision 36) |
| Anti-repetition (question-count cooldown) | ✅ |
| Absolute exclusion of the immediately preceding mock | ✅ |
| Weak-competency remediation (guaranteed minimum slot / top selection weight) | ✅ |
| Evidence-based, revocable mastery | ✅ |
| Full-marks-only correctness rule for free-text answers | ✅ Reading Comprehension only — an intentional first-pass simplification (`ALI_ENGLISH_IMPLEMENTATION_PLAN.md` §2.2), not partial-credit-aware |
| Configurable mastery thresholds (not hard-coded) | ✅ |
| Subject-level difficulty progression | ✅ VR + Maths. Not applied to Learning Unit selection (§ meaningless at a single-pick granularity — a deliberate scope limit, not an oversight) |
| Daily Mission prioritisation from ALI data | ✅ VR + Maths + Reading Comprehension, generically for any future subject |
| Competency-first Parent Insights | ✅ VR + Maths + Reading Comprehension, generically for any future subject |
| Internal Learning Gain tracking | ✅ (not exposed in UI) |
| Multi-subject coexistence (multiple ALI subjects for one student) | ✅ Verified again this phase (VR + Maths + English, zero cross-subject signal leakage) |
| Competency-level difficulty progression | ❌ Deferred (Decision 15) |
| Within-mock (live) difficulty adaptation | ❌ Deferred (Decision 2) |
| Confidence/replay/readiness reading from ALI directly | ❌ Still bridged via localStorage (§0.5.3) |
| Readiness Shadow Model (using Learning Gain) | ❌ Not started — `ALI_LEARNING_MODEL.md` §3 proposal, unimplemented |

## Known gaps (carried forward, still open)

1. Parent-facing exam readiness may never progress past "not-ready" for a student using only repeated adaptive mocks (`ALI_VALIDATION_PROTOCOL.md` Finding 1) — pre-existing app characteristic (`completedLessons.length` session counting), not an ALI defect. Unresolved; Learning Gain (Phase 1.4) is a step toward eventually fixing this, not a fix itself.
2. Migrations 004–007 have not yet been applied to the production database — no CLI link available to this project from the current environment, and every session's sandbox so far has had no outbound network route to it. Must be applied manually via the Supabase Dashboard SQL Editor, in order.
3. No subject's real question bank content exists yet — Verbal Reasoning, Mathematics, and Reading Comprehension all run on synthetic dev fixtures with a visible "sample practice data" banner. The real hand-tagging passes (52 VR questions, 20 Maths questions, 10 English questions) remain separate, human-owned tasks per the standing "do not automate metadata generation" principle (Decision 3).
4. Reading Comprehension's grading is a keyword-overlap heuristic (`scoreAnswer()`), not exact-match like VR/Maths — mastery signal for this subject is noisier and less trustworthy until/unless comprehension grading improves (`ALI_ENGLISH_IMPLEMENTATION_PLAN.md` §3.3). Not addressed this phase.
5. Reading Comprehension's anti-repetition operates at passage (Learning Unit) granularity, and only 5 synthetic passages exist — cooldown will exhaust the pool within a handful of mocks in real use. More passages are a prerequisite for meaningful rotation, more so than for VR/Maths where the schedulable unit is the individual question.

## Roadmap

1. **Validate Reading Comprehension in production usage** — before ALI 2.2 begins, per the standing "wait for validation" pattern. Not a fixed checklist yet; to be defined once real students have used the adaptive English mock. (Mathematics' equivalent production-validation step was superseded by this phase's approval to proceed directly to English planning.)
2. **ALI 2.2 — Vocabulary Intelligence** (not started, not approved) — pending Reading Comprehension validation. `data/vocabulary.ts`'s word/synonym/antonym format is structurally closer to VR/Maths's atomic-question model than Reading Comprehension was (`ENGLISH_COMPETENCY_FRAMEWORK.md` §5) — expected to be a simpler Learning-Unit story (likely unit = word set, per the original architectural requirement).
3. **Real content** — complete all three pending hand-tagging passes (VR 52, Maths 20, English 10), replace all three synthetic fixtures.
4. **Live validation** — re-run `ALI_VALIDATION_PROTOCOL.md` Scenarios 5–6 against the real Supabase database once migrations are applied and network access exists.
5. **Longer-term, unscoped:** competency-level difficulty (removing the Decision 15 limitation), migrating confidence/replay/readiness to read from ALI directly, a Readiness Shadow Model built on Learning Gain, improving Reading Comprehension's grading confidence (possibly reusing the LLM-based grading pattern already proven in `app/api/writing-feedback/route.ts`), and eventually Writing as a fourth ALI subject (Learning Unit = Writing Task, per the original architectural requirement — no design work done yet). None of these are approved or scheduled.
