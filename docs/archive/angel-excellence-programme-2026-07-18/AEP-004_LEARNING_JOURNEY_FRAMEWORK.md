# AEP-004: Learning Journey Framework

**Document ID:** AEP-004
**Programme:** Angel Excellence Programme — Discovery Wave (Document 4 of 5)
**Status:** DRAFT — awaiting Founder review and approval
**Project:** Angel 11+
**Owner:** ELBOLD
**Last Updated:** 2026-07-18
**Frozen (APD-007, 2026-07-18):** Version 1.0 Educational Architecture. Future changes require a defect correction, new educational evidence, or a formal programme decision — not a routine edit. (The single wording defect identified in `ARR-001_ARCHITECTURE_READINESS_REVIEW.md` §3 was corrected same-day, prior to freeze.)
**Governing documents:** `AEP-001_LEARNING_SCIENCE_CONSTITUTION.md` (APPROVED, amended APD-002), `AEP-002_KNOWLEDGE_FRAMEWORK.md` (APPROVED, amended APD-003), `AEP-003_QUESTION_INTELLIGENCE_FRAMEWORK.md` (APPROVED). This document does not redesign `ANGEL_EXPERIENCE_MANIFESTO.md`, `ANGEL_MOMENTUM_FRAMEWORK.md`, `ANGEL_CONNECTED_LEARNING_JOURNEY.md`, `ALI_MISSION_ENGINE.md`, or `ALI_PARENT_INTELLIGENCE.md` — every one of those is cited as an already-correct foundation. This document is the pedagogical evidence layer connecting them into one journey, and closes two gaps AEP-002 named explicitly for it to resolve: the CSSE pathway-targeting gap (Real Gaps #5) and the format-fluency gap (Real Gaps #6).

**Purpose:** Define the complete learner and parent journey from onboarding to Grammar School Readiness (AEP-002 §11, as amended by §11.6) — not a new UX redesign, but the framework explaining *why* each existing journey mechanism is structured the way it is, where it should extend, and where real gaps remain.

**Standing constraint carried into every section below:** per `ALI_CROSS_SUBJECT_INTELLIGENCE.md` §4.1, direct evidence about a learner's own competency always outranks any inference, recommendation, or cross-subject signal about the same competency. Nothing in this document proposes an exception to that rule; every new mechanism below (Knowledge Maintenance, Learning Transfer Journey, Parent recommendation explanations) is additive to it, never a substitute for it.

---

## 1. Learner Journey Stages

Every session a child has with Angel is already correctly structured as a six-beat story — Beginning, Journey, **Challenge**, Success, Reflection, Tomorrow (`ANGEL_EXPERIENCE_MANIFESTO.md`'s original five beats, extended with Challenge by `ANGEL_CONNECTED_LEARNING_JOURNEY.md` as naming something ALI's tier-progression logic already does, not a new doctrine). This document does not redesign that structure — it names the **outer loop** those six beats sit inside, per Programme Decision APD-004's Continuous Learning Architecture:

**Learning → Practice → Assessment → Reflection → Reinforcement → Knowledge Maintenance → Re-mastery (where appropriate) → back to Learning**

This is stated as a cycle, not a line, because **mastery is not permanent.** `ali_student_question_history`'s `mastery_state` already models this correctly at the single-question level — one incorrect attempt after mastery demotes a question back to `learning` (Decision 20/21, `QUESTION_AUTHORING_STANDARD.md` §8) — this document extends the same non-permanence principle to the *journey* level: a learner's relationship to a whole competency, not just one question, should be understood as something that can decay and needs periodic reinforcement, never as a box ticked once and never revisited. §9 (Knowledge Maintenance Model) is where this becomes concrete.

**Evidence basis:** the six-beat single-session structure is an existing, approved UX design (Manifesto/Connected Learning Journey), not re-evaluated here. The claim that mastery decays over time and the outer cyclical loop is required is grounded in AEP-001 §2.2 (spacing effect, Strong) and is a direct instruction from APD-004 — both educational evidence and explicit programme decision point the same direction.

---

## 2. Parent Journey

The three-horizon structure already established in `ANGEL_EXPERIENCE_MANIFESTO.md` (Day: "something real happened," Week: "a pattern forming," Month: "informed enough to make a real decision") and delivered today via `ALI_PARENT_INTELLIGENCE.md`'s four-bucket competency summaries (Strengths, Improving, Focus Next, Recently Mastered) is the correct foundation and is cited, not rebuilt. This document adds the outer frame: the Parent Journey runs in parallel to, and one layer behind, the Learner Journey (§1) — every stage of the child's cycle (Learning→...→Re-mastery) has a corresponding, plain-language parent-facing signal, never the raw mechanism. §12 (Parent Intelligence) develops this in full, including one genuinely new capability this document identifies as currently missing: recommendation explanations.

---

## 3. Pathway Selection

**This is the first, highest-leverage journey step, per `AEP-002_KNOWLEDGE_FRAMEWORK.md` §13 (Pathway-First Architecture).** A learner selects a pathway (CSSE, GL, CEM, ISEB, Independent School, or Custom Programme) during onboarding, and from that moment forward, AEP-002 §6's Examination Application Map governs which domains are even offered as recommendations — not merely which are emphasised.

**This directly resolves AEP-002's Real Gap #5.** A CSSE-selecting family should never be recommended Verbal Reasoning, Non-Verbal Reasoning, or Spatial Reasoning practice as part of their core journey, because CSSE tests none of them (AEP-002 §6, §11) — every hour spent there is an hour not spent on the English/Mathematics depth CSSE actually rewards. This is not a de-prioritisation; it is a hard filter at the recommendation layer, following the same "the domain map is the authority" logic AEP-002 §11 already established for readiness itself.

**Undecided families:** a family without a fixed target school (or explicitly choosing Custom Programme) should default to the broadest, most board-general core (Verbal Reasoning, Mathematics, English — the domains common to GL/CEM/ISEB, per §6) rather than being blocked from practising until a pathway is chosen — pathway selection should be strongly encouraged early, not mandatory before any use is possible.

**Evidence basis:** the domain-relevance filtering itself is a direct application of AEP-002 §6/§11 (Strong, public-record board structure); *how* a family is prompted to choose a pathway during onboarding is a UX/implementation decision with no independent pedagogical evidence claim.

---

## 4. Baseline Assessment

**A finding worth stating plainly:** based on the documents and code paths reviewed across this project's history, Angel does not currently appear to have a real baseline/diagnostic assessment at onboarding — a new learner proceeds directly into the dashboard and static content with no initial "getting to know you" signal captured. This is named here as an apparent gap, not asserted as fact beyond doubt — confirming it definitively would require checking `app/dashboard/page.tsx` and the onboarding flow directly, which is implementation verification, not architecture design, and is out of scope for this Discovery Wave document.

**Why a baseline matters, and how it must be designed if built:** without any starting signal, Angel's first recommendations to a brand-new learner are necessarily generic rather than personalised — the Learner Profile (`LEARNING_PROFILE_MODEL.md`) and every competency confidence band (AEP-002 §7) start genuinely empty. A baseline assessment would need to be short, low-stakes, and explicitly framed as *not* a test — per AEP-001 §2.9/§2.10, a new learner's very first experience of Angel must not be an anxiety-inducing diagnostic exam. It should feed initial confidence signals only, never produce a scored verdict shown to the child.

**Evidence basis:** the anxiety-avoidance framing is Strong, constitutional (AEP-001 §2.9/§2.10). The recommendation that a baseline assessment should exist at all is a design judgement responding to an observed gap, not itself a cited empirical finding — flagged accordingly.

---

## 5. Personalised Learning Journey

This is ALI's existing, working architecture — per-subject adaptive mock assembly, weak-skill override with a guaranteed minimum slot, cooldown-based spacing, and (design-only, not yet built) cross-subject recommendations and Learning Profile dimensions (`ADAPTIVE_ASSESSMENT_ENGINE_ARCHITECTURE.md`, `ALI_CROSS_SUBJECT_INTELLIGENCE.md`, `LEARNING_PROFILE_MODEL.md`) — cited as correct and unmodified. This document's contribution is ensuring personalisation operates strictly within the domains Pathway Selection (§3) has already filtered to — a CSSE learner's "personalised" journey should never surface Verbal Reasoning content no matter how confident the recommendation, because the filter in §3 sits upstream of personalisation, not downstream of it.

---

## 6. Daily Learning Cycle

The day-to-day loop already exists and is cited, not redesigned: `ALI_MISSION_ENGINE.md`'s urgency-ranked Daily Mission surfaces one clear next action (mirroring `ANGEL_MOMENTUM_FRAMEWORK.md`'s rule that the next action must be reachable in one tap from wherever the learner currently is) → the learner completes a session structured as the six-beat journey (§1) → completion writes back to competency signal, learning gain, and learner profile → the session ends with a forward pointer rather than a dead end, closing the exact "arrives and departs" gap `ANGEL_CONNECTED_LEARNING_JOURNEY.md` identified across every completion screen in the app → Parent Journey (§2) visibility updates.

**One momentum rule restated because it directly bounds this cycle:** per `ANGEL_MOMENTUM_FRAMEWORK.md`, momentum must never override honesty — a poor result never gets falsely cheerful praise. This document does not weaken that rule anywhere below, including in the Knowledge Maintenance reviews introduced in §9, which will sometimes correctly reveal that a previously "mastered" competency has decayed.

---

## 7. Practice and Retrieval

Angel's existing day-to-day sessions are, by design, retrieval practice — a question is answered, then the outcome is revealed, never passive re-reading (AEP-001 §2.1, Strong). This document confirms Practice (the day-to-day, ALI-personalised loop, §5–§6) is deliberately distinct from Assessment (§8, below) — the existing `/mocks` split into "Personalised Practice" and "Mock Exams" sections (`PRACTICE_NAVIGATION_RECOMMENDATION.md`) is the correct existing architecture for this distinction and is not redesigned here. Per `ANGEL_EXPERIENCE_MANIFESTO.md`'s Respect Familiar Educational Language principle, both terms ("Practice," "Mock Exam") are retained exactly as families already understand them.

---

## 8. Assessment Journey

Full timed mock exams (the existing GL/CEM/CSSE/ISEB static mocks, `MOCK_CONFIGS`) are where format-fluency (AEP-002 §11's third readiness dimension) must actually be trained, and this is where AEP-002's Real Gap #6 lives unresolved: **Angel's current mock structure is one fixed shape (sectioned by subject, generous per-section timing) regardless of which board a learner is preparing for**, even though §6 documents CEM's 6–12-minute strictly-timed sub-sections with no revisiting and ISEB's within-session difficulty adaptivity as genuinely different formats requiring genuinely different practice.

**This document names the target state without designing or building it:** a CEM-pathway learner's Assessment Journey should eventually include mock experiences with CEM's actual timing/sectioning pressure; an ISEB-pathway learner's should eventually include an experience where difficulty shifts within a single sitting, not only between mocks (which is what ALI's existing between-mock-only adaptivity, `ADAPTIVE_ASSESSMENT_ENGINE_IMPLEMENTATION_PLAN.md`'s deliberate decision, currently provides). This is flagged as a future, board-specific mock-format design task — out of scope to build in this Discovery Wave document, and a natural candidate for AEP-005 (Assessment Framework) to develop further.

**Evidence basis:** the specific timing/adaptivity structures per board are AEP-002 §6's ratings (Strong for structure, cited public sources); the recommendation that practice format should match target-exam format is a direct, defensible application of exam-specific realities (AEP-001's framing that exam technique/format familiarity is distinct from subject mastery) — Moderate, since it is reasoned from first principles rather than a specific cited study of format-matched 11+ preparation outcomes.

---

## 9. Knowledge Maintenance Model

**The core new architecture this document adds, per Programme Decision APD-004 item 2.**

### 9.1 Knowledge decay principles

Forgetting is expected, normal, and not a failure of either the learner or the product — the Ebbinghaus forgetting curve underlying AEP-001 §2.2's spacing-effect evidence describes exactly this: retention declines over time without deliberate revisiting, for every learner, regardless of how well material was originally learned. Angel's existing mastery model already reflects the *first* half of this insight correctly (mastery is revocable, one wrong answer demotes it) — this section extends the *second* half: a competency can decay silently, with no wrong answer ever recorded, simply because it hasn't been touched in a long time, and Angel currently has no mechanism to check for this, only to react to it after the fact if the learner happens to encounter that competency again.

### 9.2 Review scheduling

ALI's existing cooldown mechanism (question-count-based: Easy≈5, Medium≈10, Hard≈15, Challenge≈20+ intervening questions before a question can reappear, per `ALI_DECISION_LOG.md`) is a genuine, already-built spacing instrument (AEP-001 §2.2) — but it is tuned to prevent *short-term repetition within active practice*, not to schedule *long-term maintenance checks* on competencies a learner hasn't touched in weeks. This document recommends a conceptually distinct, longer-interval **Maintenance Review**: periodically resurfacing a small, genuine-retrieval sample from previously-mastered competencies that haven't been attempted recently, specifically to verify — not assume — that mastery still holds. This is a design recommendation, not a build; no new field, table, or schedule value is specified here.

### 9.3 Confidence-based revision

Which competencies receive a Maintenance Review, and how urgently, should be informed by AEP-002 §7's per-competency confidence bands and `LEARNING_PROFILE_MODEL.md`'s Consistency dimension (currently honestly `null` for lack of underlying timestamp data, per that document's own §1) — a competency mastered narrowly or inconsistently is a better candidate for an earlier maintenance check than one mastered with a strong, consistent evidence trail. Where the underlying signal doesn't exist yet (Consistency), this document does not pretend otherwise — the same honest-`null` discipline `LEARNING_PROFILE_MODEL.md` established is carried forward, not silently worked around.

### 9.4 Retrieval reinforcement

A Maintenance Review must be genuine unaided retrieval (AEP-001 §2.1) — a fresh question testing the same competency, not a passive re-showing of the original explanation or a "do you still remember this?" self-report. This directly follows §2.1's Strong evidence that recognition and recall are different skills, and only recall predicts real exam performance.

### 9.5 Transfer reinforcement

Per AEP-001 §2.12 (Learning Transfer Principle, constitutional) and AEP-002 §5's Transfer Map, a Maintenance Review of a competency need not always be a question in that exact competency — reinforcing `maths.fractions` via a `maths.percentages` or `numreason.percentages` question (a shared-mechanism link, AEP-002 §10) is itself legitimate reinforcement, and arguably stronger evidence of durable, transferable mastery than only ever revisiting the identical competency in isolation. This is the concrete mechanism by which the Learning Transfer Principle becomes something a learner actually experiences repeatedly over time, not a one-off connection made once and never revisited.

### 9.6 Long-term mastery — a new, additive distinction

This document proposes distinguishing **Mastered** (ALI's existing, unmodified `mastery_state`, evidenced across distinct sessions per `QUESTION_AUTHORING_STANDARD.md` §8) from **Durably Mastered** (a new, additive concept: mastery that has also survived at least one Maintenance Review after a genuine gap). This is not a redesign of `mastery_state` — a competency remains `mastered` in the existing sense throughout; Durable Mastery is an additional, optional evidence layer sitting on top, informing AEP-002 §11's Grammar School Readiness Definition (a Durably-Mastered competency is stronger readiness evidence than a recently-mastered, never-rechecked one) without altering the existing mastery mechanism's own behaviour or thresholds.

**Evidence basis, in full:** §9.1/§9.2/§9.4 are Strong (AEP-001 §2.1/§2.2, among the most replicated findings cited in this whole programme); §9.5 is Moderate-to-Strong depending on the specific transfer link's own rating (AEP-002 §12); §9.3's specific confidence-weighting mechanism and §9.6's Durably-Mastered distinction are this document's own design proposals — reasoned from the evidence above, but not independently validated findings in their own right, and named as such.

---

## 10. Learning Transfer Journey

§9.5 established transfer as a maintenance mechanism; this section states it as an experienced journey property in its own right, per AEP-001 §2.12's mandate that transfer be *explicitly taught*, not left to incidental overlap. When a learner demonstrates mastery of a competency with real, strong outbound transfer links (AEP-002 §10 — e.g. `maths.fractions`), the journey should, at some appropriate later point, surface a connected experience in a linked competency (`maths.percentages`, `maths.money`) — framed to the learner and parent as one connected story of growing skill, not as an abrupt, unexplained jump to unrelated content.

**This must respect two existing constraints, not create new tensions with them:** AEP-001 §2.8 (metacognitive scaffolding) means the *system* recognises and sequences this connection — a young learner is not asked to identify the transfer opportunity themselves; and `ANGEL_EXPERIENCE_MANIFESTO.md`'s Invisible Intelligence doctrine means the connection is *felt* ("this feels like something I already know how to do") rather than mechanistically explained ("this is a shared-mechanism relationship in our competency graph").

---

## 11. Confidence and Wellbeing

This section is the journey-level statement of AEP-001 §2.9 (exam anxiety, Strong, a hard ceiling) and §2.10 (Educational Safety Principle, constitutional, APD-002) — no feature anywhere in this journey, including the new Knowledge Maintenance reviews (§9) or Learning Transfer connections (§10), may increase anxiety in service of a short-term score or coverage gain. `ANGEL_MOMENTUM_FRAMEWORK.md`'s honesty rule (§6 above) and `ANGEL_EXPERIENCE_MANIFESTO.md`'s dread-avoidance principle are the existing, correct architecture for this and are not modified.

**One addition, tying Learning Independence into wellbeing directly:** AEP-002 §11.6's Learning Independence dimension is not only a readiness signal — a learner given more self-directed responsibility than their demonstrated maturity supports is a wellbeing risk (an overwhelmed learner, not a confident one), and one given less than their maturity supports risks the opposite failure (disengagement, per AEP-001 §2.7's autonomy need). The progressive, age-and-maturity-calibrated reduction of guidance §11.6 already specifies is therefore also a wellbeing design constraint, not only a readiness one — the two dimensions are read together, not independently.

---

## 12. Parent Intelligence

Building directly on `ALI_PARENT_INTELLIGENCE.md`'s existing four-bucket model (Strengths, Improving, Focus Next, Recently Mastered) and `ANGEL_EXPERIENCE_MANIFESTO.md`'s day/week/month horizons — both cited as the correct, unmodified foundation. Per Programme Decision APD-004 item 3, this document addresses six explicit elements:

| Element | Existing coverage | This document's contribution |
|---|---|---|
| Parent visibility | `ALI_PARENT_INTELLIGENCE.md`'s competency summaries | Confirmed as correct foundation; extended to include Durable Mastery (§9.6) as a future visible signal once built |
| Progress communication | Day/week/month horizons, `ANGEL_EXPERIENCE_MANIFESTO.md` | Confirmed unmodified |
| **Recommendation explanations** | **Not currently found anywhere in Angel's parent-facing surfaces** — the existing competency summaries show *state* ("Improving," "Focus Next") but not *why a specific next action was recommended* | **New, real gap named here.** A parent should be able to understand, in plain language, why Angel suggested a specific next activity — e.g. "we're suggesting more Percentages practice because your child's strong Fractions work suggests they're ready, and Percentages appears throughout [pathway]'s Maths paper" — grounded in AEP-002's Transfer Map (§5/§10) and Examination Application Map (§6), stated in outcome language, never mechanism language (no "confidence score," "mastery state," or "recommendation engine" — consistent with `ANGEL_EXPERIENCE_MANIFESTO.md`'s Invisible Intelligence doctrine, which governs explanation content just as strictly as it governs everything else parent-facing) |
| Confidence reporting | `LEARNING_PROFILE_MODEL.md`'s interpretation phrases (e.g. "Confident with words and language") | Confirmed as correct existing pattern for how *any* new confidence signal (including Durable Mastery) should eventually be phrased |
| Wellbeing considerations | `ANGEL_EXPERIENCE_MANIFESTO.md`'s Parent Confidence section | Extended per §11 above: a parent-facing signal should exist (in future design, not built here) if a learner shows honest signs of strain, consistent with never fabricating false cheerfulness |
| Educational transparency | Genuinely new emphasis this document adds | Parents should be able to trace *why* Angel believes something (a competency, a recommendation) is true back to real evidence (AEP-002 §9's Assessment Evidence standard) if they ask — transparency about the existence and soundness of evidence, still never transparency about the underlying mechanism itself |

**Evidence basis:** the existing four-bucket model and day/week/month structure are approved product design, not re-evaluated. The case for adding Recommendation Explanations is grounded in AEP-001 §2.5 (feedback specificity extends naturally to recommendation specificity) and `ANGEL_EXPERIENCE_MANIFESTO.md`'s own standing test ("does this make the parent feel more capable of helping their child") — Strong as a design rationale, though the specific feature does not exist yet and is named here as a recommendation for a future phase, not a build.

---

## 13. Grammar School Readiness Journey

AEP-002 §11's six-dimension Readiness Definition (Content Coverage, Competency Mastery, Examination Fluency, Transfer & Resilience, Confidence & Wellbeing, Learning Independence) is not a single end-state check performed once — it is the arc this entire journey builds toward, with each dimension's evidence accumulating differently over time:

- **Content Coverage** is largely settled early, by Pathway Selection (§3) filtering to the right domains from the start.
- **Competency Mastery** accumulates continuously through Practice (§7) and is verified against decay through Knowledge Maintenance (§9).
- **Examination Fluency** is built specifically through the Assessment Journey (§8), and only meaningfully late in preparation, once foundational mastery exists to be tested under real format pressure.
- **Transfer & Resilience** grows through the Learning Transfer Journey (§10) and through the honest, momentum-respecting handling of setbacks (§6, §11).
- **Confidence & Wellbeing** is monitored throughout, not just checked at the end — per §11, it is a permanent ceiling on every other dimension's pursuit, not a final box to tick.
- **Learning Independence** (AEP-002 §11.6) is explicitly the one dimension with its own temporal shape: low early (high system scaffolding for a younger or newer learner), increasing as maturity and evidenced independence grow — this dimension's *trajectory*, not a fixed target level, is what the journey should track.

---

## 14. Continuous Improvement Loop

Distinct from the learner's own Knowledge Maintenance (§9): this is Angel-the-product's own loop for keeping its knowledge architecture current. This document does not invent new mechanisms here — it names the ones AEP-002/AEP-003 already established as the correct architecture for this purpose: `CURRICULUM_GAP_REGISTER.md` (new gaps recorded as found, e.g. GAP-001 Probability), AEP-003 §14's "Flagged for Review" lifecycle stage (a question whose real usage data contradicts its own metadata gets surfaced for human review, never silently trusted forever), and AEP-002 §12's Educational Evidence Ratings (claims are revisited and re-rated once real programme materials migrate into `docs/research/`, per AEP-002's own recommendation). Continuous improvement, in this architecture, means real evidence is allowed to correct prior assumptions — the same "prefer real evidence over inference" discipline this entire project has held since its earliest ALI decisions, now stated as a permanent product-level loop rather than a one-off methodological choice.

---

## 15. Educational Outcome

*(Required section per AEP-001 §8.)*

**Understanding:** this document connects Angel's already-correct UX journey design (Manifesto, Momentum, Connected Learning Journey) to the pedagogical evidence base (AEP-001) and knowledge architecture (AEP-002/AEP-003) for the first time in one place — a future journey decision can now be checked against both "does this feel right" and "does this work, and why" simultaneously, rather than the two considerations living in separate documents with no explicit bridge.

**Confidence:** Pathway Selection (§3) resolving the CSSE-targeting gap and the new Recommendation Explanations concept (§12) both directly serve a parent's ability to trust that Angel understands their child's specific situation, not a generic one — the exact standard `ANGEL_EXPERIENCE_MANIFESTO.md` already set for what "informed enough to make a real decision" means.

**Examination performance:** the Assessment Journey's identification of the format-fluency gap (§8, naming AEP-002 Real Gap #6 for AEP-005 and a future implementation phase to resolve) and the Knowledge Maintenance Model (§9) together ensure a learner's practised competencies are both retained over the full preparation timeline and, once that future work is done, eventually tested in a format resembling the real exam — the two failure modes ("forgot it by exam day" and "knew it but the real exam's format threw them") this document explicitly targets.

**Long-term learning:** the Learning Transfer Journey (§10) and Durable Mastery (§9.6) both extend Angel's value beyond a single exam sitting — competencies reinforced across contexts and verified to survive a genuine gap are the concrete mechanism by which "long-term learning," not just "passed the test," becomes something this architecture can actually evidence.

---

No implementation follows from this document directly. It is delivered for Founder review and approval before AEP-005 proceeds.
