-- Add category column to tasks table
alter table public.tasks 
add column if not exists category text not null default 'one_time' 
check (category in ('daily', 'weekly', 'monthly', 'one_time'));

-- Add due_date for better task management
alter table public.tasks
add column if not exists due_date date;

-- Index for filtering by category
create index if not exists idx_tasks_category on public.tasks(category);
create index if not exists idx_tasks_due_date on public.tasks(due_date);
