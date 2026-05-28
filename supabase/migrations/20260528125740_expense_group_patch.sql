-- 1. Add the missing relationship column to expenses
alter table expenses
add column if not exists group_id uuid references groups(id) on delete cascade;

-- Index it to prevent slow queries when loading the Group Hub
create index if not exists idx_expenses_group on expenses(group_id);

-- ==========================================
-- 2. FIX EXPENSES RLS
-- ==========================================
drop policy if exists "Users can view own expenses" on expenses;

create policy "Users can view relevant expenses" on expenses
for select using (
  auth.uid() = created_by or 
  group_id in (select get_user_group_ids()) -- Utilizes the safe function we built earlier
);

-- ==========================================
-- 3. UNLOCK EXPENSE PARTICIPANTS RLS
-- (This was previously locked, which would have crashed your app next)
-- ==========================================
drop policy if exists "Users can view relevant participants" on expense_participants;
drop policy if exists "Users can insert participants" on expense_participants;

create policy "Users can view relevant participants" on expense_participants
for select using (
  -- If you are allowed to see the expense, you are allowed to see its participants
  expense_id in (select id from expenses) 
);

create policy "Users can insert participants" on expense_participants
for insert with check (
  -- You can only insert participants for an expense you literally just created
  expense_id in (select id from expenses where created_by = auth.uid())
);