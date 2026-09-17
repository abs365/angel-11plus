---
name: angel-question-factory
description: Use when generating, validating, reviewing, or publishing new question content for Angel 11+ (any subject). Covers the governed candidate-generation-to-publication pipeline — the ONLY sanctioned content-generation architecture. Do not build a parallel generation mechanism.
---

# Angel — Question Factory

One architecture. Do not create a second generation system, even a small one-off script, without
checking `lib/ali/questionFactory/` first — it almost certainly already has the primitive you need.

## The governed pipeline

```
competency → family → blueprint library → controlled variants → deterministic correctness
  → structural/diversity gate → candidate store → human calibration → approval → publication
  → learner exposure → telemetry → factory improvement
```

## Publication is admin-gated — know your session's actual privileges before promising anything

- `submit_question_candidate()` and `publish_question_candidate()` require
  `is_current_user_admin() = true`. An anon/unauthenticated session **cannot publish** — this is a
  scope boundary, not a bug. Check `is_current_user_admin()` early and say plainly if a session
  can only stage, not publish.
- Never write directly to `ali_question_bank` or `ali_question_candidate` outside these RPCs.

## Building a new blueprint/family

1. **Read the real live rows for that family first** (or confirm it's genuinely new). Existing
   reasoning-route/representation/difficulty variety should inform new blueprints, not be ignored.
2. Every blueprint needs: `deriveCorrectAnswer` (deterministic, independently re-derivable — never
   trust the LLM's own arithmetic), `deriveWorkedSteps`, explicit `difficultyControls`,
   `reasoningRoute`/`representationType`/`contextTag` tags (used by the diversity gate and by
   `angel-educational-quality`'s Family Depth checks), and `provenance`.
3. Run the diversity gate (`lib/ali/questionFactory/diversityGates.ts`) before candidate store
   submission — don't hand-wave structural distinctness.
4. Verify deterministic correctness by **independently recomputing** the answer from the
   blueprint's own stated logic (not by re-running the same generation code) — mirrors the
   project's own `007i-maths-answer-verification.mjs` / `007l-model-verification.mjs` discipline.

## Submission → review → publication

1. Submit in small, family-grouped batches (proven pattern: 8 at a time), never one giant batch.
2. **Re-verify the marking contract against the STORED candidate**, fetched fresh from
   `ali_question_candidate` after submission — not the local source file. A prior incident (EI-003
   Wave 2) found the candidate-store round trip had silently stripped marking-critical fields;
   source validity does not guarantee stored validity.
3. Human review reads full content (question, evidence, accepted/model answers, blueprint
   fidelity) — automation passing is not sufficient grounds alone to approve.
4. Re-verify the marking contract a **third** time against the live production row, post-publish.
5. Confirm the production count delta matches exactly what was published (`qf-<id>-*` count),
   cross-checked against each family file's own documented pre-existing baseline.
6. Get at least one real-learner-path confirmation (not an admin-forced question ID) for at least
   one representative family per wave — the adaptive selector, not a manual override.

## Anti-memorisation, checked with real data, not assumption

- Passage/scenario concentration: no single passage/context should dominate a family
  disproportionately (Wave 3's own bar: largest single passage 18.75% was flagged, 7.5% was fine).
- Cross-check MODEL worked-example answers/scenarios (teaching content, not candidates) against
  **live** production answers in the same family — a collision hands the learner the answer.
