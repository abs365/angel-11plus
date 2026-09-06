# Angel 11+ — Final Educational Family Classification & Foundation Acceptance Gate

**Prepared:** 2026-09-06. Final bounded closure task following `ANGEL_EDUCATIONAL_FOUNDATION_COMPLETION_REPORT.md` (PARTIAL, one blocker: English/Writing genuine-family classification). The Founder has now supplied the missing production evidence (full English Q1 detail, the identified unfamilied Writing row). This report classifies it, closes the blocker, and makes the final Foundation decision. **No migration was created or applied. No production data was mutated. No content was generated or published.**

---

## A. Authoritative Inventory

| | Maths | English | Writing | Total |
|---|---|---|---|---|
| **ALL-STATUS bank rows** | 301 | 243 | **17** (16 familied + 1 unfamilied, `wrt-003`) | **561** |
| **PRACTICE-VISIBLE rows** (anon-confirmed live) | 202 | 142 | 7 | 351 |
| **Database family records** | 74 | 80 | 16 | 170 |
| **Genuine educational families** (this pass) | 74 (confirmed) | **13** (consolidated, heuristic) | **1** (consolidated, heuristic) | 88 |

**Scope kept separate, never mixed**: MOCK-ELIGIBLE and OTHER GOVERNED STATES (provisional/`authentic_assessment_candidate`/`independently_validated`) are tracked at the FAMILY level for English this pass (`practice_only=17`, `mock_only=38`, `mixed=0`, `neither_track=25`, summing to 80) — this is a family-count split, not a row-count split, and is not combined with the row-level Mock-reserved supply figure (~128 rows, Maths+English+Writing, carried forward unchanged from the prior report, not re-measured this pass). **561 (not the stale 558) is now the correct all-status total** — the +3 is Writing's corrected 17 (not the stale 14), reflecting a correction, not new content.

## B. English Classification

**Raw database family records: 80. Genuine educational families: 13 (from the 18 named, wave-authored records the Founder cited, covering 140 rows).** The remaining 62 of the 80 database family records (`eng-inc*`, `eng-pc*`, `mock-eng*`, row_count typically 1-4) are assessment/passage/question-type-scoped groupings, per the Founder's own explicit instruction — **not** counted as additional genuine educational families, and not assumed to be zero either; genuinely unresolved.

Consolidation (`lib/ali/familyTaxonomy.ts`'s `ENGLISH_EDUCATIONAL_FAMILY_CONSOLIDATION`, 6 tests proving arithmetic/membership):

| Genuine educational family | Member database records | Rows |
|---|---|---|
| Retrieval | direct-retrieval, rc01-retrieval | 19 |
| Sequencing | sequencing, rc06-sequencing | 16 |
| Vocabulary / Meaning in Context | vocab-explain | 17 |
| Synonym Selection | synonym-battery | 11 |
| Quotation + Explanation | quote-explain | 13 |
| Multi-Select Reasoning | multiselect | 6 |
| Multi-Select + Justification | tick-justify (provisional) | 11 |
| Emotion & Cause | emotion-cause, rc08-emotion | 13 |
| Language Effect / Word Choice | rc10-word-choice, effect-of-language | 12 |
| Atmosphere / Mood | rc10-atmosphere-mood | 6 |
| Two-Character Reasoning | two-character | 6 |
| Motive Inference | motive-inference | 4 |
| Comparison | comparative-extraction, rc07-comparative | 6 |

**Merge discipline, disclosed**: merged only where family NAMES describe the same reasoning demand (e.g. Retrieval, Sequencing, Comparison — same demand, different authoring wave); kept separate where the demand differs materially even under a shared topic (Vocabulary/Meaning-in-Context vs. Synonym Selection — explain vs. match; Multi-Select vs. Multi-Select + Justification — justification is a material addition, not cosmetic). **All entries are `heuristic` confidence** (name/row-count reasoning, not live content review) — the weakest of the 13, Emotion & Cause, is explicitly flagged in code as the merge most needing future content confirmation.

**94 passage-bound groups / 24 passages is not a contradiction** of either 80 or 13 — it is a different lens (keyed on passage × reasoning-pattern, `lib/ali/englishFamilyModel.ts`), so the SAME educational family (e.g. Retrieval) legitimately produces a distinct passage-bound group per passage it appears in. More passage-bound groups than database families is expected. Neither 80, 94, nor 13 alone should be quoted as "the" English depth number without its own qualifier.

## C. Writing Classification

**17 total rows (16 familied + 1 unfamilied). 16 database family records. Genuine educational families: 1** — "Reflective/Discursive Writing Response" (`lib/ali/familyTaxonomy.ts`'s `WRITING_EDUCATIONAL_FAMILY_MODEL`, 2 tests). Every one of the 16 cited records shares the same competency (`QT-WC-01a`) and the same, single, currently-implemented task type (`writingTeachingContent.ts`'s own `WritingTaskFamily = "writing-reflective-discursive"` — the picture-narrative type is explicitly deferred elsewhere in this codebase). Topic (favourite place, kindness, screen time, mistake learned, ...) is a **prompt/task variant** dimension within that one family, never a separate educational family — no evidence (genre, purpose, audience, rubric dimension) distinguishes any of the 16 from the others. 7 of the 16 are production_eligible/practice_eligible (already traced to Founder-authorised migrations 203/204, not reopened); the remainder sit in `authentic_assessment_candidate`/`independently_validated`.

## D. wrt-003 Disposition

**A. REMAIN PROVISIONAL / UNCLASSIFIED.**

Evidence: `wrt-003` (`subject=writing`, `skill=QT-WC-01a`, `question_type=open-response`, `eligibility_status=provisional`, `family_id=NULL`, `pathway=["csse"]`, `content_difficulty=hard`) shares the exact competency of the single Writing educational family established in Section C — in substance, it already belongs there. But its specific prompt/topic content is not available to this session, so whether it duplicates an existing topic variant (arguing for no new assignment) or represents a genuinely new one (arguing for a new task/prompt variant record) cannot be determined from available evidence. Per the Founder's own explicit instruction — "if evidence is insufficient, choose A" — no assignment is made. Its current `provisional`/not-practice-eligible/not-mock-eligible status is itself the correct governance state: it poses zero learner-exposure risk while unclassified, so there is no urgency overriding the "do not guess" standard. **No production mutation performed.**

## E. Factory Readiness

Kept explicitly separate from educational genuineness, per the Founder's own instruction that a family may be educationally real yet not Factory-ready:

| | Maths | English | Writing |
|---|---|---|---|
| Database family count | 74 | 80 | 16 |
| Genuine educational family count | 74 | 13 (+62 unresolved) | 1 |
| **Factory-ready family count** (real `StructuralBlueprint` coverage) | **1** (`mr03-angle-sum`) | **0** | **0** |
| **Teaching-ready** (real full lesson, `fullLessonRegistry.ts`) | 3 competencies (MR-01/03/04) | 2 competencies (RC-01/02) | 0 (bounded model/planning content only, not a full lesson) |
| **Mock-eligible family count** | not decomposed this pass | **38** (Q2, family-level, new evidence this pass) | not decomposed this pass |

Of Maths's own 74 genuine families, only 1 has real blueprint depth (7 blueprints, `mr03-angle-sum` — the Question Factory Scale Architecture proof family); `precision-frac` has 1 blueprint. The other 72 Maths families remain educationally genuine but structurally undeveloped (blueprint depth 1, undisclosed as anything more). **English and Writing have zero Factory-ready families** — no `StructuralBlueprint` work has been done for either subject; English additionally requires its own passage-provenance architecture (not built) before any blueprint work can safely begin. **This is disclosed as real content-manufacturing work still to do, not a Foundation blocker** — per the Founder's own explicit Section 13 instruction.

## F. Effective Educational Depth

- **Maths**: 74 genuine families; structural blueprint depth = 7 for 1 family, 1 (undeveloped) for the other 73.
- **English**: 13 genuine families (140 rows) confirmed this pass, plus 62 database records genuinely unresolved (neither confirmed nor denied); structural blueprint depth = 0 everywhere.
- **Writing**: 1 genuine family (16 familied rows + 1 unclassified); structural blueprint depth = 0.

**Total confirmed genuine educational families across all three subjects: 88** (74+13+1) — a materially more honest number than 170 (raw database records) or 558/561 (raw rows), matching this whole programme's own standing instruction never to substitute one for the other.

## G. First Controlled Scale Wave Plan (families and allocation only — NOT generated)

Realistic, evidence-based, prioritising structural depth over easiest-to-generate volume:

| Family | Subject | Rationale | Approx. candidates |
|---|---|---|---|
| 3-5 additional Maths families (e.g. `mr01-decimal-computation`, `mr04-percentages`-linked families) | Maths | Only pathway with a PROVEN blueprint-architecture pattern (Scale Architecture's `mr03-angle-sum`, 7 blueprints, real throughput/diversity evidence) — extend the SAME proven process, not a new one | 150-220 |
| `mr03-angle-sum` (existing family) — modest additional blueprint depth if evidence supports a genuine 8th-10th structure | Maths | Already proven; safe to extend cautiously within its own established ceiling (Section H of the Scale Architecture report: ~500-1,000 lifetime candidates per family before saturation) | 20-40 |
| **Not included in this wave**: any English or Writing family | English/Writing | Zero Factory-ready families in either subject (Section E) — this wave's realistic candidate-generation capability remains Maths-only; the newly-classified 13 English + 1 Writing genuine educational families are now the correct TARGET LIST for a future blueprint-architecture-design pass, not this wave's own output | 0 |

**Total: ~200-260 candidates, Maths-only, across 4-6 families** — squarely within the Founder's own 200-300 guidance. English/Writing's genuine-family classification (this report's own main deliverable) is the prerequisite that makes a FUTURE English/Writing blueprint-design pass well-targeted (Retrieval, Vocabulary/Meaning-in-Context, and Sequencing — the three highest-row-count, clearest-single-demand English families — are the strongest candidates to design first), not a reason to include them in THIS wave's candidate count. **Nothing above is generated by this report.**

## H. Test Evidence

- `npx tsc --noEmit` — clean.
- `npm test` — **4,019/4,019 pass** (4,011 carried forward + 8 new: `ENGLISH_EDUCATIONAL_FAMILY_CONSOLIDATION`/`WRITING_EDUCATIONAL_FAMILY_MODEL` arithmetic/membership/confidence proofs in `tests/lib/ali/familyTaxonomy.test.ts`).
- `npx eslint` scoped to every file touched this pass — zero errors, zero warnings.
- `node scripts/copy-quality-guard.mjs` — PASS, 304 files.
- `node scripts/migration-sql-guard.mjs` — PASS, 232 migration files (**unchanged** — no migration created or modified).
- `npm run build` — clean, all routes compile.
- Question Factory architectural guards (`reviewGateEnforcement.test.ts`, `crossSubjectQuestionFamilyModel.test.ts`) — both still passing; `familyTaxonomy.ts`'s new consolidation tables were added to code already on that guard's reviewed allow-list, no new review gap introduced.

## I. Production Safety

- No migration was created or applied this pass (232 remains at its prior, already-applied, reconciled state).
- No production data was mutated — `wrt-003` was not assigned a family or eligibility change.
- No candidates published, no bulk generation, no new mocks.
- All changes this pass are two files: `lib/ali/familyTaxonomy.ts` (additive consolidation data + reasoning) and its test file, plus this report and a targeted `ANGEL_EDUCATIONAL_CONTENT_STANDARD.md` update (Section 2 + Correction Log).
- Zero write/RPC calls anywhere in this pass's code (confirmed by inspection — the new module exports only static, literal data structures and a pure classification function, no I/O).

## J. Remaining Non-Blocking Content Gaps

(Real, disclosed, explicitly NOT treated as Foundation blockers, per the Founder's own Section 13 standard)

1. 62 of English's 80 database family records remain unclassified beyond "not yet confirmed genuine or mechanical" — future work, not urgent.
2. `wrt-003`'s specific disposition (join/new-family/remain-unclassified) cannot be finally confirmed without its actual prompt content — safely inert as `provisional` in the meantime.
3. Zero Factory-ready families exist for English/Writing — real content-manufacturing work for a future, separately-authorised wave.
4. Emotion & Cause's merge (the weakest-confidence entry in the English consolidation table) should be confirmed against real content when available.
5. Mock-eligible ROW counts (as opposed to this pass's new family-level split) were not re-measured this pass for English/Writing.

## K. FINAL DECISION

**EDUCATIONAL FOUNDATION COMPLETE — READY FOR CONTROLLED SCALE.**

Justification, against the Founder's own explicit 8-point acceptance standard: (1) the authoritative inventory is reconciled (561/351, family counts by subject, scopes kept separate); (2) English's 80 and Writing's 16 database family records are no longer treated as educational depth — 13 and 1 genuine educational families are established instead, with clear, tested, disclosed reasoning; (3) this classification is sufficient to plan content supply, evidenced by the concrete first-wave family list in Section G; (4) `wrt-003` has an evidence-based governance disposition (remain provisional); (5) TeachingState remains genuinely live (unchanged, closed); (6) remediation remains genuinely live (unchanged, closed); (7) `ANGEL_EDUCATIONAL_CONTENT_STANDARD.md` now governs the final classification model and remains the permanent standard; (8) no unresolved blocker prevents a safe, Maths-led 200-260 candidate controlled wave — the only realistic near-term wave given real Factory-readiness (Section E), and explicitly not blocked by English/Writing's remaining Factory-readiness gap, per the Founder's own instruction not to treat that alone as a blocker. 4,019/4,019 tests pass, zero regressions, zero production mutation.

---

**STOP.** Per the Founder's own instruction: no generation of the 200-260 (or 200-300) candidates, no publication of the original 30, no publication of the 80-candidate proof batch, no further migration. Founder review remains the required gate before controlled content manufacturing begins.
