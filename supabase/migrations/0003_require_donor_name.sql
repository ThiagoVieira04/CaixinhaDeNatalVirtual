-- Caixinha Virtual: contribuicao publica exige o nome do contribuinte.
-- Execute este arquivo no SQL Editor do Supabase depois de 0002_contributions.sql.

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
