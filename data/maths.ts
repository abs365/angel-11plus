import type { MathsQuestion } from "@/types";

export const mathsQuestions: MathsQuestion[] = [
  {
    id: "mth-001",
    question: "A train travels at 60 miles per hour. How long does it take to travel 225 miles? Give your answer in hours and minutes.",
    answer: "3 hours 45 minutes",
    skill: "word-problem",
    difficulty: "year5-core",
    marks: 2,
    workingSteps: [
      "225 ÷ 60 = 3.75 hours",
      "0.75 hours × 60 = 45 minutes",
      "Answer: 3 hours 45 minutes"
    ]
  },
  {
    id: "mth-002",
    question: "What is the value of 4³ + √144?",
    answer: "76",
    skill: "arithmetic",
    difficulty: "year5-advanced",
    marks: 2,
    workingSteps: [
      "4³ = 4 × 4 × 4 = 64",
      "√144 = 12",
      "64 + 12 = 76"
    ]
  },
  {
    id: "mth-003",
    question: "A rectangle has a perimeter of 48 cm. Its length is three times its width. What is the area of the rectangle?",
    answer: "108",
    skill: "reasoning",
    difficulty: "year5-core",
    marks: 3,
    workingSteps: [
      "Let width = w, then length = 3w",
      "Perimeter: 2(w + 3w) = 48",
      "2 × 4w = 48, so 8w = 48, w = 6 cm",
      "Length = 18 cm",
      "Area = 6 × 18 = 108 cm²"
    ]
  },
  {
    id: "mth-004",
    question: "What is 3/8 + 5/6? Give your answer as a mixed number in its simplest form.",
    answer: "1 5/24",
    skill: "fractions",
    difficulty: "year5-advanced",
    marks: 2,
    workingSteps: [
      "LCM of 8 and 6 = 24",
      "3/8 = 9/24",
      "5/6 = 20/24",
      "9/24 + 20/24 = 29/24",
      "29/24 = 1 5/24"
    ]
  },
  {
    id: "mth-005",
    question: "A shopkeeper bought 40 books for £3.50 each and sold them for £5.20 each. How much profit did he make in total?",
    answer: "£68",
    skill: "word-problem",
    difficulty: "year5-core",
    marks: 2,
    workingSteps: [
      "Profit per book = £5.20 - £3.50 = £1.70",
      "Total profit = 40 × £1.70 = £68"
    ]
  },
  {
    id: "mth-006",
    question: "The nth term of a sequence is 4n - 3. What is the 12th term? What is the first term greater than 100?",
    answer: "45; 26th term (101)",
    skill: "pattern",
    difficulty: "year5-advanced",
    marks: 3,
    workingSteps: [
      "12th term: 4(12) - 3 = 48 - 3 = 45",
      "For first term > 100: 4n - 3 > 100",
      "4n > 103, n > 25.75",
      "So n = 26: 4(26) - 3 = 104 - 3 = 101 ✓",
      "The 26th term is 101 — the first term greater than 100"
    ]
  },
  {
    id: "mth-007b",
    question: "In a class, the ratio of boys to girls is 3:4. There are 28 girls. How many students are there altogether?",
    answer: "49",
    skill: "reasoning",
    difficulty: "year5-core",
    marks: 2,
    workingSteps: [
      "4 parts = 28 girls, so 1 part = 7",
      "Boys = 3 × 7 = 21",
      "Total = 21 + 28 = 49"
    ]
  },
  {
    id: "mth-008",
    question: "Calculate: 2.4 × 0.35",
    answer: "0.84",
    skill: "arithmetic",
    difficulty: "year5-core",
    marks: 1,
    workingSteps: [
      "2.4 has 1 decimal place, 0.35 has 2 decimal places → answer has 3 dp",
      "Multiply as integers: 24 × 35 = 840",
      "Divide by 1000 → 0.840 = 0.84"
    ]
  },
  {
    id: "mth-009",
    question: "A cylinder has a radius of 5 cm and a height of 12 cm. What is its volume? (Use π = 3.14)",
    answer: "942 cm³",
    skill: "reasoning",
    difficulty: "year6-exam",
    marks: 3,
    workingSteps: [
      "V = π × r² × h",
      "V = 3.14 × 5² × 12",
      "V = 3.14 × 25 × 12",
      "V = 3.14 × 300",
      "V = 942 cm³"
    ]
  },
  {
    id: "mth-010",
    question: "What percentage of 340 is 85?",
    answer: "25%",
    skill: "arithmetic",
    difficulty: "year5-core",
    marks: 2,
    workingSteps: [
      "85 ÷ 340 × 100",
      "= 0.25 × 100",
      "= 25%"
    ]
  }
];

export const quickArithmetic: MathsQuestion[] = [
  { id: "qa-001", question: "847 + 356 = ?", answer: "1203", skill: "arithmetic", difficulty: "year5-core", marks: 1 },
  { id: "qa-002", question: "1000 - 473 = ?", answer: "527", skill: "arithmetic", difficulty: "year5-core", marks: 1 },
  { id: "qa-003", question: "24 × 35 = ?", answer: "840", skill: "arithmetic", difficulty: "year5-core", marks: 1 },
  { id: "qa-004", question: "756 ÷ 9 = ?", answer: "84", skill: "arithmetic", difficulty: "year5-core", marks: 1 },
  { id: "qa-005", question: "12.5 × 8 = ?", answer: "100", skill: "arithmetic", difficulty: "year5-core", marks: 1 },
  { id: "qa-006", question: "3/4 of 240 = ?", answer: "180", skill: "fractions", difficulty: "year5-core", marks: 1 },
  { id: "qa-007", question: "15% of 60 = ?", answer: "9", skill: "arithmetic", difficulty: "year5-core", marks: 1 },
  { id: "qa-008", question: "√225 = ?", answer: "15", skill: "arithmetic", difficulty: "year5-core", marks: 1 },
  { id: "qa-009", question: "2³ × 5 = ?", answer: "40", skill: "arithmetic", difficulty: "year5-core", marks: 1 },
  { id: "qa-010", question: "LCM of 6 and 9 = ?", answer: "18", skill: "pattern", difficulty: "year5-core", marks: 1 },
];
