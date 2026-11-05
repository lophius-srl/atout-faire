-- Tests des récompenses. A et B partagent un foyer, C a le sien.
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

select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
create temp table foyer_a as select * from public.creer_foyer();
grant select on foyer_a to authenticated;
create temp table ids (nom text primary key, id uuid);
grant all on ids to authenticated;
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
select public.rejoindre_foyer((select code_invitation from foyer_a));

-- A propose un resto pour le boss 1 (la tente), et un ciné pour le boss 5.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
insert into ids select 'resto', public.proposer_recompense(1, '  Resto japonais  ');
insert into ids select 'cine', public.proposer_recompense(5, 'Ciné');
select pg_temp.doit_echouer($q$select public.proposer_recompense(1, 'Autre chose')$q$, 'déjà sa récompense');
select pg_temp.doit_echouer($q$select public.proposer_recompense(2, '   ')$q$, 'check constraint');
select pg_temp.doit_echouer($q$select public.proposer_recompense(0, 'Rien')$q$, 'check constraint');

-- A ne peut pas accepter sa propre proposition ; B le peut.
select pg_temp.doit_echouer(
  format('select public.accepter_recompense(%L)', (select id from ids where nom = 'resto')), 'autre parent');
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
select public.accepter_recompense((select id from ids where nom = 'resto'));
do $$ begin
  perform pg_temp.verifier(
    (select acceptee and description = 'Resto japonais' from public.recompenses where niveau = 1),
    'Le resto devrait être accepté, texte nettoyé');
end $$;

-- Pas encore débloquée : aucune semaine vaincue.
select pg_temp.doit_echouer(
  format('select public.profiter_recompense(%L)', (select id from ids where nom = 'resto')), 'pas encore débloquée');

-- Une semaine passée entièrement faite : le boss 1 est vaincu, le resto est débloqué.
insert into public.taches (id, nom, categorie, frequence, penibilite) values
  ('00000000-0000-0000-0000-0000000000f1', 'Linge', 'maison', 'hebdomadaire', 1);
insert into public.cartes (tache_id, nom, categorie, penibilite, echeance, date_echeance, detenteur, retournee)
  values ('00000000-0000-0000-0000-0000000000f1', 'Linge', 'maison', 1, 'semaine',
          (date_trunc('week', current_date) - interval '7 days')::date, '00000000-0000-0000-0000-00000000000b', true);
select public.profiter_recompense((select id from ids where nom = 'resto'));
do $$ begin
  perform pg_temp.verifier((select profitee from public.recompenses where niveau = 1), 'Le resto devrait être profité');
end $$;

-- Le ciné (boss 5) n'est ni accepté ni débloqué ; on peut le retirer, pas le resto déjà vécu.
select pg_temp.doit_echouer(
  format('select public.profiter_recompense(%L)', (select id from ids where nom = 'cine')), 'pas encore débloquée');
select public.retirer_recompense((select id from ids where nom = 'cine'));
select pg_temp.doit_echouer(
  format('select public.retirer_recompense(%L)', (select id from ids where nom = 'resto')), 'ne peut pas être retirée');

-- C ne voit rien et ne peut rien faire sur les récompenses de A et B.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000c');
select public.creer_foyer();
do $$ begin
  perform pg_temp.verifier((select count(*) from public.recompenses) = 0, 'C voit une récompense d''un autre foyer');
end $$;
select pg_temp.doit_echouer(
  format('select public.retirer_recompense(%L)', (select id from ids where nom = 'resto')), 'ne peut pas être retirée');

-- Personne n'écrit directement dans la table.
select pg_temp.doit_echouer('delete from public.recompenses', 'permission denied');
reset role;
