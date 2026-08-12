-- Angel Digital 11+ — Migration 028
-- Angel Copy Quality Eradication and Prevention Gate — database-fed content
-- correction, part 2: `prompt` (jsonb) fields.
--
-- Companion to migration 027 (which fixes `explanation`). This migration
-- fixes em dash prose punctuation found inside the `prompt` jsonb column's
-- passageText / modelAnswer / workingSteps values for every active
-- (pathway = 'csse') English reading-comprehension and Mathematics row.
-- Every statement uses jsonb_set to touch only the one named key inside
-- `prompt` — `question`, `answer`, `marks`, `difficulty`, `skill`, `id` and
-- every other field are structurally untouched, so no answer, mark scheme
-- or question meaning is altered, only prose punctuation inside narrative/
-- marking text. Rewrites are natural rewrites (comma, colon, semicolon,
-- brackets, full stop), not mechanical dash-to-comma substitution, per the
-- Founder's explicit instruction — each was read and reworded individually.
--
-- Also includes the two `csse-founder-validation`-only rows ("The
-- Orchard") for the same reason migration 027 included their explanation
-- fields: cheap to fix, removes ambiguity, even though that pathway is not
-- reachable by real families (lib/activePathway.ts's REAL_PATHWAY_IDS
-- excludes it; app/learning-intelligence/founder-validation/csse/page.tsx
-- is explicitly "not learner-facing" in its own header comment).
--
-- Requires manual application: this project's anon key has SELECT-only
-- grants on ali_question_bank (verified directly, see migration 027).
-- Run this in: Supabase Dashboard > SQL Editor > New query
-- Wrapped in a transaction: if any statement below fails, everything
-- rolls back rather than leaving a partially-applied migration.

begin;

-- "The Lighthouse Mystery" passage — shared by eng-001-q1/q2/q3/q4.
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{passageText}', to_jsonb($pt$The wind whipped across the harbour as Mira pressed herself against the cold stone wall of the lighthouse. Three weeks had passed since the keeper had vanished, and still no explanation had emerged. The light continued to sweep the dark water in its steady, mechanical arc, indifferent to the mystery it illuminated.

She had found the notebook wedged behind a loose brick on the second landing, its pages dense with cramped handwriting, each entry growing more frantic than the last. The final entry simply read: "It knows I'm here."

Above her, the great lens hummed and revolved. Somewhere below, the sea answered with its patient, ancient rhythm. Mira turned the notebook over in her hands. Whatever had happened here, the lighthouse held its secrets close.$pt$::text))
where id in ('eng-001-q1', 'eng-001-q2', 'eng-001-q3', 'eng-001-q4');

update public.ali_question_bank
set prompt = jsonb_set(prompt, '{modelAnswer}', to_jsonb($ma$The writer creates an atmosphere of tension and unease. The phrase 'wind whipped' suggests a harsh, threatening environment, while 'the keeper had vanished' introduces mystery and danger. The lighthouse light is described as 'indifferent', suggesting that nature and machinery carry on despite the human drama, which makes the situation feel more isolated and chilling.$ma$::text))
where id = 'eng-001-q1';

update public.ali_question_bank
set prompt = jsonb_set(prompt, '{modelAnswer}', to_jsonb($ma$'Frantic' suggests the keeper was increasingly panicked, desperate and out of control. The word implies that his fear was growing over time, moving beyond calm worry into something far more urgent and uncontrolled.$ma$::text))
where id = 'eng-001-q2';

update public.ali_question_bank
set prompt = jsonb_set(prompt, '{modelAnswer}', to_jsonb($ma$The writer uses personification by giving the sea a human quality: the ability to 'answer', as if it is in conversation with the lighthouse. The words 'patient' and 'ancient' suggest that the sea has witnessed events like this before and is unmoved by them. This creates a sense of insignificance: the human mystery is small against the enormous, indifferent power of nature.$ma$::text))
where id = 'eng-001-q3';

update public.ali_question_bank
set prompt = jsonb_set(prompt, '{hint}', to_jsonb($h$Look at the personification: the sea 'answering'. What contrast does this create with the human drama?$h$::text))
where id = 'eng-001-q3';

update public.ali_question_bank
set prompt = jsonb_set(prompt, '{modelAnswer}', to_jsonb($ma$The writer uses contrast: the earlier entries are described as 'dense with cramped handwriting', but the final entry is only six words. This abruptness creates shock and dread: the keeper either had no time to write more, or was interrupted. The short sentence 'It knows I'm here' is more frightening because it is so direct and unexplained. The reader's imagination fills in what 'it' might be.$ma$::text))
where id = 'eng-001-q4';

-- "The Boy Who Collected Silence" passage — shared by eng-002-q1/q3.
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{passageText}', to_jsonb($pt$Everyone in Ashford knew that Leo collected things. Bottle caps, pressed leaves, stamps from countries he'd never visited. But what nobody knew, because he had never told anyone, was that his most prized collection could not be kept in boxes or catalogued on shelves.

Leo collected silences.

Not the absence of sound, exactly. There was the silence after a question nobody wanted to answer. The silence in the kitchen after his parents argued. The silence of a library on the first morning of the summer holidays, when it smelled of old paper and possibility. He kept these the way other people kept photographs: carefully, in order, for safekeeping.

"You're strange," his classmate Priya had once told him, though she meant it almost kindly.

"Everything worth understanding is strange," Leo replied, which she thought was probably true.$pt$::text))
where id in ('eng-002-q1', 'eng-002-q3');

update public.ali_question_bank
set prompt = jsonb_set(prompt, '{modelAnswer}', to_jsonb($ma$Leo comes across as thoughtful, observant and unusual. The fact that he collects 'silences' rather than physical objects shows he is sensitive to emotions and atmosphere: he notices things others overlook. His response to Priya, 'Everything worth understanding is strange', shows he is confident and philosophical for his age, suggesting intelligence and self-assurance despite being different.$ma$::text))
where id = 'eng-002-q1';

update public.ali_question_bank
set prompt = jsonb_set(prompt, '{modelAnswer}', to_jsonb($ma$The simile comparing his silences to photographs suggests Leo values his emotional memories as much as others value physical mementos. Photographs are kept to preserve moments, and by comparing his silences to them, the writer shows that Leo's emotional experiences are real and precious to him, even if invisible to others.$ma$::text))
where id = 'eng-002-q3';

-- "Letters from the Trenches" passage — shared by eng-003-q1/q3.
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{passageText}', to_jsonb($pt$My dear mother,

I am writing this in what passes for a quiet hour, though I use the word 'quiet' loosely. The guns are never entirely still, and one learns, in time, to hear them as a kind of weather, threatening but distant, like a storm that may or may not arrive.

We have been here three weeks now and I confess I no longer recognise the young man who left Coventry in September. I do not say this to worry you. I have found here a kind of resolve I did not know I possessed. The men beside me are extraordinary: ordinary men made extraordinary by circumstance.

Tell Father I am well. Tell him also that I have been thinking much about the workshop, and that when this business is finished, I intend to return to it with a greater appreciation for the smell of sawdust and the sound of wood being worked than I ever had before.

The stars here are remarkable, mother. I suspect they are the same stars you see above Coventry, but they look different from here, older and further away. I take comfort in knowing we share them.

Your loving son,
Thomas$pt$::text))
where id in ('eng-003-q1', 'eng-003-q3');

update public.ali_question_bank
set prompt = jsonb_set(prompt, '{modelAnswer}', to_jsonb($ma$Thomas means that the experience of war has transformed him: he has grown up quickly and changed fundamentally. He describes discovering 'a resolve I did not know I possessed', suggesting he has found inner strength he was unaware of before. He looks forward to ordinary things, sawdust and woodwork, with 'greater appreciation', showing he now values what he previously took for granted. War has made him more mature, reflective and grateful.$ma$::text))
where id = 'eng-003-q1';

update public.ali_question_bank
set prompt = jsonb_set(prompt, '{hint}', to_jsonb($h$Look at the whole letter: what does he say about himself, the men, and his plans? What does this reveal?$h$::text))
where id = 'eng-003-q1';

update public.ali_question_bank
set prompt = jsonb_set(prompt, '{modelAnswer}', to_jsonb($ma$1. He says 'I do not say this to worry you', directly acknowledging her concern and trying to pre-empt it. 2. He tells her to 'tell Father I am well', giving a clear, simple reassurance. 3. He ends with the image of shared stars, 'I take comfort in knowing we share them', creating a sense of connection across the distance to ease loneliness on both sides.$ma$::text))
where id = 'eng-003-q3';

-- Mathematics: one workingSteps entry uses a dash as punctuation.
update public.ali_question_bank
set prompt = jsonb_set(
  prompt,
  '{workingSteps,4}',
  to_jsonb('The 26th term is 101: the first term greater than 100'::text)
)
where id = 'mth-006';

-- Writing: one checklist entry uses a dash as punctuation.
update public.ali_question_bank
set prompt = jsonb_set(
  prompt,
  '{checklist,7}',
  to_jsonb('Formal register throughout: no slang, no contractions'::text)
)
where id = 'wrt-003';

-- ── csse-founder-validation only (not reachable by real families; fixed for consistency, lower priority) ──

update public.ali_question_bank
set prompt = jsonb_set(prompt, '{passageText}', to_jsonb($pt$Nadia stood at the top of the orchard, watching the storm roll in from the coast. Her cousin Ben was already halfway down the hill, jacket flapping, shouting something she couldn't hear over the wind. Their grandmother had told them to bring in the apples before the rain came, and Ben, typically, had turned it into a race.

Nadia moved more carefully, checking each tree as she passed. She had counted forty-three apples in the east row that morning, and she wasn't about to leave any behind. Ben, meanwhile, grabbed whatever he could reach and stuffed it into his basket without looking, more interested in beating the rain than filling it properly.

By the time the first heavy drops began to fall, Nadia's basket was neat and full. Ben's was half-empty, apples bruised where he'd dropped and caught them again. 'The sky's falling in,' he laughed, pointing at the clouds boiling grey above them, 'and you're still counting!'

Nadia didn't answer. She was thinking about what their grandmother always said: that the orchard rewarded patience, not speed. As the wind tore leaves from the branches and sent them spinning past her feet, she felt something she couldn't quite name: not fear exactly, but a kind of small, private thrill, as if the storm itself were testing whether she would rush.

They reached the kitchen door together, breathless, just as the rain turned the yard to mud behind them. Their grandmother looked at the two baskets (one careful and full, one scattered and half-empty) and said nothing at all. She didn't need to.$pt$::text))
where id in ('fv-eng-001-q1', 'fv-eng-001-q2', 'fv-eng-001-q3', 'fv-eng-001-q4', 'fv-eng-001-q5');

update public.ali_question_bank
set prompt = jsonb_set(prompt, '{modelAnswer}', to_jsonb($ma$It suggests Nadia treats the storm almost as a deliberate challenge to her patience rather than just bad weather; the personification shows her determination not to be rushed.$ma$::text))
where id = 'fv-eng-001-q4';

update public.ali_question_bank
set prompt = jsonb_set(prompt, '{modelAnswer}', to_jsonb($ma$Nadia: careful and methodical. She checked each tree, counted the apples, and finished with a full, neat basket. Ben: careless and rushed. He grabbed apples without looking and finished with a half-empty basket of bruised fruit.$ma$::text))
where id = 'fv-eng-001-q5';

commit;
