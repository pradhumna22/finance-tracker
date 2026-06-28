create extension if not exists "uuid-ossp";

create table transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(10,2) not null check (amount > 0),
  type text not null check (type in ('expense','income','investment')),
  category text not null,
  subcategory text,
  description text not null,
  raw_message text not null default '',
  date date not null default current_date,
  created_at timestamptz not null default now(),
  source text not null default 'whatsapp' check (source in ('whatsapp','manual'))
);

alter table transactions enable row level security;
create policy "Users own transactions"
  on transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_transactions_user_date on transactions(user_id, date desc);
create index idx_transactions_type on transactions(user_id, type);

create table monthly_cache (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  month int not null check (month between 1 and 12),
  year int not null,
  total_expense numeric(12,2) not null default 0,
  total_income numeric(12,2) not null default 0,
  total_investment numeric(12,2) not null default 0,
  category_breakdown jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  unique(user_id, month, year)
);

alter table monthly_cache enable row level security;
create policy "Users own monthly_cache"
  on monthly_cache for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table whatsapp_users (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  phone_number text not null unique,
  created_at timestamptz not null default now()
);

alter table whatsapp_users enable row level security;
create policy "Service role only"
  on whatsapp_users for all
  using (false);
