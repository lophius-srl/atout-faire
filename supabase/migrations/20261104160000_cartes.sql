-- Les cartes : chaque tâche du deck donne une carte par jour prévu, ou une par semaine.

alter table public.foyers add column fuseau text not null default 'Europe/Paris';

create table public.cartes (
  id uuid primary key default gen_random_uuid(),
  foyer_id uuid not null default public.mon_foyer()
    references public.foyers (id) on delete cascade,
  tache_id uuid references public.taches (id) on delete set null,
  -- Copie de la tâche au moment de la distribution : modifier le deck ne change pas les cartes distribuées.
  nom text not null,
  categorie text not null,
  penibilite smallint not null check (penibilite between 1 and 3),
  echeance text not null check (echeance in ('jour', 'semaine')),
  -- Le jour concerné, ou le lundi de la semaine pour une carte hebdomadaire.
  date_echeance date not null,
  -- null : la carte est sur le Marché. Sinon : dans la main de ce parent.
  detenteur uuid references public.membres (user_id) on delete set null,
  retournee boolean not null default false,
  arrivee_le timestamptz not null default now(),
  -- Une seule carte par tâche et par échéance, même si deux téléphones distribuent en même temps.
  unique (tache_id, echeance, date_echeance)
);

create index cartes_foyer_echeance_idx on public.cartes (foyer_id, date_echeance);

alter table public.cartes enable row level security;

create policy "Voir les cartes de mon foyer" on public.cartes
  for select to authenticated using (foyer_id = public.mon_foyer());

create policy "Distribuer les cartes de mon deck" on public.cartes
  for insert to authenticated
  with check (
    foyer_id = public.mon_foyer()
    and exists (
      select 1 from public.taches
      where taches.id = tache_id and taches.foyer_id = public.mon_foyer()
    )
    and (detenteur is null or public.est_membre_de_mon_foyer(detenteur))
  );

grant select, insert on public.cartes to authenticated;
