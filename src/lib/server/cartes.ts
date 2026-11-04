import { JOURS, type Carte } from "$lib/cartes";
import type { CategorieId } from "$lib/categories";
import type { Penibilite } from "$lib/deck";
import {
  cartesAttendues,
  dateDansFuseau,
  jourDeLaSemaine,
  lundiDeLaSemaine,
  type DateLocale,
} from "$lib/distribution";
import type { SupabaseClient } from "@supabase/supabase-js";
import { listerTaches } from "./deck";

/** Une carte de la semaine, avec qui la détient (null : sur le Marché). */
export interface CarteDuFoyer {
  carte: Carte;
  penibilite: Penibilite;
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
}

export function aujourdhuiPourLeFoyer(fuseau: string): DateLocale {
  return dateDansFuseau(new Date(), fuseau);
}

/** Crée les cartes manquantes de la semaine. Sans effet si elles existent déjà. */
export async function distribuerCartes(
  supabase: SupabaseClient,
  fuseau: string,
): Promise<void> {
  const taches = await listerTaches(supabase);
  const aDistribuer = taches.map((tache) => ({
    ...tache,
    creeLe: dateDansFuseau(new Date(tache.creeLe), fuseau),
  }));
  const cartes = cartesAttendues(aDistribuer, aujourdhuiPourLeFoyer(fuseau));
  if (cartes.length === 0) return;
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
      "id, nom, categorie, penibilite, echeance, date_echeance, detenteur, retournee",
    )
    .gte("date_echeance", lundiDeLaSemaine(aujourdhui))
    .order("date_echeance")
    .order("arrivee_le");
  if (error) throw error;
  return (data as LigneCarte[]).map(versCarteDuFoyer);
}
