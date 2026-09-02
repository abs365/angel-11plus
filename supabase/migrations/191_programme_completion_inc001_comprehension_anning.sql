-- Angel Digital 11+ — Migration 191
-- Angel Programme Completion, Increment 001 (Founder directive,
-- "ANGEL PROGRAMME COMPLETION PROGRAMME", Workstream A1 — English Reading
-- Comprehension depth) — new Comprehension passage + question set.
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- The Founder's Programme Completion directive named English Reading
-- Comprehension depth as the highest remaining educational priority, and
-- explicitly required avoiding "the same eight-question pattern" and
-- "narrow competency rotation." A short, evidence-only reconciliation of
-- the existing capacity register (this increment's own Step 1, not
-- repeated here — see the Increment 001 report for the full findings)
-- confirmed a specific, precisely-named, standing gap: QT-RC-07 (Multi-
-- Entity Comparative Attribute Extraction) has exactly one existing
-- family (`wave1-fam-two-character`, 6 rows) which Decision 121 rated
-- "High — the most severe by raw repetition count", since all 6 rows are
-- the identical sentence template ("explain how X's and Y's [noun] to
-- [event] differ") with only names/nouns/events varying. Decision 121/122
-- explicitly recommended authored depth for QT-RC-07 as "a genuine gap ...
-- recommended for a separate, dedicated English-focused increment" — this
-- migration is that increment.
--
-- ONE new, wholly original passage — "The Fossil Hunter of Lyme Regis", a
-- biographical-narrative account of the real historical figure Mary
-- Anning (1799-1847) — following the exact schema/eligibility pattern
-- migration 152 already established (English Content Foundation
-- Increment 001), corrected in line with migration 155's own fix (the
-- passage's pending-review `family_id` must equal its own `id` column,
-- never `passage_family_id` — this migration's own companion review-
-- registration migration follows that corrected convention from the
-- start, not the migration-154 pattern that needed fixing).
--
-- GENUINE STRUCTURAL DIVERSITY: this is the first BIOGRAPHY (real
-- historical figure, informational/nonfiction, past tense) in the
-- certified/candidate Comprehension estate — distinct in genre from
-- "The Boat in the Boathouse" and "The Understudy" (both contemporary
-- realistic fiction) and from "How Bees Find Their Way Home" (popular-
-- science explanation, present tense, no named individual). Six original
-- questions, deliberately biased toward the QT-RC-07 gap this increment
-- targets, per the Founder's own "prefer quality and structural diversity
-- over hitting an arbitrary count" precedent (Decision 227/228):
--   Q1/Q2 — QT-RC-01 (direct retrieval)
--   Q3    — QT-RC-03 (phrase meaning in context). MARK CONTRACT (Founder
--           correction, Increment 004): reduced from 2 marks to 1 -- a
--           single "explain what you think this phrase means" demand does
--           not cleanly decompose into two independently observable
--           scoring elements, and inventing an artificial second element
--           merely to justify 2 marks would be exactly the "artificial
--           mark inflation" the Founder's directive named. 0 marks for no
--           genuine sense of financial necessity conveyed; 1 mark for
--           conveying it, in the learner's own words.
--   Q4    — QT-RC-07 (comparative attribute extraction — closes the named
--           gap; a genuine two-entity comparison of Anning's two major
--           fossil finds, in ordinary prose, not the templated "explain
--           how X's and Y's [noun] differ" sentence). MARK CONTRACT
--           (Founder correction, Increment 003): the question asks for
--           ONE valid difference, so it is worth exactly 1 mark, not 2 —
--           0 marks for no genuine textual difference (e.g. restating a
--           similarity, or an invented/unsupported claim), 1 mark for any
--           ONE difference genuinely grounded in the passage (a named
--           physical feature unique to one creature, or the differing
--           scientific reception). The original 2-mark draft would have
--           required manufacturing a second scoring requirement the
--           question itself never asks for -- corrected to the smaller,
--           honest allocation instead.
--   Q5    — QT-RC-10 (word-choice/detail effect). AMENDMENT (Founder
--           correction, Increment 004): the passage's own third paragraph
--           was rewritten -- "working with hammers and chisels far too
--           heavy for her hands to have found comfortable" (unnatural
--           prose, manufactured specifically to give this question
--           something to ask about) is now "working for hours at a time
--           with hammers and chisels that left her hands raw and
--           blistered" -- a naturally-written sentence a real author would
--           write for its own sake, which also happens to support a
--           genuine word-choice/detail-effect question. Q5 itself is
--           rewritten to test this real sentence, not the old manufactured
--           one.
--   Q6    — QT-RC-02 (justified interpretation), phrased as a free-
--           response question rather than the "tick Yes/No + reasons"
--           shape — the Founder's directive explicitly named the 11
--           excluded tick-justify rows' unresolved self-assessment-
--           validity concern; this migration deliberately does not
--           reproduce that shape.
-- TOTAL MARKS after all Founder corrections: 1+1+1+1+2+3 = 9 (was 11 at
-- first authoring, then 10 after the Increment 003 Q4 correction, now 9
-- after the Increment 004 Q3 correction).
-- Every question uses `validationTier: "TIER2_ACCEPTED_SET"` (checked,
-- contiguous-substring matching against a curated, generous accepted-
-- answer list) — the same well-established, low-risk shape used for 10 of
-- migration 152's own 15 questions. TIER3/4/6 (quotation-required/
-- ordered-list/multi-select) are deliberately NOT attempted on this
-- passage — a disclosed scope limitation, not a silent gap.
--
-- ============================================================
-- FACTUAL VERIFICATION CONTROL (Decision 229 convention, informational
-- passages presenting real-world claims)
-- ============================================================
-- Claim: Mary Anning was born in Lyme Regis, Dorset, in 1799; her father
-- Richard Anning was a cabinetmaker who also sold fossils to visitors; he
-- died in 1810, leaving the family in financial hardship.
--   SOURCE-CONTAINS: multiple independent, authoritative sources (Natural
--     History Museum "Mary Anning: the unsung hero of fossil discovery";
--     Royal Society biographical profile; Britannica) consistently confirm
--     these dates and facts.
--   ANGEL-SIMPLIFICATION: stated plainly, without inventing dialogue or
--     unverifiable detail.
--   FACTUAL-CONFIDENCE: HIGH.
--   UNRESOLVED-CONTESTED-CLAIMS: None identified.
-- Claim: in 1811, Joseph Anning found a skull and Mary excavated the rest
-- of a large marine reptile skeleton later recognised as an ichthyosaur;
-- in 1823 Mary found the first complete plesiosaur skeleton, which the
-- French anatomist Georges Cuvier initially doubted before accepting.
--   SOURCE-CONTAINS: Natural History Museum, Royal Society and Britannica
--     profiles all describe both finds and the Cuvier authenticity dispute
--     over the plesiosaur skeleton.
--   ANGEL-SIMPLIFICATION: exact specimen anatomy/measurements are
--     simplified for a 10-11-year-old reader (e.g. "over a metre long"
--     skull, "more than five metres" total length); the family that
--     eventually bought/examined each specimen is not named, to avoid
--     asserting a specific name/sum this migration did not independently
--     re-verify to the same confidence as the dates and events themselves.
--   FACTUAL-CONFIDENCE: HIGH for both discoveries and their dates; MEDIUM
--     for the specific framing of Cuvier's initial doubt (well documented
--     across sources, but more anecdotal in character than a bare
--     retrieval fact).
--   UNRESOLVED-CONTESTED-CLAIMS: None identified.
-- Claim: despite her expertise, Mary Anning was never permitted to join
-- the Geological Society of London (women were not admitted as Fellows
-- until long after her death), and male collectors/scientists frequently
-- published her discoveries without crediting her by name.
--   SOURCE-CONTAINS: Royal Society and Natural History Museum profiles
--     both discuss this directly as a well-established historical fact.
--   FACTUAL-CONFIDENCE: HIGH.
--   UNRESOLVED-CONTESTED-CLAIMS: None identified.
-- Claim: the tongue-twister "she sells seashells by the seashore" is
-- popularly associated with Mary Anning.
--   SOURCE-CONTAINS: widely repeated as popular belief.
--   FACTUAL-CONFIDENCE: LOW/CONTESTED — this is exactly why the passage's
--     own prose states it as "sometimes said... though no one has ever
--     definitely proven this connection, and some historians doubt it",
--     rather than asserting it as fact. The hedge is textual, not merely
--     disclosed in this header.
--   UNRESOLVED-CONTESTED-CLAIMS: the rhyme's origin is genuinely disputed
--     among historians; explicitly named as such, in-passage.
-- Claim: Mary Anning died in Lyme Regis in 1847; in 2010 the Royal Society
-- named her one of the ten most influential British women in the history
-- of science.
--   SOURCE-CONTAINS: Royal Society's own published list (2010) and
--     multiple independent secondary sources report both facts
--     consistently.
--   FACTUAL-CONFIDENCE: HIGH.
--   UNRESOLVED-CONTESTED-CLAIMS: None identified.
--
-- ============================================================
-- ORIGINALITY
-- ============================================================
-- The passage prose is wholly original Angel writing. No CSSE passage,
-- published biography, textbook, or encyclopaedia entry was copied,
-- closely paraphrased, or adapted — only well-established, multiply-
-- sourced historical facts (dates, events, outcomes) were used as the
-- factual basis, exactly as this project's own copyright boundary
-- requires for original nonfiction (facts are not copyrightable; the
-- prose expressing them here is Angel's own).
--
-- eligibility_status = 'authentic_assessment_candidate' on the passage and
-- all 6 questions — NOT 'practice_eligible', NOT 'independently_
-- validated', NOT 'mock_eligible'. This is the correct entry point for
-- newly-authored content awaiting external (non-author) review, per
-- migration 152's own identical precedent. See migration 192 for the
-- pending-independent-review placeholder record — no review approval of
-- any kind is granted by this migration.
--
-- Practice isolation: no existing ali_passage_bank or ali_question_bank
-- row is read, referenced, or modified. Every id below is new. No
-- mock_eligible or Mathematics Mock 1 row is touched anywhere in this
-- migration. Migration 182 is not referenced and remains untouched.
--
-- Idempotent: both INSERTs use "on conflict (id) do nothing".
--
-- NOT APPLIED. Generated for independent-reviewer and Founder inspection
-- via Supabase Dashboard > SQL Editor > New query. No ordering dependency
-- on any other pending migration.

begin;

insert into public.ali_passage_bank
  (id, title, original_text, text_type, genre, word_count, reading_complexity,
   provenance, copyright_status, pathway, content_difficulty, content_version,
   eligibility_status, active, passage_family_id, review_state)
values
('eng-pc001-anning', 'The Fossil Hunter of Lyme Regis',
 $passage$On the crumbling cliffs above the English seaside town of Lyme Regis, winter storms have always done a strange and useful kind of damage. Each time a section of cliff collapses onto the beach below, it can expose something that has been hidden inside the rock for millions of years: the fossilised remains of creatures that swam in a warm sea long before dinosaurs walked on land. Mary Anning, born in Lyme Regis in 1799, grew up learning to read these cliffs the way other children read books.

Her father, Richard Anning, was a cabinetmaker by trade, but he earned useful extra money selling fossils he collected from the shore to visitors who came to admire the coastline. He taught Mary and her brother Joseph how to search safely among the loose rock for these "curiosities," as fossils were often called at the time. When Richard died in 1810, leaving the family with very little money, searching the cliffs stopped being a hobby and became something closer to necessity. Mary was only about eleven.

The following year, Joseph spotted something unusual poking out of the rock: a skull over a metre long, with rows of pointed teeth and enormous eye sockets. Mary spent months carefully freeing the rest of the skeleton from the cliff, working for hours at a time with hammers and chisels that left her hands raw and blistered. What emerged was the almost complete skeleton of a creature more than five metres in length, unlike anything then known to science. It would later be recognised as an ichthyosaur, an ancient sea reptile, and it was sold to help support the Anning family.

Mary's discoveries did not stop there. In 1823, after years of further searching, she uncovered the first complete skeleton of a plesiosaur: a creature with an extraordinarily long neck, a small head, and four broad paddle-like limbs. It looked so strange that the celebrated French scientist Georges Cuvier initially suspected the skeleton might be a fake, cleverly built from several different animals. Only after examining detailed drawings and measurements was he persuaded that the discovery was genuine, and remarkable.

Despite this expertise, built entirely from years of patient, dangerous fieldwork -- Mary once narrowly escaped a landslide that killed her dog, Tray -- she was never permitted to join the Geological Society of London. Women were not admitted as full members of the Society until many years after her death. Wealthy male collectors often bought fossils directly from her, then published scientific papers describing them without mentioning her name at all.

Mary Anning died in Lyme Regis in 1847. It is sometimes said that the well-known tongue-twister "she sells seashells by the seashore" was inspired by her, though no one has ever definitely proven this connection, and some historians doubt it. What is certain is her scientific legacy: in 2010, the Royal Society named her one of the ten most influential British women in the history of science, more than two centuries after her first great discovery on the cliffs above Lyme Regis.$passage$,
 'informational', 'biographical-narrative', 508, 'moderate',
 'angel_original', 'Angel original, unpublished; no external rights holder', array['csse'], 'medium', 1,
 'authentic_assessment_candidate', true, 'eng-pc001-anning-biography', null)
on conflict (id) do nothing;

-- === "The Fossil Hunter of Lyme Regis" — 6 questions (QT-RC-01/02/03/07/10) ===
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('eng-pc001-anning-q01', 'english', 'QT-RC-01', array['csse'], 'easy', 'short-answer', 60,
 $json${"id":"eng-pc001-anning-q01","marks":1,"skill":"evidence","question":"According to the passage, what was Mary Anning's father's trade?","modelAnswer":"He was a cabinetmaker.","passageTitle":"The Fossil Hunter of Lyme Regis","passageText":"On the crumbling cliffs above the English seaside town of Lyme Regis, winter storms have always done a strange and useful kind of damage. Each time a section of cliff collapses onto the beach below, it can expose something that has been hidden inside the rock for millions of years: the fossilised remains of creatures that swam in a warm sea long before dinosaurs walked on land. Mary Anning, born in Lyme Regis in 1799, grew up learning to read these cliffs the way other children read books.\n\nHer father, Richard Anning, was a cabinetmaker by trade, but he earned useful extra money selling fossils he collected from the shore to visitors who came to admire the coastline. He taught Mary and her brother Joseph how to search safely among the loose rock for these \"curiosities,\" as fossils were often called at the time. When Richard died in 1810, leaving the family with very little money, searching the cliffs stopped being a hobby and became something closer to necessity. Mary was only about eleven.\n\nThe following year, Joseph spotted something unusual poking out of the rock: a skull over a metre long, with rows of pointed teeth and enormous eye sockets. Mary spent months carefully freeing the rest of the skeleton from the cliff, working for hours at a time with hammers and chisels that left her hands raw and blistered. What emerged was the almost complete skeleton of a creature more than five metres in length, unlike anything then known to science. It would later be recognised as an ichthyosaur, an ancient sea reptile, and it was sold to help support the Anning family.\n\nMary's discoveries did not stop there. In 1823, after years of further searching, she uncovered the first complete skeleton of a plesiosaur: a creature with an extraordinarily long neck, a small head, and four broad paddle-like limbs. It looked so strange that the celebrated French scientist Georges Cuvier initially suspected the skeleton might be a fake, cleverly built from several different animals. Only after examining detailed drawings and measurements was he persuaded that the discovery was genuine, and remarkable.\n\nDespite this expertise, built entirely from years of patient, dangerous fieldwork -- Mary once narrowly escaped a landslide that killed her dog, Tray -- she was never permitted to join the Geological Society of London. Women were not admitted as full members of the Society until many years after her death. Wealthy male collectors often bought fossils directly from her, then published scientific papers describing them without mentioning her name at all.\n\nMary Anning died in Lyme Regis in 1847. It is sometimes said that the well-known tongue-twister \"she sells seashells by the seashore\" was inspired by her, though no one has ever definitely proven this connection, and some historians doubt it. What is certain is her scientific legacy: in 2010, the Royal Society named her one of the ten most influential British women in the history of science, more than two centuries after her first great discovery on the cliffs above Lyme Regis.","acceptedAnswers":["cabinetmaker","a cabinetmaker","he was a cabinetmaker","richard anning was a cabinetmaker","he made furniture","a furniture maker","he made and sold furniture"],"validationTier":"TIER2_ACCEPTED_SET"}$json$,
 'Programme Completion Increment 001 (Founder directive, "ANGEL PROGRAMME COMPLETION PROGRAMME", Workstream A1 -- English Reading Comprehension depth). QT-RC-01, competency RC-01, passage "The Fossil Hunter of Lyme Regis". Answer independently checked against this migration''s own stored passage text.', 2, 'eng-pc001-anning',
 'eng-pc001-qt-rc-01-anning', 'angel_original', 'authentic_assessment_candidate', 1, true, 'Confusing her father''s trade (cabinetmaker) with the fossil-selling he did as extra income, and answering ''fossil collector'' or ''fossil seller'' instead.',
 'ROUTINE'),

('eng-pc001-anning-q02', 'english', 'QT-RC-01', array['csse'], 'easy', 'short-answer', 60,
 $json${"id":"eng-pc001-anning-q02","marks":1,"skill":"evidence","question":"According to the passage, in which year did Mary Anning discover the first complete skeleton of a plesiosaur?","modelAnswer":"In 1823.","passageTitle":"The Fossil Hunter of Lyme Regis","passageText":"On the crumbling cliffs above the English seaside town of Lyme Regis, winter storms have always done a strange and useful kind of damage. Each time a section of cliff collapses onto the beach below, it can expose something that has been hidden inside the rock for millions of years: the fossilised remains of creatures that swam in a warm sea long before dinosaurs walked on land. Mary Anning, born in Lyme Regis in 1799, grew up learning to read these cliffs the way other children read books.\n\nHer father, Richard Anning, was a cabinetmaker by trade, but he earned useful extra money selling fossils he collected from the shore to visitors who came to admire the coastline. He taught Mary and her brother Joseph how to search safely among the loose rock for these \"curiosities,\" as fossils were often called at the time. When Richard died in 1810, leaving the family with very little money, searching the cliffs stopped being a hobby and became something closer to necessity. Mary was only about eleven.\n\nThe following year, Joseph spotted something unusual poking out of the rock: a skull over a metre long, with rows of pointed teeth and enormous eye sockets. Mary spent months carefully freeing the rest of the skeleton from the cliff, working for hours at a time with hammers and chisels that left her hands raw and blistered. What emerged was the almost complete skeleton of a creature more than five metres in length, unlike anything then known to science. It would later be recognised as an ichthyosaur, an ancient sea reptile, and it was sold to help support the Anning family.\n\nMary's discoveries did not stop there. In 1823, after years of further searching, she uncovered the first complete skeleton of a plesiosaur: a creature with an extraordinarily long neck, a small head, and four broad paddle-like limbs. It looked so strange that the celebrated French scientist Georges Cuvier initially suspected the skeleton might be a fake, cleverly built from several different animals. Only after examining detailed drawings and measurements was he persuaded that the discovery was genuine, and remarkable.\n\nDespite this expertise, built entirely from years of patient, dangerous fieldwork -- Mary once narrowly escaped a landslide that killed her dog, Tray -- she was never permitted to join the Geological Society of London. Women were not admitted as full members of the Society until many years after her death. Wealthy male collectors often bought fossils directly from her, then published scientific papers describing them without mentioning her name at all.\n\nMary Anning died in Lyme Regis in 1847. It is sometimes said that the well-known tongue-twister \"she sells seashells by the seashore\" was inspired by her, though no one has ever definitely proven this connection, and some historians doubt it. What is certain is her scientific legacy: in 2010, the Royal Society named her one of the ten most influential British women in the history of science, more than two centuries after her first great discovery on the cliffs above Lyme Regis.","acceptedAnswers":["1823","in 1823","the year 1823"],"validationTier":"TIER2_ACCEPTED_SET"}$json$,
 'Programme Completion Increment 001 (Founder directive, "ANGEL PROGRAMME COMPLETION PROGRAMME", Workstream A1 -- English Reading Comprehension depth). QT-RC-01, competency RC-01, passage "The Fossil Hunter of Lyme Regis". Answer independently checked against this migration''s own stored passage text.', 2, 'eng-pc001-anning',
 'eng-pc001-qt-rc-01-anning', 'angel_original', 'authentic_assessment_candidate', 1, true, 'Confusing 1823 (the plesiosaur) with 1811 (the year the ichthyosaur skeleton was found) or 1810 (her father''s death).',
 'ROUTINE'),

('eng-pc001-anning-q03', 'english', 'QT-RC-03', array['csse'], 'medium', 'short-answer', 90,
 $json${"id":"eng-pc001-anning-q03","marks":1,"skill":"vocabulary","question":"Explain what you think the phrase 'closer to necessity' means, as used to describe why Mary and her brother continued searching the cliffs after their father's death.","modelAnswer":"It means the family genuinely needed the money fossil-selling brought in to survive, so searching the cliffs was no longer just an enjoyable pastime but something they had to do.","passageTitle":"The Fossil Hunter of Lyme Regis","passageText":"On the crumbling cliffs above the English seaside town of Lyme Regis, winter storms have always done a strange and useful kind of damage. Each time a section of cliff collapses onto the beach below, it can expose something that has been hidden inside the rock for millions of years: the fossilised remains of creatures that swam in a warm sea long before dinosaurs walked on land. Mary Anning, born in Lyme Regis in 1799, grew up learning to read these cliffs the way other children read books.\n\nHer father, Richard Anning, was a cabinetmaker by trade, but he earned useful extra money selling fossils he collected from the shore to visitors who came to admire the coastline. He taught Mary and her brother Joseph how to search safely among the loose rock for these \"curiosities,\" as fossils were often called at the time. When Richard died in 1810, leaving the family with very little money, searching the cliffs stopped being a hobby and became something closer to necessity. Mary was only about eleven.\n\nThe following year, Joseph spotted something unusual poking out of the rock: a skull over a metre long, with rows of pointed teeth and enormous eye sockets. Mary spent months carefully freeing the rest of the skeleton from the cliff, working for hours at a time with hammers and chisels that left her hands raw and blistered. What emerged was the almost complete skeleton of a creature more than five metres in length, unlike anything then known to science. It would later be recognised as an ichthyosaur, an ancient sea reptile, and it was sold to help support the Anning family.\n\nMary's discoveries did not stop there. In 1823, after years of further searching, she uncovered the first complete skeleton of a plesiosaur: a creature with an extraordinarily long neck, a small head, and four broad paddle-like limbs. It looked so strange that the celebrated French scientist Georges Cuvier initially suspected the skeleton might be a fake, cleverly built from several different animals. Only after examining detailed drawings and measurements was he persuaded that the discovery was genuine, and remarkable.\n\nDespite this expertise, built entirely from years of patient, dangerous fieldwork -- Mary once narrowly escaped a landslide that killed her dog, Tray -- she was never permitted to join the Geological Society of London. Women were not admitted as full members of the Society until many years after her death. Wealthy male collectors often bought fossils directly from her, then published scientific papers describing them without mentioning her name at all.\n\nMary Anning died in Lyme Regis in 1847. It is sometimes said that the well-known tongue-twister \"she sells seashells by the seashore\" was inspired by her, though no one has ever definitely proven this connection, and some historians doubt it. What is certain is her scientific legacy: in 2010, the Royal Society named her one of the ten most influential British women in the history of science, more than two centuries after her first great discovery on the cliffs above Lyme Regis.","acceptedAnswers":["they needed the money","they needed money","the family needed the money","money was needed","it was necessary for them to survive","something they had to do","essential for the family","they had no choice","not just a hobby anymore","vital for the family's survival"],"validationTier":"TIER2_ACCEPTED_SET"}$json$,
 'Programme Completion Increment 001 (Founder directive, "ANGEL PROGRAMME COMPLETION PROGRAMME", Workstream A1 -- English Reading Comprehension depth). QT-RC-03, competency RC-03, passage "The Fossil Hunter of Lyme Regis". Answer independently checked against this migration''s own stored passage text.', 2, 'eng-pc001-anning',
 'eng-pc001-qt-rc-03-anning', 'angel_original', 'authentic_assessment_candidate', 1, true, 'Treating ''necessity'' as simply meaning ''they enjoyed it more'', missing that the phrase marks a shift from choice to genuine financial need.',
 'ROUTINE'),

('eng-pc001-anning-q04', 'english', 'QT-RC-07', array['csse'], 'medium', 'short-answer', 120,
 $json${"id":"eng-pc001-anning-q04","marks":1,"skill":"evidence","question":"The passage describes two of Mary Anning's major fossil discoveries: the skeleton found in 1811 and the skeleton found in 1823. Using details from the passage, give ONE way these two discoveries were different from each other.","modelAnswer":"For example: the 1823 skeleton (the plesiosaur) had an extraordinarily long neck and four broad paddle-like limbs, unlike the 1811 skeleton (the ichthyosaur). Any one genuine difference is enough for full marks -- for example, naming a physical feature unique to one creature, or noting that the ichthyosaur was accepted as genuine without dispute while Cuvier initially suspected the plesiosaur skeleton might be a fake.","passageTitle":"The Fossil Hunter of Lyme Regis","passageText":"On the crumbling cliffs above the English seaside town of Lyme Regis, winter storms have always done a strange and useful kind of damage. Each time a section of cliff collapses onto the beach below, it can expose something that has been hidden inside the rock for millions of years: the fossilised remains of creatures that swam in a warm sea long before dinosaurs walked on land. Mary Anning, born in Lyme Regis in 1799, grew up learning to read these cliffs the way other children read books.\n\nHer father, Richard Anning, was a cabinetmaker by trade, but he earned useful extra money selling fossils he collected from the shore to visitors who came to admire the coastline. He taught Mary and her brother Joseph how to search safely among the loose rock for these \"curiosities,\" as fossils were often called at the time. When Richard died in 1810, leaving the family with very little money, searching the cliffs stopped being a hobby and became something closer to necessity. Mary was only about eleven.\n\nThe following year, Joseph spotted something unusual poking out of the rock: a skull over a metre long, with rows of pointed teeth and enormous eye sockets. Mary spent months carefully freeing the rest of the skeleton from the cliff, working for hours at a time with hammers and chisels that left her hands raw and blistered. What emerged was the almost complete skeleton of a creature more than five metres in length, unlike anything then known to science. It would later be recognised as an ichthyosaur, an ancient sea reptile, and it was sold to help support the Anning family.\n\nMary's discoveries did not stop there. In 1823, after years of further searching, she uncovered the first complete skeleton of a plesiosaur: a creature with an extraordinarily long neck, a small head, and four broad paddle-like limbs. It looked so strange that the celebrated French scientist Georges Cuvier initially suspected the skeleton might be a fake, cleverly built from several different animals. Only after examining detailed drawings and measurements was he persuaded that the discovery was genuine, and remarkable.\n\nDespite this expertise, built entirely from years of patient, dangerous fieldwork -- Mary once narrowly escaped a landslide that killed her dog, Tray -- she was never permitted to join the Geological Society of London. Women were not admitted as full members of the Society until many years after her death. Wealthy male collectors often bought fossils directly from her, then published scientific papers describing them without mentioning her name at all.\n\nMary Anning died in Lyme Regis in 1847. It is sometimes said that the well-known tongue-twister \"she sells seashells by the seashore\" was inspired by her, though no one has ever definitely proven this connection, and some historians doubt it. What is certain is her scientific legacy: in 2010, the Royal Society named her one of the ten most influential British women in the history of science, more than two centuries after her first great discovery on the cliffs above Lyme Regis.","acceptedAnswers":["long neck","a long neck","four paddle-like limbs","paddle-like limbs","pointed teeth","enormous eye sockets","over five metres long","cuvier thought it might be a fake","cuvier suspected it was a fake","cuvier doubted it was real","one was doubted and the other was not","the plesiosaur was thought to be fake"],"validationTier":"TIER2_ACCEPTED_SET"}$json$,
 'Programme Completion Increment 001 (Founder directive, "ANGEL PROGRAMME COMPLETION PROGRAMME", Workstream A1 -- English Reading Comprehension depth). QT-RC-07, competency RC-01, passage "The Fossil Hunter of Lyme Regis". Answer independently checked against this migration''s own stored passage text.', 2, 'eng-pc001-anning',
 'eng-pc001-qt-rc-07-anning', 'angel_original', 'authentic_assessment_candidate', 1, true, 'Restating that both were fossil discoveries (a similarity) instead of identifying a genuine textual difference between the two creatures or their reception.',
 'MIXED_TRANSFER'),

('eng-pc001-anning-q05', 'english', 'QT-RC-10', array['csse'], 'medium', 'short-answer', 120,
 $json${"id":"eng-pc001-anning-q05","marks":2,"skill":"inference","question":"The passage says the hammers and chisels 'left her hands raw and blistered', rather than simply saying the work was difficult. What effect does this specific detail have on the reader?","modelAnswer":"It makes the hardship and physical effort feel real and specific rather than just being told in the abstract that the work was hard -- picturing her raw, blistered hands helps the reader imagine how demanding the work truly was.","passageTitle":"The Fossil Hunter of Lyme Regis","passageText":"On the crumbling cliffs above the English seaside town of Lyme Regis, winter storms have always done a strange and useful kind of damage. Each time a section of cliff collapses onto the beach below, it can expose something that has been hidden inside the rock for millions of years: the fossilised remains of creatures that swam in a warm sea long before dinosaurs walked on land. Mary Anning, born in Lyme Regis in 1799, grew up learning to read these cliffs the way other children read books.\n\nHer father, Richard Anning, was a cabinetmaker by trade, but he earned useful extra money selling fossils he collected from the shore to visitors who came to admire the coastline. He taught Mary and her brother Joseph how to search safely among the loose rock for these \"curiosities,\" as fossils were often called at the time. When Richard died in 1810, leaving the family with very little money, searching the cliffs stopped being a hobby and became something closer to necessity. Mary was only about eleven.\n\nThe following year, Joseph spotted something unusual poking out of the rock: a skull over a metre long, with rows of pointed teeth and enormous eye sockets. Mary spent months carefully freeing the rest of the skeleton from the cliff, working for hours at a time with hammers and chisels that left her hands raw and blistered. What emerged was the almost complete skeleton of a creature more than five metres in length, unlike anything then known to science. It would later be recognised as an ichthyosaur, an ancient sea reptile, and it was sold to help support the Anning family.\n\nMary's discoveries did not stop there. In 1823, after years of further searching, she uncovered the first complete skeleton of a plesiosaur: a creature with an extraordinarily long neck, a small head, and four broad paddle-like limbs. It looked so strange that the celebrated French scientist Georges Cuvier initially suspected the skeleton might be a fake, cleverly built from several different animals. Only after examining detailed drawings and measurements was he persuaded that the discovery was genuine, and remarkable.\n\nDespite this expertise, built entirely from years of patient, dangerous fieldwork -- Mary once narrowly escaped a landslide that killed her dog, Tray -- she was never permitted to join the Geological Society of London. Women were not admitted as full members of the Society until many years after her death. Wealthy male collectors often bought fossils directly from her, then published scientific papers describing them without mentioning her name at all.\n\nMary Anning died in Lyme Regis in 1847. It is sometimes said that the well-known tongue-twister \"she sells seashells by the seashore\" was inspired by her, though no one has ever definitely proven this connection, and some historians doubt it. What is certain is her scientific legacy: in 2010, the Royal Society named her one of the ten most influential British women in the history of science, more than two centuries after her first great discovery on the cliffs above Lyme Regis.","acceptedAnswers":["makes it feel real","shows how hard the work was","the work was hard","shows the work was hard","makes the reader imagine how difficult it was","makes it more vivid","shows the effort involved","helps the reader picture how hard it was","makes the hardship feel real","shows how physically demanding it was","raw and blistered","her hands were raw and blistered","shows how painful it was"],"validationTier":"TIER2_ACCEPTED_SET"}$json$,
 'Programme Completion Increment 001 (Founder directive, "ANGEL PROGRAMME COMPLETION PROGRAMME", Workstream A1 -- English Reading Comprehension depth). QT-RC-10, competency RC-02, passage "The Fossil Hunter of Lyme Regis". Answer independently checked against this migration''s own stored passage text.', 2, 'eng-pc001-anning',
 'eng-pc001-qt-rc-10-anning', 'angel_original', 'authentic_assessment_candidate', 1, true, 'Describing WHAT the detail says (her hands were sore) rather than the EFFECT it has on the reader''s understanding of the hardship.',
 'ROUTINE'),

('eng-pc001-anning-q06', 'english', 'QT-RC-02', array['csse'], 'medium', 'short-answer', 150,
 $json${"id":"eng-pc001-anning-q06","marks":3,"skill":"inference","question":"What does the passage suggest about how Mary Anning's contribution to science was treated during her own lifetime? Use evidence from the passage to support your answer.","modelAnswer":"It suggests she was not properly valued or credited: despite her skill and expertise, she was never permitted to join the Geological Society of London because women were not admitted as members, and male collectors published scientific papers about her discoveries without mentioning her name.","passageTitle":"The Fossil Hunter of Lyme Regis","passageText":"On the crumbling cliffs above the English seaside town of Lyme Regis, winter storms have always done a strange and useful kind of damage. Each time a section of cliff collapses onto the beach below, it can expose something that has been hidden inside the rock for millions of years: the fossilised remains of creatures that swam in a warm sea long before dinosaurs walked on land. Mary Anning, born in Lyme Regis in 1799, grew up learning to read these cliffs the way other children read books.\n\nHer father, Richard Anning, was a cabinetmaker by trade, but he earned useful extra money selling fossils he collected from the shore to visitors who came to admire the coastline. He taught Mary and her brother Joseph how to search safely among the loose rock for these \"curiosities,\" as fossils were often called at the time. When Richard died in 1810, leaving the family with very little money, searching the cliffs stopped being a hobby and became something closer to necessity. Mary was only about eleven.\n\nThe following year, Joseph spotted something unusual poking out of the rock: a skull over a metre long, with rows of pointed teeth and enormous eye sockets. Mary spent months carefully freeing the rest of the skeleton from the cliff, working for hours at a time with hammers and chisels that left her hands raw and blistered. What emerged was the almost complete skeleton of a creature more than five metres in length, unlike anything then known to science. It would later be recognised as an ichthyosaur, an ancient sea reptile, and it was sold to help support the Anning family.\n\nMary's discoveries did not stop there. In 1823, after years of further searching, she uncovered the first complete skeleton of a plesiosaur: a creature with an extraordinarily long neck, a small head, and four broad paddle-like limbs. It looked so strange that the celebrated French scientist Georges Cuvier initially suspected the skeleton might be a fake, cleverly built from several different animals. Only after examining detailed drawings and measurements was he persuaded that the discovery was genuine, and remarkable.\n\nDespite this expertise, built entirely from years of patient, dangerous fieldwork -- Mary once narrowly escaped a landslide that killed her dog, Tray -- she was never permitted to join the Geological Society of London. Women were not admitted as full members of the Society until many years after her death. Wealthy male collectors often bought fossils directly from her, then published scientific papers describing them without mentioning her name at all.\n\nMary Anning died in Lyme Regis in 1847. It is sometimes said that the well-known tongue-twister \"she sells seashells by the seashore\" was inspired by her, though no one has ever definitely proven this connection, and some historians doubt it. What is certain is her scientific legacy: in 2010, the Royal Society named her one of the ten most influential British women in the history of science, more than two centuries after her first great discovery on the cliffs above Lyme Regis.","acceptedAnswers":["she was not credited","she was not given credit","no one gave her credit","never got credit","she was not properly valued","women were not admitted","she could not join the geological society","without mentioning her name","her name was left out","she was excluded because she was a woman","she was not recognised for her work","never permitted to join"],"validationTier":"TIER2_ACCEPTED_SET"}$json$,
 'Programme Completion Increment 001 (Founder directive, "ANGEL PROGRAMME COMPLETION PROGRAMME", Workstream A1 -- English Reading Comprehension depth). QT-RC-02, competency RC-02, passage "The Fossil Hunter of Lyme Regis". Answer independently checked against this migration''s own stored passage text.', 2, 'eng-pc001-anning',
 'eng-pc001-qt-rc-02-anning', 'angel_original', 'authentic_assessment_candidate', 1, true, 'Focusing only on the danger/difficulty of her fieldwork rather than on how her scientific contribution was specifically undervalued and uncredited by the men around her.',
 'MIXED_TRANSFER')
on conflict (id) do nothing;

commit;
