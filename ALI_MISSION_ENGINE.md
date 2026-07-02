# ALI Mission Engine

**Phase:** ALI 1.3 — Daily Mission Intelligence. First user-facing feature fully powered by ALI. No new subjects, adaptive question banks, or pathways — this phase integrates existing Daily Mission logic with ALI's competency-level data, nothing else.

**Companion documents:** `ALI_LEARNING_MODEL.md` §4 (the design proposal this implements — narrowed in scope per this phase's explicit instruction, see §3 below), `ALI_VALIDATION_PROTOCOL.md` Finding 2 and `ALI_DECISION_LOG.md` Decision 24 (the problem this closes).

---

## 1. Mission prioritisation

`lib/adaptiveEngine.ts`'s `buildDailyMission()` ranks subjects by an `urgency()` score to pick the primary/secondary mission items. As of this phase, `urgency()` has two paths:

### ALI-native path (subjects with attempted competency data)

```
if weakCompetencies.length > 0:
    urgency = 140 + min(weakCompetencies.length × 5, 40)   # always beats "not-started" (80)
else:
    masteryRatio = masteredCompetencies.length / attemptedCompetencies.length
    if masteryRatio >= 0.8: urgency = 5    # maintain-only
    if masteryRatio >= 0.5: urgency = 30   # developing
    else:                   urgency = 60   # still building
```

This directly satisfies the four scope requirements:

1. **Genuine weak competencies receive the highest priority** — 140+ outranks every other band, including the legacy "not-started" flat 80.
2. **Recently mastered competencies gradually reduce in priority** — banded on mastery *ratio*, not a raw event or time decay: as more competencies become mastered, the subject's urgency steps down through 60 → 30 → 5. Validated end-to-end: a subject with zero mastery starts as the mission's **primary** item; by 50% mastery it has dropped out of both primary and secondary; at 100% it never re-enters the top slots.
3. **Never-attempted subjects remain important but cannot indefinitely outrank known weaknesses** — untouched subjects keep their existing flat-80 urgency (unchanged, see §3), but a weak-competency subject's 140+ band sits above it unconditionally.
4. **Balanced overall** — the ratio-based bands mean a subject doesn't get stuck at either extreme: full mastery drops it to a low-but-nonzero floor (still eligible for the "review" slot, which surfaces strong subjects to maintain), and partial progress genuinely lowers priority step by step rather than jumping straight to "irrelevant."

### Legacy path (every other subject, unchanged)

```
if status == "weak":        urgency = 100 + (100 - avgScore)
if status == "not-started": urgency = 80
if status == "developing":  urgency = 50 + (75 - avgScore)
else:                        urgency = 0
```

Byte-for-byte identical to the pre-Phase-1.3 formula. This is the fallback for every subject without real ALI data — which today means every subject except Verbal Reasoning, and even Verbal Reasoning itself before a student's first adaptive mock.

### Reason text

Mission item copy (`reasonText()`) is **unchanged** for every subject. A new, separate function — `aliReasonText()` — generates copy naming the specific weak competencies (e.g. *"Letter Codes and Sequences need reinforcement in Verbal Reasoning — focused practice here will lift the whole subject fastest."*) and is used **only** when `urgency()`'s ALI-native path found real weak competencies for that subject. This is a deliberate separate code path rather than a new branch inside `reasonText()` — see §2.

---

## 2. ALI integration — how the data actually gets there

Mission generation (`computeAdaptiveState(progress, report)`) is a synchronous, pure function — it cannot make a Supabase call. ALI's competency data lives in `ali_student_question_history`, which is async and Supabase-backed. The bridge:

1. **`lib/ali/weakness.ts`'s `deriveCompetencySignal(bank, history, subject)`** — a pure function computing `{ weakCompetencies, masteredCompetencies, attemptedCompetencies }` from a bank + history snapshot.
2. **`UserProgress.aliCompetencySignal`** (new, additive field, `types/ali/missionSignal.ts`) — a cached snapshot of that signal, keyed by subject, stored in the same localStorage `UserProgress` object every other bridge write already uses (ADAPTIVE_ASSESSMENT_ENGINE_IMPLEMENTATION_PLAN.md §0.5.3).
3. **`lib/progress.ts`'s `recordAliCompetencySignal(subject, signal)`** — writes the snapshot, exactly mirroring the existing `recordSkillResult`/`completeLesson` pattern.
4. **`app/mocks/adaptive/gl/page.tsx`** calls this once per completed mock, using a **local mirror** of the bank/history (`vrBankRef`/`vrHistoryRef`, kept in sync via the same pure `applyAttemptOutcome()` the real Supabase write uses) — so the signal is accurate even when the Supabase write itself is fire-and-forget or (as in this sandbox) unreachable.
5. **`lib/adaptiveEngine.ts`** reads `progress.aliCompetencySignal?.[subject]` directly — no new parameter threading needed, since `UserProgress` was already `buildDailyMission()`'s input.

This is the same "prefer ALI-native data where it exists" principle from `ALI_LEARNING_MODEL.md` §1, now implemented for one system.

---

## 3. Fallback behaviour — and where this phase deliberately narrowed the original proposal

`ALI_LEARNING_MODEL.md` §4.1 originally proposed a **breadth-dominance cap** — reducing "never-touched subject" urgency from a flat 80 down to ~45 once a student has explored a handful of subjects, applying to *every* subject including non-ALI ones. **This phase does not implement that.** The explicit scope instruction — "for non-ALI subjects, preserve existing behaviour" — is stricter than the full learning-model proposal, and this implementation honours the narrower instruction:

- The flat-80 "not-started" urgency is **completely unchanged**, for every subject, including Verbal Reasoning before it has any ALI data.
- The only new behaviour is the ALI-native branch, which only activates when `aliCompetencySignal[subject]` exists **and** has at least one attempted competency.
- An `aliCompetencySignal` entry with zero attempted competencies (e.g. bridge-written but nothing answered yet — not expected in practice, but the fallback rule is enforced) also falls through to the unchanged legacy formula.

**Verified, not assumed:** a regression check (thrown-away validation script, same pattern as prior phases) constructed a reference implementation of the pre-Phase-1.3 `urgency()` formula and confirmed the new code's output for a no-ALI-data student matches it exactly, subject-for-subject.

---

## 4. Future expansion to additional subjects

Nothing here is Verbal-Reasoning-specific by construction:

- `deriveCompetencySignal()` takes `bank`/`history`/`subject` as parameters — any future ALI-covered subject (Maths, English, etc., once they have a hand-tagged question bank per `QUESTION_AUTHORING_STANDARD.md`) calls the exact same function.
- `urgency()`'s ALI-native branch keys off `progress.aliCompetencySignal?.[s.subject]` generically — it doesn't hardcode `"verbal-reasoning"` anywhere.
- `COMPETENCY_LABELS` (the human-readable name lookup for `aliReasonText()`) is the one piece that needs extending per subject — a new subject's competency codes need their own label entries, the same one-time cost as VR's did.

**What's still needed before a second subject can light this up:** that subject needs its own ALI question bank (a full Slice-1-equivalent build, explicitly out of scope for ALI generally right now per the standing "quality before scale" principle) and its own adaptive mock route calling `recordAliCompetencySignal()` after each mock, mirroring `app/mocks/adaptive/gl/page.tsx`'s pattern exactly.

---

## Explicitly out of scope for this phase

- The `Math.max` score-ratcheting behaviour (`lib/progress.ts`'s `completeLesson()`) — identified as the deeper root cause (Decision 24) but explicitly preserved per this phase's safety instruction. Deferred to the future "Readiness Shadow Model" phase.
- Breadth-dominance capping for non-ALI subjects (`ALI_LEARNING_MODEL.md` §4.1's full proposal) — narrower scope taken instead, per explicit instruction (§3 above).
- Any change to Readiness, Parent Insights, Replay, or Confidence — `ALI_LEARNING_MODEL.md`'s other four proposed evolutions are untouched; this phase is Daily Missions only.
