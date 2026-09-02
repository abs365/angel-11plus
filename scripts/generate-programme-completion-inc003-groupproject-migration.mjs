// Angel Programme Completion, Increment 003 (Founder directive) — generator
// for migrations 193 (new dialogue-driven Comprehension passage + 6-question
// set, "Two Different Projects") and 194 (pending-independent-review
// registration). Mirrors the exact schema/eligibility pattern established by
// migration 152 and reused for migration 191 (Increment 001).
//
// Usage: node scripts/generate-programme-completion-inc003-groupproject-migration.mjs

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "..", "supabase", "migrations");

const PARAGRAPHS = [
  `Zara dropped her folder onto the table with a satisfying thud. "I've already sketched out the model," she said. "Cardboard houses, real flames -- well, orange tissue paper, obviously -- and I found a map of Pudding Lane from 1666. We could build the whole street."`,
  `Ben didn't look up from his phone. "Or," he said, "we could just... write it. Miss Okafor said a report was fine."`,
  `"A report is fine if you want a B," Zara said. "A model gets an A. You want an A, don't you?"`,
  `"I want a weekend," Ben muttered.`,
  `Zara frowned. "What's that supposed to mean?"`,
  `"Nothing." He finally put the phone down, but he didn't quite meet her eyes. "I just don't have loads of spare time right now, that's all."`,
  `"Nobody has loads of spare time. I've got swimming on Saturday morning and my cousin's birthday on Sunday, and I'm still saying let's build the model."`,
  `"Good for you," Ben said, and it came out sharper than he meant it to. He winced. "Sorry. I didn't mean it like that."`,
  `Zara sat back, studying him. He looked tired -- properly tired, not just school tired. "Ben. Is something going on?"`,
  `He hesitated long enough that she almost asked again. "My mum's back at the hospital this week. Just check-ups," he added quickly, seeing her face change. "She's fine. But my dad's doing extra shifts to cover it, so I've got Rosie after school most days until he's back for the weekend properly."`,
  `"Rosie's, what, four?"`,
  `"Three. She doesn't nap unless someone reads to her four times in a row, and she definitely doesn't sit still for cardboard house building." He almost smiled. "I wasn't trying to get out of it. I just can't promise a whole Saturday."`,
  `Zara was quiet for a moment. "Why didn't you just say that at the start?"`,
  `"Because 'I want a weekend' sounded better than 'my life's a bit much right now,'" Ben said, and shrugged like it didn't matter, even though it clearly did.`,
  `"Okay." Zara pulled the folder back towards her and turned to a blank page. "New plan. What if I build the model at mine, and you do the writing whenever you actually get five minutes -- on the bus, in the evenings, whatever works? You know more about the actual history anyway, you did that whole thing on the Monument in Year 5."`,
  `Ben looked at her properly for the first time since she'd sat down. "You'd really do the whole model yourself?"`,
  `"I like building things. You clearly don't have time to argue about it right now." She was already sketching a rough elevation of Pudding Lane. "Just don't disappear on the writing. Deal?"`,
  `"Deal," Ben said. Then, after a pause: "Thanks. For not just deciding I was being lazy."`,
  `"I did decide that, for about thirty seconds," Zara admitted. "Then you looked like you were about to fall asleep on the table, so I changed my mind."`,
];

const PASSAGE_TEXT = PARAGRAPHS.join("\n\n");
const WORD_COUNT = PASSAGE_TEXT.split(/\s+/).filter(Boolean).length;
const PASSAGE_ID = "eng-pc003-groupproject";
const PASSAGE_TITLE = "Two Different Projects";

const QUESTIONS = [
  { id: "eng-pc003-groupproject-q01", questionType: "QT-RC-01", difficulty: "easy", skill: "evidence", marks: 1, seconds: 60, transferClass: "ROUTINE",
    question: "According to the passage, what did Miss Okafor say about the project format?",
    modelAnswer: "That a report was fine.",
    acceptedAnswers: ["a report was fine", "she said a report was fine", "report was fine", "miss okafor said a report was fine"],
    misconception: "Confusing what Miss Okafor actually said (a report is fine) with Zara's own opinion about what gets the better grade." },
  { id: "eng-pc003-groupproject-q02", questionType: "QT-RC-01", difficulty: "easy", skill: "evidence", marks: 1, seconds: 60, transferClass: "ROUTINE",
    question: "According to the passage, how old is Ben's sister Rosie?",
    modelAnswer: "Three.",
    acceptedAnswers: ["three", "she is three", "she's three", "rosie is three", "3"],
    misconception: "Confusing Zara's guess ('Rosie's, what, four?') with Ben's own correction ('Three')." },
  { id: "eng-pc003-groupproject-q03", questionType: "QT-RC-02", difficulty: "medium", skill: "inference", marks: 2, seconds: 120, transferClass: "MIXED_TRANSFER",
    question:
      "What can you tell about how Ben is feeling at the start of the conversation, before he explains about Rosie and his mum? Use evidence from the passage to support your answer.",
    modelAnswer:
      "He seems tired, distracted and a little short-tempered -- he doesn't look up from his phone, gives short replies, and snaps 'Good for you' at Zara -- suggesting he is stressed or preoccupied rather than simply lazy or uninterested.",
    acceptedAnswers: [
      "tired", "distracted", "he seems tired", "not really listening", "he wasn't looking at her",
      "short with her", "snapped at her", "he seems stressed", "he seems annoyed", "he seems irritable",
      "reluctant to talk about it", "he didn't look up from his phone",
    ],
    misconception: "Concluding Ben is simply 'lazy' or 'doesn't care about the project' -- a surface reading the passage itself later overturns, rather than reading his short, distracted manner as a sign of something else going on." },
  { id: "eng-pc003-groupproject-q04", questionType: "QT-RC-03", difficulty: "medium", skill: "vocabulary", marks: 2, seconds: 90, transferClass: "ROUTINE",
    question: "Explain what Ben means when he says 'I want a weekend'.",
    modelAnswer:
      "He means he doesn't want to give up his whole weekend working on the project, because he already has a lot to deal with at home and needs some genuine free time.",
    acceptedAnswers: [
      "he doesn't want to spend the whole weekend on the project", "he wants free time", "he needs a break",
      "he doesn't have much spare time", "he wants some time to himself", "he has a lot going on",
      "he doesn't want to give up his weekend", "he needs time off", "he wants a break from everything",
    ],
    misconception: "Taking the phrase literally (that Ben simply wants two days off school) rather than understanding it as shorthand for needing genuine free time given everything else he is dealing with." },
  { id: "eng-pc003-groupproject-q05", questionType: "QT-RC-10", difficulty: "medium", skill: "inference", marks: 2, seconds: 120, transferClass: "ROUTINE",
    question:
      "The passage says Ben's 'Good for you' 'came out sharper than he meant it to', rather than simply having him say it in an unkind tone. What effect does this detail have on the reader's understanding of Ben?",
    modelAnswer:
      "It shows that Ben didn't mean to sound unkind -- the sharpness was accidental, caused by stress spilling out, not genuine annoyance at Zara. This helps the reader see he isn't really angry with her, just under pressure.",
    acceptedAnswers: [
      "he didn't mean to sound unkind", "it wasn't on purpose", "shows it was accidental",
      "he wasn't really angry at her", "shows he is under pressure", "shows he is stressed not angry",
      "it slipped out", "he regretted it", "he immediately said sorry", "shows he didn't mean it",
    ],
    misconception: "Reading 'Good for you' only as evidence that Ben is rude or dismissive, missing that the passage itself frames the sharpness as unintentional and immediately regretted." },
  { id: "eng-pc003-groupproject-q06", questionType: "QT-RC-02", difficulty: "medium", skill: "inference", marks: 3, seconds: 150, transferClass: "MIXED_TRANSFER",
    question:
      "What does the passage suggest about why Ben didn't explain his real reason for not wanting to spend the weekend on the project straight away? Use evidence from the passage to support your answer.",
    modelAnswer:
      "It suggests he felt embarrassed or didn't want to make a big deal of his situation -- he says 'I want a weekend' sounded better than admitting his life was 'a bit much right now', showing he wanted to seem normal rather than draw attention to his family's difficulties.",
    acceptedAnswers: [
      "he felt embarrassed", "he didn't want to make a big deal of it", "he didn't want to seem like he was making excuses",
      "he wanted to seem normal", "he didn't want people to worry about him", "sounded better than admitting",
      "he didn't want sympathy", "he didn't want to explain his home life", "he didn't want to make it a big thing",
    ],
    misconception: "Assuming Ben simply forgot to mention it or wasn't thinking clearly, rather than recognising the passage's own evidence that he made a deliberate choice to downplay his situation." },
];

function jsonPromptFor(q) {
  return JSON.stringify({
    id: q.id, marks: q.marks, skill: q.skill, question: q.question, modelAnswer: q.modelAnswer,
    passageTitle: PASSAGE_TITLE, passageText: PASSAGE_TEXT, acceptedAnswers: q.acceptedAnswers,
    validationTier: "TIER2_ACCEPTED_SET",
  });
}
function esc(s) { return s.replace(/'/g, "''"); }

function passageValues() {
  return `('${PASSAGE_ID}', '${esc(PASSAGE_TITLE)}',
 $passage$${PASSAGE_TEXT}$passage$,
 'narrative-extract', 'contemporary-realistic-fiction-dialogue-driven', ${WORD_COUNT}, 'moderate',
 'angel_original', 'Angel original, unpublished; no external rights holder', array['csse'], 'medium', 1,
 'authentic_assessment_candidate', true, 'eng-pc003-groupproject-narrative', null)`;
}

function questionRow(q) {
  const familyId = `eng-pc003-${q.questionType.toLowerCase()}-groupproject`;
  const competency =
    q.questionType === "QT-RC-01" || q.questionType === "QT-RC-07" || q.questionType === "QT-RC-08" || q.questionType === "QT-RC-09"
      ? "RC-01"
      : q.questionType === "QT-RC-03" || q.questionType === "QT-RC-04"
      ? "RC-03"
      : "RC-02";
  return `('${q.id}', 'english', '${q.questionType}', array['csse'], '${q.difficulty}', 'short-answer', ${q.seconds},
 $json$${jsonPromptFor(q)}$json$,
 '${esc(
   `Programme Completion Increment 003 (Founder directive). ${q.questionType}, competency ${competency}, passage "${PASSAGE_TITLE}". Answer independently checked against this migration's own stored passage text.`
 )}', 2, '${PASSAGE_ID}',
 '${familyId}', 'angel_original', 'authentic_assessment_candidate', 1, true, '${esc(q.misconception)}',
 '${q.transferClass}')`;
}

const migration193 = `-- Angel Digital 11+ — Migration 193
-- Angel Programme Completion, Increment 003 (Founder directive) — new
-- dialogue-driven Comprehension passage + question set.
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Founder's Increment 003 directive required ONE additional Reading
-- passage: "dialogue-driven contemporary fiction... not simply a normal
-- narrated story containing two lines of dialogue... Conversation should
-- carry a meaningful portion of character, information, tension,
-- inference, misunderstanding or differing perspective."
--
-- "Two Different Projects" — Zara and Ben, paired for a school history
-- project, disagree about scope (an ambitious model vs. a simple report).
-- The passage is almost entirely dialogue (19 of its paragraphs are direct
-- speech or a single speech-adjacent action beat; there is no narrator
-- exposition explaining anyone's feelings). The disagreement initially
-- reads as Ben being reluctant/lazy; the conversation itself gradually
-- reveals a genuine reason (his mother's hospital check-ups, covering
-- childcare for his younger sister) that Zara — and the reader — must
-- infer from what Ben says and does NOT say ("I want a weekend" instead
-- of explaining directly), not from narration stating it outright. The
-- resolution is a practical compromise reached through the dialogue
-- itself, with a small, undercutting joke in the closing line ("I did
-- decide that, for about thirty seconds") — deliberately NOT a narrator
-- stepping back to state a moral, per the Founder's explicit "avoid
-- formulaic moral resolution" instruction.
--
-- GENUINE STRUCTURAL DIVERSITY: distinct from every existing certified/
-- candidate Comprehension passage. "The Boat in the Boathouse" and "The
-- Understudy" are both narrated stories that CONTAIN dialogue; this
-- passage is a dialogue SCENE — narration is reduced to brief action/
-- speech-tag beats between exchanges, and the plot, character, and
-- misunderstanding are carried almost entirely by what the characters say
-- to each other. Distinct in genre and mode from "How Bees Find Their Way
-- Home" (informational) and "The Fossil Hunter of Lyme Regis"
-- (biographical-narrative, migration 191).
--
-- Six original questions, deliberately avoiding QT-RC-07 (already closed
-- for this increment's own portfolio via migration 191's Q4 in the prior
-- increment) rather than risking a second instance of that same
-- "explain how X's and Y's [noun] differ" sentence shape the Founder
-- specifically flagged as severely templated elsewhere in the estate:
--   Q1/Q2 — QT-RC-01 (direct retrieval)
--   Q3    — QT-RC-02 (justified interpretation, free-response — not the
--           "tick Yes/No + reasons" shape, matching migration 191's own
--           precedent of avoiding the unresolved tick-justify format)
--   Q4    — QT-RC-03 (phrase meaning in context — "I want a weekend")
--   Q5    — QT-RC-10 (word-choice/detail effect)
--   Q6    — QT-RC-02 (justified interpretation, free-response)
-- Mark contract: 1+1+2+2+2+3 = 11 marks. Q1/Q2 (single-fact retrieval) at
-- 1 mark each; Q4/Q5 (identify + explain a specific effect/meaning) at 2
-- marks each; Q3 (identify a state + evidence) at 2 marks; Q6 (identify a
-- more layered inference + evidence) at 3 marks — matching the mark-per-
-- cognitive-demand discipline the Founder's Q4 correction in migration
-- 191 established for this same increment's own portfolio.
-- Every question uses \`validationTier: "TIER2_ACCEPTED_SET"\`, the same
-- established, low-risk shape used throughout migrations 152/191.
--
-- ============================================================
-- ORIGINALITY / CONTENT STANDARD
-- ============================================================
-- Wholly original Angel writing; no real person, published work, or CSSE
-- passage was used as a source. Contemporary British English throughout
-- (Year 6 school setting, "Miss Okafor", "Pudding Lane", "the Monument in
-- Year 5" — a real, ordinary KS2 history-topic detail, not invented
-- trivia). The family's situation (a parent's hospital check-ups,
-- childcare pressure on an older sibling) is handled gently and
-- reassuringly ("Just check-ups... She's fine") — a plausible, age-
-- appropriate source of real-world pressure without distressing content.
-- Balanced, ordinary contemporary names; no stereotype, no quota-driven
-- naming pattern.
--
-- eligibility_status = 'authentic_assessment_candidate' on the passage and
-- all 6 questions, matching migration 152/191's own established entry
-- point. See migration 194 for the pending-independent-review placeholder
-- record — no review approval of any kind is granted by this migration.
--
-- Practice isolation: no existing ali_passage_bank or ali_question_bank
-- row is read, referenced, or modified. Every id below is new. No
-- mock_eligible or Mathematics Mock 1 row is touched. Migration 182 is
-- not referenced.
--
-- Idempotent: both INSERTs use "on conflict (id) do nothing".
--
-- NOT APPLIED. Generated for independent-reviewer and Founder inspection
-- via Supabase Dashboard > SQL Editor > New query.

begin;

insert into public.ali_passage_bank
  (id, title, original_text, text_type, genre, word_count, reading_complexity,
   provenance, copyright_status, pathway, content_difficulty, content_version,
   eligibility_status, active, passage_family_id, review_state)
values
${passageValues()}
on conflict (id) do nothing;

-- === "Two Different Projects" — 6 questions (QT-RC-01/02/03/10) ===
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
${QUESTIONS.map(questionRow).join(",\n\n")}
on conflict (id) do nothing;

commit;
`;

const migration194 = `-- Angel Digital 11+ — Migration 194
-- Angel Programme Completion, Increment 003 — Pending Independent Review
-- Registration for migration 193's new Comprehension content.
--
-- Registers "Two Different Projects" (passage + its complete 6-question
-- set) as awaiting an independent reviewer, following the SAME pattern
-- established by migrations 099/154 and corrected by migration 155/192 —
-- ONE row, keyed by the passage's own \`id\` column
-- ('${PASSAGE_ID}'), never by a separate \`passage_family_id\` value.
--
-- review_type = 'mock_english_passage_independent_review' — the same
-- value every Comprehension passage review target already uses. reviewer
-- is explicitly 'UNASSIGNED'. No row's eligibility_status changes
-- anywhere in this migration.
--
-- REQUIRES migration 193 to have already been applied — this migration's
-- own precondition explicitly checks for, and refuses without, the
-- passage existing with exactly its expected 6-question membership.
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor,
-- after (or together with) migration 193.

begin;

do $do$
declare
  v_passage_exists int;
  v_question_count int;
begin
  select count(*) into v_passage_exists
    from public.ali_passage_bank
    where id = '${PASSAGE_ID}' and eligibility_status = 'authentic_assessment_candidate' and active = true;
  if v_passage_exists <> 1 then
    raise exception 'Migration 194 refused: expected exactly 1 authentic_assessment_candidate, active passage row with id = ${PASSAGE_ID} (found %). Migration 193 must be applied first.', v_passage_exists;
  end if;

  select count(*) into v_question_count
    from public.ali_question_bank
    where learning_unit_id = '${PASSAGE_ID}' and eligibility_status = 'authentic_assessment_candidate' and active = true;
  if v_question_count <> 6 then
    raise exception 'Migration 194 refused: expected exactly 6 authentic_assessment_candidate, active questions with learning_unit_id = ${PASSAGE_ID} (found %).', v_question_count;
  end if;

  insert into public.ali_family_review
    (review_target_type, family_id, reviewer, decision, notes, review_type)
  select 'passage', '${PASSAGE_ID}', 'UNASSIGNED',
    'pending_independent_review'::public.family_review_decision,
    'ANGEL-PROGRAMME-COMPLETION-INC003 new content review: passage "${esc(PASSAGE_TITLE)}" + its complete 6-numbered-question comprehension set (${PASSAGE_ID}-q01..q06). Dialogue-driven structural diversity target.',
    'mock_english_passage_independent_review'
  where not exists (
    select 1 from public.ali_family_review
    where family_id = '${PASSAGE_ID}' and decision = 'pending_independent_review'
      and review_type = 'mock_english_passage_independent_review'
  );

  raise notice 'Migration 194: pending-independent-review placeholder registered (or already present) for ${PASSAGE_ID}.';
end $do$;

commit;
`;

writeFileSync(join(MIGRATIONS_DIR, "193_programme_completion_inc003_comprehension_groupproject.sql"), migration193, "utf8");
writeFileSync(join(MIGRATIONS_DIR, "194_programme_completion_inc003_pending_review.sql"), migration194, "utf8");
console.log("WORD_COUNT", WORD_COUNT);
console.log("Wrote 193 and 194.");
