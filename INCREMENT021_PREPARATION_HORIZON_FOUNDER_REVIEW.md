# Increment 021 — Preparation Horizon & Late-Entrant Placement — Founder Behaviour Review

Behavioural/educational review only. No new question family is authored by this increment, so no `ali_family_review` record is created — nothing here requires that workflow. This document exists so you can judge whether the six journeys below feel right before any production deployment.

**What changed, in one sentence:** the real Practice session generator (`lib/learningEngine/sessionGenerator.ts` → `lib/ali/selection.ts`) now genuinely reads the existing Preparation Horizon decision (built in Increment 019, previously only shown on one dashboard card) and lets it bias what gets served — as a *preference*, never a hard rule — and a learner with insufficient evidence is now routed to a real, short placement flow instead of an undifferentiated session.

---

## 1. Foundation learner journey

**Input context:** Year 4, long exam runway, some real evidence already recorded but mostly at "exploring"/early stage.

**Angel decision:** `preparationStage = "foundation"`, `recommendedDifficultyLean = "favour_guided_and_easier"`, `placementRequired = false` (real evidence already exists, so placement is not re-triggered).

**What the child sees:** an ordinary Practice session — no new screen, no new language. The session composition is quietly weighted toward easier and medium-difficulty questions and, for Mathematics families with real guided teaching content, toward those specific families.

**Why:** genuine evidence shows this learner is still building the fundamentals. A long runway means there's no urgency to force harder material before it's earned.

**Questions/activity served:** predominantly easy/medium Mathematics questions; harder material remains reachable (never locked out), just statistically less likely this session.

**What happens next:** ordinary Practice continues; as real mastery accumulates, the difficulty lean shifts naturally through the existing evidence-driven escalation mechanism (`computeDifficultyWeightMultiplier`, unchanged), now working alongside the new stage-level bias rather than instead of it.

---

## 2. Strong long-runway learner journey

**Input context:** Year 4, long exam runway, strong evidence (durably-mastered across sampled competencies).

**Angel decision:** `preparationStage = "transfer"`, `recommendedDifficultyLean = "favour_independent_and_harder"`.

**What the child sees:** an ordinary Practice session, quietly weighted toward harder and challenge-tier questions.

**Why:** this is the specific case the Founder's own boundary named directly — a Year 4 learner must not be held at easy difficulty merely because of year group. School year plays no role in this decision at all; the lean comes entirely from real evidence.

**Questions/activity served:** predominantly hard/challenge Mathematics questions; easy material remains reachable, just statistically less likely.

**What happens next:** continues at this pace; if the exam eventually approaches, the same evidence would carry the learner into exam-preparation/final-readiness bias too — but never prematurely, since Mock access itself stays governed by the existing, unmodified Mock Access Policy, which checks readiness (stage), not merely difficulty performance.

---

## 3. Late Year 6, insufficient-evidence journey

**Input context:** Year 6, short exam runway, no real evidence recorded yet (a brand-new or late-entrant profile).

**Angel decision:** `preparationStage = "insufficient_evidence"`, `placementRequired = true`, `recommendedActivityType = "placement_check"`. Crucially: this is **not** overridden into "final_preparation" merely because the exam is close — the evidence gap is read first, always.

**What the child sees:** on opening Practice, they are taken directly to a new page: *"Finding your starting point."* A short explanation that there's no pass or fail, then up to 6 short Mathematics questions, one per competency, presented one at a time.

**Why:** a late entrant with no real evidence cannot be responsibly served either "start from scratch" or "drill hard, exam-condition material" — Angel genuinely doesn't know which yet. The placement flow exists to find out quickly, honestly, without pretending to be a full assessment.

**Questions/activity served:** up to 6 Mathematics questions (1 per MR-competency), reused from the existing, already-reviewed Practice-eligible pool — no new content, never Mock-eligible or Mock-exposed material.

**What happens next:** on completion, the learner is routed straight into ordinary Mathematics Practice. Because even a single real attempt per competency is enough evidence to move that competency off "insufficient" (the same real confidence-tier logic every other page already uses), the very next Practice load recomputes a genuine, evidence-based decision — not placement again.

---

## 4. Late Year 6, strong-evidence journey

**Input context:** Year 6, short exam runway, strong evidence already exists (e.g. an entrant who has used Angel for a while, or transferred history).

**Angel decision:** `preparationStage = "final_preparation"`, `recommendedDifficultyLean = "favour_independent_and_harder"`. If the top-priority candidate is a genuine unseen-transfer trigger, `recommendedActivityType = "unseen_transfer_check"`.

**What the child sees:** an ordinary Practice session, weighted toward harder material and, when the recommendation calls for it, genuinely favouring FAR_TRANSFER-tagged questions over routine ones at the same difficulty.

**Why:** real evidence supports exam-readiness, and time is short — the bias correctly shifts toward transfer/application material, without touching Mock at all (that remains a separate, unmodified decision governed by Mock Access Policy).

**Questions/activity served:** predominantly hard/challenge Mathematics questions, with a genuine preference for unseen-transfer-tagged material when recommended.

**What happens next:** Mock readiness (a full assessment) is a wholly separate decision, governed by the existing, untouched Mock Access Policy — this increment does not change when a Mock becomes recommended, only what ordinary Practice serves.

---

## 5. Weak late entrant journey

**Input context:** Year 6, short exam runway, genuinely uneven evidence (some real strength, some still-exploring competencies, no dominant pattern).

**Angel decision:** `preparationStage = "teaching"` (the real regression/weakness-shaped stage), `recommendedDifficultyLean = "favour_guided_and_easier"` — **not** final-readiness, despite the short runway.

**What the child sees:** an ordinary Practice session, weighted toward easier/guided material and, where a family has real teaching content, toward that family specifically — the opposite of what a naive "exam is close, drill hard" rule would produce.

**Why:** this is the exact failure mode the Founder's own instruction named explicitly — time pressure must never override a genuine weakness signal into a harder lean. The exam clock refines *urgency framing*, never raw difficulty preference, which stays tied to evidence.

**Questions/activity served:** predominantly easy/medium material, genuinely favouring families with guided support.

**What happens next:** as targeted teaching/guided practice closes real gaps, the evidence-driven lean shifts naturally, same as journey 1 — the exam clock does not force this faster than genuine evidence allows.

---

## 6. Placement start / completion / next-action journey

**Input context:** any learner for whom `placementRequired` is true (new profile, late entrant, or evidence has genuinely dropped below the insufficient threshold).

**Angel decision:** route to `/learning-intelligence/placement` instead of loading an ordinary session.

**What the child sees:**
1. **Start:** *"Finding your starting point"* — a one-sentence, non-punitive explanation, one "Start" button.
2. **During:** one question at a time, a simple progress count ("Question 3 of 6"), immediate light feedback ("Got it, thank you" / "That's alright, this helps Angel just as much either way") — never a running score.
3. **Completion:** a brief "Finding your starting point…" transition, then a direct hand-off into ordinary Mathematics Practice — no separate "results" screen claiming a definitive classification.

**Why:** short, bounded, honest. No internal terminology (Preparation Horizon, inventory class, placementRequired) ever reaches this screen. No score-chasing framing.

**Questions/activity served:** up to 6 Mathematics questions, one per competency, drawn only from the existing Practice-eligible pool.

**What happens next:** the learner lands in ordinary Practice, and — because real evidence now exists — the SAME wiring this whole document describes takes over immediately, using the freshly-computed decision.

---

## What this review pack is not

Not a claim that any of this has been visually verified in a browser (still DEFERRED, unrelated to this increment — no browser session was available this session either). Not a claim that Mock composition, Mock reserve, or Reading/passage eligibility were touched — they were not, and the tests confirm it. Not a claim that Writing or English Reading placement exists yet — placement is deliberately Mathematics-only in this first implementation (see the placement page's own module docstring for the disclosed reasoning), a real, bounded next step, not attempted here.
