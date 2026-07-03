# ALI Operations Manual

**Purpose:** The permanent operational handbook for Angel Learning Intelligence (ALI). This document is an index and a decision-tree, not a replacement for the detailed documents it points to — each section says what to do and which document has the actual procedure. Written at the close of ALI Foundation Version 1.0 (Verbal Reasoning, Mathematics, Reading Comprehension, Vocabulary — `ALI_VERSION.md`).

**How to use this manual:** find your situation in the table of contents, follow the pointer, come back here if you're not sure what to do next.

---

## Table of Contents

1. Daily Operations
2. Question Authoring
3. Question Tagging
4. Data Seeding
5. Production Activation
6. Validation
7. Monitoring
8. Troubleshooting
9. Adding New Subjects
10. Competency Taxonomy Updates
11. Version Management
12. Maintenance Checklist

---

## 1. Daily Operations

ALI requires **no daily operational task** as of this manual's writing — there is no cron job, no scheduled sync, no manual daily step. The system is entirely request-driven: a student opens an adaptive route, the route fetches the bank/history, selects content, and writes back. Nothing runs when no student is using the app.

**The one thing worth checking periodically, not daily:** whether any subject's `ali_question_bank` real content has grown stale relative to student volume (§7 Monitoring covers the query). There is no fixed cadence for this yet — revisit once real usage data exists to suggest one.

---

## 2. Question Authoring

Writing new question/passage/word content for any ALI subject follows `QUESTION_AUTHORING_STANDARD.md` (Verbal Reasoning §1–§10, Mathematics §11) and `ENGLISH_COMPETENCY_FRAMEWORK.md` (Reading Comprehension) and `VOCABULARY_COMPETENCY_FRAMEWORK.md` (Vocabulary). Common rules across all four subjects:

- One primary competency per item, tagged by the dominant reasoning step, never a blended tag (Decisions 34/38, `VOCABULARY_COMPETENCY_FRAMEWORK.md` §5).
- Difficulty (`content_difficulty`) is a proficiency-facing label, distinct from the app's legacy year-group `Difficulty` type — never conflate the two.
- `estimated_time_seconds` is required before import, calibrated per-competency where a baseline table exists (VR: `QUESTION_AUTHORING_STANDARD.md` §4.5), estimated conservatively where it doesn't (English, Vocabulary — no real timing data exists yet for either).
- **Never write content for a competency that isn't on the approved list** for its subject (`ALI_DECISION_LOG.md` Decision 38 for English; the equivalent Vocabulary decision this phase) — the roadmap-only competencies (§10 below) need a taxonomy/schema decision before any content is authored against them, not the other way around.

---

## 3. Question Tagging

Turning authored content into `ali_question_bank`-ready metadata is `ALI_HAND_TAGGING_WORKFLOW.md`'s job — §1 (VR), §2 (Maths), §3 (English, including the Learning Unit judgement). **Vocabulary's tagging section should be added to that document following the same pattern** once `VOCABULARY_COMPETENCY_FRAMEWORK.md` is approved for real content authoring — not written yet, since the real 12 Vocabulary words have not begun a hand-tagging pass.

**Standing principle, never to be relaxed:** metadata generation is not automated (Decision 3). A human tags every question's competency, difficulty, and any threshold override. This manual exists to make that human judgement fast and consistent, not to remove it.

**Sign-off is mandatory before any import** — `ALI_HAND_TAGGING_WORKFLOW.md` §7's checklist (self-check, second-reader spot-check, Learning Unit integrity check where relevant, explicit written approval) gates every worksheet, every subject, every time.

---

## 4. Data Seeding

`ALI_SEEDING_PLAN.md` covers the full procedure: how a signed-off worksheet becomes real `ali_question_bank` rows (§1), how `learning_unit_id` gets populated per subject (§2), and — the single most important operational fact to remember — **the synthetic-fixture-to-real-content swap requires zero code change** (§3). The moment real rows exist for a subject, every adaptive route stops using its synthetic fixture automatically, per subject, with no flag to flip.

**Before declaring a subject "seeded," always run** `ALI_SEEDING_PLAN.md` §4's four confirmation queries: real row counts match the expected content count, zero `synthetic-*`-prefixed IDs exist in the real table, Learning Unit groupings are structurally correct, and one live adaptive mock per subject shows no sample-data banner.

---

## 5. Production Activation

`ALI_PRODUCTION_ACTIVATION_CHECKLIST.md` is the exact, ordered procedure for applying migrations 004–007 (and any future additive migration) to the real Supabase project — run order, expected schema state per step, rollback SQL, and the one irreversible step (migration 004's `ALTER TYPE ADD VALUE`) flagged explicitly. **Always run each migration as its own separate SQL Editor execution**, never batched — Postgres cannot use a newly-added enum value in the same transaction that added it.

**As of this manual's writing, migrations 004–007 have never been applied to production.** Any future session picking this up should check `ALI_VERSION.md`'s "Known gaps" section first — it is kept current with exactly this fact.

---

## 6. Validation

Two distinct validation regimes exist, and they are not interchangeable:

- **Pure-function simulation** (`npx tsx` throwaway scripts, deleted before commit) — the technique used for every phase's validation so far, because this development environment has no outbound network route to the real Supabase project. Proves the logic is correct in isolation: mastery evidence, cooldown, weak-skill override, Learning Unit grouping, cross-subject signal isolation, recommendation confidence rules, Learning Profile computation. **Cannot** catch real I/O wiring bugs (wrong column name, a forgotten field in a real Supabase call, real foreign-key/concurrency behaviour).
- **Live validation** (`ALI_LIVE_VALIDATION_PROTOCOL.md`) — the re-validation that closes exactly the gap pure-function simulation can't. Requires real migrations applied and real seeded content. Covers all subjects, plus Learning Unit-specific checks, plus the structural checks (history rows written correctly, adaptive state rows updated correctly) that only mean something against a real database.

**Rule of thumb:** every new piece of ALI logic gets a pure-function validation script before commit, no exceptions (this has held for every phase since Slice 1). Live validation happens once, per subject, after that subject's real content is seeded — not before, since there's nothing real to validate against yet.

---

## 7. Monitoring

No dashboard or alerting exists yet — this section is what to check by hand, and when.

**After any content seeding (§4):** the four confirmation queries in `ALI_SEEDING_PLAN.md` §4.

**Periodically, once real students are using seeded content:**
```sql
-- Real usage volume per subject — is anyone actually using this yet?
select subject, count(*) as questions_with_usage, sum(usage_count) as total_attempts
from public.ali_question_bank
where usage_count > 0
group by subject;

-- Calibration drift check — are hand-set difficulty tiers matching real
-- outcomes? (ADAPTIVE_ASSESSMENT_ENGINE_ARCHITECTURE.md §3.4 — informational
-- only, never read by selection logic itself)
select subject, content_difficulty, avg(avg_success_rate) as observed_success_rate, count(*)
from public.ali_question_bank
where avg_success_rate is not null
group by subject, content_difficulty
order by subject, content_difficulty;
```
A `content_difficulty = 'easy'` bucket with a low observed success rate (or vice versa for `'challenge'`) is a signal to revisit that content's tagging — not an emergency, but worth a look during the next authoring pass for that subject.

**No performance/uptime monitoring is needed** beyond whatever the app already has — ALI adds read/write volume to existing tables, not a new service.

---

## 8. Troubleshooting

| Symptom | Likely cause | Where to look |
|---|---|---|
| Adaptive route shows "We couldn't set up your practice profile" | Supabase unreachable (network) or `ensureProfile()` failing | `lib/supabaseProgress.ts`; confirm `.env.local`'s Supabase vars are correct and the project is reachable |
| Adaptive route shows "sample practice data" banner unexpectedly | That subject's `ali_question_bank` has zero real rows for the `gl` pathway | `ALI_SEEDING_PLAN.md` §4.1's row-count query |
| A student sees a raw competency code (e.g. `"english.inference"`) anywhere in the UI | Missing entry in `lib/ali/labels.ts`'s `COMPETENCY_LABELS` — the exact gap caught and fixed in Decision 38 | Add the missing label; this has happened once before (English) and is the single most likely regression when a new competency is approved |
| A passage/word's questions appear split across two adaptive sessions | `learning_unit_id` mismatch between sibling questions in `ali_question_bank` | `ALI_SEEDING_PLAN.md` §4.3's Learning Unit integrity query |
| Mastery never seems to trigger for a question | Check `mastery_threshold` on that row against `ali_mastery_defaults`, and confirm distinct `session_id`s are actually being used per attempt (`lib/ali/mastery.ts`'s evidence-based, not single-attempt, model) | `ALI_LIVE_VALIDATION_PROTOCOL.md` Scenario G |
| Daily Mission / Parent Insights don't reflect a subject's real weak/mastered competencies | Confirm `aliCompetencySignal`/`aliLearningGain` are actually being bridged (`recordAliCompetencySignal`/`recordAliLearningGain` calls in that subject's adaptive route) | The route's completion handler; compare against another subject's route as a reference |
| Migration fails partway through Dashboard SQL Editor | Almost certainly the "each migration is its own transaction" rule was violated (batched with the next file) | `ALI_PRODUCTION_ACTIVATION_CHECKLIST.md` §1 |

---

## 9. Adding New Subjects

The proven, repeatable pattern (4 subjects deep as of this manual): each new subject costs a competency taxonomy + a question bank + (if its content isn't atomic) a Learning Unit convention + one new standalone adaptive route. **It has never required a change to any shared ALI module** — `lib/ali/selection.ts`, `lib/ali/mastery.ts`, `lib/ali/weakness.ts`, `lib/ali/history.ts`, `lib/ali/questionBank.ts`, `lib/ali/config.ts`, `lib/adaptiveMockBuilder.ts`, `lib/adaptiveEngine.ts`, `lib/parentInsights.ts` are all subject-generic by design, and every phase since Mathematics has been a real, falsifiable re-test of that claim (Decisions 35, 39, and this phase's).

**The concrete steps, in order:**
1. Review the subject's real existing content (if any) — never invent a taxonomy from a suggested list without checking it against real content first (Decisions 13, 33, 38, and this phase's Vocabulary taxonomy).
2. Decide the Learning Unit shape: one question per unit (VR/Maths's pattern) if content is genuinely atomic, or a grouped unit (Reading Comprehension's passage, Vocabulary's word) if it isn't. `lib/ali/learningUnit.ts` is already fully generic — reuse it, do not write new grouping/selection logic.
3. Add exactly the new competency labels needed to `lib/ali/labels.ts` — nothing else in `lib/ali/*` should need to change.
4. Build a synthetic dev fixture (fabricated illustrative content, never the real production content) to unblock code development in parallel with the real hand-tagging pass.
5. Build the new standalone route (`app/mocks/adaptive/<subject>/page.tsx`), reusing an existing route as the closest template (an atomic-question subject should copy the Maths route's shape; a Learning-Unit subject should copy the English/Vocabulary routes' shape).
6. Add the entry-point card to `/mocks`.
7. Validate with a pure-function script (§6) before ever touching the real database.
8. Document: a `<SUBJECT>_COMPETENCY_FRAMEWORK.md`, an `ALI_<SUBJECT>_IMPLEMENTATION_PLAN.md`, new `ALI_DECISION_LOG.md` entries, and updates to `ALI_VERSION.md`.

**Two subjects remain undesigned:** Writing (Learning Unit = Writing Task, per the original architectural requirement — no design work has started) and any future Non-Verbal/Spatial/Numerical Reasoning ALI coverage (the enum values exist from migration 004, but no taxonomy or content review has happened for any of them).

---

## 10. Competency Taxonomy Updates

Every subject's taxonomy has followed the same shape: **populated** (real content exists, competency is approved and labelled), **roadmap-only** (a recognised, real category with zero current content — kept in the framework document, no label entry, no fixture usage), and occasionally **schema-blocked** (Vocabulary's morphology competencies — multiple meanings, prefixes, suffixes, root words, homophones, idioms, word families — need a `VocabWord` schema change before they even need a tagging pass, a bigger gap than "no content yet"; English's grammar/punctuation/spelling competencies similarly need a new question *format*, not just new passages).

**To promote a roadmap-only competency to populated:**
1. Confirm real content actually supports it (write or find real questions/items that genuinely test it) — never promote on the strength of the suggested list alone.
2. Add the competency to the relevant `*_COMPETENCY_FRAMEWORK.md`'s "populated" table with real evidence (question IDs).
3. Add its label to `lib/ali/labels.ts` — do this *before* any real content using it reaches production, or the raw code will leak into parent-facing text (the exact Decision 38 gap).
4. Add a `ALI_DECISION_LOG.md` entry recording the promotion and its evidence.
5. If it changes cross-subject relationships (§ recommendation engine), consider whether `lib/ali/recommendations.ts`'s `COMPETENCY_RELATIONSHIPS` graph needs a new edge — author it by hand, never mine it from usage data (`ALI_RECOMMENDATION_ENGINE.md` §1).

---

## 11. Version Management

`ALI_VERSION.md` is the single source of truth for "what does ALI currently do" — capabilities, supported pathways/subjects, the adaptive-behaviours table, known gaps, and the roadmap. **Update it every phase**, not just major ones — it has been updated after every phase since Slice 1 and is meant to be readable on its own, without needing to reconstruct history from commits.

`ALI_DECISION_LOG.md` is the permanent, append-only history of *why* — every real architectural decision, with rationale, date, and implications. **Never edit or delete a past entry.** If a decision is later reversed, add a new entry that supersedes it and note the supersession on the old one — this has been the rule since Decision 1 and has held through every phase since.

---

## 12. Maintenance Checklist

Run through this whenever picking up ALI work after a gap, or before starting a new phase:

- [ ] Read `ALI_VERSION.md`'s "Current phase" line and "Known gaps" section — both are kept current and will tell you exactly what's done and what's outstanding.
- [ ] Confirm whether migrations have been applied to production yet (`ALI_PRODUCTION_ACTIVATION_CHECKLIST.md` §3's confirmation queries) — as of this manual, they have not.
- [ ] Confirm which subjects have real seeded content vs. are still on synthetic fixtures (`ALI_SEEDING_PLAN.md` §4.1) — as of this manual, none do.
- [ ] Before writing any new `lib/ali/*` logic, check whether an existing module already does what's needed generically — the entire architecture's value depends on this check happening every time (§9's "never required a change to any shared module" claim only holds because this check keeps happening).
- [ ] Before authoring any new competency, check it against real content first (§10) — never adopt a suggested taxonomy wholesale.
- [ ] Before committing, run the pure-function validation script and delete it — never commit a throwaway validation script, and never skip running one for new ALI logic.
- [ ] Update `ALI_VERSION.md` and `ALI_DECISION_LOG.md` before closing out any phase that changed ALI's behaviour or architecture.
