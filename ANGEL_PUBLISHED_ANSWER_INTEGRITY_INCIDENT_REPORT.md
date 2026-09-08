# ANGEL 11+ — PUBLISHED ANSWER INTEGRITY INCIDENT REPORT

**Date:** 2026-09-07
**Trigger:** Section G learner smoke test of the Controlled Scale Activation (see `ANGEL_CONTROLLED_SCALE_ACTIVATION_REPORT.md`).
**Method:** Read-only. No production writes made during this investigation. No containment or repair applied — this report stops before any action, per instruction.

---

## A. Exact Failing Question (preserved evidence, read directly from `ali_question_bank`, not inferred from the UI)

```json
{
  "id": "qf-factory-candidate-mr02-substitution-ea154c86af6a9f81",
  "subject": "maths",
  "skill": "QT-MR-06",
  "family_id": "mr02-substitution",
  "content_difficulty": "hard",
  "question_type": "short-answer",
  "prompt": {
    "params": { "total": 52, "ratioB": 4, "ratioC": 5 },
    "diagram": null,
    "diagrams": null,
    "question": "B = 4A and 5C = A. A student says A = 10 and, forgetting to apply the multiplier, says B = 10 too (instead of using B = 4A). This is incorrect. What is the correct value of B?",
    "contextTag": "algebraic_substitution",
    "workingSteps": ["B = 4A, not A itself", "A = 10", "B = 4 × 10 = 40"],
    "reasoningRoute": "error_identification",
    "unknownPosition": "corrected_b_value",
    "representationType": "prose"
  },
  "explanation": "B = 4A, not A itself A = 10 B = 4 × 10 = 40"
}
```

- `candidate_id`: `factory-candidate-mr02-substitution-ea154c86af6a9f81`
- `blueprint`: `mr02-bp-substitution-error-identification`
- The candidate's own `p_claimed_answer` at submission time was the literal string `"40"` (confirmed from the exact RPC payload executed during the activation).
- **`prompt` has no `answer` key at all.** Not `null`, not empty string — the key is genuinely absent from the published JSONB. "Where '40' exists": in the candidate's `claimed_answer` column (schema: `ali_question_candidate.claimed_answer text not null`, migration 230) and inside `workingSteps`/`explanation` text. "Where it becomes missing": at the exact moment of publication — the published `prompt` never receives it.

## B. Root Cause

`publish_question_candidate()` (originally migration 230, its INSERT statement carried unmodified through migrations 233/234/235 — confirmed by reading 235, the current live version) builds the published row's `prompt` as:

```sql
v_final_prompt := v_candidate.question_content;
-- (passage merge for passage-linked English candidates only)
...
insert into public.ali_question_bank (
  id, subject, skill, pathway, content_difficulty, question_type,
  prompt, explanation, mastery_threshold, family_id, provenance,
  eligibility_status, active, learning_unit_id
) values (
  ..., v_final_prompt, coalesce(v_candidate.worked_explanation, ''), ...
);
```

`v_candidate.claimed_answer` — the one column the marking contract actually needs — is **read nowhere in this function**. It is never merged into `v_final_prompt`, never inserted anywhere. This is a straightforward, unconditional omission in the INSERT's value list; it is not data-dependent and does not vary by family, difficulty, or content shape.

## C. Point Where the Answer Was Lost

Traced end to end:

| Stage | State of the correct answer |
|---|---|
| Manufacturing (Maths blueprint files, e.g. `mr02SubstitutionBlueprints.ts`) | Correct. Blueprint returns a `question_content` object (question/workingSteps/params/diagram) **and a separate `claimed_answer` value** — this is the manufacturing convention for Maths throughout this codebase; `answer` was never meant to be a key inside `question_content` for Maths. |
| Candidate mapping / `submit_question_candidate()` | Correct. `claimed_answer text not null` is written to `ali_question_candidate.claimed_answer` exactly as supplied. Confirmed schema-enforced NOT NULL — cannot be silently absent for any of the 405 rows. |
| Candidate store | Correct. Nothing rewrites `claimed_answer` after insertion; migrations 233–236 never touch this column. |
| **Publication (`publish_question_candidate()`)** | **LOST HERE.** The function reads `v_candidate.claimed_answer` — the variable holds it — but never places it into `v_final_prompt` before the INSERT. |
| Practice mapping (`current.prompt` in the Practice page) | Receives exactly what publication wrote — already missing. |
| Marking (`checkMathsAnswer(answer, String(q.answer))` in `app/learning-intelligence/practice/[area]/page.tsx:536`) | `q.answer` is `undefined` for every one of these rows → `String(undefined)` = the literal string `"undefined"` → compared against the learner's real answer → always fails, regardless of what the learner types. This is also exactly why the UI displayed the literal text **"Correct answer: undefined"** (`page.tsx:1437`, `{String(prompt.answer)}`) — not a rendering bug, a direct, faithful readout of the missing data.

**Direct answer to the Founder's precise question:** the answer was lost during **publication**, specifically inside `publish_question_candidate()`'s INSERT statement. It is not present under a wrong property name for Maths — it is not present under *any* property at all. Manufacturing, candidate mapping, and the candidate store are all clean.

## D. Blast Radius Across All 405 (read-only, deterministic, all 405 rows checked — no sampling)

Every published Question Factory row was read directly from `ali_question_bank` (`id LIKE 'qf-%'`, confirmed exactly 405 rows — matches the activation's own reconciliation) and classified against its own subject's actual marking contract (traced from the real Practice code, not assumed):

| Classification | Count |
|---|---|
| PASS (auto-markable, all required fields present) | 56 |
| PASS_SELF_ASSESSED (by design — Tier 3/5 requires human comparison; required fields present) | 16 |
| **FAIL_MISSING_ANSWER** (Maths, `prompt.answer` absent) | **313** |
| **FAIL_MISSING_ACCEPTEDANSWERS_FOR_TIER** (English, wrong `validationTier` for the evidence actually present) | **20** |
| **Total broken** | **333 of 405 (82.2%)** |

No row fell outside these categories — the classification is exhaustive and clean (56+16+313+20 = 405).

## E. Breakdown by Subject / Family / Question Type / Difficulty

**Maths — every family, 100% of rows, unconditionally FAIL_MISSING_ANSWER (313 total):**

| Family | Count |
|---|---|
| mr01-average-mean | 30 |
| mr01-whole-number-computation | 40 |
| mr02-nth-term | 40 |
| mr02-substitution | 29 |
| mr03-angle-sum | 20 |
| mr03-compound-area-perimeter | 39 |
| mr03-coordinate | 35 |
| mr04-compound-percentage | 40 |
| mr05-factors-primes | 40 |

This includes every `question_type` (`short-answer`) and every `content_difficulty` (`easy`/`medium`/`hard`) — the defect is in the publish path, not in any particular blueprint, difficulty, or representation (diagram-bearing and coordinate-bearing questions are equally affected; their `diagram`/`diagrams` keys persisted correctly, only `answer` is absent — diagram *rendering* is not implicated, only *marking*).

**English — one family only, 100% of that family, FAIL_MISSING_ACCEPTEDANSWERS_FOR_TIER (20 total):**

| Family | Count | Detail |
|---|---|---|
| wave1-fam-synonym-battery | 20 | All 20 carry `validationTier: "TIER1_EXACT_MATCH"` (which the marker dispatches to a check against `acceptedAnswers`) but their real evidence lives in `correctOptions`/`requiredSelectionCount` (the `TIER6_MULTI_SELECT` contract) — `acceptedAnswers` is absent, so the dispatcher always compares against `[]` and the question can never be marked correct, regardless of the learner's answer. |

All other English families published in this activation (`wave1-fam-direct-retrieval`, `wave1-fam-sequencing`, `wave1-fam-vocab-explain`, `wave1-fam-quote-explain`, `wave3-fam-rc10-word-choice`) passed cleanly — their `validationTier` values genuinely match the evidence fields present in their published `prompt`.

## F. Comparison With Existing Working Questions (baseline, read-only, all 351 pre-existing rows)

| Check | Result |
|---|---|
| Pre-existing Maths rows with `prompt.answer` present | **202 / 202 (100%)** |
| Pre-existing English rows, `validationTier` distribution | TIER2_ACCEPTED_SET: 77, TIER3_QUOTATION_PLUS_EXPLANATION: 19, TIER4_ORDERED_LIST: 16, TIER5_NAMED_COMPONENT_PLUS_EXPLANATION: 11, TIER6_MULTI_SELECT: 6, legacy (no tier): 13 |
| Pre-existing genuine MCQ rows (`question_type = 'multiple-choice'`) | 6 total, **all 6 tagged `TIER6_MULTI_SELECT` with `correctOptions` present and correct** |

This confirms two things precisely: (1) `prompt.answer` for Maths is the established, universally-followed convention before this activation — the omission is new, introduced by this activation's publish path, not a pre-existing systemic gap; (2) `TIER6_MULTI_SELECT` is the codebase's own existing, working, successfully-marking convention for exactly this shape of question (`correctOptions` + `requiredSelectionCount`) — the synonym-battery family should have used it and did not.

## G. Affected Production IDs

**313 Maths rows** — every row with `id LIKE 'qf-%'` and `subject = 'maths'` (all 9 families listed in Section E; full 313-row ID list available on request — omitted here for length, deterministically re-derivable at any time via the exact query used for this audit: `select id from ali_question_bank where id like 'qf-%' and subject = 'maths' and (prompt->>'answer') is null`).

**20 English rows** — every row with `family_id = 'wave1-fam-synonym-battery'` (candidate IDs `eng-syn-01` through `eng-syn-20`, published as `qf-eng-syn-01` … `qf-eng-syn-20`).

**Not affected — confirmed clean, no action needed:** the 5 canary rows that are English and non-synonym-battery, the 72 other English rows (Section D), all 30 historical calibration candidates (never published), Mock inventory, Writing inventory, and every one of the 351 pre-existing Practice rows.

## H. Recommended Containment (not yet executed)

The defect is bounded and precisely identifiable by a `NULL`-value SQL predicate (Maths) and an exact family-id match (English) — no fuzzy judgement calls needed. Recommend, when authorised:

1. Set `active = false` (or equivalent "unavailable to Practice" flag) on exactly the **333 affected rows** identified in Section G — the 313 Maths rows and the 20 English synonym-battery rows — leaving them out of adaptive selection until repaired.
2. Do **not** touch: the 72 clean English rows from this activation, the 5 canary rows, Mock inventory, Writing inventory, the 30 historical calibration candidates, or any of the 351 pre-existing Practice rows.
3. This is a targeted, reversible flag change on exactly the rows proven broken — not a blanket unpublish of all 400/405.

## I. Smallest Deterministic Repair (design only, not applied)

**Maths (root cause: publication):**
- **Code fix** — inside `publish_question_candidate()`, change `v_final_prompt := v_candidate.question_content;` to additionally merge the genuine claimed answer, e.g. `v_final_prompt := v_candidate.question_content || jsonb_build_object('answer', v_candidate.claimed_answer);` (scoped to where the marking contract actually reads it — i.e. this merge only needs to apply for `subject = 'maths'`; English's contract never reads a top-level `answer` key, so merging it there would be harmless but unnecessary — smallest-correction principle favours gating it to Maths). No other line of the function needs to change.
- **Data repair for the 313 already-published rows** — fully deterministic, traceable, and derivable with zero invention: `update ali_question_bank set prompt = prompt || jsonb_build_object('answer', c.claimed_answer) from ali_question_candidate c where ali_question_bank.id = 'qf-' || c.candidate_id and ali_question_bank.subject = 'maths' and (ali_question_bank.prompt->>'answer') is null;` — every value comes from the candidate's own genuine, NOT-NULL `claimed_answer`; nothing is derived from `workedExplanation`/`workingSteps` text and nothing is invented. Every repaired row remains traceable published-question ↔ candidate ↔ genuine claimed answer via the `'qf-' || candidate_id` identity that already exists today.

**English synonym-battery (root cause: manufacturing, in `lib/ali/questionFactory/englishSynonymFamily.ts`, confirmed — every blueprint in that file hardcodes `validationTier: "TIER1_EXACT_MATCH"`):**
- **Code fix** — correct the hardcoded `validationTier` value in that file to `"TIER6_MULTI_SELECT"` for the synonym-battery blueprints (the file already supplies `correctOptions`/an implicit single-select shape; `requiredSelectionCount: 1` is already present in the published rows via `candidateStoreMapping`'s existing `correctOptionIndex !== undefined` branch).
- **Data repair for the 20 already-published rows** — deterministic: `update ali_question_bank set prompt = jsonb_set(prompt, '{validationTier}', '"TIER6_MULTI_SELECT"') where family_id = 'wave1-fam-synonym-battery';` — the `correctOptions`/`requiredSelectionCount` evidence is already genuinely present in these rows; only the tier label is corrected to match evidence that already exists, nothing is invented.

Both repairs are fully deterministic and traceable from already-published row ↔ its own already-correct source data — no answer is guessed, derived from explanation text, or defaulted.

## J. Regression Evidence (test design only — not implemented, per instruction to stop after this report)

Tests to write before any fix is applied, reproducing the exact incident and guarding the exact contract:

1. `publish_question_candidate()` on a Maths candidate with `claimed_answer = '40'` → published `prompt.answer === '40'` (or numeric `40`, `String()`-compatible) — the exact incident, now fixed.
2. Learner submits `'40'` against that published question → `checkMathsAnswer` returns `true`.
3. Learner submits an actually-wrong value against the same question → still returns `false` (guards against overcorrecting into a permissive/always-correct fix).
4. A published row that somehow still lacks `prompt.answer` must **never** silently render `"Correct answer: undefined"` as if it were valid — assert the fail-closed case is caught (e.g. a check that flags/logs rather than displaying `undefined`).
5. Maths text-only questions (no diagram) — mark correctly.
6. Maths diagram-bearing questions (`mr03-compound-area-perimeter`) — mark correctly; diagram rendering itself is asserted unaffected (it already was, per Section E).
7. Maths coordinate questions (`mr03-coordinate`) — mark correctly.
8. English `TIER1_EXACT_MATCH`/`TIER2_ACCEPTED_SET` (acceptedAnswers-based) — unchanged, still correct (regression guard: this fix must not touch working tiers).
9. English `TIER6_MULTI_SELECT` on a repaired synonym-battery row — `correctOptions` now genuinely drives correct/incorrect marking.
10. Existing pre-Question-Factory Practice rows (the 351) — byte-for-byte unchanged behaviour; the fix must not alter `publish_question_candidate()`'s handling of any row that already had `prompt.answer` or a correct `validationTier`.

## K. GO / NO-GO Recommendation

**NO-GO on the 333 affected rows (313 Maths + 20 English synonym-battery). GO — remains unaffected — on the other 72 published rows from this activation, the 5 canary, and all pre-existing production content.**

This is not a reconciliation, governance, or audit-trail failure (Sections A–F, H, I of the activation report stand unchanged and remain clean). It is a genuine, now fully root-caused and precisely bounded learner-facing content-integrity defect: 82.2% of the newly-published questions cannot currently be marked correctly, through two entirely independent mechanisms (a publication-path omission for Maths, a manufacturing-time mistagging for one English family). Both are deterministically repairable from already-correct, already-stored source data, with no invented answers and no weakening of marking.

No containment or repair has been applied. Awaiting your decision on Section H (containment) and Section I (repair), and on whether to proceed with Section J's regression tests before any fix is written.
