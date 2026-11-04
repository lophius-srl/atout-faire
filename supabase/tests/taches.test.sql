-- Tests du deck. A et B partagent un foyer, C a le sien.
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
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
select public.rejoindre_foyer((select code_invitation from foyer_a));
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000c');
select public.creer_foyer();

-- A ajoute des tâches, dont une fixe pour B ; B les voit et peut les modifier.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
insert into public.taches (nom, categorie, frequence, jours, penibilite)
  values ('Vaisselle', 'cuisine', 'quotidienne', '{1,2,3,4,5}', 2);
insert into public.taches (nom, categorie, frequence, penibilite, fixe_pour)
  values ('Courses', 'courses', 'hebdomadaire', 3, '00000000-0000-0000-0000-00000000000b');

select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
do $$ begin
  if (select count(*) from public.taches) <> 2 then raise exception 'B devrait voir 2 tâches'; end if;
end $$;
update public.taches set penibilite = 1 where nom = 'Vaisselle';

-- C ne voit rien, ne modifie rien, et ne peut pas désigner un membre d'un autre foyer.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000c');
do $$ begin
  if (select count(*) from public.taches) <> 0 then raise exception 'C voit le deck d''un autre foyer'; end if;
end $$;
update public.taches set nom = 'Piraté';
delete from public.taches;
select pg_temp.doit_echouer(
  format('insert into public.taches (foyer_id, nom, categorie, frequence, penibilite) values (%L, %L, %L, %L, 1)',
    (select id from foyer_a), 'Intrus', 'maison', 'hebdomadaire'), 'row-level security');
select pg_temp.doit_echouer(
  $q$insert into public.taches (nom, categorie, frequence, penibilite, fixe_pour)
     values ('Fixe', 'maison', 'hebdomadaire', 1, '00000000-0000-0000-0000-00000000000a')$q$,
  'row-level security');

-- Les règles de saisie sont garanties par la base.
select pg_temp.doit_echouer(
  $q$insert into public.taches (nom, categorie, frequence, penibilite) values ('  ', 'maison', 'hebdomadaire', 1)$q$,
  'check constraint');
select pg_temp.doit_echouer(
  $q$insert into public.taches (nom, categorie, frequence, penibilite) values ('Linge', 'maison', 'hebdomadaire', 4)$q$,
  'check constraint');
select pg_temp.doit_echouer(
  $q$insert into public.taches (nom, categorie, frequence, penibilite) values ('Linge', 'maison', 'quotidienne', 1)$q$,
  'check constraint');

-- Rien n'a bougé chez A et B.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
do $$ begin
  if (select count(*) from public.taches) <> 2 then raise exception 'Le deck de A a été modifié par C'; end if;
  if (select penibilite from public.taches where nom = 'Vaisselle') <> 1 then raise exception 'La modification de B est perdue'; end if;
end $$;

-- Un visiteur non connecté n'a aucun accès.
reset role;
select set_config('role', 'anon', false);
select pg_temp.doit_echouer('select * from public.taches', 'permission denied');
reset role;
