# ALI Learning Model — Refinement Proposal

**Phase:** ALI 1.2 — Learning Model Refinement. **No implementation in this document.** No new subjects, adaptive question banks, or pathways. This is a design proposal for how the five systems already surrounding ALI (Readiness, Daily Missions, Parent Insights, Replay, Confidence) should evolve now that ALI exists — building directly on the three real findings from `ALI_VALIDATION_PROTOCOL.md`.

**Companion documents:** `ALI_VALIDATION_PROTOCOL.md` (the findings this proposal responds to), `ALI_VERSION.md` (current capabilities), `ALI_DECISION_LOG.md` (Decisions 13/19 — competency-level data exists only for Verbal Reasoning; everything below must degrade gracefully for subjects ALI doesn't cover yet).

---

## 1. How ALI changes learning (the premise this whole document works from)

Before ALI, every signal the surrounding systems have ever had about a student was **subject-level and score-based**: one number per subject (`p.scores[subject]`), overwritten upward via `Math.max`, aggregated into `avgScore`/`status`. That was the only granularity available because the underlying content had no per-question identity a student's history could attach to.

ALI changes that for Verbal Reasoning specifically: every question has a stable ID, a competency tag, and a per-`(student, question)` evidence trail (`ali_student_question_history`) that tracks distinct-session mastery, not a single overwritten score. This is strictly richer data than anything the five surrounding systems were designed against — they were built assuming subject-level was the *ceiling* of available precision, not a *fallback* for when better data doesn't exist.

**The core refinement principle for every system below:** wherever ALI has competency-level evidence (currently: Verbal Reasoning only), prefer it. Wherever it doesn't (every other subject), keep today's subject-level logic completely unchanged. No system should get worse for non-ALI subjects, and every system should get more precise for ALI-covered ones. This is the same "consumer-agnostic, subject-agnostic schema" principle the architecture was built on (`ADAPTIVE_ASSESSMENT_ENGINE_ARCHITECTURE.md` §0.5) — it's now paying off outside the mock engine itself.

---

## 2. System-by-system review

### 2.1 Readiness (`lib/parentInsights.ts`'s `getExamReadiness()`)

**Current behaviour:** a hard-coded threshold ladder on `report.totalSessions` (= `p.completedLessons.length`, a **distinct-lesson-ID count, not an attempt count**), `report.overallScore`, mock-test completion, and `overallConfidence`.

**Why it needs to evolve:** Finding 1 (`ALI_VALIDATION_PROTOCOL.md`) showed this ladder can never clear its `sessions >= 3` floor for a student doing nothing but repeated adaptive mocks, because `completeLesson("verbal-reasoning", ...)` only ever contributes ONE entry to `completedLessons` no matter how many times it's called. ALI generates exactly this usage pattern (many attempts at one lesson ID) by design — the readiness model was never built to see depth of practice, only breadth of subjects tried once.

**Proposed evolution:** §3 below.

### 2.2 Daily Missions (`lib/adaptiveEngine.ts`'s `buildDailyMission()`/`urgency()`)

**Current behaviour:** a flat urgency score per subject — untouched = 80, weak = 100+(100−avgScore), developing = 50+(75−avgScore), strong = 0.

**Why it needs to evolve, and a more precise root cause than Finding 2 originally stated:** re-examining this during this design pass surfaced the actual mechanism, not just the symptom. `p.scores[lessonId] = Math.max(existing, newScore)` (`lib/progress.ts`) **permanently ratchets a subject's tracked score up to its historical peak** — once a student scores well once on a subject, `avgScore` can never fall again even if every subsequent attempt is worse, because nothing ever overwrites downward. This means a subject can sit at `status: "developing"` or even `"strong"` indefinitely after one good early result, regardless of current real performance — which is precisely why Finding 2's simulated students never saw VR's urgency exceed a never-touched subject's flat 80: VR's ratcheted avgScore rarely dropped into the `weak` bracket (`avgScore < 55`) even when the student was, in that moment, genuinely struggling. This is a **pre-existing scoring bug independent of ALI**, but ALI is what makes it visible and consequential, because ALI is the first system generating the "many repeated attempts at one subject" pattern this ratchet quietly breaks.

**Proposed evolution:** §4 below.

### 2.3 Parent Insights (`lib/parentInsights.ts`'s `buildParentInsights()`/`buildFocusAreas()`)

**Current behaviour:** insight text is generated from the same ratcheted `avgScore`/`status` fields — "Your child is performing above the 75% target in X," "X is currently below the 55% threshold." Percentage-first framing throughout.

**Why it needs to evolve:** for the one subject ALI covers, this framing is strictly less informative than what's already known. "Verbal Reasoning is below target" is true but ALI already knows *which two competencies* are weak and *which three just moved from weak to mastered this week* — information a parent would find far more actionable than a single percentage, and information that doesn't suffer from the `Math.max` ratchet problem at all (mastery state is derived from real per-session evidence, not an overwritten peak score).

**Proposed evolution:** §5 below.

### 2.4 Replay (`lib/replayEngine.ts`'s `buildReplayQueue()`)

**Current behaviour:** ranks weak *subjects* (via `SkillType`, which per Decision 13 is uniformly `"verbal-reasoning"` for every VR question) by urgency, with canned per-`SkillType` reason text.

**Review verdict:** replay and ALI's weak-skill override are **complementary, not duplicative** — they operate in genuinely different scopes today. ALI's override (Decision 11/17) decides which questions appear *inside* an adaptive mock. `buildReplayQueue()` decides what to *recommend outside* a mock (mission items, "revise this" navigation). Nothing currently computes the same thing twice.

**The gap worth closing, not a duplication to remove:** `buildReplayQueue()`'s only source of truth for Verbal Reasoning is the coarse `SkillType` signal, when a strictly better source (ALI's own competency-level `weak` list) already exists for that one subject. This isn't "replay duplicates ALI" — it's "replay hasn't been told ALI exists yet."

**Proposed evolution:** §6 below.

### 2.5 Confidence (`lib/adaptiveDifficulty.ts`'s `computeSubjectConfidence()`)

**Current behaviour:** `score = accuracy(avgScore) * 0.65 + consistency(attempts, streak) * 0.35`, purely subject-level, and `accuracy` inherits the same `Math.max`-ratcheted `avgScore` problem as §2.2.

**Why it needs to evolve:** this is the function that sets the tier driving ALI's own difficulty-mix distribution (Decision 15 explicitly kept this subject-level for Slice 1, deliberately deferring competency-level). Now that Slice 1 is validated, the deferred limitation becomes the next natural target — and improving confidence's *inputs* (replacing ratcheted accuracy with real mastery-coverage evidence) would also fix its contribution to §2.1/§2.2's problems, since both readiness and missions consume confidence's output.

**Proposed evolution:** §7 below.

---

## 3. Readiness — richer model proposal

### 3.1 Six weighted dimensions (0–100 each), replacing the threshold ladder's inputs

| Dimension | Weight | Definition | ALI-covered subjects | Non-ALI subjects (fallback, unchanged data) |
|---|---|---|---|---|
| **Learning breadth** | 15% | Fraction of the *selected pathway's required* subjects attempted at least once — pathway-aware, not a flat count across all 9 | `attempted / pathwayRequiredCount` | same |
| **Learning depth** | 15% | Real attempt volume per subject, not distinct-lesson-count | `ali_student_adaptive_state.questions_presented_count`, normalized against a target volume (e.g. 100 questions ≈ 100%) | approximated from `weeklyStats`/completedLessons repeat visits if available, else neutral default + an honest "insufficient depth data" flag rather than a fabricated number |
| **Competency mastery** | 25% | % of attempted competencies at `mastered`, weighted by `revision_priority` | direct from `ali_student_question_history.mastery_state` | existing skill `status` ratio (strong/developing/weak) as approximation |
| **Confidence** | 20% | Per §7's revised formula | competency-mastery-weighted | current formula, unchanged |
| **Consistency** | 15% | Streak + weekly session regularity (promoted from a sub-component of confidence to its own top-level dimension) | same computation, all subjects | same |
| **Pathway progress** | 10% | % of the selected pathway's required sections at `developing` status or better | same, all subjects | same |

Weights are **illustrative defaults, not final** — they need calibration against real usage once ALI has real students, not synthetic-fixture simulation. This is stated explicitly so the number `15%` isn't mistaken for a validated constant.

### 3.2 Readiness tier mapping (keeps the existing 4 labels — no downstream UI contract breaks)

`weightedScore = Σ(dimension × weight)` → not-ready (0–30) / building (30–55) / nearly-ready (55–80) / exam-ready (80–100). Boundaries chosen to roughly match the current ladder's practical output at moderate usage, again a starting point for calibration, not a final answer.

### 3.3 Migration path

1. **Phase A — shadow mode.** Compute the weighted score alongside the existing ladder, log both (console-only, same observability pattern as `lib/ali/observability.ts`), change nothing user-facing. Compare outputs across real usage to sanity-check the weights before anyone sees them.
2. **Phase B — cutover.** Replace `getExamReadiness()`'s internals with the weighted score → tier mapping. The function signature and the 4-value `ExamReadiness` type stay identical, so nothing downstream (UI, `ParentReport`) needs to change.
3. **Phase C — surface the breakdown.** Once trusted, expose the six dimension scores themselves to Parent Insights (§5) — "strong on breadth, light on depth in Verbal Reasoning" is a much more actionable statement than a single tier label.

---

## 4. Daily Missions — prioritisation redesign

### 4.1 What's changing and why

Two changes address "weak competencies should receive appropriate priority" and "untouched subjects should not always outrank genuine weaknesses" directly, and both trace to the root cause in §2.2:

1. **Fix the input, not just the ranking.** For ALI-covered subjects, urgency should read from ALI's own weak-competency signal (`ali_student_question_history.mastery_state = 'weak'`) directly, bypassing the `Math.max`-ratcheted `avgScore` entirely for that determination. A subject with any currently-weak competency is forced into (at minimum) the `weak` urgency bracket regardless of what its ratcheted historical score says. This is the direct fix for the root cause identified in §2.2 — not a workaround.
2. **Cap breadth's dominance once a minimum has been met.** The flat urgency-80 for "never touched" should only apply unconditionally below a breadth floor (e.g. fewer than 3 distinct subjects tried). Above that floor, never-touched subjects decay toward a lower flat value (e.g. 40–50) so a genuine, currently-weak competency in an already-started subject can outrank "you haven't tried Writing yet" once basic breadth exists. Below the floor, breadth still wins outright — exploring untouched territory early is still correct, this only stops it from *permanently* dominating.

### 4.2 Proposed urgency function shape (illustrative, not final code)

```
urgency(subject):
  if subject has any ALI-native weak competency:
      return 140 + (weak competency count × 5)   # deliberately above the old weak ceiling
  if subject.status == "weak" (legacy signal, non-ALI subjects):
      return 100 + (100 - avgScore)
  if subject untouched:
      return breadthFloorMet ? 45 : 80
  if subject.status == "developing":
      return 50 + (75 - avgScore)
  return 0   # strong
```

The replay-item slot (`getTopReplayItem()`) and the mock-test nudge keep their current logic unchanged — only the subject urgency ranking that picks the *primary* mission item changes.

### 4.3 What doesn't change

Mission item copy generation (`reasonText()`), the review-slot logic (surfacing a strong subject to maintain), and the mock-test nudge are all untouched — this is a ranking-input fix, not a mission-structure redesign.

---

## 5. Parent Insights — reframing proposal

### 5.1 New insight types (additive to the existing `positive`/`attention`/`action` taxonomy)

| New type | Trigger | Example copy |
|---|---|---|
| `competency-improved` | An ALI competency transitioned `weak`/`learning` → `mastered` since the last report | "Letter Codes moved from needing practice to mastered this week — 3 correct answers across separate sessions confirmed it." |
| `competency-reinforcement` | One or more competencies currently `weak`, named specifically (not just the parent subject) | "Sequences and Hidden Words need reinforcement — these are the two areas holding back an otherwise strong Verbal Reasoning score." |
| `mastery-summary` | Replaces a raw percentage as the headline stat for ALI-covered subjects | "12 of 16 Verbal Reasoning skills mastered, 2 improving, 2 need reinforcement" — percentage still shown, but as supporting detail underneath, not the lead. |

### 5.2 De-emphasising raw percentage

For ALI-covered subjects specifically, `buildParentInsights()`/`buildFocusAreas()` should lead with the mastery-summary framing above and only mention percentage as a secondary line — because percentage inherits the `Math.max` ratchet problem (§2.2) and is a weaker signal than real mastery-state evidence for exactly the same reason readiness and missions have this problem. For non-ALI subjects, percentage-first framing is unchanged (it's still the best available signal there).

### 5.3 Focus areas

`buildFocusAreas()`'s advice text (`SUBJECT_ADVICE`) stays subject-level for now — but for Verbal Reasoning, the `detail` field should be generated dynamically from the actual weak competencies (§4.2's signal) rather than the current static string, so the advice a parent reads names the real gap ("focus on Letter Codes and Sequences") instead of generic subject-level encouragement.

---

## 6. Replay — refinement, not a rewrite

**Proposed change:** `buildReplayQueue()` gains one new step, inserted before its existing subject-level loop: for any subject with ALI competency-level data available (currently Verbal Reasoning only), build `ReplayItem`s from ALI's weak-competency list directly — one item per weak competency, not one item per subject — with `reason` text generated from real evidence ("incorrect twice in the last 2 mocks," pulled from the same trace data `lib/ali/observability.ts` already computes) instead of the canned `REPLAY_REASONS` lookup. Subjects without ALI coverage fall through to the existing logic completely unchanged.

**Why this isn't scope creep into Slice 2:** this doesn't add a new adaptive feature or question bank — it's replay reading a better data source for a subject ALI already fully covers, exactly the "prefer ALI-native data where it exists" principle from §1. No new tables, no new selection logic, no new subject coverage.

---

## 7. Confidence — competency-weighted proposal

**Proposed formula, ALI-covered subjects only:**

```
score = accuracy × 0.45 + consistency × 0.25 + masteryCoverage × 0.30
```

where `masteryCoverage` = % of attempted competencies at `mastered`, and `accuracy`/`consistency` keep their existing definitions (with the caveat that `accuracy`'s ratchet problem, §2.2, should be fixed at the source — most-recent-N-mocks average rather than `Math.max` — as a prerequisite, not something confidence works around locally).

**Non-ALI subjects:** formula unchanged (`accuracy × 0.65 + consistency × 0.35`) — no mastery data exists to add a third term.

**Downstream effect:** this is also the natural on-ramp to removing Decision 15's deferred limitation (competency-level difficulty) — once confidence itself is computed with mastery-coverage awareness, extending `buildAdaptiveSection()` to vary difficulty *within* a subject by competency becomes a much smaller change than doing it from today's purely accuracy/consistency-based tier.

---

## 8. Expected behaviour after this model lands (struggling / average / high performer)

Contrasted against what Phase 1.1's simulation actually observed under the *current* model (`ALI_VALIDATION_PROTOCOL.md` §Findings), for a student using Verbal Reasoning adaptive mocks as their primary or sole activity:

| | **Current behaviour (validated, Phase 1.1)** | **Expected behaviour (this proposal)** |
|---|---|---|
| **Struggling student** (e.g. Student A — weak in shifting competencies, ~60–70% overall) | Readiness stuck at "not-ready" regardless of session count (Finding 1). Mission primary slot shows an untouched subject, not the actual weak competency (Finding 2). Parent sees "Verbal Reasoning needs attention" with no competency detail. | Readiness reflects real depth (many attempts registered) and can progress past "not-ready" once breadth/consistency also develop — it won't be artificially floored by the lesson-count gate. Mission primary slot surfaces the specific weak competency once ALI flags it, even before other subjects are explored. Parent sees "Letter Codes and Sequences need reinforcement" by name. |
| **Average student** (e.g. Student B — mixed mastery, occasional weak competency that resolves) | Tier climbed correctly (advanced→challenge) — this already worked. Weak-competency episodes (e.g. `vr.sequences` at mock 3) were correctly remediated by ALI's own override, but invisible to Parent Insights/Missions until they showed up as a subject-level dip, if at all. | Same correct tier progression (unchanged — confidence's core mechanism isn't broken for this persona). Parent Insights additionally shows a `competency-improved` note once `vr.sequences` returns to mastered — visible confirmation the remediation worked, which today is entirely invisible outside the console trace. |
| **High performer** (e.g. Student C — ~95%+ accuracy throughout) | Readiness never moved off "not-ready" even at 100% accuracy every mock (Finding 1, most visible case). Confidence/tier correctly reached `challenge` immediately and stayed there — already correct. | Readiness should be capable of reaching "nearly-ready"/"exam-ready" for sustained high performance with real depth — the floor that trapped this persona in Phase 1.1 is specifically what §3 removes. Parent Insights leads with a mastery-summary ("15 of 16 skills mastered") reflecting genuine excellence, rather than a percentage that, under the old model, would already have looked identical for weeks due to the `Math.max` ratchet masking any signal of continued strong performance. |

**What does NOT change for any persona:** ALI's own mechanisms (selection, cooldown, mastery, weak-skill override) — all validated correct in Phase 1.1 and untouched by this proposal. This document only changes how the *surrounding* systems interpret ALI's output, not ALI itself.

---

## Explicitly out of scope for this document

No code, migrations, or schema changes are made here. No decision here is yet approved for implementation — this is the design proposal `ALI_DECISION_LOG.md` Decision 22's "quality before scale, observability before expansion" principle calls for before any of §3–§7 is built. Implementation, if approved, should be scoped and sequenced separately (likely one system at a time, starting with whichever the reviewer judges highest-impact — §4's Daily Mission fix is the smallest, most contained change and directly closes Finding 2).
