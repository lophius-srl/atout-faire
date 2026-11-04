-- Remettre au Marché une carte de sa main qu'on ne peut finalement pas faire.

create function public.remettre_au_marche(carte uuid) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Connexion requise';
  end if;
  -- Le déclencheur figer_gout_de_la_carte remet le goût à neutre : la carte ne compte plus pour personne.
  update public.cartes
    set detenteur = null
    where id = carte
      and foyer_id = public.mon_foyer()
      and detenteur = auth.uid()
      and not retournee;
  if not found then
    raise exception 'Seules les cartes de ta main encore à faire peuvent repartir sur le Marché.';
  end if;
end;
$$;

revoke execute on function public.remettre_au_marche(uuid) from public, anon;
grant execute on function public.remettre_au_marche(uuid) to authenticated;
