export interface Fenetre {
  x: number;
  y: number;
  l: number;
  h: number;
}

export interface Batiment {
  id: string;
  nom: string;
  /** Pour « Illuminez-le » / « Illuminez-la ». */
  pronom: "le" | "la";
  /** Pour « passer au phare » / « passer à la maison ». */
  destination: string;
  /** Formes SVG du bâtiment (dessin de 200 × 140, sol à y = 124), sans les fenêtres. */
  dessin: string;
  /** Fenêtres dans l'ordre où elles s'allument. */
  fenetres: readonly Fenetre[];
}

const f = (x: number, y: number, l = 12, h = 14): Fenetre => ({ x, y, l, h });

/** Les 20 niveaux, du plus modeste au plus grandiose. */
export const BATIMENTS: readonly Batiment[] = [
  {
    id: "tente",
    nom: "la tente",
    pronom: "la",
    destination: "à la tente",
    dessin: `<path d="M56 124 100 62l44 62z" fill="#e07a5f"/><path d="M100 62 90 124h20z" fill="#9e4a35"/><path d="M100 62v-10" stroke="#f4f1de" stroke-width="2"/><path d="M100 52l10 4-10 4z" fill="#f2cc8f"/>`,
    fenetres: [f(70, 108, 9, 9), f(121, 108, 9, 9)],
  },
  {
    id: "cabane",
    nom: "la cabane",
    pronom: "la",
    destination: "à la cabane",
    dessin: `<rect x="66" y="84" width="68" height="40" rx="3" fill="#a46a43"/><path d="M58 86 100 56l42 30z" fill="#7a4a2c"/><rect x="94" y="104" width="12" height="20" rx="2" fill="#5b3820"/>`,
    fenetres: [f(76, 92), f(112, 92), f(94, 66, 12, 10)],
  },
  {
    id: "roulotte",
    nom: "la roulotte",
    pronom: "la",
    destination: "à la roulotte",
    dessin: `<rect x="54" y="72" width="92" height="40" rx="8" fill="#6aa36f"/><path d="M50 76q50-40 100 0z" fill="#e9c46a"/><circle cx="76" cy="114" r="9" fill="#5b3820"/><circle cx="124" cy="114" r="9" fill="#5b3820"/><circle cx="76" cy="114" r="3" fill="#e9c46a"/><circle cx="124" cy="114" r="3" fill="#e9c46a"/><path d="M146 100h14" stroke="#5b3820" stroke-width="3"/>`,
    fenetres: [f(64, 82), f(94, 82), f(124, 82)],
  },
  {
    id: "arbre",
    nom: "la cabane dans l'arbre",
    pronom: "la",
    destination: "à la cabane dans l'arbre",
    dessin: `<rect x="92" y="70" width="16" height="54" fill="#7a4a2c"/><circle cx="100" cy="58" r="40" fill="#4f7d4a"/><circle cx="66" cy="70" r="18" fill="#5e8f57"/><circle cx="134" cy="70" r="18" fill="#5e8f57"/><rect x="74" y="44" width="52" height="30" rx="2" fill="#a46a43"/><path d="M68 46 100 24l32 22z" fill="#7a4a2c"/><path d="M80 74v50M90 74v50M80 86h10M80 98h10M80 110h10" stroke="#c9a27a" stroke-width="2"/>`,
    fenetres: [
      f(80, 52, 10, 10),
      f(110, 52, 10, 10),
      f(95, 32, 10, 8),
      f(96, 96, 8, 8),
    ],
  },
  {
    id: "chalet",
    nom: "le chalet",
    pronom: "le",
    destination: "au chalet",
    dessin: `<rect x="58" y="74" width="84" height="50" fill="#c98b5a"/><path d="M46 78 100 40l54 38z" fill="#6b3e26"/><path d="M58 92h84" stroke="#6b3e26" stroke-width="4"/><path d="M62 96v-4M76 96v-4M90 96v-4M110 96v-4M124 96v-4M138 96v-4" stroke="#6b3e26" stroke-width="2"/><rect x="94" y="104" width="12" height="20" fill="#6b3e26"/><path d="M50 78 100 44l50 34" stroke="#f4f1de" stroke-width="3" fill="none"/>`,
    fenetres: [f(68, 100), f(120, 100), f(80, 78, 12, 10), f(108, 78, 12, 10)],
  },
  {
    id: "maison",
    nom: "la maison",
    pronom: "la",
    destination: "à la maison",
    dessin: `<rect x="56" y="60" width="88" height="64" rx="3" fill="#f2c9a5"/><path d="M48 62 100 30l52 32z" fill="#b5523b"/><rect x="126" y="34" width="10" height="18" fill="#8e3f2d"/><rect x="93" y="98" width="14" height="26" rx="2" fill="#7a4a2c"/>`,
    fenetres: [f(66, 98), f(122, 98), f(66, 70), f(94, 70), f(122, 70)],
  },
  {
    id: "moulin",
    nom: "le moulin",
    pronom: "le",
    destination: "au moulin",
    dessin: `<path d="M80 124 86 50h28l6 74z" fill="#e8dcc8"/><path d="M82 52 100 36l18 16z" fill="#8e3f2d"/><g stroke="#c9b79a" stroke-width="5" stroke-linecap="round"><path d="M100 44 70 14M100 44l30-30M100 44 70 74M100 44l30 30"/></g><circle cx="100" cy="44" r="4" fill="#8e3f2d"/>`,
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
    dessin: `<path d="M86 124 90 40h20l4 84z" fill="#f5f0e6"/><path d="M87 104h26M88 84h24M89 64h22" stroke="#d1495b" stroke-width="7"/><rect x="84" y="18" width="32" height="22" rx="3" fill="#3a3550"/><path d="M82 18 100 6l18 12z" fill="#d1495b"/>`,
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
    id: "ferme",
    nom: "la ferme",
    pronom: "la",
    destination: "à la ferme",
    dessin: `<rect x="44" y="72" width="104" height="52" fill="#b23a3a"/><path d="M38 74 96 40l58 34z" fill="#7a2525"/><rect x="80" y="92" width="32" height="32" fill="#f3e6d0"/><path d="M80 92l32 32M112 92l-32 32" stroke="#b23a3a" stroke-width="3"/><rect x="152" y="58" width="22" height="66" fill="#c9c3b5"/><path d="M152 58a11 11 0 0 1 22 0z" fill="#8d99ae"/>`,
    fenetres: [
      f(54, 84),
      f(126, 84),
      f(90, 56, 12, 10),
      f(54, 104),
      f(126, 104),
      f(158, 72, 10, 12),
    ],
  },
  {
    id: "manoir",
    nom: "le manoir",
    pronom: "le",
    destination: "au manoir",
    dessin: `<rect x="40" y="64" width="120" height="60" fill="#d9c7a7"/><path d="M34 66 60 40h80l26 26z" fill="#4a4e69"/><rect x="58" y="28" width="8" height="16" fill="#6d4c41"/><rect x="134" y="28" width="8" height="16" fill="#6d4c41"/><path d="M92 124v-18a8 8 0 0 1 16 0v18z" fill="#5b3820"/>`,
    fenetres: [
      f(50, 72),
      f(76, 72),
      f(112, 72),
      f(138, 72),
      f(50, 98),
      f(138, 98),
      f(95, 46, 10, 10),
    ],
  },
  {
    id: "donjon",
    nom: "le donjon",
    pronom: "le",
    destination: "au donjon",
    dessin: `<rect x="76" y="40" width="48" height="84" fill="#9a958a"/><path d="M74 40h8v-8h8v8h8v-8h8v8h8v-8h8v8h4v4H74z" fill="#9a958a"/><path d="M76 60h48M76 80h48M76 100h48" stroke="#86817a" stroke-width="1"/><path d="M93 124v-14a7 7 0 0 1 14 0v14z" fill="#4a4540"/><path d="M118 32v-18" stroke="#5b4a3a" stroke-width="2"/><path d="M118 14l14 5-14 5z" fill="#d1495b"/>`,
    fenetres: [
      f(94, 46, 12, 12),
      f(84, 64, 10, 12),
      f(106, 64, 10, 12),
      f(94, 80, 12, 12),
      f(84, 96, 10, 10),
      f(106, 96, 10, 10),
      f(95, 30, 10, 6),
    ],
  },
  {
    id: "gare",
    nom: "la gare",
    pronom: "la",
    destination: "à la gare",
    dessin: `<rect x="30" y="74" width="140" height="50" fill="#e8d5b7"/><rect x="26" y="66" width="148" height="10" fill="#3d405b"/><rect x="86" y="36" width="28" height="32" fill="#e8d5b7"/><path d="M82 38 100 22l18 16z" fill="#3d405b"/><circle cx="100" cy="52" r="8" fill="#fff"/><path d="M100 52v-5M100 52h4" stroke="#3d405b" stroke-width="1.5"/><rect x="88" y="92" width="24" height="32" fill="#3d405b"/>`,
    fenetres: [
      f(40, 84),
      f(62, 84),
      f(126, 84),
      f(148, 84),
      f(40, 104),
      f(62, 104),
      f(126, 104),
      f(148, 104),
    ],
  },
  {
    id: "pagode",
    nom: "la pagode",
    pronom: "la",
    destination: "à la pagode",
    dessin: `<rect x="68" y="100" width="64" height="24" fill="#c0392b"/><path d="M54 102q46-18 92 0z" fill="#2d3142"/><rect x="74" y="78" width="52" height="22" fill="#c0392b"/><path d="M60 80q40-16 80 0z" fill="#2d3142"/><rect x="80" y="56" width="40" height="22" fill="#c0392b"/><path d="M66 58q34-16 68 0z" fill="#2d3142"/><path d="M100 46V22" stroke="#e9c46a" stroke-width="3"/><circle cx="100" cy="22" r="3" fill="#e9c46a"/>`,
    fenetres: [
      f(76, 106, 12, 12),
      f(94, 106, 12, 12),
      f(112, 106, 12, 12),
      f(82, 84, 10, 10),
      f(95, 84, 10, 10),
      f(108, 84, 10, 10),
      f(88, 62, 10, 10),
      f(102, 62, 10, 10),
    ],
  },
  {
    id: "hotel",
    nom: "le grand hôtel",
    pronom: "le",
    destination: "au grand hôtel",
    dessin: `<rect x="56" y="36" width="88" height="88" fill="#f2cc8f"/><rect x="52" y="28" width="96" height="10" fill="#81b29a"/><rect x="82" y="16" width="36" height="12" rx="2" fill="#e07a5f"/><rect x="92" y="104" width="16" height="20" fill="#81b29a"/><path d="M86 104h28" stroke="#3d405b" stroke-width="3"/>`,
    fenetres: [
      f(66, 46),
      f(94, 46),
      f(122, 46),
      f(66, 66),
      f(94, 66),
      f(122, 66),
      f(66, 86),
      f(94, 86),
      f(122, 86),
    ],
  },
  {
    id: "theatre",
    nom: "le théâtre",
    pronom: "le",
    destination: "au théâtre",
    dessin: `<rect x="40" y="62" width="120" height="62" fill="#e07a5f"/><path d="M34 64 100 30l66 34z" fill="#f4f1de"/><path d="M40 62h120" stroke="#f4f1de" stroke-width="4"/><path d="M88 124v-18a12 12 0 0 1 24 0v18z" fill="#6d2e46"/><path d="M50 118h100" stroke="#f4f1de" stroke-width="2"/>`,
    fenetres: [
      f(54, 72, 10, 14),
      f(78, 72, 10, 14),
      f(112, 72, 10, 14),
      f(136, 72, 10, 14),
      f(54, 96, 10, 14),
      f(136, 96, 10, 14),
      f(94, 44, 12, 10),
      f(70, 96, 8, 14),
      f(122, 96, 8, 14),
    ],
  },
  {
    id: "immeuble",
    nom: "l'immeuble",
    pronom: "le",
    destination: "à l'immeuble",
    dessin: `<rect x="60" y="20" width="80" height="104" fill="#8d99ae"/><rect x="56" y="16" width="88" height="6" fill="#5c677d"/><rect x="94" y="108" width="12" height="16" fill="#3d405b"/><path d="M60 40h80M60 58h80M60 76h80M60 94h80" stroke="#7d899e" stroke-width="1"/>`,
    fenetres: [
      f(72, 26, 12, 10),
      f(116, 26, 12, 10),
      f(72, 44, 12, 10),
      f(116, 44, 12, 10),
      f(72, 62, 12, 10),
      f(116, 62, 12, 10),
      f(72, 80, 12, 10),
      f(116, 80, 12, 10),
      f(72, 98, 12, 10),
      f(116, 98, 12, 10),
    ],
  },
  {
    id: "cathedrale",
    nom: "la cathédrale",
    pronom: "la",
    destination: "à la cathédrale",
    dessin: `<rect x="72" y="70" width="56" height="54" fill="#d6ccc2"/><path d="M72 72 100 50l28 22z" fill="#a8998a"/><rect x="48" y="38" width="26" height="86" fill="#c9bfb3"/><rect x="126" y="38" width="26" height="86" fill="#c9bfb3"/><path d="M48 40 61 10l13 30zM126 40l13-30 13 30z" fill="#7d6e60"/><path d="M92 124v-14a8 8 0 0 1 16 0v14z" fill="#5b4a3a"/>`,
    fenetres: [
      f(55, 46),
      f(133, 46),
      f(55, 68),
      f(133, 68),
      f(55, 90),
      f(133, 90),
      f(94, 76, 12, 12),
      f(80, 94, 8, 14),
      f(112, 94, 8, 14),
      f(56, 110, 10, 10),
      f(134, 110, 10, 10),
    ],
  },
  {
    id: "chateau",
    nom: "le château",
    pronom: "le",
    destination: "au château",
    dessin: `<rect x="40" y="56" width="22" height="68" fill="#b9b3c9"/><rect x="138" y="56" width="22" height="68" fill="#b9b3c9"/><rect x="60" y="78" width="80" height="46" fill="#cdc7db"/><rect x="88" y="44" width="24" height="80" fill="#b9b3c9"/><path d="M38 58 51 36l13 22zM136 58l13-22 13 22zM86 46l14-24 14 24z" fill="#5a46a8"/><path d="M92 124v-14a8 8 0 0 1 16 0v14z" fill="#5b4a6e"/>`,
    fenetres: [
      f(46, 98, 10, 14),
      f(144, 98, 10, 14),
      f(70, 100, 10, 12),
      f(120, 100, 10, 12),
      f(46, 70, 10, 12),
      f(144, 70, 10, 12),
      f(95, 78, 10, 12),
      f(95, 54, 10, 12),
      f(46, 44, 10, 10),
      f(144, 44, 10, 10),
      f(70, 84, 10, 10),
      f(120, 84, 10, 10),
    ],
  },
  {
    id: "gratte-ciel",
    nom: "le gratte-ciel",
    pronom: "le",
    destination: "au gratte-ciel",
    dessin: `<rect x="76" y="10" width="48" height="114" fill="#4a6fa5"/><rect x="70" y="60" width="12" height="64" fill="#3f5f8f"/><rect x="118" y="60" width="12" height="64" fill="#3f5f8f"/><path d="M100 10V0" stroke="#c9d6ea" stroke-width="2"/>`,
    fenetres: [84, 104].flatMap((x) =>
      [16, 30, 44, 58, 72, 86, 100].map((y) => f(x, y, 12, 8)),
    ),
  },
  {
    id: "palais",
    nom: "le palais",
    pronom: "le",
    destination: "au palais",
    dessin: `<rect x="18" y="60" width="164" height="64" fill="#f1e3c6"/><rect x="18" y="40" width="26" height="84" fill="#e8d5b0"/><rect x="156" y="40" width="26" height="84" fill="#e8d5b0"/><path d="M18 42a13 13 0 0 1 26 0zM156 42a13 13 0 0 1 26 0z" fill="#e9c46a"/><path d="M72 60q28-50 56 0z" fill="#e9c46a"/><path d="M100 22v-12" stroke="#e9c46a" stroke-width="2"/><circle cx="100" cy="9" r="3" fill="#e9c46a"/><rect x="90" y="96" width="20" height="28" fill="#a0522d"/><path d="M18 60h164" stroke="#d4a373" stroke-width="3"/>`,
    fenetres: [
      f(50, 70, 10, 12),
      f(66, 70, 10, 12),
      f(82, 70, 10, 12),
      f(108, 70, 10, 12),
      f(124, 70, 10, 12),
      f(140, 70, 10, 12),
      f(50, 96, 10, 12),
      f(66, 96, 10, 12),
      f(124, 96, 10, 12),
      f(140, 96, 10, 12),
      f(25, 52, 12, 12),
      f(163, 52, 12, 12),
      f(25, 80, 12, 12),
      f(163, 80, 12, 12),
      f(25, 104, 12, 12),
      f(163, 104, 12, 12),
    ],
  },
];

/**
 * Le bâtiment à vaincre au niveau donné (0 = la tente). On ne monte d'un niveau
 * qu'en illuminant entièrement le bâtiment d'une semaine ; après le palais, on
 * repart de la tente, mais le niveau continue de grimper.
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
