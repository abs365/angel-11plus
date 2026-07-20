# AEP-001: Grammar School Learning Science Constitution

**Document ID:** AEP-001
**Programme:** Angel Excellence Programme — Discovery Wave (Document 1 of 5)
**Status:** APPROVED (approved 2026-07-18; amended same day per APD-002 — see Amendment Record below)
**Project:** Angel 11+
**Owner:** ELBOLD
**Last Updated:** 2026-07-18
**Amendment Record:** APD-002 (2026-07-18) — added §2.10 Educational Safety Principle, §2.11 Intellectual Curiosity Principle, §2.12 Learning Transfer Principle, and §8 Documentation Governance. Additive only — no prior section rewritten, renumbered, or simplified. Status remains APPROVED as amended.
**Frozen (APD-007, 2026-07-18):** Version 1.0 Educational Architecture. Future changes require a defect correction, new educational evidence, or a formal programme decision — not a routine edit.

**Purpose:** This is the permanent, constitutional statement of the cognitive and educational science Angel's every future pedagogical decision must be tested against — what content to build, how questions are sequenced, how difficulty adapts, how feedback is delivered, and how progress is measured. It sits alongside `docs/strategy/ANGEL_EXPERIENCE_MANIFESTO.md` as a second permanent pillar: the Manifesto governs how Angel should *feel*; this document governs whether Angel actually *works* — whether it measurably improves a child's chance of gaining a grammar school place. Neither document overrides the other. If a future feature satisfies one and violates the other, that is a design failure requiring rework, not a trade-off to accept.

---

## 0. How to Use This Document

Before any future Angel document, feature, or content decision ships, it must be able to answer: *"What evidence says this improves this child's chance of success, and how strong is that evidence?"* If the honest answer is "none, it just seemed reasonable," the decision needs to be revisited against the evidence base below before it proceeds.

Every principle in this document is tagged with an **Evidence Strength** rating, used consistently with this account's existing validation discipline:

| Rating | Meaning |
|---|---|
| **Strong** | Multiple independent meta-analyses, consistent effect sizes, replicates across settings including children/school-age samples |
| **Moderate** | Good evidence exists but is domain-limited, effect-size-modest, or drawn mostly from adult/undergraduate studies not yet fully validated in 8–11-year-olds |
| **Contested** | Popular and intuitive, but recent meta-analyses and re-analyses have found the evidence weaker than commonly claimed — included here specifically to prevent Angel from overclaiming it |

This mirrors AEP-002 through AEP-005's obligation to cite this constitution as their evidence foundation rather than re-deriving learning-science claims independently — one evidence base, applied consistently across all five documents.

**A note on evidence provenance:** the principles below are grounded in publicly available academic and practitioner research, current as of this document's writing. The official CSSE, GL Assessment, CEM, and ISEB papers and marking-scheme analysis referenced in the Discovery Wave's founding brief exist in prior programme working papers and have not yet been migrated into this repository. Where a claim in this document or in AEP-002–005 would benefit from that exam-specific evidence, it is marked **"Repository evidence pending migration from programme working papers"** rather than asserted without a source. AEP-002 formally recommends a `docs/research/` evidence library to give that material a permanent home once migrated.

---

## 1. Why a Learning Science Constitution, and Why Now

Angel has, to date, built real pedagogical infrastructure — the ALI adaptive engine, question difficulty tiers, mastery states, spaced cooldowns — largely from product intuition and sound but informal reasoning (see `ADAPTIVE_ASSESSMENT_ENGINE_ARCHITECTURE.md`, `QUESTION_AUTHORING_STANDARD.md`). That intuition has mostly landed in the right place. This document exists to replace "mostly landed in the right place, informally" with an explicit, citable, permanent standard — so every future decision about content, sequencing, difficulty, and feedback can be checked against real evidence rather than re-argued from first principles each time, and so gaps between Angel's current design and the evidence base are found and named rather than assumed away.

This is a Discovery Wave document: no code changes, no feature redesigns, no new questions. It exists purely to establish the evidence foundation the next four documents (AEP-002 Knowledge Framework, AEP-003 Question Intelligence, AEP-004 Learning Journey, AEP-005 Assessment) will build on.

---

## 2. The Core Evidence Base

### 2.1 Retrieval Practice (the Testing Effect) — **Strong**

Actively recalling information from memory — being asked a question and producing the answer — produces substantially stronger, more durable learning than re-reading or reviewing the same material passively. This is one of the most replicated findings in cognitive psychology (Roediger & Karpicke's foundational studies, reaffirmed across subsequent meta-analyses), and it holds specifically for school-age children, not only adults.

**Why this improves a child's chances of success:** an 11+ exam is, mechanically, a single-sitting retrieval event held months after most content was first taught. A child who has only ever *reviewed* material (re-read a worked example, watched a strategy explained) has practised the wrong skill — recognition, not recall under pressure. Every Angel practice session is, correctly, already structured as retrieval (answer, then find out if you were right) rather than review — this constitution formalises that this is not incidental, it is the single most load-bearing pedagogical decision in the product, and no future feature should regress it toward passive review (e.g., "watch this explained" content that isn't followed by the child producing an answer unaided).

### 2.2 Spacing Effect / Spaced Retrieval — **Strong**

Material revisited after a *gap* — rather than massed together in one sitting — produces better long-term retention than the same amount of practice compressed into one session, and this effect strengthens when spacing is combined with retrieval (a "spaced retrieval" schedule) rather than either technique alone.

**Why this improves a child's chances of success:** a grammar school exam does not test what a child practised yesterday; it tests what they can still produce months later. A child drilled intensively on fractions for one week and never revisited will typically underperform a child given the same total practice volume spread across many weeks with deliberate revisits. This directly validates ALI's existing between-mock cooldown/anti-repetition design (`lib/ali/selection.ts`) as evidence-aligned, not merely a data-hygiene mechanism — but it also means cooldown windows should be understood as a *spacing instrument*, and any future tuning of cooldown length should be justified against spacing-effect research, not only against "avoid repeats" logic.

### 2.3 Interleaving — **Moderate, subject-dependent**

Mixing question types/topics within a practice session (rather than blocking all practice of one topic together) produces worse *immediate* performance but meaningfully better *delayed* performance — the seminal Rohrer & Taylor finding that interleaved maths students scored lower on the practice sheet itself but more than doubled blocked-practice students on a delayed test. A comprehensive 2019 meta-analysis (Brunmair & Richter, 59 studies) found this effect strongest for visual category learning and for **mathematics** specifically (moderate effect size), with more mixed and inconsistent results outside those domains.

**Why this improves a child's chances of success:** an exam paper does not announce "this is a fractions question" before it — determining *which* method applies is itself part of the tested skill (this is explicit for CEM's mixed-question-type format and implicit in every unseen exam paper regardless of board). A child drilled exclusively in topic-blocked sets learns to apply a method when told which one to use; the exam requires selecting the right method *unprompted*. Given the subject-dependency of this evidence, this constitution directs: interleaving should be prioritised for Maths and reasoning-type content, where the evidence is strongest, and applied more cautiously to English/comprehension content, where the evidence base is thinner — this is a concrete, evidence-driven refinement AEP-003 should carry forward, not a uniform rule to apply everywhere.

### 2.4 Cognitive Load Theory & Worked Examples — **Strong**

Working memory has a small, fixed capacity, and instruction that overloads it (too many new elements at once, poorly signposted problems, split attention across disconnected sources of information) measurably impairs learning regardless of a child's underlying ability. Sweller's cognitive load theory and the associated worked-example effect (novices learn a new procedure faster from a fully worked example than from solving the equivalent problem unaided) are among the most robustly supported findings in instructional design, and Rosenshine's *Principles of Instruction* — itself an explicit synthesis of cognitive load theory, cognitive science, and observation of effective teachers — operationalises this into concrete guidance: review previous learning at the start of a session, present new material in small steps, provide models before independent practice, and check for understanding at every step rather than in a single end-of-session test.

**Why this improves a child's chances of success:** an 8–11-year-old's working memory capacity is meaningfully smaller than an adult's, and 11+ content (multi-step maths word problems, unfamiliar non-verbal reasoning conventions, long comprehension passages) is exactly the kind of content prone to overload if introduced badly. This is the direct evidentiary basis for a principle already implicit in Angel's synthetic-fixture design (a worked example or clear model *before* a child is asked to produce an answer unaided on genuinely new question types) and should be made explicit and deliberate in AEP-003/AEP-004 rather than left as an unstated convention.

### 2.5 Feedback Timing and Specificity — **Strong**

Hattie's synthesis work across decades of education research consistently ranks feedback among the highest-leverage influences on achievement — but only feedback that is specific, timely, and actionable; vague or purely evaluative feedback ("well done," "wrong") has near-zero effect on its own. Feedback that names *what* was done well or wrong and *what to do differently* is what drives improvement.

**Why this improves a child's chances of success:** a child who is told "73%" learns nothing about what to do next; a child told "you're getting number-code questions right but hidden-word questions wrong three sessions running" knows exactly what to practise. This is the direct evidentiary grounding for ALI's existing competency-named Daily Mission reasoning and Parent Intelligence summaries (`ALI_MISSION_ENGINE.md`, `ALI_PARENT_INTELLIGENCE.md`) — this constitution formalises that naming specific competencies rather than raw scores is not a UX nicety, it is the single feature of feedback design with the strongest evidence behind it, and any future simplification of feedback back toward a bare percentage would be a regression against this evidence, not a neutral design choice.

### 2.6 Growth Mindset — **Contested; use with an explicit caveat**

Popular belief holds that teaching children their intelligence can grow through effort ("growth mindset") substantially improves achievement. The evidence has not held up under scrutiny: a 2020 re-analysis of Dweck's own foundational studies (Burgoyne, Hambrick & Macnamara) found core claims unsupported by the underlying data and effect sizes considerably weaker than originally reported; subsequent meta-analyses (Macnamara & Burgoyne, 2023, and others reviewing 63+ studies) found overall effects on academic achievement that were weak or failed to reach significance for typical learners, with only modest, inconsistent evidence of benefit concentrated in lower-achieving or disadvantaged students specifically. A 2024 analysis of PISA 2022 data across 73 countries found growth mindset explained at most ~3% of the socioeconomic gap in achievement — far short of claims that mindset messaging can meaningfully offset disadvantage.

**Why this matters for a child's chances of success — and why the caveat matters as much as the principle:** this constitution deliberately does **not** recommend growth-mindset messaging, slogans, or framing as a pedagogical intervention in its own right — the evidence does not support it doing the work often claimed for it, and Angel should not build features whose stated justification is "this instils a growth mindset." What *does* have strong, separate evidence is **effort-specific feedback** (§2.5) — noticing and naming a genuine attempt at a hard problem, distinct from the broader "intelligence can grow" belief-change claim. `ANGEL_EXPERIENCE_MANIFESTO.md`'s existing principle "Celebrate effort, not only achievement" is retained and endorsed by this constitution — but on the basis of feedback-specificity evidence (§2.5), not growth-mindset evidence. This is a deliberate correction worth being explicit about: the Manifesto's instinct was right, and this constitution grounds it in the stronger of the two evidence bases rather than the popular but weaker one.

### 2.7 Self-Determination Theory & Intrinsic Motivation — **Moderate-to-Strong**

Deci & Ryan's self-determination theory, and the substantial body of research building on it, finds that sustained motivation depends on three needs being met: **autonomy** (a sense of choice, not just compliance), **competence** (a genuine, evidenced sense of getting better), and **relatedness** (feeling the effort matters to someone). Motivation built on external pressure or loss-aversion (streaks, fear of falling behind) reliably produces short-term compliance but measurably undermines the intrinsic motivation needed for sustained, voluntary engagement — exactly the "children study to avoid punishment rather than because they want to" failure mode this literature predicts and warns against.

**Why this improves a child's chances of success:** 11+ preparation typically spans many months; a child who practises because they're anxious about a broken streak will disengage the moment the pressure lifts (or burn out before the exam), while a child whose motivation is autonomy- and competence-based sustains practice voluntarily over the full runway needed for spacing (§2.2) to actually work. This is the direct evidentiary basis for `ANGEL_MOMENTUM_FRAMEWORK.md`'s existing rule that "ALI does not create momentum, ALI informs momentum" and its explicit rejection of loss-aversion mechanics — this constitution confirms that instinct was evidence-aligned, not just philosophically appealing, and extends it: competence-signals must be genuine (an evidenced skill gain, per §2.5), not manufactured (a badge for volume alone), because manufactured competence-signals are exactly the pattern this literature shows erodes trust and long-term motivation once a child notices the signal doesn't track real improvement.

### 2.8 Metacognition and Self-Regulated Learning — **Moderate, developmentally constrained**

Teaching learners to monitor their own understanding, plan their approach, and evaluate their performance ("metacognitive" strategies) improves outcomes — but the research on *when* children can do this unaided is important and frequently overlooked: metacognitive capacity develops through middle childhood and is not yet reliably independent in most 8–11-year-olds. Children in this age range benefit from metacognitive *scaffolding* (a teacher or system doing some of the monitoring and prompting for them) far more than from being asked to self-regulate unaided, which is a reasonable expectation of a teenager but not reliably of an 8-year-old.

**Why this improves a child's chances of success:** this is a direct caution against a plausible-sounding future feature — e.g., asking a child to self-rate their own confidence before answering, or to independently choose what to practise next — without first checking whether an 8–11-year-old can do that reliably. The evidence says: scaffold it (Angel's system does the monitoring, e.g., ALI silently tracking mastery state and surfacing what to do next), don't delegate it to the child and call it "building independence." This directly reinforces the Experience Manifesto's Invisible Intelligence doctrine from the *pedagogical* side, not only the UX side: young children genuinely benefit more from a system that quietly manages this than from being asked to manage it themselves.

### 2.9 Age-Appropriate Exam Anxiety — **Strong, and a hard constraint on all of the above**

Direct UK research on grammar school selection is consistent and concerning: surveyed children report loss of sleep and appetite, anxiety, and school avoidance around the 11+; the large majority of surveyed pupils believe the process is bad for them, and a large majority of teachers report a significant negative mental health impact. Separately, the underlying psychological finding — moderate challenge improves performance, but high anxiety measurably impairs it, and children who perform best arrive "confident, capable, and relatively calm" — is well established and directly explains *why* every principle above only works within an anxiety envelope the product must actively protect.

**Why this is a hard constraint, not just another principle:** every technique above (retrieval practice, desirable difficulty, interleaving) works *because* it introduces productive difficulty — but the same research base that supports desirable difficulty also warns that difficulty tips from productive to counter-productive once it crosses into anxiety. This is not a tension to manage case-by-case; it is a permanent ceiling: **no future feature justified by "the evidence says harder is better" may be shipped without also checking it against this section.** This is the direct evidentiary grounding for `ANGEL_EXPERIENCE_MANIFESTO.md`'s "before opening the app, a child should feel neutral-to-curious, never dread" — that UX principle and this cognitive-science constraint are the same finding, described from two different documents, and they must never be allowed to drift apart.

### 2.10 Educational Safety Principle — **Constitutional (APD-002)**

**No feature may increase learner anxiety simply because it improves short-term scores.** Angel exists to develop capable learners, confident learners, and resilient learners — in that order of permanence, since capability and confidence outlast any single exam and resilience is what lets a child recover from the inevitable bad session. This principle overrides all educational optimisation decisions: a technique that would raise mock-exam scores by 5% while measurably increasing dread, avoidance, or anxiety does not ship, regardless of the score gain.

**Why this improves a child's chances of success:** this is not a softening of §2.9's evidence — it is §2.9 promoted from a strong empirical finding to a non-negotiable constitutional constraint, because a score gain purchased with anxiety is self-defeating on the exam's own terms (§2.9: high anxiety measurably impairs the very performance it was meant to improve). A child who scores marginally higher on practice mocks but arrives at the real exam anxious rather than "confident, capable, and relatively calm" has been optimised in the wrong direction entirely.

### 2.11 Intellectual Curiosity Principle — **Constitutional (APD-002)**

Angel shall occasionally introduce carefully designed activities that extend beyond the examination specification — logical investigations, mathematical puzzles, vocabulary exploration, pattern discovery, "what happens if" investigations — whose purpose is to develop reasoning, curiosity, and independent thinking, not to teach examination content directly.

**Why this improves a child's chances of success:** this is a deliberate, bounded exception to exam-specific efficiency, justified on two separate grounds. First, motivationally: self-determination theory (§2.7) identifies autonomy and genuine interest as drivers of sustained engagement, and curiosity-driven activity with no test attached is one of the purest available sources of that autonomy inside an otherwise exam-focused product. Second, cognitively: reasoning and pattern-recognition capacity built through open-ended exploration plausibly transfers back into the exam's own reasoning demands (§2.3's interleaving evidence and §2.11's sibling principle, §2.12 below, both rest on the same transfer logic) — but this second justification is offered as a plausible mechanism, not a proven one, and should be tagged **Moderate** evidence strength if cited in a future document, not Strong. These activities must never be reframed as disguised exam content; the moment a "what happens if" investigation is quietly repurposed to drill a specification topic, it has stopped being this principle and should be classified and evaluated as ordinary exam practice instead.

### 2.12 Learning Transfer Principle — **Constitutional (APD-002)**

Angel shall explicitly teach transfer of learning: knowledge learned in one context must be deliberately reinforced in other contexts where the same underlying structure recurs, rather than left as an isolated, single-context skill. The illustrative chain given in APD-002 — Fractions → Money → Ratio → Percentages → Probability — is exactly this kind of deliberate connection: a proportional-reasoning structure that recurs across five surface-different topics, each of which is normally taught (and normally practised) as if it were unconnected to the others.

**Why this improves a child's chances of success:** this is a direct, constitutional extension of the shared-mechanism relationship already evidenced in `ALI_CROSS_SUBJECT_INTELLIGENCE.md` §1.1 and in the interleaving evidence at §2.3 above — a child who has only ever practised fractions-as-fractions has a narrower, more brittle skill than one who has practised the same proportional-reasoning structure across money, ratio, percentages, and probability, because an unseen exam question rarely announces which topic label it belongs to. Explicitly teaching transfer, rather than hoping it occurs incidentally, is the constitutional mandate this principle adds; AEP-002's Learning Transfer Map and Cross-Subject Relationships sections are the concrete architecture this principle requires.

---

## 3. A Necessary Honesty: Most of This Evidence Was Not Generated on 8–11-Year-Olds

A meaningful proportion of the strongest cognitive science evidence above (retrieval practice, spacing, interleaving, cognitive load) originates from studies of undergraduates and general adult learners, not specifically from children in the 8–11 age band Angel serves. Where school-age replications exist (Rosenshine's classroom-observation base, Rohrer & Taylor's middle-school maths interleaving study, UK-specific 11+ anxiety research), they are called out explicitly above as the stronger form of evidence. Where a principle rests primarily on adult-study evidence, this constitution treats it as **directionally correct but requiring developmental judgement in application** — not as license to import an adult study's exact parameters (spacing intervals, difficulty calibration) uniformly onto an 8-year-old's practice schedule. AEP-003 (Question Intelligence) and AEP-004 (Learning Journey) must each make this developmental-appropriateness check explicit wherever they translate a principle from this section into a concrete rule (a specific cooldown length, a specific difficulty curve), rather than silently assuming adult-study parameters transfer unchanged.

---

## 4. What This Constitution Prohibits

- **No growth-mindset messaging or slogans presented as a pedagogical intervention.** Effort-specific feedback (§2.5) is retained and encouraged; generic "you can do anything if you believe" framing is not, because the evidence does not support it doing the claimed work (§2.6).
- **No loss-aversion or streak-shaming mechanics justified as "motivation science."** Self-determination theory (§2.7) predicts these undermine exactly the sustained, voluntary engagement an 11+ preparation timeline requires. This affirms, and now grounds in evidence, `ANGEL_MOMENTUM_FRAMEWORK.md`'s existing rule.
- **No uniform interleaving or spacing rule applied identically across all subjects** without checking §2.3's subject-dependency — Maths and reasoning content have stronger interleaving evidence than English/comprehension content.
- **No feedback that reports a bare score without naming a specific, actionable competency** (§2.5) — this is the single most evidence-backed feedback design choice available, and no future simplification should trade it away for a cleaner-looking number.
- **No feature that asks an 8–11-year-old to self-regulate a decision** (what to practise, how confident they feel, when to stop) **without first scaffolding it**, per §2.8 — metacognitive independence cannot be assumed at this age.
- **No difficulty increase, however well-evidenced as a "desirable difficulty," that is introduced without checking §2.9's anxiety ceiling.** Productive struggle and counter-productive anxiety are separated by a real line, and the child-wellbeing evidence in §2.9 takes precedence over the learning-efficiency evidence in §2.2–2.4 whenever the two are in tension.
- **No claim in AEP-002 through AEP-005 that a pedagogical decision is "evidence-based" without an Evidence Strength rating**, consistent with the ratings used in Section 2 above.
- **No feature that raises a short-term score at the cost of measurably increased learner anxiety** (§2.10) — this is a constitutional override, not a case-by-case trade-off judgement.
- **No curiosity/enrichment activity (§2.11) silently repurposed as disguised exam-specification drilling** — if its real function is teaching exam content, it must be classified and evidence-rated as ordinary exam practice, not credited with the Intellectual Curiosity Principle's separate justification.
- **No topic taught and assessed in exactly one context when a genuine shared-mechanism transfer opportunity exists** (§2.12) — AEP-002's Learning Transfer Map is the required mechanism for identifying and acting on these, not an optional enrichment.

---

## 5. Relationship to Existing Angel Documents

This constitution does not replace or compete with any existing Angel strategy document — it supplies the pedagogical evidence layer underneath decisions those documents already made on sound instinct:

- **`ANGEL_EXPERIENCE_MANIFESTO.md`** — its UX philosophy (dread-avoidance, effort-celebration, invisible intelligence) is independently confirmed by §2.5, §2.6, §2.8, and §2.9 of this document. No conflict found; this constitution adds *why*, not a different *what*.
- **`ANGEL_MOMENTUM_FRAMEWORK.md`** — its rejection of loss-aversion mechanics is confirmed by §2.7. No conflict found.
- **`ADAPTIVE_ASSESSMENT_ENGINE_ARCHITECTURE.md` / `lib/ali/*`** — its cooldown/anti-repetition design is confirmed by §2.2 as a spacing instrument, and its competency-named mission/parent-report design is confirmed by §2.5. No conflict found.
- **`QUESTION_AUTHORING_STANDARD.md`** — its difficulty-tier system is compatible with §2.4/§2.9 but has not yet been explicitly checked against the interleaving subject-dependency finding in §2.3; this is flagged as a specific, concrete item for AEP-003 to address, not a defect in the existing standard.

No existing Angel document is found to conflict with the evidence in this constitution. Where a future decision does create tension between this document and another, this document's evidence and the Manifesto's UX philosophy are co-equal and neither wins by default — the tension itself is the signal that the decision needs more thought, exactly as the Manifesto's own "Nothing ships that a parent can't fully trust... these are not in tension by default" principle already states.

---

## 6. Evidence Register (Sources)

- Roediger & Karpicke — foundational testing-effect research; synthesised in [Evidence Based Education: Retrieval and Spaced Practice](https://evidencebased.education/resource/retrieval-and-spaced-practice-study-strategies-that-must-be-combined/)
- Ebbinghaus forgetting curve, spacing effect, spaced-retrieval synthesis — [Spaced Repetition and Retrieval Practice: Efficient Learning Mechanisms from a Cognitive Psychology Perspective](https://journals.zeuspress.org/index.php/IJASSR/article/view/425)
- Rohrer & Taylor interleaving study; Brunmair & Richter (2019) 59-study meta-analysis — summarised in [Structural Learning: Desirable Difficulties](https://www.structural-learning.com/post/desirable-difficulties) and [Durrington Research School: Bjork's Desirable Difficulties](https://researchschool.org.uk/durrington/news/bjorks-desirable-difficulties)
- Interleaving systematic review — [Firth et al. (2021), Review of Education, Wiley](https://bera-journals.onlinelibrary.wiley.com/doi/10.1002/rev3.3266)
- Sweller cognitive load theory; Rosenshine's Principles of Instruction — [Structural Learning: Rosenshine's Principles](https://www.structural-learning.com/post/rosenshines-principles-a-teachers-guide), [InnerDrive: The Cognitive Science behind Rosenshine's Principles](https://www.innerdrive.co.uk/blog/cognitive-science-rosenshine/), [Third Space Learning: Applying Rosenshine's Principles in Maths](https://thirdspacelearning.com/blog/rosenshine-principles/)
- Hattie feedback synthesis — referenced via Rosenshine/cognitive-science secondary sources above (direct Visible Learning citation to be added when programme working papers are migrated)
- Growth mindset re-analysis and meta-analyses — [Burgoyne, Hambrick & Macnamara re-analysis, summarised in Structural Learning: Growth Mindset](https://www.structural-learning.com/post/growth-mindset-what-research-actually-shows); [Macnamara & Burgoyne (2023) systematic review and meta-analysis, PDF](https://artscimedia.case.edu/wp-content/uploads/sites/141/2020/06/26110416/Macnamara-Burgoyne-2023.pdf); [commentary on meta-analytic heterogeneity, PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10495100/); [PISA 2022 73-country growth mindset/SES analysis, PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12635329/)
- Self-determination theory (Deci & Ryan) — foundational theory; direct primary-source citation to be added when programme working papers are migrated
- UK 11+/grammar school exam anxiety research — [Comprehensive Future: Research about the 11-plus and pupil mental health](https://comprehensivefuture.org.uk/research-about-the-11-plus-and-pupil-mental-health-and-wellbeing/), [Atom Learning: 11+ exam pressure](https://www.atomlearning.com/blog/11-plus-exam-pressure), [Mentally Healthy Schools: Academic and exam stress](https://www.mentallyhealthyschools.org.uk/factors-that-impact-mental-health/school-based-risk-factors/academic-and-exam-stress/)

**Gap, stated honestly:** several claims above (Hattie's direct effect-size figures, Deci & Ryan's original primary sources, and any CSSE/GL/CEM/ISEB-specific pedagogical analysis) currently rely on secondary summaries found via public web search rather than primary citation, because the primary programme working papers referenced in the Discovery Wave brief have not yet been migrated into this repository. This is recorded here as an explicit open item for the `docs/research/educational-science/` library AEP-002 recommends, not smoothed over.

---

## 7. What Comes Next

This constitution is the evidence foundation for the remaining four Discovery Wave documents:

- **AEP-002 (Grammar School Knowledge Framework)** applies this evidence to the specific content and skills required by CSSE, GL Assessment, CEM, and ISEB.
- **AEP-003 (Question Intelligence Framework)** applies §2.3 (interleaving), §2.4 (cognitive load/worked examples), and §2.9 (anxiety ceiling) to how Angel selects, sequences, and calibrates individual questions.
- **AEP-004 (Learning Journey Framework)** applies §2.2 (spacing), §2.7 (motivation), and §2.8 (metacognitive scaffolding) to how a child's journey through content is structured over weeks and months.
- **AEP-005 (Assessment Framework)** applies §2.1 (retrieval/testing effect), §2.5 (feedback), and §2.9 (anxiety) to how mock exams and readiness are designed and reported.

No implementation follows from this document directly. It is delivered for Founder review and approval before AEP-002 proceeds.

---

## 8. Documentation Governance (Amendment — APD-002)

**Every future educational document produced under the Angel Excellence Programme — AEP-002 onward, and any educational document after it — must contain a section titled "Educational Outcome"** explaining how the proposal improves: understanding, confidence, examination performance, and long-term learning. A document lacking this section is incomplete and must not be treated as approved, regardless of how otherwise thorough it is. This governance rule is itself an application of §0's standing test ("what evidence says this improves this child's chance of success") — the Educational Outcome section is that test made a mandatory, checkable part of every document's structure rather than an implicit expectation.
