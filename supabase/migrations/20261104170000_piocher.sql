-- Piocher une carte du Marché, et diffuser les changements de cartes en temps réel.

create function public.piocher_carte(carte uuid) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Connexion requise';
  end if;
  -- La condition « detenteur is null » rend la pioche atomique : si deux parents
  -- piochent la même carte en même temps, une seule mise à jour aboutit.
  update public.cartes
    set detenteur = auth.uid()
    where id = carte
      and foyer_id = public.mon_foyer()
      and detenteur is null
      and not retournee;
  if not found then
    raise exception 'Cette carte a déjà été prise.';
  end if;
end;
$$;

revoke execute on function public.piocher_carte(uuid) from public, anon;
grant execute on function public.piocher_carte(uuid) to authenticated;

-- Temps réel : Supabase diffuse les changements des tables de cette publication,
-- en respectant les règles RLS. (La publication n'existe pas sur un Postgres local de test.)
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.cartes;
  end if;
end;
$$;
