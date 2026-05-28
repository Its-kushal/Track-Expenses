-- 1. Create the circuit-breaker function. 
-- 'security definer' means this function bypasses RLS to prevent infinite loops.
create or replace function get_user_group_ids()
returns setof uuid
language sql
security definer
set search_path = public
as $$
  select group_id from group_members where user_id = auth.uid();
$$;

-- 2. Destroy the recursive policies
drop policy if exists "Users can view their groups" on groups;
drop policy if exists "Users can view members of their groups" on group_members;
drop policy if exists "Users can add members to groups" on group_members;

-- 3. Rebuild the Groups policy using the safe function
create policy "Users can view their groups" on groups
for select using (
  auth.uid() = created_by or
  id in (select get_user_group_ids())
);

-- 4. Rebuild the Group Members policy using the safe function
create policy "Users can view members of their groups" on group_members
for select using (
  group_id in (select get_user_group_ids())
);

-- 5. Rebuild the Group Members insert policy securely
create policy "Users can add members to groups" on group_members
for insert with check (
  -- Allow insertion if they literally just created the group, or if they are already an active member
  group_id in (select id from groups where created_by = auth.uid()) or 
  group_id in (select get_user_group_ids())
);