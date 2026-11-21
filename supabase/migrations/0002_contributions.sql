-- Caixinha Virtual: contribuicoes via PIX com confirmacao do comerciante.
-- Execute este arquivo no SQL Editor do Supabase depois de 0001_init.sql.

alter table public.campaigns
  add column if not exists pix_key text not null default '';

alter table public.campaigns
  add column if not exists pix_receiver_name text not null default '';

alter table public.campaigns
  add column if not exists city text not null default '';

alter table public.donations
  add column if not exists status text not null default 'pending'
  check (status in ('pending', 'confirmed', 'rejected'));

alter table public.donations
  add column if not exists confirmed_at timestamptz;

create index if not exists donations_campaign_status_idx
  on public.donations (campaign_id, status, created_at desc);

alter table public.campaigns drop constraint if exists campaigns_active_requires_pix;
alter table public.campaigns add constraint campaigns_active_requires_pix check (
  status <> 'active'
  or (
    length(trim(bank_name)) > 0
    and length(trim(pix_key)) > 0
    and length(trim(city)) > 0
  )
);

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

  if length(coalesce(p_donor_name, '')) > 80 then
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
    nullif(trim(coalesce(p_donor_name, '')), ''),
    nullif(trim(coalesce(p_note, '')), ''),
    'pending'
  )
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.register_contribution(text, bigint, text, text) from public;
grant execute on function public.register_contribution(text, bigint, text, text) to anon, authenticated;
