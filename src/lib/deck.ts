import { JOURS } from "./cartes";
import { CATEGORIES, type CategorieId } from "./categories";

export type Frequence = "quotidienne" | "hebdomadaire";
export type Penibilite = 1 | 2 | 3;

/** Une tâche du deck. Jours : 1 (lundi) à 7 (dimanche), seulement pour une tâche quotidienne. */
export interface Tache {
  id: string;
  nom: string;
  categorie: CategorieId;
  frequence: Frequence;
  jours: number[] | null;
  penibilite: Penibilite;
  fixePour: string | null;
}

export type SaisieTache = Omit<Tache, "id">;

export type ResultatSaisie =
  { ok: true; tache: SaisieTache } | { ok: false; erreur: string };

export const NOM_MAX = 60;

const PENIBILITES: Record<Penibilite, string> = {
  1: "Légère",
  2: "Moyenne",
  3: "Pénible",
};

function texte(donnees: FormData, champ: string): string {
  return String(donnees.get(champ) ?? "").trim();
}

/** Lit et valide le formulaire d'une tâche. */
export function lireSaisieTache(donnees: FormData): ResultatSaisie {
  const nom = texte(donnees, "nom");
  const categorie = texte(donnees, "categorie");
  const frequence = texte(donnees, "frequence");
  const penibilite = Number(texte(donnees, "penibilite"));
  const jours = [...new Set(donnees.getAll("jours").map(Number))]
    .filter((jour) => Number.isInteger(jour) && jour >= 1 && jour <= 7)
    .sort((a, b) => a - b);

  if (!nom) return { ok: false, erreur: "Donne un nom à la tâche." };
  if (nom.length > NOM_MAX)
    return {
      ok: false,
      erreur: `Le nom est trop long (${NOM_MAX} caractères au plus).`,
    };
  if (!CATEGORIES.some((c) => c.id === categorie))
    return { ok: false, erreur: "Choisis une catégorie." };
  if (frequence !== "quotidienne" && frequence !== "hebdomadaire")
    return { ok: false, erreur: "Choisis une fréquence." };
  if (frequence === "quotidienne" && jours.length === 0)
    return { ok: false, erreur: "Choisis au moins un jour." };
  if (!(penibilite in PENIBILITES))
    return { ok: false, erreur: "Choisis une pénibilité." };

  return {
    ok: true,
    tache: {
      nom,
      categorie: categorie as CategorieId,
      frequence,
      jours: frequence === "quotidienne" ? jours : null,
      penibilite: penibilite as Penibilite,
      fixePour: texte(donnees, "fixePour") || null,
    },
  };
}

export function libellePenibilite(penibilite: Penibilite): string {
  return PENIBILITES[penibilite];
}

export function libelleFrequence(
  tache: Pick<Tache, "frequence" | "jours">,
): string {
  if (tache.frequence === "hebdomadaire") return "Une fois par semaine";
  const jours = tache.jours ?? [];
  const cle = jours.join(",");
  if (cle === "1,2,3,4,5,6,7") return "Tous les jours";
  if (cle === "1,2,3,4,5") return "En semaine";
  if (cle === "6,7") return "Le week-end";
  const abreges = jours.map((jour) => JOURS[jour - 1].slice(0, 3));
  const texteJours = abreges.join(", ");
  return texteJours.charAt(0).toUpperCase() + texteJours.slice(1);
}
