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

-- 2. Indexes for fast lookup
create index if not exists idx_enquiries_status on public.enquiries(enquiry_status);
create index if not exists idx_enquiries_created_at on public.enquiries(created_at desc);
create index if not exists idx_enquiries_mobile on public.enquiries(mobile_number);

-- 3. Row Level Security (RLS)
alter table public.enquiries enable row level security;

-- Allow public anonymous users to insert enquiries (lead submission)
create policy "Allow anonymous enquiry submission"
  on public.enquiries
  for insert
  to anon, authenticated
  with check (true);

-- Block public from viewing customer enquiries (protect customer privacy)
-- Only service_role or authenticated administrators can view enquiries
create policy "Allow service_role full access"
  on public.enquiries
  for all
  to service_role
  using (true)
  with check (true);
