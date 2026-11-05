-- Tâches ponctuelles : une seule carte, à une date précise (rendez-vous, déclaration d'impôts…).
-- Compatible avec le code déjà en ligne : on ajoute une colonne et une fréquence, rien n'est retiré.

alter table public.taches add column date_unique date;

alter table public.taches drop constraint taches_frequence_check;
alter table public.taches add constraint taches_frequence_check
  check (frequence in ('quotidienne', 'hebdomadaire', 'ponctuelle'));

-- Jours pour une tâche quotidienne, date pour une tâche ponctuelle, ni l'un ni l'autre pour une hebdomadaire.
alter table public.taches drop constraint taches_check;
alter table public.taches add constraint taches_regles_frequence check (
  (frequence = 'quotidienne' and coalesce(cardinality(jours), 0) > 0 and date_unique is null)
  or (frequence = 'hebdomadaire' and jours is null and date_unique is null)
  or (frequence = 'ponctuelle' and jours is null and date_unique is not null)
);
