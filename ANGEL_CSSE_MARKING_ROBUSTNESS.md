# CSSE marking robustness: coordinate answers and ordered-list answers (2026-10-08)

Founder ruling: two behaviours are marking and UX robustness problems, not educational judgements. Both are corrected narrowly, only where the answer type supports it, with deterministic accept and reject tests.
The Compass Rose accepted-answer semantics (the sundial, the weathervane, hedged combinations) are **deliberately not touched**: they are an educational interpretation left to the independent English validator.

## A. Coordinate answers

| | |
|---|---|
| Rule | Applies **only when the STORED answer is a coordinate pair** `(x, y)` (two plain decimal numbers in brackets). A response matches if it is also a bracketed pair and both numbers equal the stored ones (tolerance 0.0001). Spaces, the Unicode minus sign and a trailing `.0` are irrelevant. |
| Still rejected | no brackets (`9, 5`), different numbers (`(5, 9)`, `(9, 6)`), three values, wrong separators (`(9;5)`, `(9 5)`, `(9,,5)`), words (`(nine, 5)`), malformed (`(9, 5`) |
| Not loosened | numeric answers, times (`15:50`), words, letters and every other exact-text answer keep their existing behaviour; there is no fuzzy matching |
| Code (live on deploy) | `lib/learningEngine/coordinateAnswer.ts`, used by the Practice marker `checkMathsAnswer` |
| Mock Maths scorer | the Mock scorer is **SQL** (`mock_score_attempt`), so it needs a migration: **`274_mock_maths_coordinate_answer_normaliser_APPLIED_DO_NOT_RERUN.sql`, APPLIED by the Founder 2026-10-10 and verified PASS**. It adds one branch for coordinate-type stored answers and changes nothing else (numeric path, exact-text path, manual-marking and marking-mode safety, grouping metadata, idempotency and grants preserved). |
| Evidence | the identical 18 cases were run **read-only against production SQL** with the migration's expression and agree with the TypeScript results; both sets are in `tests/lib/learningEngine/markingRobustness.test.ts` |

Migration 274 is applied (2026-10-10): the Mock scorer now accepts equivalent coordinate spellings. Any earlier statement that the Mock scorer requires exact `(x, y)` spacing (for example in a previously generated Maths validator pack) is out of date.

## B. Ordered-list answers

| | |
|---|---|
| Problem | an ordered answer typed on one line ("Elif, Casey, Wei, Grace") was read as ONE item and scored 1 of 4, although the question never told the learner to use separate lines |
| Rule | newlines and numbering always work. For a one-line answer, safe separators are also honoured: commas, semicolons, arrows, "then", "and", inline numbering ("1. a 2. b"), and plain spaces when every correct item is a single word and the learner gave exactly that many words |
| Safety | a separator is used **only if no correct item itself contains it**, so questions whose correct items contain commas or "and" keep newline-only behaviour; multi-line answers are never re-split |
| Order | each position is still marked on its own. No permutation other than the correct order reaches full marks, in any format (tested exhaustively for four items); reversed, swapped, repeated and partial answers score exactly as before |
| Code (live on deploy) | `parseOrderedAnswer` in `lib/learningEngine/englishAnswerValidation.ts`, used by Practice and by the Mock Reading scoring path (same function) |

## Tests

`tests/lib/learningEngine/markingRobustness.test.ts` (9 tests): coordinate accept and reject table with SQL parity; non-coordinate answers unchanged; migration 274 structure (one function, new branch only, preserved paths); ordered answers in 13 accepted formats; order sensitivity in every format including all 24 permutations; no unsafe splitting when items contain separators; a real phrase-item question; the Mock path; the original defect closed.
