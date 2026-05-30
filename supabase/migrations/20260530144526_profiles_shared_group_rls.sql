-- ==============================================================================
-- SHARED GROUP PROFILE ACCESS
-- ==============================================================================
-- This policy allows a user to read the profile of another user ONLY IF they 
-- both belong to at least one shared group. This prevents random users from 
-- scraping names/emails, while allowing group ledgers to render correctly.

create policy "Users can view profiles of shared group members"
on profiles
for select
using (
  -- Is the profile we are trying to read...
  id in (
    -- ...belonging to a user who is in a group...
    select user_id 
    from group_members 
    -- ...that the current authenticated user is ALSO in?
    where group_id in (select get_user_group_ids())
  )
);