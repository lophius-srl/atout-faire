-- Tests du retournement. A et B partagent un foyer.
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

create function pg_temp.retournee(carte uuid) returns boolean language sql as $$
  select retournee from public.cartes where id = carte
$$;

select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
create temp table foyer_a as select * from public.creer_foyer();
grant select on foyer_a to authenticated;
insert into public.taches (id, nom, categorie, frequence, penibilite)
  values ('00000000-0000-0000-0000-0000000000f1', 'Aspirateur', 'maison', 'hebdomadaire', 2);
insert into public.cartes (id, tache_id, nom, categorie, penibilite, echeance, date_echeance) values
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000f1', 'Aspirateur', 'maison', 2, 'semaine', '2026-11-02'),
  ('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-0000000000f1', 'Aspirateur', 'maison', 2, 'semaine', '2026-11-09');
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000b');
select public.rejoindre_foyer((select code_invitation from foyer_a));

-- B pioche la première carte, la retourne, puis annule.
select public.piocher_carte('00000000-0000-0000-0000-0000000000c1');
select public.retourner_carte('00000000-0000-0000-0000-0000000000c1');
do $$ begin
  if not pg_temp.retournee('00000000-0000-0000-0000-0000000000c1') then raise exception 'Carte non retournée'; end if;
end $$;
select public.retourner_carte('00000000-0000-0000-0000-0000000000c1', false);
do $$ begin
  if pg_temp.retournee('00000000-0000-0000-0000-0000000000c1') then raise exception 'Annulation non prise en compte'; end if;
end $$;

-- A ne peut retourner ni la carte de B, ni une carte encore sur le Marché.
select pg_temp.en_tant_que('00000000-0000-0000-0000-00000000000a');
select pg_temp.doit_echouer(
  $q$select public.retourner_carte('00000000-0000-0000-0000-0000000000c1')$q$, 'cartes de ta main');
select pg_temp.doit_echouer(
  $q$select public.retourner_carte('00000000-0000-0000-0000-0000000000c2')$q$, 'cartes de ta main');
do $$ begin
  if pg_temp.retournee('00000000-0000-0000-0000-0000000000c1')
     or pg_temp.retournee('00000000-0000-0000-0000-0000000000c2') then
    raise exception 'Une carte a été retournée par quelqu''un qui ne la détient pas';
  end if;
end $$;
reset role;
