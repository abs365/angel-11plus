# ANGEL 11+ — CONTINUOUS WRITING: HUMAN CALIBRATION PROTOCOL (V1, 2026-10-08)

Status: **PROTOCOL ONLY. No calibration has been run. No result is claimed.**
Owner of every threshold and every decision below: the Founder. Thresholds are *proposed design choices*, not research findings.

## 1. What this protocol is for, and what it is not

Angel gives Writing feedback with an AI read against a five-dimension qualitative rubric (Ideas, Vocabulary incl. spelling,
Grammar, Structure, Punctuation; each judged developing / secure / strong, with a "confident" flag the pre-flight gate can
lower). That read is, in its own prompt and code, **uncalibrated**. This protocol measures how closely it agrees with
careful human readers using the same rubric language.

It does **not** establish that Angel's feedback equals CSSE marking. CSSE Continuous Writing is double-marked by humans with
moderation; the official comprehension/Writing mark split is unresolved and nothing here assumes one. Whatever the outcome:

- AI Writing evidence stays **supported tier** and is **excluded from mastery** (existing governance, `writingRubric.ts`,
  `lib/ali/mastery.ts`). Changing that is a separate, explicitly governed Founder decision, not an effect of this protocol.
- No numeric mark, band or "expected CSSE score" is produced from this exercise.

## 2. What already exists (so nothing is rebuilt)

| Item | Where |
|---|---|
| Rubric (5 dimensions, 3 levels, `confident` flag, 6-sentence minimum gate) | `lib/learningEngine/writingRubric.ts` |
| AI feedback endpoint (authenticated; supported tier) | `app/api/writing-feedback/route.ts` |
| Mock Writing assessment record with immutable AI read and additive human-review columns | `ali_writing_assessment` (`human_review_dimensions`, `human_review_notes`, `human_reviewed_at`), RPC `mock_review_writing_assessment()` |
| 11 synthetic calibration response *types* (deterministic gate behaviour) | `scripts/writing-rubric-calibration.mjs` and `writingRubric.ts` tests |

What does **not** exist: a stored set of real child scripts with human marks. Practice Writing text is not persisted for
review, and the Mock table holds only 2 assessments (neither human-reviewed). The sample below therefore has to be *built*.

## 3. Evidence sample (what to collect)

- **Size (proposed): 40 scripts** — 20 reflective/discursive (QT-WC-01a), 20 picture-led narrative (QT-WC-01b), at least 8 distinct prompts per genre.
- **Spread:** deliberately across quality, not typical. Target roughly a third each of weak / middling / strong overall, plus at
  least 4 deliberately awkward cases per genre (too short, off-task, a memorised template, a picture described rather than a story, heavy spelling errors with good ideas).
- **Sources, in order of preference:** (1) scripts written by volunteer learners with explicit parental consent for this
  specific use; (2) scripts written by adult teachers imitating Year 5–6 writing at stated levels, labelled as simulated;
  (3) Mock Writing responses already held, only with the family's consent. **Never** Family #1's scripts unless Family #1 explicitly agrees; the family remains independent beta evidence.
- **Privacy:** strip names, school, places and any identifying detail before anyone reads a script; store outside production
  (a local folder under Founder control); identify scripts only by a random id. No child identity is ever sent to the AI beyond the script text.

## 4. Human marking

1. **Two independent human readers** (teachers or experienced tutors, not Angel's builders), each marking every script
   *without seeing the AI output or each other's marks*, using only the rubric descriptors in
   `knowledge/angel-assessment-transformation-programme/programme-001/release-1/ANGEL_PHASE_D_CONTINUOUS_WRITING_STANDARD_V1.md` Part 3 (taken from CSSE's own sample mark scheme).
2. Readers record, per script: a level for each of the five dimensions (developing / secure / strong), a "could not judge"
   option per dimension, and one line of evidence for any dimension judged strong or developing.
3. **Calibration session first:** both readers mark the same 4 practice scripts (not in the sample) and discuss differences
   before the real sample, so they share the rubric language.
4. **Adjudication:** where the two readers differ by two levels on any dimension, a third reader decides. The *human reference
   level* is the agreed level (both agree, or third reader).

## 5. AI run

Run the live feedback logic once per script, using the production prompt and rubric version, recording the version identifiers.
Run it a second time on a random 10 scripts to measure the AI's own repeatability. No prompt changes during the run.

## 6. Measures

Per dimension and overall, report all of:

| Measure | Why |
|---|---|
| Human–human agreement (exact and within one level) | the ceiling: the AI cannot reasonably be asked to agree with humans more than humans agree with each other |
| AI vs human reference: exact agreement and within-one-level | basic closeness |
| Weighted agreement statistic on the ordinal scale (e.g. quadratic-weighted kappa) | chance-corrected |
| Direction of disagreement (AI more generous / harsher) per dimension and per genre | systematic bias matters more than noise |
| AI repeatability (same script twice) | an unstable judge cannot be calibrated |
| Behaviour of the `confident` flag and of `review_required`: how often it fires on exactly the awkward scripts | the safety net the product relies on |
| Genre difference (reflective vs picture-led) | the two may need separate conclusions |

## 7. Proposed starting thresholds (Founder to set — provisional, not evidence-derived)

For the AI read to be described *to parents* as "a useful first read" (never "marking"), propose at least: within-one-level
agreement ≥ 90% on each dimension; no dimension with a one-directional bias on more than 70% of its disagreements; AI
repeatability within one level on ≥ 90% of repeats; and `review_required`/low-confidence firing on ≥ 80% of the awkward cases.
If a threshold is missed, the finding is recorded and the parent-facing wording stays cautious. **Nothing in the product
changes automatically from these numbers.**

## 8. Outputs

- A single results file (per-script, per-dimension table; summary table of the measures above; list of the worst disagreements with the readers' evidence lines).
- A short Founder decision record: what wording about AI feedback is justified, whether any dimension needs a different treatment, and what (if anything) would justify a *future, separate* governed decision about Writing and mastery.

## 9. Founder actions needed to start

1. Choose and brief two independent readers; agree consent route and sources (§3).
2. Approve or change the proposed sample size and thresholds (§3, §7).
3. Provide the anonymised scripts (or ask for adult-simulated scripts to be commissioned).
4. Decide where the results file lives (outside production).

Until these exist, the correct statement about Writing feedback is: **an uncalibrated AI first read, supported tier, not marking, not mastery evidence.**
