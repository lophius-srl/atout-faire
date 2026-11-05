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

const MS_PAR_SEMAINE = 7 * 24 * 60 * 60 * 1000;

/** Nombre de semaines du lundi `depuis` au lundi `jusqua` (négatif si `jusqua` est avant). */
function semainesEntre(depuis: DateLocale, jusqua: DateLocale): number {
  return Math.round(
    (versDateUtc(jusqua).getTime() - versDateUtc(depuis).getTime()) /
      MS_PAR_SEMAINE,
  );
}

/** La semaine d'une tâche mensuelle : la première du mois, celle dont le lundi tombe entre le 1er et le 7. */
export function estSemaineDuMois(lundi: DateLocale): boolean {
  return Number(lundi.slice(8, 10)) <= 7;
}

/** Lundi de la prochaine semaine d'une tâche mensuelle, à partir de la semaine d'`aujourdhui` incluse. */
export function prochaineSemaineDuMois(aujourdhui: DateLocale): DateLocale {
  let lundi = lundiDeLaSemaine(aujourdhui);
  while (!estSemaineDuMois(lundi)) lundi = ajouterJours(lundi, 7);
  return lundi;
}

/**
 * Une tâche sur plusieurs semaines donne-t-elle une carte la semaine de `lundi` ?
 * Toutes les deux semaines : au rythme de la semaine de création.
 * Une fois par mois : la première semaine du mois, à partir de la semaine de création.
 */
function donneUneCarteLaSemaine(
  tache: TacheADistribuer,
  lundi: DateLocale,
): boolean {
  const ecart = semainesEntre(lundiDeLaSemaine(tache.creeLe), lundi);
  if (ecart < 0) return false;
  if (tache.frequence === "bimensuelle") return ecart % 2 === 0;
  return estSemaineDuMois(lundi);
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
    if (tache.frequence === "bimensuelle" || tache.frequence === "mensuelle") {
      if (donneUneCarteLaSemaine(tache, lundi)) {
        cartes.push(nouvelleCarte(tache, "semaine", lundi));
      }
      continue;
    }
    if (tache.frequence === "ponctuelle") {
      const date = tache.dateUnique;
      if (date && date >= lundi && date <= aujourdhui) {
        cartes.push(nouvelleCarte(tache, "jour", date));
      }
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

/** L'heure (0 à 23) dans le fuseau du foyer. */
export function heureDansFuseau(instant: Date, fuseau: string): number {
  const heure = new Intl.DateTimeFormat("en-GB", {
    timeZone: fuseau,
    hour: "numeric",
    hourCycle: "h23",
  }).format(instant);
  return Number(heure);
}
