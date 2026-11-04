import type { Tache } from "./deck";

/** Date locale au format AAAA-MM-JJ. */
export type DateLocale = string;

/** Une tâche du deck, avec la date locale de sa création. */
export type TacheADistribuer = Omit<Tache, "creeLe"> & { creeLe: DateLocale };

export interface NouvelleCarte {
  tacheId: string;
  nom: string;
  categorie: Tache["categorie"];
  penibilite: Tache["penibilite"];
  echeance: "jour" | "semaine";
  dateEcheance: DateLocale;
  /** Parent qui reçoit la carte d'office, ou null pour le Marché. */
  detenteur: string | null;
}

/** La date du jour dans le fuseau du foyer (ex. Europe/Paris). */
export function dateDansFuseau(instant: Date, fuseau: string): DateLocale {
  return new Intl.DateTimeFormat("en-CA", { timeZone: fuseau }).format(instant);
}

function versDateUtc(date: DateLocale): Date {
  return new Date(`${date}T00:00:00Z`);
}

export function ajouterJours(date: DateLocale, jours: number): DateLocale {
  const resultat = versDateUtc(date);
  resultat.setUTCDate(resultat.getUTCDate() + jours);
  return resultat.toISOString().slice(0, 10);
}

/** 1 pour lundi … 7 pour dimanche. */
export function jourDeLaSemaine(date: DateLocale): number {
  return ((versDateUtc(date).getUTCDay() + 6) % 7) + 1;
}

export function lundiDeLaSemaine(date: DateLocale): DateLocale {
  return ajouterJours(date, 1 - jourDeLaSemaine(date));
}

function nouvelleCarte(
  tache: TacheADistribuer,
  echeance: NouvelleCarte["echeance"],
  dateEcheance: DateLocale,
): NouvelleCarte {
  return {
    tacheId: tache.id,
    nom: tache.nom,
    categorie: tache.categorie,
    penibilite: tache.penibilite,
    echeance,
    dateEcheance,
    detenteur: tache.fixePour,
  };
}

/**
 * Les cartes que le deck doit avoir donné cette semaine, jusqu'à aujourd'hui inclus.
 * Une tâche ne donne rien pour les jours qui précèdent sa création.
 */
export function cartesAttendues(
  taches: readonly TacheADistribuer[],
  aujourdhui: DateLocale,
): NouvelleCarte[] {
  const lundi = lundiDeLaSemaine(aujourdhui);
  const cartes: NouvelleCarte[] = [];
  for (const tache of taches) {
    if (tache.frequence === "hebdomadaire") {
      cartes.push(nouvelleCarte(tache, "semaine", lundi));
      continue;
    }
    const debut = tache.creeLe > lundi ? tache.creeLe : lundi;
    for (let jour = debut; jour <= aujourdhui; jour = ajouterJours(jour, 1)) {
      if (tache.jours?.includes(jourDeLaSemaine(jour))) {
        cartes.push(nouvelleCarte(tache, "jour", jour));
      }
    }
  }
  return cartes;
}
