export type BatimentId = "cabane" | "maison" | "moulin" | "phare" | "chateau";

export interface Fenetre {
  x: number;
  y: number;
  l: number;
  h: number;
}

export interface Batiment {
  id: BatimentId;
  nom: string;
  /** Pour « Illuminez-le » / « Illuminez-la ». */
  pronom: "le" | "la";
  /** Pour « passer au phare » / « passer à la maison ». */
  destination: string;
  /** Fenêtres dans l'ordre où elles s'allument (dessin de 200 × 140). */
  fenetres: readonly Fenetre[];
}

const f = (x: number, y: number, l = 12, h = 14): Fenetre => ({ x, y, l, h });

/** Un bâtiment par semaine, de plus en plus grand, comme les niveaux d'un jeu. */
export const BATIMENTS: readonly Batiment[] = [
  {
    id: "cabane",
    nom: "la cabane",
    pronom: "la",
    destination: "à la cabane",
    fenetres: [f(76, 92), f(112, 92), f(94, 66, 12, 10)],
  },
  {
    id: "maison",
    nom: "la maison",
    pronom: "la",
    destination: "à la maison",
    fenetres: [f(66, 98), f(122, 98), f(66, 70), f(94, 70), f(122, 70)],
  },
  {
    id: "moulin",
    nom: "le moulin",
    pronom: "le",
    destination: "au moulin",
    fenetres: [
      f(94, 110, 12, 12),
      f(84, 92, 10, 12),
      f(106, 92, 10, 12),
      f(88, 74, 10, 12),
      f(102, 74, 10, 12),
      f(95, 56, 10, 12),
    ],
  },
  {
    id: "phare",
    nom: "le phare",
    pronom: "le",
    destination: "au phare",
    fenetres: [
      f(94, 112, 12, 12),
      f(95, 94, 10, 10),
      f(95, 78, 10, 10),
      f(95, 62, 10, 10),
      f(95, 46, 10, 10),
      f(88, 22, 24, 14),
    ],
  },
  {
    id: "chateau",
    nom: "le château",
    pronom: "le",
    destination: "au château",
    fenetres: [
      f(46, 98, 10, 14),
      f(144, 98, 10, 14),
      f(78, 100, 10, 12),
      f(112, 100, 10, 12),
      f(46, 70, 10, 12),
      f(144, 70, 10, 12),
      f(95, 78, 10, 12),
      f(95, 54, 10, 12),
      f(46, 44, 10, 10),
      f(144, 44, 10, 10),
    ],
  },
];

/**
 * Le bâtiment à vaincre au niveau donné (0 = la cabane). On ne monte d'un niveau
 * qu'en illuminant entièrement le bâtiment d'une semaine ; après le château, on
 * repart de la cabane, mais le niveau continue de grimper.
 */
export function batimentDuNiveau(niveau: number): Batiment {
  const rang = Math.max(0, Math.floor(niveau)) % BATIMENTS.length;
  return BATIMENTS[rang];
}

/** Nombre de fenêtres allumées : proportionnel aux cartes retournées ensemble, toutes à la fin. */
export function fenetresAllumees(
  retournees: number,
  total: number,
  nombreDeFenetres: number,
): number {
  if (total <= 0) return 0;
  if (retournees >= total) return nombreDeFenetres;
  return Math.min(
    nombreDeFenetres - 1,
    Math.floor((retournees / total) * nombreDeFenetres),
  );
}
