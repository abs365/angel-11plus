# Learning Profile Model

**Phase:** ALI Foundation Completion, Part 3 — the internal Learning Profile. **Not a new source of truth** — every dimension is a derived interpretation of evidence ALI already tracks (`aliCompetencySignal`, `aliLearningGain`), recomputed on demand, never collected directly from the student.

**What shipped:** `types/ali/learningProfile.ts`, `lib/ali/learningProfile.ts` (`computeLearningProfile()`), a new additive `UserProgress.aliLearningProfile` field, and `recordAliLearningProfile()` in `lib/progress.ts` (same bridge-write pattern as `recordAliCompetencySignal`/`recordAliLearningGain`). Wired into all four adaptive routes' completion handlers (`gl`, `maths`, `english`, `vocabulary`) — one additional call each, alongside the existing Learning Gain write, so the profile recomputes automatically after every adaptive mock, across every subject, per the explicit "must update automatically" instruction.

**What did NOT ship:** any UI. Per explicit instruction ("for now: store the profile internally, document the interpretation"), `aliLearningProfile` is not read by any component, page, or Parent Insight yet — same internal-only status as Learning Gain since Phase 1.4.

---

## 1. Why 4 of the 8 suggested dimensions are honestly `null`

Everything ALI currently bridges into `UserProgress` is exactly two things: `aliCompetencySignal` (per subject: which competencies are mastered/weak/attempted) and `aliLearningGain` (per subject: a single delta+cumulative number). That's the entire input available to this model — no raw per-attempt timestamps, no response times, no session-count history. Four of the eight suggested dimensions genuinely cannot be computed with real fidelity from this input, and this document says so plainly rather than fabricating a plausible-looking number:

| Dimension | Why it's `null` |
|---|---|
| **Learning Consistency** | Needs variance across sessions per competency (was this student's accuracy stable or erratic over time?) — that requires the raw `ali_student_question_history` timestamp/sequence data, which isn't bridged into `UserProgress` at all. |
| **Learning Speed** | Needs distinct-session timestamps to measure "sessions to mastery" — same gap. |
| **Confidence vs. Accuracy** | Needs per-question response time, compared against `estimated_time_seconds`. Nothing in the app records actual response time anywhere yet — the same honest gap `ALI_CROSS_SUBJECT_INTELLIGENCE.md` §2.4 already flagged when this dimension was first proposed. |
| **Revision Behaviour** | Needs to distinguish a student *voluntarily* revisiting mastered content from cooldown-driven resurfacing the adaptive engine chose on its own — that distinction isn't present in the coarse competency signal. |

**This is a deliberate choice, not an oversight:** inventing a number for any of these four would misrepresent what the system actually knows. `null` is the honest answer, and it's structurally enforced — `LearningProfileDimensions`' types for these four fields are literally `null` (not `number | null`), so no future code can accidentally start returning a fabricated value without a type change forcing a conscious decision.

## 2. The 4 dimensions that ARE computed, and how

### 2.1 Logical Reasoning, Verbal Reasoning, Numerical Confidence — curated cross-subject competency pools

Each is a mastery ratio (`mastered / attempted`, 0–100) across a hand-curated pool of real competency codes spanning multiple subjects — `null` if nothing in the pool has been attempted yet.

- **Logical Reasoning** — `vr.letter-codes`, `vr.number-codes`, `vr.sequences`, `maths.algebra`, `maths.problem-solving`, `maths.powers-roots`, `maths.factors-multiples`. The rule-application/multi-step competencies, regardless of subject.
- **Verbal Reasoning** — `vr.analogies`, `vr.odd-one-out`, `vr.synonyms`, `vr.antonyms`, `vr.word-codes`, `vr.hidden-words`, `vr.compound-words`, `vocabulary.synonyms`, `vocabulary.antonyms`, `vocabulary.in-context`, `english.inference`, `english.vocabulary-in-context`. The language-relationship competencies.
- **Numerical Confidence** — all 16 real Mathematics competencies (`QUESTION_AUTHORING_STANDARD.md` §11.2).

**A judgement call worth naming:** `vr.word-codes`/`vr.hidden-words`/`vr.compound-words` involve letter manipulation, which could arguably be "logical" rather than "verbal" — they're placed in the Verbal pool because they operate on real words and meaning, unlike the purely abstract symbol manipulation of `vr.letter-codes`/`vr.number-codes`/`vr.sequences`. Also worth naming: some Mathematics competencies (`maths.algebra`, `maths.problem-solving`, `maths.powers-roots`, `maths.factors-multiples`) count toward **both** Logical Reasoning and Numerical Confidence — not a bug. Multi-step algebra genuinely is both a logical-reasoning skill and a numerical one; the two dimensions aren't meant to be mutually exclusive partitions of the same evidence.

**Deliberate simplification vs. the original design:** `ALI_CROSS_SUBJECT_INTELLIGENCE.md` §2.2 originally proposed weighting Numerical Confidence by attempt volume (`ali_student_adaptive_state.questions_presented_count`), not just accuracy. That field isn't bridged into `UserProgress` either, so this implementation uses the simpler mastery-ratio-only version and says so, rather than silently dropping the weighting without a note.

### 2.2 Persistence — a coarse resilience signal, only assessable after a real struggle

`computePersistence()` only produces a number once at least one subject currently has a weak competency (`weakCompetencies.length > 0`) — persistence can't be measured if nothing has ever been hard. For each such subject, it maps that subject's `aliLearningGain` cumulative value to a 3-point score (positive cumulative → 75, zero → 50, negative → 25) and averages across every currently-struggling subject. This is deliberately coarse — Learning Gain's own weights are already documented as "illustrative starting values, not calibrated" (Decision 31), so a persistence signal built on top of them inherits that same calibration status, not a false precision.

---

## 3. Interpretation — the parent-friendly layer, built but not shown yet

`buildInterpretation()` maps whichever dimensions are non-null into plain phrases, matching the examples given in the brief:

- Verbal Reasoning ≥ 70 → "Confident with words and language"
- Logical Reasoning ≥ 70 → "Strong logical problem solver"
- Numerical Confidence < 40 → "Benefits from additional numerical practice"
- Numerical Confidence ≥ 70 → "Confident problem solver with numbers"
- Persistence ≥ 70 → "Keeps trying and improves over time"
- Persistence ≤ 30 → "May need encouragement to persist through difficulty"
- If none of the above apply (not enough evidence anywhere) → "Not enough practice yet to build a learning profile"

No technical score, mastery_state, or competency code ever appears in this layer — only the phrases above, matching the standing "no raw technical detail in parent-facing language" bar already established by Parent Intelligence (Phase 1.4).

**Why this stays internal for now:** rendering it anywhere is a UI decision, and this phase's scope is explicitly "no UI redesign." The interpretation logic is built, tested, and ready — surfacing it (most naturally as an addition to `/parent`'s "How They're Doing" section) is a small, separate, future decision once the underlying dimensions have had real usage to validate the thresholds against, the same "shadow mode before cutover" discipline `ALI_LEARNING_MODEL.md` §3.3 already established for Readiness.

---

## 4. Validated (pure-function script, same technique as every prior phase)

- A student with zero ALI activity anywhere produces a profile where every dimension is `null` and the interpretation is exactly `["Not enough practice yet to build a learning profile"]`.
- A student with strong, mastered Vocabulary + VR competencies produces a non-null Verbal Reasoning score ≥ 70 and the matching phrase.
- A student with a currently-weak Maths competency and a negative cumulative Learning Gain for Maths produces a Persistence score of 25 and the "may need encouragement" phrase; the same scenario with a positive cumulative gain instead produces 75 and the "keeps trying" phrase.
- Learning Consistency, Learning Speed, Confidence vs. Accuracy, and Revision Behaviour are `null` in every scenario tested, confirming the type-level guarantee holds in practice too.
- The profile recomputes and is re-bridged after a mock in each of the four adaptive routes without needing any new Supabase read.

---

## Explicitly out of scope for this document

No UI change, no Parent Insights integration, no Daily Mission integration. This is the same "computed, real, internal-only" status as Learning Gain — a future phase's decision to make, once real usage exists to validate the thresholds chosen here.
