import type { Carte } from "./cartes";

/** Un merci, du point de vue de la base. */
export interface Merci {
  carte_id: string;
  de: string;
  pour: string;
  vu: boolean;
}

/** Une carte de la semaine, avec qui la détient. */
interface CarteDetenue {
  carte: Carte;
  detenteur: string | null;
  dateEcheance: string;
}

/** Message affiché à celui qui reçoit des mercis, à partir des tâches concernées. */
export function messageMercis(taches: readonly string[]): string | null {
  const uniques = [...new Set(taches)];
  if (uniques.length === 0) return null;
  const nomme = (nom: string) => nom.charAt(0).toLowerCase() + nom.slice(1);
  if (uniques.length === 1)
    return `💛 L'autre te dit merci pour «\u00a0${nomme(uniques[0])}\u00a0» !`;
  if (uniques.length <= 3) {
    const debut = uniques
      .slice(0, -1)
      .map((t) => `«\u00a0${nomme(t)}\u00a0»`)
      .join(", ");
    return `💛 L'autre te dit merci pour ${debut} et «\u00a0${nomme(uniques.at(-1)!)}\u00a0» !`;
  }
  return `💛 L'autre te dit merci pour «\u00a0${nomme(uniques[0])}\u00a0» et ${uniques.length - 1} autres tâches !`;
}

/** Le message des mercis que je n'ai pas encore vus, ou null. */
export function mercisNonVus(
  mercis: readonly Merci[],
  cartes: readonly CarteDetenue[],
  moi: string,
): string | null {
  const taches = new Map(cartes.map((c) => [c.carte.id, c.carte.tache]));
  return messageMercis(
    mercis
      .filter((m) => m.pour === moi && !m.vu)
      .map((m) => taches.get(m.carte_id))
      .filter((t): t is string => t !== undefined),
  );
}

/** Les cartes retournées par l'autre parent cette semaine, les plus récentes d'abord. */
export function faitParLautre(
  cartes: readonly CarteDetenue[],
  mercis: readonly Merci[],
  moi: string,
  limite = 5,
) {
  const remerciees = new Set(
    mercis.filter((m) => m.de === moi).map((m) => m.carte_id),
  );
  return cartes
    .filter(
      (c) => c.carte.retournee && c.detenteur !== null && c.detenteur !== moi,
    )
    .sort((a, b) => b.dateEcheance.localeCompare(a.dateEcheance))
    .slice(0, limite)
    .map((c) => ({
      carte: c.carte,
      dejaRemerciee: remerciees.has(c.carte.id),
    }));
}
