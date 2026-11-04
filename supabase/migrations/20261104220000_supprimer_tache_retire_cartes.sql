-- Supprimer une tâche du deck retire ses cartes encore à faire, du Marché comme des mains.
-- Les cartes déjà retournées restent : le travail fait compte toujours dans la balance de la semaine.
-- Les échanges en cours sur ces cartes disparaissent avec elles (clé étrangère en cascade).

create function public.retirer_cartes_a_faire_de_la_tache() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  delete from public.cartes where tache_id = old.id and not retournee;
  return old;
end;
$$;

create trigger retirer_cartes_a_faire_de_la_tache
  before delete on public.taches
  for each row execute function public.retirer_cartes_a_faire_de_la_tache();
