-- Tests des cartes. A et B partagent un foyer, C a le sien.
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
insert into public.taches (id, nom, categorie, frequence, jours, penibilite)
  values ('00000000-0000-0000-0000-0000000000f1', 'Vaisselle', 'cuisine', 'quotidienne', '{2}', 2);
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
select public.rejoindre_foyer((select code_invitation from foyer_a));
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000c');
select public.creer_foyer();

-- B distribue la carte du mardi ; une deuxième distribution ne crée pas de doublon.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
insert into public.cartes (tache_id, nom, categorie, penibilite, echeance, date_echeance)
  values ('00000000-0000-0000-0000-0000000000f1', 'Vaisselle', 'cuisine', 2, 'jour', '2026-11-03');
insert into public.cartes (tache_id, nom, categorie, penibilite, echeance, date_echeance)
  values ('00000000-0000-0000-0000-0000000000f1', 'Vaisselle', 'cuisine', 2, 'jour', '2026-11-03')
  on conflict do nothing;
-- Le mardi suivant est une autre carte.
insert into public.cartes (tache_id, nom, categorie, penibilite, echeance, date_echeance)
  values ('00000000-0000-0000-0000-0000000000f1', 'Vaisselle', 'cuisine', 2, 'jour', '2026-11-10');

select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
do $$ begin
  if (select count(*) from public.cartes) <> 2 then raise exception 'A devrait voir 2 cartes'; end if;
  if (select fuseau from public.foyers) <> 'Europe/Paris' then raise exception 'Fuseau par défaut attendu'; end if;
end $$;

-- C ne voit rien et ne peut pas distribuer les tâches d'un autre foyer.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000c');
do $$ begin
  if (select count(*) from public.cartes) <> 0 then raise exception 'C voit les cartes d''un autre foyer'; end if;
end $$;
select pg_temp.doit_echouer(
  $q$insert into public.cartes (tache_id, nom, categorie, penibilite, echeance, date_echeance)
     values ('00000000-0000-0000-0000-0000000000f1', 'Vaisselle', 'cuisine', 2, 'jour', '2026-11-17')$q$,
  'row-level security');

-- Personne ne modifie ni ne supprime une carte directement (les actions viendront avec leurs propres règles).
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
select pg_temp.doit_echouer('update public.cartes set retournee = true', 'permission denied');
select pg_temp.doit_echouer('delete from public.cartes', 'permission denied');
reset role;
