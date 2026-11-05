-- Galerie des souvenirs : les lundis des semaines vaincues, de la plus ancienne à la plus récente.
-- Même règle que semaines_vaincues : toutes les cartes de la semaine retournées.

create function public.semaines_vaincues_detail(avant date) returns setof date
language sql stable set search_path = ''
as $$
  select date_trunc('week', date_echeance)::date as lundi
  from public.cartes
  where foyer_id = public.mon_foyer() and date_echeance < avant
  group by 1
  having bool_and(retournee)
  order by 1
$$;

revoke execute on function public.semaines_vaincues_detail(date) from public, anon;
grant execute on function public.semaines_vaincues_detail(date) to authenticated;
