-- Dire merci à l'autre parent pour une carte qu'il a retournée.

create table public.mercis (
  id uuid primary key default gen_random_uuid(),
  foyer_id uuid not null default public.mon_foyer()
    references public.foyers (id) on delete cascade,
  carte_id uuid not null references public.cartes (id) on delete cascade,
  de uuid not null references public.membres (user_id) on delete cascade,
  pour uuid not null references public.membres (user_id) on delete cascade,
  vu boolean not null default false,
  cree_le timestamptz not null default now(),
  -- Un seul merci par carte.
  unique (carte_id, de)
);

create index mercis_pour_idx on public.mercis (pour, vu);

alter table public.mercis enable row level security;

-- Chacun voit les mercis qu'il a envoyés et ceux qu'il a reçus.
create policy "Voir mes mercis" on public.mercis
  for select to authenticated
  using (foyer_id = public.mon_foyer() and (de = auth.uid() or pour = auth.uid()));

grant select on public.mercis to authenticated;

-- Merci pour une carte retournée par l'autre parent du foyer. Sans effet si déjà dit.
create function public.dire_merci(carte uuid) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  destinataire uuid;
begin
  if auth.uid() is null then
    raise exception 'Connexion requise';
  end if;
  select detenteur into destinataire from public.cartes
    where id = carte and foyer_id = public.mon_foyer() and retournee
      and detenteur is not null and detenteur <> auth.uid();
  if destinataire is null then
    raise exception 'On ne peut dire merci que pour une carte retournée par l''autre.';
  end if;
  insert into public.mercis (foyer_id, carte_id, de, pour)
    values (public.mon_foyer(), carte, auth.uid(), destinataire)
    on conflict (carte_id, de) do nothing;
end;
$$;

-- Marque comme vus les mercis que j'ai reçus.
create function public.marquer_mercis_vus() returns void
language sql security definer set search_path = ''
as $$
  update public.mercis set vu = true where pour = auth.uid() and not vu
$$;

revoke execute on function public.dire_merci(uuid), public.marquer_mercis_vus() from public, anon;
grant execute on function public.dire_merci(uuid), public.marquer_mercis_vus() to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.mercis;
  end if;
end;
$$;
