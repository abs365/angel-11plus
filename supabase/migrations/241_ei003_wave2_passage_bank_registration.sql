-- Angel Digital 11+ — Migration 241
-- Educational Increment 003, Wave 2 — bounded passage-bank registration.
--
-- Purpose: register the SIX approved, original EI003 Wave 2 English
-- passages into public.ali_passage_bank, and nothing else. This is the
-- single missing prerequisite blocking submit_question_candidate() for
-- the 40 already-designed, already-validated, already-human-reviewed
-- Wave 2 candidates (commit b3c6bfa) -- their
-- ali_question_candidate.passage_id foreign key
-- (ali_question_candidate_passage_id_fkey) requires each referenced
-- passage_id to already exist in this table, confirmed live via a real,
-- side-effect-free submission attempt that failed with Postgres error
-- 23503 for all 8 candidates in the first bounded batch (0/40 stored,
-- 0 residual rows -- see the Founder's own "BOUNDED PASSAGE REGISTRATION
-- REPAIR" instruction for full context).
--
-- Scope, explicitly bounded: this migration ONLY inserts into
-- ali_passage_bank, for exactly the six passage ids named below. It does
-- NOT submit, review, or publish any candidate; does NOT alter
-- submit_question_candidate(), publish_question_candidate(), RLS, or the
-- passage_id foreign key; does NOT modify any historical passage row.
--
-- Root cause / passage-registration contract, confirmed via direct
-- inspection of migration 043 (the original CREATE TABLE) and migration
-- 054 (which enabled RLS on ali_passage_bank with an admin-only SELECT
-- policy and explicitly NO insert/update/delete policy of any kind --
-- "Passage authoring and any correction remain Founder-applied
-- migrations, exactly as before"), and re-confirmed live: an
-- authenticated admin session's own attempted INSERT was rejected with
-- Postgres error 42501 ("new row violates row-level security policy"),
-- zero residual rows. Every existing passage in this table (34 rows as
-- of this writing) was registered the same way, via a direct,
-- Founder-applied SQL migration (precedent: migrations 044, 045, 049,
-- 051, 063, 097, 152, 161, 166, 191, and others) -- there has never been,
-- and still is not, any governed RPC for passage authoring. This
-- migration follows that exact precedent, most directly migration 045's
-- own idempotent, dollar-quoted-literal, WHERE NOT EXISTS pattern.
--
-- CRLF/LF integrity: this repository's own .gitattributes ("* text=auto")
-- combined with core.autocrlf=true on the authoring machine means a
-- committed .sql file's *working-directory* copy can carry different
-- line-ending bytes than its git-stored blob. The six passage texts
-- below were generated programmatically, directly from the same
-- lib/ali/questionFactory/ei003Wave2Passages.ts source the 40 candidates'
-- evidence quotes were themselves validated against (confirmed
-- byte-for-byte to already contain 0 CRLF sequences), and every literal
-- is additionally wrapped in regexp_replace(..., E'\r\n|\r', E'\n', 'g')
-- at comparison/assertion time as a second, defensive layer -- so this
-- migration's correctness does not depend on the exact bytes surviving
-- any copy/paste step untouched.
--
-- Fail-closed preconditions (no ON CONFLICT DO UPDATE anywhere in this
-- file): for each of the six target ids, if a row with that id ALREADY
-- exists, this migration verifies its title and (CRLF-normalised)
-- original_text match the expected passage exactly -- if they do not,
-- the whole migration raises an exception and rolls back rather than
-- silently reusing or overwriting a different passage under the same
-- id. Only once every precondition passes does the (idempotent, missing
-- rows only) insert run, followed by a postcondition assertion that all
-- six rows now exist with the expected material fields.
--
-- Deliberately left null (no fabricated value): content_difficulty and
-- reading_complexity (these six passages are written to support
-- questions spanning easy through challenge, so no single passage-level
-- difficulty label would be genuine -- two existing production rows,
-- eng-inc002-emperor-penguins and eng-inc002-journey-of-recycled-paper,
-- already use null for both, so this is a precedented choice, not a new
-- gap) and passage_family_id (Wave 2 designed an educational
-- family/blueprint taxonomy on a different axis -- wave3-fam-rc06-... --
-- and did not design an equivalent passage_family_id grouping; assigning
-- one now would be invented, not real, metadata).
--
-- eligibility_status is deliberately 'provisional' (the default for
-- every passage at registration, per migration 043 and every precedent
-- migration) -- promotion to practice_eligible is always a separate,
-- later, explicitly-governed step (precedent: migration 221), and is
-- NOT part of this migration's scope.
--
-- Word counts: computed programmatically from the same normalised text
-- being inserted (relay-baton 390, last-delivery 424, glass-frog 374,
-- clock-that-stopped 405, crossing-the-fen 392, attic-workshop 396).
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, per the existing
-- passage-registration precedent. Not applied by this task -- no
-- service-role credential was used, and no browser/RPC write was
-- attempted against this table (a live RLS-rejection probe independently
-- confirmed no such path exists, see this migration's own header above).

begin;

do $$
begin
  if exists (select 1 from public.ali_passage_bank where id = 'ei003-w2-eng-the-relay-baton') then
    if not exists (
      select 1 from public.ali_passage_bank
      where id = 'ei003-w2-eng-the-relay-baton'
        and title = 'The Relay Baton'
        and regexp_replace(original_text, E'\r\n|\r', E'\n', 'g') = regexp_replace($passage$Nadia had run the second leg of every relay since Year 4, and every time, the wait was the worst part. She stood at the changeover line watching Priya sprint towards her, the baton a small orange blur in her fist, and Nadia's own legs felt suddenly unfamiliar, as though she'd forgotten how they worked.

"Go!" someone shouted, though it wasn't yet her turn, and Nadia flinched before catching herself.

When Priya finally reached her, the handover was clumsy — the baton clipped Nadia's fingers before she managed to close her hand around it — but she was moving before she'd properly registered the mistake, arms pumping, the track opening out in front of her like something she'd run a thousand times, because she had. By the final bend she had closed the gap on the girl from Kestrel House, and she could hear her own breath now, ragged and loud, and somewhere behind that the distant sound of her team shouting something she couldn't make out.

She passed the baton to Marcus without looking at him, trusting his hand would be there, and it was. Then she stopped, hands on knees, and watched the rest of the race the way she always did afterwards: unable to look away, unable to do anything useful either.

Kestrel won by less than a second. Nadia straightened up slowly. Her team was already moving towards Marcus, who had crossed the line a stride behind, his shoulders low.

"Bad handover," Priya said quietly, coming to stand beside Nadia. "That was on me."

"It wasn't just you," Nadia said, though she wasn't sure that was true either. She thought of the baton clipping her fingers, of the half-second she'd lost fumbling for a proper grip.

Later, walking back to the changing rooms, Nadia noticed Marcus hanging slightly behind the rest of the group, kicking at loose gravel instead of talking to anyone. She slowed her own pace until she was walking beside him.

"You ran that last bend faster than Kestrel's anchor," she said. "I watched. You nearly had them."

Marcus didn't answer straight away. "Nearly," he said eventually, and kept his eyes on the gravel.

It was only that evening, unlacing her trainers at home, that Nadia realised she still had a faint red mark across two knuckles where the baton had struck them.$passage$, E'\r\n|\r', E'\n', 'g')
    ) then
      raise exception 'Migration 241 precondition failed: a row for id % already exists in ali_passage_bank but its title/text do not exactly match the expected EI003 Wave 2 passage -- refusing to proceed rather than silently reuse or overwrite a different passage.', 'ei003-w2-eng-the-relay-baton';
    end if;
  end if;
  if exists (select 1 from public.ali_passage_bank where id = 'ei003-w2-eng-the-last-delivery') then
    if not exists (
      select 1 from public.ali_passage_bank
      where id = 'ei003-w2-eng-the-last-delivery'
        and title = 'The Last Delivery'
        and regexp_replace(original_text, E'\r\n|\r', E'\n', 'g') = regexp_replace($passage$Grandad Kofi had driven the same milk round for thirty-one years, and Tobias had begged for months to come along on the very last one. Now, sitting up in the passenger seat of the small electric float, he wasn't sure what he'd expected — something more like a celebration, maybe, with people waving from doorsteps.

Instead, the round unfolded almost exactly like any other Tuesday. At the first house, Mrs Aldridge left a note under an empty bottle: TWO PINTS, NOT ONE, THANK YOU. Grandad Kofi read it, smiled slightly, and swapped the empties without comment. At the second, a dog Tobias didn't recognise barked twice from behind a fence and then lost interest entirely.

It was only at the sixth house, where an elderly man in a dressing gown was already waiting by the gate, that anything unusual happened.

"Last one today, is it, Kofi?" the man said.

"Last one ever, Mr Whitfield."

The man nodded slowly, as though he'd known this was coming for a long time, even though — Tobias would learn later — nobody had told him. "Thirty-one years," Mr Whitfield said. "You brought milk to my mother before you brought it to me."

Grandad Kofi didn't say anything to that. He just handed over the two bottles, same as always, and Mr Whitfield held them a moment longer than the exchange strictly required before turning back towards his door.

By the ninth house, the sky had gone the colour of weak tea, and Tobias had started keeping a private tally: houses where people were awake and houses where they weren't, dogs that barked and dogs that didn't, doors that opened and doors that stayed shut. Nobody, he noticed, said anything else about it being the last round. Nobody except Mr Whitfield had seemed to know.

At the final house on the route — a modest terrace with a bicycle propped against the wall — Grandad Kofi switched off the float's quiet motor and simply sat there for a moment before reaching for the crate.

"Is this the one you always finish on?" Tobias asked.

"Every single morning," Grandad Kofi said. "Same twenty-two houses, same order, for thirty-one years." He climbed out, set down two bottles, and stood looking at the house for a second longer than he needed to.

When he got back into the float, he didn't start the engine straight away. He sat with both hands resting on the wheel, looking out at the empty street ahead, and Tobias, watching him, decided not to ask anything else.$passage$, E'\r\n|\r', E'\n', 'g')
    ) then
      raise exception 'Migration 241 precondition failed: a row for id % already exists in ali_passage_bank but its title/text do not exactly match the expected EI003 Wave 2 passage -- refusing to proceed rather than silently reuse or overwrite a different passage.', 'ei003-w2-eng-the-last-delivery';
    end if;
  end if;
  if exists (select 1 from public.ali_passage_bank where id = 'ei003-w2-eng-the-glass-frog') then
    if not exists (
      select 1 from public.ali_passage_bank
      where id = 'ei003-w2-eng-the-glass-frog'
        and title = 'The Glass Frog''s Hidden Trick'
        and regexp_replace(original_text, E'\r\n|\r', E'\n', 'g') = regexp_replace($passage$Most animals that want to avoid being eaten rely on hiding, running, or looking dangerous. The glass frog, a small amphibian found in the rainforests of Central and South America, does something stranger: while it sleeps during the day, clinging to the underside of a leaf, much of its body becomes almost see-through.

The frog's skin itself is only partially transparent — the real trick lies deeper. Scientists studying glass frogs discovered that when the animal is resting, it pulls roughly ninety percent of its red blood cells out of general circulation and packs them tightly into its liver, hiding them behind a mirror-like lining. Blood is what makes most animal tissue appear solid and colourful; with so much of it tucked away, the frog's muscles and internal organs become significantly harder for a hungry bird or snake to pick out against a sun-dappled leaf.

The cost of this trick is considerable. Removing that much blood from circulation for hours at a time would cause serious problems for most animals — clots forming in blood that isn't moving, oxygen struggling to reach where it's needed. The glass frog appears to have evolved a way around both dangers, though researchers are still working out exactly how its liver manages to store such a concentrated mass of cells without triggering the clotting response seen in other species.

What makes the discovery particularly striking is timing. The frog does not stay transparent constantly; it becomes glass-like specifically during sleep, when stillness matters most for survival, and returns its blood to normal circulation the moment it wakes and needs full-strength muscles for jumping. In other words, the frog seems to trade a measurable physical risk for a matching survival benefit, and only for exactly as long as it needs to.

For now, the discovery has mostly reshaped how scientists think about camouflage itself. It had long been assumed that transparency in animals worked primarily through skin structure — thin, light-scattering tissue that bends light rather than reflecting it. The glass frog shows that an animal can achieve much the same effect through an entirely different route: not by changing what its skin is made of, but by managing, with remarkable precision, what is allowed to flow beneath it.$passage$, E'\r\n|\r', E'\n', 'g')
    ) then
      raise exception 'Migration 241 precondition failed: a row for id % already exists in ali_passage_bank but its title/text do not exactly match the expected EI003 Wave 2 passage -- refusing to proceed rather than silently reuse or overwrite a different passage.', 'ei003-w2-eng-the-glass-frog';
    end if;
  end if;
  if exists (select 1 from public.ali_passage_bank where id = 'ei003-w2-eng-the-clock-that-stopped') then
    if not exists (
      select 1 from public.ali_passage_bank
      where id = 'ei003-w2-eng-the-clock-that-stopped'
        and title = 'The Clock That Stopped'
        and regexp_replace(original_text, E'\r\n|\r', E'\n', 'g') = regexp_replace($passage$I was eleven when my grandmother taught me to mend a clock, and I still remember exactly which one: a heavy mantel clock with a cracked face that had stopped, according to family legend, on the afternoon my great-grandfather left for the war and never been persuaded to run properly since.

"Everyone in this family thinks it's broken," she told me, setting it on newspaper spread across the kitchen table. "Nobody's ever actually opened it up to check."

I expected this to take an afternoon. It took most of that summer. We worked on it most Sunday mornings, my grandmother naming each tiny brass part as though introducing me to relatives — the escapement, the mainspring, the pallet fork — and I learned to hold my breath while threading a screwdriver into gaps barely wider than the tool itself.

There were setbacks. Twice I dropped a spring and watched it disappear beneath the dresser, and once, three weeks in, we discovered an entire gear installed backwards, which meant undoing nearly everything we'd done to that point. My grandmother never seemed frustrated by this, only mildly interested, the way she might examine a puzzle with an unexpected extra piece.

By August, the clock still didn't run. I remember feeling, by then, that we'd failed — that the family legend would remain true, whatever the real mechanical reason for its silence. My grandmother didn't seem to share this feeling. She kept adjusting, testing, listening to the mechanism with her ear pressed close to the case as though it might tell her something the rest of us couldn't hear.

It started running on a Tuesday, with no ceremony at all. I wasn't even in the room. I heard it from the hallway — a small, dry ticking, unfamiliar because none of us had ever heard it — and ran back in to find my grandmother sitting exactly where she always sat, watching the second hand complete its first full circuit in over sixty years.

"There," she said, as though she'd expected this outcome the entire time, though I've never been sure she really did.

I think about that clock now whenever something in my own life refuses to work the way I expect, and someone tells me it's simply broken, always was, always will be. I think about the gear installed backwards for who knows how many decades, silently wrong, waiting for someone with enough patience to notice.$passage$, E'\r\n|\r', E'\n', 'g')
    ) then
      raise exception 'Migration 241 precondition failed: a row for id % already exists in ali_passage_bank but its title/text do not exactly match the expected EI003 Wave 2 passage -- refusing to proceed rather than silently reuse or overwrite a different passage.', 'ei003-w2-eng-the-clock-that-stopped';
    end if;
  end if;
  if exists (select 1 from public.ali_passage_bank where id = 'ei003-w2-eng-crossing-the-fen') then
    if not exists (
      select 1 from public.ali_passage_bank
      where id = 'ei003-w2-eng-crossing-the-fen'
        and title = 'Crossing the Fen'
        and regexp_replace(original_text, E'\r\n|\r', E'\n', 'g') = regexp_replace($passage$The guide, a weathered man named Onyema who had walked the causeway more times than he could count, warned us before we set out that the fen changed with every high tide, and that a path safe at dawn could be treacherous by noon.

We left the village while the mist still sat low over the reed beds, following a route marked only by occasional wooden stakes driven into the mud, half of them leaning at angles that suggested the ground itself was shifting beneath them. Within the first hour, the solid track gave way to something softer — a network of narrow ridges between channels of standing water, each ridge barely wide enough for one boot at a time.

"Step where I step," Onyema said, not turning round. "Not where it looks driest. Looks and is are different things out here."

I understood what he meant within twenty minutes, when Priti, walking just ahead of me, put her weight on a patch of ground that appeared entirely solid and sank almost to her knee before anyone could react. She laughed it off, though I noticed she moved more carefully afterwards, testing each step before committing her full weight.

By midday the mist had burned away entirely, and the fen revealed itself properly: an enormous flat expanse of reed and water stretching to a horizon broken only by the distant shapes of wading birds, dozens of them, motionless as though waiting for something. Onyema pointed out a channel where, he said, the water ran fresh from an underground spring even in the driest months, and another, barely twenty metres further on, where the water was brackish enough to kill any plant unlucky enough to root there.

The final stretch was the hardest. The ridges narrowed further, and twice we had to wade through shallow channels where the mud pulled at our boots with a strength that seemed almost deliberate. Onyema never once consulted a map or a compass; he read the ground itself, the particular green of certain reeds, the angle of light on standing water, in a way none of us could follow even after he pointed it out.

We reached solid ground on the far side just as the tide, exactly as promised, began sliding back in behind us, filling the ridges we had crossed less than an hour before.$passage$, E'\r\n|\r', E'\n', 'g')
    ) then
      raise exception 'Migration 241 precondition failed: a row for id % already exists in ali_passage_bank but its title/text do not exactly match the expected EI003 Wave 2 passage -- refusing to proceed rather than silently reuse or overwrite a different passage.', 'ei003-w2-eng-crossing-the-fen';
    end if;
  end if;
  if exists (select 1 from public.ali_passage_bank where id = 'ei003-w2-eng-the-attic-workshop') then
    if not exists (
      select 1 from public.ali_passage_bank
      where id = 'ei003-w2-eng-the-attic-workshop'
        and title = 'The Attic Workshop'
        and regexp_replace(original_text, E'\r\n|\r', E'\n', 'g') = regexp_replace($passage$The attic had not been cleared in years, and it showed in the particular way dust had settled — not evenly, but in soft grey drifts along the tops of things, thickest where objects had gone longest untouched. Light came in through one small window at the far end, filtered through cobwebs strung between the frame and an old birdcage that no bird had occupied in living memory, and what light did get through arrived thin and the colour of weak honey, pooling on the floorboards in a single narrow strip that moved, almost imperceptibly, as the afternoon wore on.

Along the left wall stood a workbench, its surface scarred with decades of small cuts and stains, tools still hanging from hooks above it in an order that suggested someone had once cared exactly where each one lived: a plane, a set of chisels graduated by size, a coil of wire gone the dull green-brown of old copper. Sawdust had settled into every seam of the wood, so old now it had lost any smell at all, and a half-finished birdhouse sat exactly where it had been abandoned, one wall still unattached, leaning against the others like something caught mid-sentence.

The rest of the space was a slower kind of chaos — trunks stacked two and three high, their leather straps cracked and pale; a dressmaker's mannequin draped in a sheet that had slipped to reveal one shoulder, oddly human in the low light; a stack of newspapers so old the print had faded to a uniform grey, their headlines no longer legible even to someone determined to read them. Somewhere beneath all of it, a floorboard creaked with a specific, complaining note whenever weight shifted near the window, as though the house itself remembered every visit.

The air held a particular smell that belonged to no single object but to all of them together: old wood, old paper, the faint mineral trace of dust itself, and beneath it something sweeter and harder to place, perhaps the ghost of varnish applied to that birdhouse decades before it was ever finished.

Nothing in the room had been designed to be seen this way, gathered and left, and yet the effect — accidental, unplanned — was somehow more complete than any deliberately arranged display could have managed: an entire vanished routine, preserved exactly at the moment it stopped.$passage$, E'\r\n|\r', E'\n', 'g')
    ) then
      raise exception 'Migration 241 precondition failed: a row for id % already exists in ali_passage_bank but its title/text do not exactly match the expected EI003 Wave 2 passage -- refusing to proceed rather than silently reuse or overwrite a different passage.', 'ei003-w2-eng-the-attic-workshop';
    end if;
  end if;
end$$;

insert into public.ali_passage_bank
  (id, title, original_text, text_type, genre, word_count, reading_complexity,
   provenance, copyright_status, pathway, content_difficulty, content_version,
   eligibility_status, active, passage_family_id, review_state)
select v.id, v.title, v.original_text, v.text_type, v.genre, v.word_count, v.reading_complexity,
       v.provenance, v.copyright_status, v.pathway, v.content_difficulty, v.content_version,
       v.eligibility_status, v.active, v.passage_family_id, v.review_state
from (
  values
  ('ei003-w2-eng-the-relay-baton', 'The Relay Baton',
   $passage$Nadia had run the second leg of every relay since Year 4, and every time, the wait was the worst part. She stood at the changeover line watching Priya sprint towards her, the baton a small orange blur in her fist, and Nadia's own legs felt suddenly unfamiliar, as though she'd forgotten how they worked.

"Go!" someone shouted, though it wasn't yet her turn, and Nadia flinched before catching herself.

When Priya finally reached her, the handover was clumsy — the baton clipped Nadia's fingers before she managed to close her hand around it — but she was moving before she'd properly registered the mistake, arms pumping, the track opening out in front of her like something she'd run a thousand times, because she had. By the final bend she had closed the gap on the girl from Kestrel House, and she could hear her own breath now, ragged and loud, and somewhere behind that the distant sound of her team shouting something she couldn't make out.

She passed the baton to Marcus without looking at him, trusting his hand would be there, and it was. Then she stopped, hands on knees, and watched the rest of the race the way she always did afterwards: unable to look away, unable to do anything useful either.

Kestrel won by less than a second. Nadia straightened up slowly. Her team was already moving towards Marcus, who had crossed the line a stride behind, his shoulders low.

"Bad handover," Priya said quietly, coming to stand beside Nadia. "That was on me."

"It wasn't just you," Nadia said, though she wasn't sure that was true either. She thought of the baton clipping her fingers, of the half-second she'd lost fumbling for a proper grip.

Later, walking back to the changing rooms, Nadia noticed Marcus hanging slightly behind the rest of the group, kicking at loose gravel instead of talking to anyone. She slowed her own pace until she was walking beside him.

"You ran that last bend faster than Kestrel's anchor," she said. "I watched. You nearly had them."

Marcus didn't answer straight away. "Nearly," he said eventually, and kept his eyes on the gravel.

It was only that evening, unlacing her trainers at home, that Nadia realised she still had a faint red mark across two knuckles where the baton had struck them.$passage$,
   'narrative-extract', 'fiction_narrative', 390, null,
   'angel_original', 'Angel original, unpublished; no external rights holder', array['csse'], null, 1, 'provisional', true,
   null, null),
  ('ei003-w2-eng-the-last-delivery', 'The Last Delivery',
   $passage$Grandad Kofi had driven the same milk round for thirty-one years, and Tobias had begged for months to come along on the very last one. Now, sitting up in the passenger seat of the small electric float, he wasn't sure what he'd expected — something more like a celebration, maybe, with people waving from doorsteps.

Instead, the round unfolded almost exactly like any other Tuesday. At the first house, Mrs Aldridge left a note under an empty bottle: TWO PINTS, NOT ONE, THANK YOU. Grandad Kofi read it, smiled slightly, and swapped the empties without comment. At the second, a dog Tobias didn't recognise barked twice from behind a fence and then lost interest entirely.

It was only at the sixth house, where an elderly man in a dressing gown was already waiting by the gate, that anything unusual happened.

"Last one today, is it, Kofi?" the man said.

"Last one ever, Mr Whitfield."

The man nodded slowly, as though he'd known this was coming for a long time, even though — Tobias would learn later — nobody had told him. "Thirty-one years," Mr Whitfield said. "You brought milk to my mother before you brought it to me."

Grandad Kofi didn't say anything to that. He just handed over the two bottles, same as always, and Mr Whitfield held them a moment longer than the exchange strictly required before turning back towards his door.

By the ninth house, the sky had gone the colour of weak tea, and Tobias had started keeping a private tally: houses where people were awake and houses where they weren't, dogs that barked and dogs that didn't, doors that opened and doors that stayed shut. Nobody, he noticed, said anything else about it being the last round. Nobody except Mr Whitfield had seemed to know.

At the final house on the route — a modest terrace with a bicycle propped against the wall — Grandad Kofi switched off the float's quiet motor and simply sat there for a moment before reaching for the crate.

"Is this the one you always finish on?" Tobias asked.

"Every single morning," Grandad Kofi said. "Same twenty-two houses, same order, for thirty-one years." He climbed out, set down two bottles, and stood looking at the house for a second longer than he needed to.

When he got back into the float, he didn't start the engine straight away. He sat with both hands resting on the wheel, looking out at the empty street ahead, and Tobias, watching him, decided not to ask anything else.$passage$,
   'narrative-extract', 'fiction_narrative', 424, null,
   'angel_original', 'Angel original, unpublished; no external rights holder', array['csse'], null, 1, 'provisional', true,
   null, null),
  ('ei003-w2-eng-the-glass-frog', 'The Glass Frog''s Hidden Trick',
   $passage$Most animals that want to avoid being eaten rely on hiding, running, or looking dangerous. The glass frog, a small amphibian found in the rainforests of Central and South America, does something stranger: while it sleeps during the day, clinging to the underside of a leaf, much of its body becomes almost see-through.

The frog's skin itself is only partially transparent — the real trick lies deeper. Scientists studying glass frogs discovered that when the animal is resting, it pulls roughly ninety percent of its red blood cells out of general circulation and packs them tightly into its liver, hiding them behind a mirror-like lining. Blood is what makes most animal tissue appear solid and colourful; with so much of it tucked away, the frog's muscles and internal organs become significantly harder for a hungry bird or snake to pick out against a sun-dappled leaf.

The cost of this trick is considerable. Removing that much blood from circulation for hours at a time would cause serious problems for most animals — clots forming in blood that isn't moving, oxygen struggling to reach where it's needed. The glass frog appears to have evolved a way around both dangers, though researchers are still working out exactly how its liver manages to store such a concentrated mass of cells without triggering the clotting response seen in other species.

What makes the discovery particularly striking is timing. The frog does not stay transparent constantly; it becomes glass-like specifically during sleep, when stillness matters most for survival, and returns its blood to normal circulation the moment it wakes and needs full-strength muscles for jumping. In other words, the frog seems to trade a measurable physical risk for a matching survival benefit, and only for exactly as long as it needs to.

For now, the discovery has mostly reshaped how scientists think about camouflage itself. It had long been assumed that transparency in animals worked primarily through skin structure — thin, light-scattering tissue that bends light rather than reflecting it. The glass frog shows that an animal can achieve much the same effect through an entirely different route: not by changing what its skin is made of, but by managing, with remarkable precision, what is allowed to flow beneath it.$passage$,
   'informational', 'nature_science', 374, null,
   'angel_original', 'Angel original, unpublished; no external rights holder', array['csse'], null, 1, 'provisional', true,
   null, null),
  ('ei003-w2-eng-the-clock-that-stopped', 'The Clock That Stopped',
   $passage$I was eleven when my grandmother taught me to mend a clock, and I still remember exactly which one: a heavy mantel clock with a cracked face that had stopped, according to family legend, on the afternoon my great-grandfather left for the war and never been persuaded to run properly since.

"Everyone in this family thinks it's broken," she told me, setting it on newspaper spread across the kitchen table. "Nobody's ever actually opened it up to check."

I expected this to take an afternoon. It took most of that summer. We worked on it most Sunday mornings, my grandmother naming each tiny brass part as though introducing me to relatives — the escapement, the mainspring, the pallet fork — and I learned to hold my breath while threading a screwdriver into gaps barely wider than the tool itself.

There were setbacks. Twice I dropped a spring and watched it disappear beneath the dresser, and once, three weeks in, we discovered an entire gear installed backwards, which meant undoing nearly everything we'd done to that point. My grandmother never seemed frustrated by this, only mildly interested, the way she might examine a puzzle with an unexpected extra piece.

By August, the clock still didn't run. I remember feeling, by then, that we'd failed — that the family legend would remain true, whatever the real mechanical reason for its silence. My grandmother didn't seem to share this feeling. She kept adjusting, testing, listening to the mechanism with her ear pressed close to the case as though it might tell her something the rest of us couldn't hear.

It started running on a Tuesday, with no ceremony at all. I wasn't even in the room. I heard it from the hallway — a small, dry ticking, unfamiliar because none of us had ever heard it — and ran back in to find my grandmother sitting exactly where she always sat, watching the second hand complete its first full circuit in over sixty years.

"There," she said, as though she'd expected this outcome the entire time, though I've never been sure she really did.

I think about that clock now whenever something in my own life refuses to work the way I expect, and someone tells me it's simply broken, always was, always will be. I think about the gear installed backwards for who knows how many decades, silently wrong, waiting for someone with enough patience to notice.$passage$,
   'narrative-extract', 'human_interest_memoir', 405, null,
   'angel_original', 'Angel original, unpublished; no external rights holder', array['csse'], null, 1, 'provisional', true,
   null, null),
  ('ei003-w2-eng-crossing-the-fen', 'Crossing the Fen',
   $passage$The guide, a weathered man named Onyema who had walked the causeway more times than he could count, warned us before we set out that the fen changed with every high tide, and that a path safe at dawn could be treacherous by noon.

We left the village while the mist still sat low over the reed beds, following a route marked only by occasional wooden stakes driven into the mud, half of them leaning at angles that suggested the ground itself was shifting beneath them. Within the first hour, the solid track gave way to something softer — a network of narrow ridges between channels of standing water, each ridge barely wide enough for one boot at a time.

"Step where I step," Onyema said, not turning round. "Not where it looks driest. Looks and is are different things out here."

I understood what he meant within twenty minutes, when Priti, walking just ahead of me, put her weight on a patch of ground that appeared entirely solid and sank almost to her knee before anyone could react. She laughed it off, though I noticed she moved more carefully afterwards, testing each step before committing her full weight.

By midday the mist had burned away entirely, and the fen revealed itself properly: an enormous flat expanse of reed and water stretching to a horizon broken only by the distant shapes of wading birds, dozens of them, motionless as though waiting for something. Onyema pointed out a channel where, he said, the water ran fresh from an underground spring even in the driest months, and another, barely twenty metres further on, where the water was brackish enough to kill any plant unlucky enough to root there.

The final stretch was the hardest. The ridges narrowed further, and twice we had to wade through shallow channels where the mud pulled at our boots with a strength that seemed almost deliberate. Onyema never once consulted a map or a compass; he read the ground itself, the particular green of certain reeds, the angle of light on standing water, in a way none of us could follow even after he pointed it out.

We reached solid ground on the far side just as the tide, exactly as promised, began sliding back in behind us, filling the ridges we had crossed less than an hour before.$passage$,
   'narrative-extract', 'travel_exploration', 392, null,
   'angel_original', 'Angel original, unpublished; no external rights holder', array['csse'], null, 1, 'provisional', true,
   null, null),
  ('ei003-w2-eng-the-attic-workshop', 'The Attic Workshop',
   $passage$The attic had not been cleared in years, and it showed in the particular way dust had settled — not evenly, but in soft grey drifts along the tops of things, thickest where objects had gone longest untouched. Light came in through one small window at the far end, filtered through cobwebs strung between the frame and an old birdcage that no bird had occupied in living memory, and what light did get through arrived thin and the colour of weak honey, pooling on the floorboards in a single narrow strip that moved, almost imperceptibly, as the afternoon wore on.

Along the left wall stood a workbench, its surface scarred with decades of small cuts and stains, tools still hanging from hooks above it in an order that suggested someone had once cared exactly where each one lived: a plane, a set of chisels graduated by size, a coil of wire gone the dull green-brown of old copper. Sawdust had settled into every seam of the wood, so old now it had lost any smell at all, and a half-finished birdhouse sat exactly where it had been abandoned, one wall still unattached, leaning against the others like something caught mid-sentence.

The rest of the space was a slower kind of chaos — trunks stacked two and three high, their leather straps cracked and pale; a dressmaker's mannequin draped in a sheet that had slipped to reveal one shoulder, oddly human in the low light; a stack of newspapers so old the print had faded to a uniform grey, their headlines no longer legible even to someone determined to read them. Somewhere beneath all of it, a floorboard creaked with a specific, complaining note whenever weight shifted near the window, as though the house itself remembered every visit.

The air held a particular smell that belonged to no single object but to all of them together: old wood, old paper, the faint mineral trace of dust itself, and beneath it something sweeter and harder to place, perhaps the ghost of varnish applied to that birdhouse decades before it was ever finished.

Nothing in the room had been designed to be seen this way, gathered and left, and yet the effect — accidental, unplanned — was somehow more complete than any deliberately arranged display could have managed: an entire vanished routine, preserved exactly at the moment it stopped.$passage$,
   'narrative-extract', 'descriptive_prose', 396, null,
   'angel_original', 'Angel original, unpublished; no external rights holder', array['csse'], null, 1, 'provisional', true,
   null, null)
) as v(id, title, original_text, text_type, genre, word_count, reading_complexity,
       provenance, copyright_status, pathway, content_difficulty, content_version,
       eligibility_status, active, passage_family_id, review_state)
where not exists (
  select 1 from public.ali_passage_bank existing where existing.id = v.id
);

do $$
begin
  if (select count(*) from public.ali_passage_bank where id in ('ei003-w2-eng-the-relay-baton', 'ei003-w2-eng-the-last-delivery', 'ei003-w2-eng-the-glass-frog', 'ei003-w2-eng-the-clock-that-stopped', 'ei003-w2-eng-crossing-the-fen', 'ei003-w2-eng-the-attic-workshop')) <> 6 then
    raise exception 'Migration 241 postcondition failed: expected exactly 6 EI003 Wave 2 passage rows to exist after this migration, found a different count.';
  end if;

  if not exists (
    select 1 from public.ali_passage_bank
    where id = 'ei003-w2-eng-the-relay-baton'
      and title = 'The Relay Baton'
      and regexp_replace(original_text, E'\r\n|\r', E'\n', 'g') = regexp_replace($passage$Nadia had run the second leg of every relay since Year 4, and every time, the wait was the worst part. She stood at the changeover line watching Priya sprint towards her, the baton a small orange blur in her fist, and Nadia's own legs felt suddenly unfamiliar, as though she'd forgotten how they worked.

"Go!" someone shouted, though it wasn't yet her turn, and Nadia flinched before catching herself.

When Priya finally reached her, the handover was clumsy — the baton clipped Nadia's fingers before she managed to close her hand around it — but she was moving before she'd properly registered the mistake, arms pumping, the track opening out in front of her like something she'd run a thousand times, because she had. By the final bend she had closed the gap on the girl from Kestrel House, and she could hear her own breath now, ragged and loud, and somewhere behind that the distant sound of her team shouting something she couldn't make out.

She passed the baton to Marcus without looking at him, trusting his hand would be there, and it was. Then she stopped, hands on knees, and watched the rest of the race the way she always did afterwards: unable to look away, unable to do anything useful either.

Kestrel won by less than a second. Nadia straightened up slowly. Her team was already moving towards Marcus, who had crossed the line a stride behind, his shoulders low.

"Bad handover," Priya said quietly, coming to stand beside Nadia. "That was on me."

"It wasn't just you," Nadia said, though she wasn't sure that was true either. She thought of the baton clipping her fingers, of the half-second she'd lost fumbling for a proper grip.

Later, walking back to the changing rooms, Nadia noticed Marcus hanging slightly behind the rest of the group, kicking at loose gravel instead of talking to anyone. She slowed her own pace until she was walking beside him.

"You ran that last bend faster than Kestrel's anchor," she said. "I watched. You nearly had them."

Marcus didn't answer straight away. "Nearly," he said eventually, and kept his eyes on the gravel.

It was only that evening, unlacing her trainers at home, that Nadia realised she still had a faint red mark across two knuckles where the baton had struck them.$passage$, E'\r\n|\r', E'\n', 'g')
      and word_count = 390
      and provenance = 'angel_original'
      and eligibility_status = 'provisional'
      and active = true
  ) then
    raise exception 'Migration 241 postcondition failed: row for id % does not match the expected EI003 Wave 2 passage after insert.', 'ei003-w2-eng-the-relay-baton';
  end if;
  if not exists (
    select 1 from public.ali_passage_bank
    where id = 'ei003-w2-eng-the-last-delivery'
      and title = 'The Last Delivery'
      and regexp_replace(original_text, E'\r\n|\r', E'\n', 'g') = regexp_replace($passage$Grandad Kofi had driven the same milk round for thirty-one years, and Tobias had begged for months to come along on the very last one. Now, sitting up in the passenger seat of the small electric float, he wasn't sure what he'd expected — something more like a celebration, maybe, with people waving from doorsteps.

Instead, the round unfolded almost exactly like any other Tuesday. At the first house, Mrs Aldridge left a note under an empty bottle: TWO PINTS, NOT ONE, THANK YOU. Grandad Kofi read it, smiled slightly, and swapped the empties without comment. At the second, a dog Tobias didn't recognise barked twice from behind a fence and then lost interest entirely.

It was only at the sixth house, where an elderly man in a dressing gown was already waiting by the gate, that anything unusual happened.

"Last one today, is it, Kofi?" the man said.

"Last one ever, Mr Whitfield."

The man nodded slowly, as though he'd known this was coming for a long time, even though — Tobias would learn later — nobody had told him. "Thirty-one years," Mr Whitfield said. "You brought milk to my mother before you brought it to me."

Grandad Kofi didn't say anything to that. He just handed over the two bottles, same as always, and Mr Whitfield held them a moment longer than the exchange strictly required before turning back towards his door.

By the ninth house, the sky had gone the colour of weak tea, and Tobias had started keeping a private tally: houses where people were awake and houses where they weren't, dogs that barked and dogs that didn't, doors that opened and doors that stayed shut. Nobody, he noticed, said anything else about it being the last round. Nobody except Mr Whitfield had seemed to know.

At the final house on the route — a modest terrace with a bicycle propped against the wall — Grandad Kofi switched off the float's quiet motor and simply sat there for a moment before reaching for the crate.

"Is this the one you always finish on?" Tobias asked.

"Every single morning," Grandad Kofi said. "Same twenty-two houses, same order, for thirty-one years." He climbed out, set down two bottles, and stood looking at the house for a second longer than he needed to.

When he got back into the float, he didn't start the engine straight away. He sat with both hands resting on the wheel, looking out at the empty street ahead, and Tobias, watching him, decided not to ask anything else.$passage$, E'\r\n|\r', E'\n', 'g')
      and word_count = 424
      and provenance = 'angel_original'
      and eligibility_status = 'provisional'
      and active = true
  ) then
    raise exception 'Migration 241 postcondition failed: row for id % does not match the expected EI003 Wave 2 passage after insert.', 'ei003-w2-eng-the-last-delivery';
  end if;
  if not exists (
    select 1 from public.ali_passage_bank
    where id = 'ei003-w2-eng-the-glass-frog'
      and title = 'The Glass Frog''s Hidden Trick'
      and regexp_replace(original_text, E'\r\n|\r', E'\n', 'g') = regexp_replace($passage$Most animals that want to avoid being eaten rely on hiding, running, or looking dangerous. The glass frog, a small amphibian found in the rainforests of Central and South America, does something stranger: while it sleeps during the day, clinging to the underside of a leaf, much of its body becomes almost see-through.

The frog's skin itself is only partially transparent — the real trick lies deeper. Scientists studying glass frogs discovered that when the animal is resting, it pulls roughly ninety percent of its red blood cells out of general circulation and packs them tightly into its liver, hiding them behind a mirror-like lining. Blood is what makes most animal tissue appear solid and colourful; with so much of it tucked away, the frog's muscles and internal organs become significantly harder for a hungry bird or snake to pick out against a sun-dappled leaf.

The cost of this trick is considerable. Removing that much blood from circulation for hours at a time would cause serious problems for most animals — clots forming in blood that isn't moving, oxygen struggling to reach where it's needed. The glass frog appears to have evolved a way around both dangers, though researchers are still working out exactly how its liver manages to store such a concentrated mass of cells without triggering the clotting response seen in other species.

What makes the discovery particularly striking is timing. The frog does not stay transparent constantly; it becomes glass-like specifically during sleep, when stillness matters most for survival, and returns its blood to normal circulation the moment it wakes and needs full-strength muscles for jumping. In other words, the frog seems to trade a measurable physical risk for a matching survival benefit, and only for exactly as long as it needs to.

For now, the discovery has mostly reshaped how scientists think about camouflage itself. It had long been assumed that transparency in animals worked primarily through skin structure — thin, light-scattering tissue that bends light rather than reflecting it. The glass frog shows that an animal can achieve much the same effect through an entirely different route: not by changing what its skin is made of, but by managing, with remarkable precision, what is allowed to flow beneath it.$passage$, E'\r\n|\r', E'\n', 'g')
      and word_count = 374
      and provenance = 'angel_original'
      and eligibility_status = 'provisional'
      and active = true
  ) then
    raise exception 'Migration 241 postcondition failed: row for id % does not match the expected EI003 Wave 2 passage after insert.', 'ei003-w2-eng-the-glass-frog';
  end if;
  if not exists (
    select 1 from public.ali_passage_bank
    where id = 'ei003-w2-eng-the-clock-that-stopped'
      and title = 'The Clock That Stopped'
      and regexp_replace(original_text, E'\r\n|\r', E'\n', 'g') = regexp_replace($passage$I was eleven when my grandmother taught me to mend a clock, and I still remember exactly which one: a heavy mantel clock with a cracked face that had stopped, according to family legend, on the afternoon my great-grandfather left for the war and never been persuaded to run properly since.

"Everyone in this family thinks it's broken," she told me, setting it on newspaper spread across the kitchen table. "Nobody's ever actually opened it up to check."

I expected this to take an afternoon. It took most of that summer. We worked on it most Sunday mornings, my grandmother naming each tiny brass part as though introducing me to relatives — the escapement, the mainspring, the pallet fork — and I learned to hold my breath while threading a screwdriver into gaps barely wider than the tool itself.

There were setbacks. Twice I dropped a spring and watched it disappear beneath the dresser, and once, three weeks in, we discovered an entire gear installed backwards, which meant undoing nearly everything we'd done to that point. My grandmother never seemed frustrated by this, only mildly interested, the way she might examine a puzzle with an unexpected extra piece.

By August, the clock still didn't run. I remember feeling, by then, that we'd failed — that the family legend would remain true, whatever the real mechanical reason for its silence. My grandmother didn't seem to share this feeling. She kept adjusting, testing, listening to the mechanism with her ear pressed close to the case as though it might tell her something the rest of us couldn't hear.

It started running on a Tuesday, with no ceremony at all. I wasn't even in the room. I heard it from the hallway — a small, dry ticking, unfamiliar because none of us had ever heard it — and ran back in to find my grandmother sitting exactly where she always sat, watching the second hand complete its first full circuit in over sixty years.

"There," she said, as though she'd expected this outcome the entire time, though I've never been sure she really did.

I think about that clock now whenever something in my own life refuses to work the way I expect, and someone tells me it's simply broken, always was, always will be. I think about the gear installed backwards for who knows how many decades, silently wrong, waiting for someone with enough patience to notice.$passage$, E'\r\n|\r', E'\n', 'g')
      and word_count = 405
      and provenance = 'angel_original'
      and eligibility_status = 'provisional'
      and active = true
  ) then
    raise exception 'Migration 241 postcondition failed: row for id % does not match the expected EI003 Wave 2 passage after insert.', 'ei003-w2-eng-the-clock-that-stopped';
  end if;
  if not exists (
    select 1 from public.ali_passage_bank
    where id = 'ei003-w2-eng-crossing-the-fen'
      and title = 'Crossing the Fen'
      and regexp_replace(original_text, E'\r\n|\r', E'\n', 'g') = regexp_replace($passage$The guide, a weathered man named Onyema who had walked the causeway more times than he could count, warned us before we set out that the fen changed with every high tide, and that a path safe at dawn could be treacherous by noon.

We left the village while the mist still sat low over the reed beds, following a route marked only by occasional wooden stakes driven into the mud, half of them leaning at angles that suggested the ground itself was shifting beneath them. Within the first hour, the solid track gave way to something softer — a network of narrow ridges between channels of standing water, each ridge barely wide enough for one boot at a time.

"Step where I step," Onyema said, not turning round. "Not where it looks driest. Looks and is are different things out here."

I understood what he meant within twenty minutes, when Priti, walking just ahead of me, put her weight on a patch of ground that appeared entirely solid and sank almost to her knee before anyone could react. She laughed it off, though I noticed she moved more carefully afterwards, testing each step before committing her full weight.

By midday the mist had burned away entirely, and the fen revealed itself properly: an enormous flat expanse of reed and water stretching to a horizon broken only by the distant shapes of wading birds, dozens of them, motionless as though waiting for something. Onyema pointed out a channel where, he said, the water ran fresh from an underground spring even in the driest months, and another, barely twenty metres further on, where the water was brackish enough to kill any plant unlucky enough to root there.

The final stretch was the hardest. The ridges narrowed further, and twice we had to wade through shallow channels where the mud pulled at our boots with a strength that seemed almost deliberate. Onyema never once consulted a map or a compass; he read the ground itself, the particular green of certain reeds, the angle of light on standing water, in a way none of us could follow even after he pointed it out.

We reached solid ground on the far side just as the tide, exactly as promised, began sliding back in behind us, filling the ridges we had crossed less than an hour before.$passage$, E'\r\n|\r', E'\n', 'g')
      and word_count = 392
      and provenance = 'angel_original'
      and eligibility_status = 'provisional'
      and active = true
  ) then
    raise exception 'Migration 241 postcondition failed: row for id % does not match the expected EI003 Wave 2 passage after insert.', 'ei003-w2-eng-crossing-the-fen';
  end if;
  if not exists (
    select 1 from public.ali_passage_bank
    where id = 'ei003-w2-eng-the-attic-workshop'
      and title = 'The Attic Workshop'
      and regexp_replace(original_text, E'\r\n|\r', E'\n', 'g') = regexp_replace($passage$The attic had not been cleared in years, and it showed in the particular way dust had settled — not evenly, but in soft grey drifts along the tops of things, thickest where objects had gone longest untouched. Light came in through one small window at the far end, filtered through cobwebs strung between the frame and an old birdcage that no bird had occupied in living memory, and what light did get through arrived thin and the colour of weak honey, pooling on the floorboards in a single narrow strip that moved, almost imperceptibly, as the afternoon wore on.

Along the left wall stood a workbench, its surface scarred with decades of small cuts and stains, tools still hanging from hooks above it in an order that suggested someone had once cared exactly where each one lived: a plane, a set of chisels graduated by size, a coil of wire gone the dull green-brown of old copper. Sawdust had settled into every seam of the wood, so old now it had lost any smell at all, and a half-finished birdhouse sat exactly where it had been abandoned, one wall still unattached, leaning against the others like something caught mid-sentence.

The rest of the space was a slower kind of chaos — trunks stacked two and three high, their leather straps cracked and pale; a dressmaker's mannequin draped in a sheet that had slipped to reveal one shoulder, oddly human in the low light; a stack of newspapers so old the print had faded to a uniform grey, their headlines no longer legible even to someone determined to read them. Somewhere beneath all of it, a floorboard creaked with a specific, complaining note whenever weight shifted near the window, as though the house itself remembered every visit.

The air held a particular smell that belonged to no single object but to all of them together: old wood, old paper, the faint mineral trace of dust itself, and beneath it something sweeter and harder to place, perhaps the ghost of varnish applied to that birdhouse decades before it was ever finished.

Nothing in the room had been designed to be seen this way, gathered and left, and yet the effect — accidental, unplanned — was somehow more complete than any deliberately arranged display could have managed: an entire vanished routine, preserved exactly at the moment it stopped.$passage$, E'\r\n|\r', E'\n', 'g')
      and word_count = 396
      and provenance = 'angel_original'
      and eligibility_status = 'provisional'
      and active = true
  ) then
    raise exception 'Migration 241 postcondition failed: row for id % does not match the expected EI003 Wave 2 passage after insert.', 'ei003-w2-eng-the-attic-workshop';
  end if;
end$$;

commit;
