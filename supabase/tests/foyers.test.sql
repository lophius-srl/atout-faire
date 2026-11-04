-- Tests des foyers. Chaque bloc échoue (et arrête le script) si une règle n'est pas respectée.
insert into auth.users values
  ('00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-00000000000b'),
  ('00000000-0000-0000-0000-00000000000c'),
  ('00000000-0000-0000-0000-00000000000d');

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

-- A crée un foyer, B le rejoint avec le code.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
create temp table foyer_a as select * from public.creer_foyer();
grant select on foyer_a to authenticated;
select pg_temp.doit_echouer('select public.creer_foyer()', 'déjà partie');

select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
select public.rejoindre_foyer(lower((select code_invitation from foyer_a)));
select pg_temp.doit_echouer('select public.rejoindre_foyer(''ZZZZZZ'')', 'inconnu');

-- C ne peut pas rejoindre un foyer complet.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000c');
select pg_temp.doit_echouer(
  format('select public.rejoindre_foyer(%L)', (select code_invitation from foyer_a)), 'complet');

-- C crée son propre foyer et ne voit rien de celui de A et B.
select public.creer_foyer();
do $$ begin
  if (select count(*) from public.foyers) <> 1 then raise exception 'C voit un autre foyer'; end if;
  if (select count(*) from public.membres) <> 1 then raise exception 'C voit d''autres membres'; end if;
end $$;

-- B voit son foyer et ses deux membres.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
do $$ begin
  if (select count(*) from public.membres) <> 2 then raise exception 'B devrait voir 2 membres'; end if;
end $$;

-- Personne ne peut écrire directement dans les tables.
select pg_temp.doit_echouer('insert into public.foyers default values', 'permission denied');
select pg_temp.doit_echouer(
  format('insert into public.membres (user_id, foyer_id) values (%L, %L)',
    '00000000-0000-0000-0000-00000000000d', (select id from foyer_a)), 'permission denied');

-- Un visiteur non connecté ne voit rien et ne peut rien appeler.
reset role;
select set_config('role', 'anon', false);
select pg_temp.doit_echouer('select * from public.foyers', 'permission denied');
select pg_temp.doit_echouer('select public.creer_foyer()', 'permission denied');

reset role;
select 'Tous les tests des foyers passent' as resultat;
