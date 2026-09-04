# Increment 023 — Continuous Writing Sustainable Capacity Wave 1 — Founder Educational Review

This document is the required educational review pack. It also records the Writing/Mock boundary investigation and the Writing Capacity Contract this increment's Wave 1 was derived from, per the Founder's own explicit instruction not to jump straight to "add some more prompts."

## Founder Decision Record (additive — original review below is preserved unchanged)

**Original decision: APPROVED WITH AMENDMENT** (preserved as the historical decision even after the amendment below is implemented and verified — never rewritten to plain APPROVED).

**Candidate 1 — "A Skill You're Proud Of":** APPROVED, unchanged.

**Candidate 2 — "Something That Didn't Go to Plan":** APPROVED WITH AMENDMENT. Founder's own wording-level review confirmed the concern raised in the prior review round was real: the original instruction did not sufficiently prevent a self-caused mistake from satisfying "didn't go the way you expected," risking educational redundancy with `mock-writing-mistakelearned-01`. **Amendment implemented:** the prompt now requires the change be caused by something "outside your control," the checklist explicitly excludes "because of something you did," and the "what would you do differently"/lesson-learned framing (never actually present, but the risk of drifting there) is foreclosed by focusing the checklist entirely on what changed and how the writer responded. A safeguarding line was added, in the same positive register as `mistakelearned-01`'s own established safeguarding tone.

**Candidate 3 — "Advice for Someone Younger":** APPROVED WITH AMENDMENT. **Amendment implemented:** "ordinary, everyday" added to both the prompt and a new checklist line, bounding the scope of valid experience without weakening the synthesis, audience-awareness, or explanation requirements the DEMANDING classification depends on. No formal-letter convention introduced; the 2+-pieces-of-advice, real-grounding, and why-it-matters requirements are all unchanged.

**Amendment implementation: YES.** **Amendment verification: AWAITING FOUNDER.**

---

## Writing/Mock Boundary Investigation — no defect found

Two currently Practice-visible rows carry a `mock-writing-` id prefix: `mock-writing-mistakelearned-01` and `mock-writing-newplace-01`. Investigated from actual classification/exposure evidence, not naming alone:

- Both were authored in migration 153 ("Angel English Content Foundation, Increment 001"), a **content-authoring batch explicitly distinct from the real Mock Programme batch** (migration 098, "Mock Programme Increment 006") — the shared `mock-writing-` prefix is a historical naming artifact from an early working title, not evidence of Mock reservation. The programme's own record states this directly: migration 153's batch was "authored for sustained multi-month use," unlike migration 098's explicit "Mock Programme" framing.
- Both went through the real, ordinary content-review pipeline (`ali_family_review`, `authentic_assessment_candidate` → independent review → `independently_validated`) and were deliberately, individually promoted to `practice_eligible` by migration 204 — a genuine, disclosed, Founder-record promotion, not an oversight.
- A sibling from the same original batch, `mock-writing-screentime-01`, went through the identical review chain but was explicitly held back (never promoted) — direct evidence this was a real, differentiating review process, not a rubber stamp.
- No migration anywhere creates or references an `ali_mock_form` row for either id — confirmed by direct search of every migration mentioning `ali_mock_form`, and migration 160's own header explicitly states "no `ali_mock_form` row [is created] — no English Mock is created or activated."
- Freshly re-queried, read-only, both rows currently carry `eligibility_status: practice_eligible`, `active: true`, `pathway: [csse]` — the same real gate every other Practice row passes through.

**Classification: A — ordinary Writing Practice prompts with legacy/misleading IDs.** No firewall defect. Wave 1 proceeds.

## The Writing Capacity Contract

Writing capacity is not "number of prompts." Eight real dimensions were modelled against the canonical framework (`CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md`, `assessmentBrainMap.ts`):

1. **Task shape** — CSSE's own evidenced Writing task types are QT-WC-01a (Reflective/Discursive Response Prompt) and QT-WC-01b (Picture-Stimulus Narrative Prompt). Only QT-WC-01a has ever been authored; QT-WC-01b requires an original, non-copyrighted image asset — a genuine, separate content-sourcing dependency, explicitly disclosed and **not attempted this increment** (excluded per the Teaching Boundary instruction: it would require a new, unsupported content-sourcing pipeline).
2. **Cognitive demand** — what must be selected, invented, weighed, or synthesised before writing.
3. **Planning demand** — how much selection/organisation is required before the first sentence.
4. **Structural demand** — how many organisational "moves" the piece needs (single description vs. multi-stage arc).
5. **Language demand** — the level of abstraction/register control naturally required.
6. **Independence** — Writing is always fully independent composition (no ladder/hints exist in the genre); what varies is how much of the learner's attention planning consumes versus mechanics.
7. **Transfer distance** — how different a task is from ones recently encountered.
8. **Topic/context diversity** — explicitly **not** the same as task diversity; a different topic with the same underlying demand is false variety, rejected throughout this increment.

## The Writing Challenge Model (educationally defined, then mapped to storage)

| Level | Planning demand | Structural demand | What it looks like |
|---|---|---|---|
| **ACCESSIBLE** (→ `easy`) | Low — one simple, instantly-recallable fact/preference | Low — a single stable idea, no time-arc | A steady-state self-description with nothing to invent, weigh, or track over time |
| **STANDARD** (→ `medium`) | Moderate — one specific memory/idea plus its organisation | Moderate — a clear developing structure (setup → detail → outcome) | A single bounded event or comparison, honestly recounted |
| **DEMANDING** (→ `hard`) | High — invention, multi-perspective weighing, or synthesis across experiences | High — multi-stage structure (before/turning-point/after; two views → position; multiple experiences → generalised insight) | Genuine compositional complexity beyond a single recalled moment |

This is deliberately not Mathematics' "one correct answer, harder numbers" model — Writing difficulty is never about a single correct answer; it is about how much the writer must plan, invent, weigh, or synthesise before composing.

## Preparation Horizon Connection

- **guided/easier** → can now genuinely mean an ACCESSIBLE-tier task (previously impossible — every real row was `hard`).
- **normal independent work** → STANDARD-tier tasks now exist to serve this without either over- or under-shooting demand.
- **harder work** → DEMANDING-tier tasks already existed (3 of 7), now joined by a third, structurally distinct route to that same tier — "harder" can mean genuinely greater writing demand (synthesis, invention, perspective-weighing), never merely a different topic at the same demand.
- **unseen transfer** → the new prompts carry real `transfer_class` values (`ROUTINE`/`NEAR_TRANSFER`/`FAR_TRANSFER`), the first time Writing content has varied on this axis at all.
- **revision/retrieval** → unaffected by this Wave; depends on real prior evidence, which grows as the pool is used.

A strong child asking for harder Writing can now, once this content is reviewed and promoted, genuinely receive greater compositional demand. A struggling child now has a real, low-planning-demand route that still produces genuine composition, not a trivial task.

## Classification of the Existing Seven (against the new Contract)

| ID | Title | Task shape | Stored difficulty | Real challenge (Contract) | Planning demand | Structural demand | Transfer relationship |
|---|---|---|---|---|---|---|---|
| `eng-inc003-writing-favouriteplace-01` | Your Favourite Place to Be | Familiar-place description + justification | hard | **STANDARD** | Moderate | Moderate | Distinct from newplace (unfamiliar/change) |
| `eng-inc003-writing-imaginedplace-01` | An Invented Place | Invented world + one event, internally consistent | hard | DEMANDING | High (invention) | High | The only genuinely invented (non-autobiographical) task |
| `eng-inc003-writing-pocketmoney-01` | Pocket Money or Helping Anyway? | Weigh two GIVEN views → personal position | hard | DEMANDING | High (given-perspective weighing) | High | Only discursive/opinion task |
| `eng-pc005-writing-personinfluence` | Someone Who Has Made a Difference to You | Person-portrait + one evidencing moment | hard | **STANDARD** | Moderate | Moderate | Distinct focus: a person, not a place/event |
| `eng-pc005-writing-somethingnew` | Something You Would Like to Learn | Real interest + one imagined future moment | hard | **STANDARD**-to-DEMANDING | Moderate-high | Moderate | Only real-present + imagined-future hybrid |
| `mock-writing-mistakelearned-01` | A Mistake You Learned From | Single-moment self-caused error + lesson | hard | **STANDARD** | Moderate | Moderate | Single moment, not a time-arc |
| `mock-writing-newplace-01` | Somewhere New | Arrival + developing impression over time | hard | DEMANDING | High (sustained arc) | High | Only sustained time-arc task |

**Real finding, disclosed honestly:** the stored `content_difficulty` for all 7 rows is uniformly `hard`, but real cognitive/structural demand splits roughly 4 STANDARD-shaped and 3 genuinely DEMANDING. This increment does **not** propose retagging the existing 7 (out of scope, would mutate reviewed/live content without authorisation) — it is reported as evidence for why the actual, most severe gap is not "no hard content" but **the total absence of anything ACCESSIBLE, and the mislabelling of genuinely STANDARD-demand tasks as if they were all equally demanding.**

## Actual Capacity Gaps (what Wave 1 is derived from, not a predetermined count)

1. Zero ACCESSIBLE-tier content exists, even by real demand — every task requires at least a specific memory plus organisation.
2. Zero genuine difficulty range exists in stored metadata (100% `hard`).
3. Three real DEMANDING-tier task shapes exist (invention, given-perspective-weighing, sustained-arc) — a fourth, distinct DEMANDING route (synthesis-across-experience, audience-aware) is entirely absent.
4. An externally-caused-disruption-plus-adaptive-response shape (distinct from the existing self-caused-error shape) is absent.

## Wave 1 (derived from the gaps above, not a quota)

**Size: 3.** Evidence supported exactly 3 — one prompt per genuine gap identified above (ACCESSIBLE entry point; a new STANDARD-tier task shape; a fourth, structurally distinct DEMANDING route). A 4th or 5th candidate was not authored because no further genuinely distinct gap was found without resorting to a surface topic swap.

### 1. "A Skill You're Proud Of" — `eng-inc004-writing-skillproud-01`

**CHILD-FACING INSTRUCTION:** "Write about something you have learned to do well, however big or small it feels — it could be a sport, a hobby, a household skill, or something else entirely. Describe how you learned it and what it feels like to be able to do it now."

**TASK SHAPE:** Steady-state personal-capability description. No time-arc, no invention, no perspective-weighing.

**WHY IT EXISTS:** Fills the total absence of an ACCESSIBLE-tier task — the lowest real planning/structural demand in the pool.

**EXPECTED WRITING BEHAVIOUR:** Name one specific skill; describe how it was learned; describe what it feels like now. Three simple, linked ideas.

**PLANNING DEMAND:** Low — pick a skill, no organisation of multiple strands required.

**STRUCTURAL DEMAND:** Low — a single stable idea, no time-arc to manage.

**LANGUAGE OPPORTUNITY:** Concrete, specific naming (a skill, a method) over vague self-praise.

**CHALLENGE CLASSIFICATION:** ACCESSIBLE (`easy`).

**WHY THAT CHALLENGE LEVEL IS JUSTIFIED:** No other prompt in the pool asks for a stable present-tense self-description with nothing to invent, weigh, or track over time — genuinely the simplest real cognitive shape available.

**HOW IT DIFFERS FROM THE EXISTING SEVEN:** Every existing prompt requires either a specific past event/moment, an invention, or a weighing of views. This requires none of those.

**ANTI-MEMORISATION / VARIETY CHECK:** Distinct topic (a skill, not a place/person/event/opinion) and distinct cognitive shape (steady-state vs. event/arc/invention/comparison). Test-verified: shares no more than 5 significant non-generic words with either other new prompt.

**SCORER COMPATIBILITY:** `type: "descriptive"` → maps to the existing `writing-reflective-discursive` teaching family; scored via the existing 5-dimension rubric (ideas/vocabulary/grammar/structure/punctuation) unchanged.

**ORIGINALITY / PROVENANCE:** Angel-original; not adapted from any CSSE past paper.

### 2. "Something That Didn't Go to Plan" — `eng-inc004-writing-notgotoplan-01`

**CHILD-FACING INSTRUCTION:** "Write about a time when something you were doing, or trying to do, didn't go the way you expected — it could be a school project, a game, a family occasion, a journey, or anything else. Explain what happened, what you did when things changed, and how it turned out."

**TASK SHAPE:** Externally-caused disruption + adaptive response.

**WHY IT EXISTS:** The existing pool's only comparable shape (`mistakelearned-01`) is a self-caused error the writer reflects on afterward; nothing currently asks the writer to narrate responding to an unexpected external change in the moment.

**EXPECTED WRITING BEHAVIOUR:** Describe the original plan/expectation, the disruption, the writer's own response, and the outcome.

**PLANNING DEMAND:** Moderate — one specific disruption plus one specific adaptation.

**STRUCTURAL DEMAND:** Moderate — setup → disruption → response → outcome.

**LANGUAGE OPPORTUNITY:** Sequencing language (then, so, but), cause-and-effect connectives.

**CHALLENGE CLASSIFICATION:** STANDARD (`medium`) — the first prompt honestly stored at this tier.

**WHY THAT CHALLENGE LEVEL IS JUSTIFIED:** Real but moderate planning/structure — harder than the ACCESSIBLE prompt (a genuine incident must be selected and organised), not as complex as invention or multi-perspective weighing.

**HOW IT DIFFERS FROM THE EXISTING SEVEN:** `mistakelearned-01` is about the writer's own ERROR; this is about an external, unchosen disruption — a genuinely different cognitive move (adaptability vs. self-critique).

**ANTI-MEMORISATION / VARIETY CHECK:** Test-verified distinct from both other new prompts and structurally distinct from `mistakelearned-01`/`newplace-01`.

**SCORER COMPATIBILITY:** Same as above — `descriptive` type, existing rubric, unchanged.

**ORIGINALITY / PROVENANCE:** Angel-original.

### 3. "Advice for Someone Younger" — `eng-inc004-writing-advice-01`

**CHILD-FACING INSTRUCTION:** "Imagine talking to someone a few years younger than you who is about to join your school or your class. Write the advice you would genuinely give them, based on things you have actually experienced. Explain why each piece of advice matters, using something real that happened to you."

**TASK SHAPE:** Synthesis across multiple past experiences, for an implied audience.

**WHY IT EXISTS:** The 3 existing DEMANDING-tier prompts reach that tier via invention (`imaginedplace-01`), given-perspective-weighing (`pocketmoney-01`), or a sustained single arc (`newplace-01`). None require drawing on MULTIPLE separate past experiences and generalising from them for a specific implied reader — a fourth, structurally distinct, genuinely harder route.

**EXPECTED WRITING BEHAVIOUR:** At least two distinct pieces of advice, each grounded in a real remembered experience, each explained, addressed to an imagined younger reader.

**PLANNING DEMAND:** High — select and connect multiple experiences, order them, decide what generalises.

**STRUCTURAL DEMAND:** High — a multi-part structure (advice 1 + evidence + reason; advice 2 + evidence + reason), plus sustained audience-awareness throughout.

**LANGUAGE OPPORTUNITY:** Register control for addressing a younger reader; generalising language ("that's why," "what I learned").

**CHALLENGE CLASSIFICATION:** DEMANDING (`hard`).

**WHY THAT CHALLENGE LEVEL IS JUSTIFIED:** Requires the same order of planning/structural complexity as the existing 3 DEMANDING prompts, via a genuinely different cognitive route (synthesis + audience-awareness, not invention or given-perspective-weighing).

**HOW IT DIFFERS FROM THE EXISTING SEVEN:** Every existing prompt is single-topic/single-event/single-comparison. This is the only prompt requiring synthesis across several distinct past experiences.

**ANTI-MEMORISATION / VARIETY CHECK:** Test-verified distinct from both other new prompts and from `imaginedplace-01`/`pocketmoney-01`.

**SCORER COMPATIBILITY:** Same as above.

**ORIGINALITY / PROVENANCE:** Angel-original.

## Capacity Impact

- **Raw Writing capacity:** 7 → 10 (once reviewed and promoted; not yet promoted this increment).
- **Task-shape coverage:** 7 distinct real shapes → 10 distinct real shapes (2 genuinely new: externally-caused-disruption-response; synthesis-across-experience-for-audience). QT-WC-01b (picture-stimulus narrative) remains 0 — disclosed, not solved.
- **Challenge range:** 0 ACCESSIBLE / 0 STANDARD (stored) / 7 DEMANDING (stored, though ~4 are honestly STANDARD-demand) → **1 ACCESSIBLE / 1 STANDARD / 8 DEMANDING (stored)**, the first genuine stored difficulty range Continuous Writing has ever had.
- **Preparation-Horizon serveability:** before this Wave, a `favour_guided_and_easier` recommendation for Writing had no genuinely easier real content to express itself through; after, it does. A `favour_independent_and_harder` recommendation previously had 3 real DEMANDING items to draw from; it now has 4, via a genuinely different cognitive route.
- **No defensible "X months of Writing" claim is made.** 10 real prompts remains a small pool by any comparison to Mathematics (202 rows) or Reading (24 passages); this Wave measurably improves range and freshness, it does not resolve Writing's status as the system's smallest content surface.

## Content Lifecycle

All 3 new rows enter at `eligibility_status = 'authentic_assessment_candidate'` (migration 225, prepared, not applied) — never directly `practice_eligible`, matching the exact precedent migrations 153→204 already established. A pending independent review row is registered for each (migration 226, prepared, not applied), using the same real `review_target_type = 'writing_prompt'` / `review_type = 'mock_writing_prompt_independent_review'` values migration 172 already established — not a new review category invented for this increment.

## Verification

13/13 targeted tests pass (exact ids, WC-01/QT-WC-01a classification, no QT-WC-01b attempt, challenge-tier metadata, checklist convention, task-shape/near-duplicate diversity checks, provenance/schema validity, no Mock exposure, protected initial eligibility, review registration correctness, insert-only migrations, scorer/rubric compatibility). Full suite 3556/3556. Typecheck clean. Copy Quality Guard clean (0/286 — the new migrations' learner-facing JSON copy contains no em dashes, matching the guard's own standard even though migrations sit outside its scanned directories). Migration SQL Guard clean (226 files).

## Status

No production mutation has occurred. Migrations 225/226 are prepared, quote-balanced, and NOT APPLIED. **FOUNDER EDUCATIONAL REVIEW: AWAITING FOUNDER.**
