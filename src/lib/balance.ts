/** Inclinaison maximale du fléau, en degrés. */
export const INCLINAISON_MAX = 14;

/** Écart relatif à partir duquel le fléau est au maximum. */
const ECART_POUR_MAX = 0.5;

/**
 * Inclinaison du fléau, en degrés, à partir de l'effort porté par chacun.
 * Positive : mon plateau (à gauche) descend, car je porte plus.
 * Négative : le plateau de l'autre (à droite) descend.
 * Elle dépend de l'écart relatif et reste plafonnée à ±INCLINAISON_MAX.
 */
export function inclinaisonBalance(
  poidsMoi: number,
  poidsAutre: number,
): number {
  const total = poidsMoi + poidsAutre;
  if (total <= 0) {
    return 0;
  }
  const ecartRelatif = (poidsMoi - poidsAutre) / total;
  const inclinaison = (ecartRelatif / ECART_POUR_MAX) * INCLINAISON_MAX;
  return Math.max(-INCLINAISON_MAX, Math.min(INCLINAISON_MAX, inclinaison));
}

/** Phrase courte qui décrit la balance, sans aucun chiffre. */
export function descriptionBalance(inclinaison: number): string {
  const ampleur = Math.abs(inclinaison);
  if (ampleur < 2) {
    return "La balance est équilibrée.";
  }
  const beaucoup = ampleur >= INCLINAISON_MAX * 0.6;
  if (inclinaison > 0) {
    return beaucoup
      ? "Tu en portes beaucoup plus."
      : "Tu en portes un peu plus.";
  }
  return beaucoup
    ? "L'autre en porte beaucoup plus."
    : "L'autre en porte un peu plus.";
}
