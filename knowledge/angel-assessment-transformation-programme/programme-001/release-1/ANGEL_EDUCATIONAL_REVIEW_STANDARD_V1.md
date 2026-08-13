# Angel 11+ — Educational Review Standard V1

**Prepared:** Educational Increment 007E, 2026-08-13. **Applies to:** every English passage, every English/Mathematics question family review conducted through `ali_family_review`.

## Canonical decisions

Reuses `public.family_review_decision` (migration 034) unchanged — no new states created:

- **`approved`** — meets every applicable criterion below; may be activated (§5 of the Operating Model) without further changes.
- **`approved_with_amendment`** — the underlying educational content/design is sound, but the reviewer identifies a specific, correctable defect (wording, a wrong distractor, a missing teaching route). Recorded in `notes`. Blocks activation until the Content Author corrects it and Automated Validation re-runs clean.
- **`requires_revalidation`** — the reviewer cannot confirm a criterion from the material provided (e.g. an evidence citation needs re-checking against the source paper) and needs it resolved before a decision either way.
- **`rejected`** — the content should not be activated as-is; a substantive rewrite or removal is needed. `notes` is required by the table's own check constraint whenever this decision is used.

## Review criteria

A reviewer works through the applicable subset of the following for the target (family or passage) under §3 of the Operating Model's sampling policy.

**Content correctness**
- Competency alignment — does the item genuinely test the competency it's tagged with (RC-01..04 / the relevant Mathematics competency)?
- Question Type alignment — does it match its declared QT code's real pattern, not a superficially similar one?
- Educational correctness — is the underlying fact, rule, or reading genuinely correct?
- Answer correctness — does the accepted-answer set / quotation / ordered sequence / multi-select key actually match the passage or the mathematics?
- Ambiguity — could a reasonable child arrive at a different, equally defensible answer the key doesn't accept?
- Expected working (Mathematics) — is the working/model answer a real, followable method, not just a bare final number?

**Difficulty and demand**
- Difficulty validity — does the declared `content_difficulty` (easy/medium/hard) match the actual cognitive load?
- Age appropriateness — is the vocabulary, subject matter, and reasoning demand right for an 11+ candidate?
- Selective-school authenticity — does this genuinely resemble CSSE's real question style, not a generic comprehension/maths worksheet?
- Cognitive demand — is the reasoning chain the right length/complexity for its declared difficulty?
- Transfer classification — is `transfer_class` (ROUTINE/NEAR/MIXED/FAR) an honest description of how far this item asks the learner to generalise beyond drilled examples?

**Teaching quality (explicitly required, not optional — Part 12 of the Founder's directive)**
- Misconception/trap quality — is the recorded misconception a real, plausible error a child would make, not a generic placeholder?
- Distractor quality (multi-select/tick-justify) — are wrong options genuinely plausible, testing real discrimination, not obviously silly?
- Teaching quality — does the family's MODEL/worked-example, where one exists, actually teach the reasoning, not just restate the answer?
- Exam strategy quality — is the family's exam-strategy hint genuinely efficient advice, not vague encouragement?
- Guided Practice quality — where a family has a REAL/verified Guided scaffold, does it meaningfully differ from just showing a hint, without revealing the answer prematurely?
- Answer-validation behaviour — does the scoring tier's behaviour match real CSSE marking conventions where evidenced, and are inferred (non-evidenced) scoring rules honestly disclosed as such in the content's own documentation?

**Provenance and safety**
- Originality — no plot/character/wording overlap with any copyrighted source, including the specific CSSE extracts read for evidence.
- Copyright risk — is `copyright_status` accurate, and does nothing in the passage risk reproducing protected material?
- Provenance — is `provenance` correctly `angel_original` (or another Founder-accepted value)?

**Presentation**
- Learner-language quality — is the question/instruction phrased the way an 11-year-old would actually be spoken to, consistent with the rest of the app's copy (Copy Quality Guard's dash rule etc.)?
- Accessibility/fairness — does the content assume background knowledge or cultural context that unfairly disadvantages some learners?
- Technical rendering risks — will the passage/question render correctly (line breaks, quotation marks, special characters) in the live Practice UI, not just in the raw JSON?

## What a reviewer is NOT asked to do

- Re-derive the CSSE evidence basis from scratch — the evidence citation (paper/year) is provided; the reviewer confirms it's a reasonable fit, not re-reads the entire source paper.
- Manually inspect every deterministic sibling in a family — see the Operating Model §3 sampling policy.
- Make an eligibility-promotion decision — a review decision records educational judgement only; activation (Operating Model §5) is a distinct, later step.
