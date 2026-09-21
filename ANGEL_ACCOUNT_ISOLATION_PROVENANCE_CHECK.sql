-- ANGEL 11+ -- NEW-ACCOUNT / SAME-BROWSER PROVENANCE CHECK  (READ-ONLY)
--
-- Purpose: settle, with evidence, the two things that cannot be observed from outside your browser:
--   (1) does the NEW account own any server-side evidence, and where did it come from?
--   (2) was the PREVIOUS owner of this browser an anonymous session or another permanent account?
-- Plus the real password statistics for Angel 11+ accounts.
--
-- Every statement is a SELECT. Nothing here writes. Output uses id PREFIXES and counts only (no email, no
-- name, no learner content). Run in Supabase Dashboard > SQL Editor.
--
-- BEFORE running, replace the two placeholders below (search for the angle brackets):
--   <NEW_ACCOUNT_EMAIL>  the email you used for the new account
--   <DEVICE_ID>          this browser's device id. In the browser where you did the test, open DevTools >
--                        Console and run:   localStorage.getItem('angel11plus_device_id')
--   (optional, read-only, prints counts only -- no tokens/emails):
--     (() => { const p = JSON.parse(localStorage.getItem('angel11plus_progress')||'{}');
--       return { lessons: (p.completedLessons||[]).length, xp: p.xp, pathway: p.selectedPathwayId,
--                migratedFlag: localStorage.getItem('angel11plus_migrated_v1') }; })()

-- ------------------------------------------------------------------------------------------------
-- Q1. The NEW account itself.
--   EXPECT: is_anonymous = false; created_at = the day of your test; has_password = false
--   (Create account is passwordless).
-- ------------------------------------------------------------------------------------------------
select left(u.id::text, 8)                                          as account,
       u.is_anonymous,
       u.created_at,
       (u.encrypted_password is not null and u.encrypted_password <> '') as has_password,
       (u.recovery_sent_at is not null)                             as ever_requested_password_reset,
       u.last_sign_in_at
from auth.users u
where lower(u.email) = lower('<NEW_ACCOUNT_EMAIL>');

-- ------------------------------------------------------------------------------------------------
-- Q2. The NEW account's learner(s) and the server-side evidence they own.
--   EXPECT (if nothing was pushed from the old browser state): every count = 0.
--   device_prefix should DIFFER from the browser's <DEVICE_ID> prefix (a same-device newcomer is issued a
--   fresh device id because device ids are unique).
--   If lesson_progress_rows / total_xp are > 0 with no activity by you, the old browser state was PUSHED to
--   the new account (server-side contamination) -- report the numbers.
-- ------------------------------------------------------------------------------------------------
select left(p.id::text, 8)      as learner,
       left(p.device_id, 8)     as device_prefix,
       p.created_at,
       p.selected_pathway_id,
       (select count(*) from public.lesson_progress            x where x.profile_id = p.id) as lesson_progress_rows,
       (select count(*) from public.ali_student_question_history x where x.profile_id = p.id) as question_history_rows,
       (select count(*) from public.ali_durable_mastery         x where x.profile_id = p.id) as durable_mastery_rows,
       (select count(*) from public.ali_student_adaptive_state  x where x.profile_id = p.id) as adaptive_state_rows,
       (select count(*) from public.ali_mock_attempt            x where x.profile_id = p.id) as mock_attempt_rows,
       (select coalesce(sum(total_xp), 0) from public.user_stats x where x.profile_id = p.id) as total_xp
from public.profiles p
join auth.users u on u.id = p.auth_user_id
where lower(u.email) = lower('<NEW_ACCOUNT_EMAIL>');

-- ------------------------------------------------------------------------------------------------
-- Q3. Who OWNS this browser's device id -- i.e. whose state was sitting in the browser?
--   owner_is_anonymous = true   -> the previous user of this browser was an ANONYMOUS session.
--   owner_is_anonymous = false  -> it was a PERMANENT account (owner_has_email shows it had an email).
--   Its evidence counts show how much genuine server evidence that previous identity has.
-- ------------------------------------------------------------------------------------------------
select left(p.id::text, 8)     as previous_owner_learner,
       u.is_anonymous          as owner_is_anonymous,
       (u.email is not null)   as owner_has_email,
       p.created_at            as profile_created,
       (select count(*) from public.lesson_progress            x where x.profile_id = p.id) as lesson_progress_rows,
       (select count(*) from public.ali_student_question_history x where x.profile_id = p.id) as question_history_rows,
       (select coalesce(sum(total_xp), 0) from public.user_stats x where x.profile_id = p.id) as total_xp
from public.profiles p
left join auth.users u on u.id = p.auth_user_id
where p.device_id = '<DEVICE_ID>';

-- ------------------------------------------------------------------------------------------------
-- Q4. Real password statistics across ALL Angel 11+ accounts (counts only).
--   permanent_passwordless = accounts created by the email link that never set a password.
--   permanent_with_password = accounts that genuinely can sign in with a password.
--   ever_requested_password_reset = accounts that used "Forgot password" (the only way to set one).
-- ------------------------------------------------------------------------------------------------
select count(*)                                                                                   as accounts_total,
       count(*) filter (where is_anonymous)                                                       as anonymous,
       count(*) filter (where not is_anonymous)                                                   as permanent,
       count(*) filter (where not is_anonymous and encrypted_password is not null and encrypted_password <> '') as permanent_with_password,
       count(*) filter (where not is_anonymous and (encrypted_password is null or encrypted_password = ''))    as permanent_passwordless,
       count(*) filter (where recovery_sent_at is not null)                                       as ever_requested_password_reset
from auth.users;
