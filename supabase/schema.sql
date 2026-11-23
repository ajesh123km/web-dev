-- SUPABASE SCHEMA FOR TEAM STARS CHITS PRIVATE LIMITED
-- Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create Enquiries Table
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  mobile_number text not null,
  email text not null,
  city text not null,
  preferred_scheme text not null,
  preferred_language text not null default 'en',
  message text,
  consent boolean not null default true,
  enquiry_status text not null default 'New' check (enquiry_status in ('New', 'Contacted', 'In Progress', 'Completed')),
  created_at timestamptz not null default now()
);

-- 2. Chit Groups Table (Max 99 members per group enforced)
create table if not exists public.chit_groups (
  id text primary key, -- e.g. 'GRP-2L-01'
  name text not null,
  scheme_name text not null,
  chit_value numeric not null,
  duration_months integer not null default 20,
  start_date date not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  max_members integer not null default 99 check (max_members <= 99),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Chit Users Table
create table if not exists public.chit_users (
  id text primary key, -- e.g. 'TS-2026-001'
  user_id text unique not null,
  full_name text not null,
  mobile_number text not null,
  address text not null,
  city text not null,
  email text,
  group_id text references public.chit_groups(id) on delete set null,
  password_hash text not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  role text not null default 'user' check (role in ('user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Monthly Payment Configurations
create table if not exists public.monthly_payment_configs (
  id uuid primary key default gen_random_uuid(),
  group_id text not null references public.chit_groups(id) on delete cascade,
  month integer not null check (month between 1 and 20),
  month_label text not null,
  year integer not null,
  payment_amount numeric not null check (payment_amount > 0),
  due_date date not null,
  created_by text not null default 'Admin',
  created_at timestamptz not null default now(),
  unique(group_id, month, year)
);

-- 5. Individual Payment Records
create table if not exists public.payment_records (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.chit_users(user_id) on delete cascade,
  user_name text not null,
  group_id text not null references public.chit_groups(id) on delete cascade,
  group_name text not null,
  payment_month integer not null check (payment_month between 1 and 20),
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
  unique(user_id, payment_month, payment_year) -- Prevent duplicate monthly payment records
);

-- 6. News and Announcements Table
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null default 'General' check (category in ('General', 'Auction Date', 'Payment Notice', 'Bonus Update', 'Important')),
  target_group_id text default 'all',
  is_published boolean not null default true,
  publish_date date not null default current_date,
  created_by text not null default 'Admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. Admin Activity Logs / Audit Trail
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  details text not null,
  performed_by text not null,
  target_id text,
  timestamp timestamptz not null default now()
);

-- 8. Indexes for fast lookup
create index if not exists idx_enquiries_status on public.enquiries(enquiry_status);
create index if not exists idx_users_group on public.chit_users(group_id);
create index if not exists idx_users_userid on public.chit_users(user_id);
create index if not exists idx_payments_user on public.payment_records(user_id);
create index if not exists idx_payments_group on public.payment_records(group_id);
create index if not exists idx_payments_status on public.payment_records(payment_status);
create index if not exists idx_payments_lookup on public.payment_records(user_id, payment_month, payment_year);
create index if not exists idx_announcements_published on public.announcements(is_published, publish_date desc);

-- 9. Row Level Security (RLS)
alter table public.enquiries enable row level security;
alter table public.chit_groups enable row level security;
alter table public.chit_users enable row level security;
alter table public.payment_records enable row level security;
alter table public.announcements enable row level security;
alter table public.audit_logs enable row level security;

-- Policies for public and service_role
create policy "Allow service_role full access to all tables"
  on public.enquiries for all to service_role using (true) with check (true);

create policy "Allow service_role full groups"
  on public.chit_groups for all to service_role using (true) with check (true);

create policy "Allow service_role full users"
  on public.chit_users for all to service_role using (true) with check (true);

create policy "Allow service_role full payments"
  on public.payment_records for all to service_role using (true) with check (true);

create policy "Allow service_role full announcements"
  on public.announcements for all to service_role using (true) with check (true);

create policy "Allow service_role full audit"
  on public.audit_logs for all to service_role using (true) with check (true);

