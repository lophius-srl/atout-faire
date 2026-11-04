-- Tests des échanges. A et B partagent un foyer, C a le sien.
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

create function pg_temp.verifier(condition boolean, message text) returns void language plpgsql as $$
begin
  if not condition then raise exception '%', message; end if;
end;
$$;

create function pg_temp.detenteur(carte text) returns uuid language sql as $$
  select detenteur from public.cartes where id = carte::uuid
$$;

create function pg_temp.statut(echange uuid) returns text language sql as $$
  select statut from public.echanges where id = echange
$$;

-- Foyer A + B. A détient les cartes a1 et a2, B détient b1 et b2 (tâche que B n'aime pas : b1).
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
create temp table foyer_a as select * from public.creer_foyer();
grant select on foyer_a to authenticated;
create temp table ids (nom text primary key, id uuid);
grant all on ids to authenticated;
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
select public.rejoindre_foyer((select code_invitation from foyer_a));
insert into public.taches (id, nom, categorie, frequence, penibilite) values
  ('00000000-0000-0000-0000-0000000000f1', 'Linge', 'maison', 'hebdomadaire', 2);
insert into public.gouts values
  ('00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-0000000000f1', 'naime_pas');
insert into public.cartes (id, tache_id, nom, categorie, penibilite, echeance, date_echeance, detenteur) values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000f1', 'Linge', 'maison', 2, 'semaine', '2026-11-02', '00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000f1', 'Linge', 'maison', 2, 'semaine', '2026-11-09', '00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000f1', 'Linge', 'maison', 2, 'semaine', '2026-11-16', '00000000-0000-0000-0000-00000000000b'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000f1', 'Linge', 'maison', 2, 'semaine', '2026-11-23', '00000000-0000-0000-0000-00000000000b');
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000c');
select public.creer_foyer();

-- 1. A propose a1, B accepte en donnant b1 : les cartes changent de main, avec le goût du nouveau détenteur.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
insert into ids select 'e1', public.proposer_echange('00000000-0000-0000-0000-0000000000a1');
select pg_temp.doit_echouer(
  $q$select public.proposer_echange('00000000-0000-0000-0000-0000000000a1')$q$, 'ne peut pas être proposée');
select pg_temp.doit_echouer(
  $q$select public.proposer_echange('00000000-0000-0000-0000-0000000000b1')$q$, 'ne peut pas être proposée');
select pg_temp.doit_echouer(
  format('select public.repondre_echange(%L, %L, %L)', (select id from ids where nom = 'e1'), 'accepter',
    '00000000-0000-0000-0000-0000000000a2'), 'pas à toi');

select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000c');
do $$ begin perform pg_temp.verifier((select count(*) from public.echanges) = 0, 'C voit un échange d''un autre foyer'); end $$;

select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
select pg_temp.doit_echouer(
  format('select public.repondre_echange(%L, %L, %L)', (select id from ids where nom = 'e1'), 'accepter',
    '00000000-0000-0000-0000-0000000000a2'), 'Choisis une carte de ta main');
select public.repondre_echange((select id from ids where nom = 'e1'), 'accepter', '00000000-0000-0000-0000-0000000000b1');
do $$ begin
  perform pg_temp.verifier(pg_temp.statut((select id from ids where nom = 'e1')) = 'accepte', 'e1 devrait être accepté');
  perform pg_temp.verifier(pg_temp.detenteur('00000000-0000-0000-0000-0000000000a1') = '00000000-0000-0000-0000-00000000000b', 'a1 devrait être chez B');
  perform pg_temp.verifier(pg_temp.detenteur('00000000-0000-0000-0000-0000000000b1') = '00000000-0000-0000-0000-00000000000a', 'b1 devrait être chez A');
  perform pg_temp.verifier((select gout from public.cartes where id = '00000000-0000-0000-0000-0000000000a1') = 'naime_pas', 'a1 prend le goût de B');
  perform pg_temp.verifier((select gout from public.cartes where id = '00000000-0000-0000-0000-0000000000b1') = 'neutre', 'b1 prend le goût de A');
end $$;
select pg_temp.doit_echouer(
  format('select public.repondre_echange(%L, %L)', (select id from ids where nom = 'e1'), 'refuser'), 'terminé');

-- 2. A propose a2, B refuse : rien ne bouge.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
insert into ids select 'e2', public.proposer_echange('00000000-0000-0000-0000-0000000000a2');
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
select public.repondre_echange((select id from ids where nom = 'e2'), 'refuser');
do $$ begin
  perform pg_temp.verifier(pg_temp.statut((select id from ids where nom = 'e2')) = 'refuse', 'e2 devrait être refusé');
  perform pg_temp.verifier(pg_temp.detenteur('00000000-0000-0000-0000-0000000000a2') = '00000000-0000-0000-0000-00000000000a', 'a2 reste chez A');
end $$;

-- 3. A repropose a2, B contre-propose b2, B ne peut pas répondre à sa propre contre-proposition, A accepte.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
insert into ids select 'e3', public.proposer_echange('00000000-0000-0000-0000-0000000000a2');
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
select public.repondre_echange((select id from ids where nom = 'e3'), 'contre_proposer', '00000000-0000-0000-0000-0000000000b2');
select pg_temp.doit_echouer(
  format('select public.repondre_echange(%L, %L)', (select id from ids where nom = 'e3'), 'accepter'), 'pas à toi');
do $$ begin
  perform pg_temp.verifier(pg_temp.statut((select id from ids where nom = 'e3')) = 'contre_proposition', 'e3 en contre-proposition');
  perform pg_temp.verifier(pg_temp.detenteur('00000000-0000-0000-0000-0000000000b2') = '00000000-0000-0000-0000-00000000000b', 'b2 reste chez B tant que A n''a pas accepté');
end $$;
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
select public.repondre_echange((select id from ids where nom = 'e3'), 'accepter');
do $$ begin
  perform pg_temp.verifier(pg_temp.detenteur('00000000-0000-0000-0000-0000000000a2') = '00000000-0000-0000-0000-00000000000b', 'a2 devrait être chez B');
  perform pg_temp.verifier(pg_temp.detenteur('00000000-0000-0000-0000-0000000000b2') = '00000000-0000-0000-0000-00000000000a', 'b2 devrait être chez A');
end $$;

-- 4. Un échange en cours est annulé si sa carte est retournée.
insert into ids select 'e4', public.proposer_echange('00000000-0000-0000-0000-0000000000b2');
select public.retourner_carte('00000000-0000-0000-0000-0000000000b2');
do $$ begin
  perform pg_temp.verifier(pg_temp.statut((select id from ids where nom = 'e4')) = 'annule', 'e4 devrait être annulé');
end $$;

-- 5. … ou remise au Marché.
insert into ids select 'e5', public.proposer_echange('00000000-0000-0000-0000-0000000000b1');
select public.remettre_au_marche('00000000-0000-0000-0000-0000000000b1');
do $$ begin
  perform pg_temp.verifier(pg_temp.statut((select id from ids where nom = 'e5')) = 'annule', 'e5 devrait être annulé');
end $$;

-- Personne n'écrit directement dans les échanges, et un visiteur non connecté n'a aucun accès.
select pg_temp.doit_echouer('delete from public.echanges', 'permission denied');
reset role;
select set_config('role', 'anon', false);
select pg_temp.doit_echouer('select * from public.echanges', 'permission denied');
reset role;
