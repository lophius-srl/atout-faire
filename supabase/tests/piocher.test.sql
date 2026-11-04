-- Tests de la pioche. A et B partagent un foyer, C a le sien.
insert into auth.users values
  ('00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-00000000000b'),
  ('00000000-0000-0000-0000-00000000000c');

create function pg_temp.en_tant_que(utilisateur text) returns void language sql as $$
  select set_config('request.jwt.claim.sub', utilisateur, false), set_config('role', 'authenticated', false)
$$;

create function pg_temp.doit_echouer(requete text, message_attendu text) returns void
language plpgsql as $$
begin
  execute requete;
  raise exception 'Aurait dû échouer : %', requete;
exception when others then
  if sqlerrm not like '%' || message_attendu || '%' then
    raise exception 'Mauvaise erreur pour % : %', requete, sqlerrm;
  end if;
end;
$$;

select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
create temp table foyer_a as select * from public.creer_foyer();
grant select on foyer_a to authenticated;
insert into public.taches (id, nom, categorie, frequence, penibilite)
  values ('00000000-0000-0000-0000-0000000000f1', 'Aspirateur', 'maison', 'hebdomadaire', 2);
insert into public.cartes (id, tache_id, nom, categorie, penibilite, echeance, date_echeance) values
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000f1', 'Aspirateur', 'maison', 2, 'semaine', '2026-11-02'),
  ('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-0000000000f1', 'Aspirateur', 'maison', 2, 'semaine', '2026-11-09');
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
select public.rejoindre_foyer((select code_invitation from foyer_a));
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000c');
select public.creer_foyer();

-- C ne peut pas piocher dans le Marché d'un autre foyer.
select pg_temp.doit_echouer(
  $q$select public.piocher_carte('00000000-0000-0000-0000-0000000000c1')$q$, 'déjà été prise');

-- B pioche : la carte passe dans sa main.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
select public.piocher_carte('00000000-0000-0000-0000-0000000000c1');
do $$ begin
  if (select detenteur from public.cartes where id = '00000000-0000-0000-0000-0000000000c1')
     <> '00000000-0000-0000-0000-00000000000b' then
    raise exception 'La carte devrait être dans la main de B';
  end if;
end $$;

-- A arrive trop tard : la carte reste à B.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
select pg_temp.doit_echouer(
  $q$select public.piocher_carte('00000000-0000-0000-0000-0000000000c1')$q$, 'déjà été prise');
do $$ begin
  if (select detenteur from public.cartes where id = '00000000-0000-0000-0000-0000000000c1')
     <> '00000000-0000-0000-0000-00000000000b' then
    raise exception 'La carte n''aurait pas dû changer de main';
  end if;
end $$;

-- Une carte déjà retournée ne se pioche pas.
reset role;
update public.cartes set retournee = true where id = '00000000-0000-0000-0000-0000000000c2';
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
select pg_temp.doit_echouer(
  $q$select public.piocher_carte('00000000-0000-0000-0000-0000000000c2')$q$, 'déjà été prise');
reset role;
update public.cartes set retournee = false where id = '00000000-0000-0000-0000-0000000000c2';

-- Un visiteur non connecté ne peut pas piocher.
reset role;
select set_config('role', 'anon', false);
select pg_temp.doit_echouer(
  $q$select public.piocher_carte('00000000-0000-0000-0000-0000000000c2')$q$, 'permission denied');
reset role;
