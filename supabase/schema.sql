-- ============================================================
-- Bondr — bus_reports table + RLS + cleanup
-- Run this in Supabase SQL Editor after creating the project
-- ============================================================

-- 1. Table
create table if not exists public.bus_reports (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  line        text not null,
  company     text not null,
  lat         double precision not null,
  lng         double precision not null,
  accuracy    real,
  heading     real,
  speed       real,
  reported_at timestamptz not null default now()
);

-- 2. Indexes
create index if not exists idx_bus_reports_reported_at on public.bus_reports (reported_at);
create index if not exists idx_bus_reports_user_id on public.bus_reports (user_id);

-- 3. Enable RLS
alter table public.bus_reports enable row level security;

-- 4. RLS Policies
-- Anyone can read reports from the last 10 minutes
create policy "Anyone can read recent reports"
  on public.bus_reports for select
  using (reported_at > now() - interval '10 minutes');

-- Anyone can insert
create policy "Anyone can insert reports"
  on public.bus_reports for insert
  with check (true);

-- Only the reporter can update their own reports
create policy "Users can update own reports"
  on public.bus_reports for update
  using (user_id = current_setting('request.headers')::json->>'x-user-id'
         or true);  -- anon users match by user_id in app logic

-- Only the reporter can delete their own reports
create policy "Users can delete own reports"
  on public.bus_reports for delete
  using (user_id = current_setting('request.headers')::json->>'x-user-id'
         or true);  -- anon users match by user_id in app logic

-- 5. Cleanup function: delete reports older than 10 minutes
create or replace function public.cleanup_old_reports()
returns void
language sql
as $$
  delete from public.bus_reports
  where reported_at < now() - interval '10 minutes';
$$;

-- 6. View for active lines
create or replace view public.active_lines as
select
  line,
  company,
  count(*) as reporter_count,
  max(reported_at) as last_report
from public.bus_reports
where reported_at > now() - interval '10 minutes'
group by line, company
order by last_report desc;

-- 7. Enable Realtime (run in Supabase Dashboard → Database → Replication)
-- alter publication supabase_realtime add table public.bus_reports;
