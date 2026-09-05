// Angel 11+ -- Question Factory Wave 2, Section 4
// Loads the exact 30 Wave 2 candidates (generated + validated last turn,
// never approved or published) into the production ali_question_candidate
// table via the admin-gated submit_question_candidate() RPC.
//
// HOW TO RUN: sign in to the live Angel app as the ADMIN account in your
// browser, open DevTools (F12) -> Console tab, on ANY page of the app
// (e.g. /dashboard), paste this whole script, press Enter. It uses your
// own real, already-authenticated session -- no credentials are typed,
// requested, or exposed by this script itself.
//
// This submits candidates only (review_status = 'pending_review',
// publication_status = 'unpublished'). It does NOT approve or publish
// anything. Review them afterward at /admin-beta/question-factory.
(async () => {
  const SUPABASE_URL = "https://agxunwcdatosrmzhhuxj.supabase.co";
  const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFneHVud2NkYXRvc3JtemhodXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NTkxNDksImV4cCI6MjA5NDUzNTE0OX0.y1QHCH6puLXOpUPCM0LkpbDjPVhVhLAdtvLONvztnGA";

  const tokenKey = Object.keys(localStorage).find((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
  if (!tokenKey) { console.error("No Supabase auth token found in localStorage -- are you signed in on this tab?"); return; }
  const session = JSON.parse(localStorage.getItem(tokenKey));
  const accessToken = session?.access_token;
  if (!accessToken) { console.error("Found a token key but no access_token inside it."); return; }

  const candidates = [
  {
    "p_candidate_id": "factory-candidate-mr01-decimal-computation-1-1788643198244",
    "p_family_id": "mr01-decimal-computation",
    "p_generation_spec_id": "mr01-decimal-computation",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-01",
    "p_skill": "QT-MR-01",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "DEVELOPMENT",
    "p_difficulty": "medium",
    "p_question_content": {
      "question": "Calculate: 2.3 × 5.96",
      "workingSteps": [
        "2.3 has 1 decimal place, 5.96 has 2 decimal places → answer has 3 dp",
        "Multiply as integers: 23 × 596 = 13708",
        "Divide by 1000 → 13.708 = 13.708"
      ]
    },
    "p_claimed_answer": "13.708",
    "p_worked_explanation": "2.3 has 1 decimal place, 5.96 has 2 decimal places → answer has 3 dp Multiply as integers: 23 × 596 = 13708 Divide by 1000 → 13.708 = 13.708",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-mr01-decimal-computation-2-1788643198245",
    "p_family_id": "mr01-decimal-computation",
    "p_generation_spec_id": "mr01-decimal-computation",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-01",
    "p_skill": "QT-MR-01",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "DEVELOPMENT",
    "p_difficulty": "medium",
    "p_question_content": {
      "question": "Calculate: 6.6 × 1.55",
      "workingSteps": [
        "6.6 has 1 decimal place, 1.55 has 2 decimal places → answer has 3 dp",
        "Multiply as integers: 66 × 155 = 10230",
        "Divide by 1000 → 10.230 = 10.23"
      ]
    },
    "p_claimed_answer": "10.23",
    "p_worked_explanation": "6.6 has 1 decimal place, 1.55 has 2 decimal places → answer has 3 dp Multiply as integers: 66 × 155 = 10230 Divide by 1000 → 10.230 = 10.23",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-mr01-decimal-computation-3-1788643198246",
    "p_family_id": "mr01-decimal-computation",
    "p_generation_spec_id": "mr01-decimal-computation",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-01",
    "p_skill": "QT-MR-01",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "DEVELOPMENT",
    "p_difficulty": "medium",
    "p_question_content": {
      "question": "Calculate: 6.5 × 9.69",
      "workingSteps": [
        "6.5 has 1 decimal place, 9.69 has 2 decimal places → answer has 3 dp",
        "Multiply as integers: 65 × 969 = 62985",
        "Divide by 1000 → 62.985 = 62.985"
      ]
    },
    "p_claimed_answer": "62.985",
    "p_worked_explanation": "6.5 has 1 decimal place, 9.69 has 2 decimal places → answer has 3 dp Multiply as integers: 65 × 969 = 62985 Divide by 1000 → 62.985 = 62.985",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-mr01-decimal-computation-4-1788643198246",
    "p_family_id": "mr01-decimal-computation",
    "p_generation_spec_id": "mr01-decimal-computation",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-01",
    "p_skill": "QT-MR-01",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "DEVELOPMENT",
    "p_difficulty": "medium",
    "p_question_content": {
      "question": "Calculate: 1.7 × 9.02",
      "workingSteps": [
        "1.7 has 1 decimal place, 9.02 has 2 decimal places → answer has 3 dp",
        "Multiply as integers: 17 × 902 = 15334",
        "Divide by 1000 → 15.334 = 15.334"
      ]
    },
    "p_claimed_answer": "15.334",
    "p_worked_explanation": "1.7 has 1 decimal place, 9.02 has 2 decimal places → answer has 3 dp Multiply as integers: 17 × 902 = 15334 Divide by 1000 → 15.334 = 15.334",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-mr01-decimal-computation-5-1788643198246",
    "p_family_id": "mr01-decimal-computation",
    "p_generation_spec_id": "mr01-decimal-computation",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-01",
    "p_skill": "QT-MR-01",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "DEVELOPMENT",
    "p_difficulty": "medium",
    "p_question_content": {
      "question": "Calculate: 4.9 × 7.31",
      "workingSteps": [
        "4.9 has 1 decimal place, 7.31 has 2 decimal places → answer has 3 dp",
        "Multiply as integers: 49 × 731 = 35819",
        "Divide by 1000 → 35.819 = 35.819"
      ]
    },
    "p_claimed_answer": "35.819",
    "p_worked_explanation": "4.9 has 1 decimal place, 7.31 has 2 decimal places → answer has 3 dp Multiply as integers: 49 × 731 = 35819 Divide by 1000 → 35.819 = 35.819",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-mr01-decimal-computation-6-1788643198246",
    "p_family_id": "mr01-decimal-computation",
    "p_generation_spec_id": "mr01-decimal-computation",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-01",
    "p_skill": "QT-MR-01",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "DEVELOPMENT",
    "p_difficulty": "easy",
    "p_question_content": {
      "question": "Calculate: 4.1 × 0.74",
      "workingSteps": [
        "4.1 has 1 decimal place, 0.74 has 2 decimal places → answer has 3 dp",
        "Multiply as integers: 41 × 74 = 3034",
        "Divide by 1000 → 3.034 = 3.034"
      ]
    },
    "p_claimed_answer": "3.034",
    "p_worked_explanation": "4.1 has 1 decimal place, 0.74 has 2 decimal places → answer has 3 dp Multiply as integers: 41 × 74 = 3034 Divide by 1000 → 3.034 = 3.034",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-mr01-decimal-computation-7-1788643198246",
    "p_family_id": "mr01-decimal-computation",
    "p_generation_spec_id": "mr01-decimal-computation",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-01",
    "p_skill": "QT-MR-01",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "DEVELOPMENT",
    "p_difficulty": "medium",
    "p_question_content": {
      "question": "Calculate: 1.4 × 5.79",
      "workingSteps": [
        "1.4 has 1 decimal place, 5.79 has 2 decimal places → answer has 3 dp",
        "Multiply as integers: 14 × 579 = 8106",
        "Divide by 1000 → 8.106 = 8.106"
      ]
    },
    "p_claimed_answer": "8.106",
    "p_worked_explanation": "1.4 has 1 decimal place, 5.79 has 2 decimal places → answer has 3 dp Multiply as integers: 14 × 579 = 8106 Divide by 1000 → 8.106 = 8.106",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-mr01-decimal-computation-8-1788643198246",
    "p_family_id": "mr01-decimal-computation",
    "p_generation_spec_id": "mr01-decimal-computation",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-01",
    "p_skill": "QT-MR-01",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "DEVELOPMENT",
    "p_difficulty": "medium",
    "p_question_content": {
      "question": "Calculate: 6.2 × 1.24",
      "workingSteps": [
        "6.2 has 1 decimal place, 1.24 has 2 decimal places → answer has 3 dp",
        "Multiply as integers: 62 × 124 = 7688",
        "Divide by 1000 → 7.688 = 7.688"
      ]
    },
    "p_claimed_answer": "7.688",
    "p_worked_explanation": "6.2 has 1 decimal place, 1.24 has 2 decimal places → answer has 3 dp Multiply as integers: 62 × 124 = 7688 Divide by 1000 → 7.688 = 7.688",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-mr01-decimal-computation-9-1788643198246",
    "p_family_id": "mr01-decimal-computation",
    "p_generation_spec_id": "mr01-decimal-computation",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-01",
    "p_skill": "QT-MR-01",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "DEVELOPMENT",
    "p_difficulty": "medium",
    "p_question_content": {
      "question": "Calculate: 5.7 × 4.27",
      "workingSteps": [
        "5.7 has 1 decimal place, 4.27 has 2 decimal places → answer has 3 dp",
        "Multiply as integers: 57 × 427 = 24339",
        "Divide by 1000 → 24.339 = 24.339"
      ]
    },
    "p_claimed_answer": "24.339",
    "p_worked_explanation": "5.7 has 1 decimal place, 4.27 has 2 decimal places → answer has 3 dp Multiply as integers: 57 × 427 = 24339 Divide by 1000 → 24.339 = 24.339",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-mr01-decimal-computation-10-1788643198246",
    "p_family_id": "mr01-decimal-computation",
    "p_generation_spec_id": "mr01-decimal-computation",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-01",
    "p_skill": "QT-MR-01",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "DEVELOPMENT",
    "p_difficulty": "medium",
    "p_question_content": {
      "question": "Calculate: 3.6 × 9.91",
      "workingSteps": [
        "3.6 has 1 decimal place, 9.91 has 2 decimal places → answer has 3 dp",
        "Multiply as integers: 36 × 991 = 35676",
        "Divide by 1000 → 35.676 = 35.676"
      ]
    },
    "p_claimed_answer": "35.676",
    "p_worked_explanation": "3.6 has 1 decimal place, 9.91 has 2 decimal places → answer has 3 dp Multiply as integers: 36 × 991 = 35676 Divide by 1000 → 35.676 = 35.676",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-precision-frac-11-1788643198288",
    "p_family_id": "precision-frac",
    "p_generation_spec_id": "precision-frac",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-06",
    "p_skill": "QT-MR-14",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "EXAM_PREPARATION",
    "p_difficulty": "medium",
    "p_question_content": {
      "question": "A 9m ribbon is cut into 5 equal pieces. What is the length of each piece? Give your answer as an exact fraction of a metre, in its simplest form.",
      "workingSteps": [
        "9 ÷ 5 does not divide evenly",
        "As an exact fraction: 9/5 m",
        "9/5 = 1 remainder 4, so simplify to lowest terms"
      ]
    },
    "p_claimed_answer": "1 4/5",
    "p_worked_explanation": "9 ÷ 5 does not divide evenly As an exact fraction: 9/5 m 9/5 = 1 remainder 4, so simplify to lowest terms",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-precision-frac-12-1788643198288",
    "p_family_id": "precision-frac",
    "p_generation_spec_id": "precision-frac",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-06",
    "p_skill": "QT-MR-14",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "EXAM_PREPARATION",
    "p_difficulty": "medium",
    "p_question_content": {
      "question": "A 26m ribbon is cut into 6 equal pieces. What is the length of each piece? Give your answer as an exact fraction of a metre, in its simplest form.",
      "workingSteps": [
        "26 ÷ 6 does not divide evenly",
        "As an exact fraction: 26/6 m",
        "26/6 = 4 remainder 2, so simplify to lowest terms"
      ]
    },
    "p_claimed_answer": "4 1/3",
    "p_worked_explanation": "26 ÷ 6 does not divide evenly As an exact fraction: 26/6 m 26/6 = 4 remainder 2, so simplify to lowest terms",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-precision-frac-13-1788643198288",
    "p_family_id": "precision-frac",
    "p_generation_spec_id": "precision-frac",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-06",
    "p_skill": "QT-MR-14",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "EXAM_PREPARATION",
    "p_difficulty": "medium",
    "p_question_content": {
      "question": "A 22m ribbon is cut into 5 equal pieces. What is the length of each piece? Give your answer as an exact fraction of a metre, in its simplest form.",
      "workingSteps": [
        "22 ÷ 5 does not divide evenly",
        "As an exact fraction: 22/5 m",
        "22/5 = 4 remainder 2, so simplify to lowest terms"
      ]
    },
    "p_claimed_answer": "4 2/5",
    "p_worked_explanation": "22 ÷ 5 does not divide evenly As an exact fraction: 22/5 m 22/5 = 4 remainder 2, so simplify to lowest terms",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-precision-frac-14-1788643198288",
    "p_family_id": "precision-frac",
    "p_generation_spec_id": "precision-frac",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-06",
    "p_skill": "QT-MR-14",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "EXAM_PREPARATION",
    "p_difficulty": "easy",
    "p_question_content": {
      "question": "A 5m ribbon is cut into 4 equal pieces. What is the length of each piece? Give your answer as an exact fraction of a metre, in its simplest form.",
      "workingSteps": [
        "5 ÷ 4 does not divide evenly",
        "As an exact fraction: 5/4 m",
        "5/4 = 1 remainder 1, so simplify to lowest terms"
      ]
    },
    "p_claimed_answer": "1 1/4",
    "p_worked_explanation": "5 ÷ 4 does not divide evenly As an exact fraction: 5/4 m 5/4 = 1 remainder 1, so simplify to lowest terms",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-precision-frac-15-1788643198288",
    "p_family_id": "precision-frac",
    "p_generation_spec_id": "precision-frac",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-06",
    "p_skill": "QT-MR-14",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "EXAM_PREPARATION",
    "p_difficulty": "hard",
    "p_question_content": {
      "question": "A 29m ribbon is cut into 9 equal pieces. What is the length of each piece? Give your answer as an exact fraction of a metre, in its simplest form.",
      "workingSteps": [
        "29 ÷ 9 does not divide evenly",
        "As an exact fraction: 29/9 m",
        "29/9 = 3 remainder 2, so simplify to lowest terms"
      ]
    },
    "p_claimed_answer": "3 2/9",
    "p_worked_explanation": "29 ÷ 9 does not divide evenly As an exact fraction: 29/9 m 29/9 = 3 remainder 2, so simplify to lowest terms",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-precision-frac-16-1788643198288",
    "p_family_id": "precision-frac",
    "p_generation_spec_id": "precision-frac",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-06",
    "p_skill": "QT-MR-14",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "EXAM_PREPARATION",
    "p_difficulty": "easy",
    "p_question_content": {
      "question": "A 7m ribbon is cut into 3 equal pieces. What is the length of each piece? Give your answer as an exact fraction of a metre, in its simplest form.",
      "workingSteps": [
        "7 ÷ 3 does not divide evenly",
        "As an exact fraction: 7/3 m",
        "7/3 = 2 remainder 1, so simplify to lowest terms"
      ]
    },
    "p_claimed_answer": "2 1/3",
    "p_worked_explanation": "7 ÷ 3 does not divide evenly As an exact fraction: 7/3 m 7/3 = 2 remainder 1, so simplify to lowest terms",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-precision-frac-17-1788643198288",
    "p_family_id": "precision-frac",
    "p_generation_spec_id": "precision-frac",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-06",
    "p_skill": "QT-MR-14",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "EXAM_PREPARATION",
    "p_difficulty": "medium",
    "p_question_content": {
      "question": "A 11m ribbon is cut into 6 equal pieces. What is the length of each piece? Give your answer as an exact fraction of a metre, in its simplest form.",
      "workingSteps": [
        "11 ÷ 6 does not divide evenly",
        "As an exact fraction: 11/6 m",
        "11/6 = 1 remainder 5, so simplify to lowest terms"
      ]
    },
    "p_claimed_answer": "1 5/6",
    "p_worked_explanation": "11 ÷ 6 does not divide evenly As an exact fraction: 11/6 m 11/6 = 1 remainder 5, so simplify to lowest terms",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-precision-frac-18-1788643198288",
    "p_family_id": "precision-frac",
    "p_generation_spec_id": "precision-frac",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-06",
    "p_skill": "QT-MR-14",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "EXAM_PREPARATION",
    "p_difficulty": "hard",
    "p_question_content": {
      "question": "A 18m ribbon is cut into 8 equal pieces. What is the length of each piece? Give your answer as an exact fraction of a metre, in its simplest form.",
      "workingSteps": [
        "18 ÷ 8 does not divide evenly",
        "As an exact fraction: 18/8 m",
        "18/8 = 2 remainder 2, so simplify to lowest terms"
      ]
    },
    "p_claimed_answer": "2 1/4",
    "p_worked_explanation": "18 ÷ 8 does not divide evenly As an exact fraction: 18/8 m 18/8 = 2 remainder 2, so simplify to lowest terms",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-precision-frac-19-1788643198288",
    "p_family_id": "precision-frac",
    "p_generation_spec_id": "precision-frac",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-06",
    "p_skill": "QT-MR-14",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "EXAM_PREPARATION",
    "p_difficulty": "hard",
    "p_question_content": {
      "question": "A 28m ribbon is cut into 9 equal pieces. What is the length of each piece? Give your answer as an exact fraction of a metre, in its simplest form.",
      "workingSteps": [
        "28 ÷ 9 does not divide evenly",
        "As an exact fraction: 28/9 m",
        "28/9 = 3 remainder 1, so simplify to lowest terms"
      ]
    },
    "p_claimed_answer": "3 1/9",
    "p_worked_explanation": "28 ÷ 9 does not divide evenly As an exact fraction: 28/9 m 28/9 = 3 remainder 1, so simplify to lowest terms",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-precision-frac-20-1788643198288",
    "p_family_id": "precision-frac",
    "p_generation_spec_id": "precision-frac",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-06",
    "p_skill": "QT-MR-14",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "EXAM_PREPARATION",
    "p_difficulty": "medium",
    "p_question_content": {
      "question": "A 23m ribbon is cut into 5 equal pieces. What is the length of each piece? Give your answer as an exact fraction of a metre, in its simplest form.",
      "workingSteps": [
        "23 ÷ 5 does not divide evenly",
        "As an exact fraction: 23/5 m",
        "23/5 = 4 remainder 3, so simplify to lowest terms"
      ]
    },
    "p_claimed_answer": "4 3/5",
    "p_worked_explanation": "23 ÷ 5 does not divide evenly As an exact fraction: 23/5 m 23/5 = 4 remainder 3, so simplify to lowest terms",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-mr03-angle-sum-21-1788643198334",
    "p_family_id": "mr03-angle-sum",
    "p_generation_spec_id": "mr03-angle-sum",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-03",
    "p_skill": "QT-MR-07",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "DEVELOPMENT",
    "p_difficulty": "medium",
    "p_question_content": {
      "question": "A triangle has angles of 43°, 53° and one unknown angle. What is the size of the unknown angle?",
      "workingSteps": [
        "The angles in a triangle always add up to 180°",
        "43 + 53 = 96",
        "180 - 96 = 84"
      ]
    },
    "p_claimed_answer": "84",
    "p_worked_explanation": "The angles in a triangle always add up to 180° 43 + 53 = 96 180 - 96 = 84",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-mr03-angle-sum-22-1788643198334",
    "p_family_id": "mr03-angle-sum",
    "p_generation_spec_id": "mr03-angle-sum",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-03",
    "p_skill": "QT-MR-07",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "DEVELOPMENT",
    "p_difficulty": "medium",
    "p_question_content": {
      "question": "A triangle has angles of 54°, 42° and one unknown angle. What is the size of the unknown angle?",
      "workingSteps": [
        "The angles in a triangle always add up to 180°",
        "54 + 42 = 96",
        "180 - 96 = 84"
      ]
    },
    "p_claimed_answer": "84",
    "p_worked_explanation": "The angles in a triangle always add up to 180° 54 + 42 = 96 180 - 96 = 84",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-mr03-angle-sum-23-1788643198334",
    "p_family_id": "mr03-angle-sum",
    "p_generation_spec_id": "mr03-angle-sum",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-03",
    "p_skill": "QT-MR-07",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "DEVELOPMENT",
    "p_difficulty": "medium",
    "p_question_content": {
      "question": "A triangle has angles of 114°, 60° and one unknown angle. What is the size of the unknown angle?",
      "workingSteps": [
        "The angles in a triangle always add up to 180°",
        "114 + 60 = 174",
        "180 - 174 = 6"
      ]
    },
    "p_claimed_answer": "6",
    "p_worked_explanation": "The angles in a triangle always add up to 180° 114 + 60 = 174 180 - 174 = 6",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-mr03-angle-sum-24-1788643198334",
    "p_family_id": "mr03-angle-sum",
    "p_generation_spec_id": "mr03-angle-sum",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-03",
    "p_skill": "QT-MR-07",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "DEVELOPMENT",
    "p_difficulty": "medium",
    "p_question_content": {
      "question": "A triangle has angles of 13°, 105° and one unknown angle. What is the size of the unknown angle?",
      "workingSteps": [
        "The angles in a triangle always add up to 180°",
        "13 + 105 = 118",
        "180 - 118 = 62"
      ]
    },
    "p_claimed_answer": "62",
    "p_worked_explanation": "The angles in a triangle always add up to 180° 13 + 105 = 118 180 - 118 = 62",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-mr03-angle-sum-25-1788643198334",
    "p_family_id": "mr03-angle-sum",
    "p_generation_spec_id": "mr03-angle-sum",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-03",
    "p_skill": "QT-MR-07",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "DEVELOPMENT",
    "p_difficulty": "medium",
    "p_question_content": {
      "question": "A triangle has angles of 20°, 47° and one unknown angle. What is the size of the unknown angle?",
      "workingSteps": [
        "The angles in a triangle always add up to 180°",
        "20 + 47 = 67",
        "180 - 67 = 113"
      ]
    },
    "p_claimed_answer": "113",
    "p_worked_explanation": "The angles in a triangle always add up to 180° 20 + 47 = 67 180 - 67 = 113",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-mr03-angle-sum-26-1788643198334",
    "p_family_id": "mr03-angle-sum",
    "p_generation_spec_id": "mr03-angle-sum",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-03",
    "p_skill": "QT-MR-07",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "DEVELOPMENT",
    "p_difficulty": "medium",
    "p_question_content": {
      "question": "A triangle has angles of 31°, 21° and one unknown angle. What is the size of the unknown angle?",
      "workingSteps": [
        "The angles in a triangle always add up to 180°",
        "31 + 21 = 52",
        "180 - 52 = 128"
      ]
    },
    "p_claimed_answer": "128",
    "p_worked_explanation": "The angles in a triangle always add up to 180° 31 + 21 = 52 180 - 52 = 128",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-mr03-angle-sum-27-1788643198334",
    "p_family_id": "mr03-angle-sum",
    "p_generation_spec_id": "mr03-angle-sum",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-03",
    "p_skill": "QT-MR-07",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "DEVELOPMENT",
    "p_difficulty": "medium",
    "p_question_content": {
      "question": "A triangle has angles of 52°, 85° and one unknown angle. What is the size of the unknown angle?",
      "workingSteps": [
        "The angles in a triangle always add up to 180°",
        "52 + 85 = 137",
        "180 - 137 = 43"
      ]
    },
    "p_claimed_answer": "43",
    "p_worked_explanation": "The angles in a triangle always add up to 180° 52 + 85 = 137 180 - 137 = 43",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-mr03-angle-sum-28-1788643198334",
    "p_family_id": "mr03-angle-sum",
    "p_generation_spec_id": "mr03-angle-sum",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-03",
    "p_skill": "QT-MR-07",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "DEVELOPMENT",
    "p_difficulty": "easy",
    "p_question_content": {
      "question": "A triangle has angles of 29°, 106° and one unknown angle. What is the size of the unknown angle?",
      "workingSteps": [
        "The angles in a triangle always add up to 180°",
        "29 + 106 = 135",
        "180 - 135 = 45"
      ]
    },
    "p_claimed_answer": "45",
    "p_worked_explanation": "The angles in a triangle always add up to 180° 29 + 106 = 135 180 - 135 = 45",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-mr03-angle-sum-29-1788643198334",
    "p_family_id": "mr03-angle-sum",
    "p_generation_spec_id": "mr03-angle-sum",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-03",
    "p_skill": "QT-MR-07",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "DEVELOPMENT",
    "p_difficulty": "easy",
    "p_question_content": {
      "question": "A triangle has angles of 19°, 11° and one unknown angle. What is the size of the unknown angle?",
      "workingSteps": [
        "The angles in a triangle always add up to 180°",
        "19 + 11 = 30",
        "180 - 30 = 150"
      ]
    },
    "p_claimed_answer": "150",
    "p_worked_explanation": "The angles in a triangle always add up to 180° 19 + 11 = 30 180 - 30 = 150",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  },
  {
    "p_candidate_id": "factory-candidate-mr03-angle-sum-30-1788643198334",
    "p_family_id": "mr03-angle-sum",
    "p_generation_spec_id": "mr03-angle-sum",
    "p_generation_spec_version": "1",
    "p_subject": "maths",
    "p_competency_id": "MR-03",
    "p_skill": "QT-MR-07",
    "p_question_type": "short-answer",
    "p_pathway": [
      "csse"
    ],
    "p_preparation_stage": "DEVELOPMENT",
    "p_difficulty": "medium",
    "p_question_content": {
      "question": "A triangle has angles of 42°, 127° and one unknown angle. What is the size of the unknown angle?",
      "workingSteps": [
        "The angles in a triangle always add up to 180°",
        "42 + 127 = 169",
        "180 - 169 = 11"
      ]
    },
    "p_claimed_answer": "11",
    "p_worked_explanation": "The angles in a triangle always add up to 180° 42 + 127 = 169 180 - 169 = 11",
    "p_distractors": null,
    "p_mathematical_validation": {
      "mathematicallyValid": true,
      "reasons": []
    },
    "p_similarity_validation": {
      "approved": true,
      "reasons": []
    }
  }
];

  console.log("Submitting", candidates.length, "candidates...");
  const results = [];
  for (const args of candidates) {
    const res = await fetch(SUPABASE_URL + "/rest/v1/rpc/submit_question_candidate", {
      method: "POST",
      headers: {
        apikey: ANON_KEY,
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });
    const body = await res.json().catch(() => null);
    results.push({ candidateId: args.p_candidate_id, status: res.status, ok: res.ok, body });
    console.log(res.ok ? "OK  " : "FAIL", args.p_candidate_id, res.status, body);
  }
  const succeeded = results.filter((r) => r.ok).length;
  console.log("Done: " + succeeded + "/" + candidates.length + " submitted successfully.");
  console.log("Full results:", results);
})();
