import type { CategorieId } from "./categories";

export const JOURS = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
] as const;

export type Jour = (typeof JOURS)[number];

/** Une carte vaut pour un jour précis, ou pour toute la semaine. */
export type Echeance = { type: "jour"; jour: Jour } | { type: "semaine" };

export interface Carte {
  id: string;
  tache: string;
  categorie: CategorieId;
  echeance: Echeance;
  /** Vrai quand la tâche est faite. */
  retournee: boolean;
}

export function libelleEcheance(echeance: Echeance): string {
  if (echeance.type === "semaine") {
    return "Cette semaine";
  }
  return echeance.jour.charAt(0).toUpperCase() + echeance.jour.slice(1);
}

/** Texte lu par les lecteurs d'écran pour décrire la carte. */
export function descriptionCarte(carte: Carte, nomCategorie: string): string {
  const etat = carte.retournee ? "faite" : "à faire";
  const echeance = libelleEcheance(carte.echeance).toLowerCase();
  return `${carte.tache}, ${nomCategorie}, ${echeance}, ${etat}`;
}
