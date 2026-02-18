-- Create groups table
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#3b82f6',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create task_groups junction table
create table if not exists public.task_groups (
  task_id uuid not null references public.tasks(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  primary key (task_id, group_id)
);

-- Add group_id column to tasks table (nullable for backward compatibility)
alter table public.tasks 
add column if not exists group_id uuid references public.groups(id) on delete set null;

-- Enable RLS
alter table public.groups enable row level security;
alter table public.task_groups enable row level security;

-- Groups RLS: each user can only see/manage their own groups
create policy "groups_select_own" on public.groups for select using (auth.uid() = user_id);
create policy "groups_insert_own" on public.groups for insert with check (auth.uid() = user_id);
create policy "groups_update_own" on public.groups for update using (auth.uid() = user_id);
create policy "groups_delete_own" on public.groups for delete using (auth.uid() = user_id);

-- Task groups RLS: can only access if user owns the group
create policy "task_groups_select_own" on public.task_groups 
for select using (
  group_id in (select id from public.groups where user_id = auth.uid())
);

create policy "task_groups_insert_own" on public.task_groups 
for insert with check (
  group_id in (select id from public.groups where user_id = auth.uid())
);

create policy "task_groups_delete_own" on public.task_groups 
for delete using (
  group_id in (select id from public.groups where user_id = auth.uid())
);

-- Index for performance
create index if not exists idx_groups_user_id on public.groups(user_id);
create index if not exists idx_task_groups_group_id on public.task_groups(group_id);
create index if not exists idx_task_groups_task_id on public.task_groups(task_id);
