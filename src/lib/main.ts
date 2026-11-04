import type { Carte } from "./cartes";

export interface Main {
  aFaire: Carte[];
  retournees: Carte[];
}

/** Sépare les cartes encore à faire de celles déjà retournées, sans changer leur ordre. */
export function separerMain(cartes: readonly Carte[]): Main {
  return {
    aFaire: cartes.filter((c) => !c.retournee),
    retournees: cartes.filter((c) => c.retournee),
  };
}

/**
 * Effort porté par chacun : somme des pénibilités des cartes en main.
 * Les goûts de chacun s'y ajouteront avec la balance complète (#19).
 */
export function poidsDesMains(
  cartes: readonly { detenteur: string | null; penibilite: number }[],
  moi: string,
): { moi: number; autre: number } {
  let poidsMoi = 0;
  let poidsAutre = 0;
  for (const { detenteur, penibilite } of cartes) {
    if (detenteur === moi) poidsMoi += penibilite;
    else if (detenteur) poidsAutre += penibilite;
  }
  return { moi: poidsMoi, autre: poidsAutre };
}

/** La semaine est finie quand il y a des cartes et qu'elles sont toutes retournées. */
export function semaineFinie(
  cartes: readonly { retournee: boolean }[],
): boolean {
  return cartes.length > 0 && cartes.every((carte) => carte.retournee);
}
