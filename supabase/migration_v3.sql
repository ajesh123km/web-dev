-- ============================================================================
-- MIGRATION V3 FOR TEAM STARS CHITS PRIVATE LIMITED (NON-DESTRUCTIVE)
-- Purpose: Enable 'archived' status & archived_at timestamp on chit_groups
-- so groups with existing members/payment history can be safely archived
-- instead of failing foreign-key constraints or deleting financial records.
--
-- SAFE TO RUN ON LIVE PRODUCTION DATABASE (No DROP/TRUNCATE/DELETE).
-- Run once in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- ============================================================================

-- 1. Update chit_groups status check constraint to support ('active', 'inactive', 'archived')
alter table public.chit_groups
  drop constraint if exists chit_groups_status_check;

alter table public.chit_groups
  add constraint chit_groups_status_check
  check (status in ('active', 'inactive', 'archived'));

-- 2. Add archived_at timestamp column to chit_groups if not already present
alter table public.chit_groups
  add column if not exists archived_at timestamptz;

-- 3. Index group status for fast filtering of active/inactive/archived batches
create index if not exists idx_chit_groups_status on public.chit_groups(status);
