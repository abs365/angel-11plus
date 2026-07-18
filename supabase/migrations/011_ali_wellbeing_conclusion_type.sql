-- Angel Digital 11+ — Migration 011
-- Work Package WP-21A (IWP-002, Wellbeing Signal Operationalisation)
-- Adds 'wellbeing-veto' to the conclusion_type enum (migration 010), so a
-- Tier 0 pacing veto (WP-21_WELLBEING_DESIGN.md, WELLBEING_SIGNAL_CONTRACT.md)
-- has a real, correctly-typed home in ali_educational_audit — the gap
-- WELLBEING_SIGNAL_CONTRACT.md §6 explicitly named as a blocking
-- prerequisite for this exact implementation.
-- Additive-only. Depends on migration 010.
-- Note: per Postgres's own limitation (already documented in this
-- project's migration history, ALI_PRODUCTION_ACTIVATION_CHECKLIST.md),
-- ALTER TYPE ... ADD VALUE cannot run in the same transaction as a
-- statement that uses the new value — this migration only adds the value,
-- it does not insert or reference any row using it.
-- Run this in: Supabase Dashboard > SQL Editor > New query

alter type public.conclusion_type add value if not exists 'wellbeing-veto';
