# Angel Learning Intelligence (ALI) — Version

**Current phase:** ALI 1.1 — Validation & Observability (2026-07-02). No subject/feature/question-bank expansion this phase; see `ALI_VALIDATION_PROTOCOL.md` for what was validated and what real findings came out of it.

Internal engineering name only — "ALI" never appears in user-facing product language (ALI_DECISION_LOG.md Decision 8).

---

## Current capabilities

- **Question bank** (`ali_question_bank`): content + metadata storage (subject, competency, pathway, content difficulty, question type, estimated time, explanation, hint, confidence weight, learning objective, revision priority, mastery threshold, global usage stats). Schema live in migrations 004–005 (not yet applied to production — see Deployment below).
- **Mock assembly** (`lib/adaptiveMockBuilder.ts` + `lib/ali/selection.ts`): builds one adaptive section per mock, weighted toward unseen content, respecting per-difficulty question-count cooldowns, with a guaranteed minimum slot reserved for weak-competency remediation.
- **Anti-repetition:** question-count-based cooldown (not calendar time) — Easy 5 / Medium 10 / Hard 15 / Challenge 20 (floor) intervening questions. A question from the immediately preceding mock can never reappear in the next one, unconditionally.
- **Mastery tracking** (`ali_student_question_history`, `lib/ali/mastery.ts`): evidence-based across distinct sessions (not single-attempt), with configurable per-difficulty default thresholds (`ali_mastery_defaults`), revocable on a subsequent wrong answer.
- **Weak-competency detection** (`lib/ali/weakness.ts`): native to ALI's own history data, at full competency granularity (e.g. distinguishes "weak at Analogies" from "weak at Letter Codes") — independent of the app's legacy subject-level replay signal.
- **Difficulty progression:** subject-level confidence tier (foundation/developing/advanced/challenge) drives a target difficulty-mix distribution per mock, re-evaluated between mocks (not live/within-mock).
- **Analytics write-back:** a dual-write bridge feeds both ALI's own tables and the existing localStorage-based confidence/replay/readiness/Parent Insights functions, so results are visible immediately without those four legacy functions being migrated yet.
- **Observability (new this phase):** every generated mock section logs an internal, console-only trace — per-question selection reason, cooldown status, weak-skill-override firing, and which confidence tier drove the difficulty mix. Never persisted to a new table, never shown to end users.

## Supported pathways

- **GL** — the only pathway with any adaptive content. Its Verbal Reasoning section is adaptive; its Non-Verbal Reasoning, Numerical Reasoning, and Vocabulary Challenge sections still use the original static-slice logic.
- CEM, CSSE, ISEB — **not supported.** Their mocks remain entirely on the original static system; ALI has never touched them.

## Supported subjects

- **Verbal Reasoning only** — the sole subject with a hand-tagging process, competency taxonomy (`QUESTION_AUTHORING_STANDARD.md` §3), and real (pending) question bank content.
- All other subjects (Maths, English, Vocabulary, Writing, Non-Verbal/Spatial/Numerical Reasoning) are entirely untouched by ALI. Explicitly out of scope until Slice 1 is proven (this phase's purpose).

## Adaptive behaviours implemented

| Behaviour | Status |
|---|---|
| Dynamic mock assembly (no fixed paper) | ✅ VR/GL only |
| Anti-repetition (question-count cooldown) | ✅ |
| Absolute exclusion of the immediately preceding mock | ✅ |
| Weak-competency remediation (guaranteed minimum slot) | ✅ |
| Evidence-based, revocable mastery | ✅ |
| Configurable mastery thresholds (not hard-coded) | ✅ |
| Subject-level difficulty progression | ✅ |
| Competency-level difficulty progression | ❌ Deferred (Decision 15) |
| Within-mock (live) difficulty adaptation | ❌ Deferred (Decision 2) |
| Confidence/replay/readiness reading from ALI directly | ❌ Still bridged via localStorage (§0.5.3) |
| Lessons/quizzes/daily missions as ALI consumers | ❌ Not built — schema is consumer-agnostic and ready, no consumer exists yet besides adaptive mocks |

## Known gaps surfaced by validation (Phase ALI 1.1)

See `ALI_VALIDATION_PROTOCOL.md` §Findings for full detail. Summary:
1. Parent-facing exam readiness may never progress past "not-ready" for a student using only repeated adaptive mocks, due to a pre-existing session-counting model (`completedLessons.length`) that doesn't distinguish "tried once" from "practiced 20 times." Pre-existing app characteristic, not an ALI defect — but ALI's usage pattern exposes it clearly.
2. The Daily Mission's primary slot rarely surfaces VR-specific remediation while other subjects remain untouched, because untouched subjects are weighted more urgently than a merely-weak (not entirely untried) one. Legacy mission logic wasn't designed around a VR-only user.
3. Migrations 004–006 have not yet been applied to the production database — no CLI link available to this project from the current environment, and this session's sandbox has no outbound network route to it. Must be applied manually via the Supabase Dashboard SQL Editor before any of this is live.
4. The real 52-question Verbal Reasoning hand-tagging pass (`QUESTION_AUTHORING_STANDARD.md`) has not happened yet — Slice 1 currently runs on a 16-question synthetic dev fixture only, with a visible "sample practice data" banner.

## Roadmap (not started, ordered by the standing engineering principle: quality before scale)

1. **Close this phase's findings** — decide how readiness/mission logic should account for ALI-only usage (Finding 1/2) before broader rollout.
2. **Real content** — complete the 52-question hand-tagging pass, replace the synthetic fixture.
3. **Live validation** — re-run `ALI_VALIDATION_PROTOCOL.md` Scenarios 5–6 against the real Supabase database once migrations are applied and network access exists.
4. **Slice 2 (not yet scoped/approved):** likely candidates once Slice 1 is proven — competency-level difficulty (removing the Decision 15 limitation), a second adaptive pathway, or migrating confidence/replay/readiness to read from ALI directly instead of the localStorage bridge. None of these are approved or scheduled — this list is not a commitment, only a plausible ordering given the architecture's design intent (`ADAPTIVE_ASSESSMENT_ENGINE_ARCHITECTURE.md` §0.5).
