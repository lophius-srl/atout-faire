import type { Carte } from "./cartes";
import { facteurGout, type Gout } from "./gouts";

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

/** Poids d'une carte pour son détenteur : pénibilité × goût (aime × 0,5, neutre × 1, n'aime pas × 1,5). */
export function poidsCarte(penibilite: number, gout: Gout): number {
  return penibilite * facteurGout(gout);
}

/**
 * Effort ressenti par chacun sur la semaine : somme du poids des cartes qu'il a prises,
 * faites ou non. Les cartes du Marché ne comptent pour personne.
 */
export function poidsDesMains(
  cartes: readonly {
    detenteur: string | null;
    penibilite: number;
    gout: Gout;
  }[],
  moi: string,
): { moi: number; autre: number } {
  let poidsMoi = 0;
  let poidsAutre = 0;
  for (const { detenteur, penibilite, gout } of cartes) {
    const poids = poidsCarte(penibilite, gout);
    if (detenteur === moi) poidsMoi += poids;
    else if (detenteur) poidsAutre += poids;
  }
  return { moi: poidsMoi, autre: poidsAutre };
}

/** La semaine est finie quand il y a des cartes et qu'elles sont toutes retournées. */
export function semaineFinie(
  cartes: readonly { retournee: boolean }[],
): boolean {
  return cartes.length > 0 && cartes.every((carte) => carte.retournee);
}
