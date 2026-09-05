# Angel 11+ — Educational Readiness Scorecard

**Prepared:** 2026-09-05. Synthesises every document produced under this assignment into one scorecard and one set of evidence-derived content-depth targets. Per the Founder's own explicit standard, this scorecard is not optimised to make Angel look good — every rating below is sourced to a specific document/section, and a low rating is recorded as found.

---

## 1. Readiness Scorecard

| Dimension | Rating | Evidence |
|---|---|---|
| Content existence (raw rows) | **ADEQUATE** | 558 total active rows, 351 practice-eligible, 127 mock-eligible — substantial, not uncertain (`ANGEL_EDUCATIONAL_CONTENT_INVENTORY.md` §1) |
| Content depth (genuine family diversity) | **WEAK** | 74 Mathematics families, 51 with only 2-4 rows; no family concept exists for English at all (`ANGEL_QUESTION_DEPTH_AND_REPETITION_AUDIT.md` §2-3) |
| Sustained-use capacity | **NOT READY** | Every tested realistic usage pattern (20-30/day, 5-7 days/week) exhausts fresh content in days, not weeks, at any duration from 4-26 weeks (`ANGEL_QUESTION_DEPTH_AND_REPETITION_AUDIT.md` §8) |
| Anti-memorisation safety | **HIGH RISK** (rising to CRITICAL for frequent users) | Structural, not incidental — driven by family-pool thinness, not a flaw in the retention engine (`ANGEL_QUESTION_DEPTH_AND_REPETITION_AUDIT.md` §6) |
| Practice/Mock content firewall | **STRONG** | DB-enforced, test-proven, twice independently re-confirmed this session (`ANGEL_MOCK_DEPTH_AND_SECURITY_AUDIT.md` §3-4) |
| Mock inventory | **THIN** | Exactly 2 complete Mocks (one per subject), no Writing/VR/NVR Mock, reserve insufficient to assemble a second Mathematics sitting (`ANGEL_MOCK_DEPTH_AND_SECURITY_AUDIT.md` §1-2) |
| Year 4/5/6 differentiation | **NOT IMPLEMENTED** | No content, selection, or Mock-access gate reads year/preparation-stage at all; the engine exists but is wired to nothing (`ANGEL_YEAR_4_5_6_COVERAGE_MATRIX.md`) |
| Pathway coverage vs. marketing | **MATERIALLY MISALIGNED** | 100% CSSE, 0% every other pathway `lib/pathways.ts` advertises to parents (`ANGEL_EDUCATIONAL_CONTENT_INVENTORY.md` §3) |
| Content governance foundation | **BUILT, UNWIRED** | Seven real modules for duplicate detection, inventory classification, and freshness exist with zero live call sites (`ANGEL_QUESTION_SUPPLY_ARCHITECTURE.md` §2) |
| Question supply mechanism | **MANUAL ONLY** | 100% hand-authored SQL migrations; zero parametric/generative/candidate infrastructure of any kind exists (`ANGEL_QUESTION_SUPPLY_ARCHITECTURE.md` §1, `ANGEL_QUESTION_FACTORY_SPECIFICATION.md`) |
| Scoring/analysis/release pipeline integrity (Reading Mock) | **PROVEN SOUND** | This session's own Increment 025 work: a real production defect found and fixed, manual-marking and release governance built and used, "unanswered" classification mechanism traced end-to-end and found structurally clean (`INCREMENT025_PROGRAMME_COMPLETION_EVIDENCE.md`) |
| Competitive positioning | **DEFENSIBLE, NOT YET PROVEN** | CSSE-specialism and provable diagnostic honesty are both currently-uncontested, evidenced opportunities — contingent on Angel's own content depth and reporting integrity actually holding up, which items above show is only partly true today (`ANGEL_SELECTIVE_PREP_COMPETITOR_BENCHMARK.md` §10) |

## 2. Content-Depth Targets

Derived from the real family-size distribution and usage modelling above, not chosen to match a competitor's marketing number, per the Founder's explicit instruction. Stated as tiers because a single point target would misrepresent how much genuine uncertainty remains (English has no measurable baseline at all).

| Tier | Families per subject | What it achieves | Basis |
|---|---|---|---|
| **Minimum Viable** | 100-120 (Mathematics: +26-46 from today's 74) | Raises family-fresh exhaustion at the Founder's own tested moderate intensity (20/day × 5 days = 100/week) from ~4-5 days to roughly 1-2 weeks — still short of a 4-week window, but a materially honest improvement over today, and the smallest change that meaningfully moves the needle | Direct extrapolation of `ANGEL_QUESTION_DEPTH_AND_REPETITION_AUDIT.md` §8's own exhaustion arithmetic |
| **Strong** | 150-220 per subject | Matches the existing Capacity Audit's own §20 target range (150-280), sufficient for family-fresh exhaustion to clear a 4-week window at moderate intensity without relying solely on spaced resurfacing | `ANGEL_EDUCATIONAL_CAPACITY_AUDIT.md` §20 |
| **Premium** | 220-280+ per subject, with ≥15-25 variants/family | Sufficient for the highest-intensity Founder-named scenario (30/day × 7 days = 210/week) to clear a 12-week window on fresh content alone, reserving spaced resurfacing for genuine retention practice rather than disguised necessity | Existing Capacity Audit §20, re-validated against this pass's own scenario set |

**English requires a family concept to exist and be persisted before any tier target is meaningful** — today's 142 rows cannot be placed on this scale at all (`ANGEL_QUESTION_DEPTH_AND_REPETITION_AUDIT.md` §3). This is itself the first target: build the measurement before setting the number.

**This scorecard deliberately does not set a raw question-count target, a total-questions-needed figure, or a delivery date** — per the Founder's explicit instruction against exactly that framing, and because `ANGEL_CONTENT_READINESS_GAP_REGISTER.md` shows the highest-leverage near-term work is wiring existing governance code, not authoring volume.

## 3. Overall Readiness Classification

**PARTIALLY READY, WITH REAL FOUNDATIONS AND REAL GAPS — CARRYING FORWARD, NOT REVISING, THE EXISTING CAPACITY AUDIT'S OWN VERDICT (§24.10).**

Content existence is genuinely substantial and no longer the uncertainty it once was; the Practice/Mock firewall, the retention engine, and (as of this session) the Reading Mock scoring/marking/release pipeline are all proven, working strengths. Against that: content depth, sustained-use capacity, year-based differentiation, and pathway-marketing alignment are all real, evidenced shortfalls — not because content doesn't exist, but because the content that exists is thinner, less differentiated, and less connected to adaptive decision-making than the product's own stated ambitions require. The single most actionable finding in this entire assignment is that most of the missing connective tissue — duplicate detection, inventory classification, family-based freshness, year-stage gating — **already exists in code and has simply never been wired in.** That is a materially cheaper and faster readiness path than the "need thousands more questions" framing this assignment was explicitly instructed to avoid, and this scorecard recommends exactly that: wire first, expand deliberately second, generate content only once the Question Factory's missing Candidate stage and validation gates exist.
