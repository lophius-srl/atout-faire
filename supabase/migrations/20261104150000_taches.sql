-- Le deck : les tâches de la maison d'un foyer, à partir desquelles naîtront les cartes.

create table public.taches (
  id uuid primary key default gen_random_uuid(),
  foyer_id uuid not null default public.mon_foyer()
    references public.foyers (id) on delete cascade,
  nom text not null check (length(trim(nom)) between 1 and 60),
  categorie text not null
    check (categorie in ('cuisine', 'maison', 'enfants', 'admin', 'courses', 'logistique')),
  frequence text not null check (frequence in ('quotidienne', 'hebdomadaire')),
  -- Jours de 1 (lundi) à 7 (dimanche), uniquement pour une tâche quotidienne.
  jours smallint[] check (jours <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[]),
  penibilite smallint not null check (penibilite between 1 and 3),
  -- Tâche réservée à un parent : elle ira directement dans sa main.
  fixe_pour uuid references public.membres (user_id) on delete set null,
  cree_le timestamptz not null default now(),
  check (
    (frequence = 'quotidienne' and coalesce(cardinality(jours), 0) > 0)
    or (frequence = 'hebdomadaire' and jours is null)
  )
);

create index taches_foyer_id_idx on public.taches (foyer_id);

alter table public.taches enable row level security;

-- Vrai si l'utilisateur fait partie du foyer donné (security definer : lecture de membres sans récursion).
create function public.est_membre_de_mon_foyer(utilisateur uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.membres
    where user_id = utilisateur and foyer_id = public.mon_foyer()
  )
$$;

revoke execute on function public.est_membre_de_mon_foyer(uuid) from public, anon;
grant execute on function public.est_membre_de_mon_foyer(uuid) to authenticated;

create policy "Lire le deck de mon foyer" on public.taches
  for select to authenticated using (foyer_id = public.mon_foyer());

create policy "Ajouter au deck de mon foyer" on public.taches
  for insert to authenticated
  with check (
    foyer_id = public.mon_foyer()
    and (fixe_pour is null or public.est_membre_de_mon_foyer(fixe_pour))
  );

create policy "Modifier le deck de mon foyer" on public.taches
  for update to authenticated
  using (foyer_id = public.mon_foyer())
  with check (
    foyer_id = public.mon_foyer()
    and (fixe_pour is null or public.est_membre_de_mon_foyer(fixe_pour))
  );

create policy "Supprimer du deck de mon foyer" on public.taches
  for delete to authenticated using (foyer_id = public.mon_foyer());

grant select, insert, update, delete on public.taches to authenticated;
