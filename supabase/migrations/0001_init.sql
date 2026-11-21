-- Caixinha Virtual: perfis, campanhas e doações registradas manualmente.
-- Execute este arquivo no SQL Editor do Supabase.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  business_name text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, business_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'business_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.profiles (id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text not null default '',
  goal_cents bigint not null default 0 check (goal_cents >= 0),
  bank_code text not null default '',
  bank_name text not null default '',
  pix_url text,
  pix_copy_paste text,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint campaigns_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint campaigns_active_requires_pix check (
    status <> 'active'
    or (
      length(trim(bank_name)) > 0
      and (pix_url is not null or pix_copy_paste is not null)
    )
  )
);

create index if not exists campaigns_merchant_idx
  on public.campaigns (merchant_id, created_at desc);

alter table public.campaigns enable row level security;

drop policy if exists "campaigns_select_own" on public.campaigns;
create policy "campaigns_select_own"
  on public.campaigns for select
  to authenticated
  using (auth.uid() = merchant_id);

drop policy if exists "campaigns_insert_own" on public.campaigns;
create policy "campaigns_insert_own"
  on public.campaigns for insert
  to authenticated
  with check (auth.uid() = merchant_id);

drop policy if exists "campaigns_update_own" on public.campaigns;
create policy "campaigns_update_own"
  on public.campaigns for update
  to authenticated
  using (auth.uid() = merchant_id)
  with check (auth.uid() = merchant_id);

drop policy if exists "campaigns_delete_own" on public.campaigns;
create policy "campaigns_delete_own"
  on public.campaigns for delete
  to authenticated
  using (auth.uid() = merchant_id);

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  merchant_id uuid not null references public.profiles (id) on delete cascade,
  amount_cents bigint not null check (amount_cents > 0 and amount_cents <= 100000000),
  donor_name text,
  note text,
  donated_at date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists donations_campaign_idx
  on public.donations (campaign_id, donated_at desc, created_at desc);

create index if not exists donations_merchant_idx
  on public.donations (merchant_id, created_at desc);

alter table public.donations enable row level security;

drop policy if exists "donations_select_own" on public.donations;
create policy "donations_select_own"
  on public.donations for select
  to authenticated
  using (auth.uid() = merchant_id);

drop policy if exists "donations_insert_own" on public.donations;
create policy "donations_insert_own"
  on public.donations for insert
  to authenticated
  with check (auth.uid() = merchant_id);

drop policy if exists "donations_update_own" on public.donations;
create policy "donations_update_own"
  on public.donations for update
  to authenticated
  using (auth.uid() = merchant_id)
  with check (auth.uid() = merchant_id);

drop policy if exists "donations_delete_own" on public.donations;
create policy "donations_delete_own"
  on public.donations for delete
  to authenticated
  using (auth.uid() = merchant_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists campaigns_set_updated_at on public.campaigns;
create trigger campaigns_set_updated_at
  before update on public.campaigns
  for each row execute function public.set_updated_at();

create or replace view public.campaign_summaries
with (security_invoker = true)
as
select
  c.id,
  c.merchant_id,
  c.slug,
  c.title,
  c.description,
  c.goal_cents,
  c.bank_code,
  c.bank_name,
  c.pix_url,
  c.pix_copy_paste,
  c.status,
  c.created_at,
  c.updated_at,
  coalesce(sum(d.amount_cents), 0)::bigint as total_cents,
  count(d.id)::integer as donation_count
from public.campaigns c
left join public.donations d on d.campaign_id = c.id
group by c.id;

revoke all on public.campaign_summaries from anon;
grant select on public.campaign_summaries to authenticated;
