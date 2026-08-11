# Mock Centre Experience Blueprint

**Programme:** Angel Assessment Transformation Execution Programme — Mock Centre Experience Transformation
**Prepared:** 2026-08-11

---

## Purpose distinction (mandate §2), applied

LEARN → PRACTISE → **MOCK** (demonstrate readiness under realistic conditions) → **RESULTS** (what the evidence says) → **NEXT ACTION** (route back to Learn/Practise/a future Mock). Personalised Practice is a PRACTISE-purpose experience wearing a MOCK-page location — the single largest purpose violation on the current page, corrected by relocation (§3 below), not deletion.

## What the redesigned page must answer, in order

1. **Am I ready for a mock?** — the readiness card, three real states (`MOCK_READINESS_CAPABILITY_ASSESSMENT.md`).
2. **What should I do next?** — one real, evidence-derived recommended action (reusing `assessMockReadiness().nextAction`, unchanged).
3. **What mock should I take?** — the learner's own pathway, prioritised; other pathways reachable but secondary.

## Section-by-section design

### Header
"Mock Centre" + one honest sentence: "Test your progress when you're ready." No dash punctuation (Product Experience Standard V1 §9).

### Your Mock Readiness (CSSE only)
Shown only when `fetchLearnerIntelligenceProfile("csse")` resolves (i.e. only for the pathway with a real evidence model). Three states, plain language, no invented percentage:
- **Building foundations** — no evidence yet.
- **Keep practising** — evidence exists, a specific area is known to need work.
- **Ready for a mock** — evidence supports it (first mock or a further one).

For GL/CEM/ISEB, this section does not render at all — no fabricated readiness for a pathway with no underlying evidence model. Honest absence, not a placeholder.

### Recommended Next Step (CSSE only)
Directly reuses `assessMockReadiness().explanation` + `.nextAction` — the exact real text and href already approved and live on the Parent Dashboard. No new copy invented, no duplicate logic.

### Your Exam
Pathway-prioritised. For a learner with a selected pathway, that pathway's real mock experience is the one primary, full-width card. Every other pathway is available behind a clearly secondary, explicitly labelled "Explore another pathway" disclosure — collapsed by default, never removed (mandate §16: "Preserve all pathway capabilities").

For a learner with **no** selected pathway (the ambiguous case — `getSelectedPathwayId()` returns null), all four pathway cards are shown with equal weight, exactly as today — this is the one case where the current undifferentiated presentation is actually correct, since Angel genuinely does not yet know which exam to prioritise.

**CSSE card set, honestly scoped to what exists today:**
- **Full CSSE Mock** (`AVAILABLE`) — the one real, current CSSE mock experience (`/learning-intelligence/mock-exam`), presented with the approved real exam structure (English 60 minutes/60 marks, Mathematics 60 minutes/60 marks, ~10 minutes administrative allowance between papers where applicable, 120 marks total — mandate §8), with an honest, brief note that today's content is still expanding toward that full structure. The existing, already-approved in-page disclaimer on the mock-exam page itself is unchanged and unremoved.
- **Mathematics Mock, English Mock, Continuous Writing, Focused Assessment** (`COMING LATER`) — shown as a compact, non-card list (not four more full cards — mandate §7's "avoid decorative complexity"), each a single line naming the category and "Coming later," not clickable. This satisfies the mandate's §5 category framework honestly: named, not activated, not fabricated as available.

**GL/CEM/ISEB card:** one real card each, same simplified format, `AVAILABLE`, routing to the unchanged `/mocks/[pathway]` runner.

### Mock History
Simplified: mock name, date, outcome, whether this attempt improved on the pathway's own prior best (a real, already-derivable comparison — not a new calculation), and one recommended next action derived from the real result (correct → "Practise to build on this" / not yet strong → "Keep practising" — both linking to real, existing destinations). Founder Validation and legacy CSSE mock results remain excluded (`getMockResults()`, unchanged).

### About these mocks
Retained, trimmed to remove anything now redundant with the new readiness/recommendation sections above it.

## What is explicitly not built

Per the mandate's Implementation Boundary (§18): no mass content, no new educational algorithm, no Applied Reasoning, no fabricated Continuous Writing scoring, no replacement of any frozen engine. The "Nearly ready" and "Mock due" readiness states are not implemented (`MOCK_READINESS_CAPABILITY_ASSESSMENT.md`). Mathematics Mock, English Mock, Continuous Writing, and Focused Assessment are named but not activated.
