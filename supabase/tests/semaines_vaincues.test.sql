-- Tests du niveau du foyer. A a un foyer, C a le sien.
insert into auth.users values
  ('00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-00000000000c');

create function pg_temp.en_tant_que(utilisateur text) returns void language sql as $$
  select set_config('request.jwt.claim.sub', utilisateur, false), set_config('role', 'authenticated', false)
$$;

create function pg_temp.verifier(condition boolean, message text) returns void language plpgsql as $$
begin
  if not condition then raise exception '%', message; end if;
end;
$$;

select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
select public.creer_foyer();
insert into public.taches (id, nom, categorie, frequence, penibilite) values
  ('00000000-0000-0000-0000-0000000000f1', 'Linge', 'maison', 'hebdomadaire', 1);

-- Semaine du 19 octobre : tout est retourné (vaincue).
-- Semaine du 26 octobre : une carte reste à faire (ratée).
-- Semaine du 2 novembre : tout est retourné (vaincue).
-- Semaine du 9 novembre : la semaine en cours, pas encore comptée.
insert into public.cartes (tache_id, nom, categorie, penibilite, echeance, date_echeance, detenteur, retournee) values
  ('00000000-0000-0000-0000-0000000000f1', 'Linge', 'maison', 1, 'jour', '2026-10-20', '00000000-0000-0000-0000-00000000000a', true),
  ('00000000-0000-0000-0000-0000000000f1', 'Linge', 'maison', 1, 'semaine', '2026-10-19', '00000000-0000-0000-0000-00000000000a', true),
  ('00000000-0000-0000-0000-0000000000f1', 'Linge', 'maison', 1, 'jour', '2026-10-27', '00000000-0000-0000-0000-00000000000a', true),
  ('00000000-0000-0000-0000-0000000000f1', 'Linge', 'maison', 1, 'jour', '2026-10-28', null, false),
  ('00000000-0000-0000-0000-0000000000f1', 'Linge', 'maison', 1, 'semaine', '2026-11-02', '00000000-0000-0000-0000-00000000000a', true),
  ('00000000-0000-0000-0000-0000000000f1', 'Linge', 'maison', 1, 'jour', '2026-11-10', '00000000-0000-0000-0000-00000000000a', true);

do $$ begin
  perform pg_temp.verifier(public.semaines_vaincues('2026-11-09') = 2, 'Deux semaines vaincues attendues');
  perform pg_temp.verifier(public.semaines_vaincues('2026-10-26') = 1, 'Une seule semaine vaincue avant le 26 octobre');
end $$;

-- Un autre foyer part de zéro.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000c');
select public.creer_foyer();
do $$ begin
  perform pg_temp.verifier(public.semaines_vaincues('2026-11-09') = 0, 'C ne doit pas voir les semaines de A');
end $$;
reset role;
