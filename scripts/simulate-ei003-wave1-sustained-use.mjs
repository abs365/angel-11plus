// Educational Increment 003 Wave 1, §8 -- sustained-use simulation for the
// three touched families, using the REAL COOLDOWN_QUESTIONS thresholds and
// weighted-pool-sampling rule (unseen 3x, eligible-seen/weak-override 2x,
// mastered-resurface 1x) from lib/ali/selection.ts, and the REAL 20%
// weak-skill-reserve mechanism from the same file
// (`Math.max(1, Math.floor(count * 0.2))` on an 8-question Maths session).
//
// SCOPE, DISCLOSED: this models ONE family in isolation, under the
// deliberately conservative "worst-case concentration" assumption that
// every one of a session's weak-skill-reserved slots goes to THIS one
// family whenever it is the active weak skill -- i.e. the single most
// stressful, most repetition-prone scenario a real multi-family engine
// could produce for this family, not an average case. It is NOT a
// re-run of the full ~39-family adaptive engine (that would require
// simulating a whole synthetic learner's competency state across every
// Maths family at once, a materially larger undertaking out of this
// wave's bounded scope) -- disclosed here explicitly rather than
// overclaiming platform-wide coverage.
import { COOLDOWN_QUESTIONS } from "../lib/ali/selection.ts";

const MASTERED_RESURFACE_MULTIPLIER = 3; // lib/ali/selection.ts, not exported; value copied and disclosed here
const SESSION_SIZE_MATHS = 8; // lib/learningEngine/practiceContent.ts's established Maths session size
const WEAK_SKILL_RESERVE_SLOTS = Math.max(1, Math.floor(SESSION_SIZE_MATHS * 0.2)); // = 1, the real formula
const DAYS_PER_WEEK = 5;
const GLOBAL_QUESTIONS_PER_DAY = 20; // the Founder's own stated sustained-practice rate (all subjects)

function weightedPick(pool, random) {
  const totalWeight = pool.reduce((s, p) => s + p.weight, 0);
  let r = random() * totalWeight;
  for (const p of pool) {
    r -= p.weight;
    if (r <= 0) return p;
  }
  return pool[pool.length - 1];
}

function seededRandom(seed) {
  let state = seed;
  return () => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state / 0x7fffffff; };
}

/**
 * Simulates `sessions` daily draws of exactly WEAK_SKILL_RESERVE_SLOTS
 * questions from this one family's pool, applying the real cooldown gate
 * (global sequence distance, exactly as selection.ts computes it) and the
 * real unseen/eligible-seen/mastered-resurface weight tiers. Returns per-row
 * exposure counts and a running "distinct rows seen so far" curve.
 */
function simulateFamily(pool, sessions, random) {
  const state = pool.map((q) => ({ ...q, timesShown: 0, lastShownSeq: null, mastered: false }));
  let globalSeq = 0;
  const exposureLog = [];

  for (let day = 0; day < sessions; day++) {
    for (let slot = 0; slot < WEAK_SKILL_RESERVE_SLOTS; slot++) {
      globalSeq += 1; // this family's own draw itself advances the global sequence by 1 of that day's 20
      const unseen = state.filter((q) => q.timesShown === 0);
      const seen = state.filter((q) => q.timesShown > 0);

      const eligiblePool = [];
      for (const q of unseen) eligiblePool.push({ q, weight: 3, reason: "unseen" });
      for (const q of seen) {
        const threshold = COOLDOWN_QUESTIONS[q.difficulty] * (q.mastered ? MASTERED_RESURFACE_MULTIPLIER : 1);
        const distance = globalSeq - q.lastShownSeq;
        if (distance >= threshold) {
          eligiblePool.push({ q, weight: q.mastered ? 1 : 2, reason: q.mastered ? "mastered-resurface" : "eligible-seen" });
        }
      }
      // Never-zero fallback (matches exposureIntelligence.ts's own "never
      // permanently suppress" rule): if cooldown excludes everyone, fall
      // back to the single row with the greatest cooldown distance.
      const pickPool = eligiblePool.length > 0 ? eligiblePool : [{ q: state.reduce((a, b) => (a.lastShownSeq ?? -1) < (b.lastShownSeq ?? -1) ? a : b), weight: 1, reason: "forced-fallback" }];

      const picked = weightedPick(pickPool, random).q;
      picked.timesShown += 1;
      picked.lastShownSeq = globalSeq;
      // Simplified, disclosed mastery rule for this isolated simulation:
      // the real mastery.ts requires evidence across distinct SESSIONS
      // with a genuine correctness signal, not merely "seen N times" --
      // here, a row is treated as reaching the mastered-cooldown state
      // once shown 3 times (a conservative proxy for "this row is well
      // known"), which only affects how AGGRESSIVELY it is cooled down
      // afterward (3x threshold), never whether it is shown at all.
      if (picked.timesShown >= 3) picked.mastered = true;

      exposureLog.push({ day, candidateId: picked.candidateId, blueprintId: picked.blueprintId, timesShownSoFar: picked.timesShown });
    }
    globalSeq += GLOBAL_QUESTIONS_PER_DAY - WEAK_SKILL_RESERVE_SLOTS; // the rest of that day's practice (other subjects/families) still advances the global sequence
  }

  return { state, exposureLog };
}

function summarise(label, pool, weeks) {
  const sessions = weeks * DAYS_PER_WEEK;
  const { state, exposureLog } = simulateFamily(pool, sessions, seededRandom(777));
  const distinctRowsSeen = state.filter((q) => q.timesShown > 0).length;
  const exactRepeats = exposureLog.filter((e) => e.timesShownSoFar > 1).length;
  const totalExposures = exposureLog.length;
  const blueprintsTouched = new Set(exposureLog.map((e) => e.blueprintId)).size;
  const maxTimesAnyRowShown = Math.max(...state.map((q) => q.timesShown));
  const avgTimesShownAmongSeen = state.filter((q) => q.timesShown > 0).reduce((s, q) => s + q.timesShown, 0) / Math.max(distinctRowsSeen, 1);

  console.log(`  ${weeks}wk (${sessions} sessions, ${totalExposures} total exposures to this family): distinctRowsSeen=${distinctRowsSeen}/${pool.length}, blueprintsTouched=${blueprintsTouched}/${new Set(pool.map(q=>q.blueprintId)).size}, exactRepeatEvents=${exactRepeats} (${((exactRepeats/totalExposures)*100).toFixed(0)}%), maxTimesAnyRowShown=${maxTimesAnyRowShown}, avgTimesShownPerSeenRow=${avgTimesShownAmongSeen.toFixed(1)}`);
  return { weeks, distinctRowsSeen, poolSize: pool.length, blueprintsTouched, exactRepeats, totalExposures, maxTimesAnyRowShown, avgTimesShownAmongSeen };
}

import { readFileSync } from "node:fs";
const manifest = JSON.parse(readFileSync("scripts/output/ei003-wave1-manufactured-manifest.json", "utf8"));

for (const [familyId, data] of Object.entries(manifest.families)) {
  console.log(`\n########## ${familyId} ##########`);
  const beforePool = Array.from({ length: 4 }, (_, i) => ({ candidateId: `before-${i + 1}`, blueprintId: "single-shape", difficulty: "hard" }));
  const afterPool = data.candidates.map((c) => ({ candidateId: c.candidateId, blueprintId: c.blueprintId, difficulty: c.difficulty }));

  console.log(" BEFORE (real, live: 4 rows, 1 structural shape, all hard):");
  for (const weeks of [4, 12, 24]) summarise("before", beforePool, weeks);

  console.log(" AFTER (this wave's actual manufactured manifest: 24 rows, 6 blueprints):");
  for (const weeks of [4, 12, 24]) summarise("after", afterPool, weeks);
}
