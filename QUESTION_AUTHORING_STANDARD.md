# Question Authoring Standard

**Status:** Permanent standard, effective on approval. Governs every question written for Angel 11+ from this point forward — starting with the 52 Verbal Reasoning questions being hand-tagged for the Angel Learning Intelligence (ALI) first slice, and every question of any subject written after it.

**Purpose:** A future contributor — human or otherwise — should be able to write a new question and have it be indistinguishable in quality, structure, and metadata completeness from one written today. This document is what makes that possible without requiring the original author's judgment to be re-derived each time.

**Scope note:** Examples throughout are drawn from the existing Verbal Reasoning bank (`data/verbal-reasoning/*.ts`) because that's the first slice's real content. The metadata/writing/originality/copyright standards apply to every subject; the competency taxonomy (§3) and difficulty calibration (§4) are VR-specific here and should get their own subject-specific sections when Maths/Non-Verbal/Spatial/Numerical Reasoning are hand-tagged.

---

## 1. Metadata Definitions

Every field a question must carry, what it means, and how to determine it. Fields marked **(required before import)** block a question from entering `ali_question_bank`; fields marked **(safe default, backfill later)** ship with a sensible default and don't block import.

| Field | Definition | How to determine it |
|---|---|---|
| `id` | Stable, permanent identifier. Never reassigned, never reused after a question is retired. Format: `{subject-prefix}-{number}`, e.g. `vr-013`. **(required)** | Mechanical — next available number in sequence for the subject. Existing VR questions already have this (`vr-001`…`vr-052`); new questions continue the sequence. |
| `subject` | Which subject this belongs to (`verbal-reasoning`, `non-verbal-reasoning`, `spatial-reasoning`, `numerical-reasoning`, `english`, `maths`, `vocabulary`, `writing`). **(required)** | Mechanical — determined by which bank the question is written for. |
| `skill` | The fine-grained competency this question tests. **See §3 — this is NOT the same as the existing generic `SkillType` value on the question record, which is uniformly `"verbal-reasoning"` for every VR question and carries no useful granularity for adaptive selection.** **(required)** | Assign from the competency taxonomy in §3, not from `SkillType`. |
| `pathway` | Which exam board(s) this question is valid for, as a set (e.g. `["gl"]`, or `["gl","cem","iseb"]` for genuinely pathway-general content). **(required)** | Default to the pathway you're authoring for. Only widen to multiple pathways if the question's format/style is genuinely board-agnostic (see §3 for VR — most Word Analogy/Synonym/Antonym content is board-general; some Letter/Number Code formats are more GL/CEM-specific). |
| `content_difficulty` | `easy` / `medium` / `hard` / `challenge` — a proficiency-facing label describing how hard this content is, not a year-group label. **Not the same field as the app's existing `Difficulty` type** (`types/index.ts`), which uses year-group values (`year4-foundation`…`year6-exam`) for lessons/vocab/writing and is untouched by this standard. **(required)** | Use the rubric in §4. |
| `question_type` | `multiple-choice` or `short-answer`. **(required)** | Mechanical — all current VR questions are short-answer with optional `alternatives` (accepted equivalent answers), not true multiple-choice with fixed options. |
| `estimated_time_seconds` | Realistic time for a Year 5/6 candidate to read, think, and answer under exam conditions — used for mock pacing. **(required)** | Use the baseline table in §4.5; adjust up if the question requires an unusual amount of reading or a multi-step transformation. |
| `explanation` | Teaches the underlying rule or relationship, not just the answer. See §5.3 for the writing standard. **(required)** | Author-written, reviewed for clarity. |
| `hint` | Optional nudge toward method without revealing the answer. See §5.4. **(safe default: omit)** | Strongly recommended for `medium` and above; optional for `easy`. |
| `confidence_weight` | Reserved field (default `1.00`) for how much this question's outcome should count toward a student's subject/skill confidence score, once confidence computation reads from `ali_question_bank` directly (not yet — see the implementation plan's §0.5.2/§0.5.3 bridge). **(safe default: 1.00)** | Leave at default unless there's a specific reason a question is more/less diagnostic than average (e.g. a question with a 50/50 guessable format is less diagnostic — lower its weight; a question that isolates one skill cleanly is more diagnostic — raise it). Not required for the first slice. |
| `learning_objective` | Free-text curriculum tag describing what the question teaches, e.g. "identify part-to-whole relationships in word analogies." **(safe default: blank, backfill later)** | Optional for the first slice. Write it in plain, specific language a parent or tutor would understand — this is the field a future lesson-content author will search against. |
| `revision_priority` | 1–5, content-authored importance independent of student performance. Default `3` (neutral). **(safe default: 3)** | Only deviate from 3 if a question tests a skill that recurs disproportionately across real 11+ papers (raise toward 5) or is a rare/edge-case format unlikely to appear often (lower toward 1). Don't use this field to express difficulty — that's `content_difficulty`'s job. |
| `mastery_threshold` | How many distinct correct sessions are required before this specific question is considered mastered. Defaults come from the configurable `ali_mastery_defaults` table (by `content_difficulty`), not a hard-coded value — see the implementation plan §1.4/§2. **(safe default: difficulty-based default)** | Override upward only if the question's answer is easily guessable (see §9 Mastery Guidance) — a correct answer to a guessable question is weaker evidence of real mastery. |

---

## 2. Writing Standards

1. **One skill per question.** A question shouldn't simultaneously test vocabulary *and* code-breaking — pick the competency (§3) and write cleanly to it. If a question naturally tests two things, that's a sign it should be split into two questions.
2. **Exactly one unambiguous correct answer**, or an explicit, complete `alternatives` list covering every reasonable equivalent phrasing (see the existing pattern: `answer: "freezing", alternatives: ["icy", "frozen"]`). If you can imagine a reasonable student giving a correct-but-unlisted answer, either add it to `alternatives` or rewrite the question to remove the ambiguity.
3. **Age-appropriate vocabulary and subject matter.** Written for a Year 5/6 candidate (typically age 9–11). Avoid subject matter requiring adult life experience (mortgages, workplace jargon) or niche specialist knowledge (obscure scientific terms) unless the question is explicitly a vocabulary-stretch item at `challenge` difficulty.
4. **Cultural neutrality.** Avoid assuming a specific religious, regional (beyond general UK), or family-structure background. Animals, everyday objects, school life, and nature are the safest, most-used domains in the existing bank for good reason.
5. **Consistent formatting within a category.** Blanks are always `___` (three underscores). Analogies always follow the `A is to B as C is to ___` structure. Codes always state the rule explicitly before asking the question (never expect the student to infer the rule itself unless "infer the rule" *is* the skill being tested — see §3's Letter Code entries, which always state the rule).
6. **No trick questions.** Ambiguity, double negatives, or "gotcha" phrasing are not the same as difficulty. Difficulty should come from the reasoning required, not from confusing wording — a `challenge`-tier question should still be perfectly clear about what it's asking.
7. **Marks field.** Currently always `1` in the existing bank (`marks: 1`) — keep this convention unless there's a specific reason (e.g. a multi-part question) to deviate, and flag any deviation for review since nothing downstream currently handles `marks > 1` differently.

### 2.3 Explanation writing standard
An explanation must:
- Name the pattern or rule explicitly (e.g. "The relationship is: tool → its action" — from `vr-014`).
- Show the working, not just assert the answer (e.g. `vr-023`: "D=4, O=15, G=7. Total: 4+15+7=26" — not just "the answer is 26").
- Be transferable — a student reading it should be able to apply the same reasoning to a *different* question of the same competency, not just understand this one answer in isolation.
- Avoid explanation text that only restates the question.

### 2.4 Hint writing standard
A hint must:
- Point at *method*, never at the answer or a shortlist that narrows it to one option. Good: "Move each letter forward by 2 steps in the alphabet" (`vr-024`). Bad: "The answer starts with C."
- Be omittable — a student who doesn't use the hint should still be able to solve the question from the question text and their general competency alone. The hint is scaffolding for a struggling student, not a required decoder.

---

## 3. Competency Definitions (Verbal Reasoning)

**Important correction this standard makes to the schema plan:** the app's existing `SkillType` field on `ReasoningQuestion` is set uniformly to `"verbal-reasoning"` for all 52 questions in the current bank — it carries no distinction between an analogy question and a code-breaking question. The real differentiator already present in the data is the `category` field (e.g. `"Word Analogy"`, `"Letter Code"`, `"Hidden Words"`). **`ali_question_bank.skill` must be populated from this finer competency taxonomy, not from the existing coarse `SkillType` value** — otherwise weak-skill detection and the anti-repetition weak-skill override (implementation plan §3.2) cannot distinguish "weak at codes" from "weak at analogies," which defeats the point of tracking skill-level history at all.

The following competency codes are derived directly from the `category` values already in use across `data/verbal-reasoning/*.ts`, normalized and consolidated where two category labels test the same underlying skill:

| Competency code | Existing `category` value(s) it consolidates | What it tests | Common student error |
|---|---|---|---|
| `vr.analogies` | "Word Analogy" | Identifying the relationship between a word pair and applying the same relationship to a new pair (part-to-whole, cause-effect, creator-creation, tool-action, etc.) | Focusing on surface similarity (both are animals) instead of the actual relationship (young→adult) |
| `vr.odd-one-out` | "Odd One Out" | Identifying the category shared by most items in a list and spotting the one that doesn't belong | Picking the item that's simply least familiar, rather than reasoning about the actual shared category |
| `vr.synonyms` | "Synonyms" | Selecting the word closest in meaning from a set of options | Confusing "closest in meaning" with "sounds similar" or picking a plausible-but-not-closest option |
| `vr.antonyms` | "Antonyms" | Selecting or producing the opposite of a given word | Producing a related-but-not-opposite word (e.g. "old" instead of "modern" for "ancient") |
| `vr.letter-codes` | "Letter Code" | Applying a stated alphabet-shift rule (forward/backward N places) to encode or decode a word | Miscounting the shift distance, or shifting in the wrong direction |
| `vr.number-codes` | "Number Codes" | Applying a stated letter-to-number mapping (usually A=1…Z=26) to sum or decode | Off-by-one errors in alphabet position counting |
| `vr.word-codes` | "Word Codes" (anagrams, letter-addition, rearrangement) | Manipulating the letters of a word to find a different valid word | Producing a non-word, or missing that multiple valid answers exist (see §2.2's `alternatives` requirement — this competency generates the most multi-answer questions in the bank) |
| `vr.hidden-words` | "Hidden Words" | Finding a valid word formed by consecutive letters within a longer word | Finding letters that aren't actually consecutive, or a word that isn't a recognized common word |
| `vr.sequences` | "Letter Sequences", "Sequences" | Identifying the rule governing a sequence (of letters, words, or letter-pairs) and extending it | Assuming a simple +1 step pattern when the actual rule skips or alternates |
| `vr.compound-words` | "Compound Words" | Finding a word that combines with several given words to form valid compound words | Finding a word that works with some but not all of the given words |

**This table is the required mapping when hand-tagging the 52 existing VR questions** (§1.5 of the implementation plan): each question's existing `category` value maps directly to one `ali_question_bank.skill` competency code above — this part of tagging is mechanical, not a judgment call. The judgment call is `content_difficulty` (§4).

**Extending this taxonomy:** when Non-Verbal, Spatial, or Numerical Reasoning are hand-tagged in a future slice, they need their own competency table here, built the same way — from whatever real category/type distinctions already exist in that subject's data files, not invented fresh.

---

## 4. Difficulty Definitions

`content_difficulty` is about how hard the *reasoning* is, independent of question length or vocabulary rarity (vocabulary rarity is partly captured by competency choice — e.g. `vr.synonyms` at `challenge` should use genuinely rare tier-3 words, not just be a longer sentence).

### 4.1 General rubric

| Level | Reasoning steps | Guessability | Typical Y5/6 candidate experience |
|---|---|---|---|
| **Easy** | One direct step; the relationship/rule is stated or immediately obvious | Low value even if guessed (concept is simple enough that "guessing" mostly means "getting it") | Solvable in one read, high confidence |
| **Medium** | One step, but requires holding 2+ pieces of information or a slightly less common relationship/rule | Moderate — a guess has a real but not high chance of being right | Solvable with focused reading, may need to re-read once |
| **Hard** | Two steps, or one step applied to less familiar vocabulary/relationships | Low — wrong answers look plausible without doing the reasoning | Requires deliberate working-through, first instinct is sometimes wrong |
| **Challenge** | Two+ steps, unusual/rare vocabulary, or a rule that must be inferred rather than applied | Very low — a guess is unlikely to land | Stretches even a strong candidate; this is scholarship-adjacent territory |

### 4.2 Worked calibration by competency

- **`vr.analogies`**: Easy = concrete, familiar relationship (`kitten:cat::puppy:dog`, `vr-001`). Medium = abstract relationship needing a beat of thought (`author:novel::composer:symphony`, `vr-016` — requires knowing what a composer creates). Hard/Challenge = relationship type that's less common in everyday reasoning (e.g. tool→the character who wields it, `vr-022`) combined with a less common target word.
- **`vr.letter-codes`/`vr.number-codes`**: difficulty scales with shift distance, word length, and whether the rule must be derived from an example (`vr-003`: rule given via a worked example, `CAT=DBU`, then applied — this is harder than a rule stated directly, e.g. `vr-024`: "each letter shifts forward 2 places," even though both are technically one-step).
- **`vr.word-codes`**: Easy = single unambiguous rearrangement. Medium/Hard = multiple valid answers exist (`vr-027`–`vr-030`) — the reasoning load is in generating candidates and checking they're real words, which is inherently harder than recognizing one fixed answer.
- **`vr.sequences`**: Easy = simple skip-pattern (`vr-007`: every other letter). Hard/Challenge = compound rules (`vr-049`: one letter moves forward while the paired letter moves backward, simultaneously).
- **`vr.hidden-words`**: difficulty scales with word length (3-letter hidden word is easier than 4+) and how "hidden" the word is within common letter clusters vs. spanning a less obvious boundary.

### 4.3 A `challenge` question is not a badly-written question
If a `challenge`-tier question needs an explanation longer than a `medium` one just to be understood, that's a writing-quality problem (§2), not evidence it's appropriately hard. Difficulty comes from the reasoning, not from obscurity of presentation.

### 4.4 When in doubt between two levels
Tag conservatively (the lower of the two) and let mastery evidence (§9) correct it over time via the `avg_success_rate` calibration-drift signal (implementation plan §3.4) — that field exists specifically so a mistagged question can be caught and re-reviewed once real student data exists, rather than needing to be perfectly right on first tagging.

### 4.5 `estimated_time_seconds` baselines

| Competency | Easy | Medium | Hard | Challenge |
|---|---|---|---|---|
| `vr.analogies` / `vr.odd-one-out` / `vr.synonyms` / `vr.antonyms` | 15–20s | 20–30s | 30–40s | 40–50s |
| `vr.letter-codes` / `vr.number-codes` | 25–35s | 35–50s | 50–70s | 70–90s |
| `vr.word-codes` / `vr.hidden-words` | 25–35s | 35–50s | 50–65s | 65–80s |
| `vr.sequences` / `vr.compound-words` | 20–30s | 30–45s | 45–60s | 60–75s |

Use the midpoint of the relevant range unless a specific question is unusually long to read or unusually terse.

---

## 5. UK English Guidance

- **Spelling:** British spellings throughout — *colour*, *organise* (`-ise` preferred over `-ize` for consistency, though both are technically valid in UK English — pick `-ise` and stay consistent), *centre*, *travelled* (double consonant). Never use American spellings (*color*, *organize*, *center*, *traveled*).
- **Vocabulary choices:** prefer UK-common vocabulary for everyday-object questions — *jumper* not *sweater*, *torch* not *flashlight*, *rubbish* not *garbage*, *trousers* not *pants*. For deliberate vocabulary-stretch questions (`vr.synonyms`/`vr.antonyms` at higher difficulty), Latinate/tier-3 words are fine and are not an Americanism concern either way.
- **Currency and units:** £ (GBP) for any money-based scenario. Metric units (metres, kilograms, litres) as the primary system, matching the UK National Curriculum — imperial only where a question is deliberately testing imperial↔metric conversion as a maths skill, not in general VR/reasoning scenario-setting.
- **Dates:** day/month/year format when a date appears in a question.
- **Institutional/cultural references:** school, hospital, library, gallery, etc. as used in the existing bank are safely UK-neutral. Avoid US-specific institutions (e.g. "high school," "recess") — use "secondary school," "break time."

---

## 6. Originality Requirements

- Every question must be **original phrasing** — even when testing a well-known relationship or pattern type, the specific words, scenario, and sentence structure must be freshly written, not adapted by light word-swapping from an existing published question.
- Common-knowledge relationships (young animal → adult animal, tool → its use, creator → creation) are not proprietary to any publisher and are freely reusable as *relationship types* — what's protected is the specific expression of them (exact word pairs, exact phrasing), not the underlying pattern.
- If a question is inspired by having seen a similar format in a past paper or prep book, the test is: **would someone familiar with that source recognize this as the same question?** If yes, rewrite with entirely different entities, wording, and if possible a different specific relationship within the same competency, until the answer is no.
- Two questions within Angel's own bank should also not be near-duplicates of each other (same relationship, different word pair, e.g. two "young animal → adult animal" analogies) unless deliberately building a difficulty ladder within the same underlying pattern for pedagogical reasons — and if so, they should be tagged at different `content_difficulty` levels, not left as redundant duplicates at the same level.

---

## 7. Copyright Guidance

- **Do not copy or closely paraphrase** questions from commercial 11+ preparation publishers (Bond 11+, CGP, GL Assessment sample/practice materials, Eleven Plus Exams and similar forums/sites), regardless of how the material was accessed. This applies to exact wording, close paraphrases, and directly-reused specific scenarios/word pairs from a source you recognize as coming from a named publisher.
- **Relationship types and question formats are not copyrightable** — "word analogy," "hidden word," "letter code" are generic question formats used industry-wide and are fine to write original content for. What's protected is any given publisher's *specific expression* of a question in that format.
- **When authoring from memory of a real exam/paper**, treat it the same as authoring from a commercial publisher — do not reproduce a remembered question's specific wording or word pair, even approximately.
- **If genuinely unsure whether a planned question is too close to a known source**, don't ship it — pick a different scenario/word pair testing the same competency instead. Given how many valid word pairs exist for any relationship type (§3), there's no reason to risk a close call.
- **Passages** (for English comprehension, not currently part of VR but relevant to future subjects under this standard): must be entirely original prose written for Angel, never excerpted or lightly adapted from published books, even out-of-copyright classics, unless explicitly commissioned as such and cleared separately — a "based on" adaptation is not sufficient.

---

## 8. Mastery Guidance

Mastery (implementation plan §1.4) requires correct answers across `mastery_threshold` **distinct sessions**, not a single lucky answer — and one incorrect attempt after mastery is achieved demotes the question back to `learning`. This section is about how an author should set `mastery_threshold` per question, since the difficulty-based default (from the configurable `ali_mastery_defaults` table, §1) is a starting point, not always the right answer for a specific question.

**Raise the threshold above the difficulty default when:**
- The question has a small number of plausible answers, making a correct guess likely even without real understanding (e.g. a code question with an obvious "shift by 1" pattern that a student might luck into without grasping the general method).
- The question's `alternatives` list is broad, meaning many superficially different responses count as correct, which can mask partial understanding.

**Keep the difficulty default when:**
- The answer space is effectively open-ended and a correct answer is strong evidence of real reasoning (most `vr.analogies`, `vr.word-codes`, `vr.hidden-words` questions — there's no meaningful way to guess `HARM` inside `CHARMING` without actually finding it).

**Never lower the threshold below the difficulty default** — the defaults are already calibrated to be lenient (Easy/Medium = 2 sessions, Hard/Challenge = 3), and going lower would let a two-guess pattern get called "mastered."

---

## 9. Worked Examples

**These are illustrative examples for training reviewers on how to apply this standard — not the production tagging pass for the 52-question bank, which remains a separately reviewed task per the approved decision that metadata generation is not automated.** Three existing questions are shown fully tagged as a demonstration of the process; the actual tagging of all 52 questions should be done by a reviewer working through §1–§4 systematically, question by question.

### Example A — `vr-001`
> "Kitten is to cat as puppy is to ___" → **dog**

| Field | Value | Reasoning |
|---|---|---|
| `skill` | `vr.analogies` | category = "Word Analogy" → §3 mapping |
| `content_difficulty` | `easy` | Concrete, familiar relationship, no ambiguity — matches §4.2's easy-analogy calibration exactly |
| `estimated_time_seconds` | 18 | §4.5 easy-analogy range 15–20s, midpoint-ish, nothing unusual about length |
| `pathway` | `["gl","cem","iseb"]` | Generic animal-relationship analogy, not board-specific format |
| `mastery_threshold` | 2 (default) | Open-ended answer space, no guess risk — default is appropriate |

### Example B — `vr-024`
> "In a letter code, each letter shifts forward 2 places in the alphabet (A→C, B→D, C→E…). What does the word ACE become in this code?" → **CEG**

| Field | Value | Reasoning |
|---|---|---|
| `skill` | `vr.letter-codes` | category = "Letter Code" |
| `content_difficulty` | `medium` | Rule stated directly (not derived from example, unlike `vr-003`), but requires tracking 3 separate letter-shifts correctly — one step but multiple pieces of info, matching §4.1's medium row |
| `estimated_time_seconds` | 40 | §4.5 letter-codes medium range 35–50s |
| `pathway` | `["gl","cem"]` | Letter-shift code format is common to GL and CEM papers specifically |
| `mastery_threshold` | 2 (default) | Not meaningfully guessable — default appropriate |

### Example C — `vr-030`
> "Add one letter to the word RAIN to make a new 5-letter word. What word can you make?" → **train** (alternatives: brain, grain, drain)

| Field | Value | Reasoning |
|---|---|---|
| `skill` | `vr.word-codes` | category = "Word Codes" |
| `content_difficulty` | `medium` | Multiple valid answers reduces individual difficulty per answer, but requires generating and checking candidates — per §4.2's word-codes calibration this sits at medium, not easy, specifically because of the generate-and-check reasoning load |
| `estimated_time_seconds` | 40 | §4.5 word-codes medium range 35–50s |
| `pathway` | `["gl","cem","iseb"]` | Generic format |
| `mastery_threshold` | 2 (default) | Multiple valid answers actually makes a lucky guess *less* likely to be dismissed as non-understanding (unlike a narrow-answer code question) — default is fine, don't raise it just because `alternatives` exists; raise only when the *breadth* of alternatives is what creates guess risk (§8), which isn't the case here since generating any valid 5-letter word still requires real reasoning |

---

## 10. Review Checklist (per question, before import)

- [ ] `id` assigned, follows sequence, never reused
- [ ] `skill` assigned from the competency taxonomy (§3), not the generic `SkillType`
- [ ] `content_difficulty` assigned using the rubric (§4), not gut feeling alone
- [ ] `estimated_time_seconds` set from the baseline table (§4.5) or justified if outside it
- [ ] Exactly one correct answer, or complete `alternatives` list (§2.2)
- [ ] Explanation names the rule and shows working (§2.3)
- [ ] Hint (if present) points at method, not answer (§2.4)
- [ ] UK English spelling/vocabulary/units throughout (§5)
- [ ] Checked against §6/§7 originality and copyright requirements
- [ ] `mastery_threshold` left at default unless §8's raise-conditions apply
- [ ] `pathway` set deliberately, not defaulted without thought

---

## 11. Competency Definitions — Mathematics (Phase ALI 2.0)

Extends §3's approach to a second subject, exactly as §3 anticipated ("built the same way — from real existing category/type distinctions, not invented"). All other sections (§1 metadata, §2 writing standards, §5 UK English, §6 originality, §7 copyright, §8 mastery guidance, §10 review checklist) apply to Mathematics unchanged — this section only adds what's subject-specific: the competency taxonomy and its difficulty calibration.

### 11.1 Why this taxonomy required real refinement, not just adoption

`MathsQuestion` (`types/index.ts`) has no `category` field the way `ReasoningQuestion` did for Verbal Reasoning — there was no existing ground truth to read the taxonomy from. Reviewing all 20 real questions in `data/maths.ts` (`mathsQuestions` + `quickArithmetic`) against the suggested 14-competency list surfaced two real gaps, not just a confirmation:

- **Three questions (`mth-002`, `qa-008`, `qa-009`) don't fit any of the 14 suggested competencies** — they test powers, roots, and order of operations (`4³ + √144`, `√225`, `2³ × 5`), which is a distinct, common 11+ topic block, not a natural fit for "Multiplication" or any other listed competency.
- **One question (`qa-010`, "LCM of 6 and 9") also doesn't fit** — factors/multiples/LCM/HCF is its own recognized 11+ topic, distinct from basic multiplication or division fluency.

Both gaps are added as new competencies below rather than force-fitted into an existing one. This is the same discipline Decision 13 established for Verbal Reasoning: derive the taxonomy from what the content actually tests, don't assume a proposed list is complete without checking it against real questions.

### 11.2 Competency taxonomy (16 competencies)

| Competency code | Label | What it tests | Real example from `data/maths.ts` |
|---|---|---|---|
| `maths.addition-subtraction` | Addition & Subtraction | Multi-digit addition/subtraction fluency | `qa-001`, `qa-002` |
| `maths.multiplication` | Multiplication | Multi-digit multiplication fluency | `qa-003` |
| `maths.division` | Division | Division fluency, including remainders | `qa-004` |
| `maths.fractions` | Fractions | Fraction arithmetic, simplification, fraction-of-amount | `mth-004`, `qa-006` |
| `maths.decimals` | Decimals | Decimal arithmetic and place value | `mth-008`, `qa-005` |
| `maths.percentages` | Percentages | Percentage-of-amount and reverse-percentage problems | `mth-010`, `qa-007` |
| `maths.ratio-proportion` | Ratio & Proportion | Sharing in a given ratio, scaling | `mth-007b` |
| `maths.algebra` | Algebra | Forming and solving simple equations, nth-term sequences | `mth-003`, `mth-006` |
| `maths.geometry` | Geometry | Area, perimeter, volume, shape properties | `mth-003`, `mth-009` |
| `maths.measurement` | Measurement | Units, conversions, speed/distance/time | `mth-001` |
| `maths.time` | Time | Reading and calculating with time | *(none yet — defined for future content, no current question maps here; see §11.4)* |
| `maths.money` | Money | Cost, profit/loss, change | `mth-005` |
| `maths.statistics` | Statistics | Averages, data interpretation, charts | *(none yet — defined for future content; see §11.4)* |
| `maths.problem-solving` | Problem Solving | Multi-step word problems combining several skills | `mth-001`, `mth-005` |
| `maths.powers-roots` | Powers, Roots & Order of Operations | Indices, square/cube roots, calculation order | `mth-002`, `qa-008`, `qa-009` |
| `maths.factors-multiples` | Factors, Multiples & Primes | LCM, HCF, prime factorisation | `qa-010` |

### 11.3 Multi-topic questions get one primary competency, not several

Several real questions genuinely test more than one topic (`mth-003` combines algebraic setup with a geometry answer; `mth-001` and `mth-005` are word problems that also touch measurement/money specifically). Per §2.1's "one skill per question" writing standard, **new** Mathematics questions should be written to test one competency cleanly. For the 20 **existing** questions, which predate this taxonomy, tag by the dominant skill being assessed — the reasoning step that actually determines whether the student gets it right — not every topic the surface content touches. `mth-003` is tagged `maths.algebra` (the width-variable setup is the actual difficulty), not `maths.geometry`, even though the final answer is an area. `mth-001` is tagged `maths.problem-solving` (the multi-step distance/speed/time reasoning is what's being tested), not `maths.measurement`.

### 11.4 Difficulty calibration

Reuses the general rubric (§4.1) and the same required-before-import fields (§1). Calibration notes specific to Mathematics:

- **`maths.powers-roots` and `maths.factors-multiples`**: difficulty scales with the size of numbers involved and whether the operation is "recognise a known value" (√144, easy-medium) vs. "compute from an unfamiliar base" (harder).
- **`maths.algebra`**: difficulty scales with the number of steps between the given information and the answer — `mth-003` (perimeter → width → length → area, 4 steps) sits at `medium`/`hard` by this measure, not `easy`, even though no step individually is hard.
- **`maths.problem-solving`**: by definition multi-step; should rarely be tagged `easy` — a genuinely one-step word problem is better tagged by its actual operation (e.g. `maths.money` for a single subtraction-in-context).
- **`maths.time` / `maths.statistics`**: no real questions exist yet to calibrate against (§11.2) — the first questions written for these competencies should be tagged conservatively (`easy`/`medium`) until real attempt data exists to check them against (§4.4's general rule).

### 11.5 Worked examples (illustrative only — not the production tagging pass)

Same caveat as §9: these are training examples for reviewers, not the real hand-tagging pass for the 20 existing questions, which remains a separate human-owned task per the standing "do not automate metadata generation" principle (Decision 3, extended to every subject by Decision 3's own reasoning, not just Verbal Reasoning).

**`mth-004`** ("What is 3/8 + 5/6?") — `skill: maths.fractions`, `content_difficulty: medium` (requires finding a common denominator across two different-value fractions, one extra step beyond a same-denominator addition), `estimated_time_seconds: 60`, `pathway: ["gl","cem","iseb"]` (generic fraction arithmetic, not board-specific).

**`qa-010`** ("LCM of 6 and 9") — `skill: maths.factors-multiples`, `content_difficulty: easy` (small numbers, a single well-known technique), `estimated_time_seconds: 25`, `pathway: ["gl","cem","iseb"]`.

**`mth-009`** ("cylinder volume") — `skill: maths.geometry`, `content_difficulty: hard` (3D formula recall + three-factor multiplication + a given approximation for π to apply correctly), `estimated_time_seconds: 75`, `pathway: ["gl","iseb"]` (volume-of-3D-shapes is less universal across all four boards than basic arithmetic).

---

## 12. Competency Definitions — Non-Verbal Reasoning

**Implements Work Package WP-01 (`IWP-001` §1), extending this standard to a domain named in `AEP-002_KNOWLEDGE_FRAMEWORK.md` §2.3 — the first competency taxonomy this domain has ever had, despite 40 real questions already existing in `data/non-verbal-reasoning/*.ts`.** Same discipline as §3/§11: the competency codes below are cited directly from AEP-002 §2.3, not re-derived — this section adds the difficulty calibration and timing baselines AEP-002 §2.3 explicitly flagged as not yet done.

### 12.1 Competency taxonomy (6 competencies, cited from AEP-002 §2.3)

| Competency code | Consolidates raw `category` value(s) | What it tests | Common student error |
|---|---|---|---|
| `nvr.pattern-completion` | Pattern Grids, Pattern Rules, Pattern Sequences | Inferring the rule governing a grid or sequence of shapes/symbols and applying it to find a missing element | Assuming the simplest visible pattern (e.g. a repeat) when the real rule is compound or two-dimensional |
| `nvr.symbol-codes` | Symbol Codes, Symbol Sequences, Number Grids | Applying a stated or inferred symbol-to-value mapping | Treating visually similar symbols as equivalent, or missing that a code applies positionally rather than absolutely |
| `nvr.rotation` | Rotation | Determining the result of rotating a shape or figure by a stated angle/direction | Confusing clockwise and anticlockwise, or applying the rotation around the wrong pivot point |
| `nvr.reflection-symmetry` | Reflection, Symmetry | Determining the result of reflecting a figure, or identifying/completing a symmetric figure | Reflecting along the wrong axis, or treating near-symmetry as exact symmetry |
| `nvr.shape-properties` | Shape Properties, Shape Counting | Identifying shared or differing properties across a set of figures (sides, angles, fills) | Counting a property inconsistently across figures presented at different sizes/orientations |
| `nvr.3d-shapes` | Nets and 3D Shapes | Relating a 2D net to the 3D shape it folds into | Misjudging which faces become adjacent once folded |

### 12.2 Worked calibration by competency (new — AEP-002 §2.3 explicitly flagged this as not yet done)

- **`nvr.pattern-completion`**: Easy = a simple alternating or skip-repeat pattern (`nvr-014`: ● ● ○ repeating). Medium = an arithmetic growth pattern requiring a counting step (`nvr-016`: odd-number row growth; `nvr-021`: doubling). Hard = a compound or second-order rule (`nvr-023`: the *differences between terms* themselves increase by a fixed step — genuinely two reasoning layers, not one). Challenge = not yet represented in the real bank; would require a two-dimensional rule (varying by both row and column simultaneously) — flagged honestly as a real content gap, following the same "no real questions to calibrate against yet" precedent as §11.4's `maths.time`/`maths.statistics`.
- **`nvr.symbol-codes`**: Easy = direct substitution into a single operation (`nvr-019`: sum three mapped values). Medium = substitution requiring mixed operations in one expression (`nvr-017`, `nvr-018`: combined add/subtract or multiply/divide). Hard = the mapping must be used to solve for an unknown via a stated consistency rule across a grid (`nvr-026`: row-sum-must-equal-12 grid) rather than simple lookup-and-compute. Challenge = not yet represented; would combine substitution with an algebra-like unknown appearing twice.
- **`nvr.rotation`**: Easy = a single 90°/180° rotation from a cardinal starting direction (`nvr-027`, `nvr-030`). Medium = the same single rotation from an intercardinal starting direction, e.g. South-West (`nvr-028`). Hard = a compound rotation requiring net-angle calculation across two sequential turns (`nvr-039`), or an unusual angle requiring the anticlockwise/clockwise equivalence to be recognised (`nvr-040`: 270° clockwise = 90° anticlockwise). Challenge = not yet represented; would combine rotation with a second transformation (e.g. rotation then reflection).
- **`nvr.reflection-symmetry`**: Easy = counting lines of symmetry on a common regular shape by direct recall (`nvr-031` square, `nvr-032` triangle). Medium = extrapolating the "regular polygon: symmetry lines = sides" pattern to a less familiar polygon (`nvr-033` octagon), or symmetry of a numeral (`nvr-036`). Hard = a question that breaks the "regular shape → has symmetry" assumption a student may have over-generalised from Medium-tier practice (`nvr-037`: F has *zero* lines; `nvr-038`: a slanted parallelogram has *zero*) — genuinely harder because the trap is conceptual, not computational. Challenge = not yet represented; would combine reflection and rotation reasoning about the same figure.
- **`nvr.shape-properties`**: Easy = naming a shape directly from a short list of stated properties (`nvr-034`). Medium/Hard/Challenge = not yet represented in the real 40-question bank; this competency is the thinnest-populated of the six and any new authoring should prioritise it first among the six once WP-02 (hand-tagging) begins.
- **`nvr.3d-shapes`**: only 1 real question exists in the NVR bank itself (net-folding is more heavily represented in Spatial Reasoning, §13) — calibration here is illustrative only, following the same "no real data to calibrate against yet" honesty as `maths.time` in §11.4.

### 12.3 `estimated_time_seconds` baselines

| Competency | Easy | Medium | Hard | Challenge |
|---|---|---|---|---|
| `nvr.pattern-completion` / `nvr.symbol-codes` | 20–30s | 30–45s | 45–65s | 65–85s |
| `nvr.rotation` / `nvr.reflection-symmetry` | 15–25s | 25–35s | 35–50s | 50–70s |
| `nvr.shape-properties` / `nvr.3d-shapes` | 20–30s | 30–45s | 45–60s | 60–75s |

Baselines are extrapolated from the general rubric (§4.1) and the relative reasoning load already established for structurally similar Verbal Reasoning/Mathematics competencies (e.g. `nvr.rotation`'s single-step, low-guessability profile mirrors `vr.letter-codes`) — not independently timed against real students, and flagged as such, consistent with §4.5's own status as calibration guidance rather than measured fact.

### 12.4 Worked example (illustrative only — not a production tagging pass, same caveat as §9/§11.5)

**`nvr-023`** ("Find the next term: 2, 5, 10, 17, 26, ?") — `skill: nvr.pattern-completion`, `content_difficulty: hard` (the differences between terms form their own sequence — 3, 5, 7, 9, 11 — a genuine second layer of reasoning beyond spotting a single constant step), `estimated_time_seconds: 55`, `pathway: ["gl","cem"]` (NVR-format number-grid/pattern reasoning is a GL/CEM-specific paper component; not tested by CSSE at all, per AEP-002 §6 — this `pathway` value must never include `"csse"`).

---

## 13. Competency Definitions — Spatial Reasoning

**Implements WP-01, extending this standard to the domain named in `AEP-002_KNOWLEDGE_FRAMEWORK.md` §2.4** (39 real questions in `data/spatial-reasoning/*.ts`, previously untaxonomised).

### 13.1 Competency taxonomy (5 competencies, cited from AEP-002 §2.4)

| Competency code | Consolidates raw `category` value(s) | What it tests | Common student error |
|---|---|---|---|
| `sr.paper-folding` | Paper Folding | Predicting the result of one or more folds (layers, hole-punch outcomes) | Forgetting that each fold multiplies existing layers rather than adding to them |
| `sr.compass-grid-navigation` | Compass Directions, Grid Navigation | Tracking direction/position through a sequence of turns or grid moves | Confusing clockwise/anticlockwise turns — the same error family as `nvr.rotation` (AEP-002 §3/§10's cross-domain link) |
| `sr.3d-visualisation` | 3D Shapes, 3D Visualisation, Nets and 3D Shapes | Mentally rotating or assembling a 3D figure from a 2D representation | Judging a 3D shape from its 2D silhouette without accounting for hidden/rotated faces |
| `sr.rotation` | Rotation | Determining the result of rotating a 3D or perspective figure | Same underlying error family as `nvr.rotation` |
| `sr.shape-properties-symmetry` | Shape Properties, Symmetry | Identifying spatial properties (faces, symmetry) of solid or 2D figures | Treating an asymmetric view as symmetric due to a misleading 2D projection |

### 13.2 Worked calibration by competency

- **`sr.paper-folding`**: Easy = single-fold layer count (`sr-013`). Medium = two folds with hole-punch reasoning (`sr-014`, `sr-020` — requires holding both the layer count *and* what happens when a hole passes through all of them). Hard = folding a strip into multiple accordion sections (`sr-015`, unusual fold geometry) or four sequential folds requiring the doubling pattern held across more steps (`sr-019`: 2⁴=16). Challenge = not yet represented; would require predicting hole *position*, not just count, after an asymmetric fold.
- **`sr.compass-grid-navigation`**: Easy = a single named turn from a cardinal direction (`sr-023`). Medium = a turn from an intercardinal direction (`sr-027`) or a simple two-leg grid path with no direction reversal (`sr-026`). Hard = a multi-leg grid path requiring net displacement to be tracked across more than two legs (`sr-028`), or a path requiring Pythagorean distance reasoning rather than simple counting (`sr-024`). Challenge = not yet represented; would combine multi-leg navigation with a facing-direction change mid-route.
- **`sr.3d-visualisation`**: Easy = counting faces/vertices of a common, familiar solid (`sr-021` prism, `sr-022`/`sr-036` cuboid). Medium = a less common solid whose property is genuinely counter-intuitive (`sr-017` tetrahedron; `sr-035` cone — "1 edge" surprises students expecting 0 or 2). Hard = applying Euler's formula to derive an unstated property rather than recalling it directly (`sr-018`). Challenge = not yet represented; would require reasoning about a compound or unfamiliar solid with no standard formula to fall back on.
- **`sr.rotation`**: calibrated identically to `nvr.rotation` (§12.2) — same underlying skill, confirmed by AEP-002 §10 as a Strong shared-mechanism link, since the *error*, not only the skill, is shared.
- **`sr.shape-properties-symmetry`**: Easy = counting symmetry lines of a regular polygon by direct recall (`sr-032`, `sr-034`). Medium = identifying a shape/letter with an exact stated symmetry count from several options, requiring elimination (`sr-033`). Hard = applying the interior-angle-sum rule to derive a value not directly given (`sr-037`: recall the 180° rule; `sr-038`: a genuine two-step calculation — total then divide by 5). Challenge = not yet represented; would combine multiple polygon properties in one question.

### 13.3 `estimated_time_seconds` baselines

| Competency | Easy | Medium | Hard | Challenge |
|---|---|---|---|---|
| `sr.paper-folding` | 20–30s | 30–45s | 45–65s | 65–85s |
| `sr.compass-grid-navigation` | 20–30s | 30–45s | 45–65s | 65–85s |
| `sr.3d-visualisation` / `sr.shape-properties-symmetry` | 20–30s | 30–45s | 45–60s | 60–80s |
| `sr.rotation` | 15–25s | 25–35s | 35–50s | 50–70s |

### 13.4 Worked example (illustrative only)

**`sr-018`** ("square-based pyramid, 5 faces, 5 vertices, find edges via Euler's formula") — `skill: sr.3d-visualisation`, `content_difficulty: hard` (requires recalling and correctly applying F+V−E=2, then interpreting the result physically — two reasoning steps, not simple recall), `estimated_time_seconds: 55`, `pathway: ["gl","iseb"]` (Spatial Reasoning as a distinct component is not confirmed universal across all boards — per AEP-002 §6, this is flagged pending migration for CEM/GL region-specific confirmation, and must never include `"csse"`, which tests neither VR nor NVR/SR at all).

---

## 14. Competency Definitions — Mathematical Reasoning (`numreason`)

**Implements WP-01, extending this standard to the domain named in `AEP-002_KNOWLEDGE_FRAMEWORK.md` §2.5.** Per `AEP-002_KNOWLEDGE_FRAMEWORK.md` §14 (Terminology Governance), this domain's internal subject key is `numreason`, but it must **never** be labelled "Numerical Reasoning" in any parent- or learner-facing surface — that term is reserved exclusively for referring to CEM's own combined Maths+NVR exam paper by name. This standard, and any future authoring against it, uses **"Mathematical Reasoning"** as the only public-facing label for this domain.

### 14.1 Competency taxonomy (6 competencies, cited from AEP-002 §2.5)

| Competency code | Consolidates raw `category` value(s) | What it tests | Common student error |
|---|---|---|---|
| `numreason.sequences-analogies` | Number Sequences, Number Analogies, Missing Numbers, Number Grids | Inferring a numeric rule from a sequence or pair-relationship and applying it | Assuming a constant-difference rule when the real rule is multiplicative, two-step, or requires holding more than one prior term (Fibonacci-style) |
| `numreason.function-machines` | Function Machines | Applying or reversing a stated input→output operation chain | Applying operations in the stated order when reversing the machine requires the *inverse* order |
| `numreason.data-statistics` | Data Interpretation, Mean and Average | Reading data from a table/chart and computing a summary statistic | Misreading which category a data point belongs to, or computing a sum instead of a mean; confusing mean/median/mode/range |
| `numreason.money-measures` | Money and Measures | Applied arithmetic in money/measurement contexts | Unit-conversion slips (e.g. mixing pence and pounds, or cm/m/km) |
| `numreason.percentages` | Percentages | Percentage-of-amount and reverse-percentage reasoning in a puzzle context | Confusing "percentage of" with "percentage increase/decrease" — shares this exact error family with `maths.percentages` (§11.2) |
| `numreason.ratio-proportion` | Ratio and Proportion | Sharing/scaling in a stated ratio, in a puzzle context | Sharing by count of parts rather than by the stated ratio weighting — shares this error family with `maths.ratio-proportion` |

### 14.2 Worked calibration by competency

- **`numreason.sequences-analogies`**: Easy = a simple constant-difference sequence, including a gap-fill variant (`nr-014`, `nr-018`). Medium = a multiplicative/geometric sequence (`nr-015`, `nr-016`) or a recognisable named pattern (`nr-017`: square numbers). Hard = a sequence requiring two prior terms to be held in mind simultaneously (`nr-013`: Fibonacci) — a genuinely different, heavier working-memory demand than a single-term rule, consistent with AEP-001 §2.4's cognitive-load evidence. Challenge = not yet represented; would be a second-order-difference sequence, mirroring `nvr.pattern-completion`'s own Hard-tier gap (§12.2), a real, named content gap for this competency.
- **`numreason.function-machines`**: Easy = not yet represented by a genuinely single-step example in the real bank (the simplest real questions are already two-step); this is flagged as a real, thin-Easy-tier gap. Medium = a two-step forward machine (`nr-019`, `nr-021`, `nr-022`). Hard = a two-step *reverse* machine, requiring the operations to be inverted **and** applied in reverse order (`nr-020`) — a materially harder skill than forward application, not simply "the same difficulty backwards." Challenge = not yet represented; would be a three-or-more-step reverse machine.
- **`numreason.data-statistics`**: Easy = a direct mean of a short list (`nr-034`, `nr-041`) or direct mode-spotting (`nr-040`). Medium = a median requiring sorting first (`nr-036`), a pie-chart equal-sector angle (`nr-037`), or a reverse-mean calculation (total from a given mean, `nr-035`). Hard = a data-interpretation question requiring a fraction to be simplified from raw counts (`nr-038`) or a range calculation easily confused with another measure (`nr-039`). Challenge = not yet represented; would combine two statistical measures (e.g. mean *and* range) in one question.
- **`numreason.money-measures`**: Easy = a direct multiply-then-subtract change calculation (`nr-030`). Medium = a unit-price scaling problem requiring an intermediate unit value to be found first (`nr-031`), or a fixed-plus-variable charge calculation (`nr-032`). Hard = a real-world scale/unit-conversion problem spanning two unit systems (`nr-033`: cm on a map → real km, a three-step conversion chain). Challenge = not yet represented; would combine multiple unit conversions in one question.
- **`numreason.percentages`**: Easy = a direct percentage-of-amount with a clean number, including the direct-read special case where the total is 100 (`nr-023`, `nr-025`). Medium = a percentage-of-amount requiring the 10%-scaling technique on a less clean number (`nr-026`), or a percentage-off pricing problem requiring a second subtraction step (`nr-024`). **Hard/Challenge = a genuine, real content gap**: no reverse-percentage question (finding an original amount from a stated percentage change) exists anywhere in the current bank, despite this being a standard 11+ topic — flagged honestly here, the same discipline §11.4 already applied to `maths.time`/`maths.statistics`, and a natural candidate for WP-02's authoring pass to close.
- **`numreason.ratio-proportion`**: Easy = a direct unitary-method ratio scaling with clean numbers (`nr-027`). Medium = sharing a total in a stated ratio, requiring "one part" to be found first (`nr-028`, `nr-029`). Hard/Challenge = not yet represented; would combine ratio-sharing with a further conversion step, or extend to a three-way ratio split — both real, named gaps for future authoring.

### 14.3 `estimated_time_seconds` baselines

| Competency | Easy | Medium | Hard | Challenge |
|---|---|---|---|---|
| `numreason.sequences-analogies` | 20–30s | 30–45s | 45–65s | 65–90s |
| `numreason.function-machines` | 20–30s | 30–45s | 45–65s | 65–85s |
| `numreason.data-statistics` | 25–35s | 35–50s | 50–70s | 70–90s |
| `numreason.money-measures` | 25–35s | 35–50s | 50–70s | 70–90s |
| `numreason.percentages` / `numreason.ratio-proportion` | 20–30s | 35–50s | 50–70s | 70–90s |

### 14.4 Worked example (illustrative only)

**`nr-020`** ("A function machine doubles the input and then subtracts 1. The output is 11. What was the input?") — `skill: numreason.function-machines`, `content_difficulty: hard` (requires inverting both operations *and* reversing their order — a materially different cognitive step from forward application, per §14.2), `estimated_time_seconds: 55`, `pathway: ["cem"]` (this puzzle-style content most directly supports CEM's combined "Numerical Reasoning" paper per AEP-002 §6 — note the `pathway` value here refers correctly to the *board's* paper by name in this citation context only, per AEP-002 §14's Terminology Governance; the domain itself must still never be labelled "Numerical Reasoning" in any parent- or learner-facing copy).

---

## 15. WP-01 Scope Note

Per `IWP-001` §1, this work package extends the taxonomy, difficulty calibration, and timing baselines only — it does **not** perform the real hand-tagging pass on the 119 existing NVR/Spatial/Mathematical Reasoning questions (that is WP-02, a separate, human-owned authoring task per this standard's own standing "do not automate metadata generation" principle, Decision 3), and it does not touch `ali_question_bank`, any migration, or any application code. The worked examples in §12.4/§13.4/§14.4 are illustrative training material for reviewers, identical in status to §9 and §11.5 — not the production tagging pass.
