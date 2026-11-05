-- Tests du mode vacances. A et B partagent un foyer, C a le sien.
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

-- Dates relatives au jour du test : un lundi dans trois semaines, et la semaine qui suit.
create temp table jours as
  select (date_trunc('week', current_date) + interval '21 days')::date as lundi;
grant select on jours to authenticated;

select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
create temp table foyer_a as select * from public.creer_foyer();
grant select on foyer_a to authenticated;
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
select public.rejoindre_foyer((select code_invitation from foyer_a));
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000c');
select public.creer_foyer();

-- Cartes de A et B : deux du jour dans la période (une faite), une hors période, une de la semaine.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
insert into public.taches (id, nom, categorie, frequence, jours, penibilite) values
  ('00000000-0000-0000-0000-0000000000f1', 'Vaisselle', 'cuisine', 'quotidienne', '{1,2,3,4,5,6,7}', 2);
insert into public.taches (id, nom, categorie, frequence, penibilite) values
  ('00000000-0000-0000-0000-0000000000f2', 'Linge', 'maison', 'hebdomadaire', 1);
insert into public.cartes (id, tache_id, nom, categorie, penibilite, echeance, date_echeance)
  select '00000000-0000-0000-0000-0000000000c1'::uuid, '00000000-0000-0000-0000-0000000000f1'::uuid, 'Vaisselle', 'cuisine', 2, 'jour', lundi from jours
  union all
  select '00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-0000000000f1', 'Vaisselle', 'cuisine', 2, 'jour', lundi + 1 from jours
  union all
  select '00000000-0000-0000-0000-0000000000c3', '00000000-0000-0000-0000-0000000000f1', 'Vaisselle', 'cuisine', 2, 'jour', lundi + 7 from jours
  union all
  select '00000000-0000-0000-0000-0000000000c4', '00000000-0000-0000-0000-0000000000f2', 'Linge', 'maison', 1, 'semaine', lundi from jours;
reset role;
update public.cartes set retournee = true where id = '00000000-0000-0000-0000-0000000000c2';
-- Fuseau UTC : le « jour du foyer » est alors current_date, à toute heure du test.
update public.foyers set fuseau = 'UTC';

-- Les dates sont vérifiées.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
select pg_temp.doit_echouer(
  $q$select public.planifier_vacances(current_date + 10, current_date + 5)$q$, 'après le départ');
select pg_temp.doit_echouer(
  $q$select public.planifier_vacances(current_date - 3, current_date + 5)$q$, 'dans le passé');
select pg_temp.doit_echouer(
  $q$select public.planifier_vacances(null, current_date + 5)$q$, 'dates de départ');

-- A planifie une semaine entière : B la voit, les cartes à faire de la période partent, le reste reste.
select public.planifier_vacances((select lundi from jours), (select lundi + 6 from jours));
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
do $$ begin
  if (select fin - debut from public.vacances) <> 6 then
    raise exception 'B devrait voir la période de vacances';
  end if;
  if exists (select 1 from public.cartes where id in (
    '00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000c4')) then
    raise exception 'Les cartes à faire de la période devraient être retirées';
  end if;
  if (select count(*) from public.cartes where id in (
    '00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-0000000000c3')) <> 2 then
    raise exception 'La carte faite et celle hors période devraient rester';
  end if;
end $$;

-- Replanifier modifie la période à venir : il n'y en a jamais deux.
select public.planifier_vacances((select lundi + 1 from jours), (select lundi + 3 from jours));
do $$ begin
  if (select count(*) from public.vacances) <> 1 then
    raise exception 'Une seule période à venir à la fois';
  end if;
end $$;

-- C ne voit rien et ne touche pas aux vacances de A et B.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000c');
select public.annuler_vacances();
do $$ begin
  if exists (select 1 from public.vacances) then raise exception 'C voit les vacances d''un autre foyer'; end if;
end $$;
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
do $$ begin
  if not exists (select 1 from public.vacances) then
    raise exception 'C a annulé les vacances d''un autre foyer';
  end if;
end $$;

-- B annule une période à venir : elle disparaît pour tous les deux.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
select public.annuler_vacances();
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
do $$ begin
  if exists (select 1 from public.vacances) then raise exception 'Les vacances devraient être annulées'; end if;
end $$;

-- Une période en cours : on peut la raccourcir en gardant son départ ; rentrer plus tôt l'arrête hier.
reset role;
insert into public.vacances (foyer_id, debut, fin)
  values ((select id from foyer_a), current_date - 3, current_date + 4);
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
select public.planifier_vacances(current_date - 3, current_date + 1);
select public.annuler_vacances();
do $$ begin
  if (select (debut, fin) from public.vacances) is distinct from (current_date - 3, current_date - 1) then
    raise exception 'Les vacances en cours devraient s''arrêter hier';
  end if;
end $$;

-- Une période passée n'est jamais modifiée : une nouvelle période s'ajoute à côté,
-- et l'ancien départ ne permet plus de réécrire le passé.
select pg_temp.doit_echouer(
  $q$select public.planifier_vacances(current_date - 3, current_date + 10)$q$, 'dans le passé');
select public.planifier_vacances(current_date + 20, current_date + 25);
do $$ begin
  if (select count(*) from public.vacances) <> 2 then
    raise exception 'La période passée devrait rester à côté de la nouvelle';
  end if;
  if not exists (select 1 from public.vacances where debut = current_date - 3 and fin = current_date - 1) then
    raise exception 'La période passée a été modifiée';
  end if;
end $$;

-- Personne n'écrit les vacances sans passer par les fonctions, et un visiteur n'a aucun accès.
select pg_temp.doit_echouer(
  $q$insert into public.vacances (foyer_id, debut, fin) values ((select id from foyer_a), current_date, current_date)$q$,
  'permission denied');
reset role;
select set_config('role', 'anon', false);
select pg_temp.doit_echouer($q$select public.annuler_vacances()$q$, 'permission denied');
reset role;
