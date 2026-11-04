-- Tests : supprimer une tâche retire ses cartes à faire. A et B partagent un foyer.
insert into auth.users values
  ('00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-00000000000b');

create function pg_temp.en_tant_que(utilisateur text) returns void language sql as $$
  select set_config('request.jwt.claim.sub', utilisateur, false), set_config('role', 'authenticated', false)
$$;

create function pg_temp.verifier(condition boolean, message text) returns void language plpgsql as $$
begin
  if not condition then raise exception '%', message; end if;
end;
$$;

select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
create temp table foyer_a as select * from public.creer_foyer();
grant select on foyer_a to authenticated;
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
select public.rejoindre_foyer((select code_invitation from foyer_a));

-- Deux tâches : Linge (qu'on va supprimer) et Vaisselle (qui reste).
insert into public.taches (id, nom, categorie, frequence, penibilite) values
  ('00000000-0000-0000-0000-0000000000f1', 'Linge', 'maison', 'hebdomadaire', 2),
  ('00000000-0000-0000-0000-0000000000f2', 'Vaisselle', 'cuisine', 'hebdomadaire', 2);
insert into public.cartes (id, tache_id, nom, categorie, penibilite, echeance, date_echeance, detenteur, retournee) values
  -- Linge : une sur le Marché, une dans la main de A, une dans la main de B déjà faite.
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000f1', 'Linge', 'maison', 2, 'semaine', '2026-11-02', null, false),
  ('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-0000000000f1', 'Linge', 'maison', 2, 'semaine', '2026-11-09', '00000000-0000-0000-0000-00000000000a', false),
  ('00000000-0000-0000-0000-0000000000c3', '00000000-0000-0000-0000-0000000000f1', 'Linge', 'maison', 2, 'semaine', '2026-11-16', '00000000-0000-0000-0000-00000000000b', true),
  -- Vaisselle : dans la main de B.
  ('00000000-0000-0000-0000-0000000000c4', '00000000-0000-0000-0000-0000000000f2', 'Vaisselle', 'cuisine', 2, 'semaine', '2026-11-02', '00000000-0000-0000-0000-00000000000b', false);

-- A propose sa carte de linge en échange.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
select public.proposer_echange('00000000-0000-0000-0000-0000000000c2');

-- B supprime la tâche Linge.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
delete from public.taches where id = '00000000-0000-0000-0000-0000000000f1';

do $$ begin
  perform pg_temp.verifier(
    not exists (select 1 from public.cartes where id in (
      '00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000c2')),
    'Les cartes de linge à faire (Marché et main de A) doivent disparaître');
  perform pg_temp.verifier(
    exists (select 1 from public.cartes where id = '00000000-0000-0000-0000-0000000000c3'),
    'La carte de linge déjà retournée reste');
  perform pg_temp.verifier(
    exists (select 1 from public.cartes where id = '00000000-0000-0000-0000-0000000000c4'),
    'Les cartes des autres tâches ne bougent pas');
  perform pg_temp.verifier(
    (select count(*) from public.echanges) = 0,
    'L''échange sur une carte retirée disparaît avec elle');
end $$;
reset role;
