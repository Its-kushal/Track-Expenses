-- ==============================================================================
-- SECURE EMAIL LOOKUP (Circuit Breaker)
-- ==============================================================================
-- 'security definer' bypasses RLS, allowing the function to scan the whole 
-- profiles table, but restricts the output to ONLY the id and full_name.
-- This prevents users from scraping emails or phone numbers.

create or replace function get_profile_by_email(lookup_email text)
returns table (id uuid, full_name text)
language sql
security definer 
set search_path = public
as $$
  select id, full_name 
  from profiles 
  where lower(email) = lower(lookup_email)
  limit 1;
$$;