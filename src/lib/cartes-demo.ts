import type { Carte } from "./cartes";
import type { CarteAuMarche } from "./marche";

/** Cartes fictives pour la maquette, en attendant les vraies données. */
export const CARTES_DEMO: readonly Carte[] = [
  {
    id: "vaisselle-mardi",
    tache: "Vaisselle",
    categorie: "cuisine",
    echeance: { type: "jour", jour: "mardi" },
    retournee: false,
  },
  {
    id: "aspirateur-semaine",
    tache: "Aspirateur",
    categorie: "maison",
    echeance: { type: "semaine" },
    retournee: false,
  },
  {
    id: "bain-mercredi",
    tache: "Bain des enfants",
    categorie: "enfants",
    echeance: { type: "jour", jour: "mercredi" },
    retournee: false,
  },
  {
    id: "papiers-semaine",
    tache: "Trier les papiers",
    categorie: "admin",
    echeance: { type: "semaine" },
    retournee: false,
  },
  {
    id: "courses-samedi",
    tache: "Courses du samedi",
    categorie: "courses",
    echeance: { type: "jour", jour: "samedi" },
    retournee: false,
  },
  {
    id: "creche-jeudi",
    tache: "Déposer à la crèche",
    categorie: "logistique",
    echeance: { type: "jour", jour: "jeudi" },
    retournee: false,
  },
];

/** Marché fictif d'un mardi soir, pour la maquette. */
export const MARCHE_DEMO: readonly CarteAuMarche[] = [
  {
    carte: {
      id: "linge-mardi",
      tache: "Étendre le linge",
      categorie: "maison",
      echeance: { type: "jour", jour: "mardi" },
      retournee: false,
    },
    enAttente: false,
  },
  { carte: CARTES_DEMO[0], enAttente: true },
  {
    carte: {
      id: "repas-mardi",
      tache: "Repas du soir",
      categorie: "cuisine",
      echeance: { type: "jour", jour: "mardi" },
      retournee: false,
    },
    enAttente: false,
  },
  {
    carte: {
      id: "histoire-mardi",
      tache: "Histoire du soir",
      categorie: "enfants",
      echeance: { type: "jour", jour: "mardi" },
      retournee: false,
    },
    enAttente: false,
  },
  { carte: CARTES_DEMO[3], enAttente: false },
  { carte: CARTES_DEMO[1], enAttente: true },
];
