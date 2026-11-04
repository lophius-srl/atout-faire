import type { CategorieId } from "$lib/categories";
import type { Frequence, Penibilite, SaisieTache, Tache } from "$lib/deck";
import type { SupabaseClient } from "@supabase/supabase-js";

interface LigneTache {
  id: string;
  nom: string;
  categorie: CategorieId;
  frequence: Frequence;
  jours: number[] | null;
  penibilite: Penibilite;
  fixe_pour: string | null;
  cree_le: string;
}

const COLONNES =
  "id, nom, categorie, frequence, jours, penibilite, fixe_pour, cree_le";

function versTache(ligne: LigneTache): Tache {
  const { fixe_pour, cree_le, ...reste } = ligne;
  return { ...reste, fixePour: fixe_pour, creeLe: cree_le };
}

function versLigne(tache: SaisieTache) {
  const { fixePour, ...reste } = tache;
  return { ...reste, fixe_pour: fixePour };
}

/** Les règles RLS limitent la lecture et l'écriture au deck du foyer de l'utilisateur. */
export async function listerTaches(supabase: SupabaseClient): Promise<Tache[]> {
  const { data, error } = await supabase
    .from("taches")
    .select(COLONNES)
    .order("cree_le");
  if (error) throw error;
  return (data as LigneTache[]).map(versTache);
}

export async function trouverTache(
  supabase: SupabaseClient,
  id: string,
): Promise<Tache | null> {
  const { data, error } = await supabase
    .from("taches")
    .select(COLONNES)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? versTache(data as LigneTache) : null;
}

export async function ajouterTache(
  supabase: SupabaseClient,
  tache: SaisieTache,
) {
  const { error } = await supabase.from("taches").insert(versLigne(tache));
  return error;
}

export async function modifierTache(
  supabase: SupabaseClient,
  id: string,
  tache: SaisieTache,
) {
  const { error } = await supabase
    .from("taches")
    .update(versLigne(tache))
    .eq("id", id);
  return error;
}

export async function supprimerTache(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("taches").delete().eq("id", id);
  return error;
}

/** Les deux parents du foyer, pour choisir à qui réserver une tâche fixe. */
export async function listerParents(
  supabase: SupabaseClient,
  moi: string,
): Promise<{ id: string; nom: string }[]> {
  const { data, error } = await supabase
    .from("membres")
    .select("user_id")
    .order("rejoint_le");
  if (error) throw error;
  return data.map(({ user_id }) => ({
    id: user_id,
    nom: user_id === moi ? "Moi" : "L'autre parent",
  }));
}
