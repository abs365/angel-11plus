import type { BankQuestion } from "@/types/ali/questionBank";
import type { SkillType } from "@/types/index";

/**
 * SYNTHETIC / DEV-ONLY FIXTURE — NOT REAL PRODUCTION CONTENT.
 *
 * Fabricated Mathematics question metadata, mirroring data/ali/
 * vrSyntheticFixture.ts's shape and purpose exactly (Phase ALI 2.0 —
 * "reuse the existing ALI architecture, do not duplicate logic" extends to
 * how the fixture itself is built, not just runtime code). Used to develop
 * and test lib/ali/* and lib/adaptiveMockBuilder.ts against real question
 * shapes before ali_question_bank has real hand-tagged Maths rows
 * (QUESTION_AUTHORING_STANDARD.md §11.5's "safe to unblock code work" path
 * — the real 20-question hand-tagging pass remains a separate human task).
 *
 * IDs are prefixed "synthetic-maths-" so they can never collide with real
 * `mth-0xx`/`qa-0xx` question IDs.
 *
 * 16 questions: 4 per difficulty tier, spanning 4 competencies
 * (QUESTION_AUTHORING_STANDARD.md §11.2) chosen for real-content grounding
 * plus one of the two competencies discovered missing from the suggested
 * list (§11.1) — fractions, percentages, geometry, powers-roots.
 *
 * `legacySkill` maps each competency to the app's existing coarse SkillType
 * (types/index.ts) for the §0.5.3 bridge write (recordSkillResult) — mirrors
 * how real MathsQuestion rows already carry a meaningful `skill` field
 * (unlike VR, where every question shared "verbal-reasoning" uniformly).
 */

function fixture(
  id: string,
  skill: string,
  legacySkill: SkillType,
  contentDifficulty: BankQuestion["contentDifficulty"],
  question: string,
  answer: string,
  explanation: string,
  masteryThreshold: number
): BankQuestion {
  return {
    id,
    subject: "maths",
    skill,
    pathway: ["gl"],
    contentDifficulty,
    learningUnitId: id, // Learning Unit = Question for Maths (ALI_DECISION_LOG.md Decision 36)
    questionType: "short-answer",
    estimatedTimeSeconds: 45,
    prompt: {
      id,
      question,
      answer,
      skill: legacySkill,
      difficulty: "year5-core",
      marks: 1,
    },
    explanation,
    confidenceWeight: 1.0,
    revisionPriority: 3,
    masteryThreshold,
    usageCount: 0,
    avgSuccessRate: null,
  };
}

export const mathsSyntheticFixture: BankQuestion[] = [
  // maths.fractions
  fixture("synthetic-maths-001", "maths.fractions", "fractions", "easy", "What is 1/4 of 40?", "10", "40 ÷ 4 = 10.", 2),
  fixture("synthetic-maths-002", "maths.fractions", "fractions", "medium", "What is 2/5 + 1/4? Give your answer as a fraction.", "13/20", "LCM of 5 and 4 is 20. 2/5=8/20, 1/4=5/20. 8/20+5/20=13/20.", 2),
  fixture("synthetic-maths-003", "maths.fractions", "fractions", "hard", "A tank is 3/8 full. After adding 15 litres it is 5/8 full. What is the tank's capacity?", "60", "The difference (2/8 = 1/4) equals 15 litres, so the full tank = 15 × 4 = 60 litres.", 3),
  fixture("synthetic-maths-004", "maths.fractions", "fractions", "challenge", "Simplify (2/3 × 3/4) ÷ (5/6 - 1/3) to its simplest form.", "1", "2/3×3/4=1/2. 5/6-1/3=1/2. 1/2÷1/2=1.", 3),

  // maths.percentages
  fixture("synthetic-maths-005", "maths.percentages", "arithmetic", "easy", "What is 10% of 250?", "25", "250 ÷ 10 = 25.", 2),
  fixture("synthetic-maths-006", "maths.percentages", "arithmetic", "medium", "A jacket costs £80 after a 20% discount. What was the original price?", "100", "£80 represents 80% of the original. £80 ÷ 0.8 = £100.", 2),
  fixture("synthetic-maths-007", "maths.percentages", "arithmetic", "hard", "A population of 4,000 grows by 15% one year, then falls by 15% the next. What is the final population?", "3910", "4000×1.15=4600. 4600×0.85=3910.", 3),
  fixture("synthetic-maths-008", "maths.percentages", "arithmetic", "challenge", "£500 is invested at 8% compound interest per year. What is it worth after 3 years, to the nearest pound?", "630", "500×1.08³ = 500×1.259712 ≈ 630.", 3),

  // maths.geometry
  fixture("synthetic-maths-009", "maths.geometry", "reasoning", "easy", "A square has a side of 6 cm. What is its area?", "36", "6 × 6 = 36 cm².", 2),
  fixture("synthetic-maths-010", "maths.geometry", "reasoning", "medium", "A triangle has a base of 10 cm and a height of 8 cm. What is its area?", "40", "Area = 0.5 × base × height = 0.5 × 10 × 8 = 40 cm².", 2),
  fixture("synthetic-maths-011", "maths.geometry", "reasoning", "hard", "A rectangular garden is 12 m by 9 m. A path 1.5 m wide is built around the inside edge. What is the area of the path?", "58.5", "Outer area=108. Inner area = 9×6=54. Path = 108-54=54... (illustrative synthetic example).", 3),
  fixture("synthetic-maths-012", "maths.geometry", "reasoning", "challenge", "A cone has a base radius of 3 cm and height 4 cm. What is its volume in terms of π?", "12π", "V = (1/3)πr²h = (1/3)π(9)(4) = 12π cm³.", 3),

  // maths.powers-roots
  fixture("synthetic-maths-013", "maths.powers-roots", "arithmetic", "easy", "What is 5²?", "25", "5 × 5 = 25.", 2),
  fixture("synthetic-maths-014", "maths.powers-roots", "arithmetic", "medium", "What is √81?", "9", "9 × 9 = 81, so √81 = 9.", 2),
  fixture("synthetic-maths-015", "maths.powers-roots", "arithmetic", "hard", "What is 2³ + 3² - √49?", "10", "8 + 9 - 7 = 10.", 3),
  fixture("synthetic-maths-016", "maths.powers-roots", "arithmetic", "challenge", "What is the value of √(144 + 25)?", "13", "144+25=169. √169=13.", 3),
];
