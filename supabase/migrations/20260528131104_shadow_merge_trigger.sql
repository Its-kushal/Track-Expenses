create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_shadow_id uuid;
begin
  -- 1. Create the official profile
  insert into public.profiles (id, email)
  values (new.id, new.email);

  -- 2. Hunt for a pre-existing shadow profile using the exact email
  select id into v_shadow_id 
  from public.shadow_profiles 
  where email = new.email 
  limit 1;

  -- 3. If a shadow exists, perform the Ghost Merge
  if v_shadow_id is not null then
    
    -- A. Upgrade Group Memberships
    update public.group_members 
    set user_id = new.id, shadow_id = null 
    where shadow_id = v_shadow_id;
    
    -- B. Upgrade Expense Participants
    update public.expense_participants 
    set user_id = new.id, shadow_id = null 
    where shadow_id = v_shadow_id;
    
    -- C. Upgrade Cached Balances
    update public.group_balances 
    set user_id = new.id, shadow_id = null 
    where shadow_id = v_shadow_id;
    
    -- D. Upgrade Settlements (Payer & Payee sides)
    update public.settlements 
    set payer_id = new.id, payer_shadow_id = null 
    where payer_shadow_id = v_shadow_id;
    
    update public.settlements 
    set payee_id = new.id, payee_shadow_id = null 
    where payee_shadow_id = v_shadow_id;

    -- E. Destroy the old shadow profile (Cleanup)
    delete from public.shadow_profiles where id = v_shadow_id;
    
  end if;

  return new;
end;
$$;