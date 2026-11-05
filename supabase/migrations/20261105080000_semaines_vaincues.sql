-- Niveau du foyer : nombre de semaines passées entièrement illuminées (toutes les cartes retournées).
-- On ne passe au bâtiment suivant que si le précédent a été vaincu.

create function public.semaines_vaincues(avant date) returns integer
language sql stable set search_path = ''
as $$
  select count(*)::integer from (
    select date_trunc('week', date_echeance)
    from public.cartes
    where foyer_id = public.mon_foyer() and date_echeance < avant
    group by 1
    having bool_and(retournee)
  ) semaines
$$;

revoke execute on function public.semaines_vaincues(date) from public, anon;
grant execute on function public.semaines_vaincues(date) to authenticated;
