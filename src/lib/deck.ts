import { JOURS } from "./cartes";
import { CATEGORIES, type CategorieId } from "./categories";
import type { DateLocale } from "./distribution";

export type Frequence =
  "quotidienne" | "hebdomadaire" | "bimensuelle" | "mensuelle" | "ponctuelle";
export type Penibilite = 1 | 2 | 3;

/**
 * Une tâche du deck. Jours : 1 (lundi) à 7 (dimanche), seulement pour une tâche quotidienne.
 * Date unique : le seul jour d'une tâche ponctuelle.
 */
export interface Tache {
  id: string;
  nom: string;
  categorie: CategorieId;
  frequence: Frequence;
  jours: number[] | null;
  dateUnique: DateLocale | null;
  penibilite: Penibilite;
  fixePour: string | null;
  /** Instant de création (ISO), pour ne pas distribuer de cartes avant. */
  creeLe: string;
}

export type SaisieTache = Omit<Tache, "id" | "creeLe">;

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

const FREQUENCES: readonly Frequence[] = [
  "quotidienne",
  "hebdomadaire",
  "bimensuelle",
  "mensuelle",
  "ponctuelle",
];

const FORMAT_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Lit et valide le formulaire d'une tâche. `aujourdhui` : une tâche ponctuelle ne peut pas être datée avant. */
export function lireSaisieTache(
  donnees: FormData,
  aujourdhui: DateLocale,
): ResultatSaisie {
  const nom = texte(donnees, "nom");
  const categorie = texte(donnees, "categorie");
  const frequence = texte(donnees, "frequence");
  const penibilite = Number(texte(donnees, "penibilite"));
  const dateUnique = texte(donnees, "dateUnique");
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
  if (!FREQUENCES.includes(frequence as Frequence))
    return { ok: false, erreur: "Choisis une fréquence." };
  if (frequence === "quotidienne" && jours.length === 0)
    return { ok: false, erreur: "Choisis au moins un jour." };
  if (frequence === "ponctuelle" && !FORMAT_DATE.test(dateUnique))
    return { ok: false, erreur: "Choisis la date de la tâche." };
  if (frequence === "ponctuelle" && dateUnique < aujourdhui)
    return {
      ok: false,
      erreur: "Cette date est passée : choisis aujourd'hui ou plus tard.",
    };
  if (!(penibilite in PENIBILITES))
    return { ok: false, erreur: "Choisis une pénibilité." };

  return {
    ok: true,
    tache: {
      nom,
      categorie: categorie as CategorieId,
      frequence: frequence as Frequence,
      jours: frequence === "quotidienne" ? jours : null,
      dateUnique: frequence === "ponctuelle" ? dateUnique : null,
      penibilite: penibilite as Penibilite,
      fixePour: texte(donnees, "fixePour") || null,
    },
  };
}

export function libellePenibilite(penibilite: Penibilite): string {
  return PENIBILITES[penibilite];
}

/** « Le jeudi 12 novembre ». */
export function libelleDate(date: DateLocale): string {
  const texteDate = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${date}T00:00:00Z`));
  return `Le ${texteDate}`;
}

/** « semaine du 7 décembre ». */
export function libelleSemaine(lundi: DateLocale): string {
  const texteDate = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
  }).format(new Date(`${lundi}T00:00:00Z`));
  return `semaine du ${texteDate}`;
}

/** Une tâche ponctuelle dont la date est passée : elle ne donnera plus de carte. */
export function estPassee(
  tache: Pick<Tache, "frequence" | "dateUnique">,
  aujourdhui: DateLocale,
): boolean {
  return (
    tache.frequence === "ponctuelle" &&
    tache.dateUnique !== null &&
    tache.dateUnique < aujourdhui
  );
}

export function libelleFrequence(
  tache: Pick<Tache, "frequence" | "jours" | "dateUnique">,
): string {
  if (tache.frequence === "hebdomadaire") return "Une fois par semaine";
  if (tache.frequence === "bimensuelle") return "Toutes les deux semaines";
  if (tache.frequence === "mensuelle") return "Une fois par mois";
  if (tache.frequence === "ponctuelle") {
    return tache.dateUnique ? libelleDate(tache.dateUnique) : "Une seule fois";
  }
  const jours = tache.jours ?? [];
  const cle = jours.join(",");
  if (cle === "1,2,3,4,5,6,7") return "Tous les jours";
  if (cle === "1,2,3,4,5") return "En semaine";
  if (cle === "6,7") return "Le week-end";
  const abreges = jours.map((jour) => JOURS[jour - 1].slice(0, 3));
  const texteJours = abreges.join(", ");
  return texteJours.charAt(0).toUpperCase() + texteJours.slice(1);
}
