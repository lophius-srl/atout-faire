-- Retourner une carte de sa main quand la tâche est faite, ou annuler.

create function public.retourner_carte(carte uuid, faite boolean default true) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Connexion requise';
  end if;
  update public.cartes
    set retournee = faite
    where id = carte
      and foyer_id = public.mon_foyer()
      and detenteur = auth.uid();
  if not found then
    raise exception 'Tu ne peux retourner que les cartes de ta main.';
  end if;
end;
$$;

revoke execute on function public.retourner_carte(uuid, boolean) from public, anon;
grant execute on function public.retourner_carte(uuid, boolean) to authenticated;
