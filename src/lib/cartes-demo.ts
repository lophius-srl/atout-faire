import type { Carte } from "./cartes";

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
