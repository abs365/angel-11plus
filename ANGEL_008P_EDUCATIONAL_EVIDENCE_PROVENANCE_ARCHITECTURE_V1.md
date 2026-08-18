# ANGEL 11+ — Programme Increment 008P
## Educational Evidence Provenance Architecture

**Status:** Architecture and evidence-model research. No schema implementation performed. No product code changed.

**Tags used throughout:** **A** = existing frozen rule (quoted from `docs/intelligence/*`). **B** = current implementation (file:line cited). **C** = implementation gap. **D** = proposed architecture (this document's own recommendation).

---

## PART 1 — Current Evidence System, Reconstructed

**Evidence-flow map, as it actually exists today:**

```
learner action (Practice question answered)
  → raw observation: recordOutcome() [lib/ali/history.ts:221]
  → stored evidence: ali_student_question_history, ONE row per (profile_id, question_id)
      [migration 006 — unique(profile_id, question_id)]
  → interpretation: deriveEvidenceSignal() / deriveEvidenceTier() [lib/learningEngine/rollup.ts:29,43]
      — pure functions, re-run fresh every call, "derived, never a new source of truth" (rollup.ts:1-13)
  → mastery: evaluateDurableMastery() [lib/ali/durableMastery.ts] → ali_durable_mastery (migration 010)
  → recommendation: recommendationRuntime.ts / recommendations.ts (reads ali_student_question_history directly, line 138)
  → readiness/reporting: computeComponentReadiness() [lib/learningEngine/readiness.ts:17],
      computeParentReport() [lib/parentInsights.ts:411], generateRevisionPlan(), generateExplanation()
      [lib/ali/explainability.ts:27] (3-audience model, real and live)
```

**A second, entirely parallel system exists and is NOT part of this pipeline**, confirmed directly in code (`app/dashboard/page.tsx:530`: *"the claim that today's mission is pathway-prioritised is real: `lib/adaptiveEngine.ts`'s `buildDailyMission()`..."*) and independently confirmed by the frozen `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §8.3 itself: *"A separate, older, flat-score-based system (`lib/adaptiveEngine.ts`, the Daily Mission engine, covering every subject/pathway) remains outside this document's scope."* **Today's Mission does not consume Evidence Tier/Signal, competency IDs, or any part of the real Educational Intelligence Engine.** This matters directly for 008P: no Mock-evidence integration work needs to touch it.

**`lesson_progress` and `user_stats`, checked directly** (migration 001): `user_stats` is pure XP/streak gamification — no competency data at all. `lesson_progress` is *"one row per lesson completion event"* keyed to a local-JSON `lesson_id` and a coarse `subject_type` enum, recording `score`/`xp_gained` — **not tagged to any Competency ID or Question Type ID**, and not read anywhere in the Educational Intelligence pipeline (confirmed: not referenced by `rollup.ts`, `history.ts`, or `educationalIntelligenceService.ts`). Genuine "teaching/lesson evidence," in the sense the Educational Intelligence Engine could use, **does not exist today** — this is a real, honestly-reported gap, not a system I can point to and say "already integrated."

**The Mock architecture (008D-008F)** — `ali_mock_attempt` / `ali_mock_attempt_answer` / `ali_mock_attempt_report` — is entirely separate again, by 008F's own deliberate design: it does not write to `ali_student_question_history` and does not call `processEvidenceForCompetency()`. 008F's own `lib/mockAttempt/evidenceAdapter.ts` computes a real, provenance-tagged (`source: "mock"`) evidence shape (`classifyMockEvidence()`) but does not feed it anywhere — a deliberately unwired, correctly-conservative stub.

**Where provenance exists today, precisely — a correction to 008F's own finding, not a restatement of it:**

008F's Decision 97 reported *"`ali_student_question_history` has NO evidence-provenance column at all."* **This is not quite accurate, and the precise correction matters for the architecture decision below.** Migration 006 shows the table *does* have a `source text not null default 'adaptive_mock'` column, with its own comment stating the intent plainly: *"`source` is an open string, not a closed enum — new ALI consumers (lessons, quizzes, daily missions) can write here later without a migration to register a new value (Decision 8 / ALI architecture direction)."* So a provenance *field* was anticipated from day one (migration 006, one of the earliest in this codebase).

**But it is functionally unusable as real provenance today, for two independent reasons, both directly verified:**
1. `recordOutcome()` — Practice's own, only real write path — **never sets `source` at all** (`lib/ali/history.ts:267-280`; its own `.update({...})` payload has no `source` key). Every row it ever touches keeps whatever `source` value was present at creation (the schema default, or an unknown historical value) forever.
2. Even if it did set it, the table's own `unique (profile_id, question_id)` constraint (migration 006) means **only one `source` value can ever exist per question, no matter how many different sources have touched it.** If a learner practises question X (any `source`) and later meets the same question X in a genuine Mock, the second write would silently overwrite the first — the table is structurally a per-question *current-state* table, not a multi-source *event log*, regardless of what the `source` column says.

So the practical conclusion 008F reached — Mock evidence cannot safely be written through this path without becoming indistinguishable from Practice evidence — is **correct and, if anything, understated**: the risk is not just a missing column, it is a structural inability to represent multi-source evidence for the same question at all. This precise correction is recorded here rather than silently assumed; 008F's own restraint remains fully justified by a stronger argument than the one it originally gave.

---

## PART 2 — Frozen Educational Architecture, Read in Full

All three documents (`docs/intelligence/{ASSESSMENT_BRAIN_V1,LEARNING_ENGINE_V1,EDUCATIONAL_INTELLIGENCE_ENGINE_V1}.md`) were read in full for this increment, not time-boxed. Rules extracted below, each tagged.

**[A] Evidence.** *"A raw layer (Question Type Exposure) recording what has actually been observed... This is the only layer where anything is recorded directly; every other profile element is derived from it."* (`LEARNING_ENGINE_V1.md` §3.1)

**[A] The frozen architecture explicitly left the provenance question open, by name.** *"This document does not specify how frequently, or by what mechanism, Question Type Exposure would be recorded (e.g. from live assessment activity versus practice activity) — that is an implementation-layer decision for Capability 3, deliberately left undefined here."* (`LEARNING_ENGINE_V1.md` §10, condition 5) — **this is the single most load-bearing sentence for 008P.** The frozen document itself anticipated that Mock ("live assessment activity") and Practice might need different recording treatment, and deliberately declined to mandate one mechanism. Any architecture 008P proposes that resolves this open question **extends** the frozen model rather than contradicting it, provided it doesn't invent a new confidence scale, mastery rule, or readiness calculation (which remain frozen).

**[A] Confidence — one canonical scale.** Evidence Tier ET-0..4 is *"the single canonical, fine-grained scale... the one already implemented in real code (`rollup.ts`, `diagnostics.ts`, `readiness.ts`)"* (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §5), independent of Evidence Signal (direction) — *"Collapsing the two into one score would violate Principle 3... deliberately not done"* (`LEARNING_ENGINE_V1.md` §3.3). Exact criteria: ET-0 no exposure; ET-1 a small number of instances, no consistent pattern; ET-2 a consistent pattern confined to one Question Type format; ET-3 a consistent pattern across more than one format; ET-4 a consistent pattern across the range of engaged formats, *"sustained across more than one observed point in time."* **A competency's Evidence Tier ceiling is bounded by Assessment Brain's own EMC rating for that competency** (`LEARNING_ENGINE_V1.md` §3.3) — a structural ceiling this document does not touch.

**[A] Mastery / Durable Mastery.** Durably Mastered requires three real conditions: (1) Mastered (ET-3/ET-4, Demonstrated); (2) *"survived at least one genuine-gap Maintenance Review — real retrieval evidence gathered after time has passed, not the original mastery-earning sessions themselves"*; (3) transfer corroboration where a real link exists. *"Data home: `ali_durable_mastery` (migration 010), already live."* (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §8.2)

**[A] Decision Boundaries.** Automatic (Low/ET-1+): Practice/Consolidation/Revision recommendations, retrieval scheduling. Higher Evidence Required (ET-4, plus §8.2's durable-mastery conditions where applicable): *"Mastery declaration, Durable Mastery, any Readiness claim, any definite-language parent statement."* **"No amount of cross-subject, transfer, or inferred evidence may, on its own, satisfy a Higher Evidence Required decision — direct evidence about the specific competency is the only thing that can."** (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §8) This rule extends cleanly, by its own logic, to *external* evidence — weaker than "inferred" evidence, not stronger.

**[A] Educational State.** Eight states (Exploring → Building Knowledge → Practising → Reinforcing → Mastered → Durably Mastered → Reviewing → Rebuilding), each *"derived — never independently asserted"* from Signal/Tier and Durable Mastery status. *"A state is never surfaced to a learner or parent by name."* (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §7)

**[A] Assessment vs. Practice.** Not defined as a hard binary anywhere in the frozen docs by those literal words — the real distinction the docs draw is *evidentiary*: Assessment Brain's own competency/EMC ratings describe *exam* evidence; Learning Engine V1's Question Type Exposure describes *learner* evidence gathered through *"engaging with a specific Question Type"* generally, not scoped to any one activity type. The frozen docs do not say Practice and Mock evidence must be treated identically — they simply never had a second source to consider.

**[A] Explainability.** Every conclusion must answer *"what evidence supports it, why is it shown now, what would change it"* and render differently for three audiences (Learner: zero mechanism; Parent: plain-language reasoning; Engineering/Audit: full raw evidence — *"competency codes, Evidence Tier, `RecommendationEvidence` fields"*, example given: `{ basis: "direct-evidence", tier: "ET-4", competency: "MR-04", supporting_attempts: [...] }`). (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §9) — **[B]** this is genuinely implemented, not just specified: `lib/ali/explainability.ts:27`'s `generateExplanation()` is real, live, three-audience code.

**[A] Readiness.** *"Reported per Assessment Component... never as a single exam-wide figure, and never as a percentage... described as a distribution."* (`LEARNING_ENGINE_V1.md` §6) External evidence, admissions facts, and Mock percentages must never be blended into this distribution (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §10, on the single real admissions fact: *"may be shown to a parent only as a separate, historical fact placed beside — never blended into — this engine's own Readiness distribution."*)

**[A] What the model explicitly forbids** (`LEARNING_ENGINE_V1.md` §9, `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §13): no prediction of future performance or exam outcome; no percentile or peer comparison; no behavioural/psychological modelling; no invented competency/domain/Question Type; no database/schema/UI design (the documents are specifications, not implementations); no "Expected Improvement" field without a formal reversal of the no-forecasting boundary.

**[A] Freeze declaration.** *"Future changes require a defect correction, new educational evidence, or a formal programme decision — not a routine edit."* (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §15) 008P does not propose a defect correction to any of these three documents — everything recommended below operates entirely within §10(5)'s own already-open implementation question.

**[B] Current implementation**, cross-referenced against the above: `rollup.ts`'s `deriveEvidenceTier()`/`deriveEvidenceSignal()` are a faithful, literal reading of §3.1-§3.3 (confirmed by direct code inspection, `rollup.ts:1-57`) — reading real `ali_student_question_history` aggregates, computed fresh every call, never cached. `durableMastery.ts` implements §8.2's exact three conditions. `readiness.ts` implements §6's per-component distribution. `explainability.ts` implements §9's three-audience model for real.

**[C] Implementation gaps, precisely stated:** (1) no usable evidence-source distinction anywhere in the live pipeline, for the two reasons in Part 1; (2) no mechanism exists for a second evidence source (Mock, future external) to safely enter `ali_student_question_history` without either conflation or an invasive schema change; (3) no anti-memorisation/family-question concept exists anywhere (confirmed again this session, no `family_id` column in `ali_question_bank`, no sibling-question logic anywhere in `lib/`); (4) no repeated-exposure dampening beyond `isStable()`'s bare 2-attempt threshold (`rollup.ts:24-26`) — a learner re-answering the *identical* question ten times in one sitting counts toward `distinctCorrectSessions` no differently from ten genuinely spaced, independent encounters, unless the session-boundary logic elsewhere (`lib/ali/mastery.ts`, not audited line-by-line this session) already handles this — flagged as requiring direct confirmation before any dampening rule is built, not assumed either way here.

---

## PART 3 — Evidence Types Required

For each, per the directive's own dimensions:

**1. Practice evidence.** Source: learner-initiated Practice attempt. Provenance: currently the sole real writer to `ali_student_question_history`. Reliability: high (real engagement, no self-report). Confidence: full weight under current rules. Freshness: `last_presented_at`. Comparability: partial (same-question repeats already counted via `distinctCorrectSessions`, cross-question comparability via Question Type mapping). Repeat-exposure risk: moderate — legitimate, since Practice's own purpose includes repetition, but not currently dampened by genuine time-gap. May influence mastery/recommendations/readiness: yes, all three, unchanged. Explainability: already governed by `RecommendationCandidate`/`generateExplanation()`.

**2. Teaching/lesson evidence.** **Does not exist as competency-level evidence today** (Part 1). If ever wanted, would require lesson content to carry real Competency/Question-Type tags, which `lesson_progress` does not. Not proposed for build now — no legitimate current source to model.

**3. Formal Angel Mock evidence.** Source: a scored, `submitted`, non-abandoned Mock attempt (`ali_mock_attempt.status = 'submitted'`, `ali_mock_attempt_report.scoring_state = 'scored'` — per 008F, `'scored'` already structurally means "nothing left unresolved"). Provenance: `ali_mock_attempt_report`, already tagged `source: "mock"` by 008F's `evidenceAdapter.ts`. Reliability: high per-instance (sealed, server-scored, no self-grading possible) but low in volume — Mocks are rare by design. Confidence: **must never, alone, reach ET-4** — ET-4 requires evidence *"sustained across more than one observed point in time"*; a single Mock, however broad its coverage, is one point in time. Freshness: attempt `submitted_at`. Comparability: bounded by anti-memorisation once real forms exist (not yet — Part 8). Repeat-exposure risk: high once forms are reused (sealed content is scarce by 008C/008D's own design). May influence mastery: only as one bounded-weight data point among several, never alone. May influence recommendations: yes, tagged distinctly. May influence readiness: yes — arguably a *stronger* per-instance signal for readiness specifically (closer to real exam conditions than open Practice) but volume-poor, so contributes to the distribution, never replaces it. Explainability: needs `{source: "mock", attemptId, formId}` in the evidence trail (already present in `MockCompetencyEvidenceEntry`'s shape).

**4. Diagnostic assessment evidence.** A Mock subtype (`attempt_type = 'diagnostic_mock'` already exists in the schema, migration 070) — same handling as Mock generally, but its explicit purpose is establishing an initial baseline where none exists, so it may legitimately be weighted toward *filling* Assessment Coverage gaps (Principle 6: "Absence of Evidence Is Not Evidence of Absence" — a diagnostic's job is precisely to convert absence into ET-1 evidence) without needing to reach any higher tier alone.

**5. Repeated/re-attempt evidence.** Needs the same calendar-gate philosophy `ali_durable_mastery`'s own Maintenance Review already uses (§8.2), extended — not invented — to ordinary Tier progression: repeated exposure to the *identical* question within a short window should count toward Signal (direction), but should not, alone, advance Tier the way genuinely fresh (different question, or same question after a real gap) evidence does. This reuses an established pattern rather than adding a new one.

**6. External Mock evidence.** Source: parent-reported, unverified. Reliability: low by default. Confidence: **structurally cannot satisfy any Higher-Evidence-Required decision** — the frozen "no amount of cross-subject, transfer, or inferred evidence" rule extends directly, since unverified external evidence is weaker than in-scope inferred evidence. May influence mastery: never. May influence recommendations: only as a weak, Automatic-tier contextual signal (e.g. surfacing more Practice in an area a parent flagged) — never a competency-status change. May influence readiness: **never**, directly named in the 008F directive's own boundary and reconfirmed here. Explainability: must always render as "parent-reported, unverified" wherever shown, never blended with Angel-observed evidence.

**7. Imported historical evidence** (e.g. a school report). Same treatment as external — low-trust unless a real verification mechanism exists, which none does. Not built now, not invented merely for completeness.

**8. Manual/admin educational evidence.** Same low-trust-unless-verified treatment. A legitimate future category (e.g. a Founder/admin correction to a specific record) but no real mechanism or need exists today — named, not built.

**9. Future exam/admissions evidence** (a real, eventual CSSE result). This is *outcome* evidence (pass/fail/score), not competency-level evidence — the frozen model's own no-forecasting, no-percentile boundaries mean it could never be blended backward into competency status. A distinct, future, out-of-scope category — noted, not designed.

---

## PART 4 — Architecture Options

**Option A — extend `ali_student_question_history` into the canonical ledger.**
Would require more than populating the existing `source` column: the table's `unique(profile_id, question_id)` constraint (Part 1) means it cannot represent multi-source evidence for the same question at all without a primary-key change (e.g. to `(profile_id, question_id, source)` or a genuine per-event log). That is a material, invasive change to a table every Practice write path (`recordOutcome()`'s own upsert-by-single-row logic) already depends on — real regression risk to the one thing 008P is explicitly told to protect ("no current Practice behaviour may regress," Part 7). Educational correctness: fine once done. Auditability: good, single ledger. Migration risk: **high**. Anti-memorisation/extensibility: fine long-term, but only after the risky migration. **Rejected primarily on migration risk to working Practice behaviour, not on educational grounds.**

**Option B — keep `ali_student_question_history` Practice-only; build a separate canonical evidence ledger table.**
Avoids touching Practice's own table directly — but creates a genuine synchronisation question: does Practice *dual-write* to both its own table and the new ledger (real drift risk — two sources of truth for the same fact, exactly the "second Educational Intelligence system" this whole programme's discipline exists to prevent), or does the ledger *derive* Practice evidence from `ali_student_question_history` (in which case Option B has quietly become Option C, just with an extra persisted copy in between). Without a clean single-writer story, Option B does not hold together as a distinct third option — it collapses into A or C depending on how the sync question is answered. **Not recommended as its own category.**

**Option C — keep evidence in source-specific stores; build a canonical evidence projection/adapter, computed at read time, consumed by the Educational Intelligence Engine.**
`ali_student_question_history` stays exactly as the frozen `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §11 already calls it — *"EXISTING... Unchanged"* — zero migration, zero regression risk to Practice. Mock evidence stays exactly where 008F already, correctly, put it (`ali_mock_attempt_report.competency_evidence`, tagged `source: "mock"`). A new, small, pure-function orchestration layer (not a database object) merges typed evidence observations from each source at compute time — consistent with the *existing* architectural principle that Evidence Tier is *"derived, never cached... must be recomputed"* (`rollup.ts`'s own header comment) — paying a read-time cost the design already accepts as normal, not a new burden. **This is independently corroborated by prior, unimplemented project work**: reconnaissance for 008F found `docs/intelligence/MOCK_ATTEMPT_LEDGER_SPECIFICATION_V1.md`, never built, whose own stated "Architecture Rules" — *"orchestration only... no duplicate educational evidence... no duplicate mastery calculations... every insight references the existing Educational Intelligence Foundation"* — describe exactly this pattern, arrived at independently before 008F or 008P existed. Educational correctness: full — the merge layer is where provenance-aware weighting/dampening (Part 3) actually lives, and it can enforce the frozen Decision Boundaries directly. Auditability: strong — each observation carries its own source, no ambiguity possible. Migration risk: **effectively zero for the core mechanism** — the merge layer is application code, not schema. Anti-memorisation: the natural place to add a `familyId` field later, as a TypeScript interface field first (Part 8), no schema needed yet. Compatibility with frozen architecture: **best of the three** — touches none of the "EXISTING, unchanged" entities. Implementation complexity: moderate (multiple small adapters, one merge function) but well-understood, standard pattern, not novel. Preserves existing Practice behaviour: **fully — nothing about Practice changes.**

---

## PART 5 — Raw Observation vs. Interpretation vs. Durable State

Kept as three genuinely separate layers, owned as follows — this boundary is not new; it is what the frozen documents already describe (`LEARNING_ENGINE_V1.md` §3's raw/rolled-up split, §7's Educational State), made explicit for the multi-source case:

- **Raw observation** — "Question X answered incorrectly in Mock Y at timestamp Z." Owned by each **source-specific store** (`ali_student_question_history` for Practice; `ali_mock_attempt_report` for Mock). Never merged or mutated across sources at this layer.
- **Educational interpretation** — "Evidence suggests weakness in multi-step ratio reasoning." Owned by the **new evidence-merge/adapter layer (Option C)**, computed fresh from raw observations across all sources, exactly mirroring how `rollup.ts` already computes Signal/Tier fresh from Practice's own raw rows today — extended, not replaced.
- **Durable educational state** — "Competency is not yet securely mastered." Owned by `ali_durable_mastery` (unchanged, migration 010), fed by the interpretation layer's output, never directly by any raw observation from any source.

---

## PART 6 — Mock Evidence Model

A Mock report, once `scoring_state = 'scored'` (already means "nothing left unresolved," per 008F's own fix) and `report_release_state = 'released'` (already the correct gate — evidence should not count before a report is finalised), becomes eligible for the merge layer to read. It retains everything the directive names, because 008F's report schema already carries it: attempt identity (`attemptId`), form identity (`formId`), question identity (`questionId`, per outcome), scoring version (`marking_version`), evidence source (`"mock"`, already hardcoded in `evidenceAdapter.ts`), completion validity (only `scoring_state='scored'` attempts are read — an abandoned or `in_progress` attempt is invisible to the merge layer by construction, since its report row never reaches that state), marks/correctness (`MockQuestionOutcome.status`), competency mapping (`questionTypeId`, already included per 008F's own disclosed decision to add it), timing (`ali_mock_attempt.started_at/submitted_at`, already captured), exposure history (a Part 8 concern, not built yet), provenance (source tag, already present).

**A single Mock must not automatically create or destroy durable mastery** — enforced structurally, not by convention: the merge layer only ever produces an Evidence Tier/Signal *contribution*, never a direct write to `ali_durable_mastery`; that table is written exclusively by `evaluateDurableMastery()`'s own unchanged three-condition logic (§8.2), which requires evidence *sustained across more than one observed point in time* — a single Mock attempt is one point in time, structurally incapable of satisfying that condition alone, by the same rule that already governs Practice.

**Repeated Mock evidence should accumulate exactly like repeated Practice evidence accumulates today** — via the same Signal/Tier rollup logic, extended to read from multiple sources — with the anti-memorisation caveat (Part 8) that a *repeated identical Mock form* must not count as fresh evidence indefinitely, once forms exist to repeat.

---

## PART 7 — Practice Evidence, Protected

**Practice question history is both a source record and, today, the sole canonical evidence** — Option C keeps it exactly that way for Practice's own purposes; it becomes one *contributing* source once the merge layer exists, never demoted or altered itself. `ali_student_question_history`, `recordOutcome()`, `rollup.ts` — none of these change under this recommendation. **No migration of existing Practice rows is proposed** — the "hundreds of existing records" the directive worries about are never touched, because Option C's entire premise is that they don't need to be.

---

## PART 8 — Anti-Memorisation and Exposure: the Data Contract, Not the Build

Per the directive's own instruction, this defines the contract only. A future evidence observation (the merge layer's own internal shape, not a new database table) should carry, in addition to the fields in Part 6:

```
EvidenceObservation {
  source: "practice" | "mock" | "external"   // extensible, not a closed migration-requiring enum, mirroring migration 006's own original "source is an open string" intent, finally realised correctly at the layer where it actually works
  competencyId, questionTypeId
  questionId
  formId: string | null        // Mock only
  familyId: string | null      // reserved now, unpopulated — no family/sibling concept exists yet (confirmed, Part 1); populating this is explicitly future, separately-scoped work, not begun here
  correct: boolean
  timestamp: string
  distinctFromPriorExposure: boolean  // computed by the merge layer using the same calendar-gate logic already proven for Maintenance Review (§8.2), not a new invented rule
}
```

Repeated exposure to the *same* question (or, once forms exist, the same Mock form) should count toward Signal but be capped in its contribution to Tier advancement unless `distinctFromPriorExposure` is true — reusing, not inventing, the exact gating principle Durable Mastery already established. **Question families are not built in this increment** — the contract reserves the field; populating it requires its own future, `ali_question_bank`-schema-touching decision, correctly out of 008P's scope.

---

## PART 9 — External Evidence

Modelled as a third `source` value in the same `EvidenceObservation` shape (Part 8) — no special-case architecture needed, since the merge layer already has to handle multiple sources. Confidence and verification boundary, stated plainly: **external evidence defaults to the lowest confidence tier the merge layer can produce, and is structurally excluded from ever satisfying a Higher-Evidence-Required decision** (Part 3, item 6) — this is an extension of the frozen Decision Boundary rule already in force, not a new invention. No collection mechanism (a parent-facing form, an import flow) is proposed or built here — there is nothing real to build against yet, and inventing one merely for architectural completeness would violate the directive's own instruction not to create types without a legitimate need.

---

## PART 10 — Mastery

Unchanged mechanism, extended input only: `evaluateDurableMastery()` (§8.2) continues to require (1) Mastered status at ET-3/ET-4, (2) a genuine-gap Maintenance Review, (3) transfer corroboration where applicable — **no new percentage, threshold, or shortcut is introduced**, since the frozen documents authorise none. The only change is that the Evidence Tier/Signal it reads may now, in principle, be computed from merged multi-source evidence rather than Practice alone — but only once (a) the merge layer exists, (b) a Founder decision authorises turning it on, and (c) the dampening rules in Parts 3/8 are actually implemented and tested. **This document does not turn that on.** Contradictory evidence (e.g. strong Mock performance against weak Practice history, or the reverse) is handled by the *existing* Signal logic unchanged — `deriveEvidenceSignal()` already returns `"Developing"` for genuinely mixed evidence (`rollup.ts:37`) rather than picking a side; multi-source evidence would flow through the identical function, just with a larger, correctly-tagged input set. Insufficient evidence remains ET-0/"Not Yet Observed," per Principle 6, regardless of source.

---

## PART 11 — Readiness

No second readiness engine is proposed. The merge layer feeds the *same* `computeComponentReadiness()` (`readiness.ts:17`), unchanged, with a richer (multi-source) `CompetencyStatus[]` input — the function itself is not touched. Raw Mock percentage (from `ali_mock_attempt_report.overall.percentage`) remains a *separate, plainly-labelled fact* a parent report may show *beside* readiness, never blended into it — mirroring the frozen documents' own established treatment of the CSSE 303-floor admissions fact (§10). External evidence never sets readiness directly (Part 3, item 6; Part 9) — it may, at most, inform which Practice is recommended, an Automatic-tier decision, never a Higher-Evidence-Required one.

---

## PART 12 — Explainability

The three-audience model (§9) already exists and already works (`explainability.ts`). The only requirement multi-source evidence adds: `RecommendationCandidate`'s own `sourceCompetencyCode`/`confidenceTier`/`triggerReason` fields (already real, per `explainability.ts:9`) need one more field — which source(s) contributed to the evidence behind a given conclusion — so the Engineering/Audit tier's existing example shape (`{ basis, tier, competency, supporting_attempts }`) can extend to `supporting_attempts: [{source: "practice", ...}, {source: "mock", attemptId, formId}]` without inventing a new explainability model. The Learner and Parent tiers render identically to today — this is purely an addition to the audit-tier data, never surfaced as raw mechanism to a family, consistent with §7's "never surfaced by name" rule for Educational State and this session's own established calm-tone product-experience discipline.

---

## PART 13 — Security and Privacy

A learner cannot read another learner's evidence: unchanged — the merge layer reads Practice via existing RLS (profile-scoped) and Mock via `ali_mock_attempt_report`'s own sealed-until-released, ownership-scoped RLS (072/074/075) — no new access path is introduced, no existing gate is loosened. Parents access only their own child's evidence — unchanged, governed by existing profile/family relationships, not touched by this proposal. **Raw protected Mock answer material is not duplicated into any general evidence ledger** — the merge layer's `EvidenceObservation` shape (Part 8) carries `correct: boolean` and identifiers only, never the learner's own response text or the question's stored answer, exactly matching 008F's own already-established discipline in `mock_score_attempt`'s own outcome record. **No service-role credential is introduced anywhere in this proposal** — the merge layer, if it needs to read a released Mock report, does so via the existing anon-key-plus-real-session RLS path already proven safe throughout 008D-008F; nothing here requires elevated database access from client or server code.

---

## PART 14 — Migration Strategy

**Given Option C, no database migration is proposed by this document.** The core mechanism — a new pure-function evidence-merge/orchestration module in `lib/` — requires no schema change, touches no existing table, and can be built, tested, and even partially deployed (unwired, exactly as 008F's `evidenceAdapter.ts` already is) with zero migration risk. Existing Practice history needs no backfill and remains the sole source-of-truth record for Practice evidence, permanently — Option C's entire value is that this question never has to be answered under time pressure. If, later, a genuinely additive, low-risk schema change becomes useful for performance (e.g. a small cache/materialised-view table for the merged evidence, to avoid recomputing across sources on every read) — that would be its own, separately-scoped, Founder-authorised future migration, not a prerequisite for this architecture to be correct. **Per the directive's own explicit instruction, no migration is implemented here, and none is judged necessary and sufficiently bounded to propose implementing in this same increment.**

---

## PART 15 — The 008F Throwaway Identity

Positively identified from this session's own conversation record, not a new query: during 008F's post-075 verification (Decision 100), a genuine authenticated session was created via `signInAnonymously()` specifically to prove the database-privilege-boundary rejection of `mock_score_attempt`. The exact `auth.users` ID, printed directly to this session's own tool output at the time, is:

**`f3217855-7836-4769-ae5b-2c193be2a990`**

**No `profiles` row was ever created for it** — that same session's own verification explicitly avoided the `profiles`-insert step used by earlier verification scripts, calling only `signInAnonymously()` and then two RPCs (`mock_score_attempt`, `mock_release_report`) against a bogus attempt ID, both of which were rejected before touching any table. **No learner/evidence/attempt/report record references it** — with no profile row, no `ali_mock_attempt`, `ali_mock_attempt_answer`, `ali_mock_attempt_report`, or `ali_student_question_history` row could exist for it either, since every one of those tables keys off `profile_id`, not `auth_user_id` directly.

**Cleanup instruction, not executed:** this identity is positively identified as verification residue with zero downstream references. It is safe for the Founder to remove via Supabase Dashboard → Authentication → Users, by this exact ID, at their own discretion — not urgent, not blocking anything, not deleted by this session.

---

## PART 16 — Recommended Architecture

**RECOMMENDED ARCHITECTURE: Option C — canonical evidence projection/adapter, computed at read time, consumed by the Educational Intelligence Engine's existing rollup/mastery/readiness/recommendation functions unchanged.**

**Why it is superior for Angel, specifically:** it is the only option that fully protects working Practice behaviour (Part 7's own explicit requirement) while giving Mock evidence a genuine, safe, provenance-honest path into the same system 008F correctly refused to contaminate. It requires no migration to reach a working state, which directly matters given this programme's own repeated, hard-won lesson (Decisions 94-96, 98-100) that every schema change in this codebase carries real deployment risk and a mandatory two-phase verification cost — Option C defers that cost until it is actually needed, not before. It is independently corroborated by this project's own prior, unimplemented design work (the Mock Attempt Ledger spec's own "orchestration only" rules), meaning it is not a novel invention but a convergence on something this codebase's own history already pointed toward. And it makes 008F's `evidenceAdapter.ts` — currently a correct but unwired stub — immediately reusable as exactly the Mock-side half of the real architecture, rather than throwaway work.

**What remains unchanged:** `ali_student_question_history`, `recordOutcome()`, `rollup.ts`, `readiness.ts`, `durableMastery.ts`, `explainability.ts`, every Mock table and RPC from 070-075, Today's Mission/`lib/adaptiveEngine.ts` (permanently out of scope, per the frozen documents themselves).

**What must eventually change (not in this increment):** a new evidence-merge orchestration module in `lib/` (working name: `lib/ali/evidenceMerge.ts` or similar) that reads `ali_student_question_history` (Practice) and released `ali_mock_attempt_report` rows (Mock) via their existing, unchanged access paths, translates each into the `EvidenceObservation` shape (Part 8), applies the repeated-exposure dampening rule (Part 8), and produces the same `QuestionTypeExposure[]` shape `rollup.ts`'s functions already consume — meaning `deriveEvidenceSignal()`/`deriveEvidenceTier()` themselves may need **zero changes at all**, only a new, richer input.

**Data model required:** none new at the database layer (Part 14). At the code layer: the `EvidenceObservation` TypeScript interface (Part 8) and the merge module's own output type, matching `QuestionTypeExposure` exactly.

**Adapter/orchestration required:** two small, source-specific adapter functions (`practiceEvidenceAdapter()`, wrapping existing `ali_student_question_history` reads; `mockEvidenceAdapter()`, essentially 008F's own `classifyMockEvidence()` reused directly) plus one merge function applying dampening and producing the final rollup input.

**How 008F Mock reports enter it:** via `mockEvidenceAdapter()`, reading only released, scored reports, reusing `evidenceAdapter.ts`'s existing, tested logic unchanged.

**How Practice enters it:** via `practiceEvidenceAdapter()`, reading `ali_student_question_history` exactly as `rollup.ts` already does today — this adapter is close to a no-op wrapper initially.

**How mastery consumes it:** unchanged — `evaluateDurableMastery()` reads the same `CompetencyStatus` shape it always has, now potentially derived from richer input, never bypassed.

**How readiness consumes it:** unchanged — `computeComponentReadiness()` reads the same `CompetencyStatus[]` shape, untouched.

**How anti-memorisation fits later:** the `familyId` field is already reserved in the `EvidenceObservation` contract (Part 8); populating it requires only extending the merge layer's own dampening logic once `ali_question_bank` gains a real family/sibling schema — a separately-scoped future decision, not blocked by anything in this architecture.

---

## PART 17 — Implementation Decision

**Recommendation: A — a bounded evidence-foundation implementation increment**, specifically and narrowly scoped to building the merge/adapter layer described in Part 16, with **no database migration**, before any further Mock-evidence or anti-memorisation work is attempted. This is a smaller, safer, and more clearly-bounded increment than returning directly to a hypothetical "008G" would be if 008G's own scope assumed the provenance question was already settled — it is not B (existing architecture is not sufficient, per Part 1's own confirmed findings) and not C (no further prerequisite research is needed first — Option C's own design is complete enough to implement safely).

**This increment is not begun here**, per explicit instruction.

---

*Document version: V1. Date: 2026-08-18. Research and synthesis by Claude Sonnet 5, reading all three frozen governance documents in full, direct code/schema inspection throughout, and this session's own prior 008D-008F conversation record. Returned to the Founder for review before any implementation.*
