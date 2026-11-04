-- Tests des goûts. A et B partagent un foyer, C a le sien.
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

create function pg_temp.gout_de_la_carte(carte uuid) returns text language sql as $$
  select gout from public.cartes where id = carte
$$;

-- Foyer de A et B, avec une tâche hebdo et une tâche hebdo réservée à B.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
create temp table foyer_a as select * from public.creer_foyer();
grant select on foyer_a to authenticated;
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
select public.rejoindre_foyer((select code_invitation from foyer_a));
insert into public.taches (id, nom, categorie, frequence, penibilite) values
  ('00000000-0000-0000-0000-0000000000f1', 'Vaisselle', 'cuisine', 'hebdomadaire', 2);
insert into public.taches (id, nom, categorie, frequence, penibilite, fixe_pour) values
  ('00000000-0000-0000-0000-0000000000f2', 'Bain', 'enfants', 'hebdomadaire', 1, '00000000-0000-0000-0000-00000000000b');
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000c');
select public.creer_foyer();

-- B n'aime pas la vaisselle et aime le bain ; A aime la vaisselle.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
insert into public.gouts (user_id, tache_id, gout) values
  ('00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-0000000000f1', 'naime_pas'),
  ('00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-0000000000f2', 'aime');
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
insert into public.gouts (user_id, tache_id, gout) values
  ('00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-0000000000f1', 'aime');

-- Les goûts sont personnels : A ne voit pas ceux de B, et ne peut pas les écrire.
do $$ begin
  if (select count(*) from public.gouts) <> 1 then raise exception 'A ne devrait voir que son goût'; end if;
end $$;
select pg_temp.doit_echouer(
  $q$insert into public.gouts values ('00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-0000000000f2', 'naime_pas')$q$,
  'row-level security');
-- Tentative de modifier le goût de B : sans effet (vérifié plus bas par la carte fixe de B).
update public.gouts set gout = 'naime_pas' where user_id = '00000000-0000-0000-0000-00000000000b';

-- C ne peut pas donner de goût sur une tâche d'un autre foyer.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000c');
select pg_temp.doit_echouer(
  $q$insert into public.gouts values ('00000000-0000-0000-0000-00000000000c', '00000000-0000-0000-0000-0000000000f1', 'aime')$q$,
  'row-level security');

-- A distribue : la carte réservée à B prend le goût de B, même si A ne peut pas le lire.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
insert into public.cartes (id, tache_id, nom, categorie, penibilite, echeance, date_echeance, detenteur) values
  ('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-0000000000f2', 'Bain', 'enfants', 1, 'semaine', '2026-11-02',
   '00000000-0000-0000-0000-00000000000b');
insert into public.cartes (id, tache_id, nom, categorie, penibilite, echeance, date_echeance) values
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000f1', 'Vaisselle', 'cuisine', 2, 'semaine', '2026-11-02'),
  ('00000000-0000-0000-0000-0000000000c3', '00000000-0000-0000-0000-0000000000f1', 'Vaisselle', 'cuisine', 2, 'semaine', '2026-11-09');
do $$ begin
  if pg_temp.gout_de_la_carte('00000000-0000-0000-0000-0000000000c2') <> 'aime' then
    raise exception 'La carte fixe devrait porter le goût de B';
  end if;
  if pg_temp.gout_de_la_carte('00000000-0000-0000-0000-0000000000c1') <> 'neutre' then
    raise exception 'Une carte du Marché est neutre';
  end if;
end $$;

-- B pioche la vaisselle : la carte prend son goût du moment.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
select public.piocher_carte('00000000-0000-0000-0000-0000000000c1');
-- B change d'avis ensuite : la carte déjà prise ne change pas, la suivante si.
update public.gouts set gout = 'neutre' where tache_id = '00000000-0000-0000-0000-0000000000f1';
select public.piocher_carte('00000000-0000-0000-0000-0000000000c3');
do $$ begin
  if pg_temp.gout_de_la_carte('00000000-0000-0000-0000-0000000000c1') <> 'naime_pas' then
    raise exception 'Le goût de la carte déjà prise ne doit pas changer';
  end if;
  if pg_temp.gout_de_la_carte('00000000-0000-0000-0000-0000000000c3') <> 'neutre' then
    raise exception 'La carte prise après le changement porte le nouveau goût';
  end if;
end $$;
reset role;
