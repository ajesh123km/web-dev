-- ============================================================================
-- NON-DESTRUCTIVE MIGRATION V2 FOR TEAM STARS CHITS PRIVATE LIMITED
-- Safe to run multiple times on an existing Supabase Postgres database.
-- Zero destructive DROP / TRUNCATE / DELETE statements. Existing data stays intact.
-- Execute in Supabase Dashboard -> SQL Editor
-- ============================================================================

-- 1. Create Chit Schemes Master Table (supports 1L, 2L, 5L, 10L & custom schemes/durations)
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

-- 2. Create Scheme Versions Snapshot Table (preserves historical terms for audit & running batches)
create table if not exists public.scheme_versions (
  id uuid primary key default gen_random_uuid(),
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

-- 3. Non-destructive extensions to chit_groups (links to scheme & snapshot version)
alter table public.chit_groups
  add column if not exists scheme_id text references public.chit_schemes(id) on delete restrict,
  add column if not exists scheme_version integer not null default 1;

-- Ensure chit_groups.duration_months supports 2..60 months flexibly
do $$
begin
  alter table public.chit_groups drop constraint if exists chit_groups_duration_months_check;
  alter table public.chit_groups add constraint chit_groups_duration_months_check check (duration_months between 2 and 60);
exception when others then null;
end $$;

-- 4. Non-destructive extensions to chit_users (soft delete & optional Supabase Auth UUID link)
alter table public.chit_users
  add column if not exists is_deleted boolean not null default false,
  add column if not exists deleted_at timestamptz,
  add column if not exists auth_uid uuid;

create index if not exists idx_users_auth_uid on public.chit_users(auth_uid);
create index if not exists idx_users_active on public.chit_users(is_deleted, status);

-- 5. Group Memberships History Table (optional relational audit tracking)
create table if not exists public.group_memberships (
  id uuid primary key default gen_random_uuid(),
  group_id text not null references public.chit_groups(id) on delete restrict,
  user_id text not null references public.chit_users(user_id) on delete restrict,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  status text not null default 'active' check (status in ('active', 'inactive', 'completed')),
  unique(group_id, user_id)
);

-- 6. Relax hardcoded 20-month check constraints and protect financial records against accidental cascade delete
do $$
begin
  alter table public.monthly_payment_configs drop constraint if exists monthly_payment_configs_month_check;
  alter table public.monthly_payment_configs add constraint monthly_payment_configs_month_check check (month between 1 and 60);

  alter table public.payment_records drop constraint if exists payment_records_payment_month_check;
  alter table public.payment_records add constraint payment_records_payment_month_check check (payment_month between 1 and 60);

  -- Replace dangerous ON DELETE CASCADE with ON DELETE RESTRICT on payment_records so financial history is never wiped
  alter table public.payment_records drop constraint if exists payment_records_user_id_fkey;
  alter table public.payment_records
    add constraint payment_records_user_id_fkey
    foreign key (user_id) references public.chit_users(user_id) on delete restrict;

  alter table public.payment_records drop constraint if exists payment_records_group_id_fkey;
  alter table public.payment_records
    add constraint payment_records_group_id_fkey
    foreign key (group_id) references public.chit_groups(id) on delete restrict;
exception when others then null;
end $$;

-- 7. Non-destructive extensions to announcements (targeting, deduplication, soft archival)
alter table public.announcements
  add column if not exists target_type text not null default 'all',
  add column if not exists target_group_name text,
  add column if not exists target_scheme_id text,
  add column if not exists target_scheme_name text,
  add column if not exists is_auto_generated boolean not null default false,
  add column if not exists source_event_key text,
  add column if not exists is_archived boolean not null default false,
  add column if not exists archived_at timestamptz;

do $$
begin
  alter table public.announcements drop constraint if exists announcements_category_check;
  alter table public.announcements
    add constraint announcements_category_check
    check (category in ('General', 'Auction Date', 'Payment Notice', 'Bonus Update', 'Important', 'Scheme Update', 'Group Update'));

  alter table public.announcements drop constraint if exists announcements_target_type_check;
  alter table public.announcements
    add constraint announcements_target_type_check
    check (target_type in ('all', 'group', 'scheme'));
exception when others then null;
end $$;

create index if not exists idx_announcements_active_feed
  on public.announcements(is_archived, is_published, publish_date desc);

-- 8. Announcement Recipients Table (fine-grained delivery tracking)
create table if not exists public.announcement_recipients (
  id uuid primary key default gen_random_uuid(),
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  user_id text not null references public.chit_users(user_id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique(announcement_id, user_id)
);

-- 9. Seed Core Chit Schemes Idempotently (₹1L, ₹2L, ₹5L, ₹10L — skips existing IDs cleanly)
insert into public.chit_schemes (
  id, scheme_code, name_en, name_ta, chit_value, duration_months, available_durations,
  first_month_instalment, min_instalment, max_instalment, total_instalments_paid, dividend_benefit,
  prompt_bonus, last_month_bonus, total_bonus, tagline_en, tagline_ta, status, version
) values
  (
    'scheme-1-lakh', 'TSC-1L-20M', '₹1,00,000 Chit Scheme', '₹1,00,000 சீட்டு திட்டம்',
    100000, 20, array[10, 12, 15, 20, 24], 5000, 4600, 5000, 95600, 4400, 2000, 400, 2400,
    'Ideal starting plan for individuals, small traders, and monthly savers looking for steady capital.',
    'சிறு வணிகர்கள் மற்றும் மாதந்திர சேமிப்பாளர்களுக்கான சிறந்த தொடக்கத் திட்டம்.',
    'active', 1
  ),
  (
    'scheme-2-lakh', 'TSC-2L-20M', '₹2,00,000 Chit Scheme', '₹2,00,000 சீட்டு திட்டம்',
    200000, 20, array[10, 12, 15, 20, 24], 10000, 9200, 10000, 191200, 8800, 4000, 800, 4800,
    'Balanced plan for families, shop owners, and recurring business expansion or education savings.',
    'குடும்பத் தேவைகள், கல்வி மற்றும் வணிக வளர்ச்சிக்கான சமநிலையான திட்டம்.',
    'active', 1
  ),
  (
    'scheme-5-lakh', 'TSC-5L-20M', '₹5,00,000 Chit Scheme', '₹5,00,000 சீட்டு திட்டம்',
    500000, 20, array[10, 12, 15, 20, 24], 25000, 23000, 25000, 478000, 22000, 10000, 2000, 12000,
    'High-value corporate plan built for business investments, equipment purchase, and major family goals.',
    'பெரிய வணிக முதலீடுகள் மற்றும் குடும்ப சுப காரியங்களுக்கான உயர் மதிப்பு திட்டம்.',
    'active', 1
  ),
  (
    'scheme-10-lakh', 'TSC-10L-20M', '₹10,00,000 Chit Scheme', '₹10,00,000 சீட்டு திட்டம்',
    1000000, 20, array[10, 12, 15, 20, 24], 50000, 46000, 50000, 956000, 44000, 20000, 4000, 24000,
    'Flagship Ten Lakh enterprise chit plan built for commercial expansion, property milestones, and institutional capital.',
    'பெரிய தொழில் விரிவாக்கம் மற்றும் முதன்மை நிதி இலக்குகளுக்கான ₹10 லட்சம் முதன்மை சீட்டு திட்டம்.',
    'active', 1
  )
on conflict (id) do nothing;

-- Backfill scheme_id on existing groups safely
update public.chit_groups set scheme_id = 'scheme-1-lakh' where scheme_id is null and chit_value = 100000;
update public.chit_groups set scheme_id = 'scheme-2-lakh' where scheme_id is null and chit_value = 200000;
update public.chit_groups set scheme_id = 'scheme-5-lakh' where scheme_id is null and chit_value = 500000;
update public.chit_groups set scheme_id = 'scheme-10-lakh' where scheme_id is null and chit_value = 1000000;

-- 10. Row Level Security (RLS) Enablement & Zero-Trust Policies
alter table public.chit_schemes enable row level security;
alter table public.scheme_versions enable row level security;
alter table public.monthly_payment_configs enable row level security;
alter table public.group_memberships enable row level security;
alter table public.announcement_recipients enable row level security;

-- Helper function: identify admin role stored in Supabase JWT app_metadata
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- Public read access ONLY for active chit schemes (used cleanly with Publishable key if enabled)
drop policy if exists "Public can view active schemes" on public.chit_schemes;
create policy "Public can view active schemes"
  on public.chit_schemes for select
  to anon, authenticated
  using (status = 'active');

-- Server secret / service_role & Admin full access policies
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'chit_schemes', 'scheme_versions', 'chit_groups', 'chit_users',
    'monthly_payment_configs', 'payment_records', 'announcements',
    'group_memberships', 'announcement_recipients', 'audit_logs', 'enquiries'
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

-- Authenticated member isolation policies (Users see ONLY their own profile, payments, and eligible notices)
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
