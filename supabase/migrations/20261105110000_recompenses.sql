-- Récompenses communes : on s'accorde à deux sur ce qu'on s'offre en battant un boss (un niveau).

create table public.recompenses (
  id uuid primary key default gen_random_uuid(),
  foyer_id uuid not null default public.mon_foyer()
    references public.foyers (id) on delete cascade,
  -- Niveau du boss (1 = la tente), tel qu'affiché dans l'app.
  niveau integer not null check (niveau >= 1),
  description text not null check (length(trim(description)) between 1 and 80),
  proposee_par uuid not null references public.membres (user_id) on delete cascade,
  -- L'autre parent a donné son accord.
  acceptee boolean not null default false,
  -- La récompense a été vécue.
  profitee boolean not null default false,
  cree_le timestamptz not null default now(),
  -- Une récompense par boss.
  unique (foyer_id, niveau)
);

alter table public.recompenses enable row level security;

create policy "Voir les récompenses de mon foyer" on public.recompenses
  for select to authenticated using (foyer_id = public.mon_foyer());

grant select on public.recompenses to authenticated;

create function public.proposer_recompense(niveau_boss integer, texte text) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  nouvelle uuid;
begin
  if auth.uid() is null or public.mon_foyer() is null then
    raise exception 'Connexion requise';
  end if;
  insert into public.recompenses (foyer_id, niveau, description, proposee_par)
    values (public.mon_foyer(), niveau_boss, trim(texte), auth.uid())
    returning id into nouvelle;
  return nouvelle;
exception when unique_violation then
  raise exception 'Ce boss a déjà sa récompense.';
end;
$$;

-- Seul l'autre parent peut donner son accord.
create function public.accepter_recompense(recompense uuid) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  update public.recompenses set acceptee = true
    where id = recompense and foyer_id = public.mon_foyer() and proposee_par <> auth.uid();
  if not found then
    raise exception 'Seul l''autre parent peut accepter cette récompense.';
  end if;
end;
$$;

create function public.retirer_recompense(recompense uuid) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  delete from public.recompenses
    where id = recompense and foyer_id = public.mon_foyer() and not profitee;
  if not found then
    raise exception 'Cette récompense ne peut pas être retirée.';
  end if;
end;
$$;

-- Marquer comme vécue : seulement une récompense acceptée dont le boss est vaincu.
create function public.profiter_recompense(recompense uuid) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  update public.recompenses set profitee = true
    where id = recompense and foyer_id = public.mon_foyer() and acceptee
      and niveau <= public.semaines_vaincues(current_date + 1);
  if not found then
    raise exception 'Cette récompense n''est pas encore débloquée.';
  end if;
end;
$$;

revoke execute on function
  public.proposer_recompense(integer, text), public.accepter_recompense(uuid),
  public.retirer_recompense(uuid), public.profiter_recompense(uuid)
  from public, anon;
grant execute on function
  public.proposer_recompense(integer, text), public.accepter_recompense(uuid),
  public.retirer_recompense(uuid), public.profiter_recompense(uuid)
  to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.recompenses;
  end if;
end;
$$;
