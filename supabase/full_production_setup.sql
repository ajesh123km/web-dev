-- ============================================================================
-- FULL PRODUCTION DATABASE SETUP FOR TEAM STARS CHITS PRIVATE LIMITED
-- Safe, idempotent, copy-paste-ready script for Supabase SQL Editor.
-- Run this ONCE in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- ============================================================================

-- 1. Enquiries Table
create table if not exists public.enquiries (
  id text primary key default gen_random_uuid()::text,
  full_name text not null,
  mobile_number text not null,
  email text not null,
  city text not null,
  preferred_scheme text not null,
  preferred_language text not null default 'en',
  message text,
  consent boolean not null default true,
  enquiry_status text not null default 'New' check (enquiry_status in ('New', 'Contacted', 'In Progress', 'Completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Chit Schemes Master Table (Supports 1L, 2L, 5L, 10L & Custom Schemes/Durations)
create table if not exists public.chit_schemes (
  id text primary key,
  scheme_code text unique not null,
  name_en text not null,
  name_ta text not null,
  chit_value numeric not null check (chit_value >= 10000),
  duration_months integer not null default 20 check (duration_months between 2 and 60),
  available_durations integer[] not null default array[10, 12, 15, 20, 24],
  first_month_instalment numeric not null,
  min_instalment numeric not null,
  max_instalment numeric not null,
  total_instalments_paid numeric not null,
  dividend_benefit numeric not null,
  prompt_bonus numeric not null default 0,
  last_month_bonus numeric not null default 0,
  total_bonus numeric not null default 0,
  tagline_en text,
  tagline_ta text,
  document_image text,
  schedule_json jsonb not null default '[]'::jsonb,
  rules_en jsonb not null default '[]'::jsonb,
  rules_ta jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  start_date date default current_date,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Scheme Versions Snapshot Table (Preserves historical terms for audit & running batches)
create table if not exists public.scheme_versions (
  id text primary key default gen_random_uuid()::text,
  scheme_id text not null references public.chit_schemes(id) on delete restrict,
  version integer not null,
  name_en text not null,
  chit_value numeric not null,
  duration_months integer not null,
  available_durations integer[] not null default array[20],
  snapshot_data jsonb not null default '{}'::jsonb,
  change_reason text,
  created_by text not null default 'Admin',
  created_at timestamptz not null default now(),
  unique(scheme_id, version)
);

-- 4. Chit Groups Table (Max 99 members enforced)
create table if not exists public.chit_groups (
  id text primary key,
  name text not null,
  scheme_id text references public.chit_schemes(id) on delete restrict,
  scheme_version integer not null default 1,
  scheme_name text not null,
  chit_value numeric not null,
  duration_months integer not null default 20 check (duration_months between 2 and 60),
  start_date date not null,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  max_members integer not null default 99 check (max_members <= 99),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Chit Users Table (Supports soft delete & optional Supabase Auth UID)
create table if not exists public.chit_users (
  id text primary key,
  user_id text unique not null,
  full_name text not null,
  mobile_number text not null,
  address text not null,
  city text not null,
  email text,
  group_id text references public.chit_groups(id) on delete set null,
  group_name text,
  password_hash text not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  auth_uid uuid,
  role text not null default 'user' check (role in ('user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. Group Memberships Audit Table
create table if not exists public.group_memberships (
  id text primary key default gen_random_uuid()::text,
  group_id text not null references public.chit_groups(id) on delete restrict,
  user_id text not null references public.chit_users(user_id) on delete restrict,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  status text not null default 'active' check (status in ('active', 'inactive', 'completed')),
  unique(group_id, user_id)
);

-- 7. Monthly Payment Configurations Table
create table if not exists public.monthly_payment_configs (
  id text primary key default gen_random_uuid()::text,
  group_id text not null references public.chit_groups(id) on delete cascade,
  group_name text,
  month integer not null check (month between 1 and 60),
  month_label text not null,
  year integer not null,
  payment_amount numeric not null check (payment_amount > 0),
  due_date date not null,
  created_by text not null default 'Admin',
  created_at timestamptz not null default now(),
  unique(group_id, month, year)
);

-- 8. Individual Payment Records Table (ON DELETE RESTRICT prevents wiping financial history)
create table if not exists public.payment_records (
  id text primary key default gen_random_uuid()::text,
  user_id text not null references public.chit_users(user_id) on delete restrict,
  user_name text not null,
  group_id text not null references public.chit_groups(id) on delete restrict,
  group_name text not null,
  payment_month integer not null check (payment_month between 1 and 60),
  month_name text not null,
  payment_year integer not null,
  payment_amount numeric not null check (payment_amount > 0),
  payment_status text not null default 'UNPAID' check (payment_status in ('PAID', 'UNPAID')),
  payment_date timestamptz,
  updated_by text not null default 'Admin',
  receipt_number text,
  notes text,
  last_updated timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id, payment_month, payment_year)
);

-- 9. News & Announcements Table (Supports targeting, automation deduplication, and soft archive)
create table if not exists public.announcements (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  description text not null,
  category text not null default 'General' check (category in ('General', 'Auction Date', 'Payment Notice', 'Bonus Update', 'Important', 'Scheme Update', 'Group Update')),
  target_type text not null default 'all' check (target_type in ('all', 'group', 'scheme')),
  target_group_id text default 'all',
  target_group_name text,
  target_scheme_id text,
  target_scheme_name text,
  is_auto_generated boolean not null default false,
  source_event_key text,
  is_published boolean not null default true,
  is_archived boolean not null default false,
  archived_at timestamptz,
  publish_date date not null default current_date,
  created_by text not null default 'Admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 10. Announcement Recipients Read-Tracking Table
create table if not exists public.announcement_recipients (
  id text primary key default gen_random_uuid()::text,
  announcement_id text not null references public.announcements(id) on delete cascade,
  user_id text not null references public.chit_users(user_id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique(announcement_id, user_id)
);

-- 11. Admin Activity Logs / Audit Trail Table
create table if not exists public.audit_logs (
  id text primary key default gen_random_uuid()::text,
  action text not null,
  details text not null,
  performed_by text not null,
  target_id text,
  timestamp timestamptz not null default now()
);

-- 12. Performance Indexes
create index if not exists idx_enquiries_status on public.enquiries(enquiry_status);
create index if not exists idx_users_group on public.chit_users(group_id);
create index if not exists idx_users_userid on public.chit_users(user_id);
create index if not exists idx_users_auth_uid on public.chit_users(auth_uid);
create index if not exists idx_users_active on public.chit_users(is_deleted, status);
create index if not exists idx_payments_user on public.payment_records(user_id);
create index if not exists idx_payments_group on public.payment_records(group_id);
create index if not exists idx_payments_status on public.payment_records(payment_status);
create index if not exists idx_payments_lookup on public.payment_records(user_id, payment_month, payment_year);
create index if not exists idx_announcements_active_feed on public.announcements(is_archived, is_published, publish_date desc);

-- 13. Enable Row Level Security (RLS) on All Tables
alter table public.enquiries enable row level security;
alter table public.chit_schemes enable row level security;
alter table public.scheme_versions enable row level security;
alter table public.chit_groups enable row level security;
alter table public.chit_users enable row level security;
alter table public.group_memberships enable row level security;
alter table public.monthly_payment_configs enable row level security;
alter table public.payment_records enable row level security;
alter table public.announcements enable row level security;
alter table public.announcement_recipients enable row level security;
alter table public.audit_logs enable row level security;

-- 14. Admin Role Helper Function
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- 15. Public Read-Only Access for Active Schemes
drop policy if exists "Public can view active schemes" on public.chit_schemes;
create policy "Public can view active schemes"
  on public.chit_schemes for select
  to anon, authenticated
  using (status = 'active');

-- 16. Service Role & JWT Admin Full Access Policies Across All 11 Tables
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'enquiries', 'chit_schemes', 'scheme_versions', 'chit_groups', 'chit_users',
    'group_memberships', 'monthly_payment_configs', 'payment_records',
    'announcements', 'announcement_recipients', 'audit_logs'
  ] loop
    execute format('drop policy if exists "Service and Admin full access on %I" on public.%I', tbl, tbl);
    execute format(
      'create policy "Service and Admin full access on %I" on public.%I for all to service_role using (true) with check (true)',
      tbl, tbl
    );
    execute format('drop policy if exists "JWT Admin full access on %I" on public.%I', tbl, tbl);
    execute format(
      'create policy "JWT Admin full access on %I" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      tbl, tbl
    );
  end loop;
end $$;

-- 17. Strict Member Self-Isolation Policies (Users read ONLY their own records)
drop policy if exists "Members read own user profile" on public.chit_users;
create policy "Members read own user profile"
  on public.chit_users for select
  to authenticated
  using (auth_uid = auth.uid() and is_deleted = false and status = 'active');

drop policy if exists "Members read own payment records" on public.payment_records;
create policy "Members read own payment records"
  on public.payment_records for select
  to authenticated
  using (
    exists (
      select 1 from public.chit_users u
      where u.user_id = payment_records.user_id
        and u.auth_uid = auth.uid()
        and u.is_deleted = false
    )
  );

drop policy if exists "Members read eligible published announcements" on public.announcements;
create policy "Members read eligible published announcements"
  on public.announcements for select
  to authenticated
  using (
    is_published = true
    and is_archived = false
    and (
      target_type = 'all'
      or target_group_id = 'all'
      or exists (
        select 1 from public.chit_users u
        join public.chit_groups g on g.id = u.group_id
        where u.auth_uid = auth.uid()
          and u.is_deleted = false
          and u.status = 'active'
          and (
            (announcements.target_type = 'group' and announcements.target_group_id = u.group_id)
            or (announcements.target_type = 'scheme' and (announcements.target_scheme_id = g.scheme_id or announcements.target_scheme_name = g.scheme_name))
          )
      )
    )
  );
