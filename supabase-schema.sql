create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company_name text,
  phone text,
  plan text not null default 'free',
  razorpay_subscription_id text,
  subscription_status text default 'inactive',
  created_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  property_type text,
  transaction_type text not null default 'sale',
  price numeric,
  area numeric,
  bedrooms integer,
  location text,
  status text not null default 'available',
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  requirement text,
  budget numeric,
  location text,
  status text not null default 'new',
  next_follow_up timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled',
  notes text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.leads enable row level security;
alter table public.site_visits enable row level security;

create policy "profiles own row"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "properties own rows"
on public.properties
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "leads own rows"
on public.leads
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "visits own rows"
on public.site_visits
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();
