-- =====================================================================
-- CAIXINHA VIRTUAL: SCHEMA COMPLETO CONSOLIDADO
-- Execute este script no SQL Editor do seu projeto Supabase:
-- https://supabase.com/dashboard/project/hrpurqngkewefmsqmnnd/sql/new
-- =====================================================================

create extension if not exists "pgcrypto";

-- 1. TABELA DE PERFIS DOS COMERCIANTES
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

-- Trigger para criar perfil automaticamente no cadastro
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

-- 2. TABELA DE CAMPANHAS / CAIXINHAS
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.profiles (id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text not null default '',
  goal_cents bigint not null default 0 check (goal_cents >= 0),
  bank_code text not null default '',
  bank_name text not null default '',
  pix_key text not null default '',
  pix_receiver_name text not null default '',
  city text not null default '',
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
      and length(trim(pix_key)) > 0
      and length(trim(city)) > 0
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

drop policy if exists "campaigns_public_read" on public.campaigns;
create policy "campaigns_public_read"
  on public.campaigns for select
  to anon
  using (status = 'active');

drop policy if exists "campaigns_public_read_authenticated" on public.campaigns;
create policy "campaigns_public_read_authenticated"
  on public.campaigns for select
  to authenticated
  using (status = 'active');

grant select on public.campaigns to anon;

-- 3. TABELA DE DOAÇÕES / CONTRIBUIÇÕES
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  merchant_id uuid not null references public.profiles (id) on delete cascade,
  amount_cents bigint not null check (amount_cents > 0 and amount_cents <= 100000000),
  donor_name text,
  note text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected')),
  confirmed_at timestamptz,
  donated_at date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists donations_campaign_idx
  on public.donations (campaign_id, donated_at desc, created_at desc);

create index if not exists donations_campaign_status_idx
  on public.donations (campaign_id, status, created_at desc);

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

-- Trigger de updated_at para campanhas
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

-- 4. VIEWS PÚBLICAS E PRIVADAS
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
  c.pix_key,
  c.pix_receiver_name,
  c.city,
  c.pix_url,
  c.pix_copy_paste,
  c.status,
  c.created_at,
  c.updated_at,
  coalesce(sum(d.amount_cents) filter (where d.status = 'confirmed'), 0)::bigint as total_cents,
  count(d.id) filter (where d.status = 'confirmed')::integer as donation_count,
  count(d.id) filter (where d.status = 'pending')::integer as pending_count
from public.campaigns c
left join public.donations d on d.campaign_id = c.id
group by c.id;

revoke all on public.campaign_summaries from anon;
grant select on public.campaign_summaries to authenticated;

drop view if exists public.public_campaign_contributions;
create view public.public_campaign_contributions as
select
  c.slug,
  d.donor_name,
  d.amount_cents,
  d.note,
  coalesce(d.confirmed_at, d.created_at) as confirmed_at
from public.donations d
join public.campaigns c on c.id = d.campaign_id
where d.status = 'confirmed' and c.status = 'active';

revoke all on public.public_campaign_contributions from anon, authenticated;
grant select on public.public_campaign_contributions to anon, authenticated;

drop view if exists public.public_campaign_totals;
create view public.public_campaign_totals as
select
  c.id,
  c.slug,
  coalesce(sum(d.amount_cents) filter (where d.status = 'confirmed'), 0)::bigint as total_cents,
  count(d.id) filter (where d.status = 'confirmed')::integer as donation_count
from public.campaigns c
left join public.donations d on d.campaign_id = c.id
where c.status = 'active'
group by c.id, c.slug;

revoke all on public.public_campaign_totals from anon, authenticated;
grant select on public.public_campaign_totals to anon, authenticated;

-- 5. FUNÇÃO RPC PARA REGISTRAR CONTRIBUIÇÃO (PÚBLICA)
create or replace function public.register_contribution(
  p_slug text,
  p_amount_cents bigint,
  p_donor_name text,
  p_note text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.campaigns%rowtype;
  new_id uuid;
  pending_recent integer;
  trimmed_donor_name text := trim(coalesce(p_donor_name, ''));
begin
  select * into target
  from public.campaigns
  where slug = p_slug and status = 'active';

  if not found then
    raise exception 'Caixinha indisponivel para contribuicoes.';
  end if;

  if p_amount_cents is null or p_amount_cents <= 0 or p_amount_cents > 100000000 then
    raise exception 'Valor de contribuicao invalido.';
  end if;

  if length(trimmed_donor_name) = 0 then
    raise exception 'Informe o nome do contribuinte.';
  end if;

  if length(trimmed_donor_name) > 80 then
    raise exception 'Nome do contribuinte muito longo.';
  end if;

  if length(coalesce(p_note, '')) > 200 then
    raise exception 'Mensagem muito longa.';
  end if;

  select count(*) into pending_recent
  from public.donations
  where campaign_id = target.id
    and status = 'pending'
    and created_at > now() - interval '10 minutes';

  if pending_recent >= 30 then
    raise exception 'Muitas contribuicoes pendentes. Tente novamente mais tarde.';
  end if;

  insert into public.donations (
    campaign_id,
    merchant_id,
    amount_cents,
    donor_name,
    note,
    status
  )
  values (
    target.id,
    target.merchant_id,
    p_amount_cents,
    trimmed_donor_name,
    nullif(trim(coalesce(p_note, '')), ''),
    'pending'
  )
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.register_contribution(text, bigint, text, text) from public;
grant execute on function public.register_contribution(text, bigint, text, text) to anon, authenticated;
