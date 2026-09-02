-- Angel Digital 11+ — Read-only diagnostic (follow-up to the Profile A/B
-- incident). SELECT only, no mutation, no email/PII selected. Lists
-- recent auth.users rows so the Founder can see whether a genuine,
-- separate "Profile B" account exists and, if so, whether it was ever
-- actually linked to a profile / used to write any evidence -- i.e.
-- whether it sits completely orphaned because the browser tab never
-- adopted it.

select
  u.id as auth_user_id,
  u.is_anonymous,
  u.created_at,
  u.last_sign_in_at,
  p.id as linked_profile_id,
  p.created_at as linked_profile_created_at,
  (select count(*) from public.lesson_progress lp where lp.profile_id = p.id) as lesson_progress_rows
from auth.users u
left join public.profiles p on p.auth_user_id = u.id
order by u.created_at desc
limit 20;
