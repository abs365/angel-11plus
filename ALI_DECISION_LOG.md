# Angel Learning Intelligence (ALI) — Decision Log

Permanent architectural history of ALI. Every entry below was a real decision made during the ALI design/planning process (2026-07-02). This log is appended to, never rewritten — if a past decision is later reversed, add a new entry that supersedes it and note the supersession on the old entry, rather than editing the old entry's content away.

---

### Decision 1 — Evolve from fixed mock papers to an adaptive assessment engine
**Decision:** Replace the static, offset-sliced mock system with a dynamically assembled adaptive engine — no two mocks identical.
**Rationale:** Real beta feedback (from Angel) identified that fixed static mocks are a structural ceiling — every student on a pathway sees the exact same question slice every time (`MOCK_CONFIGS` in `app/mocks/[pathway]/page.tsx`).
**Date:** 2026-07-02
**Implications:** Triggered the full architecture proposal (`ADAPTIVE_ASSESSMENT_ENGINE_ARCHITECTURE.md`) — Master Question Bank, Mock Assembly Engine, difficulty progression, anti-repetition, personalised composition, analytics integration, scalability.

### Decision 2 — Between-mock adaptivity only; no live within-mock difficulty changes
**Decision:** Difficulty is fixed for a whole mock at assembly time and re-evaluated after completion. No live server round-trips inside a running exam session.
**Rationale:** The current mock runner is fully client-side and stable; introducing live difficulty changes would require server round-trips mid-exam, a bigger architectural lift with real regression risk to a working feature.
**Date:** 2026-07-02
**Implications:** No live-adaptivity hooks exist anywhere in the design. Within-mock (CAT-style) adaptivity remains a possible future slice, explicitly out of scope until reconsidered.

### Decision 3 — Hand-tag all 52 Verbal Reasoning questions; do not automate metadata generation
**Decision:** Every question's metadata (`content_difficulty`, `skill`, `estimated_time_seconds`, etc.) is assigned by careful human review, not generated programmatically.
**Rationale:** Metadata quality directly drives selection/difficulty/mastery logic; treated as long-term infrastructure that deserves the same rigor as the questions themselves.
**Date:** 2026-07-02
**Implications:** `QUESTION_AUTHORING_STANDARD.md` (Decision 14) defines the process and template but assigns no real tags itself, beyond 3 explicitly-labeled illustrative worked examples. The 52-question tagging pass is a separate, human-owned task, decoupled from code development via Decision 5.

### Decision 4 — Question-count-based cooldown, tiered by difficulty
**Decision:** Anti-repetition cooldown is measured in intervening questions presented to the student, not elapsed calendar time. Thresholds: Easy≈5, Medium≈10, Hard≈15, Challenge≈20+ (20 is a floor, raisable).
**Rationale:** Behavior must stay consistent regardless of how frequently a student studies — a student doing 3 mocks in one afternoon and one doing 3 mocks over 3 weeks should see the same repetition behavior.
**Date:** 2026-07-02
**Implications:** Required a new per-student monotonic sequence counter (`ali_student_adaptive_state.questions_presented_count`) and a `last_presented_at_sequence` stamp on each history row — a materially different mechanism than a simple `last_presented_at` timestamp comparison.

### Decision 5 — Reasoning-subject enum additions, additive-only
**Decision:** `subject_type` (Postgres enum, migration 001) gains 4 new values (`verbal-reasoning`, `non-verbal-reasoning`, `spatial-reasoning`, `numerical-reasoning`) via `ALTER TYPE ... ADD VALUE`. Existing 5 values are never modified.
**Rationale:** These subjects are already first-class throughout the app's `SkillType`/`MockConfig` logic but were never added to the DB-level enum from migration 001 — a pre-existing gap, not a new requirement.
**Date:** 2026-07-02
**Implications:** Confirms the general migration principle (Decision 16) applies even to enum changes — additive only, never destructive, even for a gap-fill.

### Decision 6 — Expanded question metadata, some fields deliberately inert this slice
**Decision:** `ali_question_bank` carries `confidence_weight`, `learning_objective`, `revision_priority`, `mastery_threshold` in addition to the original core fields, even though the first slice's logic doesn't use several of them yet.
**Rationale:** Design for the shared-layer future (Decision 8) without over-building — capture fields now that are cheap to add to a schema but expensive to retrofit later (a missing column means re-tagging 52+ questions twice).
**Date:** 2026-07-02
**Implications:** `confidence_weight` ships at default `1.00`, unused until confidence computation migrates to read from ALI directly (a future slice). `learning_objective`/`revision_priority` are optional, safe to backfill. Explicitly flagged in the plan so "field exists" is never mistaken for "field is wired into logic."

### Decision 7 — Mastery is evidence-based across distinct sessions
**Decision:** A question is `mastered` only after correct answers in `mastery_threshold` distinct sessions, with the most recent attempt also correct (one wrong answer demotes mastered → learning).
**Rationale:** A single correct answer, or several correct answers within one sitting, isn't reliable evidence of real understanding — genuine mastery should be demonstrated repeatedly, over time.
**Date:** 2026-07-02
**Implications:** `ali_student_question_history` tracks `distinct_correct_sessions` and `last_correct_session_id`, not just a running correct-count. Mastery is revocable, not a permanent badge.

### Decision 8 — Adopt the internal architecture name "Angel Learning Intelligence (ALI)"
**Decision:** The shared adaptive intelligence layer is named ALI internally. It is designed to eventually power lessons, practice, daily missions, replay, confidence, readiness, and Parent Insights — the adaptive mock engine is one consumer of ALI, not the entire system. Internal engineering name only, never user-facing.
**Rationale:** Prevents the schema/module design from being accidentally mock-specific — naming the layer forces every design choice to ask "does this generalize beyond mocks?"
**Date:** 2026-07-02
**Implications:** Table naming convention (`ali_` prefix), module layout (`lib/ali/*` shared, `lib/adaptiveMockBuilder.ts` as one consumer), and the `source` tag on every history write (open string, not closed to `'adaptive_mock'`) all derive directly from this decision.

### Decision 9 — First implementation slice: GL pathway, Verbal Reasoning only
**Decision:** Slice 1 = GL pathway, VR bank only (~52 questions), full ALI pipeline, full analytics write-back, complete isolation from the existing production mock system.
**Rationale:** Smallest slice that still exercises the entire pipeline end-to-end on real content, rather than a toy example — proves the architecture without betting the whole question bank on an unproven design.
**Date:** 2026-07-02
**Implications:** NVR/NR/Vocabulary sections of the GL mock continue using the existing static-slice logic this slice. Every other pathway is untouched.

### Decision 10 — Mastery thresholds are configurable, not hard-coded
**Decision:** Difficulty→mastery-threshold defaults live in a dedicated table (`ali_mastery_defaults`), read at question-import time, not as a constant in application code.
**Rationale:** Tuning mastery sensitivity should not require a code deploy — it's a content/pedagogy calibration, not an engineering change.
**Date:** 2026-07-02
**Implications:** Per-question overrides (via hand-tagging, per `QUESTION_AUTHORING_STANDARD.md` §8) still take precedence over the config default. Changing the config table only affects future imports, not retroactively re-tagging already-imported questions.

### Decision 11 — Weak-skill override never resurfaces the immediately preceding mock's questions
**Decision:** A question presented in a student's most recent mock can never reappear in their next mock, even under the weak-skill override that otherwise lets cooling-down questions resurface early.
**Rationale:** An earlier heuristic (`distance < count`) approximated this but could theoretically be violated at small bank sizes; the exact rule removes any ambiguity.
**Date:** 2026-07-02
**Implications:** Implemented as an absolute step-1 exclusion in `selectQuestions()` (§3.2 of the implementation plan) — computed as the exact set of questions sharing the student's most recent sequence stamp, removed before any cooldown or override logic runs. Structurally impossible to violate, not just guarded against.

### Decision 12 — `ali_` table prefix and `lib/ali/` module convention
**Decision:** All new ALI tables are prefixed `ali_`; shared logic lives under `lib/ali/`, consumed by `lib/adaptiveMockBuilder.ts`.
**Rationale:** Makes the architectural boundary (Decision 8) visible directly in the schema and file tree, not just in documentation.
**Date:** 2026-07-02
**Implications:** Any future ALI consumer (a lesson, a quiz) imports from `lib/ali/*` without needing to know anything about mocks.

### Decision 13 — `skill` uses a fine-grained competency taxonomy, not the app's existing `SkillType`
**Decision:** `ali_question_bank.skill` is populated from a new competency taxonomy (e.g. `vr.analogies`, `vr.letter-codes`) derived from the real `category` field already present on each question, not from the app's existing `SkillType` union.
**Rationale:** Discovered while writing `QUESTION_AUTHORING_STANDARD.md` that `SkillType` is uniformly `"verbal-reasoning"` for every VR question — zero sub-skill granularity. Reusing it would have made skill-level weak-question detection (and the Decision 11 override) unable to distinguish "weak at codes" from "weak at analogies," silently defeating the point of skill-level history.
**Date:** 2026-07-02
**Implications:** `QUESTION_AUTHORING_STANDARD.md` §3 defines the full taxonomy (10 competency codes derived from real `category` values already in `data/verbal-reasoning/*.ts`). This is a correction to earlier plan drafts (v1/v2 assumed `SkillType` reuse), caught before any code was written against the wrong assumption.

### Decision 14 — `QUESTION_AUTHORING_STANDARD.md` as a permanent standard
**Decision:** A standing document governs metadata definitions, competency definitions, difficulty definitions, writing standards, UK English guidance, originality requirements, copyright guidance, and mastery guidance for every question authored from this point forward — not just the first 52.
**Rationale:** A future contributor should be able to write a question indistinguishable in quality/structure from one written today, without re-deriving judgment calls each time.
**Date:** 2026-07-02
**Implications:** Governs all future subjects (Non-Verbal/Spatial/Numerical Reasoning, Maths, English, etc.) when they're hand-tagged in future slices — those subjects need their own competency-table addition to §3, built the same way (from real existing category/type distinctions, not invented).

### Decision 15 — Subject-level difficulty for Slice 1, not competency-level
**Decision:** Slice 1's difficulty-tier distribution operates at subject granularity (all VR competencies share one confidence tier), not per-competency. Competency-level difficulty is deliberately deferred.
**Rationale:** Prove the architecture first with a smaller, well-understood scope before extending `computeSubjectConfidence()` to finer granularity — avoids scope creep in the first slice while still passing all stated validation criteria (subject-level confidence is real; weak-skill revisiting works independently via `buildReplayQueue()`, which is already skill-granular).
**Date:** 2026-07-02
**Implications:** `confidenceBySkill` in `buildAdaptiveMock()` assigns the same tier to every VR competency code this slice. A future slice extending `computeSubjectConfidence()` to competency granularity would remove this limitation without changing the selection/mastery mechanisms themselves.

### Decision 16 — Migrations are additive, isolated, and reversible
**Decision:** Every ALI migration only adds new tables/enum values; never alters or drops anything from migrations 001–003. New route, new result type — no shared code path with the existing mock runner. Rollback = drop new tables/route, nothing to reverse in existing data.
**Rationale:** "Maintain production stability throughout" — the existing mock system and its 3 original tables must remain fully operational and untouched, with zero risk of the new engine regressing them.
**Date:** 2026-07-02
**Implications:** Isolation between ALI and the existing mock system is structural (separate route, separate tables, separate result type), not a feature flag — there's no shared code path for a bug in ALI to regress the production mock runner through.

### Decision 17 — Weak-skill override guarantees a minimum reserved slot, not just eligibility
**Decision:** When a cooling-down question's competency is in the weak-skill set, the selection algorithm reserves ~20% of the section (minimum 1, capped at what's available) specifically for overridden weak-skill questions, sampled before the general weighted pool fills the rest — rather than merely making them eligible at the same weight as ordinary review.
**Rationale:** Found during implementation testing (Slice 1): giving overridden questions equal weight to ordinary eligible-seen questions made weak-skill remediation *possible* but not *guaranteed* — with enough unseen content competing for the same slots, a weak competency could be crowded out of a mock entirely by chance. This directly failed the "weak competencies are intentionally revisited" success criterion when tested against the synthetic fixture (`lib/ali/selection.ts` test suite, 2026-07-02).
**Date:** 2026-07-02
**Implications:** `selectQuestions()` (`lib/ali/selection.ts`) now has an explicit reserve step (4b) between the override step (4) and the general weighted sample (5). This is a stronger remediation guarantee than originally specified in ADAPTIVE_ASSESSMENT_ENGINE_IMPLEMENTATION_PLAN.md v3 §3.2 — the plan described override questions as becoming merely "eligible," this decision makes a minimum inclusion count deterministic.

### Decision 18 — Weak-competency detection is native to ALI, not derived from buildReplayQueue()
**Decision:** `lib/ali/weakness.ts`'s `deriveWeakCompetencies()` computes weak competencies directly from ALI's own `ali_student_question_history.mastery_state` data (any competency with a question currently marked `weak`), rather than reusing the existing `buildReplayQueue()`/`report.skills` signal from `lib/replayEngine.ts`.
**Rationale:** `buildReplayQueue()` operates on the app's coarse `SkillType`, which is uniformly `"verbal-reasoning"` for every VR question (Decision 13) — it has no way to express "weak at codes but strong at analogies." Reusing it for the weak-skill override (Decision 11's target mechanism) would have silently produced only subject-level, not competency-level, remediation — defeating the entire point of tagging competency-level skill on each question. This corrects an inconsistency present in ADAPTIVE_ASSESSMENT_ENGINE_IMPLEMENTATION_PLAN.md v3 §4.1, which incorrectly asserted `report.skills` already had the needed granularity.
**Date:** 2026-07-02
**Implications:** ALI computes weakness entirely from its own data — no dependency on the legacy replay engine for this. The legacy `buildReplayQueue()` remains used only for the §0.5.3 bridge (feeding today's Parent Insights/replay UI from the coarse `SkillType` signal), a separate, deliberately-unmigrated concern.

### Decision 19 — Route is `app/mocks/adaptive/gl/page.tsx`, not a dynamic `[pathway]` segment
**Decision:** The Slice 1 route is a static path for GL only, not `app/mocks/adaptive/[pathway]/page.tsx` as sketched in the implementation plan.
**Rationale:** Only GL has adaptive content in Slice 1 (Decision 9); a dynamic segment would need to handle unknown/unimplemented pathway params for zero present benefit. Matches the engineering principle to keep Slice 1 intentionally small and prove the architecture, not complete it — the route can be generalized to a dynamic segment in the slice that actually adds a second adaptive pathway.
**Date:** 2026-07-02
**Implications:** No functional difference to Slice 1's scope. Future slices adding a second adaptive pathway (e.g. ISEB) should revisit this as a deliberate, separate decision about whether to generalize to `[pathway]` at that point.

### Decision 20 — Mastery evidence needs 2 extra history columns beyond the original plan
**Decision:** `ali_student_question_history` (migration 006) includes `last_attempt_correct` and `second_last_attempt_correct` (nullable booleans), in addition to the columns specified in the implementation plan.
**Rationale:** The `weak` mastery_state ("last 2 consecutive attempts both incorrect," Decision 7) needs to know the last 2 outcomes to compute — without storing them, there was no way to derive this signal from the previously-specified columns (`times_seen`/`times_correct` alone can't distinguish "2 wrong in a row" from "1 wrong, 1 right, in either order"). Found and fixed during implementation, before migration 006 was ever applied to any database — no retroactive schema change was needed.
**Date:** 2026-07-02
**Implications:** `lib/ali/mastery.ts`'s `applyAttemptOutcome()` reads/writes these two fields directly rather than reconstructing recent history from a log table — keeps the per-question history row small and O(1) to update.

### Decision 21 — Maintain this decision log going forward
**Decision:** `ALI_DECISION_LOG.md` is the permanent architectural history of ALI, appended to (not rewritten) for every future major decision.
**Rationale:** Preserve the reasoning behind ALI's design choices independently of the implementation-plan documents, which get rewritten/superseded across revisions (v1→v2→v3) and would otherwise lose the "why" behind earlier drafts.
**Date:** 2026-07-02
**Implications:** Every future ALI architectural decision (e.g. extending to competency-level difficulty, migrating confidence/replay/readiness to read from ALI directly, adding a new subject) gets a new numbered entry here, not a silent change.
