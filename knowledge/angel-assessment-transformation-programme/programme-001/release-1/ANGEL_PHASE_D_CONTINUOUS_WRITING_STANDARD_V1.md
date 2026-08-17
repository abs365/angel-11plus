# Angel 11+ — CSSE Completion Programme, Phase D — Continuous Writing Educational System, Assessment Standard and Readiness

**Prepared:** 2026-08-17. Founder authorisation: APPROVED TO PROCEED, continuing directly from Phase C's closure (Decision 65).
**Scope:** the CSSE Continuous Writing educational system — teaching, practice, and assessment architecture. Explicitly excludes Mock, Phase E, other pathways, and bulk content authoring.
**Grounding:** this document does not start from zero. Three existing design documents (`CONTINUOUS_WRITING_EVIDENCE_REVIEW_V1.md`, `CONTINUOUS_WRITING_EXCELLENCE_MODEL_V1.md`, `WRITING_FEEDBACK_EVIDENCE_COMPLIANCE_ASSESSMENT.md`, all 2026-08-11) already did rigorous primary-source evidence work and produced a sound TEACHING/PRACTICE/ASSESSMENT-separated model. This document independently re-verifies their central claims against current official evidence (Part 2 below), finds them still accurate, and extends them into an implementable architecture (Parts 3-9) plus a bounded proof (a separate implementation record, not this document).

---

## Part 1 — Current Writing estate (reconciled fresh)

**Routes:** two structurally separate implementations exist.
1. `app/writing/page.tsx` ("Creative Writing") — a standalone, gamified, XP-based feature with its own state machine, reachable via bottom-nav "Learn" for any pathway. Uses `data/writing.ts`'s 4 static prompts (`wrt-001`..`004`), none evidence-traced to the real CSSE task structure (types: narrative ×2, descriptive, persuasive — none is "reflective/discursive" or "picture-narrative," the two real evidenced CSSE genres).
2. `WritingActivity` inside `app/learning-intelligence/practice/[area]/page.tsx` — the real CSSE Practice pathway's Writing area. Currently **unreachable by any real learner**: `ali_question_bank` has exactly 1 Writing row (`wrt-003`), `eligibility_status: provisional`, so `generatePersonalisedSession` returns an empty session and `loadAndStart()` throws before this component ever renders (an error/empty state, not silently-fed fallback content — re-confirmed this phase, unchanged from the Phase A finding).

**API:** one shared endpoint, `app/api/writing-feedback/route.ts`, called by both routes. Sends the student's writing verbatim to `gpt-4o-mini` (temperature 0.3), returns `strengths`/`areasToImprove`/`suggestedUpgrade`/`tutorTip`/`overallScore` (0-100).

**Content:** `data/writing.ts` (4 static prompts, legacy route only) + `ali_question_bank`'s single `wrt-003` row (real pipeline, `provisional`, 0 Practice Eligible). **Confirmed by direct query: the DB row's prompt is a byte-for-byte copy of `data/writing.ts`'s own `wrt-003`** ("persuasive speech... arguing FOR or AGAINST a total ban on smartphones") — meaning the one real, content-governed Writing row was seeded from the legacy static pool, not authored to match the real evidenced CSSE genre pair (reflective/discursive OR picture-narrative). This is a genuine content-authenticity gap, disclosed here, not fixed in this phase (fixing it means editing existing content, a governance action requiring the same review pipeline as any other content change — out of this phase's architecture-and-proof scope).

**Evidence/mastery:** both routes correctly call `recordLegacyPracticeEvidence(..., supportTier: "supported")` — Decision 60's mastery quarantine, re-verified intact by direct code read (not just trusted from the prior decision) and by the standing `writingMasterySafety.test.ts` suite (still passing, unmodified this phase).

**Current AI evaluation state, re-verified against the live file (not the 2026-08-11 documents' own account, which is now stale on this specific point):** the "STRENGTHEN" recommendation those documents made — remove the false CSSE-examiner attribution, disclaim the score — **has already been implemented**, evidently during Phase A's own Decision 60 work. The live system prompt explicitly states "You are NOT a CSSE (or any other exam board) examiner" and "it is not calibrated against any exam board's mark scheme and must not be described as one," and the UI (`WritingActivity`) shows this disclaimer to the learner. **What remains unaddressed:** the six feedback dimensions the prompt asks for (originality, technical accuracy, ambitious vocabulary, sentence variety, narrative voice, atmosphere) are Angel's own invented craft-quality list, not the real evidenced 5-dimension CSSE rubric (Ideas / Vocabulary+Spelling / Grammar / Structure / Punctuation); the output remains one opaque `overallScore`, not analytic/dimension-level judgement; there is no planning stage, no MODEL, no guided scaffolding, no remediation loop — the entire journey is "read a prompt, write, submit, get one AI pass back."

**Tests:** `writingMasterySafety.test.ts` (7 tests, mastery-quarantine proof) is the only Writing-specific test file. No test exists for the feedback logic itself, the prompt content, or any teaching mechanism (none existed to test).

**No other duplicate/legacy Writing architecture was found** beyond the two routes already known and disclosed above.

---

## Part 2 — Current CSSE Writing standard (evidence, re-verified against current official sources)

**Primary repository evidence** (`CONTINUOUS_WRITING_EVIDENCE_REVIEW_V1.md`, direct reading of 3 real CSSE Continuous Writing papers — 2021, 2022, 2023 Entry — plus the official undated sample mark scheme):

| Finding | Classification |
|---|---|
| Exactly 2 prompts; Q1 always reflective/discursive (own experience/opinion), Q2 always "write a story based on the picture below" | **STABLE PATTERN**, 3/3 years |
| "At least six sentences" minimum-length instruction | **STABLE PATTERN**, 3/3 years |
| Suggested 20 minutes within the 60-minute English total | **STABLE PATTERN**, 3/3 years |
| Double-marking + moderation ("1st marker," "2nd marker," "if moderated, final score") | **STABLE PATTERN**, 3/3 years |
| Total marks: 15 (2021, 2022) → 20 (2023) | RECURRING WITH VARIATION |
| Content(15)/SPAG(5) numeric split | YEAR-SPECIFIC (2023 only) |
| Official 4-band × 5-criterion rubric (Ideas, Vocabulary incl. spelling, Grammar, Structure, Punctuation) | The only official qualitative guidance; **Grammar populated for Band 4 only** — Bands 1-3 have no official text |
| Mapping of the 5-criterion rubric onto the numeric split | **INSUFFICIENT EVIDENCE** — no asset states it |
| Fine-grained sub-competencies (planning, cohesion, sentence variety as distinct from construction, tone/register, etc.) | **INSUFFICIENT EVIDENCE as CSSE-official** — Angel's own educational interpretation if used, must be labelled as such |

**Current official evidence, independently fetched and read this session (2026-08-17), not merely re-cited:**

- **Source:** `csse.org.uk` (the Consortium of Selective Schools in Essex's own official website) and its own currently-linked **CSSE Information Guide, 2027 Entry** (`https://csse.org.uk/storage/2026/03/CSSE-Information-Guide-2027-Entry.pdf`), test date Saturday 19 September 2026. **Primary, official, current.** Accessed 2026-08-17.
- **What it establishes:** "The English paper will last sixty minutes with ten minutes additional reading time. The Mathematics paper will last sixty minutes." Final scores are "mathematically standardised and 'weighted', each being worth 50% of the marks." No offer below a standardised total of 303, no re-mark policy. **No mention of Applied Reasoning anywhere in this current, live document** — silent confirmation, not a restatement, that AR remains absent from the current exam.
- **Confidence:** HIGH — this is the actual current official admissions guide, not a summary or a tuition-provider's account of it.
- **On Applied Reasoning specifically:** the CSSE homepage (`csse.org.uk`, fetched directly) states in its own words: **"With effect from September 2024 (2025 Entry) the English paper does not contain Applied Reasoning questions."** This independently reconfirms Decision 58's classification with a direct, dated, official statement — **Decision 58's classification (HISTORICAL CSSE EVIDENCE, NOT CURRENT CSSE EXAMINATION CONTENT) is not merely left standing but now has stronger, current, directly-quoted official corroboration than it had at the time it was made.** No reconsideration is warranted; if anything the classification is now better evidenced than before.
- **On the Continuous Writing mark scheme specifically:** the CSSE examination page (`csse.org.uk/examination/`) currently links **the same document** the repository already holds as `CSSE-002` — "English Continuous Writing (Sample Mark Scheme), Updated: 07.04.2020," at `https://csse.org.uk/storage/2020/05/ECW-Sample-Mark-Scheme.pdf`. **This resolves one of the Evidence Review's own flagged gaps**: the document was classified "undated... cannot be confirmed which year(s) it governed" — it is now confirmed dated (7 April 2020) and, more importantly, **confirmed still the live, current official rubric linked from the current 2026/2027-entry-era website**, six years on. The Grammar-blank-below-Band-4 gap remains genuinely unresolved by this finding (the document itself is unchanged), but its currency is no longer in doubt.
- **No conflict found** between repository primary-source evidence and current official evidence, on any point. No secondary source (tuition providers, exam-prep blogs) was given weight where it would have overridden either.
- **Secondary sources consulted, given lower weight per instruction:** several tuition-provider pages (Examberry, Atom Learning, elevenace.com, progress-academy.org.uk) broadly corroborate the 20-minutes/15-20-marks/two-question structure; one (Examberry) states "15 marks" without the 2023 20-mark update, illustrating exactly why secondary sources are not treated as authoritative here — the primary-source repository evidence (the actual 2023 paper) is trusted over this discrepancy.
- **No copyrighted examination material is reproduced anywhere in this document or in any code this phase produces.**

**Conclusion, restated from the Evidence Review and now independently reconfirmed:** the CSSE Continuous Writing **task** (timing, dual-genre structure, double-marking) is STABLE-PATTERN evidenced with high confidence. The **marking/scoring layer** is not — the only rubric has a real, undisclosed-by-CSSE-itself gap (Grammar below Band 4) and no stated mapping to the numeric totals. This asymmetry is the single most important fact shaping every design decision in Parts 3-5 below.

---

## Part 3 — The Angel Continuous Writing standard

**Adopts the existing Excellence Model's loop, independently re-derived here to confirm it still holds, not merely copied:**

```
DIAGNOSE → TARGETED TEACHING → COMPONENT PRACTICE → GUIDED APPLICATION →
COMPLETE WRITING → TIMED WRITING → ASSESSMENT → FEEDBACK →
DELIBERATE IMPROVEMENT → REASSESSMENT → MASTERY MAINTENANCE
```

This is deliberately **not** a single "prompt → planning → write → submit → score" pipeline, and deliberately **not** a mechanical copy of the Mathematics MODEL→GUIDED→INDEPENDENT→REMEDIATION→TRANSFER→EVIDENCE contract, because Writing's assessment layer carries evidentiary weaknesses Mathematics' exact-match answers never had (Part 2). The bounded proof implementation (a separate record) covers the DIAGNOSE-adjacent MODEL/PLAN/GUIDED/INDEPENDENT/ASSESSMENT/FEEDBACK/REMEDIATION stages for one task family; TIMED WRITING, REASSESSMENT, and MASTERY MAINTENANCE remain designed here but not built (Part 9, Part 10).

**Dimension set — evidence-bounded, exactly as the Excellence Model established:** **Ideas, Vocabulary (incl. spelling), Grammar, Structure, Punctuation.** Five, no finer, for anything presented as CSSE-evidenced. A finer internal breakdown (e.g. tracking paragraphing separately from sentence variety within "Structure," for teaching-sequencing purposes only) may exist underneath this as an Angel interpretation layer, but user-facing language stays at the 5-dimension level, labelled as Angel's own framing where it is.

**Genuinely CSSE-evidenced vs. Angel design decision, kept visible throughout the architecture (code and copy both):**

| Dimension | Status |
|---|---|
| Ideas, Vocabulary+Spelling, Grammar, Structure, Punctuation (the 5 dimensions themselves) | CSSE-EVIDENCED (official rubric) |
| Two task genres (reflective/discursive, picture-narrative) | CSSE-EVIDENCED (3/3 years) |
| ~20 minutes suggested, 6-sentence minimum | CSSE-EVIDENCED (3/3 years) |
| Double-marking/moderation | CSSE-EVIDENCED, structurally not replicable by one AI pass — disclosed, not pretended away |
| Planning/scaffolding stages, remediation categories, transfer-writing tasks | ANGEL EDUCATIONAL DESIGN — sound teaching practice, not a CSSE requirement |
| Any numeric "Angel Progress Indicator" | ANGEL DESIGN, explicitly never presented as CSSE-equivalent |

---

## Part 4 — Assessment and feedback standard

**Rejected: "improve the existing prompt."** The existing endpoint already fixed its CSSE-attribution defect (Part 1) but never fixed the deeper design defect: an opaque single score, dimensions not traceable to evidence, no distinction between diagnostic/teaching/formative/independent-evidence/Mock-prediction uses.

**Adopted: analytic, dimension-level judgement, replacing the single `overallScore` as the primary output.** For each of the 5 evidenced dimensions, the system returns a qualitative level (`developing` / `secure` / `strong`, deliberately not a 1-100 sub-score — CSSE's own official band language, Part 2, is qualitative, and inventing five more precise numbers would repeat exactly the fabricated-precision defect this phase exists to close) plus a short, text-grounded comment referencing the student's actual words. **A single Angel Progress Indicator (0-100) may still be shown, but only as an explicitly labelled, Angel-internal aggregate of the 5 dimension judgements — never presented as, or capable of being mistaken for, a CSSE mark.** This directly implements Part 4's five required distinctions:

1. **Diagnostic feedback** — the dimension-level output itself, shown every time.
2. **Teaching feedback** — the MODEL/planning/remediation content (Part 6), tied to whichever dimension is weakest.
3. **Formative assessment** — a Guided-Application or Component-Practice attempt's feedback; never recorded with `supportTier: "independent"`.
4. **Independent performance evidence** — this phase does not produce any. Every AI-scored Writing attempt, regardless of the confidence gate's own read (Part 5), is recorded with `supportTier: "supported"`, unconditionally — the confidence gate decides only whether a dimension's *displayed judgement* is a normal read or an honestly degraded one (Part 5), never whether the evidence tier can rise to `"independent"`. Per the governing directive's own explicit instruction, Decision 60's quarantine is not weakened, and no confidence level this phase can compute unlocks independent evidence without a future, separate, explicit Founder decision to adopt a genuinely different evidence standard.
5. **Mock/exam prediction** — explicitly **not** produced by this phase or this architecture at all (Part 13).

**Decision 60's mastery quarantine is preserved, not weakened.** No change to `lib/ali/mastery.ts`. The bounded proof's own evidence-recording call passes `supportTier: "supported"` unconditionally, for every AI-scored Writing attempt, matching the existing, unmodified gate — this is a blanket quarantine, not a confidence-dependent one.

---

## Part 5 — AI safety, consistency, and calibration

Implemented as a **pre-flight confidence gate** (`lib/learningEngine/writingRubric.ts`, pure functions, unit-tested) that runs **before** any AI call, plus explicit uncertainty handling **after** it:

- **Length check, evidence-grounded, not arbitrary:** the real CSSE instruction is "at least six sentences," not the previous endpoint's own invented "60 words" heuristic (which has no evidentiary basis at all). Replaced with a genuine sentence-count estimate.
- **Off-topic detection:** a bounded keyword/theme-overlap heuristic between the prompt and the response; a genuine LLM judgement call for anything the heuristic can't resolve, disclosed as such (not claimed as a hard rule).
- **Template/copied-response detection:** flags a response that is suspiciously close to the MODEL text itself, or generically boilerplate, so a rehearsed answer cannot silently reach the same evidence tier as a genuine attempt.
- **Prompt-injection resistance:** the student's writing is sent to the model strictly as a labelled "Student's response" data block (already true of the existing implementation, re-verified); the system prompt is reinforced to explicitly instruct the model to treat any instruction-like text inside the student's submission as content to evaluate, never as a command to follow — closing a real, previously-unaddressed gap.
- **Confidence boundary, the central new mechanism:** every dimension judgement carries an internal confidence signal (derived from response length/completeness/on-topic-ness, not invented). **Where confidence is low, the system does not silently produce a normal-looking result** — it returns a degraded, honestly-labelled response (e.g. "too short to assess Structure meaningfully") for that dimension specifically, and the evidence-recording call is forced to `supportTier: "supported"` regardless of the score, so uncertainty can never convert into independent mastery evidence by construction, not merely by convention.
- **Fallback/unavailable-API behaviour:** unchanged from the existing, already-correct implementation (a clear "temporarily unavailable" message, no silent fake feedback).
- **Verbosity/feedback overload:** the existing 4-part shape (2 strengths, 2-3 improvements, one upgrade, one tip) is kept but now explicitly tied to the dimension the weakest score identifies, rather than a free-floating list.
- **Hallucinated errors, false praise/criticism, spelling/grammar false positives, over-penalisation of style, cultural/name bias, verbosity:** these remain genuinely probabilistic properties of the underlying model that cannot be eliminated by prompt engineering alone — **documented honestly as such (Part 11), not claimed solved.**

---

## Part 6 — Teaching architecture (scalable, not hand-built pages)

Reuses exactly the lesson Mathematics Phase B (Decision 62-63) already proved: a plain `Record<taskFamilyId, WritingFamilyTeachingContent>` lookup (`lib/learningEngine/writingTeachingContent.ts`), not a second engine, not per-family pages. Each entry carries: a MODEL (a fixed, safe, non-live worked opening/paragraph, never the live prompt's own content); a planning scaffold (a small number of guided planning questions specific to the genre — reflective/discursive vs. picture-narrative genuinely need different planning prompts, not one generic template); a misconception/remediation category mapped to the weakest-dimension signal; and the CSSE-evidenced 5-dimension rubric reused unmodified across every family (never re-derived per family, since the rubric itself is not family-specific evidence). This structure supports future expansion (more task families, more remediation categories) by adding data, not by copy-pasting a page.

---

## Part 7 — Prompt and task-family architecture

**Two justified families, both CSSE-evidenced (Part 2), no invented third genre presented as CSSE fact:**

1. **`writing-reflective-discursive`** (Q1 pattern) — a prompt inviting the child's own experience or opinion. Educational purpose: sustained, organised personal/opinion writing under the real evidenced minimum-length and timing constraints. Teaching progression: MODEL (a worked reflective opening + plan) → planning scaffold (3-4 structuring questions: what is your view/experience, what is your strongest reason/memory, how will you order your points, how will you conclude) → Guided (partial structure) → Independent (untimed) → Timed. Common misconceptions: drifting off the actual question asked; a list of points with no development; no clear personal stance. Assessment dimensions: all 5, unweighted between them (no CSSE evidence for a per-dimension weighting). Transfer requirement: the same planning scaffold must work across genuinely different reflective topics, not one memorised structure.
2. **`writing-picture-narrative`** (Q2 pattern) — a story built from a picture stimulus. **Deferred, not built this phase**: requires an original, non-copyrighted image asset, a genuinely separate content-sourcing step outside this phase's architecture-and-proof scope. Documented here so a future increment does not need to re-derive the justification.

**No third, invented family (e.g. "persuasive speech," the current mismatched `wrt-003` content) is presented as CSSE-evidenced.** If Angel chooses to keep persuasive writing as a *non-CSSE-labelled* general writing-skill exercise, that is a legitimate Angel design choice — but it must never be presented as preparing a child for the actual CSSE Continuous Writing task, which does not contain a persuasive-speech genre in any of the 3 years of primary evidence read.

---

## Part 8 — Anti-memorisation and authentic writing

Variation dimensions the architecture must support, matching a genuine transfer-writing intent, not cosmetic name/number changes: **topic/stimulus** (many distinct reflective topics, many distinct pictures — supply depth, not built this phase), **viewpoint** (for/against, personal/observed), **audience** (implicit in the reflective genre; explicit for any future persuasive-adjacent Angel-original exercise, clearly separated from CSSE-genre content), **constraint** (word/sentence-count target varying realistically around the evidenced 6-sentence minimum, not fixed). The MODEL is a fixed, separate scenario (Part 6) specifically so a learner cannot reverse-engineer the live prompt's own content from it — mirroring Mathematics' own proven MODEL/live-answer collision discipline, applied here as MODEL/live-prompt non-overlap (verified for the one authored MODEL in the bounded proof). **Genuine anti-memorisation at scale (many distinct prompts per family) requires real content supply this phase does not build** (Part 14) — the architecture is designed to support it, not to claim it solved with one MODEL and one prompt.

---

## Part 9 — Timing and exam-condition progression

Evidence-grounded (Part 2): ~20 minutes suggested within a 60-minute English paper, at least 6 sentences. Designed progression, **not built this phase**: untimed teaching (MODEL/planning/Guided, no clock) → lightly-constrained practice (a suggested-time indicator, not enforced) → timed independent writing (the real ~20-minute constraint, enforced, still Practice not Mock) → Mock conditions (a later, separate phase's own no-hints/sealed-reserve contract, Decision 49). No timing mechanism exists in the current codebase for any subject (confirmed absent in Phase A/C's own audits too) — this is a genuinely new capability, not extended from an existing one, and is correctly out of this phase's bounded-proof scope.

---

## Part 13 — Future Mock compatibility boundary

**TEACHING FEEDBACK** (this phase's entire scope): dimension-level, formative, tied to MODEL/remediation, recorded as `supportTier: "supported"` unconditionally. Safe to build now; evidence-sufficient (Part 2's task-level STABLE PATTERN findings).

**MOCK ASSESSMENT** (explicitly not this phase, not this architecture as it stands): would require, at minimum — (a) the Grammar-below-Band-4 evidence gap closed or explicitly modelled as a known limitation with Founder sign-off; (b) a resolved position on how a single AI pass substitutes for CSSE's own real double-marking/moderation process (Part 2's own new finding, still an open question, not solved by this phase); (c) calibration evidence (Part 11) showing acceptable scoring consistency across repeated identical submissions, gathered over real usage, not a one-session test; (d) an explicit Founder decision that Writing performance may contribute to any readiness/prediction claim at all, given every other subject's own Mock work remains gated behind Decision 49's sealed-reserve, no-Practice-leakage contract. **No predictive claim is made anywhere in this phase's work.**

---

## Part 14 — Content scale and the 400-500 target

The present 264-question bank is not final scale; Writing sits at the extreme low end (1 provisional row) of a target that should eventually include meaningful Writing supply. This phase does not bulk-author toward that number. **What Phase D itself establishes as educationally justified, for a future content phase to act on:** at minimum, several distinct prompts per justified task family (reflective/discursive first, picture-narrative once image sourcing is resolved) to support genuine transfer practice (Part 8) — not a specific count, since "how many" is a supply-depth judgement for whoever authors that content, not an architecture decision. Writing tasks should be **counted separately from objective questions** in any future scale target, since a single Writing task represents materially more sustained learner effort (a 20-minute constructed response) than a single Mathematics or English objective item — collapsing them into one undifferentiated count would misstate genuine content depth. Additional English Reading supply (the 15-of-19-shared-passage finding, Decision 64) and additional Mathematics variation (the 14-LIMITED-family finding, Decision 63) both remain Phase E's concern, not this phase's. Any future Writing content should be authored `provisional`, never `mock_eligible`, until the same human-review pipeline every other subject already uses has approved it.
