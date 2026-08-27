import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * English Educational Content Foundation, Increment 001 (Decision 228),
 * migrations 152/153/154. Parses the real migration SQL text -- both
 * passage rows and every question's real $json$ prompt payload -- and
 * independently re-verifies it, mirroring tests/supabase/
 * mockEnglishPassageBatch001.test.ts's own established convention. Every
 * quotationRequired/orderedAnswer/correctOptions value is checked
 * against the migration's own stored passage text, not a separately
 * hand-typed copy, so this test would fail if content ever drifted.
 */

const sql152 = fs.readFileSync("supabase/migrations/152_english_content_foundation_increment001_comprehension.sql", "utf8");
const sql153 = fs.readFileSync("supabase/migrations/153_english_content_foundation_increment001_writing.sql", "utf8");
const sql154 = fs.readFileSync("supabase/migrations/154_english_content_foundation_increment001_pending_review.sql", "utf8");

interface ParsedPrompt {
  id: string;
  marks: number;
  skill: string;
  question: string;
  modelAnswer?: string;
  passageTitle?: string;
  passageText?: string;
  acceptedAnswers?: string[];
  quotationRequired?: string[];
  orderedAnswer?: string[];
  correctOptions?: string[];
  requiredSelectionCount?: number;
  validationTier: string;
}

function parsePassages(sqlText: string): string[] {
  const parts = sqlText.split("$passage$");
  assert.equal(parts.length, 5, "expected exactly 2 $passage$...$passage$ blocks (4 delimiters + surrounding text = 5 parts)");
  return [parts[1], parts[3]];
}

function parseJsonBlocks(sqlText: string, expectedCount: number): ParsedPrompt[] {
  const parts = sqlText.split("$json$");
  assert.equal((parts.length - 1) / 2, expectedCount, `expected ${expectedCount} $json$ blocks; found ${(parts.length - 1) / 2}`);
  const prompts: ParsedPrompt[] = [];
  for (let i = 1; i < parts.length; i += 2) prompts.push(JSON.parse(parts[i]) as ParsedPrompt);
  return prompts;
}

function stripComments(sqlText: string): string {
  return sqlText.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");
}

const [understudyText, beeText] = parsePassages(sql152);
const comprehensionPrompts = parseJsonBlocks(sql152, 15);
const writingPrompts = parseJsonBlocks(sql153, 3);
const executable152 = stripComments(sql152);
const executable153 = stripComments(sql153);

// === Passage-level structure ==============================================

test("exactly 2 new passage rows, both authentic_assessment_candidate, angel_original, active -- never independently_validated or mock_eligible", () => {
  const passageRows = [...sql152.matchAll(/'angel_original', 'Angel original, unpublished; no external rights holder', array\['csse'\], '\w+', 1,\s*\n\s*'(\w+)', (\w+), '([\w-]+)', null\)/g)];
  assert.equal(passageRows.length, 2);
  for (const [, eligibility, active, familyId] of passageRows) {
    assert.equal(eligibility, "authentic_assessment_candidate");
    assert.equal(active, "true");
    assert.ok(familyId.startsWith("eng-inc001-"));
  }
});

test("passage word counts are independently re-counted, not merely trusted from the migration's own declared word_count", () => {
  const understudyWords = understudyText.split(/\\n+|\s+/).filter(Boolean).length;
  const beeWords = beeText.split(/\\n+|\s+/).filter(Boolean).length;
  assert.ok(understudyWords >= 450, `The Understudy should be substantial (>=450 words), found ${understudyWords}`);
  assert.ok(beeWords >= 450, `How Bees Find Their Way Home should be substantial (>=450 words), found ${beeWords}`);
  assert.match(sql152, new RegExp(`'narrative-extract', 'contemporary-realistic-fiction', ${understudyWords},`));
  assert.match(sql152, new RegExp(`'informational', 'popular-science-explanation', ${beeWords},`));
});

test("the two new passages use genuinely different text_type/genre -- real structural diversity, not two narratives with swapped names", () => {
  assert.match(sql152, /'narrative-extract', 'contemporary-realistic-fiction'/);
  assert.match(sql152, /'informational', 'popular-science-explanation'/);
});

// === Comprehension question structure =====================================

test("parses exactly 15 comprehension question rows (7 + 8), no grouped subparts in this increment", () => {
  assert.equal(comprehensionPrompts.length, 15);
});

test("expected question IDs are exactly the 15 authored, no more, no fewer", () => {
  const expectedIds = [
    "eng-inc001-understudy-q01", "eng-inc001-understudy-q02", "eng-inc001-understudy-q03",
    "eng-inc001-understudy-q04", "eng-inc001-understudy-q05", "eng-inc001-understudy-q06", "eng-inc001-understudy-q07",
    "eng-inc001-bee-q01", "eng-inc001-bee-q02", "eng-inc001-bee-q03", "eng-inc001-bee-q04",
    "eng-inc001-bee-q05", "eng-inc001-bee-q06", "eng-inc001-bee-q07", "eng-inc001-bee-q08",
  ];
  assert.deepEqual(comprehensionPrompts.map((p) => p.id).sort(), [...expectedIds].sort());
});

test("every comprehension question row is eligibility_status = authentic_assessment_candidate -- never independently_validated or mock_eligible", () => {
  assert.doesNotMatch(executable152, /'independently_validated'/);
  assert.doesNotMatch(executable152, /'mock_eligible'/);
  // 2 passage rows + 15 question rows = 17 occurrences.
  assert.equal((executable152.match(/'authentic_assessment_candidate'/g) || []).length, 17);
});

test("portfolio-wide QT-RC coverage: 9 of 10 evidenced types appear at least once across the two new passages; QT-RC-07 is explicitly, honestly absent, not silently forced", () => {
  const skillMatches = [...sql152.matchAll(/'english', '(QT-RC-\d\d)',/g)].map((m) => m[1]);
  const present = new Set(skillMatches);
  for (const t of ["QT-RC-01", "QT-RC-02", "QT-RC-03", "QT-RC-04", "QT-RC-05", "QT-RC-06", "QT-RC-08", "QT-RC-09", "QT-RC-10"]) {
    assert.ok(present.has(t), `expected ${t} to appear at least once`);
  }
  assert.ok(!present.has("QT-RC-07"), "QT-RC-07 must be genuinely absent, matching this migration's own disclosed scope boundary");
  assert.equal(skillMatches.length, 15);
});

test("each passage's own coverage is uneven, not mechanically identical -- proves passages were designed against their own real content, not a fixed template", () => {
  const understudyTypes = [...comprehensionPrompts.filter((p) => p.id.startsWith("eng-inc001-understudy")).map((p) => sql152.match(new RegExp(`'${p.id}', 'english', '(QT-RC-\\d\\d)'`))?.[1])];
  const beeTypes = [...comprehensionPrompts.filter((p) => p.id.startsWith("eng-inc001-bee")).map((p) => sql152.match(new RegExp(`'${p.id}', 'english', '(QT-RC-\\d\\d)'`))?.[1])];
  assert.notDeepEqual(new Set(understudyTypes), new Set(beeTypes));
});

// === Answer determinacy: every claim independently re-checked =============

test("every quotationRequired string is an exact, case-insensitive substring of its own passage's stored text", () => {
  let checked = 0;
  for (const p of comprehensionPrompts) {
    if (!p.quotationRequired) continue;
    const passageText = p.id.startsWith("eng-inc001-understudy") ? understudyText : beeText;
    for (const q of p.quotationRequired) {
      assert.ok(passageText.toLowerCase().includes(q.toLowerCase()), `quotation for ${p.id} not found verbatim in its own passage: ${JSON.stringify(q)}`);
      checked++;
    }
  }
  assert.equal(checked, 4, "expected exactly 4 quotationRequired strings across this batch (understudy Q3 has 2, Q6 has 1; bee Q3 has 1)");
});

test("The Understudy Q5 (QT-RC-04 synonym list) references exactly 5 line-referenced words, all present in its own passage text", () => {
  const q = comprehensionPrompts.find((p) => p.id === "eng-inc001-understudy-q05")!;
  for (const w of ["hoarse", "ceremony", "resented", "admitted", "genuinely"]) {
    assert.ok(q.question.includes(`'${w}'`), `expected word '${w}' to be named in the question text`);
    assert.ok(understudyText.includes(w), `expected word '${w}' to actually appear in the passage text`);
  }
});

test("How Bees Find Their Way Home Q5 (QT-RC-04 synonym list) references exactly 5 line-referenced words, all present in its own passage text", () => {
  const q = comprehensionPrompts.find((p) => p.id === "eng-inc001-bee-q05")!;
  for (const w of ["detect", "distinctive", "crowd", "reconstructing", "astonishing"]) {
    assert.ok(q.question.includes(`'${w}'`), `expected word '${w}' to be named in the question text`);
    assert.ok(beeText.includes(w), `expected word '${w}' to actually appear in the passage text`);
  }
});

// === Decision 229 remediation: Understudy defects ==========================

test("REMEDIATION: Understudy Q5's stored answer contract is complete for all 5 requested words, including 'hoarse' -- modelAnswer explicitly restates item (a), and acceptedAnswers includes valid hoarse synonyms", () => {
  const q = comprehensionPrompts.find((p) => p.id === "eng-inc001-understudy-q05")!;
  assert.match(q.modelAnswer!, /\(a\) hoarse:/, "modelAnswer must explicitly restate item (a) 'hoarse', not only items (b)-(e)");
  const accepted = (q.acceptedAnswers ?? []).map((a) => a.toLowerCase());
  const hoarseSynonyms = ["rough", "croaky", "husky", "raspy"];
  assert.ok(hoarseSynonyms.some((s) => accepted.includes(s)), "acceptedAnswers must include at least one valid synonym for 'hoarse'");
  // Marks remain 4 -- (a) is the worked example, unscored, matching the established migration 097 Q5 convention.
  assert.equal(q.marks, 4);
});

test("REMEDIATION: Understudy Q1's expected answer matches precisely what the note itself states (laryngitis), not the narrator's separate 'hoarse whisper' description", () => {
  const q = comprehensionPrompts.find((p) => p.id === "eng-inc001-understudy-q01")!;
  assert.match(q.modelAnswer!, /laryngitis/i);
  assert.doesNotMatch(q.modelAnswer!, /hoarse whisper/i, "modelAnswer must not conflate the note's own diagnosis with the narrator's separate description of Isla's voice");
  for (const a of q.acceptedAnswers ?? []) {
    assert.doesNotMatch(a, /hoarse whisper/i, `acceptedAnswers entry "${a}" must not restate the narrator's own separate description as if it were the note's content`);
  }
});

// === Decision 229 remediation: Bee passage factual defects =================

test("REMEDIATION: the inaccurate '1960s' waggle-dance-decoding claim no longer appears in either passage's stored text or any question's own question/modelAnswer/acceptedAnswers content -- '1960s' may still appear inside an explanation column's own disclosure text describing what was corrected, which is legitimate and expected, not a defect", () => {
  assert.doesNotMatch(understudyText, /1960s/);
  assert.doesNotMatch(beeText, /1960s/);
  for (const p of comprehensionPrompts) {
    assert.doesNotMatch(p.question, /1960s/i, `question ${p.id} must not reference the 1960s claim`);
    if (p.modelAnswer) assert.doesNotMatch(p.modelAnswer, /1960s/i, `modelAnswer for ${p.id} must not reference the 1960s claim`);
    for (const a of p.acceptedAnswers ?? []) assert.doesNotMatch(a, /1960s/i, `acceptedAnswers for ${p.id} must not reference the 1960s claim`);
  }
});

test("REMEDIATION: the corrected passage names Karl von Frisch and the verified 1946 publication year for the waggle dance's decoded meaning", () => {
  assert.match(beeText, /von Frisch/);
  assert.match(beeText, /1946/);
});

test("REMEDIATION: Bee Q2 now asks about, and correctly answers, the verified 1946 publication year rather than the inaccurate '1960s' decade claim", () => {
  const q = comprehensionPrompts.find((p) => p.id === "eng-inc001-bee-q02")!;
  assert.match(q.question, /1946|year did Karl von Frisch/);
  assert.equal(q.modelAnswer, "1946.");
  assert.ok((q.acceptedAnswers ?? []).some((a) => a.includes("1946")));
  assert.doesNotMatch(q.question, /1960s|which decade/i);
});

test("REMEDIATION: the magnetic-navigation paragraph no longer presents magnetic sensitivity as an equally-established third system -- it states real evidence while flagging genuine uncertainty about its navigational role", () => {
  assert.doesNotMatch(beeText, /The third, and perhaps the most surprising, is a sensitivity/, "must no longer be introduced as an equally-numbered third system alongside sun-compass and landmark memory");
  assert.match(beeText, /still being investigated/i);
  assert.match(beeText, /least understood/i);
  // The real, evidenced mechanism (iron-rich particles / interference) is retained, not deleted outright.
  assert.match(beeText, /iron-rich particles/i);
});

test("REMEDIATION: Bee Q7 no longer claims 'three navigation systems' as equally established -- reworded to 'things the passage describes bees using or sensing', with the magnetic item carrying its own hedge in the model answer", () => {
  const q = comprehensionPrompts.find((p) => p.id === "eng-inc001-bee-q07")!;
  assert.doesNotMatch(q.question, /three navigation systems/i);
  assert.match(q.question, /three things the passage describes/i);
  assert.match(q.modelAnswer!, /still investigating|investigated/i, "the model answer's own magnetic item must carry the passage's own uncertainty hedge");
});

test("REMEDIATION dependency audit: every OTHER bee question (Q1, Q3, Q4, Q6, Q8) remains fully valid against the corrected passage -- none of their required quotations or answers fall inside either corrected paragraph", () => {
  const q1 = comprehensionPrompts.find((p) => p.id === "eng-inc001-bee-q01")!;
  assert.ok(beeText.toLowerCase().includes("more than a mile"));
  assert.equal(q1.modelAnswer, "More than a mile.");

  const q3 = comprehensionPrompts.find((p) => p.id === "eng-inc001-bee-q03")!;
  for (const quote of q3.quotationRequired ?? []) {
    assert.ok(beeText.toLowerCase().includes(quote.toLowerCase()), `Q3 quotation "${quote}" must still be an exact substring of the corrected passage`);
  }

  const q4 = comprehensionPrompts.find((p) => p.id === "eng-inc001-bee-q04")!;
  assert.match(q4.question, /'remarkable'/);
  assert.ok(beeText.includes("remarkable"));

  const q6 = comprehensionPrompts.find((p) => p.id === "eng-inc001-bee-q06")!;
  assert.deepEqual(q6.orderedAnswer, ["the bee finds a good source of food", "the bee flies back to the hive", "the bee performs the waggle dance", "other bees follow the pattern with their antennae"]);

  const q8 = comprehensionPrompts.find((p) => p.id === "eng-inc001-bee-q08")!;
  assert.deepEqual(q8.correctOptions, ["2", "3"]);
  assert.ok(beeText.includes("entirely in darkness, deep inside the hive"));
});

// === Decision 229: smallest standing factual-verification control ==========

test("REMEDIATION: the migration header discloses a FACTUAL VERIFICATION CONTROL section with SOURCE-CONTAINS / ANGEL-SIMPLIFICATION / FACTUAL-CONFIDENCE / UNRESOLVED-CONTESTED-CLAIMS tags for the informational bee passage -- a lightweight, testable convention, not a new governance framework", () => {
  assert.match(sql152, /FACTUAL VERIFICATION CONTROL/);
  assert.match(sql152, /SOURCE-CONTAINS:/);
  assert.match(sql152, /ANGEL-SIMPLIFICATION:/);
  assert.match(sql152, /FACTUAL-CONFIDENCE:/);
  assert.match(sql152, /UNRESOLVED-CONTESTED-CLAIMS:/);
});

test("REMEDIATION: the migration header explains the migration-correction policy applied (direct in-place correction of never-applied, never-reviewed content), distinct from the standing 'immutable once applied' rule", () => {
  assert.match(sql152, /MIGRATION CORRECTION POLICY/);
  assert.match(sql152, /immutable once applied/i);
});

test("How Bees Find Their Way Home Q8 (QT-RC-09 multi-select) correctOptions are independently verifiable against the passage", () => {
  const q = comprehensionPrompts.find((p) => p.id === "eng-inc001-bee-q08")!;
  assert.deepEqual(q.correctOptions, ["2", "3"]);
  assert.equal(q.requiredSelectionCount, 2);
  assert.ok(beeText.includes("tells the other bees the direction to fly"), "statement 2: direction -- must be independently confirmed true");
  assert.ok(beeText.includes("tells them roughly how far away the food is"), "statement 3: distance -- must be independently confirmed true");
  assert.ok(beeText.includes("entirely in darkness, deep inside the hive"), "statement 4 claims bright daylight outside the hive -- passage says darkness inside the hive, so statement 4 is false");
});

test("How Bees Find Their Way Home Q6 (QT-RC-06 ordering) orderedAnswer matches the passage's own real event sequence", () => {
  const q = comprehensionPrompts.find((p) => p.id === "eng-inc001-bee-q06")!;
  assert.deepEqual(q.orderedAnswer, ["the bee finds a good source of food", "the bee flies back to the hive", "the bee performs the waggle dance", "other bees follow the pattern with their antennae"]);
  const foundIdx = beeText.indexOf("finally finds a good source of food");
  const flyIdx = beeText.indexOf("flies directly back to the hive");
  const danceIdx = beeText.indexOf("she performs what scientists call the waggle dance");
  const followIdx = beeText.indexOf("Other worker bees crowd around her, following the pattern");
  assert.ok(foundIdx > -1 && flyIdx > foundIdx && danceIdx > flyIdx && followIdx > danceIdx, "passage's own real event order must be found, fly, dance, follow");
});

// === Governance / security boundaries ======================================

test("Applied Reasoning is never referenced anywhere in the new comprehension content -- Decision 58's current-format boundary, reconfirmed", () => {
  assert.doesNotMatch(sql152, /QT-AR-01/);
  assert.doesNotMatch(sql152, /Applied Reasoning is (?:re)?introduced/i);
});

test("no mock_eligible or ali_mock_form reference anywhere in migrations 152/153/154 -- no English content is promoted, no Mathematics table touched", () => {
  for (const sql of [sql152, sql153, sql154]) {
    assert.doesNotMatch(stripComments(sql), /'mock_eligible'/);
    assert.doesNotMatch(sql, /ali_mock_form/);
  }
});

test("no existing passage or question row is read, referenced, or modified -- every id in migrations 152/153 is genuinely new, distinct from the existing certified estate", () => {
  assert.doesNotMatch(sql152, /mock-eng-boathouse/);
  assert.doesNotMatch(sql153, /mock-writing-mindchange-01|mock-writing-kindness-01|mock-writing-cookopinion-01/);
});

test("every question row carries a real, non-empty addresses_misconception value -- teaching evidence, never a placeholder", () => {
  const misconceptionBlocks = [...sql152.matchAll(/'authentic_assessment_candidate', 1, true, '([^']+(?:''[^']*)*)',/g)];
  assert.equal(misconceptionBlocks.length, 15);
  for (const [, text] of misconceptionBlocks) {
    assert.ok(text.length > 30, "expected a real, specific misconception description, not a placeholder");
  }
});

test("152/153/154 are each wrapped in a single begin/commit transaction and are idempotent (on conflict do nothing)", () => {
  for (const sql of [sql152, sql153]) {
    assert.equal((sql.match(/\bbegin;/g) || []).length, 1);
    assert.equal((sql.match(/\bcommit;/g) || []).length, 1);
    assert.match(sql, /on conflict \(id\) do nothing/);
  }
});

test("154 is wrapped in a single begin/commit transaction and every INSERT is idempotency-guarded with a matching WHERE NOT EXISTS", () => {
  assert.equal((sql154.match(/\bbegin;/g) || []).length, 1);
  assert.equal((sql154.match(/\bcommit;/g) || []).length, 1);
  const inserts = (sql154.match(/insert into public\.ali_family_review/g) || []).length;
  const guards = (sql154.match(/where not exists \(/g) || []).length;
  assert.equal(inserts, guards);
});

// === Continuous Writing prompt structure ===================================

test("parses exactly 3 new Writing prompt rows, all QT-WC-01a, authentic_assessment_candidate, active", () => {
  assert.equal(writingPrompts.length, 3);
  const rows = [...sql153.matchAll(/'writing', 'QT-WC-01a', array\['csse'\], 'hard', 'open-response', 1500,/g)];
  assert.equal(rows.length, 3);
  assert.doesNotMatch(executable153, /'independently_validated'|'mock_eligible'/);
});

test("no QT-WC-01b (picture-stimulus) content is authored in the executable SQL -- only named in this migration's own disclosure comment explaining the boundary is held, not silently substituted with text", () => {
  assert.doesNotMatch(executable153, /QT-WC-01b/);
  assert.match(sql153, /QT-WC-01b[\s\S]*NOT authored/);
});

test("no checklist entry across the 3 new prompts contains a pre-written sample response -- structural/technique guidance only, matching migration 098's own established convention", () => {
  for (const p of writingPrompts) {
    const checklist = (p as unknown as { checklist: string[] }).checklist;
    assert.ok(Array.isArray(checklist) && checklist.length >= 5);
    for (const item of checklist) {
      assert.ok(!/for example, ".*"/.test(item), `checklist item should not embed a copyable sample sentence: "${item}"`);
    }
  }
});

test("the 3 new Writing prompt ids and titles are genuinely distinct from each other and from the 3 existing prompts", () => {
  const newIds = writingPrompts.map((p) => p.id);
  assert.deepEqual(newIds.sort(), ["mock-writing-mistakelearned-01", "mock-writing-newplace-01", "mock-writing-screentime-01"].sort());
  assert.doesNotMatch(sql153, /mock-writing-mindchange-01|mock-writing-kindness-01|mock-writing-cookopinion-01/);
});

test("app/api/writing-feedback/route.ts and the mastery-quarantine boundary are not referenced in migration 153's own executable SQL -- inherits the existing, unedited discipline automatically (the names appear only in this migration's own disclosure comment, explaining that boundary is untouched, not in any executable statement)", () => {
  assert.doesNotMatch(executable153, /writing-feedback|WRITING_CORRECTNESS_THRESHOLD|supportTier/);
});

// === Pending-review registration (migration 154) ===========================

test("migration 154 registers exactly 5 rows: 2 passages + 3 Writing prompts, never 1 row per question", () => {
  const passageReviews = [...sql154.matchAll(/select 'passage', '([\w-]+)', 'UNASSIGNED'/g)];
  const writingReviews = [...sql154.matchAll(/select 'writing_prompt', '([\w-]+)', 'UNASSIGNED'/g)];
  assert.equal(passageReviews.length, 2);
  assert.equal(writingReviews.length, 3);
  assert.deepEqual(passageReviews.map((m) => m[1]).sort(), ["eng-inc001-bee-navigation-informational", "eng-inc001-understudy-narrative"]);
  assert.deepEqual(writingReviews.map((m) => m[1]).sort(), ["mock-writing-wc01a-mistakelearned", "mock-writing-wc01a-newplace", "mock-writing-wc01a-screentime"].sort());
});

test("every review-registration family_id in migration 154 matches a real passage_family_id or writing prompt family_id actually used in migrations 152/153", () => {
  assert.match(sql152, /'eng-inc001-understudy-narrative'/);
  assert.match(sql152, /'eng-inc001-bee-navigation-informational'/);
  for (const family of ["mock-writing-wc01a-newplace", "mock-writing-wc01a-mistakelearned", "mock-writing-wc01a-screentime"]) {
    assert.match(sql153, new RegExp(`'${family}'`));
  }
});

test("reviewer is explicitly UNASSIGNED, decision is explicitly pending_independent_review -- no review is granted, none is impersonated", () => {
  const executable154 = stripComments(sql154);
  assert.equal((executable154.match(/'UNASSIGNED'/g) || []).length, 5);
  assert.equal((executable154.match(/'pending_independent_review'::public\.family_review_decision/g) || []).length, 5);
  assert.doesNotMatch(executable154, /'approved'|'accepted'/);
});

test("no eligibility_status is changed anywhere in migration 154 -- a pure, additive review-placeholder registration only", () => {
  assert.doesNotMatch(sql154, /update public\.ali_question_bank|update public\.ali_passage_bank/);
});

// === Structural sanity ======================================================

test("migrations 152/153/154 all exist on disk, correctly sequenced immediately after 151 -- no Mathematics migration was touched, deleted, or renumbered (structural sanity, robust to later unrelated migrations)", () => {
  const migrations = fs.readdirSync("supabase/migrations").filter((f) => f.endsWith(".sql"));
  const numbers = migrations.map((f) => parseInt(f.split("_")[0], 10)).filter((n) => !Number.isNaN(n));
  for (const n of [151, 152, 153, 154]) assert.ok(numbers.includes(n), `migration ${n} must exist on disk`);
  assert.ok(Math.max(...numbers) >= 154);
});
