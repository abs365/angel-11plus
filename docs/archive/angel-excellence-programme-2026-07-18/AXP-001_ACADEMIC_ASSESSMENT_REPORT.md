# AXP-001 — Academic Assessment Report

**Angel Version 3.0 — Academic Excellence Programme, Phase 1**
**Status:** Assessment only. No code changed. Awaiting Founder review before any implementation.
**Method:** Every finding below was verified directly against the live source files in this repository (`data/*`, `lib/*`, `app/*`) — not estimated. Where an existing internal planning document (AEP-001 through AEP-005, AIW-001) already addresses a finding, that is stated explicitly so this report does not present known work as new, and does not contradict frozen prior decisions without saying so.

---

## 0. How to read this report

This audit treats each subject/system as a curriculum designer would: how much real material exists, how well it's tagged for progression and diagnosis, how faithfully it matches the exam boards this product claims to prepare learners for, and how safely it can grow. Every number below is a direct count from the live data files as of this assessment (2026-07-19), cross-checked against `AEP-002_KNOWLEDGE_FRAMEWORK.md`'s own domain table, which independently states matching figures — giving high confidence these counts are accurate and stable, not a one-off miscount.

Two of this report's findings (§6.1 and §6.2) are **not** already documented anywhere in this project's existing planning corpus (AEP-001–005, AIW-001) and should be treated as new, high-priority discoveries, not restatements.

---

## 1. Per-Subject Assessment

### 1.1 English Comprehension

| Dimension | Finding |
|---|---|
| Content volume | 3 passages (`data/lessons.ts`: eng-001, eng-002, eng-003), 10 questions total (4+3+3) |
| Difficulty progression | 3 tiers used (`advanced-year4`, `year5-core`, `year5-advanced`) — 1 passage each. No `year4-foundation` or `year6-exam` content exists despite both labels being defined and rendered in `app/english/page.tsx`'s own `difficultyLabel`/`difficultyColor` maps |
| Academic coverage | Skills tagged per question: atmosphere, vocabulary, inference, character, evidence (5 tags across 10 questions). Per AEP-002 §2.6: 2 of 10 named English competencies (`inference`, `vocabulary-in-context`) have any real content; `retrieval`, `author's-purpose`, `sequencing`, `summarising`, `prediction` are defined but empty; `grammar`, `punctuation`, `spelling` have no gradable mechanic anywhere in the app |
| CSSE alignment | CSSE's own pathway description (`lib/pathways.ts`) states its exam is "English (comprehension + writing) and Maths." The 3 real passages are usable content for this, but at 10 questions total there is not enough volume for a CSSE-representative practice programme |
| Independent school alignment | ISEB Pre-Test and Independent/Bespoke pathways both list English as a tested subject; same 10-question ceiling applies |
| Question diversity | All 3 passages are narrative fiction (mystery, literary-reflective, WWI epistolary). No non-fiction/informational text, no poetry — a real genre gap since GL, CEM and CSSE all test non-fiction comprehension in their real papers |
| Content repetition risk | **High.** A learner who completes all 3 lessons has exhausted the entire English bank; the adaptive tier logic (`pickEnglishLesson` in `lib/adaptiveEngine.ts`) explicitly falls back to "revisit hardest"/"revisit easiest" once a tier's dedicated lesson is done, because there is no next lesson to serve |
| Personalisation capability | Low. Adaptive selection is "which of 3 fixed passages," not per-question difficulty adaptation |
| Long-term scalability | The data shape (`Lesson[]` with nested `questions[]`, hand-written `modelAnswer` per question) is sound and scales cleanly — the gap is pure content volume, not architecture |

### 1.2 Writing

| Dimension | Finding |
|---|---|
| Content volume | 4 prompts (`data/writing.ts`) |
| Difficulty progression | 2 tiers used (`year5-core` ×2, `year5-advanced` ×2). No `year4-foundation`/`year6-exam` |
| Academic coverage | Genres: narrative ×2, descriptive ×1, persuasive ×1. No report/letter/diary/discursive format — several UK independent-school and CEM-family papers test these |
| CSSE alignment | CSSE's exam format includes a writing component per its own description; current 4-prompt bank is thin for sustained practice |
| Independent school alignment | Same — Independent/Bespoke pathway explicitly needs writing but has minimal bank |
| Question diversity | 4 distinct prompts is very low diversity; a learner practising weekly exhausts the bank in under a month |
| Content repetition risk | **High** — identical concern to English, compounded by Writing having no adaptive selection logic at all (the prompt list is shown in full, unfiltered) |
| Personalisation capability | **None.** Per AEP-002's own Real Gaps: "Writing has no competency model or gradable mechanic at all." The only "intelligence" is the optional AI-generated Smart Feedback (`app/api/writing-feedback`), which is real and live, but operates on free text after the fact — it does not select what to write about |
| Long-term scalability | The `WritingPrompt` type (title/prompt/type/difficulty/timeMinutes/checklist) is simple and scales fine; the gap is volume and the complete absence of a competency layer |

### 1.3 Vocabulary

| Dimension | Finding |
|---|---|
| Content volume | 12 words (`data/vocabulary.ts`) |
| Difficulty progression | 4 tiers touched, unevenly: `advanced-year4` ×1, `year5-core` ×5, `year5-advanced` ×5, `year6-exam` ×1 |
| Academic coverage | `category` field: tier2 ×9, literary ×2, tier3 ×1. Per AEP-002: 3 of 10 named vocabulary competencies (`synonyms`, `antonyms`, `in-context`) are populated; the other 7 (`multiple-meanings`, `prefixes`, `suffixes`, `root-words`, `homophones`, `idioms`, `word-families`) are "schema-blocked" — the `VocabWord` type itself has no field to support them, so this is a data-model gap, not only a content one |
| CSSE alignment | CSSE's own subjects list includes Vocabulary explicitly; 12 words is far short of representative coverage |
| Independent school alignment | Same constraint |
| Question diversity | The flashcard/sentence-challenge mechanic is sound, but with 12 words the "Word of the Day" rotation (`Date.now() / 86400000 % vocabWords.length`) repeats every 12 days exactly |
| Content repetition risk | **High** — confirmed exact repetition cycle (12 days), not an estimate |
| Personalisation capability | None beyond a fixed day-index rotation; no weak-word-first selection logic exists |
| Long-term scalability | Adding words is trivial (flat array, no dependencies) — this is the cheapest gap in the whole system to close in raw engineering effort |

### 1.4 Reasoning (Verbal / Non-Verbal / Spatial / Numerical)

| Dimension | Finding |
|---|---|
| Content volume | Verbal 52, Non-Verbal 40, Spatial 39, Numerical 41 — **172 questions total**, by far the largest and most developed content area in the app. Matches AEP-002's own domain table exactly |
| Difficulty progression | **None.** The `ReasoningQuestion` type (`types/reasoning.ts`) has no `difficulty` field at all — verified by grepping every reasoning data file for the word "difficulty": zero matches. Every one of the 172 questions is presented as equally hard |
| Academic coverage | Rich `category` tagging exists at the content level (Word Analogy, Odd One Out, Letter Code, Synonyms, Antonyms, Hidden Words, Letter Sequences, Number Codes, Compound Words, Sequences, Classification, Word Codes for Verbal alone) — but the `skill` field on every single question is hardcoded to the whole subject name (e.g. every Verbal Reasoning question has `skill: "verbal-reasoning"`, never a sub-skill). AEP-002 already designed a 27-code sub-taxonomy across these four domains (e.g. `vr.analogies`, `nvr.rotation`, `sr.paper-folding`, `numreason.ratio-proportion`) precisely to fix this — **this is a known, already-designed gap, not a new discovery: the paper taxonomy exists, the live data/schema population does not** (confirmed by AIW-001 §11, which calls this "the single largest concrete implementation task" its data model surfaces) |
| CSSE alignment | CSSE's own eligibility rule (`lib/ali/pathwayEligibility.ts`) correctly excludes all four reasoning domains for CSSE learners — this part of the system is internally consistent and correct |
| Independent school alignment | GL/CEM/ISEB all genuinely test some combination of these four domains — this is real, usable content for those pathways |
| Question diversity | Genuinely good *within* each domain (10–12 distinct categories in Verbal alone) — the strongest diversity of any subject in the app |
| Content repetition risk | **Confirmed, not theoretical.** `ReasoningSession` (the shared practice component) renders the *entire* bank for a subject in one continuous session with no slicing, and — see §6.2 below — the Mock Exam system draws its sections from these exact same arrays at `offset: 0`. A learner who practises Verbal Reasoning and later sits a GL or CSSE mock will see literally the same first 10–15 questions again |
| Personalisation capability | None at the question level (no adaptive selection within a reasoning session); the only adaptivity is the English/Maths-only Daily Mission logic choosing *which subject* to recommend next, not which reasoning questions within it |
| Long-term scalability | Content architecture (per-category files spread into one array) is clean and easy to extend. The blocking issue for scalability is the missing `difficulty`/sub-skill fields — AEP-002/AIW-001 both flag this as the top implementation priority already agreed on paper |

### 1.5 Mock Examinations

| Dimension | Finding |
|---|---|
| Content volume | 4 pathways (GL, CEM, CSSE, ISEB), 2–4 sections each, drawing counts of 8–15 questions per section from the reasoning banks above |
| Difficulty progression | None — mock sections slice a fixed `offset`/`count` window from banks that have no difficulty field to begin with |
| Academic coverage / CSSE alignment / Independent school alignment | **See §6.2 — this is the report's most serious finding.** Every mock pathway's sections are built entirely from the Verbal Reasoning (`vr`) and Numerical Reasoning (`nr`) banks. None draw from the real English (`data/lessons.ts`), Maths (`data/maths.ts`), or Vocabulary (`data/vocabulary.ts`) banks, even where a pathway's own definition explicitly names those subjects as tested |
| Question diversity | Bounded by whatever the VR/NR banks offer; effectively no diversity beyond what §1.4 already describes |
| Content repetition risk | **Confirmed high**, and directly caused by mock sections and practice sessions drawing from the identical arrays (see §6.2) |
| Personalisation capability | None — mock question selection is a fixed slice, identical for every learner on a given pathway every time |
| Long-term scalability | The mock engine's `BANKS` map (`{ vr, nvr, sr, nr }`) has no key for English/Maths/Vocabulary content at all — adding real subject-matched mock sections requires an engine change, not just new data rows |

### 1.6 Adaptive Recommendations

| System | Real or synthetic? |
|---|---|
| Daily Mission (`lib/adaptiveEngine.ts`, used on the homepage) | **Real.** Operates on real `UserProgress`/`AnalyticsReport` data; pathway-filtered via `getEligibleSubjectKeys`; genuinely reused throughout Sprints 1-10 |
| "Personalised Practice" adaptive routes — `/mocks/adaptive/english`, `/mocks/adaptive/maths`, `/mocks/adaptive/gl`, `/mocks/adaptive/vocabulary` | **Synthetic.** See §6.1 |

---

## 2. Current Academic Strengths

1. **Reasoning content depth (172 questions, 4 domains)** is the strongest single asset in the platform — genuinely diverse categories, well-written explanations and hints, and correctly pathway-filtered by the eligibility engine.
2. **English/Writing model answers and rubrics are high quality where they exist** — the 3 English passages have genuinely strong, exam-relevant model answers with mark allocations; the 4 writing prompts have detailed, technique-specific checklists.
3. **A real, already-designed 63-code competency taxonomy exists on paper** (`AEP-002_KNOWLEDGE_FRAMEWORK.md`), independently corroborating this report's own content counts and giving a ready-made target schema for closing the sub-skill tagging gap — this is significant unclaimed value already sitting in the repository.
4. **The Daily Mission recommendation engine is real, pathway-aware, and consistently reused** across every learner-facing surface (Dashboard, Learn Hub, Parent Hub) — this is genuine, working personalisation infrastructure, distinct from the synthetic-fixture issue in §6.1.
5. **Smart Writing Feedback is a real, live AI-marking feature** (not synthetic) already reviewed for tone in EEP-004 — a genuine differentiator most competing apps at this content stage do not have.
6. **Assessment-integrity design is unusually mature for the product's content stage** — `AEP-005_ASSESSMENT_FRAMEWORK.md`'s confidence-tiering (readiness confidence = the *minimum*, not average, of six dimensions) is a rigorous, non-gameable design already agreed and ready to enforce once content catches up.

## 3. Academic Weaknesses

1. English, Writing and Vocabulary are each critically thin (10, 4, 12 items respectively) relative to any of the four exam boards this product claims to prepare learners for.
2. English and Writing have a hard genre gap — English has zero non-fiction/poetry; Writing has zero letter/report/diary/discursive formats.
3. No subject has a complete difficulty ladder from Year 4 Foundation through Year 6 Exam; most have 2–3 of the 5 defined tiers populated, several with exactly one item per tier.
4. Reasoning questions carry no difficulty signal at all — every question in the largest content bank in the app is treated as equally hard.
5. Vocabulary's data schema cannot currently represent 7 of its own 10 named competencies (multiple-meanings, prefixes, suffixes, root-words, homophones, idioms, word-families) — this is a structural, not just content, ceiling.

## 4. Coverage Gaps

- **English:** retrieval, author's purpose, sequencing, summarising, prediction (defined competencies, zero content); grammar, punctuation, spelling (no gradable mechanic anywhere in the app).
- **Vocabulary:** multiple-meanings, prefixes, suffixes, root-words, homophones, idioms, word-families (schema-blocked).
- **Writing:** no competency model exists at all — confirmed by this report and by AEP-002 independently.
- **Mock Examinations:** no pathway's mock genuinely tests real English comprehension, Writing, or Maths content (see §6.2) — meaning the single highest-stakes practice format in the app has the *weakest* real subject-matter alignment of anything in the platform.
- **Pathways with no mock at all:** Independent/Bespoke, Core Foundation and Not Sure Yet (3 of 7 pathway options) have zero mock exam entry point — already handled honestly in-app ("No mock exam yet for this pathway"), so this is a documented, not silent, gap.

## 5. Content Gaps

- No non-fiction or poetry passages anywhere in English.
- No letter, report, diary or discursive writing formats.
- No probability content in any domain (already formally logged as GAP-001 in this project's own `CURRICULUM_GAP_REGISTER.md`, per AEP-002 — this report did not independently rediscover it, only confirms it's still open).
- No `year4-foundation` content in English or Writing despite the Core Foundation pathway explicitly targeting Year 4–5 learners.
- No `year6-exam` tier content in English or Writing despite this being the highest-stakes, most exam-proximate difficulty band.

## 6. Progression & Adaptive Learning Gaps

### 6.1 The "Personalised Practice" feature runs on fabricated content — **new finding, not previously documented**

`/mocks/adaptive/english`, `/mocks/adaptive/maths`, `/mocks/adaptive/gl` and `/mocks/adaptive/vocabulary` are the *first* section shown on the live Mock Centre page, explicitly marketed to users as the smart option ("Your Verbal Reasoning questions are chosen for you every time — no two sessions are identical, and your weak spots come back around intelligently"). Every one of these four routes is powered by `data/ali/{english,maths,vr,vocabulary}SyntheticFixture.ts`, each of which opens with the identical, explicit comment:

> "SYNTHETIC / DEV-ONLY FIXTURE — NOT REAL PRODUCTION CONTENT."

These fixtures were authored to unblock and test the ALI adaptive engine's code (`lib/ali/learningUnit.ts` and related) while real hand-tagged content was pending — a reasonable engineering decision at the time. But they were never swapped for real content, and nothing in the live UI discloses this to a learner or parent. This is not addressed in any of the six existing planning documents (AEP-001–005, AIW-001) reviewed for this assessment — it is a genuine blind spot, not a restatement of known work.

### 6.2 Mock Exam sections do not test what their own pathway claims to test — **new finding, not previously documented**

Verified directly in `app/mocks/[pathway]/page.tsx`'s `MOCK_CONFIGS`:

| Pathway | Section (as labelled to the learner) | Actual bank used |
|---|---|---|
| GL | "Vocabulary Challenge" | `vr` (Verbal Reasoning) |
| CSSE | "English & Language" | `vr` (Verbal Reasoning) |
| CSSE | "Mathematics" | `nr` (Numerical Reasoning) |
| ISEB | "Spatial Reasoning" | `sr` — not listed among ISEB's own stated subjects in `lib/pathways.ts` at all |

CSSE is the clearest case: its own pathway description states its real exam is "English (comprehension + writing) and Maths. No separate reasoning paper" — yet its mock is **100% built from Verbal and Numerical Reasoning content**, testing neither comprehension, writing, nor real maths. This directly contradicts `lib/ali/pathwayEligibility.ts`'s own documented design intent, which explicitly states (in its own code comment) that "a CSSE-pathway learner must never be recommended Verbal Reasoning, Non-Verbal Reasoning, Spatial Reasoning, or Mathematical Reasoning content, because CSSE tests none of them" — the recommendation engine enforces this rule correctly for daily practice, while the mock engine violates it completely for the exact same pathway. This is an internal inconsistency the codebase's own design already flags as wrong, not a matter of external opinion.

GL and CEM are less severe but not clean: GL's mock never tests real English or Maths content either (Numerical Reasoning stands in for "Maths"); CEM's mock reasonably covers 2 of its 3 stated subjects (Verbal Reasoning and Numerical Reasoning both are genuinely CEM-relevant) but never tests "English & Literacy" at all.

The root cause is architectural: the mock engine's `BANKS` lookup (`{ vr, nvr, sr, nr }`) has no key for English, Maths, or Vocabulary content — the four reasoning banks are the *only* content the mock system is able to draw from today.

This finding sharpens (does not merely restate) `AEP-005_ASSESSMENT_FRAMEWORK.md` §13's own existing assessment that "Examination Fluency" is the weakest of the six Grammar School Readiness dimensions — the true gap is more severe than that document currently states, because the issue is not only mock *timing/format* fidelity (already acknowledged) but mock *content* fidelity, which was not previously identified.

### 6.3 Already-known, already-designed adaptive/progression gaps (restated for completeness, not new)

- No difficulty calibration tables exist yet for Non-Verbal, Spatial or Numerical Reasoning (AEP-002 §2.3, AEP-003 §5/§9, AIW-001 §3) — the general easy/medium/hard/challenge rubric applies in principle but has no domain-specific calibration data.
- English/Maths adaptive tier selection (`pickEnglishLesson`, `pickMathsMode`) is real but coarse by necessity — with only 3 English lessons and 2 Maths modes, "adaptive" mostly means "which of very few fixed options to revisit."
- Angel's mock structure is "one fixed shape regardless of which exam board" (AEP-002 Real Gap #6, restated unresolved in AEP-004 §8 and AEP-005 §4) — missing CEM's sub-timed sections and ISEB's within-session adaptivity. This is a distinct, already-tracked gap from the content-bank-mismatch issue in §6.2 above.

## 7. Risk Assessment

| Risk | Severity | Why |
|---|---|---|
| Mock exams test the wrong content for CSSE (and partially GL/CEM) | **Critical** | A CSSE family could reasonably believe a "GL Assessment Mock Exam"-style readiness signal reflects their real exam, when the content tested is categorically different from what CSSE actually sits. This is a trust and safety issue, not only a content-completeness one. |
| "Personalised Practice" runs on synthetic, non-real content with no in-app disclosure | **Critical** | Directly contradicts this whole project's own repeatedly-enforced "never fabricate, always disclose synthetic states" engineering discipline (seen consistently across every UX sprint in this session) — except here the fabrication is in the *content* layer, which no UX sprint was scoped to check. |
| English/Writing/Vocabulary content exhaustion | **High** | A motivated daily learner exhausts English (3 lessons) and Writing (4 prompts) within one to two weeks, and Vocabulary repeats exactly every 12 days — undermining the "daily coaching" experience EEP-002/003 worked hard to build on the presentation layer. |
| No difficulty signal on 172 reasoning questions | **Moderate-High** | Blocks any genuine progression narrative within the platform's single largest and most-developed content area; the fix (AEP-002's taxonomy) is already designed, only unimplemented. |
| Vocabulary schema cannot represent 7 of its own 10 competencies | **Moderate** | A content-only fix cannot close this gap; it requires a `VocabWord` type change first — sequencing matters for planning. |
| ISEB mock includes a subject (Spatial Reasoning) not listed in its own pathway definition | **Low** | Likely reflects real ISEB Pre-Test practice reasonably well, but is an internal data inconsistency worth resolving for documentation integrity. |

## 8. Priority Ranking

1. **Disclose or resolve the synthetic-fixture issue (§6.1)** — at minimum, honest in-app disclosure that "Personalised Practice" runs on placeholder content until real hand-tagged content exists; at best, prioritise the real content-tagging pass AEP-002/AIW-001 already call for.
2. **Fix mock-exam content sourcing, starting with CSSE (§6.2)** — either build real English/Maths/Vocabulary-sourced mock sections, or relabel/pause the affected sections honestly until they exist. This is the most consequential and most fixable-in-principle finding in this report.
3. **Expand English, Writing and Vocabulary content volume**, prioritised by pathway breadth (CSSE and Independent both lean heavily on these three) — genre diversity (non-fiction, poetry, letter/report formats) should be part of this expansion, not an afterthought.
4. **Populate the already-designed Reasoning sub-skill taxonomy** (AEP-002's 27 VR/NVR/SR/numreason codes) into the live data files — this closes the personalisation gap in the platform's strongest content area using work that is already fully specified.
5. **Add a `difficulty` field and calibration pass to Reasoning content** — enables genuine progression tracking across the 172-question bank.
6. **Extend the Vocabulary data schema** to support its 7 currently-schema-blocked competencies, then populate content against them.
7. **Resolve the mock-format-fluency gap** (CEM sub-timing, ISEB within-session adaptivity) — already scoped by AEP-004/005, lowest new-analysis burden of anything on this list since the design work is done.

## 9. Recommended Implementation Roadmap (assessment-only — not authorised for build)

This is a sequencing recommendation, not an implementation plan; no code should be written from this report without separate, explicit Founder authorisation per this programme's own stop condition.

- **Phase 2 (proposed):** Content-integrity remediation — resolve §6.1 and §6.2 first, since both concern the honesty and validity of what learners are told they're practising, consistent with this whole project's established engineering ethic.
- **Phase 3 (proposed):** English/Writing/Vocabulary volume and genre expansion, sequenced by pathway need (CSSE/Independent first, since they depend most on these three subjects).
- **Phase 4 (proposed):** Reasoning taxonomy population (AEP-002's already-designed sub-skill codes) and difficulty calibration.
- **Phase 5 (proposed):** Vocabulary schema extension + content population against the 7 blocked competencies.
- **Phase 6 (proposed):** Mock format-fluency (CEM/ISEB), the lowest-new-design-burden item, sequenced last only because §6.1/§6.2 are more urgent, not because this is unimportant.

Each proposed phase should begin with its own scoped authorisation, per this project's established one-programme-at-a-time discipline.

---

## Sources consulted

Live source (read directly, this session): `data/lessons.ts`, `data/maths.ts`, `data/vocabulary.ts`, `data/writing.ts`, `data/verbal-reasoning/*`, `data/non-verbal-reasoning/*`, `data/spatial-reasoning/*`, `data/numerical-reasoning/*`, `data/ali/*SyntheticFixture.ts`, `types/reasoning.ts`, `lib/pathways.ts`, `lib/ali/pathwayEligibility.ts`, `app/mocks/[pathway]/page.tsx`, `app/english/page.tsx`, `app/maths/page.tsx`, `app/vocabulary/page.tsx`.

Existing planning documents consulted (read in full via a dedicated research pass): `AEP-001_LEARNING_SCIENCE_CONSTITUTION.md`, `AEP-002_KNOWLEDGE_FRAMEWORK.md`, `AEP-003_QUESTION_INTELLIGENCE_FRAMEWORK.md`, `AEP-004_LEARNING_JOURNEY_FRAMEWORK.md`, `AEP-005_ASSESSMENT_FRAMEWORK.md`, `AIW-001_EDUCATIONAL_DATA_MODEL.md`.

---

**STOP CONDITION MET.** No code has been implemented. Awaiting independent programme review and Founder approval before any Phase 2 authorisation.
