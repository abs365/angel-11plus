# Angel Independent Educational Review — Reusable Pack Template

This document defines Angel's reusable, non-technical Independent Educational Review process. It does not invent a new policy — it makes explicit, and packages for repeated use, the review architecture already live in this repository (`public.ali_family_review`, `lib/adminReview.ts`, `app/admin-beta/review/page.tsx`) and already exercised across dozens of Mathematics and Writing content batches.

A reviewer using this pack needs **no knowledge of Supabase, SQL, Git, migrations, or Angel's codebase**. They need only the content itself, in plain language, and this form.

---

## 1. Reviewer Eligibility

Angel distinguishes two separate questions. Both matter; neither substitutes for the other.

### Independence (a structural test — who may not review this)

An independent reviewer for a given piece of content:

- **Must be a real, identifiable, named person** — never `UNASSIGNED`, never a role label alone, never an AI system, never Claude.
- **Must not have authored the content under review.**
- **Must not be the same decision-maker who gave the prior educational (Founder) approval for the same content** — Founder review and independent review are two separate, non-substitutable steps in Angel's own review chain; one is never recorded as satisfying the other.
- **Must declare any material conflict of interest** before reviewing (see the declaration in Section 4).

This is a structural/procedural test. It answers "is this a genuinely separate check," not "is this person any good at judging the content."

### Educational Competence (a substantive test — is this reviewer qualified)

Angel's established precedent (the reviewer used across every Mathematics and Writing independent-review batch to date) requires **real, relevant, first-hand experience of 11+ preparation** — not a formal teaching credential. The qualification statement recorded for every one of that reviewer's decisions reads:

> "Founder and parent with direct experience of preparing children for the Essex CSSE 11+, including experience of 11+ tuition, practice materials, mock examinations and supporting a child through successful grammar school preparation."

Angel does **not** require a teaching degree, QTS, or a professional tutoring qualification — this repository's own established practice has never required one, and this template does not invent a stricter bar than the one Angel has actually operated under. What is required is a genuine, statable basis for judging whether content is age-appropriate, educationally sound, and fair for an 11+ selective-school candidate.

---

## 2. The Review Pack (what the reviewer is given)

For each content item under review, present:

| Field | |
|---|---|
| Content ID | *(internal identifier — shown for traceability only, never needs to be typed back)* |
| Subject | |
| Skill / competency | *(plain name, not the internal code, though the code may also be shown)* |
| Child-facing title | *(exact, verbatim)* |
| Exact child-facing instruction | *(exact, verbatim — never summarised or rewritten for the reviewer)* |
| Exact checklist / guidance shown to the learner | *(exact, verbatim, in full)* |
| Intended challenge level | *(e.g. Accessible / Standard / Demanding, or the subject's own equivalent scale)* |
| Intended educational purpose | *(one or two sentences: why this item exists, what gap it fills)* |

Where duplication/distinctiveness against existing content is a live question, include a **side-by-side comparison** of the new item against the specific existing item(s) it might overlap with — verbatim wording for both, not a paraphrase.

**Never tell the reviewer what decision is expected**, and never disclose a prior (Founder, Claude, or any other) conclusion about the content before their own review. The reviewer may be told the intended challenge classification, since validating that classification is explicitly part of what they are being asked to do.

---

## 3. Review Criteria (Angel's real, established 18)

These are the actual criteria Angel's review interface (`lib/adminReview.ts`'s `REVIEW_CRITERIA`) already uses for every content review, reused here verbatim rather than inventing a parallel set. Three are reworded for Continuous Writing specifically (`WRITING_REVIEW_CRITERIA`), since Writing has no deterministic answer key or source passage — noted below.

1. Is the educational content accurate?
2. Does it genuinely assess the skill it claims to?
3. Does it match a genuine CSSE pattern for this content type? *(Writing wording: "...a genuine CSSE Continuous Writing prompt pattern — a single reflective/discursive/imaginative prompt, always Question 1?")*
4. Are the answers and marking expectations correct? *(Writing wording: "Are the marking expectations — the checklist shown to the learner — correct and complete?")*
5. Does the answer key / checklist accept every reasonable, valid response? *(Writing wording: "Does the checklist genuinely accept every reasonable, valid way a learner could satisfy this prompt?")*
6. Is the wording clear for an 11+ learner, in natural contemporary British English and to a human editorial (not formulaic AI-style) standard?
7. Is this age-appropriate for an 11+ candidate?
8. Is the difficulty appropriate for its stated level?
9. Is the transfer demand (how far this asks the learner to generalise) honestly classified?
10. Is the recorded misconception a real, plausible mistake a child would make? *(N/A where none is recorded)*
11. Where this family has more than one reviewed example, do they genuinely represent its range? *(N/A for a single-item family — most Writing prompts are single-item)*
12. Does the teaching support genuinely help the learner, where one exists? *(N/A where none exists)*
13. Is the exam strategy shown to learners useful and safe advice? *(N/A where none exists)*
14. Where a model answer is shown, does it actually explain, not just restate? *(N/A where none exists)*
15. Does the way Angel marks this match how CSSE would genuinely mark it?
16. Does this genuinely resemble real CSSE content — natural, contemporary-Britain names and contexts, not a stereotype or an implausible combination?
17. Is the content sufficiently original?
18. Is the content free of any copyright concern?

Each is answered **Yes / No / N/A**. "No" on any criterion does not automatically mean REJECTED — the reviewer's overall decision (Section 5) is their own educational judgement informed by, not mechanically derived from, these answers.

**For Continuous Writing specifically, also ask:**
- Can the task sustain meaningful extended writing, or does it invite six minimal sentences?
- Does it allow more than one legitimate high-quality response, or does it over-direct the child toward one answer?
- Does it invite unnecessary disclosure of something private, upsetting, or serious?
- Does it duplicate another prompt's underlying task (same planning/structure/audience demand under a different topic), rather than genuinely differing in what it asks the writer to do?
- Does its intended challenge level match its actual cognitive and composition demand?

---

## 4. Reviewer Declaration

- **Reviewer's full name:**
- **Relevant educational role / experience** (real, first-hand basis — see Section 1):
- **Date:**
- **Confirmation:** I did not author the content reviewed here. ☐
- **Confirmation:** I reviewed the exact final content supplied above, independently, without being told any other party's conclusion. ☐
- **Conflict of interest declaration** (leave blank if none):
- **Decision for each item** (Section 5, one per item):
- **Overall comments** (optional):

Only the fields above are collected — no unnecessary personal information (no address, no contact details beyond what Angel already holds for a known reviewer, no financial or identifying information).

---

## 5. Governed Decision (one of exactly four, per item)

- **APPROVED**
- **APPROVED WITH AMENDMENT** — the required amendment must be stated explicitly and specifically (a real correction, not boilerplate — Angel's own database enforces that an amendment decision must carry real content beyond a template sentence). Implementing and verifying the amendment is a **separate, later step**, never assumed to have already happened.
- **REQUIRES REVALIDATION**
- **REJECTED**

No other status exists. Free-text praise or concern is welcome as supporting `notes` but never substitutes for one of these four decisions.

---

## 6. Persistence — how a completed review becomes part of Angel's record

*(For Angel's own engineering use — a reviewer does not need to read this section.)*

`public.ali_family_review` is **append-only** by design (`lib/adminReview.ts`'s `submitReview()` only ever `INSERT`s; it has no `UPDATE`/`DELETE` path against this table, and no code path in this repository does either):

- The existing `pending_independent_review` placeholder row is **never edited or deleted** — it remains as the permanent record that review was once awaited.
- A completed review is always a **new, additive row**, sharing the same `review_target_type` and `family_id`, with:
  - `reviewer` = the real name from Section 4 (never `UNASSIGNED`, `FOUNDER`, `Claude`, `AI`, or `system`)
  - `decision` = one of the four values in Section 5
  - `notes` = `"Reviewer qualification: {the Section 1 basis}.\n\n{any free-text notes}"` (`buildNotesWithQualification`'s own real format)
  - the relevant boolean criterion answers from Section 3
  - `evidence_reference` / `provenance_reference` where applicable
- **APPROVED WITH AMENDMENT** is recorded as a real `decision` value with the amendment stated in `notes`. A live database constraint (migration 157) requires this specific decision's `notes` to contain genuine paragraph content, not a boilerplate phrase.
- **Amendment verification** (confirming a required amendment was actually implemented and resolved) is its own, later, separate additive row — `review_type = 'amendment_verification'` — never an edit to the original `approved_with_amendment` row (matching this repository's own established precedent).
- **Eligibility progression** (`authentic_assessment_candidate` → `independently_validated` → any later Practice/Mock state) is a **wholly separate, later, Founder-authorised migration**. No review submission — independent or otherwise — has ever changed `eligibility_status` in this codebase, by design.

---

## 7. The Full Operating Model

```
CONTENT CREATED
  → INTERNAL / TECHNICAL VALIDATION (tests, guards, build)
  → FOUNDER EDUCATIONAL REVIEW (Sections 1–5 of this pack, Founder as reviewer)
  → PROTECTED PRODUCTION STATE (authentic_assessment_candidate, pending_independent_review registered)
  → INDEPENDENT HUMAN REVIEW (this pack, given to a genuinely independent, competent reviewer)
  → REVIEW EVIDENCE PERSISTED (Section 6 — additive, never overwrites)
  → FOUNDER RELEASE AUTHORISATION
  → ELIGIBILITY PROMOTION (a separate, later, scoped migration)
  → PRODUCTION VERIFICATION
```

**A known gap, disclosed rather than silently worked around:** Angel's live reviewer-facing web interface (`/admin-beta/review`) already supports this exact review type (`review_target_type = "writing_prompt"`, `review_type = "mock_writing_prompt_independent_review"`) and already has a real, existing Writing reviewer (Section 1) using it — but its current Writing section is wired to one specific, hard-coded batch of prompts (`MOCK_ENGLISH_INC001_WRITING_FAMILIES`), not a general query for any pending `writing_prompt` review. A new content batch's prompts are not yet automatically visible there. Generalising that section (querying for any real `pending_independent_review` `writing_prompt` row rather than a hard-coded list) is the natural next step to make this template fully self-service inside the live UI, rather than requiring a document handoff each time — a real, worthwhile piece of future work, not undertaken here.

Until that generalisation exists, this document itself is the reusable, working mechanism: complete, self-contained, and requiring nothing beyond reading it.
