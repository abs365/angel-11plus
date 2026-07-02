# Angel Learning Intelligence (ALI) — Version

**Current phase:** ALI 2.0 — Mathematics Intelligence (2026-07-02). ALI Version 0.1 (Slice 1 + Phases 1.1–1.4, Verbal Reasoning only) is complete. Mathematics is the second ALI-enabled subject, added by supplying new metadata to the existing architecture — no ALI module was redesigned or duplicated to support it. One subject at a time: English and Vocabulary are the next candidates, each requiring its own validation pass before starting (see Roadmap).

Internal engineering name only — "ALI" never appears in user-facing product language (ALI_DECISION_LOG.md Decision 8).

---

## Current capabilities

- **Question bank** (`ali_question_bank`): content + metadata storage (subject, competency, pathway, content difficulty, question type, estimated time, explanation, hint, confidence weight, learning objective, revision priority, mastery threshold, global usage stats). Schema live in migrations 004–005 (not yet applied to production — see Deployment below). `subject` already accepted `"maths"` from migration 001 — Mathematics needed **zero schema changes**.
- **Mock assembly** (`lib/adaptiveMockBuilder.ts` + `lib/ali/selection.ts`): builds one adaptive section per mock, weighted toward unseen content, respecting per-difficulty question-count cooldowns, with a guaranteed minimum slot reserved for weak-competency remediation. Subject-agnostic since Slice 1 — proven by Mathematics requiring no changes to either file.
- **Anti-repetition:** question-count-based cooldown (not calendar time) — Easy 5 / Medium 10 / Hard 15 / Challenge 20 (floor) intervening questions. A question from the immediately preceding mock can never reappear in the next one, unconditionally.
- **Mastery tracking** (`ali_student_question_history`, `lib/ali/mastery.ts`): evidence-based across distinct sessions (not single-attempt), with configurable per-difficulty default thresholds (`ali_mastery_defaults`), revocable on a subsequent wrong answer.
- **Weak-competency detection** (`lib/ali/weakness.ts`): native to ALI's own history data, at full competency granularity (e.g. distinguishes "weak at Analogies" from "weak at Letter Codes", or "weak at Fractions" from "weak at Geometry") — independent of the app's legacy subject-level replay signal.
- **Difficulty progression:** subject-level confidence tier (foundation/developing/advanced/challenge) drives a target difficulty-mix distribution per mock, re-evaluated between mocks (not live/within-mock).
- **Analytics write-back:** a dual-write bridge feeds both ALI's own tables and the existing localStorage-based confidence/replay/readiness/Parent Insights functions, so results are visible immediately without those four legacy functions being migrated yet.
- **Observability:** every generated mock section logs an internal, console-only trace — per-question selection reason, cooldown status, weak-skill-override firing, and which confidence tier drove the difficulty mix. Never persisted to a new table, never shown to end users.
- **Daily Mission Intelligence** (Phase 1.3): weak competencies get top priority (140+), priority reduces in bands as mastery ratio climbs, mission copy names the specific weak competency. Subject-agnostic (`lib/adaptiveEngine.ts` reads `progress.aliCompetencySignal?.[s.subject]` generically) — proven by Mathematics missions working with zero code changes to this file.
- **Parent Intelligence** (Phase 1.4): competency-first Parent Insights (Strengths / Improving / Focus Next / Recently Mastered) replacing percentage-first messaging for ALI-covered subjects. Also subject-agnostic (`lib/parentInsights.ts` iterates `p.aliCompetencySignal` generically) — proven the same way.
- **Learning Gain** (Phase 1.4, internal only): a symmetric weighted delta measuring improvement over time per subject, not exposed in any UI yet — stored for a future Readiness Shadow Model.

## Supported pathways

- **GL** — the only pathway with any adaptive VR content (its Non-Verbal Reasoning, Numerical Reasoning, and Vocabulary Challenge sections still use the original static-slice logic). The new Mathematics adaptive mock (`app/mocks/adaptive/maths/page.tsx`) is **not pathway-tied** — a standalone practice session, since no existing static mock has a pure Mathematics section to fit alongside (Decision 32).
- CEM, CSSE, ISEB — **not supported.** Their mocks remain entirely on the original static system; ALI has never touched them.

## Supported subjects

- **Verbal Reasoning** — hand-tagging process and competency taxonomy defined (`QUESTION_AUTHORING_STANDARD.md` §3); real question bank content still pending (running on a synthetic dev fixture, visible banner).
- **Mathematics** (new, Phase ALI 2.0) — competency taxonomy defined (`QUESTION_AUTHORING_STANDARD.md` §11, 16 competencies, grounded in the real 20-question `data/maths.ts` corpus and refined beyond the initially suggested list — see Decision 33); real question bank content also pending, same synthetic-fixture pattern as VR.
- All other subjects (English, Vocabulary, Writing, Non-Verbal/Spatial/Numerical Reasoning) remain entirely untouched by ALI. Explicitly one-at-a-time (this phase's directive) — English and Vocabulary are next, each pending its own validation pass before starting (see Roadmap).

## Adaptive behaviours implemented

| Behaviour | Status |
|---|---|
| Dynamic mock assembly (no fixed paper) | ✅ VR (GL) + Maths (standalone) |
| Anti-repetition (question-count cooldown) | ✅ |
| Absolute exclusion of the immediately preceding mock | ✅ |
| Weak-competency remediation (guaranteed minimum slot) | ✅ |
| Evidence-based, revocable mastery | ✅ |
| Configurable mastery thresholds (not hard-coded) | ✅ |
| Subject-level difficulty progression | ✅ |
| Daily Mission prioritisation from ALI data | ✅ VR + Maths, generically for any future subject |
| Competency-first Parent Insights | ✅ VR + Maths, generically for any future subject |
| Internal Learning Gain tracking | ✅ (not exposed in UI) |
| Multi-subject coexistence (two ALI subjects for one student) | ✅ Verified this phase — no interference between subjects' signals |
| Competency-level difficulty progression | ❌ Deferred (Decision 15) |
| Within-mock (live) difficulty adaptation | ❌ Deferred (Decision 2) |
| Confidence/replay/readiness reading from ALI directly | ❌ Still bridged via localStorage (§0.5.3) |
| Readiness Shadow Model (using Learning Gain) | ❌ Not started — `ALI_LEARNING_MODEL.md` §3 proposal, unimplemented |

## Known gaps (carried forward, still open)

1. Parent-facing exam readiness may never progress past "not-ready" for a student using only repeated adaptive mocks (`ALI_VALIDATION_PROTOCOL.md` Finding 1) — pre-existing app characteristic (`completedLessons.length` session counting), not an ALI defect. Unresolved; Learning Gain (Phase 1.4) is a step toward eventually fixing this, not a fix itself.
2. Migrations 004–006 have not yet been applied to the production database — no CLI link available to this project from the current environment, and every session's sandbox so far has had no outbound network route to it. Must be applied manually via the Supabase Dashboard SQL Editor.
3. Neither subject's real question bank content exists yet — both Verbal Reasoning and Mathematics run on synthetic dev fixtures with a visible "sample practice data" banner. The real hand-tagging passes (52 VR questions, 20 Maths questions) remain separate, human-owned tasks per the standing "do not automate metadata generation" principle (Decision 3).

## Roadmap

1. **Validate Mathematics in production usage** — before ALI 2.1 begins, per this phase's explicit "wait for validation" instruction. Not a fixed checklist yet; to be defined once real students have used the Maths adaptive mock.
2. **ALI 2.1 — English Intelligence** (not started, not approved) — pending Mathematics validation.
3. **ALI 2.2 — Vocabulary Intelligence** (not started, not approved) — pending English validation.
4. **Real content** — complete both pending hand-tagging passes, replace both synthetic fixtures.
5. **Live validation** — re-run `ALI_VALIDATION_PROTOCOL.md` Scenarios 5–6 against the real Supabase database once migrations are applied and network access exists.
6. **Longer-term, unscoped:** competency-level difficulty (removing the Decision 15 limitation), migrating confidence/replay/readiness to read from ALI directly, and a Readiness Shadow Model built on Learning Gain. None of these are approved or scheduled.
