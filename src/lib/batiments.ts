import type { DateLocale } from "./distribution";

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
  /** Fenêtres dans l'ordre où elles s'allument (dessin de 200 × 140). */
  fenetres: readonly Fenetre[];
}

const f = (x: number, y: number, l = 12, h = 14): Fenetre => ({ x, y, l, h });

/** Un bâtiment par semaine, de plus en plus grand, comme les niveaux d'un jeu. */
export const BATIMENTS: readonly Batiment[] = [
  {
    id: "cabane",
    nom: "la cabane",
    fenetres: [f(76, 92), f(112, 92), f(94, 66, 12, 10)],
  },
  {
    id: "maison",
    nom: "la maison",
    fenetres: [f(66, 98), f(122, 98), f(66, 70), f(94, 70), f(122, 70)],
  },
  {
    id: "moulin",
    nom: "le moulin",
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

/** Lundi de référence pour compter les semaines (un lundi). */
const PREMIER_LUNDI: DateLocale = "2026-01-05";

function semainesDepuis(lundi: DateLocale): number {
  const jours =
    (Date.parse(`${lundi}T00:00:00Z`) -
      Date.parse(`${PREMIER_LUNDI}T00:00:00Z`)) /
    86_400_000;
  return Math.floor(jours / 7);
}

/** Le bâtiment de la semaine qui commence ce lundi : on avance d'un niveau chaque semaine. */
export function batimentDeLaSemaine(lundi: DateLocale): Batiment {
  const rang =
    ((semainesDepuis(lundi) % BATIMENTS.length) + BATIMENTS.length) %
    BATIMENTS.length;
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
