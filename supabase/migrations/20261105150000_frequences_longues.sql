-- Fréquences « toutes les deux semaines » et « une fois par mois » : des cartes de la semaine,
-- certaines semaines seulement. Compatible avec le code déjà en ligne : on ajoute, rien n'est retiré.

alter table public.taches drop constraint taches_frequence_check;
alter table public.taches add constraint taches_frequence_check
  check (frequence in ('quotidienne', 'hebdomadaire', 'bimensuelle', 'mensuelle', 'ponctuelle'));

-- Jours pour une tâche quotidienne, date pour une tâche ponctuelle, ni l'un ni l'autre sinon.
alter table public.taches drop constraint taches_regles_frequence;
alter table public.taches add constraint taches_regles_frequence check (
  (frequence = 'quotidienne' and coalesce(cardinality(jours), 0) > 0 and date_unique is null)
  or (frequence in ('hebdomadaire', 'bimensuelle', 'mensuelle') and jours is null and date_unique is null)
  or (frequence = 'ponctuelle' and jours is null and date_unique is not null)
);
