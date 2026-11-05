-- Galerie des souvenirs : la date où une récompense a été vécue.
-- Les récompenses vécues avant cette migration n'ont pas de date (null) et s'affichent sans.
-- Compatible avec le code déjà en ligne : on ajoute une colonne, la fonction garde sa signature.

alter table public.recompenses add column profitee_le timestamptz;

create or replace function public.profiter_recompense(recompense uuid) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  -- Un second appel (double toucher) garde la première date.
  update public.recompenses set profitee = true, profitee_le = coalesce(profitee_le, now())
    where id = recompense and foyer_id = public.mon_foyer() and acceptee
      and niveau <= public.semaines_vaincues(current_date + 1);
  if not found then
    raise exception 'Cette récompense n''est pas encore débloquée.';
  end if;
end;
$$;
