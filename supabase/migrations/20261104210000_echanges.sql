-- Échanger une carte avec l'autre parent : proposer, accepter, refuser ou contre-proposer.

create table public.echanges (
  id uuid primary key default gen_random_uuid(),
  foyer_id uuid not null default public.mon_foyer()
    references public.foyers (id) on delete cascade,
  propose_par uuid not null references public.membres (user_id) on delete cascade,
  -- Carte proposée par celui qui lance l'échange.
  carte_offerte uuid not null references public.cartes (id) on delete cascade,
  -- Carte de l'autre parent : donnée en acceptant, ou proposée en contre-proposition.
  carte_contre uuid references public.cartes (id) on delete cascade,
  statut text not null default 'en_attente'
    check (statut in ('en_attente', 'contre_proposition', 'accepte', 'refuse', 'annule')),
  cree_le timestamptz not null default now(),
  mis_a_jour_le timestamptz not null default now()
);

create index echanges_foyer_idx on public.echanges (foyer_id, cree_le);

alter table public.echanges enable row level security;

create policy "Voir les échanges de mon foyer" on public.echanges
  for select to authenticated using (foyer_id = public.mon_foyer());

grant select on public.echanges to authenticated;

-- Une carte peut entrer dans un échange si elle est dans la main indiquée, encore à faire,
-- et pas déjà engagée dans un autre échange en cours.
create function public.carte_libre_pour_echange(carte uuid, detenteur_attendu uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.cartes
    where id = carte and foyer_id = public.mon_foyer()
      and detenteur = detenteur_attendu and not retournee
  )
  and not exists (
    select 1 from public.echanges
    where statut in ('en_attente', 'contre_proposition')
      and (carte_offerte = carte or carte_contre = carte)
  )
$$;

create function public.proposer_echange(carte uuid) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  nouvel_echange uuid;
begin
  if auth.uid() is null then
    raise exception 'Connexion requise';
  end if;
  if not public.carte_libre_pour_echange(carte, auth.uid()) then
    raise exception 'Cette carte ne peut pas être proposée à l''échange.';
  end if;
  insert into public.echanges (foyer_id, propose_par, carte_offerte)
    values (public.mon_foyer(), auth.uid(), carte)
    returning id into nouvel_echange;
  return nouvel_echange;
end;
$$;

-- Les deux cartes changent de main. Le déclencheur figer_gout_de_la_carte
-- donne à chaque carte le goût de son nouveau détenteur.
create function public.echanger_cartes(echange public.echanges) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  autre uuid := (select detenteur from public.cartes where id = echange.carte_contre);
begin
  update public.echanges set statut = 'accepte', mis_a_jour_le = now() where id = echange.id;
  update public.cartes
    set detenteur = case when id = echange.carte_offerte then autre else echange.propose_par end
    where id in (echange.carte_offerte, echange.carte_contre);
end;
$$;

create function public.repondre_echange(echange uuid, reponse text, ma_carte uuid default null)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  e public.echanges;
begin
  if auth.uid() is null then
    raise exception 'Connexion requise';
  end if;
  select * into e from public.echanges
    where id = echange and foyer_id = public.mon_foyer() for update;
  if not found then
    raise exception 'Échange introuvable.';
  end if;
  if e.statut not in ('en_attente', 'contre_proposition') then
    raise exception 'Cet échange est terminé.';
  end if;

  if e.statut = 'en_attente' and e.propose_par <> auth.uid() then
    if reponse = 'refuser' then
      update public.echanges set statut = 'refuse', mis_a_jour_le = now() where id = e.id;
    elsif reponse in ('accepter', 'contre_proposer') then
      if ma_carte is null or not public.carte_libre_pour_echange(ma_carte, auth.uid()) then
        raise exception 'Choisis une carte de ta main, encore à faire, à donner en échange.';
      end if;
      update public.echanges set carte_contre = ma_carte, mis_a_jour_le = now()
        where id = e.id returning * into e;
      if reponse = 'accepter' then
        perform public.echanger_cartes(e);
      else
        update public.echanges set statut = 'contre_proposition' where id = e.id;
      end if;
    else
      raise exception 'Réponse inconnue.';
    end if;
  elsif e.statut = 'contre_proposition' and e.propose_par = auth.uid() then
    if reponse = 'accepter' then
      perform public.echanger_cartes(e);
    elsif reponse = 'refuser' then
      update public.echanges set statut = 'refuse', mis_a_jour_le = now() where id = e.id;
    else
      raise exception 'Réponse inconnue.';
    end if;
  else
    raise exception 'Ce n''est pas à toi de répondre à cet échange.';
  end if;
end;
$$;

-- Une carte retournée ou qui change de main hors échange annule les échanges en cours qui la concernent.
create function public.annuler_echanges_de_la_carte() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  update public.echanges
    set statut = 'annule', mis_a_jour_le = now()
    where statut in ('en_attente', 'contre_proposition')
      and (carte_offerte = new.id or carte_contre = new.id);
  return new;
end;
$$;

create trigger annuler_echanges_de_la_carte
  after update of retournee, detenteur on public.cartes
  for each row
  when (old.retournee is distinct from new.retournee or old.detenteur is distinct from new.detenteur)
  execute function public.annuler_echanges_de_la_carte();

revoke execute on function
  public.carte_libre_pour_echange(uuid, uuid),
  public.proposer_echange(uuid),
  public.echanger_cartes(public.echanges),
  public.repondre_echange(uuid, text, uuid)
  from public, anon, authenticated;
grant execute on function
  public.proposer_echange(uuid),
  public.repondre_echange(uuid, text, uuid)
  to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.echanges;
  end if;
end;
$$;
