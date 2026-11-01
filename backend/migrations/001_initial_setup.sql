-- ==========================================================================
-- MIGRATION 001: INITIAL PORTFOLIO & ADMIN CMS SETUP
-- Run `backend/schema.sql` followed by `backend/policies.sql` in the
-- Supabase SQL Editor.
-- ==========================================================================

-- Seed default row in portfolio_state so first read succeeds immediately
insert into public.portfolio_state (id, payload)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;
