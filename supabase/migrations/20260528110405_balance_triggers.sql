-- ==============================================================================
-- 1. TRIGGER: EXPENSE PARTICIPANTS LEDGER
-- ==============================================================================
create or replace function maintain_group_balances()
returns trigger
language plpgsql
security definer -- Security: Ensures this runs with elevated privileges to bypass RLS during system calculations
as $$
declare
  v_group_id uuid;
  v_net_change numeric(12,2) := 0;
  v_target_user_id uuid;
  v_target_shadow_id uuid;
begin
  -- Step A: Identify the Group ID from the parent expense
  if TG_OP = 'DELETE' then
    select group_id into v_group_id from expenses where id = OLD.expense_id;
  else
    select group_id into v_group_id from expenses where id = NEW.expense_id;
  end if;

  -- If this is a personal expense (group_id is null), skip calculation and exit
  if v_group_id is null then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  -- Step B: Calculate the Net Mathematical Change
  if TG_OP = 'INSERT' then
    v_net_change := NEW.paid_amount - NEW.owed_amount;
    v_target_user_id := NEW.user_id;
    v_target_shadow_id := NEW.shadow_id;
    
  elsif TG_OP = 'UPDATE' then
    -- Net change is the difference between the new calculation and the old calculation
    v_net_change := (NEW.paid_amount - NEW.owed_amount) - (OLD.paid_amount - OLD.owed_amount);
    v_target_user_id := NEW.user_id;
    v_target_shadow_id := NEW.shadow_id;
    
  elsif TG_OP = 'DELETE' then
    -- Reversing the old impact
    v_net_change := -(OLD.paid_amount - OLD.owed_amount);
    v_target_user_id := OLD.user_id;
    v_target_shadow_id := OLD.shadow_id;
  end if;

  -- Step C: If there is no financial change (e.g., they just edited a note), exit early to save compute
  if v_net_change = 0 then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  -- Step D: Upsert the Balance (Handling Registered vs. Shadow Users safely)
  if v_target_user_id is not null then
    update group_balances 
    set balance = balance + v_net_change, updated_at = now()
    where group_id = v_group_id and user_id = v_target_user_id;
    
    if not found then
      insert into group_balances (group_id, user_id, balance) 
      values (v_group_id, v_target_user_id, v_net_change);
    end if;
  else
    update group_balances 
    set balance = balance + v_net_change, updated_at = now()
    where group_id = v_group_id and shadow_id = v_target_shadow_id;
    
    if not found then
      insert into group_balances (group_id, shadow_id, balance) 
      values (v_group_id, v_target_shadow_id, v_net_change);
    end if;
  end if;

  if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
end;
$$;

create trigger on_expense_participant_change
after insert or update or delete on expense_participants
for each row execute function maintain_group_balances();


-- ==============================================================================
-- 2. TRIGGER: SETTLEMENTS LEDGER (Strict Confirmation Enforcement)
-- ==============================================================================
create or replace function maintain_settlement_balances()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Scenario A: A settlement is marked as 'completed' (User B confirmed receipt)
  if (TG_OP = 'INSERT' and NEW.status = 'completed') or 
     (TG_OP = 'UPDATE' and OLD.status != 'completed' and NEW.status = 'completed') then
    
    -- Payer's balance increases (they paid their debt, so their negative balance moves towards zero)
    if NEW.payer_id is not null then
      update group_balances set balance = balance + NEW.amount, updated_at = now() where group_id = NEW.group_id and user_id = NEW.payer_id;
    else
      update group_balances set balance = balance + NEW.amount, updated_at = now() where group_id = NEW.group_id and shadow_id = NEW.payer_shadow_id;
    end if;

    -- Payee's balance decreases (they received their cash, so their positive balance moves towards zero)
    if NEW.payee_id is not null then
      update group_balances set balance = balance - NEW.amount, updated_at = now() where group_id = NEW.group_id and user_id = NEW.payee_id;
    else
      update group_balances set balance = balance - NEW.amount, updated_at = now() where group_id = NEW.group_id and shadow_id = NEW.payee_shadow_id;
    end if;

  -- Scenario B: An admin or user reverses a completed settlement (e.g., the check bounced)
  elsif TG_OP = 'UPDATE' and OLD.status = 'completed' and NEW.status != 'completed' then
     
     -- Reverse Payer
     if NEW.payer_id is not null then
       update group_balances set balance = balance - NEW.amount, updated_at = now() where group_id = NEW.group_id and user_id = NEW.payer_id;
     else
       update group_balances set balance = balance - NEW.amount, updated_at = now() where group_id = NEW.group_id and shadow_id = NEW.payer_shadow_id;
     end if;
     
     -- Reverse Payee
     if NEW.payee_id is not null then
       update group_balances set balance = balance + NEW.amount, updated_at = now() where group_id = NEW.group_id and user_id = NEW.payee_id;
     else
       update group_balances set balance = balance + NEW.amount, updated_at = now() where group_id = NEW.group_id and shadow_id = NEW.payee_shadow_id;
     end if;
  end if;

  return NEW;
end;
$$;

create trigger on_settlement_status_change
after insert or update on settlements
for each row execute function maintain_settlement_balances();