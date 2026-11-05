import { ajouterJours, type DateLocale } from "./distribution";

/** Une période de vacances du foyer, dates incluses. */
export interface Vacances {
  debut: DateLocale;
  fin: DateLocale;
}

/** Le jour tombe dans l'une des périodes (passées comprises : leurs jours restent couverts). */
export function estEnVacances(
  date: DateLocale,
  periodes: readonly Vacances[],
): boolean {
  return periodes.some((v) => date >= v.debut && date <= v.fin);
}

/** Toute la semaine de ce lundi tombe dans une période : aucune carte, pas même de la semaine. */
export function semaineEnVacances(
  lundi: DateLocale,
  periodes: readonly Vacances[],
): boolean {
  const dimanche = ajouterJours(lundi, 6);
  return periodes.some((v) => lundi >= v.debut && dimanche <= v.fin);
}

/** La période en cours ou à venir (il n'y en a qu'une), ou null. */
export function periodeActive(
  periodes: readonly Vacances[],
  aujourdhui: DateLocale,
): Vacances | null {
  return periodes.find((v) => v.fin >= aujourdhui) ?? null;
}

/** Où en est la période : à venir, en cours, ou sans objet (aucune, ou déjà finie). */
export function etatVacances(
  vacances: Vacances | null,
  aujourdhui: DateLocale,
): "a_venir" | "en_cours" | null {
  if (!vacances || vacances.fin < aujourdhui) return null;
  return vacances.debut > aujourdhui ? "a_venir" : "en_cours";
}

/** « 24 août ». */
export function jourEtMois(date: DateLocale): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
  }).format(new Date(`${date}T00:00:00Z`));
}

/** Le bandeau commun, ou null s'il n'y a rien à dire. */
export function bandeauVacances(
  vacances: Vacances | null,
  aujourdhui: DateLocale,
): string | null {
  const etat = etatVacances(vacances, aujourdhui);
  if (!vacances || !etat) return null;
  return etat === "en_cours"
    ? `En vacances jusqu'au ${jourEtMois(vacances.fin)} 🌴`
    : `Vacances prévues du ${jourEtMois(vacances.debut)} au ${jourEtMois(vacances.fin)} 🌴`;
}
