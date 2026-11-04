-- Foyers de deux personnes et leurs membres.
-- Lecture : chacun ne voit que son foyer. Écriture : uniquement via les fonctions ci-dessous.

create table public.foyers (
  id uuid primary key default gen_random_uuid(),
  code_invitation text not null unique
    default upper(substr(md5(gen_random_uuid()::text), 1, 6)),
  cree_le timestamptz not null default now()
);

create table public.membres (
  user_id uuid primary key references auth.users (id) on delete cascade,
  foyer_id uuid not null references public.foyers (id) on delete cascade,
  rejoint_le timestamptz not null default now()
);

create index membres_foyer_id_idx on public.membres (foyer_id);

alter table public.foyers enable row level security;
alter table public.membres enable row level security;

-- Foyer de l'utilisateur connecté (security definer : évite la récursion des règles sur membres).
create function public.mon_foyer() returns uuid
language sql stable security definer set search_path = ''
as $$
  select foyer_id from public.membres where user_id = auth.uid()
$$;

create policy "Voir mon foyer" on public.foyers
  for select to authenticated using (id = public.mon_foyer());

create policy "Voir les membres de mon foyer" on public.membres
  for select to authenticated using (foyer_id = public.mon_foyer());

grant select on public.foyers, public.membres to authenticated;

create function public.creer_foyer() returns public.foyers
language plpgsql security definer set search_path = ''
as $$
declare
  foyer public.foyers;
begin
  if auth.uid() is null then
    raise exception 'Connexion requise';
  end if;
  if exists (select 1 from public.membres where user_id = auth.uid()) then
    raise exception 'Tu fais déjà partie d''un foyer';
  end if;
  insert into public.foyers default values returning * into foyer;
  insert into public.membres (user_id, foyer_id) values (auth.uid(), foyer.id);
  return foyer;
end;
$$;

create function public.rejoindre_foyer(code text) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  foyer_cible uuid;
begin
  if auth.uid() is null then
    raise exception 'Connexion requise';
  end if;
  -- Verrouille le foyer : deux personnes qui rejoignent en même temps passent l'une après l'autre.
  select id into foyer_cible from public.foyers
    where code_invitation = upper(trim(code)) for update;
  if foyer_cible is null then
    raise exception 'Code d''invitation inconnu';
  end if;
  if exists (select 1 from public.membres where user_id = auth.uid()) then
    raise exception 'Tu fais déjà partie d''un foyer';
  end if;
  if (select count(*) from public.membres where foyer_id = foyer_cible) >= 2 then
    raise exception 'Ce foyer est déjà complet';
  end if;
  insert into public.membres (user_id, foyer_id) values (auth.uid(), foyer_cible);
  return foyer_cible;
end;
$$;

revoke execute on function public.mon_foyer(), public.creer_foyer(), public.rejoindre_foyer(text)
  from public, anon;
grant execute on function public.mon_foyer(), public.creer_foyer(), public.rejoindre_foyer(text)
  to authenticated;
