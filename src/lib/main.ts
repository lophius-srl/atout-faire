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
