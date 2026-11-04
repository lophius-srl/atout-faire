export type CategorieId =
  "cuisine" | "maison" | "enfants" | "admin" | "courses" | "logistique";

export interface Categorie {
  id: CategorieId;
  nom: string;
  /** Couleur pastel du recto de la carte. */
  couleur: string;
  /** Couleur plus soutenue pour le texte et les bordures. */
  encre: string;
}

export const CATEGORIES: readonly Categorie[] = [
  {
    id: "cuisine",
    nom: "Cuisine",
    couleur: "#ffd9c7",
    encre: "#a4482a",
  },
  {
    id: "maison",
    nom: "Maison",
    couleur: "#d6ecff",
    encre: "#2f6496",
  },
  {
    id: "enfants",
    nom: "Enfants",
    couleur: "#ffe3f1",
    encre: "#a33a72",
  },
  {
    id: "admin",
    nom: "Admin",
    couleur: "#e7e1ff",
    encre: "#5a46a8",
  },
  {
    id: "courses",
    nom: "Courses",
    couleur: "#dcf5d9",
    encre: "#3a7a35",
  },
  {
    id: "logistique",
    nom: "Logistique",
    couleur: "#fff1c2",
    encre: "#8a6414",
  },
];

export function trouverCategorie(id: string): Categorie {
  const categorie = CATEGORIES.find((c) => c.id === id);
  if (!categorie) {
    throw new Error(`Catégorie inconnue : ${id}`);
  }
  return categorie;
}
