create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  username text unique,
  avatar_url text,
  email text,
  phone text,
  currency text default 'INR',
  timezone text default 'Asia/Kolkata',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text,
  color text,
  created_at timestamptz default now()
);

create table if not exists payment_modes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references profiles(id),
  scope text not null check (
    scope in ('personal', 'group', 'family')
  ),
  title text not null,
  description text,
  amount numeric(12,2) not null check (amount > 0),
  category_id uuid references categories(id),
  payment_mode_id uuid references payment_modes(id),
  paid_by uuid references profiles(id),
  expense_date timestamptz not null,
  is_split boolean default false,
  split_method text check (
    split_method in (
      'equal',
      'exact',
      'percentage',
      'shares',
      'custom'
    )
  ),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists expense_participants (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid references expenses(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  owed_amount numeric(12,2) not null default 0,
  paid_amount numeric(12,2) not null default 0,
  is_settled boolean default false,
  created_at timestamptz default now(),
  unique(expense_id, user_id)
);

create index idx_expenses_creator
on expenses(created_by);

create index idx_expenses_date
on expenses(expense_date);

create index idx_expense_participants_user
on expense_participants(user_id);

alter table profiles enable row level security;

alter table expenses enable row level security;

alter table expense_participants enable row level security;

create policy "Users can read own profile"
on profiles
for select
using (auth.uid() = id);

create policy "Users can insert own profile"
on profiles
for insert
with check (auth.uid() = id);

create policy "Users can update own profile"
on profiles
for update
using (auth.uid() = id);

alter table categories enable row level security;

alter table payment_modes enable row level security;

create policy "Public read categories"
on categories
for select
using (true);

create policy "Public read payment modes"
on payment_modes
for select
using (true);