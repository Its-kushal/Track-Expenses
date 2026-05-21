create table activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  expense_id uuid references expenses(id) on delete cascade,
  action text not null check (
    action in (
      'created',
      'updated',
      'deleted'
    )
  ),

  old_data jsonb,
  new_data jsonb,
  created_at timestamptz default now()
);

alter table activities enable row level security;
create policy "Users can view own activities"
on activities
for select
using (auth.uid() = user_id);
create policy "Users can create own activities"
on activities
for insert
with check (auth.uid() = user_id);
create index idx_activities_user
on activities(user_id);
create index idx_activities_expense
on activities(expense_id);