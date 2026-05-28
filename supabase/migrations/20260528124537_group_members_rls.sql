-- ==========================================
-- POLICIES FOR GROUP MEMBERS
-- ==========================================

-- 1. Users can view members if they created the group OR if they are already in it
create policy "Users can view members of their groups" on group_members
for select using (
  group_id in (select id from groups where created_by = auth.uid()) or 
  group_id in (select group_id from group_members where user_id = auth.uid())
);

-- 2. Users can insert members if they created the group (Initialization) OR if they are already in it (Inviting friends)
create policy "Users can add members to groups" on group_members
for insert with check (
  group_id in (select id from groups where created_by = auth.uid()) or 
  group_id in (select group_id from group_members where user_id = auth.uid())
);

-- ==========================================
-- POLICIES FOR SHADOW PROFILES
-- ==========================================

-- 1. Anyone authenticated can read shadow profiles (Required so names render correctly on the frontend)
create policy "Authenticated users can view shadow profiles" on shadow_profiles
for select using ( auth.role() = 'authenticated' );

-- 2. Users can create shadow profiles
create policy "Users can create shadow profiles" on shadow_profiles
for insert with check ( auth.uid() = created_by );