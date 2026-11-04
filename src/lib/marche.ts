import type { Carte } from "./cartes";
import { jourDeLaSemaine, type DateLocale } from "./distribution";

/** 0 : discrète, 1 : en attente, 2 : attend depuis longtemps. */
export type NiveauAttente = 0 | 1 | 2;

/** Une carte posée sur le Marché, en attente de preneur. */
export interface CarteAuMarche {
  carte: Carte;
  niveau: NiveauAttente;
}

export interface Marche {
  duJour: CarteAuMarche[];
  deLaSemaine: CarteAuMarche[];
}

/** Heures (heure locale du foyer) à partir desquelles une carte du jour ressort. */
const HEURE_EN_ATTENTE = 12;
const HEURE_LONGTEMPS = 18;
/** Jours de la semaine (1 = lundi) à partir desquels une carte hebdo ressort. */
const JOUR_EN_ATTENTE = 4; // jeudi
const JOUR_LONGTEMPS = 6; // samedi

/**
 * Niveau d'attente d'une carte du Marché, selon l'heure et le jour au foyer.
 * Une carte d'un jour déjà passé attend depuis longtemps.
 */
export function niveauAttente(
  carte: { echeance: "jour" | "semaine"; dateEcheance: DateLocale },
  maintenant: { date: DateLocale; heure: number },
): NiveauAttente {
  if (carte.echeance === "semaine") {
    const jour = jourDeLaSemaine(maintenant.date);
    return jour >= JOUR_LONGTEMPS ? 2 : jour >= JOUR_EN_ATTENTE ? 1 : 0;
  }
  if (carte.dateEcheance < maintenant.date) return 2;
  if (carte.dateEcheance > maintenant.date) return 0;
  return maintenant.heure >= HEURE_LONGTEMPS
    ? 2
    : maintenant.heure >= HEURE_EN_ATTENTE
      ? 1
      : 0;
}

/** Les cartes qui attendent le plus passent devant ; à égalité, l'ordre est conservé. */
function attenteDAbord(cartes: CarteAuMarche[]): CarteAuMarche[] {
  return [...cartes].sort((a, b) => b.niveau - a.niveau);
}

export function organiserMarche(cartes: readonly CarteAuMarche[]): Marche {
  const duJour = cartes.filter((c) => c.carte.echeance.type === "jour");
  const deLaSemaine = cartes.filter((c) => c.carte.echeance.type === "semaine");
  return {
    duJour: attenteDAbord(duJour),
    deLaSemaine: attenteDAbord(deLaSemaine),
  };
}
