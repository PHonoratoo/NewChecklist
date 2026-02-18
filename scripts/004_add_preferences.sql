-- Create user_preferences table
create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  theme text not null default 'light' check (theme in ('light', 'dark')),
  font_family text not null default 'sans' check (font_family in ('sans', 'serif', 'mono')),
  border_radius integer not null default 6 check (border_radius >= 0 and border_radius <= 24),
  primary_color text not null default '#3b82f6',
  accent_color text not null default '#06b6d4',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.user_preferences enable row level security;

-- User preferences RLS: each user can only see/manage their own preferences
create policy "preferences_select_own" on public.user_preferences for select using (auth.uid() = user_id);
create policy "preferences_insert_own" on public.user_preferences for insert with check (auth.uid() = user_id);
create policy "preferences_update_own" on public.user_preferences for update using (auth.uid() = user_id);
create policy "preferences_delete_own" on public.user_preferences for delete using (auth.uid() = user_id);

-- Index for performance
create index if not exists idx_user_preferences_user_id on public.user_preferences(user_id);
