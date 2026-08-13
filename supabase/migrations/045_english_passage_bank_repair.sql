-- Angel Digital 11+ — Migration 045
-- Educational Increment 007B — Wave 1 Production Activation, Part 1:
-- repairs an apparent partial application of migration 044.
--
-- Independent production verification (count=exact, cross-checked against
-- a known-good table from the same migration script) found: all 42
-- ali_question_bank rows from migration 044 are live and correct, but
-- public.ali_passage_bank shows 0 rows for all 6 Wave 1 passages.
--
-- Two hypotheses, genuinely indistinguishable via the anon key alone (the
-- same structural ambiguity this closure already encountered once with
-- ali_family_review, migrations 038/041/042): (1) the ali_passage_bank
-- INSERT in migration 044 did not persist, while the separate
-- ali_question_bank INSERT in the same script did — possible if the two
-- statements were executed as separate operations rather than one atomic
-- script; or (2) the rows exist but RLS is blocking anon visibility —
-- migration 043 deliberately left ali_passage_bank's RLS posture to
-- Founder Dashboard configuration, unlike ali_question_bank, which has
-- never had RLS enabled. This migration is written to be safe under
-- either hypothesis.
--
-- Idempotent: WHERE NOT EXISTS per passage id, so this is safe to run
-- once even if some or all 6 rows already exist via a path the anon key
-- cannot see. Does not touch ali_question_bank — the 42 question rows are
-- confirmed correct and are not re-inserted or modified.
--
-- Before applying: please check public.ali_passage_bank directly via
-- Supabase Table Editor (not the anon-key REST path) to see whether the
-- 6 rows are already there. If they are, this migration is a safe no-op.
-- If they are not, this migration adds them.
--
-- Run this in: Supabase Dashboard > SQL Editor > New query, as its own
-- standalone execution.

begin;

insert into public.ali_passage_bank
  (id, title, original_text, text_type, genre, word_count, reading_complexity,
   provenance, copyright_status, pathway, content_difficulty, content_version,
   eligibility_status, active, passage_family_id, review_state)
select v.id, v.title, v.original_text, v.text_type, v.genre, v.word_count, v.reading_complexity,
       v.provenance, v.copyright_status, v.pathway, v.content_difficulty, v.content_version,
       v.eligibility_status, v.active, v.passage_family_id, v.review_state
from (
  values
('wave1-eng-kitemaker', 'The Kite Maker',
   $passage$Grandad Owusu never rushed a kite. He said a kite built in a hurry would fly like it was built in a hurry: badly, and not for long. Every Saturday morning, while the rest of the house was still deciding whether to get up, he and Femi sat at the kitchen table with a pile of bamboo strips, a ball of string, and a stack of old newspapers that Grandad kept folded in a box marked, in faded pen, KITES ONLY.

Femi had watched him make a dozen kites before he was allowed to touch the bamboo himself. Grandad said this was not because Femi was too young, but because watching properly was its own kind of work. "Anyone can flap a kite about and call it flying," he told Femi, snipping a length of string with unhurried precision. "Only a few people notice why one kite climbs and another one drops into the hedge."

This Saturday, Grandad finally slid a bundle of bamboo strips across the table. "Your turn," he said. Femi's hands, usually so quick at video games, felt suddenly clumsy around the thin wood. He crossed two strips the way he had seen Grandad do it a hundred times, but the shape came out lopsided, one arm longer than the other.

He waited for Grandad to fix it. Grandad did not move.

"It's wrong," Femi said.

"It's a start," Grandad said. "Different thing entirely." He tapped the longer arm with one finger, not touching it, just pointing. "What do you notice?"

Femi looked. He measured the two arms with his eyes, then with his fingers. "This one's longer."

"So?"

"So it won't balance."

"So?"

Femi sighed, but he was smiling now, because this was the game Grandad always played, the one where he refused to simply say the answer. Femi trimmed the longer arm himself, checked it again, and this time the cross sat even. He looked up, half expecting praise, but Grandad only nodded once, as if Femi had merely confirmed something Grandad already knew.

It took Femi three more attempts before the frame held its shape without sagging. His fingers ached from pulling the string tight, and twice he had to unpick a knot that had gone stubborn and tangled. When the frame was finally finished, Grandad held it up to the window and turned it slowly, checking the balance against the light.

"Well," he said at last. "That'll fly."

Femi realised, watching Grandad's face, that this was the closest thing to a celebration he was going to get, and that somehow it was enough.$passage$,
   'narrative-extract', 'contemporary-realistic-fiction', 430, 'moderate',
   'angel_original', 'Angel original, unpublished; no external rights holder', array['csse'], 'medium', 1, 'provisional', true,
   'wave1-family-relationship-skill', null),
  ('wave1-eng-lastbus', 'The Last Bus',
   $passage$I had exactly six minutes to reach the bus stop on Ferry Road, and I was still four streets away when my shoelace came undone for the second time that morning.

I didn't stop. I told myself the lace could wait, the way you tell yourself lots of things can wait when you are already running. My bag thumped against my back with every stride, and somewhere inside it my recorder case was rattling loose against my water bottle, a sound that seemed, absurdly, to be counting down the minutes along with me.

At the corner of Wren Street I nearly collided with a man walking a dog nearly as tall as I was. He said something I didn't catch. I said sorry without really meaning it, because sorry was easier than stopping to explain that if I missed the 8:14 there would not be another bus for forty minutes, and forty minutes was exactly long enough to turn me from a girl who was occasionally a little late into a girl who had missed her audition entirely.

I could see the stop now, a low glass shelter with three people already waiting under it. I couldn't see the bus. That was something, at least. I slowed just slightly, enough to breathe, enough to feel my heart doing something urgent and uneven in my chest.

Then I saw it: a flash of red at the far end of Ferry Road, still small with distance, but unmistakably a bus, unmistakably mine.

I ran the last stretch properly then, lace flapping, bag thumping, arms pumping in a way that would have embarrassed me on any other morning. The three people at the stop turned to watch me coming, which embarrassed me anyway. I reached the shelter exactly as the bus doors hissed open, and for a moment I could not speak at all, could only stand there with my hands on my knees, gulping air like something that had been underwater too long.

The driver waited. He didn't have to, but he did, watching me in his mirror with an expression I couldn't read, somewhere between amusement and patience.

"Cutting it fine," he said, as I finally climbed the steps.

"Every time," I managed, and found, to my surprise, that I was laughing, actual proper laughing, the kind that comes when your body has been too frightened to laugh for the last six minutes and has finally been given permission.$passage$,
   'narrative-extract', 'contemporary-realistic-fiction', 408, 'moderate-high',
   'angel_original', 'Angel original, unpublished; no external rights holder', array['csse'], 'medium', 1, 'provisional', true,
   'wave1-family-tension-firstperson', null),
  ('wave1-eng-newgirl', 'The New Girl',
   $passage$Priya had rehearsed exactly what she would say when someone finally spoke to her. She had practised it twice in the mirror that morning, a short, breezy sentence about how she'd just moved from Leicester and wasn't it funny how every school smelled slightly of the same disinfectant. It was, she had decided, a good opening line: friendly, a little funny, not desperate.

By lunchtime she had not used it once.

She sat at the end of a long table in the dining hall, her tray positioned with unnecessary precision in front of her, and watched the room organise itself into groups she did not belong to. Nobody was unkind. That was almost the strangest part. A girl with a long plait had smiled at her in the corridor that morning, a genuine smile, and said "you're the new one, right?" before being swept away by a wave of friends before Priya could answer. It should have felt like an opening. Instead it felt like a door that had opened and closed again before she could step through it.

"You can sit with us, if you want."

Priya looked up. It was a boy from her form group, though she couldn't remember his name, gesturing vaguely at a half-empty table nearby. His tone was so casual that for a moment she wondered if he'd meant to say it to someone else entirely.

"Thanks," she said, and heard, with faint horror, that her voice had come out smaller than she'd intended.

She picked up her tray. Her carefully rehearsed sentence about Leicester and disinfectant surfaced in her mind, fully formed, ready to be used. She opened her mouth. What came out instead was, "Is the pasta usually this cold?"

The boy laughed, an easy, unbothered laugh, and said the pasta was always this cold, it was basically a school tradition by now, and somehow that was enough. Nobody had asked where she was from. Nobody needed to, not yet. She sat down at the edge of the group, said very little for the rest of lunch, and found, to her own surprise, that she didn't mind. It was, she thought, a start.$passage$,
   'narrative-extract', 'contemporary-realistic-fiction', 361, 'moderate-high',
   'angel_original', 'Angel original, unpublished; no external rights holder', array['csse'], 'medium', 1, 'provisional', true,
   'wave1-family-internal-external-contrast', null),
  ('wave1-eng-atticdoor', 'The Attic Door',
   $passage$The attic door had been painted shut for as long as Marcus could remember, its hinges buried under so many layers of old white gloss that it had stopped looking like a door at all and started looking like part of the wall. Nobody in the house had opened it in years. Nobody, until this particular wet Tuesday, had especially wanted to.

Marcus wanted to. He had wanted to for exactly eleven days, ever since his grandmother had mentioned, almost carelessly, that his great-grandfather's old travelling trunk was still up there somewhere, gathering dust and, in her words, "several decades' worth of nonsense nobody's had the courage to sort through."

He worked a flat-bladed knife into the seam where the door met the frame, feeling the old paint crack and splinter under the pressure. A fine white dust drifted down and settled on his sleeve. When the door finally gave way, it did so all at once, swinging inward with a groan so long and so mournful that Marcus half expected something to groan back.

Nothing did. The attic beyond was dim, lit only by a single grimy window at the far end, and thick with the particular smell of old houses: dust and damp wood and something sweetish underneath, like forgotten paper slowly turning to nothing. Shapes crouched under grey dust sheets, furniture from decades Marcus couldn't guess at, their outlines softened and strange.

He picked his way across the boards, testing each one before he trusted it with his full weight, until he reached a low shape in the far corner that seemed, unmistakably, trunk-shaped. He pulled the sheet away in one motion, sending a fresh cloud of dust spiralling into the grey light.

The trunk was smaller than he'd imagined, its leather straps cracked and pale, its brass corners dulled almost black with age. A tarnished padlock hung from the clasp, but when Marcus touched it, it simply fell open in his hand, as though it, too, had been waiting eleven days, or perhaps eleven years, for someone to finally come and ask.

He knelt in front of it for a long moment before he lifted the lid, savouring, in a way he couldn't quite explain, the last few seconds of not yet knowing.$passage$,
   'narrative-extract', 'contemporary-realistic-fiction', 377, 'high',
   'angel_original', 'Angel original, unpublished; no external rights holder', array['csse'], 'hard', 1, 'provisional', true,
   'wave1-family-descriptive-suspense', null),
  ('wave1-eng-raceday', 'Race Day',
   $passage$Two hours before the county relay, Ade was already at the track, jogging slow, deliberate laps to loosen muscles that did not need loosening, checking his spikes for the fourth time, running through the handover with an imaginary baton held out at exactly the right angle. He had a laminated card in his kit bag listing his split times for the last six meets, and he had read it twice already that morning, as if the numbers might have changed overnight.

Cass arrived forty minutes before the race, ate half a banana, and lay down on the grass with her cap over her eyes.

"You're not warming up," Ade said, not quite managing to keep the disapproval out of his voice.

"I warmed up on the walk here," Cass said, without moving the cap.

Ade found this deeply unconvincing, though he had learned, over two seasons of running the same relay leg as Cass, that arguing about it achieved nothing. She ran the way some people did crosswords: unbothered, half-distracted, and somehow, infuriatingly, faster than people who took it seriously.

When their event was finally called, Ade felt the familiar tightening in his chest, the one that had nothing to do with his lungs and everything to do with the six laminated split times folded in his pocket. Cass, jogging beside him to the start line, was humming something under her breath that he didn't recognise.

The gun went. Ade ran his leg exactly as planned, matching his practised splits almost to the second, and handed off cleanly to the third runner with the baton secure and his form textbook-perfect. He allowed himself, for the first time all morning, a small breath of relief.

Cass ran the anchor leg the way she seemed to do everything: as though the outcome had already been decided somewhere she wasn't especially interested in checking. She crossed the line first by four strides, not visibly out of breath, and spent the next several minutes being hugged by teammates who were considerably more excited about it than she appeared to be.

Ade watched her from a short distance, his own relief from moments earlier curdling slightly into something less comfortable. He had done everything right. She had simply won.$passage$,
   'narrative-extract', 'contemporary-realistic-fiction', 374, 'moderate',
   'angel_original', 'Angel original, unpublished; no external rights holder', array['csse'], 'medium', 1, 'provisional', true,
   'wave1-family-two-character-contrast', null),
  ('wave1-eng-lettertonana', 'A Letter to Nana',
   $passage$Dear Nana,

Mum says I have to write to you properly instead of just sending you funny videos, so here is a proper letter, even though I still think the videos were better.

Bristol is loud in a different way from home. Not louder exactly, just loud about different things. There is a market near our new flat that starts setting up at six in the morning, and for the first week I woke up every single day thinking someone was dismantling a small building directly under my window. Mum says I will stop noticing it eventually. I do not fully believe her yet, but she was right about the flat being bigger than it looked in the photos, so maybe she will be right about this too.

The first proper thing that happened was that I got lost on the way to school, on my actual first day, which is possibly the most embarrassing thing that has ever happened to me, and I am including the time I fell off the stage in Year 4. I took a left turn that I was extremely confident about and ended up outside a launderette instead of the school gates. A woman doing her washing pointed me the right way without laughing at me even once, which I appreciated more than she probably realised.

The second proper thing was that I made a friend, which happened much faster than I expected and in a way I did not expect at all. Her name is Yusra and she sits next to me in maths, and we started talking because I couldn't find my ruler and she lent me hers without me even having to ask properly, just sort of noticed and passed it over. That was three weeks ago. Now we walk to the bus stop together most days, and she has already taught me two very useful things: which teachers let you retake a test if you ask nicely, and exactly which bit of the playground wall is warmest to sit against at lunchtime, which matters more than you would think in October.

The third proper thing, and I promise this is the last one because Mum is telling me the postbox closes soon, is that I still miss home, but slightly less loudly than I did in September. I think that is allowed to be true at the same time as everything above.

Lots of love,
Dara$passage$,
   'narrative-extract', 'epistolary-fiction', 406, 'moderate',
   'angel_original', 'Angel original, unpublished; no external rights holder', array['csse'], 'medium', 1, 'provisional', true,
   'wave1-family-epistolary-sequence', null)
) as v(id, title, original_text, text_type, genre, word_count, reading_complexity,
       provenance, copyright_status, pathway, content_difficulty, content_version,
       eligibility_status, active, passage_family_id, review_state)
where not exists (
  select 1 from public.ali_passage_bank existing where existing.id = v.id
);

commit;
