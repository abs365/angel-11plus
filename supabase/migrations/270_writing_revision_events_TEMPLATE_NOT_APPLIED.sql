-- Migration 270 (NOT APPLIED; Founder decision required). Text-free Writing revision events.
-- Stores enumerated values only: no free text column exists. Formative; never read by mastery.
create table if not exists public.writing_revision_events (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null,
  question_id text not null check (question_id ~ '^[A-Za-z0-9_:\-]{1,80}$'),
  session_key text not null check (session_key ~ '^[A-Za-z0-9\-]{1,80}$'),
  chosen_area text not null check (chosen_area in ('ideas','vocabulary','grammar','structure','punctuation','other')),
  original_reads jsonb not null,
  revised_reads jsonb not null,
  word_count_change_band text not null check (word_count_change_band in ('much_shorter','shorter','similar','longer','much_longer')),
  counts_toward_mastery boolean not null default false check (counts_toward_mastery = false),
  occurred_at timestamptz not null default now(),
  unique (learner_id, question_id, session_key)
);
alter table public.writing_revision_events enable row level security;
revoke all on public.writing_revision_events from anon, authenticated;

create or replace function public.record_writing_revision_event(
  p_question_id text, p_session_key text, p_chosen_area text,
  p_original_reads jsonb, p_revised_reads jsonb, p_word_count_change_band text
) returns boolean
language plpgsql security definer set search_path = public as $$
declare v_learner uuid := public.current_learner_id();
begin
  if v_learner is null then return false; end if;
  insert into public.writing_revision_events
    (learner_id, question_id, session_key, chosen_area, original_reads, revised_reads, word_count_change_band)
  values (v_learner, p_question_id, p_session_key, p_chosen_area, p_original_reads, p_revised_reads, p_word_count_change_band)
  on conflict do nothing;
  return true;
end $$;
revoke execute on function public.record_writing_revision_event(text,text,text,jsonb,jsonb,text) from public;
grant execute on function public.record_writing_revision_event(text,text,text,jsonb,jsonb,text) to authenticated;
