-- =============================================
-- Thryve Rise — Initial Database Schema
-- =============================================

-- Users table
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'player' check (role in ('player', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

-- Users can read their own record; admins can read all
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

create policy "users_select_admin" on public.users
  for select using (
    exists (
      select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'
    )
  );

create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- =============================================
-- Tasks table
-- =============================================
create table if not exists public.tasks (
  id integer primary key,
  phase integer not null check (phase between 1 and 4),
  title text not null,
  description text not null,
  icon text not null default '📋',
  xp integer not null default 0,
  impact_label text not null default ''
);

alter table public.tasks enable row level security;

-- All authenticated users can read tasks
create policy "tasks_select_authenticated" on public.tasks
  for select using (auth.uid() is not null);

-- Only admins can modify tasks
create policy "tasks_insert_admin" on public.tasks
  for insert with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "tasks_upsert_admin" on public.tasks
  for update using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- =============================================
-- Completions table
-- =============================================
create table if not exists public.completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  task_id integer not null references public.tasks(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, task_id)
);

alter table public.completions enable row level security;

create policy "completions_select_own" on public.completions
  for select using (auth.uid() = user_id);

create policy "completions_select_admin" on public.completions
  for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "completions_insert_own" on public.completions
  for insert with check (auth.uid() = user_id);

-- Enable realtime for completions
alter publication supabase_realtime add table public.completions;

-- =============================================
-- User stats table
-- =============================================
create table if not exists public.user_stats (
  user_id uuid primary key references public.users(id) on delete cascade,
  total_xp integer not null default 0,
  level integer not null default 1,
  last_active timestamptz not null default now(),
  current_phase integer not null default 1,
  current_streak integer not null default 0,
  best_streak integer not null default 0,
  last_completion_date date
);

alter table public.user_stats enable row level security;

create policy "user_stats_select_own" on public.user_stats
  for select using (auth.uid() = user_id);

create policy "user_stats_select_admin" on public.user_stats
  for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "user_stats_upsert_own" on public.user_stats
  for insert with check (auth.uid() = user_id);

create policy "user_stats_update_own" on public.user_stats
  for update using (auth.uid() = user_id);

-- =============================================
-- Earned badges table
-- =============================================
create table if not exists public.earned_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  badge_id text not null,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

alter table public.earned_badges enable row level security;

create policy "badges_select_own" on public.earned_badges
  for select using (auth.uid() = user_id);

create policy "badges_select_admin" on public.earned_badges
  for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "badges_insert_own" on public.earned_badges
  for insert with check (auth.uid() = user_id);

-- =============================================
-- Helper function: set admin role
-- =============================================
create or replace function public.set_admin_role(target_email text)
returns void
language plpgsql
security definer
as $$
begin
  update public.users set role = 'admin' where email = target_email;
end;
$$;
