# Angel 11+ — Question Supply Architecture

**Prepared:** 2026-09-05, as part of the Founder's "Educational Content Inventory, Competitive Benchmark and Question-Supply Architecture" assignment (Phase 4). Repo: `angel-11plus`, `main` branch.

This document answers one question: **how can Angel obtain enough excellent practice material without the Founder manually supplying thousands of questions?** It builds directly on `ANGEL_EDUCATIONAL_CAPACITY_AUDIT.md` (Programme Increments 017/018/020, most recently updated 2026-09-04) rather than re-deriving its findings, and on a fresh read of every relevant `lib/ali/*.ts` module carried out for this document specifically (cited inline). Per the Founder's own standing instruction, this is a design document only — it authorises no mass content generation and changes no production code or data.

---

## 1. Current State — How Content Actually Enters Angel Today

**There is exactly one supply channel today: hand-written SQL `INSERT` migrations, authored per batch/wave, each requiring a full Founder review-and-apply cycle.**

Evidence:
- `lib/ali/questionFamilyRegistry.ts:115-118` states this explicitly and is the most recent, most authoritative statement of it in the codebase: *"No procedural/template generation mechanism exists anywhere in this codebase... every real family today is hand-authored variants."*
- `ANGEL_EDUCATIONAL_CAPACITY_AUDIT.md` §16 (the Founder's own 17-stage pipeline audit) confirms the same finding independently: Variation Rules, Candidate Generation, Predictability Check, and Originality/Copyright Check are all **MISSING** — "authoring scripts produce hand-written SQL from hand-authored data, not generated candidates."
- 301 live Mathematics rows, 243 live English Reading rows, and 14 live Writing rows (§2/§24 of the capacity audit, independently corroborated this session via a live read-only anon-key query returning exactly 351 practice-eligible rows = 202+142+7) were **all** authored this way, migration by migration, since the project began.

This is not a defect in isolation — hand-authoring by a domain expert (the Founder) is a legitimate, high-quality source. The defect is that it is the **only** source, and it does not scale to the family-depth targets the capacity audit itself already quantified (§20: 150-280 families per subject vs. today's 74 for Mathematics and effectively 0 formalised for English).

---

## 2. The Foundation Already Exists — It Is Just Not Connected

This is the single most important finding in this document, and it changes the shape of every recommendation below: **Angel already has a materially complete set of content-governance building blocks. None of them are wired into a live authoring workflow or a live serving decision.** Confirmed by direct grep of the full `lib/` tree for each function's call sites, outside its own file and its own tests:

| Module | What it does | Wired in? |
|---|---|---|
| `lib/ali/inventoryClass.ts` | Classifies any content row into OPEN / RENEWABLE / MEASUREMENT / SEALED, with an explicit "stricter protection wins" precedence rule | **No** — zero call sites outside its own file |
| `lib/ali/structuralSignature.ts` | Deterministic, non-semantic structural signature; flags cross-family collisions (same structure under two different family labels — the "apparent volume from disguised duplication" risk) | **No** — only referenced by one diagnostic script (`scripts/test-structural-signature.ts`), never by an authoring or serving path |
| `lib/ali/antiMemorisationChecks.ts` | Duplicate-ID, exact-duplicate-stem, near-identical-stem (numeric-substitution-aware), family-over-selection, recent-exposure, and Mock/Practice-crossover checks | **No** — zero call sites outside its own file |
| `lib/ali/effectiveFreshCapacity.ts` | Classifies a (learner, family) pair as fresh / renewable-due / recently-exhausted, distinct from raw pool size | **No** — zero call sites outside its own file, not even a test |
| `lib/ali/englishFamilyModel.ts` | Derives an English "family" as (passage, reasoning-pattern) since English has no `family_id` column at all | **No** — zero call sites outside its own file |
| `lib/ali/contentPipeline.ts` | Infers a content row's current stage against an 11-stage model, and explicitly records which of the Founder's 17 named pipeline stages exist/partial/missing in this codebase | **No** — a read-side inference function, never called from any UI or script found |
| `lib/ali/questionFamilyRegistry.ts` | Canonical `QuestionFamilyRecord` shape, honest `"unclassified"` everywhere the metadata doesn't exist yet | **No** — zero call sites outside its own file and one test |

By contrast, the mechanisms that genuinely **are** wired into live decisions today are narrower but real: per-question cooldown by difficulty tier and weighted resurfacing (`lib/ali/selection.ts`, called from `app/learning-intelligence/practice/[area]/page.tsx`), and family/passage-level retrieval-stage weighting (`lib/ali/exposureIntelligence.ts`, called from `lib/learningEngine/sessionGenerator.ts`, called from three real app routes). These two are correctly credited as a genuine strength in the capacity audit (§12) and are unaffected by anything recommended below.

**Recommendation, and it is the cheapest, lowest-risk item in this entire document: before building anything new, wire the seven dormant modules above into (a) a pre-migration authoring check script and (b) the existing admin review surface (`app/admin-beta/review/page.tsx`).** This closes real gaps — duplicate/near-duplicate detection, cross-family structural collision detection, family-over-selection at serving time — using code that already exists, is already reasoned-about in comments, and in most cases already has a docstring explaining exactly how it should be called. This is P0/P1 work, not P2 — see `ANGEL_CONTENT_READINESS_GAP_REGISTER.md`.

---

## 3. Evaluating the Ten Candidate Supply Sources

The Founder asked for an evaluation of ten specific mechanisms. Each is assessed against Angel's real constraints: solo founder (no bench of question-writers), a real and current copyright/licensing exposure for anything resembling past-paper reproduction, and a hard requirement that no machine-generated item reach a learner without human educational review.

| # | Source | Verdict | Why |
|---|---|---|---|
| 1 | Educator-authored canonical questions | **Keep as the anchor source** | The only source in use today; highest trust, zero originality/copyright risk when genuinely original; the bottleneck is founder time, not quality |
| 2 | Validated question families | **Formalise, don't newly build** | `family_id` (Mathematics) and the new `englishFamilyModel.ts` (English) already give a real grouping concept; today it's informal and dormant (Section 2) — the work is wiring and governance, not invention |
| 3 | Parametric mathematics generation | **Build, narrowly, after wiring Section 2** | Mathematics arithmetic/short-answer content is the best-suited of anything in Angel's catalogue for parametric variation (numeric substitution within a fixed structure) — but `findNearIdenticalStems()`'s own numeric-normalisation check already anticipates and would catch the naive failure mode ("changing names or numbers alone... automatically counted as a new family", per the Founder's own instruction) if wired in first |
| 4 | Controlled English/comprehension generation | **Highest-risk, sequence last** | English items are inseparable from their passage (Section 4 of the capacity audit); a generated passage carries materially higher originality/quality/copyright risk than a generated numeric variant, and Angel has zero existing controlled-language-generation infrastructure of any kind. Requires human educational review on every single candidate, not a sample |
| 5 | Founder-supplied past-paper ingestion | **Valuable, gated on a licensing decision the Founder must make** | See `ANGEL_PAST_PAPER_INGESTION_SPECIFICATION.md`. CSSE/GL/CEM/ISEB past papers are, in general, copyrighted works of the issuing board; using their actual questions as practice content (verbatim or lightly reworded) is a licensing question, not an engineering one. This is exactly the class of decision the Founder reserved for themselves ("a legal/licensing decision requires founder authority") — this document does not resolve it, it flags it |
| 6 | Official/permitted source analysis | **Low-risk, do this now** | Analysing publicly-released CSSE/exam-board *familiarisation* material (structure, mark schemes, question *styles*, not verbatim content) to inform Angel's own original-question specifications is standard, low-risk practice and is already partially reflected in `docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md`. This is analysis, not ingestion — no copyright exposure |
| 7 | Automated validation | **Exists partially, extend it** | Arithmetic/answer-correctness scripts exist (`scripts/007i-maths-answer-verification.mjs` and successors); duplicate/near-duplicate checks exist but are dormant (Section 2). No automated readability/age-appropriateness/ambiguity check exists at all — and per the capacity audit's own §17, none of those should be *fully* automated regardless |
| 8 | Human review where educational judgement is required | **Exists, reuse unmodified** | `app/admin-beta/review/page.tsx` + `lib/adminReview.ts`'s per-family review workflow already exists and is credited in the capacity audit (§17) as a genuine, reusable strength. Any new supply source (3, 4, 5, or 6 above) must route through this exact surface, not a new one |
| 9 | Duplicate/similarity detection | **Exists, wire it (Section 2)** | `structuralSignature.ts` and `antiMemorisationChecks.ts` already do this at the mechanical level the Founder's own instruction accepts as automatable ("are these two ids the same? are these two stems byte-identical once normalised?") |
| 10 | Live question-performance calibration | **Does not exist, build last** | `usage_count`/`avg_success_rate` columns exist on `ali_question_bank` today but the capacity audit (§16) already confirmed nothing reads them back into any decision. This is real net-new work — see Section 5 below |

---

## 4. Recommended Combined Model, In Priority Order

This is a sequencing recommendation, not a single design choice — the ten sources above are not mutually exclusive, and the Founder's own instruction is explicit that raw volume is not the goal.

1. **Wire the dormant foundation (Section 2).** Zero new content, zero new risk, closes real gaps in what already exists. This is the prerequisite every other step below assumes is in place before it increases content volume.
2. **Formalise the family model for both subjects** (item 2) — turn `questionFamilyRegistry.ts` and `englishFamilyModel.ts` from read-side inference functions into the actual authoring unit: every new content wave is specified and reviewed *as a family*, not as a list of independent rows.
3. **Official/permitted source analysis** (item 6) to inform specification quality for new families, in both subjects — zero copyright exposure, improves item 1 (educator-authored) quality directly.
4. **Narrow, gated parametric Mathematics generation** (item 3), constrained to structures that already have 2-4 hand-authored siblings (the exact thin-family population the capacity audit's §24.1 family-size distribution names as the majority — 51/74 families), so a generated variant is always validated against real human-authored siblings, never generated in isolation.
5. **Founder decision on past-paper licensing** (item 5) — a prerequisite gate, not a build step; see the dedicated ingestion specification.
6. **Controlled English generation** (item 4), only after 1-4 are live and proven, given its materially higher risk profile.
7. **Live performance calibration** (item 10), which benefits from having more content-history to calibrate against by the time it is built, and which the capacity audit already flags as entirely unbuilt today.

No step in this sequence authorises production content generation on its own — each is a design/build step whose actual content output still routes through the existing, unmodified educational review gate (item 8) before anything reaches `practice_eligible` or `mock_eligible` status. See `ANGEL_QUESTION_FACTORY_SPECIFICATION.md` for the full stage-by-stage pipeline this sequence feeds into, and `ANGEL_CONTENT_READINESS_GAP_REGISTER.md` for how this maps onto P0/P1/P2 priority.

---

## 5. What This Document Deliberately Does Not Do

- It does not set a raw question-count target. Per the capacity audit's own §20 and the Founder's explicit instruction against "we need 10,000 questions"-style targets, any numeric target belongs in `ANGEL_EDUCATIONAL_READINESS_SCORECARD.md`, derived from family-depth and usage modelling, not stated here.
- It does not resolve the past-paper licensing question — that is the Founder's decision, not an engineering one, per their own stop condition.
- It does not specify prompt engineering, model choice, or any AI-generation implementation detail — those belong in `ANGEL_QUESTION_FACTORY_SPECIFICATION.md`'s Candidate Generation stage design, and even there, only after the wiring work in Section 2 is complete.
