-- Caixinha Virtual: corrige provisionamento de perfil e isolamento do painel.
-- Execute este arquivo no SQL Editor do Supabase depois de 0003_require_donor_name.sql.

-- 1. Permitir que o proprio usuario crie seu perfil (fallback do app quando o
--    trigger handle_new_user nao criou a linha).
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- 2. O painel lista somente as caixinhas do proprio comerciante. A view usa
--    security_invoker, entao a policy publica de campanhas ativas fazia o
--    dashboard enxergar campanhas de outros comerciantes.
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
where c.merchant_id = auth.uid()
group by c.id;

revoke all on public.campaign_summaries from anon;
grant select on public.campaign_summaries to authenticated;
