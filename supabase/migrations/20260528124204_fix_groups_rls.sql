-- 1. Drop the overly strict policy
drop policy if exists "Users can view their groups" on groups;

-- 2. Create the corrected policy
create policy "Users can view their groups" on groups
for select using (
  auth.uid() = created_by or
  id in (select group_id from group_members where user_id = auth.uid())
);