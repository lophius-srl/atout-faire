import { JOURS, type Carte } from "$lib/cartes";
import type { CategorieId } from "$lib/categories";
import type { Penibilite } from "$lib/deck";
import type { Gout } from "$lib/gouts";
import {
  ajouterJours,
  cartesAttendues,
  dateDansFuseau,
  jourDeLaSemaine,
  lundiDeLaSemaine,
  type DateLocale,
} from "$lib/distribution";
import type { Vacances } from "$lib/vacances";
import type { SupabaseClient } from "@supabase/supabase-js";
import { listerTaches } from "./deck";

/** Une carte de la semaine, avec qui la détient (null : sur le Marché). */
export interface CarteDuFoyer {
  carte: Carte;
  penibilite: Penibilite;
  /** Goût du détenteur, figé quand la carte est arrivée dans sa main. */
  gout: Gout;
  detenteur: string | null;
  dateEcheance: DateLocale;
}

interface LigneCarte {
  id: string;
  nom: string;
  categorie: CategorieId;
  penibilite: Penibilite;
  echeance: "jour" | "semaine";
  date_echeance: DateLocale;
  detenteur: string | null;
  retournee: boolean;
  gout: Gout;
}

export function aujourdhuiPourLeFoyer(fuseau: string): DateLocale {
  return dateDansFuseau(new Date(), fuseau);
}

/**
 * Crée les cartes manquantes de la semaine (sans effet si elles existent déjà),
 * et renvoie le nombre de cartes prévues pour toute la semaine, jusqu'à dimanche.
 */
export async function distribuerCartes(
  supabase: SupabaseClient,
  fuseau: string,
  vacances: readonly Vacances[],
): Promise<number> {
  const taches = await listerTaches(supabase);
  const aDistribuer = taches.map((tache) => ({
    ...tache,
    creeLe: dateDansFuseau(new Date(tache.creeLe), fuseau),
  }));
  const aujourdhui = aujourdhuiPourLeFoyer(fuseau);
  const prevues = cartesAttendues(
    aDistribuer,
    ajouterJours(lundiDeLaSemaine(aujourdhui), 6),
    vacances,
  ).length;
  const cartes = cartesAttendues(aDistribuer, aujourdhui, vacances);
  if (cartes.length === 0) return prevues;
  const { error } = await supabase.from("cartes").upsert(
    cartes.map((c) => ({
      tache_id: c.tacheId,
      nom: c.nom,
      categorie: c.categorie,
      penibilite: c.penibilite,
      echeance: c.echeance,
      date_echeance: c.dateEcheance,
      detenteur: c.detenteur,
    })),
    { onConflict: "tache_id,echeance,date_echeance", ignoreDuplicates: true },
  );
  if (error) throw error;
  return prevues;
}

function versCarteDuFoyer(ligne: LigneCarte): CarteDuFoyer {
  const echeance: Carte["echeance"] =
    ligne.echeance === "semaine"
      ? { type: "semaine" }
      : { type: "jour", jour: JOURS[jourDeLaSemaine(ligne.date_echeance) - 1] };
  return {
    carte: {
      id: ligne.id,
      tache: ligne.nom,
      categorie: ligne.categorie,
      echeance,
      retournee: ligne.retournee,
    },
    penibilite: ligne.penibilite,
    gout: ligne.gout,
    detenteur: ligne.detenteur,
    dateEcheance: ligne.date_echeance,
  };
}

export async function listerCartesDeLaSemaine(
  supabase: SupabaseClient,
  aujourdhui: DateLocale,
): Promise<CarteDuFoyer[]> {
  const { data, error } = await supabase
    .from("cartes")
    .select(
      "id, nom, categorie, penibilite, echeance, date_echeance, detenteur, retournee, gout",
    )
    .gte("date_echeance", lundiDeLaSemaine(aujourdhui))
    .order("date_echeance")
    .order("arrivee_le");
  if (error) throw error;
  return (data as LigneCarte[]).map(versCarteDuFoyer);
}

/** Niveau du foyer : semaines passées entièrement illuminées (avant ce lundi). */
export async function semainesVaincues(
  supabase: SupabaseClient,
  lundi: DateLocale,
): Promise<number> {
  const { data, error } = await supabase.rpc("semaines_vaincues", {
    avant: lundi,
  });
  if (error) throw error;
  return data as number;
}

/** Lundis des semaines vaincues avant ce lundi, de la plus ancienne à la plus récente. */
export async function lundisVaincus(
  supabase: SupabaseClient,
  lundi: DateLocale,
): Promise<DateLocale[]> {
  const { data, error } = await supabase.rpc("semaines_vaincues_detail", {
    avant: lundi,
  });
  if (error) throw error;
  return data as DateLocale[];
}
