-- Tests de la remise au Marché. A et B partagent un foyer.
insert into auth.users values
  ('00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-00000000000b');

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

create function pg_temp.detenteur(carte uuid) returns uuid language sql as $$
  select detenteur from public.cartes where id = carte
$$;

select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
create temp table foyer_a as select * from public.creer_foyer();
grant select on foyer_a to authenticated;
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
select public.rejoindre_foyer((select code_invitation from foyer_a));

-- Une tâche réservée à B (que B n'aime pas), et une tâche libre.
insert into public.taches (id, nom, categorie, frequence, penibilite, fixe_pour) values
  ('00000000-0000-0000-0000-0000000000f1', 'Bain', 'enfants', 'hebdomadaire', 2, '00000000-0000-0000-0000-00000000000b');
insert into public.taches (id, nom, categorie, frequence, penibilite) values
  ('00000000-0000-0000-0000-0000000000f2', 'Linge', 'maison', 'hebdomadaire', 1);
insert into public.gouts values
  ('00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-0000000000f1', 'naime_pas');
insert into public.cartes (id, tache_id, nom, categorie, penibilite, echeance, date_echeance, detenteur) values
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000f1', 'Bain', 'enfants', 2, 'semaine', '2026-11-02',
   '00000000-0000-0000-0000-00000000000b');
insert into public.cartes (id, tache_id, nom, categorie, penibilite, echeance, date_echeance) values
  ('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-0000000000f2', 'Linge', 'maison', 1, 'semaine', '2026-11-02');

-- A ne peut pas remettre au Marché la carte de B.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
select pg_temp.doit_echouer(
  $q$select public.remettre_au_marche('00000000-0000-0000-0000-0000000000c1')$q$, 'cartes de ta main');

-- B remet sa carte fixe au Marché : elle n'a plus de détenteur et redevient neutre.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
select public.remettre_au_marche('00000000-0000-0000-0000-0000000000c1');
do $$ begin
  if pg_temp.detenteur('00000000-0000-0000-0000-0000000000c1') is not null then
    raise exception 'La carte devrait être sur le Marché';
  end if;
  if (select gout from public.cartes where id = '00000000-0000-0000-0000-0000000000c1') <> 'neutre' then
    raise exception 'Une carte du Marché est neutre';
  end if;
end $$;

-- A peut la piocher normalement.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
select public.piocher_carte('00000000-0000-0000-0000-0000000000c1');
do $$ begin
  if pg_temp.detenteur('00000000-0000-0000-0000-0000000000c1') <> '00000000-0000-0000-0000-00000000000a' then
    raise exception 'A devrait détenir la carte';
  end if;
end $$;

-- Une carte déjà retournée, ou encore sur le Marché, ne peut pas y être remise.
select public.retourner_carte('00000000-0000-0000-0000-0000000000c1');
select pg_temp.doit_echouer(
  $q$select public.remettre_au_marche('00000000-0000-0000-0000-0000000000c1')$q$, 'encore à faire');
select pg_temp.doit_echouer(
  $q$select public.remettre_au_marche('00000000-0000-0000-0000-0000000000c2')$q$, 'cartes de ta main');
reset role;
