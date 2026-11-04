-- Les goûts de chacun pour chaque tâche : personnels, et figés sur la carte quand elle arrive en main.

create table public.gouts (
  user_id uuid not null references public.membres (user_id) on delete cascade,
  tache_id uuid not null references public.taches (id) on delete cascade,
  gout text not null check (gout in ('aime', 'neutre', 'naime_pas')),
  primary key (user_id, tache_id)
);

alter table public.gouts enable row level security;

-- Chacun ne voit et ne modifie que ses propres goûts, pour les tâches de son foyer.
create policy "Voir mes goûts" on public.gouts
  for select to authenticated using (user_id = auth.uid());

create policy "Donner mes goûts" on public.gouts
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.taches where id = tache_id and foyer_id = public.mon_foyer())
  );

create policy "Changer mes goûts" on public.gouts
  for update to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.taches where id = tache_id and foyer_id = public.mon_foyer())
  );

create policy "Retirer mes goûts" on public.gouts
  for delete to authenticated using (user_id = auth.uid());

grant select, insert, update, delete on public.gouts to authenticated;

-- Goût du détenteur au moment où la carte arrive dans sa main (neutre par défaut).
alter table public.cartes add column gout text not null default 'neutre'
  check (gout in ('aime', 'neutre', 'naime_pas'));

-- security definer : lit le goût du détenteur, même quand c'est l'autre parent qui distribue ou pioche.
create function public.figer_gout_de_la_carte() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.detenteur is null then
    new.gout := 'neutre';
  elsif tg_op = 'INSERT' or new.detenteur is distinct from old.detenteur then
    new.gout := coalesce(
      (select gout from public.gouts where user_id = new.detenteur and tache_id = new.tache_id),
      'neutre'
    );
  end if;
  return new;
end;
$$;

create trigger figer_gout_de_la_carte
  before insert or update of detenteur on public.cartes
  for each row execute function public.figer_gout_de_la_carte();
