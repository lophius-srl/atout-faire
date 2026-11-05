-- Tests des mercis. A et B partagent un foyer, C a le sien.
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
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
select public.rejoindre_foyer((select code_invitation from foyer_a));
insert into public.taches (id, nom, categorie, frequence, penibilite) values
  ('00000000-0000-0000-0000-0000000000f1', 'Vaisselle', 'cuisine', 'hebdomadaire', 2);
insert into public.cartes (id, tache_id, nom, categorie, penibilite, echeance, date_echeance, detenteur, retournee) values
  -- Faite par B, à faire par B, faite par A.
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000f1', 'Vaisselle', 'cuisine', 2, 'semaine', '2026-11-02', '00000000-0000-0000-0000-00000000000b', true),
  ('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-0000000000f1', 'Vaisselle', 'cuisine', 2, 'semaine', '2026-11-09', '00000000-0000-0000-0000-00000000000b', false),
  ('00000000-0000-0000-0000-0000000000c3', '00000000-0000-0000-0000-0000000000f1', 'Vaisselle', 'cuisine', 2, 'semaine', '2026-11-16', '00000000-0000-0000-0000-00000000000a', true);
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000c');
select public.creer_foyer();

-- A remercie B pour sa carte faite ; un deuxième merci ne crée pas de doublon.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
select public.dire_merci('00000000-0000-0000-0000-0000000000c1');
select public.dire_merci('00000000-0000-0000-0000-0000000000c1');
do $$ begin
  perform pg_temp.verifier((select count(*) from public.mercis) = 1, 'Un seul merci attendu');
end $$;

-- Pas de merci pour une carte pas encore faite, ni pour soi-même.
select pg_temp.doit_echouer($q$select public.dire_merci('00000000-0000-0000-0000-0000000000c2')$q$, 'retournée par l''autre');
select pg_temp.doit_echouer($q$select public.dire_merci('00000000-0000-0000-0000-0000000000c3')$q$, 'retournée par l''autre');

-- B voit le merci reçu, le marque comme vu.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
do $$ begin
  perform pg_temp.verifier((select count(*) from public.mercis where not vu) = 1, 'B devrait voir un merci non lu');
end $$;
select public.marquer_mercis_vus();
do $$ begin
  perform pg_temp.verifier((select count(*) from public.mercis where not vu) = 0, 'Le merci devrait être vu');
end $$;

-- C ne voit rien et ne peut pas remercier pour une carte d'un autre foyer.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000c');
do $$ begin
  perform pg_temp.verifier((select count(*) from public.mercis) = 0, 'C voit un merci d''un autre foyer');
end $$;
select pg_temp.doit_echouer($q$select public.dire_merci('00000000-0000-0000-0000-0000000000c1')$q$, 'retournée par l''autre');

-- Personne n'écrit directement dans la table.
select pg_temp.doit_echouer('delete from public.mercis', 'permission denied');
reset role;
