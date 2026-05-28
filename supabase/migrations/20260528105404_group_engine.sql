-- 1. GROUPS & MEMBERSHIPS
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- 2. SHADOW PROFILES (For unregistered users)
create table if not exists shadow_profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  temp_name text not null,
  created_by uuid references profiles(id), -- Who invited them
  created_at timestamptz default now()
);

create table if not exists group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,       -- If registered
  shadow_id uuid references shadow_profiles(id) on delete cascade, -- If not registered
  role text default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz default now(),
  
  -- A member must be EITHER a registered user OR a shadow user, never both, never neither.
  constraint valid_member check (
    (user_id is not null and shadow_id is null) or 
    (user_id is null and shadow_id is not null)
  ),
  unique(group_id, user_id),
  unique(group_id, shadow_id)
);

-- 3. UPDATING EXPENSE PARTICIPANTS FOR SHADOW USERS
-- We alter the table you already created to support shadow users
alter table expense_participants 
add column shadow_id uuid references shadow_profiles(id) on delete cascade;

alter table expense_participants
add constraint valid_participant check (
  (user_id is not null and shadow_id is null) or 
  (user_id is null and shadow_id is not null)
);

-- Drop the old unique constraint and create a new one that accounts for shadow users
alter table expense_participants drop constraint if exists expense_participants_expense_id_user_id_key;
create unique index idx_unique_registered_participant on expense_participants(expense_id, user_id) where user_id is not null;
create unique index idx_unique_shadow_participant on expense_participants(expense_id, shadow_id) where shadow_id is not null;


-- 4. CACHED BALANCES (Trigger-Updated Table for High Performance)
create table if not exists group_balances (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  shadow_id uuid references shadow_profiles(id) on delete cascade,
  balance numeric(12,2) not null default 0, -- Positive means they are owed money, Negative means they owe money
  updated_at timestamptz default now(),
  
  constraint valid_balance_owner check (
    (user_id is not null and shadow_id is null) or 
    (user_id is null and shadow_id is not null)
  ),
  unique(group_id, user_id),
  unique(group_id, shadow_id)
);

-- 5. SETTLEMENTS (With Explicit Confirmation Authority)
create table if not exists settlements (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  
  payer_id uuid references profiles(id),
  payer_shadow_id uuid references shadow_profiles(id),
  
  payee_id uuid references profiles(id),
  payee_shadow_id uuid references shadow_profiles(id),
  
  amount numeric(12,2) not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending', 'completed', 'rejected')),
  
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  completed_at timestamptz,
  
  constraint valid_payer check ((payer_id is not null and payer_shadow_id is null) or (payer_id is null and payer_shadow_id is not null)),
  constraint valid_payee check ((payee_id is not null and payee_shadow_id is null) or (payee_id is null and payee_shadow_id is not null))
);

-- 6. ROW LEVEL SECURITY (RLS) FOR GROUPS
alter table groups enable row level security;
alter table group_members enable row level security;
alter table shadow_profiles enable row level security;

-- Users can see groups they are a member of
create policy "Users can view their groups" on groups
for select using (
  id in (select group_id from group_members where user_id = auth.uid())
);

-- Users can create groups
create policy "Users can create groups" on groups
for insert with check (auth.uid() = created_by);