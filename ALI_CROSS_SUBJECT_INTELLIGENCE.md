# ALI Cross-Subject Intelligence — Design

**Phase:** ALI 2.0.1 — Cross-Subject Intelligence. **Design phase only. No code, no schema, no migrations, no UI.** This document proposes how ALI will eventually recognise relationships between competencies *across* subjects, now that it covers more than one (Verbal Reasoning — `vr.*`, 10 competencies; Mathematics — `maths.*`, 16 competencies). Nothing here is approved for implementation.

**Companion documents:** `ALI_VERSION.md` (current capabilities — what's real today), `ALI_LEARNING_MODEL.md` (the within-subject refinement proposal for Readiness/Missions/Parent Insights/Replay/Confidence — this document is the *between-subject* counterpart to that one), `QUESTION_AUTHORING_STANDARD.md` §3/§11 (the two real competency taxonomies this document reasons over), `ALI_DECISION_LOG.md` (Decisions 13/33 — competency taxonomies are derived from real content, not invented; the same discipline applies to the relationships proposed below).

---

## 0. Why this phase exists now, and not earlier

Cross-subject relationships were meaningless to design before ALI had a second subject — with Verbal Reasoning alone there was no "cross" to reason about. Mathematics (Phase 2.0) proved the architecture generalises across subjects with **zero shared-code changes** (`ALI_VERSION.md` §Mathematics). This phase asks the next question: now that two independently-tagged competency spaces exist, what does ALI do with the fact that a student's performance in one can be informative about the other? This is explicitly a design pause before English (2.1) — adding a third subject without first deciding how subjects relate would mean redesigning this layer later under time pressure, once there's real multi-subject data to reconcile against a model built after the fact.

---

## 1. How competencies in one subject influence another

### 1.1 Two categories of cross-subject relationship

Not all cross-subject links are the same kind of thing, and conflating them would produce a model that's directionally wrong. Two categories, kept distinct throughout this document:

- **Shared-mechanism relationships** — two competencies draw on the same underlying cognitive skill, so evidence in one is genuine (if indirect) evidence about the other. Example: `maths.fractions` and Numerical Reasoning both require proportional reasoning; a student fluent in one has a real head start on the other even with zero attempts recorded in it yet.
- **Sequential-dependency relationships** — one competency is a practical prerequisite for another, so weakness upstream predicts (and partially explains) weakness downstream, but strength upstream doesn't automatically transfer. Example: Vocabulary breadth is a prerequisite for Verbal Reasoning's synonym/antonym competencies (`vr.synonyms`, `vr.antonyms`) — a student who doesn't know a word can't reason about its opposite, but knowing many words doesn't by itself teach the *reasoning* Verbal Reasoning tests.

This distinction matters for §3 (recommendations) and §4 (safety): shared-mechanism evidence can reasonably *raise confidence* in an untested competency; sequential-dependency evidence should only ever *explain* a weakness and *suggest* a prerequisite activity, never stand in for direct evidence of the downstream skill itself.

### 1.2 Worked examples, grounded in the real taxonomies

| Relationship | Type | Direction | Grounded in |
|---|---|---|---|
| `maths.fractions` ↔ Numerical Reasoning | Shared-mechanism | Bidirectional | Both require part-whole and proportional reasoning. `maths.ratio-proportion` is the closer of the two Maths competencies to NR specifically. |
| `maths.powers-roots` / `maths.factors-multiples` ↔ Numerical Reasoning | Shared-mechanism | Bidirectional | Numerical Reasoning papers (not yet ALI-covered) draw heavily on exactly these two competencies as building blocks, per standard 11+ NR question design. |
| Vocabulary ↔ `vr.synonyms` / `vr.antonyms` | Sequential-dependency | Vocabulary → VR | A student can't reason about synonym/antonym relationships for words they don't know; word knowledge is a precondition, not itself the reasoning skill. |
| Vocabulary ↔ `vr.analogies` | Sequential-dependency (partial) | Vocabulary → VR | Weaker link than the above — analogies test relationship-recognition more than raw word knowledge, but an unfamiliar word in either half of the pair still blocks the reasoning regardless of analogy skill. |
| Reading Comprehension ↔ Writing | Sequential-dependency | Comprehension → Writing | Standard pedagogical relationship: understanding how a passage is structured/argued is a precondition for constructing one, though the reverse (good writers necessarily comprehend well) doesn't hold as strongly. |
| `maths.problem-solving` ↔ Verbal Reasoning generally | Shared-mechanism (weak) | Bidirectional, low weight | Both draw on multi-step logical sequencing, but the domains (numeric vs. linguistic) are different enough that this should be a low-confidence link, not a strong one — flagged here explicitly so it isn't over-weighted later. |

**Honesty about current data:** only the first two rows have two real ALI-covered subjects on both sides today (Maths and eventually Numerical Reasoning, when NR is ALI-covered — it is not yet). The Vocabulary/VR and Comprehension/Writing rows are included because the user's brief named them, but neither Vocabulary, Writing, nor Reading Comprehension is an ALI-covered subject yet (`ALI_VERSION.md` §Roadmap: English is 2.1, Vocabulary is 2.2, neither started). These rows are illustrative of the *kind* of relationship the model must support, not relationships ALI can act on today.

### 1.3 Representation: a relationship graph, not a formula

Given §1.1's two categories, the right data shape is a small directed graph, not a single coefficient table:

```
CompetencyRelationship {
  fromCompetency: string        // e.g. "maths.fractions"
  toCompetency: string          // e.g. "reasoning.numerical.ratio"
  relationshipType: "shared-mechanism" | "sequential-dependency"
  strength: "strong" | "moderate" | "weak"   // qualitative, not a fitted numeric weight — see §1.4
  rationale: string              // human-readable justification, mandatory (mirrors the taxonomy tables' "what it tests" discipline)
}
```

Illustrative shape only — no table, migration, or type is created by this document. `strength` is deliberately a 3-value qualitative scale rather than a numeric weight: §1.2's last row shows relationships can be real but low-confidence, and a fitted numeric coefficient would imply a precision (calibrated against real cross-subject data) that doesn't exist yet. Numeric weighting is a legitimate future refinement once real multi-subject usage data exists to fit against — explicitly not attempted here, for the same reason `ALI_LEARNING_MODEL.md` §3.1 flagged its dimension weights as "illustrative, not final."

### 1.4 Who authors these relationships

Same governance as the competency taxonomies themselves (`QUESTION_AUTHORING_STANDARD.md` §2.1, Decision 13/33): relationships are human-authored against real curriculum structure, not inferred automatically from correlation in usage data, at least initially. Automatic correlation mining is a plausible *future* enhancement (see §5.4) but starting there risks encoding spurious statistical artefacts from a small student population as if they were real pedagogical relationships — the same "do not automate metadata generation" principle that governs question tagging.

---

## 2. Learner Profile

### 2.1 Purpose

Everything ALI currently tracks is per-subject (`aliCompetencySignal` keyed by subject, mastery state per `(profile, question)`). Cross-subject reasoning needs one more layer above that: a per-*student*, subject-agnostic summary of *how* they learn, not just *what* they've mastered. This is new — nothing today aggregates across subjects at all.

### 2.2 Proposed dimensions

| Dimension | Definition | Primary source (once real, cross-subject data exists) |
|---|---|---|
| **Logical reasoning** | Performance on multi-step, rule-application competencies regardless of subject (`vr.sequences`, `vr.letter-codes`, `maths.algebra`, `maths.problem-solving`) | Mastery ratio across this cross-subject competency subset |
| **Verbal reasoning** | Performance on language-relationship competencies (`vr.analogies`, `vr.synonyms`, `vr.antonyms`, `vr.odd-one-out`) | Mastery ratio across this subset |
| **Numerical confidence** | Performance + *attempt rate* (not just accuracy) on numeric competencies — confidence is partly about willingness to attempt, not only correctness | Maths mastery ratio, weighted by attempt volume per `ali_student_adaptive_state.questions_presented_count` |
| **Consistency** | Variance of outcomes for the *same* competency across sessions, not just a mean | Standard deviation (or a simpler spread measure) of per-session accuracy within a competency, from `ali_student_question_history` |
| **Learning speed** | Sessions-to-mastery for a competency, averaged across mastered competencies | `mastery_state` transition timestamps already exist per row; speed is a derived diff, not new raw data |
| **Resilience** | Recovery rate after a competency drops to `weak` — does it return to `mastered`, and how quickly | Already directly observable: `mastery_state` is explicitly revocable and re-earnable (Decision 20/21) — resilience is a read on transitions the schema already supports, not a new tracking requirement |
| **Confidence vs. accuracy gap** | Divergence between a student's *behavioural* confidence signal (time-per-question relative to `estimated_time_seconds`, or avoidance of a competency) and their *actual* accuracy | `estimated_time_seconds` already exists per question (`QUESTION_AUTHORING_STANDARD.md` §1); this dimension is the one most likely to need a genuinely new signal (see §2.4) |

### 2.3 Key design constraint: derived, not stored as a new source of truth

The Learner Profile must be a **read-time aggregation over existing per-question/per-subject evidence**, not a new table that itself becomes authoritative. This mirrors the Learning Gain design (`ALI_PARENT_INTELLIGENCE.md`) — stored as a derived signal, never the primary record. Concretely: if `ali_student_question_history` says a competency is `mastered`, the Learner Profile's "logical reasoning" dimension must be computable *from* that row, never the other way around. This avoids the exact failure mode `Math.max`-ratcheted `avgScore` created in the legacy system (`ALI_LEARNING_MODEL.md` §2.2) — a derived summary that quietly becomes stale ground truth because nothing forces it to be recomputed. Whether this aggregation is materialised (a cache, recomputed periodically) or computed live on read is an implementation decision, deliberately deferred — either is compatible with this design as long as the per-question history table stays the single source of truth.

### 2.4 Honest gap: "confidence vs. accuracy" needs a signal that doesn't fully exist yet

Six of the seven dimensions can be derived entirely from data ALI already has real schema for. The seventh (§2.2's last row) needs *some* proxy for behavioural confidence — time-per-question is the most plausible candidate since `estimated_time_seconds` already exists per question as a comparison baseline, but ALI does not currently record actual per-question response time anywhere (`ali_student_question_history` tracks correctness and session sequencing, not duration). This is flagged explicitly as an open gap rather than silently assumed solved — closing it would need a small additive field (e.g. `time_taken_seconds` on the attempt-recording path), which is implementation, not design, and is out of scope for this document.

---

## 3. Future Recommendation Engine

### 3.1 What it recommends, and where it plugs in

Cross-subject evidence is a new *input*, not a new *system* — it plugs into the three consumers ALI already has, exactly the way `ALI_LEARNING_MODEL.md` proposed for within-subject refinements:

| Consumer | Existing mechanism | Cross-subject addition |
|---|---|---|
| **Daily Missions** | `urgency()` ranks subjects using each subject's own signal (`ALI_LEARNING_MODEL.md` §4) | A weak competency with a strong shared-mechanism link (§1.1) to an *untested* competency in another subject can promote a mission suggesting that untested competency — framed as "worth trying," not "you are weak at this" (§4 covers why the framing distinction is a safety requirement, not a copy preference) |
| **Lessons** | Not currently ALI-driven — lesson content is static per subject | Sequential-dependency links (§1.1) can surface a prerequisite lesson from a *different* subject when a downstream competency is stuck (e.g. a Vocabulary lesson recommended alongside a `vr.synonyms` weakness, once Vocabulary is ALI-covered) |
| **Mocks** | `buildAdaptiveSection()` assembles one subject's section per mock, weighted by that subject's own history | Cross-subject evidence should inform *pacing/emphasis suggestions between mocks* ("try a Numerical Reasoning mock next — your Fractions mastery suggests you're ready"), not silently reweight the actual per-question sampling inside a subject's own mock — see §4 for why this line is drawn here specifically |

### 3.2 A recommendation is evidence-ranked, not rule-fired

Given a candidate cross-subject suggestion, its priority should scale with how directly it's supported, using the same "prefer real evidence over inference" discipline as the rest of ALI:

1. **Direct evidence** (the student has actually attempted the target competency) always outranks any cross-subject inference about it — cross-subject evidence only fills gaps where direct evidence doesn't exist yet.
2. **Shared-mechanism, strong** relationships from a *mastered* source competency produce the highest-confidence cross-subject suggestions (e.g. mastering `maths.fractions` → suggest trying Numerical Reasoning ratio questions).
3. **Sequential-dependency** relationships from a *weak* source competency produce prerequisite suggestions, always framed as "this may help," never as a diagnosis of the downstream competency itself (the downstream competency may simply be untested, not weak — conflating the two would be a real accuracy error, not just a tone issue).
4. **Weak-strength graph edges** (§1.2's last row) are excluded from driving any concrete recommendation at all until real usage data justifies promoting them — they exist in the model for completeness and future calibration, not to fire suggestions yet.

### 3.3 Illustrative example, not a spec

A student masters `maths.fractions` and `maths.ratio-proportion`, has never attempted Numerical Reasoning (not yet ALI-covered, hypothetically it now is), and has a currently-weak `vr.synonyms`. The engine would: (a) suggest a Numerical Reasoning practice mock framed as "your fraction skills transfer well here" (rule 2), and (b) suggest a Vocabulary activity framed as "building word knowledge may help with Synonyms" rather than "you are weak at Synonyms" (rule 3, and see §4.1). It would *not* reduce the priority of direct `vr.synonyms` remediation in the next Verbal Reasoning mock because of the Vocabulary suggestion — that guarantee is §4's subject.

---

## 4. Safety

### 4.1 The non-negotiable rule

**Cross-subject recommendations must never override, replace, or reduce the priority of a proven subject-specific weakness's remediation.** Proven means: ALI has direct per-question evidence (`ali_student_question_history.mastery_state = 'weak'`) inside the subject itself. Cross-subject evidence is inherently indirect — even a "strong" shared-mechanism link is an inference, not an observation — and an inference must never outrank a direct observation about the same competency.

### 4.2 Concrete mechanism (illustrative, matching how ALI already enforces a similar guarantee)

This is not a new invention — ALI already has exactly this shape of guarantee for weak-skill remediation *within* a subject: the guaranteed minimum slot for weak competencies in mock assembly (Decision 17) is reserved *before* the general weighted sample runs, structurally rather than by a tunable priority score. The same pattern should extend across subjects:

1. Compute direct within-subject weak-competency remediation exactly as today — unchanged, untouched by this document.
2. Compute cross-subject candidate suggestions (§3) as an *additive* layer only.
3. A cross-subject suggestion may only ever fill a slot that direct evidence has not already claimed. It can never bump, deprioritise, or substitute for a direct weak-competency remediation action.
4. If a cross-subject suggestion and a direct weakness point at the *same* competency (e.g. cross-subject evidence suggests `vr.synonyms` needs Vocabulary support, and `vr.synonyms` is also directly flagged `weak`), the direct signal's existing remediation (already fully specified by current ALI behaviour) takes priority for the competency itself; the cross-subject suggestion may only ever appear as a *supplementary* "this might also help" addition alongside it, never as a replacement for it.

### 4.3 Framing as a safety property, not a style choice

§3.2 rule 3's "framed as help, not diagnosis" requirement is restated here deliberately: a cross-subject inference that gets voiced with the same confidence as a direct observation risks a parent or student treating an *unproven* inference as equivalent to *proven* evidence — which would undermine the entire "evidence-based, not heuristic" discipline ALI has held since Slice 1 (Decision 3's "do not automate," Decision 13/33's "derive from real content," the mastery model's revocable, session-based design). Language discipline is doing real epistemic work here, not just tone management.

### 4.4 Failure mode this rule prevents

Without §4.1–4.2, a plausible failure: a student weak in `vr.synonyms` but strong across several Maths competencies with a shared-mechanism link to some VR competency could have their Verbal Reasoning mock's difficulty or question selection skewed *upward* by cross-subject "confidence," burying the exact remediation the weak-skill override exists to guarantee. This would directly contradict the validated Phase 1.1 finding that "weak-skill override fired precisely on the intended competency every time" — cross-subject intelligence must extend ALI's precision, not erode a guarantee already proven to work.

---

## 5. Expansion Strategy

### 5.1 The proof point this design is built on

Mathematics (Phase 2.0) already demonstrated the pattern this section generalises: a second subject required **zero changes** to `lib/adaptiveEngine.ts`, `lib/parentInsights.ts`, or any `lib/ali/*` module, because those consumers read `aliCompetencySignal` and `ali_student_question_history` generically by subject key, never by a hardcoded subject name. Cross-subject intelligence must preserve exactly this property for a *third* dimension: not just "any subject can plug into ALI" (proven) but "any subject can plug into the *relationship graph and Learner Profile* without redesigning either."

### 5.2 What a new subject needs to supply

| Requirement | Already true for a new ALI subject today (per existing pattern) | New requirement this phase adds |
|---|---|---|
| Its own competency taxonomy, derived from real content (not invented) | Yes — Decision 13 (VR), Decision 33 (Maths) | Unchanged |
| Writes to `aliCompetencySignal[subject]` via the existing bridge | Yes — proven zero-code pattern | Unchanged |
| Relationship-graph edges connecting its new competencies to existing ones | N/A (didn't exist before this phase) | **New**: authored once per subject launch, following §1.4's governance — additive rows in the graph, no schema change to add a new subject's edges |
| Learner Profile dimension mapping (§2.2) | N/A | **New**: each new competency is mapped to zero or more of the seven dimensions at authoring time (e.g. a future `english.grammar` competency would map partly to "logical reasoning," partly to a new/adjusted dimension) — additive, not a redesign of the dimension list itself |

### 5.3 Why no architectural redesign is needed

The relationship graph (§1.3) is keyed by competency code string on both ends — adding English's competencies means adding new graph edges, not new columns, tables, or a different edge shape. The Learner Profile (§2) is defined as an aggregation *over* competency-level evidence, not a fixed formula naming specific subjects — a new subject's competencies simply become additional inputs to whichever of the seven dimensions they're mapped to. Both design choices are deliberate: they follow the same principle Decision 13/33 established for taxonomies and the `ali_`-prefixed, consumer-agnostic module layout established in the original implementation plan v3 — additive by construction, so "one subject at a time" (the standing directive since Phase 2.0) never requires touching what came before.

### 5.4 Explicitly deferred, not part of this phase

- **Automatic relationship discovery** from correlation in real cross-subject usage data (§1.4) — a plausible future enhancement once enough students have multi-subject history to mine, but starting there risks encoding statistical noise as pedagogical fact. Human-authored edges first; automated mining, if ever, would be proposed as its own reviewed phase.
- **Numeric edge weighting** (§1.3) — same reasoning; qualitative strength only until real data exists to calibrate against.
- **The `time_taken_seconds` gap** (§2.4) — a small additive schema/recording change, implementation not design, deferred to whichever future phase actually needs the confidence-vs-accuracy dimension operational.
- **English/Vocabulary as ALI-covered subjects** — this document reasons about how they *would* plug in; it does not start either (still gated on Mathematics validation, per the standing "one subject at a time, wait for validation" directive, `ALI_VERSION.md` §Roadmap).

---

## Explicitly out of scope for this document

No code, schema, migrations, or UI changes are made here. No table, type, or module named in this document (`CompetencyRelationship`, a Learner Profile aggregation, any recommendation-engine function) exists yet. This is a design proposal only, matching the same "no implementation" discipline as `ALI_LEARNING_MODEL.md` — a decision on whether/when to build any part of this belongs to the user, likely scoped and sequenced one piece at a time (the relationship graph for the two subjects that already exist is the smallest, most groundable starting point, since it requires no new subject and no new signal — unlike the Learner Profile's §2.4 gap).
