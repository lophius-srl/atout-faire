-- Mode vacances : des périodes pour tout le foyer (rien d'individuel), une seule en cours ou à venir à la fois.
-- Pendant une période, le deck ne distribue rien ; une semaine entièrement en vacances n'a aucune carte,
-- elle ne compte donc ni comme vaincue ni comme ratée.
-- Les périodes passées sont gardées et jamais modifiées : les jours déjà vécus en vacances restent couverts,
-- leurs cartes ne réapparaissent pas.
-- Compatible avec le code déjà en ligne : on ajoute une table et deux fonctions.

create table public.vacances (
  id uuid primary key default gen_random_uuid(),
  foyer_id uuid not null references public.foyers (id) on delete cascade,
  debut date not null,
  fin date not null check (fin >= debut)
);

create index vacances_foyer_fin_idx on public.vacances (foyer_id, fin);

alter table public.vacances enable row level security;

create policy "Voir les vacances de mon foyer" on public.vacances
  for select to authenticated using (foyer_id = public.mon_foyer());

-- Écriture uniquement par les fonctions ci-dessous.
grant select on public.vacances to authenticated;

-- Enregistre la période en cours ou à venir (ou la modifie), et retire les cartes encore à faire
-- qu'elle couvre à partir d'aujourd'hui. Les cartes déjà retournées restent : le travail fait compte toujours.
create function public.planifier_vacances(debut date, fin date) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  foyer uuid := public.mon_foyer();
  aujourdhui date;
  lundi date;
  actuelle public.vacances;
begin
  if foyer is null then
    raise exception 'Connexion requise';
  end if;
  if debut is null or fin is null then
    raise exception 'Choisis les dates de départ et de retour.';
  end if;
  if fin < debut then
    raise exception 'Le retour doit être après le départ.';
  end if;
  select (now() at time zone f.fuseau)::date into aujourdhui from public.foyers f where f.id = foyer;
  lundi := aujourdhui - (extract(isodow from aujourdhui)::int - 1);
  if fin < aujourdhui then
    raise exception 'Le retour ne peut pas être dans le passé.';
  end if;

  select * into actuelle from public.vacances v
    where v.foyer_id = foyer and v.fin >= aujourdhui
    for update;
  -- Seule une période déjà commencée garde son départ dans le passé (pour la raccourcir ou la prolonger).
  if debut < aujourdhui and (actuelle.id is null or debut <> actuelle.debut) then
    raise exception 'Le départ ne peut pas être dans le passé.';
  end if;

  if actuelle.id is null then
    insert into public.vacances (foyer_id, debut, fin) values (foyer, debut, fin);
  else
    update public.vacances set debut = planifier_vacances.debut, fin = planifier_vacances.fin
      where id = actuelle.id;
  end if;

  delete from public.cartes c
  where c.foyer_id = foyer
    and not c.retournee
    and (
      (c.echeance = 'jour' and c.date_echeance >= aujourdhui and c.date_echeance between debut and fin)
      or (c.echeance = 'semaine' and c.date_echeance >= lundi
          and c.date_echeance >= debut and c.date_echeance + 6 <= fin)
    );
end;
$$;

-- Annule la période à venir. Une période en cours s'arrête la veille : les jours déjà passés
-- en vacances restent couverts.
create function public.annuler_vacances() returns void
language plpgsql security definer set search_path = ''
as $$
declare
  foyer uuid := public.mon_foyer();
  aujourdhui date;
begin
  if foyer is null then
    raise exception 'Connexion requise';
  end if;
  select (now() at time zone f.fuseau)::date into aujourdhui from public.foyers f where f.id = foyer;
  delete from public.vacances v
    where v.foyer_id = foyer and v.fin >= aujourdhui and v.debut >= aujourdhui;
  update public.vacances v set fin = aujourdhui - 1
    where v.foyer_id = foyer and v.fin >= aujourdhui and v.debut < aujourdhui;
end;
$$;

revoke execute on function public.planifier_vacances(date, date) from public, anon;
revoke execute on function public.annuler_vacances() from public, anon;
grant execute on function public.planifier_vacances(date, date) to authenticated;
grant execute on function public.annuler_vacances() to authenticated;

-- Temps réel : l'autre parent voit la période dès qu'elle change.
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.vacances;
  end if;
end $$;
