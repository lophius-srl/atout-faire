import type { DateLocale } from "./distribution";

export interface Progression {
  /** Cartes retournées cette semaine, tous parents confondus. */
  retournees: number;
  total: number;
  /** Toutes les cartes d'aujourd'hui sont retournées. */
  jourFini: boolean;
  semaineFinie: boolean;
}

/** Où en est le foyer, ensemble : jamais de compte par personne. */
export function progressionDuFoyer(
  cartes: readonly {
    retournee: boolean;
    echeance: "jour" | "semaine";
    dateEcheance: DateLocale;
  }[],
  aujourdhui: DateLocale,
): Progression {
  const retournees = cartes.filter((c) => c.retournee).length;
  const duJour = cartes.filter(
    (c) => c.echeance === "jour" && c.dateEcheance === aujourdhui,
  );
  return {
    retournees,
    total: cartes.length,
    jourFini: duJour.length > 0 && duJour.every((c) => c.retournee),
    semaineFinie: cartes.length > 0 && retournees === cartes.length,
  };
}

/** Ce qu'il faut fêter quand la progression change : la semaine prime sur la journée. */
export function aFeter(
  avant: Pick<Progression, "jourFini" | "semaineFinie">,
  apres: Pick<Progression, "jourFini" | "semaineFinie">,
): "semaine" | "jour" | null {
  if (apres.semaineFinie && !avant.semaineFinie) return "semaine";
  if (apres.jourFini && !avant.jourFini) return "jour";
  return null;
}
