import type { SaisieTache } from "./deck";

/** Un modèle de tâche courante, prêt à être ajouté au deck. */
export type Modele = Omit<SaisieTache, "fixePour">;

const TOUS_LES_JOURS = [1, 2, 3, 4, 5, 6, 7];
const EN_SEMAINE = [1, 2, 3, 4, 5];
const JOURS_D_ECOLE = [1, 2, 4, 5];

const hebdo = {
  frequence: "hebdomadaire",
  jours: null,
  dateUnique: null,
} as const;
const quotidienne = (jours: number[]) =>
  ({ frequence: "quotidienne", jours, dateUnique: null }) as const;

export const MODELES: readonly Modele[] = [
  {
    nom: "Vaisselle",
    categorie: "cuisine",
    ...quotidienne(TOUS_LES_JOURS),
    penibilite: 2,
  },
  {
    nom: "Repas du soir",
    categorie: "cuisine",
    ...quotidienne(TOUS_LES_JOURS),
    penibilite: 2,
  },
  {
    nom: "Petit-déjeuner",
    categorie: "cuisine",
    ...quotidienne(TOUS_LES_JOURS),
    penibilite: 1,
  },
  {
    nom: "Préparer les goûters",
    categorie: "cuisine",
    ...quotidienne(EN_SEMAINE),
    penibilite: 1,
  },
  {
    nom: "Lancer une lessive",
    categorie: "maison",
    ...quotidienne([1, 4]),
    penibilite: 1,
  },
  {
    nom: "Étendre et plier le linge",
    categorie: "maison",
    ...quotidienne([2, 5]),
    penibilite: 2,
  },
  { nom: "Aspirateur", categorie: "maison", ...hebdo, penibilite: 2 },
  {
    nom: "Nettoyer la salle de bain",
    categorie: "maison",
    ...hebdo,
    penibilite: 3,
  },
  {
    nom: "Sortir les poubelles",
    categorie: "maison",
    ...quotidienne([1, 4]),
    penibilite: 1,
  },
  { nom: "Changer les draps", categorie: "maison", ...hebdo, penibilite: 2 },
  {
    nom: "Bain des enfants",
    categorie: "enfants",
    ...quotidienne(TOUS_LES_JOURS),
    penibilite: 2,
  },
  {
    nom: "Coucher et histoire du soir",
    categorie: "enfants",
    ...quotidienne(TOUS_LES_JOURS),
    penibilite: 1,
  },
  {
    nom: "Devoirs",
    categorie: "enfants",
    ...quotidienne(JOURS_D_ECOLE),
    penibilite: 2,
  },
  {
    nom: "Préparer les affaires d'école",
    categorie: "enfants",
    ...quotidienne(EN_SEMAINE),
    penibilite: 1,
  },
  {
    nom: "Trier le courrier et les papiers",
    categorie: "admin",
    ...hebdo,
    penibilite: 2,
  },
  { nom: "Payer les factures", categorie: "admin", ...hebdo, penibilite: 2 },
  {
    nom: "Courses de la semaine",
    categorie: "courses",
    ...hebdo,
    penibilite: 3,
  },
  {
    nom: "Faire la liste de courses",
    categorie: "courses",
    ...hebdo,
    penibilite: 1,
  },
  {
    nom: "Déposer à l'école",
    categorie: "logistique",
    ...quotidienne(JOURS_D_ECOLE),
    penibilite: 1,
  },
  {
    nom: "Récupérer à l'école",
    categorie: "logistique",
    ...quotidienne(JOURS_D_ECOLE),
    penibilite: 2,
  },
  {
    nom: "Activités du mercredi",
    categorie: "logistique",
    ...quotidienne([3]),
    penibilite: 2,
  },
];

const cle = (nom: string) => nom.trim().toLocaleLowerCase("fr");

/** Les modèles dont le nom n'est pas déjà dans le deck (sans tenir compte des majuscules). */
export function modelesDisponibles(
  modeles: readonly Modele[],
  deck: readonly { nom: string }[],
): Modele[] {
  const presents = new Set(deck.map((tache) => cle(tache.nom)));
  return modeles.filter((modele) => !presents.has(cle(modele.nom)));
}

export function trouverModele(nom: string): Modele | undefined {
  return MODELES.find((modele) => modele.nom === nom);
}
