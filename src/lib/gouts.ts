export type Gout = "aime" | "neutre" | "naime_pas";

export const GOUTS: readonly {
  id: Gout;
  libelle: string;
  emoji: string;
  facteur: number;
}[] = [
  { id: "aime", libelle: "J'aime bien", emoji: "😊", facteur: 0.5 },
  { id: "neutre", libelle: "Neutre", emoji: "😐", facteur: 1 },
  { id: "naime_pas", libelle: "Je n'aime pas", emoji: "😖", facteur: 1.5 },
];

export const GOUT_PAR_DEFAUT: Gout = "neutre";

export function estUnGout(valeur: unknown): valeur is Gout {
  return GOUTS.some((g) => g.id === valeur);
}

/** Multiplicateur appliqué à la pénibilité dans la balance (règle validée dans #11). */
export function facteurGout(gout: Gout): number {
  return GOUTS.find((g) => g.id === gout)?.facteur ?? 1;
}
