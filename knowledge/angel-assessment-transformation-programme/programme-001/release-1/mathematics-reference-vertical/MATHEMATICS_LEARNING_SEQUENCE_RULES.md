# Mathematics Learning Sequence Rules — Lesson 001 ↔ Lesson 002

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Mathematics Learning Sequence Expansion (Educational Increment 002)
**Prepared:** 2026-08-12
**Governing instruction §8:** "Determine how Angel should decide whether a learner should complete Lesson 001 first, proceed directly to Lesson 002, practise Lesson 001, or revisit Lesson 001... Use the existing Educational Intelligence, competency, mastery and evidence capabilities wherever they genuinely support this. Do not create a new recommendation engine. Do not invent a fake prerequisite model. If the evidence architecture cannot safely support a particular sequencing decision, state the limitation instead of fabricating intelligence."

---

## 1. There is no real prerequisite relationship to model

Lesson 001 teaches MR-01 (Arithmetic Calculation). Lesson 002 teaches MR-04 (Multi-Step Word-Problem Interpretation). These are two distinct, independently-tracked competencies in the frozen Assessment Brain, with no cross-competency relationship recorded anywhere in this codebase:

- `lib/ali/recommendations.ts`'s `COMPETENCY_RELATIONSHIPS` graph, the one real cross-competency relationship mechanism that exists, uses a different, older competency vocabulary entirely (`maths.fractions`, `numerical-reasoning.fractions`, etc. — the legacy ALI signal codes, not Assessment Brain's MR-01/MR-04 codes) and contains no MR-01↔MR-04 edge of any kind.
- No Assessment Brain document (`ASSESSMENT_BRAIN_V1.md`, `ALI_CROSS_SUBJECT_INTELLIGENCE.md`) asserts that arithmetic fluency is a formal, evidence-gated prerequisite for word-problem interpretation.

**Disclosed limitation:** while it is pedagogically plausible that comfort with arithmetic supports word-problem work, this increment does not invent that relationship as a gated prerequisite. Doing so would be exactly the "fake prerequisite model" the governing instruction forbids. Both lessons are independently, fully accessible at all times. Nothing about a learner's MR-01 evidence ever blocks, hides, or delays access to Lesson 002, and nothing about MR-04 evidence affects Lesson 001.

## 2. What Angel does instead: real evidence, honest ordering, no gate

The Learn hub (`app/learning-intelligence/learn/page.tsx`) reads each lesson's own real, already-computed `educationalState` independently, via the exact same `getEducationalIntelligence()` call each lesson page itself already makes for its own competency (MR-01 for Lesson 001, MR-04 for Lesson 002). No new evidence computation is introduced; the same function is called twice, once per competency, both unmodified.

Each lesson's card shows its own real state, using the exact same plain-language labels `MATHEMATICS_PROGRESSION_AND_MASTERY_MODEL.md` already established (extracted into a shared helper, `lib/learningEngine/progressionLabel.ts`, so both lesson pages and the hub read from one definition rather than three copies):

| Real `educationalState` | Label shown |
|---|---|
| `undefined` / `exploring` | Not yet started |
| `rebuilding` | Not yet understood |
| `building-knowledge`, `practising`, `reinforcing` | Developing |
| `mastered`, `durably-mastered` | Consistent |
| `reviewing` | Maintenance needed |

**Ordering rule (presentation only, never a lock):**

- Lesson 001 is always listed first (it is the more foundational operation, and was the first lesson released) and Lesson 002 second. Position is fixed, not evidence-ranked, to keep the hub simple and predictable with only two lessons.
- If Lesson 001 has no real evidence yet (`undefined`/`exploring`) **and** Lesson 002 also has none, Lesson 002's card carries a small, honest, non-blocking note: "Most families start with Lesson 1." This is copy, not a gate; the card remains fully clickable.
- If Lesson 001 has any real evidence at all (any state beyond "Not yet started") and Lesson 002 does not yet, Lesson 002's card instead carries: "Recommended next." Again framing only, using real evidence (the family has already engaged with Mathematics) to justify the suggestion, not a fabricated skill dependency.
- If both lessons have real evidence, neither card carries a suggestion; both simply show their own real state.

This is a small number of `if`/`else` branches over two already-computed values, not a new engine, ranking model, or persisted recommendation.

## 3. Practice and revisit remain exactly as Lesson 001 already defined them

- **Practise Lesson 001 / Lesson 002:** unchanged. Both lessons' evidence lives in the same subject-wide (`maths`) question bank, so the existing, single `/learning-intelligence/practice/mathematics` destination already surfaces both competencies' real practice pool without any change.
- **Revisit Lesson 001:** unchanged — the lesson page itself remains open-ended; a learner (or parent) can return to it at any time regardless of state, exactly as today.

## 4. Family Choice Pilot is explicitly out of scope

The Family Choice Pilot (`app/learning-intelligence/founder-validation/family-choice/page.tsx`) remains hardcoded to MR-01 only, per its own existing, unmodified `PILOT_COMPETENCY` constant. This increment does not extend the Pilot's choice-injection mechanism to MR-04. A family can still see Lesson 002's real evidence through the general Parent Dashboard and Learning Report paths (both competency-agnostic, unmodified); they cannot yet *choose* MR-04 as an active focus through the Pilot mechanism specifically. Disclosed, not silently worked around.
